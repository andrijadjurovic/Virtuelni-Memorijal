"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Flower2, Heart, Plus, TreePine } from "lucide-react";

const initialForm = { name: "", birthDate: "", deathDate: "", bio: "", isPet: false };

export default function OwnerDashboard() {
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState("idle");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setState("saving");
    const response = await fetch("/api/memorials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setState(response.ok ? "saved" : "error");
    if (response.ok) setForm(initialForm);
  }

  return <main className="owner-shell"><header className="owner-topbar"><Link className="back-link" href="/"><ArrowLeft size={16} /> Park sećanja</Link><div className="brand"><div className="brand-symbol"><TreePine size={18} /></div><div><strong>Virtuelni Memorijal</strong><span>Porodični prostor</span></div></div><span className="owner-status"><i /> Radna verzija</span></header><div className="owner-layout"><section className="owner-intro"><p className="eyebrow"><Heart size={13} /> Moja porodica</p><h1>Sačuvaj<br /><em>jednu priču.</em></h1><p>Napravite memorijalni prostor koji čuva ime, glas i male trenutke koji ne treba da se zaborave.</p><div className="owner-note"><Flower2 size={16} /><span>Podaci se čuvaju u vašoj bazi.</span></div></section><form className="owner-form" onSubmit={submit}><div className="form-heading"><span className="form-step">01</span><div><p className="eyebrow">Novi memorijal</p><h2>Osnovni podaci</h2></div></div><label>Ime i prezime<input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Na primer: Milena Petrović" /></label><div className="date-row"><label>Rođen/a<input type="date" value={form.birthDate} onChange={(event) => update("birthDate", event.target.value)} /></label><label>Preminuo/la<input type="date" value={form.deathDate} onChange={(event) => update("deathDate", event.target.value)} /></label></div><label>Biografija<textarea rows="5" value={form.bio} onChange={(event) => update("bio", event.target.value)} placeholder="Nekoliko rečenica o životu, karakteru i onome što pamtite..." /></label><label className="check-label"><input type="checkbox" checked={form.isPet} onChange={(event) => update("isPet", event.target.checked)} /><span>Ovo je pet memorijal</span></label>{state === "saved" && <p className="form-success"><Check size={15} /> Memorijal je sačuvan.</p>}{state === "error" && <p className="form-error">Memorijal nije sačuvan. Pokušajte ponovo.</p>}<button className="primary-action" disabled={state === "saving"}><Plus size={17} /> {state === "saving" ? "Čuvanje..." : "Sačuvaj memorijal"}</button></form></div></main>;
}