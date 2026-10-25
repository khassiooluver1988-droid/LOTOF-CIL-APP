import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/app/ui";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — SuperFácil" },
      { name: "description", content: "Entre ou crie sua conta SuperFácil para salvar jogos." },
      { property: "og:title", content: "Entrar — SuperFácil" },
      { property: "og:description", content: "Acesse sua conta SuperFácil." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const nav = useNavigate();

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        toast.success("Bem-vindo!");
        nav({ to: "/meus-jogos" });
      } else {
        const { error } = await supabase.auth.signUp({ email, password: senha, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally { setEnviando(false); }
  };

  return (
    <Page title={modo === "entrar" ? "Entrar" : "Criar conta"} subtitle="Necessário para salvar seus jogos.">
      <form onSubmit={enviar} className="card-premium space-y-3 p-5">
        <label className="block text-sm font-semibold">E-mail
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border bg-input/30 px-3 py-3" />
        </label>
        <label className="block text-sm font-semibold">Senha
          <input type="password" required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} className="mt-1 w-full rounded-xl border bg-input/30 px-3 py-3" />
        </label>
        <p className="text-xs text-muted-foreground">Ao continuar, você declara ter 18 anos ou mais.</p>
        <button disabled={enviando} className="bg-lime-gradient w-full rounded-xl py-3 font-bold text-primary-foreground disabled:opacity-50">
          {enviando ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta"}
        </button>
        <button type="button" onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")} className="w-full text-sm text-primary underline">
          {modo === "entrar" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
        </button>
      </form>
    </Page>
  );
}