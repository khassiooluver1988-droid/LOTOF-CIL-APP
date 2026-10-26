
const $ = (s) => document.querySelector(s);
const app=$("#app");
const version="2026-10-26.4", unit=3.50;
let contests=[],slide=0,excluded=[],chosen=[],games=[],qty=3,mode="auto",selectedContest=null,loadError=false;
let saved=[];try{saved=JSON.parse(localStorage.getItem("superfacil-demo-games")||"[]");if(!Array.isArray(saved))saved=[]}catch{saved=[]}
const number=n=>String(n).padStart(2,"0");
const real=n=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const balls=(nums,green=false)=>'<div class="balls">'+nums.map(n=>'<span class="ball'+(green?' green':'')+'">'+number(n)+'</span>').join("")+'</div>';
const parity=nums=>nums.filter(n=>n%2===0).length;
const valid=()=>excluded.length===5&&parity(excluded)===2;
const pool=()=>Array.from({length:25},(_,i)=>i+1).filter(n=>!excluded.includes(n));
const last=()=>contests[0]||null;
const dateBR=s=>s?new Date(s+"T12:00:00").toLocaleDateString("pt-BR"):"Não disponível";
const previousIntersection=(a,b)=>{const s=new Set(b);return a.filter(n=>s.has(n)).length};
const routes=new Set(["inicio","jogar","analise","resultados","dicas","salvos"]);
const banners=[
{src:"./public/banner-noticia-3813.svg",label:"UOL: ninguém acerta Lotofácil 3813 e prêmio vai a R$ 5 milhões",url:"https://noticias.uol.com.br/ultimas-noticias/redacao/2026/10/24/lotofacil-concurso-3813-sorteio-24-de-outubro.amp.htm"},
{src:"./public/banner-noticia-3814.svg",label:"Itatiaia: Lotofácil sorteia R$ 5 milhões no concurso 3814",url:"https://www.itatiaia.com.br/brasil/brasil-geral/lotofacil-sorteia-r-5-milhoes-no-concurso-3814-nesta-segunda-feira-26/"},
{src:"./public/banner-noticia-resultados.svg",label:"UOL: resultados, números e sorteios da Lotofácil",url:"https://noticias.uol.com.br/loterias/lotofacil/"},
{src:"./public/banner-responsavel.svg",label:"Jogue com responsabilidade",to:"dicas"}
];
function make(tag,attrs={},body=""){const el=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));el.innerHTML=body;return el}
function popup(msg){let prev=$("#notice");if(prev)prev.remove();const n=make("div",{id:"notice",role:"status",style:"position:fixed;z-index:60;bottom:14px;left:50%;transform:translateX(-50%);background:#200538;color:white;padding:12px 18px;border-radius:10px;box-shadow:0 8px 22px #0008;width:max-content;max-width:94vw;text-align:center"},msg);document.body.append(n);setTimeout(()=>n.remove(),3400)}
function route(){const r=location.hash.replace("#","").split("?")[0];return routes.has(r)?r:"inicio"}
function navigation(){const r=route();document.querySelectorAll(".navtop a").forEach(a=>a.classList.toggle("current",a.hash==="#"+r));$("#drawer").classList.add("hidden");$("#menuButton").setAttribute("aria-expanded","false");render();window.scrollTo(0,0)}
function render(){
 const r=route();
 if(!contests.length){app.innerHTML='<div class="card"><h2>Carregando 599 concursos...</h2><p>Consultando a base de demonstração.</p>'+(loadError?'<p class="warning">Não foi possível carregar o arquivo de dados. Recarregue a página.</p>':'')+'</div>';return}
 if(r==="inicio")app.innerHTML=home();
 if(r==="jogar")app.innerHTML=play();
 if(r==="analise")app.innerHTML=analysis();
 if(r==="resultados")app.innerHTML=results();
 if(r==="dicas")app.innerHTML=tips();
 if(r==="salvos")app.innerHTML=savedPage();
}
function home(){
 const prev=last();
 return '<section aria-label="Carrossel de quatro banners"><div class="carousel-frame"><a href="'+(banners[slide].url||"#"+banners[slide].to)+'" '+(banners[slide].url?'target="_blank" rel="noopener noreferrer"':'')+' aria-label="Abrir notícia: '+banners[slide].label+'"><img class="carousel-img" src="'+banners[slide].src+'" alt="'+banners[slide].label+'"></a><button class="car-btn prev" data-action="slideprev" aria-label="Banner anterior">‹</button><button class="car-btn next" data-action="slidenext" aria-label="Próximo banner">›</button></div><div class="dots">'+banners.map((b,i)=>'<button class="'+(i===slide?'active':'')+'" data-action="slide" data-id="'+i+'" aria-label="'+b.label+'" aria-current="'+(i===slide)+'"></button>').join("")+'</div></section>'+
 '<section class="current" aria-label="Próximo concurso"><div><b>🏆 Próximo concurso</b><h2>Não confirmado</h2><small>Data e horário: aguardando fonte oficial</small></div><div><span>Prêmio estimado</span><br><strong>Não disponível</strong><br><small>Sem informação oficial sincronizada.</small></div></section>'+
 '<div class="home-actions"><a href="#jogar">🎲 GERAR JOGOS →</a><a href="#dicas">💡 DICAS →</a></div>'+
 '<section class="card"><div class="row" style="justify-content:space-between"><div><b>🍀 Último concurso na base</b><h2 class="page-title">Nº '+prev.numero.toLocaleString("pt-BR")+'</h2><span class="muted">'+dateBR(prev.data)+'</span></div><a class="btn outline" href="#resultados">Ver detalhes →</a></div><div style="margin:14px 0">'+balls(prev.dezenas)+'</div><div class="results-meta"><div>🏅 Ganhadores de 15 acertos<strong>Não disponível</strong></div><div>💰 Prêmio por ganhador<strong>Não disponível</strong></div></div></section>'+
 '<p class="warning">As imagens são ilustrativas. Nenhum padrão garante resultado e não há resultados oficiais posteriores ao nº '+prev.numero+' nesta demonstração.</p>';
}
function gridNumbers(nums,chosenSet,action,disable){return '<div class="excluder">'+nums.map(n=>'<button type="button" data-action="'+action+'" data-n="'+n+'" class="'+(chosenSet.includes(n)?(action==="toggleExclude"?"excluded":"selected"):"")+'" '+(disable?'disabled':'')+' aria-pressed="'+chosenSet.includes(n)+'" aria-label="Dezena '+number(n)+'">'+number(n)+(action==="toggleExclude"&&chosenSet.includes(n)?" ×":"")+'</button>').join("")+'</div>'}
function play(){
 const ok=valid(),p=pool(),even=p.filter(n=>!(n%2)),odd=p.filter(n=>n%2);
 return '<h1 class="page-title">Gerar jogos</h1><p class="sub">Exclua 5 dezenas: exatamente 2 pares e 3 ímpares. Em seguida, monte seus jogos manualmente ou com apoio dos padrões históricos.</p>'+
 '<section class="card"><div class="row" style="justify-content:space-between"><h3>1. Excluir cinco dezenas</h3><b class="badge">'+excluded.length+'/5</b></div><div class="counter"><b>'+parity(excluded)+'/2 pares</b><b>'+(excluded.length-parity(excluded))+'/3 ímpares</b><button class="btn neutral" data-action="clear">Limpar</button></div>'+
 gridNumbers(Array.from({length:25},(_,i)=>i+1),excluded,"toggleExclude",false)+
 '<p class="muted">'+(ok?"Seleção concluída. Há dez dezenas pares e dez ímpares restantes.":"Selecione duas pares e três ímpares para continuar.")+'</p></section>'+
 '<div class="pools"><section class="pool"><h3>Pares restantes ('+even.length+')</h3><div class="pool-inner">'+even.map(n=>'<span>'+number(n)+'</span>').join("")+'</div></section><section class="pool"><h3>Ímpares restantes ('+odd.length+')</h3><div class="pool-inner">'+odd.map(n=>'<span>'+number(n)+'</span>').join("")+'</div></section></div>'+
 '<section class="card" style="margin-top:14px"><h3>2. Montagem dos jogos</h3><div class="row"><button class="btn '+(mode==="manual"?"purple":"neutral")+'" data-action="mode" data-id="manual">✎ Formar manualmente</button><button class="btn '+(mode==="auto"?"primary":"neutral")+'" data-action="mode" data-id="auto">⚙ Gerar com o sistema</button></div><p class="muted">O sistema utiliza frequências históricas de pares e dezenas repetidas no concurso anterior (nº '+last().numero+'). Isso não prevê sorteios futuros.</p></section>'+
 '<section class="card"><h3>3. Quantos jogos deseja?</h3><div class="choice">'+[3,4,6,8,10].map(n=>'<button data-action="qty" data-n="'+n+'" class="'+(qty===n?"chosen":"")+'">'+n+'</button>').join("")+'</div><div class="price" style="margin-top:13px"><b>Aposta simples de 15 dezenas: '+real(unit)+'</b><div class="price-grid">'+[3,4,6,8,10].map(n=>'<div class="'+(qty===n?"active":"")+'">'+n+' jogos<br><strong>'+real(n*unit)+'</strong></div>').join("")+'</div>Total previsto: <strong>'+real(qty*unit)+'</strong><p class="muted">Referência CAIXA em 26/10/2026. O aplicativo não registra apostas.</p></div></section>'+
 (mode==="auto"?'<button class="btn primary wide" data-action="generate" '+(!ok?'disabled':'')+'>⚙ Gerar '+qty+' jogos agora</button>':
 '<section class="card"><h3>4. Formar manualmente</h3><p class="muted">Selecione 15 das 20 dezenas disponíveis. '+chosen.length+'/15 escolhidas. Você pode adicionar até '+qty+' jogos.</p>'+
 gridNumbers(p,chosen,"toggleManual",!ok)+'<button class="btn purple wide" data-action="addManual" '+(!ok||chosen.length!==15||games.length>=qty?'disabled':'')+'>Adicionar jogo '+(games.length+1)+'</button></section>')+
 (games.length?ticketSection():"")+
 '<p class="warning">Jogue com responsabilidade. Ferramenta de estatística para maiores de 18 anos. Cada aposta simples tem a mesma probabilidade matemática de acerto.</p>';
}
function ticketSection(){
 return '<section class="card" style="margin-top:14px"><h3>Jogos montados ('+games.length+')</h3><p class="sub">Copie as quinze dezenas e marque no volante oficial.</p>'+games.map((g,i)=>{
 const repeats=previousIntersection(g,last().dezenas);
 return '<article class="ticket"><div><b>Jogo '+(i+1)+'</b><span>'+parity(g)+' pares • '+(15-parity(g))+' ímpares • '+repeats+' repetidas</span></div>'+balls(g)+'<button data-action="copy" data-n="'+i+'" class="btn outline">▣ Copiar jogo</button></article>';
 }).join("")+'<div class="row" style="margin-top:13px"><button class="btn primary" data-action="save">Salvar jogos</button><button class="btn purple" data-action="csv">Baixar CSV</button></div><p class="sub" style="margin-top:11px">Total referente aos '+games.length+' jogos montados: '+real(games.length*unit)+'.</p></section>';
}
function candidates(nums){
 const out=[],chosenN=[];function visit(start){
  if(chosenN.length===15){out.push([...chosenN]);return}
  for(let i=start;i<=nums.length-(15-chosenN.length);i++){chosenN.push(nums[i]);visit(i+1);chosenN.pop()}
 }visit(0);return out;
}
function autoGames(){
 const nums=pool(),freqP=new Map(),freqR=new Map(),history=contests.slice(0,599);
 for(let i=0;i<history.length;i++){
  const p=parity(history[i].dezenas);freqP.set(p,(freqP.get(p)||0)+1);
  if(i+1<history.length){const r=previousIntersection(history[i].dezenas,history[i+1].dezenas);freqR.set(r,(freqR.get(r)||0)+1)}
 }
 const base=new Set(last().dezenas);
 const ranked=candidates(nums).map(ns=>({ns,score:(freqP.get(parity(ns))||0)*1.0+(freqR.get(ns.filter(n=>base.has(n)).length)||0)*1.0})).sort((a,b)=>b.score-a.score);
 const selected=[],keys=new Set();
 for(const maxOverlap of [11,12,13,14,15]){
  for(const o of ranked){
   if(selected.length===qty)return selected;
   const k=o.ns.join("-");
   if(keys.has(k))continue;
   const s=new Set(o.ns);
   if(selected.every(g=>g.filter(n=>s.has(n)).length<=maxOverlap)){selected.push(o.ns);keys.add(k)}
  }
 }
 return selected;
}
function analysis(){
 const count=new Map(Array.from({length:25},(_,i)=>[i+1,0]));const pairs=new Map(),repeats=new Map();
 contests.forEach((c,i)=>{c.dezenas.forEach(n=>count.set(n,count.get(n)+1));let p=parity(c.dezenas);pairs.set(p,(pairs.get(p)||0)+1);if(i<contests.length-1){let r=previousIntersection(c.dezenas,contests[i+1].dezenas);repeats.set(r,(repeats.get(r)||0)+1)}});
 const rank=[...count.entries()].sort((a,b)=>b[1]-a[1]),max=rank[0][1];
 const makeTable=(title,items)=>'<section class="card"><h3>'+title+'</h3><div class="ranking">'+items.map(([n,v])=>'<div><b>'+n+'</b><div class="progress"><span style="width:'+(v/max*100).toFixed(0)+'%"></span></div><strong>'+v+'</strong></div>').join("")+'</div></section>';
 return '<h1 class="page-title">Análise histórica</h1><p class="sub">599 concursos, do nº '+contests.at(-1).numero+' ao nº '+last().numero+'. Frequências observadas: não são previsões.</p>'+
 '<div class="analysis-grid"><section class="card"><b>Concursos analisados</b><div class="metric">599</div></section><section class="card"><b>Último da base</b><div class="metric">'+last().numero+'</div></section></div>'+
 '<section class="card"><h3>10 dezenas mais frequentes</h3><div class="balls">'+rank.slice(0,10).map(([n])=>'<span class="ball">'+number(n)+'</span>').join("")+'</div></section>'+
 makeTable("Frequência por dezena",rank)+
 '<section class="card"><h3>Distribuição de pares por concurso</h3>'+[...pairs.entries()].sort((a,b)=>b[1]-a[1]).map(([n,v])=>'<p>'+n+' pares / '+(15-n)+' ímpares: <b>'+v+' concursos</b></p>').join("")+'</section>'+
 '<section class="card"><h3>Repetidas em relação ao concurso anterior</h3>'+[...repeats.entries()].sort((a,b)=>b[1]-a[1]).map(([n,v])=>'<p>'+n+' repetidas: <b>'+v+' ocorrências</b></p>').join("")+'</section>';
}
function results(){
 let target=contests.find(c=>c.numero===selectedContest)||last();
 const scores=saved.map((g,i)=>({i,hit:previousIntersection(g,target.dezenas)})).sort((a,b)=>b.hit-a.hit);
 return '<h1 class="page-title">Resultados</h1><p class="sub">Consulta aos concursos históricos da base, sem atualização em tempo real.</p>'+
 '<section class="card"><label><b>Escolha um concurso</b><select class="form-control" id="contestSelect">'+contests.map(c=>'<option value="'+c.numero+'" '+(c.numero===target.numero?'selected':'')+'>Nº '+c.numero+' — '+dateBR(c.data)+'</option>').join("")+'</select></label><h3 style="margin-top:16px">Concurso '+target.numero+' · '+dateBR(target.data)+'</h3>'+balls(target.dezenas)+'<p class="sub" style="margin-top:10px">'+parity(target.dezenas)+' pares / '+(15-parity(target.dezenas))+' ímpares</p><div class="results-meta"><div>Ganhadores (15 acertos)<strong>Não disponível</strong></div><div>Valor do prêmio<strong>Não disponível</strong></div></div></section>'+
 '<section class="card"><h3>Comparar jogos salvos</h3>'+(scores.length?scores.map(({i,hit})=>'<p><b>Jogo salvo '+(i+1)+': '+hit+' dezenas coincidentes</b></p>'+balls(saved[i])).join(""):'<p class="muted">Você ainda não salvou jogos no aparelho. Use Gerar jogos para criar alguns e comparar com este sorteio.</p>')+'<p class="sub" style="margin-top:10px">Comparações retrospectivas são simulações, não confirmação de apostas registradas.</p></section>';
}
function tips(){return '<h1 class="page-title">Dicas e orientações</h1>'+
 '<section class="card"><h3>1. Exclua 2 dezenas pares e 3 ímpares</h3><p>Com essa escolha, restam 10 dezenas pares e 10 ímpares para montar jogos de 15 números. É uma regra de organização do SuperFácil, não uma vantagem matemática garantida.</p></section>'+
 '<section class="card"><h3>2. Compare padrões reais</h3><p>Verifique pares, ímpares, dezenas repetidas e frequências dos últimos 599 concursos armazenados. Estatísticas históricas não permitem prever um sorteio aleatório.</p></section>'+
 '<section class="card"><h3>3. Planeje os gastos</h3><p>Aposta simples de 15 dezenas: <b>'+real(unit)+'</b> (CAIXA, 26/10/2026). Três jogos custam '+real(3*unit)+'; dez jogos custam '+real(10*unit)+'. Não aposte mais do que pode perder.</p></section>'+
 '<section class="card"><h3>4. Copie e confira no volante</h3><p>Gere a quantidade pretendida, copie cada grupo de 15 dezenas, confira atentamente e marque no volante. O aplicativo não registra apostas.</p></section>'+
 '<p class="warning">Proibido para menores de 18 anos. Jogos de loteria não constituem investimento.</p>';
}
function savedPage(){
 return '<h1 class="page-title">Meus jogos</h1><p class="sub">Jogos salvos neste navegador. Eles não correspondem a apostas registradas na CAIXA.</p>'+
 '<section class="card">'+(saved.length?saved.map((g,i)=>'<article class="ticket"><div><b>Jogo '+(i+1)+'</b><button class="btn outline" data-action="copySaved" data-n="'+i+'">Copiar</button></div>'+balls(g)+'</article>').join(""):'<p class="muted">Nenhum jogo salvo.</p>')+'</section>';
}
function copyText(text){if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>popup("Jogo copiado!"),()=>fallbackCopy(text));else fallbackCopy(text)}
function fallbackCopy(text){const t=document.createElement("textarea");t.value=text;t.style.position="fixed";t.style.top="-1000px";document.body.append(t);t.select();let ok=document.execCommand("copy");t.remove();popup(ok?"Jogo copiado!":"Não foi possível copiar automaticamente.")}
function downloadCSV(){
 const c=["Jogo;Dezenas;Valor",...games.map((g,i)=>(i+1)+";"+g.map(number).join(" ")+";"+unit.toFixed(2).replace(".",","))].join("\n");
 const a=document.createElement("a"),u=URL.createObjectURL(new Blob(["\uFEFF"+c],{type:"text/csv;charset=utf-8"}));a.href=u;a.download="superfacil-jogos.csv";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
}
function getVersion(){fetch("./demo/version.json?v="+Date.now(),{cache:"no-store"}).then(r=>r.json()).then(d=>{if(d.release&&d.release!==version)$("#updateToast").classList.remove("hidden")}).catch(()=>{})}
document.body.addEventListener("click",e=>{
 const t=e.target.closest("[data-action]");if(!t)return;
 const a=t.dataset.action,n=Number(t.dataset.n);
 if(a==="slideprev"||a==="slidenext"||a==="slide"){slide=a==="slide"?Number(t.dataset.id):(slide+(a==="slideprev"?-1:1)+4)%4;render();return}
 if(a==="clear"){excluded=[];chosen=[];games=[];render();return}
 if(a==="toggleExclude"){
  if(excluded.includes(n))excluded=excluded.filter(x=>x!==n);
  else if(excluded.length>=5||((n%2===0)?parity(excluded)>=2:(excluded.length-parity(excluded))>=3)){popup("Limite de 2 pares e 3 ímpares nas exclusões.");return}
  else excluded=[...excluded,n].sort((x,y)=>x-y);
  chosen=[];games=[];render();return
 }
 if(a==="mode"){mode=t.dataset.id;chosen=[];games=[];render();return}
 if(a==="qty"){qty=n;chosen=[];games=[];render();return}
 if(a==="generate"){if(valid()){games=autoGames();render();popup(qty+" jogos montados com critérios históricos.")}return}
 if(a==="toggleManual"){if(!valid())return;chosen=chosen.includes(n)?chosen.filter(x=>x!==n):chosen.length<15?[...chosen,n].sort((x,y)=>x-y):chosen;render();return}
 if(a==="addManual"){if(!valid()||chosen.length!==15||games.length>=qty)return;const key=chosen.join("-");if(games.some(g=>g.join("-")===key)){popup("Jogo já incluído.");return}games.push([...chosen]);chosen=[];render();return}
 if(a==="copy"){copyText(games[n].map(number).join(" "));return}
 if(a==="copySaved"){copyText(saved[n].map(number).join(" "));return}
 if(a==="save"){saved=[...saved,...games].slice(-200);localStorage.setItem("superfacil-demo-games",JSON.stringify(saved));popup("Jogos salvos neste navegador.");return}
 if(a==="csv"){downloadCSV();return}
});
document.addEventListener("change",e=>{if(e.target.id==="contestSelect"){selectedContest=+e.target.value;render()}});
document.addEventListener("click",e=>{if(e.target.closest("#menuButton")){const d=$("#drawer");d.classList.toggle("hidden");$("#menuButton").setAttribute("aria-expanded",String(!d.classList.contains("hidden")))}else if(e.target.closest("#drawer a")){$("#drawer").classList.add("hidden")}else if(!e.target.closest("#drawer")){$("#drawer").classList.add("hidden")}});
$("#checkUpdate").addEventListener("click",()=>{getVersion();popup("Versão web verificada.");});
$("#reloadButton").addEventListener("click",()=>location.reload());
$("#closeUpdate").addEventListener("click",()=>$("#updateToast").classList.add("hidden"));
$("#ageyes").addEventListener("click",()=>{sessionStorage.setItem("sf-age-yes","1");$("#agegate").remove()});
$("#ageno").addEventListener("click",()=>{$("#gtitle").textContent="Acesso não permitido";$("#ageyes").remove();$("#ageno").remove();$("#agegate p").textContent="O SuperFácil é destinado exclusivamente a pessoas com 18 anos ou mais."});
if(sessionStorage.getItem("sf-age-yes")==="1")$("#agegate").remove();
window.addEventListener("hashchange",navigation);
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("#drawer").classList.add("hidden")});
setInterval(()=>{if(route()==="inicio"&&contests.length){slide=(slide+1)%4;render()}},7000);
setInterval(getVersion,300000);getVersion();
fetch("./demo/dados.json",{cache:"force-cache"}).then(r=>{if(!r.ok)throw Error("dados indisponíveis");return r.json()}).then(d=>{
 const arr=d.concursos;
 if(!Array.isArray(arr)||arr.length!==599||arr[0].numero!==3812||arr[598].numero!==3214||arr.some((x,i)=>!Array.isArray(x.dezenas)||x.dezenas.length!==15||new Set(x.dezenas).size!==15||x.numero!==3812-i))throw Error("Base inconsistente");
 contests=arr;navigation();
}).catch(()=>{loadError=true;render()});
