// ingilizcecim.com · 17:30 · As mı, Like mı? — stil: scifi-toon (renkli sitcom çizgi film, sahneye göre değişen renk teması)
// Özgün karakterler: Kaan (öğretmen taklidi yapan öğrenci), Selin Hoca (gerçek öğretmen), küçük Selin (anı). Motor: toon.js (lemo-opuscar scifi-toon demosundan, MIT).
import { clamp, lerp, seg, ss, back, hash, TAU } from '/core/lib.js';
import { INK, g, init, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, frame, bands } from './toon.js';
const W = 1080, H = 1920;
function screenRect(col, a = 1) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }

init(document.getElementById('c'));
const KAPAK = /kapak=1/.test(location.search);
let HIDE = false;
const TF = `'Fredoka'`, SF = `'Fredoka'`;   // Lilita One'da Ğ/İ yok: başlıklar da Fredoka 700
let Z = null; const L = {};
const T0 = id => L[id].t0, T1 = id => L[id].t1;
const on12 = t => Math.floor(t * 12) / 12;
const wob = (t, f = 1, ph = 0) => Math.sin(t * TAU * f + ph);

// ---------- palette ----------
const P = {
  white: '#ffffff', skin: '#f2c49b', skinS: '#d79f76', skin2: '#e0a878', skin2S: '#c48a5c',
  kHair: '#2a1c14', hood: '#3ccf8e', hoodS: '#28a46d', jeans: '#3d5a9e', jeansS: '#2c447a', shoe: '#2f2b3a',
  sHair: '#7a3e1c', sHairS: '#5a2b12', card: '#8a4fd6', cardS: '#6a36ad', blouse: '#fff4d6', skirt: '#2f3f6b',
  dress: '#ffcf3d', dressS: '#e0a81f',
  mouthIn: '#4a1a2a', tongue: '#e8637a', acc: '#ffd23f', ok: '#3ccf6e', bad: '#ff4d5e',
  like: '#ff8a3d', as: '#7ad3ff', chalk: '#f4f1e6', board: '#24584a', boardS: '#1c463b',
};
const WORLD = {
  class: { sky: ['#ffe08a', '#ffd36b', '#ffc54d'], wall: '#f2b23a', wallS: '#d99a22', floor: '#c98f5a', floorS: '#a9733f' },
  door: { sky: ['#9fe3e0', '#86d6d2', '#6cc7c2'], wall: '#4fb3ae', wallS: '#3a9893', floor: '#b89b74', floorS: '#a2855f' },
  pink: { sky: ['#ffb3d1', '#ff9cc2', '#ff85b3'], wall: '#f06aa0', wallS: '#d24f86', floor: '#8a5fd6', floorS: '#6e45b8' },
  night: { sky: ['#5b3fa8', '#4d3396', '#3f2884'], wall: '#33206e', wallS: '#28185a', floor: '#c98f5a', floorS: '#a9733f' },
};

// ---------- face / body helpers ----------
function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 6, skin = P.skin, closed = false, lw = 6, happy = false } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  if (happy) { stroke(arc(cx, cy + ry * .2, rx * .75, ry * .55, Math.PI * 1.1, Math.PI * 1.9, 14), lw + 1); return; }
  shape(ell(cx, cy, rx, ry, 36), { fill: P.white, lw, shade: () => {
    dot(cx + look[0] * rx * .5, cy + look[1] * ry * .45, pupil);
    if (lid > 0) { const yl = cy - ry + lid * 2 * ry; fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 }); stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw); }
  } });
}
function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, lw = 6 } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k], rc = [cx + hw, cy - sm * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62;
  const up = quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), dn = quad(rc, [cx, cy + h + sm * k * .6], lc, 14);
  shape([...up, ...dn], { fill: P.mouthIn, lw, shade: () => {
    if (o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .3 + 6), P.white, { boil: .3 });
    fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), P.tongue, { boil: .3 });
  } });
}
function hand(x, y, ang, r = 22, col = P.skin, { fist = false } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw: 6 }); pop();
}
function arm(a, b, bend, col, hcol, hang, o = {}) { shape(noodle(a, b, bend, 26, 22), { fill: col, lw: 6 }); hand(b[0], b[1], hang, 22, hcol, o); }
function sweat(x, y, s = 1) { shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 }); }
function star(x, y, r) { if (r < 2) return; const p = []; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, q = i % 2 ? r * .4 : r; p.push([x + Math.cos(a) * q, y + Math.sin(a) * q]); } shape(p, { fill: P.acc, lw: 4 }); }

// ---------- characters (origin at feet, y down) ----------
const AR = { down: [[-130, -210], -.4], up: [[-150, -520], -2.4], point: [[-240, -400], -3.0], hips: [[-118, -260], .9], wave: [[-170, -560], -2.0], hold: [[-170, -300], -2.9], book: [[-60, -320], -1.6] };
// Kaan: öğrenci — yeşil kapüşonlu, kot, dağınık saç; isteğe bağlı sahte gözlük + kravat + işaret çubuğu
function kaan(x, y, s, t, o = {}) {
  const { look = [0, 0], lid = 0, sm = 0, op = 0, brow = 0, armL = 'down', armR = 'down', face = 1, lean = 0, specs = false, tie = false, pointer = false, jump = 0, blush = 0, jit = 0, closed = false, happy = false } = o;
  const tt = on12(t), br = 1 + Math.sin(tt * 2.6) * .012;
  push(); translate(x + (jit ? (hash(Math.floor(t * 12) + 5) - .5) * jit : 0), y - jump); scale(s * face, s * br); rotate(lean);
  shape(noodle([-32, -190], [-46, -18], -6, 32, 28), { fill: P.jeans, lw: 6 });
  shape(noodle([32, -190], [46, -18], 6, 32, 28), { fill: P.jeans, lw: 6, shade: () => fillOnly(rect(30, -200, 40, 190), P.jeansS, { boil: .4 }) });
  shape(ell(-54, -10, 42, 20), { fill: P.shoe, lw: 6 }); shape(ell(58, -10, 42, 20), { fill: P.shoe, lw: 6 });
  const body = spline([[-80, -400], [80, -400], [98, -280], [90, -180], [0, -168], [-90, -180], [-98, -280]]);
  shape(body, { fill: P.hood, lw: 6, shade: () => fillOnly(rect(34, -410, 90, 250), P.hoodS, { boil: .5 }) });
  shape(rr(-50, -270, 100, 50, 14), { fill: P.hoodS, lw: 5 });                // front pocket
  stroke([[-22, -396], [-26, -330]], 5); stroke([[22, -396], [26, -330]], 5);  // strings
  if (tie) { shape(spline([[-16, -398], [16, -398], [10, -380], [24, -270], [0, -246], [-24, -270], [-10, -380]]), { fill: P.bad, lw: 5 }); }
  const al = AR[armL] || AR.down, ar = AR[armR] || AR.down;
  arm([-72, -380], al[0], -20, P.hood, P.skin, al[1], { fist: armL === 'hold' });
  arm([72, -380], [-ar[0][0], ar[0][1]], 20, P.hood, P.skin, Math.PI - ar[1], { fist: armR === 'hold' });
  if (pointer && armL === 'point') { push(); translate(-240, -400); rotate(-.5); shape(rr(-8, -200, 14, 210, 6), { fill: '#b5763c', lw: 5 }); shape(ell(-1, -204, 12, 12), { fill: P.bad, lw: 4 }); pop(); }
  push(); translate(0, -510);
  shape(ell(0, 0, 116, 110, 48), { fill: P.skin, lw: 6, shade: () => {
    fillOnly(ell(60, 20, 90, 110), P.skinS, { boil: .4 });
    fillOnly(spline([[-124, -30], [-110, -96], [-60, -132], [0, -140], [70, -130], [118, -90], [124, -30], [86, -74], [44, -64], [10, -92], [-30, -70], [-80, -82]]), P.kHair, { boil: .5 });
    if (blush) { fillOnly(ell(-70, 34, 22, 12), `rgba(255,90,110,${.55 * blush})`, { boil: .2 }); fillOnly(ell(78, 34, 22, 12), `rgba(255,90,110,${.55 * blush})`, { boil: .2 }); }
  } });
  // spikes
  shape(spline([[-40, -128], [-20, -176], [0, -132], [26, -170], [40, -126]]), { fill: P.kHair, lw: 6 });
  eye(-36, -6, 36, 44, { look, lid, closed, happy, skin: P.skin }); eye(40, -6, 36, 44, { look, lid, closed, happy, skin: P.skin });
  if (specs) { shape(rr(-80, -40, 84, 66, 16), { fill: 'rgba(255,255,255,.0)', lw: 7 }); shape(rr(0, -40, 84, 66, 16), { fill: 'rgba(255,255,255,.0)', lw: 7 }); stroke([[-4, -14], [4, -14]], 7); }
  stroke([[-64, -66 + brow * 6], [-12, -70 - brow * 12]], 7); stroke([[14, -70 - brow * 12], [68, -66 + brow * 6]], 7);
  mouth(4, 56, 62, { o: op, sm, lw: 6 });
  if (jit) sweat(108, -40, 1.1);
  pop(); pop();
}
// Selin Hoca: öğretmen — mor hırka, at kuyruğu, boynunda kart, kolunda kitaplar
function selin(x, y, s, t, o = {}) {
  const { look = [0, 0], lid = 0, sm = 0, op = 0, brow = 0, armL = 'down', armR = 'down', face = 1, lean = 0, books = false, badge = true, closed = false, happy = false } = o;
  const tt = on12(t), br = 1 + Math.sin(tt * 2.2 + 1) * .01;
  push(); translate(x, y); scale(s * face, s * br); rotate(lean);
  shape(noodle([-28, -190], [-40, -18], -4, 24, 22), { fill: P.skin, lw: 6 });
  shape(noodle([28, -190], [40, -18], 4, 24, 22), { fill: P.skin, lw: 6 });
  shape(ell(-46, -10, 38, 18), { fill: P.cardS, lw: 6 }); shape(ell(50, -10, 38, 18), { fill: P.cardS, lw: 6 });
  shape(spline([[-80, -300], [80, -300], [118, -170], [0, -150], [-118, -170]]), { fill: P.skirt, lw: 6 });
  shape(spline([[-76, -430], [76, -430], [96, -300], [0, -280], [-96, -300]]), { fill: P.blouse, lw: 6 });
  shape(spline([[-76, -430], [-28, -430], [-30, -290], [-96, -300]]), { fill: P.card, lw: 6, shade: () => fillOnly(rect(-110, -440, 40, 160), P.cardS, { boil: .4 }) });
  shape(spline([[28, -430], [76, -430], [96, -300], [30, -290]]), { fill: P.card, lw: 6, shade: () => fillOnly(rect(60, -440, 60, 160), P.cardS, { boil: .4 }) });
  if (badge) { stroke([[-22, -428], [0, -368], [22, -428]], 4, { line: P.bad }); shape(rr(-44, -372, 88, 54, 8), { fill: P.white, lw: 5 }); }
  const al = AR[armL] || AR.down, ar = AR[armR] || AR.down;
  arm([-70, -410], al[0], -20, P.card, P.skin, al[1]);
  arm([70, -410], [-ar[0][0], ar[0][1]], 20, P.card, P.skin, Math.PI - ar[1]);
  if (books) { push(); translate(150, -300); rotate(.12); shape(rr(-60, -24, 120, 28, 6), { fill: '#ff6b6b', lw: 5 }); shape(rr(-54, -54, 110, 30, 6), { fill: '#7ad3ff', lw: 5 }); shape(rr(-62, -84, 118, 30, 6), { fill: P.acc, lw: 5 }); pop(); }
  push(); translate(0, -540);
  shape(spline([[90, -60], [200, -30], [230, 70], [170, 40], [120, 10]]), { fill: P.sHair, lw: 6 });  // ponytail
  shape(ell(0, 0, 108, 108, 48), { fill: P.skin, lw: 6, shade: () => {
    fillOnly(ell(56, 20, 84, 108), P.skinS, { boil: .4 });
    fillOnly(spline([[-118, 10], [-104, -86], [-30, -126], [50, -122], [110, -76], [116, -10], [60, -70], [-10, -78], [-70, -56]]), P.sHair, { boil: .5 });
  } });
  eye(-34, -2, 32, 40, { look, lid, closed, happy, skin: P.skin }); eye(38, -2, 32, 40, { look, lid, closed, happy, skin: P.skin });
  stroke([[-60, -56 + brow * 6], [-12, -60 - brow * 10]], 6); stroke([[14, -60 - brow * 10], [64, -56 + brow * 6]], 6);
  // lashes
  stroke([[-66, -22], [-80, -32]], 5); stroke([[72, -22], [86, -32]], 5);
  mouth(4, 54, 56, { o: op, sm, lw: 6 });
  pop(); pop();
}
// küçük Selin (anı): sarı elbise, iki örgü, elinde boya kalemi
function kidSelin(x, y, s, t, o = {}) {
  const { look = [.5, .3], sm = .9, armR = 'hold' } = o;
  push(); translate(x, y); scale(s);
  shape(noodle([-20, -120], [-28, -12], -3, 18, 16), { fill: P.skin, lw: 6 }); shape(noodle([20, -120], [28, -12], 3, 18, 16), { fill: P.skin, lw: 6 });
  shape(ell(-32, -8, 26, 13), { fill: P.bad, lw: 5 }); shape(ell(34, -8, 26, 13), { fill: P.bad, lw: 5 });
  shape(spline([[-50, -260], [50, -260], [96, -110], [0, -96], [-96, -110]]), { fill: P.dress, lw: 6, shade: () => fillOnly(rect(30, -270, 80, 180), P.dressS, { boil: .4 }) });
  arm([-44, -240], [-90, -150], -14, P.dress, P.skin, -.4);
  arm([44, -240], AR[armR] === AR.hold ? [130, -180] : [90, -150], 14, P.dress, P.skin, .6, { fist: true });
  push(); translate(138, -186); rotate(.8); shape(rr(-7, -40, 14, 60, 5), { fill: '#3ccf6e', lw: 4 }); pop();
  push(); translate(0, -330);
  shape(ell(-96, 20, 26, 40), { fill: P.sHair, lw: 6 }); shape(ell(96, 20, 26, 40), { fill: P.sHair, lw: 6 });
  shape(ell(0, 0, 84, 80, 40), { fill: P.skin, lw: 6, shade: () => fillOnly(spline([[-88, 0], [-70, -66], [0, -90], [70, -66], [88, 0], [40, -40], [-40, -40]]), P.sHair, { boil: .4 }) });
  eye(-28, 2, 24, 30, { look, skin: P.skin }); eye(30, 2, 24, 30, { look, skin: P.skin });
  mouth(2, 42, 40, { o: 0, sm, lw: 5 });
  pop(); pop();
}
// sınıf arkadaşları (arka sıra, sadece baş + omuz)
function pupil(x, y, s, col, hair, t, ph, o = {}) {
  const { look = [0, 0], sm = .3, laugh = 0 } = o;
  push(); translate(x, y + (laugh ? Math.abs(wob(on12(t), 3, ph)) * -10 : 0)); scale(s);
  shape(spline([[-80, 0], [-70, -80], [70, -80], [80, 0]]), { fill: col, lw: 6 });
  shape(ell(0, -150, 70, 68, 36), { fill: P.skin2, lw: 6, shade: () => { fillOnly(ell(36, -140, 50, 70), P.skin2S, { boil: .3 }); fillOnly(spline([[-76, -150], [-60, -206], [0, -224], [60, -206], [76, -150], [30, -186], [-30, -186]]), hair, { boil: .4 }); } });
  eye(-22, -150, 20, 24, { look, skin: P.skin2, happy: laugh > 0 }); eye(24, -150, 20, 24, { look, skin: P.skin2, happy: laugh > 0 });
  mouth(2, -112, 34, { o: laugh ? .5 : 0, sm, lw: 5 });
  pop();
}

// ---------- worlds ----------
const GY = 1300;
function sky(Wd) { bands(Wd.sky, -200, GY - 300); fillOnly(rect(-200, GY - 302, W + 400, 304), Wd.wall, { boil: 0 }); }
function ground(Wd) { shape(rect(-200, GY, W + 400, H - GY + 200), { fill: Wd.floor, lw: 6, shade: () => { fillOnly(rect(-200, GY, W + 400, 26), Wd.floorS, { boil: .3 }); for (let i = 0; i < 7; i++) stroke([[-100 + i * 200, GY + 30], [-160 + i * 200, H + 100]], 4, { line: Wd.floorS }); } }); }
// chalkboard with chalk lines: lines = [[text, colour, size]]
function board(x, y, w, h, lines = [], k = 1) {
  shape(rr(x - 16, y - 16, w + 32, h + 32, 14), { fill: '#8a5a32', lw: 6 });
  shape(rr(x, y, w, h, 8), { fill: P.board, lw: 5, shade: () => { fillOnly(ell(x + w * .7, y + h * .3, w * .4, h * .5), P.boardS, { boil: .3 }); } });
  shape(rect(x + 20, y + h + 16, w - 40, 18), { fill: '#a8693e', lw: 5 });
  shape(rr(x + 60, y + h + 2, 50, 14, 6), { fill: P.chalk, lw: 4 }); shape(rr(x + 130, y + h + 2, 40, 14, 6), { fill: P.acc, lw: 4 });
  if (HIDE && !KAPAK) return;
  lines.forEach(([s, c, sz, dy], i) => { if (k <= i / Math.max(1, lines.length) ) return; chalkTxt(s, x + w / 2, y + (dy ?? (h * (i + 1) / (lines.length + 1))), sz || 54, c || P.chalk); });
}
function chalkTxt(s, x, y, size, col) { const [a, b] = [x, y]; g.save(); const m = cur(); g.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]); g.font = `700 ${size}px ${TF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.globalAlpha = .92; g.fillText(s, a, b); g.restore(); }
import { getM } from './toon.js';
const cur = () => getM();
function clock(x, y, t) { shape(ell(x, y, 60, 60, 30), { fill: P.white, lw: 6 }); stroke([[x, y], [x, y - 40]], 6); const a = t * .5; stroke([[x, y], [x + Math.cos(a) * 34, y + Math.sin(a) * 34]], 5); dot(x, y, 7); }
function desk(x, y, s = 1, col = '#c98f5a') { push(); translate(x, y); scale(s); shape(rect(-150, -170, 300, 26), { fill: col, lw: 6 }); shape(rr(-130, -144, 20, 144, 6), { fill: '#7a4a2a', lw: 5 }); shape(rr(110, -144, 20, 144, 6), { fill: '#7a4a2a', lw: 5 }); pop(); }
function windowW(x, y, w, h, night = false) { shape(rr(x, y, w, h, 14), { fill: night ? '#2a2060' : '#e9f6ff', lw: 6, shade: () => { if (night) { for (let i = 0; i < 5; i++) star(x + 30 + i * 50, y + 40 + (i % 2) * 60, 8); } else { fillOnly(ell(x + w - 50, y + 50, 30, 30), '#fff2a8', { boil: .3 }); fillOnly(ell(x + 60, y + h - 30, 70, 30), '#bfe9c8', { boil: .3 }); } } }); stroke([[x + w / 2, y], [x + w / 2, y + h]], 6); stroke([[x, y + h / 2], [x + w, y + h / 2]], 6); }
function classroom(t, Wd = WORLD.class, lines = [], k = 1) {
  sky(Wd);
  board(170, 560, 740, 400, lines, k);
  clock(980, 620, t);
  windowW(-40, 620, 180, 300);
  ground(Wd);
}
function corridor(t, open = 1) {
  const Wd = WORLD.door; sky(Wd);
  // notice board
  shape(rr(90, 600, 330, 260, 12), { fill: '#e8c88f', lw: 6, shade: () => { fillOnly(rr(120, 630, 120, 90, 6), '#fff8e8', { boil: .2 }); fillOnly(rr(270, 650, 120, 80, 6), '#ffd0d5', { boil: .2 }); fillOnly(rr(150, 750, 220, 80, 6), '#bfe9ff', { boil: .2 }); } });
  // door frame
  shape(rr(600, 820, 300, 480, 10), { fill: '#7a4a2a', lw: 6 });
  shape(rr(620, 840, 260, 460, 6), { fill: '#3a2a20', lw: 5 });
  push(); translate(620, 840); scale(1 - .75 * open, 1); shape(rr(0, 0, 260, 460, 6), { fill: '#a8693e', lw: 6, shade: () => fillOnly(rr(30, 30, 200, 160, 8), 'rgba(0,0,0,.12)', { boil: .2 }) }); pop();
  ground(Wd);
}
function memory(t) {   // pembe anı odası: küçük masa + resim kâğıdı
  const Wd = WORLD.pink; sky(Wd);
  for (let i = 0; i < 6; i++) { const x = 80 + i * 180, y = 520 + (i % 2) * 90 + wob(on12(t), .3, i) * 8; shape(ell(x, y, 22, 22), { fill: ['#fff36b', '#7ad3ff', '#ffffff'][i % 3], lw: 5 }); }
  // drawings on wall
  shape(rr(120, 640, 220, 180, 8), { fill: P.white, lw: 6, shade: () => { fillOnly(ell(230, 700, 34, 34), P.acc, { boil: .3 }); fillOnly(rect(150, 760, 160, 40), '#3ccf6e', { boil: .3 }); } });
  shape(rr(720, 660, 220, 170, 8), { fill: P.white, lw: 6, shade: () => { fillOnly(spline([[760, 800], [830, 700], [900, 800]]), '#ff6b6b', { boil: .3 }); fillOnly(rect(780, 790, 100, 30), '#7a4a2a', { boil: .3 }); } });
  ground(Wd);
}

// ---------- screen cards ----------
function txt(s, x, y, size, col, { font = TF, wt = '700', align = 'center', ow = 0, oc = INK } = {}) {
  if (HIDE) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt ? wt + ' ' : ''}${size}px ${font}`; g.textAlign = align; g.textBaseline = 'middle';
  if (ow) { g.lineWidth = ow; g.lineJoin = 'round'; g.strokeStyle = oc; g.strokeText(s, x, y); }
  g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
function tw(s, size, font = TF, wt = '700') { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt ? wt + ' ' : ''}${size}px ${font}`; const w = g.measureText(s).width; g.restore(); return w; }
function panel(x, y, w, h, fill = '#fff8e8', k = 1) { if (k <= 0 || HIDE) return; push(); translate(x + w / 2, y + h / 2); scale(back(k, .5)); shape(rr(-w / 2, -h / 2, w, h, 30), { fill, lw: 7 }); pop(); }
function chips(items, y, t0, t) {
  if (HIDE) return;
  const sz = 62, pad = 26, gap = 50, ws = items.map(i => tw(i.s, sz) + pad * 2), tot = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = (W - tot) / 2 - 20;
  items.forEach((it, i) => {
    const k = seg(t, t0 + i * .35, t0 + i * .35 + .35);
    if (k > 0) { push(); translate(x + ws[i] / 2, y); scale(back(k, .6)); shape(rr(-ws[i] / 2, -46, ws[i], 92, 24), { fill: it.c, lw: 7 }); pop(); if (k > .6) txt(it.s, x + ws[i] / 2, y + 4, sz, INK); }
    if (i < items.length - 1 && k > .6) txt('+', x + ws[i] + gap / 2, y + 2, 64, P.white, { ow: 12 });
    x += ws[i] + gap;
  });
}
function sentence(parts, y, size, k = 1, { mark = null } = {}) {
  if (k <= 0 || HIDE) return;
  const full = parts.map(p => p[0]).join(''), w = tw(full, size), x0 = (W - w) / 2 - (mark ? 30 : 0) - 20;
  push(); translate(W / 2 - (mark ? 30 : 0) - 20, y); scale(back(k, .5)); shape(rr(-w / 2 - 36, -size * .85, w + 72 + (mark ? 70 : 0), size * 1.7, 26), { fill: '#1d1430', lw: 7 }); pop();
  if (k < .6) return;
  let x = x0;
  for (const [s, c] of parts) { txt(s, x, y + 4, size, c, { align: 'left' }); x += tw(s, size); }
  if (mark === 'ok') stroke([[x + 34, y], [x + 50, y + 18], [x + 82, y - 22]], 11, { line: P.ok });
  if (mark === 'bad') { stroke([[x + 36, y - 20], [x + 76, y + 20]], 11, { line: P.bad }); stroke([[x + 76, y - 20], [x + 36, y + 20]], 11, { line: P.bad }); }
}
function note(s, y, col, k = 1, size = 46) { if (k <= 0) return; const w = tw(s, size, SF, 600); panel(W / 2 - 20 - w / 2 - 34, y - size * .9, w + 68, size * 1.8, col, k); if (k > .6) txt(s, W / 2 - 20, y + 2, size, INK, { font: SF, wt: 600 }); }
function stamp(s, x, y, k, col = P.bad, size = 80) { if (k <= 0 || HIDE) return; const sc = back(k, .6); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.rotate(-.16); g.scale(sc, sc); g.font = `700 ${size}px ${TF}`; const w = g.measureText(s).width; g.lineWidth = 9; g.strokeStyle = col; g.beginPath(); g.roundRect(-w / 2 - 28, -size * .7, w + 56, size * 1.4, 16); g.stroke(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, 0, 6); g.restore(); }
function bigQ(x, y, t, k) { if (k <= 0) return; txt('?', x, y + wob(on12(t), 1) * 8, Math.max(1, 140 * back(k, .6)), P.white, { ow: 16 }); }

// ---------- subtitles ----------
const WHO = { s02: ['ÖRNEK', '#3a3550'], s05: ['SELİN HOCA', P.cardS], s07: ['SELİN HOCA', P.cardS], s09: ['SELİN HOCA', P.cardS], s12: ['SELİN HOCA', P.cardS] };
function caption(t) {
  let c = null; for (const l of Z.satirlar) if (t >= l.t0 - .05 && t <= l.t1 + .45) c = l;
  if (!c) return;
  const words = c.metin.split(/ +/), size = 52, maxW = 820, lh = 66;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `700 ${size}px ${SF}`;
  const lines = []; let line = [];
  for (const w of words) { const test = [...line, w].join(' '); if (g.measureText(test).width > maxW && line.length) { lines.push(line); line = [w]; } else line.push(w); }
  if (line.length) lines.push(line);
  const kw = c.kelimeler || [], y0 = 1500 - (lines.length - 1) * lh, cx = W / 2 - 20;
  const [who, pc] = WHO[c.id] || ['ANLATICI', '#7a5fb3'];
  g.font = `700 30px ${SF}`; const pw = g.measureText(who).width + 36;
  g.fillStyle = pc; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.roundRect(cx - pw / 2, y0 - lh - 6, pw, 46, 23); g.fill(); g.stroke();
  g.fillStyle = P.white; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(who, cx, y0 - lh + 17);
  let wi = 0;
  lines.forEach((ln, li) => {
    g.font = `700 ${size}px ${SF}`; const full = ln.join(' '), lw_ = g.measureText(full).width; let x = cx - lw_ / 2; const y = y0 + li * lh;
    for (const w of ln) {
      const tw0 = (kw.length === words.length && kw[wi]) ? kw[wi].t0 : c.t0 + (c.t1 - c.t0) * wi / words.length, shown = t >= tw0 - .08 || t > c.t1;
      const clean = w.replace(/[.,?!;']/g, '').toLowerCase();
      const col = clean === 'like' ? P.like : clean === 'as' ? P.as : P.white;
      g.textAlign = 'left'; g.lineWidth = 12; g.lineJoin = 'round'; g.strokeStyle = INK; g.globalAlpha = shown ? 1 : 0;
      g.strokeText(w, x, y); g.fillStyle = col; g.fillText(w, x, y);
      x += g.measureText(w + ' ').width; wi++;
    }
  });
  g.globalAlpha = 1; g.restore();
}
function talk(t, ids) {
  for (const id of ids) { const l = L[id]; if (!l || t < l.t0 || t > l.t1) continue;
    for (const k of (l.kelimeler || [])) if (t >= k.t0 && t <= k.t1) { const u = (t - k.t0) / Math.max(.08, k.t1 - k.t0); return .25 + .45 * Math.abs(Math.sin(on12(u) * Math.PI * 2)); }
    return .3; }
  return 0;
}
function cam(cx, cy, z) { translate(W / 2, H / 2); scale(z); translate(-cx, -cy); }

// ---------- scenes ----------
function sHook(t) {   // s01: Kaan tahtada, sahte gözlük + kravat; sınıf gülüyor — Kaan öğretmen mi?
  const z = lerp(1.0, 1.07, ss(seg(t, 0, T1('s01'))));
  push(); cam(540, 960, z);
  classroom(t, WORLD.class, [['GRAMMAR', P.chalk, 64], ['as  /  like', P.acc, 84]]);
  kaan(190, GY, 1.0, t, { face: -1, specs: true, tie: true, pointer: true, armL: 'point', armR: 'hips', look: [-.7, -.3], brow: -.4, sm: .7, op: .05 + (wob(on12(t), 2) > .3 ? .2 : 0) });
  pupil(700, GY + 260, .95, '#7a5fb3', '#2a1c14', t, 0, { look: [-.6, -.4], laugh: t > 1.2 ? 1 : 0 });
  pupil(940, GY + 280, .9, '#ff6b6b', '#c7802f', t, 1.3, { look: [-.8, -.4], sm: .6 });
  pop();
  panel(110, 290, 860, 150, '#fff8e8', seg(t, .15, .5)); if (t > .4) txt('Kaan öğretmen mi?', 520, 368, 76, INK);
  bigQ(760, 1080, t, seg(t, .6, 1.0));
}
function sLike(t, s0) {   // s02–s03: "He talks like a teacher." — like = gibi; damga: ÖĞRENCİ
  const ph = t < T0('s03') - .1 ? 1 : 2;
  push(); cam(540, 960, ph === 1 ? 1.04 : 1.0);
  classroom(t, WORLD.class, [['like = gibi', P.like, 80]]);
  kaan(190, GY, 1.0, t, { face: -1, specs: true, tie: true, pointer: true, armL: ph === 1 ? 'point' : 'up', armR: 'hips', look: [-.6, -.2], brow: -.5, sm: .8, op: (wob(on12(t), 2) > 0 ? .3 : .05) });
  pupil(700, GY + 260, .95, '#7a5fb3', '#2a1c14', t, 0, { look: [-.6, -.4], laugh: 1 });
  pupil(940, GY + 280, .9, '#ff6b6b', '#c7802f', t, 1.3, { look: [-.8, -.4], laugh: ph === 2 ? 1 : 0 });
  pop();
  sentence([['He talks ', P.white], ['like', P.like], [' a teacher.', P.white]], 340, 62, seg(t, T0('s02') - .1, T0('s02') + .25));
  if (ph === 2) {
    const s1 = T0('s03') - .1;
    chips([{ s: 'like', c: P.like }, { s: 'isim', c: '#fff8e8' }], 470, s1, t);
    note('= gibi (benzetme)', 590, '#ffe2c8', seg(t, s1 + .9, s1 + 1.2), 50);
    stamp('Öğrenci', 250, 1120, seg(t, T0('s03') + 1.6, T0('s03') + 1.9), P.bad, 74);
  }
}
function sAs(t, s0) {   // s04–s06: kapı açılır, Selin Hoca girer; "As a teacher, I see this every day."
  const ph = t < T0('s05') - .1 ? 1 : t < T0('s06') - .1 ? 2 : 3;
  const open = ss(seg(t, s0 + .2, s0 + .9));
  push(); cam(540, 960, ph === 2 ? 1.05 : 1.0);
  corridor(t, open);
  const walk = ss(seg(t, s0 + .6, s0 + 1.8));
  selin(lerp(900, 720, walk), GY, 1.0, t, { books: true, armR: 'down', armL: ph === 2 ? 'up' : 'down', look: [-.7, 0], sm: .6, op: talk(t, ['s05']), brow: ph === 1 ? .2 : -.2 });
  kaan(260, GY, .95, t, ph === 1 ? { specs: true, tie: true, look: [.9, 0], brow: 1.2, sm: -.6, op: .35, armL: 'down', armR: 'down', jit: 5, blush: .8 }
    : { specs: false, tie: true, look: [.8, -.2], brow: .8, sm: -.2, op: 0, armL: 'down', armR: 'down', blush: .6 });
  pop();
  if (ph === 1) { panel(110, 290, 860, 150, '#bfe9ff', seg(t, s0 + .3, s0 + .65)); if (t > s0 + .55) txt('Gerçek öğretmen geldi!', 520, 368, 70, INK); }
  if (ph >= 2) sentence([['As', P.as], [' a teacher, I see this every day.', P.white]], 340, 48, seg(t, T0('s05') - .1, T0('s05') + .25), { mark: 'ok' });
  if (ph === 3) {
    const s1 = T0('s06') - .1;
    chips([{ s: 'as', c: P.as }, { s: 'isim', c: '#fff8e8' }], 470, s1, t);
    note('= olarak, sıfatıyla (gerçek rol)', 590, '#d9f3ff', seg(t, s1 + .9, s1 + 1.2), 46);
  }
  if (ph >= 2 && !HIDE) { stamp('Öğretmen', 740, 1150, seg(t, T0('s05') + .3, T0('s05') + .6), P.ok, 64); }
}
function sChild(t, s0) {   // s07–s08: anı (küçük Selin resim yapıyor) · s09–s10: Kaan sıranın üstünde zıplıyor
  const ph = t < T0('s09') - .15 ? 1 : 2;
  if (ph === 1) {
    push(); cam(540, 960, lerp(1.0, 1.06, ss(seg(t, s0, T1('s08'))))); memory(t);
    desk(520, GY, 1.0, '#ffe08a');
    shape(rr(440, GY - 196, 160, 26, 4), { fill: P.white, lw: 4 });
    kidSelin(360, GY, 1.25, t);
    selin(860, GY, .82, t, { look: [-.6, -.1], closed: true, sm: .9, op: talk(t, ['s07']), armL: 'down', armR: 'down', happy: false });
    pop();
    stamp('ANI', 250, 1190, seg(t, s0 + .3, s0 + .6), '#fff8e8', 56);
    sentence([['As', P.as], [' a child, I loved drawing.', P.white]], 340, 52, seg(t, T0('s07') - .1, T0('s07') + .25), { mark: 'ok' });
    note('as a child = çocukken', 480, '#d9f3ff', seg(t, T0('s08') + .1, T0('s08') + .4), 50);
  } else {
    const jump = Math.abs(Math.sin(on12(t) * 4.2)) * 70;
    push(); cam(540, 960, 1.02);
    classroom(t, WORLD.class, []);
    desk(330, GY, 1.05);
    kaan(330, GY - 170, .9, t, { jump, tie: true, armL: 'up', armR: 'wave', look: [.3, -.4], sm: 1, op: .5, happy: true });
    selin(800, GY, .95, t, { look: [-.8, -.3], brow: -1.2, sm: -.6, op: talk(t, ['s09']), armL: 'hips', armR: 'point', badge: true });
    pop();
    sentence([['Stop acting ', P.white], ['like', P.like], [' a child!', P.white]], 340, 58, seg(t, T0('s09') - .1, T0('s09') + .2));
    note('like a child = çocuk gibi', 480, '#ffe2c8', seg(t, T0('s10') + .1, T0('s10') + .4), 50);
  }
}
function sClause(t, s0) {   // s11–s12: as + tam cümle (resmî) — "Do as I say." Kaan sırasında not alıyor
  push(); cam(540, 960, 1.0);
  classroom(t, WORLD.night, [['as + tam cümle', P.as, 64], ['(resmî dil)', P.chalk, 50], ['Like I said… (günlük)', P.like, 46]], seg(t, s0 + .3, s0 + 2.4));
  windowW(-40, 620, 180, 300, true);
  desk(190, GY + 140, 1.0);
  kaan(190, GY + 140, .8, t, { look: [.6, -.3], sm: .5, op: 0, armL: 'book', armR: 'down', lid: .2 });
  selin(950, GY, .9, t, { look: [-.5, -.2], brow: .2, sm: .5, op: talk(t, ['s12']), armL: 'point', armR: 'down' });
  pop();
  if (t > T0('s12') - .1) sentence([['Do ', P.white], ['as', P.as], [' I say.', P.white]], 340, 66, seg(t, T0('s12') - .1, T0('s12') + .2), { mark: 'ok' });
  else note('Bağlaç olarak: resmî dilde as', 380, '#d9f3ff', seg(t, s0 + .2, s0 + .5), 46);
}
function sEnd(t, s0) {   // s13: soru + ingilizcecim.com
  push(); cam(540, 960, 1.0);
  classroom(t, WORLD.door, [['She works ___ a nurse.', P.chalk, 60], ['as ?   like ?', P.acc, 70]]);
  kaan(150, GY, .9, t, { face: -1, look: [.4, -.3], sm: .9, op: .05, armL: 'wave', armR: 'down', tie: false, happy: true });
  selin(950, GY, .9, t, { look: [-.4, -.2], sm: .9, op: 0, armL: 'wave', armR: 'down', books: false });
  pop();
  panel(80, 290, 880, 150, '#fff8e8', seg(t, s0 + .05, s0 + .4)); if (t > s0 + .3) txt('Sıra sende: as mı, like mı?', 520, 368, 62, INK);
  const e = seg(t, T1('s13') + .2, T1('s13') + .6);
  if (e > 0) { panel(130, 1330, 780, 150, '#1d1430', e); if (e > .6) txt('ingilizcecim.com', 520, 1408, 84, P.acc); }
}
let SC = [];
function buildScenes() {
  SC = [[sHook, 0], [sLike, T0('s02') - .25], [sAs, T0('s04') - .3], [sChild, T0('s07') - .3], [sClause, T0('s11') - .3], [sEnd, T0('s13') - .25]];
}
function sceneAt(t) { let i = 0; for (let j = 0; j < SC.length; j++) if (t >= SC[j][1]) i = j; return i; }
function wipe(k) {   // renkli şerit geçişi
  g.setTransform(1, 0, 0, 1, 0, 0);
  const cols = [P.acc, P.like, P.as, P.card];
  for (let i = 0; i < 4; i++) { const x = lerp(-W * 1.6, W * 1.2, k) + i * 140; g.fillStyle = cols[i]; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + W * .55, 0); g.lineTo(x + W * .25, H); g.lineTo(x - W * .3, H); g.closePath(); g.fill(); }
}

window.render = t => {
  frame(t, { amp: 1.7 }); g.globalAlpha = 1; HIDE = KAPAK;
  screenRect('#1b1422');
  if (!Z) return;
  if (KAPAK) { HIDE = false; coverScene(t); return; }
  const i = sceneAt(t), [f, s] = SC[i];
  if (i > 0 && t < s + .6) {
    const k = seg(t, s, s + .6);
    if (k < .5) SC[i - 1][0](Math.min(t, s), SC[i - 1][1]); else f(t, s);
    wipe(k);
  } else f(t, s);
  caption(t);
};
function coverScene(t) {   // kapak: Kaan "like a teacher" + Selin Hoca "as a teacher" aynı karede
  push(); cam(540, 980, .95);
  classroom(t, WORLD.class, [], 1);
  kaan(300, GY, 1.0, t, { specs: true, tie: true, pointer: true, armL: 'point', armR: 'hips', look: [.6, -.2], brow: -.4, sm: .8, op: .2 });
  selin(800, GY, 1.0, t, { books: true, look: [-.6, -.1], sm: .7, op: 0, armL: 'hips' });
  pop();
  g.setTransform(1, 0, 0, 1, 0, 0);
  panel(110, 300, 860, 90, '#1d1430', 1); txt('DİLBİLGİSİ · YDT / YDS', 540, 348, 48, P.acc);
  g.fillStyle = 'rgba(29,20,48,.86)'; g.beginPath(); g.roundRect(50, 405, 980, 250, 36); g.fill();
  txt('AS mı, LIKE mı?', 540, 490, 140, P.acc, { ow: 22 });
  txt('olarak mı, gibi mi?', 540, 600, 60, P.white, { ow: 14 });
  panel(60, 1400, 440, 110, P.like, 1); txt('LIKE a teacher', 280, 1457, 52, INK);
  panel(560, 1400, 420, 110, P.as, 1); txt('AS a teacher', 770, 1457, 52, INK);
  txt('gibi', 280, 1560, 48, P.white, { ow: 12 }); txt('olarak', 770, 1560, 48, P.white, { ow: 12 });
}

(async () => {
  Z = await (await fetch('ses/zaman.json')).json(); Z.satirlar.forEach(l => L[l.id] = l);
  await Promise.all([document.fonts.load(`700 64px ${TF}`, 'ğşİıçüöÜÇŞĞ'), document.fonts.load(`700 52px ${SF}`, 'ğşİıçüöÜÇŞĞ'), document.fonts.load(`600 46px ${SF}`, 'ğşİıçüöÜÇŞĞ')]);
  await document.fonts.ready;
  buildScenes();
  const endT = T1('s13') + .6;
  window.DUR = Math.max(Z.dur, endT + 2.2);
  const e = [{ t: .2, type: 'pop' }, { t: 1.2, type: 'pop' }];
  for (let i = 1; i < SC.length; i++) e.push({ t: SC[i][1], type: 'whoosh' });
  e.push({ t: T0('s03') + 1.6, type: 'thump' }, { t: SC[2][1] + .2, type: 'click' }, { t: T0('s05') + .3, type: 'ding' });
  for (const s1 of [T0('s03') - .1, T0('s06') - .1]) for (let i = 0; i < 2; i++) e.push({ t: s1 + i * .35, type: 'pop' });
  e.push({ t: SC[3][1] + .3, type: 'ding' }, { t: T0('s09'), type: 'thump' }, { t: T0('s12'), type: 'ding' }, { t: endT - .4, type: 'pop' });
  window.EV = e.filter(x => x.t > 0).sort((a, b) => a.t - b.t);
  window.READY = true;
})();
