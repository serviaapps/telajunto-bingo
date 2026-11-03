# Homologação controlada — TelaJunto Bingo V1.1

**Status:** preparação; nenhuma publicação autorizada. Branch `feat/v1-1-multiplayer-foundation`. Preservar `main` (V1 original).

## Evidência automatizada
- GitHub Actions execução #25: https://github.com/serviaapps/telajunto-bingo/actions/runs/41630055006
- Jobs `bingo-engine` e `firebase-rules`: sucesso.
- Esses testes cobrem motor, sintaxe e cenários de regras no emulador; **não** demonstram funcionamento em celulares/TV ou regras publicadas.

## Pré-requisitos para teste real
1. Aprovação expressa do responsável para publicar **somente** as regras revisadas no Firebase de homologação. Não publicar antecipadamente.
2. Preferir um projeto Firebase separado do projeto existente, com Authentication anônimo, RTDB e domínio de homologação autorizado. Não ativar Blaze nem Cloud Functions.
3. Disponibilizar a branch em URL de prévia separada da V1, sem mesclar em `main`.
4. Ter dois navegadores com sessões distintas (idealmente dois celulares) e uma terceira tela para TV. Não compartilhar a mesma sessão/UID entre os participantes.

## Roteiro de aceite manual
| ID | Dispositivo | Ação | Resultado esperado |
|---|---|---|---|
| H01 | Celular A | Abrir prévia e criar sala com nome válido | Código de 6 caracteres e cartela própria |
| H02 | Celular A | Copiar convite e link da TV | URLs apontam para a prévia V1.1, não para V1 |
| J01 | Celular B | Abrir convite e entrar com nome | Sala e cartela 3x9, 15 números |
| J02 | Celular B | Marcar e desmarcar números | Somente ação manual altera marcações |
| J03 | Celular B | Atualizar e entrar novamente | Cartela e marcações recuperadas com mesmo UID |
| J04 | Celular B | Tentar sala inexistente | Mensagem clara; não ingressa |
| T01 | TV/navegador C | Abrir painel TV com código | Mostra sala, último número, histórico, sem cartela |
| S01 | Celular A | Sortear várias bolas | Números 1–90, sem repetição, sincronizados em B e C |
| S02 | Celular B | Confirmar ausência de controle de sorteio | Não pode sortear |
| P01 | Navegador distinto | Tentar ler cartela de outro UID | Acesso negado, conforme testes do emulador |
| E01 | Todos | Testar perda de rede, retorno e expiração | Registrar resultado e eventuais inconsistências |

Registrar para cada cenário: **Passou / Falhou / Não executado**, navegador, data e print se falhar.

## Pendências e riscos antes de homologar
- Não há URL de prévia publicada nem autorização para implantar regras; por isso testes reais estão **não executados**.
- A reconexão não é automática; depende de reentrar na sala e preservar a identidade anônima.
- A tela de TV ingressa como membro com papel `player`, embora não tenha cartela. Diferenciar papel de exibição em revisão futura.
- Não existe árbitro independente nem garantia criptográfica de sorteio/cartela; uso recreativo, sem apostas ou prêmios.
- Falta ensaio de concorrência (dois sorteios simultâneos), controle de abuso, expiração e limpeza de salas.
- Regras no emulador passaram em cenários específicos, não equivalem a auditoria integral de segurança.
- Não publicar a V1.1 ao público nem alterar `main` sem aceite dos testes e autorização.

## Critérios para concluir homologação
Todos os cenários críticos H01, J01, J02, J03, T01, S01, S02 e P01 aprovados; erros documentados; autorização explícita para qualquer publicação.