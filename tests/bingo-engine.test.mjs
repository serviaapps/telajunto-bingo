import test from "node:test";
import assert from "node:assert/strict";
import {nextDraw,validateDrawn,validateCard,verifyBingo,verifyLine,markNumber} from "../src/bingo-engine.mjs";
const grid=[
 [1,10,20,30,40,null,null,null,null],
 [2,null,null,null,41,50,60,70,null],
 [null,11,21,null,null,51,61,null,80]
];
const nums=grid.flat().filter(n=>n!==null);
test("cartela de 90 bolas é válida",()=>assert.equal(validateCard(grid),grid));
test("sorteio não repete",()=>{let d=[];for(let i=0;i<90;i++){const n=nextDraw(d,()=>0);assert.ok(!d.includes(n));d.push(n);}assert.equal(nextDraw(d),null);assert.equal(new Set(d).size,90)});
test("histórico duplicado é recusado",()=>assert.throws(()=>validateDrawn([1,1])));
test("gerador inválido é recusado",()=>assert.throws(()=>nextDraw([],()=>1)));
test("linha e bingo são validados por números oficiais",()=>{assert.equal(verifyBingo(grid,nums),true);assert.equal(verifyBingo(grid,nums.slice(1)),false);assert.equal(verifyLine(grid,[1,10,20,30,40]),true);assert.equal(verifyLine(grid,[1,10]),false)});
test("marca somente números próprios",()=>{assert.deepEqual(markNumber(grid,[],1),[1]);assert.deepEqual(markNumber(grid,[1],1),[]);assert.throws(()=>markNumber(grid,[],90))});
test("cartela adulterada é recusada",()=>{const bad=grid.map(row=>[...row]);bad[0][0]=90;assert.throws(()=>validateCard(bad))});
