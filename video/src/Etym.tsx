// "Kelimelerin Tarihçesi" Reels: tek bir JSON (spec) + ses zaman çizelgesi (tl) -> 5 bölümlük çizgi film.
// Spec biçimi: sistem/VIDEO_ETIMOLOJI.md
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, Chip, F, GOLD, INK, Person, Prop, Puff, RENK, SeriesTag, Stamp, Subtitles, Timeline, Wipe, Zemin, mix, pop, ramp } from "./kit";

type Dekor = { ikon: string; x: number; y: number; s?: number; metin?: string; renk?: string };
type Olay = { tip: "yagmur" | "dusunce" | "damga" | "ziplat"; cue: string; gecikme?: number; ikon?: string; ikonlar?: string[]; metin?: string; renk?: string; x?: number; y?: number; s?: number };
type Durak = { donem: string; kelime: string; cue: string; gecikme?: number; zemin?: string; kostum?: string; sac?: string };
export type Spec = {
  kelime: string; seri?: string;
  giris?: { ikonlar?: string[] };
  koken: { zemin: string; etiket: string; kok: string; parcalar: { p: string; anlam?: string; cue?: string }[]; not?: { metin: string; cue: string };
    karakter: { kostum: string; sac?: string; x?: number }; dekor?: Dekor[]; olaylar?: Olay[] };
  degisim: { duraklar: Durak[]; yeni_anlam?: { metin: string; cue: string }; eski_ikon?: { ikon: string; cue: string };
    karsilastirma?: { cue: string; kartlar: { kelime: string; aciklama: string; ikon: string; cue?: string }[] } };
  ornek: { en: string; tr: string; zemin?: string; ikon?: string; ikon_metin?: string; kostum?: string; sac?: string };
};
export type Veri = { spec: Spec; tl: Timeline };

const bolumBasi = (tl: Timeline, b: string) => tl.lines.find((l) => l.bolum === b)?.start ?? tl.dur;

/* ------------------------------- giriş -------------------------------- */
const Giris: React.FC<{ t: number; spec: Spec; qAt: number }> = ({ t, spec, qAt }) => {
  const k = pop(t, 0.15, 0.6), q = pop(t, qAt, 0.55);
  const ikonlar = spec.giris?.ikonlar ?? ["yildiz", "soru"];
  const w = spec.kelime.toUpperCase();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs><linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5BC0F8" /><stop offset="1" stopColor="#BDEBFF" /></linearGradient></defs>
        <rect width={1080} height={1920} fill="url(#gsky)" />
        <g transform={`translate(540,880) rotate(${t * 8})`} opacity={0.22}>{Array.from({ length: 16 }, (_, i) => <path key={i} d="M0,0 L-90,-1200 L90,-1200 Z" fill="#fff" transform={`rotate(${i * 22.5})`} />)}</g>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2 + t * 0.6, d = 380 + Math.sin(t * 2 + i) * 30;
          return <g key={i} transform={`translate(${540 + Math.cos(a) * d},${930 + Math.sin(a) * d}) scale(0.45)`}><Prop ikon={ikonlar[i % ikonlar.length]} t={t + i} /></g>;
        })}
      </svg>
      <div style={{ position: "absolute", top: 720, left: 0, right: 0, textAlign: "center", transform: `scale(${k}) rotate(${(1 - Math.min(1, k)) * -8}deg)` }}>
        <span style={{ fontFamily: F, fontWeight: 900, fontSize: w.length > 8 ? Math.floor(1700 / w.length) : 210, color: "#fff", WebkitTextStroke: `14px ${INK}`, paintOrder: "stroke", textShadow: `0 14px 0 ${INK}`, letterSpacing: 4 }}>{w}</span>
      </div>
      <div style={{ position: "absolute", top: 1010, left: 80, right: 80, display: "flex", justifyContent: "center", transform: `translateY(${(1 - Math.min(1, q)) * 40}px) scale(${q})` }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 52, color: INK, background: GOLD, border: `6px solid ${INK}`, borderRadius: 30, padding: "16px 34px", textAlign: "center", boxShadow: `0 10px 0 ${INK}` }}>
          Bu kelimenin geçmişini<br />biliyor musun?
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------- köken ------------------------------- */
const Koken: React.FC<{ t: number; v: Veri; S: (id: string) => number; E: (id: string) => number; t0: number }> = ({ t, v, S, E, t0 }) => {
  const k = v.spec.koken;
  const walkIn = ramp(t, t0 - 0.2, t0 + 2.2);
  const sx = mix(-160, k.karakter.x ?? 360, walkIn);
  const ol = k.olaylar ?? [];
  const yagmur = ol.find((o) => o.tip === "yagmur");
  const yT = yagmur ? t - S(yagmur.cue) - (yagmur.gecikme ?? 0.6) : -1;
  const dus = ol.find((o) => o.tip === "dusunce");
  const card = pop(t, t0 + 0.2, 0.5);
  const splitAt = k.parcalar[0]?.cue ? S(k.parcalar[0].cue) : t0 + 1.5;
  const split = ramp(t, splitAt - 0.1, splitAt + 0.5);
  const cardOut = dus ? ramp(t, S(dus.cue) - 0.3, S(dus.cue)) : 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Zemin ad={k.zemin} t={t} />
        {(k.dekor ?? []).map((d, i) => <g key={i} transform={`translate(${d.x},${d.y}) scale(${d.s ?? 1})`}><Prop ikon={d.ikon} t={t + i} metin={d.metin} renk={d.renk} /></g>)}
        <Person x={sx} y={1360} s={1.2} t={t} kostum={k.karakter.kostum} sac={k.karakter.sac} walk={walkIn > 0 && walkIn < 1 ? 1 : 0} armUp={yT > 0 && yT < 2.5 ? 70 : 0} />
        {yagmur && yT > 0 && Array.from({ length: 5 }, (_, i) => {
          const ct = yT - i * 0.22;
          if (ct < 0) return null;
          const y = Math.min(1040, 520 + ct * ct * 900);
          return <g key={i} transform={`translate(${sx + 80 + (i % 2) * 18},${y - (y >= 1040 ? i * 16 : 0)}) scale(0.8)`}><Prop ikon={yagmur.ikon ?? "para"} t={ct * 2} /></g>;
        })}
        {ol.filter((o) => o.tip === "ziplat").map((o, i) => {
          const p = pop(t, S(o.cue) + (o.gecikme ?? 0), 0.5);
          return p > 0 ? <g key={i} transform={`translate(${o.x ?? 760},${o.y ?? 1320}) scale(${(o.s ?? 1) * p})`}><Prop ikon={o.ikon ?? "soru"} t={t} metin={o.metin} renk={o.renk} /></g> : null;
        })}
        {dus && (() => {
          const b = pop(t, S(dus.cue), 0.5) * (1 - ramp(t, E(dus.cue) + 0.2, E(dus.cue) + 0.5));
          if (b <= 0) return null;
          const items = dus.ikonlar ?? [];
          return (
            <Bubble x={mix(sx, 640, 0.6)} y={720} s={b}>
              {items.map((it, i) => {
                const x = (i - (items.length - 1) / 2) * 120;
                if (it.length <= 2) return <text key={i} x={x} y={20} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={70} fill={INK}>{it}</text>;
                const [ik, mt] = it.split(":");
                return <g key={i} transform={`translate(${x},70) scale(0.6)`}><Prop ikon={ik} t={t} metin={mt} /></g>;
              })}
            </Bubble>
          );
        })()}
        {ol.filter((o) => o.tip === "damga").map((o, i) => (
          <Stamp key={i} x={o.x ?? 540} y={o.y ?? 560} k={pop(t, S(o.cue) + (o.gecikme ?? 0), 0.35)} text={o.metin ?? ""} color={RENK[o.renk ?? "kirmizi"] ?? o.renk} rot={i % 2 ? 6 : -6} />
        ))}
      </svg>
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - cardOut }}>
        <div style={{ transform: `scale(${card})`, fontFamily: F, fontWeight: 900, fontSize: 30, letterSpacing: 4, color: "#fff", background: "#C8312B", border: `5px solid ${INK}`, borderRadius: 30, padding: "6px 22px", marginBottom: 18 }}>{k.etiket}</div>
        <div style={{ display: "flex", gap: mix(0, 18, split), alignItems: "flex-start", transform: `scale(${card})` }}>
          {split < 0.02 ? <Chip text={k.kok} /> : k.parcalar.map((p, i) => {
            const at = (p.cue ? S(p.cue) : splitAt) + 0.4 + i * 0.8;
            const on = t >= at;
            return (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ fontFamily: F, fontWeight: 900, fontSize: 70, color: INK, opacity: split, marginTop: 8 }}>+</div>}
                <Chip text={p.p} sub={on ? p.anlam : undefined} hot={on} color={["#FFC94A", "#9FD8FF", "#B8F0C8"][i % 3]} />
              </React.Fragment>
            );
          })}
        </div>
        {k.not && (
          <div style={{ marginTop: 26, opacity: pop(t, S(k.not.cue) - 0.1, 0.4), fontFamily: F, fontWeight: 900, fontSize: 40, color: INK, background: "#fff", border: `5px solid ${INK}`, borderRadius: 22, padding: "8px 22px", maxWidth: 940, textAlign: "center" }}>{k.not.metin}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/* ----------------------------- anlam değişimi ------------------------- */
const Degisim: React.FC<{ t: number; v: Veri; S: (id: string) => number; t0: number }> = ({ t, v, S, t0 }) => {
  const d = v.spec.degisim;
  const at = (x: { cue: string; gecikme?: number }) => S(x.cue) + (x.gecikme ?? 0);
  // zemin ve kostüm: son ulaşılan durağın değeri (yoksa kökendeki)
  let zemin = v.spec.koken.zemin, onceki = zemin, zAt = -9, kostum = v.spec.koken.karakter.kostum, sac = v.spec.koken.karakter.sac, kAt = -9;
  for (const s of d.duraklar) {
    if (t < at(s)) break;
    if (s.zemin && s.zemin !== zemin) { onceki = zemin; zemin = s.zemin; zAt = at(s); }
    if (s.kostum && s.kostum !== kostum) { kostum = s.kostum; sac = s.sac ?? sac; kAt = at(s); }
  }
  const fadeIn = ramp(t, zAt - 0.3, zAt + 0.3);
  const lit = d.duraklar.filter((s) => t >= at(s) - 0.05).length;
  const kars = d.karsilastirma;
  const karsK = kars ? pop(t, S(kars.cue), 0.5) : 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Zemin ad={onceki} t={t} />
        <g opacity={fadeIn}><Zemin ad={zemin} t={t} /></g>
        <Person x={330} y={1380} s={1.25} t={t} kostum={kostum} sac={sac} walk={0} />
        <Puff x={330} y={1150} k={(t - kAt + 0.1) / 0.6} />
        {d.eski_ikon && t > S(d.eski_ikon.cue) && (!kars || t < S(kars.cue)) && (
          <g transform={`translate(700,820) scale(${pop(t, S(d.eski_ikon.cue) + 0.3, 0.4)})`}>
            <circle r={110} fill="#fff" stroke={INK} strokeWidth={6} />
            <g transform="translate(0,55) scale(0.55)"><Prop ikon={d.eski_ikon.ikon} t={t} /></g>
            <line x1={-78} y1={-78} x2={78} y2={78} stroke="#D23B3B" strokeWidth={16} strokeLinecap="round" opacity={ramp(t, S(d.eski_ikon.cue) + 1.2, S(d.eski_ikon.cue) + 1.5)} />
          </g>
        )}
      </svg>
      <div style={{ position: "absolute", top: 190, left: 50, right: 50, display: "flex", flexDirection: "column", gap: 14, opacity: 1 - karsK }}>
        {d.duraklar.map((s, i) => {
          const k = pop(t, at(s) - 0.05, 0.45), on = i === lit - 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, opacity: k > 0 ? (on ? 1 : 0.75) : 0.25, transform: `translateX(${(1 - Math.min(1, k)) * -40}px)` }}>
              <div style={{ width: 46, height: 46, borderRadius: 23, background: k > 0 ? GOLD : "#fff", border: `5px solid ${INK}`, flex: "none" }} />
              <div style={{ fontFamily: F, fontWeight: 900, fontSize: 30, letterSpacing: 1, color: INK, width: 400, background: "rgba(255,255,255,.55)", borderRadius: 12, padding: "2px 10px" }}>{s.donem}</div>
              <div style={{ fontFamily: F, fontWeight: 900, fontSize: on ? 60 : 50, color: INK, background: on ? "#fff" : "transparent", border: on ? `5px solid ${INK}` : "5px solid transparent", borderRadius: 18, padding: "0 16px", whiteSpace: "nowrap" }}>{s.kelime}</div>
            </div>
          );
        })}
        {d.yeni_anlam && (
          <div style={{ marginLeft: 20, marginTop: 8, opacity: pop(t, S(d.yeni_anlam.cue), 0.4), fontFamily: F, fontWeight: 900, fontSize: 44, color: "#fff", background: "#2F5BD3", border: `5px solid ${INK}`, borderRadius: 22, padding: "8px 24px", alignSelf: "flex-start", maxWidth: 940 }}>{d.yeni_anlam.metin}</div>
        )}
      </div>
      {kars && karsK > 0 && (
        <div style={{ position: "absolute", top: 230, left: 50, right: 50, display: "flex", gap: 24, transform: `scale(${karsK})` }}>
          {kars.kartlar.map((x, i) => (
            <div key={i} style={{ flex: 1, background: ["#FFC94A", "#9FD8FF", "#B8F0C8"][i % 3], border: `6px solid ${INK}`, borderRadius: 30, padding: "22px 10px", textAlign: "center", boxShadow: `0 10px 0 ${INK}`, opacity: x.cue && t < S(x.cue) - 0.1 ? 0.35 : 1 }}>
              <svg width={180} height={170} viewBox="-90 -150 180 170"><g transform="scale(0.85)"><Prop ikon={x.ikon} t={t} /></g></svg>
              <div style={{ fontFamily: F, fontWeight: 900, fontSize: x.kelime.length > 9 ? 54 : 68, color: INK }}>{x.kelime}</div>
              <div style={{ fontFamily: F, fontWeight: 800, fontSize: 36, color: INK, whiteSpace: "pre-line" }}>{x.aciklama}</div>
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};

/* -------------------------------- örnek ------------------------------- */
const Ornek: React.FC<{ t: number; v: Veri; at: number; end: number }> = ({ t, v, at, end }) => {
  const o = v.spec.ornek;
  const k = pop(t, at - 0.2, 0.5), kt = pop(t, at + 1.2, 0.5), bar = ramp(t, at + 0.6, at + 2.4);
  const words = o.en.split(" "), total = o.en.length;
  const key = v.spec.kelime.toLowerCase();
  let acc = 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <g transform="translate(0,-340)"><Zemin ad={o.zemin ?? "ofis"} t={t} /></g>
        <rect x={0} y={960} width={1080} height={960} fill="#FFF1D6" />
        <line x1={0} y1={960} x2={1080} y2={960} stroke={INK} strokeWidth={6} />
        {o.ikon && <g transform={`translate(820,${o.ikon === "grafik" ? 900 : 860}) scale(${o.ikon === "grafik" ? 0.95 : 1.4})`}><Prop ikon={o.ikon} t={t} metin={o.ikon_metin} k={bar} /></g>}
        <Person x={250} y={935} s={1.2} t={t} kostum={o.kostum ?? "ofis"} sac={o.sac ?? "uzun"} talk={t > at && t < end} />
      </svg>
      <div style={{ position: "absolute", top: 1000, left: 60, right: 60, transform: `scale(${k})` }}>
        <div style={{ background: "#fff", border: `6px solid ${INK}`, borderRadius: 34, padding: "28px 34px", boxShadow: `0 12px 0 ${INK}` }}>
          <div style={{ fontFamily: F, fontWeight: 900, fontSize: 28, letterSpacing: 3, color: "#E0662E", marginBottom: 8 }}>ÖRNEK CÜMLE</div>
          <div style={{ fontFamily: F, fontWeight: 900, fontSize: words.length > 16 ? 44 : 50, lineHeight: 1.22, color: INK }}>
            {words.map((w, i) => {
              const on = t >= at + (acc / total) * (end - at);
              acc += w.length + 1;
              const hit = w.toLowerCase().replace(/[^a-z]/g, "").startsWith(key);
              return <span key={i} style={{ color: hit ? "#E0662E" : on ? INK : "#B9B3CC", background: hit ? "#FFE9A8" : "transparent", borderRadius: 10, padding: hit ? "0 6px" : 0 }}>{w}{" "}</span>;
            })}
          </div>
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: "4px dashed #D9D3EA", fontFamily: F, fontWeight: 800, fontSize: 40, lineHeight: 1.25, color: "#5A5280", opacity: Math.min(1, kt) }}>{o.tr}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------- kapanış ------------------------------ */
const Kapanis: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const lt = t - at, k = pop(t, at + 0.1, 0.6), b = pop(t, at + 0.7, 0.5);
  const tap = lt > 1.4 ? Math.max(0, Math.sin((lt - 1.4) * 5)) : 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs><linearGradient id="osky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2F5BD3" /><stop offset="1" stopColor="#7FB2FF" /></linearGradient></defs>
        <rect width={1080} height={1920} fill="url(#osky)" />
        <g transform={`translate(540,760) rotate(${t * 10})`} opacity={0.18}>{Array.from({ length: 16 }, (_, i) => <path key={i} d="M0,0 L-90,-1300 L90,-1300 Z" fill="#fff" transform={`rotate(${i * 22.5})`} />)}</g>
        {Array.from({ length: 40 }, (_, i) => {
          const x = (i * 263) % 1080, y = ((lt * (180 + (i % 5) * 40) + i * 97) % 2100) - 100;
          return <rect key={i} x={x} y={y} width={18} height={28} rx={4} fill={[GOLD, "#FF7A59", "#fff", "#7CE0A3"][i % 4]} transform={`rotate(${lt * 200 + i * 40},${x + 9},${y + 14})`} />;
        })}
        <g transform={`translate(540,700) scale(${k})`}>
          <circle r={190} fill="#fff" stroke={INK} strokeWidth={10} />
          <path d="M-96,-70 h192 a40,40 0 0 1 40,40 v80 a40,40 0 0 1 -40,40 h-90 l-50,46 v-46 h-52 a40,40 0 0 1 -40,-40 v-80 a40,40 0 0 1 40,-40 Z" fill={GOLD} stroke={INK} strokeWidth={8} />
          <text y={42} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={110} fill={INK}>i</text>
          <text x={64} y={22} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={54} fill={INK}>en</text>
          <text x={-62} y={22} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={54} fill={INK}>tr</text>
        </g>
      </svg>
      <div style={{ position: "absolute", top: 940, left: 0, right: 0, textAlign: "center", transform: `scale(${k})` }}>
        <span style={{ fontFamily: F, fontWeight: 900, fontSize: 104, color: "#fff", WebkitTextStroke: `12px ${INK}`, paintOrder: "stroke", textShadow: `0 10px 0 ${INK}` }}>ingilizcecim.com</span>
      </div>
      <div style={{ position: "absolute", top: 1150, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${b * (1 - tap * 0.06)})` }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 64, color: "#fff", background: "#E8475F", border: `7px solid ${INK}`, borderRadius: 50, padding: "18px 70px", boxShadow: `0 ${12 - tap * 8}px 0 ${INK}` }}>+ Takip et</div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <g transform={`translate(${790 + (1 - Math.min(1, b)) * 200},${1400 - tap * 30}) rotate(-20)`} opacity={Math.min(1, b)}>
          <path d="M0,0 v-90 a18,18 0 0 1 36,0 v60 a18,18 0 0 1 36,6 a18,18 0 0 1 34,10 a18,18 0 0 1 34,12 v60 c0,50 -30,80 -80,80 h-30 c-30,0 -50,-20 -66,-50 l-40,-70 a18,18 0 0 1 30,-20 Z" fill="#F2C49B" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* -------------------------------- ana -------------------------------- */
export const Etym: React.FC<{ veri: Veri }> = ({ veri: v }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tl = v.tl;
  const m = Object.fromEntries(tl.lines.map((l) => [l.id, l]));
  const S = (id: string) => m[id]?.start ?? 0, E = (id: string) => m[id]?.end ?? 0;
  const KOKEN = bolumBasi(tl, "koken"), DEG = bolumBasi(tl, "degisim"), ORN = bolumBasi(tl, "ornek"), KAP = bolumBasi(tl, "kapanis");
  const giris = tl.lines.filter((l) => l.bolum === "giris");
  const orn = tl.lines.find((l) => l.bolum === "ornek" && l.lang === "en");
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {t < KOKEN && <Giris t={t} spec={v.spec} qAt={giris[1]?.start ?? 1} />}
      {t >= KOKEN && t < DEG && <Koken t={t} v={v} S={S} E={E} t0={KOKEN} />}
      {t >= DEG && t < ORN && <Degisim t={t} v={v} S={S} t0={DEG} />}
      {t >= ORN && t < KAP && <Ornek t={t} v={v} at={orn?.start ?? ORN} end={orn?.end ?? KAP} />}
      {t >= KAP && <Kapanis t={t} at={KAP} />}
      <SeriesTag alpha={t < KAP ? 1 : 0} metin={v.spec.seri ?? "KELİMELERİN TARİHÇESİ"} />
      <Subtitles t={t} tl={tl} skip={(l) => l === giris[0] || (l.bolum === "ornek" && l.lang === "en")} />
      {[KOKEN, DEG, ORN, KAP].map((a) => <Wipe key={a} t={t} at={a} />)}
    </AbsoluteFill>
  );
};
