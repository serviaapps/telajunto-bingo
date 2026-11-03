// Motor puro de Bingo 90: funções reutilizáveis por Cloud Functions e testes.
// Nunca confie em cartelas, sorteios ou vitórias enviados diretamente pelo cliente.
export const TOTAL_BALLS = 90;
export function validateDrawn(drawn) {
  if (!Array.isArray(drawn) || drawn.length > TOTAL_BALLS || new Set(drawn).size !== drawn.length ||
      drawn.some(n => !Number.isInteger(n) || n < 1 || n > TOTAL_BALLS)) throw new Error("Histórico de sorteio inválido");
  return drawn;
}
export function nextDraw(drawn, random = Math.random) {
  validateDrawn(drawn);
  if (drawn.length === TOTAL_BALLS) return null;
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error("Gerador aleatório inválido");
  const used = new Set(drawn);
  const available = Array.from({length:TOTAL_BALLS}, (_,i)=>i+1).filter(n=>!used.has(n));
  return available[Math.floor(value * available.length)];
}
export function validateCard(grid) {
  if (!Array.isArray(grid) || grid.length !== 3 || grid.some(row => !Array.isArray(row) || row.length !== 9)) throw new Error("Cartela deve ter 3 linhas e 9 colunas");
  const all = [];
  for (let r=0;r<3;r++) {
    const nums = grid[r].filter(n=>n!==null);
    if (nums.length!==5) throw new Error("Cada linha precisa ter 5 números");
    all.push(...nums);
  }
  if (all.length!==15 || new Set(all).size!==15) throw new Error("Cartela com números duplicados");
  for(let c=0;c<9;c++){
    const values=grid.map(row=>row[c]).filter(n=>n!==null);
    if (!values.length || values.length>3) throw new Error("Coluna inválida");
    const min=c===0?1:c*10, max=c===8?90:c*10+9;
    if(values.some(n=>!Number.isInteger(n)||n<min||n>max)) throw new Error("Número fora da faixa da coluna");
    if(values.some((n,i)=>i>0&&n<=values[i-1])) throw new Error("Coluna fora de ordem");
  }
  return grid;
}
export function verifyBingo(grid, drawn) {
  validateCard(grid); validateDrawn(drawn);
  const called = new Set(drawn);
  return grid.every(row=>row.every(n=>n===null||called.has(n)));
}
export function verifyLine(grid, drawn) {
  validateCard(grid); validateDrawn(drawn);
  const called=new Set(drawn);
  return grid.some(row=>row.every(n=>n===null||called.has(n)));
}
export function markNumber(grid, marked, n) {
  validateCard(grid);
  if(!Array.isArray(marked)||marked.some(x=>!Number.isInteger(x))) throw new Error("Marcações inválidas");
  const allowed=new Set(grid.flat().filter(x=>x!==null));
  if(!allowed.has(n)) throw new Error("Número não pertence à cartela");
  const current=new Set(marked.filter(x=>allowed.has(x)));
  if(current.has(n)) current.delete(n); else current.add(n);
  return [...current].sort((a,b)=>a-b);
}
