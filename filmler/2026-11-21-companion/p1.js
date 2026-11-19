// Kelimelerin Tarihçesi: Companion — suluboya fırça (watercolor) — ingilizcecim.com
// Fırça motoru lemo-opuscar watercolor demosundaki (MIT) şerit + kıl izi fikrinden uyarlandı.
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const back = (t, s = 1.8) => { t = clamp(t) - 1; return 1 + t * t * ((s + 1) * t + s); };
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const vnoise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); };
const TAU = Math.PI * 2;
const W = 1080, H = 1920;
const C = document.getElementById('c'), X = C.getContext('2d');
const KAPAK = /kapak=1/.test(location.search);

// ---------- palette ----------
const K = { paper: '#f1e9da', ink: '#2b2520', ink2: '#5a4636', ver: '#c8442a',
  ochre: '#d9a24e', ochreD: '#a8722e', crust: '#b8742f', crumb: '#ecd3a0', sage: '#9cae7c', sageD: '#62784f',
  lav: '#b9a9c4', peach: '#efc29a', sky: '#c9d8de', blue: '#7f9bb0', blueD: '#3e5873', night: '#2f3d5c',
  brown: '#8a5a3b', brownD: '#5e3b27', green: '#6f8f5a', moss: '#7d8a4a', skin: '#e9b48f', skinD: '#c98d6a',
  plum: '#8c5a72', yellow: '#e8b83a', grey: '#9a9088', fire: '#e8873a', fireL: '#f6c25a', wine: '#8e3b3b' };

// ---------- rng ----------
let RNG = mulberry(1);
const rnd = (a = 0, b = 1) => a + (b - a) * RNG();
function withSeed(seed, fn) { const keep = RNG; RNG = mulberry(seed | 0); try { return fn(); } finally { RNG = keep; } }
const _rgb = {};
const hex2rgb = h => _rgb[h] || (_rgb[h] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
const rgba = (h, a) => { const c = hex2rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(3)})`; };
const mixc = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * clamp(t)).toString(16).padStart(2, '0')).join(''); };

// ---------- brush strokes: ribbon + dry-brush bristles ----------
function qcurve(x0, y0, x1, y1, bend = 0, n = 12) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  const cx = mx - dy / L * bend, cy = my + dx / L * bend, out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]); }
  return out;
}
function mk(pts, w, col, o = {}) {
  const n = pts.length, ws = [], nx = [], ny = [];
  const seed = rnd(0, 1000), rough = o.rough ?? .22, prof = o.prof || 'brush';
  for (let i = 0; i < n; i++) {
    const s = i / (n - 1); let f;
    if (prof === 'leaf') f = Math.pow(Math.sin(Math.PI * (s * .94 + .03)), .7);
    else if (prof === 'even') f = Math.min(1, s / .06 + .35) * Math.min(1, (1 - s) / .08 + .4);
    else if (prof === 'tip') f = Math.pow(1 - s * .92, .85) * Math.min(1, s / .05 + .6);
    else f = Math.min(1, s / .1 + .3) * Math.pow(1 - s * .85, .6);
    ws.push(Math.max(.5, w * f * (1 + rough * (vnoise(seed + i * .9) * 2 - 1))));
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    nx.push(-dy / L); ny.push(dx / L);
  }
  const nb = o.nb ?? (w >= 6 ? Math.min(8, Math.max(3, Math.round(w / 3.5))) : 0);
  let br = null;
  if (nb > 0) { br = []; for (let j = 0; j < nb; j++) { const dash = []; for (let k = 0; k < 6; k++) dash.push(k % 2 ? rnd(1, w * .5 + 3) : rnd(18, 90)); br.push({ off: rnd(-.46, .46), bw: Math.max(.7, w / nb * rnd(.6, 1.3)), a: rnd(.3, .85), end: rnd(.72, 1), dash }); } }
  return { pts, ws, nx, ny, col, a: o.a ?? .9, rib: o.rib ?? (nb ? .6 : .9), br };
}
function drawS(s, p = 1, am = 1) {
  if (p <= 0) return;
  const P = s.pts, n = P.length, m = (n - 1) * clamp(p), k = Math.floor(m), f = m - k, cc = s.col;
  const cnt = f > .001 && k < n - 1 ? k + 2 : k + 1;
  const XX = i => i <= k ? P[i][0] : lerp(P[k][0], P[k + 1][0], f), YY = i => i <= k ? P[i][1] : lerp(P[k][1], P[k + 1][1], f);
  X.beginPath();
  for (let i = 0; i < cnt; i++) { const j = Math.min(i, n - 1), hw = s.ws[j] / 2; const x = XX(i) + s.nx[j] * hw, y = YY(i) + s.ny[j] * hw; i ? X.lineTo(x, y) : X.moveTo(x, y); }
  for (let i = cnt - 1; i >= 0; i--) { const j = Math.min(i, n - 1), hw = s.ws[j] / 2; X.lineTo(XX(i) - s.nx[j] * hw, YY(i) - s.ny[j] * hw); }
  X.closePath(); X.fillStyle = rgba(cc, s.a * s.rib * am); X.fill();
  if (s.br) {
    X.lineCap = 'round'; X.lineJoin = 'round';
    for (const b of s.br) {
      const e = Math.min(m, (n - 1) * b.end), kk = Math.floor(e); if (kk < 1) continue;
      X.beginPath();
      for (let i = 0; i <= kk; i++) { const hw = s.ws[i] * b.off, x = P[i][0] + s.nx[i] * hw, y = P[i][1] + s.ny[i] * hw; i ? X.lineTo(x, y) : X.moveTo(x, y); }
      X.setLineDash(b.dash); X.lineWidth = b.bw; X.strokeStyle = rgba(cc, s.a * b.a * am); X.stroke();
    }
    X.setLineDash([]);
  }
}
const br = (pts, w, col, o = {}, p = 1) => drawS(mk(pts, w, col, o), p, o.am ?? 1);
const edge = (pts, col = K.ink2, w = 3, a = .75, p = 1) => br(pts, w, col, { prof: 'even', nb: 0, a, rough: .35 }, p);
// wobbly blob outline
function blob(cx, cy, rx, ry, n = 30, rough = .07, rot = 0) {
  const s = rnd(0, 500), out = [], c = Math.cos(rot), si = Math.sin(rot);
  for (let i = 0; i < n; i++) { const a = i / n * TAU, r = 1 + rough * (vnoise(s + i * .8) * 2 - 1), x = Math.cos(a) * rx * r, y = Math.sin(a) * ry * r; out.push([cx + x * c - y * si, cy + x * si + y * c]); }
  return out;
}
// pooled wash: same polygon in 3 jittered passes
function wash(pts, col, a = .55, j = 4) {
  const js = []; for (let k = 0; k < 3; k++) { const r = []; for (let i = 0; i < pts.length; i++) r.push([rnd(-j, j), rnd(-j, j)]); js.push(r); }
  for (let k = 0; k < 3; k++) { X.beginPath(); pts.forEach((p, i) => { const x = p[0] + js[k][i][0], y = p[1] + js[k][i][1]; i ? X.lineTo(x, y) : X.moveTo(x, y); }); X.closePath(); X.fillStyle = rgba(col, a / 2.4); X.fill(); }
}
const wblob = (cx, cy, rx, ry, col, a = .55, o = {}) => { const p = blob(cx, cy, rx, ry, o.n || 30, o.rough ?? .07, o.rot || 0); wash(p, col, a, o.j ?? 3); return p; };
const quad = (x0, y0, x1, y1, x2, y2, x3, y3) => [[x0, y0], [x1, y1], [x2, y2], [x3, y3]];
// soft rectangle wash with wobbly sides (sky, walls)
function band(x0, y0, x1, y1, col, a = .5, o = {}) {
  const pts = [], n = 10, s = rnd(0, 99), wv = o.wv ?? 10;
  for (let i = 0; i <= n; i++) pts.push([lerp(x0, x1, i / n), y0 + (vnoise(s + i) - .5) * wv * 2]);
  for (let i = n; i >= 0; i--) pts.push([lerp(x0, x1, i / n), y1 + (vnoise(s + 40 + i) - .5) * wv * 2]);
  wash(pts, col, a, o.j ?? 5);
}
// gradient wash in 5 quantised bands (reads as paint)
function vgrad(y0, y1, c0, c1, a = .5, n = 5) { for (let i = 0; i < n; i++) band(-60, lerp(y0, y1, i / n) - 6, W + 60, lerp(y0, y1, (i + 1) / n) + 6, mixc(c0, c1, i / (n - 1)), a); }
// reveal helper: wavy-edged clip from left (dir 'x') or bottom (dir 'y')
function reveal(p, dir, fn, x0 = 0, y0 = 0, x1 = W, y1 = H) {
  if (p <= 0) return; if (p >= 1) { fn(); return; }
  X.save(); X.beginPath();
  if (dir === 'x') { const ex = lerp(x0 - 80, x1 + 80, p); X.moveTo(x0 - 100, y0 - 100); for (let i = 0; i <= 24; i++) { const y = lerp(y0 - 100, y1 + 100, i / 24); X.lineTo(ex + Math.sin(i * 1.7) * 40 + Math.sin(i * .6) * 30, y); } X.lineTo(x0 - 100, y1 + 100); }
  else { const ey = lerp(y1 + 80, y0 - 80, p); X.moveTo(x0 - 100, y1 + 100); for (let i = 0; i <= 20; i++) { const x = lerp(x0 - 100, x1 + 100, i / 20); X.lineTo(x, ey + Math.sin(i * 1.9) * 34 + Math.sin(i * .7) * 24); } X.lineTo(x1 + 100, y1 + 100); }
  X.closePath(); X.clip(); fn(); X.restore();
}

// ---------- time / camera ----------
let T = 0;
let CAM = { x: 540, y: 960, z: 1 };
function cam() { X.setTransform(CAM.z, 0, 0, CAM.z, W / 2 - CAM.x * CAM.z, H / 2 - CAM.y * CAM.z); }
function scr() { X.setTransform(1, 0, 0, 1, 0, 0); }

// ---------- type ----------
const SERIF = '"IM Fell English"';
function htext(s, x, y, size, col = K.ink, o = {}) { // hand note: halo + written left to right
  const p = o.p ?? 1; if (p <= 0) return;
  X.save(); X.font = `${o.italic === false ? '' : 'italic '}${size}px ${SERIF}`; X.textAlign = o.align || 'center'; X.textBaseline = 'middle';
  const w = X.measureText(s).width, lx = o.align === 'left' ? x : x - w / 2;
  if (p < 1) { X.beginPath(); X.rect(lx - 20, y - size, (w + 40) * p, size * 2); X.clip(); }
  X.lineJoin = 'round'; X.lineWidth = size * .22; X.strokeStyle = rgba(K.paper, .75 * (o.halo ?? 1)); X.strokeText(s, x, y);
  X.fillStyle = rgba(col, .55); X.fillText(s, x + .8, y + .6); X.fillStyle = rgba(col, .85); X.fillText(s, x, y);
  X.restore();
}
function fitSize(s, base, maxW, italic = false) { let sz = base; X.font = `${italic ? 'italic ' : ''}${sz}px ${SERIF}`; while (X.measureText(s).width > maxW && sz > 20) { sz -= 2; X.font = `${italic ? 'italic ' : ''}${sz}px ${SERIF}`; } return sz; }
// pen leader line that grows to its target
function leader(x0, y0, x1, y1, p, col = K.ink2) { if (p <= 0) return; br(qcurve(x0, y0, x1, y1, 30, 14), 3, col, { prof: 'even', nb: 0, a: .8 }, p); if (p >= 1) wblob(x1, y1, 7, 7, col, .7); }
function note(t, t0, s, x, y, size, tx, ty, o = {}) { // label + leader to target
  const p = eio(seg(t, t0, t0 + (o.d || .8)));
  if (tx != null) withSeed(o.seed || 900, () => leader(x + (o.lx || 0), y + (o.ly || size * .7), tx, ty, seg(t, t0 + .3, t0 + 1.0), o.lcol));
  htext(s, x, y, size, o.col || K.ink, { p, align: o.align, italic: o.italic, halo: o.halo });
}
// vermilion rubber stamp, painted
function stamp(t, t0, x, y, txt, size = 60) {
  const a = seg(t, t0, t0 + .2); if (a <= 0) return; const s = lerp(1.6, 1, eo(a));
  X.save(); X.translate(x, y); X.rotate(-.08); X.scale(s, s); X.globalAlpha *= clamp(a * 2);
  X.font = `${size}px ${SERIF}`; const w = X.measureText(txt).width + 60, h = size * 1.6;
  withSeed(77, () => { for (const [x0, y0, x1, y1] of [[-w / 2, -h / 2, w / 2, -h / 2], [w / 2, -h / 2, w / 2, h / 2], [w / 2, h / 2, -w / 2, h / 2], [-w / 2, h / 2, -w / 2, -h / 2]]) br(qcurve(x0, y0, x1, y1, rnd(-4, 4), 8), 7, K.ver, { prof: 'even', nb: 2, a: .85 }); });
  X.fillStyle = rgba(K.ver, .88); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(txt, 0, 4);
  X.restore();
}

// ---------- props ----------
// round loaf (local, centre). p = painting-in progress
function loaf(x, y, s = 1, p = 1, o = {}) {
  withSeed(o.seed || 301, () => {
    X.save(); X.translate(x, y); X.scale(s, s);
    const k = q => seg(p, q, q + .35);
    if (k(0) > 0) { X.globalAlpha = k(0); wblob(0, 8, 150, 26, K.grey, .25); X.globalAlpha = 1; }
    if (k(0) > 0) { const a = k(0); wblob(0, -40, 140 * lerp(.6, 1, a), 78 * lerp(.6, 1, a), K.ochre, .75 * a); }
    if (k(.2) > 0) { X.globalAlpha = k(.2); wblob(20, -22, 118, 52, K.crust, .45); wblob(-50, -78, 52, 22, K.crumb, .5); X.globalAlpha = 1; }
    if (k(.45) > 0) { const q = k(.45); for (let i = 0; i < 4; i++) br(qcurve(-80 + i * 46, -95 + i * 6, -40 + i * 46, -30 + i * 3, 10, 8), 9, K.ochreD, { prof: 'leaf', nb: 3, a: .8 }, q); }
    if (k(.6) > 0) edge(qcurve(-140, -30, 140, -30, -60, 18), K.brownD, 4, .6, k(.6));
    X.restore();
  });
}
// half loaf (side: -1 left half, 1 right half), cut face shows crumb
function halfLoaf(x, y, s, side, rot = 0) {
  withSeed(310 + side, () => {
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(s * side, s);
    const pts = []; for (let i = 0; i <= 16; i++) { const a = Math.PI / 2 + i / 16 * Math.PI; pts.push([Math.cos(a) * 140, -40 + Math.sin(a) * 78]); }
    pts.push([8, -100], [-4, -70], [10, -40], [-6, -10], [6, 30]);
    wash(pts, K.ochre, .75, 3);
    wblob(-60, -20, 60, 44, K.crust, .4);
    wash([[2, -112], [-14, -70], [2, -40], [-12, -8], [0, 34], [-26, 30], [-34, -40], [-26, -104]], K.crumb, .85, 2);
    for (let i = 0; i < 6; i++) wblob(-18 + rnd(-6, 6), -90 + i * 22, 3, 3, K.ochreD, .5);
    edge(qcurve(-130, -10, -10, 36, -20, 8), K.brownD, 3.5, .55);
    X.restore();
  });
}
function wheat(x, y, s = 1, rot = 0) {
  withSeed(330 + (x | 0), () => {
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
    br(qcurve(0, 0, 10, -260, 14, 12), 5, K.ochreD, { prof: 'even', nb: 2, a: .8 });
    for (let i = 0; i < 8; i++) { const yy = -170 - i * 13, sd = i % 2 ? 1 : -1; br(qcurve(6, yy, 6 + sd * 22, yy - 22, 4, 5), 11, K.ochre, { prof: 'leaf', nb: 3, a: .85 }); }
    br(qcurve(10, -268, 14, -300, 2, 4), 2, K.ochreD, { prof: 'even', nb: 0 });
    X.restore();
  });
}

// ---------- characters (painted; feet at 0,0) ----------
// face: eyes, brows, mouth driven by speech
function face(hx, hy, r, o) {
  const lk = (o.look || 0) * r * .12, bl = o.blink ? .15 : 1, dir = o.flip ? -1 : 1;
  withSeed(o.fs || 600, () => {
    wblob(hx - r * .45 * dir, hy + r * .25, r * .2, r * .13, K.wine, .18);
    wblob(hx + r * .45 * dir, hy + r * .25, r * .2, r * .13, K.wine, .18);
    for (const ex of [-.33, .33]) { X.fillStyle = rgba(K.ink, .9); X.beginPath(); X.ellipse(hx + ex * r + lk, hy - r * .05, r * .075, r * .1 * bl, 0, 0, TAU); X.fill(); }
    const b = o.brow || 0;
    edge([[hx - r * .5, hy - r * .3 + b * 4], [hx - r * .18, hy - r * .36 - b * 3]], K.ink2, 3.2, .8);
    edge([[hx + r * .18, hy - r * .36 - b * 3], [hx + r * .5, hy - r * .3 + b * 4]], K.ink2, 3.2, .8);
    const m = o.mouth || 0;
    if (m > .12) { X.fillStyle = rgba(K.wine, .8); X.beginPath(); X.ellipse(hx + lk * .5, hy + r * .42, r * .16, r * (.05 + m * .14), 0, 0, TAU); X.fill(); }
    else { const sm = o.smile ?? 1; edge(qcurve(hx - r * .2, hy + r * .38, hx + r * .2, hy + r * .38, -sm * 8, 6), K.wine, 3.5, .8); }
  });
}
// traveller: cloak, hood, staff. o: col, hood, beard, mouth, blink, brow, look, walk (phase), arm (0 down .. 1 offering forward), hold (fn drawn at hand)
function traveller(x, y, s, o = {}) {
  const col = o.col || K.brown, dark = o.dark || K.brownD, ph = o.walk ?? null, dir = o.flip ? -1 : 1;
  X.save(); X.translate(x, y); X.scale(s, s);
  withSeed(o.seed || 400, () => {
    wblob(0, 6, 110, 18, K.grey, .22);
    // legs
    const sw = ph == null ? 0 : Math.sin(ph) * .32, bob = ph == null ? 0 : Math.abs(Math.cos(ph)) * 6;
    X.translate(0, -bob);
    br(qcurve(-22, -170, -22 + Math.sin(sw) * 120, -6, 4, 6), 24, K.ink2, { prof: 'even', nb: 3, a: .8 });
    br(qcurve(22, -170, 22 - Math.sin(sw) * 120, -6, -4, 6), 24, K.ink2, { prof: 'even', nb: 3, a: .8 });
    wblob(-22 + Math.sin(sw) * 120 + 10 * dir, -2, 26, 12, K.brownD, .8); wblob(22 - Math.sin(sw) * 120 + 10 * dir, -2, 26, 12, K.brownD, .8);
    // staff behind
    if (o.staff) br(qcurve(-90 * dir, 10, -70 * dir, -470, 8 * dir, 10), 10, K.brownD, { prof: 'even', nb: 3, a: .85 });
    // cloak
    const cl = [[-62, -350], [62, -350], [92, -150], [104, -70], [60, -58], [0, -66], [-60, -56], [-104, -72], [-90, -160]];
    wash(cl, col, .72, 4); wash([[10 * dir, -340], [62 * dir, -350], [104 * dir, -70], [40 * dir, -60]], dark, .3, 4);
    edge(qcurve(-62, -350, -104, -72, 14, 10), dark, 4, .7); edge(qcurve(62, -350, 104, -72, -14, 10), dark, 4, .7);
    edge(qcurve(-100, -70, 100, -70, -12, 10), dark, 3, .5);
    for (let i = 0; i < 3; i++) edge(qcurve(-30 + i * 30, -300, -40 + i * 36, -90, 10, 8), dark, 2.5, .35);
    // belt + satchel
    br(qcurve(-70, -210, 72, -214, -6, 8), 12, o.belt || K.ochreD, { prof: 'even', nb: 3, a: .8 });
    if (o.bag) { wblob(-70 * dir, -170, 38, 34, K.ochreD, .7); edge(qcurve(-40 * dir, -350, -70 * dir, -200, 10, 8), K.brownD, 4, .7); }
    // back arm (hangs)
    br(qcurve(-58 * dir, -330, -78 * dir, -190, -10 * dir, 8), 30, col, { prof: 'even', nb: 4, a: .8 });
    wblob(-80 * dir, -182, 16, 16, K.skin, .85);
    // head
    const hx = 0, hy = -400, r = 48;
    if (o.hood) { wash(blob(hx - 4 * dir, hy - 6, r + 24, r + 26, 30, .05), col, .7, 3); wash(blob(hx + 6 * dir, hy + 4, r + 4, r + 6, 26, .05), dark, .25, 2); }
    wash(blob(hx + 4 * dir, hy + 4, r, r + 2, 26, .05), K.skin, .85, 2);
    wblob(hx + 10 * dir, hy + 20, r * .7, r * .5, K.skinD, .22);
    if (o.hair) { wash([[hx - r, hy - 4], [hx - r * .8, hy - r * .9], [hx, hy - r * 1.18], [hx + r * .85, hy - r * .9], [hx + r, hy - 8], [hx + r * .6, hy - r * .55], [hx - r * .5, hy - r * .6]], o.hair, .8, 2);
      if (o.braid) br(qcurve(hx - r * .9 * dir, hy - 10, hx - r * 1.2 * dir, hy + 90, -10 * dir, 8), 18, o.hair, { prof: 'tip', nb: 4, a: .85 }); }
    if (o.beard) { wash([[hx - r * .8, hy + 10], [hx + r * .85, hy + 10], [hx + r * .6, hy + r * .9], [hx, hy + r * 1.45], [hx - r * .6, hy + r * .9]], o.beard, .75, 3); }
    face(hx + 4 * dir, hy, r, Object.assign({}, o, { fs: (o.seed || 400) + 7 }));
    if (o.beard && (o.mouth || 0) > .12) { X.fillStyle = rgba(K.wine, .75); X.beginPath(); X.ellipse(hx + 4 * dir, hy + r * .5, r * .15, r * (.04 + o.mouth * .1), 0, 0, TAU); X.fill(); }
    // front arm: angle from down (0) to forward/out (1)
    const a = o.arm || 0, ang = lerp(1.75, .15, a) , sx = 56 * dir, sy = -330;
    const ex = sx + Math.cos(ang) * 92 * dir, ey = sy + Math.sin(ang) * 92, hxx = ex + Math.cos(ang - .35 * a) * 80 * dir, hyy = ey + Math.sin(ang - .35 * a) * 80;
    br([[sx, sy], [ex, ey], [hxx, hyy]], 30, col, { prof: 'even', nb: 4, a: .85 });
    wblob(hxx, hyy, 16, 16, K.skin, .9);
    if (o.hold) { X.save(); X.translate(hxx, hyy); X.scale(dir, 1); o.hold(); X.restore(); }
  });
  X.restore();
}
// dog (feet at 0)
function dog(x, y, s, o = {}) {
  const ph = o.walk ?? 0, dir = o.flip ? -1 : 1;
  X.save(); X.translate(x, y); X.scale(s * dir, s);
  withSeed(o.seed || 700, () => {
    wblob(0, 4, 100, 14, K.grey, .2);
    const bob = Math.abs(Math.sin(ph)) * 5; X.translate(0, -bob);
    for (const [lx, q] of [[-60, 0], [-36, Math.PI], [44, Math.PI], [66, 0]]) br(qcurve(lx, -70, lx + Math.sin(ph + q) * 18, -2, 3, 5), 16, K.brown, { prof: 'even', nb: 3, a: .85 });
    br(qcurve(-80, -100, -130, -150 + Math.sin(T * 9) * 16, 10, 8), 14, K.brown, { prof: 'tip', nb: 3, a: .85 });
    wash(blob(0, -100, 92, 42, 28, .06), K.ochreD, .75, 3); wblob(10, -82, 60, 18, K.crumb, .45);
    wash(blob(92, -150, 44, 38, 24, .06), K.ochreD, .8, 2);
    wash(blob(128, -136, 26, 18, 18, .05), K.crumb, .85, 2);
    wblob(148, -142, 8, 7, K.ink, .9);
    wash([[70, -176], [96, -186], [86, -120], [66, -132]], K.brownD, .8, 2);
    X.fillStyle = rgba(K.ink, .9); X.beginPath(); X.ellipse(104, -160, 6, o.blink ? 1 : 7, 0, 0, TAU); X.fill();
    br(qcurve(118, -118, 138, -112, -4, 4), 6, K.wine, { prof: 'even', nb: 0, a: .7 });
    br(qcurve(56, -130, 74, -112, 0, 4), 9, K.ver, { prof: 'even', nb: 0, a: .8 });
  });
  X.restore();
}

// ---------- settings ----------
function landscape(o = {}) { // sky + three hills + road; o.dusk / o.day / o.sunset
  const sky0 = o.sky0 || K.peach, sky1 = o.sky1 || K.lav;
  withSeed(o.seed || 101, () => {
    vgrad(-100, o.hy || 1100, sky1, sky0, .55, 5);
    if (o.sun) wblob(o.sun[0], o.sun[1], 90, 90, o.sunCol || K.fireL, .55);
    wash([[-80, 1000], [200, 880], [460, 950], [700, 860], [1000, 930], [1160, 900], [1160, 1300], [-80, 1300]], o.far || K.lav, .5, 8);
    wash([[-80, 1080], [260, 990], [620, 1060], [900, 1000], [1160, 1050], [1160, 1500], [-80, 1500]], o.mid || K.sage, .6, 8);
    wash([[-80, 1180], [400, 1130], [800, 1170], [1160, 1140], [1160, 2050], [-80, 2050]], o.near || K.moss, .55, 8);
    wash([[470, 1150], [600, 1150], [1000, 2050], [80, 2050]], o.road || K.crumb, .8, 6);
    edge(qcurve(470, 1150, 80, 2000, 20, 12), K.ochreD, 4, .4); edge(qcurve(600, 1150, 1000, 2000, -20, 12), K.ochreD, 4, .4);
    for (let i = 0; i < 26; i++) { const gx = rnd(-40, 1120), gy = rnd(1200, 1900); if (gx > 300 && gx < 800) continue; br(qcurve(gx, gy, gx + rnd(-10, 10), gy - rnd(30, 60), rnd(-8, 8), 5), 7, rnd() < .5 ? K.sageD : K.green, { prof: 'leaf', nb: 2, a: .7 }); }
    if (o.trees) for (const [tx, ty, ts] of o.trees) tree(tx, ty, ts);
  });
}
function tree(x, y, s) { withSeed(500 + (x | 0), () => { X.save(); X.translate(x, y); X.scale(s, s);
  br(qcurve(0, 0, 6, -220, 6, 10), 26, K.brownD, { prof: 'tip', nb: 5, a: .85 });
  for (let i = 0; i < 5; i++) wblob(rnd(-70, 70), -250 + rnd(-60, 50), rnd(60, 90), rnd(50, 70), i % 2 ? K.green : K.sageD, .55);
  X.restore(); }); }
function milestone(x, y, s = 1) { withSeed(520, () => { X.save(); X.translate(x, y); X.scale(s, s);
  wash([[-60, 0], [-56, -150], [-30, -190], [30, -190], [56, -150], [60, 0]], K.grey, .7, 3); wblob(20, -90, 30, 80, '#6f6862', .25);
  edge(qcurve(-60, 0, -56, -150, 4, 6), K.ink2, 3, .6); htext('M', 0, -120, 46, K.ink2, { italic: false }); X.restore(); }); }

// ---------- voice data ----------
let Z = null; const L = {};
const T0 = id => L[id] ? L[id].t0 : 0, T1 = id => L[id] ? L[id].t1 : 0;
function talking(t, ids) { for (const id of ids) { const l = L[id]; if (!l || t < l.t0 || t > l.t1) continue;
  for (const k of l.kelimeler || []) if (t >= k.t0 && t <= k.t1) { const u = (t - k.t0) / Math.max(.08, k.t1 - k.t0); return Math.abs(Math.sin(u * Math.PI * Math.max(1, Math.round((k.t1 - k.t0) * 6)))) * .9 + .1; } } return 0; }
const CEND = () => Math.max(Z.dur - 3.0, T1('s13') + .15);
const blink = (t, ph = 0) => ((t + ph) % 3.4) < .12;

// ---------- subtitles: on the paper, serif italic, key words vermilion ----------
const KEY = /^(companion|companio|compaignon|compagnon|company|com|panis|com-)[.,!?'’]*$/i;
const TR = { s12: 'Uzun yolculukta köpeği onun tek yoldaşı ve en büyük tesellisiydi.' };
function wrap(words, maxW) { const out = [[]]; let w = 0; const sp = X.measureText(' ').width;
  words.forEach(wd => { const ww = X.measureText(wd).width; if (w + ww > maxW && out[out.length - 1].length) { out.push([]); w = 0; } out[out.length - 1].push(wd); w += ww + sp; }); return out; }
function caption(t) {
  if (!Z) return; const l = Z.satirlar.find(l => t >= l.t0 - .15 && t <= l.t1 + .45); if (!l) return;
  const words = l.metin.split(' '), kel = l.kelimeler || [];
  const heard = kel.filter(k => k.t0 <= t).length, shown = t > l.t1 ? words.length : Math.max(1, Math.round(heard * words.length / Math.max(1, kel.length)));
  scr(); X.save();
  const a = ss(seg(t, l.t0 - .15, l.t0 + .1)) * (1 - ss(seg(t, l.t1 + .2, l.t1 + .45)));
  X.font = `italic 50px ${SERIF}`; const rows = wrap(words, 820), lh = 62, tr = TR[l.id];
  X.font = `italic 34px ${SERIF}`; const trr = tr ? wrap(tr.split(' '), 820) : [];
  const total = rows.length * lh + trr.length * 44 + (tr ? 14 : 0), yb = 1520 - total;
  // soft paper mist behind the text
  X.globalAlpha = a * .82; withSeed(950, () => band(50, yb - 28, 990, 1520 + 6, K.paper, .9, { wv: 8, j: 6 }));
  X.globalAlpha = a; X.textBaseline = 'middle'; X.textAlign = 'left'; X.font = `italic 50px ${SERIF}`; let n = 0;
  rows.forEach((r, ri) => { const rw = X.measureText(r.join(' ')).width; let x = 480 - rw / 2; const y = yb + lh * ri + lh / 2;
    r.forEach(wd => { const vis = n < shown; X.globalAlpha = a * (vis ? 1 : .22); X.fillStyle = KEY.test(wd) ? K.ver : (l.dil === 'en' ? K.blueD : K.ink); X.fillText(wd, x, y); x += X.measureText(wd + ' ').width; n++; }); });
  if (tr) { X.globalAlpha = a * ss(seg(t, l.t0 + .8, l.t0 + 1.2)); X.font = `italic 34px ${SERIF}`; X.fillStyle = K.ink2; X.textAlign = 'center'; trr.forEach((r, i) => X.fillText(r.join(' '), 480, yb + rows.length * lh + 14 + i * 44 + 22)); }
  X.restore();
}

