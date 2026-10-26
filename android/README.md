# Instalador SuperFácil para Android

APK de testes (WebView) que abre o aplicativo publicado em:
https://khassiooluver1988-droid.github.io/LOTOF-CIL-APP/app.html?versao=2.0.1

- Requer conexão com internet.
- O SuperFácil realiza análises e monta jogos; **não é uma casa de apostas**.
- SDK mínimo Android 7.0 (API 24).
- Para gerar o APK localmente: `gradle -p android :app:assembleDebug`.
- Para instalação: baixar o APK gerado na aba **Releases** deste repositório e permitir instalação de apps de fonte externa ao navegador.
- Este APK de testes é assinado com chave de depuração criada no GitHub Actions, **não é uma versão definitiva para loja**. Atualizações podem exigir desinstalar a versão anterior.
- Para distribuição permanente, assinar com um certificado Android persistente, guardar chaves somente em GitHub Secrets e validar em um aparelho físico.
- A integração com o Supabase está hospedada no app web, não contém segredos no pacote Android.

## Versão 2.0.1-beta

Novo APK WebView abre a demonstração SuperFácil GitHub Pages em vez da versão antiga do Lovable. A demonstração usa 599 concursos históricos e não sincroniza resultados mais recentes automaticamente. O APK precisa ser substituído manualmente para mudança da URL nativa; atualizações web posteriores são carregadas ao reabrir o aplicativo. A assinatura debug do runner pode mudar entre versões, exigindo desinstalação do APK de testes anterior.
