// TelaJunto V1.1: autenticação anônima real, sem abrir operações de sala até backend seguro.
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const status = document.getElementById("setupNotice");
const params = new URLSearchParams(location.search);
const code = params.get("sala");
if (code && /^[a-z0-9]{4,8}$/i.test(code)) document.getElementById("roomCode").value = code.toUpperCase();
const setStatus = (title, description) => {
  status.replaceChildren();
  const strong = document.createElement("strong");
  strong.textContent = title;
  const span = document.createElement("span");
  span.textContent = description;
  status.append(strong, span);
};
const create = document.getElementById("createRoom");
const join = document.getElementById("joinRoom");
create.disabled = true;
join.disabled = true;
create.title = "Aguardando funções e regras de segurança do servidor";
join.title = "Aguardando funções e regras de segurança do servidor";

try {
  setStatus("Conectando ao Firebase…", "Aguarde a autenticação de convidado.");
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        setStatus("Autenticação não disponível", "Confira se o login anônimo está ativado e se o domínio do site está autorizado no Firebase Authentication. Código: " + (error.code || "desconhecido"));
      }
      return;
    }
    if (!user.isAnonymous) {
      setStatus("Conta conectada", "Uma conta Firebase foi detectada. O multiplayer ainda aguarda a implantação segura do backend.");
      return;
    }
    setStatus("Firebase conectado • convidado autenticado", "Sua sessão de jogador está pronta neste navegador. Criar e entrar em salas serão liberados após as regras e funções oficiais serem implantadas.");
  });
} catch (error) {
  setStatus("Falha ao iniciar Firebase", "Verifique a conexão com a internet e a configuração do projeto. " + (error.message || ""));
}
