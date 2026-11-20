// ingilizcecim.com · 17:30 · Not until / Only after + devrik yapı — stil: rubber-hose (1930'lar siyah-beyaz çizgi film)
// Özgün karakterler: Zıpzıp (melon şapkalı, yuvarlak gövdeli yolcu), Tiktak (canlı çalar saat), Düdük (yüzlü lokomotif).
// Motor: toon.js (lemo-opuscar scifi-toon demosundan uyarlama, MIT). Tüm renkler gri ton.
import { clamp, lerp, seg, ss, back, hash, TAU } from '/core/lib.js';
import { INK, g, init, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, frame, text } from './toon.js';
const W = 1080, H = 1920;
init(document.getElementById('c'));
const KAPAK = /kapak=1/.test(location.search);
let HIDE = false;
const TF = `'Lilita One'`, SF = `'IM Fell English'`, BF = `'Fredoka'`;
let Z = null; const L = {};
const T0 = id => L[id].t0, T1 = id => L[id].t1;
const on12 = t => Math.floor(t * 12) / 12;
const BEAT = 0.5;   // 120 bpm, 12 kare
const breathe = t => Math.cos(TAU * on12(t) / BEAT);

// ---------- greyscale palette (warm paper) ----------
const P = { white: '#fbf8f1', g1: '#dcd6ca', g2: '#c2bbad', g3: '#a39c8f', g4: '#837d72', g5: '#625d55', g6: '#45413b', black: INK, shade: '#cfc8bb' };

function scr(col, a = 1) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }

// ---------- anatomy kit ----------
function pieEye(cx, cy, rx, ry, { look = [0, 0], closed = false, lid = 0, wide = 1, lw = 6, body = P.g3 } = {}) {
  rx *= wide; ry *= wide;
  if (closed) { stroke(arc(cx, cy + ry * .2, rx * .85, ry * .4, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  shape(ell(cx, cy, rx, ry, 32), { fill: P.white, lw, shade: () => {
    const px = cx + look[0] * rx * .32, py = cy + look[1] * ry * .3, pr = rx * .62, pry = ry * .72;
    const p = []; const a0 = -Math.PI * .42, a1 = -Math.PI * .12;   // wedge cut to upper right
    p.push([px, py]); for (let i = 0; i <= 30; i++) { const a = a1 + i / 30 * (TAU - (a1 - a0)); p.push([px + Math.cos(a) * pr, py + Math.sin(a) * pry]); }
    fillOnly(p, INK, { boil: .3 });
    if (lid > 0) { const yl = cy - ry + lid * 2 * ry; fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl]], body, { boil: .3 }); stroke([[cx - rx * 1.2, yl], [cx + rx * 1.2, yl]], lw); }
  } });
}
function mouth(cx, cy, mw, { o = 0, sm = 1, wavy = false, lw = 6 } = {}) {
  const hw = mw / 2;
  if (wavy) { const p = []; for (let i = 0; i <= 16; i++) { const u = i / 16; p.push([cx - hw + u * mw, cy + Math.sin(u * TAU * 2) * 8]); } stroke(p, lw); return; }
  if (o < .08) { stroke(quad([cx - hw, cy - sm * 10], [cx, cy + sm * 26], [cx + hw, cy - sm * 10], 14), lw);
    if (sm > .3) { stroke([[cx - hw - 6, cy - 22], [cx - hw + 4, cy - 2]], lw - 1); stroke([[cx + hw + 6, cy - 22], [cx + hw - 4, cy - 2]], lw - 1); } return; }
  const h = o * mw * .7;
  shape([...quad([cx - hw, cy - sm * 8], [cx, cy + sm * 6], [cx + hw, cy - sm * 8], 12), ...quad([cx + hw, cy - sm * 8], [cx, cy + h + 10], [cx - hw, cy - sm * 8], 14)], { fill: INK, lw, shade: () => {
    fillOnly(ell(cx, cy + h * .75, hw * .5, h * .35, 16), P.g4, { boil: .2 });
  } });
}
// glove: palm + 3 fat fingers + thumb + flared cuff
function glove(x, y, ang, r = 30, { fist = false, point = false } = {}) {
  push(); translate(x, y); rotate(ang);
  shape(spline([[-r * 1.3, -r * .7], [-r * .7, -r * .55], [-r * .7, r * .55], [-r * 1.3, r * .7]]), { fill: P.white, lw: 6 });   // cuff
  stroke([[-r * 1.0, -r * .6], [-r * 1.0, r * .6]], 4);
  if (fist) shape(ell(0, 0, r * .95, r * .85, 24), { fill: P.white, lw: 6 });
  else if (point) { shape(ell(0, 0, r * .85, r * .8, 24), { fill: P.white, lw: 6 }); shape(rr(r * .3, -r * .32, r * 1.5, r * .55, r * .27), { fill: P.white, lw: 6 }); }
  else {
    for (let i = 0; i < 3; i++) { const a = -.55 + i * .55; push(); rotate(a); shape(rr(r * .2, -r * .26, r * 1.25, r * .52, r * .26), { fill: P.white, lw: 6 }); pop(); }
    shape(ell(0, 0, r * .9, r * .85, 24), { fill: P.white, lw: 6 });
    push(); rotate(-1.5); shape(rr(r * .1, -r * .22, r * .95, r * .44, r * .22), { fill: P.white, lw: 6 }); pop();
  }
  stroke([[-r * .3, -r * .35], [-r * .3, r * .35]], 3); stroke([[0, -r * .4], [0, r * .4]], 3);
  pop();
}
function hose(a, b, bend, w = 22, col = INK) { shape(noodle(a, b, bend, w, w), { fill: col, lw: 4 }); }
function shoe(x, y, s = 1, f = 1) { push(); translate(x, y); scale(s * f, s); shape(spline([[-34, -30], [40, -36], [74, -14], [66, 6], [-40, 6], [-48, -14]]), { fill: INK, lw: 5 }); fillOnly(ell(44, -20, 14, 7, 12), P.white, { boil: .2 }); pop(); }

// ---------- characters (origin at feet) ----------
// Zıpzıp: yuvarlak gri gövde, beyaz yüz maskesi, melon şapka, papyon
function zipzip(x, y, s, t, o = {}) {
  const { look = [0, 0], closed = false, wide = 1, o: op = 0, sm = 1, wavy = false, armL = 'down', armR = 'down', run = 0, sit = false, hat = 0, bounce = 1, jit = 0, face = 1, bag = false, ticket = false, brow = 0 } = o;
  const tt = on12(t), br = 1 + breathe(t) * .035 * bounce;
  const jx = jit ? (hash(Math.floor(t * 12) + 7) - .5) * jit : 0;
  push(); translate(x + jx, y); scale(s * face, s);
  // legs
  if (sit) { hose([-40, -120], [-90, -20], 10); hose([40, -120], [90, -20], -10); shoe(-110, 0, 1, -1); shoe(110, 0, 1); }
  else if (run) {
    for (let i = 0; i < 2; i++) { const a = tt * TAU * 2.4 + i * Math.PI; const fx = Math.cos(a) * 70 + 20, fy = -40 + Math.sin(a) * 34; hose([i ? 30 : -30, -150], [fx, fy], i ? -20 : 20); shoe(fx, fy + 30, .95); }
  } else { hose([-38, -150], [-52, -26], -8); hose([38, -150], [52, -26], 8); shoe(-70, 0, 1, -1); shoe(72, 0, 1); }
  push(); translate(0, sit ? 40 : 0); scale(1, br); if (run) rotate(-.12);
  // body
  shape(ell(0, -290, 140, 170, 48), { fill: P.g3, lw: 7, shade: () => fillOnly(ell(70, -270, 90, 170), P.g4, { boil: .4 }) });
  shape(ell(0, -250, 86, 100, 30), { fill: P.g1, lw: 5 });   // belly
  // bow tie
  shape([[0, -420], [-50, -446], [-50, -394]], { fill: INK, lw: 4 }); shape([[0, -420], [50, -446], [50, -394]], { fill: INK, lw: 4 }); dot(0, -420, 12, INK);
  // arms
  const AR = { down: [[-185, -230], -2.6], up: [[-200, -560], -2.2], point: [[-260, -430], -3.1], wave: [[-190, -600], -1.9], hips: [[-150, -280], .6], hold: [[-200, -300], -2.9], ticket: [[-150, -470], -2.4], cheer: [[-150, -620], -1.6] };
  const al = AR[armL] || AR.down, ar = AR[armR] || AR.down;
  const wv = armR === 'wave' ? Math.sin(tt * TAU * 2) * 40 : 0;
  hose([-110, -360], al[0], -30); glove(al[0][0], al[0][1], al[1], 30, { point: armL === 'point', fist: armL === 'hold' });
  hose([110, -360], [-ar[0][0] + wv, ar[0][1]], 30); glove(-ar[0][0] + wv, ar[0][1], Math.PI - ar[1], 30, { point: armR === 'point', fist: armR === 'hold' || armR === 'ticket' });
  if (bag) { push(); translate(al[0][0] - 10, al[0][1] + 90); rotate(.05 * Math.sin(tt * TAU * 2)); shape(rr(-80, -60, 160, 120, 16), { fill: P.g5, lw: 6, shade: () => fillOnly(rect(-80, -10, 160, 14), P.g4, { boil: .3 }) }); stroke(arc(0, -60, 34, 26, Math.PI, TAU, 12), 7); pop(); }
  if (ticket) { push(); translate(-ar[0][0] + 20, ar[0][1] - 40); rotate(.2); shape(rr(-60, -36, 120, 72, 8), { fill: P.white, lw: 5 }); text('BİLET', 0, 2, { font: `30px ${TF}`, fill: INK }); pop(); }
  // head
  push(); translate(0, -500);
  shape(ell(0, 0, 120, 110, 44), { fill: P.g3, lw: 7, shade: () => fillOnly(ell(70, 10, 70, 110), P.g4, { boil: .4 }) });
  shape(spline([[-96, 10], [-70, -60], [0, -40], [70, -60], [96, 10], [70, 84], [0, 100], [-70, 84]]), { fill: P.white, lw: 5 });   // face mask
  pieEye(-34, -14, 30, 44, { look, closed, wide, body: P.white });
  pieEye(34, -14, 30, 44, { look, closed, wide, body: P.white });
  stroke([[-62, -74 - brow * 10], [-12, -70 + brow * 6]], 6); stroke([[12, -70 + brow * 6], [62, -74 - brow * 10]], 6);
  shape(ell(0, 36, 22, 16, 16), { fill: INK, lw: 4 });   // nose
  mouth(0, 66, 70, { o: op, sm, wavy });
  // bowler hat
  push(); translate(0, -96 - hat * 90); rotate(hat * .4);
  shape(ell(0, 0, 130, 22, 30), { fill: INK, lw: 5 });
  shape(spline([[-80, 4], [-74, -70], [0, -96], [74, -70], [80, 4]]), { fill: INK, lw: 5, shade: () => fillOnly(rect(-90, -26, 180, 16), P.g5, { boil: .3 }) });
  pop();
  pop(); pop(); pop();
}
// Tiktak: canlı çalar saat
function tiktak(x, y, s, t, o = {}) {
  const { ring = 0, look = [0, 0], o: op = 0, sm = 1, armR = 'down', armL = 'down', wide = 1 } = o;
  const tt = on12(t), sh = ring ? Math.sin(tt * TAU * 6) * .12 : 0, br = 1 + breathe(t) * .04;
  push(); translate(x, y); scale(s, s * br); rotate(sh);
  hose([-40, -90], [-60, -20], 8, 18); hose([40, -90], [60, -20], -8, 18); shoe(-74, 0, .75, -1); shoe(76, 0, .75);
  // arms
  const AR = { down: [[-170, -140], -2.6], up: [[-170, -330], -2.2], point: [[-230, -230], -3.1] };
  const al = AR[armL] || AR.down, ar = AR[armR] || AR.down;
  hose([-110, -200], al[0], -20, 18); glove(al[0][0], al[0][1], al[1], 24, { point: armL === 'point' });
  hose([110, -200], [-ar[0][0], ar[0][1]], 20, 18); glove(-ar[0][0], ar[0][1], Math.PI - ar[1], 24, { point: armR === 'point' });
  // bells + hammer
  for (const sx of [-1, 1]) { push(); translate(sx * 78, -330 - (ring ? Math.abs(Math.sin(tt * TAU * 6)) * 12 : 0)); rotate(sx * .5); shape(arc(0, 0, 52, 46, Math.PI, TAU, 20).concat([[52, 8], [-52, 8]]), { fill: P.g2, lw: 6, shade: () => fillOnly(ell(24, -16, 20, 30), P.g3, { boil: .3 }) }); pop(); }
  stroke([[0, -340], [0, -380]], 7); shape(ell(0, -384, 16, 12, 12), { fill: P.g4, lw: 5 });
  // body
  shape(ell(0, -210, 125, 125, 44), { fill: P.g5, lw: 7 });
  shape(ell(0, -210, 98, 98, 40), { fill: P.white, lw: 5, shade: () => {
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; dot(Math.cos(a) * 82, -210 + Math.sin(a) * 82, 5, P.g4); }
  } });
  // hands of the clock as brows
  const spin = ring ? tt * 8 : 0;
  push(); translate(0, -210); rotate(spin); stroke([[0, 0], [0, -70]], 6); pop();
  pieEye(-30, -222, 20, 28, { look, wide });
  pieEye(30, -222, 20, 28, { look, wide });
  mouth(0, -168, 50, { o: op, sm });
  if (ring) for (let i = 0; i < 3; i++) { const k = (tt * 2 + i / 3) % 1; stroke(arc(0, -340, 150 + k * 90, 120 + k * 70, Math.PI * 1.1, Math.PI * 1.35, 8), 6, { line: `rgba(20,18,16,${(1 - k).toFixed(2)})` }); stroke(arc(0, -340, 150 + k * 90, 120 + k * 70, -Math.PI * .35, -Math.PI * .1, 8), 6, { line: `rgba(20,18,16,${(1 - k).toFixed(2)})` }); }
  pop();
}
// Düdük: yüzlü lokomotif (sola bakar), origin ray seviyesinde ön tekerlek altında
function train(x, y, s, t, o = {}) {
  const { o: op = 0, sm = 1, look = [-.6, 0], happy = 1, cars = 2, wave = false, rider = false } = o;
  const tt = on12(t), br = 1 + breathe(t) * .03;
  push(); translate(x, y); scale(s, s * br);
  // carriages
  for (let c = 0; c < cars; c++) { const cx = 640 + c * 470;
    shape(rr(cx - 200, -330, 420, 260, 18), { fill: P.g2, lw: 6, shade: () => fillOnly(rect(cx - 200, -110, 420, 40), P.g3, { boil: .3 }) });
    for (let w = 0; w < 3; w++) shape(rr(cx - 170 + w * 135, -290, 100, 100, 12), { fill: P.white, lw: 5 });
    for (const wx of [-120, 120]) wheel(cx + wx, -50, 50, tt);
    stroke([[cx - 220, -110], [cx - 250, -110]], 10);
  }
  if (rider) { push(); translate(505, -190); scale(.42); zipzip(0, 0, 1, t, { armR: 'wave', armL: 'down', sm: 1, look: [-.5, -.2] }); pop(); shape(rr(440, -330, 130, 140, 12), { fill: null, lw: 6 }); }
  // cab
  shape(rr(250, -470, 200, 400, 16), { fill: P.g5, lw: 7, shade: () => fillOnly(rect(400, -470, 60, 400), P.g6, { boil: .3 }) });
  shape(rr(220, -500, 260, 50, 12), { fill: INK, lw: 6 });
  shape(rr(290, -420, 110, 110, 12), { fill: P.white, lw: 5 });
  // boiler
  shape(rr(-170, -360, 450, 270, 60), { fill: P.g4, lw: 7, shade: () => { fillOnly(rect(-170, -170, 460, 80), P.g5, { boil: .3 }); for (let i = 0; i < 3; i++) fillOnly(rect(-40 + i * 110, -360, 18, 270), P.g5, { boil: .2 }); } });
  // stack
  shape(spline([[-60, -360], [-70, -470], [-110, -540], [10, -540], [-30, -470], [-20, -360]]), { fill: INK, lw: 6 });
  // smoke
  for (let i = 0; i < 5; i++) { const k = (tt * .7 + i / 5) % 1; const sx = -50 + k * 380, sy = -560 - k * 260, r = 40 + k * 70; shape(ell(sx, sy, r, r * .8, 22), { fill: P.white, lw: 5, alpha: 1 - k * .6 }); }
  for (const wx of [-90, 60, 200]) wheel(wx, -50, wx === 200 ? 72 : 56, tt);
  stroke([[-90, -50], [200, -50]], 10);
  // cow catcher
  shape([[-170, -110], [-260, -10], [-130, -10]], { fill: P.g5, lw: 6 });
  // face on the front
  push(); translate(-160, -225);
  shape(ell(0, 0, 120, 128, 40), { fill: P.white, lw: 7, shade: () => fillOnly(ell(50, 0, 60, 128), P.g1, { boil: .3 }) });
  pieEye(-38, -30, 26, 38, { look }); pieEye(32, -30, 26, 38, { look });
  mouth(-4, 50, 70, { o: op, sm: happy ? 1 : -.6 });
  pop();
  if (wave) { /* whistle */ for (let i = 0; i < 2; i++) { const k = (tt * 1.6 + i / 2) % 1; text('♪', 120 + k * 120, -560 - k * 140, { font: `${60 + k * 30}px ${BF}`, fill: INK }); } }
  pop();
}
function wheel(x, y, r, tt) { shape(ell(x, y, r, r, 28), { fill: P.g6, lw: 6, shade: () => { push(); translate(x, y); rotate(-tt * 9); for (let i = 0; i < 4; i++) { rotate(Math.PI / 4); stroke([[-r * .8, 0], [r * .8, 0]], 5, { line: P.g2 }); } pop(); } }); dot(x, y, r * .2, P.g2); }

// ---------- backgrounds (mid greys, never boil) ----------
const GY = 1290;
function brick(y0, y1, col = P.g3, line = P.g4) {
  fillOnly(rect(-300, y0, W + 600, y1 - y0), col, { boil: 0 });
  for (let r = 0, y = y0; y < y1; r++, y += 60) { stroke([[-300, y], [W + 300, y]], 3, { line, boil: 0 }); for (let x = (r % 2) * 70 - 300; x < W + 300; x += 140) stroke([[x, y], [x, y + 60]], 3, { line, boil: 0 }); }
}
function checker(y0) {
  fillOnly(rect(-300, y0, W + 600, H - y0 + 300), P.g2, { boil: 0 });
  for (let r = 0; r < 12; r++) for (let c = -3; c < 14; c++) if ((r + c) % 2) { const y = y0 + r * 70, k = 1 + r * .18; fillOnly(rect(c * 100 * k - 60 * r, y, 100 * k, 70), P.g3, { boil: 0 }); }
  stroke([[-300, y0], [W + 300, y0]], 7, { boil: 0 });
}
function stationClock(x, y, r, t) { shape(ell(x, y, r, r, 30), { fill: P.white, lw: 6 }); push(); translate(x, y); rotate(t * .5); stroke([[0, 0], [0, -r * .7]], 5); pop(); push(); translate(x, y); rotate(t * .05 + 2); stroke([[0, 0], [0, -r * .45]], 7); pop(); stroke([[x, y - r], [x, y - r - 60]], 6); }
function platform(t, { sign = true } = {}) {
  fillOnly(rect(-300, -300, W + 600, 900), P.g2, { boil: 0 });          // sky
  for (let i = 0; i < 4; i++) shape(ell(160 + i * 260, 360 + (i % 2) * 70, 90, 34, 20), { fill: P.g1, lw: 5, boil: .3 });
  brick(640, 1080);
  // canopy
  shape(rect(-300, 560, W + 600, 90), { fill: P.g5, lw: 6, boil: 0 });
  for (let i = 0; i < 9; i++) shape(arc(-120 + i * 160, 650, 80, 26, 0, Math.PI, 10), { fill: P.g4, lw: 5, closed: true, boil: 0 });
  if (sign) { shape(rr(300, 720, 480, 110, 14), { fill: P.white, lw: 6, boil: 0 }); text('İSTASYON', 540, 778, { font: `64px ${TF}`, fill: INK }); }
  stationClock(160, 860, 70, t);
  // rails
  fillOnly(rect(-300, 1080, W + 600, 210), P.g4, { boil: 0 });
  for (let i = 0; i < 14; i++) fillOnly(rect(-280 + i * 110, 1180, 60, 40), P.g5, { boil: 0 });
  stroke([[-300, 1190], [W + 300, 1190]], 8, { boil: 0 }); stroke([[-300, 1215], [W + 300, 1215]], 8, { boil: 0 });
  checker(GY);
}
function waiting(t, gone = 0) {
  fillOnly(rect(-300, -300, W + 600, GY + 300), P.g3, { boil: 0 });
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) { const x = 40 + i * 130 + (j % 2) * 65, y = 240 + j * 130; shape(ell(x, y, 16, 16, 10), { fill: P.g2, lw: 3, boil: 0 }); }   // wallpaper
  shape(rect(-300, 1050, W + 600, 30), { fill: P.g5, lw: 5, boil: 0 });   // dado rail
  fillOnly(rect(-300, 1080, W + 600, 210), P.g4, { boil: 0 });
  // window to platform
  shape(rr(560, 520, 420, 360, 20), { fill: P.g1, lw: 7, boil: 0, shade: () => {
    fillOnly(rect(560, 760, 420, 120), P.g2, { boil: 0 });
    if (gone < 1) { push(); translate(lerp(640, 1600, ss(gone)), 860); scale(.38); train(0, 0, 1, t, { cars: 1 }); pop(); }
    else for (let i = 0; i < 3; i++) shape(ell(900 - i * 90, 700 - i * 30, 60, 40, 16), { fill: P.white, lw: 4, alpha: .8 });
  } });
  stroke([[770, 520], [770, 880]], 7, { boil: 0 }); stroke([[560, 700], [980, 700]], 7, { boil: 0 });
  checker(GY);
}
function booth(t) {
  platform(t, { sign: false });
  shape(rr(620, 700, 380, 580, 20), { fill: P.g5, lw: 7, boil: 0 });
  shape(rr(580, 660, 460, 90, 16), { fill: INK, lw: 6, boil: 0 }); text('BİLET', 810, 708, { font: `60px ${TF}`, fill: P.white });
  shape(rr(670, 790, 280, 220, 16), { fill: P.g1, lw: 6, boil: 0 });
  for (let i = 0; i < 4; i++) stroke([[700 + i * 70, 790], [700 + i * 70, 1010]], 4, { boil: 0 });
}
function stage(t, flash = 0) {   // abstract theatre stage for the rule moments
  fillOnly(rect(-300, -300, W + 600, H + 600), P.g4, { boil: 0 });
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + on12(t) * .2; fillOnly([[540, 900], [540 + Math.cos(a) * 1800, 900 + Math.sin(a) * 1800], [540 + Math.cos(a + .2) * 1800, 900 + Math.sin(a + .2) * 1800]], i % 2 ? P.g3 : (flash ? P.g6 : P.g4), { boil: 0 }); }
  // curtains
  for (const sx of [-1, 1]) { const x0 = sx < 0 ? -40 : W + 40; const pts = [[x0, -100]]; for (let i = 0; i <= 10; i++) pts.push([x0 + sx * -(150 + Math.sin(i * 1.3) * 20) , -100 + i * 150]); pts.push([x0, 1450]); shape(pts, { fill: P.g6, lw: 6, boil: .4 }); }
  shape(rect(-300, GY, W + 600, 400), { fill: P.g5, lw: 7, boil: 0 });
  for (let i = 0; i < 10; i++) stroke([[i * 120 - 40, GY], [i * 120 - 120, GY + 300]], 4, { line: P.g6, boil: 0 });
}

// ---------- type ----------
function txt(s, x, y, size, col, { font = TF, align = 'center', ow = 0, oc = INK } = {}) {
  if (HIDE) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${size}px ${font}`; g.textAlign = align; g.textBaseline = 'middle';
  if (ow) { g.lineWidth = ow; g.lineJoin = 'round'; g.strokeStyle = oc; g.strokeText(s, x, y); }
  g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
function tw(s, size, font = TF) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${size}px ${font}`; const w = g.measureText(s).width; g.restore(); return w; }
// period plate: near-black, white double rule, corner dots
function plate(x, y, w, h, k = 1, fill = INK) {
  if (k <= 0 || HIDE) return;
  push(); translate(x + w / 2, y + h / 2); scale(back(k, .5));
  shape(rr(-w / 2, -h / 2, w, h, 16), { fill, lw: 6 });
  const lc = fill === INK ? P.white : INK;
  stroke(rr(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 10).concat([rr(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 10)[0]]), 3, { line: lc, boil: .2 });
  for (const [cx, cy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { dot(cx * (w / 2 - 12), cy * (h / 2 - 12), 7, lc); }
  pop();
}
function title(s, y, size, k = 1, col = P.white) { if (k <= 0) return; const sc = back(k, .6); txt(s, W / 2 + 8, y + 8, size * sc, INK, { ow: size * .16 }); txt(s, W / 2, y, size * sc, col, { ow: size * .16 }); }
function chips(items, y, t0, t) {
  if (HIDE) return;
  const sz = 50, pad = 24, gap = 46, ws = items.map(i => tw(i.s, sz) + pad * 2), tot = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = (W - tot) / 2 - 30;
  items.forEach((it, i) => {
    const k = seg(t, t0 + i * .35, t0 + i * .35 + .35);
    const dark = it.dark;
    if (k > 0) { push(); translate(x + ws[i] / 2, y); scale(back(k, .6)); shape(rr(-ws[i] / 2, -42, ws[i], 84, 20), { fill: dark ? INK : P.white, lw: 6 }); pop(); if (k > .6) txt(it.s, x + ws[i] / 2, y + 3, sz, dark ? P.white : INK); }
    if (i < items.length - 1 && k > .6) txt('+', x + ws[i] + gap / 2, y + 2, 60, P.white, { ow: 12 });
    x += ws[i] + gap;
  });
}
// sentence plate: parts [[text, key?]]; mark 'ok' | 'bad'
function sentence(parts, y, size, k = 1, { mark = null, strike = false } = {}) {
  if (k <= 0 || HIDE) return;
  const full = parts.map(p => p[0]).join(''), w = tw(full, size, BF), mw = mark ? 90 : 0, bw = w + 80 + mw;
  plate(W / 2 - 30 - bw / 2, y - size * .95, bw, size * 1.9, k);
  if (k < .6) return;
  let x = W / 2 - 30 - bw / 2 + 40;
  for (const [s, key] of parts) {
    txt(s, x, y + 3, size, key ? P.white : P.g2, { font: BF, align: 'left' });
    if (key) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = P.white; const ww = tw(s.trimEnd(), size, BF); g.fillRect(x + 2, y + size * .55, ww - 4, 5); }
    x += tw(s, size, BF);
  }
  if (strike) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = P.white; g.fillRect(W / 2 - 30 - bw / 2 + 34, y - 2, x - (W / 2 - 30 - bw / 2 + 34), 6); }
  const mx = x + 50;
  if (mark === 'ok') { shape(ell(mx, y, 34, 34, 20), { fill: P.white, lw: 5 }); stroke([[mx - 16, y], [mx - 4, y + 14], [mx + 18, y - 14]], 9); }
  if (mark === 'bad') { shape(ell(mx, y, 34, 34, 20), { fill: P.g5, lw: 5, line: P.white }); stroke([[mx - 14, y - 14], [mx + 14, y + 14]], 9, { line: P.white }); stroke([[mx + 14, y - 14], [mx - 14, y + 14]], 9, { line: P.white }); }
}
function note(s, y, k = 1, size = 52, light = true) { if (k <= 0) return; const w = tw(s, size); plate(W / 2 - 30 - w / 2 - 40, y - size * .9, w + 80, size * 1.8, k, light ? P.white : INK); if (k > .6) txt(s, W / 2 - 30, y + 3, size, light ? INK : P.white); }

// ---------- subtitles: period title card, bottom, inside safe area ----------
const KEY_EN = /^(not|until|did|could|only|after)$/i, KEY_TR = /^(not|until|until'in|only|after|when|did|devrik)$/i;
function caption(t) {
  let cur = null; for (const l of Z.satirlar) if (t >= l.t0 - .05 && t <= l.t1 + .4) cur = l;
  if (!cur) return;
  const words = cur.metin.split(/ +/), size = 50, maxW = 780, lh = 62;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${size}px ${SF}`;
  const lines = []; let line = [];
  for (const w of words) { const test = [...line, w].join(' '); if (g.measureText(test).width > maxW && line.length) { lines.push(line); line = [w]; } else line.push(w); }
  if (line.length) lines.push(line);
  g.restore();
  const bh = lines.length * lh + 50, by = 1530 - bh;
  plate(80, by, 840, bh, 1);
  const kw = cur.kelimeler || []; let wi = 0;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  lines.forEach((ln, li) => {
    g.font = `${size}px ${SF}`; const full = ln.join(' '), lw_ = g.measureText(full).width; let x = 500 - lw_ / 2; const y = by + 25 + lh / 2 + li * lh;
    for (const w of ln) {
      const k0 = kw[wi] ? kw[wi].t0 : cur.t0 + wi * .3, shown = t >= k0 - .08 || t > cur.t1;
      const clean = w.replace(/[.,?!:]/g, ''), key = (cur.dil === 'en' ? KEY_EN : KEY_TR).test(clean);
      g.globalAlpha = shown ? 1 : 0; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = key ? P.white : P.g1;
      g.font = `${size}px ${SF}`; g.fillText(w, x, y);
      if (key && shown) g.fillRect(x, y + 26, g.measureText(clean).width, 4);
      x += g.measureText(w + ' ').width; wi++;
    }
  });
  g.globalAlpha = 1; g.restore();
}
function talk(t, ids) {
  for (const id of ids) { const l = L[id]; if (!l || t < l.t0 || t > l.t1) continue;
    for (const k of (l.kelimeler || [])) if (t >= k.t0 && t <= k.t1) { const u = (t - k.t0) / Math.max(.08, k.t1 - k.t0); return .25 + .45 * Math.abs(Math.sin(on12(u) * Math.PI * 2)); } }
  return 0;
}

// ---------- scenes ----------
function cam(cx, cy, z) { translate(W / 2, H / 2); scale(z); translate(-cx, -cy); }
let SC = [];
function sHook(t) {   // tren kaçıyor, Zıpzıp bavulla koşuyor
  push(); cam(540, 960, lerp(1.0, 1.06, ss(seg(t, 0, 3)))); platform(t);
  train(lerp(560, 1000, ss(seg(t, 0, T1('s01') + .3))), 1240, .62, t, { o: .15, look: [.6, 0], cars: 2, wave: true });
  zipzip(lerp(150, 300, ss(seg(t, 0, T1('s01')))), GY + 40, .82, t, { run: 1, armL: 'hold', armR: 'up', bag: true, wide: 1.15, o: .5, sm: -.3, brow: 1, look: [.8, -.2], hat: .3 + Math.sin(on12(t) * 20) * .1 });
  for (let i = 0; i < 3; i++) stroke([[20 - i * 10, 1000 + i * 60], [-120, 1000 + i * 60]], 6);
  pop();
  plate(110, 290, 860, 200, seg(t, .1, .45)); if (t > .35) { txt('FİİL NEREYE', 510, 350, 76, P.white); txt('KAÇTI?', 510, 432, 76, P.white); }
}
function sSleep(t, s0) {   // bekleme salonu: Zıpzıp uyuyor, Tiktak çalıyor
  const woke = t > T0('s03') + .1;
  push(); cam(500, 980, lerp(1.04, 1.0, ss(seg(t, s0, T1('s03'))))); waiting(t, ss(seg(t, s0 + .3, T0('s03'))));
  // bench
  shape(rr(60, 1080, 520, 50, 12), { fill: P.g5, lw: 6 }); for (const bx of [100, 520]) shape(rect(bx - 15, 1130, 30, 160), { fill: P.g6, lw: 5 });
  if (!woke) { zipzip(310, 1140, .78, t, { sit: true, closed: true, sm: .3, o: 0, armL: 'hips', armR: 'hips', bounce: 2, bag: false });
    for (let i = 0; i < 3; i++) { const k = (on12(t) * .6 + i / 3) % 1; txt('Z', 420 + k * 120, 640 - k * 220, 50 + k * 50, P.white, { ow: 10 }); } }
  else zipzip(310, 1140 - Math.abs(Math.sin(seg(t, T0('s03'), T0('s03') + .6) * Math.PI)) * 120, .78, t, { sit: true, wide: 1.35, o: .7, sm: -.5, brow: 1.4, armL: 'up', armR: 'up', hat: ss(seg(t, T0('s03'), T0('s03') + .4)), jit: 6, look: [.9, -.3] });
  tiktak(840, GY + 10, .75, t, { ring: !woke ? 1 : 0, o: !woke ? .6 : .2, wide: 1.1, armR: woke ? 'point' : 'up', armL: 'up', look: [-.8, 0] });
  pop();
  if (!woke) note('ZZZ…', 360, seg(t, s0 + .1, s0 + .4), 60, false);
  else note('TREN GİTMİŞ!', 360, seg(t, T0('s03'), T0('s03') + .35), 66, true);
}
function sNormal(t, s0) {   // boş peron, normal cümle
  push(); cam(540, 980, lerp(1.0, 1.04, ss(seg(t, s0, T1('s05'))))); platform(t);
  for (let i = 0; i < 3; i++) shape(ell(980 - i * 100, 760 - i * 40, 70, 46, 18), { fill: P.white, lw: 5, alpha: .9 });
  shape(rr(260, 1210, 200, 120, 14), { fill: P.g5, lw: 6 });   // suitcase seat
  zipzip(360, 1250, .7, t, { sit: true, sm: -.8, o: talk(t, ['s05']) , brow: 1.2, look: [.6, .3], armL: 'hips', armR: 'down', bounce: .5 });
  tiktak(800, GY + 60, .68, t, { look: [-.7, 0], armR: 'point', o: .1 });
  pop();
  chips([{ s: 'ana cümle' }, { s: 'until', dark: true }, { s: 'yan cümle' }], 340, s0 + .5, t);
  sentence([['He didn\'t wake up ', 0], ['until', 1], [' the train left.', 0]], 520, 50, seg(t, T0('s05') - .1, T0('s05') + .25), { mark: 'ok' });
  note('devrik yok', 640, seg(t, T0('s04') + 1.6, T0('s04') + 1.9), 46);
}
function sInvert(t, s0) {   // sahne: Not until başa gelir, did öne
  push(); cam(540, 980, 1.0); stage(t);
  const k = ss(seg(t, T0('s07'), T0('s07') + .8));
  tiktak(800, GY + 10, .85, t, { armL: 'point', armR: 'up', look: [-.8, -.2], o: talk(t, ['s06']) ? .5 : .15, sm: 1 });
  zipzip(300, GY + 10, .85, t, { armL: 'down', armR: k > .5 ? 'cheer' : 'hips', sm: 1, o: talk(t, ['s07']), look: [.5, -.4], bounce: 1.6, hat: k > .5 ? .15 : 0 });
  pop();
  chips([{ s: 'Not until', dark: true }, { s: 'yan cümle' }], 330, s0 + .5, t);
  chips([{ s: 'did', dark: true }, { s: 'özne' }, { s: 'V1' }], 450, s0 + 1.4, t);
  sentence([['Not until', 1], [' the train left ', 0], ['did', 1], [' he wake up.', 0]], 620, 46, seg(t, T0('s07') - .1, T0('s07') + .25), { mark: 'ok' });
}
function sTrap(t, s0) {   // DİKKAT: yakın plan şok
  const flash = Math.floor(t * 4) % 2;
  push(); cam(320, 900, 1.35); stage(t, flash);
  zipzip(300, GY + 10, .85, t, { wide: 1.3, wavy: true, brow: 1.5, jit: 5, armL: 'up', armR: 'up', look: [.4, -.4] });
  pop();
  plate(220, 290, 640, 120, seg(t, s0 + .05, s0 + .35), P.white); if (t > s0 + .3) txt('DİKKAT!', 540, 352, 80, INK);
  sentence([['Not until ', 0], ['did', 1], [' the train leave he woke up.', 0]], 560, 40, seg(t, T0('s09') - .3, T0('s09')), { mark: 'bad' });
  sentence([['Not until the train left ', 0], ['he woke', 1], [' up.', 0]], 720, 40, seg(t, T0('s09') + .4, T0('s09') + .7), { mark: 'bad' });
  if (t > T0('s09') + 1.0) { const k = seg(t, T0('s09') + 1.0, T0('s09') + 1.3); push(); translate(760, 1000); rotate(-.18); scale(back(k, .8) * 1.0); shape(rr(-190, -64, 380, 128, 16), { fill: null, lw: 9, line: P.white }); pop(); txt('ELENİR', 760, 1000, 76 * back(k, .8), P.white, { ow: 10 }); }
}
function sOnly(t, s0) {   // bilet gişesi, yeni tren, rahatlama
  const relax = t > T0('s11') + 1.0;
  push(); cam(540, 980, lerp(1.0, 1.05, ss(seg(t, s0, T1('s11'))))); booth(t);
  train(lerp(-1200, -150, ss(seg(t, s0, s0 + 1.5))), 1240, .55, t, { cars: 2, o: .1, look: [.8, 0] });
  zipzip(lerp(560, 430, ss(seg(t, T0('s11'), T0('s11') + 1))), GY + 30, .82, t, { armL: relax ? 'hips' : 'down', armR: 'ticket', ticket: true, sm: relax ? 1 : .2, o: talk(t, ['s11']), look: relax ? [0, -.2] : [.9, -.1], closed: relax && Math.floor(t * 2) % 3 === 0, bounce: relax ? 1.6 : 1, face: -1 });
  pop();
  chips([{ s: 'Only after', dark: true }, { s: 'Only when', dark: true }], 320, s0 + .5, t);
  note('= aynı kural', 430, seg(t, s0 + 1.4, s0 + 1.7), 46);
  sentence([['Only after', 1], [' he bought a new ticket ', 0], ['could', 1], [' he relax.', 0]], 545, 38, seg(t, T0('s11') - .1, T0('s11') + .25), { mark: 'ok' });
}
function sEnd(t, s0) {   // tren gidiyor, Zıpzıp pencereden el sallıyor
  push(); cam(540, 980, 1.0); platform(t);
  train(lerp(-60, -500, ss(seg(t, T0('s13'), T1('s13') + 1.6))), 1240, .62, t, { cars: 2, o: .25, wave: true, rider: true, look: [.4, -.2] });
  tiktak(880, GY + 60, .62, t, { armR: 'up', armL: 'up', look: [-.6, -.3], o: .3 });
  pop();
  plate(90, 290, 900, 200, seg(t, s0 + .05, s0 + .4));
  if (t > s0 + .35) { txt('KALIP BAŞTA', 510, 352, 62, P.white); txt('→ DEVRİK ANA CÜMLEDE', 510, 430, 52, P.g1); }
  note('Only when ile sen kur!', 600, seg(t, T0('s13') - .1, T0('s13') + .3), 50);
  const e = seg(t, T1('s13') + .3, T1('s13') + .7);
  if (e > 0) { plate(170, 1310, 740, 130, e); if (e > .6) txt('ingilizcecim.com', 540, 1376, 76, P.white); }
}
function buildScenes() {
  SC = [[sHook, 0], [sSleep, T0('s02') - .2], [sNormal, T0('s04') - .3], [sInvert, T0('s06') - .3], [sTrap, T0('s08') - .2], [sOnly, T0('s10') - .3], [sEnd, T0('s12') - .3]];
}
function sceneAt(t) { let i = 0; for (let j = 0; j < SC.length; j++) if (t >= SC[j][1]) i = j; return i; }
// iris transition: black outside a circle
function iris(r) { if (r > 1300) return; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = INK; g.beginPath(); g.rect(0, 0, W, H); g.arc(540, 900, Math.max(0, r), 0, TAU, true); g.fill('evenodd'); }

// ---------- film damage (greyscale only) ----------
function damage(t) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  const f = Math.floor(t * 24);
  const fl = (hash(f * 1.3) - .5) * .08; g.globalAlpha = Math.abs(fl); g.fillStyle = fl > 0 ? '#ffffff' : '#000000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  const ns = Math.floor(hash(Math.floor(t * 3)) * 3);
  for (let i = 0; i < ns; i++) { const x = hash(Math.floor(t * 3) * 7 + i) * W + Math.sin(t * 3 + i) * 8; g.globalAlpha = .35; g.fillStyle = i % 2 ? '#ffffff' : '#1a1a1a'; g.fillRect(x, 0, 2, H); }
  for (let i = 0; i < 6; i++) { const x = hash(f * 3.1 + i) * W, y = hash(f * 5.7 + i) * H, r = 1.5 + hash(f + i * 9) * 4; g.globalAlpha = .6; g.fillStyle = hash(f + i) > .5 ? '#111' : '#eee'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
  const vg = g.createRadialGradient(540, 960, 600, 540, 960, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

window.render = t => {
  frame(t, { amp: 1.2 }); g.globalAlpha = 1; HIDE = KAPAK;
  scr(P.g3);
  if (!Z) return;
  const i = sceneAt(t), [f, s] = SC[i];
  // weave
  const f24 = Math.floor(t * 24), wx = (hash(f24 * .7) - .5) * 2.4 + (t - s < .08 ? 6 : 0), wy = (hash(f24 * 1.1) - .5) * 2.4;
  g.save();
  f(t, s);
  g.restore();
  // iris out at the end of each scene, iris in at the start
  if (i > 0 && t < s + .45) iris(1300 * ss(seg(t, s, s + .45)));
  if (i < SC.length - 1) { const n = SC[i + 1][1]; if (t > n - .3) iris(1300 * (1 - ss(seg(t, n - .3, n)))); }
  HIDE = false;
  if (!KAPAK) { caption(t); damage(t); } else cover();
  void wx; void wy;
};
function cover() {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = 'rgba(20,18,16,.25)'; g.fillRect(0, 0, W, H);
  plate(120, 300, 840, 96, 1); txt('DİLBİLGİSİ · YDT / YDS', 540, 350, 50, P.white);
  plate(50, 410, 980, 250, 1, P.white);
  txt('NOT UNTIL', 548, 498, 150, INK); txt('NOT UNTIL', 540, 490, 150, P.white, { ow: 18 });
  txt('… did he?', 540, 605, 80, INK);
  plate(150, 1430, 780, 120, 1, P.white); txt('Devrik yapı nereye gelir?', 540, 1492, 52, INK);
  damage(3.3);
}

(async () => {
  Z = await (await fetch('ses/zaman.json')).json(); Z.satirlar.forEach(l => L[l.id] = l);
  await Promise.all([document.fonts.load(`64px ${TF}`, 'ğşİıçüöÜÇŞĞ'), document.fonts.load(`50px ${SF}`, 'ğşİıçüöÜÇŞĞ'), document.fonts.load(`50px ${BF}`, 'abc')]);
  await document.fonts.ready;
  buildScenes();
  const endT = T1('s13') + .7;
  window.DUR = Math.max(Z.dur, endT + 2.2);
  const e = [{ t: .2, type: 'whoosh' }, { t: .4, type: 'pop' }];
  for (const [, s0] of SC.slice(1)) e.push({ t: s0, type: 'whoosh' });
  e.push({ t: T0('s03') + .1, type: 'thump' }, { t: T0('s03') + .3, type: 'pop' }, { t: T0('s05'), type: 'ding' }, { t: T0('s07'), type: 'ding' });
  const sc = id => SC.find(x => x[1] <= T0(id) && x[1] > T0(id) - 1)[1];
  for (let i = 0; i < 3; i++) e.push({ t: sc('s04') + .5 + i * .35, type: 'pop' });
  for (let i = 0; i < 2; i++) e.push({ t: sc('s06') + .5 + i * .35, type: 'pop' });
  for (let i = 0; i < 3; i++) e.push({ t: sc('s06') + 1.4 + i * .35, type: 'pop' });
  for (let i = 0; i < 2; i++) e.push({ t: sc('s10') + .5 + i * .35, type: 'pop' });
  e.push({ t: T0('s08') - .1, type: 'thump' }, { t: T0('s09') - .2, type: 'click' }, { t: T0('s09') + .5, type: 'click' }, { t: T0('s09') + 1.0, type: 'thump' });
  e.push({ t: T0('s11'), type: 'ding' }, { t: T0('s12') - .2, type: 'pop' }, { t: endT - .4, type: 'pop' });
  window.EV = e.filter(x => x.t > 0).sort((a, b) => a.t - b.t);
  window.READY = true;
})();
