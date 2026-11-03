import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
test("homologação aponta somente para projeto demo",()=>{
 const runtime=read("homologacao-runtime.js");
 assert.match(runtime,/demo-telajunto-rules/);
 assert.match(runtime,/connectAuthEmulator/);
 assert.match(runtime,/connectDatabaseEmulator/);
 assert.doesNotMatch(runtime,/servia-marca-ai|firebase-config\\.js/);
});
test("páginas de homologação não carregam scripts de produção",()=>{
 for(const [page,script] of [["multiplayer-homolog.html","multiplayer-homolog.js"],["tv-homolog.html","tv-homolog.js"]]){
  const html=read(page);
  assert.ok(html.includes('src="./'+script+'"'));
  assert.doesNotMatch(html,/src="\\.\\/(?:multiplayer|tv)\\.js"/);
 }
 for(const path of ["multiplayer-homolog.js","tv-homolog.js"]){
  const js=read(path);
  assert.match(js,/homologacao-runtime\\.js/);
  assert.doesNotMatch(js,/firebase-config\\.js|initializeApp\\(/);
 }
});
test("configuração de homologação não inclui deploy nem Functions",()=>{
 const cfg=JSON.parse(read("firebase.homolog.json"));
 assert.equal(cfg.database.rules,"database.rules.json");
 assert.deepEqual(Object.keys(cfg.emulators).sort(),["auth","database"]);
 assert.equal(cfg.emulators.database.host,"0.0.0.0");
 assert.equal(cfg.functions,undefined);
 assert.equal(cfg.hosting,undefined);
});
