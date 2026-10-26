import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ArrowRight, Trophy, CalendarDays, Clock, Lightbulb, ShieldCheck, Users, Wallet } from "lucide-react";
import { BannerCarousel } from "@/components/app/Carousel";
import { AvisoResponsavel, Bola } from "@/components/app/ui";
import { baseQuery } from "@/lib/data";
import { informacoesQuery, moeda } from "@/lib/public-info";
import { fmtNum, paridade } from "@/lib/lotofacil";

export const Route = createFileRoute("/")({
  head: () => ({meta: [
    {title:"SuperFácil — Análises e estratégia para Lotofácil"},
    {name:"description",content:"Gere jogos, consulte os 599 concursos históricos e veja valores oficiais disponíveis sem dados fictícios."}
  ]}),
  component: Home,
});

function Home() {
  const {data:base,isLoading}=useQuery(baseQuery);
  const {data:infos}=useQuery(informacoesQuery);
  const historico=base?.modo==="ok"?base.concursos:[];
  const ultimo=historico[0];
  const diaAnterior=ultimo?new Date(ultimo.data+"T12:00").toLocaleDateString("pt-BR"):null;
  const premio=infos?.premio;
  const numeroAtual=premio?.numero && (!ultimo || premio.numero>ultimo.numero)?premio.numero:null;
  const premioEstimado=premio?.premio_estimado ?? null;
  const dataProximo=premio?.data_proximo_sorteio
    ? new Date(premio.data_proximo_sorteio+"T12:00").toLocaleDateString("pt-BR"):null;
  const dadosGanhadores=premio && ultimo && premio.numero===ultimo.numero?premio:null;
  const par=ultimo?paridade(ultimo.dezenas):null;

  return <main className="sf-dashboard sf-home-v2">
    <BannerCarousel/>
    <section className="sf-current sf-current-v2" aria-label="Próximo concurso">
      <div className="sf-current-info">
        <div className="sf-status-icon"><Trophy size={25} aria-hidden="true"/></div>
        <div>
          <p className="sf-kicker">Próximo concurso</p>
          <h1>{numeroAtual?`Nº ${fmtNum(numeroAtual)}`:"Aguardando confirmação"}</h1>
          <p className="sf-current-detail"><CalendarDays size={14}/>{dataProximo??"Data oficial indisponível"}</p>
        </div>
      </div>
      <div className="sf-current-action">
        <div className="sf-next-prize"><span>Prêmio estimado</span>
          <strong>{premioEstimado!==null?moeda(premioEstimado):"Não informado"}</strong></div>
        <p className="sf-current-disclaimer">Exibido apenas quando confirmado na base oficial.</p>
      </div>
    </section>

    <div className="sf-home-ctas">
      <Link to="/jogar" className="sf-home-play"><Sparkles size={24}/> GERAR JOGOS <ArrowRight size={20}/></Link>
      <Link to="/dicas" className="sf-home-tips"><Lightbulb size={23}/> DICAS <ArrowRight size={19}/></Link>
    </div>

    <section className="sf-latest sf-latest-v2" aria-label="Resultado anterior">
      <div className="sf-latest-title">
        <div className="sf-latest-emblem"><Trophy size={25}/></div>
        <div><span>Último concurso registrado</span>
          <strong>{ultimo?`Nº ${fmtNum(ultimo.numero)}`:"Indisponível"}</strong>
          <small>{diaAnterior??"Aguardando dados da base"}</small>
        </div>
      </div>
      <div className="sf-latest-draw">
        {ultimo?[...ultimo.dezenas].sort((a,b)=>a-b).map(n=><Bola key={n} n={n} tom="lime"/>)
          :<p>As 15 dezenas aparecerão após a sincronização.</p>}
      </div>
      <div className="sf-latest-right">
        {par && <span>{par.pares} pares · {par.impares} ímpares</span>}
        <Link to="/resultados">Ver detalhes <ArrowRight size={16}/></Link>
      </div>
      <div className="sf-last-payout">
        <div><Users size={18}/><span>Ganhadores (15 acertos): </span>
          <strong>{dadosGanhadores?.ganhadores_15!==null&&dadosGanhadores?.ganhadores_15!==undefined?
            fmtNum(dadosGanhadores.ganhadores_15):"Não disponível"}</strong></div>
        <div><Wallet size={18}/><span>Prêmio por aposta: </span>
          <strong>{dadosGanhadores?.premio_15_por_aposta!==null&&dadosGanhadores?.premio_15_por_aposta!==undefined?
            moeda(dadosGanhadores.premio_15_por_aposta):"Não disponível"}</strong></div>
      </div>
    </section>
    <p className="sf-data-fineprint"><ShieldCheck size={15}/> Concurso mais recente na base: {ultimo?.numero??"indisponível"}. {base?.modo==="ok" ?`${historico.length} concursos consultados; janela configurada de 599.`:"Base indisponível ou não sincronizada."} {isLoading?"Carregando...":""} Apostas simples não têm chance aumentada pelo histórico.</p>
    <div className="sf-responsible"><AvisoResponsavel/></div>
  </main>;
}
