# TelaJunto Bingo — MVP 0.1.0

Primeira versão PWA de bingo de 90 números, com foco em uso individual/local no aparelho.

## O que está incluído
- Sorteio aleatório de 1 a 90 sem repetição.
- Histórico dos números sorteados e indicador de progresso.
- Cartelas de 3 linhas × 9 colunas, com 15 números por cartela e faixas de coluna do bingo de 90 bolas.
- Marcação manual de números nas cartelas.
- Persistência local da partida, cartelas e marcações via `localStorage`.
- Narração experimental com Web Speech API em português quando houver voz compatível no navegador.
- Service Worker e manifesto PWA para cache do app shell.

## Limitações conhecidas desta versão
- Ainda não há multiplayer entre aparelhos, QR pairing, WebRTC ou receptor de TV.
- O espelhamento para TV é manual, por recurso nativo do aparelho.
- A narração usa a voz oferecida pelo sistema/navegador; voz offline não é garantida. Não há pacote MP3 nesta versão.
- A validação de cartelas é estrutural; não implementa regras de premiação ou conferência de linha/cartela cheia.
- O armazenamento é local ao navegador/dispositivo; limpar os dados do navegador pode apagar partidas.
- É necessário abrir por HTTPS (por exemplo, GitHub Pages) para instalar e usar o Service Worker. O primeiro carregamento precisa de internet.

## Publicar com GitHub Pages
1. Envie os arquivos e pastas deste pacote para a raiz do repositório.
2. No GitHub, abra **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch `main` e a pasta `/(root)`, depois salve.
5. Aguarde a publicação e abra o endereço `https://serviaapps.github.io/telajunto-bingo/`.

## Teste recomendado
1. Abra o endereço no Android usando Chrome.
2. Faça o primeiro carregamento com internet.
3. Instale pelo menu do navegador, se a opção estiver disponível.
4. Abra o app, sorteie alguns números, marque uma cartela e feche/reabra.
5. Ative modo avião e valide a abertura e as funções locais.
6. Teste a narração após tocar em **Testar narração**. A voz offline depende do Android/navegador.
