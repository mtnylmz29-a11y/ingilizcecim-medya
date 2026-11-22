// Kelimelerin Tarihçesi: Clue — 16-bit pixel RPG görünümü (lemo-opuscar pixel-rpg tarifi), 2D tuval — ingilizcecim.com
// 180×320 yerel piksel çerçeve ×6 → 1080×1920; yazılar 360×640 katmanda eşiklenerek (keskin piksel) çizilir.
// Korunan renk: kırmızı iplik (RED) — her çağda aynı kalır; 1590'lar sahnesi azaltılmış (sepya) paletle.
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const W = 1080, H = 1920, NW = 180, NH = 320, TW = 360, TH = 640;
const C = document.getElementById('c'), X = C.getContext('2d');
const S = document.createElement('canvas'); S.width = NW; S.height = NH; const G = S.getContext('2d', { willReadFrequently: true });
const Tc = document.createElement('canvas'); Tc.width = TW; Tc.height = TH; const Q = Tc.getContext('2d', { willReadFrequently: true });
G.imageSmoothingEnabled = false;
const FC = document.createElement('canvas'); FC.width = 40; FC.height = 48; const F = FC.getContext('2d', { willReadFrequently: true });
const KAPAK = /kapak=1/.test(location.search);
const FONT = "'Fredoka', sans-serif", TITLE = "'Lilita One', 'Fredoka', sans-serif";
const P = {
  ink: '#1b1528', d: '#2b2640', navy: '#24365c', navyD: '#1a2848', blue: '#3b6fb6', sky: '#7fb2e5', pale: '#c7e3f5', white: '#f4efe3', silver: '#a9b0c3',
  grey: '#6c7088', dgrey: '#3f4258', stone: '#8a8073', stoneD: '#5c5248', stoneL: '#b5aa96', sand: '#e2c48a', sandD: '#c4a26a', ochre: '#d08b3a', brown: '#7a4a2c', dbrown: '#4a2d1f',
  green: '#4f9a4a', dgreen: '#2d5e3a', lgreen: '#86c45a', sea: '#2f6fa0', seaD: '#1f4a78', seaL: '#5aa0c8', skin: '#f1b98c', skinD: '#c98762', hair: '#3a2620', hairL: '#5e3d2c',
  plum: '#8c3d7e', plumD: '#5a2452', gold: '#f2c23e', goldD: '#b4832a', teal: '#2aa197', tealD: '#1a6a66', tan: '#c8955c', tanD: '#8d6238', cream: '#efe0b8', candle: '#ffd36b',
  orange: '#f08a3a', pink: '#f0a0a8', RED: '#e0303a', REDD: '#9c1e2c'
};
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x, y) => (B4[(y & 3) * 4 + (x & 3)] + .5) / 16;
let T = 0;

// ---------- native pixel primitives ----------
function R(x, y, w, h, c, g = G) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function px(x, y, c, g = G) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); }
function dith(x, y, w, h, c1, c2, lv) { R(x, y, w, h, c1); if (lv <= 0) return; G.fillStyle = c2; x = Math.round(x); y = Math.round(y); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (bay(x + i, y + j) < lv) G.fillRect(x + i, y + j, 1, 1); }
function vgrad(x, y, w, h, cols) { const n = cols.length - 1; for (let j = 0; j < h; j++) { const f = j / Math.max(1, h - 1) * n, k = Math.min(n - 1, Math.floor(f)), r = f - k; for (let i = 0; i < w; i++) { G.fillStyle = bay(x + i, y + j) < r ? cols[k + 1] : cols[k]; G.fillRect(x + i, y + j, 1, 1); } } }
function disc(cx, cy, r, c, g = G) { g.fillStyle = c; for (let j = -r; j <= r; j++) { const w = Math.floor(Math.sqrt(r * r - j * j + r * .8)); g.fillRect(Math.round(cx - w), Math.round(cy + j), w * 2 + 1, 1); } }
function ring(cx, cy, r, c, g = G) { g.fillStyle = c; for (let a = 0; a < 64; a++) { const x = Math.round(cx + Math.cos(a / 64 * 6.283) * r), y = Math.round(cy + Math.sin(a / 64 * 6.283) * r); g.fillRect(x, y, 1, 1); } }
function glow(cx, cy, r, c, a = .5) { G.fillStyle = c; for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const d = Math.sqrt(i * i + j * j) / r; if (d < 1 && bay(cx + i, cy + j) < (1 - d) * a) G.fillRect(Math.round(cx + i), Math.round(cy + j), 1, 1); } }
function line(x0, y0, x1, y1, c) { x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; G.fillStyle = c; for (let k = 0; k < 600; k++) { G.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
// yarn ball (protected red) with wound lines
function yarn(cx, cy, r, rot = 0) {
  disc(cx, cy, r, P.REDD); disc(cx - (r > 3 ? 1 : 0), cy - (r > 3 ? 1 : 0), r - 1, P.RED);
  if (r >= 4) for (let k = 0; k < 3; k++) { const a = rot + k * 1.05; for (let s = -r + 1; s < r; s++) { const x = cx + Math.cos(a) * s, y = cy + Math.sin(a) * s * .55 + Math.cos(a) * (k - 1); if ((x - cx) ** 2 + (y - cy) ** 2 < (r - .6) ** 2) px(x, y, P.REDD); } }
  px(cx - Math.round(r * .45), cy - Math.round(r * .5), P.pink);
}
// top system window + dialog box skins
function win(x, y, w, h, fill = 'blue') {
  R(x, y, w, h, P.ink); R(x + 1, y + 1, w - 2, h - 2, P.white); R(x + 2, y + 2, w - 4, h - 4, P.silver);
  if (fill === 'blue') dith(x + 3, y + 3, w - 6, h - 6, P.navyD, P.navy, .5); else if (fill === 'paper') dith(x + 3, y + 3, w - 6, h - 6, P.cream, P.sand, .25); else R(x + 3, y + 3, w - 6, h - 6, fill);
  px(x, y, 'rgba(0,0,0,0)'); G.clearRect(x, y, 1, 1); G.clearRect(x + w - 1, y, 1, 1); G.clearRect(x, y + h - 1, 1, 1); G.clearRect(x + w - 1, y + h - 1, 1, 1);
}

// ---------- characters (rig drawn into FC, then 1-px ink outline) ----------
function fig(x, y, o = {}) {
  F.clearRect(0, 0, 40, 48);
  const cx = 20, fy = 44, wk = o.walk != null ? Math.floor(o.walk * 8) % 4 : -1;
  const bob = (wk === 1 || wk === 3) ? -1 : 0, kn = o.kneel ? 5 : 0, br = (!o.walk && Math.floor((T + (o.seed || 0)) * 1.2) % 2) ? 0 : 0;
  const by = fy - 16 + bob + kn + br;              // body top
  const top = o.top || P.white, topD = o.topD || P.silver, bot = o.bot || P.brown, skin = P.skin;
  // cape / scarf behind
  if (o.cape) { R(cx - 6, by + 1, 4, 10 - kn, o.cape, F); R(cx - 7, by + 5, 2, 7 - kn, o.cape, F); R(cx - 3, by + 1, 1, 9 - kn, o.capeD || o.cape, F); }
  if (o.scarf) { const sw = Math.floor(T * 6) % 2; R(cx - 7, by + 1, 4, 2, o.scarf, F); R(cx - 9 - sw, by + 2, 3, 2, o.scarf, F); R(cx - 10 - sw, by + 3 + sw, 2, 2, o.scarfD || o.scarf, F); }
  // back arm
  R(cx - 6, by + 2, 2, 6, topD, F); R(cx - 6, by + 8, 2, 2, P.skinD, F);
  // legs
  if (!o.dress) {
    let l = 0, r = 0, ll = 0, rl = 0;
    if (wk === 0) { l = -1; r = 1; rl = -1; } if (wk === 2) { l = 1; r = -1; ll = -1; }
    if (o.kneel) { R(cx - 4, fy - 4, 3, 3, bot, F); R(cx - 4, fy - 1, 7, 1, P.dbrown, F); R(cx + 1, fy - 6, 3, 6, bot, F); R(cx + 1, fy - 1, 4, 1, P.dbrown, F); }
    else {
      R(cx - 4 + l, fy - 7 + ll, 3, 7, o.leg || bot, F); R(cx + 1 + r, fy - 7 + rl, 3, 7, o.leg || bot, F);
      R(cx - 4 + l, fy - 1 + ll, 4, 1, P.dbrown, F); R(cx + 1 + r, fy - 1 + rl, 4, 1, P.dbrown, F);
    }
  }
  // body
  const bl = o.dress ? (fy - by) : (o.skirt ? 11 : 9) - (o.kneel ? 0 : 0);
  R(cx - 5, by, 10, Math.min(bl, fy - by), top, F); R(cx + 3, by, 2, Math.min(bl, fy - by), topD, F); R(cx - 5, by, 1, Math.min(bl, fy - by), o.topL || top, F);
  if (o.dress) { R(cx - 6, fy - 6, 12, 6, top, F); R(cx + 3, fy - 6, 3, 6, topD, F); for (let i = 0; i < 4; i++) R(cx - 6, fy - 5 + i * 0, 12, 1, top, F); R(cx - 6, fy - 2, 12, 1, o.hem || topD, F); }
  if (o.belt) R(cx - 5, by + 6, 10, 1, o.belt, F);
  if (o.ruff) { R(cx - 5, by - 1, 10, 2, P.white, F); for (let i = 0; i < 10; i += 2) px(cx - 5 + i, by, P.silver, F); }
  if (o.coatLine) R(cx, by + 1, 1, bl - 1, o.coatLine, F);
  // head
  const hy = by - 9;
  R(cx - 4, hy, 8, 9, skin, F); R(cx + 3, hy + 1, 1, 7, P.skinD, F); R(cx - 3, hy + 8, 6, 1, P.skinD, F);
  const hc = o.hair || P.hair, hl = o.hairL || P.hairL;
  if (o.hat === 'beanie') { R(cx - 5, hy - 2, 10, 4, o.hatC, F); R(cx - 5, hy + 1, 10, 1, o.hatD, F); R(cx - 1, hy - 3, 2, 1, o.hatD, F); R(cx - 5, hy + 2, 2, 4, hc, F); }
  else {
    R(cx - 5, hy - 1, 10, 3, hc, F); R(cx - 5, hy + 2, 3, 4, hc, F); R(cx - 2, hy - 1, 4, 1, hl, F);
    if (o.curly) { px(cx - 5, hy - 2, hc, F); px(cx - 1, hy - 2, hc, F); px(cx + 3, hy - 2, hc, F); R(cx + 3, hy + 2, 1, 1, hc, F); }
    if (o.long) { R(cx - 6, hy + 2, 3, 12, hc, F); R(cx - 6, hy + 13, 2, 2, hc, F); }
    if (o.band) R(cx - 5, hy + 1, 10, 1, o.band, F);
    if (o.beard) { R(cx - 1, hy + 6, 5, 3, hc, F); }
  }
  // face (3/4 right): eyes, mouth
  const blink = o.blink != null ? o.blink : (Math.floor((T + (o.seed || 0)) * 10) % 37 === 0);
  if (blink) { R(cx, hy + 4, 2, 1, P.ink, F); R(cx + 3, hy + 4, 1, 1, P.ink, F); }
  else { R(cx, hy + 3, 1, 2, P.ink, F); R(cx + 3, hy + 3, 1, 2, P.ink, F); }
  if (o.smile) R(cx + 1, hy + 6, 2, 1, P.skinD, F); else px(cx + 2, hy + 6, P.skinD, F);
  if (o.blush) px(cx - 1, hy + 5, P.pink, F);
  // front arm (+prop)
  const ax = cx + 3;
  if (o.armUp) { R(ax, by - 6, 2, 7, top, F); R(ax, by - 8, 2, 2, skin, F); if (o.prop === 'ball') yarnF(ax + 1, by - 10, 2); }
  else if (o.armOut) { R(ax, by + 2, 5, 2, top, F); R(ax + 5, by + 2, 2, 2, skin, F); if (o.prop === 'ball') yarnF(ax + 7, by + 2, 2); if (o.prop === 'mag') mag(ax + 8, by + 3); if (o.prop === 'quill') { R(ax + 6, by - 3, 1, 5, P.white, F); px(ax + 7, by - 4, P.white, F); } }
  else { R(ax, by + 2, 2, 6, top, F); R(ax, by + 8, 2, 2, skin, F); if (o.prop === 'ball') yarnF(ax + 2, by + 10, 2); }
  // outline
  const id = F.getImageData(0, 0, 40, 48), d = id.data, m = new Uint8Array(40 * 48);
  for (let i = 0; i < 40 * 48; i++) m[i] = d[i * 4 + 3] > 0;
  for (let j = 0; j < 48; j++) for (let i = 0; i < 40; i++) { const k = j * 40 + i; if (m[k]) continue; let n = 0; for (let v = -1; v <= 1; v++) for (let u = -1; u <= 1; u++) { const a = i + u, b = j + v; if (a >= 0 && a < 40 && b >= 0 && b < 48 && m[b * 40 + a]) n = 1; } if (n) { d[k * 4] = 27; d[k * 4 + 1] = 21; d[k * 4 + 2] = 40; d[k * 4 + 3] = 255; } }
  F.putImageData(id, 0, 0);
  const z = o.z || 2; G.imageSmoothingEnabled = false; G.save(); G.translate(Math.round(x), Math.round(y) - fy * z); G.scale((o.face === -1 ? -1 : 1) * z, z); G.drawImage(FC, -20, 0); G.restore();
}
function yarnF(cx, cy, r) { disc(cx, cy, r, P.RED, F); px(cx - 1, cy - 1, P.pink, F); px(cx + 1, cy, P.REDD, F); }
function mag(cx, cy) { R(cx - 3, cy + 2, 2, 3, P.brown, F); ring(cx, cy - 1, 3, P.silver, F); R(cx - 1, cy - 2, 3, 3, P.pale, F); px(cx - 1, cy - 2, P.white, F); }
// top-down hero head (maze)
function topHero(x, y) { disc(x, y, 5, P.ink); disc(x, y, 4, P.white); disc(x, y - 1, 3, P.hair); px(x - 1, y - 2, P.hairL); px(x + 1, y - 2, P.hairL); disc(x + 4, y + 2, 2, P.RED); }
// emote bubble
function emote(x, y, ch, a = 1) { if (a <= 0) return; win(x - 6, y - 7, 13, 11, P.white); Ttxt(ch, (x + .5) * 2, (y - 1.5) * 2, 15, P.ink, { font: TITLE }); }

// ---------- portraits (24×24) ----------
function portrait(x, y, who, ex, talk) {
  R(x, y, 26, 26, P.ink); dith(x + 1, y + 1, 24, 24, P.navy, P.blue, .3);
  const cx = x + 13, cy = y + 14;
  if (who === 'deniz') {
    R(cx - 8, cy - 7, 16, 16, P.skin); R(cx + 6, cy - 6, 2, 14, P.skinD); R(cx - 7, cy + 9, 14, 2, P.skinD);
    R(cx - 10, cy - 12, 20, 7, P.teal); R(cx - 10, cy - 6, 20, 2, P.tealD); R(cx - 2, cy - 14, 4, 2, P.tealD); R(cx - 10, cy - 4, 3, 9, P.hair); R(cx + 7, cy - 4, 3, 7, P.hair);
    R(cx - 9, cy + 11, 18, 2, P.teal); R(x + 1, y + 23, 24, 2, P.tan);
  }
  const blink = Math.floor(T * 10) % 31 === 0;
  if (ex === 'surprise') { R(cx - 5, cy - 2, 3, 4, P.white); R(cx + 2, cy - 2, 3, 4, P.white); R(cx - 4, cy - 1, 2, 2, P.ink); R(cx + 3, cy - 1, 2, 2, P.ink); R(cx - 6, cy - 5, 4, 1, P.hair); R(cx + 2, cy - 5, 4, 1, P.hair); }
  else if (ex === 'happy') { R(cx - 5, cy, 3, 1, P.ink); px(cx - 6, cy + 1, P.ink); px(cx - 2, cy + 1, P.ink); R(cx + 2, cy, 3, 1, P.ink); px(cx + 1, cy + 1, P.ink); px(cx + 5, cy + 1, P.ink); R(cx - 6, cy - 4, 4, 1, P.hair); R(cx + 2, cy - 4, 4, 1, P.hair); px(cx - 6, cy + 3, P.pink); px(cx + 5, cy + 3, P.pink); }
  else { if (blink) { R(cx - 5, cy + 1, 3, 1, P.ink); R(cx + 2, cy + 1, 3, 1, P.ink); } else { R(cx - 5, cy - 1, 3, 3, P.white); R(cx + 2, cy - 1, 3, 3, P.white); R(cx - 4, cy - 1, 2, 3, P.ink); R(cx + 3, cy - 1, 2, 3, P.ink); } R(cx - 6, cy - 4, 4, 1, P.hair); R(cx + 2, cy - 4, 4, 1, P.hair); if (ex === 'think') { R(cx + 2, cy - 5, 4, 1, P.hair); } }
  if (talk) { R(cx - 2, cy + 5, 4, 2, P.REDD); R(cx - 1, cy + 6, 2, 1, P.pink); } else if (ex === 'surprise') { R(cx - 1, cy + 5, 2, 2, P.REDD); } else R(cx - 2, cy + 5, 4, 1, P.skinD);
}

// ---------- text layer (360×640), thresholded to crisp pixels ----------
function Ttxt(s, x, y, size, col, o = {}) {
  Q.save(); Q.font = `${o.w || 600} ${size}px ${o.font || FONT}`; Q.textAlign = o.al || 'center'; Q.textBaseline = 'middle';
  if (o.max) { let sz = size; while (Q.measureText(s).width > o.max && sz > 8) { sz--; Q.font = `${o.w || 600} ${sz}px ${o.font || FONT}`; } }
  if (o.out) { Q.lineJoin = 'round'; Q.lineWidth = o.out; Q.strokeStyle = o.outC || P.ink; Q.strokeText(s, x, y); }
  if (o.sh !== false) { Q.fillStyle = o.shC || P.ink; Q.fillText(s, x + 1, y + 1); }
  if (o.grad) { const m = Q.measureText(s), g = Q.createLinearGradient(0, y - size / 2, 0, y + size / 2); o.grad.forEach((c, i) => g.addColorStop(i / (o.grad.length - 1), c)); Q.fillStyle = g; } else Q.fillStyle = col;
  Q.fillText(s, x, y); Q.restore();
}
function threshold() { const id = Q.getImageData(0, 0, TW, TH), d = id.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= 110 ? 255 : 0; Q.putImageData(id, 0, 0); }

// ---------- timing ----------
let Z = null; const L = {};
const T0 = id => L[id].t0, T1 = id => L[id].t1;
const KEYW = /^(clue|clew|cliwen|ipucu|ipucuna|İpucu)/i;
function lineWords(l) {
  const ws = l.metin.split(/\s+/); const k = l.kelimeler || [];
  if (k.length === ws.length) return ws.map((w, i) => ({ w, t0: k[i].t0, t1: k[i].t1 }));
  const n = ws.reduce((a, w) => a + w.length + 1, 0); let c = 0;
  return ws.map(w => { const a = l.t0 + (l.t1 - l.t0) * c / n; c += w.length + 1; return { w, t0: a, t1: l.t0 + (l.t1 - l.t0) * c / n }; });
}
function curLine(t) { let cur = null; for (const l of Z.satirlar) if (t >= l.t0 - .05) cur = l; return cur; }

// ---------- dialog ----------
const DB = { x: 4, y: 198, w: 154, h: 56 };
function dialog(t) {
  const l = curLine(t); if (!l) return;
  const en = l.dil === 'en';
  win(DB.x, DB.y, DB.w, DB.h);
  const ws = lineWords(l), talking = ws.some(w => t >= w.t0 && t < w.t1) && Math.floor(t * 12) % 2 === 0;
  const ex = { s01: 'surprise', s02: 'happy', s03: 'think', s04: 'neutral', s05: 'happy', s06: 'neutral', s09: 'happy', s10: 'think', s11: 'happy', s12: 'neutral', s14: 'happy' }[l.id] || 'neutral';
  portrait(DB.x + 5, DB.y + 6, 'deniz', ex, talking);
  // name tag
  const tag = en ? 'ÖRNEK' : 'DENİZ';
  win(DB.x + 4, DB.y - 9, 34, 12); Ttxt(tag, (DB.x + 21) * 2, (DB.y - 3) * 2 + 1, 11, en ? P.gold : P.white, { w: 700 });
  // words layout on text grid
  let size = 14.5; const x0 = (DB.x + 35) * 2, x1 = (DB.x + DB.w - 6) * 2, y0 = (DB.y + 9) * 2;
  let lay;
  for (; size >= 11; size -= .5) {
    Q.font = `600 ${size}px ${FONT}`; const sp = Q.measureText(' ').width; let x = x0, row = 0; lay = [];
    for (const w of ws) { const wd = Q.measureText(w.w).width; if (x + wd > x1 && x > x0) { x = x0; row++; } lay.push({ ...w, x, row, wd }); x += wd + sp; }
    if (row <= 3) break;
  }
  const lh = size * 1.42;
  for (const w of lay) {
    if (t < w.t0 - .02) break;
    const key = KEYW.test(w.w.replace(/[^\wİıçğöşü]/g, '')) || (en && /clue/i.test(w.w));
    const part = t >= w.t1 ? w.w : w.w.slice(0, Math.max(1, Math.ceil(w.w.length * seg(t, w.t0, w.t1))));
    Ttxt(part, w.x, y0 + w.row * lh, size, key ? P.gold : P.white, { al: 'left', sh: true });
  }
  if (t > l.t1 + .1 && Math.floor(t * 3) % 2 === 0) { R(DB.x + DB.w - 10, DB.y + DB.h - 8, 5, 1, P.white); R(DB.x + DB.w - 9, DB.y + DB.h - 7, 3, 1, P.white); px(DB.x + DB.w - 8, DB.y + DB.h - 6, P.white); }
}
// small top window with label(s)
function topWin(a, b, col = P.gold) { win(8, 44, 150, b ? 24 : 15); Ttxt(a, 83 * 2, (b ? 50.5 : 51.5) * 2, 12, col, { w: 700, max: 280 }); if (b) Ttxt(b, 83 * 2, 61 * 2, 10.5, P.white, { w: 500, max: 284 }); }
function itemWin(t, a, title, ico) {
  const k = eo(seg(t, a, a + .3)); if (k <= 0) return; const y = Math.round(lerp(26, 74, k));
  win(22, y, 122, 30); ico(40, y + 15);
  Ttxt(title, 98 * 2, (y + 15) * 2, 13, P.white, { w: 700, max: 168 });
  if (t > a + .35) for (let i = 0; i < 4; i++) { const ph = (t * 3 + i * .25) % 1, sx = 40 + Math.cos(i * 1.6 + t * 2) * (8 + ph * 6), sy = y + 15 + Math.sin(i * 1.6 + t * 2) * (8 + ph * 6); if (ph < .7) { px(sx, sy, P.gold); px(sx + 1, sy, P.white); px(sx - 1, sy, P.white); px(sx, sy - 1, P.white); px(sx, sy + 1, P.white); } }
}

// ---------- environments ----------
function nightRoom(t, dim) {
  vgrad(0, 0, NW, 160, [P.navyD, P.navy, P.d]);
  // window with city + moon
  R(98, 58, 58, 58, P.dbrown); R(101, 61, 52, 52, P.navyD); vgrad(101, 61, 52, 52, [P.navyD, P.navy, P.blue]);
  disc(140, 74, 6, P.cream); disc(143, 72, 5, P.navyD);
  for (let i = 0; i < 9; i++) { const bx = 101 + i * 6, bh = 10 + Math.floor(hash(i + 3) * 22); R(bx, 113 - bh, 5, bh, P.d); for (let j = 0; j < bh - 3; j += 4) if (hash(i * 7 + j) > .45) px(bx + 2, 113 - bh + 2 + j, Math.floor(t * 2 + i) % 7 ? P.candle : P.d); }
  R(126, 61, 2, 52, P.dbrown); R(101, 86, 52, 2, P.dbrown); for (let i = 0; i < 6; i++) px(110 + i * 7, 64 + (i * 5) % 18, P.white);
  // shelf + books
  R(12, 70, 60, 3, P.brown); [P.plum, P.teal, P.gold, P.blue, P.green, P.ochre].forEach((c, i) => R(14 + i * 7, 56 - (i % 2) * 2, 5, 14 + (i % 2) * 2, c));
  disc(64, 62, 5, P.stoneL); R(60, 66, 8, 4, P.brown);
  // floor planks
  dith(0, 150, NW, 170, P.brown, P.dbrown, .25); for (let j = 150; j < 320; j += 9) R(0, j, NW, 1, P.dbrown); for (let j = 0; j < 19; j++) R(((j * 37) % 170), 150 + j * 9, 1, 9, P.dbrown);
  // lamp desk
  R(8, 118, 40, 4, P.brown); R(10, 122, 3, 28, P.dbrown); R(43, 122, 3, 28, P.dbrown); R(30, 104, 2, 14, P.grey); R(24, 98, 14, 7, P.gold); R(24, 104, 14, 1, P.goldD);
  glow(31, 112, 30, P.candle, .32);
  if (dim) { G.fillStyle = P.ink; for (let j = 0; j < NH; j++) for (let i = (j & 1); i < NW; i += 2) G.fillRect(i, j, 1, 1); }
}
function thread(pts, c = P.RED) { for (let i = 0; i < pts.length - 1; i++) line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], c); }
function sea(t, oy = 0) {
  R(0, 0, NW, NH, P.sea);
  for (let j = 0; j < NH; j += 6) for (let i = 0; i < NW; i += 10) { const ph = Math.floor(t * 4 + hash(i * .3 + j) * 4) % 4; if (ph < 2) R(i + (j % 12 ? 0 : 5) + ph, j + oy % 6, 3, 1, ph ? P.seaL : P.seaD); }
}
let MAZE = null;
function buildMaze() {
  const cw = 13, ch = 12, rnd = mulberry(1590), g = []; for (let i = 0; i < cw * ch; i++) g.push({ v: 0, e: 0, s: 0 });
  const st = [[0, ch - 1]]; g[(ch - 1) * cw].v = 1;
  while (st.length) { const [x, y] = st[st.length - 1]; const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [x + a, y + b]).filter(([a, b]) => a >= 0 && b >= 0 && a < cw && b < ch && !g[b * cw + a].v);
    if (!n.length) { st.pop(); continue; } const [a, b] = n[Math.floor(rnd() * n.length)];
    if (a > x) g[y * cw + x].e = 1; if (a < x) g[b * cw + a].e = 1; if (b > y) g[y * cw + x].s = 1; if (b < y) g[b * cw + a].s = 1; g[b * cw + a].v = 1; st.push([a, b]); }
  // BFS path from (0,ch-1) to (cw-1,0)
  const prev = new Map(), q = [[0, ch - 1]]; prev.set(`0,${ch - 1}`, null);
  const open = (x, y, a, b) => a > x ? g[y * cw + x].e : a < x ? g[b * cw + a].e : b > y ? g[y * cw + x].s : g[b * cw + a].s;
  while (q.length) { const [x, y] = q.shift(); if (x === cw - 1 && y === 0) break; for (const [a, b] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) { if (a < 0 || b < 0 || a >= cw || b >= ch || prev.has(`${a},${b}`) || !open(x, y, a, b)) continue; prev.set(`${a},${b}`, [x, y]); q.push([a, b]); } }
  const path = []; let c = [cw - 1, 0]; while (c) { path.unshift(c); c = prev.get(`${c[0]},${c[1]}`); }
  MAZE = { cw, ch, g, path };
}
function maze(t, prog, ox = 12, oy = 50, cs = 12) {
  const { cw, ch, g, path } = MAZE;
  dith(0, 0, NW, NH, P.stoneD, P.dgrey, .3);
  R(ox - 2, oy - 2, cw * cs + 3, ch * cs + 3, P.stone);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const X0 = ox + x * cs, Y0 = oy + y * cs; dith(X0, Y0, cs - 1, cs - 1, P.sand, P.sandD, .18);
    const c = g[y * cw + x]; if (c.e && x < cw - 1) R(X0 + cs - 1, Y0, 1, cs - 1, P.sand); if (c.s && y < ch - 1) R(X0, Y0 + cs - 1, cs - 1, 1, P.sand);
    if (!c.e || x === cw - 1) { R(X0 + cs - 2, Y0 - 1, 3, cs + 1, P.stone); R(X0 + cs - 2, Y0 - 1, 1, cs + 1, P.stoneL); }
    if (!c.s || y === ch - 1) { R(X0 - 1, Y0 + cs - 2, cs + 1, 3, P.stone); R(X0 - 1, Y0 + cs - 2, cs + 1, 1, P.stoneL); }
  }
  // entrance + exit gaps
  R(ox - 2, oy + (ch - 1) * cs, 3, cs - 1, P.sand); R(ox + cw * cs - 2, oy, 4, cs - 1, P.sand);
  glow(ox + cw * cs + 2, oy + 5, 16 + Math.floor(t * 4) % 2, P.candle, .55);
  // thread along path
  const pts = [[ox - 6, oy + (ch - 1) * cs + 5]].concat(path.map(([x, y]) => [ox + x * cs + 5, oy + y * cs + 5]));
  const n = pts.length - 1, f = prog * n, k = Math.floor(f), r = f - k;
  const vis = pts.slice(0, k + 1); if (k < n) vis.push([lerp(pts[k][0], pts[k + 1][0], r), lerp(pts[k][1], pts[k + 1][1], r)]);
  thread(vis); const hd = vis[vis.length - 1];
  return hd;
}
function study(t) { // 1590'lar çalışma odası
  vgrad(0, 0, NW, 200, [P.dbrown, P.brown, P.dbrown]);
  for (let i = 0; i < 6; i++) { R(4 + i * 30, 70, 26, 70, P.brown); R(6 + i * 30, 72, 22, 66, P.tanD); R(8 + i * 30, 74, 18, 62, P.brown); }
  // lattice window
  R(104, 50, 56, 50, P.dbrown); vgrad(107, 53, 50, 44, [P.sky, P.pale]);
  for (let i = -50; i < 60; i += 8) { line(107 + i, 53, 107 + i + 44, 97, P.dbrown); line(157 - i, 53, 157 - i - 44, 97, P.dbrown); }
  R(104, 50, 56, 3, P.dbrown); R(104, 97, 56, 3, P.dbrown); R(104, 50, 3, 50, P.dbrown); R(157, 50, 3, 50, P.dbrown);
  // floor
  dith(0, 160, NW, 160, P.brown, P.dbrown, .4);
  // desk + book + candle
  R(86, 140, 86, 6, P.tanD); R(88, 146, 4, 40, P.dbrown); R(164, 146, 4, 40, P.dbrown);
  R(98, 128, 56, 12, P.cream); R(126, 128, 1, 12, P.sandD); R(98, 139, 56, 2, P.tanD);
  for (let i = 0; i < 4; i++) { R(101, 131 + i * 2, 20, 1, P.stoneD); }
  R(150, 120, 4, 20, P.cream); R(149, 139, 6, 2, P.goldD); const fl = Math.floor(t * 12) % 3; R(151, 116 - fl % 2, 2, 4, P.candle); px(151 + (fl === 2 ? 1 : 0), 115, P.white);
  glow(152, 118, 34, P.candle, .4);
  // red ribbon bookmark (protected): the thread continues
  R(127, 126, 1, 18, P.RED); R(126, 143, 3, 2, P.RED);
}
function hall(t) { // modern koridor + kapı
  vgrad(0, 0, NW, 180, [P.d, P.navy]);
  for (let i = 0; i < NW; i += 12) for (let j = 46; j < 170; j += 12) px(i + ((j / 12) % 2) * 6, j, P.blue);
  R(0, 170, NW, 2, P.dbrown); dith(0, 172, NW, 150, P.tanD, P.brown, .3);
  // door with panels, bevels, knob
  R(84, 74, 62, 98, P.dbrown); R(87, 77, 56, 95, P.tan); R(87, 77, 2, 95, P.cream);
  for (const [x, y, w, h] of [[92, 82, 20, 30], [118, 82, 20, 30], [92, 118, 20, 46], [118, 118, 20, 46]]) { R(x, y, w, h, P.tanD); R(x + 1, y + 1, w - 2, h - 2, P.tan); R(x + 1, y + 1, w - 2, 1, P.cream); }
  disc(140, 124, 2, P.gold); px(139, 123, P.white);
  // light under the door
  R(87, 170, 56, 2, P.candle); glow(115, 173, 22, P.candle, .45);
  // plant + picture
  R(20, 66, 30, 24, P.gold); R(22, 68, 26, 20, P.sky); R(22, 80, 26, 8, P.green); disc(36, 76, 3, P.white);
  R(26, 150, 14, 20, P.ochre); R(25, 150, 16, 3, P.orange); [[-6, -10], [0, -16], [6, -11], [-3, -6], [4, -5]].forEach(([a, b]) => disc(33 + a, 150 + b, 4, P.green)); disc(36, 136, 3, P.lgreen);
}

// ---------- scenes ----------
let SC = [];
function buildScenes() {
  const a = id => T0(id) - .2;
  SC = [['A', 0], ['B', a('s02')], ['C', a('s03')], ['D', a('s04')], ['E', a('s05')], ['F', a('s06')], ['G', a('s09')], ['H', a('s10')], ['I', a('s11')], ['J', a('s12')], ['K', a('s14')]];
  SC.forEach((s, i) => s.push(i < SC.length - 1 ? SC[i + 1][1] : Z.dur + 1));
}
function sceneAt(t) { for (const s of SC) if (t >= s[1] && t < s[2]) return s; return SC[SC.length - 1]; }
let LUT = 0, SHAKE = 0;
function drawScene(id, t, lt, ld) {
  LUT = 0; SHAKE = 0;
  if (id === 'A') {
    nightRoom(t, false);
    // thread from right edge to magnifier spot
    thread([[180, 190], [150, 191], [128, 188], [104, 191], [94, 190]]);
    fig(70, 194, { kneel: 1, top: P.tan, topD: P.tanD, bot: P.navyD, hat: 'beanie', hatC: P.teal, hatD: P.tealD, scarf: P.teal, scarfD: P.tealD, armOut: 1, prop: 'mag', seed: 1, coatLine: P.tanD });
    emote(74, 128, lt < 2.6 ? '!' : '?', lt > .15);
    itemWin(t, SC[0][1] + 1.3, lt < 2.8 ? 'İPUCU bulundu!' : 'İplik yumağı?!', (x, y) => { if (lt < 2.8) { ring(x, y - 1, 5, P.silver); disc(x, y - 1, 4, P.pale); R(x - 6, y + 4, 3, 3, P.brown); } else yarn(x, y, 7, t * 2); });
    return 'top:KELİMELERİN TARİHÇESİ';
  }
  if (id === 'B') {
    nightRoom(t, true);
    win(8, 72, 78, 92); Ttxt('ÇANTA', 47 * 2, 80 * 2, 11, P.gold, { w: 700 });
    const items = ['Büyüteç', 'Defter', 'Fener', 'CLUE'], sel = Math.min(3, Math.floor(seg(lt, .4, 1.6) * 3.99));
    items.forEach((s, i) => Ttxt(s, 30 * 2, (94 + i * 17) * 2, 13, i === 3 ? P.gold : P.white, { al: 'left', w: i === 3 ? 700 : 600 }));
    const hy = 94 + sel * 17, bob = Math.floor(t * 4) % 2; // hand cursor
    R(14 + bob, hy - 2, 8, 4, P.white); R(20 + bob, hy - 3, 3, 6, P.white); R(14 + bob, hy - 2, 8, 1, P.silver); R(13 + bob, hy - 3, 1, 6, P.ink);
    // big yarn icon
    win(92, 72, 66, 92); yarn(125, 112, 18, t * 1.5); thread([[140, 124], [148, 136], [140, 148], [150, 156]]);
    if (sel === 3) { win(8, 168, 150, 28, 'paper');
      Ttxt('Eski İngilizce: cliwen › clew', 83 * 2, 176 * 2, 12.5, P.dbrown, { sh: false, w: 700, max: 280 });
      Ttxt('= iplik yumağı', 83 * 2, 187 * 2, 12.5, P.REDD, { sh: false, w: 700 }); }
    return 'top:ÖZELLİK';
  }
  if (id === 'C') {
    const pan = Math.round(lerp(40, 0, eo(seg(lt, 0, 2.2))));
    sea(t, pan);
    G.save(); G.translate(0, pan);
    // Crete: long island blob
    for (let j = -30; j <= 30; j++) { const w = Math.round((76 - Math.abs(j) * 1.4) * (1 + .12 * Math.sin(j * .4))); R(90 - w, 128 + j, w * 2, 1, P.sand); }
    for (let j = -27; j <= 27; j++) { const w = Math.round((72 - Math.abs(j) * 1.45) * (1 + .12 * Math.sin(j * .4))); dith(90 - w, 128 + j, w * 2, 1, P.green, P.dgreen, .2); }
    for (const [mx, mh] of [[46, 16], [62, 12], [118, 18], [134, 13]]) { for (let k = 0; k < mh; k++) R(mx - k, 120 - mh + k, k * 2 + 1, 1, k < 4 ? P.white : P.grey); }
    // labyrinth icon
    R(76, 116, 28, 24, P.ink); for (let k = 0; k < 4; k++) { R(78 + k * 3, 118 + k * 3, 24 - k * 6, 20 - k * 6, k % 2 ? P.sand : P.stone); } R(89, 131, 3, 8, P.sand); px(90, 128, P.RED);
    // ship
    const sx = Math.round(20 + lt * 6); R(sx, 176, 18, 4, P.brown); R(sx + 2, 180, 14, 1, P.dbrown); R(sx + 8, 160, 1, 16, P.dbrown); R(sx + 3, 162, 10, 11, P.white); R(sx + 3, 166, 10, 2, P.blue);
    G.restore();
    if (lt > .6) { win(104, 150, 50, 13); Ttxt('LABİRENT', 129 * 2, 156.5 * 2, 10, P.gold, { w: 700 }); line(108, 150, 100, 141, P.white); }
    return 'top:EFSANEYE GÖRE · GİRİT';
  }
  if (id === 'D') {
    const camY = Math.round(lerp(-150, 0, ss(seg(lt, .1, 2.4))));
    SHAKE = lt > 2.4 && lt < 2.75 ? [3, 3, 2, 2, 1, 1, 0, 0][Math.floor((lt - 2.4) * 24) % 8] : 0;
    G.save(); G.translate(0, -camY);
    vgrad(0, -160, NW, 300, [P.plumD, P.plum, P.orange, P.gold]);
    // gate: massive stone wall with tall doorway
    for (let j = -150; j < 196; j += 8) for (let i = (j / 8 & 1) * 8 - 8; i < NW; i += 16) { R(i, j, 15, 7, P.stone); R(i, j, 15, 1, P.stoneL); R(i + 14, j, 1, 7, P.stoneD); }
    R(62, -40, 56, 236, P.ink); for (let k = 0; k < 28; k++) { const w = Math.round(Math.sqrt(784 - k * k)); R(90 - w, -40 - 28 + k, w * 2, 1, P.ink); }
    R(58, -72, 64, 6, P.stoneL); R(58, -66, 64, 2, P.stoneD);
    for (let i = 0; i < 5; i++) { ring(70 + i * 10, -100, 3, P.stoneD); px(70 + i * 10, -100, P.stoneD); }
    dith(64, -36, 52, 230, P.ink, P.d, .25);
    R(0, 196, NW, 130, P.stoneD); dith(0, 196, NW, 130, P.stoneD, P.dgrey, .3); R(0, 196, NW, 2, P.stoneL);
    G.restore();
    G.save(); G.translate(0, -camY);
    fig(36, 196, { face: 1, top: P.white, topD: P.silver, bot: P.skin, leg: P.skin, belt: P.blue, cape: P.blue, capeD: P.navy, curly: 1, skirt: 1, seed: 2 });
    G.restore();
    return 'top:EFSANEYE GÖRE · GİRİT';
  }
  if (id === 'E') {
    vgrad(0, 0, NW, 130, [P.sky, P.pale]); R(0, 112, NW, 18, P.seaL); for (let i = 0; i < NW; i += 9) px(i + Math.floor(t * 3) % 9, 118 + (i % 3), P.white);
    R(0, 130, NW, 190, P.sand); for (let j = 130; j < 320; j += 10) for (let i = (j / 10 % 2) * 10; i < NW; i += 20) R(i, j, 10, 10, P.sandD);
    for (const cx of [14, 164]) { R(cx - 10, 50, 20, 6, P.ink); R(cx - 9, 51, 18, 4, P.ochre); for (let j = 56; j < 140; j++) { const w = Math.round(lerp(6, 4, (j - 56) / 84)); R(cx - w, j, w * 2, 1, j % 12 ? P.ochre : P.goldD); } R(cx - 8, 138, 16, 4, P.ink); }
    R(0, 44, NW, 6, P.ink); R(0, 45, NW, 4, P.plum); for (let i = 0; i < NW; i += 8) R(i, 46, 4, 2, P.gold);
    const throwK = seg(lt, 1.3, 1.9), caught = lt >= 1.9;
    fig(44, 192, { face: 1, dress: 1, top: P.plum, topD: P.plumD, hem: P.gold, long: 1, band: P.gold, hair: P.ink, hairL: P.hair, armUp: lt > .6 && lt < 1.3, armOut: lt >= 1.3, prop: lt < 1.3 ? 'ball' : null, smile: 1, seed: 3 });
    const hop = caught && lt < 2.3 ? -Math.round(Math.sin(seg(lt, 1.9, 2.3) * Math.PI) * 4) : 0;
    fig(134, 192 + hop, { face: -1, top: P.white, topD: P.silver, bot: P.skin, leg: P.skin, belt: P.blue, cape: P.blue, capeD: P.navy, curly: 1, skirt: 1, armOut: caught, prop: caught ? 'ball' : null, seed: 2 });
    if (throwK > 0 && throwK < 1) { const bx = lerp(62, 118, throwK), by = lerp(140, 170, throwK) - Math.sin(throwK * Math.PI) * 26; yarn(bx, by, 4, t * 8); }
    if (lt > .4 && lt < 1.4) emote(50, 128, '♪', 1);
    itemWin(t, SC[4][1] + 2.0, 'KIRMIZI YUMAK!', (x, y) => yarn(x, y, 7, t * 2));
    return 'top:SARAY · GİRİT';
  }
  if (id === 'F') {
    const walkT = Math.max(0, lt - 1.4), hx = 52 + walkT * 16, cam = Math.round(Math.max(0, hx - 70));
    vgrad(0, 0, NW, 196, [P.dgrey, P.stoneD]);
    G.save(); G.translate(-Math.round(cam * .5), 0); for (let j = 44; j < 196; j += 10) for (let i = (j / 10 & 1) * 10 - 20; i < 400; i += 20) { R(i, j, 19, 9, P.stoneD); R(i, j, 19, 1, P.stone); }
    G.restore();
    G.save(); G.translate(-cam, 0);
    for (let k = 0; k < 4; k++) { const tx = 70 + k * 70, fl = Math.floor(t * 12 + k) % 3; R(tx, 112, 3, 12, P.brown); R(tx - 1, 108 - fl % 2, 5, 4, P.orange); R(tx, 105 - fl % 2, 3, 3, P.candle); glow(tx + 1, 110, 18, P.candle, .35); }
    R(-20, 196, 500, 124, P.stoneD); dith(-20, 196, 500, 124, P.stoneD, P.dgrey, .3); R(-20, 196, 500, 2, P.stone);
    // entrance door (left)
    R(4, 104, 30, 92, P.ink); R(6, 106, 26, 90, P.brown); for (let j = 112; j < 196; j += 12) R(6, j, 26, 1, P.dbrown); R(6, 106, 26, 2, P.tan); R(29, 150, 2, 6, P.gold); R(32, 150, 4, 3, P.goldD);
    // thread knot at door ring → hero hand
    const kn = [33, 172], hand = lt < 1.4 ? [35, 178] : [hx + 20, 168];
    thread(lt < 1.4 ? [kn, hand] : [kn, [38, 195], [hx - 6, 195], [hx + 12, 182], hand]);
    if (lt < 1.4) fig(53, 196, { face: -1, kneel: 1, top: P.white, topD: P.silver, bot: P.skin, leg: P.skin, belt: P.blue, cape: P.blue, capeD: P.navy, curly: 1, skirt: 1, armOut: 1, seed: 2 });
    else fig(hx, 196, { face: 1, walk: walkT, top: P.white, topD: P.silver, bot: P.skin, leg: P.skin, belt: P.blue, cape: P.blue, capeD: P.navy, curly: 1, skirt: 1, armOut: 1, prop: 'ball', seed: 2 });
    G.restore();
    return 'top:LABİRENTİN İÇİ';
  }
  if (id === 'G') {
    const hd = maze(t, ss(seg(lt, .2, ld - .9)));
    topHero(hd[0], hd[1]);
    const done = lt > ld - .9; if (done) { win(118, 22 + 26, 40, 14); Ttxt('ÇIKIŞ!', 138 * 2, 55 * 2, 12, P.gold, { w: 700 }); }
    return done ? '' : '';
  }
  if (id === 'H') {
    study(t);
    LUT = Math.min(2, Math.floor(seg(lt, 0, .5) * 3)); // palette steps: full → 8 → 5 tones
    fig(58, 194, { face: 1, top: P.ink, topD: P.d, bot: P.ink, ruff: 1, hair: P.hairL, beard: 1, armOut: 1, prop: 'quill', seed: 5 });
    return 'top:1590\'LAR · İNGİLTERE';
  }
  if (id === 'I') {
    const fk = seg(lt, 1.6, 2.6); // colour flood back
    hall(t); LUT = fk >= 1 ? 0 : 3; FLOOD = fk;
    fig(40, 196, { face: 1, top: P.tan, topD: P.tanD, bot: P.navyD, hat: 'beanie', hatC: P.teal, hatD: P.tealD, scarf: P.teal, scarfD: P.tealD, armUp: lt > 2.6, smile: 1, seed: 1, coatLine: P.tanD });
    return 'top:YAZIM DEĞİŞİYOR';
  }
  if (id === 'J') {
    hall(t);
    thread([[114, 171], [108, 176], [100, 180]]);
    fig(76, 198, { face: 1, kneel: 1, top: P.tan, topD: P.tanD, bot: P.navyD, hat: 'beanie', hatC: P.teal, hatD: P.tealD, scarf: P.teal, scarfD: P.tealD, armOut: 1, prop: 'mag', seed: 1, coatLine: P.tanD });
    emote(80, 132, '!', lt > .4);
    itemWin(t, SC[9][1] + 1.0, 'a CLUE!', (x, y) => { ring(x, y - 1, 5, P.silver); disc(x, y - 1, 4, P.pale); R(x - 6, y + 4, 3, 3, P.brown); line(x - 2, y, x + 3, y - 2, P.RED); });
    return 'top:Dedektif kapının altında bir ipucu buldu.';
  }
  if (id === 'K') {
    vgrad(0, 0, NW, NH, [P.navyD, P.navy, P.blue]);
    for (let i = 0; i < 30; i++) { const sx = Math.floor(hash(i) * 180), sy = 44 + Math.floor(hash(i + 9) * 100); if ((Math.floor(t * 4) + i) % 5) px(sx, sy, P.white); }
    R(0, 170, NW, 26, P.dgreen); dith(0, 170, NW, 26, P.dgreen, P.green, .25); R(0, 196, NW, 124, P.dbrown);
    thread([[0, 192], [40, 194], [80, 191], [120, 194], [180, 192]]);
    const w = lt * 10;
    fig(22, 194, { face: 1, top: P.white, topD: P.silver, bot: P.skin, leg: P.skin, belt: P.blue, cape: P.blue, capeD: P.navy, curly: 1, skirt: 1, walk: w, seed: 2 });
    fig(64, 194, { face: 1, dress: 1, top: P.plum, topD: P.plumD, hem: P.gold, long: 1, band: P.gold, hair: P.ink, hairL: P.hair, smile: 1, seed: 3 });
    fig(104, 194, { face: -1, top: P.ink, topD: P.d, bot: P.ink, ruff: 1, hair: P.hairL, beard: 1, seed: 5 });
    fig(146, 194, { face: -1, top: P.tan, topD: P.tanD, bot: P.navyD, hat: 'beanie', hatC: P.teal, hatD: P.tealD, scarf: P.teal, scarfD: P.tealD, armUp: Math.floor(t * 2) % 2, smile: 1, seed: 1, coatLine: P.tanD });
    win(10, 52, 146, 84);
    return '';
  }
}
let FLOOD = 0;
// ---------- post: era LUT + mosaic + flood ----------
const SEPIA = ['#2a1c14', '#5a3f2a', '#8f6a45', '#c9a578', '#efe0b8'];
const SEP8 = ['#1b1528', '#3a2a22', '#5a3f2a', '#7a5a3c', '#9a7a52', '#c9a578', '#e2c890', '#f4efe3'];
const hexrgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const SEPr = SEPIA.map(hexrgb), SEP8r = SEP8.map(hexrgb), REDr = hexrgb(P.RED), REDDr = hexrgb(P.REDD), PINKr = hexrgb(P.pink);
function post(mos) {
  if (!LUT && mos <= 1) return;
  const id = G.getImageData(0, 0, NW, NH), d = id.data;
  if (LUT) {
    for (let j = 0; j < NH; j++) for (let i = 0; i < NW; i++) {
      const k = (j * NW + i) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
      if ((r === REDr[0] && g === REDr[1] && b === REDr[2]) || (r === REDDr[0] && g === REDDr[1] && b === REDDr[2]) || (r === PINKr[0] && g === PINKr[1])) continue; // protected
      if (LUT === 3 && bay(i, j) < FLOOD * 1.15 - (NH - j) / NH * .15) continue; // flood back
      const lum = Math.pow((.3 * r + .59 * g + .11 * b) / 255, .8), tb = LUT === 1 ? SEP8r : SEPr, c = tb[Math.min(tb.length - 1, Math.floor(lum * tb.length))];
      d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2];
    }
  }
  if (mos > 1) for (let j = 0; j < NH; j += mos) for (let i = 0; i < NW; i += mos) { const k0 = (j * NW + i) * 4; for (let v = 0; v < mos && j + v < NH; v++) for (let u = 0; u < mos && i + u < NW; u++) { const k = ((j + v) * NW + i + u) * 4; d[k] = d[k0]; d[k + 1] = d[k0 + 1]; d[k + 2] = d[k0 + 2]; } }
  G.putImageData(id, 0, 0);
}

// ---------- text overlays per scene (on text grid) ----------
function overlays(id, t, lt, ld) {
  if (id === 'A') {
    const k = eo(seg(lt, 0, .35));
    Ttxt('CLUE', 180, lerp(150, 196, k), 58, P.gold, { font: TITLE, w: 400, out: 6, grad: [P.cream, P.gold, P.orange] });
  }
  if (id === 'H') {
    const k = seg(lt, .5, 1.6), s = 'clew';
    Ttxt(s.slice(0, Math.ceil(k * 4)), 252, 266, 15, '#2a1c14', { sh: false, w: 700, font: "'IM Fell English', serif" });
    if (lt > 2.2) { win(84, 92, 74, 24, 'paper'); Ttxt('clew =', 242, 196, 12, '#5a3f2a', { sh: false, w: 700 }); Ttxt('yol gösteren şey', 242, 220, 11.5, '#2a1c14', { sh: false, w: 700, max: 136 }); }
  }
  if (id === 'I') {
    const m = seg(lt, .5, 1.4), word = m < .5 ? 'CLEW' : 'CLUE';
    Ttxt(word, 180, 230, 66, P.gold, { font: TITLE, w: 400, out: 6, grad: [P.cream, P.gold, P.orange] });
    if (m > 0 && m < 1) { const s = Math.sin(m * Math.PI); G.fillStyle = P.ink; for (let k = 0; k < 40 * s; k++) px(118 + Math.floor(hash(k + Math.floor(t * 12)) * 30), 104 + Math.floor(hash(k * 3 + 1) * 24), P.white); }
    if (lt > 1.6) Ttxt('= ipucu', 180, 292, 26, P.white, { w: 700, out: 5 });
  }
  if (id === 'K') {
    Ttxt('KAYIT YAPILDI', 166, 124, 15, P.gold, { w: 700 });
    Ttxt('1  CLUE', 44, 156, 15, P.white, { al: 'left', w: 700 }); Ttxt('iplik yumağı › ipucu  ✓', 44, 178, 12, P.cream, { al: 'left' });
    Ttxt('2  Yeni kelime…', 44, 204, 13, P.silver, { al: 'left' });
    const k = eo(seg(lt, .3, .8));
    Ttxt('ingilizcecim.com', 166, lerp(262, 244, k), 26, P.gold, { font: TITLE, w: 400, out: 5, grad: [P.cream, P.gold, P.orange] });
  }
}
function cover() {
  Q.clearRect(0, 0, TW, TH);
  win(16, 52, 134, 58);
  Ttxt('KELİMELERİN TARİHÇESİ', 166, 126, 14, P.white, { w: 700, max: 240 });
  Ttxt('Clue', 166, 172, 60, P.gold, { font: TITLE, w: 400, out: 7, grad: [P.cream, P.gold, P.orange] });
  Ttxt('iplik yumağından ipucuna', 166, 204, 12.5, P.cream, { w: 600 });
}

// ---------- render ----------
window.render = (t) => {
  T = t; Q.clearRect(0, 0, TW, TH); G.clearRect(0, 0, NW, NH);
  const sc = KAPAK ? SC.find(s => s[0] === 'E') : sceneAt(t);
  if (KAPAK) t = T = sc[1] + 1.75;
  const lt = t - sc[1], ld = sc[2] - sc[1];
  const tag = drawScene(sc[0], t, lt, ld);
  // mosaic around cuts
  let mos = 1; if (!KAPAK) for (const s of SC) { const dt = Math.abs(t - s[1]); if (s[1] > 0 && dt < .22) mos = Math.max(mos, 1 + Math.round(7 * (1 - dt / .22))); }
  post(mos);
  if (KAPAK) { cover(); }
  else {
    if (tag && tag.startsWith('top:') && tag.length > 4) { const s = tag.slice(4); if (sc[0] === 'J') topWin('ÖRNEK CÜMLE', s); else topWin(s); }
    dialog(t);
    overlays(sc[0], t, lt, ld);
  }
  threshold();
  X.imageSmoothingEnabled = false; X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  X.save(); if (SHAKE) X.translate(0, SHAKE * 6 * ((Math.floor(t * 24) % 2) ? 1 : -1));
  X.drawImage(S, 0, 0, NW * 6, NH * 6); X.restore();
  X.drawImage(Tc, 0, 0, TW * 3, TH * 3);
};

(async () => {
  Z = await (await fetch('ses/zaman.json')).json();
  Z.satirlar.forEach(l => { L[l.id] = l; const k = l.kelimeler || []; if (k.length) { const a = k[0].t0, b = k[k.length - 1].t1, f = (l.t1 - l.t0) / Math.max(.01, b - a); k.forEach(w => { w.t0 = l.t0 + (w.t0 - a) * f; w.t1 = l.t0 + (w.t1 - a) * f; }); } });
  await document.fonts.load(`600 20px Fredoka`, 'ğşİıçüöÜÇŞĞ'); await document.fonts.load(`700 20px Fredoka`, 'ğşİıçüöÜÇŞĞ'); await document.fonts.load(`20px 'Lilita One'`, 'ÇĞİÖŞÜ'); await document.fonts.load(`20px 'IM Fell English'`, 'clew'); await document.fonts.ready;
  buildMaze(); buildScenes();
  window.DUR = Z.dur;
  const e = [], s = id => T0(id);
  for (const sc of SC.slice(1)) e.push({ t: sc[1] - .05, type: 'whoosh' });
  e.push({ t: SC[0][1] + 1.3, type: 'ding' }, { t: s('s02') + .2, type: 'pop' }, { t: s('s02') + .6, type: 'pop' }, { t: s('s02') + 1.0, type: 'pop' }, { t: s('s02') + 1.4, type: 'ding' });
  e.push({ t: SC[3][1] + 2.4, type: 'thump' }, { t: SC[4][1] + 1.3, type: 'pop' }, { t: SC[4][1] + 2.0, type: 'ding' }, { t: SC[5][1] + .6, type: 'click' }, { t: SC[5][1] + 1.0, type: 'click' });
  e.push({ t: SC[6][2] - .9, type: 'ding' }, { t: SC[7][1] + .2, type: 'click' }, { t: SC[8][1] + .9, type: 'pop' }, { t: SC[8][1] + 1.6, type: 'ding' }, { t: SC[9][1] + 1.0, type: 'ding' }, { t: SC[10][1] + .4, type: 'ding' });
  window.EV = e.filter(x => x.t > 0 && x.t < Z.dur).sort((a, b) => a.t - b.t);
  window.READY = true;
})();
