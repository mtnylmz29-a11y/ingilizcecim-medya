// Kelimelerin Tarihçesi: Nice — ağaç baskı (woodcut) — ingilizcecim.com
// Kod bizimdir. Ağaç baskı dilbilgisi (siyah = tahta, beyaz = bıçağın oyduğu yer, tek renk kalıbı) lemo-opuscar woodcut stilinden (MIT) uyarlandı.
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const back = (t, s = 1.7) => { t = clamp(t) - 1; return 1 + t * t * ((s + 1) * t + s); };
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const TAU = Math.PI * 2, W = 1080, H = 1920;
const C = document.getElementById('c'), X = C.getContext('2d', { willReadFrequently: true });
const KAPAK = /kapak=1/.test(location.search);
const INK = '#1b1612', PAP = '#ece2cc', PAPD = '#d9cba9', COL = '#cf5f27', COLL = '#e9a04a';
const SERIF = "'IM Fell English', Georgia, serif";
const PL = { x0: 56, y0: 300, x1: 1024, y1: 1330 };
let RNG = mulberry(1); const R = () => RNG();
function seed(n, fn) { const k = RNG; RNG = mulberry(n | 0); try { return fn(); } finally { RNG = k; } }

// ---------- carving primitives ----------
function cut(g, x0, y0, x1, y1, w, col = PAP, p = 1) {
  if (p <= 0 || w <= .3) return; x1 = x0 + (x1 - x0) * p; y1 = y0 + (y1 - y0) * p;
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, n = 6, A = [], B = [];
  for (let i = 0; i <= n; i++) { const s = i / n, ww = w * (1 - .8 * Math.pow(s, 1.6)) * (1 + .22 * (R() - .5)), x = x0 + dx * s, y = y0 + dy * s; A.push([x + nx * ww / 2, y + ny * ww / 2]); B.push([x - nx * ww / 2, y - ny * ww / 2]); }
  g.beginPath(); A.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); for (let i = B.length - 1; i >= 0; i--) g.lineTo(B[i][0], B[i][1]); g.closePath(); g.fillStyle = col; g.fill();
}
function hatch(g, path, bb, ang, gap, w, o = {}) {
  g.save(); g.beginPath(); path(g); g.clip();
  const c = Math.cos(ang), s = Math.sin(ang), cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2, Rr = Math.hypot(bb[2] - bb[0], bb[3] - bb[1]) / 2 + 20;
  const l0 = o.l0 ?? 40, l1 = o.l1 ?? 150;
  for (let d = -Rr; d <= Rr; d += gap * (.85 + .3 * R())) {
    let a = -Rr + R() * 40;
    while (a < Rr) { const b = Math.min(Rr, a + l0 + R() * (l1 - l0)), px = cx - s * d, py = cy + c * d;
      const mx = px + c * (a + b) / 2, my = py + s * (a + b) / 2, ww = (o.wf ? o.wf(mx, my) : 1) * w;
      if (ww > .5) cut(g, px + c * a, py + s * a, px + c * b, py + s * b, ww * (.8 + .4 * R()), o.col || PAP);
      a = b + (o.gp ?? 6) + R() * 12; }
  }
  g.restore();
}
const rectP = (x, y, w, h) => g => g.rect(x, y, w, h);
const ellP = (cx, cy, rx, ry) => g => g.ellipse(cx, cy, rx, ry, 0, 0, TAU);
const polyP = pts => g => { pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); };
function fillP(g, path, col) { g.beginPath(); path(g); g.fillStyle = col; g.fill(); }
function haloP(g, path, w = 7) { g.beginPath(); path(g); g.lineJoin = 'round'; g.lineWidth = w; g.strokeStyle = PAP; g.stroke(); }
function wob(pts, a = 4) { return pts.map(q => [q[0] + (R() - .5) * a, q[1] + (R() - .5) * a]); }
// carved sky: white with remaining wood streaks, darker toward the top
function sky(g, x0, y0, x1, y1, o = {}) {
  fillP(g, rectP(x0, y0, x1 - x0, y1 - y0), PAP);
  hatch(g, rectP(x0, y0, x1 - x0, y1 - y0), [x0, y0, x1, y1], o.ang ?? -.04, o.gap ?? 15, o.w ?? 9, { col: INK, l0: 60, l1: 260, gp: 18, wf: (x, y) => o.wf ? o.wf(x, y) : clamp(1.15 - (y - y0) / (y1 - y0) * 1.25) });
}
function rays(g, cx, cy, r0, r1, n, w, col = PAP, p = 1, a0 = 0, a1 = TAU) {
  for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * (i + .5) / n + (R() - .5) * .05, rr = r1 * (.7 + .3 * R()); cut(g, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, w * (.7 + .5 * R()), col, p); }
}
function ground(g, y0, y1, o = {}) { // black earth with sparse cuts, coarser near
  hatch(g, rectP(PL.x0, y0, PL.x1 - PL.x0, y1 - y0), [PL.x0, y0, PL.x1, y1], o.ang ?? .03, o.gap ?? 22, o.w ?? 5, { l0: 20, l1: 90, gp: 26, wf: (x, y) => .3 + .9 * (y - y0) / (y1 - y0) });
}
function stabs(g, n, x0, y0, x1, y1, r0 = 2, r1 = 5, col = PAP) { for (let i = 0; i < n; i++) { g.beginPath(); g.arc(lerp(x0, x1, R()), lerp(y0, y1, R()), lerp(r0, r1, R()), 0, TAU); g.fillStyle = col; g.fill(); } }
// carved letters
function carveText(g, txt, x, y, size, col = PAP, o = {}) {
  const FF = /\d/.test(txt) ? "'Fredoka', sans-serif" : null; if (FF) size *= .82;
  g.save(); g.font = FF ? `600 ${size}px ${FF}` : `${o.it ? 'italic ' : ''}${size}px ${SERIF}`; g.textAlign = o.al || 'center'; g.textBaseline = 'middle';
  if (o.max) { const w = g.measureText(txt).width; if (w > o.max) { size *= o.max / w; g.font = FF ? `600 ${size}px ${FF}` : `${o.it ? 'italic ' : ''}${size}px ${SERIF}`; } }
  if (o.halo) { g.lineWidth = o.halo; g.strokeStyle = o.hcol || INK; g.lineJoin = 'round'; g.strokeText(txt, x, y); }
  g.fillStyle = col; g.fillText(txt, x, y); g.restore();
}
function banner(g, x, y, w, h, txt, size, o = {}) { // carved scroll: white strip with ink letters
  const pts = wob([[x - w / 2, y - h / 2], [x + w / 2, y - h / 2 + 4], [x + w / 2 - 6, y + h / 2], [x - w / 2 + 4, y + h / 2 - 3]], 6);
  haloP(g, polyP(pts), 0); fillP(g, polyP(pts), o.bg || PAP);
  // rolled ends
  for (const sx of [-1, 1]) { const ex = x + sx * w / 2; fillP(g, polyP(wob([[ex, y - h / 2], [ex + sx * 36, y - h / 2 + 12], [ex + sx * 22, y + h / 2 + 10], [ex, y + h / 2]], 4)), o.bg || PAP); cut(g, ex, y - h / 2 + 6, ex + sx * 18, y + h / 2 + 4, 3, INK); }
  carveText(g, txt, x, y + 3, size, o.col || INK, { max: w - 30, it: o.it });
}

// ---------- the actor: black cut silhouette, carved white face and hands ----------
function ik(sx, sy, tx, ty, l, bend) { let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy); const dd = Math.min(d, 2 * l * .999); const a = Math.atan2(dy, dx), b = Math.acos(clamp(dd / (2 * l), -1, 1)) * bend; return [sx + Math.cos(a + b) * l, sy + Math.sin(a + b) * l, sx + Math.cos(a) * dd, sy + Math.sin(a) * dd]; }
function kisi(g, x, y, s, o = {}) {
  const f = o.yon ?? 1; // facing: 1 right, -1 left
  g.save(); g.translate(x, y); g.scale(s * f, s); g.rotate((o.lean || 0) * f);
  seed(o.id || 7, () => {
    const govde = o.govde || 'cuppe', hem = govde === 'cuppe' ? 0 : -110;
    const body = polyP(wob(govde === 'cuppe' ? [[-50, -255], [50, -255], [66, -120], [84, -8], [-84, -8], [-66, -120]] : govde === 'ceket' ? [[-50, -255], [50, -255], [60, -110], [-60, -110]] : [[-50, -255], [50, -255], [62, -100], [-62, -100]], 3));
    const legs = [];
    if (govde !== 'cuppe') { const st = o.adim || 0; legs.push([[-24, hem], [-26 - st * 26, -6]], [[24, hem], [26 + st * 26, -6]]); }
    const arms = [];
    for (const side of [-1, 1]) { const tgt = (side < 0 ? o.solEl : o.sagEl) || [side * 66, -130]; const sh = [side * 44, -238];
      const [ex, ey, hx, hy] = ik(sh[0], sh[1], tgt[0], tgt[1], 72, side < 0 ? 1 : -1); arms.push([sh, [ex, ey], [hx, hy]]); }
    // halo pass
    g.lineCap = 'round'; g.lineJoin = 'round';
    haloP(g, body, 9); legs.forEach(l => { g.beginPath(); g.moveTo(...l[0]); g.lineTo(...l[1]); g.lineWidth = 34; g.strokeStyle = PAP; g.stroke(); });
    arms.forEach(a => { g.beginPath(); g.moveTo(...a[0]); g.lineTo(...a[1]); g.lineTo(...a[2]); g.lineWidth = 34; g.strokeStyle = PAP; g.stroke(); });
    g.beginPath(); g.arc(0, -322, 56, 0, TAU); g.lineWidth = 9; g.strokeStyle = PAP; g.stroke();
    // ink pass
    legs.forEach(l => { g.beginPath(); g.moveTo(...l[0]); g.lineTo(...l[1]); g.lineWidth = 26; g.strokeStyle = INK; g.stroke(); fillP(g, ellP(l[1][0] + 10, l[1][1], 22, 9), INK); haloP(g, ellP(l[1][0] + 10, l[1][1], 22, 9), 3); fillP(g, ellP(l[1][0] + 10, l[1][1], 22, 9), INK); });
    fillP(g, body, INK);
    // grazing light on the lit (front) edge, folds follow the cloth
    hatch(g, body, [-90, -260, 90, 0], 1.48, 9, 4.2, { l0: 30, l1: 90, gp: 10, wf: xx => clamp((xx - 8) / 50) });
    if (govde === 'cuppe') { cut(g, -46, -150, 46, -152, 5); cut(g, -40, -142, 40, -143, 2); }
    if (govde === 'ceket') { cut(g, 0, -250, 2, -112, 3); for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(10, -220 + i * 38, 4, 0, TAU); g.fillStyle = PAP; g.fill(); } }
    if (o.toga) { cut(g, -48, -250, 60, -40, 7); cut(g, -40, -230, 66, -60, 3); }
    if (o.yaka === 'firfir') { for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI; } g.beginPath(); g.ellipse(0, -262, 62, 18, 0, 0, TAU); g.fillStyle = PAP; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; for (let i = -54; i <= 54; i += 12) { g.beginPath(); g.moveTo(i, -276); g.quadraticCurveTo(i + 6, -262, i, -248); g.stroke(); } }
    arms.forEach((a, i) => { g.beginPath(); g.moveTo(...a[0]); g.lineTo(...a[1]); g.lineTo(...a[2]); g.lineWidth = 26; g.strokeStyle = INK; g.stroke();
      cut(g, a[0][0] + 6, a[0][1] + 4, a[1][0] + 6, a[1][1], 3); g.beginPath(); g.arc(a[2][0], a[2][1], 15, 0, TAU); g.fillStyle = PAP; g.fill(); });
    // head
    fillP(g, ellP(0, -322, 52, 54), INK);
    const bk = (o.bak || 0) * 6, fx = 8 + bk;
    fillP(g, ellP(fx, -316, 38, 43), PAP);
    // hair / hat (ink, behind face edge)
    hat(g, o.sapka || 'yok');
    if (o.sakal) { fillP(g, polyP([[fx - 34, -306], [fx + 36, -306], [fx + 30, -268], [fx, -244], [fx - 30, -268]]), INK); for (let i = -24; i <= 24; i += 8) cut(g, fx + i, -300, fx + i * .7, -256, 2.5); fillP(g, ellP(fx, -293, 16, 6), PAP); }
    face(g, fx, -316, o);
  });
  g.restore();
}
function hat(g, k) {
  if (k === 'yok') { fillP(g, polyP([[-52, -330], [-46, -368], [-10, -380], [30, -378], [50, -350], [40, -360], [0, -360], [-30, -340]]), INK); return; }
  if (k === 'sac') { fillP(g, polyP([[-54, -320], [-50, -368], [-14, -386], [34, -382], [56, -350], [52, -330], [40, -352], [6, -362], [-26, -350], [-38, -318]]), INK); for (let i = 0; i < 5; i++) cut(g, -30 + i * 14, -376, -20 + i * 16, -356, 3); return; }
  if (k === 'defne') { hat(g, 'yok'); for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i / 8 * .9), cx = Math.cos(a) * 54, cy = -322 + Math.sin(a) * 54; g.save(); g.translate(cx, cy); g.rotate(a + Math.PI / 2); fillP(g, ellP(0, 0, 11, 5), PAP); g.restore(); } return; }
  if (k === 'kukuleta') { const p = polyP([[-60, -290], [-62, -360], [-30, -392], [-80, -420], [-110, -380], [-96, -430], [-40, -430], [0, -400], [40, -440], [96, -430], [110, -372], [76, -410], [40, -392], [62, -350], [58, -290], [40, -300], [44, -350], [0, -372], [-44, -350], [-40, -300]]);
    haloP(g, p, 7); fillP(g, p, INK); hatch(g, p, [-110, -440, 110, -290], .9, 10, 3.5, { l0: 20, l1: 50 }); for (const [bx, by] of [[-110, -378], [110, -370]]) { g.beginPath(); g.arc(bx, by, 11, 0, TAU); g.fillStyle = PAP; g.fill(); g.beginPath(); g.arc(bx, by + 3, 3, 0, TAU); g.fillStyle = INK; g.fill(); } return; }
  if (k === 'bere') { const p = polyP([[-60, -344], [-50, -384], [0, -398], [56, -384], [66, -346], [40, -356], [-40, -356]]); haloP(g, p, 6); fillP(g, p, INK); cut(g, -50, -352, 58, -352, 4); return; }
  if (k === 'baslik') { const p = polyP([[-62, -250], [-64, -340], [-40, -380], [0, -392], [44, -380], [66, -340], [60, -250], [44, -260], [46, -330], [0, -360], [-44, -330], [-42, -260]]); haloP(g, p, 7); fillP(g, p, INK); hatch(g, p, [-70, -400, 70, -250], 1.5, 11, 3.6, { l0: 30, l1: 80, wf: xx => clamp((xx + 10) / 60) }); return; }
  if (k === 'yassi') { hat(g, 'yok'); const p = polyP([[-78, -354], [-60, -376], [0, -388], [70, -378], [86, -356], [40, -350], [-40, -348]]); haloP(g, p, 6); fillP(g, p, INK); cut(g, 30, -380, 100, -430, 7); cut(g, 36, -384, 90, -420, 2, INK); return; }
  if (k === 'ucgen') { hat(g, 'yok'); const p = polyP([[-84, -350], [-50, -392], [0, -404], [56, -392], [90, -352], [40, -366], [-40, -366]]); haloP(g, p, 6); fillP(g, p, INK); cut(g, -80, -352, 86, -354, 4); return; }
}
function face(g, fx, fy, o) {
  const goz = o.blink ? 'cizgi' : (o.goz || 'acik'), yuz = o.yuz || 'duz', kas = o.kas || 0, ex = 15;
  g.fillStyle = INK; g.strokeStyle = INK; g.lineCap = 'round'; g.lineWidth = 4.5;
  for (const sd of [-1, 1]) { const x = fx + sd * ex + 4, y = fy - 6;
    if (goz === 'acik') { g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); }
    else if (goz === 'buyuk') { g.beginPath(); g.arc(x, y, 9, 0, TAU); g.lineWidth = 3; g.stroke(); g.beginPath(); g.arc(x + 2, y + 1, 4.5, 0, TAU); g.fill(); g.lineWidth = 4.5; }
    else if (goz === 'kapali') { g.beginPath(); g.arc(x, y + 3, 7, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else if (goz === 'kisik') { g.beginPath(); g.moveTo(x - 7, y); g.lineTo(x + 7, y - 1); g.stroke(); }
    else { g.beginPath(); g.moveTo(x - 6, y + 1); g.lineTo(x + 6, y + 1); g.stroke(); }
    // brows: kas>0 surprised up, kas<0 angry (inner end down)
    const by = y - 16 - Math.max(0, kas) * 8, inner = Math.min(0, kas) * -8, ix = x - sd * 9, ox = x + sd * 9;
    g.beginPath(); g.moveTo(ox, by); g.lineTo(ix, by + inner); g.lineWidth = 4; g.stroke(); g.lineWidth = 4.5;
  }
  g.beginPath(); g.moveTo(fx + 12, fy - 2); g.lineTo(fx + 18, fy + 12); g.lineTo(fx + 11, fy + 13); g.lineWidth = 3; g.stroke(); g.lineWidth = 4.5;
  const my = fy + 24, mx = fx + 4;
  if (yuz === 'gul') { g.beginPath(); g.arc(mx, my - 8, 13, Math.PI * .2, Math.PI * .8); g.stroke(); }
  else if (yuz === 'sirit') { g.beginPath(); g.moveTo(mx - 18, my - 4); g.quadraticCurveTo(mx, my + 22, mx + 18, my - 4); g.closePath(); g.fill(); g.fillStyle = PAP; g.fillRect(mx - 12, my - 3, 24, 5); g.fillStyle = INK; }
  else if (yuz === 'o') { g.beginPath(); g.ellipse(mx, my, 7, 9, 0, 0, TAU); g.fill(); }
  else if (yuz === 'uzgun') { g.beginPath(); g.arc(mx, my + 12, 12, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
  else if (yuz === 'kizgin') { g.beginPath(); g.moveTo(mx - 12, my + 4); g.lineTo(mx - 4, my); g.lineTo(mx + 4, my + 3); g.lineTo(mx + 12, my - 1); g.stroke(); }
  else if (yuz === 'kivrik') { g.beginPath(); g.moveTo(mx - 10, my + 1); g.quadraticCurveTo(mx + 4, my + 6, mx + 13, my - 5); g.stroke(); }
  else { g.beginPath(); g.moveTo(mx - 9, my); g.lineTo(mx + 9, my); g.stroke(); }
  if (o.ter) { g.beginPath(); g.ellipse(fx - 30, fy - 24, 5, 8, 0, 0, TAU); g.fillStyle = PAP; g.fill(); g.lineWidth = 2; g.stroke(); }
}

// ---------- props ----------
function house(g, x, y, w, h, o = {}) { // half-timbered house: ink block with carved timbers and a lit window
  const roof = polyP(wob([[x - 12, y - h], [x + w / 2, y - h - w * .55], [x + w + 12, y - h]], 4));
  haloP(g, roof, 6); haloP(g, rectP(x, y - h, w, h), 6); fillP(g, rectP(x, y - h, w, h), INK); fillP(g, roof, INK);
  hatch(g, roof, [x - 12, y - h - w * .6, x + w + 12, y - h], .5, 11, 3.5, { l0: 16, l1: 40 });
  cut(g, x + 6, y - h + 8, x + w - 6, y - h + 8, 5); cut(g, x + 6, y - h * .5, x + w - 6, y - h * .5, 5);
  cut(g, x + w * .5, y - h + 8, x + w * .5, y - 6, 4); cut(g, x + 8, y - h * .5, x + w * .48, y - h + 10, 4); cut(g, x + w * .52, y - h + 10, x + w - 8, y - h * .5, 4);
  const wx = x + w * .2, wy = y - h * .4, ww = w * .2, wh = h * .22;
  fillP(g, rectP(wx, wy, ww, wh), o.lamba ? COLL : PAP); cut(g, wx + ww / 2, wy, wx + ww / 2, wy + wh, 3, INK); cut(g, wx, wy + wh / 2, wx + ww, wy + wh / 2, 3, INK);
  fillP(g, rectP(x + w * .6, y - h * .38, w * .24, h * .38), PAP); fillP(g, rectP(x + w * .63, y - h * .34, w * .18, h * .34), INK);
}
function cobbles(g, y0, y1) { for (let y = y0 + 8; y < y1; y += 22 + (y - y0) * .05) { const hgt = 10 + (y - y0) * .04; for (let x = PL.x0 + R() * 40; x < PL.x1; x += 40 + (y - y0) * .12) { g.beginPath(); g.ellipse(x, y, 16 + (y - y0) * .05, hgt * .45, 0, Math.PI * 1.05, Math.PI * 1.95); g.lineWidth = 3 + (y - y0) * .01; g.strokeStyle = PAP; g.stroke(); } } }
function column(g, x, y, w, h) { const p = rectP(x, y - h, w, h); haloP(g, p, 6); fillP(g, p, INK); for (let i = 1; i < 5; i++) cut(g, x + i * w / 5, y - h + 30, x + i * w / 5, y - 20, 3 + (i > 2 ? 3 : 0)); fillP(g, rectP(x - 12, y - h - 20, w + 24, 22), INK); cut(g, x - 8, y - h - 10, x + w + 8, y - h - 10, 3); fillP(g, rectP(x - 10, y - 18, w + 20, 18), INK); cut(g, x - 6, y - 8, x + w + 6, y - 8, 3); }
function lantern(g, x, y, s, fl) { g.save(); g.translate(x, y); g.scale(s, s); g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.moveTo(0, -40); g.lineTo(0, -26); g.stroke(); fillP(g, polyP([[-18, -26], [18, -26], [14, 18], [-14, 18]]), INK); fillP(g, polyP([[-11, -18], [11, -18], [9, 12], [-9, 12]]), PAP);
  const k = 1 + .12 * Math.sin(fl * 17) + .08 * Math.sin(fl * 29); fillP(g, g2 => { g2.moveTo(0, 8); g2.quadraticCurveTo(10 * k, -2, 0, -16 * k); g2.quadraticCurveTo(-10 * k, -2, 0, 8); }, COL); fillP(g, ellP(0, 2, 3.5, 5), COLL); g.restore(); }
function heart(g, x, y, r, col = COL) { g.beginPath(); g.moveTo(x, y + r * .9); g.bezierCurveTo(x - r * 1.5, y - r * .1, x - r * .7, y - r * 1.2, x, y - r * .45); g.bezierCurveTo(x + r * .7, y - r * 1.2, x + r * 1.5, y - r * .1, x, y + r * .9); g.fillStyle = col; g.fill(); }
function wave(g, y, amp, k, ph, w, col = PAP) { g.beginPath(); for (let x = PL.x0; x <= PL.x1; x += 8) { const yy = y + Math.sin(x * k + ph) * amp; x === PL.x0 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.lineWidth = w; g.strokeStyle = col; g.stroke(); }
function flower(g, x, y, r, col) { for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.save(); g.translate(x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8); g.rotate(a); fillP(g, ellP(0, 0, r * .7, r * .38), PAP); g.restore(); } fillP(g, ellP(x, y, r * .42, r * .42), col || COL); }

// ---------- voice data ----------
let Z = null; const L = {};
const T0 = id => L[id] ? L[id].t0 : 0, T1 = id => L[id] ? L[id].t1 : 0;
const blinkAt = (t, ph = 0) => ((t + ph) % 3.3) < .12;
const APT = () => { const k = (L.s01 && L.s01.kelimeler || []).find(w => /aptal/i.test(w.w)); return k ? k.t0 - .1 : 3.6; };
const CEND = () => Math.max(Z.dur - 2.6, T1('s13') + .2);

// ---------- scenes ----------
// each: from (line id or 0), bg(g) drawn once (cached), fg(g, t, u)
const STREET = g => {
  sky(g, PL.x0, PL.y0, PL.x1, 900);
  seed(11, () => { g.beginPath(); g.arc(800, 560, 70, 0, TAU); g.fillStyle = PAP; g.fill(); rays(g, 800, 560, 84, 190, 26, 5, PAP); });
  house(g, 40, 1000, 230, 300); house(g, 300, 980, 200, 360, { lamba: 1 }); house(g, 560, 1000, 240, 280); house(g, 840, 990, 210, 330, { lamba: 1 });
  fillP(g, rectP(PL.x0, 990, PL.x1 - PL.x0, PL.y1 - 990), INK); cobbles(g, 1000, PL.y1);
};
const SC = [
  { from: 0, bg: g => seed(10, () => STREET(g)), fg: (g, t, u) => {
      const A = APT(), angry = u > A, shake = angry ? Math.sin(u * 60) * 6 * (1 - seg(u, A, A + .6)) : 0;
      kisi(g, 330, 1230, .98, { id: 21, sapka: 'bere', govde: 'tunik', yuz: 'gul', goz: angry ? 'buyuk' : 'kapali', kas: angry ? 1 : 0, solEl: [-60, -130], sagEl: [120, -300], blink: blinkAt(t) });
      kisi(g, 720 + shake, 1230, 1.0, { id: 22, yon: -1, sapka: 'baslik', yuz: angry ? 'kizgin' : 'gul', goz: angry ? 'acik' : 'acik', kas: angry ? -1 : .4, solEl: angry ? [-70, -170] : [-60, -130], sagEl: angry ? [80, -170] : [60, -130], blink: blinkAt(t, 1.3) });
      const b1 = back(seg(u, .25, .55)); if (u < A + .1) { g.save(); g.translate(440, 520); g.scale(b1, b1); banner(g, 0, 0, 300, 96, '“Nice!”', 74, { it: 1 }); g.restore(); }
      if (angry) { const b2 = back(seg(u, A, A + .35)); g.save(); g.translate(560, 470); g.scale(b2, b2); g.rotate(-.04); banner(g, 0, 0, 560, 130, 'APTAL MI?!', 96, { col: COL }); g.restore();
        for (let i = 0; i < 4; i++) cut(g, 830 + i * 18, 860 - i * 6, 860 + i * 30, 800 - i * 16, 5, COL, seg(u, A + .1, A + .4)); }
    } },
  { from: 's02', bg: g => seed(20, () => {
      sky(g, PL.x0, PL.y0, PL.x1, 960); g.beginPath(); g.arc(540, 940, 120, Math.PI, 0); g.fillStyle = PAP; g.fill(); rays(g, 540, 940, 130, 420, 34, 7, PAP, 1, Math.PI, TAU);
      fillP(g, rectP(PL.x0, 940, PL.x1 - PL.x0, PL.y1 - 940), INK);
      fillP(g, polyP([[510, 940], [570, 940], [900, PL.y1], [180, PL.y1]]), PAP); for (let i = 0; i < 12; i++) { const yy = 950 + i * i * 2.9; cut(g, 540 - (yy - 940) * .95, yy, 540 + (yy - 940) * .95, yy, 2 + i * .5, INK); }
      ground(g, 960, PL.y1);
      column(g, 120, 1200, 70, 520); column(g, 860, 1200, 70, 520);
      // arch
      const ar = polyP([[330, 940], [330, 700], [360, 640], [540, 600], [720, 640], [750, 700], [750, 940], [670, 940], [670, 720], [540, 680], [410, 720], [410, 940]]); haloP(g, ar, 8); fillP(g, ar, INK); hatch(g, ar, [330, 600, 750, 940], 1.57, 14, 4, { l0: 18, l1: 46, wf: xx => clamp((xx - 520) / 200) + .2 });
      fillP(g, rectP(300, 560, 480, 70), INK); haloP(g, rectP(300, 560, 480, 70), 5); carveText(g, 'ROMA', 540, 597, 52, PAP);
    }), fg: (g, t, u) => {
      const k = back(seg(u, .2, .6)); g.save(); g.translate(540, 440); g.scale(k, k); fillP(g, rectP(-300, -95, 600, 190), INK); haloP(g, rectP(-300, -95, 600, 190), 8); carveText(g, 'nice', 0, -6, 160, PAP, { it: 1 }); cut(g, -200, 70, 200, 70, 8, COL, seg(u, .6, 1.2)); g.restore();
      const w = seg(u, 0, 4.5), s = lerp(.35, .55, w); kisi(g, 540 + Math.sin(u * 3) * 4, lerp(1060, 1180, w), s, { id: 23, toga: 1, sapka: 'defne', govde: 'cuppe', yuz: 'gul', blink: blinkAt(t) });
    } },
  { from: 's03', bg: g => seed(30, () => {
      fillP(g, rectP(PL.x0, PL.y0, PL.x1 - PL.x0, PL.y1 - PL.y0), INK);
      for (let r = 0; r < 18; r++) { const y = PL.y0 + 20 + r * 40; cut(g, PL.x0, y, PL.x1, y, 2.2); for (let x = PL.x0 + (r % 2) * 50; x < PL.x1; x += 100) cut(g, x, y, x, y + 40, 2); }
      const win = g2 => { g2.moveTo(160, 760); g2.lineTo(160, 520); g2.arc(260, 520, 100, Math.PI, 0); g2.lineTo(360, 760); g2.closePath(); };
      fillP(g, win, PAP); hatch(g, win, [160, 420, 360, 760], -.04, 14, 6, { col: INK, l0: 40, l1: 120, wf: (x, y) => .3 + (y - 420) / 500 }); cut(g, 260, 430, 260, 760, 8, INK); cut(g, 160, 600, 360, 600, 8, INK);
      for (let i = 0; i < 14; i++) cut(g, 300 + i * 16, 770, 470 + i * 34, 1300, 10 - i * .4, PAP); // light on the floor
      fillP(g, rectP(PL.x0, 1180, PL.x1 - PL.x0, PL.y1 - 1180), INK); ground(g, 1190, PL.y1);
    }), fg: (g, t, u) => {
      const s4 = t >= T0('s04') - .1, k = ss(seg(t, T0('s04') - .1, T0('s04') + .6));
      // tablet on easel
      g.lineWidth = 14; g.strokeStyle = INK; g.lineCap = 'round'; for (const [a, b] of [[[600, 1200], [680, 620]], [[960, 1200], [880, 620]]]) { g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineWidth = 22; g.strokeStyle = PAP; g.stroke(); g.lineWidth = 14; g.strokeStyle = INK; g.stroke(); }
      const tb = rectP(540, 560, 450, 300); haloP(g, tb, 10); fillP(g, tb, INK); fillP(g, rectP(560, 580, 410, 260), PAP);
      seed(31, () => hatch(g, rectP(560, 580, 410, 260), [560, 580, 970, 840], 0, 20, 2, { col: PAPD, l0: 60, l1: 200 }));
      if (!s4) { carveText(g, 'NESCIUS', 765, 670, 84, INK, { max: 380 }); carveText(g, '= bilmeyen, cahil', 765, 770, 44, INK, { it: 1, max: 380 }); }
      else {
        const dx = lerp(0, 1, k);
        carveText(g, 'NE', 640 - dx * 10, 660, 76, COL); carveText(g, '+', 720, 660, 60, INK, {}); carveText(g, 'SCIRE', 850 + dx * 10, 660, 76, INK, { max: 220 });
        g.globalAlpha = ss(seg(t, T0('s04') + .5, T0('s04') + 1.1)); carveText(g, 'değil', 640, 730, 40, COL, { it: 1 }); carveText(g, 'bilmek', 850, 730, 40, INK, { it: 1 }); g.globalAlpha = 1;
        g.globalAlpha = ss(seg(t, T0('s04') + 1.6, T0('s04') + 2.2)); carveText(g, '= NESCIUS', 765, 800, 50, INK, { max: 380 }); g.globalAlpha = 1;
      }
      const pt = Math.sin(u * 2.4) * 10;
      kisi(g, 900, 1250, .9, { id: 31, yon: -1, sapka: 'yok', sakal: 1, toga: 1, yuz: 'duz', kas: .2, solEl: [150, -300 + pt], blink: blinkAt(t, .7) });
      const scr = Math.sin(u * 9) * 8;
      kisi(g, 380, 1250, .82, { id: 32, sapka: 'yok', govde: 'tunik', toga: 0, yuz: s4 ? 'o' : 'kivrik', goz: s4 ? 'buyuk' : 'acik', kas: 1, sagEl: [30, -390 + scr], solEl: [-60, -130], bak: 1, blink: blinkAt(t, .2) });
      const q = back(seg(u, .5, .9)); g.save(); g.translate(300, 860 + Math.sin(u * 3) * 6); g.scale(q, q); fillP(g, ellP(0, 0, 50, 56), PAP); carveText(g, '?', 0, 4, 90, INK); g.restore();
    } },
  { from: 's05', bg: g => seed(40, () => {
      sky(g, PL.x0, PL.y0, PL.x1, 880); house(g, 70, 900, 200, 260); house(g, 700, 900, 260, 300, { lamba: 1 });
      fillP(g, rectP(PL.x0, 880, PL.x1 - PL.x0, PL.y1 - 880), INK); ground(g, 890, PL.y1, { gap: 18 });
      // well
      const wl = rectP(560, 940, 200, 160); haloP(g, wl, 7); fillP(g, wl, INK); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { g.beginPath(); g.ellipse(585 + c * 50 + (r % 2) * 25, 960 + r * 38, 20, 14, 0, 0, TAU); g.lineWidth = 3; g.strokeStyle = PAP; g.stroke(); }
      g.lineWidth = 12; g.strokeStyle = INK; for (const x of [575, 745]) { g.beginPath(); g.moveTo(x, 940); g.lineTo(x, 760); g.stroke(); } g.beginPath(); g.moveTo(560, 760); g.lineTo(760, 760); g.stroke(); cut(g, 660, 760, 660, 860, 2, INK);
      banner(g, 540, 370, 380, 64, 'FRANSA · 1100\'ler', 40);
    }), fg: (g, t, u) => {
      const walk = u * 60, x = 200 + Math.min(walk, 160), st = Math.sin(u * 7) * .6;
      kisi(g, x, 1240, .95, { id: 41, sapka: 'kukuleta', govde: 'tunik', adim: st, yuz: 'sirit', goz: 'acik', kas: .6, solEl: [110, -190], sagEl: [120, -170], blink: blinkAt(t, .4), bak: 1 });
      // sieve
      const sx = x + 120 * .95, sy = 1240 - 185 * .95; fillP(g, ellP(sx, sy, 70, 22), INK); haloP(g, ellP(sx, sy, 70, 22), 4); fillP(g, ellP(sx, sy, 70, 22), INK);
      seed(42, () => { for (let i = 0; i < 26; i++) { const a = R() * TAU, r = R() * .8; g.beginPath(); g.arc(sx + Math.cos(a) * 60 * r, sy + Math.sin(a) * 18 * r, 2.4, 0, TAU); g.fillStyle = PAP; g.fill(); } });
      for (let i = 0; i < 14; i++) { const ph = (u * 1.4 + i / 14) % 1, dx = (i % 7 - 3) * 16; g.beginPath(); g.ellipse(sx + dx, sy + 20 + ph * 220, 4, 8, 0, 0, TAU); g.fillStyle = PAP; g.globalAlpha = 1 - ph; g.fill(); g.globalAlpha = 1; }
      const p = back(seg(u, .8, 1.15)); g.save(); g.translate(560, 520); g.scale(p, p); banner(g, 0, 0, 560, 110, 'nice = saf, aptal', 70, { it: 1 }); g.restore();
      // goose laughing
      g.save(); g.translate(860, 1230); const nod = Math.sin(u * 10) * .08; const gb = polyP([[-70, -10], [-50, -70], [10, -80], [60, -40], [40, 0]]); haloP(g, gb, 6); fillP(g, gb, INK); g.save(); g.translate(-40, -70); g.rotate(nod); fillP(g, polyP([[0, 0], [-10, -90], [-40, -110], [-70, -100], [-40, -86], [-20, -70], [-14, 0]]), INK); fillP(g, ellP(-36, -98, 5, 5), PAP); g.restore(); hatch(g, gb, [-70, -80, 60, 0], .3, 10, 3, { l0: 14, l1: 36 }); g.restore();
    } },
  { from: 's06', bg: g => seed(50, () => {
      sky(g, PL.x0, PL.y0, PL.x1, 930, { gap: 13 });
      // white cliffs of the far coast
      fillP(g, polyP([[640, 930], [700, 820], [800, 800], [900, 780], [PL.x1, 790], [PL.x1, 930]]), PAP); hatch(g, polyP([[640, 930], [700, 820], [800, 800], [900, 780], [PL.x1, 790], [PL.x1, 930]]), [640, 780, PL.x1, 930], 1.4, 18, 3, { col: INK, l0: 20, l1: 60 });
      fillP(g, polyP([[640, 790], [800, 760], [PL.x1, 740], [PL.x1, 795], [900, 784], [700, 822]]), INK);
      fillP(g, rectP(PL.x0, 925, PL.x1 - PL.x0, PL.y1 - 925), INK);
      banner(g, 730, 380, 360, 62, 'İNGİLTERE · 1300\'ler', 38);
    }), fg: (g, t, u) => {
      for (let i = 0; i < 12; i++) { const y = 950 + i * 32 + i * i * 1.4; wave(g, y, 6 + i * 1.2, .012 + i * .0006, u * (1.6 + i * .1) + i, 2.5 + i * .45); }
      const x = lerp(200, 520, seg(u, 0, 5)), bob = Math.sin(u * 2.6) * 10, rk = Math.sin(u * 2.6 + 1) * .03;
      g.save(); g.translate(x, 1000 + bob); g.rotate(rk);
      const hull = polyP([[-230, -10], [230, -10], [190, 80], [-190, 80]]); haloP(g, hull, 8); fillP(g, hull, INK); for (let i = 0; i < 4; i++) cut(g, -200 + i * 8, 10 + i * 18, 200 - i * 8, 10 + i * 18, 3);
      g.lineWidth = 14; g.strokeStyle = INK; g.beginPath(); g.moveTo(0, -10); g.lineTo(0, -470); g.stroke();
      const sail = g2 => { g2.moveTo(-170, -440); g2.quadraticCurveTo(-10 + Math.sin(u * 2) * 10, -300, -170, -130); g2.lineTo(170, -130); g2.quadraticCurveTo(200 + Math.sin(u * 2) * 10, -300, 170, -440); g2.closePath(); };
      haloP(g, sail, 6); fillP(g, sail, PAP); hatch(g, sail, [-170, -440, 200, -130], 1.57, 16, 2.4, { col: INK, l0: 30, l1: 120, wf: xx => clamp((-xx + 60) / 200) });
      carveText(g, 'nice', 10, -300, 110, COL, { it: 1, halo: 0 }); carveText(g, '“aptal”', 10, -200, 44, INK, { it: 1 });
      g.restore();
      kisi(g, x - 120, 1000 + bob - 6, .62, { id: 51, sapka: 'bere', govde: 'tunik', yuz: 'uzgun', kas: -.2, ter: 1, sagEl: [100, -200], blink: blinkAt(t, .9) });
    } },
  { from: 's07', bg: g => seed(60, () => {
      fillP(g, rectP(PL.x0, PL.y0, PL.x1 - PL.x0, PL.y1 - PL.y0), INK);
    }), fg: (g, t, u) => drawRoad(g, t, u) },
  { from: 's08', bg: g => seed(80, () => {
      fillP(g, rectP(PL.x0, PL.y0, PL.x1 - PL.x0, PL.y1 - PL.y0), INK);
      for (let sh = 0; sh < 3; sh++) { const y = 420 + sh * 170; cut(g, PL.x0, y + 130, 470, y + 130, 9); for (let x = PL.x0 + 14; x < 450;) { const bw = 16 + R() * 22, bh = 90 + R() * 36; g.lineWidth = 3; g.strokeStyle = PAP; g.strokeRect(x, y + 128 - bh, bw, bh); if (R() < .5) cut(g, x + 3, y + 128 - bh * .7, x + bw - 3, y + 128 - bh * .7, 2.5); x += bw + 4; } }
      // window with light
      const wn = rectP(640, 400, 300, 360); fillP(g, wn, PAP); hatch(g, wn, [640, 400, 940, 760], -.5, 13, 6, { col: INK, l0: 40, l1: 140, wf: (x, y) => .3 + (y - 400) / 600 }); cut(g, 790, 400, 790, 760, 10, INK); cut(g, 640, 580, 940, 580, 10, INK);
      fillP(g, rectP(PL.x0, 1060, PL.x1 - PL.x0, 40), PAP); hatch(g, rectP(PL.x0, 1060, PL.x1 - PL.x0, 40), [PL.x0, 1060, PL.x1, 1100], 0, 9, 3, { col: INK, l0: 80, l1: 240 });
      fillP(g, rectP(PL.x0, 1100, PL.x1 - PL.x0, PL.y1 - 1100), INK); ground(g, 1110, PL.y1, { ang: 1.57, gap: 30 });
      carveText(g, '1500\'ler', 880, 1230, 46, PAP, {});
    }), fg: (g, t, u) => {
      const s9 = t >= T0('s09') - .1, k9 = ss(seg(t, T0('s09') - .1, T0('s09') + .5));
      // candle
      fillP(g, rectP(150, 960, 30, 100), PAP); const fl = 1 + .1 * Math.sin(t * 19); fillP(g, g2 => { g2.moveTo(165, 958); g2.quadraticCurveTo(178 * fl - 13 * fl + 13, 930, 165, 900 - 6 * fl); g2.quadraticCurveTo(152, 930, 165, 958); }, COL); rays(g, 165, 930, 50, 110, 14, 3, PAP, 1);
      // scale with two apples
      g.globalAlpha = s9 ? 1 : 0; if (s9) { const tilt = Math.sin(u * 3) * .03 * (1 - k9 * .5);
        g.save(); g.translate(700, 1058); g.lineWidth = 12; g.strokeStyle = PAP; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -240); g.stroke(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
        g.save(); g.translate(0, -240); g.rotate(tilt); g.lineWidth = 12; g.strokeStyle = PAP; g.beginPath(); g.moveTo(-170, 0); g.lineTo(170, 0); g.stroke(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
        for (const sd of [-1, 1]) { g.save(); g.translate(sd * 160, 0); g.rotate(-tilt); g.lineWidth = 3; g.strokeStyle = PAP; g.beginPath(); g.moveTo(0, 0); g.lineTo(-50, 90); g.moveTo(0, 0); g.lineTo(50, 90); g.stroke(); fillP(g, ellP(0, 94, 64, 14), PAP); g.beginPath(); g.arc(sd * 2, 54, 36 + (sd > 0 ? 1.5 : 0), 0, TAU); g.fillStyle = PAP; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.moveTo(sd * 2, 24); g.quadraticCurveTo(sd * 2 + 4, 10, sd * 2 + 10, 2); g.stroke(); fillP(g, ellP(sd * 2 + 22, 12, 14, 6), INK); g.beginPath(); g.arc(sd * 2 + 12, 44, 8, Math.PI, Math.PI * 1.5); g.stroke(); g.restore(); }
        g.restore(); g.restore(); }
      g.globalAlpha = 1;
      // scholar: flat cap, ruff, squints through a magnifier
      const mag = s9 ? [190, -250] : [150, -330];
      kisi(g, 300, 1250, .95, { id: 61, sapka: 'yassi', govde: 'cuppe', yaka: 'firfir', yuz: s9 ? 'kivrik' : 'duz', goz: 'kisik', kas: -.4, sagEl: mag, solEl: s9 ? [120, -230] : [-60, -140], blink: blinkAt(t, 1.1) });
      const mx = 300 + mag[0] * .95 + 30, my = 1250 + mag[1] * .95 - 10;
      g.lineWidth = 9; g.strokeStyle = PAP; g.beginPath(); g.arc(mx, my, 40, 0, TAU); g.stroke(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); cut(g, mx - 20, my - 14, mx - 6, my - 26, 4);
      if (!s9) { // quill and ruler on the desk: fussy measuring
        fillP(g, rectP(520, 1030, 360, 26), PAP); for (let i = 0; i < 18; i++) cut(g, 530 + i * 20, 1030, 530 + i * 20, 1030 + (i % 5 ? 10 : 20), 2.4, INK);
        g.save(); g.translate(700, 980); g.rotate(-.3 + Math.sin(u * 2) * .02); fillP(g, polyP([[-140, 0], [120, -20], [140, -4], [120, 14]]), PAP); for (let i = 0; i < 10; i++) cut(g, -110 + i * 24, -2, -100 + i * 24, 10, 2, INK); g.restore();
        const p = back(seg(u, .6, 1)); g.save(); g.translate(700, 450); g.scale(p, p); banner(g, 0, 0, 440, 100, 'titiz · ince', 66, { it: 1 }); g.restore();
      } else { const p = back(seg(t, T0('s09') + .3, T0('s09') + .7)); g.save(); g.translate(700, 450); g.scale(p, p); banner(g, 0, 0, 520, 104, 'a nice distinction', 58, { it: 1, col: COL }); g.restore(); }
    } },
  { from: 's10', bg: g => seed(90, () => {
      sky(g, PL.x0, PL.y0, PL.x1, 980, { gap: 17, w: 7 });
      fillP(g, ellP(760, 560, 110, 110), COL); g.beginPath(); g.arc(760, 560, 110, 0, TAU); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); rays(g, 760, 560, 130, 300, 30, 6, PAP);
      // hedges
      for (let i = 0; i < 6; i++) { const hx = PL.x0 + i * 180, hb = g2 => { g2.ellipse(hx + 80, 960, 110, 90, 0, 0, TAU); }; haloP(g, hb, 6); fillP(g, hb, INK); hatch(g, hb, [hx - 30, 870, hx + 190, 1050], .8, 14, 3, { l0: 10, l1: 24, wf: (x, y) => clamp((y - 870) / -80 + 1.2) }); }
      fillP(g, rectP(PL.x0, 980, PL.x1 - PL.x0, PL.y1 - 980), INK); ground(g, 990, PL.y1, { gap: 20 });
      for (let i = 0; i < 11; i++) flower(g, 90 + i * 88 + R() * 20, 1250 + R() * 60, 16 + R() * 6, i % 3 ? PAP : COL);
      banner(g, 250, 390, 220, 66, '1700\'ler', 44);
    }), fg: (g, t, u) => {
      for (let i = 0; i < 4; i++) { const bx = (180 + i * 140 + u * 60) % 900 + 80, by = 470 + i * 50 + Math.sin(u * 2 + i) * 10, fl = Math.sin(u * 12 + i) * 10; g.lineWidth = 5; g.strokeStyle = INK; g.beginPath(); g.moveTo(bx - 22, by - fl); g.quadraticCurveTo(bx - 8, by - 6, bx, by + 2); g.quadraticCurveTo(bx + 8, by - 6, bx + 22, by - fl); g.stroke(); }
      kisi(g, 360, 1230, .95, { id: 71, sapka: 'ucgen', govde: 'ceket', yuz: 'gul', goz: 'kapali', kas: .5, sagEl: [130, -260], solEl: [-60, -130], blink: 0 });
      kisi(g, 700, 1230, .95, { id: 72, yon: -1, sapka: 'baslik', yuz: 'gul', goz: 'kapali', solEl: [90, -230 + Math.sin(u * 8) * 10], blink: 0 });
      // a fan in her hand
      g.save(); g.translate(700 - 90 * .95, 1230 - 230 * .95 + Math.sin(u * 8) * 9); g.rotate(-.5 + Math.sin(u * 8) * .2); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 60, -Math.PI * .9, -Math.PI * .1); g.closePath(); g.fillStyle = PAP; g.fill(); for (let i = 0; i < 7; i++) { const a = -Math.PI * (.9 - i * .8 / 6); cut(g, 0, 0, Math.cos(a) * 58, Math.sin(a) * 58, 2.5, INK); } g.restore();
      const p = back(seg(u, .7, 1.05)); g.save(); g.translate(540, 760); g.scale(p, p); banner(g, 0, 0, 470, 104, 'nice = hoş, güzel', 64, { it: 1 }); g.restore();
    } },
  { from: 's12', bg: g => seed(100, () => {
      fillP(g, rectP(PL.x0, PL.y0, PL.x1 - PL.x0, PL.y1 - PL.y0), INK);
      // board on the wall
      const bd = rectP(140, 380, 800, 300); haloP(g, bd, 8); fillP(g, bd, PAP); hatch(g, bd, [140, 380, 940, 680], -.05, 16, 3, { col: INK, l0: 80, l1: 300, wf: (x, y) => .25 + (y - 380) / 900 });
      // window night + stars
      for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(PL.x0 + R() * 900, 720 + R() * 160, 1.5 + R() * 2, 0, TAU); g.fillStyle = PAP; g.fill(); }
      // desk
      fillP(g, rectP(PL.x0, 1080, PL.x1 - PL.x0, 30), PAP); hatch(g, rectP(PL.x0, 1080, PL.x1 - PL.x0, 30), [PL.x0, 1080, PL.x1, 1110], 0, 8, 3, { col: INK, l0: 100, l1: 300 });
      fillP(g, rectP(PL.x0, 1110, PL.x1 - PL.x0, PL.y1 - 1110), INK); ground(g, 1120, PL.y1, { ang: 1.57, gap: 34 });
      // lamp + light cone
      g.lineWidth = 10; g.strokeStyle = PAP; g.beginPath(); g.moveTo(880, 1080); g.lineTo(900, 900); g.lineTo(820, 840); g.stroke(); fillP(g, polyP([[770, 820], [850, 800], [870, 880], [800, 890]]), PAP);
      for (let i = 0; i < 16; i++) cut(g, 820, 880, 420 + i * 30, 1078, 4 + (i % 3), PAP);
      // books
      for (let i = 0; i < 4; i++) { fillP(g, rectP(120 + i * 6, 1080 - 26 * (i + 1), 170 - i * 10, 22), PAP); cut(g, 130 + i * 6, 1080 - 26 * (i + 1) + 11, 270 - i * 14, 1080 - 26 * (i + 1) + 11, 2, INK); }
      carveText(g, 'BUGÜN', 860, 1020, 34, PAP, {});
    }), fg: (g, t, u) => {
      const k = back(seg(u, .05, .45)); g.save(); g.translate(540, 520); g.scale(k, k); carveText(g, 'nice', 0, -10, 170, INK, { it: 1 }); cut(g, -160, 80, 160, 80, 8, COL, seg(u, .3, .8)); g.restore();
      const s12 = t >= T0('s12');
      kisi(g, 360, 1250, .9, { id: 81, sapka: 'sac', govde: 'ceket', yuz: s12 ? 'gul' : 'duz', goz: s12 ? 'kapali' : 'acik', kas: s12 ? .4 : -.3, sagEl: [110, -170], blink: blinkAt(t, .3) });
      kisi(g, 700, 1250, .9, { id: 82, yon: -1, sapka: 'yok', govde: 'tunik', yuz: 'gul', solEl: [150, -190 + Math.sin(u * 4) * 6], blink: blinkAt(t, 1.6) });
      // exam notes between them
      fillP(g, polyP([[470, 1040], [600, 1030], [606, 1070], [472, 1078]]), PAP); for (let i = 0; i < 3; i++) cut(g, 482, 1046 + i * 10, 590, 1042 + i * 10, 2, INK);
      if (s12) { const h = back(seg(t, T0('s12') + 1.2, T0('s12') + 1.6)); const by = 860 - seg(t, T0('s12') + 1.2, T0('s12') + 4) * 50; g.save(); g.translate(540, by); g.scale(h, h); heart(g, 0, 0, 44); g.restore(); }
    } },
  { from: 's13', bg: g => seed(10, () => STREET(g)), fg: (g, t, u) => {
      kisi(g, 330, 1230, .98, { id: 21, sapka: 'bere', govde: 'tunik', yuz: 'gul', goz: 'kapali', kas: .3, solEl: [-60, -130], sagEl: [120, -300], blink: 0 });
      kisi(g, 720, 1230, 1.0, { id: 22, yon: -1, sapka: 'baslik', yuz: 'gul', goz: 'kapali', kas: .5, solEl: [-60, -130], sagEl: [60, -130], blink: 0 });
      const b1 = back(seg(u, .1, .4)); g.save(); g.translate(440, 520); g.scale(b1, b1); banner(g, 0, 0, 300, 96, '“Nice!”', 74, { it: 1 }); g.restore();
      const h = back(seg(u, .8, 1.2)); g.save(); g.translate(620, 700 - Math.sin(u * 3) * 8); g.scale(h, h); heart(g, 0, 0, 46); heart(g, 70, -40, 24); g.restore();
    } },
];
// the turning point: dark block, a light is carved from the horizon, a road through time
function drawRoad(g, t, u) {
  const k = eo(seg(u, 0, 1.6));
  seed(70, () => { rays(g, 540, 760, 40, 40 + 640 * k, 60, 7, PAP, 1, Math.PI * 1.02, Math.PI * 1.98); });
  g.beginPath(); g.arc(540, 760, 40 + 30 * k, Math.PI, 0); g.fillStyle = COL; g.fill();
  seed(71, () => {
    // hills
    for (let i = 0; i < 3; i++) { const y = 760 + i * 120; fillP(g, g2 => { g2.moveTo(PL.x0, PL.y1); g2.lineTo(PL.x0, y + 40); for (let x = PL.x0; x <= PL.x1; x += 30) g2.lineTo(x, y + Math.sin(x * .006 + i * 2) * 40); g2.lineTo(PL.x1, PL.y1); g2.closePath(); }, INK);
      for (let x = PL.x0; x <= PL.x1; x += 30) cut(g, x, y + Math.sin(x * .006 + i * 2) * 40 + 6, x + 26, y + Math.sin((x + 26) * .006 + i * 2) * 40 + 6, 3 + i); }
    // winding road
    const rd = []; for (let i = 0; i <= 40; i++) { const s = i / 40, y = lerp(PL.y1, 780, s), x = 540 + Math.sin(s * 7.5) * 300 * (1 - s), w = lerp(150, 6, s); rd.push([x, y, w]); }
    g.beginPath(); rd.forEach((q, i) => i ? g.lineTo(q[0] - q[2] / 2, q[1]) : g.moveTo(q[0] - q[2] / 2, q[1])); for (let i = rd.length - 1; i >= 0; i--) g.lineTo(rd[i][0] + rd[i][2] / 2, rd[i][1]); g.closePath(); g.fillStyle = PAP; g.fill();
    for (let i = 1; i < 40; i += 2) cut(g, rd[i][0] - rd[i][2] * .1, rd[i][1], rd[i + 1][0] + rd[i][2] * .1, rd[i + 1][1], rd[i][2] * .05 + 1, INK);
    // sign posts: 1300 aptal · 1500 titiz · 1700 hoş
    const posts = [[.12, '1300', 'aptal'], [.36, '1500', 'titiz'], [.58, '1700', 'hoş']];
    posts.forEach(([s, yr, w], i) => { const p = back(seg(u, .6 + i * .45, 1.0 + i * .45)); if (p <= 0) return; const j = Math.round(s * 40), q = rd[j], sd = i % 2 ? -1 : 1, px = q[0] + sd * (q[2] / 2 + 70 - s * 60), py = q[1], sc = lerp(1, .55, s) * p;
      g.save(); g.translate(px, py); g.scale(sc, sc); g.lineWidth = 16; g.strokeStyle = PAP; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -190); g.stroke(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
      const bd = polyP([[-110, -250], [100, -250], [130, -210], [100, -170], [-110, -170]]); haloP(g, bd, 8); fillP(g, bd, PAP); carveText(g, yr, -5, -228, 38, INK); carveText(g, w, -5, -188, 36, i === 2 ? COL : INK, { it: 1 }); g.restore(); });
  });
  // the traveller with a lantern (the meaning he carries)
  const s = seg(u, 0, 4.5), j = Math.min(39, Math.floor(s * 14)), q = [540 + Math.sin(s * 14 / 40 * 7.5) * 300 * (1 - s * 14 / 40), lerp(PL.y1, 780, s * 14 / 40)];
  const sc = lerp(.62, .46, s);
  kisi(g, q[0], q[1] - 30, sc, { id: 75, sapka: 'bere', govde: 'tunik', adim: Math.sin(u * 7) * .6, yuz: 'kivrik', goz: 'buyuk', kas: .8, sagEl: [110, -200], blink: 0, yon: 1 });
  lantern(g, q[0] + 110 * sc, q[1] - 30 - 200 * sc + 60 * sc, sc * 1.6, t);
}

// ---------- compositing ----------
let PAPER = null, TEX = null, P = null, PG = null, CC = null, CCi = -1;
function cacheFor(i) { if (CCi !== i) { const g = CC.getContext('2d', { willReadFrequently: true }); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.save(); g.beginPath(); PLATE(g); g.clip(); SC[i].bg(g); g.restore(); CCi = i; } return CC; }
function makeTex() {
  const r = mulberry(5);
  PAPER = document.createElement('canvas'); PAPER.width = W; PAPER.height = H; const p = PAPER.getContext('2d', { willReadFrequently: true });
  p.fillStyle = PAP; p.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 7) { p.fillStyle = `rgba(120,95,60,${(.03 + r() * .03).toFixed(3)})`; p.fillRect(0, y, W, 1); } // laid lines
  for (let x = 40; x < W; x += 120) { p.fillStyle = 'rgba(120,95,60,.05)'; p.fillRect(x, 0, 2, H); }
  for (let i = 0; i < 2500; i++) { p.fillStyle = `rgba(110,85,50,${(r() * .12).toFixed(3)})`; p.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
  const vg = p.createRadialGradient(W / 2, H / 2, 600, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(110,80,40,.16)'); p.fillStyle = vg; p.fillRect(0, 0, W, H);
  TEX = document.createElement('canvas'); TEX.width = W; TEX.height = H; const tx = TEX.getContext('2d', { willReadFrequently: true });
  for (let i = 0; i < 520; i++) { const y = r() * H, x = r() * W, l = 80 + r() * 400; tx.strokeStyle = `rgba(70,55,40,${(.12 + r() * .25).toFixed(3)})`; tx.lineWidth = 1 + r() * 2; tx.beginPath(); tx.moveTo(x, y); tx.bezierCurveTo(x + l * .3, y + (r() - .5) * 8, x + l * .7, y + (r() - .5) * 8, x + l, y + (r() - .5) * 6); tx.stroke(); }
  for (let i = 0; i < 4200; i++) { tx.fillStyle = `rgba(236,226,204,${(.25 + r() * .6).toFixed(3)})`; tx.beginPath(); tx.arc(r() * W, r() * H, .6 + r() * 1.6, 0, TAU); tx.fill(); }
  P = document.createElement('canvas'); P.width = W; P.height = H; PG = P.getContext('2d', { willReadFrequently: true });
  const ragged = []; seed(3, () => { for (let x = PL.x0; x <= PL.x1; x += 12) ragged.push([x, PL.y0 + (R() - .5) * 5]); for (let y = PL.y0; y <= PL.y1; y += 12) ragged.push([PL.x1 + (R() - .5) * 5, y]); for (let x = PL.x1; x >= PL.x0; x -= 12) ragged.push([x, PL.y1 + (R() - .5) * 5]); for (let y = PL.y1; y >= PL.y0; y -= 12) ragged.push([PL.x0 + (R() - .5) * 5, y]); });
  PLATE = polyP(ragged);
  CC = document.createElement('canvas'); CC.width = W; CC.height = H;
}
let PLATE = null;
const sceneStart = i => i === 0 ? 0 : T0(SC[i].from) - .15;
function sceneAt(t) { let i = 0; for (let j = 0; j < SC.length; j++) if (t >= sceneStart(j)) i = j; return i; }

function drawPlate(i, t, reveal) {
  const g = PG; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  g.save(); g.beginPath(); PLATE(g); g.clip(); g.fillStyle = INK; g.fill();
  if (reveal < 1) { // knife sweep: cuts appear behind a diagonal edge
    g.save(); g.beginPath(); const e = lerp(-500, 1700, reveal); g.moveTo(-100, -100); for (let k = 0; k <= 30; k++) { const y = lerp(PL.y0 - 40, PL.y1 + 40, k / 30); g.lineTo(e - (y - PL.y0) * .5 + Math.sin(k * 2.1) * 26 + Math.sin(k * .7) * 18, y); } g.lineTo(-100, H + 100); g.closePath(); g.clip();
    g.drawImage(cacheFor(i), 0, 0); seed(900 + i, () => SC[i].fg(g, t, t - sceneStart(i))); g.restore();
    const e2 = lerp(-500, 1700, reveal); for (let k = 0; k < 8; k++) { const y = lerp(PL.y0, PL.y1, (k + .5) / 8) + Math.sin(t * 40 + k) * 20; cut(g, e2 - (y - PL.y0) * .5 - 40, y, e2 - (y - PL.y0) * .5 + 12, y - 6, 6); }
  } else { g.drawImage(cacheFor(i), 0, 0); seed(900 + i, () => SC[i].fg(g, t, t - sceneStart(i))); }
  g.globalCompositeOperation = 'source-atop'; g.globalAlpha = .9; g.drawImage(TEX, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.restore();
}
function endCard(g, t) { // carved closing block
  const k = ss(seg(t, CEND(), CEND() + .5)); if (k <= 0) return;
  g.save(); g.beginPath(); PLATE(g); g.clip(); g.globalAlpha = k; g.fillStyle = INK; g.fillRect(0, 0, W, H);
  seed(990, () => { rays(g, 540, 820, 230, 520, 40, 6, PAP, ss(seg(t, CEND() + .2, CEND() + 1.2))); });
  fillP(g, ellP(540, 820, 210, 210), INK); g.beginPath(); g.arc(540, 820, 210, 0, TAU); g.lineWidth = 6; g.strokeStyle = PAP; g.stroke();
  carveText(g, 'KELİMELERİN TARİHÇESİ', 540, 770, 25, PAP, {}); carveText(g, 'nice', 540, 850, 110, COL, { it: 1 });
  fillP(g, rectP(200, 1110, 680, 120), INK); carveText(g, 'ingilizcecim.com', 540, 1170, 74, PAP, {}); g.restore();
}

// ---------- captions: letterpress in the margin ----------
const KEY = /^(nice|nice!|nescius|ne|scire'den|scire|distinction|nice\.)[.,!?'’]*$/i;
const TR = { s12: 'Geçen hafta sonu sınava hazırlanmama yardım etmen çok incelikliydi.' };
function wrap(g, words, maxW) { const out = [[]]; let w = 0; const sp = g.measureText(' ').width; words.forEach(wd => { const ww = g.measureText(wd).width; if (w + ww > maxW && out[out.length - 1].length) { out.push([]); w = 0; } out[out.length - 1].push(wd); w += ww + sp; }); return out; }
function caption(t) {
  const l = Z.satirlar.find(l => t >= l.t0 - .1 && t <= l.t1 + .5); if (!l) return;
  const g = X, words = l.metin.split(' '), kel = l.kelimeler || [];
  const heard = kel.filter(k => k.t0 <= t).length, shown = t > l.t1 ? words.length : Math.max(1, Math.round(heard * words.length / Math.max(1, kel.length)));
  const a = ss(seg(t, l.t0 - .1, l.t0)) * (1 - ss(seg(t, l.t1 + .35, l.t1 + .5)));
  g.save(); g.font = `${l.dil === 'en' ? 'italic ' : ''}46px ${SERIF}`; const rows = wrap(g, words, 880), tr = TR[l.id];
  const lh = 54, y0 = tr ? 1378 : 1395; g.textBaseline = 'middle'; g.textAlign = 'left'; let n = 0;
  rows.forEach((r, ri) => { const rw = g.measureText(r.join(' ')).width; let x = 530 - rw / 2; const y = y0 + lh * ri;
    r.forEach(wd => { g.globalAlpha = a * (n < shown ? 1 : .18); g.fillStyle = KEY.test(wd) ? COL : INK; g.fillText(wd, x, y); x += g.measureText(wd + ' ').width; n++; }); });
  if (tr) { g.globalAlpha = a * ss(seg(t, l.t0 + .8, l.t0 + 1.2)); g.font = `italic 30px ${SERIF}`; g.fillStyle = '#5a4a38'; g.textAlign = 'center'; wrap(g, tr.split(' '), 900).forEach((r, i) => g.fillText(r.join(' '), 530, y0 + rows.length * lh + i * 38)); }
  g.restore();
}
function header(g) { g.save(); g.font = `28px ${SERIF}`; g.fillStyle = '#4a3c2e'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('KELİMELERİN TARİHÇESİ  ·  nice', 540, 274); g.restore(); }

function cover() {
  const g = X;
  seed(995, () => { const p = polyP(wob([[90, 330], [990, 336], [984, 690], [96, 684]], 8)); fillP(g, p, PAP); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); });
  carveText(g, 'KELİMELERİN TARİHÇESİ', 540, 400, 46, INK, {}); carveText(g, 'Nice', 540, 545, 210, COL, { it: 1, halo: 10, hcol: INK });
  carveText(g, 'aptal → titiz → hoş', 540, 650, 48, INK, { it: 1 });
  seed(996, () => { const p = polyP(wob([[170, 1370], [910, 1374], [906, 1510], [174, 1506]], 6)); fillP(g, p, PAP); });
  carveText(g, '700 yıllık bir anlam yolculuğu', 540, 1440, 48, INK, { it: 1 });
}

window.render = t => {
  X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(PAPER, 0, 0);
  const i = sceneAt(t), s0 = sceneStart(i), u = t - s0;
  const reveal = KAPAK ? 1 : (i === 0 ? ss(seg(t, 0, .35)) : ss(seg(u, 0, .45)));
  drawPlate(i, t, reveal);
  const mis = !KAPAK && u >= 0 && u < 2 / 30 && i > 0 ? 4 : 0; // a new impression: two frames of misregistration
  X.drawImage(P, mis, -mis * .5);
  if (!KAPAK) endCard(X, t);
  X.globalCompositeOperation = 'multiply'; X.globalAlpha = .5; X.drawImage(PAPER, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
  if (KAPAK) cover(); else { header(X); if (t < CEND() + .1) caption(t); }
};

(async () => {
  Z = await (await fetch('ses/zaman.json')).json();
  Z.satirlar.forEach(l => { const k = l.kelimeler || []; if (k.length) { const end = k[k.length - 1].t1, f = (l.t1 - l.t0) / Math.max(.01, end - l.t0); if (f < .97) k.forEach(w => { w.t0 = l.t0 + (w.t0 - l.t0) * f; w.t1 = l.t0 + (w.t1 - l.t0) * f; }); } L[l.id] = l; });
  await document.fonts.load(`60px ${SERIF}`, 'ğşİıçüöÜÇŞĞ'); await document.fonts.load(`italic 60px ${SERIF}`, 'ğşİıçüöÜÇŞĞ'); await document.fonts.load("600 40px 'Fredoka'", '0123456789'); await document.fonts.load("400 40px 'Fredoka'", '0123456789'); await document.fonts.ready;
  makeTex();
  window.DUR = Z.dur;
  const e = [{ t: .05, type: 'whoosh' }, { t: .4, type: 'pop' }, { t: APT(), type: 'thump' }, { t: APT() + .15, type: 'pop' }];
  for (let i = 1; i < SC.length; i++) { const s = sceneStart(i); e.push({ t: s, type: 'whoosh' }, { t: s + .15, type: 'click' }, { t: s + .3, type: 'click' }); }
  e.push({ t: T0('s02') + .4, type: 'ding' }, { t: T0('s04') + .1, type: 'pop' }, { t: T0('s05') + 1, type: 'pop' }, { t: T0('s07') + .3, type: 'ding' },
    { t: T0('s07') + .75, type: 'click' }, { t: T0('s07') + 1.2, type: 'click' }, { t: T0('s07') + 1.65, type: 'click' }, { t: T0('s09') + .4, type: 'pop' }, { t: T0('s10') + .8, type: 'pop' },
    { t: T0('s12') + 1.3, type: 'pop' }, { t: T0('s12') + .2, type: 'ding' }, { t: T0('s13') + .2, type: 'pop' }, { t: T0('s13') + .9, type: 'ding' }, { t: CEND(), type: 'whoosh' }, { t: CEND() + .6, type: 'ding' });
  window.EV = e.filter(x => x.t > 0 && x.t < Z.dur).sort((a, b) => a.t - b.t);
  window.READY = true;
})();
