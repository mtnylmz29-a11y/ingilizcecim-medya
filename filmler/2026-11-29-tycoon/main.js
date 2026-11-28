// ingilizcecim.com · tycoon (Kelimelerin Tarihçesi) — stil: flat-vector (kalın koyu çizgi, büyük gözlü sevimli karakterler, üstte koyu başlık bandı, krem etiketler, altta krem altyazı kutusu)
// Özgün karakterler. Motor: toon.js (lemo-opuscar, MIT).
import { clamp, lerp, seg, ss, back, hash, TAU } from '/core/lib.js';
import { INK, g, init, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, frame, bands } from './toon.js';
const W = 1080, H = 1920, GY = 1330;
function screenRect(col, a = 1) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
init(document.getElementById('c'));
const KAPAK = /kapak=1/.test(location.search);
const F = `'Fredoka'`;
let Z = null; const L = {};
const T0 = id => L[id].t0, T1 = id => L[id].t1;
const on12 = t => Math.floor(t * 12) / 12;
const wob = (t, f = 1, ph = 0) => Math.sin(t * TAU * f + ph);
const P = { white: '#ffffff', cream: '#fff3d6', acc: '#ff8a1f', gold: '#ffc83d', ok: '#33c26b', bad: '#ff4d5e', blue: '#4aa3ff', coral: '#ff6b5e', dark: '#1d2440', navy: '#232a52', mouthIn: '#4a1a2a', tongue: '#e8637a' };
const SHO = { skin: '#f2c49b', hair: '#241a22', shirt: '#b8323e', shirtS: '#8f2430', pants: '#2c3454', shoe: '#3a2f2a', belt: '#f2c14e', deco: 'obi', hat: 'topknot' };
const SAL = { skin: '#f2c49b', hair: '#7a4a24', shirt: '#f4f6ff', shirtS: '#cdd5ee', pants: '#2c4a8a', shoe: '#2f2b3a', belt: '#2c4a8a', deco: 'sash', hat: 'cap' };
const LIN = { skin: '#e3b48c', hair: '#2a1c14', shirt: '#2b2f3f', shirtS: '#1c1f2c', pants: '#2b2f3f', shoe: '#14151c', belt: '#ffffff', deco: 'tie', hat: 'tophat' };
const AID = { skin: '#f2c49b', hair: '#6a3a1c', shirt: '#7a5fb3', shirtS: '#5e4792', pants: '#3b3f5c', shoe: '#2f2b3a', belt: '#ffffff', deco: 'tie' };
const BIZ = { skin: '#e0a878', hair: '#2a1c14', shirt: '#1f7a5c', shirtS: '#165c45', pants: '#1f7a5c', shoe: '#14151c', belt: '#ffc83d', deco: 'tie', hat: 'bowler' };
const WORLD = {
  edo: { sky: ['#ffb36b', '#ffc27d', '#ffd290'], floor: '#e7c58a', floorS: '#cfa96d' },
  dc: { sky: ['#9fd0ff', '#b8dcff', '#d3e9ff'], floor: '#b9b0a0', floorS: '#9f968a' },
  ny: { sky: ['#ff9bb8', '#ffb08f', '#ffc97a'], floor: '#5b6074', floorS: '#474b5e' },
  lib: { sky: ['#9fe3d0', '#86d9c3', '#6fcdb6'], floor: '#c9a06c', floorS: '#ad8754' },
  night: { sky: ['#5b3fa8', '#4d3396', '#3f2884'], floor: '#8d7bd6', floorS: '#7262bb' },
};
function backdrop(Wd, extra) {
  bands(Wd.sky, -200, GY);
  if (extra) extra();
  shape(rect(-200, GY, W + 400, H - GY + 200), { fill: Wd.floor, lw: 7, shade: () => { fillOnly(rect(-200, GY + 90, W + 400, 14), Wd.floorS, { boil: 0 }); fillOnly(rect(-200, GY + 260, W + 400, 14), Wd.floorS, { boil: 0 }); } });
}
function cloud(x, y, s = 1) { push(); translate(x, y); scale(s); shape(spline([[-90, 20], [-70, -20], [-20, -40], [30, -20], [70, -30], [100, 10], [60, 30], [-50, 34]]), { fill: P.white, lw: 6 }); pop(); }

// ---------- iri kafalı, büyük gözlü karakter (origin: ayaklar) ----------
const ARM = { down: [[-96, -108], -8], up: [[-92, -330], -30], point: [[-190, -215], -10], hips: [[-100, -150], 36], wave: [[-130, -320], 25], think: [[-60, -250], -30] };
function hat(kind, pal) {
  if (kind === 'topknot') { shape(ell(0, -540, 34, 30, 18), { fill: pal.hair, lw: 6 }); stroke([[-20, -516], [20, -516]], 7, { line: P.gold }); }
  if (kind === 'tophat') { shape(rr(-74, -690, 148, 170, 14), { fill: '#23242f', lw: 7, shade: () => fillOnly(rect(-80, -580, 160, 40), P.bad, { boil: 0 }) }); shape(ell(0, -520, 128, 24, 28), { fill: '#23242f', lw: 7 }); }
  if (kind === 'bowler') { shape(rr(-88, -640, 176, 130, 60), { fill: '#3a3f55', lw: 7, shade: () => fillOnly(rect(-100, -560, 200, 26), P.gold, { boil: 0 }) }); shape(ell(0, -514, 130, 20, 28), { fill: '#3a3f55', lw: 7 }); }
  if (kind === 'cap') { shape(rr(-112, -590, 224, 90, 44), { fill: P.white, lw: 7 }); shape(ell(0, -508, 128, 18, 28), { fill: '#2c4a8a', lw: 7 }); dot(0, -552, 9, '#2c4a8a'); }
}
function person(x, y, s, t, pal, o = {}) {
  const { look = [0, 0], op = 0, sm = .8, brow = 0, armL = 'down', armR = 'down', face = 1, jump = 0, happy = false, tilt = 0 } = o;
  const tt = on12(t), br = 1 + Math.sin(tt * 2.6) * .012;
  push(); translate(x, y - jump); scale(s * face, s * br); rotate(tilt);
  shape(noodle([-28, -112], [-32, -14], -4, 30, 26), { fill: pal.pants, lw: 6 });
  shape(noodle([28, -112], [32, -14], 4, 30, 26), { fill: pal.pants, lw: 6 });
  shape(ell(-38, -8, 36, 17, 20), { fill: pal.shoe, lw: 6 }); shape(ell(38, -8, 36, 17, 20), { fill: pal.shoe, lw: 6 });
  const arm = (side, name) => { const [tip, bend] = ARM[name], tx_ = tip[0] * side, bd = bend * side; shape(noodle([62 * side, -196], [tx_, tip[1]], bd, 28, 24), { fill: pal.shirt, lw: 6 }); shape(ell(tx_, tip[1], 23, 23, 16), { fill: pal.skin, lw: 6 }); };
  arm(1, armR);
  shape(rr(-66, -218, 132, 126, 36), { fill: pal.shirt, lw: 6, shade: () => fillOnly(rect(22, -240, 60, 160), pal.shirtS, { boil: .4 }) });
  if (pal.deco === 'obi') { shape(rect(-66, -150, 132, 30), { fill: pal.belt, lw: 6 }); stroke([[-40, -218], [0, -170], [40, -218]], 7); }
  if (pal.deco === 'tie') { shape([[-16, -218], [16, -218], [10, -150], [0, -128], [-10, -150]], { fill: P.bad, lw: 5 }); }
  if (pal.deco === 'sash') { stroke([[-60, -216], [60, -150]], 12, { line: '#2c4a8a' }); }
  arm(-1, armL);
  shape(ell(-146, -318, 20, 28, 16), { fill: pal.skin, lw: 6 }); shape(ell(146, -318, 20, 28, 16), { fill: pal.skin, lw: 6 });
  shape(ell(0, -366, 158, 150, 40), { fill: pal.hair, lw: 6 });
  shape(ell(0, -318, 146, 134, 44), { fill: pal.skin, lw: 6 });
  shape(spline([[-146, -368], [-100, -420], [0, -440], [100, -420], [146, -368], [90, -382], [0, -392], [-90, -382]]), { fill: pal.hair, lw: 5 });
  push(); translate(0, pal.hat === 'topknot' ? 8 : 42); hat(pal.hat, pal); pop();
  const blink = (t % 3.1) > 2.98;
  for (const ex of [-56, 56]) {
    if (blink || o.closed) { stroke(arc(ex, -312, 26, 12, Math.PI * .1, Math.PI * .9, 12), 6); continue; }
    if (happy) { stroke(arc(ex, -306, 28, 22, Math.PI * 1.1, Math.PI * 1.9, 12), 7); continue; }
    shape(ell(ex, -314, 38, 46, 28), { fill: P.white, lw: 6 });
    dot(ex + look[0] * 12, -314 + look[1] * 14, 18); dot(ex + look[0] * 12 + 6, -322 + look[1] * 14, 6, P.white);
  }
  if (brow) { stroke([[-90, -372 - brow * 10], [-30, -372 + brow * 8]], 7); stroke([[30, -372 + brow * 8], [90, -372 - brow * 10]], 7); }
  fillOnly(ell(-98, -258, 24, 14, 14), '#ff9a8a', { boil: 0 }); fillOnly(ell(98, -258, 24, 14, 14), '#ff9a8a', { boil: 0 });
  const my = -246, hw = 34, k = 12 * sm;
  if (op < .07) stroke(quad([-hw, my], [0, my + k * 2], [hw, my], 10), 7);
  else { const h = op * 46; shape([...quad([-hw, my], [0, my - h * .1], [hw, my], 10), ...quad([hw, my], [0, my + h + k], [-hw, my], 12)], { fill: P.mouthIn, lw: 6, shade: () => fillOnly(ell(0, my + h * .9, hw * .55, h * .4, 16), P.tongue, { boil: .3 }) }); }
  pop();
}
function talk(t, ids) {
  for (const id of ids) { const l = L[id]; if (!l || t < l.t0 || t > l.t1) continue;
    for (const k of (l.kelimeler || [])) if (t >= k.t0 && t <= k.t1) { const u = (t - k.t0) / Math.max(.08, k.t1 - k.t0); return .25 + .5 * Math.abs(Math.sin(on12(u) * Math.PI * 2)); }
    return .3; }
  return 0;
}

// ---------- dekor ----------
function fuji(x, y, s = 1) { push(); translate(x, y); scale(s); shape([[-300, 0], [-40, -300], [40, -300], [300, 0]], { fill: '#7f9ad6', lw: 7, shade: () => fillOnly(rect(-120, -320, 240, 90), P.white, { boil: 0 }) }); pop(); }
function castle(x, y, s = 1) {
  push(); translate(x, y); scale(s);
  shape(rect(-170, -150, 340, 150), { fill: P.white, lw: 7 });
  for (let i = 0; i < 3; i++) { const w = 330 - i * 80, yy = -150 - i * 130; shape(rect(-w / 2 + 25, yy - 100, w - 50, 100), { fill: P.white, lw: 7 }); shape([[-w / 2 - 40, yy - 90], [w / 2 + 40, yy - 90], [w / 2 - 10, yy - 160], [-w / 2 + 10, yy - 160]], { fill: '#3f5a8f', lw: 7 }); }
  shape(rect(-30, -90, 60, 90), { fill: '#7a4a24', lw: 6 });
  pop();
}
function ship(x, y, s = 1, t = 0) {
  push(); translate(x, y + wob(t, .4) * 6); rotate(wob(t, .35) * .03); scale(s);
  shape(spline([[-170, -30], [170, -30], [130, 40], [-130, 40]]), { fill: '#2b2f3f', lw: 7, shade: () => fillOnly(rect(-180, -10, 360, 14), P.white, { boil: 0 }) });
  stroke([[0, -30], [0, -260]], 9); stroke([[-70, -30], [-70, -190]], 7);
  shape([[8, -250], [130, -80], [8, -80]], { fill: P.white, lw: 6 }); shape([[-8, -230], [-62, -100], [-8, -100]], { fill: P.cream, lw: 6 });
  pop();
}
function waves(y, t, col = '#4a8fd8') { for (let i = 0; i < 6; i++) { const x = ((i * 260 + t * 40) % 1500) - 200; stroke(quad([x, y + (i % 2) * 40], [x + 40, y - 20 + (i % 2) * 40], [x + 90, y + (i % 2) * 40], 8), 6, { line: col }); } }
function whiteHouse(x, y, s = 1) {
  push(); translate(x, y); scale(s);
  shape(rect(-300, -200, 600, 200), { fill: P.white, lw: 7 });
  shape([[-340, -200], [340, -200], [0, -330]], { fill: '#e8ecf6', lw: 7 });
  for (let i = -3; i <= 3; i++) shape(rect(i * 80 - 18, -190, 36, 190), { fill: '#f4f6ff', lw: 5 });
  shape(rect(-70, -120, 140, 120), { fill: '#7a4a24', lw: 6 });
  pop();
}
function skyline(y, t) {
  const bs = [[40, 260, '#3b4a7a'], [170, 380, '#4a5c94'], [300, 300, '#32406b'], [430, 470, '#556aa8'], [560, 340, '#3b4a7a'], [690, 420, '#4a5c94'], [820, 300, '#32406b'], [940, 380, '#556aa8']];
  for (const [bx, bh, col] of bs) { shape(rect(bx - 55, y - bh, 110, bh), { fill: col, lw: 7 }); for (let r = 0; r < Math.floor(bh / 70); r++) for (let c = 0; c < 2; c++) fillOnly(rect(bx - 36 + c * 44, y - bh + 24 + r * 62, 26, 34), (hash(bx + r * 7 + c) > .4 ? P.gold : '#2a3560'), { boil: 0 }); }
}
function coin(x, y, s = 1) { push(); translate(x, y); scale(s); shape(ell(0, 0, 38, 38, 22), { fill: P.gold, lw: 6 }); stroke([[0, -18], [0, 18]], 6); pop(); }
function bag(x, y, s = 1) { push(); translate(x, y); scale(s); shape(spline([[-60, 40], [-70, -10], [-30, -50], [30, -50], [70, -10], [60, 40]]), { fill: '#8bd17c', lw: 7 }); shape(rect(-24, -66, 48, 22), { fill: '#6cb35d', lw: 6 }); pop(); txt('$', x, y - 4, 60 * s, INK); }
function bookshelf(x, y) { shape(rect(x, y, 260, 330), { fill: '#a8703a', lw: 7 }); for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) fillOnly(rect(x + 14 + i * 46, y + 18 + r * 104, 36, 80), [P.coral, P.blue, P.gold, P.ok, '#7a5fb3'][(i + r) % 5], { boil: 0 }); }

// ---------- ekran katmanı ----------
function txt(s, x, y, size, col, { wt = '700', align = 'center', ow = 0, oc = INK } = {}) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt} ${size}px ${F}`; g.textAlign = align; g.textBaseline = 'middle';
  if (ow) { g.lineWidth = ow; g.lineJoin = 'round'; g.strokeStyle = oc; g.strokeText(s, x, y); }
  g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
function tw(s, size, wt = '700') { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt} ${size}px ${F}`; const w = g.measureText(s).width; g.restore(); return w; }
function panel(x, y, w, h, fill = P.cream, k = 1) { if (k <= 0) return; push(); translate(x + w / 2, y + h / 2); scale(back(k, .5)); shape(rr(-w / 2, -h / 2, w, h, 30), { fill, lw: 7 }); pop(); }
function label(s, cx, cy, size, fill, k = 1, col = INK) { if (k <= 0) return; const w = tw(s, size) + 64, h = size * 1.7; panel(cx - w / 2, cy - h / 2, w, h, fill, k); if (k > .6) txt(s, cx, cy + 3, size, col); }
function title(s, k = 1, sub = '') { if (k <= 0) return; const y = 270, h = sub ? 150 : 110; g.setTransform(1, 0, 0, 1, 0, 0); push(); translate(W / 2, y + h / 2); scale(1, ss(k)); shape(rr(-W / 2 + 36, -h / 2, W - 72, h, 26), { fill: P.navy, lw: 7 }); pop(); if (k > .7) { txt(s, W / 2, y + (sub ? 46 : h / 2 + 3), 62, P.white); if (sub) txt(sub, W / 2, y + 108, 36, P.gold, { wt: '600' }); } }
function stamp(s, x, y, k, col, size = 70) { if (k <= 0) return; const sc = back(k, .6); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.rotate(-.12); g.scale(sc, sc); g.font = `700 ${size}px ${F}`; const w = g.measureText(s).width; g.lineWidth = 9; g.strokeStyle = col; g.fillStyle = 'rgba(255,243,214,.9)'; g.beginPath(); g.roundRect(-w / 2 - 26, -size * .7, w + 52, size * 1.4, 16); g.fill(); g.stroke(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, 0, 4); g.restore(); }
function chips(items, y, t0, t) {
  const sz = 54, pad = 26, gap = 56, ws = items.map(i => tw(i.s, sz) + pad * 2), tot = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = (W - tot) / 2;
  items.forEach((it, i) => {
    const k = seg(t, t0 + i * .4, t0 + i * .4 + .35);
    if (k > 0) { push(); translate(x + ws[i] / 2, y); scale(back(k, .6)); shape(rr(-ws[i] / 2, -44, ws[i], 88, 24), { fill: it.c, lw: 7 }); pop(); if (k > .6) txt(it.s, x + ws[i] / 2, y + 4, sz, INK); }
    if (i < items.length - 1 && k > .6) txt('+', x + ws[i] + gap / 2, y + 2, 60, P.white, { ow: 12 });
    x += ws[i] + gap;
  });
}
function sent(lines, y, size, k = 1) {
  if (k <= 0) return;
  const ws = lines.map(l => tw(l.map(p => p[0]).join(''), size)), w = Math.max(...ws), lh = size * 1.3, h = lh * lines.length + 40;
  push(); translate(W / 2, y + h / 2 - 20); scale(back(k, .5)); shape(rr(-w / 2 - 40, -h / 2, w + 80, h, 28), { fill: P.navy, lw: 7 }); pop();
  if (k < .6) return;
  lines.forEach((l, i) => { let x = W / 2 - ws[i] / 2; const yy = y + lh * i + lh * .35; for (const [s, c] of l) { txt(s, x, yy, size, c, { align: 'left' }); x += tw(s, size); } });
}

// ---------- altyazı: altta krem kutu, anahtar kelime turuncu ----------
const KEY = new Set(['tycoon', 'taikun', 'şogun', 'şogunun', 'şogunundan', 'lincoln', "lincoln'ün", "tycoon'u"]);
function caption(t) {
  let c = null; for (const l of Z.satirlar) if (t >= l.t0 - .05 && t <= l.t1 + .45) c = l;
  if (!c) return;
  const words = c.metin.split(/ +/), size = 46, maxW = 820, lh = 60;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `700 ${size}px ${F}`;
  const lines = []; let line = [];
  for (const w of words) { const test = [...line, w].join(' '); if (g.measureText(test).width > maxW && line.length) { lines.push(line); line = [w]; } else line.push(w); }
  if (line.length) lines.push(line);
  const bw = 940, bh = lines.length * lh + 44, bx = (W - bw) / 2, by = 1525 - bh;
  g.fillStyle = P.cream; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.roundRect(bx, by, bw, bh, 30); g.fill(); g.stroke();
  const kw = c.kelimeler || []; let wi = 0;
  lines.forEach((ln, li) => {
    g.font = `700 ${size}px ${F}`; const full = ln.join(' '), lw_ = g.measureText(full).width; let x = W / 2 - lw_ / 2; const y = by + 22 + lh / 2 + li * lh;
    for (const w of ln) {
      const tw0 = (kw.length === words.length && kw[wi]) ? kw[wi].t0 : c.t0 + (c.t1 - c.t0) * wi / words.length, shown = t >= tw0 - .08 || t > c.t1;
      const clean = w.replace(/[.,?!;:]/g, '').toLowerCase();
      g.textAlign = 'left'; g.textBaseline = 'middle'; g.globalAlpha = shown ? 1 : 0; g.fillStyle = KEY.has(clean) ? P.acc : INK; g.fillText(w, x, y);
      x += g.measureText(w + ' ').width; wi++;
    }
  });
  g.globalAlpha = 1; g.restore();
}

// ---------- sahneler ----------
function sHook(t) {
  push(); backdrop(WORLD.ny, () => { cloud(180, 620, 1.1); cloud(900, 580, .9); skyline(GY, t); }); pop();
  title('KELİMELERİN TARİHÇESİ', seg(t, .05, .4), 'YDT / YDS kelimesi');
  label('TYCOON', 540, 560, 96, P.gold, seg(t, .5, .9));
  label('büyük iş insanı', 540, 690, 48, P.cream, seg(t, 1.5, 1.9));
  person(300, GY, .9, t, BIZ, { look: [.5, -.2], op: talk(t, ['s01']), armL: 'up', armR: 'hips' });
  bag(780, GY - 40, 1.3); coin(700, GY - 190 - Math.abs(wob(t, .8)) * 30, 1); coin(860, GY - 230 - Math.abs(wob(t, .7, 1)) * 24, .9);
  const k = seg(t, T0('s01') + 3.8, T0('s01') + 4.2);
  if (k > 0) label('Japonya?!', 770, 900, 56, P.coral, k, P.white);
}
function sJapan(t, s0) {
  push(); backdrop(WORLD.edo, () => { fuji(300, GY - 120, 1.2); castle(820, GY - 4, 1.0); cloud(160, 520, 1); }); pop();
  title("JAPONYA · 1850'LER", seg(t, s0, s0 + .3));
  person(260, GY + 20, .9, t, SHO, { look: [.5, -.1], op: talk(t, ['s02', 's03', 's04']) * .8, armL: 'down', armR: 'point' });
  person(880, GY + 40, .55, t, SAL, { look: [-.5, 0], face: -1, armL: 'down', armR: 'down' });
  label('şogun = komutan', 330, 600, 50, P.cream, seg(t, T0('s02') + 2.0, T0('s02') + 2.4));
  const a = T0('s03'), b = T0('s04');
  if (t > a - .1) label('yabancı gemiler', 760, 650, 46, P.blue, seg(t, a, a + .35), P.white);
  if (t > a + 1.6) stamp('TAIKUN', 540, 820, seg(t, a + 1.6, a + 2.0), P.acc, 90);
  if (t > b - .1) chips([{ s: 'tai: büyük', c: P.gold }, { s: 'kun: efendi', c: P.cream }], 1010, b + .3, t);
  if (t > b + 2.6) label('Çince kökenli', 540, 1150, 46, P.ok, seg(t, b + 2.6, b + 2.95));
}
function sRoute(t, s0) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  bands(['#4aa3ff', '#5db0ff', '#79c0ff'], 0, H);
  const k = ss(seg(t, s0 + .3, s0 + 3.6));
  shape(spline([[40, 700], [180, 640], [330, 700], [300, 860], [140, 900], [50, 820]]), { fill: '#f2d9a0', lw: 7 });
  shape(spline([[640, 640], [860, 600], [1040, 680], [1020, 900], [820, 960], [660, 860]]), { fill: '#8bd17c', lw: 7 });
  txt('JAPONYA', 190, 770, 36, INK); txt('ABD', 850, 780, 52, INK);
  const x = lerp(330, 660, k), y = 780 - Math.sin(k * Math.PI) * 120;
  for (let i = 0; i < 12; i++) { const u = i / 12; const px = lerp(330, 660, u), py = 780 - Math.sin(u * Math.PI) * 120; if (u < k) dot(px, py, 7, P.white); }
  ship(x, y + 50, .35, t);
  title('YOLCULUK', seg(t, s0, s0 + .3));
  stamp('1857', 540, 1100, seg(t, s0 + 3.0, s0 + 3.4), P.acc, 110);
  label('İngilizceye girdi', 540, 1260, 50, P.cream, seg(t, s0 + 3.4, s0 + 3.8));
  waves(1360, t, '#2f78bf');
}
function sUsa(t, s0) {
  push(); backdrop(WORLD.dc, () => { whiteHouse(540, GY - 6, 1.1); cloud(170, 520, 1); cloud(930, 540, .9); }); pop();
  title("AMERİKA · 1860'LAR", seg(t, s0, s0 + .3));
  const lx = lerp(-200, 540, ss(seg(t, s0, s0 + .8)));
  person(lx, GY + 70, .85, t, LIN, { look: [.2, -.2], armL: 'down', armR: 'down' });
  person(190, GY + 90, .6, t, AID, { look: [.6, -.1], op: talk(t, ['s06']) * .8, happy: t > T0('s06') + 3.4, armL: 'down', armR: 'down' });
  person(890, GY + 90, .6, t, AID, { look: [-.6, -.1], face: -1, happy: t > T0('s06') + 3.6, armL: 'down', armR: 'wave' });
  label('Başkan Lincoln', 540, 560, 52, P.cream, seg(t, T0('s06') + .6, T0('s06') + .95));
  const a = T0('s06') + 3.5; if (t > a) stamp('the Tycoon!', 540, 760, seg(t, a, a + .4), P.acc, 90);
  if (t > T0('s06') + 4.5) label('şaka lakap', 540, 930, 50, P.gold, seg(t, T0('s06') + 4.5, T0('s06') + 4.85));
}
function sBiz(t, s0) {
  push(); backdrop(WORLD.ny, () => { cloud(160, 560, 1); skyline(GY, t); }); pop();
  title("NEW YORK · 1920'LER", seg(t, s0, s0 + .3));
  person(330, GY + 20, 1, t, BIZ, { look: [.4, -.2], op: talk(t, ['s08']) * .8, armL: 'hips', armR: 'up' });
  const n = Math.floor(clamp((t - s0 - .6) * 3, 0, 5)); for (let i = 0; i < n; i++) coin(720 + (i % 3) * 90, GY - 120 - Math.floor(i / 3) * 60 - Math.abs(wob(t, .9, i)) * 12, 1);
  bag(860, GY - 30, 1.2);
  label('güçlü patron', 540, 600, 54, P.cream, seg(t, T0('s08') + 2.8, T0('s08') + 3.2));
  stamp('TYCOON', 600, 780, seg(t, T0('s08') + 3.8, T0('s08') + 4.2), P.acc, 100);
}
function sEx(t, s0) {
  push(); backdrop(WORLD.lib, () => { bookshelf(80, GY - 330); bookshelf(740, GY - 330); }); pop();
  title('BUGÜNKÜ KULLANIM', seg(t, s0, s0 + .3), 'örnek cümle');
  person(540, GY + 40, .9, t, BIZ, { look: [0, -.2], armL: 'down', armR: 'wave', happy: t > T0('s09') + 3 });
  const a = seg(t, T0('s09') - .1, T0('s09') + .3);
  sent([[['The shipping ', P.white], ['tycoon', P.gold]], [['donated millions to build', P.white]], [['a new library for the city.', P.white]]], 560, 52, a);
  const b = seg(t, T1('s09') - .6, T1('s09') - .2);
  if (b > 0) label('"Nakliye devi, şehre kütüphane yaptırdı."', 540, 960, 38, P.cream, b);
}
function sEnd(t, s0) {
  push(); backdrop(WORLD.night, () => { for (let i = 0; i < 9; i++) { const sx = 90 + hash(i) * 900, sy = 420 + hash(i + 9) * 600; fillOnly(ell(sx, sy, 7, 7, 8), P.gold, { boil: 0 }); } }); pop();
  person(200, GY + 20, .62, t, SHO, { look: [.4, -.3], armL: 'down', armR: 'down', happy: true });
  person(540, GY + 20, .62, t, LIN, { look: [0, -.3], armL: 'down', armR: 'down', happy: true });
  person(880, GY + 20, .62, t, BIZ, { look: [-.4, -.3], face: -1, armL: 'down', armR: 'down', happy: true, op: talk(t, ['s10']) * .6 });
  label('şogun', 200, 880, 44, P.cream, seg(t, s0 + .8, s0 + 1.1)); label('başkan', 540, 880, 44, P.cream, seg(t, s0 + 1.2, s0 + 1.5)); label('patron', 880, 880, 44, P.cream, seg(t, s0 + 1.6, s0 + 1.9));
  title('TYCOON', seg(t, s0 + .1, s0 + .4));
  const e = seg(t, T1('s10') + .2, T1('s10') + .6);
  if (e > 0) { panel(130, 520, 820, 130, P.navy, e); if (e > .6) txt('ingilizcecim.com', 540, 590, 84, P.gold); }
}
let SC = [];
function buildScenes() { SC = [[sHook, 0], [sJapan, T0('s02') - .25], [sRoute, T0('s05') - .3], [sUsa, T0('s06') - .3], [sBiz, T0('s08') - .3], [sEx, T0('s09') - .3], [sEnd, T0('s10') - .25]]; }
function sceneAt(t) { let i = 0; for (let j = 0; j < SC.length; j++) if (t >= SC[j][1]) i = j; return i; }
function wipe(k) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  const cols = [P.gold, P.coral, P.blue, P.ok];
  for (let i = 0; i < 4; i++) { const x = lerp(-W * 1.6, W * 1.2, k) + i * 140; g.fillStyle = cols[i]; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + W * .55, 0); g.lineTo(x + W * .25, H); g.lineTo(x - W * .3, H); g.closePath(); g.fill(); }
}
window.render = t => {
  frame(t, { amp: 1.7 }); g.globalAlpha = 1;
  screenRect('#1b1422');
  if (!Z) return;
  if (KAPAK) { coverScene(t); return; }
  const i = sceneAt(t), [f, s] = SC[i];
  if (i > 0 && t < s + .6) {
    const k = seg(t, s, s + .6);
    if (k < .5) SC[i - 1][0](Math.min(t, s), SC[i - 1][1]); else f(t, s);
    wipe(k);
  } else f(t, s);
  caption(t);
};
function coverScene(t) {
  push(); backdrop(WORLD.edo, () => { fuji(250, GY - 140, 1.2); castle(850, GY - 4, .9); cloud(170, 640, 1); }); pop();
  title('KELİMELERİN TARİHÇESİ', 1, 'YDT / YDS kelimesi');
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = 'rgba(35,42,82,.92)'; g.beginPath(); g.roundRect(60, 470, 960, 230, 40); g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  txt('TYCOON', 540, 560, 150, P.gold); txt('şogundan patrona', 540, 656, 52, P.white);
  person(290, GY + 40, .9, t, SHO, { look: [.4, -.1], happy: true, armL: 'down', armR: 'point' });
  person(800, GY + 40, .9, t, BIZ, { look: [-.4, -.1], face: -1, happy: true, armL: 'down', armR: 'wave' });
  coin(540, GY - 120, 1.4);
  label('taikun → tycoon', 540, 1490, 60, P.cream, 1);
}
(async () => {
  Z = await (await fetch('ses/zaman.json')).json(); Z.satirlar.forEach(l => L[l.id] = l);
  await Promise.all([document.fonts.load(`700 64px ${F}`, 'ğşİıçüöÜÇŞĞ'), document.fonts.load(`600 46px ${F}`, 'ğşİıçüöÜÇŞĞ')]);
  await document.fonts.ready;
  buildScenes();
  const endT = T1('s11') + .8;
  window.DUR = Math.max(Z.dur, endT + 2.2);
  const e = [{ t: .5, type: 'pop' }, { t: 1.5, type: 'pop' }];
  for (let i = 1; i < SC.length; i++) e.push({ t: SC[i][1], type: 'whoosh' });
  e.push({ t: T0('s01') + 3.8, type: 'pop' }, { t: T0('s02') + 2.0, type: 'pop' }, { t: T0('s03') + 1.6, type: 'thump' }, { t: T0('s04') + .3, type: 'pop' }, { t: T0('s04') + .7, type: 'pop' }, { t: T0('s05') + 3.0, type: 'ding' }, { t: T0('s06') + 3.5, type: 'thump' }, { t: T0('s06') + 4.5, type: 'pop' }, { t: T0('s08') + 2.8, type: 'pop' }, { t: T0('s08') + 3.8, type: 'ding' }, { t: T0('s09') - .1, type: 'pop' }, { t: T1('s09') - .6, type: 'pop' }, { t: endT - .4, type: 'ding' });
  window.EV = e.filter(x => x.t > 0).sort((a, b) => a.t - b.t);
  window.READY = true;
})();
