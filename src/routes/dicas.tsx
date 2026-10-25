import { createFileRoute } from "@tanstack/react-router";
import { AvisoResponsavel, Page } from "@/components/app/ui";
import { TOTAL_COMBINACOES, TOTAL_LOTOFACIL, binom, fmtNum } from "@/lib/lotofacil";

export const Route = createFileRoute("/dicas")({
  head: () => ({
    meta: [
      { title: "Dicas — SuperFácil" },
      { name: "description", content: "A matemática real da Lotofácil e dicas de jogo responsável." },
      { property: "og:title", content: "Dicas — SuperFácil" },
      { property: "og:description", content: "Matemática real e jogo responsável." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dicas,
});

// Probabilidade exata de k acertos em jogo simples de 15: C(15,k)·C(10,15-k)/C(25,15)
const faixas = [15, 14, 13, 12, 11].map((k) => ({ k, um_em: TOTAL_LOTOFACIL / (binom(15, k) * binom(10, 15 - k)) }));

const DICAS = [
  { t: "O que excluir 5 dezenas faz", d: `Você restringe os jogos a ${fmtNum(TOTAL_COMBINACOES)} combinações. Se o sorteio tiver alguma dezena excluída, nenhum desses jogos faz 15 pontos.` },
  { t: "Paridade (P/I)", d: "Contar pares e ímpares descreve sorteios passados. Padrões como 7P/8I aparecem mais porque existem mais combinações com esse formato, não por preferência do sorteio." },
  { t: "Repetidas", d: "Quantas dezenas de um concurso voltam no seguinte. É uma descrição histórica; cada sorteio é independente." },
  { t: "Frequência", d: "Dezenas mais sorteadas no passado não ficam mais prováveis no futuro." },
  { t: "Defina um limite", d: "Separe um valor para lazer e nunca tente recuperar perdas." },
];

function Dicas() {
  return (
    <Page title="Dicas" subtitle="Entenda o que as estatísticas dizem — e o que não dizem.">
      <section className="card-premium p-4">
        <h2 className="font-bold">Chances exatas de um jogo simples (15 dezenas)</h2>
        <table className="mt-2 w-full text-sm"><tbody>
          {faixas.map((f) => (
            <tr key={f.k} className="border-b last:border-0"><td className="py-1.5 font-semibold">{f.k} acertos</td><td className="text-right tabular-nums text-muted-foreground">1 em {fmtNum(Math.round(f.um_em * 100) / 100)}</td></tr>
          ))}
        </tbody></table>
      </section>
      <ul className="mt-4 space-y-3">
        {DICAS.map((x) => <li key={x.t} className="card-premium p-4"><h3 className="font-bold text-primary">{x.t}</h3><p className="mt-1 text-sm text-muted-foreground">{x.d}</p></li>)}
      </ul>
      <AvisoResponsavel />
    </Page>
  );
}