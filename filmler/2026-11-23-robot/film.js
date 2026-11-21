// Kelimelerin Tarihçesi: Robot — 1920'ler sessiz film (silent-film) görünümü, 2D tuval — ingilizcecim.com
// Baskı geçişi (titreme, gren, çizik, vinyet, kare kayması) lemo-opuscar silent-film STYLE.md'deki tarife göre 2D olarak yazıldı.
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const back = (t, s = 1.8) => { t = clamp(t) - 1; return 1 + t * t * ((s + 1) * t + s); };
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const TAU = Math.PI * 2;
const W = 1080, H = 1920, SW = 920, SH = 1020, SX = 80, SY = 330;
const C = document.getElementById('c'), X = C.getContext('2d');
const S = document.createElement('canvas'); S.width = SW; S.height = SH; const G = S.getContext('2d');
const KAPAK = /kapak=1/.test(location.search);
const SERIF = "'IM Fell English', Georgia, serif";
const P = { ink: '#1a130e', d1: '#33271d', d2: '#55442f', m: '#857158', l1: '#b09c7e', l2: '#d3c3a2', hi: '#ede2c6', wh: '#f6eedb', red: '#b3322a', gold: '#d9b25c' };

// ---------- ink primitives (jitter re-drawn every 2 frames = hand redrawn) ----------
let BOIL = 0, T = 0;
const jx = (x, y) => x + (hash(BOIL * 3.1 + x * .031 + y * .017) - .5) * 2.2;
const jy = (x, y) => y + (hash(BOIL * 5.7 + x * .023 + y * .029) - .5) * 2.2;
function poly(pts, fill, lw = 3, col = P.ink, close = true) {
  G.beginPath(); pts.forEach(([x, y], i) => i ? G.lineTo(jx(x, y), jy(x, y)) : G.moveTo(jx(x, y), jy(x, y))); if (close) G.closePath();
  if (fill) { G.fillStyle = fill; G.fill(); } if (lw) { G.lineWidth = lw; G.strokeStyle = col; G.lineJoin = 'round'; G.lineCap = 'round'; G.stroke(); }
}
function ell(x, y, rx, ry, fill, lw = 3, col = P.ink, rot = 0) {
  G.beginPath(); G.ellipse(jx(x, y), jy(x, y), Math.abs(rx), Math.abs(ry), rot, 0, TAU);
  if (fill) { G.fillStyle = fill; G.fill(); } if (lw) { G.lineWidth = lw; G.strokeStyle = col; G.stroke(); }
}
function rr(x, y, w, h, r, fill, lw = 3, col = P.ink) {
  G.beginPath(); G.roundRect(jx(x, y), jy(x, y), w, h, r);
  if (fill) { G.fillStyle = fill; G.fill(); } if (lw) { G.lineWidth = lw; G.strokeStyle = col; G.stroke(); }
}
function ln(x0, y0, x1, y1, lw = 3, col = P.ink) { G.beginPath(); G.moveTo(jx(x0, y0), jy(x0, y0)); G.lineTo(jx(x1, y1), jy(x1, y1)); G.lineWidth = lw; G.strokeStyle = col; G.lineCap = 'round'; G.stroke(); }
function curve(pts, lw = 3, col = P.ink) { G.beginPath(); G.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; G.quadraticCurveTo(jx(pts[i][0], pts[i][1]), jy(pts[i][0], pts[i][1]), mx, my); } const l = pts[pts.length - 1]; G.lineTo(l[0], l[1]); G.lineWidth = lw; G.strokeStyle = col; G.lineCap = 'round'; G.stroke(); }
// engraved hatching inside a clip (call inside save/clip)
function hatch(x, y, w, h, gap = 9, a = .45, ang = 1, col = P.ink, lw = 1.4) {
  G.save(); G.globalAlpha *= a; G.strokeStyle = col; G.lineWidth = lw; G.beginPath();
  for (let k = -h; k < w + h; k += gap) { G.moveTo(x + k, y); G.lineTo(x + k - h * ang, y + h); }
  G.stroke(); G.restore();
}
function shadeEll(x, y, rx, ry, gap, a) { G.save(); G.beginPath(); G.ellipse(x, y, rx, ry, 0, 0, TAU); G.clip(); hatch(x - rx, y - ry, rx * 2, ry * 2, gap, a); G.restore(); }
function shadeRect(x, y, w, h, gap = 9, a = .4, ang = 1) { G.save(); G.beginPath(); G.rect(x, y, w, h); G.clip(); hatch(x, y, w, h, gap, a, ang); G.restore(); }
function txt(s, x, y, size, col = P.ink, o = {}) {
  G.save(); G.font = `${o.it ? 'italic ' : ''}${size}px ${SERIF}`; G.textAlign = o.al || 'center'; G.textBaseline = 'middle';
  if (o.ls) G.letterSpacing = o.ls + 'px';
  if (o.max) { let sz = size; while (G.measureText(s).width > o.max && sz > 14) { sz -= 2; G.font = `${o.it ? 'italic ' : ''}${sz}px ${SERIF}`; } }
  if (o.halo) { G.lineWidth = o.halo; G.strokeStyle = o.haloc || P.hi; G.lineJoin = 'round'; G.strokeText(s, x, y); }
  G.fillStyle = col; G.fillText(s, x, y); G.restore();
}
function bg(top, bot) { const g = G.createLinearGradient(0, 0, 0, SH); g.addColorStop(0, top); g.addColorStop(1, bot); G.fillStyle = g; G.fillRect(0, 0, SW, SH); }
function lightPool(x, y, r, a = .35, col = '255,244,214') { const g = G.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); G.fillStyle = g; G.fillRect(x - r, y - r, r * 2, r * 2); }

// ---------- characters ----------
// Bugünün robotu (kanca + kapanış): kutu kafa, kırmızı anten ampulü (filmin tek rengi), yorgun/şaşkın/mutlu göz kapakları
function robot(x, y, o = {}) {
  const s = o.s || 1, lid = o.lid ?? 0, eye = o.eye ?? 0, tilt = o.tilt || 0, arm = o.arm ?? 0, armR = o.armR ?? 0, mouth = o.mouth ?? 0, wink = o.wink ?? 0;
  G.save(); G.translate(x, y); G.scale(s, s);
  // legs
  const lg = o.leg || 0;
  rr(-46, -10 + Math.max(0, lg) * -8, 30, 92, 10, P.l1); rr(16, -10 + Math.max(0, -lg) * -8, 30, 92, 10, P.l1);
  rr(-58, 74, 52, 22, 8, P.d2); rr(8, 74, 52, 22, 8, P.d2);
  G.rotate(tilt);
  // body
  rr(-80, -190, 160, 190, 22, P.l2, 4); shadeRect(30, -186, 46, 182, 8, .35);
  rr(-48, -150, 96, 72, 10, P.m, 3); for (let i = 0; i < 3; i++) ell(-24 + i * 24, -114, 9, 9, i === 1 ? P.hi : P.d1, 2);
  ln(-40, -50, 40, -50, 3); ln(-40, -34, 40, -34, 3);
  // arms (shoulder pivots)
  const arms = [[-80, arm], [80, armR]];
  arms.forEach(([sx, a], i) => { G.save(); G.translate(sx, -170); G.rotate((i ? -1 : 1) * (.25 + a)); rr(-13, 0, 26, 92, 12, P.l1); ell(0, 100, 20, 17, P.m); G.restore(); });
  // head
  G.save(); G.translate(0, -196); G.rotate((o.htilt || 0));
  rr(-74, -128, 148, 124, 26, P.l2, 4); shadeRect(36, -124, 36, 118, 8, .3);
  ln(0, -128, 0, -170, 4); ell(0, -178, 13, 13, o.bulb ? P.red : P.d2, 3);
  if (o.bulb) lightPool(0, -178, 46, .35, '220,90,70');
  // eyes
  [[-32, 1], [32, -1]].forEach(([ex], i) => {
    const R = 24 + eye * 6; ell(ex, -72, R, R, P.wh, 3); ell(ex + (o.look || 0) * 8, -70, 9 + eye * 2, 9 + eye * 2, P.ink, 0);
    const L = clamp(i === 1 ? Math.max(lid, wink) : lid);
    if (L > 0) { G.save(); G.beginPath(); G.ellipse(ex, -72, R + 1, R + 1, 0, 0, TAU); G.clip(); G.fillStyle = P.m; G.fillRect(ex - R - 2, -72 - R - 2, R * 2 + 4, (R * 2 + 4) * L); G.restore(); ln(ex - R, -72 - R + (R * 2) * L, ex + R, -72 - R + (R * 2) * L, 3); }
  });
  // mouth grill: 0 düz, 1 gülümseme, -1 ah
  if (mouth > .3) curve([[-30, -36], [0, -22], [30, -36]], 4); else if (mouth < -.3) ell(0, -30, 12, 8, P.d1, 3); else { rr(-28, -40, 56, 16, 5, P.m, 3); for (let i = 1; i < 4; i++) ln(-28 + i * 14, -40, -28 + i * 14, -24, 2); }
  G.restore(); G.restore();
}
// Orta Çağ köylüsü (angarya): şapka, tunik, çapa; eğil/kalk döngüsü, ter damlası
function serf(x, y, o = {}) {
  const s = o.s || 1, bend = o.bend || 0, hoe = o.hoe || 0, tired = o.tired || 0, face = o.face ?? 1;
  G.save(); G.translate(x, y); G.scale(s * face, s);
  // legs
  poly([[-22, -110], [-30, 0], [-12, 0], [-4, -100]], P.d2); poly([[8, -100], [14, 0], [32, 0], [22, -110]], P.d2);
  ell(-24, 2, 18, 7, P.ink, 0); ell(26, 2, 18, 7, P.ink, 0);
  G.save(); G.translate(0, -110); G.rotate(bend * .7);
  // tunic
  poly([[-34, 0], [-28, -120], [28, -120], [36, 0]], P.l1, 3); shadeRect(4, -118, 34, 118, 8, .35); ln(-34, -30, 36, -30, 5, P.d2);
  // arm + hoe
  G.save(); G.translate(10, -108); G.rotate(.9 + hoe * .9);
  rr(-8, 0, 16, 74, 8, P.l1, 3); ell(0, 80, 10, 10, P.l2, 2);
  G.translate(0, 80); G.rotate(-1.6 - hoe * .5); ln(-70, 0, 120, 0, 6, P.d1); poly([[120, -6], [150, 30], [136, 34], [114, 8]], P.d2, 3);
  G.restore();
  // head
  G.save(); G.translate(0, -138); ell(0, 0, 24, 28, P.hi, 3);
  ell(9, -4, 3.4, 2.4 + (1 - tired) * 1.4, P.ink, 0); curve([[2, -12 + tired * 3], [14, -12 - tired * 1]], 2.5);
  curve([[2, 13], [10, 12 - (1 - tired) * 3], [17, 13]], 2.5);
  poly([[-44, -14], [-20, -34], [20, -34], [44, -14]], P.m, 3); rr(-20, -46, 40, 18, 6, P.m, 3);
  if (o.sweat) { const k = o.sweat; ell(-20, 6 + k * 40, 4, 7, P.wh, 2); }
  G.restore();
  G.restore(); G.restore();
}
// Sahnedeki R.U.R. robotu: insana benzer, tulum, kol bandında numara, solgun yüz
function stageRobot(x, y, o = {}) {
  const s = o.s || 1, fist = o.fist || 0, anger = o.anger || 0, step = o.step || 0;
  G.save(); G.translate(x, y); G.scale(s, s);
  poly([[-22, -150], [-26 - step * 10, 0], [-6 - step * 10, 0], [-2, -140]], P.d1); poly([[4, -140], [8 + step * 10, 0], [28 + step * 10, 0], [24, -150]], P.d1);
  poly([[-40, -150], [-36, -300], [36, -300], [40, -150]], P.d2, 3); shadeRect(6, -298, 34, 146, 7, .4);
  ln(0, -300, 0, -150, 2, P.ink); rr(-14, -280, 28, 14, 3, P.l2, 2);
  // arms
  [[-38, -1], [38, 1]].forEach(([sx, d], i) => { G.save(); G.translate(sx, -292); const up = i === 1 ? fist : fist * .4; G.rotate(-d * (.12 + up * 2.6)); rr(-10, 0, 20, 118, 9, P.d2, 3); ell(0, 124, 13, 13, P.l2, 3); G.restore(); });
  txt(String(o.n || 1), -48, -250, 22, P.ink, { halo: 4 });
  // head
  G.save(); G.translate(0, -330); ell(0, 0, 26, 30, P.l2, 3); poly([[-26, -10], [-22, -30], [0, -36], [22, -30], [26, -10], [14, -22], [-14, -22]], P.ink, 2);
  const by = -2 + anger * 2; ln(-16, by - 6 - anger * 4, -6, by - 4 + anger * 4, 2.5); ln(16, by - 6 - anger * 4, 6, by - 4 + anger * 4, 2.5);
  ell(-10, 4, 3, 3, P.ink, 0); ell(10, 4, 3, 3, P.ink, 0); if (anger > .5) ell(0, 18, 7, 5, P.ink, 0); else ln(-7, 18, 7, 18, 2.5);
  G.restore(); G.restore();
}
// Yaratıcı insan (şapkalı, fraklı; kimseyi taklit etmez): kaçarken
function creator(x, y, o = {}) {
  const s = o.s || 1, run = o.run || 0, face = o.face ?? 1, fear = o.fear ?? 0;
  G.save(); G.translate(x, y); G.scale(s * face, s);
  const r = Math.sin(run * 12) * .6;
  G.save(); G.translate(-8, -140); G.rotate(r); rr(-9, 0, 18, 140, 8, P.ink, 2); G.restore();
  G.save(); G.translate(8, -140); G.rotate(-r); rr(-9, 0, 18, 140, 8, P.ink, 2); G.restore();
  poly([[-30, -140], [-26, -280], [26, -280], [34, -140], [-6, -120]], P.d1, 3); poly([[-8, -280], [0, -230], [8, -280]], P.hi, 2);
  G.save(); G.translate(26, -270); G.rotate(-1.2 - fear * .8 + r * .5); rr(-8, 0, 16, 96, 7, P.d1, 2); G.restore();
  G.save(); G.translate(0, -306); ell(0, 0, 22, 26, P.hi, 3); ell(8, -4, 3, 3 + fear * 2, P.ink, 0); if (fear > .5) ell(10, 12, 5, 6, P.ink, 0); else ln(4, 12, 14, 12, 2);
  rr(-24, -34, 48, 10, 3, P.ink, 2); rr(-15, -66, 30, 34, 3, P.ink, 2);
  G.restore(); G.restore();
}

// ---------- scenes (screen coordinates 920×1020) ----------
function floorBoards(y0, col = P.m) { G.fillStyle = col; G.fillRect(0, y0, SW, SH - y0); for (let i = 0; i < 9; i++) ln(-200 + i * 150, SH, 460 + (i - 4) * 40, y0, 2, P.d2); for (let k = 1; k < 5; k++) ln(0, y0 + k * k * 14, SW, y0 + k * k * 14, 1.5, P.d2); }

function scHook(t, u, d) { // bugünün robotu süpürüyor, yoruluyor, seyirciye bakıyor
  bg(P.l1, P.l2); lightPool(460, 380, 520, .4);
  // wall: window with blind + clock
  rr(560, 120, 250, 280, 6, P.hi, 4); for (let i = 1; i < 8; i++) ln(566, 120 + i * 34, 804, 120 + i * 34, 2, P.m); ln(685, 120, 685, 400, 4);
  ell(200, 220, 70, 70, P.wh, 4); ln(200, 220, 200, 170, 4); ln(200, 220, 200 + Math.cos(t * 2) * 40, 220 + Math.sin(t * 2) * 40, 3);
  floorBoards(640);
  // dust puffs
  for (let i = 0; i < 6; i++) { const k = ((t * .9 + i * .37) % 1); ell(300 + i * 30 + k * 60, 760 - k * 90, 18 + k * 30, 12 + k * 20, `rgba(240,230,205,${.5 * (1 - k)})`, 0); }
  const sweep = Math.sin(t * 5.2), tiredK = ss(seg(u, .25, .7)), look = ss(seg(u, .72, .85));

  const aR = -.1 + sweep * .25;
  robot(430, 800, { s: 1.25, lid: .1 + tiredK * .45 - look * .3, eye: look * .4, tilt: 0, arm: .6 + sweep * .2, armR: aR, mouth: look ? -1 : 0, look: look, htilt: tiredK * .12 * (1 - look), bulb: true });
  { const hx = 530 + 125 * Math.sin(.25 + aR), hy = 587.5 + 125 * Math.cos(.25 + aR); G.save(); G.translate(hx, hy); G.rotate(-.35 - sweep * .15); ln(0, -60, 0, 230, 8, P.d2); poly([[-40, 222], [40, 222], [56, 290], [-56, 290]], P.l1, 3); for (let i = -4; i <= 4; i++) ln(i * 11, 232, i * 14, 288, 1.5); G.restore(); ell(hx, hy, 20, 17, P.m); }
  if (tiredK > .4 && look < .5) { const k = (t * 1.3) % 1; ell(560, 420 - k * 50, 6, 10, P.wh, 2); }
  // intertitle-in-frame: "ROBOT = ANGARYA ?"
  const q = ss(seg(u, .55, .7));
  if (q > 0) { G.save(); G.globalAlpha = q; G.translate(460, 120); G.scale(lerp(.6, 1, back(q)), lerp(.6, 1, back(q))); rr(-260, -60, 520, 120, 14, P.ink, 0); G.strokeStyle = P.gold; G.lineWidth = 3; G.strokeRect(-248, -48, 496, 96); txt('robot = angarya ?', 0, 2, 60, P.wh, { it: true }); G.restore(); }
}

function scPrague(t, u, d) { // Prag 1920: pencere, daktilo, uçan sayfalar
  bg(P.d1, P.d2);
  // window with skyline (night)
  G.save(); G.beginPath(); G.rect(90, 70, 740, 420); G.clip();
  bg('#2a2019', '#5a4936'); for (let i = 0; i < 40; i++) ell(hash(i) * SW, 80 + hash(i + 9) * 200, 1.6, 1.6, P.hi, 0);
  ell(700, 150, 40, 40, P.hi, 0); lightPool(700, 150, 140, .25);
  // skyline: towers + spires, bridge arches, river
  const sky = [[90, 400], [90, 330], [150, 330], [150, 290], [180, 250], [210, 290], [210, 330], [290, 330], [290, 230], [305, 180], [320, 230], [320, 330], [400, 330], [400, 280], [470, 280], [470, 200], [490, 140], [510, 200], [510, 280], [600, 280], [600, 310], [680, 310], [680, 250], [700, 210], [720, 250], [720, 320], [830, 320], [830, 400]];
  poly(sky, P.ink, 2, P.ink); for (let i = 0; i < 14; i++) rr(120 + i * 50, 340 + (i % 3) * 12, 8, 12, 1, hash(i * 3 + BOIL % 2) > .3 ? P.gold : P.d2, 0);
  G.fillStyle = P.d1; G.fillRect(90, 400, 740, 90); for (let i = 0; i < 6; i++) { G.beginPath(); G.arc(150 + i * 120, 470, 50, Math.PI, 0); G.fillStyle = P.d2; G.fill(); }
  for (let i = 0; i < 12; i++) ln(100 + i * 64 + Math.sin(t * 2 + i) * 10, 482, 130 + i * 64 + Math.sin(t * 2 + i) * 10, 482, 2, P.l1);
  G.restore(); rr(90, 70, 740, 420, 4, null, 10, P.ink); ln(460, 70, 460, 490, 8); ln(90, 280, 830, 280, 8);
  txt('PRAG · 1920', 460, 40, 40, P.hi, { ls: 6 });
  // desk
  G.fillStyle = P.m; G.fillRect(0, 640, SW, 400); shadeRect(0, 640, SW, 380, 10, .25); ln(0, 640, SW, 640, 5);
  // lamp
  ln(150, 640, 150, 470, 8, P.ink); poly([[90, 480], [210, 480], [180, 420], [120, 420]], P.d2, 3); lightPool(150, 620, 300, .45);
  // papers stack + ink bottle + cup steam
  for (let i = 0; i < 6; i++) poly([[700 + i, 620 - i * 6], [840 + i, 615 - i * 6], [845 + i, 640 - i * 6], [698 + i, 645 - i * 6]], P.hi, 2);
  rr(250, 590, 40, 50, 8, P.ink, 2); for (let i = 0; i < 3; i++) curve([[270 + i * 6, 585], [262 + Math.sin(t * 3 + i) * 8, 560], [276, 530 - i * 8]], 2, P.l2);
  // typewriter
  const strike = Math.floor(t * 9) % 2;
  poly([[300, 820], [640, 820], [600, 690], [340, 690]], P.d1, 4); shadeRect(300, 700, 340, 120, 7, .3);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) ell(350 + k * 30 + r * 10, 780 - r * 26 - ((k + r + Math.floor(t * 9)) % 7 === 0 ? 4 : 0), 10, 8, P.hi, 2);
  rr(320, 660, 300, 34, 14, P.ink, 3); // platen
  const carriage = (t * 40) % 90;
  poly([[380 - carriage * .3, 662], [560 - carriage * .3, 662], [560 - carriage * .3, 470], [380 - carriage * .3, 470]], P.wh, 2);
  for (let i = 0; i < 6; i++) ln(400 - carriage * .3, 500 + i * 26, 400 - carriage * .3 + clamp(t * 30 - i * 60, 0, 140), 500 + i * 26, 3, P.d1);
  txt('R.U.R.', 470 - carriage * .3, 488, 22, P.ink);
  if (strike) ln(470, 690, 470, 664, 4);
  // flying pages
  for (let i = 0; i < 4; i++) { const k = seg(u, .35 + i * .14, .75 + i * .14); if (k <= 0 || k >= 1) continue; const px = lerp(500, 120 + i * 220, k), py = lerp(480, 120 + i * 40, eo(k)) - Math.sin(k * Math.PI) * 120; G.save(); G.translate(px, py); G.rotate(k * 6 + i); poly([[-40, -50], [40, -50], [40, 50], [-40, 50]], P.wh, 2); for (let l = 0; l < 4; l++) ln(-28, -30 + l * 18, 28, -30 + l * 18, 2, P.m); G.restore(); }
}

function scStudio(t, u, d) { // ressamın tuvali, fırça "roboti" yazar
  bg(P.l2, P.l1); lightPool(600, 200, 600, .35);
  // skylight
  poly([[460, 0], [880, 0], [820, 160], [520, 160]], P.hi, 4); ln(670, 0, 670, 160, 3);
  floorBoards(800, P.m);
  // easel
  ln(330, 300, 250, 900, 10, P.d1); ln(630, 300, 710, 900, 10, P.d1); ln(480, 260, 480, 900, 8, P.d1); ln(250, 760, 710, 760, 10, P.d1);
  poly([[220, 320], [740, 320], [740, 740], [220, 740]], P.wh, 5); shadeRect(700, 324, 36, 412, 6, .25);
  // canvas content: gear + humanoid sketch, then the word
  G.save(); G.globalAlpha = .55; stageRobot(330, 690, { s: .9, n: '' }); G.restore();
  const wd = 'roboti', wstart = d.roboti ?? .55, k = seg(u, wstart, wstart + .22);
  const n = Math.floor(k * wd.length + .001);
  txt(wd.slice(0, n), 560, 470, 104, P.red, { it: true });
  // brush following the letters
  G.save(); G.font = `italic 104px ${SERIF}`; const full = G.measureText(wd).width, part = G.measureText(wd.slice(0, n)).width; G.restore();
  const bx = 560 - full / 2 + part + 10, by = 470 + Math.sin(t * 20) * 8 * (k > 0 && k < 1 ? 1 : 0);
  const bxx = k > 0 ? bx : 820, byy = k > 0 ? by : 620;
  G.save(); G.translate(bxx, byy); G.rotate(-.7); rr(-6, -10, 12, 40, 3, P.ink, 2); rr(-5, 28, 10, 150, 4, P.d2, 2); G.restore();
  // palette
  G.save(); G.translate(140, 880); G.rotate(-.2); G.beginPath(); G.ellipse(0, 0, 120, 70, 0, 0, TAU); G.fillStyle = P.l1; G.fill(); G.lineWidth = 4; G.strokeStyle = P.ink; G.stroke(); ell(40, 20, 18, 14, P.l2, 0); [[-70, -10, P.red], [-30, -38, P.ink], [10, -46, P.wh], [50, -34, P.d2]].forEach(([px, py, c]) => ell(px, py, 16, 12, c, 2)); G.restore();
  // note slides in: "Josef: roboti?"
  const nk = ss(seg(u, .05, .2)); G.save(); G.translate(lerp(1100, 800, eo(nk)), 900); G.rotate(.08); rr(-110, -54, 220, 108, 4, P.hi, 3); txt('— Josef', 0, -18, 30, P.ink, { it: true }); txt('robota → roboti', 0, 22, 30, P.d1, { it: true }); G.restore();
}

function scField(t, u, d) { // angarya: şato, tarla, köylüler
  bg(P.hi, P.l2); ell(740, 130, 60, 60, P.wh, 3); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * .3; ln(740 + Math.cos(a) * 75, 130 + Math.sin(a) * 75, 740 + Math.cos(a) * 100, 130 + Math.sin(a) * 100, 3, P.m); }
  // hill + castle
  G.beginPath(); G.moveTo(0, 420); G.quadraticCurveTo(230, 200, 520, 380); G.lineTo(520, 520); G.lineTo(0, 520); G.fillStyle = P.l1; G.fill(); G.lineWidth = 3; G.strokeStyle = P.ink; G.stroke();
  const cx = 230; poly([[cx - 110, 330], [cx - 110, 200], [cx - 80, 200], [cx - 80, 220], [cx - 50, 220], [cx - 50, 140], [cx - 20, 140], [cx - 20, 220], [cx + 40, 220], [cx + 40, 180], [cx + 80, 180], [cx + 80, 330]], P.m, 3);
  poly([[cx - 58, 140], [cx - 35, 90], [cx - 12, 140]], P.d1, 3); ln(cx - 35, 90, cx - 35, 50, 3); poly([[cx - 35, 50], [cx + 5 + Math.sin(t * 4) * 6, 60], [cx - 35, 72]], P.red, 2);
  for (let i = 0; i < 3; i++) rr(cx - 95 + i * 60, 260, 16, 26, 7, P.ink, 0);
  // field furrows
  G.fillStyle = P.m; G.fillRect(0, 500, SW, 520); for (let i = 0; i < 12; i++) curve([[-50, 520 + i * i * 4.4], [460, 500 + i * i * 4.7], [980, 520 + i * i * 4.4]], 3, P.d2);
  shadeRect(0, 500, SW, 520, 11, .22, -1);
  // serfs working
  const hoeK = i => (Math.sin(t * 3.4 + i * 1.7) + 1) / 2;
  serf(160, 700, { s: .8, bend: hoeK(1) * .35, hoe: hoeK(1), tired: .6 });
  serf(720, 690, { s: .78, bend: hoeK(2) * .35, hoe: hoeK(2), tired: .6, face: -1 });
  const wipe = ss(seg(u, .6, .75)) * (1 - ss(seg(u, .85, .95)));
  serf(450, 900, { s: 1.15, bend: (1 - wipe) * hoeK(0) * .4, hoe: lerp(hoeK(0), -1.4, wipe), tired: .8, sweat: (t * .9) % 1 });
  // stamp
  const sk = ss(seg(u, .18, .3)); if (sk > 0) { G.save(); G.translate(700, 380); G.rotate(-.12); G.scale(lerp(1.8, 1, eo(sk)), lerp(1.8, 1, eo(sk))); G.globalAlpha = sk; G.strokeStyle = P.red; G.lineWidth = 6; G.strokeRect(-150, -46, 300, 92); txt('ROBOTA', 0, 0, 64, P.red, { ls: 6 }); G.restore(); }
}

function scChain(t, u, d) { // kök zinciri kartı
  G.fillStyle = P.ink; G.fillRect(0, 0, SW, SH);
  G.strokeStyle = P.gold; G.lineWidth = 4; G.strokeRect(40, 40, SW - 80, SH - 80); G.lineWidth = 2; G.strokeRect(56, 56, SW - 112, SH - 112);
  // corner fans
  [[56, 56, 0], [SW - 56, 56, 1], [56, SH - 56, 3], [SW - 56, SH - 56, 2]].forEach(([x, y, q]) => { for (let i = 0; i < 5; i++) { const a = q * Math.PI / 2 + i / 4 * Math.PI / 2; ln(x, y, x + Math.cos(a) * 60 * (q === 1 || q === 2 ? -1 : 1) * (q === 1 ? -1 : 1), y + Math.sin(a) * 60 * (q >= 2 ? -1 : 1), 2, P.gold); } });
  txt('KÖKÜN YOLCULUĞU', 460, 120, 44, P.gold, { ls: 6 });
  const rows = [['rabŭ', '“köle”', 'Eski Slavca'], ['robota', '“angarya”', 'Çekçe'], ['roboti', '1920 · R.U.R.', 'Čapek kardeşler'], ['robot', '1923', 'İngilizce']];
  rows.forEach(([w, m, l], i) => {
    const k = ss(seg(u, .08 + i * .17, .2 + i * .17)); if (k <= 0) return;
    const y = 250 + i * 190; G.save(); G.globalAlpha = k; G.translate(lerp(-40, 0, eo(k)), 0);
    txt(w, 300, y, i === 3 ? 92 : 78, i === 3 ? P.gold : (i === 1 ? '#e05a4c' : P.wh), { it: true });
    txt(m, 640, y - 20, 40, P.l2, { it: true }); txt(l, 640, y + 28, 30, P.l1);
    if (i < 3) { ln(300, y + 58, 300, y + 128, 3, P.gold); poly([[288, y + 116], [312, y + 116], [300, y + 134]], P.gold, 0); }
    G.restore();
  });
}

function scPoster(t, u, d) { // Prag sokağı, afiş sütunu: R.U.R. 1921
  bg(P.d2, P.m); // night street
  for (let i = 0; i < 4; i++) { rr(i * 240 - 40, 80 + (i % 2) * 40, 220, 700, 4, i % 2 ? P.d1 : P.d2, 3); for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) rr(i * 240 - 20 + c * 66, 120 + (i % 2) * 40 + r * 110, 40, 64, 3, hash(i * 13 + r * 3 + c) > .45 ? P.gold : P.ink, 2); }
  G.fillStyle = P.d1; G.fillRect(0, 780, SW, 240); for (let i = 0; i < 12; i++) ln(i * 90, 780, i * 90 - 120, SH, 2, P.ink);
  // lamp post
  ln(790, 780, 790, 300, 8, P.ink); rr(760, 250, 60, 70, 8, P.gold, 3); lightPool(790, 290, 320, .45);
  // advertising column
  const cx = 420; rr(cx - 160, 160, 320, 640, 10, P.l1, 5); poly([[cx - 190, 160], [cx + 190, 160], [cx + 150, 100], [cx - 150, 100]], P.d2, 4); poly([[cx - 40, 100], [cx, 50], [cx + 40, 100]], P.d2, 3);
  shadeRect(cx + 90, 164, 68, 632, 7, .45);
  // the poster
  const pk = eo(seg(u, .05, .25)); G.save(); G.translate(cx, 470); G.scale(1, pk); rr(-130, -250, 260, 500, 4, P.wh, 3);
  txt('NÁRODNÍ DIVADLO', 0, -215, 22, P.d1, { ls: 2 }); ln(-110, -195, 110, -195, 2);
  txt('R.U.R.', 0, -120, 84, P.ink, { max: 240 }); txt('Rossumovi', 0, -40, 34, P.d1, { it: true }); txt('Univerzální', 0, -2, 34, P.d1, { it: true }); txt('Roboti', 0, 36, 34, P.red, { it: true });
  stageRobot(0, 230, { s: .38, n: '' }); txt('1921', 90, 200, 30, P.ink);
  G.restore();
  // passers-by silhouettes
  for (let i = 0; i < 2; i++) { const x = ((t * 70 + i * 520) % 1200) - 150; creator(x, 960, { s: .6, run: t * .4 + i, face: 1 }); }
  // Turkish translation strip
  const tk = ss(seg(u, .5, .62)); if (tk > 0) { G.save(); G.globalAlpha = tk; rr(160, 850, 600, 80, 6, P.ink, 0); txt('“Rossum’un Evrensel Robotları”', 460, 890, 38, P.hi, { it: true }); G.restore(); }
}

function stageSet(t, open) { // tiyatro sahnesi: fon, perdeler, ışık
  bg(P.d1, P.d2); G.fillStyle = P.m; G.fillRect(0, 760, SW, 260); for (let i = 0; i < 10; i++) ln(i * 100, 760, (i - 4.5) * 160 + 460, SH, 2, P.d2);
  // backdrop: factory wall drawn on canvas
  rr(80, 120, 760, 600, 4, P.l1, 3); for (let i = 0; i < 4; i++) { rr(120 + i * 180, 200, 120, 160, 4, P.l2, 3); ln(180 + i * 180, 200, 180 + i * 180, 360, 2); ln(120 + i * 180, 280, 240 + i * 180, 280, 2); }
  txt('R · U · R', 460, 160, 34, P.d1, { ls: 10 });
  lightPool(460, 640, 520, .45);
  // curtains open
  const o = clamp(open); G.fillStyle = P.ink;
  for (const side of [-1, 1]) { G.save(); const w = lerp(470, 110, eio(o)); G.translate(side < 0 ? 0 : SW - w, 0); G.fillStyle = P.d1; G.fillRect(0, 0, w, SH); for (let i = 0; i < 6; i++) ln(w * (i + .5) / 6, 0, w * (i + .5) / 6 + Math.sin(i + t) * 6, SH, 6, P.ink); G.restore(); }
  G.fillStyle = P.ink; G.fillRect(0, 0, SW, 70); for (let i = 0; i < 9; i++) { G.beginPath(); G.arc(50 + i * 104, 70, 52, 0, Math.PI); G.fill(); }
}
function scStage(t, u, d) { // dönüm: metal değil, insana benzer
  stageSet(t, seg(u, 0, .25));
  const xs = [270, 460, 650];
  xs.forEach((x, i) => stageRobot(x, 860, { s: 1, n: i + 1, step: 0 }));
  // tin robot outline crossed out
  const k = ss(seg(u, .35, .5)), xk = ss(seg(u, .52, .62));
  if (k > 0) { G.save(); G.globalAlpha = k; G.translate(740, 330); rr(-80, -110, 160, 220, 10, P.hi, 3); G.save(); G.scale(.42, .42); G.translate(0, 220); robot(0, 0, {}); G.restore();
    if (xk > 0) { G.strokeStyle = P.red; G.lineWidth = 10; G.beginPath(); G.moveTo(-70, -100); G.lineTo(lerp(-70, 70, xk), lerp(-100, 100, xk)); G.moveTo(70, -100); G.lineTo(lerp(70, -70, xk), lerp(-100, 100, xk)); G.stroke(); }
    txt('METAL DEĞİL', 0, 140, 30, P.hi, { ls: 2, halo: 5, haloc: P.ink }); G.restore(); }
  const hk = ss(seg(u, .66, .8)); if (hk > 0) { G.save(); G.globalAlpha = hk; txt('yapay madde · insan biçimi', 330, 440, 34, P.hi, { it: true, halo: 5, haloc: P.ink }); G.restore(); }
}
function scRevolt(t, u, d) { // ayaklanma: robotlar yumruk kaldırır, yaratıcı kaçar
  stageSet(t, 1);
  const f = ss(seg(u, .1, .3)), adv = ss(seg(u, .3, 1));
  [220, 460, 700].forEach((x, i) => stageRobot(x, 860 + adv * 40, { s: 1 + adv * .12, n: i + 1, fist: f * (.8 + .2 * Math.sin(t * 8 + i)), anger: f, step: Math.sin(t * 6 + i) * adv }));
  const run = seg(u, .25, 1); creator(lerp(560, 1100, run), 950, { s: .9, run: t, face: 1, fear: 1 });
  // shout marks
  if (f > .5) for (let i = 0; i < 3; i++) { const x = 220 + i * 240; ln(x - 40, 440, x - 60, 410, 4, P.hi); ln(x, 430, x, 395, 4, P.hi); ln(x + 40, 440, x + 60, 410, 4, P.hi); }
}

function scNews(t, u, d) { // dönen gazete → dünya
  G.fillStyle = P.d1; G.fillRect(0, 0, SW, SH);
  const sp = seg(u, 0, .42), spin = (1 - eo(sp)) * 14, sc = lerp(.05, 1, eo(sp));
  if (u < .62) {
    G.save(); G.translate(460, 470); G.rotate(spin); G.scale(sc, sc);
    poly([[-330, -380], [330, -380], [330, 380], [-330, 380]], P.wh, 4); txt('THE LONDON STAGE', 0, -330, 40, P.ink, { ls: 3 }); ln(-300, -300, 300, -300, 3); ln(-300, -292, 300, -292, 1.5);
    txt('“ROBOTS”', 0, -200, 110, P.ink); txt('R.U.R. opens in London', 0, -100, 44, P.d1, { it: true }); txt('1923', 0, -40, 50, P.red);
    for (let c = 0; c < 3; c++) for (let l = 0; l < 10; l++) ln(-290 + c * 200, 30 + l * 30, -120 + c * 200 - (l % 3) * 20, 30 + l * 30, 3, P.m);
    G.restore();
  } else {
    // globe with routes from Prague
    const k = seg(u, .62, 1); bg(P.d1, P.d2);
    G.save(); G.translate(460, 480); ell(0, 0, 330, 330, P.l1, 5); G.save(); G.beginPath(); G.arc(0, 0, 330, 0, TAU); G.clip();
    for (let i = -3; i <= 3; i++) { ell(0, 0, Math.abs(330 * Math.cos(i * .45 + t * .2)), 330, null, 1.5, P.d2); ln(-330, i * 90, 330, i * 90, 1.5, P.d2); }
    // continents (simple blobs)
    G.fillStyle = P.m; [[-120, -120, 160, 90], [60, -150, 120, 80], [80, 20, 90, 140], [-200, 60, 90, 120]].forEach(([x, y, w, h], i) => { G.beginPath(); G.ellipse(x, y, w / 2, h / 2, i, 0, TAU); G.fill(); });
    G.restore();
    const pts = { Prag: [40, -140], Londra: [-40, -150], 'New York': [-230, -60], Tokyo: [270, -60] };
    Object.entries(pts).forEach(([n, [x, y]], i) => { const a = ss(seg(k, i * .15, i * .15 + .3)); if (a <= 0) return; G.globalAlpha = a; if (i) { G.setLineDash([8, 8]); curve([[40, -140], [(40 + x) / 2, Math.min(-140, y) - 80], [x, y]], 3, P.ink); G.setLineDash([]); } ell(x, y, 10, 10, i ? P.ink : P.red, 2); txt(n, x, y - 30, 30, P.ink, { halo: 5 }); G.globalAlpha = 1; });
    G.restore();
    txt('robot', 460, 900, 70, P.hi, { it: true });
  }
}

function scToday(t, u, d) { // bugünün fabrikası: robot kollar, kıvılcım
  bg(P.l1, P.m);
  // ceiling beams
  for (let i = 0; i < 6; i++) poly([[i * 180 - 60, 0], [i * 180 + 60, 0], [i * 180 + 20, 120], [i * 180 - 20, 120]], P.d2, 2);
  G.fillStyle = P.d2; G.fillRect(0, 760, SW, 260);
  // line with car bodies
  rr(-20, 700, 960, 60, 6, P.d1, 3); const off = (t * 50) % 300;
  for (let i = -1; i < 4; i++) { const x = i * 300 + off; G.save(); G.translate(x, 700); poly([[0, 0], [10, -70], [70, -80], [120, -140], [220, -140], [260, -80], [280, -10], [280, 0]], P.l2, 3); ell(60, 0, 26, 26, P.ink, 2); ell(220, 0, 26, 26, P.ink, 2); rr(130, -130, 70, 46, 6, P.hi, 2); G.restore(); }
  // two robot arms
  [[230, 1], [690, -1]].forEach(([bx, dir], i) => {
    const a1 = -1.1 + Math.sin(t * 2.2 + i * 2) * .25, a2 = 1.5 + Math.sin(t * 3.1 + i) * .3;
    G.save(); G.translate(bx, 760); rr(-50, -30, 100, 40, 8, P.d1, 3);
    G.rotate(dir * (.2 + Math.sin(t * 2.2 + i * 2) * .15));
    rr(-18, -230, 36, 230, 14, P.hi, 3); shadeRect(4, -226, 12, 220, 6, .4); ell(0, -230, 26, 26, P.m, 3);
    G.translate(0, -230); G.rotate(dir * (a2 + .5)); rr(-14, -170, 28, 170, 12, P.hi, 3); ell(0, -170, 18, 18, P.m, 3);
    G.translate(0, -170); poly([[-16, 0], [16, 0], [10, -40], [-10, -40]], P.d1, 3);
    // sparks
    if ((Math.floor(t * 12) + i) % 3 === 0) for (let s = 0; s < 8; s++) { const an = hash(s + Math.floor(t * 12) + i * 50) * TAU; ln(0, -44, Math.cos(an) * 46, -44 + Math.sin(an) * 46, 2.5, P.wh); }
    G.restore();
  });
  txt('ROBOT', 460, 230, 140, P.hi, { ls: 14, halo: 8, haloc: P.ink });
}

function scEnd(t, u, d) { // kancadaki robot dinleniyor, göz kırpar
  bg(P.l2, P.hi); lightPool(460, 420, 520, .45);
  rr(560, 120, 250, 280, 6, P.hi, 4); for (let i = 1; i < 8; i++) ln(566, 120 + i * 34, 804, 120 + i * 34, 2, P.m); ln(685, 120, 685, 400, 4);
  floorBoards(640);
  // armchair crate
  rr(250, 640, 360, 170, 10, P.d2, 4); shadeRect(250, 640, 360, 170, 9, .3); for (let i = 1; i < 4; i++) ln(250 + i * 90, 640, 250 + i * 90, 810, 3);
  G.save(); G.translate(700, 760); G.rotate(.4); ln(0, 0, 0, 220, 8, P.d2); poly([[-40, 210], [40, 210], [56, 280], [-56, 280]], P.l1, 3); G.restore(); // broom leaning
  const wink = ss(seg(u, .55, .62)) * (1 - ss(seg(u, .72, .8)));
  robot(430, 760, { s: 1.15, lid: 0, eye: .1, arm: -.2, armR: 2.2 + Math.sin(t * 2) * .05, mouth: 1, wink, look: .6, htilt: -.08, bulb: true });
  // cup + steam
  G.save(); G.translate(560, 520); rr(-26, -30, 52, 56, 10, P.wh, 3); for (let i = 0; i < 3; i++) curve([[-10 + i * 10, -36], [-16 + i * 10 + Math.sin(t * 3 + i) * 6, -70], [-6 + i * 10, -100]], 2, P.m); G.restore();
  // little hearts? no: musical notes from a gramophone
  rr(70, 560, 120, 80, 6, P.d1, 3); poly([[130, 560], [100, 440], [200, 400], [190, 470]], P.l1, 3);
  for (let i = 0; i < 3; i++) { const k = ((t * .5 + i * .33) % 1); G.save(); G.globalAlpha = 1 - k; txt('♪', 180 + k * 120, 420 - k * 160, 50, P.ink); G.restore(); }
}

// ---------- voice data ----------
let Z = null; const L = {};
const T0 = id => L[id] ? L[id].t0 : 0, T1 = id => L[id] ? L[id].t1 : 0;
const FDUR = () => Math.min(Z.dur, T1('s13') + 1.6);
const CEND = () => T1('s13') - .3;
let SC = [];
function buildScenes() {
  // s04 içindeki "roboti" kelimesinin yerini fırça için bul
  const l4 = L.s04; let rob = .55; if (l4 && l4.kelimeler) { const w = l4.kelimeler.find(k => /^roboti/i.test(k.w)); if (w) rob = (w.t0 - l4.t0 + .1) / (l4.t1 - l4.t0 + .6); }
  const sb = id => T0(id) - .25;
  SC = [
    [scHook, 0, 'cut', {}],
    [scPrague, sb('s02'), 'iris', {}],
    [scStudio, sb('s04'), 'iris', { roboti: rob }],
    [scField, sb('s05'), 'iris', {}],
    [scChain, sb('s06'), 'cut', {}],
    [scPoster, sb('s07'), 'iris', {}],
    [scStage, sb('s08'), 'iris', {}],
    [scRevolt, sb('s09'), 'cut', {}],
    [scNews, sb('s10'), 'iris', {}],
    [scToday, sb('s12'), 'iris', {}],
    [scEnd, sb('s13'), 'iris', {}],
  ];
  SC.forEach((s, i) => s.push(i < SC.length - 1 ? SC[i + 1][1] : FDUR()));
}
function sceneAt(t) { let i = 0; for (let j = 0; j < SC.length; j++) if (t >= SC[j][1]) i = j; return i; }
function drawScene(i, t) { const [f, s, , d, e] = SC[i]; G.save(); f(t, seg(t, s, e), d); G.restore(); }

// ---------- print pass ----------
let GRAIN = [];
function makeGrain() { for (let g = 0; g < 6; g++) { const c = document.createElement('canvas'); c.width = SW / 2; c.height = SH / 2; const x = c.getContext('2d'), im = x.createImageData(c.width, c.height), r = mulberry(31 + g); for (let i = 0; i < c.width * c.height; i++) { const v = 128 + (r() - .5) * 120; im.data[i * 4] = v; im.data[i * 4 + 1] = v * .96; im.data[i * 4 + 2] = v * .88; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0); GRAIN.push(c); } }
function printPass(t, harsh = 0) {
  const f = Math.floor(t * 24);
  // sepia tint
  G.save(); G.globalCompositeOperation = 'multiply'; G.fillStyle = harsh ? '#e9e2d6' : '#f2dfbc'; G.fillRect(0, 0, SW, SH); G.restore();
  // flicker
  const fl = (hash(f * .71) - .5) * (.09 + harsh * .06); G.save(); G.fillStyle = fl > 0 ? `rgba(255,248,230,${fl})` : `rgba(20,12,6,${-fl})`; G.fillRect(0, 0, SW, SH); G.restore();
  // grain yok: kare kare gren dosyayı 80 MB'a çıkarıyordu (sınır 50 MB)
  // scratches + dust
  G.save(); const ns = Math.floor(hash(f * .37) * (2.5 + harsh * 2)); for (let i = 0; i < ns; i++) { const x = hash(f * 3.3 + i * 9.1) * SW, y0 = hash(f * 5.1 + i) * SH * .5, len = 200 + hash(f + i * 4.4) * 700; G.strokeStyle = hash(i + f * .5) > .5 ? 'rgba(250,244,230,.55)' : 'rgba(25,16,10,.5)'; G.lineWidth = 1 + hash(i * 7 + f) * 1.5; G.beginPath(); G.moveTo(x, y0); G.lineTo(x + (hash(i + f * 9) - .5) * 6, y0 + len); G.stroke(); }
  for (let i = 0; i < 5; i++) { if (hash(f * 1.7 + i * 3.3) > .45) continue; G.fillStyle = 'rgba(20,12,6,.6)'; G.beginPath(); G.ellipse(hash(f + i * 11) * SW, hash(f * 2 + i * 13) * SH, 1.5 + hash(f + i) * 4, 1 + hash(f * 3 + i) * 3, hash(i + f), 0, TAU); G.fill(); }
  if (f % 97 < 8) { G.strokeStyle = 'rgba(20,12,6,.55)'; G.lineWidth = 1.5; G.beginPath(); G.moveTo(120, 80); G.bezierCurveTo(170, 160, 90, 230, 150, 320); G.stroke(); }
  G.restore();
  // vignette + burn
  const vg = G.createRadialGradient(SW / 2, SH / 2, SH * .3, SW / 2, SH / 2, SH * .72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,16,6,.62)'); G.fillStyle = vg; G.fillRect(0, 0, SW, SH);
}
function iris(r, cx = SW / 2, cy = SH / 2) { G.save(); G.beginPath(); G.rect(0, 0, SW, SH); G.arc(cx, cy, Math.max(0, r), 0, TAU, true); G.fillStyle = '#0d0805'; G.fill('evenodd'); G.restore(); }

// ---------- picture house (static, built once) ----------
let HOUSE = null;
function makeHouse() {
  HOUSE = document.createElement('canvas'); HOUSE.width = W; HOUSE.height = H; const h = HOUSE.getContext('2d');
  h.fillStyle = '#120c0a'; h.fillRect(0, 0, W, H);
  // velvet curtains at sides and valance on top
  const drape = (x0, w) => { for (let i = 0; i < 7; i++) { const x = x0 + i * w / 7, g = h.createLinearGradient(x, 0, x + w / 7, 0); g.addColorStop(0, '#3a0d0c'); g.addColorStop(.5, '#8e2420'); g.addColorStop(1, '#3a0d0c'); h.fillStyle = g; h.fillRect(x, 0, w / 7 + 1, H); } };
  drape(-20, 110); drape(W - 90, 110);
  h.fillStyle = '#6e1a17'; h.fillRect(0, 0, W, 250); for (let i = 0; i < 11; i++) { const g = h.createRadialGradient(i * 108 + 54, 250, 4, i * 108 + 54, 250, 60); g.addColorStop(0, '#a83029'); g.addColorStop(1, '#4a1210'); h.fillStyle = g; h.beginPath(); h.arc(i * 108 + 54, 250, 54, 0, Math.PI); h.fill(); }
  h.strokeStyle = '#d9b25c'; h.lineWidth = 4; h.beginPath(); h.moveTo(0, 250); h.lineTo(W, 250); h.stroke();
  for (let i = 0; i < 22; i++) { h.fillStyle = '#d9b25c'; h.beginPath(); h.moveTo(i * 50 + 25, 250); h.lineTo(i * 50 + 18, 282); h.lineTo(i * 50 + 32, 282); h.fill(); }
  // stage edge + footlights under the screen
  const sg = h.createLinearGradient(0, 1560, 0, H); sg.addColorStop(0, '#2a1a12'); sg.addColorStop(1, '#0b0604'); h.fillStyle = sg; h.fillRect(0, 1560, W, H - 1560);
  h.fillStyle = '#d9b25c'; h.fillRect(60, 1556, W - 120, 6);
  for (let i = 0; i < 9; i++) { const x = 120 + i * 105, g = h.createRadialGradient(x, 1590, 2, x, 1590, 120); g.addColorStop(0, 'rgba(255,220,150,.55)'); g.addColorStop(1, 'rgba(255,220,150,0)'); h.fillStyle = g; h.fillRect(x - 120, 1470, 240, 240); h.fillStyle = '#ffe9b0'; h.beginPath(); h.ellipse(x, 1590, 14, 7, 0, 0, TAU); h.fill(); }
  // screen spill on curtains
  const sp = h.createRadialGradient(W / 2, SY + SH / 2, SH * .4, W / 2, SY + SH / 2, SH * .85); sp.addColorStop(0, 'rgba(255,240,210,.12)'); sp.addColorStop(1, 'rgba(255,240,210,0)'); h.fillStyle = sp; h.fillRect(0, 0, W, H);
}

// ---------- subtitles: intertitle card under the screen ----------
const KEY = /^(robot|robota|roboti|rab’a|rab'a|robots|angarya|R\.U\.R\.)[.,!?'’]*$/i;
const TR = { s12: 'Bugün modern fabrikalardaki ağır işlerin çoğunu robotlar yapıyor.' };
function wrap(words, maxW) { const out = [[]]; let w = 0; const sp = X.measureText(' ').width; words.forEach(wd => { const ww = X.measureText(wd).width; if (w + ww > maxW && out[out.length - 1].length) { out.push([]); w = 0; } out[out.length - 1].push(wd); w += ww + sp; }); return out; }
function card(y0, y1, a) { X.save(); X.globalAlpha = a; X.fillStyle = '#0d0907'; X.fillRect(70, y0, 940, y1 - y0); X.strokeStyle = P.gold; X.lineWidth = 3; X.strokeRect(82, y0 + 12, 916, y1 - y0 - 24); X.lineWidth = 1.5; X.strokeRect(92, y0 + 22, 896, y1 - y0 - 44);
  for (const [x, y, sx, sy] of [[92, y0 + 22, 1, 1], [988, y0 + 22, -1, 1], [92, y1 - 22, 1, -1], [988, y1 - 22, -1, -1]]) { X.beginPath(); for (let i = 0; i < 4; i++) { const r = 10 + i * 7; X.moveTo(x + sx * r, y); X.arc(x, y, r, sx > 0 ? (sy > 0 ? 0 : -Math.PI / 2) : (sy > 0 ? Math.PI / 2 : Math.PI), sx > 0 ? (sy > 0 ? Math.PI / 2 : 0) : (sy > 0 ? Math.PI : Math.PI * 1.5)); } X.stroke(); }
  X.restore(); }
function caption(t) {
  const l = Z.satirlar.find(l => t >= l.t0 - .15 && t <= l.t1 + .4); if (!l) { card(1385, 1535, .92); return; }
  const words = l.metin.split(' '), kel = l.kelimeler || [];
  const heard = kel.filter(k => k.t0 <= t).length, shown = t > l.t1 ? words.length : Math.max(1, Math.round(heard * words.length / Math.max(1, kel.length)));
  X.save(); X.font = `italic 44px ${SERIF}`; const rows = wrap(words, 830), tr = TR[l.id];
  const lh = 54, total = rows.length * lh + (tr ? 44 : 0), y1 = 1535, y0 = Math.min(1385, y1 - total - 48);
  card(y0, y1, .94);
  X.textBaseline = 'middle'; X.textAlign = 'left'; let n = 0; const top = y0 + (y1 - y0 - total) / 2;
  rows.forEach((r, ri) => { X.font = `italic 44px ${SERIF}`; const rw = X.measureText(r.join(' ')).width; let x = 540 - rw / 2; const y = top + lh * ri + lh / 2;
    r.forEach(wd => { const vis = n < shown; X.globalAlpha = vis ? 1 : .28; X.fillStyle = KEY.test(wd) ? '#e8604f' : (l.dil === 'en' ? P.gold : P.hi); X.fillText(wd, x, y); x += X.measureText(wd + ' ').width; n++; }); });
  if (tr) { X.globalAlpha = ss(seg(t, l.t0 + .6, l.t0 + 1)); X.font = `italic 32px ${SERIF}`; X.fillStyle = P.l1; X.textAlign = 'center'; X.fillText(tr, 540, top + rows.length * lh + 22); }
  X.restore();
}
function header(t) { X.save(); X.textAlign = 'center'; X.textBaseline = 'middle'; X.font = `26px ${SERIF}`; X.letterSpacing = '6px'; X.fillStyle = P.gold; X.fillText('KELİMELERİN TARİHÇESİ · ROBOT', 540, 306); X.restore(); }

function endCard(t) { // kapanış: perde kapanır, ingilizcecim.com
  const ce = CEND(), k = seg(t, ce, ce + .8); if (k <= 0) return false;
  const w = lerp(0, SW / 2, eio(k));
  for (const side of [0, 1]) { const x = side ? SW - w : 0; const g = G.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#2a0b0a'); g.addColorStop(.5, '#7a1e1b'); g.addColorStop(1, '#2a0b0a'); G.fillStyle = g; G.fillRect(x, 0, w, SH); for (let i = 0; i < 5; i++) { G.strokeStyle = 'rgba(0,0,0,.35)'; G.lineWidth = 6; G.beginPath(); G.moveTo(x + w * (i + .5) / 5, 0); G.lineTo(x + w * (i + .5) / 5, SH); G.stroke(); } }
  const a = ss(seg(t, ce + .6, ce + 1.1)); if (a > 0) { G.save(); G.globalAlpha = a; rr(130, 380, 660, 260, 10, P.ink, 0); G.strokeStyle = P.gold; G.lineWidth = 3; G.strokeRect(146, 396, 628, 228); txt('— SON —', 460, 450, 40, P.gold, { ls: 8 }); txt('ingilizcecim.com', 460, 540, 76, P.wh, { it: true }); G.restore(); }
  return true;
}

function cover() { // aynı düzen: seri etiketi + büyük kelime, ortadaki 1080×1350 içinde
  X.save(); X.textAlign = 'center'; X.textBaseline = 'middle';
  X.fillStyle = 'rgba(13,9,7,.9)'; X.fillRect(110, 360, 860, 330); X.strokeStyle = P.gold; X.lineWidth = 4; X.strokeRect(126, 376, 828, 298); X.lineWidth = 2; X.strokeRect(138, 388, 804, 274);
  X.font = `40px ${SERIF}`; X.letterSpacing = '8px'; X.fillStyle = P.gold; X.fillText('KELİMELERİN TARİHÇESİ', 540, 440); X.letterSpacing = '0px';
  X.font = `italic 190px ${SERIF}`; X.fillStyle = P.wh; X.fillText('Robot', 540, 570);
  X.fillStyle = 'rgba(13,9,7,.9)'; X.fillRect(170, 1400, 740, 120); X.strokeStyle = P.gold; X.lineWidth = 3; X.strokeRect(182, 1412, 716, 96);
  X.font = `italic 54px ${SERIF}`; X.fillStyle = '#e8604f'; X.fillText('robota = “angarya”', 540, 1462);
  X.restore();
}

window.render = t => {
  T = t; const f16 = Math.floor(t * 16); BOIL = Math.floor(t * 12);
  X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.drawImage(HOUSE, 0, 0);
  if (!Z) return;
  const tt = f16 / 16 + (t - f16 / 16) * 0; // el çevirmeli örnekleme: hareket 16 fps
  const i = sceneAt(t), [, s, tr] = SC[i];
  G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = 1; G.globalCompositeOperation = 'source-over'; G.fillStyle = P.d1; G.fillRect(0, 0, SW, SH);
  const nextS = i < SC.length - 1 ? SC[i + 1][1] : 1e9, nextTr = i < SC.length - 1 ? SC[i + 1][2] : 'cut';
  drawScene(i, KAPAK ? t : tt);
  const R = Math.hypot(SW, SH) / 2 + 20;
  if (tr === 'iris' && t < s + .45) iris(R * eo(seg(t, s, s + .45)));
  if (nextTr === 'iris' && t > nextS - .3) iris(R * (1 - seg(t, nextS - .3, nextS)));
  if (!KAPAK) endCard(t);
  const harsh = SC[i][0] === scRevolt ? 1 : 0;
  printPass(t, harsh);
  // gate weave
  const wx = (hash(f16 * .9) - .5) * 3, wy = (hash(f16 * 1.7) - .5) * 3 + (f16 % 53 === 0 ? 6 : 0);
  X.save(); X.beginPath(); X.roundRect(SX, SY, SW, SH, 26); X.clip(); X.fillStyle = '#0d0805'; X.fillRect(SX, SY, SW, SH); X.drawImage(S, SX + wx, SY + wy); X.restore();
  // soft dark rim of the aperture
  X.save(); X.strokeStyle = 'rgba(10,6,4,.85)'; X.lineWidth = 10; X.beginPath(); X.roundRect(SX, SY, SW, SH, 26); X.stroke(); X.restore();
  if (KAPAK) { cover(); return; }
  header(t);
  if (t < CEND() + .2) caption(t); else card(1385, 1535, .92 * (1 - seg(t, CEND() + .2, CEND() + .6)));
};

(async () => {
  Z = await (await fetch('ses/zaman.json')).json(); Z.satirlar.forEach(l => { L[l.id] = l; const k = l.kelimeler || []; if (k.length) { const a = k[0].t0, b = k[k.length - 1].t1, f = (l.t1 - l.t0) / Math.max(.01, b - a); k.forEach(w => { w.t0 = l.t0 + (w.t0 - a) * f; w.t1 = l.t0 + (w.t1 - a) * f; }); } }); // kelime zamanlarini satirin ses suresine sigdir
  await document.fonts.load(`60px ${SERIF}`, 'ğşİıçüöÜÇŞĞČáíŭ'); await document.fonts.load(`italic 60px ${SERIF}`, 'ğşİıçüöÜÇŞĞČáíŭ'); await document.fonts.ready;
  makeHouse(); makeGrain(); buildScenes();
  window.DUR = FDUR();
  const s = id => T0(id), e = [];
  e.push({ t: .05, type: 'click' }, { t: s('s01') + 2.4, type: 'pop' });
  for (const id of ['s02', 's04', 's05', 's07', 's08', 's10', 's12', 's13']) e.push({ t: s(id) - .3, type: 'whoosh' });
  e.push({ t: s('s02') + 1.2, type: 'click' }, { t: s('s02') + 1.5, type: 'click' }, { t: s('s02') + 1.8, type: 'ding' });
  e.push({ t: s('s05') + .9, type: 'thump' }, { t: s('s06') + .2, type: 'thump' });
  for (let i = 0; i < 4; i++) e.push({ t: s('s06') - .25 + (T1('s06') - T0('s06') + .6) * (.08 + i * .17), type: 'click' });
  e.push({ t: s('s07') + .4, type: 'pop' }, { t: s('s08') + 2.2, type: 'thump' }, { t: s('s09') + .5, type: 'thump' }, { t: s('s09') + .9, type: 'thump' });
  e.push({ t: s('s10') + 1.6, type: 'ding' }, { t: s('s12') + .1, type: 'ding' }, { t: CEND(), type: 'whoosh' }, { t: CEND() + .8, type: 'ding' });
  window.EV = e.filter(x => x.t > 0 && x.t < FDUR()).sort((a, b) => a.t - b.t);
  window.READY = true;
})();
