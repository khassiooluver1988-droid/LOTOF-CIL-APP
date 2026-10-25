import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const Ctx = createContext<{ user: User | null; carregando: boolean }>({ user: null, carregando: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setCarregando(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return <Ctx.Provider value={{ user, carregando }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);