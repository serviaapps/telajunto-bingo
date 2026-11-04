# TelaJunto V1.1 — PWA + Firebase, arquitetura aprovada
**Somente branch feat/v1-1-multiplayer-foundation. Nenhum deploy, regra publicada ou alteração da main.**
## Papéis
- Anfitrião: login anônimo, criação de sala, sorteio manual ou automático 3/6/9 s, pausa/desativação, sua própria cartela com marcação manual.
- TV: painel público B-I-N-G-O (B 01–15, I 16–30, N 31–45, G 46–60, O 61–75), bola atual e QR de acesso, sem controles nem cartelas privadas.
- Jogador: login anônimo, QR/código da sala, cartela 5x5 (centro LIVRE), marcação manual inclusive antecipada.
## Separação de dados
rooms/{id}: estado de controle restrito ao anfitrião e participantes; publicRooms/{id}: projeção pública sanitizada para TV; privateRooms/{id}/{uid}: cartela e marcações privadas.
## Regras de segurança necessárias antes de homologação
A implementação existente de database.rules.json é incompatível com o esquema escrito pelas Cloud Functions (drawnMap versus drawn e marked string versus array). Não publicar regras existentes. Elaborar regras novas, testar acesso anônimo, acesso do anfitrião, do jogador, da TV e bloqueio de leitura cruzada. QR não deve conter segredo de anfitrião. Rate limit e expiração da sala.
## Voz e temporização
Chamada: "Letra B, número 8. Repetindo, zero oito!". Bordão opcional a cada 3ª/4ª bola, sem falar "Atenção". A narração ocorre no aparelho escolhido; evitar áudio duplicado. Automático controlado pelo anfitrião; evitar múltiplos timers em abas e não prometer intervalos exatos com navegador em segundo plano.
## Estado
Motor puro de 75 bolas e testes unitários em functions/bingo75-engine.mjs e bingo75-engine.test.mjs. Ainda não conectado às callable Functions existentes nem ao PWA; não é homologação multiplayer concluída.
## Segurança da homologação
Usar projeto Firebase demo- com emuladores Auth/RTDB/Functions; a configuração .firebaserc aponta para um projeto real, portanto nunca usar deploy sem troca explícita de contexto e autorização. Sem credenciais reais no cliente de homologação.
## Critérios de aceite
1. 75 sorteios únicos e cartela válida 5x5 com LIVRE.
2. Jogadores não leem cartelas alheias; TV só vê projeção pública.
3. Anfitrião pode sortear, pausar, desativar, alternar 3/6/9 s.
4. Marcações não são automáticas; premiação é validada pelo histórico do servidor.
5. QR entra na sala e TV recebe atualizações.
6. Testes em dois Androids e TV com navegador, antes de qualquer deploy.
