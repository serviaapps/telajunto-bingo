import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { randomInt } from "node:crypto";
import { validateCard, verifyBingo, nextDraw, markNumber } from "./bingo-engine.mjs";

initializeApp();
const db = getDatabase();
const opts = { region: "us-central1", maxInstances: 10 };
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const code = () => Array.from({length:6},()=>alphabet[randomInt(alphabet.length)]).join("");
const requiredUid = (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated","Entre como convidado para continuar.");
  return request.auth.uid;
};
const roomId = (value) => {
  const id = String(value || "").trim().toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(id)) throw new HttpsError("invalid-argument","Código de sala inválido.");
  return id;
};
const nickname = (value) => {
  const name = String(value || "").trim().replace(/\s+/g," ");
  if (name.length < 2 || name.length > 40) throw new HttpsError("invalid-argument","Informe um nome entre 2 e 40 caracteres.");
  return name;
};
function generateCard() {
  // Grade de 90 bolas: 3 linhas x 9 colunas, 5 números por linha, 1 a 3 por coluna.
  for(let attempt=0;attempt<20000;attempt++){
    const rows=[[],[],[]], cols=Array(9).fill(0);
    for(let r=0;r<3;r++){
      const positions=Array.from({length:9},(_,i)=>i);
      for(let i=positions.length-1;i>0;i--){const j=randomInt(i+1);[positions[i],positions[j]]=[positions[j],positions[i]];}
      rows[r]=positions.slice(0,5);for(const c of rows[r])cols[c]++;
    }
    if(cols.some(n=>n===0))continue;
    const grid=Array.from({length:3},()=>Array(9).fill(null));
    for(let c=0;c<9;c++){
      const low=c===0?1:c*10,high=c===8?90:c*10+9;
      const choices=Array.from({length:high-low+1},(_,i)=>i+low);
      for(let i=choices.length-1;i>0;i--){const j=randomInt(i+1);[choices[i],choices[j]]=[choices[j],choices[i]];}
      const values=choices.slice(0,cols[c]).sort((a,b)=>a-b);
      let i=0;for(let r=0;r<3;r++)if(rows[r].includes(c))grid[r][c]=values[i++];
    }
    return validateCard(grid);
  }
  throw new HttpsError("internal","Não foi possível gerar a cartela.");
}
async function getRoom(id) {
  const snap=await db.ref(`rooms/${id}`).get();
  if(!snap.exists())throw new HttpsError("not-found","Sala não encontrada.");
  const room=snap.val();
  if(room.expiresAt<Date.now())throw new HttpsError("failed-precondition","Esta sala expirou.");
  return room;
}
export const createRoom = onCall(opts,async(request)=>{
  const uid=requiredUid(request),name=nickname(request.data?.name);
  const card=generateCard();
  for(let attempt=0;attempt<8;attempt++){
    const id=code(),now=Date.now();
    const room={schemaVersion:1,hostUid:uid,createdAt:now,expiresAt:now+24*60*60*1000,status:"waiting",drawn:[],members:{[uid]:{name,joinedAt:now,role:"host"}},publicState:{lastDraw:null,drawCount:0}};
    const ref=db.ref(`rooms/${id}`);
    const result=await ref.transaction(current=>current===null?room:undefined,undefined,false);
    if(!result.committed)continue;
    await db.ref(`privateRooms/${id}/${uid}`).set({grid:card,marked:[]});
    return {roomId:id,card};
  }
  throw new HttpsError("resource-exhausted","Não foi possível reservar um código. Tente novamente.");
});
export const joinRoom = onCall(opts,async(request)=>{
  const uid=requiredUid(request),id=roomId(request.data?.roomId),name=nickname(request.data?.name);
  const room=await getRoom(id);
  if(room.status==="finished")throw new HttpsError("failed-precondition","Partida encerrada.");
  if(!room.members?.[uid] && Object.keys(room.members||{}).length>=30)throw new HttpsError("resource-exhausted","Sala cheia.");
  const memberRef=db.ref(`rooms/${id}/members/${uid}`);
  await memberRef.transaction(current=>current||{name,joinedAt:Date.now(),role:"player"},undefined,false);
  const privateRef=db.ref(`privateRooms/${id}/${uid}`);
  await privateRef.transaction(current=>current||{grid:generateCard(),marked:[]},undefined,false);
  return {roomId:id,card:(await privateRef.get()).val().grid};
});
export const drawBall = onCall(opts,async(request)=>{
  const uid=requiredUid(request),id=roomId(request.data?.roomId);
  let last=null;
  const ref=db.ref(`rooms/${id}`);
  const result=await ref.transaction(room=>{
    if(!room||room.hostUid!==uid||room.expiresAt<Date.now()||room.status==="finished")return;
    const drawn=room.drawn||[];
    if(drawn.length===90)return;
    // Transactions may retry. Official result is committed atomically.
    last=nextDraw(drawn,()=>randomInt(0x100000000)/0x100000000);
    room.drawn=[...drawn,last];
    room.status="playing";
    room.publicState={lastDraw:last,drawCount:room.drawn.length};
    return room;
  },undefined,false);
  if(!result.committed)throw new HttpsError("permission-denied","Você não pode sortear nesta sala.");
  return {number:result.snapshot.val().publicState.lastDraw,drawCount:result.snapshot.val().publicState.drawCount};
});
export const toggleMark = onCall(opts,async(request)=>{
  const uid=requiredUid(request),id=roomId(request.data?.roomId),n=request.data?.number;
  if(!Number.isInteger(n)||n<1||n>90)throw new HttpsError("invalid-argument","Número inválido.");
  const room=await getRoom(id);
  if(!room.members?.[uid])throw new HttpsError("permission-denied","Você não participa desta sala.");
  const ref=db.ref(`privateRooms/${id}/${uid}`);
  const result=await ref.transaction(data=>{
    if(!data)return;
    data.marked=markNumber(data.grid,data.marked||[],n);
    return data;
  },undefined,false);
  if(!result.committed)throw new HttpsError("failed-precondition","Cartela não encontrada.");
  const privateState=result.snapshot.val();
  const bingo=verifyBingo(privateState.grid,room.drawn||[]);
  return {marked:privateState.marked||[],bingo};
});
