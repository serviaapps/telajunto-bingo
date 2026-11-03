// Apenas homologação local: NÃO importar nos arquivos de produção.
import {initializeApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth,connectAuthEmulator} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getDatabase,connectDatabaseEmulator} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";
const host=location.hostname;
const privateLan=/^(localhost|127\\.0\\.0\\.1|10\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|192\\.168\\.\\d{1,3}\\.\\d{1,3}|172\\.(1[6-9]|2\\d|3[01])\\.\\d{1,3}\\.\\d{1,3})$/.test(host);
if(!privateLan || location.protocol!=="http:")throw new Error("Homologação permitida apenas por HTTP na rede local.");
const firebaseConfig={apiKey:"demo-api-key",authDomain:"demo-telajunto-rules.firebaseapp.com",databaseURL:"http://"+host+":9000?ns=demo-telajunto-rules-default-rtdb",projectId:"demo-telajunto-rules",appId:"demo-app-id"};
const app=initializeApp(firebaseConfig);
const auth=getAuth(app),db=getDatabase(app);
connectAuthEmulator(auth,"http://"+host+":9099",{disableWarnings:true});
connectDatabaseEmulator(db,host,9000);
export {auth,db};
