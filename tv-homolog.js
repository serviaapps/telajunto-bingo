import {getAuth,onAuthStateChanged,signInAnonymously} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getDatabase,ref,get,runTransaction,onValue} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";
import {auth,db} from "./homologacao-runtime.js";
const $=id=>document.getElementById(id);
let unsubscribe=null;const status=msg=>$("status").textContent=msg;
const initial=new URLSearchParams(location.search).get("sala");if(initial)$("code").value=initial.toUpperCase();
async function connect(code){
 if(!/^[A-HJ-NP-Z2-9]{6}$/.test(code))throw new Error("Código de sala inválido.");
 if(!auth.currentUser)throw new Error("Aguarde a autenticação.");
 const exp=await get(ref(db,"rooms/"+code+"/expiresAt"));
 if(!exp.exists()||exp.val()<Date.now())throw new Error("Sala não encontrada ou expirada.");
 // A TV é apenas um dispositivo de exibição, sem cartela ou controle de sorteio.
 // A adesão como espectador usa o mesmo mecanismo de membro de leitura da V1.1 Spark.
 const uid=auth.currentUser.uid;
 await runTransaction(ref(db,"rooms/"+code+"/members/"+uid),v=>v||{name:"TV",role:"player",joinedAt:Date.now()},{applyLocally:false});
 if(unsubscribe)unsubscribe();
 unsubscribe=onValue(ref(db,"rooms/"+code),snap=>{
  const room=snap.val();if(!room){status("Sala indisponível.");return;}
  const nums=Object.keys(room.drawnMap||{}).map(Number).sort((a,b)=>a-b);
  $("ball").textContent=room.lastDraw??"—";
  $("count").textContent=nums.length+" de 90 números";
  $("room").textContent="SALA "+code;
  $("history").replaceChildren();
  for(const n of nums){const s=document.createElement("span");s.textContent=n;$("history").append(s);}
  status("Painel público conectado • "+Object.keys(room.members||{}).length+" dispositivos");
 },e=>status("Erro de leitura: "+e.message));
 history.replaceState(null,"","?sala="+encodeURIComponent(code));
}
$("connect").onsubmit=async e=>{e.preventDefault();status("Entrando na sala…");try{await connect($("code").value.trim().toUpperCase());}catch(err){status(err.message);}};
onAuthStateChanged(auth,async user=>{if(!user){try{await signInAnonymously(auth);}catch(e){status("Erro de autenticação: "+e.message);}return;}status("Conectado. Informe o código da sala.");if(initial){try{await connect(initial.toUpperCase());}catch(e){status(e.message);}}});
