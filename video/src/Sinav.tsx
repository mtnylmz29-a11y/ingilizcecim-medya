// Sinav — YDS/YDT soru kâğıdı (Metin, 18 Kasım 2026): ahşap masa, beş şıklı soru, okuma + 5 sn geri sayım,
// yanlış şıklar gerekçesiyle tek tek elenir, doğru şık daire içine alınır ve optik formda kodlanır, kural kartı, kapanış.
// Seslendirme yok; müzik + tik tak + efektler video/sinav.py'de. Zamanlama tek kaynak: sinavZaman.json (sinav.py de okur).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Ikon, IkonAdi } from "./sinavIkon";
import Z from "./sinavZaman.json";
import { loadFont as loadSans } from "@remotion/google-fonts/Nunito";
import { loadFont as loadSerif } from "@remotion/google-fonts/Merriweather";

export type SinavSpec = {
  etiket: string; soruNo: number; soru: string; ikon: IkonAdi;
  secenekler: string[]; dogru: number;
  eleme: { sik: number; neden: string }[];
  kural: string; kuralOrnek: string;
  kapak?: { etiket?: string; baslik: string; alt?: string };   // yalnızca kapak karesi render edilirken verilir
};
export const sinavAnlar = (n: number) => {
  const tSure = Z.giris + Z.oku, tEleme = tSure + Z.sure, tDogru = tEleme + n * Z.elemeHer, tKural = tDogru + Z.dogru, tSon = tKural + Z.kural;
  return { tSure, tEleme, tDogru, tKural, tSon, toplam: tSon + Z.son };
};

const C = { masa1: "#7a4a2b", masa2: "#8f5833", kagit: "#fdfcf7", cizgi: "#d9e3f0", ink: "#1b1f33", kirmizi: "#d7263d", yesil: "#1f9d55", mavi: "#2f5fd0", sari: "#ffd23f" };
// yazı tipleri Google Fonts'tan (kit.tsx ile aynı yol): bulutta (Linux) ve bilgisayarda aynı görünür
const SANS = loadSans("normal", { weights: ["600", "800", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;
const SERIF = loadSerif("normal", { weights: ["400", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;
const SAFE = { top: 250, bottom: 380, left: 60, right: 120 };
const HARF = ["A", "B", "C", "D", "E"];
const KAGIT = { x: SAFE.left, y: 300, w: 1080 - SAFE.left - SAFE.right, h: 1180 };
const sk = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Sinav: React.FC<SinavSpec> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const { tSure, tEleme, tDogru, tKural, tSon } = sinavAnlar(p.eleme.length);
  const kagitG = spring({ frame: f, fps, config: { damping: 14 } });
  const kalan = Math.min(Z.sure / fps, Math.max(0, Math.ceil((tEleme - f) / fps)));
  const halka = interpolate(f, [tSure, tEleme], [1, 0], sk);
  const elendi = (i: number) => { const k = p.eleme.findIndex((e) => e.sik === i); return k < 0 ? -1 : tEleme + k * Z.elemeHer; };
  const aktifEleme = f >= tEleme && f < tDogru ? p.eleme[Math.floor((f - tEleme) / Z.elemeHer)] : null;
  const dogruG = spring({ frame: f - tDogru, fps, config: { damping: 11 } });
  const kuralG = spring({ frame: f - tKural, fps, config: { damping: 13 } });
  const sonG = spring({ frame: f - tSon, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ background: `repeating-linear-gradient(90deg, ${C.masa1} 0 140px, ${C.masa2} 140px 280px)` }}>
      <div style={{ position: "absolute", left: KAGIT.x, top: KAGIT.y, width: KAGIT.w, height: KAGIT.h, background: C.kagit, borderRadius: 10,
        boxShadow: "0 30px 60px rgba(0,0,0,.35)", transform: `translateY(${(1 - kagitG) * 900}px) rotate(${(1 - kagitG) * 6 - 1}deg)`,
        backgroundImage: `repeating-linear-gradient(${C.kagit} 0 58px, ${C.cizgi} 58px 60px)` }}>
        <div style={{ position: "absolute", left: 40, top: 30, fontFamily: SANS, fontSize: 34, fontWeight: 800, color: C.mavi, letterSpacing: 2 }}>{p.etiket}</div>
        <div style={{ position: "absolute", right: 30, top: 18 }}><Ikon ad={p.ikon} boyut={110} /></div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 140, fontFamily: SERIF, fontSize: 50, lineHeight: 1.4, color: C.ink }}>
          <b>{p.soruNo}.</b> {p.soru}
        </div>
        {p.secenekler.map((s, i) => {
          const te = elendi(i), cizik = te < 0 ? 0 : interpolate(f, [te, te + 10], [0, 1], sk);
          const giris = interpolate(f, [12 + i * 4, 24 + i * 4], [0, 1], sk);
          return (
            <div key={i} style={{ position: "absolute", left: 60, top: 470 + i * 96, fontFamily: SERIF, fontSize: 52, color: C.ink, opacity: (1 - cizik * .55) * giris }}>
              <span style={{ display: "inline-block", width: 70, position: "relative" }}>{HARF[i]})
                {i === p.dogru && dogruG > 0 && <svg width="110" height="90" style={{ position: "absolute", left: -32, top: -14 }} viewBox="0 0 110 90">
                  <ellipse cx="50" cy="44" rx="44" ry="34" fill="none" stroke={C.yesil} strokeWidth="7" strokeDasharray="260" strokeDashoffset={260 * (1 - dogruG)} /></svg>}
              </span>
              <span style={{ position: "relative" }}>{s}
                <span style={{ position: "absolute", left: -6, top: "52%", height: 7, width: `${cizik * 108}%`, background: C.kirmizi, borderRadius: 4, transform: "rotate(-3deg)" }} />
              </span>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 40, right: 40, bottom: 40, height: 120, borderRadius: 14, background: "#fff5f5", border: "3px solid #f2b8b8",
          display: "flex", alignItems: "center", justifyContent: "space-around", fontFamily: SANS }}>
          <span style={{ fontSize: 34, fontWeight: 800, color: "#c75b5b" }}>{p.soruNo}</span>
          {HARF.map((h, i) => {
            const dolu = interpolate(f, [tDogru + 15, tDogru + 27], [0, 1], sk) * (i === p.dogru ? 1 : 0);
            return (<div key={h} style={{ width: 70, height: 70, borderRadius: 35, border: "4px solid #c75b5b", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 800, color: "#c75b5b", position: "relative", overflow: "hidden" }}>{h}
              {dolu > 0 && <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: `${dolu * 100}%`, background: C.ink }} />}</div>);
          })}
        </div>
      </div>
      {f >= tSure - 8 && f < tEleme + 10 && (
        <div style={{ position: "absolute", top: SAFE.top - 30, right: SAFE.right + 170, width: 150, height: 150,
          opacity: interpolate(f, [tSure - 8, tSure, tEleme, tEleme + 10], [0, 1, 1, 0], sk), transform: `scale(${1 + .08 * Math.max(0, Math.sin((f - tSure) / fps * Math.PI * 2)) * (kalan <= 2 ? 1 : 0)})` }}>
          <svg viewBox="0 0 100 100" width="150" height="150"><circle cx="50" cy="50" r="44" fill={kalan <= 2 ? C.kirmizi : C.ink} /><circle cx="50" cy="50" r="38" fill="none" stroke={C.sari} strokeWidth="9"
            strokeDasharray={239} strokeDashoffset={239 * (1 - halka)} transform="rotate(-90 50 50)" /></svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontSize: 64, fontWeight: 900, color: "#fff" }}>{kalan}</div>
        </div>
      )}
      {aktifEleme && (
        <div style={{ position: "absolute", left: SAFE.left + 20, right: SAFE.right + 20, top: KAGIT.y + KAGIT.h - 40, fontFamily: SANS, fontSize: 46, fontWeight: 800,
          color: "#fff", background: C.kirmizi, padding: "22px 30px", borderRadius: 22, boxShadow: "0 12px 0 rgba(0,0,0,.25)" }}>
          ✗ {HARF[aktifEleme.sik]}) {aktifEleme.neden}
        </div>
      )}
      {f >= tDogru && f < tKural && (
        <div style={{ position: "absolute", left: SAFE.left + 20, right: SAFE.right + 20, top: KAGIT.y + KAGIT.h - 40, fontFamily: SANS, fontSize: 50, fontWeight: 900,
          color: "#fff", background: C.yesil, padding: "22px 30px", borderRadius: 22, transform: `scale(${dogruG})` }}>✓ Cevap {HARF[p.dogru]}</div>
      )}
      {f >= tKural && f < tSon && (
        <AbsoluteFill style={{ background: `rgba(15,18,35,${.85 * kuralG})`, alignItems: "center", justifyContent: "center", paddingRight: SAFE.right, paddingLeft: SAFE.left }}>
          <div style={{ background: C.sari, borderRadius: 30, padding: "50px 46px", transform: `scale(${kuralG}) rotate(-1.5deg)`, fontFamily: SANS, color: C.ink }}>
            <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: 3 }}>KURAL</div>
            <div style={{ fontSize: 62, fontWeight: 900, marginTop: 14, lineHeight: 1.25, whiteSpace: "pre-line" }}>{p.kural}</div>
            <div style={{ fontSize: 46, fontWeight: 600, marginTop: 24, fontFamily: SERIF }}>{p.kuralOrnek}</div>
          </div>
        </AbsoluteFill>
      )}
      {p.kapak && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, padding: "40px 60px 46px", background: "rgba(27,31,51,.93)", fontFamily: SANS, textAlign: "center" }}>
          <div style={{ fontSize: 46, fontWeight: 900, letterSpacing: 6, color: C.sari }}>{p.kapak.etiket ?? p.etiket}</div>
          <div style={{ fontSize: 150, fontWeight: 900, color: "#fff", lineHeight: 1.05, marginTop: 10 }}>{p.kapak.baslik}</div>
          {p.kapak.alt && <div style={{ fontSize: 70, fontWeight: 800, color: "#ffb4bd", marginTop: 14 }}>{p.kapak.alt}</div>}
        </div>
      )}
      {f >= tSon && (
        <AbsoluteFill style={{ background: C.ink, alignItems: "center", justifyContent: "center", paddingRight: SAFE.right }}>
          <div style={{ fontFamily: SANS, fontSize: 92, fontWeight: 900, color: "#fff", transform: `scale(${sonG})` }}>ingilizcecim<span style={{ color: C.sari }}>.com</span></div>
          <div style={{ fontFamily: SANS, fontSize: 44, fontWeight: 700, color: "#9fb0d6", marginTop: 20, opacity: sonG }}>Her gün bir YDS sorusu</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
