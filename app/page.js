"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { CloudFog, CloudRain, Flower2, Search, SlidersHorizontal, Sparkles, Sun, TreePine, Wind, X, Zap } from "lucide-react";
import MemorialModal from "@/components/ui/MemorialModal";

const CemeteryScene = dynamic(() => import("@/components/3d/CemeteryScene"), {
  ssr: false,
  loading: () => <div className="scene-loading">Ucitavanje memorijalnog parka...</div>,
});

const memorials = [
  { id: "1", name: "Milena Petrovic", birthDate: "12. mart 1948.", deathDate: "04. jun 2021.", bio: "Uciteljica, bastovanka i tiha snaga nase porodice. Volela je jutarnju kafu, miris lipe i decu koja postavljaju mnogo pitanja.", x: -4, z: -2, isPet: false, timeline: [{ year: 1948, title: "Rodena u Beogradu", description: "Prvi dan proleca doneo je porodici Petrovic najmladu cerku." }, { year: 1972, title: "Postala uciteljica", description: "Cetrdeset generacija ucenika nosilo je njenu dobrotu sa sobom." }, { year: 2021, title: "Ostaje sa nama", description: "Njene price nastavljaju da zive u svakom skolskom dvoristu." }], gifts: [{ id: "g1", giftType: "DIGITAL_CANDLE", activeUntil: "2030-01-01" }] },
  { id: "2", name: "Vladimir Jovanovic", birthDate: "03. oktobar 1939.", deathDate: "18. januar 2018.", bio: "Arhitekta ciji su mostovi povezivali vise od obala. U svakoj liniji crteza trazio je ravnotezu i svetlo.", x: 2, z: -4, isPet: false, timeline: [{ year: 1964, title: "Diplomirao arhitekturu", description: "Pocinje karijeru u gradskom birou za urbanizam." }, { year: 1989, title: "Mostovi za buducnost", description: "Njegov najvazniji projekat postaje novi gradski orijentir." }], gifts: [{ id: "g2", giftType: "FLOWER_BOUQUET", activeUntil: "2030-01-01" }] },
  { id: "3", name: "Luna", birthDate: "2010.", deathDate: "2024.", bio: "Najmekse sape u kuci i najbrzi trk do kapije. Luna je sve doceKivala kao da se vracamo posle dugog putovanja.", x: 5, z: 3, isPet: true, timeline: [{ year: 2010, title: "Stigla je Luna", description: "Mala, bela sapa koja je promenila ritam citave kuce." }, { year: 2024, title: "Zauvek dobra devojka", description: "Njeno mesto pod suncem cuva miris lavande." }], gifts: [] },
  { id: "4", name: "Ana i Marko Ilic", birthDate: "1931. — 2009.", deathDate: "1929. — 2015.", bio: "Dvoje ljudi, jedan dom i sedamdeset godina razgovora za istim stolom.", x: -1, z: 5, isPet: false, timeline: [{ year: 1952, title: "Prvi susret", description: "Na stanici, dok je padao prvi sneg." }], gifts: [] },
];

const weatherOptions = [
  { id: "sun", label: "Sunce", icon: Sun },
  { id: "fog", label: "Magla", icon: CloudFog },
  { id: "wind", label: "Vetar", icon: Wind },
  { id: "rain", label: "Kisa", icon: CloudRain },
  { id: "storm", label: "Oluja", icon: Zap },
];

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [resetCameraKey, setResetCameraKey] = useState(0);
  const [liveMemorials, setLiveMemorials] = useState(memorials);
  const [query, setQuery] = useState("");
  const [petOnly, setPetOnly] = useState(false);
  const [weather, setWeather] = useState("sun");

  useEffect(() => {
    fetch("/api/memorials").then((response) => response.json()).then((data) => {
      if (data.memorials?.length) setLiveMemorials(data.memorials);
    }).catch(() => {});
  }, []);

  const filteredMemorials = useMemo(() => liveMemorials.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) && (!petOnly || item.isPet)), [liveMemorials, query, petOnly]);
  const activeWeather = weatherOptions.find((option) => option.id === weather);

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-symbol"><TreePine size={18} /></div><div><strong>Virtuelni Memorijal</strong><span>Park secanja · Beograd</span></div></div>
      <div className="top-actions"><span className="online"><i /> Park je otvoren</span><a className="profile-button" href="/dashboard">Moja porodica <span>JD</span></a></div>
    </header>
    <div className="park-stage">
      <div className="scene-wrap"><CemeteryScene memorials={filteredMemorials} resetCameraKey={resetCameraKey} weather={weather} onSelect={setSelected} /></div>
      <div className="stage-gradient" />
      <div className="stage-copy"><p className="eyebrow"><Sparkles size={13} /> Prostor za secanje</p><h1>Price koje<br /><em>ostaju.</em></h1><p>Prosetajte kroz park i posetite ljude<br className="desktop-only" /> koji su ostavili trag.</p></div>
      <div className="controls-hint"><span>↔</span> Prevuci za pogled <span>·</span> Klikni na spomenik</div>
      <div className="weather-panel"><div className="weather-heading"><span>ATMOSFERA PARKA</span><strong>{activeWeather?.label}</strong></div><div className="weather-options">{weatherOptions.map(({ id, label, icon: Icon }) => <button key={id} className={weather === id ? "active" : ""} onClick={() => setWeather(id)} aria-label={`Izaberi vreme: ${label}`}><Icon size={15} /><small>{label}</small></button>)}</div></div>
      <aside className="explorer-panel"><div className="panel-kicker">ISTRAZI PARK <span>{filteredMemorials.length} memorijala</span></div><div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pronadi ime..." />{query && <button onClick={() => setQuery("")} aria-label="Obrisi pretragu"><X size={15} /></button>}</div><div className="filter-row"><button className={petOnly ? "active" : ""} onClick={() => setPetOnly(!petOnly)}><Flower2 size={14} /> Pet zona</button><button><SlidersHorizontal size={14} /> Svi sektori</button></div><div className="results-list">{filteredMemorials.map((item) => <button className="result-item" key={item.id} onClick={() => setSelected(item)}><span className={`result-avatar ${item.isPet ? "pet" : ""}`}>{item.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span><span><strong>{item.name}</strong><small>{item.isPet ? "Pet memorijal" : "Sektor Borova"}</small></span><span className="result-arrow">↗</span></button>)}</div></aside>
    </div>
    <MemorialModal memorial={selected} onClose={() => { setSelected(null); setResetCameraKey((value) => value + 1); }} />
  </main>;
}
