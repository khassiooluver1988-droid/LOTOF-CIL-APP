# Instalador SuperFácil para Android

APK de testes (WebView) que abre o aplicativo publicado em:
https://superfacil-estrategia.lovable.app/

- Requer conexão com internet.
- O SuperFácil realiza análises e monta jogos; **não é uma casa de apostas**.
- SDK mínimo Android 7.0 (API 24).
- Para gerar o APK localmente: `gradle -p android :app:assembleDebug`.
- Para instalação: baixar o APK gerado na aba **Releases** deste repositório e permitir instalação de apps de fonte externa ao navegador.
- Este APK de testes é assinado com chave de depuração criada no GitHub Actions, **não é uma versão definitiva para loja**. Atualizações podem exigir desinstalar a versão anterior.
- Para distribuição permanente, assinar com um certificado Android persistente, guardar chaves somente em GitHub Secrets e validar em um aparelho físico.
- A integração com o Supabase está hospedada no app web, não contém segredos no pacote Android.
