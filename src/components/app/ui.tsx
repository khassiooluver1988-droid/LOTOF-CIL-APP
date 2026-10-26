import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Home, Grid3x3, Ticket, Menu, Database, AlertTriangle, CheckCircle2, Loader2, ShieldCheck, Headset, MessageCircle, ClipboardCheck, Lightbulb, Settings, ExternalLink, X } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import trevo from "@/assets/trevo.svg";
import { baseQuery } from "@/lib/data";
import { fmt, fmtNum } from "@/lib/lotofacil";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <div className="flex items-center gap-2" aria-label="SuperFácil">
      <img src={trevo} alt="" width={lg ? 64 : 40} height={lg ? 64 : 40} className={lg ? "h-16 w-16" : "h-10 w-10"} />
      <div className="leading-none font-display">
        <div className={`font-extrabold text-foreground ${lg ? "text-4xl" : "text-xl"}`}>Super</div>
        <div className={`relative font-bold text-primary ${lg ? "text-2xl" : "text-sm"}`}>
          F
          <span className="relative inline-block">
            á
            <svg viewBox="0 0 24 14" className={`absolute left-1/2 -translate-x-1/2 fill-gold ${lg ? "-top-3.5 w-4" : "-top-2 w-2.5"}`} aria-hidden>
              <path d="M2 13 L1 3 L7 8 L12 1 L17 8 L23 3 L22 13 Z" />
            </svg>
          </span>
          cil
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/jogar", label: "Jogar", icon: Grid3x3 },
  { to: "/analise", label: "Análise", icon: BarChart3 },
  { to: "/resultados", label: "Análise de resultados", icon: ClipboardCheck },
  { to: "/meus-jogos", label: "Minhas estratégias", icon: Ticket },
  { to: "/dicas", label: "Dicas", icon: Lightbulb },
  { to: "/mais", label: "Conta e configurações", icon: Settings },
] as const;
const TOP_NAV = NAV.slice(0, 4);
const SUPORTE = "https://wa.me/5586994465882?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20SuperF%C3%A1cil.";

export function AppHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="sf-site-header">
      <div className="sf-head-inner">
        <div className="sf-topline">
          <Link to="/" className="sf-brand" aria-label="SuperFácil início" onClick={() => setOpen(false)}>
            <Logo />
          </Link>
          <nav className="sf-desktop-nav" aria-label="Navegação principal">
            {TOP_NAV.map(({ to, label, icon: Icon }) =>
              <Link key={to} to={to} aria-current={path === to ? "page" : undefined}
                className={`sf-nav-item ${path === to ? "sf-nav-active" : ""}`}>
                <Icon size={19} aria-hidden="true" /><span>{label}</span>
              </Link>)}
          </nav>
          <button type="button" className="sf-menu-button" onClick={() => setOpen(v => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open} aria-controls="sf-top-menu">
            {open ? <X size={23} /> : <Menu size={23} />} <span className="sf-menu-label">Menu</span>
          </button>
        </div>
        <nav className="sf-mobile-nav" aria-label="Acesso rápido">
          {TOP_NAV.map(({ to, label, icon: Icon }) =>
            <Link key={to} to={to} aria-current={path === to ? "page" : undefined}
              className={`sf-nav-item ${path === to ? "sf-nav-active" : ""}`}>
              <Icon size={18} aria-hidden="true" /><span>{label}</span>
            </Link>)}
        </nav>
        {open && <div className="sf-menu-overlay" onClick={() => setOpen(false)} aria-hidden="true" />}
        {open && <nav id="sf-top-menu" className="sf-dropnav" aria-label="Todas as seções">
          <div className="sf-dropnav-title">Navegação do aplicativo</div>
          {NAV.map(({ to, label, icon: Icon }) =>
            <Link key={to} to={to} className={`sf-drop-link ${path === to ? "sf-drop-active" : ""}`}
              onClick={() => setOpen(false)} aria-current={path === to ? "page" : undefined}>
              <Icon size={18} aria-hidden="true" />{label}
            </Link>)}
        </nav>}
      </div>
    </header>
  );
}

export function AppFooter() {
  const [motion, setMotion] = useState(false);
  const [secure, setSecure] = useState(false);
  useEffect(() => setSecure(window.location.protocol === "https:"), []);
  useEffect(() => {
    if (!motion) return;
    const id = window.setTimeout(() => setMotion(false), 450);
    return () => window.clearTimeout(id);
  }, [motion]);
  return (
    <footer className="sf-site-footer" aria-label="Rodapé e suporte">
      <div className="sf-foot-inner">
        <section className="sf-foot-credit">
          <p>Desenvolvido por</p><strong>Khassio Silva</strong>
          <p className="sf-foot-caption">Gerenciado por</p>
          <strong className="sf-foot-agency">Insight Marketing e Desenvolvimento</strong>
        </section>
        <section className="sf-foot-support">
          <div className="sf-foot-heading"><Headset size={21} aria-hidden="true"/> Suporte</div>
          <a href={SUPORTE} target="_blank" rel="noopener noreferrer"
            onClick={() => setMotion(true)} className={`sf-whatsapp ${motion ? "sf-whatsapp-pulse" : ""}`}
            aria-label="Falar com suporte pelo WhatsApp 86 99446-5882">
            <MessageCircle size={22} aria-hidden="true" /> (86) 99446-5882
          </a>
          <span className="sf-foot-small">Atendimento via WhatsApp</span>
        </section>
        <section className="sf-foot-security">
          <div className="sf-foot-heading"><ShieldCheck size={23} className="sf-green" aria-hidden="true" /> {secure ? "Conexão HTTPS" : "Verifique sua conexão"}</div>
          <a className="sf-google-link" target="_blank" rel="noopener noreferrer"
            href="https://transparencyreport.google.com/safe-browsing/search?url=superfacil-estrategia.lovable.app"
            aria-label="Consultar endereço no Google Safe Browsing — verificação externa, sem certificação ou parceria">
            <span aria-hidden="true" className="sf-google-word"><b>G</b><b>o</b><b>o</b><b>g</b><b>l</b><b>e</b></span>
            <ShieldCheck size={22} aria-hidden="true"/><ExternalLink size={13} aria-hidden="true"/>
          </a>
          <span className="sf-foot-small">Consultar Safe Browsing · sem certificação Google</span>
        </section>
      </div>
      <div className="sf-foot-legal">Ferramenta independente da CAIXA · 18+ · A análise histórica não prevê sorteios futuros.</div>
    </footer>
  );
}

export function Page({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-12 pt-6">
      <div className="mb-4 flex justify-end">
        <span className="rounded-full border border-border px-3 py-1 text-[10px] font-semibold text-muted-foreground">Aplicativo independente · 18+</span>
      </div>
      {title && <header className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </header>}
      {children}
    </main>
  );
}

export function Bola({ n, tom = "base" }: { n: number; tom?: "base" | "lime" | "red" | "ghost" }) {
  const cls = {
    base: "bg-secondary text-foreground",
    lime: "bg-primary text-primary-foreground",
    red: "bg-destructive text-destructive-foreground",
    ghost: "bg-muted/60 text-muted-foreground",
  }[tom];
  return <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold tabular-nums ${cls}`}>{fmt(n)}</span>;
}

export function BaseStatus() {
  const { data, isLoading } = useQuery(baseQuery);
  if (isLoading || !data)
    return <div className="card-premium flex items-center gap-3 p-4 text-sm"><Loader2 className="h-5 w-5 animate-spin" /> Verificando base de concursos…</div>;
  if (data.modo === "demo")
    return (
      <div className="card-premium p-4">
        <div className="flex items-center gap-2 font-semibold text-warning"><AlertTriangle className="h-5 w-5" /> Modo demonstração</div>
        <p className="mt-1 text-sm text-muted-foreground">Backend indisponível. Jogos ficam salvos só neste aparelho. Veja “Mais → Configuração”.</p>
      </div>
    );
  if (data.modo === "vazia")
    return (
      <div className="card-premium p-4">
        <div className="flex items-center gap-2 font-semibold"><Database className="h-5 w-5 text-warning" /> Base ainda não sincronizada</div>
        <p className="mt-1 text-sm text-muted-foreground">Nenhum concurso importado. A geração combinatória funciona; análises históricas aparecem após a importação.</p>
      </div>
    );
  const c = data.concursos;
  if (!c.length) return null;
  const ultimo = c[0]!;
  return (
    <div className="card-premium p-4">
      <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5 text-primary" /> Base sincronizada</div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-muted/60 p-2"><dt className="text-[10px] uppercase text-muted-foreground">Concursos</dt><dd className="font-display text-lg font-bold">{fmtNum(c.length)}</dd></div>
        <div className="rounded-xl bg-muted/60 p-2"><dt className="text-[10px] uppercase text-muted-foreground">Faixa</dt><dd className="font-display text-sm font-bold">{c[c.length - 1]!.numero}–{ultimo.numero}</dd></div>
        <div className="rounded-xl bg-muted/60 p-2"><dt className="text-[10px] uppercase text-muted-foreground">Último</dt><dd className="font-display text-sm font-bold">{new Date(ultimo.data + "T12:00").toLocaleDateString("pt-BR")}</dd></div>
      </dl>
      {data.importacao && <p className="mt-2 text-xs text-muted-foreground">Última importação: {data.importacao.status} · {data.importacao.linhas} linhas · {new Date(data.importacao.data).toLocaleString("pt-BR")}</p>}
    </div>
  );
}

export function AvisoResponsavel() {
  return (
    <aside className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs leading-relaxed text-muted-foreground">
      <strong className="text-warning">Jogo responsável · 18+.</strong> Loteria é entretenimento, não investimento. Em sorteios honestos, todo jogo simples de 15 dezenas tem a mesma chance de 15 acertos (1 em 3.268.760). Nenhuma análise prevê resultados. O SuperFácil é independente e não tem vínculo com a CAIXA. Precisa de ajuda? Ligue 188 (CVV).
    </aside>
  );
}