import { supabase } from "@/integrations/supabase/client";

export type JogoSalvo = {
  id: string;
  exclusoes: number[];
  dezenas: number[];
  concurso_referencia: number | null;
  criado_em: string;
  local?: boolean;
};

const KEY = "superfacil.jogos.demo";

// Persistência local apenas em modo demonstração (backend indisponível).
export function lerLocais(): JogoSalvo[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
export function salvarLocais(novos: Omit<JogoSalvo, "id" | "criado_em">[]) {
  const atuais = lerLocais();
  const agora = new Date().toISOString();
  const add = novos.map((j) => ({ ...j, id: crypto.randomUUID(), criado_em: agora, local: true }));
  localStorage.setItem(KEY, JSON.stringify([...add, ...atuais]));
}
export function apagarLocal(id: string) {
  localStorage.setItem(KEY, JSON.stringify(lerLocais().filter((j) => j.id !== id)));
}

export async function salvarNuvem(userId: string, novos: Omit<JogoSalvo, "id" | "criado_em">[]) {
  const rows = novos.map((j) => ({ usuario: userId, exclusoes: j.exclusoes, dezenas: j.dezenas, concurso_referencia: j.concurso_referencia }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from("jogos").insert(rows.slice(i, i + 500));
    if (error) throw error;
  }
}
export async function listarNuvem(): Promise<JogoSalvo[]> {
  const { data, error } = await supabase
    .from("jogos").select("id,exclusoes,dezenas,concurso_referencia,criado_em")
    .order("criado_em", { ascending: false }).limit(1000);
  if (error) throw error;
  return data as JogoSalvo[];
}
export async function apagarNuvem(id: string) {
  const { error } = await supabase.from("jogos").delete().eq("id", id);
  if (error) throw error;
}