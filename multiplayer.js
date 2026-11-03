// TelaJunto V1.1 Spark: recreativo, sem Cloud Functions e sem apostas.
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import { getDatabase, ref, onValue, get, set, runTransaction } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";
import { validateCard, verifyBingo } from "./src/bingo-engine.mjs";
const $=id=>document.getElementById(id),app=initializeApp(firebaseConfig),auth=getAuth(app),db=getDatabase(app);
const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
let roomId=null,card=null,room=null,host=false,unsub=[],busy=false;
const params=new URLSearchParams(location.search);
if(/^[A-HJ-NP-Z2-9]{6}$/.test((params.get("sala")||"").toUpperCase()))$("roomCode").value=params.get("sala").toUpperCase();
const show=(title,msg)=>{const a=document.createElement("strong");a.textContent=title;const b=document.createElement("span");b.textContent=msg;$("setupNotice").replaceChildren(a,b);};
const error=e=>e?.code==="PERMISSION_DENIED"?"Acesso negado: verifique se as regras Spark foram publicadas no Firebase.":e?.message||"Não foi possível completar a operação.";
const buttons=()=>{$("createRoom").disabled=busy||!auth.currentUser;$("joinRoom").disabled=busy||!auth.currentUser;$("liveDrawBtn").disabled=busy;};
const setBusy=x=>{busy=x;buttons();};
function randomNumber(max){const b=new Uint32Array(1);const bound=Math.floor(4294967296/max)*max;do{crypto.getRandomValues(b)}while(b[0]>=bound);return b[0]%max;}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=randomNumber(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeCard(){
 for(let attempt=0;attempt<2000;attempt++){
  const positions=[[],[],[]],counts=Array(9).fill(0);
  for(let r=0;r<3;r++){positions[r]=shuffle([0,1,2,3,4,5,6,7,8]).slice(0,5);for(const c of positions[r])counts[c]++;}
  if(counts.includes(0))continue;
  const grid=Array.from({length:3},()=>Array(9).fill(null));
  for(let c=0;c<9;c++){
   const lo=c===0?1:c*10,hi=c===8?90:c*10+9;
   const nums=shuffle(Array.from({length:hi-lo+1},(_,i)=>i+lo)).slice(0,counts[c]).sort((a,b)=>a-b);
   let n=0;for(let r=0;r<3;r++)if(positions[r].includes(c))grid[r][c]=nums[n++];
  }
  return validateCard(grid);
 }
 throw new Error("Não foi possível gerar cartela.");
}
function validName(v){const n=v.trim().replace(/\s+/g," ");if(n.length<2||n.length>40)throw new Error("Informe um nome de 2 a 40 caracteres.");return n;}
function readMarks(){return card?.marked?card.marked.slice(1).split(",").filter(Boolean).map(Number):[];}
function render(){
 if(!room||!card)return;
 const drawn=Object.keys(room.drawnMap||{}).map(Number).sort((a,b)=>a-b);
 $("roomMembers").textContent=Object.values(room.members||{}).map(x=>x.name).join(" • ");
 $("liveBall").textContent=room.lastDraw??"—";
 $("drawCounter").textContent=drawn.length+" de 90 números";
 $("liveHistory").replaceChildren();
 for(const n of drawn){const s=document.createElement("span");s.className="history-ball";s.textContent=n;$("liveHistory").append(s);}
 $("liveDrawBtn").hidden=!host;
 $("tvAccess").hidden=!host;
 const bingoReady=verifyBingo(card.grid,drawn);
 $("gameMessage").dataset.bingoPossible=String(bingoReady);
 const marks=new Set(readMarks()),grid=$("liveCard");grid.replaceChildren();
 for(const row of card.grid)for(const n of row){
  const b=document.createElement("button");b.type="button";b.className="bingo-cell";
  if(n===null){b.disabled=true;b.textContent="·";b.classList.add("blank");}
  else{
   b.textContent=n;b.classList.add("markable");if(marks.has(n))b.classList.add("marked");
   // O sorteio nunca marca a cartela automaticamente.
   // Apenas a ação manual do convidado altera a marcação.
   b.setAttribute("aria-pressed",String(marks.has(n)));
   b.onclick=async()=>{if(busy)return;setBusy(true);try{
    const next=new Set(readMarks());if(next.has(n))next.delete(n);else next.add(n);
    const str="_"+[...next].sort((a,b)=>a-b).join(",");
    await set(ref(db,"privateRooms/"+roomId+"/"+auth.currentUser.uid+"/marked"),str);
    $("gameMessage").textContent="Marcação manual salva. Confira os números sorteados antes de anunciar Bingo.";
   }catch(e){$("gameMessage").textContent=error(e);}finally{setBusy(false);}};
  }grid.append(b);
 }
}
function watch(id,isHost){
 unsub.forEach(f=>f());unsub=[];roomId=id;host=isHost;
 $("roomPanel").hidden=false;$("roomTitle").textContent="Sala "+id;
 const invite=new URL("./multiplayer.html",location.href);invite.searchParams.set("sala",id);
 $("inviteLink").href=invite.href;$("inviteLink").textContent=invite.href;
 const tv=new URL("./tv.html",location.href);tv.searchParams.set("sala",id);$("tvLink").href=tv.href;
 history.replaceState(null,"",invite.href);
 unsub.push(onValue(ref(db,"rooms/"+id),snap=>{room=snap.val();if(!room){$("gameMessage").textContent="Sala indisponível.";return;}render();},e=>$("gameMessage").textContent=error(e)));
 unsub.push(onValue(ref(db,"privateRooms/"+id+"/"+auth.currentUser.uid),snap=>{card=snap.val();render();},e=>$("gameMessage").textContent=error(e)));
}
async function ensureCard(id){
 const p=ref(db,"privateRooms/"+id+"/"+auth.currentUser.uid);
 const snap=await get(p);
 if(!snap.exists())await set(p,{grid:makeCard(),marked:"_"});
}
$("createRoom").onclick=async()=>{
 setBusy(true);try{
  const name=validName($("hostName").value),uid=auth.currentUser.uid;
  let id=null;
  for(let attempt=0;attempt<8;attempt++){
   const candidate=Array.from({length:6},()=>alphabet[randomNumber(alphabet.length)]).join("");
   const now=Date.now(),data={hostUid:uid,createdAt:now,expiresAt:now+86400000,members:{[uid]:{name,role:"host",joinedAt:now}}};
   const result=await runTransaction(ref(db,"rooms/"+candidate),v=>v===null?data:undefined,{applyLocally:false});
   if(result.committed){id=candidate;break;}
  }
  if(!id)throw new Error("Não foi possível criar código de sala.");
  await ensureCard(id);watch(id,true);$("hostResult").textContent="Sala criada: "+id;
 }catch(e){$("hostResult").textContent=error(e);}finally{setBusy(false);}
};
$("joinRoom").onclick=async()=>{
 setBusy(true);try{
  const name=validName($("playerName").value),id=$("roomCode").value.trim().toUpperCase(),uid=auth.currentUser.uid;
  if(!/^[A-HJ-NP-Z2-9]{6}$/.test(id))throw new Error("Código inválido.");
  const snapshot=await get(ref(db,"rooms/"+id+"/expiresAt"));
  if(!snapshot.exists()||snapshot.val()<Date.now())throw new Error("Sala inexistente ou expirada.");
  const memberRef=ref(db,"rooms/"+id+"/members/"+uid);
  const result=await runTransaction(memberRef,current=>current||{name,role:"player",joinedAt:Date.now()},{applyLocally:false});
  if(!result.committed)throw new Error("Não foi possível entrar na sala.");
  await ensureCard(id);watch(id,false);$("playerResult").textContent="Conectado: "+id;
 }catch(e){$("playerResult").textContent=error(e);}finally{setBusy(false);}
};
$("liveDrawBtn").onclick=async()=>{
 if(!roomId||!host)return;setBusy(true);
 try{
  const used=new Set(Object.keys(room?.drawnMap||{}).map(Number));
  const available=Array.from({length:90},(_,i)=>i+1).filter(n=>!used.has(n));
  if(!available.length)throw new Error("Todos os números foram sorteados.");
  const n=available[randomNumber(available.length)];
  await set(ref(db,"rooms/"+roomId+"/drawnMap/"+n),true);
  await set(ref(db,"rooms/"+roomId+"/lastDraw"),n);
  $("gameMessage").textContent="Número sorteado: "+n;
 }catch(e){$("gameMessage").textContent=error(e);}finally{setBusy(false);}
};
show("Conectando ao Firebase…","Autenticação anônima em andamento.");
onAuthStateChanged(auth,async user=>{
 if(!user){try{await signInAnonymously(auth);}catch(e){show("Falha de autenticação",error(e));}return;}
 show("Conectado ao Firebase • Modo Spark","As salas funcionam após a publicação das regras de segurança. Partidas recreativas, sem validação autoritativa.");
 buttons();
});
