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
  DEZENAS, MAX_PADRAO, QTD_EXCLUSOES, TOTAL_COMBINACOES, fmt, fmtNum, gerarJogos, gerarJogosPorPadrao, paridade, repetidas, restantes, distribuicaoParidade, validarExclusoes,
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
  const [modo, setModo] = useState<"sugerida" | "personalizada" | "livre">("sugerida");
  const [paresAlvo, setParesAlvo] = useState(7);
  const { data: base } = useQuery(baseQuery);
  const { user } = useAuth();

  const ok = validarExclusoes(exclusoes);
  const paresExcluidos = paridade(exclusoes).pares;
  const imparesExcluidos = exclusoes.length - paresExcluidos;
  const pool = useMemo(() => restantes(exclusoes), [exclusoes]);
  const concursos = base?.modo === "ok" ? base.concursos : [];
  const ultimo = concursos[0] ?? null;
  const anterior = ultimo ? concursos.find((c) => c.numero === ultimo.numero - 1) : null;
  const padraoSugerido = (concursos.length === 599 ? distribuicaoParidade(concursos) : []).find(({ padrao }) => {
    const pares = Number(padrao.split("P")[0]);
    return pares >= 5 && pares <= 10;
  });
  const paresSugeridos = padraoSugerido ? Number(padraoSugerido.padrao.split("P")[0]) : null;

  const toggle = (d: number) => {
    setJogos(null);
    setExclusoes((s) => {
      if (s.includes(d)) return s.filter((x) => x !== d);
      const pares = paridade(s).pares;
      const impares = s.length - pares;
      if (s.length >= QTD_EXCLUSOES || (d % 2 === 0 ? pares >= 2 : impares >= 3)) return s;
      return [...s, d].sort((a, b) => a - b);
    });
  };

  const gerar = () => {
    if (!ok) return;
    const n = todas ? TOTAL_COMBINACOES : Math.max(1, Math.min(MAX_PADRAO, qtd || 1));
    const pares = modo === "personalizada" ? paresAlvo : modo === "sugerida" ? paresSugeridos : null;
    const novos = todas ? gerarJogos(exclusoes, n) : gerarJogosPorPadrao(exclusoes, n, pares);
    if (!novos.length) { toast.error("Nenhuma combinação atende a esses critérios."); return; }
    setJogos(novos);
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
    <Page title="Jogar" subtitle="Analise os concursos, exclua 2 pares e 3 ímpares e gere jogos com as 20 dezenas restantes.">
      <section className="card-premium mb-4 space-y-3 p-4">
        <h2 className="text-base font-bold">Etapa 1 · Último concurso e análise histórica</h2>
        {ultimo ? (
          <>
            <p className="text-sm">Último concurso na base: <strong>{ultimo.numero}</strong> · {paridade(ultimo.dezenas).pares} pares e {paridade(ultimo.dezenas).impares} ímpares
              {anterior ? ` · ${repetidas(ultimo.dezenas, anterior.dezenas)} repetidas do anterior` : " · repetidas indisponíveis"}.</p>
            <div className="flex flex-wrap gap-1">{[...ultimo.dezenas].sort((a, b) => a - b).map((d) => <Bola key={d} n={d} tom="lime" />)}</div>
          </>
        ) : <p className="text-sm text-muted-foreground">Último concurso indisponível. A base precisa ser sincronizada.</p>}
        <p className="text-sm text-muted-foreground">Janela de análise: <strong>{concursos.length} de 599</strong> concursos recentes efetivamente disponíveis.</p>
        <p className="text-sm">{padraoSugerido
          ? `Dica descritiva: ${padraoSugerido.padrao}, observado ${padraoSugerido.vezes} vezes nesta amostra.`
          : "Sem dica estatística disponível. É possível gerar combinações com critérios manuais."}</p>
        <p className="text-xs text-muted-foreground">Frequência histórica não garante acertos futuros. Confira a data da última atualização da base.</p>
        <Link to="/analise" className="text-sm font-semibold text-primary underline">Consultar análise completa</Link>
      </section>
      <section className="card-premium p-4">
        <h2 className="mb-3 font-bold">Etapa 2 · Excluir 2 pares e 3 ímpares</h2>
        <div className="mb-3 flex items-center justify-between">
          <span className={`font-display text-lg font-bold ${ok ? "text-primary" : ""}`} aria-live="polite">{exclusoes.length}/{QTD_EXCLUSOES} excluídas · {paresExcluidos}P + {imparesExcluidos}I</span>
          <button onClick={() => { setExclusoes([]); setJogos(null); }} disabled={!exclusoes.length} className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-40">
            <Eraser className="h-3.5 w-3.5" /> Limpar seleção
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {DEZENAS.map((d) => {
            const sel = exclusoes.includes(d);
            const bloq = !sel && (ok || (d % 2 === 0 ? paresExcluidos >= 2 : imparesExcluidos >= 3));
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
        <p className="text-xs text-muted-foreground">Seleção válida: {paridade(pool).pares} pares e {paridade(pool).impares} ímpares restantes.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{pool.map((d) => <Bola key={d} n={d} tom={ok ? "lime" : "ghost"} />)}</div>
      </section>

      <section className="card-premium mt-4 space-y-3 p-4">
        <h2 className="font-bold">Etapa 3 · Escolher estratégia e gerar jogos</h2>
        <label className="block text-sm font-semibold" htmlFor="sf-estrategia">Critério de geração</label>
        <select id="sf-estrategia" value={modo} onChange={(e) => { setModo(e.target.value as typeof modo); setJogos(null); }}
          className="w-full rounded-xl border bg-input/30 p-3 text-sm">
          <option value="sugerida">Dica estatística (quando disponível)</option>
          <option value="personalizada">Minha estratégia · definir paridade</option>
          <option value="livre">Combinações livres com as 20 dezenas</option>
        </select>
        {modo === "personalizada" && <label className="block text-sm font-semibold">
          Quantidade de pares por jogo
          <select value={paresAlvo} onChange={(e) => { setParesAlvo(Number(e.target.value)); setJogos(null); }}
            className="mt-2 w-full rounded-xl border bg-input/30 p-3">
            {[5, 6, 7, 8, 9, 10].map((p) => <option key={p} value={p}>{p} pares / {15 - p} ímpares</option>)}
          </select>
        </label>}
        <p className="text-xs text-muted-foreground">
          {modo === "sugerida"
            ? paresSugeridos !== null ? `Paridade observada: ${paresSugeridos}P/${15 - paresSugeridos}I. É uma contagem histórica, não previsão.` : "Sem base histórica: serão usadas combinações livres, sem inventar recomendações."
            : modo === "personalizada" ? `Filtro escolhido: ${paresAlvo}P/${15 - paresAlvo}I.` : "Sem filtro estatístico."}
        </p>
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
        {!ok && <p className="text-center text-xs text-muted-foreground">Exclua 2 pares e 3 ímpares. Faltam {2 - paresExcluidos} pares e {3 - imparesExcluidos} ímpares.</p>}
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
                  <p className="mb-1 text-[11px] text-muted-foreground">Pares · primeira linha</p>
                  <div className="mb-2 flex flex-wrap gap-1">{j.filter((d) => d % 2 === 0).map((d) => <Bola key={d} n={d} tom={ultimo?.dezenas.includes(d) ? "lime" : "base"} />)}</div>
                  <p className="mb-1 text-[11px] text-muted-foreground">Ímpares · segunda linha</p>
                  <div className="flex flex-wrap gap-1">{j.filter((d) => d % 2 !== 0).map((d) => <Bola key={d} n={d} tom={ultimo?.dezenas.includes(d) ? "lime" : "base"} />)}</div>
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