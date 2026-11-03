(() => {
  "use strict";
  const STORAGE_KEY = "telajunto-bingo-state-v1";
  const $ = (id) => document.getElementById(id);
  const ranges = [[1,9],[10,19],[20,29],[30,39],[40,49],[50,59],[60,69],[70,79],[80,90]];
  const numberWords = (n) => {
    const units = ["zero","um","dois","três","quatro","cinco","seis","sete","oito","nove"];
    const teens = ["dez","onze","doze","treze","quatorze","quinze","dezesseis","dezessete","dezoito","dezenove"];
    const tens = ["","","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"];
    if (n < 10) return units[n];
    if (n < 20) return teens[n-10];
    const d = Math.floor(n/10), u = n%10;
    return u ? `${tens[d]} e ${units[u]}` : tens[d];
  };
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  };
  function createPattern() {
    // Cada coluna recebe de 1 a 3 números; cada linha recebe exatamente 5.
    for (let attempt=0; attempt<500; attempt++) {
      const matrix = Array.from({length:3},()=>Array(9).fill(false));
      const rowCounts=[0,0,0], colCounts=Array(9).fill(0);
      function fill(pos) {
        if (pos===27) return rowCounts.every(x=>x===5) && colCounts.every(x=>x>=1 && x<=3);
        const r=Math.floor(pos/9), c=pos%9;
        const choices=shuffle([false,true]);
        for (const take of choices) {
          if (take && (rowCounts[r]>=5 || colCounts[c]>=3)) continue;
          if (!take && rowCounts[r] + (8-c) < 5) continue;
          matrix[r][c]=take;
          if (take) {rowCounts[r]++;colCounts[c]++;}
          const remainingInCol = 2-r;
          const possible = colCounts[c] + remainingInCol;
          const ok = colCounts.every((count,idx)=>count + (idx>c ? 0 : 0) <= 3) &&
            colCounts.every((count,idx)=> count + (idx===c ? remainingInCol : 0) >= 0);
          if (ok && fill(pos+1)) return true;
          if (take) {rowCounts[r]--;colCounts[c]--;}
        }
        return false;
      }
      if (fill(0) && colCounts.every(x=>x>=1 && x<=3)) return matrix;
    }
    // Fallback determinístico válido: cada coluna aparece ao menos uma vez e cada linha tem cinco.
    return [[1,1,1,1,1,0,0,0,0],[0,0,0,0,1,1,1,1,1],[1,1,1,1,0,0,0,0,1]];
  }
  function makeCard(id) {
    const pattern=createPattern();
    const grid=Array.from({length:3},()=>Array(9).fill(null));
    for(let c=0;c<9;c++){
      const rows=[0,1,2].filter(r=>pattern[r][c]);
      const [lo,hi]=ranges[c];
      const values=shuffle(Array.from({length:hi-lo+1},(_,i)=>lo+i)).slice(0,rows.length).sort((a,b)=>a-b);
      rows.forEach((r,i)=>grid[r][c]=values[i]);
    }
    return {id,grid,marked:[]};
  }
  function freshState(){return {drawn:[],cards:[makeCard(1)],nextCardId:2};}
  function loadState(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(!raw) return freshState();
      const s=JSON.parse(raw);
      if(!Array.isArray(s.drawn)||!Array.isArray(s.cards)||!s.cards.length) return freshState();
      s.cards=s.cards.map(c=>({...c,marked:Array.isArray(c.marked)?c.marked:[]}));
      s.nextCardId=Math.max(Number(s.nextCardId)||1,...s.cards.map(c=>c.id+1));
      return s;
    }catch(e){return freshState();}
  }
  let state=loadState();
  let deferredInstall=null;
  let toastTimer=null;
  function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));$("saveStatus").textContent="Salvo neste aparelho";}catch(e){$("saveStatus").textContent="Não foi possível salvar";}}
  function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2200);}
  function announce(n,force=false){
    if(!("speechSynthesis" in window) || !$("voiceEnabled").checked) return;
    if(!force && !n) return;
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(n ? `Atenção! Bola ${numberWords(n)}!` : "Atenção! Teste de narração do TelaJunto Bingo!");
    utterance.lang="pt-BR";utterance.rate=Number($("voiceRate").value);utterance.volume=Number($("voiceVolume").value);
    const voices=window.speechSynthesis.getVoices();
    const pt=voices.find(v=>v.lang.toLowerCase().startsWith("pt-br")) || voices.find(v=>v.lang.toLowerCase().startsWith("pt"));
    if(pt) utterance.voice=pt;
    utterance.onerror=()=>{$("voiceNotice").textContent="A voz não está disponível neste momento. O sorteio continua normalmente.";};
    window.speechSynthesis.speak(utterance);
  }
  function renderDraw(){
    const n=state.drawn[state.drawn.length-1];
    $("drawNumber").textContent=n?String(n).padStart(2,"0"):"—";
    $("drawWords").textContent=n?`Atenção! Bola ${numberWords(n)}!`:"Pronto para começar?";
    $("progressText").textContent=`${state.drawn.length} de 90 números`;
    $("progressBar").style.width=`${state.drawn.length/90*100}%`;
    $("historyCount").textContent=state.drawn.length;
    $("drawBtn").disabled=state.drawn.length===90;
    $("repeatBtn").disabled=!n;
    const history=$("history");history.replaceChildren();
    if(!state.drawn.length){const p=document.createElement("p");p.className="muted empty";p.textContent="Os números sorteados aparecerão aqui.";history.append(p);}
    state.drawn.slice().reverse().forEach((value,i)=>{const ball=document.createElement("span");ball.className="history-ball"+(i===0?" latest":"");ball.textContent=value;history.append(ball);});
  }
  function renderCards(){
    const host=$("cards");host.replaceChildren();
    state.cards.forEach(card=>{
      const wrap=document.createElement("article");wrap.className="bingo-card";
      const head=document.createElement("div");head.className="card-title";
      const title=document.createElement("span");title.textContent=`CARTELA ${card.id}`;
      const remove=document.createElement("button");remove.type="button";remove.textContent="Remover";remove.setAttribute("aria-label",`Remover cartela ${card.id}`);
      remove.addEventListener("click",()=>{if(state.cards.length===1){toast("Mantenha pelo menos uma cartela.");return;}state.cards=state.cards.filter(c=>c.id!==card.id);save();renderCards();});
      head.append(title,remove);wrap.append(head);
      const grid=document.createElement("div");grid.className="bingo-grid";
      card.grid.forEach((row,r)=>row.forEach((value,c)=>{
        const cell=document.createElement("button");cell.type="button";cell.className="bingo-cell";
        if(value===null){cell.classList.add("blank");cell.disabled=true;cell.textContent="·";}
        else{
          const marked=card.marked.includes(value),called=state.drawn.includes(value);
          cell.textContent=value;cell.classList.add("markable");
          if(marked)cell.classList.add("marked");if(called&&!marked)cell.classList.add("called");
          cell.setAttribute("aria-pressed",String(marked));cell.setAttribute("aria-label",`Número ${value}${marked?", marcado":""}${called?", sorteado":""}`);
          cell.addEventListener("click",()=>{card.marked=marked?card.marked.filter(x=>x!==value):[...card.marked,value];save();renderCards();});
        }
        grid.append(cell);
      }));
      wrap.append(grid);host.append(wrap);
    });
  }
  function render(){renderDraw();renderCards();}
  $("drawBtn").addEventListener("click",()=>{
    const remaining=Array.from({length:90},(_,i)=>i+1).filter(n=>!state.drawn.includes(n));
    if(!remaining.length)return;
    const n=remaining[Math.floor(Math.random()*remaining.length)];state.drawn.push(n);save();renderDraw();renderCards();announce(n);
  });
  $("repeatBtn").addEventListener("click",()=>{const n=state.drawn[state.drawn.length-1];if(n)announce(n,true);});
  $("resetBtn").addEventListener("click",()=>{
    if(!confirm("Começar uma nova partida? O histórico e as marcações atuais serão apagados."))return;
    state={...freshState(),cards:state.cards.map((c,i)=>makeCard(i+1)),nextCardId:state.cards.length+1};save();render();toast("Nova partida iniciada.");
  });
  $("addCardBtn").addEventListener("click",()=>{if(state.cards.length>=12){toast("Limite de 12 cartelas nesta versão.");return;}state.cards.push(makeCard(state.nextCardId++));save();renderCards();});
  $("testVoiceBtn").addEventListener("click",()=>announce(null,true));
  $("voiceRate").addEventListener("input",()=>{$("rateValue").value=`${Number($("voiceRate").value).toFixed(1).replace(".",",")}×`;});
  $("voiceVolume").addEventListener("input",()=>{$("volumeValue").value=`${Math.round(Number($("voiceVolume").value)*100)}%`;});
  $("voiceEnabled").addEventListener("change",()=>{if(!$("voiceEnabled").checked&&"speechSynthesis"in window)window.speechSynthesis.cancel();});
  if("serviceWorker"in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{$("saveStatus").textContent="Modo offline indisponível";}));}
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("installBtn").hidden=false;});
  $("installBtn").addEventListener("click",async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("installBtn").hidden=true;});
  if("speechSynthesis"in window){window.speechSynthesis.onvoiceschanged=()=>{};}else{$("voiceNotice").textContent="Este navegador não oferece narração por voz. Os números continuam aparecendo na tela.";}
  render();
})();