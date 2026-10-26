import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Home, Grid3x3, Ticket, Menu, Database, AlertTriangle, CheckCircle2, Loader2, ShieldCheck, Headset, MessageCircle, ClipboardCheck, Lightbulb, Settings, ExternalLink, X } from "lucide-react";
import { useState, useEffect, useRef, type ReactNode } from "react";
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
  { to: "/meus-jogos", label: "Meus jogos", icon: Ticket },
  { to: "/dicas", label: "Dicas", icon: Lightbulb },
  { to: "/mais", label: "Conta e configurações", icon: Settings },
] as const;

/** Rodapé compacto, sem faixa opaca, e menu de navegação recolhível. */
export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [whatsappMotion, setWhatsappMotion] = useState(false);
  const region = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (region.current && !region.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!whatsappMotion) return;
    const t = window.setTimeout(() => setWhatsappMotion(false), 420);
    return () => window.clearTimeout(t);
  }, [whatsappMotion]);

  return (
    <div ref={region} className="fixed inset-x-0 bottom-0 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]" aria-label="Rodapé do SuperFácil">
      <div className="pointer-events-auto mx-auto max-w-3xl px-2 pb-2">
        {open && (
          <nav id="menu-superfacil" aria-label="Menu principal" className="superfacil-menu absolute bottom-full right-2 mb-2 w-[min(19rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-border bg-popover p-2 text-foreground shadow-2xl">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="font-semibold text-sm">Navegação</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar menu" className="rounded-lg p-1.5 hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} aria-current={path === to ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${path === to ? "bg-primary/15 text-primary" : "hover:bg-accent"}`}>
                <Icon className="h-4 w-4" aria-hidden="true" /><span>{label}</span>
              </Link>
            ))}
          </nav>
        )}
        <footer className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10px] leading-tight text-muted-foreground" aria-label="Identificação e suporte">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-1 whitespace-nowrap"><ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Conexão HTTPS</span>
            <a href="https://transparencyreport.google.com/safe-browsing/search?url=superfacil-estrategia.lovable.app"
              target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
              aria-label="Consultar endereço no Google Safe Browsing (verificação externa, sem certificação oficial)">
              Verificar no Google <ExternalLink className="h-3 w-3" aria-hidden="true"/>
            </a>
            <a href="https://wa.me/5586994465882?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20para%20o%20SuperF%C3%A1cil."
              target="_blank" rel="noopener noreferrer" onClick={() => setWhatsappMotion(true)}
              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-1 text-primary transition-transform duration-200 active:scale-90 ${whatsappMotion ? "superfacil-whatsapp-pop" : ""}`}
              aria-label="Abrir atendimento via WhatsApp no número 86 99446-5882">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <Headset className="h-3 w-3" aria-hidden="true"/>
              <span className="font-semibold whitespace-nowrap">86 99446-5882</span>
            </a>
          </div>
          <button type="button" aria-controls="menu-superfacil" aria-expanded={open} aria-label={open ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            onClick={() => setOpen(v => !v)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-primary/15 px-3 py-2 text-xs font-bold text-primary transition-transform active:scale-95">
            <Menu className="h-5 w-5" aria-hidden="true" /> Menu
          </button>
          <p className="w-full text-center text-[9px] leading-tight opacity-90">
            Desenvolvido por <strong className="font-semibold text-foreground">Khassio Silva</strong>
            <span aria-hidden="true"> · </span>
            Gerenciado por <strong className="font-semibold text-foreground">Insight Marketing e Desenvolvimento</strong>
          </p>
        </footer>
      </div>
    </div>
  );
}

export function Page({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-xl px-4 pb-40 pt-5">
      <header className="mb-5 flex items-center justify-between">
        <Link to="/"><Logo /></Link>
        <span className="rounded-full border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">App independente · 18+</span>
      </header>
      {title && (
        <div className="mb-5">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
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