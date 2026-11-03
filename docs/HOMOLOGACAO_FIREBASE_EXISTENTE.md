# Homologação isolada no projeto Firebase existente — sem publicação

**Projeto de referência:** `servia-marca-ai`. **Branch:** `feat/v1-1-multiplayer-foundation`. **Status:** somente preparação. Não executar deploy, não alterar regras, dados ou plano de faturamento.

## Limite fundamental do isolamento
O Firebase Realtime Database aplica as regras ao banco inteiro. Um prefixo de dados (`/homologacao`, `/rooms-test`) **não isola as regras globais**. Publicar `database.rules.json` no banco atual substituiria o conjunto de regras existente. Não fazer isso nesta fase.

## Estratégia segura escolhida
- Preservar a configuração pública de referência do projeto existente, sem usar credenciais administrativas.
- Usar **Firebase Local Emulator Suite** com project ID `demo-telajunto-rules` para Auth/RTDB; o emulador não grava no banco real.
- Manter o site original `main` e GitHub Pages inalterados.
- Preparar a prévia da branch **sem implantação automática**. A prévia não deve ser confundida com um multiplayer funcional no Firebase real.
- Para um futuro teste conectado no mesmo projeto, avaliar uma **instância separada de RTDB** (se disponível no plano/região) e regras próprias, ou solicitar autorização para alteração global das regras após backup e auditoria. **Não criar instância nem publicar regras sem autorização**.

## Riscos e controles
| Risco | Controle |
|---|---|
| Substituir regras do banco existente | Nenhum deploy de regras; emulador apenas |
| Alterar dados reais | Não executar scripts com escrita no banco real; usar demo project |
| Custos/Blaze | Não ativar faturamento, Functions ou serviços adicionais |
| V1 ficar indisponível | Não alterar `main`, site atual ou configuração de Pages |
| Vazamento entre jogadores | Testar leituras cruzadas e papéis no emulador |
| Prévia conectar ao banco real por engano | Não publicar cliente de homologação com configuração real sem autorização |
| Sessões anônimas compartilhadas | Testar com navegadores/perfis separados |
| Uso recreativo | Sem sorteio autoritativo, prêmios ou apostas |

## Roteiro no celular Android — somente leitura
1. Abra https://github.com/serviaapps/telajunto-bingo/actions/runs/41630055006 para ver os testes aprovados.
2. Abra a branch `feat/v1-1-multiplayer-foundation` no GitHub e o arquivo `docs/HOMOLOGACAO_V1_1.md`.
3. **Não** toque em `Executar novamente`, `Merge`, `Publish` ou `Deploy`.
4. Para testar em celulares reais, aguarde a criação de uma prévia conectada ao emulador/ambiente explicitamente autorizado. O emulador local do GitHub Actions não é acessível pelos celulares.
5. Quando houver URL segura e regras autorizadas, usar celular A como anfitrião, B como convidado (sessão distinta) e navegador C como TV, conforme roteiro.

## Pendências de autorização futura
1. Decidir o destino de dados isolado no projeto existente: segunda instância RTDB se disponível, ou alteração cuidadosamente revisada das regras do banco atual.
2. Confirmar plano, região, capacidade e compatibilidade com Spark sem ativar cobrança.
3. Autorizar explicitamente publicação de regras **para o destino identificado**, somente após revisão e testes.
4. Aprovar URL de prévia e execução de testes reais.
