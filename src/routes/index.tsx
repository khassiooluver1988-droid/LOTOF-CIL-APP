import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ArrowRight, ChartNoAxesCombined, ClipboardCheck, Star, Ticket, Database, CalendarDays, ShieldCheck, TrendingUp } from "lucide-react";
import { AvisoResponsavel, Bola } from "@/components/app/ui";
import { baseQuery } from "@/lib/data";
import { TOTAL_COMBINACOES, fmtNum, paridade } from "@/lib/lotofacil";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SuperFácil — Estratégias e análises da Lotofácil" },
      { name: "description", content: "Exclua 5 dezenas, gere jogos de 15 com as 20 restantes e consulte estatísticas de concursos efetivamente registrados." },
      { property: "og:title", content: "SuperFácil — Apostas e estratégias para a Lotofácil" },
      { property: "og:description", content: "Jogos de 15 dezenas e análise histórica, sem promessas de resultados." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { to: "/jogar", title: "Gerar jogos", description: "Exclua 5 dezenas e monte seus jogos de 15 dezenas.", cta: "Jogar agora", icon: Sparkles, tone: "purple" },
  { to: "/analise", title: "Análise de números", description: "Consulte pares, ímpares, repetidas e frequências.", cta: "Ver análises", icon: ChartNoAxesCombined, tone: "green" },
  { to: "/resultados", title: "Análise de resultados", description: "Compare os jogos salvos com concursos registrados.", cta: "Conferir resultados", icon: ClipboardCheck, tone: "blue" },
  { to: "/meus-jogos", title: "Minhas estratégias", description: "Consulte e gerencie suas combinações salvas.", cta: "Meus jogos", icon: Star, tone: "gold" },
] as const;

function Home() {
  const { data, isLoading } = useQuery(baseQuery);
  const concursos = data?.modo === "ok" ? data.concursos : [];
  const ultimo = concursos[0];
  const dataConcurso = ultimo
    ? new Date(ultimo.data + "T12:00").toLocaleDateString("pt-BR")
    : null;
  const total = concursos.length;
  const par = ultimo ? paridade(ultimo.dezenas) : null;

  return (
    <main className="sf-dashboard">
      <section className="sf-hero" aria-label="Apresentação do SuperFácil">
        <div className="sf-hero-copy">
          <span className="sf-eyebrow">SUPERFÁCIL · LOTOFÁCIL</span>
          <h1>Estratégia, <br/>análise e dados <span>da Lotofácil</span></h1>
          <p>Explore padrões de concursos anteriores e forme seus jogos com critérios estatísticos.</p>
          <Link className="sf-hero-link" to="/jogar">
            Começar a jogar <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="sf-hero-art" aria-hidden="true">
          <img className="sf-hero-clover" src="/favicon.svg" alt="" />
          <div className="sf-lottery-slip">
            <div className="sf-slip-top">SuperFácil <span>15 dezenas</span></div>
            <div className="sf-slip-grid">{Array.from({ length: 25 }, (_, i) => <span key={i}>{String(i + 1).padStart(2, "0")}</span>)}</div>
            <div className="sf-slip-caption">Simulação ilustrativa</div>
          </div>
        </div>
      </section>

      <section className="sf-current" aria-label="Estado da base histórica">
        <div className="sf-current-info">
          <div className="sf-status-icon"><Database size={29} aria-hidden="true"/></div>
          <div>
            <p className="sf-kicker">Último concurso na base</p>
            <h2>{ultimo ? `Nº ${fmtNum(ultimo.numero)}` : "Aguardando dados"}</h2>
            <p className="sf-current-detail">{ultimo ? dataConcurso : isLoading ? "Carregando resultados..." : "Sem concurso disponível"}</p>
          </div>
        </div>
        <div className="sf-current-action">
          <div className="sf-data-overview">
            <div><span>Concursos analisados</span><strong>{total ? fmtNum(total) : "—"}</strong></div>
            <div><span>Janela configurada</span><strong>599</strong></div>
          </div>
          <Link className="sf-primary-cta" to="/jogar"><Ticket size={19} aria-hidden="true" /> Gerar jogos agora <ArrowRight size={18} aria-hidden="true"/></Link>
        </div>
      </section>

      {data?.modo === "demo" && <div className="sf-data-warning" role="status">Banco de dados indisponível. A geração combinatória funciona, mas a análise histórica fica suspensa.</div>}
      {data?.modo === "vazia" && <div className="sf-data-warning" role="status">Aguardando sincronização de resultados oficiais. Nenhum dado histórico foi inventado.</div>}

      <section className="sf-tools" aria-label="Ferramentas do aplicativo">
        {FEATURES.map(({ to, title, description, cta, icon: Icon, tone }) =>
          <article key={to} className={`sf-feature sf-feature-${tone}`}>
            <div className="sf-feature-main">
              <div className="sf-feature-icon"><Icon size={27} aria-hidden="true" /></div>
              <div><h2>{title}</h2><p>{description}</p></div>
            </div>
            <Link to={to} className="sf-feature-cta">{cta}<ArrowRight size={17} aria-hidden="true"/></Link>
          </article>)}
      </section>

      <section className="sf-latest" aria-label="Resultado histórico mais recente">
        <div className="sf-latest-title">
          <div className="sf-latest-emblem"><CalendarDays size={26} aria-hidden="true"/></div>
          <div>
            <span>Último concurso registrado</span>
            <strong>{ultimo ? `Nº ${fmtNum(ultimo.numero)}` : "Nenhum concurso"}</strong>
            <small>{dataConcurso ?? "Sem atualização disponível"}</small>
          </div>
        </div>
        <div className="sf-latest-draw">
          {ultimo ?
            [...ultimo.dezenas].sort((a,b)=>a-b).map(d => <Bola key={d} n={d} tom="lime"/>) :
            <p>Assim que houver resultados sincronizados, as dezenas aparecerão aqui.</p>}
        </div>
        <div className="sf-latest-right">
          {par && <span>{par.pares} pares · {par.impares} ímpares</span>}
          <Link to="/resultados">Ver detalhes <ArrowRight size={16} aria-hidden="true"/></Link>
        </div>
      </section>

      <p className="sf-data-fineprint"><ShieldCheck size={15} aria-hidden="true"/> Dados históricos não aumentam a probabilidade matemática de um jogo simples: 1 em 3.268.760 para 15 acertos. Possibilidades após excluir cinco dezenas: {fmtNum(TOTAL_COMBINACOES)}.</p>
      <div className="sf-responsible"><AvisoResponsavel/></div>
    </main>
  );
}
