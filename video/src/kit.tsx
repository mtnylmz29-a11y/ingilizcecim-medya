// Çizgi film kiti: zamanlama yardımcıları, zeminler, karakter, eşyalar, kartlar, altyazı.
// Kataloglar (ZEMINLER, KOSTUMLER, IKONLAR) sistem/VIDEO_ETIMOLOJI.md'de listelenir; yeni öğe eklerken orayı da güncelle.
import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Nunito";

export const F = loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const INK = "#2B2140";
export const GOLD = "#FFC94A";

export type Line = { id: string; lang: string; sub: string; bolum: string; start: number; end: number };
export type Timeline = { fps: number; dur: number; lines: Line[] };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.inOut(Easing.cubic);
export const ramp = (t: number, a: number, b: number, e = ease) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: e });
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const pop = (t: number, at: number, d = 0.45) => {
  const x = (t - at) / d;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 1 - Math.cos(x * Math.PI * 2.2) * Math.exp(-x * 5.5);
};
export const st = (w = 5) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });

/* ------------------------------ parçalar ------------------------------ */
export const Sky: React.FC<{ top: string; bottom: string; id: string }> = ({ top, bottom, id }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#${id})`} />
  </>
);
export const SunDisc: React.FC<{ x: number; y: number; r: number; t: number; color?: string }> = ({ x, y, r, t, color = GOLD }) => (
  <g transform={`translate(${x},${y})`}>
    <g transform={`rotate(${t * 12})`}>
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-r * 0.16},${-r * 1.25} L0,${-r * 1.75} L${r * 0.16},${-r * 1.25} Z`} fill={color} opacity={0.8} transform={`rotate(${i * 30})`} />)}
    </g>
    <circle r={r} fill={color} {...st(5)} />
    <circle cx={-r * 0.3} cy={-r * 0.3} r={r * 0.35} fill="#fff" opacity={0.35} />
  </g>
);
export const Cloud: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-90,30 a40,40 0 0 1 20,-62 a55,55 0 0 1 100,-8 a42,42 0 0 1 62,42 a30,30 0 0 1 -12,58 h-150 a30,30 0 0 1 -20,-30 Z" fill="#fff" {...st(5)} />
  </g>
);
export const Hills: React.FC<{ y: number; a: number; color: string; seed?: number }> = ({ y, a, color, seed = 0 }) => {
  const pts = Array.from({ length: 13 }, (_, i) => `${-40 + i * 97},${y + Math.sin(i * 1.3 + seed) * a + Math.cos(i * 0.7 + seed * 2) * a * 0.5}`);
  return <path d={`M-40,1920 L${pts.join(" L")} L1124,1920 Z`} fill={color} {...st(5)} />;
};
const Cypress: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(t * 1.5 + x) * 2})`}>
    <rect x={-7} y={-30} width={14} height={34} fill="#7A4B2A" {...st(4)} />
    <path d="M0,-260 C40,-200 46,-90 30,-30 L-30,-30 C-46,-90 -40,-200 0,-260 Z" fill="#3C7D46" {...st(5)} />
  </g>
);
const RoundTree: React.FC<{ x: number; y: number; s?: number; t: number; color?: string }> = ({ x, y, s = 1, t, color = "#6BAF5B" }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(t * 1.3 + x) * 2})`}>
    <rect x={-12} y={-110} width={24} height={112} fill="#7A4B2A" {...st(5)} />
    <circle cy={-160} r={90} fill={color} {...st(5)} />
    <circle cx={-30} cy={-185} r={18} fill="#fff" opacity={0.25} />
  </g>
);
const Palm: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-10,0 C-20,-120 10,-220 20,-300 L36,-300 C26,-220 6,-120 14,0 Z" fill="#A8743F" {...st(5)} />
    <g transform={`translate(28,-300) rotate(${Math.sin(t * 1.4 + x) * 4})`}>
      {[-150, -110, -60, -20, 25].map((a, i) => <path key={i} d="M0,0 C40,-40 110,-30 150,20 C100,0 50,0 0,0 Z" fill="#4E9A4A" {...st(4)} transform={`rotate(${a + 60})`} />)}
    </g>
  </g>
);
const Temple: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-170} y={-24} width={340} height={24} fill="#F1E3C6" {...st(5)} />
    <rect x={-150} y={-44} width={300} height={20} fill="#F1E3C6" {...st(5)} />
    {[-120, -60, 0, 60, 120].map((cx) => (
      <g key={cx}>
        <rect x={cx - 16} y={-210} width={32} height={166} fill="#FBF3E2" {...st(5)} />
        <line x1={cx - 5} y1={-200} x2={cx - 5} y2={-54} stroke="#D9C7A3" strokeWidth={4} />
        <line x1={cx + 6} y1={-200} x2={cx + 6} y2={-54} stroke="#D9C7A3" strokeWidth={4} />
      </g>
    ))}
    <rect x={-160} y={-232} width={320} height={24} fill="#F1E3C6" {...st(5)} />
    <path d="M-175,-232 L0,-310 L175,-232 Z" fill="#F1E3C6" {...st(5)} />
    <circle cx={0} cy={-262} r={14} fill={GOLD} {...st(4)} />
  </g>
);
const Castle: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const c = "#B9A98C";
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-150} y={-160} width={300} height={160} fill={c} {...st(5)} />
      {[-150, 90].map((tx) => (
        <g key={tx}>
          <rect x={tx} y={-260} width={60} height={260} fill={c} {...st(5)} />
          <path d={`M${tx - 8},-260 L${tx + 30},-320 L${tx + 68},-260 Z`} fill="#B5463A" {...st(5)} />
        </g>
      ))}
      {[-80, -30, 20, 70].map((bx) => <rect key={bx} x={bx - 14} y={-184} width={28} height={24} fill={c} {...st(4)} />)}
      <path d="M-34,0 L-34,-70 A34,34 0 0 1 34,-70 L34,0 Z" fill="#5B3A29" {...st(5)} />
      <line x1={120} y1={-320} x2={120} y2={-380} {...st(4)} />
      <path d="M120,-380 L165,-366 L120,-352 Z" fill={GOLD} {...st(3)} />
    </g>
  );
};
export const Skyline: React.FC<{ y: number; t: number; color?: string }> = ({ y, t, color = "#5468A8" }) => {
  const b = [[40, 260], [150, 380], [270, 300], [370, 470], [500, 340], [610, 420], [740, 290], [850, 400], [960, 320]];
  return (
    <g>
      {b.map(([x, h], i) => (
        <g key={i}>
          <rect x={x - 50} y={y - h} width={100} height={h} fill={color} {...st(5)} />
          {Array.from({ length: Math.floor(h / 60) }, (_, r) => [0, 1].map((c) => {
            const lit = Math.sin(i * 7 + r * 3 + c * 5 + Math.floor(t * 0.7)) > 0.1;
            return <rect key={`${r}${c}`} x={x - 32 + c * 38} y={y - h + 22 + r * 60} width={26} height={30} rx={4} fill={lit ? "#FFE29A" : "#3B4A80"} />;
          }))}
        </g>
      ))}
    </g>
  );
};
const Road: React.FC<{ color?: string; line?: string }> = ({ color = "#D9BE8E", line = "#B89A66" }) => (
  <>
    <path d="M-40,1300 C300,1240 700,1250 1120,1290 L1120,1420 C700,1380 300,1380 -40,1440 Z" fill={color} stroke={INK} strokeWidth={5} />
    {[80, 300, 520, 740, 960].map((x, i) => <path key={i} d={`M${x},${1345 - i * 2} q30,-14 60,0`} fill="none" stroke={line} strokeWidth={6} />)}
  </>
);
const Waves: React.FC<{ y: number; t: number; color: string }> = ({ y, t, color }) => (
  <path d={`M-60,${y} ${Array.from({ length: 14 }, (_, i) => `q40,${i % 2 ? 18 : -18} 80,0`).join(" ")}`} transform={`translate(${(t * 40) % 160 - 80},0)`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
);

/* ------------------------------- zeminler ------------------------------ */
// Her zemin tüm kareyi çizer; yer çizgisi ~1300 (karakter y=1360 civarında durur).
export const ZEMINLER = ["roma", "yunan", "orta_cag", "liman", "col", "laboratuvar", "tiyatro", "sehir", "ofis", "kir", "gece"] as const;
export const Zemin: React.FC<{ ad: string; t: number }> = ({ ad, t }) => {
  const id = `z_${ad}`;
  switch (ad) {
    case "roma":
      return (<g><Sky top="#FFB36B" bottom="#FFE7B0" id={id} /><SunDisc x={830} y={560} r={90} t={t} /><Cloud x={160 + t * 18} y={520} s={0.9} />
        <Hills y={1020} a={40} color="#B7C96B" seed={1} /><Temple x={760} y={1060} s={0.85} /><Cypress x={120} y={1090} t={t} /><Cypress x={980} y={1110} s={0.8} t={t} />
        <Hills y={1150} a={18} color="#8DB255" seed={3} /><Road /></g>);
    case "yunan":
      return (<g><Sky top="#5BB8F5" bottom="#D8F1FF" id={id} /><SunDisc x={180} y={520} r={80} t={t} /><Cloud x={760 - t * 12} y={480} s={0.85} />
        <rect x={0} y={1000} width={1080} height={160} fill="#2E86DE" {...st(5)} /><Waves y={1060} t={t} color="#9FD8FF" />
        <Hills y={1120} a={30} color="#E8D3A2" seed={5} /><Temple x={700} y={1180} s={1.05} /><RoundTree x={160} y={1240} t={t} color="#8AA65A" />
        <Hills y={1260} a={12} color="#D6BD84" seed={2} /><Road color="#EFE2C2" line="#D6C49A" /></g>);
    case "orta_cag":
      return (<g><Sky top="#D9C7A0" bottom="#F1E6CB" id={id} /><Cloud x={260 + t * 10} y={620} s={0.8} /><Hills y={1050} a={35} color="#A8B85E" seed={4} />
        <Castle x={780} y={1180} /><Cypress x={140} y={1180} s={0.8} t={t} /><Hills y={1180} a={14} color="#97A853" seed={2} /><Road /></g>);
    case "liman": {
      const bob = Math.sin(t * 2) * 6;
      return (<g><Sky top="#7CC6F2" bottom="#E3F5FF" id={id} /><Cloud x={300 + t * 14} y={420} s={0.8} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${i * 150 - 20},${1010 - (i % 2) * 40})`}>
            <rect width={150} height={240 + (i % 2) * 40} fill={["#E8A87C", "#F3D27A", "#D97B66", "#F0C9A0", "#C9A0DC"][i]} {...st(5)} />
            {[0, 1].map((c) => <path key={c} d={`M${30 + c * 60},${90 + (i % 2) * 40} v-40 a15,15 0 0 1 30,0 v40 Z`} fill="#5B3A29" {...st(4)} />)}
            <path d={`M-6,0 L156,0 L140,-24 L10,-24 Z`} fill="#B5463A" {...st(4)} />
          </g>
        ))}
        <rect x={0} y={1190} width={1080} height={200} fill="#2E86DE" {...st(5)} /><Waves y={1240} t={t} color="#9FD8FF" /><Waves y={1310} t={-t} color="#9FD8FF" />
        <g transform={`translate(840,${1250 + bob})`}><Prop ikon="gemi" t={t} /></g>
        <rect x={-10} y={1360} width={1100} height={600} fill="#B98A5A" {...st(5)} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 130} y1={1360} x2={i * 130} y2={1920} stroke="#8E6440" strokeWidth={5} />)}</g>);
    }
    case "col":
      return (<g><Sky top="#FF9F5A" bottom="#FFE3A3" id={id} /><SunDisc x={800} y={560} r={100} t={t} color="#FFB347" />
        <Hills y={1060} a={50} color="#E9B96E" seed={6} />
        <g transform="translate(330,1120)"><rect x={-110} y={-150} width={220} height={150} fill="#F3E2C0" {...st(5)} /><path d="M-90,-150 A90,90 0 0 1 90,-150 Z" fill="#7FB8D8" {...st(5)} />
          <path d="M-30,0 v-60 a30,30 0 0 1 60,0 v60 Z" fill="#5B3A29" {...st(4)} /></g>
        <Palm x={120} y={1220} t={t} /><Palm x={960} y={1240} s={0.85} t={t} /><Hills y={1210} a={20} color="#DDA75A" seed={1} /><Road color="#F0CF8E" line="#D6AE66" /></g>);
    case "laboratuvar":
      return (<g><rect width={1080} height={1920} fill="#6E5A7E" />
        {Array.from({ length: 18 }, (_, r) => Array.from({ length: 7 }, (_, c) => <rect key={`${r}-${c}`} x={c * 160 - (r % 2) * 80} y={r * 70} width={160} height={70} fill="none" stroke="#5B4A6B" strokeWidth={5} />))}
        <rect x={60} y={620} width={960} height={26} fill="#8E6440" {...st(5)} /><rect x={60} y={880} width={960} height={26} fill="#8E6440" {...st(5)} />
        {[120, 260, 420, 600, 760, 900].map((x, i) => <g key={x} transform={`translate(${x},${620}) scale(0.7)`}><Prop ikon={i % 2 ? "kavanoz" : "sise"} t={t + i} renk={["#7CE0A3", "#FF7A59", "#9FD8FF", "#C9A0DC", GOLD, "#7CE0A3"][i]} /></g>)}
        {[200, 480, 760].map((x) => <g key={x} transform={`translate(${x},${880}) scale(0.7)`}><Prop ikon="kitap" t={t} /></g>)}
        <rect x={-20} y={1240} width={1120} height={700} fill="#4A3B57" {...st(5)} /><rect x={520} y={1180} width={520} height={60} fill="#8E6440" {...st(5)} />
        <g transform="translate(900,1180)"><Prop ikon="sise" t={t} renk="#7CE0A3" /></g></g>);
    case "tiyatro":
      return (<g><rect width={1080} height={1920} fill="#2A1838" />
        {[300, 780].map((x) => <path key={x} d={`M${x},300 L${x - 220},1300 L${x + 220},1300 Z`} fill="#FFF3B0" opacity={0.18} />)}
        <rect x={-20} y={1220} width={1120} height={720} fill="#A86B3C" {...st(5)} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 130} y1={1220} x2={i * 130 - 60} y2={1920} stroke="#8E5A31" strokeWidth={5} />)}
        {[0, 1].map((side) => (
          <g key={side} transform={side ? "translate(1080,0) scale(-1,1)" : ""}>
            <path d={`M-20,0 L240,0 C200,${400 + Math.sin(t) * 10} 260,900 140,1250 L-20,1250 Z`} fill="#C8312B" {...st(6)} />
            {[50, 110, 170].map((x) => <path key={x} d={`M${x},20 C${x - 20},400 ${x + 20},800 ${x - 30},1240`} fill="none" stroke="#9E2420" strokeWidth={8} />)}
          </g>
        ))}
        <path d="M-20,0 L1100,0 L1100,150 C800,210 280,210 -20,150 Z" fill="#C8312B" {...st(6)} />
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={90 + i * 130} cy={1240} r={14} fill={GOLD} {...st(3)} />)}</g>);
    case "sehir":
      return (<g><Sky top="#7CC6F2" bottom="#D8F1FF" id={id} /><Cloud x={200 + t * 15} y={500} s={0.8} /><Cloud x={850 - t * 10} y={380} s={0.6} />
        <Skyline y={1200} t={t} /><Hills y={1180} a={14} color="#7CC48A" seed={2} />
        <path d="M-40,1300 L1120,1300 L1120,1920 L-40,1920 Z" fill="#9AA3B8" stroke={INK} strokeWidth={5} /></g>);
    case "ofis":
      return (<g><rect width={1080} height={1920} fill="#F6D9A8" />
        <clipPath id="ofiswin"><rect x={90} y={560} width={520} height={460} rx={14} /></clipPath>
        <rect x={90} y={560} width={520} height={460} rx={14} fill="#9FD8FF" /><g clipPath="url(#ofiswin)"><Skyline y={1040} t={t} color="#7C8FD0" /></g>
        <line x1={350} y1={560} x2={350} y2={1020} stroke={INK} strokeWidth={8} /><rect x={90} y={560} width={520} height={460} rx={14} fill="none" stroke={INK} strokeWidth={8} />
        <g transform="translate(860,775)"><Prop ikon="saat" t={t} /></g>
        <rect x={-20} y={1260} width={1120} height={700} fill="#E3B97F" {...st(5)} /><rect x={560} y={1180} width={500} height={50} fill="#C08A55" {...st(5)} />
        <g transform="translate(960,1180)"><path d="M-30,0 L-24,-60 L24,-60 L30,0 Z" fill="#D97B66" {...st(4)} /><path d="M0,-60 C-40,-120 -10,-150 0,-110 C10,-150 40,-120 0,-60 Z" fill="#4E9A4A" {...st(4)} /></g></g>);
    case "kir":
      return (<g><Sky top="#6EC6FF" bottom="#E0F5FF" id={id} /><SunDisc x={170} y={500} r={80} t={t} /><Cloud x={700 + t * 10} y={460} s={0.9} />
        <Hills y={1060} a={40} color="#8FCB6B" seed={7} />
        <g transform="translate(760,1180)"><rect x={-130} y={-180} width={260} height={180} fill="#C8312B" {...st(5)} /><path d="M-150,-180 L0,-290 L150,-180 Z" fill="#8E2A2A" {...st(5)} />
          <rect x={-45} y={-110} width={90} height={110} fill="#F1E3C6" {...st(5)} /><path d="M-45,-110 L45,0 M45,-110 L-45,0" {...st(4)} /></g>
        <RoundTree x={160} y={1220} t={t} />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={20 + i * 110} y={1210} width={14} height={70} fill="#F1E3C6" {...st(3)} />)}
        <rect x={0} y={1225} width={1080} height={12} fill="#F1E3C6" {...st(3)} />
        <Hills y={1260} a={10} color="#7DBB59" seed={1} /><Road color="#D9BE8E" /></g>);
    case "gece":
      return (<g><Sky top="#0B1338" bottom="#2E2A6B" id={id} />
        {Array.from({ length: 70 }, (_, i) => <circle key={i} cx={(i * 197) % 1080} cy={(i * 131) % 1100} r={2 + (i % 3)} fill="#fff" opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))} />)}
        <g transform="translate(830,420)"><circle r={80} fill="#F6F0C8" {...st(5)} /><circle cx={-25} cy={-15} r={14} fill="#E3DAA8" /><circle cx={20} cy={25} r={10} fill="#E3DAA8" /></g>
        <path d="M150,300 L260,360 L330,300 L430,380 L520,330" fill="none" stroke="#9DB4FF" strokeWidth={3} strokeDasharray="8 8" />
        {[[150, 300], [260, 360], [330, 300], [430, 380], [520, 330]].map(([x, y], i) => <g key={i} transform={`translate(${x},${y}) scale(0.5)`}><Prop ikon="yildiz" t={t} /></g>)}
        <Hills y={1080} a={40} color="#2F3B6E" seed={3} /><Hills y={1200} a={18} color="#26305C" seed={8} /><Road color="#4A4F7A" line="#3A3F68" /></g>);
    default:
      return <Zemin ad="roma" t={t} />;
  }
};

/* ------------------------------- karakter ------------------------------ */
// Kostümler: roma_askeri, toga, katip, denizci, alim, ofis, doktor, isci, robot
export const KOSTUMLER = ["roma_askeri", "toga", "katip", "denizci", "alim", "ofis", "doktor", "isci", "robot"] as const;
type Look = { top: string; arm: string; leg: string; shoe: string; robe?: string; hat?: string };
const LOOK = (k: string, skin: string): Look => ({
  roma_askeri: { top: "#C8312B", arm: skin, leg: skin, shoe: "#7A4B2A", hat: "kask" },
  toga: { top: "#FFFFFF", arm: skin, leg: skin, shoe: "#7A4B2A", robe: "#FFFFFF", hat: "defne" },
  katip: { top: "#8A5A3B", arm: "#8A5A3B", leg: "#5B3A29", shoe: "#3A2A20", robe: "#8A5A3B", hat: "bere" },
  denizci: { top: "#FFFFFF", arm: "#FFFFFF", leg: "#2F3E7A", shoe: INK, hat: "denizci" },
  alim: { top: "#2E8B8B", arm: "#2E8B8B", leg: "#1F5F5F", shoe: "#3A2A20", robe: "#2E8B8B", hat: "sarik" },
  ofis: { top: "#FFFFFF", arm: "#FFFFFF", leg: "#34406B", shoe: INK },
  doktor: { top: "#FFFFFF", arm: "#FFFFFF", leg: "#5B8DEF", shoe: INK },
  isci: { top: "#3D6FB6", arm: "#E9D8B4", leg: "#3D6FB6", shoe: "#5B3A29", hat: "kasket" },
  robot: { top: "#AEB7C6", arm: "#AEB7C6", leg: "#8E98AA", shoe: "#5D6676" },
} as Record<string, Look>)[k] ?? { top: "#FFFFFF", arm: "#FFFFFF", leg: "#34406B", shoe: INK };

export const Person: React.FC<{ x: number; y: number; s?: number; t: number; kostum: string; walk?: number; face?: 1 | -1; talk?: boolean; sac?: string; armUp?: number }> =
  ({ x, y, s = 1, t, kostum, walk = 0, face = 1, talk = false, sac = "kisa", armUp = 0 }) => {
  const skin = "#F2C49B";
  const L = LOOK(kostum, skin);
  const robot = kostum === "robot";
  const ph = t * 9, leg = Math.sin(ph) * 26 * walk, arm = -Math.sin(ph) * 22 * walk, bob = Math.abs(Math.sin(ph)) * -8 * walk;
  const blink = (t % 3.1) < 0.12 ? 0.15 : 1;
  const mouth = talk ? 4 + Math.abs(Math.sin(t * 17)) * 9 : 0;
  const Leg = ({ a }: { a: number }) => (
    <g transform={`rotate(${a},0,-112)`}>
      <rect x={-13} y={-118} width={26} height={110} rx={robot ? 4 : 12} fill={L.leg} {...st(5)} />
      <ellipse cx={8} cy={-6} rx={22} ry={11} fill={L.shoe} {...st(5)} />
      {(kostum === "roma_askeri" || kostum === "toga") && [-70, -45, -22].map((yy) => <line key={yy} x1={-13} y1={yy} x2={13} y2={yy} stroke="#7A4B2A" strokeWidth={5} />)}
    </g>
  );
  const Arm = ({ a }: { a: number }) => (
    <g transform={`rotate(${a},0,-200)`}>
      <rect x={-12} y={-206} width={24} height={96} rx={robot ? 4 : 12} fill={L.arm} {...st(5)} />
      <circle cx={0} cy={-104} r={15} fill={robot ? "#8E98AA" : skin} {...st(5)} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y + bob}) scale(${s * face},${s})`}>
      <ellipse cx={0} cy={6} rx={70} ry={12} fill="#000" opacity={0.18} />
      {L.robe && kostum !== "toga" ? (
        <><ellipse cx={-20 + leg * 0.4} cy={-6} rx={22} ry={11} fill={L.shoe} {...st(5)} /><ellipse cx={22 - leg * 0.4} cy={-6} rx={22} ry={11} fill={L.shoe} {...st(5)} /></>
      ) : (<><g transform="translate(-16,0)"><Leg a={leg} /></g><g transform="translate(16,0)"><Leg a={-leg} /></g></>)}
      <g transform="translate(-52,0)"><Arm a={arm + 8} /></g>
      {/* gövde */}
      {kostum === "roma_askeri" && (<>
        <path d="M-50,-215 L50,-215 L58,-95 L-58,-95 Z" fill={L.top} {...st(5)} />
        {[-48, -24, 0, 24, 48].map((px) => <rect key={px} x={px - 10} y={-100} width={20} height={38} rx={5} fill={GOLD} {...st(4)} />)}
        <rect x={-56} y={-128} width={112} height={18} fill="#7A4B2A" {...st(4)} />
        <path d="M-44,-212 L44,-212 L40,-160 L-40,-160 Z" fill="#D9A33A" {...st(4)} /></>)}
      {kostum === "toga" && (<>
        <path d="M-50,-215 L50,-215 L64,-60 L-64,-60 Z" fill="#fff" {...st(5)} />
        <path d="M-50,-215 L64,-90" stroke="#C8312B" strokeWidth={12} /><path d="M-50,-215 L64,-90" fill="none" {...st(3)} /></>)}
      {L.robe && kostum !== "toga" && (<>
        <path d="M-46,-215 L46,-215 L74,-12 L-74,-12 Z" fill={L.robe} {...st(5)} />
        <rect x={-50} y={-130} width={100} height={14} fill={kostum === "alim" ? GOLD : "#5B3A29"} {...st(4)} /></>)}
      {kostum === "denizci" && (<>
        <rect x={-58} y={-130} width={116} height={30} rx={8} fill={L.leg} {...st(5)} />
        <path d="M-50,-215 L50,-215 L54,-110 L-54,-110 Z" fill="#fff" {...st(5)} />
        {[-190, -165, -140].map((yy) => <line key={yy} x1={-52} y1={yy} x2={52} y2={yy} stroke="#2F3E7A" strokeWidth={9} />)}
        <path d="M-30,-215 L0,-180 L30,-215" fill="#2F3E7A" {...st(4)} /></>)}
      {(kostum === "ofis" || kostum === "doktor") && (<>
        <rect x={-58} y={-130} width={116} height={30} rx={8} fill={L.leg} {...st(5)} />
        <path d="M-50,-215 L50,-215 L54,-110 L-54,-110 Z" fill="#fff" {...st(5)} />
        {kostum === "ofis" ? <path d="M0,-212 L-11,-196 L0,-140 L11,-196 Z" fill="#2F5BD3" {...st(4)} />
          : <><path d="M-54,-215 L-60,-70 L-20,-70 L-10,-215 Z M54,-215 L60,-70 L20,-70 L10,-215 Z" fill="#fff" {...st(4)} /><path d="M-20,-210 C-30,-150 30,-150 20,-210" fill="none" stroke="#5D6676" strokeWidth={6} /><circle cx={0} cy={-158} r={9} fill="#AEB7C6" {...st(3)} /></>}
      </>)}
      {kostum === "isci" && (<>
        <path d="M-50,-215 L50,-215 L54,-100 L-54,-100 Z" fill="#E9D8B4" {...st(5)} />
        <path d="M-40,-180 L40,-180 L54,-95 L-54,-95 Z" fill={L.top} {...st(5)} />
        <line x1={-30} y1={-215} x2={-30} y2={-180} stroke={L.top} strokeWidth={10} /><line x1={30} y1={-215} x2={30} y2={-180} stroke={L.top} strokeWidth={10} /></>)}
      {robot && (<>
        <rect x={-58} y={-220} width={116} height={124} rx={10} fill={L.top} {...st(5)} />
        <rect x={-34} y={-196} width={68} height={50} rx={6} fill="#5D6676" {...st(4)} />
        {[0, 1, 2].map((i) => <circle key={i} cx={-18 + i * 18} cy={-171} r={6} fill={Math.sin(t * 6 + i) > 0 ? "#7CE0A3" : "#FF7A59"} />)}</>)}
      {/* baş */}
      <g transform="translate(0,-268)">
        {robot ? (<>
          <rect x={-10} y={30} width={20} height={26} fill="#8E98AA" {...st(4)} />
          <rect x={-56} y={-50} width={112} height={96} rx={16} fill={L.top} {...st(5)} />
          <line x1={0} y1={-50} x2={0} y2={-86} {...st(5)} /><circle cy={-92} r={10} fill={Math.sin(t * 5) > 0 ? "#FF7A59" : GOLD} {...st(4)} />
          <rect x={4} y={-20} width={20} height={20 * blink} rx={4} fill="#7CE0A3" {...st(3)} /><rect x={30} y={-20} width={20} height={20 * blink} rx={4} fill="#7CE0A3" {...st(3)} />
          <rect x={8} y={16} width={36} height={mouth > 0 ? 8 + mouth : 8} rx={3} fill="#5D6676" {...st(3)} /></>) : (<>
          {sac === "uzun" && <path d="M-58,-6 C-66,60 -40,74 -30,40 L30,40 C40,74 66,60 58,-6 Z" fill="#5B3A29" {...st(5)} />}
          <rect x={-14} y={30} width={28} height={26} fill={skin} {...st(5)} />
          <circle r={56} fill={skin} {...st(5)} />
          <circle cx={-58} cy={6} r={12} fill={skin} {...st(4)} />
          {!L.hat && sac === "kisa" && <path d="M-56,-6 C-60,-62 52,-72 58,-10 C30,-28 -10,-30 -56,-6 Z" fill="#5B3A29" {...st(5)} />}
          {!L.hat && sac === "uzun" && <path d="M-58,4 C-62,-66 62,-66 58,4 C40,-24 -30,-30 -58,4 Z" fill="#5B3A29" {...st(5)} />}
          <ellipse cx={14} cy={-4} rx={7} ry={10 * blink} fill={INK} /><ellipse cx={38} cy={-4} rx={7} ry={10 * blink} fill={INK} />
          <circle cx={44} cy={18} r={9} fill="#F49A8A" opacity={0.6} />
          {mouth > 0 ? <ellipse cx={26} cy={26} rx={10} ry={mouth} fill="#7A2E2E" {...st(3)} /> : <path d="M12,22 Q26,36 40,22" fill="none" {...st(4)} />}
          {L.hat === "kask" && (<>
            <path d="M-62,6 C-66,-70 62,-74 62,0 L44,-2 C40,-40 -40,-44 -44,4 Z" fill="#E0A526" {...st(5)} />
            <path d="M-62,6 L-62,40 L-44,36 L-44,4 Z" fill="#E0A526" {...st(4)} />
            <path d="M-50,-50 C-40,-110 40,-110 50,-50 C30,-80 -30,-80 -50,-50 Z" fill="#C8312B" {...st(5)} /></>)}
          {L.hat === "defne" && (<>
            <path d="M-56,-6 C-60,-62 52,-72 58,-10 C30,-28 -10,-30 -56,-6 Z" fill="#5B3A29" {...st(5)} />
            {[-50, -30, -10, 10, 30, 50].map((a, i) => <ellipse key={i} cx={a} cy={-30 - Math.cos(a / 40) * 18} rx={12} ry={7} fill="#6BAF5B" {...st(3)} transform={`rotate(${a * 0.8},${a},${-30})`} />)}</>)}
          {L.hat === "bere" && <path d="M-60,-20 C-60,-70 60,-74 62,-20 C70,-30 40,-36 0,-34 C-40,-34 -66,-30 -60,-20 Z" fill="#9B2C2C" {...st(5)} />}
          {L.hat === "denizci" && <><path d="M-54,-30 C-50,-70 50,-70 54,-30 Z" fill="#fff" {...st(5)} /><rect x={-56} y={-34} width={112} height={14} fill="#2F3E7A" {...st(4)} /></>}
          {L.hat === "sarik" && <path d="M-60,-10 C-70,-60 -20,-84 0,-80 C30,-84 70,-60 60,-10 C30,-26 -30,-26 -60,-10 Z" fill="#F4F1EA" {...st(5)} />}
          {L.hat === "kasket" && <><path d="M-56,-14 C-56,-66 56,-66 56,-14 Z" fill="#3D6FB6" {...st(5)} /><path d="M20,-18 L84,-12 L56,-4 Z" fill="#2F5596" {...st(4)} /></>}
        </>)}
      </g>
      <g transform="translate(52,0)"><Arm a={-arm - 8 - armUp} /></g>
      {kostum === "roma_askeri" && (
        <g transform="translate(-70,-150)">
          <rect x={-40} y={-70} width={80} height={130} rx={18} fill="#C8312B" {...st(5)} />
          <rect x={-30} y={-60} width={60} height={110} rx={12} fill="none" stroke={GOLD} strokeWidth={6} />
          <circle r={14} fill={GOLD} {...st(4)} />
        </g>
      )}
    </g>
  );
};

/* -------------------------------- eşyalar ------------------------------ */
// Prop: (0,0) eşyanın tabanının ortasıdır. `metin` tabela/çuval/takvim üstüne yazılır.
export const IKONLAR = ["para", "tuz", "cuval", "tabela", "gemi", "sise", "kavanoz", "ekmek", "yildiz", "fare", "yumak", "parsomen", "kitap", "saat", "takvim", "buyutec", "grafik", "kalp", "soru", "kas", "disli", "goz", "maske", "sandik"] as const;
export const Prop: React.FC<{ ikon: string; t: number; metin?: string; renk?: string; k?: number }> = ({ ikon, t, metin = "", renk, k = 1 }) => {
  switch (ikon) {
    case "para": return <g transform={`translate(0,-30) scale(${Math.max(0.15, Math.abs(Math.cos(t * 3)))},1)`}><circle r={30} fill={GOLD} {...st(4)} /><circle r={18} fill="none" stroke="#D9A33A" strokeWidth={4} /></g>;
    case "tuz": return (<g><path d="M-120,0 C-90,-40 -50,-120 0,-130 C50,-120 90,-40 120,0 Z" fill="#fff" {...st(5)} />
      <path d="M-60,-40 l14,-14 l14,14 l-14,14 Z M10,-90 l10,-10 l10,10 l-10,10 Z M40,-30 l12,-12 l12,12 l-12,12 Z" fill="#E3ECF7" stroke="#B9C7DB" strokeWidth={3} />
      {[0, 1, 2].map((i) => <path key={i} d="M0,-14 L4,-4 L14,0 L4,4 L0,14 L-4,4 L-14,0 L-4,-4 Z" fill={GOLD} transform={`translate(${[-50, 30, 70][i]},${[-80, -120, -50][i]}) scale(${Math.sin(((t * 0.9 + i / 3) % 1) * Math.PI)})`} />)}</g>);
    case "cuval": return (<g><path d="M-60,0 C-80,-60 -60,-120 -30,-140 L30,-140 C60,-120 80,-60 60,0 Z" fill="#D8B784" {...st(5)} /><path d="M-34,-140 C-20,-160 20,-160 34,-140" fill="#C49E66" {...st(5)} />
      <text y={-55} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={34} fill={INK}>{metin}</text></g>);
    case "tabela": return (<g><rect x={-9} y={-170} width={18} height={170} fill="#7A4B2A" {...st(5)} />
      <rect x={-metin.length * 13 - 22} y={-220} width={metin.length * 26 + 44} height={64} rx={10} fill={renk ?? "#F1E3C6"} {...st(5)} />
      <text y={-176} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={38} fill={INK}>{metin}</text></g>);
    case "gemi": return (<g><path d="M-150,-60 L150,-60 L110,0 L-110,0 Z" fill="#8E5A31" {...st(5)} /><rect x={-6} y={-300} width={12} height={240} fill="#5B3A29" {...st(4)} />
      <path d={`M10,-290 C${80 + Math.sin(t * 2) * 8},-240 ${80 + Math.sin(t * 2) * 8},-140 10,-90 Z`} fill="#F4F1EA" {...st(5)} />
      <path d="M-10,-270 C-70,-220 -70,-140 -10,-100 Z" fill="#F4F1EA" {...st(5)} /><path d="M0,-300 L50,-288 L0,-276 Z" fill="#C8312B" {...st(3)} />
      {[-90, -30, 30, 90].map((x) => <circle key={x} cx={x} cy={-32} r={9} fill="#F3D27A" {...st(3)} />)}</g>);
    case "sise": {
      const c = renk ?? "#7CE0A3";
      return (<g><path d="M-20,-150 L-20,-110 L-70,-20 C-80,0 -60,0 -50,0 L50,0 C60,0 80,0 70,-20 L20,-110 L20,-150 Z" fill="#E3F5FF" {...st(5)} />
        <path d="M-58,-30 L58,-30 L70,-20 C80,0 60,0 50,0 L-50,0 C-60,0 -80,0 -70,-20 Z" fill={c} />
        <path d="M-20,-150 L-20,-110 L-70,-20 C-80,0 -60,0 -50,0 L50,0 C60,0 80,0 70,-20 L20,-110 L20,-150 Z" fill="none" {...st(5)} />
        {[0, 1, 2].map((i) => { const q = (t * 0.8 + i / 3) % 1; return <circle key={i} cx={-10 + i * 10} cy={-30 - q * 160} r={6 + i * 2} fill={c} opacity={1 - q} {...st(2)} />; })}
        <rect x={-26} y={-166} width={52} height={18} rx={4} fill="#A8743F" {...st(4)} /></g>);
    }
    case "kavanoz": return (<g><rect x={-50} y={-110} width={100} height={110} rx={18} fill={renk ?? "#C9A0DC"} {...st(5)} /><rect x={-56} y={-130} width={112} height={26} rx={6} fill="#5B3A29" {...st(4)} />
      <rect x={-30} y={-80} width={60} height={40} rx={6} fill="#fff" {...st(3)} /></g>);
    case "ekmek": return (<g><path d="M-120,0 C-140,-70 -60,-110 0,-110 C60,-110 140,-70 120,0 Z" fill="#E0A55B" {...st(5)} />
      {[-60, -10, 40].map((x) => <path key={x} d={`M${x},-90 q20,30 30,60`} fill="none" stroke="#B5763A" strokeWidth={8} strokeLinecap="round" />)}</g>);
    case "yildiz": return <g transform={`translate(0,-60) rotate(${Math.sin(t * 2) * 8}) scale(${1 + Math.sin(t * 4) * 0.05})`}><path d="M0,-60 L17,-20 L60,-18 L26,10 L38,52 L0,28 L-38,52 L-26,10 L-60,-18 L-17,-20 Z" fill={renk ?? GOLD} {...st(5)} /></g>;
    case "fare": return (<g transform={`translate(${Math.sin(t * 3) * 10},0)`}><ellipse cx={0} cy={-40} rx={70} ry={42} fill="#B9B3CC" {...st(5)} />
      <circle cx={52} cy={-80} r={24} fill="#B9B3CC" {...st(4)} /><circle cx={52} cy={-80} r={12} fill="#F49A8A" />
      <circle cx={60} cy={-44} r={6} fill={INK} /><circle cx={78} cy={-34} r={7} fill="#F49A8A" {...st(2)} />
      <path d={`M-70,-40 C-120,-40 -110,${-90 + Math.sin(t * 6) * 10} -150,-70`} fill="none" {...st(5)} /></g>);
    case "yumak": return (<g transform={`rotate(${t * 40},0,-60)`}><circle cy={-60} r={60} fill={renk ?? "#E8475F"} {...st(5)} />
      {[-30, 0, 30].map((a) => <path key={a} d="M-55,-60 C-20,-110 20,-10 55,-60" fill="none" stroke="#B5313F" strokeWidth={5} transform={`rotate(${a},0,-60)`} />)}</g>);
    case "parsomen": return (<g><rect x={-90} y={-170} width={180} height={150} fill="#F4E4B8" {...st(5)} />
      <rect x={-104} y={-186} width={208} height={26} rx={13} fill="#E3C98A" {...st(5)} /><rect x={-104} y={-30} width={208} height={26} rx={13} fill="#E3C98A" {...st(5)} />
      {[-130, -105, -80].map((y) => <line key={y} x1={-60} y1={y} x2={60} y2={y} stroke="#B89A66" strokeWidth={6} />)}
      {metin && <text y={-90} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={34} fill={INK}>{metin}</text>}</g>);
    case "kitap": return (<g><path d="M-100,0 L-100,-110 C-60,-130 -20,-120 0,-104 C20,-120 60,-130 100,-110 L100,0 C60,-20 20,-10 0,6 C-20,-10 -60,-20 -100,0 Z" fill="#fff" {...st(5)} />
      <path d="M0,-104 L0,6" {...st(4)} /><path d="M-104,4 L-104,-100 M104,4 L104,-100" stroke={renk ?? "#C8312B"} strokeWidth={10} /></g>);
    case "saat": return (<g transform="translate(0,-75)"><circle r={70} fill="#fff" {...st(6)} />
      <line x1={0} y1={0} x2={0} y2={-48} stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${t * 300})`} />
      <line x1={0} y1={0} x2={30} y2={0} stroke={INK} strokeWidth={7} strokeLinecap="round" transform={`rotate(${t * 25})`} /></g>);
    case "takvim": return (<g><rect x={-70} y={-140} width={140} height={140} rx={14} fill="#fff" {...st(6)} /><rect x={-70} y={-140} width={140} height={38} fill="#E8475F" {...st(6)} />
      <text y={-28} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={60} fill={INK}>{metin || "30"}</text></g>);
    case "buyutec": return (<g transform={`translate(0,-80) rotate(${-20 + Math.sin(t * 2) * 8})`}><line x1={40} y1={40} x2={100} y2={100} stroke="#7A4B2A" strokeWidth={22} strokeLinecap="round" />
      <circle r={60} fill="#CFEFFF" fillOpacity={0.6} {...st(8)} /><circle cx={-20} cy={-20} r={14} fill="#fff" opacity={0.7} /></g>);
    case "grafik": return (<g><rect x={-180} y={-360} width={360} height={360} rx={20} fill="#fff" {...st(6)} />
      <text y={-304} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={40} fill={INK}>{metin}</text>
      {[0.35, 0.5, 0.95].map((h, i) => <rect key={i} x={-130 + i * 95} y={-40 - 230 * h * (i === 2 ? k : 1)} width={70} height={230 * h * (i === 2 ? k : 1)} rx={8} fill={i === 2 ? "#3CB371" : "#B9C7DB"} {...st(5)} />)}</g>);
    case "kalp": return <g transform={`translate(0,-70) scale(${1 + Math.abs(Math.sin(t * 4)) * 0.08})`}><path d="M0,60 C-90,0 -70,-70 0,-40 C70,-70 90,0 0,60 Z" fill={renk ?? "#E8475F"} {...st(5)} /></g>;
    case "soru": return <g transform={`translate(0,-80) rotate(${Math.sin(t * 3) * 8})`}><circle r={70} fill={renk ?? "#9FD8FF"} {...st(6)} /><text y={34} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={110} fill={INK}>?</text></g>;
    case "kas": return (<g transform={`translate(0,-60) scale(${1 + Math.abs(Math.sin(t * 3)) * 0.06})`}><path d="M-100,40 L-60,-40 C-50,-70 -20,-70 -10,-50 C0,-90 60,-90 70,-40 C80,0 40,40 -20,40 Z" fill="#F2C49B" {...st(6)} />
      <path d="M-10,-50 C0,-20 30,-20 40,-40" fill="none" {...st(4)} /></g>);
    case "disli": return (<g transform={`translate(0,-70) rotate(${t * 60})`}>{Array.from({ length: 8 }, (_, i) => <rect key={i} x={-14} y={-76} width={28} height={30} rx={4} fill="#AEB7C6" {...st(4)} transform={`rotate(${i * 45})`} />)}
      <circle r={52} fill="#AEB7C6" {...st(5)} /><circle r={18} fill="#fff" {...st(4)} /></g>);
    case "goz": return (<g transform="translate(0,-60)"><path d="M-90,0 C-50,-60 50,-60 90,0 C50,60 -50,60 -90,0 Z" fill="#fff" {...st(6)} /><circle r={32} fill="#5B8DEF" {...st(4)} /><circle r={14} fill={INK} />
      <path d="M-96,-4 C-50,-74 50,-74 96,-4" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" /></g>);
    case "maske": return (<g transform="translate(0,-70)"><path d="M-80,-60 C-80,40 -20,70 0,70 C20,70 80,40 80,-60 C40,-40 -40,-40 -80,-60 Z" fill={renk ?? "#F4F1EA"} {...st(6)} />
      <ellipse cx={-30} cy={-10} rx={16} ry={10} fill={INK} /><ellipse cx={30} cy={-10} rx={16} ry={10} fill={INK} /><path d="M-30,30 Q0,54 30,30" fill="none" {...st(5)} /></g>);
    case "sandik": return (<g><rect x={-100} y={-120} width={200} height={120} rx={10} fill="#A8743F" {...st(5)} /><path d="M-100,-120 C-100,-180 100,-180 100,-120 Z" fill="#8E5A31" {...st(5)} />
      <rect x={-18} y={-136} width={36} height={40} rx={6} fill={GOLD} {...st(4)} /></g>);
    default: return null;
  }
};

/* --------------------------------- efekt -------------------------------- */
export const Puff: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k <= 0 || k >= 1) return null;
  return (
    <g transform={`translate(${x},${y})`} opacity={1 - k}>
      {Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2, d = 40 + k * 140; return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d * 0.8} r={60 * (1 - k * 0.5)} fill="#fff" {...st(4)} />; })}
    </g>
  );
};
export const Bubble: React.FC<{ x: number; y: number; s: number; children: React.ReactNode }> = ({ x, y, s, children }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle cx={-150} cy={190} r={14} fill="#fff" {...st(4)} /><circle cx={-118} cy={150} r={22} fill="#fff" {...st(4)} />
    <ellipse cx={0} cy={0} rx={210} ry={150} fill="#fff" {...st(6)} />
    {children}
  </g>
);
export const RENK: Record<string, string> = { kirmizi: "#D23B3B", mavi: "#2F5BD3", yesil: "#2E9E5B", mor: "#7B4FD0", turuncu: "#E0662E" };
export const Stamp: React.FC<{ x: number; y: number; k: number; text: string; color?: string; rot?: number }> = ({ x, y, k, text, color = RENK.kirmizi, rot = -8 }) => {
  if (k <= 0) return null;
  const sc = 1 + (1 - Math.min(1, k)) * 1.6;
  const w = Math.min(980, text.length * 38 + 60);
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${sc})`} opacity={Math.min(1, k * 2)}>
      <rect x={-w / 2} y={-46} width={w} height={92} rx={14} fill="#fff" fillOpacity={0.88} stroke={color} strokeWidth={9} />
      <text y={20} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={text.length > 22 ? 44 : 58} fill={color} letterSpacing={2}>{text}</text>
    </g>
  );
};

/* -------------------------------- kartlar ------------------------------ */
export const SeriesTag: React.FC<{ alpha?: number; metin: string }> = ({ alpha = 1, metin }) => (
  <div style={{ position: "absolute", top: 80, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: alpha }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 30, letterSpacing: 4, color: INK, background: "#fff", border: `5px solid ${INK}`, borderRadius: 40, padding: "8px 26px", boxShadow: `0 6px 0 ${INK}` }}>{metin}</div>
  </div>
);
const chunk = (s: string, max = 30) => {
  const out: string[] = []; let cur = "";
  for (const w of s.split(" ")) { if ((cur + " " + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }
  if (cur) out.push(cur);
  return out;
};
export const Subtitles: React.FC<{ t: number; tl: Timeline; skip: (l: Line) => boolean; top?: number }> = ({ t, tl, skip, top = 1500 }) => {
  const i = tl.lines.findIndex((l, j) => t >= l.start - 0.05 && t < Math.min(l.end + 0.5, (tl.lines[j + 1]?.start ?? 99) - 0.05));
  if (i < 0) return null;
  const l = tl.lines[i];
  if (skip(l)) return null;
  const parts = chunk(l.sub);
  const total = parts.reduce((a, p) => a + p.length, 0);
  let acc = 0, idx = parts.length - 1;
  for (let k = 0; k < parts.length; k++) {
    if (t < l.start + ((acc + parts[k].length) / total) * (l.end - l.start)) { idx = k; break; }
    acc += parts[k].length;
  }
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: F, fontWeight: 900, fontSize: 58, lineHeight: 1.15, textAlign: "center", color: l.lang === "en" ? GOLD : "#fff", background: "rgba(43,33,64,.88)", border: "4px solid rgba(255,255,255,.25)", borderRadius: 28, padding: "14px 30px" }}>{parts[idx]}</div>
    </div>
  );
};
export const Wipe: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const k = (t - (at - 0.35)) / 0.7;
  if (k <= 0 || k >= 1) return null;
  const x = mix(-1600, 1600, Easing.inOut(Easing.quad)(k));
  return (
    <AbsoluteFill><svg width={1080} height={1920}><g transform={`translate(${x},0) skewX(-18)`}>
      <rect x={-200} y={-100} width={1500} height={2200} fill={GOLD} /><rect x={-260} y={-100} width={60} height={2200} fill={INK} /><rect x={1300} y={-100} width={60} height={2200} fill={INK} />
    </g></svg></AbsoluteFill>
  );
};
export const Chip: React.FC<{ text: string; sub?: string; hot?: boolean; color?: string }> = ({ text, sub, hot, color = GOLD }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: text.length > 9 ? 56 : 70, color: INK, background: hot ? color : "#fff", border: `6px solid ${INK}`, borderRadius: 26, padding: "4px 24px", boxShadow: `0 8px 0 ${INK}`, whiteSpace: "nowrap" }}>{text}</div>
    {sub && <div style={{ marginTop: 12, fontFamily: F, fontWeight: 900, fontSize: 46, color: "#fff", WebkitTextStroke: `9px ${INK}`, paintOrder: "stroke", whiteSpace: "nowrap" }}>{sub}</div>}
  </div>
);
