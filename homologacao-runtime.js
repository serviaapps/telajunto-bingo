// Apenas homologação local: NÃO importar nos arquivos de produção.
import {initializeApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,connectAuthEmulator} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getDatabase,connectDatabaseEmulator} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";
const host=location.hostname;
const octets=host.split(".").map(Number);
const ipv4=octets.length===4 && octets.every(n=>Number.isInteger(n)&&n>=0&&n<=255);
const privateLan=host==="localhost"||host==="127.0.0.1"||(ipv4&&(octets[0]===10||(octets[0]===192&&octets[1]===168)||(octets[0]===172&&octets[1]>=16&&octets[1]<=31)));
if(!privateLan || location.protocol!=="http:")throw new Error("Homologação permitida apenas por HTTP na rede local.");
const firebaseConfig={apiKey:"demo-api-key",authDomain:"demo-telajunto-rules.firebaseapp.com",databaseURL:"http://"+host+":9000?ns=demo-telajunto-rules-default-rtdb",projectId:"demo-telajunto-rules",appId:"demo-app-id"};
const app=initializeApp(firebaseConfig);
const auth=getAuth(app),db=getDatabase(app);
connectAuthEmulator(auth,"http://"+host+":9099",{disableWarnings:true});
connectDatabaseEmulator(db,host,9000);
export {auth,db};
