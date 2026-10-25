import { describe, expect, it } from "vitest";
import {
  TOTAL_COMBINACOES, TOTAL_LOTOFACIL, gerarJogos, paridade, repetidas,
  validarExclusoes, todasCombinacoes, restantes, distribuicaoRepetidas,
} from "./lotofacil";

const ex = [1, 2, 3, 4, 5];

describe("Lotofácil", () => {
  it("C(20,15) = 15504 e C(25,15) = 3268760", () => {
    expect(TOTAL_COMBINACOES).toBe(15504);
    expect(TOTAL_LOTOFACIL).toBe(3268760);
  });
  it("exige exatamente 5 exclusões", () => {
    expect(validarExclusoes([1, 2, 3, 4])).toBe(false);
    expect(validarExclusoes([1, 2, 3, 4, 5, 6])).toBe(false);
    expect(validarExclusoes(ex)).toBe(true);
    expect(() => gerarJogos([1, 2, 3, 4], 10)).toThrow();
  });
  it("gera 10 jogos distintos de 15 sem excluídas", () => {
    const jogos = gerarJogos(ex, 10);
    expect(jogos).toHaveLength(10);
    expect(new Set(jogos.map((j) => j.join())).size).toBe(10);
    for (const j of jogos) {
      expect(new Set(j).size).toBe(15);
      expect(j.some((d) => ex.includes(d))).toBe(false);
    }
  });
  it("todas as combinações são 15504 distintas", () => {
    const all = todasCombinacoes(restantes(ex));
    expect(all).toHaveLength(15504);
    expect(new Set(all.map((j) => j.join())).size).toBe(15504);
  });
  it("paridade e repetidas corretas", () => {
    const j = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    expect(paridade(j)).toEqual({ pares: 7, impares: 8 });
    expect(repetidas(j, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25])).toBe(5);
    expect(repetidas(j, null)).toBeNull();
  });
  it("não conta repetidas entre concursos não consecutivos", () => {
    const d = Array.from({ length: 15 }, (_, i) => i + 1);
    expect(distribuicaoRepetidas([
      { numero: 3713, data: "", dezenas: d },
      { numero: 3715, data: "", dezenas: d },
    ])).toEqual([]);
  });
});