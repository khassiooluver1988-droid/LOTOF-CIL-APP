import { describe, it, expect } from "vitest";
import { gerarJogosComPadroes, validarExclusoesEstrategicas, estatisticasPadrao } from "./padroes";
import { restantes, validarJogo, paridade, type Concurso } from "./lotofacil";

const excluidas = [2, 8, 1, 5, 11];
const fakeHistory: Concurso[] = [
 { numero: 3, data:"2026-01-03",dezenas:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
 { numero: 2, data:"2026-01-02",dezenas:[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18] },
 { numero: 1, data:"2026-01-01",dezenas:[9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] },
];

describe("SuperFácil 2.0 — exclusões", () => {
 it("permite exatamente duas pares e três ímpares", () => {
   expect(validarExclusoesEstrategicas(excluidas)).toBe(true);
   expect(validarExclusoesEstrategicas([2,4,6,1,3])).toBe(false);
   expect(validarExclusoesEstrategicas([2,8,1,5])).toBe(false);
 });
 it("deixa dez pares e dez ímpares disponíveis", () => {
   const p=paridade(restantes(excluidas));
   expect(p).toEqual({pares:10,impares:10});
 });
 it("gera jogos distintos de 15 dezenas sem excluídas", () => {
   for (const hist of [fakeHistory, []]) {
     const jogos=gerarJogosComPadroes(excluidas, 10, hist);
     expect(jogos).toHaveLength(10);
     expect(new Set(jogos.map(x=>x.join(","))).size).toBe(10);
     for (const j of jogos) expect(validarJogo(j,excluidas)).toBe(true);
   }
 });
 it("não fabrica padrão quando não há dados", () => {
   expect(estatisticasPadrao([]).disponibilidade).toBe("sem_historico");
 });
});
