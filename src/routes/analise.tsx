import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AvisoResponsavel, BaseStatus, Bola, Page } from "@/components/app/ui";
import { baseQuery } from "@/lib/data";
import { type Concurso, TOTAL_LOTOFACIL, distribuicaoPIR, distribuicaoParidade, distribuicaoRepetidas, fmtNum, paridade, rankingFrequencia, repetidas } from "@/lib/lotofacil";

export const Route = createFileRoute("/analise")({
  head: () => ({
    meta: [
      { title: "Análise — SuperFácil" },
      { name: "description", content: "Paridade, repetidas e frequências contadas nos concursos reais importados." },
      { property: "og:title", content: "Análise — SuperFácil" },
      { property: "og:description", content: "Estatísticas reais da Lotofácil, sem previsões." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Analise,
});

function Barra({ label, v, max, total }: { label: string; v: number; max: number; total: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0 font-semibold">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted"><div className="bg-lime-gradient h-full rounded-full" style={{ width: `${(v / max) * 100}%` }} /></div>
      <span className="w-24 shrink-0 text-right tabular-nums text-muted-foreground">{v} ({((v / total) * 100).toFixed(1)}%)</span>
    </div>
  );
}

function Analise() {
  const { data } = useQuery(baseQuery);
  const c = data?.modo === "ok" ? data.concursos : [];

  return (
    <Page title="Análise" subtitle="Contagens feitas sobre os concursos reais importados (janela dos 599 mais recentes).">
      <BaseStatus />
      {c.length === 0 ? (
        <div className="card-premium mt-4 p-5 text-sm text-muted-foreground">
          Sem concursos reais carregados, nenhuma estatística histórica é exibida. Você ainda pode <Link to="/jogar" className="font-semibold text-primary underline">gerar jogos</Link> combinatórios.
        </div>
      ) : <Conteudo c={c} />}
      <div className="card-premium mt-4 p-4 text-sm">
        <h2 className="font-bold">Probabilidade matemática</h2>
        <p className="mt-1 text-muted-foreground">Cada jogo simples de 15 dezenas tem chance de 1 em {fmtNum(TOTAL_LOTOFACIL)} de 15 acertos, independentemente de paridade, repetidas ou frequência. Padrões passados não alteram sorteios futuros.</p>
      </div>
      <AvisoResponsavel />
    </Page>
  );
}

function Conteudo({ c }: { c: Concurso[] }) {
  const ultimo = c[0]!;
  const anterior = c.find((x) => x.numero === ultimo.numero - 1);
  const pUlt = paridade(ultimo.dezenas);
  const rUlt = repetidas(ultimo.dezenas, anterior?.dezenas);
  const par = distribuicaoParidade(c);
  const rep = distribuicaoRepetidas(c);
  const pir = distribuicaoPIR(c).slice(0, 10);
  const freq = rankingFrequencia(c);
  const totalRep = rep.reduce((s, x) => s + x.vezes, 0);
  const totalPir = distribuicaoPIR(c).reduce((s, x) => s + x.vezes, 0);

  return (
    <div className="mt-4 space-y-4">
      <section className="card-premium p-4">
        <h2 className="font-bold">Último concurso: {ultimo.numero}</h2>
        <p className="text-xs text-muted-foreground">{new Date(ultimo.data + "T12:00").toLocaleDateString("pt-BR")} · {pUlt.pares}P/{pUlt.impares}I{rUlt !== null ? ` · ${rUlt} repetidas do ${ultimo.numero - 1}` : " · concurso anterior não está na base"}</p>
        <div className="mt-3 flex flex-wrap gap-1">{[...ultimo.dezenas].sort((a, b) => a - b).map((d) => <Bola key={d} n={d} tom="lime" />)}</div>
      </section>

      <section className="card-premium space-y-2 p-4">
        <h2 className="font-bold">Pares / ímpares ({c.length} concursos)</h2>
        {par.map((x) => <Barra key={x.padrao} label={x.padrao} v={x.vezes} max={par[0]!.vezes} total={c.length} />)}
      </section>

      <section className="card-premium space-y-2 p-4">
        <h2 className="font-bold">Repetidas do concurso anterior</h2>
        {totalRep === 0 ? <p className="text-xs text-muted-foreground">Sem pares de concursos consecutivos na base.</p> :
          rep.map((x) => <Barra key={x.rep} label={`${x.rep} repet.`} v={x.vezes} max={Math.max(...rep.map((r) => r.vezes))} total={totalRep} />)}
        <p className="text-[11px] text-muted-foreground">Base: {totalRep} transições entre concursos consecutivos.</p>
      </section>

      {totalPir > 0 && (
        <section className="card-premium p-4">
          <h2 className="font-bold">Top combinações P/I/R</h2>
          <table className="mt-2 w-full text-sm"><tbody>
            {pir.map((x) => <tr key={x.padrao} className="border-b last:border-0"><td className="py-1.5 font-semibold">{x.padrao}</td><td className="text-right tabular-nums text-muted-foreground">{x.vezes} de {totalPir}</td></tr>)}
          </tbody></table>
        </section>
      )}

      <section className="card-premium p-4">
        <h2 className="font-bold">Ranking de frequência</h2>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {freq.map((f, i) => (
            <div key={f.dezena} className="flex flex-col items-center rounded-xl bg-muted/60 py-2">
              <span className="text-[10px] text-muted-foreground">{i + 1}º</span>
              <Bola n={f.dezena} tom={i < 5 ? "lime" : "base"} />
              <span className="mt-1 text-[10px] tabular-nums">{f.vezes}x</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}