import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, Lightbulb, User, Database, ShieldAlert, RefreshCcw, ExternalLink } from "lucide-react";
import { VERSAO_APP } from "@/lib/version";
import { AvisoResponsavel, BaseStatus, Page } from "@/components/app/ui";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/mais")({
  head: () => ({
    meta: [
      { title: "Mais — SuperFácil" },
      { name: "description", content: "Conta, base de dados, configuração e informações do SuperFácil." },
      { property: "og:title", content: "Mais — SuperFácil" },
      { property: "og:description", content: "Conta, base e configuração." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Mais,
});

function Mais() {
  const { user } = useAuth();
  return (
    <Page title="Mais">
      <section className="card-premium p-4">
        <h2 className="flex items-center gap-2 font-bold"><User className="h-4 w-4" /> Conta</h2>
        {user ? (
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="truncate text-muted-foreground">{user.email}</span>
            <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold"><LogOut className="h-3.5 w-3.5" /> Sair</button>
          </div>
        ) : <Link to="/entrar" className="mt-2 inline-block text-sm font-semibold text-primary underline">Entrar ou criar conta</Link>}
      </section>

      <Link to="/dicas" className="card-premium mt-3 flex items-center gap-2 p-4 font-bold"><Lightbulb className="h-4 w-4 text-gold" /> Dicas e matemática da Lotofácil</Link>

      <section className="mt-3"><BaseStatus /></section>

      <section className="card-premium mt-3 p-4 text-sm">
        <h2 className="flex items-center gap-2 font-bold"><Database className="h-4 w-4" /> Configuração da base</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Fonte prevista: planilha <strong>Base20_Resultados_Lotofacil.xlsx</strong> (concursos 3713 a 3812, já importados).</li>
          <li>Somente resultados efetivos são aceitos; concursos faltantes nunca são preenchidos.</li>
          <li>As análises usam a janela móvel dos 599 concursos mais recentes disponíveis.</li>
          <li>Integração com resultados oficiais da CAIXA ainda não implementada.</li>
          <li>Passo a passo de importação está no README do projeto.</li>
        </ul>
      </section>

      <section className="card-premium mt-3 p-4 text-sm">
        <h2 className="flex items-center gap-2 font-bold"><ShieldAlert className="h-4 w-4 text-warning" /> Sobre</h2>
        <p className="mt-2 text-muted-foreground">SuperFácil é uma ferramenta independente de estatística. Não é um app oficial, não vende apostas e não tem relação com a CAIXA ou Loterias CAIXA.</p>
      </section>

      <section className="card-premium mt-3 p-4 text-sm">
        <h2 className="flex items-center gap-2 font-bold"><RefreshCcw className="h-4 w-4 text-primary" /> Atualizar aplicativo</h2>
        <p className="mt-2 text-muted-foreground">Versão web {VERSAO_APP}. Se houver uma nova versão web publicada, o SuperFácil mostra um aviso para recarregar. A atualização do APK Android pode exigir uma nova instalação.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={()=>window.location.reload()}
            className="rounded-lg bg-primary px-3 py-2 font-bold text-primary-foreground">Verificar atualização web</button>
          <a target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-bold text-primary"
            href="https://github.com/khassiooluver1988-droid/LOTOF-CIL-APP/releases">
            Versões Android <ExternalLink size={14}/>
          </a>
        </div>
      </section>
      <AvisoResponsavel />
    </Page>
  );
}