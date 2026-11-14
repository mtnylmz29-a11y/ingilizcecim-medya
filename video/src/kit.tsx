// Çizgi film kiti: zamanlama yardımcıları, zeminler, karakter, eşyalar, kartlar, altyazı.
// Kataloglar (ZEMINLER, KOSTUMLER, IKONLAR) sistem/VIDEO_ETIMOLOJI.md'de listelenir; yeni öğe eklerken orayı da güncelle.
import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Nunito";

export const F = loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const INK = "#2B2140";
export const GOLD = "#FFC94A";

export type Line = { id: string; lang: string; sub: string; bolum: string; start: number; end: number; sehir?: string };
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

/* ------------------------------ labirent ------------------------------- */
// Kuşbakışı 8x6 labirent (sabit tohum, her render aynı). LAB_YOL: girişten çıkışa çözüm (iplik olayı izler).
const LC = 8, LR = 6, LX = 120, LY = 600, CW = 105, CH = 100;
const LAB = (() => {
  const right = Array.from({ length: LR }, () => Array(LC).fill(true));
  const bottom = Array.from({ length: LR }, () => Array(LC).fill(true));
  const seen = Array.from({ length: LR }, () => Array(LC).fill(false));
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const yigin: number[][] = [[LR - 1, 0]];
  seen[LR - 1][0] = true;
  while (yigin.length) {
    const [r, c] = yigin[yigin.length - 1];
    const nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && a < LR && b >= 0 && b < LC && !seen[a][b]);
    if (!nb.length) { yigin.pop(); continue; }
    const [a, b] = nb[Math.floor(rnd() * nb.length)];
    if (a === r) right[r][Math.min(b, c)] = false; else bottom[Math.min(a, r)][c] = false;
    seen[a][b] = true; yigin.push([a, b]);
  }
  const key = (r: number, c: number) => `${r},${c}`;
  const prev = new Map<string, string>([[key(LR - 1, 0), ""]]);
  const q: number[][] = [[LR - 1, 0]];
  while (q.length) {
    const [r, c] = q.shift()!;
    const m: number[][] = [];
    if (c < LC - 1 && !right[r][c]) m.push([r, c + 1]);
    if (c > 0 && !right[r][c - 1]) m.push([r, c - 1]);
    if (r < LR - 1 && !bottom[r][c]) m.push([r + 1, c]);
    if (r > 0 && !bottom[r - 1][c]) m.push([r - 1, c]);
    for (const [a, b] of m) if (!prev.has(key(a, b))) { prev.set(key(a, b), key(r, c)); q.push([a, b]); }
  }
  const yol: [number, number][] = [];
  for (let k = key(0, LC - 1); k; k = prev.get(k)!) { const [r, c] = k.split(",").map(Number); yol.unshift([LX + c * CW + CW / 2, LY + r * CH + CH / 2]); }
  return { right, bottom, yol: [[LX + CW / 2, LY + LR * CH + 50], ...yol, [LX + (LC - 0.5) * CW, LY - 50]] as [number, number][] };
})();
export const LAB_YOL = LAB.yol;
const Labirent: React.FC = () => {
  const duvar: string[] = [];
  for (let r = 0; r < LR; r++) for (let c = 0; c < LC; c++) {
    const x = LX + c * CW, y = LY + r * CH;
    if (LAB.right[r][c] && c < LC - 1) duvar.push(`M${x + CW},${y} V${y + CH}`);
    if (LAB.bottom[r][c] && r < LR - 1) duvar.push(`M${x},${y + CH} H${x + CW}`);
  }
  const X1 = LX + LC * CW, Y1 = LY + LR * CH;
  duvar.push(`M${LX + CW},${Y1} H${X1} V${LY} M${X1 - CW},${LY} H${LX} V${Y1}`); // giriş sol altta, çıkış sağ üstte
  const d = duvar.join(" ");
  return (
    <g>
      <rect x={LX - 40} y={LY - 40} width={LC * CW + 80} height={LR * CH + 80} rx={18} fill="#E9D3A0" {...st(6)} />
      {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={LX + ((i * 263) % (LC * CW))} cy={LY + ((i * 137) % (LR * CH))} r={4 + (i % 3) * 2} fill="#D6BD84" />)}
      <path d={d} fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#B9A98C" strokeWidth={16} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#D9CBB0" strokeWidth={5} strokeLinecap="round" transform="translate(-3,-3)" />
    </g>
  );
};
const Flame: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y}) scale(${s},${s * (1 + Math.sin(t * 11) * 0.08)})`}>
    <path d="M0,0 C-60,0 -60,-60 -30,-100 C-26,-70 -10,-70 -6,-80 C-10,-120 10,-150 20,-170 C24,-120 60,-100 54,-50 C50,-10 30,0 0,0 Z" fill="#FF7A2E" {...st(4)} />
    <path d="M0,0 C-30,0 -34,-30 -16,-56 C-10,-40 6,-44 8,-70 C26,-50 34,-30 28,-14 C24,-4 14,0 0,0 Z" fill="#FFD23F" />
  </g>
);
const Lantern: React.FC<{ x: number; y: number; t: number; renk?: string }> = ({ x, y, t, renk = GOLD }) => (
  <g transform={`translate(${x},${y}) rotate(${Math.sin(t * 1.6 + x) * 4},0,-200)`}>
    <line x1={0} y1={-200} x2={0} y2={-60} {...st(4)} />
    <circle r={70} fill={renk} opacity={0.25 + 0.1 * Math.sin(t * 5 + x)} />
    <path d="M-28,-60 L28,-60 L36,30 L-36,30 Z" fill={renk} {...st(5)} />
    <rect x={-40} y={30} width={80} height={14} rx={4} fill="#5B3A29" {...st(4)} /><rect x={-30} y={-74} width={60} height={14} rx={4} fill="#5B3A29" {...st(4)} />
  </g>
);
const Crowd: React.FC<{ x0: number; x1: number; y: number; t: number }> = ({ x0, x1, y, t }) => (
  <g>
    {Array.from({ length: Math.floor((x1 - x0) / 62) }, (_, i) => {
      const x = x0 + i * 62 + (i % 2) * 12, b = Math.abs(Math.sin(t * 3 + i * 1.7)) * -8;
      const c = ["#C8312B", "#F4F1EA", "#2F5BD3", "#D9A33A", "#7B4FD0", "#3CB371"][i % 6];
      return (
        <g key={i} transform={`translate(${x},${y + (i % 3) * 10 + b})`}>
          <path d="M-30,60 C-30,0 30,0 30,60 Z" fill={c} {...st(4)} />
          <circle cy={-14} r={22} fill={["#F2C49B", "#D9A47A", "#B87A54"][i % 3]} {...st(4)} />
        </g>
      );
    })}
  </g>
);

/* ------------------------------- zeminler ------------------------------ */
// Her zemin tüm kareyi çizer; yer çizgisi ~1300 (karakter y=1360 civarında durur).
export const ZEMINLER = ["roma", "yunan", "orta_cag", "liman", "col", "laboratuvar", "tiyatro", "sehir", "ofis", "kir", "gece",
  "labirent", "han", "spor", "fabrika", "forum", "carsi"] as const;
export const Zemin: React.FC<{ ad: string; t: number }> = ({ ad, t }) => {
  const id = `z_${ad}`;
  switch (ad) {
    case "labirent":
      return (<g><Sky top="#5BB8F5" bottom="#D8F1FF" id={id} /><SunDisc x={900} y={330} r={70} t={t} /><Cloud x={220 + t * 12} y={360} s={0.7} />
        <Hills y={560} a={20} color="#E8D3A2" seed={5} /><Labirent />
        <rect x={-20} y={1260} width={1120} height={700} fill="#D6BD84" {...st(5)} /><Road color="#EFE2C2" line="#D6C49A" /></g>);
    case "han":
      return (<g><rect width={1080} height={1920} fill="#8A5A3B" />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 120 + 40} y1={0} x2={i * 120 + 40} y2={1240} stroke="#6E4630" strokeWidth={6} />)}
        <rect x={0} y={420} width={1080} height={30} fill="#5B3A29" {...st(5)} />
        <g transform="translate(250,1240)">
          <path d="M-190,0 L-190,-440 L190,-440 L190,0 Z" fill="#9A8E80" {...st(6)} />
          {Array.from({ length: 6 }, (_, r) => Array.from({ length: 4 }, (_, c) => <rect key={`${r}${c}`} x={-190 + c * 95 + (r % 2) * 40} y={-440 + r * 74} width={95} height={74} fill="none" stroke="#7D7266" strokeWidth={4} />))}
          <path d="M-120,0 L-120,-200 A120,110 0 0 1 120,-200 L120,0 Z" fill="#2B1A12" {...st(6)} />
          <Flame x={-30} y={-10} s={0.9} t={t} /><Flame x={40} y={-10} s={0.7} t={t + 1} />
          <rect x={-90} y={-16} width={180} height={18} rx={8} fill="#5B3A29" {...st(4)} />
        </g>
        <g transform="translate(760,720)"><path d="M-90,0 L-90,-150 A90,90 0 0 1 90,-150 L90,0 Z" fill="#1F2A5C" {...st(6)} />
          <circle cx={30} cy={-150} r={26} fill="#F6F0C8" /><line x1={0} y1={-240} x2={0} y2={0} {...st(5)} /><line x1={-90} y1={-110} x2={90} y2={-110} {...st(5)} /></g>
        <Lantern x={560} y={640} t={t} />
        <rect x={-20} y={1240} width={1120} height={700} fill="#5B3A29" {...st(5)} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={i * 150} y1={1240} x2={i * 150 - 80} y2={1920} stroke="#4A2E20" strokeWidth={5} />)}
        <rect x={560} y={1150} width={500} height={40} fill="#A8743F" {...st(5)} /><rect x={600} y={1190} width={26} height={90} fill="#8E5A31" {...st(4)} /><rect x={1000} y={1190} width={26} height={90} fill="#8E5A31" {...st(4)} />
        <g transform="translate(700,1150)"><rect x={-26} y={-70} width={52} height={70} rx={8} fill="#C9A0DC" {...st(4)} /><path d="M26,-56 C52,-56 52,-20 26,-20" fill="none" {...st(5)} /></g>
        <g transform="translate(880,1150) scale(0.6)"><Prop ikon="ekmek" t={t} /></g></g>);
    case "spor":
      return (<g><rect width={1080} height={1920} fill="#DCE8F5" />
        <rect x={60} y={520} width={960} height={300} rx={16} fill="#9FD8FF" {...st(6)} /><Cloud x={300 + t * 14} y={660} s={0.7} />
        {[300, 540, 780].map((x) => <line key={x} x1={x} y1={520} x2={x} y2={820} stroke={INK} strokeWidth={6} />)}
        <rect x={60} y={880} width={1020} height={24} fill="#E8475F" {...st(4)} />
        <text x={160} y={1060} fontFamily={F} fontWeight={900} fontSize={120} fill="#B9C7DB">SPOR</text>
        <g transform="translate(820,1240)"><rect x={-180} y={-260} width={20} height={260} fill="#5D6676" {...st(4)} /><rect x={160} y={-260} width={20} height={260} fill="#5D6676" {...st(4)} />
          {[-220, -130, -40].map((y) => <rect key={y} x={-180} y={y} width={360} height={14} fill="#8E98AA" {...st(3)} />)}
          {[-220, -130].map((y) => [-100, 0, 100].map((x) => <g key={`${y}${x}`} transform={`translate(${x},${y}) scale(0.45)`}><Prop ikon="dambil" t={t} /></g>))}</g>
        <rect x={-20} y={1240} width={1120} height={700} fill="#C08A55" {...st(5)} />
        <path d="M-20,1300 L700,1300 L760,1420 L-20,1420 Z" fill="#2F5BD3" {...st(5)} /></g>);
    case "fabrika":
      return (<g><Sky top="#F2B880" bottom="#FBE3C4" id={id} /><SunDisc x={880} y={420} r={70} t={t} color="#FFB347" />
        {[220, 380].map((x, j) => (
          <g key={x}>
            {Array.from({ length: 5 }, (_, i) => { const q = (t * 0.35 + i / 5 + j * 0.1) % 1; return <circle key={i} cx={x + q * 120 + Math.sin(q * 6) * 20} cy={560 - q * 420} r={30 + q * 50} fill="#E3E3EA" opacity={0.85 * (1 - q)} {...st(3)} />; })}
            <rect x={x - 34} y={560} width={68} height={300} fill="#A85A3C" {...st(5)} /><rect x={x - 40} y={560} width={80} height={22} fill="#8E4A30" {...st(4)} />
          </g>
        ))}
        <path d={`M60,1240 L60,880 ${Array.from({ length: 6 }, (_, i) => `L${60 + i * 160 + 160},${800} L${60 + i * 160 + 160},${880}`).join(" ")} L1020,1240 Z`} fill="#8E98AA" {...st(6)} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={100 + i * 160} y={960} width={90} height={110} rx={8} fill={Math.sin(i * 3 + Math.floor(t)) > 0 ? "#FFE29A" : "#5D6676"} {...st(4)} />)}
        <rect x={-20} y={1250} width={1120} height={700} fill="#9AA3B8" {...st(5)} />
        <rect x={-20} y={1250} width={1120} height={40} fill="#3B3F5C" {...st(5)} />
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={i * 96 + 20} cy={1270} r={14} fill="#AEB7C6" {...st(3)} />)}
        {Array.from({ length: 4 }, (_, i) => <rect key={i} x={((t * 120 + i * 300) % 1300) - 150} y={1180} width={90} height={70} rx={6} fill="#D8B784" {...st(4)} />)}</g>);
    case "forum":
      return (<g><Sky top="#FFC98A" bottom="#FFF0C8" id={id} /><SunDisc x={160} y={460} r={80} t={t} /><Cloud x={720 - t * 10} y={420} s={0.8} />
        <rect x={20} y={760} width={1040} height={40} fill="#F1E3C6" {...st(5)} /><path d="M20,760 L540,640 L1060,760 Z" fill="#F1E3C6" {...st(5)} />
        {Array.from({ length: 11 }, (_, i) => <rect key={i} x={50 + i * 95} y={800} width={34} height={300} fill="#FBF3E2" {...st(5)} />)}
        <rect x={20} y={1100} width={1040} height={30} fill="#F1E3C6" {...st(5)} />
        <g transform="translate(780,1240)"><rect x={-200} y={-120} width={400} height={120} fill="#E3D2B0" {...st(5)} /><rect x={-230} y={-40} width={460} height={40} fill="#D6C49A" {...st(5)} />
          <rect x={-60} y={-200} width={120} height={80} fill="#C8312B" {...st(5)} /><circle cy={-160} r={20} fill={GOLD} {...st(4)} /></g>
        <Crowd x0={30} x1={300} y={1170} t={t} />
        <rect x={-20} y={1250} width={1120} height={700} fill="#D9BE8E" {...st(5)} /><Road /></g>);
    case "carsi":
      return (<g><Sky top="#FFB36B" bottom="#FFEAC2" id={id} /><SunDisc x={880} y={380} r={70} t={t} color="#FFB347" />
        <rect x={-20} y={700} width={1120} height={560} fill="#F0D9AE" {...st(5)} />
        {[0, 1, 2].map((i) => {
          const x = 60 + i * 330, c = ["#C8312B", "#2E8B8B", "#7B4FD0"][i];
          return (
            <g key={i}>
              <path d={`M${x},1240 L${x},900 A150,130 0 0 1 ${x + 300},900 L${x + 300},1240 Z`} fill="#8E5A31" {...st(5)} />
              <path d={`M${x - 20},880 ${Array.from({ length: 6 }, (_, k) => `L${x - 20 + (k + 1) * 56.7},${880 + (k % 2 ? 0 : 0)}`).join(" ")} L${x + 320},960 ${Array.from({ length: 6 }, (_, k) => `Q${x + 320 - k * 56.7 - 28},${990 + Math.sin(t * 2 + k) * 4} ${x + 320 - (k + 1) * 56.7},960`).join(" ")} Z`} fill={c} {...st(5)} />
              {[0, 2, 4].map((k) => <rect key={k} x={x - 20 + k * 56.7} y={880} width={56.7} height={80} fill="#fff" opacity={0.5} />)}
              <rect x={x + 10} y={1130} width={280} height={30} fill="#A8743F" {...st(4)} />
              {[0, 1, 2].map((k) => <g key={k} transform={`translate(${x + 60 + k * 90},1130) scale(0.45)`}><Prop ikon={(i + k) % 2 ? "kavanoz" : "sise"} t={t + k} renk={["#FFC94A", "#7CE0A3", "#FF7A59"][(i + k) % 3]} /></g>)}
              <Lantern x={x + 150} y={1060} t={t + i} renk={["#FFC94A", "#FF7A59", "#7CE0A3"][i]} />
            </g>
          );
        })}
        <rect x={-20} y={1250} width={1120} height={700} fill="#E8C99A" {...st(5)} /><Road color="#F0CF8E" line="#D6AE66" /></g>);
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
export const KOSTUMLER = ["roma_askeri", "toga", "katip", "denizci", "alim", "ofis", "doktor", "isci", "robot", "kahraman", "sporcu", "astrolog", "toga_candida"] as const;
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
  kahraman: { top: "#2F5BD3", arm: skin, leg: skin, shoe: "#7A4B2A", hat: "mig" },
  sporcu: { top: "#E8475F", arm: skin, leg: skin, shoe: "#FFFFFF", hat: "bant" },
  astrolog: { top: "#2E2A6B", arm: "#2E2A6B", leg: "#1E1A4B", shoe: "#3A2A20", robe: "#2E2A6B", hat: "sivri" },
  toga_candida: { top: "#FFFFFF", arm: skin, leg: skin, shoe: "#7A4B2A", robe: "#FFFFFF", hat: "defne" },
} as Record<string, Look>)[k] ?? { top: "#FFFFFF", arm: "#FFFFFF", leg: "#34406B", shoe: INK };

export const Person: React.FC<{ x: number; y: number; s?: number; t: number; kostum: string; walk?: number; face?: 1 | -1; talk?: boolean; sac?: string; armUp?: number }> =
  ({ x, y, s = 1, t, kostum, walk = 0, face = 1, talk = false, sac = "kisa", armUp = 0 }) => {
  const skin = "#F2C49B";
  const L = LOOK(kostum, skin);
  const robot = kostum === "robot";
  const toga = kostum === "toga" || kostum === "toga_candida";
  const ph = t * 9, leg = Math.sin(ph) * 26 * walk, arm = -Math.sin(ph) * 22 * walk, bob = Math.abs(Math.sin(ph)) * -8 * walk;
  const blink = (t % 3.1) < 0.12 ? 0.15 : 1;
  const mouth = talk ? 4 + Math.abs(Math.sin(t * 17)) * 9 : 0;
  const Leg = ({ a }: { a: number }) => (
    <g transform={`rotate(${a},0,-112)`}>
      <rect x={-13} y={-118} width={26} height={110} rx={robot ? 4 : 12} fill={L.leg} {...st(5)} />
      <ellipse cx={8} cy={-6} rx={22} ry={11} fill={L.shoe} {...st(5)} />
      {(kostum === "roma_askeri" || toga || kostum === "kahraman") && [-70, -45, -22].map((yy) => <line key={yy} x1={-13} y1={yy} x2={13} y2={yy} stroke="#7A4B2A" strokeWidth={5} />)}
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
      {kostum === "toga_candida" && <ellipse cx={0} cy={-170} rx={120} ry={190} fill="#FFFBE0" opacity={0.45 + 0.15 * Math.sin(t * 4)} />}
      {L.robe && !toga ? (
        <><ellipse cx={-20 + leg * 0.4} cy={-6} rx={22} ry={11} fill={L.shoe} {...st(5)} /><ellipse cx={22 - leg * 0.4} cy={-6} rx={22} ry={11} fill={L.shoe} {...st(5)} /></>
      ) : (<><g transform="translate(-16,0)"><Leg a={leg} /></g><g transform="translate(16,0)"><Leg a={-leg} /></g></>)}
      <g transform="translate(-52,0)"><Arm a={arm + 8} /></g>
      {/* gövde */}
      {kostum === "roma_askeri" && (<>
        <path d="M-50,-215 L50,-215 L58,-95 L-58,-95 Z" fill={L.top} {...st(5)} />
        {[-48, -24, 0, 24, 48].map((px) => <rect key={px} x={px - 10} y={-100} width={20} height={38} rx={5} fill={GOLD} {...st(4)} />)}
        <rect x={-56} y={-128} width={112} height={18} fill="#7A4B2A" {...st(4)} />
        <path d="M-44,-212 L44,-212 L40,-160 L-40,-160 Z" fill="#D9A33A" {...st(4)} /></>)}
      {toga && (<>
        <path d="M-50,-215 L50,-215 L64,-60 L-64,-60 Z" fill="#fff" {...st(5)} />
        <path d="M-50,-215 L64,-90" stroke="#C8312B" strokeWidth={12} /><path d="M-50,-215 L64,-90" fill="none" {...st(3)} /></>)}
      {L.robe && !toga && (<>
        <path d="M-46,-215 L46,-215 L74,-12 L-74,-12 Z" fill={L.robe} {...st(5)} />
        {kostum === "astrolog" && [[-30, -170], [24, -110], [-40, -60], [40, -40], [0, -200]].map(([x, y], i) => <path key={i} d="M0,-12 L4,-4 L12,0 L4,4 L0,12 L-4,4 L-12,0 L-4,-4 Z" fill={GOLD} transform={`translate(${x},${y})`} />)}
        <rect x={-50} y={-130} width={100} height={14} fill={kostum === "alim" || kostum === "astrolog" ? GOLD : "#5B3A29"} {...st(4)} /></>)}
      {kostum === "kahraman" && (<>
        <path d="M-50,-215 L50,-215 L62,-80 L-62,-80 Z" fill={L.top} {...st(5)} />
        <path d="M-62,-80 L62,-80 L56,-60 L-56,-60 Z" fill="#F4F1EA" {...st(4)} />
        <rect x={-54} y={-132} width={108} height={16} fill={GOLD} {...st(4)} /><path d="M-44,-212 L44,-140" stroke="#7A4B2A" strokeWidth={10} /></>)}
      {kostum === "sporcu" && (<>
        <rect x={-56} y={-124} width={112} height={50} rx={10} fill="#34406B" {...st(5)} />
        <path d="M-44,-215 L-22,-215 C-18,-188 18,-188 22,-215 L44,-215 L52,-112 L-52,-112 Z" fill={L.top} {...st(5)} />
        <text y={-140} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={34} fill="#fff">1</text></>)}
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
          {(!L.hat || L.hat === "bant") && sac === "kisa" && <path d="M-56,-6 C-60,-62 52,-72 58,-10 C30,-28 -10,-30 -56,-6 Z" fill="#5B3A29" {...st(5)} />}
          {(!L.hat || L.hat === "bant") && sac === "uzun" && <path d="M-58,4 C-62,-66 62,-66 58,4 C40,-24 -30,-30 -58,4 Z" fill="#5B3A29" {...st(5)} />}
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
          {L.hat === "mig" && (<>
            <path d="M-50,-50 C-34,-128 44,-128 58,-48 L44,-48 C34,-96 -24,-96 -36,-52 Z" fill="#C8312B" {...st(5)} />
            <path d="M-62,6 C-66,-70 62,-74 62,0 L44,-2 C40,-40 -40,-44 -44,4 Z" fill="#D9A33A" {...st(5)} />
            <path d="M-62,6 L-58,48 L-40,44 L-44,4 Z" fill="#D9A33A" {...st(4)} /></>)}
          {L.hat === "bant" && <rect x={-60} y={-36} width={120} height={18} rx={8} fill="#E8475F" {...st(4)} />}
          {L.hat === "sivri" && (<>
            <path d="M-66,-18 L66,-18 L14,-170 Z" fill="#2E2A6B" {...st(5)} /><ellipse cx={0} cy={-18} rx={78} ry={14} fill="#2E2A6B" {...st(5)} />
            <path d="M0,-12 L4,-4 L12,0 L4,4 L0,12 L-4,4 L-12,0 L-4,-4 Z" fill={GOLD} transform="translate(10,-80)" /><circle cx={-16} cy={-48} r={6} fill={GOLD} /></>)}
          {L.hat === "kasket" && <><path d="M-56,-14 C-56,-66 56,-66 56,-14 Z" fill="#3D6FB6" {...st(5)} /><path d="M20,-18 L84,-12 L56,-4 Z" fill="#2F5596" {...st(4)} /></>}
        </>)}
      </g>
      <g transform="translate(52,0)"><Arm a={-arm - 8 - armUp} /></g>
      {kostum === "toga_candida" && Array.from({ length: 6 }, (_, i) => {
        const q = (t * 0.6 + i / 6) % 1, a = i * 1.05 + t;
        return <path key={i} d="M0,-14 L4,-4 L14,0 L4,4 L0,14 L-4,4 L-14,0 L-4,-4 Z" fill="#FFE29A" {...st(2)} transform={`translate(${Math.cos(a) * 100},${-160 + Math.sin(a) * 150 - q * 40}) scale(${Math.sin(q * Math.PI) * 1.3})`} />;
      })}
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
export const IKONLAR = ["para", "tuz", "cuval", "tabela", "gemi", "sise", "kavanoz", "ekmek", "yildiz", "fare", "yumak", "parsomen", "kitap", "saat", "takvim", "buyutec", "grafik", "kalp", "soru", "kas", "disli", "goz", "maske", "sandik",
  "capa", "bayrak", "teleskop", "simsek", "gezegen", "kol", "dambil", "imbik", "surme", "daktilo", "yuz", "olcer", "oy_sandigi", "kursu", "tebesir"] as const;
// iki katlı çizgi: önce mürekkep, üstüne renk (kalın metal parçalar için)
const Cift: React.FC<{ d: string; w: number; renk: string }> = ({ d, w, renk }) => (<><path d={d} fill="none" stroke={INK} strokeWidth={w + 10} strokeLinecap="round" strokeLinejoin="round" /><path d={d} fill="none" stroke={renk} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /></>);
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
    case "capa": return (<g transform={`rotate(${Math.sin(t * 1.5) * 5},0,-170)`}>
      <Cift d="M0,-190 V-20 M-46,-140 H46 M-80,-70 C-70,0 70,0 80,-70" w={14} renk="#8E98AA" />
      <circle cy={-205} r={20} fill="none" stroke={INK} strokeWidth={22} /><circle cy={-205} r={20} fill="none" stroke="#8E98AA" strokeWidth={12} />
      <path d="M-96,-60 L-80,-96 L-62,-62 Z M96,-60 L80,-96 L62,-62 Z" fill="#8E98AA" {...st(5)} /></g>);
    case "bayrak": {
      const w = 190, h = 120, n = 10, dalga = (i: number) => Math.sin(t * 5 - i * 0.8) * 10 * (i / n);
      const ust = Array.from({ length: n + 1 }, (_, i) => `${8 + (i / n) * w},${-300 + dalga(i)}`).join(" L");
      const alt = Array.from({ length: n + 1 }, (_, i) => `${8 + ((n - i) / n) * w},${-300 + h + dalga(n - i)}`).join(" L");
      return (<g><rect x={-8} y={-320} width={16} height={320} rx={6} fill="#7A4B2A" {...st(4)} /><circle cy={-326} r={12} fill={GOLD} {...st(4)} />
        <path d={`M${ust} L${alt} Z`} fill={renk ?? "#FFD23F"} {...st(5)} />
        {metin && <text x={8 + w / 2} y={-300 + h / 2 + 22 + dalga(n / 2)} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={64} fill={INK}>{metin}</text>}</g>);
    }
    case "teleskop": return (<g><path d="M0,-130 L-70,0 M0,-130 L70,0 M0,-130 L0,0" {...st(10)} fill="none" />
      <g transform="translate(0,-140) rotate(-32)"><rect x={-120} y={-26} width={240} height={52} rx={10} fill="#2F5BD3" {...st(5)} /><rect x={110} y={-36} width={40} height={72} rx={8} fill="#D9A33A" {...st(5)} />
        <rect x={-150} y={-16} width={34} height={32} rx={6} fill="#D9A33A" {...st(4)} /><rect x={-40} y={-26} width={14} height={52} fill={GOLD} /></g></g>);
    case "simsek": {
      const flas = (t * 1.3) % 1 < 0.12 ? 1 : 0.25;
      return (<g><g opacity={flas}><path d="M10,-200 L-40,-90 L0,-90 L-30,0 L60,-120 L16,-120 L46,-200 Z" fill="#FFD23F" {...st(5)} /></g>
        {[-90, -50, 70, 110].map((x, i) => { const q = (t * 2 + i / 4) % 1; return <line key={x} x1={x} y1={-190 + q * 120} x2={x - 10} y2={-160 + q * 120} stroke="#6FA8DC" strokeWidth={6} strokeLinecap="round" opacity={1 - q} />; })}
        <g transform="translate(0,-230) scale(1.1)"><path d="M-90,30 a40,40 0 0 1 20,-62 a55,55 0 0 1 100,-8 a42,42 0 0 1 62,42 a30,30 0 0 1 -12,58 h-150 a30,30 0 0 1 -20,-30 Z" fill="#6B7280" {...st(5)} /></g></g>);
    }
    case "gezegen": return (<g transform={`translate(0,-90) rotate(${Math.sin(t) * 6})`}>
      <path d="M-110,10 A110,30 0 0 1 110,-10" fill="none" stroke={INK} strokeWidth={16} /><path d="M-110,10 A110,30 0 0 1 110,-10" fill="none" stroke="#F3D27A" strokeWidth={8} />
      <circle r={66} fill={renk ?? "#FF9F5A"} {...st(5)} /><path d="M-60,-20 C-20,-30 20,-10 62,-24 M-64,14 C-20,4 30,24 64,10" fill="none" stroke="#fff" strokeOpacity={0.4} strokeWidth={8} />
      <path d="M110,-10 A110,30 0 0 1 -110,10" fill="none" stroke={INK} strokeWidth={16} /><path d="M110,-10 A110,30 0 0 1 -110,10" fill="none" stroke="#F3D27A" strokeWidth={8} /></g>);
    case "kol": {
      // bükülmüş kol: yatay üst kol + dikey ön kol + yumruk; pazıdaki tümsek "fare" gibi kayar
      const bx = -50 + Math.sin(t * 3) * 30;
      return (<g transform="translate(0,-10)">
        <path d="M-160,0 L-160,-70 C-100,-80 20,-84 50,-70 L50,0 Z" fill="#F2C49B" {...st(6)} />
        <path d="M20,-40 L40,-230 L110,-230 L100,-10 C90,10 30,10 20,-40 Z" fill="#F2C49B" {...st(6)} />
        <rect x={22} y={-300} width={100} height={84} rx={34} fill="#F2C49B" {...st(6)} />
        <path d="M44,-268 H100 M44,-246 H100" {...st(4)} fill="none" />
        <ellipse cx={bx} cy={-78} rx={56} ry={40} fill="#F2C49B" {...st(5)} />
        {metin === "fare" && (<><circle cx={bx + 32} cy={-112} r={13} fill="#F2C49B" {...st(4)} /><circle cx={bx + 10} cy={-118} r={13} fill="#F2C49B" {...st(4)} />
          <circle cx={bx + 40} cy={-84} r={5} fill={INK} /><path d={`M${bx - 56},-78 C${bx - 90},-86 ${bx - 90},${-46 + Math.sin(t * 8) * 8} ${bx - 116},-56`} fill="none" {...st(5)} /></>)}</g>);
    }
    case "dambil": return (<g transform="translate(0,-60)"><rect x={-80} y={-10} width={160} height={20} rx={8} fill="#AEB7C6" {...st(4)} />
      {[-1, 1].map((d) => <g key={d}><rect x={d * 62 - 14} y={-50} width={28} height={100} rx={8} fill="#5D6676" {...st(5)} /><rect x={d * 92 - 10} y={-36} width={20} height={72} rx={6} fill="#5D6676" {...st(5)} /></g>)}</g>);
    case "imbik": {
      const q = (t * 1.2) % 1;
      return (<g>
        <Flame x={-100} y={0} s={0.45} t={t} />
        <path d="M-160,-40 H-40" {...st(8)} fill="none" />
        <path d="M-110,-180 L-110,-210 C-110,-260 -40,-280 0,-250 L150,-110" fill="none" stroke={INK} strokeWidth={30} strokeLinecap="round" /><path d="M-110,-180 L-110,-210 C-110,-260 -40,-280 0,-250 L150,-110" fill="none" stroke="#C9E8F5" strokeWidth={18} strokeLinecap="round" />
        <circle cx={-100} cy={-110} r={70} fill="#E3F5FF" {...st(6)} /><path d="M-166,-90 C-140,-70 -60,-70 -34,-90 A70,70 0 0 1 -166,-90 Z" fill={renk ?? "#C9A0DC"} />
        {[0, 1, 2].map((i) => { const b = (t * 0.9 + i / 3) % 1; return <circle key={i} cx={-110 + i * 14} cy={-90 - b * 50} r={7} fill={renk ?? "#C9A0DC"} opacity={1 - b} />; })}
        <circle cx={154} cy={-80 + q * 40} r={9} fill="#7FD4FF" {...st(3)} opacity={1 - q * 0.7} />
        <path d="M120,-60 L120,-30 C80,-20 80,0 110,0 L190,0 C220,0 220,-20 180,-30 L180,-60 Z" fill="#E3F5FF" {...st(5)} /><path d="M96,-14 L204,-14 C210,0 200,0 190,0 L110,0 C100,0 90,0 96,-14 Z" fill="#7FD4FF" /></g>);
    }
    case "surme": return (<g>
      {Array.from({ length: 6 }, (_, i) => { const q = (t * 0.7 + i / 6) % 1; return <circle key={i} cx={40 + Math.sin(i * 2 + t) * 30} cy={-150 - q * 90} r={4 + (i % 3)} fill="#4A4F75" opacity={1 - q} />; })}
      <path d="M-50,0 C-70,-40 -60,-90 -24,-110 L-24,-130 L24,-130 L24,-110 C60,-90 70,-40 50,0 Z" fill="#2B2140" {...st(5)} />
      <path d="M-56,-40 H56 M-60,-70 H60" stroke={GOLD} strokeWidth={8} /><rect x={-30} y={-146} width={60} height={20} rx={6} fill={GOLD} {...st(4)} />
      <g transform={`rotate(${20 + Math.sin(t * 2) * 6},0,-140)`}><rect x={-6} y={-260} width={12} height={130} rx={6} fill="#D9A33A" {...st(4)} /><circle cy={-264} r={12} fill={GOLD} {...st(4)} /></g></g>);
    case "daktilo": {
      const tus = Math.floor(t * 6) % 10;
      return (<g>
        <rect x={-80} y={-260} width={160} height={110} fill="#fff" {...st(5)} />
        {metin ? <text y={-195} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={34} fill={INK}>{metin.slice(0, Math.min(metin.length, Math.floor(t * 5) % (metin.length + 8)))}</text> : null}
        <rect x={-150} y={-170} width={300} height={36} rx={14} fill="#3B3F5C" {...st(5)} />
        <path d="M-130,-134 L130,-134 L160,0 L-160,0 Z" fill="#4A4F75" {...st(5)} />
        {[0, 1, 2].map((r) => Array.from({ length: 6 - (r % 2) }, (_, c) => { const i = r * 6 + c, x = -105 + c * 42 + (r % 2) * 21, y = -100 + r * 32; return <circle key={i} cx={x} cy={y + (i % 10 === tus ? 4 : 0)} r={13} fill={i % 10 === tus ? GOLD : "#F4F1EA"} {...st(3)} />; }))}</g>);
    }
    case "yuz": {
      const m = mix(-34, 34, k), kas = mix(14, 0, k);
      return (<g transform="translate(0,-80)"><circle r={72} fill={renk ?? GOLD} {...st(6)} />
        <ellipse cx={-24} cy={-14} rx={9} ry={12} fill={INK} /><ellipse cx={24} cy={-14} rx={9} ry={12} fill={INK} />
        <path d={`M-42,${-40 + kas} L-10,${-40 - kas * 0.3} M42,${-40 + kas} L10,${-40 - kas * 0.3}`} {...st(6)} fill="none" />
        <path d={`M-34,30 Q0,${30 + m} 34,30`} fill="none" {...st(7)} /></g>);
    }
    case "olcer": {
      const a = mix(-80, 80, k);
      return (<g transform="translate(0,-60)">
        {["#D23B3B", "#E0662E", "#FFC94A", "#3CB371"].map((c, i) => {
          const a0 = Math.PI + (i * Math.PI) / 4, a1 = a0 + Math.PI / 4;
          return <path key={i} d={`M${Math.cos(a0) * 150},${Math.sin(a0) * 150} A150,150 0 0 1 ${Math.cos(a1) * 150},${Math.sin(a1) * 150} L${Math.cos(a1) * 90},${Math.sin(a1) * 90} A90,90 0 0 0 ${Math.cos(a0) * 90},${Math.sin(a0) * 90} Z`} fill={c} {...st(5)} />;
        })}
        <g transform={`rotate(${a})`}><path d="M-10,0 L0,-140 L10,0 Z" fill={INK} /></g><circle r={20} fill={INK} />
        {metin && <text y={56} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={36} fill={INK}>{metin}</text>}</g>);
    }
    case "oy_sandigi": {
      const q = (t * 0.6) % 1;
      return (<g>
        <g opacity={q < 0.8 ? 1 : 0}><rect x={-34} y={-240 + q * 90} width={68} height={86} rx={4} fill="#fff" {...st(4)} /><path d={`M-16,${-200 + q * 90} l10,12 l20,-26`} fill="none" stroke="#2E9E5B" strokeWidth={7} /></g>
        <rect x={-110} y={-170} width={220} height={170} rx={12} fill={renk ?? "#9FD8FF"} {...st(6)} />
        <rect x={-60} y={-178} width={120} height={16} rx={6} fill={INK} />
        <text y={-60} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={54} fill={INK}>{metin || "OY"}</text></g>);
    }
    case "kursu": return (<g><path d="M-110,-200 L110,-200 L90,0 L-90,0 Z" fill="#A8743F" {...st(6)} /><rect x={-130} y={-230} width={260} height={34} rx={8} fill="#8E5A31" {...st(5)} />
      <circle cy={-110} r={42} fill={renk ?? GOLD} {...st(5)} />{metin && <text y={-96} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={40} fill={INK}>{metin}</text>}</g>);
    case "tebesir": return (<g>
      {Array.from({ length: 7 }, (_, i) => { const q = (t * 0.8 + i / 7) % 1; return <circle key={i} cx={-20 + Math.sin(i * 3) * 50} cy={-60 - q * 120} r={6 + (i % 3) * 3} fill="#fff" opacity={(1 - q) * 0.9} {...st(2)} />; })}
      <g transform="rotate(-25,0,-40)"><rect x={-80} y={-60} width={160} height={42} rx={14} fill="#fff" {...st(5)} /><rect x={-80} y={-60} width={40} height={42} rx={14} fill="#E3ECF7" /></g></g>);
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
// Renk temaları: geçiş bandı, giriş göğü, kapanış göğü. Spec'te "tema".
export const TEMA: Record<string, { vurgu: string; gok: [string, string]; kap: [string, string] }> = {
  altin: { vurgu: GOLD, gok: ["#5BC0F8", "#BDEBFF"], kap: ["#2F5BD3", "#7FB2FF"] },
  mavi: { vurgu: "#5BC0F8", gok: ["#2F5BD3", "#9FD8FF"], kap: ["#1E3A8A", "#5B8DEF"] },
  yesil: { vurgu: "#7CE0A3", gok: ["#2E9E5B", "#C8F5D8"], kap: ["#1F6B45", "#4FBF7F"] },
  mor: { vurgu: "#C9A0DC", gok: ["#7B4FD0", "#E2D2FF"], kap: ["#4B2A8A", "#9F7BEA"] },
  turuncu: { vurgu: "#FF9F5A", gok: ["#FF7A59", "#FFE3A3"], kap: ["#B4441B", "#FF9F5A"] },
  gece: { vurgu: "#9DB4FF", gok: ["#0B1338", "#3B3F8F"], kap: ["#0B1338", "#3B3F8F"] },
};
export const TEMALAR = Object.keys(TEMA);
export const Wipe: React.FC<{ t: number; at: number; renk?: string }> = ({ t, at, renk = GOLD }) => {
  const k = (t - (at - 0.35)) / 0.7;
  if (k <= 0 || k >= 1) return null;
  const x = mix(-1600, 1600, Easing.inOut(Easing.quad)(k));
  return (
    <AbsoluteFill><svg width={1080} height={1920}><g transform={`translate(${x},0) skewX(-18)`}>
      <rect x={-200} y={-100} width={1500} height={2200} fill={renk} /><rect x={-260} y={-100} width={60} height={2200} fill={INK} /><rect x={1300} y={-100} width={60} height={2200} fill={INK} />
    </g></svg></AbsoluteFill>
  );
};
export const Chip: React.FC<{ text: string; sub?: string; hot?: boolean; color?: string }> = ({ text, sub, hot, color = GOLD }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: text.length > 9 ? 56 : 70, color: INK, background: hot ? color : "#fff", border: `6px solid ${INK}`, borderRadius: 26, padding: "4px 24px", boxShadow: `0 8px 0 ${INK}`, whiteSpace: "nowrap" }}>{text}</div>
    {sub && <div style={{ marginTop: 12, fontFamily: F, fontWeight: 900, fontSize: 46, color: "#fff", WebkitTextStroke: `9px ${INK}`, paintOrder: "stroke", whiteSpace: "nowrap" }}>{sub}</div>}
  </div>
);
