// Kelimelerin Tarihçesi: Panic — crayon-book (ingilizcecim.com, 2026-11-27)
// Motor: gl.js / crayon.js / rig.js (lemo-opuscar crayon-book demosu, MIT). Hikâye, karakterler, sahneler: bizim.
// Zamanlama ses/zaman.json'dan okunur (Gemini 'Kore' satırları). Sahne i dünyada x = i*1400'de durur, kamera aralarında kayar.
import { makeComp } from './gl.js';
import { layer, clear, line, fill, dab, text, handCircle, ellipse, smooth, CAM, BOIL, W, H, sx, sy } from './crayon.js';
import { group, clearGroup, part, tube, curve } from './rig.js';
import { clamp, lerp, hash, eio, eo, back } from '/core/lib.js';

const Q = new URLSearchParams(location.search);
const KAPAK = Q.get('kapak') === '1';
const comp = makeComp(document.getElementById('gl'));
window.DUR = 1;
await Promise.all(['400 56px "Patrick Hand"'].flatMap(f => [document.fonts.load(f, 'ğüşıöçİĞŞ'), document.fonts.load(f, 'Aa Bb 1600 ?!')]));
const Z = await (await fetch('ses/zaman.json')).json();
window.DUR = Z.dur;
const LN = {}; Z.satirlar.forEach(s => LN[s.id] = s);
const T0 = id => LN[id] ? LN[id].t0 : 0, T1 = id => LN[id] ? LN[id].t1 : 0;
const pr = (t, a, b) => clamp((t - a) / (b - a));

// —— kutu: 12 boya + 1 suluboya ——
const K = { ink: '#3b2b52', red: '#c8423a', ochre: '#e2b25a', terra: '#d9764a', olive: '#7d9a4a', sky: '#86b6dc', peach: '#f3c6a2',
  brown: '#7a4b31', pink: '#ee8ea4', gold: '#f2c23a', white: '#fbfaf4', violet: '#6a5aa6', stone: '#cdbfa6' };
const WASH_GOLD = [0.95, 0.74, 0.36];

// —— sahneler: ilk satırı ——
const SC = [
  { ad: 'sinav', s: 's01' }, { ad: 'arkadya', s: 's03' }, { ad: 'pan', s: 's04' }, { ad: 'surusu', s: 's05' },
  { ad: 'kelime', s: 's07' }, { ad: 'yolculuk', s: 's09' }, { ad: 'ornek', s: 's10' }, { ad: 'son', s: 's11' }, { ad: 'kart', s: 's12' },
];
SC.forEach((c, i) => { c.t = i === 0 ? 0 : T0(c.s) - 0.5; c.ox = i * 1400; });
const PAN = 0.001;
const BOIL_BG = 0;
function sceneAt(t) { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k].t) i = k; return i; }

// —— olaylar (efektler) ——
const EV = []; const ev = (t, type) => EV.push({ t: +Math.max(0, t).toFixed(3), type });
SC.forEach((c, i) => { if (i) ev(c.t, 'whoosh'); });
ev(0.15, 'click'); ev(T0('s01') + 2.6, 'pop'); ev(T0('s03') + 0.8, 'click'); ev(T0('s04') + 1.0, 'pop');
ev(T0('s05') + 0.3, 'thump'); ev(T0('s05') + 1.8, 'pop'); ev(T0('s06') + 0.3, 'whoosh');
ev(T0('s07') + 0.6, 'click'); ev(T0('s08') + 0.8, 'ding'); ev(T0('s09') + 0.5, 'click'); ev(T1('s09') - 0.3, 'ding');
ev(T0('s10') + 0.3, 'click'); ev(T0('s11') + 0.8, 'pop'); ev(T0('s11') + 2.6, 'ding'); ev(T0('s12'), 'pop');
window.EV = EV;

// —— katmanlar ——
const BG = group(), CH = group(), FR = group();
const WASH = layer(), FX = layer(), SUBK = layer(), SUBT = layer();

// —— yerel (sahne) koordinatları → dünya ——
let OFF = 0;
const o = pts => pts.map(([x, y]) => [x + OFF, y]);
const Ln = (L, pts, op = {}) => line(L, o(pts), { col: K.ink, ...op });
const Fl = (L, pts, op = {}) => fill(L, o(pts), op);
const cl = p => (p.length > 2 && (p[0][0] !== p[p.length - 1][0] || p[0][1] !== p[p.length - 1][1])) ? [...p, p[0]] : p;
const Pt = (C, pts, fo, lo, op) => part(C, o(cl(pts)), fo, lo, op);
const Db = (L, x, y, r, op) => dab(L, x + OFF, y, r, op);
const Tx = (L, s, x, y, op = {}) => text(L, s, sx(x + OFF), sy(y), { col: K.ink, ...op, size: (op.size || 56) * CAM.s });
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const F = (col, seed, extra = {}) => ({ col, p: 0.7, gap: 10, w: 11, ang: 0.6, seed, ...extra });
const LO = (seed, extra = {}) => ({ w: 7, seed, col: K.ink, ...extra });

// ———————————— karakter: Lucius / Elif ————————————
// ayak ortası (x,y), s ölçek; o: tunic, toga (0–1 boyanma), expr, arm (down|wave|point|rub|write|hold), hair (curly|long), step, seed, flip, look
function person(C, x, y, s, op) {
  const bAmp = BOIL.amp; BOIL.amp = 0.45;
  const sd = op.seed || 300, k = op.flip ? -1 : 1, t = op.t || 0;
  const q = pts => pts.map(([a, b]) => [x + a * s * k, y + b * s]);
  const P = (pts, fo, lo, opt) => Pt(C, q(pts), fo, lo, opt);
  const L = (pts, lo) => Ln(C.l, q(pts), lo);
  const step = op.step || 0;
  const sh = op.sit ? 0 : 1;
  // arka kol
  const backHand = op.arm === 'hold' ? [-70, -300] : [-86, -205 + 6 * Math.sin(step * 3)];
  P(tube([[-62, -350], [-84, -285], backHand], 30 * 1, 26), F(K.peach, sd + 1, { p: 0.5 }), LO(sd + 2, { w: 6 }));
  // bacaklar
  if (sh) {
    [-1, 1].forEach((d, i) => {
      const sw = 14 * Math.sin(step + i * Math.PI);
      P(tube([[d * 26, -130], [d * 26 + sw, -60], [d * 28 + sw * 1.4, -8]], 32, 28), F(K.peach, sd + 3 + i, { p: 0.5 }), LO(sd + 5 + i, { w: 6 }));
      P(ellipse(d * 34 + sw * 1.4, -4, 30, 13, 18), F(K.brown, sd + 7 + i, { p: 0.9, gap: 5, w: 6 }), LO(sd + 9 + i, { w: 5 }));
    });
  }
  // tunik
  const tun = smooth([[-66, -372], [0, -380], [66, -372], [82, -250], [94, -118], [0, -108], [-94, -118], [-82, -250]], 4);
  P(tun, F(op.tunic || K.terra, sd + 11, { ang: 0.35 }), LO(sd + 12));
  L([[-90, -128], [-30, -122], [30, -122], [90, -128]], LO(sd + 13, { w: 4, col: K.brown, p: 0.7 }));
  // toga (beyaz mum boya; suluboya geçene dek neredeyse görünmez)
  if (op.toga > 0) {
    const tg = smooth([[-76, -376], [-24, -388], [34, -346], [80, -258], [104, -150], [100, -70], [48, -78], [-8, -130], [-62, -200], [-96, -282]], 4);
    P(tg, { col: K.white, p: 1, gap: 6, w: 12, ang: 1.0, seed: sd + 14, over: 3, draw: op.toga, cross: true, crossP: 0.9 }, op.toga > 0.05 ? LO(sd + 15, { draw: Math.min(1, op.toga * 1.6) }) : null);
    if (op.toga > 0.6) {
      L([[-50, -360], [10, -300], [56, -200], [74, -110]], LO(sd + 16, { w: 4, p: 0.6 }));
      L([[-74, -300], [-20, -240], [30, -150]], LO(sd + 17, { w: 4, p: 0.6 }));
    }
  }
  // boyun + baş
  P(rect(-16, -400, 16, -366), F(K.peach, sd + 18, { p: 0.5 }), null);
  head(C, q, s, op, sd);
  // ön kol
  let hand;
  const a = op.arm || 'down';
  if (a === 'wave') hand = [118, -500 + 16 * Math.sin(t * 12)];
  else if (a === 'point') hand = [176, -340];
  else if (a === 'rub') hand = [-6 + 34 * Math.sin(t * 14), -250 + 10 * Math.cos(t * 14)];
  else if (a === 'write') hand = [60 + 10 * Math.sin(t * 16), -232 + 4 * Math.cos(t * 23)];
  else if (a === 'hold') hand = [92, -300];
  else hand = [84, -205 - 6 * Math.sin(step * 3)];
  const elbow = a === 'wave' ? [110, -400] : a === 'point' ? [110, -330] : a === 'rub' || a === 'write' ? [80, -270] : [86, -285];
  P(tube([[62, -350], elbow, hand], 30, 26), F(K.peach, sd + 20, { p: 0.5 }), LO(sd + 21, { w: 6 }));
  if (op.toga > 0.3) P(smooth([[40, -372], [80, -360], [92, -316], [60, -300]], 3), { col: K.white, p: 1, gap: 6, w: 10, seed: sd + 22 }, LO(sd + 23, { w: 5 }));
  P(ellipse(hand[0], hand[1], 20, 18, 16), F(K.peach, sd + 24, { p: 0.55 }), LO(sd + 25, { w: 5 }));
  if (a === 'rub') { P(rect(hand[0] - 16, hand[1] - 34, hand[0] + 16, hand[1] - 12), { col: K.white, p: 1, gap: 4, w: 6, seed: sd + 26 }, LO(sd + 27, { w: 4 })); }
  if (a === 'write') L([[hand[0] - 4, hand[1] - 10], [hand[0] + 30, hand[1] - 64]], LO(sd + 28, { w: 8, col: K.gold }));
  BOIL.amp = bAmp;
  return { hand: q([hand])[0] };
}
function head(C, q, s, op, sd) {
  const P = (pts, fo, lo, opt) => Pt(C, q(pts), fo, lo, opt);
  const L = (pts, lo) => Ln(C.l, q(pts), lo);
  const cy = -446, ex = op.expr || 'smile', lk = op.look || 0;
  if (op.hair === 'long') P(smooth([[-74, cy + 70], [-82, cy - 10], [-60, cy - 70], [0, cy - 84], [60, cy - 70], [82, cy - 10], [76, cy + 74], [40, cy + 60], [-40, cy + 60]], 5), F(K.brown, sd + 30, { p: 0.85, ang: 1.3 }), LO(sd + 31));
  P(ellipse(0, cy, 64, 60, 40), F(K.peach, sd + 32, { p: 0.5 }), null);
  L(ellipse(0, cy, 64, 60, 30, -0.1, Math.PI + 0.1), LO(sd + 33));
  if (op.hair === 'long') {
    P(smooth([[-64, cy - 6], [-58, cy - 44], [-20, cy - 66], [30, cy - 64], [62, cy - 40], [64, cy - 6], [40, cy - 30], [10, cy - 26], [-24, cy - 34]], 4), F(K.brown, sd + 34, { p: 0.85, ang: 1.1 }), null);
    L([[-64, cy - 6], [-24, cy - 34], [10, cy - 26], [40, cy - 30], [64, cy - 6]], LO(sd + 35, { w: 5 }));
    // at kuyruğu fiyonk
    Db(C.f, ...q([[56, cy - 58]])[0], 13 * s, { col: K.red, seed: sd + 36 });
  } else {
    // kıvırcık kısa saç
    const bumps = []; for (let i = 0; i <= 9; i++) { const a = Math.PI + i / 9 * Math.PI; const r = 66 + (i % 2 ? 10 : 0); bumps.push([Math.cos(a) * r, cy + Math.sin(a) * r * 0.95 - 4]); }
    const cap = smooth([[-66, cy - 4], ...bumps, [66, cy - 4], [40, cy - 26], [0, cy - 36], [-40, cy - 26]], 3);
    P(cap, F(K.brown, sd + 37, { p: 0.9, ang: 1.2, gap: 8 }), null);
    L(cap.slice(0, Math.floor(cap.length * 0.62)), LO(sd + 38, { w: 6 }));
  }
  const exs = [-22 + lk * 8, 22 + lk * 8], ey = cy + 4;
  exs.forEach((x, i) => {
    if (ex === 'happy') L([[x - 10, ey + 5], [x - 4, ey - 4], [x + 4, ey - 4], [x + 10, ey + 5]], LO(sd + 40 + i, { w: 5 }));
    else {
      const r = ex === 'surprised' ? 9.5 : 7.5;
      P(ellipse(x, ey, r * 0.8, r * 1.05, 14), { col: K.ink, p: 1, gap: 3.2, w: 5, over: 0.5, seed: sd + 42 + i, ang: 1.3 }, LO(sd + 44 + i, { w: 4 }), { occ: false });
      Db(C.l, ...q([[x + 2.5, ey - 3.5]])[0], 2.4 * s, { col: K.white, p: 1, seed: sd + 46 + i, gap: 2, w: 3 });
    }
    if (ex === 'worried' || ex === 'surprised') L([[x - 10, ey - 24 + (ex === 'worried' ? (i ? -4 : 4) : -4)], [x + 10, ey - 24 + (ex === 'worried' ? (i ? 4 : -4) : -4)]], LO(sd + 48 + i, { w: 4 }));
  });
  [[-38, cy + 24], [38, cy + 24]].forEach(([x, y], i) => Db(C.f, ...q([[x, y]])[0], 10 * s, { col: K.pink, p: 0.75, seed: sd + 50 + i, sq: 0.75 }));
  const mx = lk * 8, my = cy + 32;
  if (ex === 'open' || ex === 'surprised') P(ellipse(mx, my + 2, 9, 11, 16), { col: K.red, p: 0.85, gap: 3, w: 4, seed: sd + 52 }, LO(sd + 53, { w: 4 }), { occ: false });
  else if (ex === 'worried') L([[mx - 9, my + 3], [mx, my - 2], [mx + 9, my + 3]], LO(sd + 54, { w: 4.5 }));
  else P([[mx - 13, my - 3], [mx - 6, my + 7], [mx + 6, my + 7], [mx + 13, my - 3]], { col: K.red, p: 0.8, gap: 3, w: 4, seed: sd + 55 }, LO(sd + 56, { w: 4.5 }), { occ: false });
}

// ———————————— dekor ————————————
function column(C, x, y0, y1, w, sd, dr = 1) {
  Pt(C, rect(x - w / 2, y0, x + w / 2, y1), F(K.stone, sd, { p: 0.45, ang: 1.5, draw: dr }), LO(sd + 1, { draw: dr, w: 6 }));
  for (let i = 1; i < 4; i++) Ln(C.l, [[x - w / 2 + w * i / 4, y0 + 12], [x - w / 2 + w * i / 4, y1 - 12]], LO(sd + 2 + i, { w: 3, p: 0.5, draw: dr }));
  Pt(C, rect(x - w / 2 - 14, y0 - 26, x + w / 2 + 14, y0), F(K.ochre, sd + 6, { p: 0.6, draw: dr }), LO(sd + 7, { draw: dr, w: 6 }));
  Pt(C, rect(x - w / 2 - 10, y1, x + w / 2 + 10, y1 + 20), F(K.ochre, sd + 8, { p: 0.6, draw: dr }), LO(sd + 9, { draw: dr, w: 6 }));
}
function temple(C, cx, top, wd, ht, sd, dr) {
  const x0 = cx - wd / 2, x1 = cx + wd / 2;
  Pt(C, [[x0 - 20, top + 90], [cx, top], [x1 + 20, top + 90]], F(K.terra, sd, { p: 0.7, draw: dr }), LO(sd + 1, { draw: dr }));
  Pt(C, rect(x0 - 10, top + 90, x1 + 10, top + 140), F(K.ochre, sd + 2, { p: 0.6, draw: dr }), LO(sd + 3, { draw: dr }));
  const n = 4; for (let i = 0; i < n; i++) column(C, x0 + 30 + (wd - 60) * i / (n - 1), top + 166, top + ht - 20, 44, sd + 10 + i * 12, dr);
  for (let i = 0; i < 3; i++) Pt(C, rect(x0 - 30 - i * 22, top + ht + i * 26, x1 + 30 + i * 22, top + ht + 26 + i * 26), F(K.stone, sd + 60 + i, { p: 0.5, draw: dr }), LO(sd + 63 + i, { draw: dr, w: 6 }));
}
function sun(L, x, y, r, sd, dr = 1, t = 0) {
  Fl(L.f || L, handCircle(x, y, r, sd), F(K.gold, sd, { p: 0.85, draw: dr }));
  Ln(L.l || L, handCircle(x, y, r, sd), LO(sd + 1, { col: K.terra, draw: dr }));
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + t * 0.3; Ln(L.l || L, [[x + Math.cos(a) * (r + 18), y + Math.sin(a) * (r + 18)], [x + Math.cos(a) * (r + 52), y + Math.sin(a) * (r + 52)]], LO(sd + 2 + i, { col: K.gold, w: 8, draw: dr })); }
}
function cloud(C, x, y, s, sd, dr = 1) {
  const pts = smooth([[-90, 20], [-80, -20], [-40, -40], [0, -60], [44, -44], [86, -24], [96, 18], [40, 30], [-30, 30]].map(([a, b]) => [x + a * s, y + b * s]), 5);
  Pt(C, pts, { col: K.white, p: 0.9, gap: 8, w: 10, seed: sd, draw: dr }, LO(sd + 1, { col: K.sky, draw: dr }));
}
function ground(C, y, sd, dr = 1, col = K.olive) {
  Pt(C, [[-60, y], [1140, y - 10], [1140, 1420], [-60, 1420]], F(col, sd, { p: 0.55, ang: 0.15, gap: 12, draw: dr }), null);
  Ln(C.l, [[-60, y], [300, y + 6], [700, y - 6], [1140, y - 10]], LO(sd + 1, { col: K.ink, draw: dr }));
}
function desk(C, x, y, sd, dr = 1, paper = true, t = 0) {
  Pt(C, rect(x - 230, y, x + 230, y + 34), F(K.brown, sd, { p: 0.85, draw: dr }), LO(sd + 1, { draw: dr }));
  Pt(C, rect(x - 210, y + 34, x - 180, y + 300), F(K.brown, sd + 2, { p: 0.85, draw: dr }), LO(sd + 3, { draw: dr }));
  Pt(C, rect(x + 180, y + 34, x + 210, y + 300), F(K.brown, sd + 4, { p: 0.85, draw: dr }), LO(sd + 5, { draw: dr }));
  if (paper) {
    Pt(C, [[x - 150, y - 16], [x + 40, y - 22], [x + 50, y + 2], [x - 156, y + 6]], { col: K.white, p: 1, gap: 5, w: 7, seed: sd + 6 }, LO(sd + 7, { w: 4, draw: dr }));
  }
}
function crayonStick(C, x, y, col, sd, rot = 0, len = 170) {
  const c = Math.cos(rot), s = Math.sin(rot);
  const R = pts => pts.map(([a, b]) => [x + a * c - b * s, y + a * s + b * c]);
  Pt(C, R([[-22, 0], [22, 0], [22, -len], [10, -len - 34], [-10, -len - 34], [-22, -len]]), { col, p: 1, gap: 5, w: 8, seed: sd, cross: true }, LO(sd + 1, { w: 5 }));
  Pt(C, R(rect(-24, -len * 0.62, 24, -len * 0.28)), { col: K.ochre, p: 0.8, gap: 5, w: 7, seed: sd + 2 }, LO(sd + 3, { w: 4 }));
}
function star4(L, x, y, r, sd, p = 1, col = K.gold) {
  Ln(L, [[x - r, y], [x + r, y]], { w: 6, col, p, seed: sd, wob: 0.2 });
  Ln(L, [[x, y - r], [x, y + r]], { w: 6, col, p, seed: sd + 1, wob: 0.2 });
}
function stamp(L, txt, x, y, sc, rot, sd) {
  const g = L.g; const hw = 270 * sc, hh = 62 * sc;
  const c = Math.cos(rot), s = Math.sin(rot); const R = pts => pts.map(([a, b]) => [x + a * c - b * s, y + a * s + b * c]);
  Ln(L, R([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh], [-hw, -hh]]), { w: 9, col: K.red, seed: sd, p: 1 });
  g.save(); g.translate(sx(x + OFF), sy(y)); g.rotate(rot); text(L, txt, 0, 22 * sc * CAM.s, { size: 72 * sc * CAM.s, col: K.red, seed: sd + 3, p: 1, stroke: 2 }); g.restore();
}
function bubble(C, x, y, rx, ry, sd, dr = 1, tail = [0, 0]) {
  Pt(C, smooth(ellipse(x, y, rx, ry, 18).map(([a, b], i) => [a + (i % 2 ? 10 : -6), b + (i % 2 ? 8 : -4)]), 3), { col: K.white, p: 0.4, gap: 14, w: 8, seed: sd, draw: dr }, LO(sd + 1, { draw: dr }));
  [[0.35, 26], [0.65, 16]].forEach(([u, r], i) => Pt(C, handCircle(lerp(tail[0], x, 1 - u), lerp(tail[1], y + ry, 1 - u), r, sd + 3 + i), null, LO(sd + 5 + i, { w: 5, draw: dr })));
}

// ———————————— yeni karakterler: koyun, Pan ————————————
function sheep(C, x, y, s, sd, op = {}) {
  const k = op.flip ? -1 : 1, st = op.step || 0, hop = op.hop || 0;
  const q = pts => pts.map(([a, b]) => [x + a * s * k, y - hop + b * s]);
  const P = (pts, fo, lo, opt) => Pt(C, q(pts), fo, lo, opt);
  [-48, -18, 22, 52].forEach((bx, i) => { const sw = 12 * Math.sin(st + i * 1.7); Ln(C.l, q([[bx, -60], [bx + sw, -4]]), LO(sd + i, { w: 8, col: K.ink })); });
  P(ellipse(0, -96, 78, 50, 24), { col: K.white, p: 1, gap: 5, w: 9, seed: sd + 5, cross: true }, LO(sd + 6, { w: 5 }));
  for (let j = 0; j < 5; j++) P(handCircle(-60 + j * 30, -130 + (j % 2) * 10, 26, sd + 10 + j), { col: K.white, p: 1, gap: 5, w: 8, seed: sd + 20 + j }, LO(sd + 30 + j, { w: 4, p: 0.8 }));
  P(ellipse(86, -112, 28, 25, 16), F(K.ink, sd + 40, { p: 0.9, gap: 5, w: 6 }), LO(sd + 41, { w: 4 }));
  P(smooth([[70, -134], [58, -118], [70, -108]], 3), F(K.ink, sd + 42, { p: 0.9 }), null);
  Db(C.l, ...q([[94, -120]])[0], 6 * s, { col: K.white, p: 1, seed: sd + 43, gap: 2, w: 3 });
  if (op.scared) Ln(C.l, q([[100, -98], [106, -92], [112, -98]]), LO(sd + 44, { w: 4, col: K.white }));
}
function pan(C, x, y, s, sd, t, op = {}) {
  const k = op.flip ? -1 : 1;
  const q = pts => pts.map(([a, b]) => [x + a * s * k, y + b * s]);
  const P = (pts, fo, lo, opt) => Pt(C, q(pts), fo, lo, opt);
  const L = (pts, lo) => Ln(C.l, q(pts), lo);
  [-1, 1].forEach((d, i) => {
    P(tube([[d * 30, -190], [d * 56, -100], [d * 34, -14]], 40, 24), F(K.brown, sd + 1 + i, { p: 0.9, ang: 1.2 }), LO(sd + 3 + i, { w: 6 }));
    P(ellipse(d * 40, -8, 24, 13, 14), F(K.ink, sd + 5 + i, { p: 0.9, gap: 5, w: 6 }), LO(sd + 7 + i, { w: 4 }));
  });
  P(smooth([[-62, -390], [0, -400], [62, -390], [76, -270], [70, -170], [0, -160], [-70, -170], [-76, -270]], 4), F(K.peach, sd + 9, { p: 0.55 }), LO(sd + 10));
  P(smooth([[-72, -210], [72, -210], [80, -140], [-80, -140]], 3), F(K.brown, sd + 11, { p: 0.9, ang: 1.2 }), LO(sd + 12, { w: 5 }));
  const hand = [58 + 6 * Math.sin(t * 5), -470];
  P(tube([[-56, -362], [-92, -300], [-86, -220]], 30, 26), F(K.peach, sd + 13, { p: 0.5 }), LO(sd + 14, { w: 6 }));
  P(tube([[58, -362], [96, -410], hand], 30, 26), F(K.peach, sd + 15, { p: 0.5 }), LO(sd + 16, { w: 6 }));
  const cy = -470;
  [-1, 1].forEach((d, i) => P(smooth([[d * 32, cy - 46], [d * 64, cy - 62], [d * 76, cy - 100], [d * 54, cy - 84], [d * 30, cy - 66]], 3), F(K.ochre, sd + 17 + i, { p: 0.8 }), LO(sd + 19 + i, { w: 5 })));
  P(smooth([[-34, cy + 40], [0, cy + 108], [34, cy + 40]], 3), F(K.brown, sd + 21, { p: 0.9, ang: 1.3 }), LO(sd + 22, { w: 5 }));
  P(ellipse(0, cy, 58, 56, 36), F(K.peach, sd + 23, { p: 0.5 }), LO(sd + 24));
  P(smooth([[-58, cy - 8], [-40, cy - 50], [0, cy - 62], [40, cy - 50], [58, cy - 8], [30, cy - 30], [-30, cy - 30]], 4), F(K.brown, sd + 25, { p: 0.9, ang: 1.1 }), null);
  [-20, 20].forEach((ex, i) => { P(ellipse(ex, cy + 2, 6, 8, 12), { col: K.ink, p: 1, gap: 3, w: 5, seed: sd + 26 + i, over: 0.5 }, null, { occ: false }); });
  if (op.mean) { L([[-34, cy - 20], [-10, cy - 12]], LO(sd + 29, { w: 5 })); L([[34, cy - 20], [10, cy - 12]], LO(sd + 30, { w: 5 })); P(ellipse(0, cy + 26, 12, 14, 14), { col: K.red, p: 0.85, gap: 3, w: 4, seed: sd + 31 }, LO(sd + 32, { w: 4 }), { occ: false }); }
  else P([[-14, cy + 22], [-6, cy + 32], [6, cy + 32], [14, cy + 22]], { col: K.red, p: 0.8, gap: 3, w: 4, seed: sd + 33 }, LO(sd + 34, { w: 4 }), { occ: false });
  [[-36, cy + 20], [36, cy + 20]].forEach(([a, b], i) => Db(C.f, ...q([[a, b]])[0], 9 * s, { col: K.pink, p: 0.7, seed: sd + 35 + i }));
  if (op.flute) { P(rect(hand[0] - 26, hand[1] - 6, hand[0] + 36, hand[1] + 10), F(K.ochre, sd + 37, { p: 0.8 }), LO(sd + 38, { w: 5 })); }
}
function hills(C, sd, df) {
  Pt(C, smooth([[-60, 1000], [200, 880], [480, 960], [760, 860], [1140, 980], [1140, 1420], [-60, 1420]], 4), F(K.olive, sd, { p: 0.6, ang: 0.2, gap: 12, draw: df }), LO(sd + 1, { draw: df }));
}
function bush(C, x, y, s, sd, dr = 1) {
  [[-60, 0], [0, -30], [60, 0], [-20, 20], [30, 24]].forEach(([a, b], i) => Pt(C, handCircle(x + a * s, y + b * s, 60 * s, sd + i), F(i % 2 ? K.olive : '#5f8a3c', sd + 10 + i, { p: 0.9, draw: dr }), LO(sd + 20 + i, { w: 6, draw: dr })));
}

// ———————————— sahne çizimleri ————————————
function S_sinav(t, i, dr, df, final = false) {
  const C = BG;
  Pt(C, rect(640, 330, 960, 640), F(K.sky, 101, { p: 0.55, draw: df }), LO(102, { draw: dr }));
  Ln(C.l, [[800, 330], [800, 640]], LO(103, { draw: dr })); Ln(C.l, [[640, 485], [960, 485]], LO(104, { draw: dr }));
  cloud(C, 760, 430, 0.55, 105, df);
  Pt(C, handCircle(250, 420, 80, 110), { col: K.white, p: 0.7, gap: 8, w: 9, seed: 111, draw: df }, LO(112, { draw: dr }));
  const ang = t * 0.6; Ln(C.l, [[250, 420], [250 + 50 * Math.sin(ang), 420 - 50 * Math.cos(ang)]], LO(113, { w: 6, col: K.red }));
  Ln(C.l, [[250, 420], [250 + 34, 420 + 10]], LO(114, { w: 6 }));
  Pt(C, [[-60, 1150], [1140, 1150], [1140, 1420], [-60, 1420]], F(K.ochre, 115, { p: 0.4, ang: 0.1, gap: 14, draw: df }), null);
  Ln(C.l, [[-60, 1150], [1140, 1150]], LO(116, { draw: dr }));
  const b = T0('s11');
  const ex = final ? (t > b + 2.4 ? 'happy' : 'worried') : (t < T0('s01') + 2.5 ? 'worried' : 'surprised');
  if (dr > 0.3) person(CH, 430, 1180, 1.12, { t, hair: 'long', tunic: K.sky, expr: ex, arm: 'write', seed: 700, sit: true, look: final ? 0.4 : 0 });
  desk(CH, 430, 900, 130, dr, true, t);
  Tx(CH.l, 'YDS', 330, 900, { size: 40, col: K.red, seed: 131, reveal: dr });
  if (!final) {
    Tx(FX, 'panic', 500, 300, { size: 160, col: K.red, seed: 140, reveal: pr(t, 0.2, 1.3), stroke: 2.5 });
    Tx(FX, '= ani korku', 520, 395, { size: 70, seed: 141, reveal: pr(t, 1.1, 1.6) });
    const up = back(pr(t, T0('s01') + 2.5, T0('s01') + 3.1));
    if (up > 0) {
      Tx(FX, '!', 250, 760 - 40 * up, { size: 140 * up, col: K.red, seed: 152, reveal: up, stroke: 2 });
      Tx(FX, '!', 620, 700 - 30 * up, { size: 110 * up, col: K.red, seed: 153, reveal: up, stroke: 2 });
      Tx(FX, '?', 880, 860, { size: 120 * up, col: K.violet, seed: 154, reveal: up });
    }
  } else {
    const bd = pr(t, b + 1.2, b + 1.8);
    if (bd > 0) {
      bubble(FR, 770, 690, 230, 190, 170, bd, [560, 900]);
      if (bd > 0.5) { sheep(FR, 700, 760, 0.8, 180, { step: t * 3 }); sheep(FR, 860, 790, 0.55, 230, { step: t * 3 + 1, flip: true }); }
      if (t > b + 2.4) for (let k = 0; k < 5; k++) { const ph = (t * 1.3 + k * 0.37) % 1; star4(FX, 770 + Math.cos(k * 1.3) * 190, 640 + Math.sin(k * 2.1) * 130, 12 + 10 * Math.sin(ph * Math.PI), 280 + k, Math.sin(ph * Math.PI)); }
    }
    Tx(FX, 'Derin bir nefes al!', 540, 340, { size: 82, seed: 190, reveal: pr(t, b + 2.4, b + 3.2), stroke: 1.5 });
    Tx(FX, 'panic', 540, 460, { size: 120, col: K.red, seed: 191, reveal: pr(t, b + 0.3, b + 0.9), stroke: 2 });
  }
}
function S_arkadya(t, i, dr, df) {
  const C = BG, a = SC[i].t;
  sun(C, 870, 360, 64, 201, df, t);
  cloud(C, 150, 560, 0.55, 205, df); cloud(C, 640, 470, 0.4, 207, df);
  Pt(C, smooth([[-60, 900], [250, 640], [520, 860], [800, 600], [1140, 880], [1140, 1100], [-60, 1100]], 4), F('#9aa8b8', 250, { p: 0.5, ang: 0.9, draw: dr }), LO(251, { draw: dr }));
  hills(C, 260, df);
  ground(C, 1150, 290, df);
  if (dr > 0.3) {
    person(CH, 300, 1290, 0.95, { t, tunic: K.olive, expr: 'smile', arm: 'hold', seed: 400 });
    Ln(CH.l, [[400, 1250], [412, 800]], LO(410, { w: 9, col: K.brown }));
    sheep(CH, 620, 1290, 0.78, 420, { step: t * 1.4 }); sheep(CH, 820, 1320, 0.62, 470, { step: t * 1.4 + 2, flip: true }); sheep(CH, 960, 1280, 0.5, 520, { step: t * 1.4 + 4 });
  }
  Tx(FX, 'ARKADYA', 400, 300, { size: 110, col: K.violet, seed: 230, reveal: pr(t, a + 0.6, a + 1.2), stroke: 2 });
  Tx(FX, 'Yunanistan', 400, 380, { size: 58, seed: 231, reveal: pr(t, a + 1.0, a + 1.6) });
}
function S_pan(t, i, dr, df) {
  const C = BG, a = T0('s04');
  hills(C, 300, df); ground(C, 1180, 310, df);
  [[160, 1140, 1.0], [930, 1130, 1.1]].forEach(([x, y, s], k) => { Pt(C, rect(x - 18, y - 360, x + 18, y), F(K.brown, 320 + k, { p: 0.8, draw: dr }), LO(325 + k, { draw: dr })); Pt(C, handCircle(x, y - 400, 130 * s, 330 + k), F(K.olive, 335 + k, { p: 0.8, draw: dr }), LO(340 + k, { draw: dr })); });
  sun(C, 540, 300, 40, 350, df, t);
  if (dr > 0.3) pan(CH, 540, 1300, 1.2, 600, t, { flute: true });
  const nt = pr(t, a + 0.8, a + 1.4);
  if (nt > 0) for (let k = 0; k < 4; k++) { const ph = (t * 0.9 + k * 0.27) % 1; Tx(FX, k % 2 ? '♪' : '♫', 700 + k * 70, 780 - ph * 160 - k * 30, { size: 64, col: K.violet, seed: 360 + k, reveal: nt * Math.sin(ph * Math.PI) }); }
  Tx(FX, 'PAN', 300, 300, { size: 140, col: K.red, seed: 370, reveal: pr(t, a + 0.7, a + 1.3), stroke: 2.5 });
  Tx(FX, 'kırların tanrısı', 330, 392, { size: 56, seed: 371, reveal: pr(t, a + 1.3, a + 2.0) });
}
function S_surusu(t, i, dr, df) {
  const C = BG, a = T0('s05'), r0 = T0('s06') - 0.1;
  hills(C, 400, df); ground(C, 1200, 410, df);
  Pt(C, rect(60, 380, 140, 1120), F(K.brown, 430, { p: 0.8, draw: dr }), LO(431, { draw: dr }));
  const sc = t > a + 0.3;
  if (dr > 0.3) {
    for (let k = 0; k < 5; k++) {
      const run = clamp((t - r0 - k * 0.08) / 2.2), x = 760 + k * 40 - run * run * 1300 - (k % 2) * 50, hop = t > r0 ? Math.abs(Math.sin(t * 9 + k)) * 45 : 0;
      if (x > -160) sheep(CH, x, 1280 + (k % 3) * 28, 0.62 + (k % 2) * 0.1, 440 + k * 60, { step: t * (t > r0 ? 14 : 1.4) + k, hop, scared: sc, flip: false });
    }
  }
  bush(FR, 930, 1000, 1.7, 500, dr);
  if (dr > 0.3) { const pk = pr(t, a + 0.1, a + 0.7); pan(FR, 960 - 40 * (1 - pk), 1260 + 140 * (1 - pk), 0.9, 640, t, { mean: pk > 0.5, flip: true }); bush(FR, 930, 1180, 1.7, 540, dr); }
  const sp = back(pr(t, a + 0.3, a + 0.75), 2.5);
  if (sp > 0) stamp(FX, 'EFSANEYE GÖRE', 540, 420, 1.15 * (2 - sp), -0.1, 770);
  if (t > a + 0.9) { const ph = pr(t, a + 0.9, a + 1.5); Tx(FX, 'AAAH!', 620, 700, { size: 100, col: K.red, seed: 780, reveal: ph, stroke: 2.5 }); }
  if (t > r0) { Tx(FX, '!', 340, 960, { size: 120, col: K.red, seed: 790, reveal: pr(t, r0, r0 + 0.4), stroke: 2 }); Tx(FX, '!', 220, 1040, { size: 90, col: K.red, seed: 791, reveal: pr(t, r0 + 0.2, r0 + 0.6), stroke: 2 }); }
}
function S_kelime(t, i, dr, df) {
  const C = BG, a = T0('s07'), b = T0('s08');
  Pt(C, [[140, 340], [940, 330], [960, 1040], [120, 1050]], F(K.stone, 601, { p: 0.6, draw: df, ang: 0.3 }), LO(602, { draw: dr, w: 9 }));
  Tx(C.l, 'Pan', 540, 470, { size: 110, col: K.violet, seed: 603, reveal: pr(t, a - 0.1, a + 0.5), stroke: 2 });
  Ln(C.l, [[540, 520], [540, 620]], LO(620, { w: 9, col: K.violet, draw: pr(t, a + 0.3, a + 0.8) }));
  Ln(C.l, [[500, 580], [540, 630], [580, 580]], LO(621, { w: 9, col: K.violet, draw: pr(t, a + 0.6, a + 0.9) }));
  Tx(C.l, 'panikos', 540, 760, { size: 126, col: K.red, seed: 610, reveal: pr(t, a + 0.7, a + 1.5), stroke: 2 });
  Tx(C.l, "= Pan'a ait", 540, 850, { size: 64, seed: 611, reveal: pr(t, a + 1.4, a + 2.0) });
  Tx(C.l, '= ani korku', 540, 960, { size: 74, col: K.red, seed: 631, reveal: pr(t, b + 0.9, b + 1.7), stroke: 1.5 });
  if (dr > 0.3) pan(CH, 880, 1370, 0.5, 650, t, { flip: true, flute: true });
  Tx(FX, 'YUNANCA', 300, 300, { size: 60, col: K.violet, seed: 660, reveal: pr(t, SC[i].t + 0.5, SC[i].t + 1.0) });
}
function S_yolculuk(t, i, dr, df) {
  const C = BG, a = T0('s09');
  Pt(C, rect(60, 330, 1020, 1300), F(K.sky, 1201, { p: 0.45, ang: 0.2, gap: 13, draw: df }), LO(1202, { draw: dr }));
  const br = smooth([[260, 380], [330, 400], [350, 520], [330, 640], [250, 660], [200, 600], [230, 500]], 4);
  Pt(C, br, F(K.olive, 1210, { p: 0.75, draw: df }), LO(1211, { draw: dr }));
  const eu = smooth([[420, 560], [700, 520], [980, 540], [1010, 900], [720, 880], [600, 960], [480, 900], [400, 760]], 4);
  Pt(C, eu, F(K.ochre, 1212, { p: 0.6, draw: df }), LO(1213, { draw: dr }));
  const gr = smooth([[820, 900], [940, 880], [980, 980], [930, 1100], [880, 1180], [840, 1090], [800, 1000]], 4);
  Pt(C, gr, F(K.olive, 1214, { p: 0.75, draw: df }), LO(1215, { draw: dr }));
  const path = [[900, 1040], [560, 760], [300, 560]];
  const pp = pr(t, a + 0.4, T1('s09') - 0.2);
  for (let k = 0; k < 14; k++) { const u0 = k / 14, u1 = u0 + 0.035; if (u0 > pp) break; Ln(C.l, [at(path, u0), at(path, u1)], LO(1220 + k, { w: 8, col: K.red })); }
  const bp = at(path, pp);
  Pt(FR, rect(bp[0] - 40, bp[1] - 30, bp[0] + 40, bp[1] + 30), { col: K.red, p: 0.9, gap: 6, w: 8, seed: 1240 }, LO(1241, { w: 5 }));
  Ln(FR.l, [[bp[0], bp[1] - 30], [bp[0], bp[1] + 30]], LO(1242, { w: 4 }));
  Db(FX, 900, 1040, 14, { col: K.ink, seed: 1243 }); Db(FX, 560, 760, 14, { col: K.ink, seed: 1245 }); Db(FX, 300, 560, 14, { col: K.ink, seed: 1244 });
  Tx(FX, 'Yunanistan', 780, 1250, { size: 46, seed: 1250, reveal: df });
  Tx(FX, 'Fransa', 560, 830, { size: 46, seed: 1251, reveal: df });
  Tx(FX, 'İngiltere', 300, 720, { size: 46, seed: 1255, reveal: df });
  Tx(FX, 'panikos', 780, 1340, { size: 64, col: K.violet, seed: 1252, reveal: pr(t, a + 0.3, a + 1.0) });
  Tx(FX, 'panique', 600, 640, { size: 64, col: K.violet, seed: 1256, reveal: pr(t, a + 1.4, a + 2.0) });
  Tx(FX, 'panic', 610, 430, { size: 100, col: K.red, seed: 1253, reveal: pr(t, T1('s09') - 0.7, T1('s09') + 0.1), stroke: 2 });
  Tx(FX, '~1600', 300, 300, { size: 86, col: K.ink, seed: 1254, reveal: pr(t, a + 1.0, a + 1.6), stroke: 2 });
}
function at(P, u) { const n = P.length - 1; const f = clamp(u) * n; const k = Math.min(n - 1, Math.floor(f)); const v = f - k; return [lerp(P[k][0], P[k + 1][0], v), lerp(P[k][1], P[k + 1][1], v)]; }
function S_ornek(t, i, dr, df) {
  const C = BG;
  Pt(C, [[90, 340], [990, 330], [1000, 900], [80, 910]], { col: K.white, p: 0.45, gap: 16, w: 8, seed: 1401, draw: df }, LO(1402, { draw: dr }));
  for (let r = 0; r < 6; r++) Ln(C.l, [[110, 440 + r * 80], [970, 438 + r * 80]], LO(1403 + r, { w: 3, col: K.sky, p: 0.6, draw: dr }));
  Ln(C.l, [[180, 340], [178, 905]], LO(1410, { w: 4, col: K.pink, draw: dr }));
  const a = T0('s10'), b = T1('s10');
  const rows = ['Many students panic when', 'they see a long reading', 'passage in the exam.'];
  rows.forEach((r, k) => {
    const rv = pr(t, lerp(a, b, k / 3) - 0.1, lerp(a, b, (k + 1) / 3));
    if (k === 0) {
      let x = 245; const gap = 18;
      x += Tx(C.l, 'Many students', x, 425, { size: 60, seed: 1420, reveal: rv * 3, align: 'left' }) / CAM.s + gap;
      x += Tx(C.l, 'panic', x, 425, { size: 60, col: K.red, seed: 1421, reveal: rv * 3 - 0.4, align: 'left', stroke: 1.5 }) / CAM.s + gap;
      Tx(C.l, 'when', x, 425, { size: 60, seed: 1422, reveal: rv * 2 - 1, align: 'left' });
    } else Tx(C.l, r, 245, 425 + k * 80, { size: 60, seed: 1423 + k, reveal: rv, align: 'left' });
  });
  Tx(C.l, 'Birçok öğrenci sınavda uzun bir', 560, 720, { size: 42, col: K.violet, seed: 1430, reveal: pr(t, b - 0.3, b + 0.6) });
  Tx(C.l, 'okuma parçası görünce panik yapar.', 560, 800, { size: 42, col: K.violet, seed: 1431, reveal: pr(t, b + 0.2, b + 1.0) });
  const ip = back(pr(t, a + 1.2, a + 1.8));
  if (ip > 0) {
    const cx = 360, cy = 1120; const R = pts => pts.map(([x, y]) => [cx + x * ip, cy + y * ip]);
    Pt(FR, R(rect(-200, -130, 200, 130)), { col: K.white, p: 0.8, gap: 6, w: 8, seed: 1440 }, LO(1441));
    for (let r = 0; r < 6; r++) Ln(FR.l, R([[-160, -90 + r * 34], [150 - (r % 3) * 30, -90 + r * 34]]), LO(1442 + r, { w: 5, col: K.ink, p: 0.6 }));
    Tx(FX, '!?', cx + 150 * ip, cy - 130 * ip, { size: 110 * ip, col: K.red, seed: 1452, stroke: 2 });
  }
  if (dr > 0.3) person(CH, 800, 1330, 0.7, { t, hair: 'long', tunic: K.sky, expr: 'worried', arm: 'hold', flip: true, seed: 1460 });
  Tx(FX, 'Örnek cümle', 540, 300, { size: 60, col: K.violet, seed: 1470, reveal: pr(t, SC[i].t + 0.5, SC[i].t + 1.1) });
}
function S_kart(t, i, dr, df) {
  const C = BG;
  sun(C, 540, 560, 90, 1501, df, t);
  Tx(FX, 'Kelimelerin Tarihçesi', 540, 820, { size: 64, col: K.violet, seed: 1510, reveal: pr(t, SC[i].t + 0.4, SC[i].t + 1.1) });
  Tx(FX, 'ingilizcecim.com', 540, 960, { size: 104, col: K.red, seed: 1511, reveal: pr(t, SC[i].t + 0.5, SC[i].t + 1.4), stroke: 2.5 });
  if (dr > 0.3) { pan(CH, 260, 1370, 0.6, 1520, t, { flute: true }); person(CH, 800, 1360, 0.7, { t, hair: 'long', tunic: K.sky, expr: 'happy', arm: 'wave', flip: true, seed: 1560 }); sheep(CH, 540, 1380, 0.5, 1600, { step: t * 2 }); }
  ground(C, 1370, 1590, df);
}
const DRAW = { sinav: S_sinav, arkadya: S_arkadya, pan: S_pan, surusu: S_surusu, kelime: S_kelime, yolculuk: S_yolculuk, ornek: S_ornek, son: (t, i, dr, df) => S_sinav(t, i, dr, df, true), kart: S_kart };
function washScene() { return false; }

// —— altyazı: satırın kelimeleri sırayla yazılır; İngilizce anahtar kelime kırmızı ——
const SUBY = 1440, SUBSZ = 52, SUBW = 880, SUBCX = 520;
const lay = {};
function layout(s) {
  if (lay[s.id]) return lay[s.id];
  const g = SUBK.g; g.save(); g.font = `400 ${SUBSZ}px "Patrick Hand"`;
  const words = s.metin.split(/\s+/); const sp = Math.max(g.measureText(' ').width, SUBSZ * 0.3);
  const mw = w => [...w].reduce((a, c) => a + g.measureText(c).width, 0);
  const rows = [[]]; let wsum = 0;
  words.forEach((w, k) => { const ww = mw(w); if (wsum + ww > SUBW && rows[rows.length - 1].length) { rows.push([]); wsum = 0; } rows[rows.length - 1].push({ w, k, ww }); wsum += ww + sp; });
  g.restore();
  const R = rows.map(r => ({ r, tw: r.reduce((a, b) => a + b.ww, 0) + sp * (r.length - 1) }));
  return (lay[s.id] = { R, sp });
}
function subtitles(t) {
  const s = Z.satirlar.find(l => t >= l.t0 - 0.05 && t < l.t1 + 0.35); if (!s) return;
  const { R, sp } = layout(s); const n = s.metin.split(/\s+/).length; const kw = s.kelimeler || [];
  const lh = SUBSZ * 1.22, ytop = SUBY - (R.length - 1) * lh;
  const g = SUBK.g; g.save(); g.fillStyle = '#000';
  const hw = Math.max(...R.map(r => r.tw)) / 2 + 40, hh = (R.length * lh) / 2 + 18, cy = ytop - SUBSZ * 0.35 + (R.length - 1) * lh / 2;
  g.beginPath();
  for (let k = 0; k <= 60; k++) { const a = k / 60 * Math.PI * 2; const px = Math.cos(a), py = Math.sin(a); const sq = Math.pow(Math.abs(px), 0.25) * Math.sign(px); const sy2 = Math.pow(Math.abs(py), 0.5) * Math.sign(py); const nn = 1 + 0.04 * Math.sin(a * 7 + 1.3); const X = SUBCX + sq * hw * nn, Y = cy + sy2 * hh * nn; k ? g.lineTo(X, Y) : g.moveTo(X, Y); }
  g.closePath(); g.fill(); g.restore();
  R.forEach((row, ri) => {
    let x = SUBCX - row.tw / 2; const y = ytop + ri * lh;
    row.r.forEach(({ w, k, ww }) => {
      const kt = kw.length === n && kw[k] ? kw[k].t0 : lerp(s.t0, s.t1, k / n);
      const rv = clamp((t - kt + 0.05) / 0.2);
      if (rv > 0) { const key = /panic|ingilizcecim|panik/i.test(w); text(SUBT, w, x, y, { size: SUBSZ, col: key ? K.red : K.ink, reveal: rv, seed: 11 + k * 3 + s.t0, p: 1, stroke: 1.2, align: 'left' }); }
      x += ww + sp;
    });
  });
}

// —— kapak başlığı (ortadaki 1080×1350 alanda) ——
function kapakTitle() {
  const g = SUBK.g; g.save(); g.fillStyle = '#000'; g.beginPath();
  for (let k = 0; k <= 60; k++) { const a = k / 60 * Math.PI * 2; const px = Math.cos(a), py = Math.sin(a); const sq = Math.pow(Math.abs(px), 0.3) * Math.sign(px); const X = 540 + sq * 470, Y = 405 + Math.pow(Math.abs(py), 0.6) * Math.sign(py) * 112; k ? g.lineTo(X, Y) : g.moveTo(X, Y); }
  g.closePath(); g.fill(); g.restore();
  text(SUBT, 'KELİMELERİN TARİHÇESİ', 540, 352, { size: 58, col: K.violet, seed: 5, p: 1, stroke: 1.5 });
  text(SUBT, 'Pan → panikos → panic', 540, 1470, { size: 70, col: K.violet, seed: 7, p: 1, stroke: 2 });
  text(SUBT, 'Panic', 540, 492, { size: 164, col: K.red, seed: 6, p: 1, stroke: 3 });
}

// —— kare ——
function frame(t) {
  BOIL.step = Math.floor(t * 6 + 1e-6);
  const i = sceneAt(t);
  const pu = eio(pr(t, SC[i].t, SC[i].t + PAN));
  const xPrev = i ? SC[i - 1].ox : 0;
  CAM.x = 540 + lerp(xPrev, SC[i].ox, i ? pu : 1);
  CAM.y = 960; CAM.s = 1;   // sabit ölçek: kâğıt dokusu kareden kareye değişmez (dosya boyutu)
  clearGroup(BG); clearGroup(CH); clearGroup(FR); [WASH, FX, SUBK, SUBT].forEach(clear);
  // boş tuval yüklenince tarayıcı eski kareyi veriyordu: her katmana köşeye görünmez bir nokta
  [BG.k, BG.f, BG.l, CH.k, CH.f, CH.l, FR.k, FR.f, FR.l, WASH, FX, SUBK, SUBT].forEach(L => { L.g.save(); L.g.setTransform(1, 0, 0, 1, 0, 0); L.g.globalAlpha = 1; L.g.fillStyle = 'rgba(0,0,0,0.004)'; L.g.fillRect(0, 0, 1, 1); L.g.restore(); });
  const vis = (i && pu < 1) ? [i - 1, i] : [i];
  let washed = false;
  for (const j of vis) {
    OFF = SC[j].ox;
    const st = SC[j].t + (j === i && i ? 0.05 : 0);
    const dr = j === 0 ? pr(t, 0.0, 0.7) : pr(t, st, st + 0.6), df = j === 0 ? pr(t, 0.3, 1.2) : pr(t, st + 0.25, st + 1.0);
    BOIL.amp = BOIL_BG; DRAW[SC[j].ad](t, j, j < i ? 1 : dr, j < i ? 1 : df);
    washed = washScene(t, j) || washed;
  }
  OFF = 0;
  BOIL.amp = 0;
  if (KAPAK) kapakTitle(); else subtitles(t);
  comp.paperCam(CAM.x * 0.6, CAM.y * 0.6, CAM.s / 0.6);
  comp.begin();
  comp.group(BG);
  comp.group(CH);
  comp.group(FR);
  if (washed) comp.wash(WASH.c, { color: WASH_GOLD });
  comp.crayon(FX.c);
  comp.knock(SUBK.c); comp.crayon(SUBT.c);
  comp.finish({ vig: 0.26, emb: 0.3 });
}
window.render = frame;
window.READY = true;
