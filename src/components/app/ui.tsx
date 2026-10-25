import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Home, Grid3x3, Ticket, Menu, Database, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
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
  { to: "/meus-jogos", label: "Meus jogos", icon: Ticket },
  { to: "/mais", label: "Mais", icon: Menu },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]" aria-label="Navegação principal">
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {NAV.map(({ to, label, icon: Icon }) => {
          const ativo = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <li key={to}>
              <Link to={to} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${ativo ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Page({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-xl px-4 pb-28 pt-5">
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
  const ultimo = c[0];
  return (
    <div className="card-premium p-4">
      <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5 text-primary" /> Base sincronizada</div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-muted/60 p-2"><dt className="text-[10px] uppercase text-muted-foreground">Concursos</dt><dd className="font-display text-lg font-bold">{fmtNum(c.length)}</dd></div>
        <div className="rounded-xl bg-muted/60 p-2"><dt className="text-[10px] uppercase text-muted-foreground">Faixa</dt><dd className="font-display text-sm font-bold">{c[c.length - 1].numero}–{ultimo.numero}</dd></div>
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