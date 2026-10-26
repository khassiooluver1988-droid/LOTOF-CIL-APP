import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Novas tabelas criadas após a geração inicial dos tipos Supabase. */
const db = supabase as unknown as { from: (table: string) => any };

export type DadosConcurso = {
  numero: number;
  data_proximo_sorteio: string | null;
  premio_estimado: number | null;
  ganhadores_15: number | null;
  premio_15_por_aposta: number | null;
  validado_em: string | null;
};

export const informacoesQuery = queryOptions({
  queryKey: ["informacoes-concursos-publicas"],
  staleTime: 5 * 60_000,
  queryFn: async (): Promise<{ preco: number; precoValidadoEm: string | null; premio: DadosConcurso | null }> => {
    let preco = 3.5;
    let precoValidadoEm: string | null = "2026-10-26";
    let premio: DadosConcurso | null = null;
    try {
      const a = await db.from("configuracoes_app").select("valor").eq("chave", "preco_aposta_simples").maybeSingle();
      if (!a.error && a.data?.valor) {
        const obj = a.data.valor;
        if (typeof obj.valor === "number" && obj.valor > 0) {
          preco = obj.valor;
          precoValidadoEm = typeof obj.consultado_em === "string" ? obj.consultado_em : precoValidadoEm;
        }
      }
    } catch { /* mantém valor de referência consultado na CAIXA */ }
    try {
      const b = await db.from("informacoes_concursos").select("numero,data_proximo_sorteio,premio_estimado,ganhadores_15,premio_15_por_aposta,validado_em")
        .order("numero", { ascending: false }).limit(1).maybeSingle();
      if (!b.error && b.data && typeof b.data.numero === "number") premio = b.data;
    } catch { /* indisponível até sincronização oficial */ }
    return { preco, precoValidadoEm, premio };
  }
});

export function moeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
