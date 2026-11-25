// ingilizcecim.com · Future Perfect mi, Future Continuous mu? — stil: buyuk-kafa-flat (düz 2B, iri kafalı sevimli karakterler, ikiye bölünmüş karşılaştırma)
// Özgün karakterler: Deniz (mavi), Mira (mercan). Motor: toon.js (lemo-opuscar, MIT).
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

const P = { white: '#ffffff', cream: '#fff8e8', acc: '#ffd23f', ok: '#33c26b', bad: '#ff4d5e', blue: '#4aa3ff', coral: '#ff6b5e', dark: '#1d2440', mouthIn: '#4a1a2a', tongue: '#e8637a' };
const DEN = { skin: '#f2c49b', hair: '#2a1c14', shirt: '#2f7de1', shirtS: '#2358b0', pants: '#3b3f5c', shoe: '#2f2b3a' };
const MIR = { skin: '#e0a878', hair: '#7a3e1c', shirt: '#ff6b5e', shirtS: '#d94c40', pants: '#4a3f6b', shoe: '#2f2b3a', pig: true };
const WORLD = {
  sun: { sky: ['#8fd3ff', '#a9deff', '#c4e8ff'], floor: '#7ccf7a', floorS: '#62b562' },
  class: { sky: ['#ffd98a', '#ffcf6d', '#ffc552'], floor: '#d9985f', floorS: '#bb7c46' },
  dine: { sky: ['#9fe3d0', '#86d9c3', '#6fcdb6'], floor: '#c9a06c', floorS: '#ad8754' },
  dusk: { sky: ['#ffb0c8', '#ff9bb8', '#ff86a8'], floor: '#8d7bd6', floorS: '#7262bb' },
  night: { sky: ['#5b3fa8', '#4d3396', '#3f2884'], floor: '#d9985f', floorS: '#bb7c46' },
};
function backdrop(Wd, extra) {
  bands(Wd.sky, -200, GY);
  if (extra) extra();
  shape(rect(-200, GY, W + 400, H - GY + 200), { fill: Wd.floor, lw: 7, shade: () => { fillOnly(rect(-200, GY + 90, W + 400, 14), Wd.floorS, { boil: 0 }); fillOnly(rect(-200, GY + 260, W + 400, 14), Wd.floorS, { boil: 0 }); } });
}
function cloud(x, y, s = 1) { push(); translate(x, y); scale(s); shape(spline([[-90, 20], [-70, -20], [-20, -40], [30, -20], [70, -30], [100, 10], [60, 30], [-50, 34]]), { fill: P.white, lw: 6 }); pop(); }

// ---------- big-head character (origin: feet, y down) ----------
const ARM = { down: [[-96, -108], -8], up: [[-92, -330], -30], point: [[-190, -215], -10], hips: [[-100, -150], 36], wave: [[-130, -320], 25], think: [[-60, -250], -30] };
function person(x, y, s, t, pal, o = {}) {
  const { look = [0, 0], op = 0, sm = .7, brow = 0, armL = 'down', armR = 'down', face = 1, jump = 0, happy = false, tilt = 0 } = o;
  const tt = on12(t), br = 1 + Math.sin(tt * 2.6) * .012;
  push(); translate(x, y - jump); scale(s * face, s * br); rotate(tilt);
  shape(noodle([-28, -112], [-32, -14], -4, 30, 26), { fill: pal.pants, lw: 6 });
  shape(noodle([28, -112], [32, -14], 4, 30, 26), { fill: pal.pants, lw: 6 });
  shape(ell(-38, -8, 36, 17, 20), { fill: pal.shoe, lw: 6 }); shape(ell(38, -8, 36, 17, 20), { fill: pal.shoe, lw: 6 });
  const arm = (side, name) => { const [tip, bend] = ARM[name], tx_ = tip[0] * side, bd = bend * side; shape(noodle([62 * side, -196], [tx_, tip[1]], bd, 28, 24), { fill: pal.shirt, lw: 6 }); shape(ell(tx_, tip[1], 23, 23, 16), { fill: pal.skin, lw: 6 }); };
  arm(1, armR);
  shape(rr(-66, -218, 132, 126, 36), { fill: pal.shirt, lw: 6, shade: () => fillOnly(rect(22, -240, 60, 160), pal.shirtS, { boil: .4 }) });
  arm(-1, armL);
  // head (iri kafa)
  if (pal.pig) { shape(ell(-158, -330, 38, 54, 20), { fill: pal.hair, lw: 6 }); shape(ell(158, -330, 38, 54, 20), { fill: pal.hair, lw: 6 }); }
  shape(ell(0, -366, 158, 150, 40), { fill: pal.hair, lw: 6 });
  shape(ell(-146, -318, 20, 28, 16), { fill: pal.skin, lw: 6 }); shape(ell(146, -318, 20, 28, 16), { fill: pal.skin, lw: 6 });
  shape(ell(0, -318, 146, 134, 44), { fill: pal.skin, lw: 6 });
  shape(spline([[-146, -368], [-100, -420], [0, -440], [100, -420], [146, -368], [90, -382], [0, -392], [-90, -382]]), { fill: pal.hair, lw: 5 });
  const blink = (t % 3.1) > 2.98;
  for (const ex of [-56, 56]) {
    if (blink || o.closed) { stroke(arc(ex, -312, 26, 12, Math.PI * .1, Math.PI * .9, 12), 6); continue; }
    if (happy) { stroke(arc(ex, -306, 26, 20, Math.PI * 1.1, Math.PI * 1.9, 12), 7); continue; }
    shape(ell(ex, -314, 30, 36, 28), { fill: P.white, lw: 6 });
    dot(ex + look[0] * 10, -314 + look[1] * 12, 13);
  }
  if (brow) { stroke([[-90, -366 - brow * 10], [-30, -366 + brow * 8]], 7); stroke([[30, -366 + brow * 8], [90, -366 - brow * 10]], 7); }
  fillOnly(ell(-92, -262, 24, 14, 14), '#ff9a8a', { boil: 0 }); fillOnly(ell(92, -262, 24, 14, 14), '#ff9a8a', { boil: 0 });
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
function cam(cx, cy, z) { translate(W / 2, H / 2); scale(z); translate(-cx, -cy); }

// ---------- props ----------
function clock(x, y, r, hr, mn) {
  shape(ell(x, y, r, r, 40), { fill: P.white, lw: 8 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; stroke([[x + Math.sin(a) * r * .82, y - Math.cos(a) * r * .82], [x + Math.sin(a) * r * .94, y - Math.cos(a) * r * .94]], 5); }
  const ha = hr / 12 * TAU, ma = mn / 60 * TAU;
  stroke([[x, y], [x + Math.sin(ha) * r * .5, y - Math.cos(ha) * r * .5]], 11); stroke([[x, y], [x + Math.sin(ma) * r * .75, y - Math.cos(ma) * r * .75]], 7); dot(x, y, 8);
}
function desk(x, s = 1) { push(); translate(x, GY); scale(s); shape(rect(-170, -170, 340, 30), { fill: '#e0a96a', lw: 7 }); shape(rect(-150, -140, 300, 140), { fill: '#c98a4e', lw: 7, shade: () => fillOnly(rect(60, -140, 100, 140), '#b3763e', { boil: .3 }) }); pop(); }
function paper(x, y, w, h, k = 1) { push(); translate(x, y); rotate(-.06); shape(rr(-w / 2, -h / 2, w, h, 8), { fill: P.white, lw: 6 }); for (let i = 0; i < 3; i++) stroke([[-w / 2 + 16, -h / 2 + 18 + i * 16], [-w / 2 + 16 + (w - 32) * k * (1 - i * .15), -h / 2 + 18 + i * 16]], 5, { line: '#9aa6c4' }); pop(); }
function plate(x, y, food) { shape(ell(x, y, 70, 18, 26), { fill: P.white, lw: 6 }); if (food > .02) { shape(ell(x, y - 8, 40 * food, 22 * food, 18), { fill: '#ff9f43', lw: 5 }); shape(ell(x + 18 * food, y - 24 * food, 22 * food, 14 * food, 14), { fill: '#7bd389', lw: 5 }); } }

// ---------- screen-space cards ----------
function txt(s, x, y, size, col, { wt = '700', align = 'center', ow = 0, oc = INK } = {}) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt} ${size}px ${F}`; g.textAlign = align; g.textBaseline = 'middle';
  if (ow) { g.lineWidth = ow; g.lineJoin = 'round'; g.strokeStyle = oc; g.strokeText(s, x, y); }
  g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
function tw(s, size, wt = '700') { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt} ${size}px ${F}`; const w = g.measureText(s).width; g.restore(); return w; }
function panel(x, y, w, h, fill = P.cream, k = 1) { if (k <= 0) return; push(); translate(x + w / 2, y + h / 2); scale(back(k, .5)); shape(rr(-w / 2, -h / 2, w, h, 30), { fill, lw: 7 }); pop(); }
function chips(items, y, t0, t) {
  const sz = 58, pad = 26, gap = 50, ws = items.map(i => tw(i.s, sz) + pad * 2), tot = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = (W - tot) / 2;
  items.forEach((it, i) => {
    const k = seg(t, t0 + i * .35, t0 + i * .35 + .35);
    if (k > 0) { push(); translate(x + ws[i] / 2, y); scale(back(k, .6)); shape(rr(-ws[i] / 2, -44, ws[i], 88, 24), { fill: it.c, lw: 7 }); pop(); if (k > .6) txt(it.s, x + ws[i] / 2, y + 4, sz, INK); }
    if (i < items.length - 1 && k > .6) txt('+', x + ws[i] + gap / 2, y + 2, 60, P.white, { ow: 12 });
    x += ws[i] + gap;
  });
}
// çok satırlı cümle kutusu: lines = [[[metin, renk], ...], ...]
function sent(lines, y, size, k = 1, mark = null) {
  if (k <= 0) return;
  const ws = lines.map(l => tw(l.map(p => p[0]).join(''), size)), w = Math.max(...ws), lh = size * 1.3, h = lh * lines.length + 40;
  push(); translate(W / 2, y + h / 2 - 20); scale(back(k, .5)); shape(rr(-w / 2 - 40, -h / 2, w + 80, h, 28), { fill: P.dark, lw: 7 }); pop();
  if (k < .6) return;
  lines.forEach((l, i) => { let x = W / 2 - ws[i] / 2; const yy = y + lh * i + lh * .35; for (const [s, c] of l) { txt(s, x, yy, size, c, { align: 'left' }); x += tw(s, size); } });
  const bx = W / 2 + w / 2 + 40, by = y + h / 2 - 20;
  if (mark === 'ok') stroke([[bx + 10, by], [bx + 30, by + 22], [bx + 66, by - 26]], 12, { line: P.ok });
  if (mark === 'bad') { stroke([[bx + 16, by - 24], [bx + 60, by + 24]], 12, { line: P.bad }); stroke([[bx + 60, by - 24], [bx + 16, by + 24]], 12, { line: P.bad }); }
}
function note(s, y, col, k = 1, size = 46) { if (k <= 0) return; const w = tw(s, size, '600'); panel(W / 2 - w / 2 - 34, y - size * .9, w + 68, size * 1.8, col, k); if (k > .6) txt(s, W / 2, y + 2, size, INK, { wt: '600' }); }
function stamp(s, x, y, k, col, size = 70) { if (k <= 0) return; const sc = back(k, .6); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.rotate(-.14); g.scale(sc, sc); g.font = `700 ${size}px ${F}`; const w = g.measureText(s).width; g.lineWidth = 9; g.strokeStyle = col; g.beginPath(); g.roundRect(-w / 2 - 26, -size * .7, w + 52, size * 1.4, 16); g.stroke(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, 0, 4); g.restore(); }

// zaman çizgisi: sürmekte olan iş (cont) / tamamlanmış iş (done)
function bar(y, t, k, mode) {
  const x0 = 120, x1 = 960;
  shape(rr(x0, y - 15, x1 - x0, 30, 15), { fill: P.cream, lw: 7 });
  if (mode === 'cont') {
    const xm = 600, e = lerp(x0 + 20, xm, ss(k));
    shape(rr(x0, y - 15, e - x0, 30, 15), { fill: P.blue, lw: 6 });
    stroke([[xm, y - 56], [xm, y + 56]], 8, { line: P.coral });
    txt('17:00', xm, y - 82, 44, P.white, { ow: 12 });
    dot(e, y, 14 + wob(on12(t), 1.5) * 3, P.acc);
    txt('başladı', x0 + 20, y + 52, 32, P.white, { ow: 9, wt: '600' }); txt('bitiş', x1 - 20, y + 52, 32, P.white, { ow: 9, wt: '600' });
    if (k > .6) txt('sürüyor…', xm + 20, y + 62, 36, INK, { ow: 0, wt: '700', align: 'left' });
  } else {
    const xf = 560, xa = 800, e = lerp(x0 + 20, xf, ss(k));
    shape(rr(x0, y - 15, e - x0, 30, 15), { fill: P.ok, lw: 6 });
    if (k > .9) { stroke([[xf - 14, y - 40], [xf, y - 22], [xf + 24, y - 62]], 11, { line: P.ok }); }
    txt('bitti', xf, y + 54, 34, P.white, { ow: 9, wt: '700' });
    stroke([[xa, y - 56], [xa, y + 56]], 8, { line: P.coral });
    txt('Mira gelir', xa, y - 82, 40, P.white, { ow: 12 });
  }
}

// ---------- subtitles ----------
const KEY = new Set(['will', 'by', 'be', 'have', 'been']);
function caption(t) {
  let c = null; for (const l of Z.satirlar) if (t >= l.t0 - .05 && t <= l.t1 + .45) c = l;
  if (!c) return;
  const words = c.metin.split(/ +/), size = 52, maxW = 860, lh = 66;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `700 ${size}px ${F}`;
  const lines = []; let line = [];
  for (const w of words) { const test = [...line, w].join(' '); if (g.measureText(test).width > maxW && line.length) { lines.push(line); line = [w]; } else line.push(w); }
  if (line.length) lines.push(line);
  const kw = c.kelimeler || [], y0 = 1500 - (lines.length - 1) * lh, cx = W / 2 - 20;
  const ex = c.dil === 'en';
  const who = ex ? 'ÖRNEK' : 'ANLATICI', pc = ex ? '#3a3550' : '#7a5fb3';
  g.font = `700 30px ${F}`; const pw = g.measureText(who).width + 36;
  g.fillStyle = pc; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.roundRect(cx - pw / 2, y0 - lh - 6, pw, 46, 23); g.fill(); g.stroke();
  g.fillStyle = P.white; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(who, cx, y0 - lh + 17);
  let wi = 0;
  lines.forEach((ln, li) => {
    g.font = `700 ${size}px ${F}`; const full = ln.join(' '), lw_ = g.measureText(full).width; let x = cx - lw_ / 2; const y = y0 + li * lh;
    for (const w of ln) {
      const tw0 = (kw.length === words.length && kw[wi]) ? kw[wi].t0 : c.t0 + (c.t1 - c.t0) * wi / words.length, shown = t >= tw0 - .08 || t > c.t1;
      const clean = w.replace(/[.,?!;:']/g, '').toLowerCase();
      const col = KEY.has(clean) ? P.acc : P.white;
      g.textAlign = 'left'; g.lineWidth = 12; g.lineJoin = 'round'; g.strokeStyle = INK; g.globalAlpha = shown ? 1 : 0;
      g.strokeText(w, x, y); g.fillStyle = col; g.fillText(w, x, y);
      x += g.measureText(w + ' ').width; wi++;
    }
  });
  g.globalAlpha = 1; g.restore();
}

// ---------- scenes ----------
function sHook(t) {   // s01: yarın 17:00 — sürüyor mu, bitmiş mi?
  push(); cam(540, 960, 1.0);
  backdrop(WORLD.sun, () => { cloud(180, 560, 1.1); cloud(900, 520, .9); });
  clock(540, 640, 170, 5, 0);
  pop();
  panel(250, 300, 580, 110, P.cream, seg(t, .1, .4)); if (t > .3) txt('Yarın saat 17:00', 540, 358, 60, INK);
  push();
  person(260, GY, 1.0, t, DEN, { look: [.6, -.6], op: talk(t, ['s01']), brow: -.6, armL: 'think', armR: 'down', tilt: -.03 });
  person(830, GY, 1.0, t, MIR, { look: [-.6, -.6], brow: -.6, armL: 'down', armR: 'think', face: -1, tilt: .03 });
  pop();
  const k1 = seg(t, 1.0, 1.4), k2 = seg(t, 2.2, 2.6);
  if (k1 > 0) { panel(100, 830, 300, 100, '#d4ebff', k1); if (k1 > .6) txt('sürüyor?', 250, 882, 54, INK); }
  if (k2 > 0) { panel(680, 830, 300, 100, '#d6f7de', k2); if (k2 > .6) txt('bitti?', 830, 882, 54, INK); }
}
function sExam(t, s0) {   // s02–s03: this time tomorrow, I will be taking the exam
  const ph = t < T0('s03') - .1 ? 1 : 2;
  push(); cam(540, 960, 1.0);
  backdrop(WORLD.class, () => { clock(870, 1010, 90, 5, 0); });
  person(330, GY - 20, .95, t, DEN, { look: [0, .8], op: talk(t, ['s02']), brow: .6, armL: 'down', armR: 'down', sm: .3 });
  desk(330, 1.0);
  paper(330, GY - 182, 150, 100, seg(t, s0, s0 + 3));
  stroke([[360, GY - 190], [420, GY - 238]], 10, { line: '#f2b23a' });
  pop();
  sent([[['This time tomorrow,', P.white]], [['I ', P.white], ['will be taking', P.acc], [' the exam.', P.white]]], 300, 52, seg(t, T0('s02') - .1, T0('s02') + .25));
  bar(780, t, seg(t, s0 + .2, T1('s03')), 'cont');
  if (ph === 2) { chips([{ s: 'will be', c: P.acc }, { s: 'fiil + ing', c: P.blue }], 520, T0('s03') - .1, t); note('o anda iş SÜRÜYOR', 610, '#d4ebff', seg(t, T0('s03') + 1.6, T0('s03') + 1.9), 46); }
}
function sDinner(t, s0) {   // s04–s05: by the time you arrive, we will have finished dinner
  const e = ss(seg(t, T0('s04') + 1.2, T0('s05') + 1.0));
  push(); cam(540, 960, 1.0);
  backdrop(WORLD.dine, () => { shape(rr(800, 860, 200, 470, 14), { fill: '#e8c48a', lw: 7 }); shape(ell(965, 1110, 12, 12, 10), { fill: '#7a4a1e', lw: 5 }); clock(560, 1010, 80, 6, 0); });
  person(300, GY - 6, .95, t, DEN, { look: [.6, .2], op: talk(t, ['s04']), happy: e > .5, armL: 'down', armR: e > .5 ? 'hips' : 'down' });
  const walk = ss(seg(t, T0('s04') + .6, T0('s05') + 1.4));
  person(lerp(1180, 800, walk), GY, .95, t, MIR, { look: [-.6, 0], face: -1, op: talk(t, ['s05']) * .6, armL: 'wave', armR: 'down' });
  push(); translate(0, GY - 170); shape(rect(120, 0, 560, 28), { fill: '#e0a96a', lw: 7 }); shape(rect(150, 28, 40, 170), { fill: '#c98a4e', lw: 6 }); shape(rect(610, 28, 40, 170), { fill: '#c98a4e', lw: 6 });
  plate(260, -8, 1 - e); plate(540, -8, 1 - e); pop();
  pop();
  sent([[['By the time you arrive,', P.white]], [['we ', P.white], ['will have finished', P.acc], [' dinner.', P.white]]], 300, 52, seg(t, T0('s04') - .1, T0('s04') + .25));
  bar(780, t, seg(t, T0('s04') + .6, T0('s05') + 1.2), 'done');
  if (t > T0('s05') - .1) { chips([{ s: 'will have', c: P.acc }, { s: 'V3', c: P.ok }], 520, T0('s05') - .1, t); note('o ana kadar BİTMİŞ', 610, '#d6f7de', seg(t, T0('s05') + 1.8, T0('s05') + 2.1), 46); }
}
function sCompare(t, s0) {   // s06: ikiye bölünmüş ekran
  const k = ss(seg(t, s0, s0 + .5)), hot = seg(t, T0('s06') + .9, T0('s06') + 1.2);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#ffc552'; g.fillRect(0, 0, 540, H); g.fillStyle = '#6fcdb6'; g.fillRect(540, 0, 540, H);
  g.fillStyle = '#e8a93a'; g.fillRect(0, GY, 540, H - GY); g.fillStyle = '#4fb59b'; g.fillRect(540, GY, 540, H - GY);
  stroke([[540, 0], [540, H]], 12);
  // sol
  panel(30, 300, 480, 100, P.blue, k); if (k > .6) txt('will be + V-ing', 270, 350, 46, INK);
  panel(30, 430, 480, 150, P.cream, seg(t, s0 + .3, s0 + .6));
  if (t > s0 + .5) { txt('this time tomorrow', 270, 480, 36, INK, { wt: '600' }); txt('at 5 pm', 270, 525, 36, INK, { wt: '600' }); }
  txt('SÜRÜYOR', 270, 700, 70, P.white, { ow: 14 });
  person(270, GY, .85, t, DEN, { look: [.4, .5], op: talk(t, ['s06']) * .5, armL: 'down', armR: 'down', brow: .4 });
  paper(150, GY - 40, 120, 90, 1);
  // sağ
  panel(570, 300, 480, 100, P.ok, k); if (k > .6) txt('will have + V3', 810, 350, 46, INK);
  panel(570, 430, 480, 150, P.cream, seg(t, s0 + .5, s0 + .8));
  if (t > s0 + .7) { txt('by / by the time', 810, 480, 36, INK, { wt: '600' }); txt('by then', 810, 525, 36, INK, { wt: '600' }); }
  txt('BİTMİŞ', 810, 700, 70, P.white, { ow: 14 });
  person(810, GY, .85, t, MIR, { look: [-.4, 0], happy: true, armL: 'up', armR: 'down', face: -1 });
  if (hot > 0) { stamp('by → future perfect', 810, 880, hot, '#ff4d5e', 44); }
  panel(500, 760, 80, 80, P.acc, k); if (k > .6) txt('VS', 540, 800, 36, INK);
}
function sTrap(t, s0) {   // s07–s08: by the time'dan sonra will yok
  const a = seg(t, s0 + .2, s0 + .6), b = seg(t, T0('s07') + 1.3, T0('s07') + 1.6), c = seg(t, T0('s08') - .1, T0('s08') + .25);
  const bus = ss(seg(t, T0('s08') - .3, T0('s08') + 1.8)), walk = ss(seg(t, T0('s08') + .3, T0('s08') + 2.0));
  push(); cam(540, 960, 1.0);
  backdrop(WORLD.dusk, () => { shape(ell(880, 1000, 90, 90, 30), { fill: '#ffd7a0', lw: 7 }); cloud(250, 930, 1); });
  shape(rect(120, GY - 330, 12, 330), { fill: '#6b5aa8', lw: 6 }); shape(rr(70, GY - 440, 110, 120, 12), { fill: P.acc, lw: 7 }); txt('BUS', 125, GY - 380, 44, INK);
  push(); translate(lerp(1400, 640, bus), GY - 18); shape(rr(-190, -250, 380, 250, 36), { fill: '#ffb03a', lw: 8 }); for (let i = 0; i < 3; i++) shape(rr(-160 + i * 110, -210, 90, 90, 12), { fill: '#bfe9ff', lw: 6 }); shape(ell(-110, 0, 38, 38, 20), { fill: INK, lw: 6 }); shape(ell(110, 0, 38, 38, 20), { fill: INK, lw: 6 }); pop();
  person(lerp(500, 200, walk), GY, .9, t, DEN, { look: [-.6, 0], face: -1, op: talk(t, ['s07', 's08']), happy: walk > .5, armL: 'wave', armR: 'down' });
  pop();
  if (a > 0) { sent([[['By the time you ', P.white], ['will arrive', P.bad]]], 300, 50, a, 'bad'); }
  if (b > 0) { sent([[['By the time you ', P.white], ['arrive', P.ok]]], 470, 50, b, 'ok'); note('will yok → geniş zaman', 650, '#ffe08a', seg(t, T0('s07') + 2.4, T0('s07') + 2.7), 44); }
  if (c > 0) sent([[['By the time the bus comes,', P.white]], [['I ', P.white], ['will have left', P.acc], ['.', P.white]]], 760, 50, c, 'ok');
}
function sEnd(t, s0) {   // s09–s10: soru + ingilizcecim.com
  push(); cam(540, 960, 1.0);
  backdrop(WORLD.night, () => { for (let i = 0; i < 9; i++) { const sx = 90 + hash(i) * 900, sy = 420 + hash(i + 9) * 600; fillOnly(ell(sx, sy, 7, 7, 8), P.acc, { boil: 0 }); } });
  person(240, GY, .95, t, DEN, { look: [.5, -.5], op: talk(t, ['s09']), brow: -.5, armL: 'think', armR: 'down' });
  person(840, GY, .95, t, MIR, { look: [-.5, -.5], brow: -.5, armL: 'down', armR: 'think', face: -1, op: talk(t, ['s10']) });
  pop();
  const k = seg(t, s0 + .1, s0 + .5);
  sent([[['By noon tomorrow,', P.white]], [['I ___ my project.', P.white]]], 300, 56, k);
  const k1 = seg(t, T0('s10') - .1, T0('s10') + .2), k2 = seg(t, T0('s10') + .9, T0('s10') + 1.2);
  if (k1 > 0) { panel(90, 640, 400, 110, P.blue, k1); if (k1 > .6) txt('will finish', 290, 696, 50, INK); }
  if (k2 > 0) { panel(560, 640, 440, 110, P.ok, k2); if (k2 > .6) txt('will have finished', 780, 696, 46, INK); }
  const e = seg(t, T1('s10') + .2, T1('s10') + .6);
  if (e > 0) { panel(130, 860, 780, 140, '#1d1430', e); if (e > .6) txt('ingilizcecim.com', 520, 934, 80, P.acc); }
}
let SC = [];
function buildScenes() { SC = [[sHook, 0], [sExam, T0('s02') - .25], [sDinner, T0('s04') - .3], [sCompare, T0('s06') - .3], [sTrap, T0('s07') - .3], [sEnd, T0('s09') - .25]]; }
function sceneAt(t) { let i = 0; for (let j = 0; j < SC.length; j++) if (t >= SC[j][1]) i = j; return i; }
function wipe(k) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  const cols = [P.acc, P.coral, P.blue, P.ok];
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
function coverScene(t) {   // kapak: sol Deniz (sürüyor) + sağ Mira (bitmiş); önemli her şey y=285–1635
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#ffc552'; g.fillRect(0, 0, 540, H); g.fillStyle = '#6fcdb6'; g.fillRect(540, 0, 540, H);
  g.fillStyle = '#e8a93a'; g.fillRect(0, GY, 540, H - GY); g.fillStyle = '#4fb59b'; g.fillRect(540, GY, 540, H - GY);
  stroke([[540, 0], [540, H]], 12);
  person(270, GY, .9, t, DEN, { look: [.4, .5], op: .2, brow: .4, armL: 'down', armR: 'down' }); desk(270, .9); paper(270, GY - 165, 130, 90, 1);
  person(810, GY, .9, t, MIR, { look: [-.4, 0], happy: true, armL: 'up', armR: 'down', face: -1 });
  panel(60, 300, 960, 90, '#1d1430', 1); txt('DİLBİLGİSİ · YDT / YDS', 540, 346, 48, P.acc);
  g.fillStyle = 'rgba(29,20,48,.88)'; g.beginPath(); g.roundRect(40, 410, 1000, 270, 36); g.fill();
  txt('SÜRÜYOR mu?', 540, 500, 124, P.white, { ow: 18 }); txt('BİTMİŞ mi?', 540, 620, 124, P.acc, { ow: 18 });
  panel(40, 1420, 470, 110, P.blue, 1); txt('will be taking', 275, 1476, 48, INK);
  panel(570, 1420, 470, 110, P.ok, 1); txt('will have finished', 805, 1476, 44, INK);
}
(async () => {
  Z = await (await fetch('ses/zaman.json')).json(); Z.satirlar.forEach(l => L[l.id] = l);
  await Promise.all([document.fonts.load(`700 64px ${F}`, 'ğşİıçüöÜÇŞĞ'), document.fonts.load(`600 46px ${F}`, 'ğşİıçüöÜÇŞĞ')]);
  await document.fonts.ready;
  buildScenes();
  const endT = T1('s10') + .8;
  window.DUR = Math.max(Z.dur, endT + 2.2);
  const e = [{ t: .2, type: 'pop' }, { t: 1.2, type: 'pop' }];
  for (let i = 1; i < SC.length; i++) e.push({ t: SC[i][1], type: 'whoosh' });
  e.push({ t: T0('s03') + .2, type: 'pop' }, { t: T0('s03') + .6, type: 'pop' }, { t: T0('s05') + .2, type: 'pop' }, { t: T0('s05') + .6, type: 'pop' }, { t: T0('s05') + 1.8, type: 'ding' }, { t: T0('s06') + .9, type: 'thump' }, { t: T0('s07') + 1.3, type: 'ding' }, { t: T0('s08') + .3, type: 'click' }, { t: T0('s10') + .9, type: 'ding' }, { t: endT - .4, type: 'pop' });
  window.EV = e.filter(x => x.t > 0).sort((a, b) => a.t - b.t);
  window.READY = true;
})();
