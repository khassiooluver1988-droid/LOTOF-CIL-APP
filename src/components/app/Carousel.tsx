import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
 {name:"Concurso 3813 — prêmio acumulado (UOL)",src:"/banner-noticia-3813.svg",
    url:"https://noticias.uol.com.br/ultimas-noticias/redacao/2026/10/24/lotofacil-concurso-3813-sorteio-24-de-outubro.amp.htm",alt:"Ninguém acertou as quinze dezenas no concurso 3813; o prêmio acumulou para R$ 5 milhões."},
 {name:"Concurso 3814 — estimativa de prêmio (Itatiaia)",src:"/banner-noticia-3814.svg",
    url:"https://www.itatiaia.com.br/brasil/brasil-geral/lotofacil-sorteia-r-5-milhoes-no-concurso-3814-nesta-segunda-feira-26/",alt:"Reportagem da Itatiaia sobre o prêmio estimado de R$ 5 milhões do concurso 3814 de 26 de outubro de 2026."},
 {name:"Resultados e sorteios (UOL)",src:"/banner-noticia-resultados.svg",
    url:"https://noticias.uol.com.br/loterias/lotofacil/",alt:"Consulte a página de resultados e sorteios da Lotofácil no UOL."},
 {name:"Jogo responsável",src:"/banner-responsavel.svg",to:"/dicas" as const,
    alt:"Jogo responsável: maiores de 18 anos. Estatísticas não garantem premiações."}
] as const;

export function BannerCarousel() {
 const [active,setActive]=useState(0);
 useEffect(()=>{
   const handle=window.setInterval(()=>setActive(i=>(i+1)%slides.length),6500);
   return ()=>window.clearInterval(handle);
 },[]);
 const current=slides[active]!;
 function move(d:number){setActive(i=>(i+d+slides.length)%slides.length);}
 return <section aria-roledescription="carrossel" aria-label="Informativos da Lotofácil" className="sf-carousel">
   <div className="sf-carousel-frame">
     {"url" in current && current.url ? (
       <a href={current.url} target="_blank" rel="noopener noreferrer" aria-label={`Ler notícia: ${current.name}`}>
         <img src={current.src} alt={current.alt} width="1200" height="515" />
       </a>
     ) : (
       <Link to="/dicas" aria-label="Abrir orientações para jogo responsável">
         <img src={current.src} alt={current.alt} width="1200" height="515" />
       </Link>
     )}
     <button type="button" className="sf-carousel-prev" onClick={()=>move(-1)} aria-label="Banner anterior"><ChevronLeft size={18}/></button>
     <button type="button" className="sf-carousel-next" onClick={()=>move(1)} aria-label="Próximo banner"><ChevronRight size={18}/></button>
   </div>
   <div className="sf-carousel-dots" aria-label="Selecionar banner">
     {slides.map((s,i)=><button key={s.src} type="button" aria-label={s.name}
       aria-current={active===i?"true":undefined} onClick={()=>setActive(i)} className={active===i?"sf-dot-active":""}/>)}
   </div>
   <p className="text-xs text-muted-foreground mt-1 text-center">Informativos de outubro de 2026. Toque nos banners para abrir a fonte.</p>
 </section>;
}
