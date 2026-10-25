import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Eraser, Sparkles, Save, Download } from "lucide-react";
import { AvisoResponsavel, Bola, Page } from "@/components/app/ui";
import { baseQuery } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { salvarLocais, salvarNuvem } from "@/lib/jogos-store";
import {
  DEZENAS, MAX_PADRAO, QTD_EXCLUSOES, TOTAL_COMBINACOES, fmt, fmtNum, gerarJogos, paridade, repetidas, restantes,
} from "@/lib/lotofacil";

export const Route = createFileRoute("/jogar")({
  head: () => ({
    meta: [
      { title: "Jogar — SuperFácil" },
      { name: "description", content: "Selecione 5 dezenas excluídas e gere jogos válidos de 15 dezenas." },
      { property: "og:title", content: "Jogar — SuperFácil" },
      { property: "og:description", content: "Exclua 5 dezenas e gere jogos distintos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Jogar,
});

function Jogar() {
  const [exclusoes, setExclusoes] = useState<number[]>([]);
  const [qtd, setQtd] = useState(10);
  const [todas, setTodas] = useState(false);
  const [jogos, setJogos] = useState<number[][] | null>(null);
  const [salvando, setSalvando] = useState(false);
  const { data: base } = useQuery(baseQuery);
  const { user } = useAuth();

  const ok = exclusoes.length === QTD_EXCLUSOES;
  const pool = useMemo(() => restantes(exclusoes), [exclusoes]);
  const ultimo = base?.modo === "ok" ? base.concursos[0] : null;

  const toggle = (d: number) => {
    setJogos(null);
    setExclusoes((s) => (s.includes(d) ? s.filter((x) => x !== d) : s.length >= QTD_EXCLUSOES ? s : [...s, d].sort((a, b) => a - b)));
  };

  const gerar = () => {
    if (!ok) return;
    const n = todas ? TOTAL_COMBINACOES : Math.max(1, Math.min(MAX_PADRAO, qtd || 1));
    setJogos(gerarJogos(exclusoes, n));
  };

  const salvar = async () => {
    if (!jogos) return;
    const itens = jogos.map((d) => ({ exclusoes, dezenas: d, concurso_referencia: ultimo?.numero ?? null }));
    setSalvando(true);
    try {
      if (base?.modo === "demo") {
        salvarLocais(itens);
        toast.success(`${fmtNum(itens.length)} jogos salvos neste aparelho (modo demonstração).`);
      } else if (user) {
        await salvarNuvem(user.id, itens);
        toast.success(`${fmtNum(itens.length)} jogos salvos na sua conta.`);
      }
    } catch (e) {
      toast.error("Não foi possível salvar: " + (e instanceof Error ? e.message : ""));
    } finally {
      setSalvando(false);
    }
  };

  const baixarCSV = () => {
    if (!jogos) return;
    const linhas = ["jogo;dezenas;pares;impares", ...jogos.map((j, i) => { const p = paridade(j); return `${i + 1};${j.map(fmt).join(" ")};${p.pares};${p.impares}`; })];
    const url = URL.createObjectURL(new Blob([linhas.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "superfacil-jogos.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const resumo = useMemo(() => {
    if (!jogos) return null;
    const m = new Map<string, number>();
    for (const j of jogos) { const p = paridade(j); const k = `${p.pares}P/${p.impares}I`; m.set(k, (m.get(k) ?? 0) + 1); }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [jogos]);

  return (
    <Page title="Jogar" subtitle="Toque em exatamente 5 dezenas para EXCLUIR do jogo.">
      <section className="card-premium p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className={`font-display text-lg font-bold ${ok ? "text-primary" : ""}`} aria-live="polite">{exclusoes.length}/{QTD_EXCLUSOES} excluídas</span>
          <button onClick={() => { setExclusoes([]); setJogos(null); }} disabled={!exclusoes.length} className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-40">
            <Eraser className="h-3.5 w-3.5" /> Limpar seleção
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {DEZENAS.map((d) => {
            const sel = exclusoes.includes(d);
            const bloq = !sel && ok;
            return (
              <button key={d} onClick={() => toggle(d)} disabled={bloq} aria-pressed={sel} aria-label={`Dezena ${fmt(d)}${sel ? " excluída" : ""}`}
                className={`aspect-square rounded-2xl font-display text-lg font-bold transition-all active:scale-95 ${sel ? "bg-destructive text-destructive-foreground shadow-lg ring-2 ring-destructive/50" : "bg-secondary text-foreground hover:bg-accent"} ${bloq ? "opacity-40" : ""}`}>
                {fmt(d)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card-premium mt-4 p-4">
        <h2 className="text-sm font-bold">{pool.length} dezenas restantes</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">{pool.map((d) => <Bola key={d} n={d} tom={ok ? "lime" : "ghost"} />)}</div>
      </section>

      <section className="card-premium mt-4 space-y-3 p-4">
        <label className="flex items-center justify-between gap-3 text-sm font-semibold">
          Quantidade de jogos (1 a {MAX_PADRAO})
          <input type="number" min={1} max={MAX_PADRAO} value={qtd} disabled={todas}
            onChange={(e) => setQtd(Math.max(1, Math.min(MAX_PADRAO, Number(e.target.value) || 1)))}
            className="w-20 rounded-xl border bg-input/30 px-3 py-2 text-center font-bold disabled:opacity-40" />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={todas} onChange={(e) => setTodas(e.target.checked)} className="h-4 w-4 accent-primary" />
          Gerar todas as {fmtNum(TOTAL_COMBINACOES)} combinações possíveis
        </label>
        <button onClick={gerar} disabled={!ok} className="bg-lime-gradient shadow-glow flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-primary-foreground disabled:opacity-40 disabled:shadow-none">
          <Sparkles className="h-5 w-5" /> Analisar e gerar jogos
        </button>
        {!ok && <p className="text-center text-xs text-muted-foreground">Selecione exatamente 5 dezenas para continuar (faltam {QTD_EXCLUSOES - exclusoes.length}).</p>}
      </section>

      {jogos && (
        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xl font-bold">{fmtNum(jogos.length)} jogos gerados</h2>
            <span className="text-xs text-muted-foreground">de {fmtNum(TOTAL_COMBINACOES)} possíveis</span>
          </div>
          <div className="card-premium mb-3 p-4 text-sm">
            <p className="font-semibold">Paridade dos jogos gerados (contagem real):</p>
            <div className="mt-2 flex flex-wrap gap-2">{resumo!.map(([k, v]) => <span key={k} className="rounded-full bg-muted px-3 py-1 text-xs font-bold">{k}: {fmtNum(v)}</span>)}</div>
            {ultimo ? <p className="mt-2 text-xs text-muted-foreground">R = repetidas do concurso {ultimo.numero}.</p> : <p className="mt-2 text-xs text-muted-foreground">Repetidas indisponíveis: base ainda não sincronizada.</p>}
          </div>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {base?.modo === "demo" || user ? (
              <button onClick={salvar} disabled={salvando} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"><Save className="h-4 w-4" />{salvando ? "Salvando…" : "Salvar jogos"}</button>
            ) : (
              <Link to="/entrar" className="flex items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground">Entrar para salvar</Link>
            )}
            <button onClick={baixarCSV} className="flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold"><Download className="h-4 w-4" />Baixar CSV</button>
          </div>
          <ol className="space-y-2">
            {jogos.slice(0, 100).map((j, i) => {
              const p = paridade(j); const r = repetidas(j, ultimo?.dezenas);
              return (
                <li key={j.join("-")} className="card-premium p-3">
                  <div className="mb-2 flex justify-between text-xs font-semibold text-muted-foreground">
                    <span>Jogo {i + 1}</span>
                    <span>{p.pares}P / {p.impares}I{r !== null && ` / ${r}R`}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">{j.map((d) => <Bola key={d} n={d} tom={ultimo?.dezenas.includes(d) ? "lime" : "base"} />)}</div>
                </li>
              );
            })}
          </ol>
          {jogos.length > 100 && <p className="mt-3 text-center text-xs text-muted-foreground">Exibindo 100 de {fmtNum(jogos.length)}. Baixe o CSV para ver todos.</p>}
        </section>
      )}
      <AvisoResponsavel />
    </Page>
  );
}