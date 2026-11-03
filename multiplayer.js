import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-functions.js";
import { firebaseConfig } from "./firebase-config.js";
const $=id=>document.getElementById(id);
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getDatabase(app),functions=getFunctions(app,"us-central1");
const call=(name,data)=>httpsCallable(functions,name)(data);
const params=new URLSearchParams(location.search),urlCode=params.get("sala");
if(urlCode&&/^[a-z0-9]{6}$/i.test(urlCode))$("roomCode").value=urlCode.toUpperCase();
let activeRoom=null,privateCard=null,unsubscribeRoom=null,unsubscribePrivate=null,host=false, busy=false;
const status=(title,detail)=>{const strong=document.createElement("strong");strong.textContent=title;const span=document.createElement("span");span.textContent=detail;$("setupNotice").replaceChildren(strong,span)};
const errorMessage=e=>e?.message||"Ocorreu um erro. Tente novamente.";
function setBusy(value){busy=value;$("createRoom").disabled=value||!auth.currentUser;$("joinRoom").disabled=value||!auth.currentUser;$("liveDrawBtn").disabled=value;}
function renderCard(data,drawn=[]){
 const grid=$("liveCard");grid.replaceChildren();
 if(!data?.grid)return;
 const marked=new Set(data.marked||[]),called=new Set(drawn);
 for(const row of data.grid)for(const n of row){
  const cell=document.createElement("button");cell.type="button";cell.className="bingo-cell";
  if(n===null){cell.classList.add("blank");cell.disabled=true;cell.textContent="·";}
  else{
   cell.classList.add("markable");cell.textContent=String(n);
   if(marked.has(n))cell.classList.add("marked");
   else if(called.has(n))cell.classList.add("called");
   cell.setAttribute("aria-pressed",String(marked.has(n)));
   cell.addEventListener("click",async()=>{if(busy)return;setBusy(true);try{const res=await call("toggleMark",{roomId:activeRoom,number:n});if(res.data.bingo)$("gameMessage").textContent="Bingo! Cartela completa com os números sorteados.";}catch(e){$("gameMessage").textContent=errorMessage(e);}finally{setBusy(false);}});
  }
  grid.append(cell);
 }
}
function enterRoom(id,card,isHost){
 if(unsubscribeRoom)unsubscribeRoom();if(unsubscribePrivate)unsubscribePrivate();
 activeRoom=id;privateCard={grid:card,marked:[]};host=isHost;
 $("roomPanel").hidden=false;$("roomTitle").textContent="Sala "+id;
 $("liveDrawBtn").hidden=!host;
 const invite=new URL("./multiplayer.html",location.href);invite.searchParams.set("sala",id);
 $("inviteLink").href=invite.href;$("inviteLink").textContent=invite.href;
 history.replaceState(null,"",invite.href);
 unsubscribeRoom=onValue(ref(db,"rooms/"+id),snap=>{
  const room=snap.val();
  if(!room){$("gameMessage").textContent="Sala indisponível.";return;}
  $("roomMembers").textContent=Object.values(room.members||{}).map(p=>p.name).join(" • ");
  const drawn=room.drawn||[],last=drawn[drawn.length-1];
  $("liveBall").textContent=last?String(last).padStart(2,"0"):"—";
  $("drawCounter").textContent=drawn.length+" de 90 números";
  $("liveHistory").replaceChildren();
  for(const n of [...drawn].reverse()){const ball=document.createElement("span");ball.className="history-ball";ball.textContent=n;$("liveHistory").append(ball);}
  renderCard(privateCard,drawn);
 },e=>$("gameMessage").textContent="Leitura da sala: "+errorMessage(e));
 unsubscribePrivate=onValue(ref(db,"privateRooms/"+id+"/"+auth.currentUser.uid),snap=>{
  if(snap.exists()){privateCard=snap.val();renderCard(privateCard);}
 },e=>$("gameMessage").textContent="Leitura da cartela: "+errorMessage(e));
}
$("createRoom").addEventListener("click",async()=>{
 const name=$("hostName").value.trim();setBusy(true);$("hostResult").textContent="Criando sala…";
 try{const r=await call("createRoom",{name});$("hostResult").textContent="Sala criada: "+r.data.roomId;enterRoom(r.data.roomId,r.data.card,true);}
 catch(e){$("hostResult").textContent=errorMessage(e);}
 finally{setBusy(false);}
});
$("joinRoom").addEventListener("click",async()=>{
 const name=$("playerName").value.trim(),roomId=$("roomCode").value.trim().toUpperCase();
 setBusy(true);$("playerResult").textContent="Entrando na sala…";
 try{const r=await call("joinRoom",{name,roomId});$("playerResult").textContent="Conectado à sala "+r.data.roomId;enterRoom(r.data.roomId,r.data.card,false);}
 catch(e){$("playerResult").textContent=errorMessage(e);}
 finally{setBusy(false);}
});
$("liveDrawBtn").addEventListener("click",async()=>{
 if(!activeRoom)return;setBusy(true);
 try{await call("drawBall",{roomId:activeRoom});$("gameMessage").textContent="Bola sorteada.";}
 catch(e){$("gameMessage").textContent=errorMessage(e);}
 finally{setBusy(false);}
});
status("Conectando ao Firebase…","Autenticando como convidado.");
onAuthStateChanged(auth,async user=>{
 if(!user){try{await signInAnonymously(auth);}catch(e){status("Falha na autenticação",errorMessage(e));}return;}
 status("Firebase autenticado","A criação de salas requer que as Cloud Functions e regras do banco estejam implantadas.");
 setBusy(false);
});
