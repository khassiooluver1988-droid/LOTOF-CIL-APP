import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JANELA_CONCURSOS, type Concurso } from "./lotofacil";

export type EstadoBase =
  | { modo: "demo"; erro: string; concursos: Concurso[]; importacao: null }
  | { modo: "vazia"; concursos: Concurso[]; importacao: Importacao | null }
  | { modo: "ok"; concursos: Concurso[]; importacao: Importacao | null };

export type Importacao = { status: string; linhas: number; data: string };

export const baseQuery = queryOptions({
  queryKey: ["base-concursos"],
  staleTime: 60_000,
  queryFn: async (): Promise<EstadoBase> => {
    try {
      // Janela móvel: os 599 concursos mais recentes efetivamente carregados.
      const { data, error } = await supabase
        .from("concursos")
        .select("numero,data,dezenas")
        .order("numero", { ascending: false })
        .limit(JANELA_CONCURSOS);
      if (error) throw error;
      const { data: imp } = await supabase
        .from("importacoes")
        .select("status,linhas,data")
        .order("data", { ascending: false })
        .limit(1);
      const concursos = (data ?? []) as Concurso[];
      const importacao = (imp?.[0] as Importacao) ?? null;
      return concursos.length ? { modo: "ok", concursos, importacao } : { modo: "vazia", concursos, importacao };
    } catch (e) {
      return { modo: "demo", erro: e instanceof Error ? e.message : "Backend indisponível", concursos: [], importacao: null };
    }
  },
});