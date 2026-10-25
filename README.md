# SuperFácil — LOTOF-CIL-APP

Aplicativo de análise **descritiva** da Lotofácil (independente da CAIXA). Projeto versionado em `khassiooluver1988-droid/LOTOF-CIL-APP`.

## Funcionalidades
- Seleção de **exatamente cinco dezenas a excluir** entre 01 e 25.
- Jogos de 15 dezenas usando apenas as 20 restantes, sem repetições de jogos; até **15.504** combinações distintas.
- Análise de frequências, pares/ímpares, repetidas e padrões combinados **somente com resultados reais**.
- Janela móvel dos **599 concursos válidos mais recentes** (meta), sem incluir concursos ainda não realizados.
- Conta por e-mail, jogos salvos, exportação CSV, navegação adaptada ao celular e recomendações de jogo responsável.

## Estado da base
O banco PostgreSQL/Supabase do projeto de desenvolvimento está provisionado com as tabelas `concursos`, `importacoes` e `jogos`, protegidas por RLS. Ainda é necessário **importar os resultados**. A planilha mestre `Base20_Resultados_Lotofacil.xlsx` contém 100 resultados de referência; não declarar cobertura de 599 até validar todos os registros. O aplicativo sinaliza a ausência de base em vez de fabricar estatísticas.

## Desenvolvimento local
Requer Node.js 22+ e Bun opcional:

```bash
npm install
cp .env.example .env
npm run dev
npm run test
npm run build
```

Preencha a URL do Supabase e a **chave pública** no `.env`. Nunca faça commit de arquivos com chaves privadas, segredos ou `service_role`. Para hospedar fora do Lovable, verifique a compatibilidade do runtime TanStack Start SSR.

## Arquitetura
React 19 / TypeScript / TanStack Start / Tailwind / Supabase. No repositório: `src/routes` (telas), `src/lib/lotofacil.ts` (motor matemático), `src/lib/data.ts` (consulta de concursos), `src/lib/jogos-store.ts` (armazenamento), `drizzle/migrations` (banco de dados).

A marca emprega texto Super acima de Fácil com trevo verde. O ícone SVG incluído é um substituto vetorial da arte de referência, pois a exportação automática de binários não estava disponível. Não existe qualquer vantagem matemática garantida: todos os jogos simples de 15 dezenas têm a mesma chance em sorteios justos.

## Limitações conhecidas
- A rotina de importação automática dos 599 concursos e sincronização da planilha ainda precisa ser implementada.
- A exportação do código para o GitHub não constitui ligação bidirecional automática com o editor Lovable.
- O aplicativo não é um sistema oficial de apostas. Verificar compilação, segurança e navegação antes da distribuição.

Projeto SuperFácil. Repositório: https://github.com/khassiooluver1988-droid/LOTOF-CIL-APP
