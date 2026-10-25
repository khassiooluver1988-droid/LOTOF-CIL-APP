import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AvisoResponsavel, Bola, Page } from "@/components/app/ui";
import { baseQuery } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { apagarLocal, apagarNuvem, lerLocais, listarNuvem, type JogoSalvo } from "@/lib/jogos-store";
import { fmt, paridade, repetidas } from "@/lib/lotofacil";

export const Route = createFileRoute("/meus-jogos")({
  head: () => ({
    meta: [
      { title: "Meus jogos — SuperFácil" },
      { name: "description", content: "Seus jogos salvos da Lotofácil com paridade e repetidas." },
      { property: "og:title", content: "Meus jogos — SuperFácil" },
      { property: "og:description", content: "Jogos salvos no SuperFácil." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MeusJogos,
});

function MeusJogos() {
  const { data: base } = useQuery(baseQuery);
  const { user, carregando } = useAuth();
  const qc = useQueryClient();
  const demo = base?.modo === "demo";
  const [locais, setLocais] = useState<JogoSalvo[]>([]);
  useEffect(() => { if (demo) setLocais(lerLocais()); }, [demo]);
  const nuvem = useQuery({ queryKey: ["jogos", user?.id], queryFn: listarNuvem, enabled: !!user && !demo });
  const ultimo = base?.modo === "ok" ? base.concursos[0] : null;
  const porNumero = new Map((base?.concursos ?? []).map((c) => [c.numero, c.dezenas]));

  const apagar = async (j: JogoSalvo) => {
    try {
      if (j.local) { apagarLocal(j.id); setLocais(lerLocais()); }
      else { await apagarNuvem(j.id); qc.invalidateQueries({ queryKey: ["jogos"] }); }
      toast.success("Jogo removido.");
    } catch { toast.error("Falha ao remover."); }
  };

  const lista = demo ? locais : nuvem.data ?? [];

  return (
    <Page title="Meus jogos" subtitle={demo ? "Modo demonstração: salvos apenas neste aparelho." : "Jogos salvos na sua conta."}>
      {!demo && !carregando && !user ? (
        <div className="card-premium p-5 text-center text-sm">
          <p className="text-muted-foreground">Entre na sua conta para salvar e ver seus jogos.</p>
          <Link to="/entrar" className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Entrar ou criar conta</Link>
        </div>
      ) : nuvem.isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : lista.length === 0 ? (
        <div className="card-premium p-5 text-center text-sm text-muted-foreground">
          Nenhum jogo salvo. <Link to="/jogar" className="font-semibold text-primary underline">Gerar jogos</Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {lista.map((j) => {
            const p = paridade(j.dezenas);
            const ref = j.concurso_referencia ? porNumero.get(j.concurso_referencia) : undefined;
            const r = repetidas(j.dezenas, ref);
            return (
              <li key={j.id} className="card-premium p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(j.criado_em).toLocaleString("pt-BR")} · Excl.: {j.exclusoes.map(fmt).join(" ")}</span>
                  <button onClick={() => apagar(j)} aria-label="Apagar jogo" className="rounded-full p-1.5 hover:bg-destructive/20"><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
                <div className="flex flex-wrap gap-1">{j.dezenas.map((d) => <Bola key={d} n={d} />)}</div>
                <p className="mt-2 text-xs font-semibold">{p.pares}P / {p.impares}I{r !== null && ` / ${r}R (conc. ${j.concurso_referencia})`}</p>
              </li>
            );
          })}
        </ul>
      )}
      {ultimo && <p className="mt-3 text-xs text-muted-foreground">Último concurso na base: {ultimo.numero}.</p>}
      <AvisoResponsavel />
    </Page>
  );
}