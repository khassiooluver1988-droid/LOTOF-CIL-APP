CREATE TABLE public.concursos (
  id bigserial PRIMARY KEY,
  numero integer NOT NULL UNIQUE,
  data date NOT NULL,
  dezenas integer[] NOT NULL,
  origem text NOT NULL DEFAULT 'planilha',
  importado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dezenas_15 CHECK (array_length(dezenas,1) = 15 AND 1 <= ALL(dezenas) AND 25 >= ALL(dezenas))
);
GRANT SELECT ON public.concursos TO anon, authenticated;
GRANT ALL ON public.concursos TO service_role;
ALTER TABLE public.concursos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Concursos públicos para leitura" ON public.concursos FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.importacoes (
  id bigserial PRIMARY KEY,
  status text NOT NULL,
  linhas integer NOT NULL DEFAULT 0,
  data timestamptz NOT NULL DEFAULT now(),
  arquivo text
);
GRANT SELECT ON public.importacoes TO anon, authenticated;
GRANT ALL ON public.importacoes TO service_role;
ALTER TABLE public.importacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Importações públicas para leitura" ON public.importacoes FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.jogos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario uuid NOT NULL,
  exclusoes integer[] NOT NULL,
  dezenas integer[] NOT NULL,
  concurso_referencia integer,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exclusoes_5 CHECK (array_length(exclusoes,1) = 5),
  CONSTRAINT jogo_15 CHECK (array_length(dezenas,1) = 15 AND 1 <= ALL(dezenas) AND 25 >= ALL(dezenas)),
  CONSTRAINT sem_excluidas CHECK (NOT (dezenas && exclusoes))
);
GRANT SELECT, INSERT, DELETE ON public.jogos TO authenticated;
GRANT ALL ON public.jogos TO service_role;
ALTER TABLE public.jogos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver próprios jogos" ON public.jogos FOR SELECT TO authenticated USING (auth.uid() = usuario);
CREATE POLICY "Criar próprios jogos" ON public.jogos FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario);
CREATE POLICY "Apagar próprios jogos" ON public.jogos FOR DELETE TO authenticated USING (auth.uid() = usuario);