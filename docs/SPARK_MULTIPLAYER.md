# TelaJunto V1.1 — modo gratuito Firebase Spark

## Situação
O código de salas e cartelas está preparado na branch `feat/v1-1-multiplayer-foundation`. **Não está publicado** no site principal nem com regras implantadas no Firebase. Não há cobrança ativada.

## Arquitetura sem Cloud Functions
- GitHub Pages: interface HTML/JS.
- Firebase Authentication anônimo: identifica cada navegador.
- Realtime Database: salas, membros, números sorteados e cartelas privadas.
- Regras: apenas anfitrião pode registrar uma bola nova; jogador só lê sua cartela e altera suas marcações.
- Regras **não conseguem** garantir cartela justa nem sorteio aleatório, pois o cliente gera ambos. Use apenas em partidas recreativas sem apostas/prêmios.

## Publicação manual das regras (sem custos)
1. Acesse https://console.firebase.google.com/u/2/project/servia-marca-ai/database/servia-marca-ai-default-rtdb/rules
2. Abra a aba **Regras** do **Realtime Database** (não Firestore).
3. Substitua o conteúdo pelas regras do arquivo `database.rules.json` desta branch.
4. Revise e publique. **Antes**, teste no emulador: não foram validadas em ambiente real.
5. Somente depois publique a interface em ambiente de homologação, sem substituir o site principal.

## Teste mínimo
1. Em dois navegadores distintos, entrar como convidados diferentes.
2. Anfitrião cria sala e compartilha o link.
3. Jogador entra com nome e código.
4. Confirmar que a cartela do jogador não pode ser lida por outro UID.
5. Confirmar que jogador não consegue sortear números; anfitrião consegue.
6. Marcar/desmarcar números, recarregar e conferir persistência.
7. Validar erros de sala inexistente, expiração e reconexão.

## Limites e riscos conhecidos
- A validação de Bingo é feita no navegador, não é prova de vitória oficial.
- O anfitrião pode manipular seu próprio cliente; não há motor de regras independente.
- Sem proteção robusta contra abuso, quotas ou salas abandonadas; não divulgar amplamente.
- A interface ainda precisa de testes de navegador e de regras no emulador.
- A implementação inicial não recupera automaticamente a sala após recarregar; o jogador pode reentrar com mesmo código e nome para recuperar sua cartela.
- Nenhuma função Blaze precisa ser implantada.

## Para produção segura
Implementar testes de regras com emulador, limites de acesso, limpeza, antiabuso e validação independente antes de disponibilizar amplamente.
