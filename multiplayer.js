// TelaJunto V1.1 — prévia de interface, sem comandos de escrita até backend seguro.
const status = document.getElementById("setupNotice");
const params = new URLSearchParams(location.search);
const code = params.get("sala");
if (code && /^[a-z0-9]{4,8}$/i.test(code)) document.getElementById("roomCode").value = code.toUpperCase();
status.innerHTML = "<strong>Firebase ainda não configurado</strong><span>As telas de anfitrião e jogador estão preparadas. Para ativar salas reais, precisamos criar ou identificar o projeto Firebase e implantar autenticação, regras e funções de validação.</span>";
document.getElementById("createRoom").title = "Aguardando backend seguro";
document.getElementById("joinRoom").title = "Aguardando backend seguro";
