import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {ref,get,set,runTransaction} from 'firebase/database';

const env=await initializeTestEnvironment({
 projectId:'demo-telajunto-rules',
 database:{rules:readFileSync('database.rules.json','utf8'),host:'127.0.0.1',port:9000}
});
after(async()=>{await env.cleanup()});
const host=env.authenticatedContext('host'),guest=env.authenticatedContext('guest'),stranger=env.authenticatedContext('stranger'),anon=env.unauthenticatedContext();
const db=c=>c.database(),p=(c,path)=>ref(db(c),path);
const now=Date.now(),room='ABC234',roomPath='rooms/'+room;
const payload={hostUid:'host',createdAt:now,expiresAt:now+3600000,members:{host:{name:'Anfitriao',role:'host',joinedAt:now}}};
const grid=[[1,11,21,31,41,null,null,null,null],[2,12,22,32,42,null,null,null,null],[3,13,23,33,43,null,null,null,null]];
// O teste usa uma cartela de estrutura representativa; regras não validam formato integral.
test('bloqueia leitura anônima e criação sem autenticação',async()=>{
 await assertFails(get(p(anon,roomPath)));
 await assertFails(set(p(anon,roomPath),payload));
});
test('anfitrião cria sala com transação e lê sua sala',async()=>{
 const result=await assertSucceeds(runTransaction(p(host,roomPath),v=>v===null?payload:undefined,{applyLocally:false}));
 assert.equal(result.committed,true);
 await assertSucceeds(get(p(host,roomPath)));
});
test('não membros não leem sala inteira; código permite consulta de expiração',async()=>{
 await assertFails(get(p(stranger,roomPath)));
 await assertSucceeds(get(p(stranger,roomPath+'/expiresAt')));
});
test('convidado entra, lê sala e cria apenas sua cartela',async()=>{
 const membership={name:'Convidado',role:'player',joinedAt:now};
 const result=await assertSucceeds(runTransaction(p(guest,roomPath+'/members/guest'),v=>v||membership,{applyLocally:false}));
 assert.equal(result.committed,true);
 await assertSucceeds(get(p(guest,roomPath)));
 await assertSucceeds(set(p(guest,'privateRooms/'+room+'/guest'),{grid,marked:'_'}));
 await assertSucceeds(get(p(guest,'privateRooms/'+room+'/guest')));
 await assertFails(get(p(host,'privateRooms/'+room+'/guest')));
 await assertFails(get(p(stranger,'privateRooms/'+room+'/guest')));
 await assertFails(set(p(stranger,'privateRooms/'+room+'/guest/marked'),'_1'));
 await assertSucceeds(set(p(guest,'privateRooms/'+room+'/guest/marked'),'_1,11'));
 await assertSucceeds(set(p(guest,'privateRooms/'+room+'/guest/marked'),'_'));
});
test('convidado não sorteia e anfitrião sorteia',async()=>{
 await assertFails(set(p(guest,roomPath+'/drawnMap/42'),true));
 await assertSucceeds(set(p(host,roomPath+'/drawnMap/42'),true));
 await assertSucceeds(set(p(host,roomPath+'/lastDraw'),42));
 await assertFails(set(p(guest,roomPath+'/lastDraw'),42));
 await assertFails(set(p(host,roomPath+'/drawnMap/42'),false));
 await assertFails(set(p(host,roomPath+'/drawnMap/91'),true));
});
test('não permite convidado se promover a anfitrião',async()=>{
 await assertFails(set(p(stranger,roomPath+'/members/stranger'),{name:'Intruso',role:'host',joinedAt:now}));
 await assertFails(set(p(guest,roomPath+'/members/guest/role'),'host'));
});

// Regressões de isolamento: anfitrião não pode acessar cartela de outro usuário;
// convidados não podem alterar número sorteado nem sobrescrever cartelas existentes.
test('impede alterações de cartela de terceiros e regravação de cartela própria',async()=>{
 await assertFails(set(p(host,'privateRooms/'+room+'/guest/marked'),'_1'));
 await assertFails(set(p(guest,'privateRooms/'+room+'/guest'),{grid,marked:'_'}));
 await assertFails(set(p(stranger,roomPath+'/hostUid'),'stranger'));
 await assertFails(set(p(guest,roomPath+'/drawnMap/43'),true));
});

// Casos negativos adicionais executados somente no emulador Firebase.
test('não autenticado não lê cartelas privadas nem participa da sala',async()=>{
 await assertFails(get(p(anon,'privateRooms/'+room+'/guest')));
 await assertFails(set(p(anon,roomPath+'/members/anonymous'),{name:'Anonimo',role:'player',joinedAt:now}));
});
test('participante não cria cartela em nome de outra identidade',async()=>{
 await assertFails(set(p(guest,'privateRooms/'+room+'/host'),{grid,marked:'_'}));
 await assertFails(get(p(stranger,'privateRooms/'+room+'/host')));
});
test('entrada recusa nome inválido e papel de anfitrião',async()=>{
 await assertFails(set(p(stranger,roomPath+'/members/stranger'),{name:'A',role:'player',joinedAt:now}));
 await assertFails(set(p(stranger,roomPath+'/members/stranger'),{name:'Intruso',role:'host',joinedAt:now}));
});
