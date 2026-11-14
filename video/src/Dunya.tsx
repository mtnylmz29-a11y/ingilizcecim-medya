// "Dünya turu" Reels: bir ifade/kelime şehir şehir dünyayı dolaşır (her şehirde kendi dilinde ses + yazı),
// sonra kısa bir ders kartı ve soru. Spec biçimi: sistem/VIDEO_DUNYA.md (örnek: Good morning, 14 Kasım 2026).
import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { geoDistance } from "d3-geo";
import { loadFont as jp } from "@remotion/google-fonts/NotoSansJP";
import { loadFont as sc } from "@remotion/google-fonts/NotoSansSC";
import { loadFont as ar } from "@remotion/google-fonts/NotoSansArabic";
import { loadFont as kr } from "@remotion/google-fonts/NotoSansKR";
import { loadFont as hi } from "@remotion/google-fonts/NotoSansDevanagari";
import { loadFont as he } from "@remotion/google-fonts/NotoSansHebrew";
import { loadFont as th } from "@remotion/google-fonts/NotoSansThai";
import { loadFont as noto } from "@remotion/google-fonts/NotoSans";
import { F as N, Timeline } from "./kit";
import { Kure, deklinasyon, doguBoylami } from "./globe";

/* ------------------------------- spec -------------------------------- */
type Sehir = { id: string; ad: string; lon: number; lat: number; dil_adi: string; yazi: string; okunus?: string; yazi_tipi?: string; sag_sol?: boolean };
type Satir = { en: string; tr: string; not?: string; renk?: string; saat?: [number, number]; cue?: string };
export type DunyaSpec = {
  bicim: "dunya"; ad: string; tarih?: string; etiket?: string; gunes?: boolean;
  baslik: { ust: string; vurgu?: string; alt?: string };
  sehirler: Sehir[];
  ders: { saat?: boolean; satirlar: Satir[] };
  kapanis: { soru: string; vurgu?: string; cipler?: string[]; yorum?: string };
};
export type DunyaVeri = { spec: DunyaSpec; tl: Timeline };

// Yazı tipleri yalnızca kullanılan dil için yüklenir.
const YAZI: Record<string, () => string> = {
  jp: () => jp("normal", { weights: ["700"] }).fontFamily,
  sc: () => sc("normal", { weights: ["700"] }).fontFamily,
  ar: () => ar("normal", { weights: ["700"], subsets: ["arabic"] }).fontFamily,
  kr: () => kr("normal", { weights: ["700"] }).fontFamily,
  hi: () => hi("normal", { weights: ["700"], subsets: ["devanagari"] }).fontFamily,
  he: () => he("normal", { weights: ["700"], subsets: ["hebrew"] }).fontFamily,
  th: () => th("normal", { weights: ["700"], subsets: ["thai"] }).fontFamily,
  noto: () => noto("normal", { weights: ["700"], subsets: ["greek", "cyrillic"] }).fontFamily,
};
const yuklu: Record<string, string> = {};
const yaziTipi = (k?: string) => (k && YAZI[k] ? (yuklu[k] ??= YAZI[k]()) : undefined);

const C = { space0: "#070B1E", space1: "#141C46", gold: "#FFC94A", gold2: "#FFE29A", dim: "#A9B4E0" };
const PALET = ["#FFC94A", "#FF8A3D", "#A06BFF", "#4C6FFF", "#3CB371"];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const keyed = (t: number, ts: number[], vs: number[]) => {
  if (t <= ts[0]) return vs[0];
  for (let i = 1; i < ts.length; i++) if (t < ts[i]) return interpolate(t, [ts[i - 1], ts[i]], [vs[i - 1], vs[i]], { ...clamp, easing: ease });
  return vs[vs.length - 1];
};
const ramp = (t: number, a: number, b: number, e = ease) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: e });
const pop = (t: number, at: number, d = 0.45) => {
  const x = (t - at) / d;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 1 - Math.cos(x * Math.PI * 2.2) * Math.exp(-x * 5.5);
};

/* ------------------------------ parçalar ------------------------------ */
const STARS = Array.from({ length: 170 }, (_, i) => ({ x: random(`sx${i}`) * 1080, y: random(`sy${i}`) * 1920, r: 0.8 + random(`sr${i}`) * 2.2, p: random(`sp${i}`) * 6.28 }));
const Backdrop: React.FC<{ t: number; warm: number }> = ({ t, warm }) => (
  <AbsoluteFill>
    <svg width={1080} height={1920}>
      <defs>
        <radialGradient id="bg" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor={C.space1} /><stop offset="1" stopColor={C.space0} /></radialGradient>
        <radialGradient id="blob1"><stop offset="0" stopColor="#6B4BFF" stopOpacity=".45" /><stop offset="1" stopColor="#6B4BFF" stopOpacity="0" /></radialGradient>
        <radialGradient id="blob2"><stop offset="0" stopColor="#FF8A3D" stopOpacity=".35" /><stop offset="1" stopColor="#FF8A3D" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#bg)" />
      <circle cx={200 + Math.sin(t * 0.3) * 80} cy={420} r={520} fill="url(#blob1)" />
      <circle cx={900 + Math.cos(t * 0.25) * 70} cy={1500} r={560} fill="url(#blob2)" opacity={0.35 + warm * 0.5} />
      {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2.2 + s.p))} />)}
    </svg>
  </AbsoluteFill>
);
const Sun: React.FC<{ x: number; y: number; r: number; t: number; color?: string }> = ({ x, y, r, t, color = C.gold }) => (
  <g transform={`translate(${x},${y})`}>
    <radialGradient id={`sg${Math.round(r)}`}><stop offset="0.3" stopColor={color} stopOpacity="0.55" /><stop offset="1" stopColor={color} stopOpacity="0" /></radialGradient>
    <circle r={r * 2.8} fill={`url(#sg${Math.round(r)})`} />
    <g transform={`rotate(${t * 25})`}>{Array.from({ length: 12 }, (_, i) => <rect key={i} x={-r * 0.12} y={-r * 1.62} width={r * 0.24} height={r * 0.42} rx={r * 0.12} fill={color} transform={`rotate(${i * 30})`} />)}</g>
    <circle r={r} fill={color} /><circle r={r * 0.72} fill={C.gold2} opacity={0.65} />
  </g>
);
const Moon: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x},${y})`}>
    <radialGradient id="mg"><stop offset="0.3" stopColor="#9DB4FF" stopOpacity="0.45" /><stop offset="1" stopColor="#9DB4FF" stopOpacity="0" /></radialGradient>
    <circle r={r * 2.4} fill="url(#mg)" />
    <mask id="moonmask"><rect x={-r * 2} y={-r * 2} width={r * 4} height={r * 4} fill="#fff" /><circle cx={r * 0.55} cy={-r * 0.35} r={r * 0.9} fill="#000" /></mask>
    <circle r={r} fill="#E8EDFF" mask="url(#moonmask)" />
  </g>
);
const Pill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: N, fontWeight: 900, fontSize: 30, letterSpacing: 3, color: "#1A1440", background: C.gold, borderRadius: 30, padding: "10px 24px", ...style }}>{children}</div>
);
const ClockIcon: React.FC<{ t: number }> = ({ t }) => (
  <svg width={38} height={38} viewBox="-20 -20 40 40">
    <circle r={17} fill="none" stroke="#1A1440" strokeWidth={4} />
    <line x1={0} y1={0} x2={0} y2={-10} stroke="#1A1440" strokeWidth={4} strokeLinecap="round" transform={`rotate(${t * 360})`} />
    <line x1={0} y1={0} x2={7} y2={0} stroke="#1A1440" strokeWidth={4} strokeLinecap="round" transform={`rotate(${t * 30})`} />
  </svg>
);

/* -------------------------------- saat -------------------------------- */
const ang = (h: number) => ((h - 12) / 24) * Math.PI * 2; // 12:00 tepede, saat yönünde
const pt = (cx: number, cy: number, r: number, h: number) => [cx + r * Math.sin(ang(h)), cy - r * Math.cos(ang(h))];
const arc = (cx: number, cy: number, r: number, h0: number, h1: number, rev = false) => {
  const [x0, y0] = pt(cx, cy, r, rev ? h1 : h0), [x1, y1] = pt(cx, cy, r, rev ? h0 : h1);
  return `M${x0},${y0} A${r},${r} 0 ${Math.abs(h1 - h0) > 12 ? 1 : 0} ${rev ? 0 : 1} ${x1},${y1}`;
};
const band = (cx: number, cy: number, r0: number, r1: number, h0: number, h1: number) => {
  const [a, b] = pt(cx, cy, r1, h0), [c2, d] = pt(cx, cy, r1, h1), [e, f] = pt(cx, cy, r0, h1), [g, h] = pt(cx, cy, r0, h0);
  const large = h1 - h0 > 12 ? 1 : 0;
  return `M${a},${b} A${r1},${r1} 0 ${large} 1 ${c2},${d} L${e},${f} A${r0},${r0} 0 ${large} 0 ${g},${h} Z`;
};

/* -------------------------------- ana -------------------------------- */
export const Dunya: React.FC<{ veri: DunyaVeri }> = ({ veri }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { spec, tl } = veri;
  const S = (id: string) => tl.lines.find((l) => l.id === id)?.start ?? 0;
  const bas = (b: string) => tl.lines.find((l) => l.bolum === b)?.start ?? tl.dur;
  const sehirAn = (id: string) => tl.lines.find((l) => l.sehir === id)?.start ?? 0;
  const CITIES = spec.sehirler;
  const giris = tl.lines.filter((l) => l.bolum === "giris");
  const T_TUR = bas("tur"), T_INTRO = giris[1]?.start ?? 0.9;
  const T_LESSON = Math.min(sehirAn(CITIES[CITIES.length - 1].id) + 0.75, bas("ders") - 0.05);
  const T_CTA = bas("kapanis") - 0.15;
  const DECL = deklinasyon(spec.tarih);
  const gunes = spec.gunes ?? false;
  const saatli = spec.ders.saat ?? false;
  const rows = spec.ders.satirlar.map((r, i) => ({ ...r, renk: r.renk ?? PALET[i % PALET.length], at: r.cue ? S(r.cue) : i === 0 ? T_LESSON + 0.3 : T_LESSON + 0.3 + i * 1.2 }));
  const active = Math.max(0, rows.filter((r) => t >= r.at - 0.05).length - 1);
  const labelUntil = (i: number) => (i + 1 < CITIES.length ? sehirAn(CITIES[i + 1].id) : 99);

  // güneş ve kamera anahtarları
  const SUN0 = doguBoylami(CITIES[0].lon, CITIES[0].lat, DECL);
  const KT = [T_INTRO, ...CITIES.map((c) => sehirAn(c.id))];
  const KSUN = [SUN0 + 28, ...CITIES.map((c) => doguBoylami(c.lon, c.lat, DECL))];
  const KCAM = [CITIES[0].lon + 18, ...CITIES.map((c) => c.lon)];
  const KLAT = [CITIES[0].lat * 0.7, ...CITIES.map((c) => Math.max(-25, Math.min(40, c.lat * 0.7)))];
  const lessonSpin = Math.max(0, t - T_LESSON) * 9;
  const sunLon = keyed(t, KT, KSUN);
  const hours = Math.max(0, (SUN0 - sunLon) / 15);
  const lit = CITIES.filter((c) => t >= sehirAn(c.id)).length;

  const intro = ramp(t, 0, 1.1, Easing.out(Easing.back(1.4)));
  const toLesson = ramp(t, T_LESSON - 0.5, T_LESSON + 0.3);
  const toCta = ramp(t, T_CTA, T_CTA + 0.7);
  const world = 1 - toLesson;
  const lessonCy = saatli ? 700 : 560, lessonR = saatli ? 175 : 250;
  const gR = interpolate(toLesson, [0, 1], [390, lessonR]) * (0.55 + 0.45 * intro);
  const gCy = interpolate(toLesson, [0, 1], [930, lessonCy]);
  const dialScale = interpolate(toCta, [0, 1], [1, 0.5]);
  const dialY = interpolate(toCta, [0, 1], [0, 420 - lessonCy]);

  const camLon = keyed(t, KT, KCAM) - lessonSpin + Math.sin(t * 0.7) * 1.5;
  const camLat = keyed(t, KT, KLAT) + Math.sin(t * 0.5) * 2;
  const visited = CITIES.filter((c) => t >= sehirAn(c.id));

  /* --- saat (isteğe bağlı) --- */
  const Clock = () => {
    const cx = 540, cy = lessonCy;
    const draw = ramp(t, T_LESSON, T_LESSON + 1.0, Easing.out(Easing.cubic));
    const mids = rows.map((r) => ((r.saat?.[0] ?? 0) + (r.saat?.[1] ?? 0)) / 2);
    const kt = [T_LESSON + 0.5], kv = [mids[0]];
    rows.slice(1).forEach((r, i) => { kt.push(r.at, r.at + 0.7); kv.push(mids[i], mids[i + 1]); });
    const hour = keyed(t, kt, kv);
    const [sx, sy] = pt(cx, cy, 445, hour);
    const moon = ramp(hour, 21.2, 22.6);
    return (
      <g opacity={ramp(t, T_LESSON - 0.2, T_LESSON + 0.4)}>
        {rows.map((s, i) => {
          const [a, b] = s.saat ?? [0, 0];
          const end = a + (b - a) * Math.min(1, Math.max(0, draw * rows.length - i));
          if (end <= a + 0.01) return null;
          const on = i === active, pulse = on ? 1 + 0.015 * Math.sin(t * 6) : 1;
          const rev = Math.cos(ang((a + b) / 2)) < 0;
          const koyu = i === rows.length - 1;
          return (
            <g key={i} transform={`translate(${cx},${cy}) scale(${pulse}) translate(${-cx},${-cy})`}>
              <path d={band(cx, cy, 300, 405, a, end)} fill={s.renk} opacity={on ? 1 : 0.32} stroke="#0B1030" strokeWidth={4} />
              <path id={`tp${i}`} d={arc(cx, cy, 352, a, b, rev)} fill="none" />
              <text fontFamily={N} fontWeight={900} fontSize={31} letterSpacing={2} fill={koyu ? "#fff" : "#1A1440"} opacity={(on ? 1 : 0.55) * ramp(t, T_LESSON + 0.8, T_LESSON + 1.2)} dominantBaseline="middle">
                <textPath href={`#tp${i}`} startOffset="50%" textAnchor="middle">{s.en.toLocaleUpperCase("en-US")}</textPath>
              </text>
            </g>
          );
        })}
        {Array.from({ length: 24 }, (_, h) => {
          const [x0, y0] = pt(cx, cy, 410, h), [x1, y1] = pt(cx, cy, h % 6 ? 422 : 436, h);
          return <line key={h} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#fff" strokeWidth={h % 6 ? 3 : 6} opacity={0.75 * draw} strokeLinecap="round" />;
        })}
        {[0, 6, 12, 18].map((h) => { const [x, y] = pt(cx, cy, 262, h); return <text key={h} x={x} y={y + 13} textAnchor="middle" fontFamily={N} fontWeight={900} fontSize={36} fill="#fff" opacity={draw}>{String(h).padStart(2, "0")}:00</text>; })}
        <g opacity={ramp(t, T_LESSON + 0.5, T_LESSON + 0.9)}>
          <g opacity={1 - moon}><Sun x={sx} y={sy} r={30} t={t} color={hour > 17.5 ? "#FF8A3D" : C.gold} /></g>
          <g opacity={moon}><Moon x={sx} y={sy} r={32} /></g>
        </g>
      </g>
    );
  };

  /* --- şehir kartı --- */
  const kart = CITIES.map((c, i) => {
    const at = sehirAn(c.id), next = i + 1 < CITIES.length ? sehirAn(CITIES[i + 1].id) : T_LESSON;
    if (t < at || t > next + 0.15) return null;
    const k = pop(t, at, 0.5), out = ramp(t, next - 0.15, next + 0.05);
    const big = c.yazi.length > 14 ? 60 : c.yazi.length > 9 ? 76 : 112;
    const yt = yaziTipi(c.yazi_tipi);
    return (
      <AbsoluteFill key={c.id} style={{ top: 190, height: 340, alignItems: "center", justifyContent: "center", opacity: 1 - out, transform: `translateY(${out * -60}px)` }}>
        <div style={{ transform: `scale(${k})`, background: "#fff", borderRadius: 44, padding: "26px 56px 30px", textAlign: "center", boxShadow: "0 18px 0 rgba(0,0,0,.25)", border: `6px solid ${C.gold}`, minWidth: 560 }}>
          <div style={{ fontFamily: N, fontWeight: 900, fontSize: 32, letterSpacing: 3, color: "#E0662E" }}>{c.dil_adi.toLocaleUpperCase("tr-TR")} · {c.ad.toLocaleUpperCase("tr-TR")}</div>
          <div dir={c.sag_sol ? "rtl" : undefined} style={{ fontFamily: yt ? `${yt}, ${N}` : N, fontWeight: 900, fontSize: big, color: "#1A1440", lineHeight: 1.25, marginTop: 6, whiteSpace: "nowrap" }}>{c.yazi}</div>
          {c.okunus && <div style={{ fontFamily: N, fontWeight: 800, fontSize: 40, color: "#5A5F8A" }}>{c.okunus}</div>}
        </div>
      </AbsoluteFill>
    );
  });

  /* --- altyazı --- */
  const sub = (() => {
    const i = tl.lines.findIndex((x, j) => t >= x.start - 0.05 && t < (tl.lines[j + 1]?.start ?? 99) - 0.05 && t < x.end + 0.6);
    const l = tl.lines[i];
    if (!l || l === giris[0] || l.bolum === "kapanis") return null;
    const k = ramp(t, l.start - 0.05, l.start + 0.15);
    const en = l.lang !== "tr" && !l.sub.includes(":");
    return (
      <AbsoluteFill style={{ top: 1505, height: 110, alignItems: "center", justifyContent: "center", padding: "0 90px" }}>
        <div style={{ fontFamily: N, fontWeight: 900, fontSize: 44, lineHeight: 1.2, textAlign: "center", color: en ? C.gold : "#fff", background: "rgba(7,11,30,.72)", borderRadius: 22, padding: "10px 26px", opacity: k, transform: `translateY(${(1 - k) * 14}px)` }}>{l.sub}</div>
      </AbsoluteFill>
    );
  })();

  const cipler = (spec.kapanis.cipler ?? rows.map((r) => r.en)).slice(0, 4);
  const soru = spec.kapanis.soru, vurgu = spec.kapanis.vurgu;
  const vi = vurgu ? soru.indexOf(vurgu) : -1;
  const x0 = 150, x1 = 930;

  return (
    <AbsoluteFill style={{ background: C.space0 }}>
      <Backdrop t={t} warm={ramp(t, T_LESSON - 0.4, T_LESSON + 1.2)} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <g transform={`translate(540,${lessonCy + dialY}) scale(${dialScale}) translate(-540,${-lessonCy})`}>
          {gunes && <g opacity={world}><Sun x={940} y={560 - (1 - intro) * 200} r={46} t={t} /></g>}
          {saatli && <Clock />}
          <g transform={`rotate(${(1 - intro) * -30},540,930)`}>
            <Kure id="dk" cx={540} cy={gCy} r={gR} lon={camLon} lat={camLat} gunes={gunes ? { lon: sunLon - lessonSpin, decl: DECL } : undefined}
              ust={(proj, path) => (<>
                {visited.length > 1 && <path d={path({ type: "LineString", coordinates: visited.map((c) => [c.lon, c.lat]) } as never) ?? ""} fill="none" stroke={C.gold} strokeWidth={4} strokeDasharray="10 9" strokeDashoffset={-t * 40} opacity={world} />}
                {world > 0.01 && CITIES.map((c, i) => {
                  if (geoDistance([c.lon, c.lat], [camLon, camLat]) > 1.5) return null;
                  const p = proj([c.lon, c.lat]);
                  if (!p) return null;
                  const at = sehirAn(c.id), k = pop(t, at), on = t >= at, ring = ((t - at) % 1.2) / 1.2;
                  return (
                    <g key={c.id} transform={`translate(${p[0]},${p[1]})`} opacity={world}>
                      {on && t - at < 3.6 && [0, 0.4].map((o) => { const q = (ring + o) % 1; return <circle key={o} r={10 + q * 60} fill="none" stroke={C.gold} strokeWidth={4} opacity={(1 - q) * 0.8} />; })}
                      {on && t - at < 1 && Array.from({ length: 10 }, (_, j) => { const a = (j / 10) * Math.PI * 2, d = 20 + (t - at) * 110; return <circle key={j} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={5 * (1 - (t - at))} fill={C.gold2} />; })}
                      <circle r={on ? 9 + 5 * k : 6} fill={on ? C.gold : "#CBD5FF"} stroke="#fff" strokeWidth={on ? 3 : 1.5} />
                      {on && t < labelUntil(i) && (
                        <g transform={`translate(0,-28) scale(${k})`}>
                          <rect x={-c.ad.length * 11 - 18} y={-46} width={c.ad.length * 22 + 36} height={46} rx={23} fill="#fff" />
                          <text y={-14} textAnchor="middle" fontFamily={N} fontWeight={900} fontSize={30} fill="#1A2350">{c.ad}</text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </>)} />
          </g>
        </g>
      </svg>
      {/* üst bilgi */}
      <div style={{ position: "absolute", top: 90, left: 60, right: 60, height: 70, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: world * ramp(t, T_INTRO, T_INTRO + 0.5) }}>
        <Pill style={{ background: "rgba(255,255,255,.14)", color: "#fff" }}>{spec.etiket ?? "DÜNYA TURU"}</Pill>
        <Pill style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ClockIcon t={t} /> {lit === 0 ? "Başlıyor…" : gunes ? `${CITIES[0].ad} → +${Math.round(hours)} saat` : `${lit} / ${CITIES.length} şehir`}
        </Pill>
      </div>
      {/* başlık */}
      {(() => {
        const a = pop(t, 0.25, 0.6), b = pop(t, T_INTRO, 0.6), out = ramp(t, sehirAn(CITIES[0].id) - 0.35, sehirAn(CITIES[0].id));
        const B = spec.baslik, uzun = (B.ust + (B.vurgu ?? "")).length > 16;
        return (
          <AbsoluteFill style={{ top: 200, height: 320, alignItems: "center", justifyContent: "center", opacity: 1 - out }}>
            <div style={{ fontFamily: N, fontWeight: 900, fontSize: uzun ? 92 : 124, color: "#fff", transform: `scale(${a})`, textShadow: "0 8px 0 #E0662E, 0 14px 30px rgba(0,0,0,.5)", lineHeight: 1, textAlign: "center", padding: "0 40px" }}>
              {B.ust} {B.vurgu && <span style={{ color: C.gold }}>{B.vurgu}</span>}
            </div>
            {B.alt && <div style={{ marginTop: 26, fontFamily: N, fontWeight: 800, fontSize: 46, color: C.dim, opacity: Math.min(1, b), transform: `translateY(${(1 - b) * 30}px)`, textAlign: "center", padding: "0 60px" }}>{B.alt}</div>}
          </AbsoluteFill>
        );
      })()}
      {kart}
      {/* yolculuk çubuğu */}
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: world * ramp(t, T_TUR, T_TUR + 0.5) }}>
        <rect x={x0} y={1416} width={x1 - x0} height={14} rx={7} fill="rgba(255,255,255,.18)" />
        {(() => {
          const maxH = Math.max(1, ...CITIES.map((c) => (SUN0 - doguBoylami(c.lon, c.lat, DECL)) / 15));
          const X = (i: number, c: Sehir) => x0 + (x1 - x0) * (gunes ? Math.min(1, (SUN0 - doguBoylami(c.lon, c.lat, DECL)) / 15 / maxH) : i / Math.max(1, CITIES.length - 1));
          const cur = gunes ? x0 + (x1 - x0) * Math.min(1, hours / maxH) : x0 + (x1 - x0) * Math.max(0, (lit - 1) / Math.max(1, CITIES.length - 1));
          return (<>
            <rect x={x0} y={1416} width={Math.max(0, cur - x0)} height={14} rx={7} fill={C.gold} />
            {CITIES.map((c, i) => {
              const on = t >= sehirAn(c.id);
              return (<g key={c.id}>
                <circle cx={X(i, c)} cy={1423} r={on ? 13 : 9} fill={on ? C.gold : "#5D6796"} stroke="#fff" strokeWidth={3} />
                {(i === 0 || i === CITIES.length - 1) && <text x={X(i, c)} y={1478} textAnchor="middle" fontFamily={N} fontWeight={800} fontSize={26} fill={C.dim}>{c.ad}</text>}
              </g>);
            })}
            <Sun x={cur} y={1385} r={14} t={t} />
          </>);
        })()}
      </svg>
      {/* ders satırları */}
      <div style={{ position: "absolute", top: saatli ? 1180 : 920, left: 70, right: 70, display: "flex", flexDirection: "column", gap: saatli ? 12 : 20, opacity: 1 - ramp(t, T_CTA, T_CTA + 0.4) }}>
        {rows.map((r, i) => {
          const k = pop(t, r.at, 0.5), on = i === active && t >= T_LESSON;
          return (
            <div key={i} style={{ height: saatli ? 68 : 96, borderRadius: 48, display: "flex", alignItems: "center", padding: "0 26px", gap: 18, background: on ? "#fff" : "rgba(255,255,255,.12)", border: `4px solid ${on ? r.renk : "transparent"}`, opacity: Math.min(1, k) * (on ? 1 : 0.7), transform: `translateX(${(1 - k) * -120}px) scale(${on ? 1.03 : 1})` }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: r.renk, flex: "none" }} />
              <div style={{ fontFamily: N, fontWeight: 900, fontSize: saatli ? 38 : 46, color: on ? "#1A1440" : "#fff", whiteSpace: "nowrap" }}>{r.en}</div>
              <div style={{ fontFamily: N, fontWeight: 800, fontSize: saatli ? 27 : 32, color: on ? "#4A4F75" : C.dim, flex: 1 }}>{r.tr}</div>
              {r.not && <div style={{ fontFamily: N, fontWeight: 800, fontSize: saatli ? 22 : 26, color: on ? "#4A4F75" : C.dim, textAlign: "right" }}>{r.not}</div>}
            </div>
          );
        })}
      </div>
      {/* kapanış */}
      {t >= T_CTA && (() => {
        const cta = bas("kapanis"), q = pop(t, T_CTA + 0.2, 0.6), bub = pop(t, cta + 2.4, 0.6), web = pop(t, cta + 3.2, 0.6);
        return (
          <AbsoluteFill>
            <div style={{ position: "absolute", top: 760, left: 60, right: 60, textAlign: "center", fontFamily: N, fontWeight: 900, fontSize: 70, lineHeight: 1.12, color: "#fff", transform: `scale(${q})` }}>
              {vi < 0 || !vurgu ? soru : <>{soru.slice(0, vi)}<span style={{ color: C.gold }}>{vurgu}</span>{soru.slice(vi + vurgu.length)}</>}
            </div>
            <div style={{ position: "absolute", top: 960, left: 70, right: 70, display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
              {cipler.map((c, i) => {
                const k = pop(t, cta + 0.8 + i * 0.28, 0.5);
                return <div key={c} style={{ width: 430, height: 92, borderRadius: 46, background: rows[i]?.renk ?? PALET[i], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: N, fontWeight: 900, fontSize: c.length > 16 ? 34 : 42, color: i === 3 ? "#fff" : "#1A1440", transform: `scale(${k}) rotate(${(1 - Math.min(k, 1)) * (i % 2 ? 8 : -8)}deg)`, boxShadow: "0 10px 0 rgba(0,0,0,.25)" }}>{c}</div>;
              })}
            </div>
            <div style={{ position: "absolute", top: 1215, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${bub})` }}>
              <svg width={560} height={150} viewBox="0 0 560 150">
                <path d="M40,10 H520 a30,30 0 0 1 30,30 V90 a30,30 0 0 1 -30,30 H150 L95,148 L105,120 H40 a30,30 0 0 1 -30,-30 V40 a30,30 0 0 1 30,-30 Z" fill="#fff" />
                <text x={280} y={82} textAnchor="middle" fontFamily={N} fontWeight={900} fontSize={54} fill="#1A1440">{spec.kapanis.yorum ?? "Yorumlara yaz!"}</text>
              </svg>
            </div>
            <div style={{ position: "absolute", top: 1410, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${web})` }}>
              <Pill style={{ fontSize: 46, letterSpacing: 1, padding: "14px 40px" }}>@ingilizcecim.com</Pill>
            </div>
          </AbsoluteFill>
        );
      })()}
      {sub}
    </AbsoluteFill>
  );
};
