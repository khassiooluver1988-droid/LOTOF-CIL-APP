import {
  gerarJogos, paridade, repetidas, restantes, todasCombinacoes,
  validarExclusoes, type Concurso,
} from "./lotofacil";

/** Regra acordada: entre as 5 excluídas, exatamente 2 pares e 3 ímpares. */
export function validarExclusoesEstrategicas(exclusoes: number[]): boolean {
  return validarExclusoes(exclusoes) && paridade(exclusoes).pares === 2 && paridade(exclusoes).impares === 3;
}

export type EstatisticasPadrao = {
  concursosAnalisados: number;
  concursoReferencia: number | null;
  paresUltimoConcurso: number | null;
  imparesUltimoConcurso: number | null;
  repetidasNoUltimo: number | null;
  disponibilidade: "historico" | "sem_historico";
};

/** Medidas observadas, não previsão de chances de acerto. */
export function estatisticasPadrao(concursos: Concurso[]): EstatisticasPadrao {
  const ord = [...concursos].sort((a, b) => b.numero - a.numero);
  const ultimo = ord[0];
  const anterior = ord[1];
  const p = ultimo ? paridade(ultimo.dezenas) : null;
  return {
    concursosAnalisados: ord.length,
    concursoReferencia: ultimo?.numero ?? null,
    paresUltimoConcurso: p?.pares ?? null,
    imparesUltimoConcurso: p?.impares ?? null,
    repetidasNoUltimo: ultimo && anterior ? repetidas(ultimo.dezenas, anterior.dezenas) : null,
    disponibilidade: ord.length >= 2 ? "historico" : "sem_historico",
  };
}

export function gerarJogosComPadroes(exclusoes: number[], quantidade: number, concursos: Concurso[]): number[][] {
  if (!validarExclusoesEstrategicas(exclusoes)) {
    throw new Error("Exclua exatamente duas dezenas pares e três ímpares.");
  }
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 100) {
    throw new Error("Escolha entre 1 e 100 jogos.");
  }
  const ord = [...concursos].sort((a, b) => b.numero - a.numero);
  if (ord.length < 2) return gerarJogos(exclusoes, quantidade);

  const historicoPares = new Map<number, number>();
  const historicoRepetidas = new Map<number, number>();
  for (let i = 0; i < ord.length; i++) {
    const p = paridade(ord[i]!.dezenas).pares;
    historicoPares.set(p, (historicoPares.get(p) ?? 0) + 1);
    if (i + 1 < ord.length) {
      const n = repetidas(ord[i]!.dezenas, ord[i + 1]!.dezenas);
      if (n !== null) historicoRepetidas.set(n, (historicoRepetidas.get(n) ?? 0) + 1);
    }
  }
  const referencia = ord[0]!.dezenas;
  const todos = todasCombinacoes(restantes(exclusoes));
  const pontuados = todos.map((dezenas) => {
    const pares = paridade(dezenas).pares;
    const r = repetidas(dezenas, referencia) ?? 0;
    const score = (historicoPares.get(pares) ?? 0) / ord.length +
      (historicoRepetidas.get(r) ?? 0) / (ord.length - 1);
    return { dezenas, score };
  }).sort((a, b) => b.score - a.score || a.dezenas.join(",").localeCompare(b.dezenas.join(",")));

  const selecionados: number[][] = [];
  for (const maxIntersecao of [11, 12, 13, 14, 15]) {
    for (const { dezenas } of pontuados) {
      if (selecionados.length >= quantidade) return selecionados;
      if (selecionados.some((jogo) => jogo.join(",") === dezenas.join(","))) continue;
      const d = new Set(dezenas);
      if (selecionados.every((jogo) => jogo.filter(n => d.has(n)).length <= maxIntersecao)) {
        selecionados.push(dezenas);
      }
    }
  }
  return selecionados.slice(0, quantidade);
}
