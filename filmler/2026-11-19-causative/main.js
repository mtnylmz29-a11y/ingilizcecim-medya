// ingilizcecim.com · 17:30 · Have / Get Something Done — stil: scifi-toon (bilim kurgu sitcom çizgi film)
// Özgün karakterler: Ece (telaşlı mucit), Zorp (soğukkanlı uzaylı usta), Bip (robot). Motor: lemo-opuscar scifi-toon demosunun toon.js'i (MIT), kütüphaneden doğrudan yüklenir.
import { clamp, lerp, seg, ss, eo, back, hash, TAU } from '/core/lib.js';
import { INK, g, init, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, frame, S, bands } from '/styles/scifi-toon/demo/toon.js';
const W = 1080, H = 1920;
function screenRect(col, a = 1) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }

init(document.getElementById('c'));
const KAPAK = /kapak=1/.test(location.search);
let HIDE = false;   // kapak: sahne kartlarını gizle
const TF = `'Lilita One'`, SF = `'Fredoka'`;
let Z = null; const L = {};
const T0 = id => L[id].t0, T1 = id => L[id].t1;
const on12 = t => Math.floor(t * 12) / 12;

// ---------- palette ----------
const P = {
  white: '#ffffff', skin: '#f2c49b', skinS: '#d79f76', hair: '#3b2418', hairS: '#24150e', over: '#f08a24', overS: '#c96a12', shirt: '#fff4d6',
  shoe: '#3a3550', gog: '#ffd23f', gogF: '#6b6f80',
  zsk: '#62c3b4', zskS: '#3f9a8c', cap: '#6d3fb3', capS: '#4f2a8a', apron: '#e9e2cf', apronS: '#c9bfa6',
  bot: '#a9b8cc', botS: '#7f90a8', scr: '#1d2a3a', botEye: '#8ff0ff', mouthIn: '#4a1a2a', tongue: '#e8637a',
  acc: '#ffd23f', ok: '#3ccf6e', bad: '#ff4d5e', glow: '#7dffcf', glowL: '#d9fff2',
};
const WORLD = {
  home: { sky: ['#cfe3d4', '#bcd6c2', '#a9c9b0'], wall: '#9fbf9f', wallS: '#86a886', floor: '#6f8f73', floorS: '#5b7a5f', prop: '#e8d9b0' },
  mech: { sky: ['#ff4fa3', '#e83a91', '#c92a7d'], wall: '#b31f6b', wallS: '#8f1555', floor: '#b6f23a', floorS: '#8fcc1f', prop: '#fff36b' },
  paint: { sky: ['#18a4a8', '#14898d', '#0f6f73'], wall: '#0f6f73', wallS: '#0b5558', floor: '#ff8a3d', floorS: '#e06a20', prop: '#fff0d9' },
  norm: { sky: ['#efe3cf', '#e7d8c0', '#dccbb0'], wall: '#d8c6a8', wallS: '#c4b08f', floor: '#b89b74', floorS: '#a2855f', prop: '#f6eee0' },
};

// ---------- small helpers ----------
const wob = (t, f = 1, ph = 0) => Math.sin(t * TAU * f + ph);
function sweat(x, y, s = 1) { shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 }); }
function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 6, skin = P.skin, closed = false, lw = 6, jitter = 0, x = false } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  shape(ell(cx, cy, rx, ry, 36), { fill: P.white, lw, shade: () => {
    const px = cx + look[0] * rx * .5 + jitter, py = cy + look[1] * ry * .45;
    if (x) { stroke([[px - 12, py - 12], [px + 12, py + 12]], 6); stroke([[px + 12, py - 12], [px - 12, py + 12]], 6); }
    else dot(px, py, pupil);
    if (lid > 0) { const yl = cy - ry + lid * 2 * ry; fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 }); stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw); }
  } });
}
function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, skew = 0, lw = 6 } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k + skew * k], rc = [cx + hw, cy - sm * k - skew * k];
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
function arm(a, b, bend, col, colS, hcol, hang, o = {}) {
  shape(noodle(a, b, bend, 26, 22), { fill: col, lw: 6 });
  hand(b[0], b[1], hang, 22, hcol, o);
}
function wrench(x, y, a, s = 1) {
  push(); translate(x, y); rotate(a); scale(s);
  shape(rr(-8, -70, 16, 90, 7), { fill: '#c9d2dc', lw: 6 });
  shape(spline([[-26, -96], [-8, -70], [8, -70], [26, -96], [14, -104], [6, -88], [-6, -88], [-14, -104]]), { fill: '#c9d2dc', lw: 6 });
  pop();
}

// ---------- characters (origin at feet, y down) ----------
// Ece: telaşlı genç mucit — turuncu tulum, topuz saç, alnında sarı gözlük
function ece(x, y, s, t, o = {}) {
  const { look = [0, 0], lid = 0, sm = 0, op = 0, brow = 0, armL = 'down', armR = 'down', soot = 0, jit = 0, face = 1, closed = false, lean = 0, tool = false } = o;
  const tt = on12(t), br = 1 + Math.sin(tt * 2.4) * .01;
  push(); translate(x + (jit ? (hash(Math.floor(t * 12) + 3) - .5) * jit : 0), y); scale(s * face, s * br); rotate(lean);
  // legs
  shape(noodle([-34, -200], [-48, -18], -6, 30, 28), { fill: P.over, lw: 6 });
  shape(noodle([34, -200], [48, -18], 6, 30, 28), { fill: P.over, lw: 6 });
  shape(ell(-56, -10, 42, 20), { fill: P.shoe, lw: 6 }); shape(ell(60, -10, 42, 20), { fill: P.shoe, lw: 6 });
  // body (overalls)
  const body = spline([[-78, -390], [78, -390], [96, -280], [86, -190], [0, -176], [-86, -190], [-96, -280]]);
  shape(body, { fill: P.over, lw: 6, shade: () => fillOnly(rect(30, -400, 90, 240), P.overS, { boil: .5 }) });
  shape(rr(-44, -372, 88, 70, 14), { fill: P.overS, lw: 5 });   // bib pocket
  if (tool) wrench(-22, -330, .25, .55);
  dot(-56, -378, 6, INK); dot(56, -378, 6, INK);
  // arms
  const AR = { down: [[-130, -210], -.4], up: [[-150, -520], -2.4], point: [[-235, -380], -3.0], hips: [[-118, -260], .9], pray: [[-24, -330], -1.2], wave: [[-170, -560], -2.0], hold: [[-190, -300], -2.9] };
  const al = AR[armL] || AR.down, ar = AR[armR] || AR.down;
  arm([-70, -372], al[0], -20, P.shirt, null, P.skin, al[1], { fist: armL === 'hold' });
  arm([70, -372], [-ar[0][0], ar[0][1]], 20, P.shirt, null, P.skin, Math.PI - ar[1], { fist: armR === 'hold' });
  if (armR === 'hold') wrench(190, -300, .6, .9);
  // head
  push(); translate(0, -500);
  shape(ell(0, -118, 54, 48), { fill: P.hair, lw: 6 });                       // bun
  shape(ell(0, 0, 118, 112, 48), { fill: P.skin, lw: 6, shade: () => {
    fillOnly(ell(60, 20, 90, 110), P.skinS, { boil: .4 });
    fillOnly(spline([[-130, -40], [-90, -110], [0, -130], [90, -110], [130, -40], [70, -70], [10, -62], [-50, -80]]), P.hair, { boil: .5 });
    if (soot) for (let i = 0; i < 6; i++) fillOnly(ell((i < 3 ? -96 : 70) + (i % 3) * 14, -40 + (i % 3) * 26, 16, 11), `rgba(40,40,40,${.6 * soot})`, { boil: .3 });
  } });
  // goggles on forehead
  shape(rr(-86, -96, 172, 22, 10), { fill: P.gogF, lw: 5 });
  shape(ell(-40, -86, 30, 22), { fill: P.gog, lw: 5 }); shape(ell(40, -86, 30, 22), { fill: P.gog, lw: 5 });
  // eyes (3/4: touching)
  eye(-34, -8, 38, 46, { look, lid, closed, skin: P.skin, jitter: jit ? (hash(Math.floor(t * 12)) - .5) * 4 : 0 });
  eye(40, -8, 38, 46, { look, lid, closed, skin: P.skin, jitter: jit ? (hash(Math.floor(t * 12) + 9) - .5) * 4 : 0 });
  // brows: + worried (inner up), - angry
  stroke([[-64, -66 + brow * 6], [-12, -70 - brow * 12]], 7); stroke([[14, -70 - brow * 12], [68, -66 + brow * 6]], 7);
  mouth(4, 58, 64, { o: op, sm, lw: 6 });
  if (jit) sweat(108, -40, 1.1);
  pop(); pop();
}
// Zorp: soğukkanlı uzaylı usta — turkuaz ten, mor kasket, anten, yarım kapalı gözler
function zorp(x, y, s, t, o = {}) {
  const { look = [0, 0], lid = .48, sm = 0, op = 0, armL = 'down', armR = 'down', face = 1, crossed = false, tool = null, brow = 0 } = o;
  const tt = on12(t), br = 1 + Math.sin(tt * 2) * .012;
  push(); translate(x, y); scale(s * face, s * br);
  shape(noodle([-40, -150], [-44, -18], -4, 34, 32), { fill: P.zsk, lw: 6 });
  shape(noodle([40, -150], [44, -18], 4, 34, 32), { fill: P.zsk, lw: 6 });
  shape(ell(-50, -10, 44, 20), { fill: '#2f2b3a', lw: 6 }); shape(ell(54, -10, 44, 20), { fill: '#2f2b3a', lw: 6 });
  const body = spline([[-70, -470], [70, -470], [130, -300], [120, -170], [0, -140], [-120, -170], [-130, -300]]);
  shape(body, { fill: P.zsk, lw: 6, shade: () => fillOnly(ell(110, -300, 80, 220), P.zskS, { boil: .5 }) });
  shape(spline([[-80, -360], [80, -360], [100, -190], [0, -160], [-100, -190]]), { fill: P.apron, lw: 5, shade: () => fillOnly(rect(50, -380, 80, 240), P.apronS, { boil: .4 }) });
  shape(rr(-40, -300, 80, 56, 10), { fill: P.apronS, lw: 5 });
  if (crossed) {
    shape(noodle([-70, -420], [60, -300], 30, 28, 26), { fill: P.zsk, lw: 6 });
    shape(noodle([70, -420], [-60, -320], -30, 28, 26), { fill: P.zsk, lw: 6 });
  } else {
    const AR = { down: [[-150, -200], -.3], up: [[-170, -560], -2.3], work: [[-210, -330], -2.8], wave: [[-180, -600], -2.0], brush: [[-230, -420], -2.6] };
    const al = AR[armL] || AR.down, ar = AR[armR] || AR.down;
    arm([-66, -430], al[0], -24, P.zsk, null, P.zsk, al[1]);
    arm([66, -430], [-ar[0][0], ar[0][1]], 24, P.zsk, null, P.zsk, Math.PI - ar[1]);
    if (tool === 'wrench') wrench(210, -330, .9 + wob(t, 2) * .25, 1.1);
    if (tool === 'scope') { stroke(quad([230, -330], [150, -250], [60, -420]), 7); shape(ell(236, -334, 18, 18), { fill: '#c9d2dc', lw: 5 }); }
    if (tool === 'brush') { push(); translate(230, -420); rotate(-.6 + wob(t, 1.6) * .35); shape(rr(-8, -10, 16, 110, 6), { fill: '#b5763c', lw: 5 }); shape(rr(-18, -50, 36, 44, 8), { fill: '#ff8a3d', lw: 5 }); pop(); }
  }
  push(); translate(0, -560);
  stroke(quad([10, -120], [30, -190], [-10, -230]), 7); shape(ell(-12, -236, 18, 18), { fill: P.acc, lw: 5 });   // antenna
  shape(spline([[-120, 0], [-100, -110], [0, -140], [100, -110], [120, 0], [90, 80], [0, 100], [-90, 80]]), { fill: P.zsk, lw: 6, shade: () => fillOnly(ell(80, 10, 70, 120), P.zskS, { boil: .4 }) });
  shape(spline([[-118, -60], [-70, -138], [70, -138], [118, -60], [40, -76], [-40, -76]]), { fill: P.cap, lw: 6 });   // cap
  shape(spline([[40, -70], [170, -80], [160, -52], [40, -50]]), { fill: P.capS, lw: 6 });                          // cap brim
  eye(-36, -10, 40, 44, { look, lid, skin: P.zsk }); eye(42, -10, 40, 44, { look, lid, skin: P.zsk });
  stroke([[-70, -62 - brow * 8], [-10, -60]], 7); stroke([[14, -60], [76, -62 - brow * 8]], 7);
  mouth(6, 50, 80, { o: op, sm, lw: 6, w: 1.1 });
  pop(); pop();
}
// Bip: robot — kutu gövde, kubbe kafa, ekran yüz; bozuk / mutlu / boyalı / parlak
function bip(x, y, s, t, o = {}) {
  const { broken = 0, happy = 0, paint = 0, shine = 0, spin = 0, look = [0, 0] } = o;
  const tt = on12(t);
  push(); translate(x, y); scale(s);
  const tilt = broken ? .28 + wob(tt, 1.5) * .05 : wob(tt, .8) * .03;
  shape(ell(-50, -16, 26, 26), { fill: '#3a3550', lw: 6 }); shape(ell(50, -16, 26, 26), { fill: '#3a3550', lw: 6 });
  shape(rr(-90, -230, 180, 200, 26), { fill: P.bot, lw: 6, shade: () => {
    fillOnly(rect(40, -240, 70, 220), P.botS, { boil: .5 });
    if (paint > 0) { const k = clamp(paint); fillOnly(rect(-100, -200, 220 * k, 30), '#ff8a3d', { boil: .4 }); fillOnly(rect(-100, -130, 220 * k, 30), '#18a4a8', { boil: .4 }); fillOnly(rect(-100, -70, 220 * k, 22), '#ff8a3d', { boil: .4 }); }
  } });
  shape(ell(0, -150, 30, 30), { fill: broken ? '#6b6f80' : P.acc, lw: 5 });   // chest light
  // arms
  shape(noodle([-90, -190], [-150 + happy * -20, -110 - happy * 140], -20, 22, 20), { fill: P.botS, lw: 6 });
  shape(noodle([90, -190], [150 + happy * 20, -110 - happy * 140], 20, 22, 20), { fill: P.botS, lw: 6 });
  push(); translate(0, -240); rotate(tilt + spin);
  shape(arc(0, 0, 100, 104, Math.PI, TAU, 30).concat([[100, 6], [-100, 6]]), { fill: P.bot, lw: 6, shade: () => fillOnly(ell(60, -40, 50, 80), P.botS, { boil: .4 }) });
  stroke(quad([0, -104], [10, -140], [-6, -166]), 6); shape(ell(-6, -172, 14, 14), { fill: broken ? P.bad : P.glow, lw: 5 });
  shape(rr(-70, -76, 140, 70, 18), { fill: P.scr, lw: 5, shade: () => {
    if (broken) { stroke([[-46, -52], [-22, -28]], 6, { line: P.botEye }); stroke([[-22, -52], [-46, -28]], 6, { line: P.botEye }); dot(34, -40, 11, P.botEye); stroke(quad([-30, -18], [0, -28], [30, -14]), 5, { line: P.botEye }); }
    else { const hp = happy > .5; if (hp) { stroke(arc(-32, -36, 14, 10, Math.PI, TAU, 10), 6, { line: P.botEye }); stroke(arc(32, -36, 14, 10, Math.PI, TAU, 10), 6, { line: P.botEye }); stroke(arc(0, -26, 24, 12, 0, Math.PI, 12), 5, { line: P.botEye }); }
      else { dot(-32 + look[0] * 8, -40, 11, P.botEye); dot(32 + look[0] * 8, -40, 11, P.botEye); stroke([[-14, -18], [14, -18]], 5, { line: P.botEye }); } }
  } });
  pop();
  if (shine) for (let i = 0; i < 3; i++) { const k = (tt * 1.3 + i / 3) % 1, a = i * 2.1; star(Math.cos(a) * 140, -260 + Math.sin(a) * 120, 16 * Math.sin(k * Math.PI)); }
  if (broken) { // smoke + sparks
    for (let i = 0; i < 4; i++) { const k = (tt * .6 + i / 4) % 1; shape(ell(20 + i * 18 + k * 40, -360 - k * 220 - i * 10, 22 + k * 30, 20 + k * 26, 18), { fill: `rgba(120,120,130,${(.8 * (1 - k)).toFixed(2)})`, lw: 4, line: `rgba(27,20,34,${(1 - k).toFixed(2)})` }); }
    if (Math.floor(tt * 12) % 3 === 0) for (let i = 0; i < 5; i++) { const a = hash(Math.floor(tt * 12) * 7 + i) * TAU; stroke([[-90, -120], [-90 + Math.cos(a) * 50, -120 + Math.sin(a) * 50]], 5, { line: P.acc }); }
  }
  pop();
}
function star(x, y, r) { if (r < 2) return; const p = []; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr_ = i % 2 ? r * .4 : r; p.push([x + Math.cos(a) * rr_, y + Math.sin(a) * rr_]); } shape(p, { fill: P.white, lw: 4 }); }

// ---------- worlds (backgrounds) ----------
const GY = 1300;   // ground line
function sky(Wd, y1 = GY) { bands(Wd.sky, -200, y1 - 300); fillOnly(rect(-200, y1 - 300 - 2, W + 400, 304), Wd.wall, { boil: 0 }); }
function ground(Wd) { shape(rect(-200, GY, W + 400, H - GY + 200), { fill: Wd.floor, lw: 6, shade: () => fillOnly(rect(-200, GY, W + 400, 26), Wd.floorS, { boil: .3 }) }); }
function home(t, Wd = WORLD.home) {
  sky(Wd, GY);
  // window with flat sky
  shape(rr(90, 620, 300, 260, 16), { fill: '#e9f6ff', lw: 6, shade: () => { fillOnly(rect(90, 780, 300, 100), '#d4ecff', { boil: 0 }); fillOnly(ell(320, 690, 34, 34), '#fff2a8', { boil: .3 }); } });
  stroke([[240, 620], [240, 880]], 6); stroke([[90, 750], [390, 750]], 6);
  // pegboard with tools
  shape(rr(560, 600, 420, 300, 14), { fill: Wd.prop, lw: 6, shade: () => { for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) dot(590 + i * 70, 630 + j * 70, 4, Wd.wallS); } });
  wrench(640, 860, -.2, .8); shape(rr(720, 650, 40, 150, 10), { fill: '#ff6b6b', lw: 5 }); shape(ell(860, 720, 50, 50), { fill: P.acc, lw: 5 }); stroke(arc(860, 720, 30, 30, 0, TAU, 20), 4);
  // shelf with junk
  shape(rect(80, 960, 360, 22), { fill: Wd.wallS, lw: 5 });
  shape(rr(110, 900, 70, 60, 10), { fill: '#ffb84d', lw: 5 }); shape(ell(250, 930, 40, 30), { fill: '#7ad3ff', lw: 5 }); shape(rr(330, 880, 60, 80, 8), { fill: '#c9d2dc', lw: 5 });
  ground(Wd);
}
function mech(t, red = 0) {
  const Wd = WORLD.mech;
  bands(Wd.sky, -200, GY - 40);
  // floating junk planets
  for (let i = 0; i < 4; i++) { const x = [80, 1000, 420, 690][i], y = [700, 760, 660, 640][i] + wob(on12(t), .3, i) * 10, r = [56, 80, 34, 46][i];
    shape(ell(x, y, r, r), { fill: ['#fff36b', '#8a2be2', '#b6f23a', '#ffffff'][i], lw: 6, shade: () => fillOnly(ell(x + r * .4, y + r * .2, r * .7, r), 'rgba(0,0,0,.18)', { boil: .3 }) });
    if (i === 1) stroke(arc(x, y, r * 1.7, r * .45, -.3, Math.PI + .3, 24), 6); }
  // workshop: sign + tool rack
  shape(rr(640, 820, 340, 380, 18), { fill: Wd.wall, lw: 6, shade: () => fillOnly(rect(900, 820, 90, 380), Wd.wallS, { boil: .4 }) });
  for (let i = 0; i < 3; i++) { wrench(700 + i * 100, 1060, .1 * i - .1, .9); }
  shape(rr(680, 860, 260, 40, 10), { fill: Wd.prop, lw: 5 });
  ground(Wd);
  for (let i = 0; i < 6; i++) shape(ell(80 + i * 190, GY + 120 + (i % 2) * 60, 40, 14), { fill: Wd.floorS, lw: 4 });
  if (red) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .38 * red; g.fillStyle = '#ff1f3d'; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
    for (let i = -2; i < 14; i++) fillOnly([[i * 110, 250], [i * 110 + 60, 250], [i * 110 + 20, 300], [i * 110 - 40, 300]], i % 2 ? INK : P.acc, { boil: 0 }); }
}
function paint(t) {
  const Wd = WORLD.paint;
  bands(Wd.sky, -200, GY - 40);
  // paint-can hills with drips
  for (let i = 0; i < 3; i++) { const x = [170, 560, 930][i], w = [260, 320, 240][i], h = [360, 460, 330][i], c = ['#ff8a3d', '#fff0d9', '#ffcf3d'][i];
    shape(rr(x - w / 2, GY - h, w, h + 20, 30), { fill: Wd.wall, lw: 6, shade: () => fillOnly(rect(x + w * .2, GY - h, w, h + 20), Wd.wallS, { boil: .4 }) });
    shape(spline([[x - w / 2, GY - h + 10], [x - w / 4, GY - h - 30], [x + w / 4, GY - h - 30], [x + w / 2, GY - h + 10], [x + w / 3, GY - h + 70 + wob(on12(t), .5, i) * 10], [x + w / 8, GY - h + 30], [x - w / 6, GY - h + 90], [x - w / 3, GY - h + 30]]), { fill: c, lw: 6 }); }
  for (let i = 0; i < 5; i++) { const x = 100 + i * 220; shape(ell(x, 420 + (i % 2) * 120, 26, 26), { fill: '#ffffff', lw: 5 }); }
  ground(Wd);
  for (let i = 0; i < 4; i++) shape(ell(120 + i * 260, GY + 150 + (i % 2) * 70, 70, 20), { fill: ['#18a4a8', '#fff0d9'][i % 2], lw: 5 });
}
function normal(t) {
  const Wd = WORLD.norm;
  sky(Wd, GY);
  shape(rr(110, 640, 280, 230, 14), { fill: '#f6eee0', lw: 6 }); stroke([[250, 640], [250, 870]], 6);   // plain window
  shape(rr(700, 700, 200, 160, 10), { fill: '#e7d3b0', lw: 6 }); dot(800, 780, 12, '#b89b74');            // picture frame (blank)
  shape(rr(840, 1040, 120, 220, 14), { fill: '#c98f5a', lw: 6 }); shape(spline([[900, 1040], [840, 930], [900, 960], [930, 880], [960, 960], [1000, 940]]), { fill: '#7aa36b', lw: 6 }); // plant
  ground(Wd);
}
function portal(cx, cy, r, t, k = 1) {
  if (k <= 0) return;
  const R = r * back(k, .3);
  for (let i = 0; i < 2; i++) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .22 - i * .08; g.fillStyle = P.glow; g.beginPath(); g.ellipse(cx, cy, R * (1.25 + i * .22), R * (.95 + i * .2), 0, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
  const rim = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; const w = 1 + .07 * Math.sin(a * 5 + on12(t) * 6); rim.push([cx + Math.cos(a) * R * w, cy + Math.sin(a) * R * .8 * w]); }
  shape(rim, { fill: P.glow, lw: 7, shade: () => {
    for (let j = 0; j < 4; j++) { const sp = []; for (let i = 0; i <= 24; i++) { const u = i / 24, a = j / 4 * TAU + u * 4 + t * 6; sp.push([cx + Math.cos(a) * R * u, cy + Math.sin(a) * R * .8 * u]); } stroke(sp, 9, { line: '#2fe0a8' }); }
    fillOnly(ell(cx, cy, R * .25, R * .2), P.glowL, { boil: .3 });
  } });
}

// ---------- screen cards ----------
function txt(s, x, y, size, col, { font = TF, wt = '', align = 'center', ow = 0, oc = INK, base = 'middle' } = {}) {
  if (HIDE) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt ? wt + ' ' : ''}${size}px ${font}`; g.textAlign = align; g.textBaseline = base;
  if (ow) { g.lineWidth = ow; g.lineJoin = 'round'; g.strokeStyle = oc; g.strokeText(s, x, y); }
  g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
function tw(s, size, font = TF, wt = '') { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${wt ? wt + ' ' : ''}${size}px ${font}`; const w = g.measureText(s).width; g.restore(); return w; }
function panel(x, y, w, h, fill = '#fff8e8', k = 1) {
  if (k <= 0 || HIDE) return; push(); translate(x + w / 2, y + h / 2); scale(back(k, .5)); shape(rr(-w / 2, -h / 2, w, h, 30), { fill, lw: 7 }); pop();
}
// formula chips: [{s, c}] with + between, pops one by one
function chips(items, y, t0, t) {
  if (HIDE) return;
  const sz = 64, pad = 26, gap = 50, ws = items.map(i => tw(i.s, sz) + pad * 2), tot = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = (W - tot) / 2 - 20;
  items.forEach((it, i) => {
    const k = seg(t, t0 + i * .35, t0 + i * .35 + .35);
    if (k > 0) { push(); translate(x + ws[i] / 2, y); scale(back(k, .6)); shape(rr(-ws[i] / 2, -46, ws[i], 92, 24), { fill: it.c, lw: 7 }); pop(); if (k > .6) txt(it.s, x + ws[i] / 2, y + 4, sz, INK); }
    if (i < items.length - 1 && k > .6) txt('+', x + ws[i] + gap / 2, y + 2, 64, P.white, { ow: 12 });
    x += ws[i] + gap;
  });
}
// sentence with coloured key words: parts [[text, colour]]
function sentence(parts, y, size, k = 1, { mark = null } = {}) {
  if (k <= 0 || HIDE) return;
  const full = parts.map(p => p[0]).join(''), w = tw(full, size), x0 = (W - w) / 2 - (mark ? 30 : 0);
  push(); translate(W / 2 - (mark ? 30 : 0), y); scale(back(k, .5)); shape(rr(-w / 2 - 36, -size * .85, w + 72 + (mark ? 70 : 0), size * 1.7, 26), { fill: '#1d1430', lw: 7 }); pop();
  if (k < .6) return;
  let x = x0;
  for (const [s, c] of parts) { txt(s, x, y + 4, size, c, { align: 'left' }); x += tw(s, size); }
  if (mark === 'ok') { stroke([[x + 34, y], [x + 50, y + 18], [x + 82, y - 22]], 11, { line: P.ok }); }
  if (mark === 'bad') { stroke([[x + 36, y - 20], [x + 76, y + 20]], 11, { line: P.bad }); stroke([[x + 76, y - 20], [x + 36, y + 20]], 11, { line: P.bad }); }
}
function note(s, y, col, k = 1, size = 46) { if (k <= 0) return; const w = tw(s, size, SF, 600); panel(W / 2 - w / 2 - 34, y - size * .9, w + 68, size * 1.8, col, k); if (k > .6) txt(s, W / 2, y + 2, size, INK, { font: SF, wt: 600 }); }

// ---------- subtitles (bottom, inside Instagram safe area: y < 1540, x 60..960) ----------
const KEY = /^(have|had|get|got|repaired|fixed|check|to|paint|V3|V1)$/i;
function caption(t) {
  let cur = null; for (const l of Z.satirlar) if (t >= l.t0 - .05 && t <= l.t1 + .45) cur = l;
  if (!cur) return;
  const words = cur.metin.split(/ +/), size = 52, maxW = 860, lh = 66;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `700 ${size}px ${SF}`;
  const lines = []; let line = [];
  for (const w of words) { const test = [...line, w].join(' '); if (g.measureText(test).width > maxW && line.length) { lines.push(line); line = [w]; } else line.push(w); }
  if (line.length) lines.push(line);
  const kw = cur.kelimeler || [], y0 = 1500 - (lines.length - 1) * lh;
  // speaker pill
  const who = cur.dil === 'en' ? 'ECE' : 'ANLATICI', pc = cur.dil === 'en' ? P.over : '#7a5fb3';
  g.font = `700 30px ${SF}`; const pw = g.measureText(who).width + 36;
  g.fillStyle = pc; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.roundRect(W / 2 - pw / 2, y0 - lh - 6, pw, 46, 23); g.fill(); g.stroke();
  g.fillStyle = P.white; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(who, W / 2, y0 - lh + 17);
  let wi = 0;
  lines.forEach((ln, li) => {
    g.font = `700 ${size}px ${SF}`; const full = ln.join(' '), lw_ = g.measureText(full).width; let x = W / 2 - lw_ / 2; const y = y0 + li * lh;
    for (const w of ln) {
      const tw0 = kw[wi] ? kw[wi].t0 : cur.t0 + wi * .3, shown = t >= tw0 - .08 || t > cur.t1;
      const clean = w.replace(/[.,?!']/g, ''), isKey = cur.dil === 'en' ? KEY.test(clean) : /^(have|get|to'lu)$/i.test(w.replace(/[.,?!]/g, ''));
      g.textAlign = 'left'; g.lineWidth = 12; g.lineJoin = 'round'; g.strokeStyle = INK; g.globalAlpha = shown ? 1 : .0;
      g.strokeText(w, x, y); g.fillStyle = isKey ? P.acc : P.white; g.fillText(w, x, y);
      x += g.measureText(w + ' ').width; wi++;
    }
  });
  g.globalAlpha = 1; g.restore();
}
// Ece speaks the English lines: mouth opens on words
function talk(t, ids) {
  for (const id of ids) { const l = L[id]; if (!l || t < l.t0 || t > l.t1) continue;
    for (const k of (l.kelimeler || [])) if (t >= k.t0 && t <= k.t1) { const u = (t - k.t0) / Math.max(.08, k.t1 - k.t0); return .25 + .45 * Math.abs(Math.sin(on12(u) * Math.PI * 2)); } }
  return 0;
}

// ---------- scenes ----------
let SC = [];
function cam(cx, cy, z) { translate(W / 2, H / 2); scale(z); translate(-cx, -cy); }
function sHook(t) {   // garage: smoking robot, Ece stares — kendin mi, ettirdin mi?
  const z = lerp(1.0, 1.08, ss(seg(t, 0, T1('s01'))));
  push(); cam(540, 960, z); home(t);
  bip(620, GY + 10, 1.21, t, { broken: 1 });
  ece(270, GY, 1.1, t, { look: [.8, .1], brow: 1, sm: -.6, op: .12, armL: 'hips', armR: 'up', jit: 0 });
  pop();
  // question cards
  const a = seg(t, .25, .6), b = seg(t, T0('s01') + 1.3, T0('s01') + 1.7);
  panel(70, 300, 440, 150, '#fff8e8', a); if (a > .6) txt('Kendin mi?', 290, 378, 66, INK);
  panel(570, 300, 440, 150, P.acc, b); if (b > .6) txt('Ettirdin mi?', 790, 378, 66, INK);
  if (t > .3) { const q = seg(t, .3, .7); txt('?', 820, 720 + wob(on12(t), 1) * 8, Math.max(1, 150 * back(q, .6)), P.white, { ow: 16 }); }
}
function sSelf(t, s0) {   // Ece repairs it herself: wrench chaos, soot
  const k = seg(t, s0, T1('s03'));
  push(); cam(540, 960, 1.04); home(t);
  const hit = Math.floor(t * 6) % 2;
  bip(620, GY + 10, 1.21, t, { broken: 1, spin: hit ? .12 : -.08 });
  ece(330, GY, 1.1, t, { look: [.9, .3], brow: -1, sm: hit ? -.2 : .3, op: Math.max(talk(t, ['s03']), hit ? .15 : 0), armL: 'down', armR: 'hold', soot: ss(seg(t, s0 + .6, s0 + 1.6)), lean: hit ? -.05 : .04 });
  if (hit) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t; star(560 + Math.cos(a) * 90, 900 + Math.sin(a) * 70, 18); }
  pop();
  note('işi kendin yaptın', 360, '#bfe9ff', seg(t, s0 + .1, s0 + .45));
  sentence([['I ', P.white], ['repaired', P.acc], [' my robot.', P.white]], 520, 66, seg(t, T0('s03') - .1, T0('s03') + .25), { mark: 'ok' });
}
function sMech(t, s0) {   // portal → Zorp usta fixes it: have + nesne + V3
  push(); cam(540, 960, lerp(1.0, 1.05, ss(seg(t, s0, T1('s05'))))); mech(t);
  const fixed = t > T0('s05') + .2;
  bip(560, GY + 10, 1.155, t, { broken: fixed ? 0 : 1, happy: fixed ? 1 : 0, shine: fixed ? 1 : 0 });
  zorp(840, GY, 1.045, t, { look: [-.8, .2], armL: 'work', tool: fixed ? null : 'wrench', lid: .5 });
  ece(220, GY, 1.012, t, { look: [.9, 0], brow: fixed ? -.3 : 1, sm: fixed ? .8 : -.3, op: talk(t, ['s05']), armL: 'down', armR: fixed ? 'wave' : 'pray', closed: false });
  pop();
  chips([{ s: 'have', c: P.acc }, { s: 'nesne', c: '#bfe9ff' }, { s: 'V3', c: '#b6f23a' }], 360, s0 + .5, t);
  sentence([['I ', P.white], ['had', P.acc], [' my robot ', P.white], ['repaired.', '#b6f23a']], 530, 64, seg(t, T0('s05') - .1, T0('s05') + .25), { mark: 'ok' });
}
function sTrap(t, s0) {   // DİKKAT: sıra! — red alert, close-up reactions
  const close = t > T0('s07') + 1.6;
  push();
  if (close) cam(250, 820, 1.85); else cam(540, 960, 1.0);
  mech(t, 1);
  bip(560, GY + 10, 1.155, t, { broken: 1 });
  zorp(840, GY, 1.045, t, { look: [-.8, 0], crossed: true, lid: .55 });
  ece(220, GY, 1.012, t, { look: close ? [.2, -.2] : [.9, -.1], brow: 1.3, sm: -.9, op: close ? .55 : .2, armL: 'up', armR: 'up', jit: 6 });
  pop();
  const a = seg(t, s0 + .05, s0 + .4);
  panel(240, 300, 600, 130, P.bad, a); if (a > .6) txt('DİKKAT: SIRA!', 540, 368, 72, P.white, { ow: 12 });
  const b = seg(t, T0('s07') - .1, T0('s07') + .25);
  sentence([['I ', P.white], ['had repaired', P.bad], [' my robot.', P.white]], 520, 60, b, { mark: 'bad' });
  note('= önceden kendin tamir etmiştin', 640, '#ffd0d5', seg(t, T0('s07') + 1.0, T0('s07') + 1.35), 42);
}
function sCheck(t, s0) {   // have + kişi + V1: Zorp checks the engine with a stethoscope
  push(); cam(560, 980, lerp(1.06, 1.0, ss(seg(t, s0, T1('s09'))))); mech(t);
  bip(560, GY + 10, 1.155, t, { broken: 0, happy: 0, look: [.6, 0] });
  zorp(800, GY, 1.045, t, { look: [-.9, .4], armL: 'work', tool: 'scope', lid: .4, brow: .4 });
  ece(220, GY, 1.012, t, { look: [.9, 0], brow: .2, sm: .4, op: talk(t, ['s09']), armL: 'down', armR: 'point' });
  // engine hatch open + gears
  shape(rr(500, 1110, 120, 90, 12), { fill: '#2b1440', lw: 6 }); for (let i = 0; i < 2; i++) { push(); translate(530 + i * 60, 1155); rotate(t * (i ? -3 : 3)); shape(spline([[-22, -6], [-6, -22], [6, -22], [22, -6], [22, 6], [6, 22], [-6, 22], [-22, 6]]), { fill: P.acc, lw: 5 }); pop(); }
  pop();
  chips([{ s: 'have', c: P.acc }, { s: 'kişi', c: '#ffb3d9' }, { s: 'V1', c: '#b6f23a' }], 360, s0 + .5, t);
  sentence([['I ', P.white], ['had', P.acc], [' the mechanic ', P.white], ['check', '#b6f23a'], [' the engine.', P.white]], 530, 54, seg(t, T0('s09') - .1, T0('s09') + .25));
}
function sPaint(t, s0) {   // get + kişi + to V1: Zorp says no, Ece persuades, Zorp paints
  const yes = t > T0('s11') + .3;
  push(); cam(540, 960, 1.0); paint(t);
  bip(560, GY + 10, 1.155, t, { paint: ss(seg(t, T0('s11') + .4, T1('s11') + .3)), happy: yes ? 1 : 0 });
  zorp(840, GY, 1.045, t, yes ? { look: [-.8, .3], armL: 'brush', tool: 'brush', lid: .45, sm: .2 } : { look: [.3, -.2], crossed: true, lid: .6, sm: -.5 });
  ece(220, GY, 1.012, t, { look: [.9, -.3], brow: yes ? -.2 : 1.5, sm: yes ? .9 : .2, op: talk(t, ['s11']), armL: 'pray', armR: 'pray', lid: 0 });
  if (!yes) { txt('HAYIR.', 860, 640, 64, P.white, { ow: 12 }); }
  pop();
  chips([{ s: 'get', c: P.acc }, { s: 'kişi', c: '#ffb3d9' }, { s: 'to V1', c: '#ff8a3d' }], 360, s0 + .5, t);
  sentence([['I finally ', P.white], ['got', P.acc], [' him ', P.white], ['to paint', '#ff8a3d'], [' it.', P.white]], 530, 58, seg(t, T0('s11') - .1, T0('s11') + .25));
}
function sNormal(t, s0) {   // back home (suspiciously normal): get + nesne + V3
  push(); cam(540, 960, lerp(1.0, 1.05, ss(seg(t, s0, T1('s13'))))); normal(t);
  bip(600, GY + 10, 1.21, t, { paint: 1, happy: 1, shine: 1 });
  ece(300, GY, 1.1, t, { look: [.8, -.1], brow: -.2, sm: .9, op: talk(t, ['s13']), armL: 'hips', armR: 'wave' });
  pop();
  note('günlük dil', 250 + 60, '#e7d3b0', seg(t, s0 + .1, s0 + .4), 40);
  chips([{ s: 'get', c: P.acc }, { s: 'nesne', c: '#bfe9ff' }, { s: 'V3', c: '#b6f23a' }], 430, s0 + .5, t);
  sentence([['I ', P.white], ['got', P.acc], [' my robot ', P.white], ['fixed.', '#b6f23a']], 580, 64, seg(t, T0('s13') - .1, T0('s13') + .25), { mark: 'ok' });
}
function sEnd(t, s0) {   // question to the viewer + ingilizcecim.com
  push(); cam(540, 960, 1.0); normal(t);
  bip(560, GY + 10, 1.155, t, { paint: 1, happy: 1, shine: 1 });
  zorp(850, GY, 0.99, t, { look: [-.5, -.2], armL: 'wave', lid: .45, sm: .4 });
  ece(230, GY, 1.012, t, { look: [.2, -.2], sm: 1, op: .1, armL: 'wave', armR: 'hips' });
  pop();
  panel(90, 290, 900, 150, '#fff8e8', seg(t, s0 + .05, s0 + .4)); if (t > s0 + .3) txt('Sen en son neyi yaptırdın?', 540, 368, 56, INK);
  sentence([['I ', P.white], ['had', P.acc], [' my hair ', P.white], ['cut.', '#b6f23a']], 540, 58, seg(t, s0 + .9, s0 + 1.25));
  const e = seg(t, T1('s14') + .3, T1('s14') + .7);
  if (e > 0) { panel(150, 650, 780, 150, '#1d1430', e); if (e > .6) txt('ingilizcecim.com', 540, 728, 84, P.acc, { ow: 0 }); }
}
function buildScenes() {
  SC = [[sHook, 0], [sSelf, T0('s02') - .15], [sMech, T0('s04') - .3, 'portal'], [sTrap, T0('s06') - .1], [sCheck, T0('s08') - .2],
    [sPaint, T0('s10') - .3, 'portal'], [sNormal, T0('s12') - .3, 'portal'], [sEnd, T0('s14') - .2]];
}
function sceneAt(t) { let i = 0; for (let j = 0; j < SC.length; j++) if (t >= SC[j][1]) i = j; return i; }

window.render = t => {
  frame(t, { amp: 1.7 }); g.globalAlpha = 1; HIDE = KAPAK;
  screenRect('#1b1422');
  if (!Z) return;
  const i = sceneAt(t), [f, s, tr] = SC[i];
  if (tr === 'portal' && t < s + .7 && i > 0) {
    const k = seg(t, s, s + .7);
    if (k < .5) { const [pf, ps] = SC[i - 1]; pf(Math.min(t, s), ps); portal(540, 900, 520 * ss(k * 2), t, 1); screenRect(P.glow, ss(k * 2) * .5); }
    else { f(t, s); portal(540, 900, 520 * (1 - ss((k - .5) * 2)), t, 1); }
  } else f(t, s);
  HIDE = false;
  if (!KAPAK) caption(t); else cover();
};
function cover() {   // same layout each cover: small label + big title, inside y 285–1635
  g.setTransform(1, 0, 0, 1, 0, 0);
  panel(110, 300, 860, 90, '#1d1430', 1); txt('DİLBİLGİSİ · YDT / YDS', 540, 348, 48, P.acc);
  txt('HAVE / GET', 540, 500, 160, P.acc, { ow: 22 });
  txt('something done', 540, 640, 104, P.white, { ow: 18 });
  panel(170, 1440, 740, 110, '#fff8e8', 1); txt('Yaptın mı, yaptırdın mı?', 540, 1497, 54, INK);
}

(async () => {
  Z = await (await fetch('ses/zaman.json')).json(); Z.satirlar.forEach(l => L[l.id] = l);
  await Promise.all([document.fonts.load(`64px ${TF}`, 'ğşİıçüöÜÇŞĞ'), document.fonts.load(`700 52px ${SF}`, 'ğşİıçüöÜÇŞĞ'), document.fonts.load(`600 46px ${SF}`, 'ğşİıçüöÜÇŞĞ')]);
  await document.fonts.ready;
  buildScenes();
  const endT = T1('s14') + .7;
  window.DUR = Math.max(Z.dur, endT + 2.2);
  const e = [];
  e.push({ t: .25, type: 'pop' }, { t: T0('s01') + 1.3, type: 'pop' });
  e.push({ t: T0('s02') - .15, type: 'whoosh' }, { t: T0('s02') + .4, type: 'thump' }, { t: T0('s02') + .9, type: 'thump' }, { t: T0('s03'), type: 'ding' });
  for (const [id, n] of [['s04', 3], ['s08', 3], ['s10', 3], ['s12', 3]]) { const s0 = SC.find(x => x[1] <= T0(id) && x[1] > T0(id) - 1)[1]; for (let i = 0; i < n; i++) e.push({ t: s0 + .5 + i * .35, type: 'pop' }); }
  for (const id of ['s04', 's10', 's12']) e.push({ t: T0(id) - .3, type: 'whoosh' });
  e.push({ t: T0('s05') + .2, type: 'ding' }, { t: T0('s06') - .1, type: 'thump' }, { t: T0('s07'), type: 'thump' }, { t: T0('s09') + .3, type: 'click' });
  e.push({ t: T0('s11') + .3, type: 'ding' }, { t: T0('s13'), type: 'ding' }, { t: T0('s14') - .2, type: 'whoosh' }, { t: endT - .4, type: 'pop' });
  window.EV = e.filter(x => x.t > 0).sort((a, b) => a.t - b.t);
  window.READY = true;
})();
