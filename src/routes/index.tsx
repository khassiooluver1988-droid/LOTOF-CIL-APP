import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Lightbulb, ArrowRight } from "lucide-react";
import { AvisoResponsavel, BaseStatus, Logo } from "@/components/app/ui";
import { TOTAL_COMBINACOES, fmtNum } from "@/lib/lotofacil";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SuperFácil — Análise estatística da Lotofácil" },
      { name: "description", content: "Exclua 5 dezenas, gere jogos válidos de 15 e analise paridade, repetidas e frequências com dados reais." },
      { property: "og:title", content: "SuperFácil — Análise estatística da Lotofácil" },
      { property: "og:description", content: "Gere jogos válidos e veja estatísticas reais, sem promessas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="mx-auto max-w-xl px-4 pb-40 pt-10">
      <div className="flex flex-col items-center text-center">
        <Logo size="lg" />
        <h1 className="mt-8 text-3xl font-extrabold leading-tight">
          Análise estatística da <span className="text-primary">Lotofácil</span>, sem mágica.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Exclua 5 dezenas e gere jogos distintos entre as {fmtNum(TOTAL_COMBINACOES)} combinações possíveis das 20 restantes.
        </p>
      </div>
      <div className="mt-8"><BaseStatus /></div>
      <Link to="/jogar" className="bg-lime-gradient shadow-glow mt-6 flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold text-primary-foreground transition-transform active:scale-[0.98]">
        <Sparkles className="h-5 w-5" /> Gerar jogos
      </Link>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link to="/analise" className="card-premium flex items-center justify-between p-4 text-sm font-semibold">Ver análise <ArrowRight className="h-4 w-4" /></Link>
        <Link to="/dicas" className="card-premium flex items-center justify-between p-4 text-sm font-semibold"><span className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-gold" />Dicas</span><ArrowRight className="h-4 w-4" /></Link>
      </div>
      <AvisoResponsavel />
    </main>
  );
}