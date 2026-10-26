import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Save, Download, Copy, Eraser, ClipboardList, PenLine, Gauge, ShieldAlert } from "lucide-react";
import { AvisoResponsavel, Bola, Page } from "@/components/app/ui";
import { baseQuery } from "@/lib/data";
import { informacoesQuery, moeda } from "@/lib/public-info";
import { useAuth } from "@/lib/auth";
import { salvarLocais, salvarNuvem } from "@/lib/jogos-store";
import { estatisticasPadrao, gerarJogosComPadroes, validarExclusoesEstrategicas } from "@/lib/padroes";
import {
  DEZENAS, QTD_EXCLUSOES, TOTAL_COMBINACOES, fmt, fmtNum,
  paridade, repetidas, restantes, validarJogo,
} from "@/lib/lotofacil";

const QUANTIDADES = [3,4,6,8,10] as const;
export const Route = createFileRoute("/jogar")({
  head: () => ({meta: [{title:"Gerar jogos — SuperFácil"},{name:"description",content:"Exclua 2 dezenas pares e 3 ímpares. Escolha padrões, quantidade, preço e copie suas apostas de 15 dezenas."}]}),
  component: Jogar,
});

function Jogar() {
  const [exclusoes, setExclusoes] = useState<number[]>([]);
  const [qtd, setQtd] = useState<number>(3);
  const [modo, setModo] = useState<"auto"|"manual">("auto");
  const [marcadas, setMarcadas] = useState<number[]>([]);
  const [jogos, setJogos] = useState<number[][]>([]);
  const [salvando, setSalvando] = useState(false);
  const { data: base } = useQuery(baseQuery);
  const { data: info } = useQuery(informacoesQuery);
  const { user } = useAuth();
  const preco = info?.preco ?? 3.5;
  const quantidadePares = paridade(exclusoes).pares;
  const quantidadeImpares = paridade(exclusoes).impares;
  const valido = validarExclusoesEstrategicas(exclusoes);
  const pool = useMemo(() => restantes(exclusoes), [exclusoes]);
  const pares = pool.filter(d => d % 2 === 0);
  const impares = pool.filter(d => d % 2 !== 0);
  const historico = base?.modo === "ok" ? base.concursos : [];
  const ultimo = historico[0];
  const padrao = useMemo(() => estatisticasPadrao(historico), [historico]);

  function selecionarExclusao(d: number) {
    setExclusoes(anterior => {
      if (anterior.includes(d)) return anterior.filter(n => n !== d);
      if (anterior.length === QTD_EXCLUSOES) return anterior;
      const p = paridade(anterior);
      if (d % 2 === 0 && p.pares >= 2) return anterior;
      if (d % 2 !== 0 && p.impares >= 3) return anterior;
      return [...anterior, d].sort((a,b)=>a-b);
    });
    setJogos([]);
    setMarcadas([]);
  }

  function selecionarManual(d: number) {
    if (!valido || !pool.includes(d)) return;
    setMarcadas(atual => atual.includes(d) ? atual.filter(n => n!==d) :
      atual.length === 15 ? atual : [...atual,d].sort((a,b)=>a-b));
  }

  function incluirManual() {
    if (!validarJogo(marcadas,exclusoes)) return toast.error("Escolha exatamente 15 dezenas válidas.");
    if (jogos.some(j => j.join(",") === marcadas.join(","))) return toast.error("Este jogo já está na lista.");
    if (jogos.length >= qtd) return toast.error("Você atingiu a quantidade selecionada.");
    setJogos(x=>[...x,[...marcadas]]);
    setMarcadas([]);
    toast.success("Jogo adicionado.");
  }

  function gerarAutomaticamente() {
    if (!valido) return;
    setJogos(gerarJogosComPadroes(exclusoes,qtd,historico));
    toast.success(`${qtd} jogos organizados para conferência.`);
  }

  async function copiar(jogo: number[]) {
    try {
      await navigator.clipboard.writeText(jogo.map(fmt).join(" "));
      toast.success("15 dezenas copiadas para marcar no volante.");
    } catch {
      toast.error("Não foi possível copiar automaticamente neste dispositivo.");
    }
  }

  async function salvar() {
    if (!jogos.length) return;
    const itens=jogos.map(dezenas=>({exclusoes,dezenas,concurso_referencia:ultimo?.numero??null}));
    setSalvando(true);
    try {
      if (base?.modo==="demo") {
        salvarLocais(itens);
        toast.success("Jogos salvos neste aparelho.");
      } else if(user) {
        await salvarNuvem(user.id,itens);
        toast.success("Jogos salvos na sua conta.");
      } else {
        toast.error("Entre na sua conta para salvar na nuvem.");
      }
    } catch(e) {toast.error(e instanceof Error?e.message:"Não foi possível salvar.");}
    finally {setSalvando(false);}
  }

  function baixarCsv() {
    if(!jogos.length)return;
    const csv=["jogo;dezenas;pares;impares;preco",...jogos.map((j,i)=>{
      const p=paridade(j);
      return `${i+1};${j.map(fmt).join(" ")};${p.pares};${p.impares};${preco.toFixed(2).replace(".",",")}`;
    })].join("\n");
    const a=document.createElement("a");
    const url=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));
    a.href=url;a.download="superfacil-jogos.csv";a.click();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  return <Page title="Gerar jogos" subtitle="Escolha cinco dezenas para excluir: duas pares e três ímpares.">
    <div className="sf-play-shell">
      <section className="sf-play-card">
        <div className="sf-play-heading"><div><strong>1. Excluir 5 dezenas</strong><p>Selecione exatamente 2 pares e 3 ímpares.</p></div>
          <span className="sf-play-chip">{exclusoes.length}/5</span></div>
        <div className="sf-exclude-progress">
          <span className={quantidadePares===2?"sf-ready":""}>Pares: {quantidadePares}/2</span>
          <span className={quantidadeImpares===3?"sf-ready":""}>Ímpares: {quantidadeImpares}/3</span>
          <button type="button" onClick={()=>{setExclusoes([]);setMarcadas([]);setJogos([]);}}><Eraser size={15}/> Limpar</button>
        </div>
        <div className="sf-dez-grid">{DEZENAS.map(d=><button type="button" key={d} aria-label={`Dezena ${fmt(d)}`}
          aria-pressed={exclusoes.includes(d)} onClick={()=>selecionarExclusao(d)} className={exclusoes.includes(d)?"sf-dez-excluida":""}>
            {fmt(d)}{exclusoes.includes(d)?" ×":""}
        </button>)}</div>
        <p className="sf-hint">{valido?"As 20 dezenas restantes estão disponíveis para montar jogos.":"Selecione 2 pares e 3 ímpares para habilitar a montagem."}</p>
      </section>

      <section className="sf-pools" aria-label="Dezenas restantes">
        <div className="sf-pool sf-pool-even"><h2>Pares restantes ({pares.length})</h2><div>{pares.map(n=><span key={n}>{fmt(n)}</span>)}</div></div>
        <div className="sf-pool sf-pool-odd"><h2>Ímpares restantes ({impares.length})</h2><div>{impares.map(n=><span key={n}>{fmt(n)}</span>)}</div></div>
      </section>

      <section className="sf-play-card">
        <div className="sf-play-heading"><div><strong>2. Montagem dos jogos</strong>
          <p>{padrao.concursoReferencia ? `Base: ${padrao.concursosAnalisados} concursos; referência ${padrao.concursoReferencia}.` : "Histórico indisponível: geração combinatória."}</p>
          </div><Gauge size={22} /></div>
        {padrao.paresUltimoConcurso !== null && <p className="sf-pattern-note">
          Concurso anterior: {padrao.paresUltimoConcurso} pares e {padrao.imparesUltimoConcurso} ímpares
          {padrao.repetidasNoUltimo!==null?`; ${padrao.repetidasNoUltimo} dezenas repetidas em relação ao anterior.`:"."}
        </p>}
        <div className="sf-mode-grid">
          <button className={modo==="manual"?"sf-mode-active":""} onClick={()=>setModo("manual")} type="button"><PenLine size={17}/> Formar manualmente</button>
          <button className={modo==="auto"?"sf-mode-active sf-mode-green":""} onClick={()=>setModo("auto")} type="button"><Sparkles size={17}/> Gerar com o sistema</button>
        </div>
        <p className="sf-hint">Os padrões são dados históricos, não uma previsão do próximo sorteio.</p>
      </section>

      <section className="sf-play-card">
        <h2 className="sf-block-title">3. Quantos jogos deseja?</h2>
        <div className="sf-quantity-grid">{QUANTIDADES.map(n=><button type="button" key={n}
          className={qtd===n?"sf-quantity-active":""} onClick={()=>{setQtd(n);setJogos([]);setMarcadas([]);}}>
          {n}
        </button>)}</div>
        <div className="sf-price-box">
          <div className="sf-price-label">Valor da aposta simples (15 dezenas): <b>{moeda(preco)}</b></div>
          <div className="sf-price-grid">{QUANTIDADES.map(n=><div key={n} className={qtd===n?"sf-price-selected":""}>
            <small>{n} jogos</small><strong>{moeda(n*preco)}</strong></div>)}</div>
          <p>Total selecionado: <strong>{qtd} jogos · {moeda(qtd*preco)}</strong></p>
          <small>Preço oficial de referência da CAIXA, conferido em {info?.precoValidadoEm??"26/10/2026"}. Não inclui taxas eventualmente aplicáveis.</small>
        </div>
      </section>

      {modo==="auto" ? <button className="sf-generate-button" type="button" disabled={!valido} onClick={gerarAutomaticamente}>
        <Sparkles size={19}/> Gerar {qtd} jogos com o sistema
      </button> : <section className="sf-play-card">
        <h2 className="sf-block-title">4. Formar manualmente</h2>
        <p className="sf-hint">Toque nas 15 dezenas desejadas entre as 20 restantes. Você pode montar {qtd} jogos diferentes.</p>
        <p className="sf-manual-counter">{marcadas.length}/15 selecionadas</p>
        <div className="sf-dez-grid">{pool.map(d=><button type="button" key={d}
          aria-pressed={marcadas.includes(d)} disabled={!valido}
          className={marcadas.includes(d)?"sf-dez-selected":""} onClick={()=>selecionarManual(d)}>
          {fmt(d)}</button>)}</div>
        <button className="sf-generate-button" type="button" disabled={!valido||marcadas.length!==15||jogos.length>=qtd}
          onClick={incluirManual}>Adicionar jogo {jogos.length+1} de {qtd}</button>
      </section>}

      {jogos.length>0 && <section className="sf-play-card sf-game-results">
        <div className="sf-play-heading"><div><strong>Jogos gerados ({jogos.length})</strong>
          <p>Copie cada combinação e marque no volante oficial.</p></div><ClipboardList size={23}/></div>
        {jogos.map((j,i)=>{const p=paridade(j);const r=repetidas(j,ultimo?.dezenas);
          return <article className="sf-ticket" key={j.join(",")}>
            <div className="sf-ticket-title"><strong>Jogo {i+1}</strong><small>{p.pares}P/{p.impares}I{r!==null?` · ${r} repetidas`:""}</small></div>
            <div className="sf-ticket-balls">{j.map(n=><Bola key={n} n={n} tom="lime"/>)}</div>
            <button type="button" onClick={()=>void copiar(j)} className="sf-copy-button"><Copy size={16}/> Copiar</button>
          </article>
        })}
        <div className="sf-play-collection-actions">
          {user||base?.modo==="demo" ?
            <button type="button" disabled={salvando} onClick={()=>void salvar()}><Save size={17}/>{salvando?"Salvando...":"Salvar jogos"}</button> :
            <Link to="/entrar">Entrar para salvar</Link>}
          <button type="button" onClick={baixarCsv}><Download size={17}/> Baixar CSV</button>
        </div>
        <p className="sf-hint">Valor para apostar os {jogos.length} jogos listados: {moeda(jogos.length*preco)}. O SuperFácil não registra a aposta na CAIXA.</p>
      </section>}

      <div className="sf-play-responsibility"><ShieldAlert size={18}/> Proibido para menores de 18 anos. Jogos não garantem prêmios.</div>
    </div>
    <AvisoResponsavel/>
  </Page>;
}
