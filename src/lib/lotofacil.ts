// Núcleo matemático do SuperFácil. Todas as contas são exatas.
export const DEZENAS = Array.from({ length: 25 }, (_, i) => i + 1);
export const QTD_EXCLUSOES = 5;
export const TAMANHO_JOGO = 15;
export const JANELA_CONCURSOS = 599;
export const MAX_PADRAO = 100;

export function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

/** C(20,15) = 15.504 jogos possíveis com as 20 restantes. */
export const TOTAL_COMBINACOES = binom(25 - QTD_EXCLUSOES, TAMANHO_JOGO);
/** C(25,15) = 3.268.760 jogos simples possíveis na Lotofácil. */
export const TOTAL_LOTOFACIL = binom(25, TAMANHO_JOGO);

export function restantes(exclusoes: number[]): number[] {
  const ex = new Set(exclusoes);
  return DEZENAS.filter((d) => !ex.has(d));
}

export function validarExclusoes(exclusoes: number[]): boolean {
  return (
    exclusoes.length === QTD_EXCLUSOES &&
    new Set(exclusoes).size === QTD_EXCLUSOES &&
    exclusoes.every((d) => Number.isInteger(d) && d >= 1 && d <= 25)
  );
}

export function validarJogo(jogo: number[], exclusoes: number[] = []): boolean {
  const ex = new Set(exclusoes);
  return (
    jogo.length === TAMANHO_JOGO &&
    new Set(jogo).size === TAMANHO_JOGO &&
    jogo.every((d) => Number.isInteger(d) && d >= 1 && d <= 25 && !ex.has(d))
  );
}

/** Enumera todas as combinações de 15 dentre as 20 restantes (removendo 5). */
export function todasCombinacoes(pool: number[]): number[][] {
  const out: number[][] = [];
  const n = pool.length;
  const remover = n - TAMANHO_JOGO;
  const idx = Array.from({ length: remover }, (_, i) => i);
  while (true) {
    const fora = new Set(idx);
    out.push(pool.filter((_, i) => !fora.has(i)));
    let i = remover - 1;
    while (i >= 0 && idx[i] === n - remover + i) i--;
    if (i < 0) break;
    idx[i]++;
    for (let j = i + 1; j < remover; j++) idx[j] = idx[j - 1] + 1;
  }
  return out;
}

export function gerarJogos(
  exclusoes: number[],
  quantidade: number,
  rng: () => number = Math.random,
): number[][] {
  if (!validarExclusoes(exclusoes)) throw new Error("Selecione exatamente 5 dezenas excluídas.");
  const pool = restantes(exclusoes);
  const q = Math.max(1, Math.min(Math.floor(quantidade), TOTAL_COMBINACOES));
  if (q === TOTAL_COMBINACOES) return todasCombinacoes(pool);
  const vistos = new Set<string>();
  const jogos: number[][] = [];
  while (jogos.length < q) {
    const arr = [...pool];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const jogo = arr.slice(0, TAMANHO_JOGO).sort((a, b) => a - b);
    const chave = jogo.join("-");
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    jogos.push(jogo);
  }
  return jogos;
}

export function paridade(dezenas: number[]) {
  const pares = dezenas.filter((d) => d % 2 === 0).length;
  return { pares, impares: dezenas.length - pares };
}

export function repetidas(jogo: number[], anterior: number[] | null | undefined): number | null {
  if (!anterior || anterior.length !== TAMANHO_JOGO) return null;
  const s = new Set(anterior);
  return jogo.filter((d) => s.has(d)).length;
}

export type Concurso = { numero: number; data: string; dezenas: number[] };

/** Frequência de cada dezena nos concursos fornecidos (ordem decrescente). */
export function rankingFrequencia(concursos: Concurso[]) {
  const cont = new Map<number, number>(DEZENAS.map((d) => [d, 0]));
  for (const c of concursos) for (const d of c.dezenas) cont.set(d, (cont.get(d) ?? 0) + 1);
  return [...cont.entries()]
    .map(([dezena, vezes]) => ({ dezena, vezes }))
    .sort((a, b) => b.vezes - a.vezes || a.dezena - b.dezena);
}

/** Distribuição contada (não estimada) de pares por concurso. */
export function distribuicaoParidade(concursos: Concurso[]) {
  const m = new Map<string, number>();
  for (const c of concursos) {
    const { pares, impares } = paridade(c.dezenas);
    const k = `${pares}P/${impares}I`;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([padrao, vezes]) => ({ padrao, vezes })).sort((a, b) => b.vezes - a.vezes);
}

/** Repetidas entre cada concurso e o imediatamente anterior (exige números consecutivos). */
export function distribuicaoRepetidas(concursos: Concurso[]) {
  const ord = [...concursos].sort((a, b) => a.numero - b.numero);
  const m = new Map<number, number>();
  for (let i = 1; i < ord.length; i++) {
    if (ord[i].numero !== ord[i - 1].numero + 1) continue; // não inventa faltantes
    const r = repetidas(ord[i].dezenas, ord[i - 1].dezenas)!;
    m.set(r, (m.get(r) ?? 0) + 1);
  }
  return [...m.entries()].map(([rep, vezes]) => ({ rep, vezes })).sort((a, b) => a.rep - b.rep);
}

/** Combinação P/I/R contada nos concursos consecutivos disponíveis. */
export function distribuicaoPIR(concursos: Concurso[]) {
  const ord = [...concursos].sort((a, b) => a.numero - b.numero);
  const m = new Map<string, number>();
  for (let i = 1; i < ord.length; i++) {
    if (ord[i].numero !== ord[i - 1].numero + 1) continue;
    const { pares, impares } = paridade(ord[i].dezenas);
    const r = repetidas(ord[i].dezenas, ord[i - 1].dezenas)!;
    const k = `${pares}P/${impares}I/${r}R`;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([padrao, vezes]) => ({ padrao, vezes })).sort((a, b) => b.vezes - a.vezes);
}

export const fmt = (d: number) => String(d).padStart(2, "0");
export const fmtNum = (n: number) => n.toLocaleString("pt-BR");