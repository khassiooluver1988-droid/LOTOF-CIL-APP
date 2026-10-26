import { useEffect, useState } from "react";
import { ShieldAlert, RefreshCw, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/app/ui";
import { RELEASE_ID, VERSAO_APP } from "@/lib/version";

export function AppSplash() {
  const [ok,setOk]=useState<boolean|null>(null);
  const [bloqueado,setBloqueado]=useState(false);
  useEffect(()=>{
    try {setOk(window.sessionStorage.getItem("superfacil-18-confirmado")==="sim");}
    catch {setOk(false);}
  },[]);
  if (ok===null || ok) return null;
  return <div className="sf-splash-backdrop" role="dialog" aria-modal="true" aria-label="Confirmação de maioridade">
    <div className="sf-splash-content">
      <div className="sf-splash-logo"><Logo size="lg"/></div>
      <div className="sf-splash-age"><ShieldAlert size={31}/> 18+</div>
      {bloqueado? <>
        <h2>Acesso não permitido</h2><p>O SuperFácil é destinado exclusivamente a pessoas maiores de 18 anos.</p>
      </>:<>
        <h2>Bem-vindo ao SuperFácil</h2>
        <p>Aplicativo de análise estatística da Lotofácil. Destinado somente a maiores de 18 anos. Loteria é entretenimento, não investimento.</p>
        <button className="sf-splash-enter" type="button" onClick={()=>{
          try{window.sessionStorage.setItem("superfacil-18-confirmado","sim");}catch{}
          setOk(true);
        }}>Confirmo ter 18 anos ou mais</button>
        <button className="sf-splash-decline" type="button" onClick={()=>setBloqueado(true)}>Sou menor de 18 anos</button>
      </>}
      <small>Versão {VERSAO_APP} · Independente da CAIXA</small>
    </div>
  </div>;
}

export function AppUpdate() {
  const [newVersion,setNewVersion]=useState<string|null>(null);
  useEffect(()=>{
    let mounted=true;
    const check=async()=>{
      try {
        const r=await fetch("/version.json?check="+Date.now(),{cache:"no-store"});
        if(!r.ok)return;
        const o: unknown=await r.json();
        if(typeof o==="object"&&o!==null && "release" in o && typeof o.release==="string" && o.release!==RELEASE_ID && mounted) {
          setNewVersion(o.release);
        }
      }catch{}
    };
    void check();
    const interval=window.setInterval(()=>void check(),300000);
    return ()=>{mounted=false;window.clearInterval(interval);};
  },[]);
  if(!newVersion)return null;
  return <aside className="sf-update-banner" role="status">
    <RefreshCw size={20}/>
    <span>Nova versão do aplicativo disponível.</span>
    <button type="button" onClick={()=>window.location.reload()}>Atualizar agora</button>
    <button type="button" onClick={()=>setNewVersion(null)} aria-label="Dispensar aviso">×</button>
  </aside>;
}
