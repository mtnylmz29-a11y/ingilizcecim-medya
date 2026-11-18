// Sınav sorusu biçimi için düz vektör ikonlar (viewBox 0 0 100 100). Spec: "ikon": "<ad>". Ad listesi = IKON_ADLARI (sinav.py buradan okur).
import React from "react";

export const IKON_ADLARI = ["kahve", "bisiklet", "sehir", "saat", "kumSaati", "takvim", "kitap", "kirikTabak", "tabela", "bulasik",
  "canta", "grafik", "yatak", "ev", "soru", "kalem", "ucak", "telefon"] as const;
export type IkonAdi = (typeof IKON_ADLARI)[number];

const K = { ink: "#1d2340", krem: "#fff4dc", turuncu: "#ff8a3d", mercan: "#ff5d6c", sari: "#ffd23f", turkuaz: "#2ec4b6", mavi: "#3a86ff", mor: "#8b5cf6", yesil: "#3ddc84", gri: "#c9d1e4", kahve: "#8b5a3c", beyaz: "#ffffff" };
const s = { stroke: K.ink, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const CIZIM: Record<IkonAdi, React.ReactNode> = {
  kahve: (<g {...s}><path d="M22 40h46v22a18 18 0 0 1-18 18H40a18 18 0 0 1-18-18z" fill={K.beyaz} /><path d="M68 46h6a9 9 0 0 1 0 18h-7" fill="none" />
    <path d="M27 48h36v12a12 12 0 0 1-12 12H39a12 12 0 0 1-12-12z" fill={K.kahve} stroke="none" /><path d="M36 30c-4-6 4-8 0-14M48 30c-4-6 4-8 0-14M60 30c-4-6 4-8 0-14" fill="none" stroke={K.gri} /><path d="M16 86h68" /></g>),
  bisiklet: (<g {...s} fill="none"><circle cx="26" cy="64" r="16" /><circle cx="74" cy="64" r="16" /><path d="M26 64l16-26h22l10 26M42 38l14 26h18M40 30h10M60 30l4 8" stroke={K.mercan} /><circle cx="56" cy="64" r="3" fill={K.ink} /></g>),
  sehir: (<g {...s}><rect x="12" y="40" width="22" height="46" fill={K.mavi} /><rect x="38" y="18" width="24" height="68" fill={K.mor} /><rect x="66" y="50" width="22" height="36" fill={K.turkuaz} />
    {[26, 38, 50, 62, 74].map((y) => <g key={y}><rect x="43" y={y} width="5" height="6" fill={K.sari} stroke="none" /><rect x="52" y={y} width="5" height="6" fill={K.sari} stroke="none" /></g>)}
    <path d="M6 86h88" /></g>),
  saat: (<g {...s}><circle cx="50" cy="52" r="34" fill={K.beyaz} /><path d="M50 52V30M50 52l14 10" fill="none" stroke={K.mercan} strokeWidth={6} /><circle cx="50" cy="52" r="4" fill={K.ink} />
    {[0, 90, 180, 270].map((a) => <path key={a} d="M50 22v6" transform={`rotate(${a} 50 52)`} />)}<path d="M26 22l-8-6M74 22l8-6" /></g>),
  kumSaati: (<g {...s}><path d="M28 12h44M28 88h44" /><path d="M32 12c0 22 36 22 36 38S32 66 32 88h36c0-22-36-22-36-38s36-16 36-38" fill={K.beyaz} />
    <path d="M40 80h20l-10-10z" fill={K.sari} /><path d="M42 28h16l-8 10z" fill={K.sari} /></g>),
  takvim: (<g {...s}><rect x="14" y="20" width="72" height="66" rx="8" fill={K.beyaz} /><path d="M14 38h72" /><rect x="14" y="20" width="72" height="18" rx="8" fill={K.mercan} />
    <path d="M32 12v14M68 12v14" />{[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={22 + c * 16} y={46 + r * 13} width="9" height="8" fill={r === 1 && c === 2 ? K.mercan : K.gri} stroke="none" />))}</g>),
  kitap: (<g {...s}><path d="M50 26c-10-8-26-8-36-4v58c10-4 26-4 36 4z" fill={K.mavi} /><path d="M50 26c10-8 26-8 36-4v58c-10-4-26-4-36 4z" fill={K.turkuaz} /><path d="M50 26v58" /></g>),
  kirikTabak: (<g {...s}><path d="M46 18a34 34 0 1 0 0 68l6-16-8-10 10-12-6-14z" fill={K.beyaz} /><path d="M58 20a34 34 0 0 1 0 64l4-14-6-8 8-12-4-14z" fill={K.beyaz} transform="translate(6 2)" />
    <circle cx="44" cy="52" r="16" fill="none" stroke={K.gri} /></g>),
  tabela: (<g {...s}><path d="M48 14v74" strokeWidth={6} /><path d="M50 22h30l8 9-8 9H50z" fill={K.turuncu} /><path d="M46 46H18l-8 9 8 9h28z" fill={K.turkuaz} /><path d="M34 88h30" /></g>),
  bulasik: (<g {...s}><rect x="10" y="56" width="80" height="30" rx="6" fill={K.gri} />{[22, 38, 54].map((x) => <ellipse key={x} cx={x + 10} cy="52" rx="12" ry="20" fill={K.beyaz} />)}
    {[[70, 34], [80, 22], [62, 18]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="6" fill={K.beyaz} stroke={K.mavi} />)}</g>),
  canta: (<g {...s}><rect x="12" y="32" width="76" height="52" rx="8" fill={K.kahve} /><path d="M38 32v-8a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v8" fill="none" /><path d="M12 54h76" /><rect x="44" y="49" width="12" height="10" fill={K.sari} /></g>),
  grafik: (<g {...s}><path d="M14 14v72h72" fill="none" />{[[24, 60], [42, 46], [60, 34], [78, 20]].map(([x, y], i) => <rect key={i} x={x - 6} y={y} width="12" height={86 - y} fill={[K.turkuaz, K.mavi, K.mor, K.yesil][i]} />)}
    <path d="M20 56l20-14 18 6 26-30" fill="none" stroke={K.mercan} strokeWidth={5} /></g>),
  yatak: (<g {...s}><path d="M10 40v44M90 60v24M10 70h80" /><rect x="10" y="56" width="80" height="14" fill={K.mavi} /><rect x="16" y="44" width="22" height="12" rx="5" fill={K.beyaz} /><path d="M40 56c10-8 30-8 50 0" fill={K.turkuaz} /></g>),
  ev: (<g {...s}><path d="M14 46L50 16l36 30" fill="none" /><rect x="22" y="42" width="56" height="44" fill={K.sari} /><rect x="42" y="60" width="16" height="26" fill={K.mercan} /><rect x="28" y="52" width="10" height="10" fill={K.beyaz} /></g>),
  soru: (<g {...s}><circle cx="50" cy="50" r="38" fill={K.sari} /><path d="M38 38a12 12 0 1 1 18 10c-4 3-6 5-6 10" fill="none" strokeWidth={7} /><circle cx="50" cy="72" r="4" fill={K.ink} /></g>),
  kalem: (<g {...s}><path d="M70 14l16 16-48 48-20 4 4-20z" fill={K.sari} /><path d="M62 22l16 16M22 62l16 16" /><path d="M18 82l4-20 16 16z" fill={K.krem} /></g>),
  ucak: (<g {...s}><path d="M12 54l76-30-20 58-14-20-16 12 2-18z" fill={K.beyaz} /><path d="M54 62L88 24" fill="none" /></g>),
  telefon: (<g {...s}><rect x="28" y="10" width="44" height="80" rx="8" fill={K.ink} /><rect x="33" y="18" width="34" height="58" rx="3" fill={K.mavi} /><circle cx="50" cy="83" r="3" fill={K.beyaz} /></g>),
};

export const Ikon: React.FC<{ ad: IkonAdi; boyut?: number; style?: React.CSSProperties }> = ({ ad, boyut = 160, style }) => (
  <svg viewBox="0 0 100 100" width={boyut} height={boyut} style={style}>{CIZIM[ad]}</svg>
);
