"use client";

import { motion } from "framer-motion";
import { AudioLines, CalendarDays, Flower2, Heart, MapPin, X } from "lucide-react";

export default function MemorialModal({ memorial, onClose }) {
  if (!memorial) return null;
  const purchaseGift = async (giftType) => {
    const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memorialId: memorial.id, giftType }) });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
  };
  return <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30 }} className="memorial-modal">
    <button className="icon-button close-button" onClick={onClose} aria-label="Zatvori memorijal"><X size={20} /></button>
    <div className="modal-cover" />
    <div className="modal-content">
      <div className="profile-heading"><div className="profile-mark">{memorial.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</div><div><p className="eyebrow">{memorial.isPet ? "Pet memorijal" : "Priča o životu"}</p><h2>{memorial.name}</h2><p className="muted"><CalendarDays size={14} /> {memorial.birthDate} — {memorial.deathDate}</p></div></div>
      <p className="bio">{memorial.bio}</p>
      <div className="quote"><Heart size={16} fill="currentColor" /> „Čovek živi dok živi sećanje na njega.“</div>
      <section><div className="section-title"><span><CalendarDays size={16} /> Vremenska linija</span><small>{memorial.timeline.length} zapisa</small></div>{memorial.timeline.map((event) => <div className="timeline-item" key={event.year}><strong>{event.year}</strong><div><h3>{event.title}</h3><p>{event.description}</p></div></div>)}</section>
      <section><div className="section-title"><span><AudioLines size={16} /> Audio sećanje</span></div><div className="audio-card"><AudioLines size={20} /><div><strong>Glas koji pamtimo</strong><small>Poruka porodice · 02:48</small></div><button className="play-button" aria-label="Pusti audio">▶</button></div></section>
      <section><div className="section-title"><span><Flower2 size={16} /> Ostavi trag</span></div><div className="gift-grid"><button onClick={() => purchaseGift("DIGITAL_CANDLE")}><span>🕯</span><strong>Sveća</strong><small>48 sati · 2,99 €</small></button><button onClick={() => purchaseGift("FLOWER_BOUQUET")}><span>✿</span><strong>Buket</strong><small>14 dana · 6,99 €</small></button></div></section>
      <div className="location"><MapPin size={15} /> Sektor Borova · parcela 014</div>
    </div>
  </motion.aside>;
}