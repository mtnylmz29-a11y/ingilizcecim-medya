// Kelimelerin Tarihçesi: Candidate — crayon-book (ingilizcecim.com, 2026-11-25)
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
  { ad: 'sinav', s: 's01' }, { ad: 'forum', s: 's03' }, { ad: 'lucius', s: 's03', w: 5 }, { ad: 'toga', s: 's04' },
  { ad: 'kelime', s: 's06' }, { ad: 'rivayet', s: 's08' }, { ad: 'yolculuk', s: 's10' },
  { ad: 'ornek', s: 's12' }, { ad: 'son', s: 's13' }, { ad: 'kart', s: 's14' },
];
const WT = (id, k) => { const l = LN[id]; return l && l.kelimeler && l.kelimeler[k] ? l.kelimeler[k].t0 : T0(id) + 1.5; };
SC.forEach((c, i) => { c.t = i === 0 ? 0 : (c.w != null ? WT(c.s, c.w) - 0.25 : T0(c.s) - 0.5); c.ox = i * 1400; });
const PAN = 0.001;   // kesme geçiş (kayan kâğıt dokusu dosyayı şişiriyordu)
const BOIL_BG = 0;   // sahne sabit; yalnız karakter çizgileri kaynar (dosya boyutu <50 MB)
function sceneAt(t) { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k].t) i = k; return i; }

// —— olaylar (efektler) ——
const EV = []; const ev = (t, type) => EV.push({ t: +Math.max(0, t).toFixed(3), type });
SC.forEach((c, i) => { if (i) ev(c.t, 'whoosh'); });
ev(0.15, 'click'); ev(T0('s01') + 2.4, 'pop');
ev(SC[2].t + 1.0, 'pop'); ev(T0('s04') + 1.0, 'click'); ev(T0('s05') + 0.7, 'whoosh'); ev(T0('s05') + 1.8, 'ding');
ev(T0('s06') + 0.5, 'click'); ev(T0('s07') + 0.8, 'click'); ev(T0('s08') + 0.3, 'thump'); ev(T0('s08') + 1.2, 'pop');
ev(T0('s10') + 0.5, 'click'); ev(T1('s10') - 0.3, 'ding');
ev(T0('s12') + 0.3, 'click'); ev(T0('s12') + 1.2, 'pop'); ev(T0('s13') + 0.9, 'ding'); ev(T0('s14'), 'pop');
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

// ———————————— sahne çizimleri ————————————
function S_sinav(t, i, dr, df, final = false) {
  // bugünün sınav salonu: pencere, saat, sıralar
  const C = BG;
  if (!final) {
  Pt(C, rect(640, 330, 960, 640), F(K.sky, 101, { p: 0.55, draw: df }), LO(102, { draw: dr }));
  Ln(C.l, [[800, 330], [800, 640]], LO(103, { draw: dr })); Ln(C.l, [[640, 485], [960, 485]], LO(104, { draw: dr }));
  cloud(C, 760, 430, 0.55, 105, df);
  Pt(C, handCircle(250, 420, 80, 110), { col: K.white, p: 0.7, gap: 8, w: 9, seed: 111, draw: df }, LO(112, { draw: dr }));
  const ang = t * 0.6; Ln(C.l, [[250, 420], [250 + 50 * Math.sin(ang), 420 - 50 * Math.cos(ang)]], LO(113, { w: 6, col: K.red }));
  Ln(C.l, [[250, 420], [250 + 34, 420 + 10]], LO(114, { w: 6 }));
  }
  Pt(C, [[-60, 1150], [1140, 1150], [1140, 1420], [-60, 1420]], F(K.ochre, 115, { p: 0.4, ang: 0.1, gap: 14, draw: df }), null);
  Ln(C.l, [[-60, 1150], [1140, 1150]], LO(116, { draw: dr }));
  // arkadaki sıra (küçük)
  Pt(C, rect(760, 860, 1000, 880), F(K.brown, 117, { p: 0.7, draw: df }), LO(118, { draw: dr, w: 5 }));
  Pt(C, rect(770, 880, 784, 1010), F(K.brown, 119, { draw: df }), null); Pt(C, rect(976, 880, 990, 1010), F(K.brown, 120, { draw: df }), null);
  const ex = final ? (t > T0('s13') + 0.9 ? 'happy' : 'smile') : (t < T0('s01') + 2.3 ? 'worried' : 'surprised');
  if (dr > 0.3) person(CH, 430, 1180, 1.12, { t, hair: 'long', tunic: K.sky, expr: ex, arm: 'write', seed: 700, sit: true, look: final ? 0.4 : 0 });
  desk(CH, 430, 900, 130, dr, true, t);
  Tx(CH.l, 'YDS', 330, 900, { size: 40, col: K.red, seed: 131, reveal: dr });
  if (!final) {
    // kanca: başlık + beyaz mum boya
    Tx(FX, 'candidate', 500, 300, { size: 150, col: K.red, seed: 140, reveal: pr(t, 0.2, 1.3), stroke: 2.5 });
    Tx(FX, '= aday', 520, 395, { size: 70, seed: 141, reveal: pr(t, 1.1, 1.6) });
    const up = back(pr(t, T0('s01') + 2.3, T0('s01') + 2.9));
    if (up > 0) {
      crayonStick(FR, 880, 1140 - 170 * up, K.white, 150, 0.12);
      Tx(FX, '?', 980, 900 - 150 * up, { size: 120, col: K.violet, seed: 152, reveal: up });
      if (up > 0.9) for (let k = 0; k < 4; k++) star4(FX, 880 + Math.cos(k * 1.6 + t * 2) * 110, 880 - 170 * up + Math.sin(k * 1.6 + t * 2) * 90, 16, 160 + k, 0.9);
    }
  } else {
    // düşünce balonu: toga giymiş Elif
    const bt = T0('s13');
    const bd = pr(t, bt + 0.2, bt + 0.8);
    if (bd > 0) {
      bubble(FR, 770, 700, 220, 200, 170, bd, [560, 900]);
      if (bd > 0.5) person(FR, 770, 870, 0.5, { t, hair: 'long', tunic: K.sky, expr: 'happy', arm: 'wave', toga: pr(t, bt + 0.6, bt + 1.6), seed: 760 });
      if (t > bt + 1.4) for (let k = 0; k < 5; k++) { const ph = (t * 1.3 + k * 0.37) % 1; star4(FX, 770 + Math.cos(k * 1.3) * 170, 650 + Math.sin(k * 2.1) * 140, 12 + 10 * Math.sin(ph * Math.PI), 180 + k, Math.sin(ph * Math.PI)); }
    }
    Tx(FX, 'Sen de bir', 540, 340, { size: 72, seed: 190, reveal: pr(t, bt + 0.3, bt + 1.0) });
    Tx(FX, 'candidate!', 540, 450, { size: 116, col: K.red, seed: 191, reveal: pr(t, bt + 0.9, bt + 1.6), stroke: 2 });
  }
}
function S_forum(t, i, dr, df) {
  const C = BG;
  sun(C, 870, 360, 64, 201, df, t);
  cloud(C, 130, 580, 0.5, 205, df);
  temple(C, 520, 440, 560, 560, 210, dr);
  ground(C, 1120, 290, df);
  // küçük kalabalık
  const cols = [K.red, K.sky, K.ochre, K.olive, K.pink, K.violet];
  if (dr > 0.5) for (let k = 0; k < 6; k++) person(CH, 120 + k * 170, 1330 - (k % 2) * 30, 0.42, { t, tunic: cols[k], expr: 'smile', seed: 400 + k * 61, step: t * 6 + k, arm: k === 2 ? 'wave' : 'down', flip: k % 2 === 1 });
  Tx(FX, 'ROMA', 320, 330, { size: 110, col: K.red, seed: 230, reveal: pr(t, SC[i].t + 0.6, SC[i].t + 1.2), stroke: 2 });
  Tx(FX, '~2000 yıl önce', 330, 400, { size: 54, seed: 231, reveal: pr(t, SC[i].t + 1.1, SC[i].t + 1.7) });
}
function S_lucius(t, i, dr, df) {
  const C = BG;
  column(C, 110, 420, 1180, 70, 301, dr); column(C, 970, 420, 1180, 70, 313, dr);
  ground(C, 1180, 325, df, K.ochre);
  sun(C, 540, 330, 40, 330, df, t);
  const ex = t < SC[i].t + 1.0 ? 'smile' : 'open';
  if (dr > 0.3) person(CH, 540, 1240, 1.45, { t, tunic: K.terra, expr: ex, arm: 'point', seed: 500 });
  // hayal balonu: görev tomarı
  const bd = pr(t, SC[i].t + 0.9, SC[i].t + 1.5);
  if (bd > 0) {
    bubble(FR, 820, 470, 150, 110, 340, bd, [700, 560]);
    Pt(FR, rect(740, 430, 900, 510), { col: K.ochre, p: 0.7, gap: 6, w: 8, seed: 345, draw: bd }, LO(346, { draw: bd, w: 5 }));
    Tx(FR.l, 'GÖREV', 820, 486, { size: 46, col: K.red, seed: 347, reveal: bd });
  }
  Tx(FX, 'Lucius', 300, 330, { size: 100, col: K.violet, seed: 350, reveal: pr(t, SC[i].t + 0.6, SC[i].t + 1.2), stroke: 2 });
}
function S_toga(t, i, dr, df) {
  const C = BG;
  temple(C, 540, 470, 700, 480, 401, dr);
  ground(C, 1080, 470, df, K.stone);
  // tebeşir kasesi
  Pt(C, smooth([[120, 1150], [300, 1150], [270, 1240], [150, 1240]], 3), F(K.terra, 480, { p: 0.8, draw: df }), LO(481, { draw: dr }));
  for (let k = 0; k < 5; k++) Db(C.f, 160 + k * 26, 1146 - (k % 2) * 8, 14, { col: K.white, seed: 482 + k, p: 1 });
  Tx(C.l, 'tebeşir', 210, 1300, { size: 54, seed: 490, reveal: df, stroke: 1.5 });
  const tg = pr(t, T0('s04') + 1.0, T0('s05') + 0.6);
  const rub = t > T0('s05') - 0.3 && t < T0('s05') + 0.9;
  const shine = t > T0('s05') + 1.8;
  if (dr > 0.3) person(CH, 600, 1220, 1.38, { t, tunic: K.terra, expr: shine ? 'happy' : 'smile', arm: rub ? 'rub' : 'hold', toga: tg, seed: 520 });
  if (shine) for (let k = 0; k < 6; k++) { const ph = (t * 1.1 + k * 0.29) % 1; star4(FX, 600 + Math.cos(k * 1.1) * 260, 820 + Math.sin(k * 2.3) * 300, 14 + 14 * Math.sin(ph * Math.PI), 540 + k, Math.sin(ph * Math.PI), K.white); }
  if (!KAPAK) Tx(FX, 'toga candida', 540, 300, { size: 84, col: K.violet, seed: 560, reveal: pr(t, T0('s04') + 1.6, T0('s04') + 2.4), stroke: 2 });
  if (!KAPAK) Tx(FX, '(bembeyaz toga)', 540, 372, { size: 50, seed: 561, reveal: pr(t, T0('s04') + 2.2, T0('s04') + 2.8) });
}
function S_kelime(t, i, dr, df) {
  const C = BG;
  // taş tablet
  Pt(C, [[140, 340], [940, 330], [960, 1040], [120, 1050]], F(K.stone, 601, { p: 0.6, draw: df, ang: 0.3 }), LO(602, { draw: dr, w: 9 }));
  const a = T0('s06'), b = T0('s07');
  Tx(C.l, 'candidus', 540, 500, { size: 120, col: K.red, seed: 610, reveal: pr(t, a + 0.5, a + 1.3), stroke: 2 });
  Tx(C.l, '= parlak beyaz', 540, 590, { size: 64, seed: 611, reveal: pr(t, a + 1.3, a + 2.0) });
  if (t > a + 1.3) Fl(C.f, handCircle(850, 470, 40, 612), { col: K.white, p: 1, gap: 4, w: 8, seed: 613, cross: true });
  if (t > a + 1.3) Ln(C.l, handCircle(850, 470, 40, 612), LO(614, { w: 5 }));
  Ln(C.l, [[540, 640], [540, 760]], LO(620, { w: 9, col: K.violet, draw: pr(t, b - 0.2, b + 0.4) }));
  Ln(C.l, [[500, 720], [540, 770], [580, 720]], LO(621, { w: 9, col: K.violet, draw: pr(t, b + 0.2, b + 0.5) }));
  Tx(C.l, 'candidatus', 540, 880, { size: 116, col: K.red, seed: 630, reveal: pr(t, b + 0.8, b + 1.8), stroke: 2 });
  Tx(C.l, '= beyazlar giymiş', 540, 970, { size: 64, seed: 631, reveal: pr(t, b + 1.8, b + 2.6) });
  if (dr > 0.3) person(CH, 880, 1340, 0.62, { t, tunic: K.terra, toga: 1, expr: 'happy', arm: 'point', flip: true, seed: 650 });
  Tx(FX, 'LATİNCE', 300, 300, { size: 60, col: K.violet, seed: 660, reveal: pr(t, SC[i].t + 0.5, SC[i].t + 1.0) });
}
function S_rivayet(t, i, dr, df) {
  const C = BG;
  column(C, 130, 520, 1200, 70, 701, dr); column(C, 950, 520, 1200, 70, 713, dr);
  ground(C, 1200, 725, df, K.stone);
  const a = T0('s08');
  // kalp: temiz niyet
  const hp = back(pr(t, a + 1.2, a + 1.8));
  if (hp > 0) {
    const hx = 760, hy = 760, r = 60 * hp;
    const heart = []; for (let k = 0; k <= 30; k++) { const u = k / 30 * Math.PI * 2; heart.push([hx + r * 16 * Math.pow(Math.sin(u), 3) / 16, hy - r * (13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u)) / 16]); }
    Pt(FR, heart, { col: K.pink, p: 0.9, gap: 6, w: 9, seed: 730 }, LO(731));
    Tx(FX, 'temiz niyet?', 760, 900, { size: 60, seed: 732, reveal: pr(t, a + 1.6, a + 2.3) });
  }
  if (dr > 0.3) person(CH, 400, 1260, 1.3, { t, tunic: K.terra, toga: 1, expr: t > a + 1.2 ? 'happy' : 'smile', arm: 'down', seed: 750 });
  const sp = back(pr(t, a + 0.3, a + 0.75), 2.5);
  if (sp > 0) stamp(FX, 'RİVAYETE GÖRE', 540, 400, 1.15 * (2 - sp), -0.12, 770);
}
function S_yolculuk(t, i, dr, df) {
  const C = BG;
  Pt(C, rect(60, 330, 1020, 1300), F(K.sky, 1201, { p: 0.45, ang: 0.2, gap: 13, draw: df }), LO(1202, { draw: dr }));
  // kıta (çocukça): İngiltere, Avrupa, İtalya çizmesi
  const br = smooth([[260, 380], [330, 400], [350, 520], [330, 640], [250, 660], [200, 600], [230, 500]], 4);
  Pt(C, br, F(K.olive, 1210, { p: 0.75, draw: df }), LO(1211, { draw: dr }));
  const eu = smooth([[420, 560], [700, 520], [980, 540], [1010, 900], [720, 880], [600, 960], [480, 900], [400, 760]], 4);
  Pt(C, eu, F(K.ochre, 1212, { p: 0.6, draw: df }), LO(1213, { draw: dr }));
  const it = smooth([[620, 900], [690, 900], [760, 1040], [840, 1120], [860, 1180], [800, 1170], [740, 1120], [660, 1010]], 4);
  Pt(C, it, F(K.olive, 1214, { p: 0.75, draw: df }), LO(1215, { draw: dr }));
  const a = T0('s10');
  const path = [[720, 1020], [640, 860], [480, 720], [300, 560]];
  const pp = pr(t, a + 0.4, T1('s10') - 0.2);
  // noktalı yol
  for (let k = 0; k < 14; k++) { const u0 = k / 14, u1 = u0 + 0.035; if (u0 > pp) break; const P0 = at(path, u0), P1 = at(path, u1); Ln(C.l, [P0, P1], LO(1220 + k, { w: 8, col: K.red })); }
  const bp = at(path, pp);
  Pt(FR, rect(bp[0] - 40, bp[1] - 30, bp[0] + 40, bp[1] + 30), { col: K.red, p: 0.9, gap: 6, w: 8, seed: 1240 }, LO(1241, { w: 5 }));
  Ln(FR.l, [[bp[0], bp[1] - 30], [bp[0], bp[1] + 30]], LO(1242, { w: 4 }));
  Db(FX, 720, 1020, 14, { col: K.ink, seed: 1243 }); Db(FX, 300, 560, 14, { col: K.ink, seed: 1244 });
  Tx(FX, 'Roma', 830, 1010, { size: 50, seed: 1250, reveal: df });
  Tx(FX, 'İngiltere', 300, 720, { size: 50, seed: 1251, reveal: df });
  Tx(FX, 'candidatus', 790, 1250, { size: 60, col: K.violet, seed: 1252, reveal: pr(t, a + 0.3, a + 1.0) });
  Tx(FX, 'candidate', 640, 430, { size: 90, col: K.red, seed: 1253, reveal: pr(t, T1('s10') - 0.6, T1('s10') + 0.2), stroke: 2 });
  Tx(FX, "1600'ler", 300, 300, { size: 86, col: K.ink, seed: 1254, reveal: pr(t, a + 1.0, a + 1.6), stroke: 2 });
}
function at(P, u) { const n = P.length - 1; const f = clamp(u) * n; const k = Math.min(n - 1, Math.floor(f)); const v = f - k; return [lerp(P[k][0], P[k + 1][0], v), lerp(P[k][1], P[k + 1][1], v)]; }
function S_ornek(t, i, dr, df) {
  const C = BG;
  // defter sayfası
  Pt(C, [[90, 340], [990, 330], [1000, 900], [80, 910]], { col: K.white, p: 0.45, gap: 16, w: 8, seed: 1401, draw: df }, LO(1402, { draw: dr }));
  for (let r = 0; r < 6; r++) Ln(C.l, [[110, 440 + r * 80], [970, 438 + r * 80]], LO(1403 + r, { w: 3, col: K.sky, p: 0.6, draw: dr }));
  Ln(C.l, [[180, 340], [178, 905]], LO(1410, { w: 4, col: K.pink, draw: dr }));
  const a = T0('s12'), b = T1('s12');
  const rows = ['All candidates are required', 'to bring a valid ID card', 'to the examination hall.'];
  rows.forEach((r, k) => {
    const rv = pr(t, lerp(a, b, k / 3) - 0.1, lerp(a, b, (k + 1) / 3));
    if (k === 0) {
      let x = 245; const gap = 18;
      x += Tx(C.l, 'All', x, 425, { size: 60, seed: 1420, reveal: rv * 3, align: 'left' }) / CAM.s + gap;
      x += Tx(C.l, 'candidates', x, 425, { size: 60, col: K.red, seed: 1421, reveal: rv * 3 - 0.4, align: 'left', stroke: 1.5 }) / CAM.s + gap;
      Tx(C.l, 'are required', x, 425, { size: 60, seed: 1422, reveal: rv * 2 - 1, align: 'left' });
    } else Tx(C.l, r, 245, 425 + k * 80, { size: 60, seed: 1423 + k, reveal: rv, align: 'left' });
  });
  Tx(C.l, 'Tüm adayların sınav salonuna geçerli', 560, 720, { size: 42, col: K.violet, seed: 1430, reveal: pr(t, b - 0.3, b + 0.6) });
  Tx(C.l, 'bir kimlik kartı getirmesi gerekir.', 560, 800, { size: 42, col: K.violet, seed: 1431, reveal: pr(t, b + 0.2, b + 1.0) });
  // kimlik kartı
  const ip = back(pr(t, a + 1.2, a + 1.8));
  if (ip > 0) {
    const cx = 360, cy = 1110; const R = pts => pts.map(([x, y]) => [cx + x * ip, cy + y * ip]);
    Pt(FR, R(rect(-200, -120, 200, 120)), F(K.sky, 1440, { p: 0.7 }), LO(1441));
    Pt(FR, R(rect(-170, -80, -50, 80)), { col: K.white, p: 0.8, gap: 6, w: 7, seed: 1442 }, LO(1443, { w: 5 }));
    Pt(FR, R(handCircle(-110, -10, 34, 1444)), F(K.peach, 1445, { p: 0.6 }), LO(1446, { w: 5 }));
    Ln(FR.l, R([[-124, 0], [-110, 10], [-96, 0]]), LO(1447, { w: 4 }));
    for (let r = 0; r < 3; r++) Ln(FR.l, R([[-20, -50 + r * 44], [160, -50 + r * 44]]), LO(1448 + r, { w: 6, col: K.ink, p: 0.6 }));
    Tx(FX, 'ID', cx + 120 * ip, cy + 100 * ip, { size: 48 * ip, col: K.red, seed: 1452 });
  }
  if (dr > 0.3) person(CH, 800, 1330, 0.7, { t, hair: 'long', tunic: K.sky, expr: 'smile', arm: 'hold', flip: true, seed: 1460 });
  Tx(FX, 'Örnek cümle', 540, 300, { size: 60, col: K.violet, seed: 1470, reveal: pr(t, SC[i].t + 0.5, SC[i].t + 1.1) });
}
function S_kart(t, i, dr, df) {
  const C = BG;
  sun(C, 540, 560, 90, 1501, df, t);
  Tx(FX, 'Kelimelerin Tarihçesi', 540, 820, { size: 64, col: K.violet, seed: 1510, reveal: pr(t, SC[i].t + 0.4, SC[i].t + 1.1) });
  Tx(FX, 'ingilizcecim.com', 540, 960, { size: 104, col: K.red, seed: 1511, reveal: pr(t, SC[i].t + 0.5, SC[i].t + 1.4), stroke: 2.5 });
  if (dr > 0.3) person(CH, 300, 1360, 0.7, { t, tunic: K.terra, toga: 1, expr: 'happy', arm: 'wave', seed: 1520 });
  if (dr > 0.3) person(CH, 760, 1360, 0.7, { t, hair: 'long', tunic: K.sky, expr: 'happy', arm: 'wave', flip: true, seed: 1560 });
  ground(C, 1370, 1590, df);
}
const DRAW = { sinav: S_sinav, forum: S_forum, lucius: S_lucius, toga: S_toga, kelime: S_kelime, rivayet: S_rivayet, yolculuk: S_yolculuk, ornek: S_ornek, son: (t, i, dr, df) => S_sinav(t, i, dr, df, true), kart: S_kart };

// —— suluboya (altın) : toga sahnesinde ve son sahnedeki balonda ——
function washScene(t, i) {
  const c = SC[i]; let t0, x0 = -120, x1 = 1200, y0 = -80, y1 = 2000, clipE = null;
  if (c.ad === 'toga') t0 = T0('s05') + 0.6;
  else if (c.ad === 'rivayet' || c.ad === 'kelime') t0 = -99;   // önceden yıkanmış sayfa
  else if (c.ad === 'son') { t0 = T0('s13') + 0.7; clipE = [770, 700, 212, 192]; }
  else return false;
  const g = WASH.g; g.save();
  g.setTransform(CAM.s, 0, 0, CAM.s, W / 2 - CAM.x * CAM.s, H / 2 - CAM.y * CAM.s);
  g.translate(c.ox, 0);
  const u = eio(pr(t, t0, t0 + 1.3)); if (u <= 0) { g.restore(); return false; }
  const fx = lerp(x0 - 120, x1 + 140, u);
  g.beginPath(); g.moveTo(x0 - 200, y0 - 100);
  for (let y = y0 - 100; y <= y1 + 100; y += 20) g.lineTo(fx + 60 * Math.sin(clamp((y - y0) / (y1 - y0)) * Math.PI) + 10 * Math.sin(y * 0.05), y);
  g.lineTo(x0 - 200, y1 + 100); g.closePath(); g.clip();
  if (clipE) { g.beginPath(); g.ellipse(clipE[0], clipE[1], clipE[2], clipE[3], 0, 0, Math.PI * 2); g.clip(); }
  const shape = new Path2D(); shape.moveTo(x0, y0 + 10 * Math.sin(1)); for (let x = x0; x <= x1; x += 40) shape.lineTo(x, y0 + 12 * Math.sin(x * 0.01) + 10 * hash(x)); for (let x = x1; x >= x0; x -= 40) shape.lineTo(x, y1 + 12 * Math.sin(x * 0.013) + 10 * hash(x + 3)); shape.closePath();
  g.fillStyle = '#000'; g.globalAlpha = 0.62; g.fill(shape);
  g.save(); g.clip(shape);
  for (let k = 0; k < 18; k++) { const yy = y0 + (y1 - y0) * hash(k * 3.7); g.globalAlpha = 0.06 + 0.06 * hash(k); g.fillRect(x0, yy, x1 - x0, 10 + 30 * hash(k + 1)); }
  g.restore(); g.restore();
  return true;
}

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
      if (rv > 0) { const key = /candid|ingilizcecim/i.test(w) || /^ID\b/.test(w); text(SUBT, w, x, y, { size: SUBSZ, col: key ? K.red : K.ink, reveal: rv, seed: 11 + k * 3 + s.t0, p: 1, stroke: 1.2, align: 'left' }); }
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
  text(SUBT, 'candidus = parlak beyaz', 540, 1470, { size: 78, col: K.violet, seed: 7, p: 1, stroke: 2 });
  text(SUBT, 'Candidate', 540, 492, { size: 164, col: K.red, seed: 6, p: 1, stroke: 3 });
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
