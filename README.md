# SuperFácil — LOTOF-CIL-APP

Aplicativo **independente** de análise descritiva dos resultados da Lotofácil. Não realiza apostas, não é serviço oficial da CAIXA e não promete maior probabilidade de acerto.

## Interface aprovada
- Cabeçalho superior roxo com logotipo SuperFácil, trevo e links para **Início**, **Jogar**, **Análise** e **Análise de resultados**.
- Botão **Menu** no canto superior para acessar as demais páginas.
- Página inicial responsiva com banner, indicador do último concurso carregado, cartões para gerar jogos/analisar/conferir/salvar e dezenas do último concurso da base.
- Rodapé institucional: **Desenvolvido por Khassio Silva**; **Gerenciado por Insight Marketing e Desenvolvimento**.
- Suporte pelo [WhatsApp (86) 99446-5882](https://wa.me/5586994465882).
- Segurança: informação sobre conexão HTTPS e link externo ao Google Safe Browsing. A marca do Google não indica parceria, certificação ou auditoria de segurança.

## Estratégia e regras
1. O usuário exclui **exatamente 5 dezenas** entre 01 e 25.
2. O gerador utiliza apenas as **20 dezenas restantes**, com 15 dezenas distintas por jogo.
3. Há **15.504 combinações matematicamente possíveis** a partir dessas 20 dezenas.
4. Análises contemplam pares/ímpares, repetidas, frequências e padrões históricos, calculados com concursos registrados.
5. Resultados não têm poder preditivo demonstrado: em sorteios justos, cada aposta simples possui a mesma chance de acertar 15 dezenas (**1 em 3.268.760**).
6. Jogos salvos podem ser comparados com concursos registrados pela tela **Análise de resultados**. Conferência de jogos não comprova aposta efetivamente realizada ou pagamento de prêmio.

## Histórico e Supabase
- Planilha principal: `Base20_Resultados_Lotofacil.xlsx`.
- Em uma importação previamente confirmada no ambiente de desenvolvimento, **600 registros consecutivos** foram gravados no banco do Supabase, entre os concursos **3213 e 3812**.
- A janela de análise usa **os 599 concursos mais recentes disponíveis**; o registro 3213 estava reservado como anterior de comparação. Esse é o **último estado confirmado da carga histórica**, não a alegação de que a base permanece atualizada até o concurso de hoje.
- A consulta do aplicativo ordena os registros por número de concurso decrescente, limitados a 599. A rotina de busca e importação automática de novos resultados oficiais **ainda precisa ser implementada e validada**. Não registrar resultados futuros ou fictícios.
- O Supabase vinculado ao desenvolvimento Lovable e um clone implantado a partir do GitHub podem exigir configuração de ambiente e permissões próprias. O GitHub não sincroniza automaticamente a implantação do Lovable.
- A chave privada do Supabase e outros segredos **não devem ser incluídos no repositório**.

## Desenvolvimento
Stack: TypeScript, React, TanStack Start, Tailwind e Supabase. Para instalar e executar localmente:

```bash
bun install --frozen-lockfile
cp .env.example .env
bun run dev
```

Configurar no `.env` apenas as variáveis públicas exigidas pelo projeto; segredos devem permanecer exclusivamente no ambiente de execução. O fluxo `.github/workflows/verificar-web.yml` confere os testes, o build e os tipos.

## Android e publicação
- Aplicativo Android (WebView) e fluxo de compilação em `android/` e `.github/workflows/android-apk.yml`.
- O APK de teste usa `https://superfacil-estrategia.lovable.app/`. Alterar o código GitHub não modifica esse domínio automaticamente.
- Link de download das versões Android de teste: https://github.com/khassiooluver1988-droid/LOTOF-CIL-APP/releases
- O APK de testes é assinado para depuração e necessita de conexão à internet. Antes de distribuir comercialmente, validar em aparelho real e assinar com certificado persistente.

## Status da validação
O workflow **Validar SuperFácil Web** concluiu com sucesso no commit `1ec09850977684384d83a3f442f8ef06bdb0a291`, cobrindo testes, compilação e verificação TypeScript. Isso **não equivale** a auditoria de segurança nem a testes completos em aparelhos Android.

Repositório: https://github.com/khassiooluver1988-droid/LOTOF-CIL-APP


## SuperFácil 2.0 (26/10/2026)
- Identidade vetorial recriada em `public/logo-superfacil.svg`, com fundo transparente. **Arte vetorizada aproximada, não cópia pixel a pixel da imagem enviada**.
- Quatro banners SVG editáveis/sem imagens de concursos fictícios: estratégias, prêmio estimado, jogo responsável, resultado anterior.
- Carrossel navegável; informações do próximo concurso e premiação só são exibidas quando presentes na base `informacoes_concursos`.
- Aviso inicial de maioridade 18+ por sessão; confirmação declaratória, não sistema de verificação de identidade.
- Nova geração exige exclusão de **2 pares e 3 ímpares**, apresentando os 10 pares e 10 ímpares restantes.
- Modos manual e automático; 3, 4, 6, 8 ou 10 jogos; cópia para preenchimento do volante.
- Preço de referência (CAIXA, 26/10/2026): **R$ 3,50 por jogo simples de 15 dezenas**; tabela e custo total dinâmicos em `configuracoes_app` quando acessível.
- Critério automático ordena combinações segundo histogramas históricos de pares/ímpares e repetidas, sem afirmar aumento de chance matemática.
- `public/version.json` identifica a versão web, e o app pode sugerir recarregar quando detectar nova publicação no mesmo domínio. O APK **não** é atualizado por esse aviso: exige assinatura/versionCode consistentes, publicação do novo APK e instalação pelo usuário.
- Avisos de segurança: HTTPS é propriedade da conexão e consulta ao Google Safe Browsing **não significa certificação, parceria nem 100% de proteção**.
- Ainda não existe sincronização automática GitHub → Lovable. Publicação do APK permanece separada do código web.

