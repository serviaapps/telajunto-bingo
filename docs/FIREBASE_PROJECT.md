# TelaJunto V1.1 — projeto Firebase escolhido

Projeto indicado pelo responsável: `servia-marca-ai`.

## Estado real
- O projeto foi identificado pelo usuário e autorizado para uso no TelaJunto.
- A conta Firebase **não está conectada** a esta sessão; nenhum recurso remoto foi criado, apagado ou alterado.
- `.firebaserc` identifica o projeto de destino para implantação futura.
- `database.rules.json` contém **negação total** de leitura/escrita como base segura. **Não implantar isoladamente em banco existente**: a regra bloquearia aplicativos existentes.
- As regras de acesso específicas para salas e cartelas privadas precisam ser desenvolvidas e testadas antes de publicar.

## Próximas ações
1. Confirmar o acesso à conta Google no Firebase Console.
2. Habilitar Authentication > Sign-in method > Anonymous.
3. Criar Realtime Database, com regras restritivas.
4. Implementar Cloud Functions com sorteio e geração de cartelas no servidor.
5. Criar regras para estado público e privado; executar testes de emulador.
6. Registrar app web e configurar os campos públicos do SDK.
7. Implantar e validar com dois celulares.

Não compartilhar conta de serviço, token administrativo ou senha. Implantação de Functions pode requerer plano de faturamento; pedir aprovação antes.
