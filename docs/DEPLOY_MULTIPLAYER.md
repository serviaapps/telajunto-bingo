# Implantação controlada — TelaJunto Bingo V1.1 (Spark)

**Não implantado.** A V1 original em `main` deve permanecer intacta. Não publicar regras sem autorização expressa.

A implementação atual usa **Firebase Authentication anônimo + Realtime Database + GitHub Pages**, sem Cloud Functions e sem exigência de Blaze para o fluxo básico. O guia antigo desta página, que mencionava Functions, foi substituído por estar desatualizado.

## Evidência atual
- Execução GitHub Actions #25 aprovada: https://github.com/serviaapps/telajunto-bingo/actions/runs/41630055006
- Os testes do emulador não substituem a homologação com navegadores reais.

## Preparação sem publicação
1. Consultar `docs/HOMOLOGACAO_V1_1.md` e registrar os cenários de aceite.
2. Preferir um projeto Firebase **separado** para homologação, evitando alterações no banco da V1 ou de outros projetos.
3. Confirmar que o Firebase de homologação tem Authentication anônimo, RTDB e domínio autorizado; configurar `firebase-config.js` **somente na prévia**.
4. Preparar uma URL de prévia da branch, sem mesclar em `main` e sem substituir a página original.
5. Antes de publicar regras em qualquer ambiente, solicitar autorização explícita do responsável e revisar o projeto/destino.
6. Depois da autorização e da publicação controlada, testar dois celulares com sessões distintas e uma TV conforme o roteiro.
7. Não liberar ao público antes do aceite formal.

## Restrições
- Sem Cloud Functions, Blaze ou cobrança ativada por este procedimento.
- Não executar `firebase deploy --only functions,database`: não corresponde à arquitetura Spark atual.
- Não há garantia de sorteio justo, validação autoritativa de Bingo, limpeza automática ou proteção completa contra abuso.
- A V1.1 é recreativa, sem apostas ou prêmios.
