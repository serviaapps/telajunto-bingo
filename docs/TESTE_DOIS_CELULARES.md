# Homologação V1.1 em dois celulares — somente emuladores

**Não é um teste de produção.** Não publicar regras, não executar deploy e não usar o Firebase real. Branch: `feat/v1-1-multiplayer-foundation`.

## Requisitos
- Um computador com Node.js 22+, Java 21+ e Firebase CLI 14, na mesma rede Wi-Fi dos dois celulares Android.
- Firewall permitindo conexões locais TCP 8000, 9000 e 9099 somente na rede de confiança; nunca abrir essas portas na internet.
- Dois celulares com navegadores diferentes/perfis separados. Não use o mesmo perfil sincronizado para ambos.

## Preparação no computador
1. Baixe a branch de desenvolvimento, sem fazer merge em `main`.
2. No terminal da pasta do projeto, instale Firebase CLI: `npm install --no-save firebase-tools@14` (ou use `npx firebase-tools@14`).
3. Inicie o emulador: `npx firebase emulators:start --config firebase.homolog.json --project demo-telajunto-rules --only auth,database`.
4. Em outro terminal, execute `python -m http.server 8000 --bind 0.0.0.0` (Python 3).
5. Descubra o IP local do computador (exemplo ilustrativo: `192.168.1.50`). Não use IP público.
6. Abra nos celulares `http://IP-DO-COMPUTADOR:8000/multiplayer-homolog.html`. Para TV, `http://IP-DO-COMPUTADOR:8000/tv-homolog.html`.

## Teste
1. Celular A: digite nome e clique em **Criar sala**. Anote o código.
2. Celular B: digite outro nome, código e clique em **Entrar na sala**.
3. A sorteia uma bola; B verifica atualização e marca/desmarca números manualmente.
4. Opcional: TV acessa o painel de homologação e vê apenas sorteios, sem cartelas.
5. Recarregue B e valide comportamento de sessão; anote qualquer erro ou perda de cartela.
6. Desligue o emulador ao terminar. Dados locais são descartáveis; não contêm dados reais.

## Segurança e limitações
- Use exclusivamente Wi-Fi de confiança; a conexão HTTP e os emuladores na rede local **não são adequados para internet pública**.
- Não use o link de produção nem `multiplayer.html` ou `tv.html` para homologação: esses arquivos mantêm a configuração do Firebase real.
- Os arquivos `*-homolog.html` usam scripts separados que apontam para o projeto `demo-telajunto-rules`.
- A página só funciona quando o emulador local estiver ligado. GitHub Actions não disponibiliza o emulador aos celulares.
- Se o navegador bloquear autenticação em origem HTTP de IP local, use uma origem segura/localhost via túnel LAN confiável e reavalie o procedimento antes de alterar a configuração.
