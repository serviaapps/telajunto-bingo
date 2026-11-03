# Publicação controlada — TelaJunto Bingo V1.1

**Situação:** código de cliente e backend preparado na branch de desenvolvimento; **não implantado** no Firebase e **não publicado** no GitHub Pages. Não anunciar multiplayer funcional antes de testes.

Projeto Firebase: `servia-marca-ai`
Realtime Database: `https://servia-marca-ai-default-rtdb.firebaseio.com`
Região das Functions: `us-central1`

## Pré-requisitos e autorização
- Firebase Authentication anônimo: confirmado pelo responsável.
- Aplicativo Web e domínio `serviaapps.github.io`: confirmados.
- Realtime Database criado: confirmado.
- Cloud Functions pode exigir **Blaze (faturamento)**. **Não ativar nem associar faturamento sem autorização específica.**
- A implantação requer uma sessão Firebase CLI autenticada com permissão de deploy ou integração Firebase conectada.

## Antes de implantar
1. Validar regras de RTDB no Emulator Suite e testar isolamento das cartelas entre UIDs.
2. Testar criação de sala, entrada, sorteio, marcação e reconexão com duas sessões.
3. Auditar limites de sala, concorrência, abuso e expiração; implementar App Check/rate limiting antes de divulgação pública.
4. Executar `node --test tests/bingo-engine.test.mjs`.
5. Na raiz, instalar Firebase CLI em ambiente de desenvolvimento e autenticar com conta autorizada. Executar `firebase use servia-marca-ai` e `firebase emulators:start`.
6. Após testes e aprovação de custos, implantar `firebase deploy --only functions,database`.
7. Integrar e publicar a interface da branch em um ambiente de homologação antes de mesclar à `main`.

**Atenção:** as regras de banco propostas permitem apenas leitura autenticada dos membros e leitura privada do próprio jogador; escrita direta é bloqueada. Somente funções administrativas devem gravar estado oficial.

## Limitações atuais
- Sem App Check, rate limiting completo, limpeza automática de salas e testes de concorrência/emulador.
- Sem implantação de Functions; botões retornarão erro até que o backend seja implantado.
- Sem confirmação de custos/plano Blaze.
- Não foi executado teste ponta a ponta em dois aparelhos.
