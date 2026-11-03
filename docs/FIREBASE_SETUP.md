# TelaJunto V1.1 — Verificação e configuração do Firebase

## Estado deste incremento
A branch `feat/v1-1-multiplayer-foundation` adiciona uma prévia de duas interfaces (anfitrião e jogador) sem alterar a V1 individual. **Ainda não existe multiplayer funcional**. Os botões permanecem desativados para não simular uma sala nem aceitar comandos inseguros.

## 1. Verificar se você já tem Firebase
1. Acesse https://console.firebase.google.com/ usando a conta Google que deseja usar no TelaJunto.
2. Confira a lista de projetos. Se encontrar um projeto existente destinado ao TelaJunto, abra-o e anote apenas o **Project ID** (não envie senhas nem chaves privadas).
3. Se não houver projeto apropriado, clique em **Adicionar projeto** e crie um projeto chamado `TelaJunto` (nome sugerido; o ID precisa ser único).
4. Selecione o projeto e abra **Configurações do projeto** > **Geral**. Registre o Project ID.

## 2. Serviços necessários antes do multiplayer
- **Authentication:** ativar o provedor Anônimo (guest-first).
- **Realtime Database:** criar banco na região desejada, inicialmente com regras restritivas, nunca com leitura/escrita pública.
- **Cloud Functions:** motor autoritativo para criar sala, entrar, sortear números, emitir cartelas e validar Bingo; implantação pode exigir plano de faturamento.
- **App Check** e monitoramento: configurar antes de exposição pública conforme disponibilidade e testes.

**Não** habilite regras de teste públicas para produção. A configuração web do Firebase pode ser distribuída ao cliente, mas **credenciais administrativas, chaves privadas e tokens de serviço não**.

## 3. Contrato proposto
- Sala: `rooms/{roomId}` com metadados, participantes, dispositivos, estado público, presença e eventos.
- Cartelas: `privateRooms/{roomId}/{uid}/gameState`, com leitura apenas pelo dono e backend autorizado.
- Somente Cloud Functions alteram sorteios e resultados oficiais.
- Anfitrião autenticado recebe permissão para comandar a sala; participantes só podem marcar suas próprias cartelas, mediante validação.
- Usar códigos de sala temporários, limitação de requisições, transações/idempotência, expiração e logs.
- Reconexão pelo mesmo UID anônimo enquanto a sessão persistir no navegador.

## 4. Critério de aceite para próxima etapa
1. Anfitrião cria sala real com código.
2. Outro celular entra com código e nome.
3. Backend gera cartela privada de 3x9, com 15 números.
4. Anfitrião sorteia sem repetição, com sincronização pública em tempo real.
5. Jogador marca somente sua cartela; backend valida vitória.
6. Acesso a cartela alheia é bloqueado por regras e testes de emulador.
7. Reinício/reconexão e duas sessões simultâneas são testados.

## 5. Como avançar
Informe **somente o Project ID** do projeto Firebase identificado ou criado. Com ele podemos preparar a configuração web, o backend, as regras, os testes e a implantação controlada. Não publique tokens de serviço.

A V1 individual permanece intacta na branch `main`.
