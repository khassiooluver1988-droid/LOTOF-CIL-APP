import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {name:"Vantagens e estratégias", src:"/banner-estrategias.svg", to:"/jogar" as const,
    alt:"Banner SuperFácil: monte seus jogos com exclusão de dezenas e examine padrões históricos"},
  {name:"Prêmio estimado",src:"/banner-premio.svg",to:"/resultados" as const,
    alt:"Banner com link para consultar informações oficiais sobre o prêmio estimado"},
  {name:"Jogo responsável",src:"/banner-responsavel.svg",to:"/dicas" as const,
    alt:"Banner de jogo responsável: restrito a maiores de 18 anos, sem previsão de resultados"},
  {name:"Último concurso",src:"/banner-resultado.svg",to:"/resultados" as const,
    alt:"Banner para conferir dezenas e analisar o último concurso registrado"},
];
export function BannerCarousel() {
  const [active,setActive]=useState(0);
  useEffect(()=>{
    const handle=window.setInterval(()=>setActive(p=>(p+1)%slides.length),6500);
    return ()=>window.clearInterval(handle);
  },[]);
  function move(d:number){setActive(i=>(i+d+slides.length)%slides.length);}
  return <section aria-roledescription="carrossel" aria-label="Destaques do SuperFácil" className="sf-carousel">
    <div className="sf-carousel-frame">
      <Link to={slides[active]!.to} aria-label={`Abrir: ${slides[active]!.name}`}>
        <img src={slides[active]!.src} alt={slides[active]!.alt} width="960" height="370"/>
      </Link>
      <button type="button" className="sf-carousel-prev" onClick={()=>move(-1)} aria-label="Banner anterior"><ChevronLeft size={18}/></button>
      <button type="button" className="sf-carousel-next" onClick={()=>move(1)} aria-label="Próximo banner"><ChevronRight size={18}/></button>
    </div>
    <div className="sf-carousel-dots" aria-label="Selecionar banner">
      {slides.map((s,i)=><button key={s.src} type="button" aria-label={s.name}
        aria-current={active===i?"true":undefined} onClick={()=>setActive(i)} className={active===i?"sf-dot-active":""}/>)}
    </div>
  </section>;
}
