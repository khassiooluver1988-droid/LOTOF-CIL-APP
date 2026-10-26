import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Hash, TicketCheck } from "lucide-react";
import { AvisoResponsavel, BaseStatus, Bola, Page } from "@/components/app/ui";
import { baseQuery } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { lerLocais, listarNuvem, type JogoSalvo } from "@/lib/jogos-store";
import { fmt, fmtNum, paridade } from "@/lib/lotofacil";

export const Route = createFileRoute("/resultados")({
  head: () => ({
    meta: [
      { title: "Análise de resultados — SuperFácil" },
      { name: "description", content: "Confira dezenas sorteadas e compare jogos salvos com resultados reais." },
    ],
  }),
  component: Resultados,
});

function Resultados() {
  const { data: base, isLoading: baseLoading } = useQuery(baseQuery);
  const { user } = useAuth();
  const demo = base?.modo === "demo";
  const concursos = base?.modo === "ok" ? base.concursos : [];
  const [numeroEscolhido, setNumeroEscolhido] = useState<number | null>(null);
  const [locais, setLocais] = useState<JogoSalvo[]>([]);

  useEffect(() => {
    if (demo) setLocais(lerLocais());
  }, [demo]);

  const cloud = useQuery({
    queryKey: ["jogos", user?.id],
    queryFn: listarNuvem,
    enabled: Boolean(user) && !demo,
  });

  const numero = numeroEscolhido ?? concursos[0]?.numero;
  const concurso = concursos.find((c) => c.numero === numero);
  const meusJogos = demo ? locais : user ? cloud.data ?? [] : [];
  const avaliados = useMemo(() => {
    if (!concurso) return [];
    const sorteadas = new Set(concurso.dezenas);
    return meusJogos.map((j) => ({
      jogo: j,
      acertos: j.dezenas.filter((n) => sorteadas.has(n)).length,
    })).sort((a, b) => b.acertos - a.acertos);
  }, [concurso, meusJogos]);

  const distribuição = useMemo(() => {
    const counts = new Map<number, number>();
    for (const a of avaliados) counts.set(a.acertos, (counts.get(a.acertos) ?? 0) + 1);
    return [...counts.entries()].sort((a,b) => b[0] - a[0]);
  }, [avaliados]);

  return (
    <Page title="Análise de resultados" subtitle="Confira concursos reais e compare as dezenas com seus jogos salvos.">
      <BaseStatus />
      {baseLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Carregando concursos...</p>
      ) : !concursos.length ? (
        <div className="card-premium mt-4 p-4 text-sm text-muted-foreground">Não há resultados reais carregados para conferir.</div>
      ) : (
        <>
          <section className="card-premium mt-4 space-y-3 p-4">
            <label htmlFor="resultado-concurso" className="block text-sm font-bold">
              Escolha o concurso da Lotofácil
            </label>
            <select id="resultado-concurso" value={numero} onChange={(e) => setNumeroEscolhido(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold text-foreground">
              {concursos.map((c) => (
                <option key={c.numero} value={c.numero}>Concurso {c.numero} · {new Date(c.data + "T12:00").toLocaleDateString("pt-BR")}</option>
              ))}
            </select>
            {concurso && (
              <>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Dezenas sorteadas</span>
                  <span>{(() => { const p = paridade(concurso.dezenas); return `${p.pares}P / ${p.impares}I`; })()}</span>
                </div>
                <div className="flex flex-wrap gap-1.5" aria-label="Dezenas do concurso">
                  {[...concurso.dezenas].sort((a,b) => a-b).map((d) => <Bola key={d} n={d} tom="lime" />)}
                </div>
              </>
            )}
          </section>

          {!user && !demo ? (
            <section className="card-premium mt-4 p-4 text-sm text-muted-foreground">
              Para comparar seus jogos salvos, <Link to="/entrar" className="font-semibold text-primary underline">entre na sua conta</Link>.
            </section>
          ) : cloud.isLoading && !demo ? (
            <p className="mt-4 text-sm text-muted-foreground">Carregando seus jogos...</p>
          ) : meusJogos.length === 0 ? (
            <section className="card-premium mt-4 p-4 text-sm text-muted-foreground">
              Nenhum jogo salvo. <Link to="/jogar" className="font-semibold text-primary underline">Gerar jogos</Link> ou <Link to="/meus-jogos" className="font-semibold text-primary underline">consultar meus jogos</Link>.
            </section>
          ) : (
            <section className="mt-4 space-y-3">
              <div className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" /><h2 className="font-bold">Comparação dos seus jogos</h2></div>
              <p className="text-xs text-muted-foreground">Contagem de dezenas coincidentes, sem confirmação de bilhete registrado ou de prêmio. Comparações com sorteios anteriores à criação do jogo são apenas simulações retrospectivas.</p>
              <div className="flex flex-wrap gap-2">
                {distribuição.map(([qtd, n]) => (
                  <span key={qtd} className="rounded-full border border-border px-3 py-1 text-xs font-semibold">{qtd} acertos: {fmtNum(n)} jogo(s)</span>
                ))}
              </div>
              {avaliados.slice(0, 50).map(({ jogo, acertos }) => {
                const sorteadas = new Set(concurso?.dezenas ?? []);
                return (
                  <article key={jogo.id} className="card-premium p-3">
                    <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">Jogo salvo em {new Date(jogo.criado_em).toLocaleDateString("pt-BR")}</span>
                      <span className="font-bold text-primary">{acertos} acertos</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">{jogo.dezenas.map((d) =>
                      <Bola key={d} n={d} tom={sorteadas.has(d) ? "lime" : "ghost"} />)}
                    </div>
                    {jogo.concurso_referencia !== null && concurso && concurso.numero <= jogo.concurso_referencia && (
                      <p className="mt-2 text-[11px] text-warning">Simulação retrospectiva: concurso igual ou anterior ao usado como referência para este jogo.</p>
                    )}
                  </article>
                );
              })}
              {avaliados.length > 50 && <p className="text-xs text-muted-foreground">Mostrando 50 de {fmtNum(avaliados.length)} jogos salvos.</p>}
            </section>
          )}
        </>
      )}
      <AvisoResponsavel />
    </Page>
  );
}
