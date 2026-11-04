import { randomInt } from "node:crypto";
export const TOTAL_BALLS_75=75;
export const letter75=n=>{if(!Number.isInteger(n)||n<1||n>75)throw Error("Bola inválida");return "BINGO"[Math.floor((n-1)/15)];};
export function validateCard75(grid){
 if(!Array.isArray(grid)||grid.length!==5||grid.some(r=>!Array.isArray(r)||r.length!==5))throw Error("Cartela 5x5 inválida");
 const nums=[];
 for(let r=0;r<5;r++)for(let c=0;c<5;c++){const n=grid[r][c];if(r===2&&c===2){if(n!==null)throw Error("Centro deve ser LIVRE");continue;}if(!Number.isInteger(n)||n<c*15+1||n>c*15+15)throw Error("Número fora da coluna");nums.push(n);}
 if(nums.length!==24||new Set(nums).size!==24)throw Error("Cartela inválida");return grid;
}
export function card75(){
 const grid=Array.from({length:5},()=>Array(5).fill(null));
 for(let c=0;c<5;c++){const pool=Array.from({length:15},(_,i)=>c*15+i+1);for(let i=pool.length-1;i>0;i--){const j=randomInt(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}let k=0;for(let r=0;r<5;r++)if(!(r===2&&c===2))grid[r][c]=pool[k++];}
 return validateCard75(grid);
}
export function draw75(drawn,random=Math.random){
 if(!Array.isArray(drawn)||drawn.length>75||new Set(drawn).size!==drawn.length||drawn.some(n=>!Number.isInteger(n)||n<1||n>75))throw Error("Histórico inválido");
 const available=Array.from({length:75},(_,i)=>i+1).filter(n=>!drawn.includes(n));if(!available.length)return null;
 const v=random();if(!Number.isFinite(v)||v<0||v>=1)throw Error("Aleatoriedade inválida");return available[Math.floor(v*available.length)];
}
export function toggle75(grid,marked,n){validateCard75(grid);if(!Array.isArray(marked))throw Error("Marcações inválidas");if(!grid.flat().includes(n))throw Error("Número fora da cartela");const m=new Set(marked);m.has(n)?m.delete(n):m.add(n);return [...m].sort((a,b)=>a-b);}
export function bingo75(grid,drawn){validateCard75(grid);const called=new Set(drawn);return grid.flat().every(n=>n===null||called.has(n));}
export function line75(grid,drawn){validateCard75(grid);const called=new Set(drawn);return grid.some(row=>row.every(n=>n===null||called.has(n)));}
