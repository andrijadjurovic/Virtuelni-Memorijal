"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, TreePine } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });

    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === "register" && !result.data.session) {
      setMessage("Proverite email da potvrdite registraciju.");
    } else {
      router.push("/");
    }
    setLoading(false);
  }

  return <main className="auth-shell">
    <section className="auth-panel">
      <div className="brand"><div className="brand-symbol"><TreePine size={18} /></div><div><strong>Virtuelni Memorijal</strong><span>Privatna porodična bašta</span></div></div>
      <p className="eyebrow"><LogIn size={13} /> Vaš prostor</p>
      <h1>{mode === "login" ? "Uđite u svoju baštu." : "Napravite svoju baštu."}</h1>
      <p className="auth-copy">Vaš prostor je privatan i počinje prazan. Vi odlučujete koje priče, cveće i svetlost će u njemu živeti.</p>
      <form onSubmit={submit} className="auth-form">
        <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Lozinka<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {message && <p className="form-error">{message}</p>}
        <button className="primary-action" disabled={loading}>{loading ? "Sačekajte..." : mode === "login" ? "Uloguj se" : "Registruj se"}</button>
      </form>
      <button className="auth-switch" onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); }}>{mode === "login" ? "Nemate nalog? Registrujte se" : "Već imate nalog? Ulogujte se"}</button>
    </section>
  </main>;
}