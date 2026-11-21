// nice: dokuz çizgi film sahnesi (Lügat oynar). Tarif: sistem/sablonlar/canli-sozluk/SABLON.md
// 1 meydan: "Nice!" → APTAL?! damgası · 2 Roma · 3 Roma okulu: NESCIUS → NE + SCIRE · 4 Fransa: kalburla su taşır
// 5 gemi: İngiltere 1300'ler · 6 dönüm: zaman yolu, tabelalar aptal → titiz → hoş · 7 1500'ler: büyüteç, terazide iki elma
// 8 1700'ler bahçe: hoş, güzel · 9 bugün: ders masası, kalp; "Nice!" yankısı

const INKL = '#2A2927';
const duz = (K, pts, fill, lw = 2.6) => K.shape(pts, { fill, lw, line: INKL, boil: 0 });
const ink = (K, pts, fill, lw = 6) => K.shape(pts, { fill, lw });

function gok(K, c0, c1, c2) {
  const g = K.T.g, gr = g.createLinearGradient(0, 0, 0, 1150); gr.addColorStop(0, c0); gr.addColorStop(.55, c1); gr.addColorStop(1, c2);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = gr; g.fillRect(0, 0, K.W, K.H);
}
function zemin(K, y, a, b, w = 170, h = 110) {   // taş zemin, çerçevenin altına kadar
  const { rect, W, H } = K;
  duz(K, rect(-20, y, W + 40, H - y + 20), a);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const yy = y + 20 + r * (h + 10), x = -60 + c * w + (r % 2) * w / 2; duz(K, rect(x, yy, w - 10, h), (r + c) % 2 ? a : b); }
}
function ev(K, x, y, w, h, duvar, cati) {
  const { rect } = K;
  duz(K, [[x - 14, y - h], [x + w / 2, y - h - w * .5], [x + w + 14, y - h]], cati);
  duz(K, rect(x, y - h, w, h), duvar);
  for (const [a, b] of [[[x + 8, y - h + 10], [x + w - 8, y - h + 10]], [[x + 8, y - h / 2], [x + w - 8, y - h / 2]], [[x + w / 2, y - h + 10], [x + w / 2, y - 8]]]) K.stroke([a, b], 9, { line: '#6a4228', boil: 0 });
  duz(K, rect(x + w * .14, y - h * .42, w * .24, h * .2), '#f6d77a'); duz(K, rect(x + w * .62, y - h * .36, w * .24, h * .36), '#6a4228');
}
function etiket(K, s, x, y, k = 1, o = {}) {   // krem tabela kart, ortalı yazı
  if (k <= .02) return;
  const { T, rr } = K, fs = o.fs || 46, w = o.w || 420, h = o.h || 86;
  T.push(); T.translate(x, y); T.rotate(o.rot ?? -.04); T.scale(k);
  K.shape(rr(-w / 2 + 10, -h / 2 + 12, w, h, 18), { fill: '#1B1F33', stroke: false, boil: .4 });
  K.shape(rr(-w / 2, -h / 2, w, h, 18), { fill: o.bg || '#F6EEDB', lw: 6 });
  T.text(s, 0, 3, { font: `800 ${fs}px Merri`, fill: o.col || '#1B1F33' });
  T.pop();
}
function balon(K, s, x, y, k, o = {}) {   // konuşma balonu (kuyruk sola-aşağı)
  if (k <= .02) return;
  const { T, ell } = K;
  T.push(); T.translate(x, y); T.scale(k);
  K.shape([[-60, 50], [-110, 120], [-10, 60]], { fill: '#fbf6ea', lw: 6 });
  K.shape(ell(0, 0, o.rx || 170, o.ry || 82, 36), { fill: '#fbf6ea', lw: 7 });
  T.text(s, 0, 4, { font: `${o.fs || 76}px Shrik`, fill: o.col || '#D7263D' });
  T.pop();
}
function parilti(K, x, y, r, t) {
  const a = .6 + .4 * Math.sin(t * 9 + x);
  K.shape([[x, y - r * a], [x + r * .25, y - r * .25], [x + r * a, y], [x + r * .25, y + r * .25], [x, y + r * a], [x - r * .25, y + r * .25], [x - r * a, y], [x - r * .25, y - r * .25]], { fill: '#fff6c8', lw: 4 });
}
function kalp(K, x, y, r, col = '#D7263D') {
  const pts = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, X = 16 * Math.pow(Math.sin(a), 3), Y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); pts.push([x + X * r / 16, y + Y * r / 16]); }
  K.shape(pts, { fill: col, lw: 5 });
}
function defne(K, x, y) {   // Lügat'ın başına defne tacı (gövde üst kenarı y - 270)
  const top = y - 270;
  for (let i = 0; i < 9; i++) { const xx = x - 110 + i * 26, yy = top - 6 - Math.sin(i / 8 * Math.PI) * 10; K.T.push(); K.T.translate(xx, yy); K.T.rotate((i - 4) * .18); K.shape(K.ell(0, 0, 9, 18, 14), { fill: '#5f8f3a', lw: 3 }); K.T.pop(); }
}

// 1 · meydan: "Nice!" der, APTAL?! damgası yer
let MEYDAN = null;
function meydanArka(K) {
  if (MEYDAN) { const g = K.T.g; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(MEYDAN, 0, 0); return; }
  gok(K, '#7fb6d4', '#bcdbe0', '#f4e6c4');
  K.shape(K.ell(860, 650, 70, 70, 30), { fill: '#fbe7a8', lw: 3, line: INKL, boil: 0 });
  ev(K, 20, 1100, 220, 300, '#efe0bf', '#b8543a'); ev(K, 290, 1080, 200, 360, '#e8cfa0', '#8a3a2a'); ev(K, 560, 1100, 230, 280, '#efe0bf', '#b8543a'); ev(K, 840, 1090, 210, 330, '#e2c08a', '#8a3a2a');
  zemin(K, 1150, '#c9905e', '#b47c4e');
  MEYDAN = document.createElement('canvas'); MEYDAN.width = K.W; MEYDAN.height = K.H; MEYDAN.getContext('2d').drawImage(K.T.g.canvas, 0, 0);
}
function meydan(K) {
  const { lugat, ramp, zip, back, wob, at, sonu } = K;
  const T1 = at('s01'), AP = T1 + (sonu('s01') - T1) * .72;
  K.olay(T1 + .2, 'pop'); K.olay(AP, 'carp'); K.olay(AP + .5, 'bakis');
  return { iris: [430, 980], arka: () => meydanArka(K), ciz: (t) => {
    const X = 400, Y = 1170, sok = t > AP;
    lugat(X, Y, { el: sok ? ['open', 'open'] : ['wave', 'thumb'], reach: sok ? .9 : .55 + .1 * wob(t, 2), bak: sok ? 'cam' : 'right', kas: sok ? 'sad' : 'up', agiz: sok ? 'o' : 'beam', ter: sok, sx: 1 - .12 * zip(t, AP) * (1 - ramp(t, AP + .25, AP + .6)), sy: 1 + .15 * zip(t, AP) * (1 - ramp(t, AP + .25, AP + .6)) });
    if (!sok) balon(K, 'Nice!', 700, 700, back(ramp(t, T1 + .2, T1 + .6)));
    if (sok) { const k = 2.2 - 1.2 * zip(t, AP, .14); K.T.push(); K.T.translate(700, 690); K.T.rotate(-.14); K.T.scale(k);
      K.shape(K.rr(-230, -70, 460, 140, 22), { fill: '#fbf6ea', lw: 8 }); K.T.text('APTAL?!', 0, 6, { font: '96px Shrik', fill: '#D7263D' }); K.T.pop(); }
  } };
}

// 2 · Roma
function roma(K) {
  const { lugat, ramp, wob, at, rect, shape, W, H } = K;
  const T2 = at('s02'); K.olay(T2 + .3, 'whoosh');
  const arka = () => {
    gok(K, '#f2b766', '#f6d79a', '#f7e6c0');
    K.shape(K.ell(540, 760, 120, 120, 40), { fill: '#fbe7a8', lw: 3, line: INKL, boil: 0 });
    for (const x of [90, 300, 780, 990]) { duz(K, rect(x - 40, 620, 80, 520), '#efe2c2'); duz(K, rect(x - 56, 590, 112, 34), '#e2d2ac'); for (let i = -1; i <= 1; i++) K.stroke([[x + i * 18, 640], [x + i * 18, 1120]], 4, { line: '#c9b68c', boil: 0 }); }
    duz(K, rect(20, 560, 1040, 40), '#e2d2ac');
    duz(K, [[400, 1140], [400, 860], [440, 790], [540, 760], [640, 790], [680, 860], [680, 1140], [610, 1140], [610, 880], [540, 840], [470, 880], [470, 1140]], '#d9c49a');
    zemin(K, 1140, '#d8bf8c', '#c9ad78', 200, 120);
  };
  return { bas: 's02', iris: [540, 950], arka, ciz: (t) => {
    const X = 540 + 30 * wob(t, .3), Y = 1170;
    lugat(X, Y, { el: ['open', 'point'], reach: .2, bak: 'up', kas: 'up', agiz: 'smile', lean: .03 * wob(t, .8) });
    defne(K, X, Y);
    etiket(K, 'ROMA', 540, 640, K.back(ramp(t, T2 + .2, T2 + .6)), { w: 300, fs: 56 });
  } };
}

// 3 · Roma okulu: balmumu levha
function okul(K) {
  const { lugat, ramp, zip, back, wob, at, rect, ell, shape, stroke, T, W, H } = K;
  const T3 = at('s03'), T4 = at('s04');
  K.olay(T3 + .4, 'bakis'); K.olay(T4, 'tak'); K.olay(T4 + .6, 'tak'); K.olay(T4 + 1.2, 'yaylan');
  const arka = () => {
    const g = T.g; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#d8a878'; g.fillRect(0, 0, W, H);
    for (let r = 0; r < 14; r++) for (let c = 0; c < 6; c++) duz(K, rect(-60 + c * 200 + (r % 2) * 100, 560 + r * 44, 190, 38), (r + c) % 3 ? '#cf9a6a' : '#c48c5c', 2);
    duz(K, [[90, 940], [90, 700], [130, 640], [190, 620], [250, 640], [290, 700], [290, 940]], '#9fd0e0');
    stroke([[190, 625], [190, 940]], 8, { line: INKL, boil: 0 }); stroke([[90, 780], [290, 780]], 8, { line: INKL, boil: 0 });
    zemin(K, 1150, '#a8704a', '#9c6640', 150, 90);
  };
  return { bas: 's03', iris: [700, 900], arka, ciz: (t) => {
    // levha + şövale
    for (const [a, b] of [[[640, 1150], [700, 860]], [[980, 1150], [920, 860]]]) stroke([a, b], 14, { line: '#6a4228' });
    shape(K.rr(560, 600, 500, 300, 14), { fill: '#7a4a2a', lw: 7 });
    shape(rect(585, 625, 450, 250), { fill: '#e9c66a', lw: 4 });
    const ayir = t >= T4, d = ramp(t, T4, T4 + .5);
    if (!ayir) { T.text('NESCIUS', 810, 715, { font: '800 74px Merri', fill: '#1B1F33' }); T.text('= bilmeyen, cahil', 810, 805, { font: 'italic 500 40px Merri', fill: '#1B1F33' }); }
    else {
      T.text('NE', 680 - 20 * d, 705, { font: '800 72px Merri', fill: '#D7263D' }); T.text('+', 770, 705, { font: '800 60px Merri', fill: '#1B1F33' }); T.text('SCIRE', 900 + 20 * d, 705, { font: '800 64px Merri', fill: '#1B1F33' });
      const a = ramp(t, T4 + .5, T4 + 1); if (a > 0) { T.text('değil', 670, 785, { font: 'italic 500 40px Merri', fill: '#D7263D' }); T.text('bilmek', 905, 785, { font: 'italic 500 40px Merri', fill: '#1B1F33' }); }
      const b = ramp(t, T4 + 1.4, T4 + 1.8); if (b > 0) T.text('= NESCIUS', 810, 850, { font: '800 40px Merri', fill: '#1B1F33' });
    }
    const X = 300, Y = 1170, kas = ayir ? 'up' : 'sad';
    const kafa = [X + 60 + 14 * wob(t, 3), Y - 300];
    lugat(X, Y, { kol: ayir ? [null, [560, 760]] : [null, kafa], el: ayir ? ['open', 'point'] : ['open', 'grab'], bak: ayir ? 'right' : 'up', kas, agiz: ayir ? (t > T4 + 1.2 ? 'grin' : 'o') : 'wavy', sy: 1 + .06 * zip(t, T4 + 1.2) * (1 - ramp(t, T4 + 1.4, T4 + 1.7)) });
    if (!ayir) { const q = back(ramp(t, T3 + .3, T3 + .7)); if (q > .02) { T.push(); T.translate(170, 760 + 8 * wob(t, 1)); T.scale(q); shape(ell(0, 0, 52, 58, 24), { fill: '#fbf6ea', lw: 6 }); T.text('?', 0, 6, { font: '90px Shrik', fill: '#1B1F33' }); T.pop(); } }
  } };
}

// 4 · Fransa: kalburla su taşır
function fransa(K) {
  const { lugat, ramp, back, wob, at, rect, ell, shape, stroke, T } = K;
  const T5 = at('s05'); K.olay(T5 + .3, 'whoosh'); K.olay(T5 + 1.5, 'gurul');
  const arka = () => {
    gok(K, '#9fc9dc', '#cfe3df', '#f1e6c6');
    ev(K, 30, 1100, 240, 300, '#efe0bf', '#3f6f8a'); ev(K, 780, 1100, 270, 340, '#e8cfa0', '#3f6f8a');
    // kuyu
    duz(K, rect(420, 960, 220, 170), '#b9a58a'); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) duz(K, K.rr(428 + c * 52 + (r % 2) * 10, 968 + r * 40, 48, 34, 8), '#a8937a', 2);
    for (const x of [440, 620]) K.stroke([[x, 960], [x, 790]], 14, { line: '#6a4228', boil: 0 }); duz(K, [[400, 800], [530, 740], [660, 800]], '#8a3a2a');
    zemin(K, 1130, '#9fb85e', '#8aa84e', 190, 100);
  };
  return { bas: 's05', iris: [560, 950], arka, ciz: (t) => {
    const X = 300, Y = 1170, SX = 560, SY = 800 + 6 * wob(t, 1.5);
    lugat(X, Y, { kol: [[SX - 90, SY + 10], [SX + 80, SY + 10]], el: ['grab', 'grab'], bak: 'cam', kas: 'up', agiz: 'bleh', lean: .05 * wob(t, .7) });
    // kalbur (delikli)
    shape(ell(SX, SY, 110, 30, 30), { fill: '#c9933a', lw: 6 }); shape(ell(SX, SY - 4, 92, 20, 26), { fill: '#7fbfdc', lw: 3 });
    for (let i = 0; i < 9; i++) K.shape(ell(SX - 70 + i * 18, SY + 2 + (i % 2) * 6, 4, 3, 8), { fill: '#3a2a1a', stroke: false, boil: 0 });
    for (let i = 0; i < 12; i++) { const ph = (t * 1.4 + i / 12) % 1, dx = (i % 6 - 2.5) * 26; shape(K.spline([[SX + dx, SY + 30 + ph * 300], [SX + dx + 8, SY + 50 + ph * 300], [SX + dx, SY + 58 + ph * 300], [SX + dx - 8, SY + 50 + ph * 300]], true, 5), { fill: '#9fd6ef', lw: 3, alpha: 1 - ph }); }
    shape(ell(SX, 1150, 150 * ramp(t, T5, T5 + 3), 22, 24), { fill: '#7fbfdc', lw: 4 });   // ayağının dibinde göl
    etiket(K, 'FRANSA · 1100\'ler', 760, 640, back(ramp(t, T5 + .1, T5 + .5)), { w: 440, fs: 38 });
    etiket(K, 'nice = saf, aptal', 300, 760, back(ramp(t, T5 + 1.3, T5 + 1.7)), { w: 400, fs: 40, col: '#D7263D', rot: .04 });
  } };
}

// 5 · gemi: İngiltere'ye geçiş
function gemi(K) {
  const { lugat, ramp, back, wob, at, rect, ell, shape, stroke, spline, T, W, H } = K;
  const T6 = at('s06'); K.olay(T6 + .3, 'whoosh'); K.olay(T6 + 2, 'huzun');
  const arka = () => {
    gok(K, '#6f9fc0', '#aecbd6', '#e8e2cc');
    duz(K, [[650, 900], [700, 780], [820, 760], [940, 740], [1100, 750], [1100, 900]], '#f4f0e2'); duz(K, [[640, 790], [820, 752], [1100, 735], [1100, 760], [940, 748], [700, 790]], '#5f8f3a');
    duz(K, rect(-20, 890, W + 40, H - 870), '#2f6f96');
  };
  return { bas: 's06', iris: [480, 900], arka, ciz: (t) => {
    const x = 280 + 100 * ramp(t, T6, T6 + 4), b = 10 * wob(t, .45), r = .03 * wob(t, .45, 1);
    T.push(); T.translate(x, 1030 + b); T.rotate(r); T.scale(.9);
    stroke([[0, -40], [0, -440]], 14, { line: '#5a3a1e' });
    shape(spline([[-200, -430], [-60 + 14 * wob(t, .5), -310], [-200, -170], [200, -170], [230 + 14 * wob(t, .5), -310], [200, -430]], true, 8), { fill: '#fbf6ea', lw: 6 });
    T.text('nice', 15, -320, { font: '96px Shrik', fill: '#D7263D' }); T.text('"aptal"', 15, -225, { font: 'italic 700 40px Merri', fill: '#1B1F33' });
    shape([[-280, -40], [280, -40], [230, 70], [-230, 70]], { fill: '#8a5a3a', lw: 7 });
    for (let i = 0; i < 4; i++) K.shape(ell(-180 + i * 120, 10, 16, 16, 12), { fill: '#e8d6a8', lw: 4 });
    T.pop();
    lugat(x - 110, 995 + b, { k: .58, el: ['open', 'grab'], kol: [null, [x - 40, 800 + b]], bak: 'cam', kas: 'sad', agiz: 'wavy', ter: true });
    for (let i = 0; i < 9; i++) { const y = 1100 + i * 50 + i * i * 3; stroke(Array.from({ length: 28 }, (_, j) => [-20 + j * 42, y + Math.sin(j * .9 + t * 2 + i) * (6 + i)]), 5 + i * .5, { line: '#e8f6ff' }); }
    etiket(K, 'İNGİLTERE · 1300\'ler', 770, 660, back(ramp(t, T6 + .2, T6 + .6)), { w: 360, fs: 30 });
  } };
}

// 6 · dönüm: zaman yolu
function yol(K) {
  const { lugat, ramp, back, wob, at, rect, ell, shape, stroke, T, W, H } = K;
  const T7 = at('s07'); K.olay(T7 + .2, 'yaylan'); [0, 1, 2].forEach(i => K.olay(T7 + .7 + i * .5, 'tak'));
  const arka = () => {
    gok(K, '#3a2f55', '#c86a4a', '#f6c27a');
    const hill = (y0, amp, f, ph, col) => { const p = [[-20, H + 20]]; for (let x = -20; x <= W + 20; x += 30) p.push([x, y0 - amp * Math.sin(x * f + ph)]); p.push([W + 20, H + 20]); duz(K, p, col, 3); };
    hill(820, 50, .006, 1, '#7a6a9a'); hill(920, 40, .008, 3, '#5f8f5a'); hill(1060, 30, .01, 5, '#4f7f44');
  };
  const R = []; for (let i = 0; i <= 30; i++) { const s = i / 30; R.push([540 + Math.sin(s * 6) * 260 * (1 - s), 1180 - 400 * s, 200 * (1 - s) + 8]); }
  return { bas: 's07', iris: [540, 800], arka, ciz: (t) => {
    const k = ramp(t, T7, T7 + 1.2);
    for (let i = 0; i < 26; i++) { const a = Math.PI * (1.05 + i / 25 * .9); stroke([[540 + Math.cos(a) * 90, 790 + Math.sin(a) * 90], [540 + Math.cos(a) * (90 + 520 * k), 790 + Math.sin(a) * (90 + 520 * k)]], 6, { line: '#fbe7a8' }); }
    shape(K.arc(540, 790, 80, 80, Math.PI, Math.PI * 2, 20), { fill: '#f6a03a', lw: 5 });
    shape([...R.map(q => [q[0] - q[2] / 2, q[1]]), ...R.slice().reverse().map(q => [q[0] + q[2] / 2, q[1]])], { fill: '#f4e6c4', lw: 5 });
    [[200, 1120, '1300', 'aptal', 1], [820, 990, '1500', 'titiz', .85], [330, 870, '1700', 'hoş', .7]].forEach(([px, py, y, w, sc], i) => {
      const p = back(ramp(t, T7 + .7 + i * .5, T7 + 1.1 + i * .5)); if (p <= .02) return;
      T.push(); T.translate(px, py); T.scale(p * sc); stroke([[0, 0], [0, -170]], 12, { line: '#6a4228' });
      shape([[-120, -260], [100, -260], [135, -215], [100, -170], [-120, -170]], { fill: '#fbf6ea', lw: 6 });
      T.text(y, -10, -235, { font: '800 36px Merri', fill: '#1B1F33' }); T.text(w, -10, -192, { font: 'italic 700 36px Merri', fill: i === 2 ? '#D7263D' : '#1B1F33' }); T.pop();
    });
    const s = ramp(t, T7, T7 + 3.6), j = Math.min(29, Math.floor(2 + s * 10)), q = R[j];
    lugat(q[0], q[1] - 10, { k: .62 - .12 * s, ayak: true, el: ['wave', 'open'], reach: .4, bak: 'up', kas: 'up', agiz: 'o', lean: .08 * wob(t, 2.5) });
  } };
}

// 7 · 1500'ler çalışma odası: titiz, ince
function calisma(K) {
  const { lugat, ramp, zip, back, wob, at, rect, ell, shape, stroke, T, W, H } = K;
  const T8 = at('s08'), T9 = at('s09');
  K.olay(T8 + .3, 'bakis'); K.olay(T9, 'whoosh'); K.olay(T9 + .5, 'tak'); K.olay(T9 + 2.5, 'yaylan');
  const arka = () => {
    const g = T.g; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#5a4a6a'; g.fillRect(0, 0, W, H);
    for (const y of [700, 880]) { duz(K, rect(-20, y, 360, 18), '#6a4228'); for (let i = 0; i < 7; i++) duz(K, rect(10 + i * 46, y - 120 + (i % 3) * 12, 40, 120 - (i % 3) * 12), ['#8a3a2a', '#2f5d8a', '#3c7a5a', '#a8703a', '#6b3f7a'][i % 5]); }
    duz(K, rect(640, 600, 320, 300), '#8fc3dc'); stroke([[800, 600], [800, 900]], 10, { line: '#6a4228', boil: 0 }); stroke([[640, 750], [960, 750]], 10, { line: '#6a4228', boil: 0 });
    duz(K, rect(-20, 1110, W + 40, 50), '#8a5a3a'); duz(K, rect(-20, 1160, W + 40, H - 1140), '#6a4a3a');
    for (let c = 0; c < 10; c++) stroke([[c * 120, 1170], [c * 120 - 60, H]], 3, { line: '#5a3a2a', boil: 0 });
  };
  return { bas: 's08', iris: [600, 950], arka, ciz: (t) => {
    const X = 260, Y = 1140, ter = t >= T9;
    // mum
    shape(rect(950, 1010, 30, 100), { fill: '#fbf6ea', lw: 5 }); const f = 6 * wob(t, 3);
    shape(K.spline([[965, 1008], [980, 985 + f], [965, 955 - f], [950, 985 + f]], true, 6), { fill: '#f6a03a', lw: 4 });
    if (!ter) {   // cetvel + tüy kalem: kılı kırk yarar
      shape(rect(470, 1080, 380, 30), { fill: '#e9c66a', lw: 5 }); for (let i = 0; i < 18; i++) stroke([[485 + i * 20, 1080], [485 + i * 20, 1080 + (i % 5 ? 10 : 20)]], 3);
      T.push(); T.translate(660, 1040); T.rotate(-.25 + .04 * wob(t, 1.2)); shape([[-150, 0], [120, -20], [150, -4], [120, 14]], { fill: '#fbf6ea', lw: 5 }); T.pop();
      etiket(K, 'titiz · ince', 720, 640, back(ramp(t, T8 + .4, T8 + .8)), { w: 380, fs: 46 });
    } else {   // terazi: iki neredeyse aynı elma
      const tilt = .04 * wob(t, .8) * (1 - ramp(t, T9 + 2, T9 + 3));
      stroke([[660, 1110], [660, 830]], 12, { line: '#c9933a' });
      T.push(); T.translate(660, 830); T.rotate(tilt); stroke([[-200, 0], [200, 0]], 12, { line: '#c9933a' });
      for (const s of [-1, 1]) { T.push(); T.translate(s * 190, 0); T.rotate(-tilt); stroke([[0, 0], [-60, 120]], 4); stroke([[0, 0], [60, 120]], 4); shape(ell(0, 124, 80, 16, 24), { fill: '#c9933a', lw: 5 }); shape(ell(0, 76, 44 + (s > 0 ? 2 : 0), 42, 30), { fill: '#D7263D', lw: 5 }); stroke([[0, 36], [8, 14]], 6, { line: '#5a3a1e' }); shape(ell(22, 20, 16, 7, 12), { fill: '#5f8f3a', lw: 3 }); T.pop(); }
      T.pop();
      etiket(K, 'a nice distinction', 680, 640, back(ramp(t, T9 + .3, T9 + .7)), { w: 520, fs: 44, col: '#D7263D' });
    }
    // Lügat büyüteçle kılı kırk yarar
    const mag = ter ? [520, 920] : [420, 860];
    lugat(X, Y, { kol: [null, mag], el: ['open', 'grab'], bak: 'right', kas: 'angry', agiz: ter ? 'smile' : 'flat', kapak: .45, lean: .06 });
    shape(ell(mag[0] + 50, mag[1] - 50, 52, 52, 30), { fill: '#d8f0f6', lw: 9, alpha: .85 }); stroke([[mag[0] + 14, mag[1] - 14], [mag[0], mag[1]]], 12, { line: '#5a3a1e' });
  } };
}

// 8 · 1700'ler bahçe: hoş, güzel
function bahce(K) {
  const { lugat, ramp, zip, back, wob, at, rect, ell, shape, stroke, T, W, H } = K;
  const T10 = at('s10'); K.olay(T10 + .2, 'whoosh'); K.olay(T10 + 1.2, 'pop'); K.olay(T10 + 2.4, 'yaylan');
  const arka = () => {
    gok(K, '#8fc6e0', '#c6e4ea', '#f4ecc6');
    K.shape(K.ell(840, 700, 100, 100, 40), { fill: '#f6c24a', lw: 4, line: INKL, boil: 0 });
    for (let i = 0; i < 6; i++) { const hx = -40 + i * 200; duz(K, ell(hx + 100, 1020, 120, 100, 30), i % 2 ? '#4f7f44' : '#5f8f3a', 3); }
    zemin(K, 1100, '#8fb85a', '#7fa84e', 190, 100);
    for (let i = 0; i < 9; i++) { const x = 60 + i * 120, y = 1200 + (i % 2) * 60; for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI * 2; duz(K, ell(x + Math.cos(a) * 16, y + Math.sin(a) * 16, 12, 12, 10), '#fbf6ea', 2); } duz(K, ell(x, y, 10, 10, 10), i % 2 ? '#D7263D' : '#f6c24a', 2); }
  };
  return { bas: 's10', iris: [540, 950], arka, ciz: (t) => {
    const X = 420, Y = 1160, egil = ramp(t, T10 + 2.2, T10 + 2.7) * (1 - ramp(t, T10 + 3.4, T10 + 3.9));
    for (let i = 0; i < 4; i++) { const bx = (150 + i * 220 + t * 70) % 1000 + 40, by = 640 + i * 40 + 12 * wob(t, .7, i), fl = 14 * wob(t, 3, i); stroke([[bx - 26, by - fl], [bx - 8, by - 4], [bx, by + 4], [bx + 8, by - 4], [bx + 26, by - fl]], 5); }
    lugat(X, Y, { el: ['wave', 'open'], reach: .5 + .1 * wob(t, 1.5), lean: -.22 * egil, bak: 'cam', kas: 'up', agiz: 'beam', kapak: .3 });
    const h = back(ramp(t, T10 + 1.2, T10 + 1.6)); if (h > .02) { T.push(); T.translate(720, 860 - 30 * ramp(t, T10 + 1.2, T10 + 4)); T.scale(h); kalp(K, 0, 0, 50); kalp(K, 90, -60, 26); T.pop(); }
    etiket(K, 'nice = hoş, güzel', 540, 640, back(ramp(t, T10 + .5, T10 + .9)), { w: 480, fs: 46, col: '#D7263D' });
    etiket(K, '1700\'ler', 200, 720, back(ramp(t, T10 + .1, T10 + .4)), { w: 230, fs: 40 });
  } };
}

// 9 · bugün: ders masası, kalp; "Nice!" yankısı
function bugun(K) {
  const { lugat, ramp, zip, back, wob, at, rect, ell, shape, stroke, T, W, H } = K;
  const T12 = at('s12'), T13 = at('s13');
  K.olay(T12 + .3, 'uzan'); K.olay(T12 + 2, 'pop'); K.olay(T13, 'yaylan'); K.olay(T13 + .3, 'pop');
  const arka = () => {
    const g = T.g; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#e8d6b8'; g.fillRect(0, 0, W, H);
    duz(K, rect(-20, 560, W + 40, 560), '#f0e2c6');
    duz(K, rect(660, 620, 330, 260), '#2a3f5f'); for (const [x, y] of [[720, 680], [820, 650], [900, 720], [760, 780], [940, 820]]) duz(K, ell(x, y, 5, 5, 8), '#fbf6ea', 1);
    stroke([[825, 620], [825, 880]], 10, { line: '#6a4228', boil: 0 });
    duz(K, rect(-20, 1100, W + 40, 50), '#8a5a3a'); duz(K, rect(-20, 1150, W + 40, H - 1130), '#b98a5a');
    for (let c = 0; c < 10; c++) stroke([[c * 120, 1160], [c * 120 - 60, H]], 3, { line: '#a0744a', boil: 0 });
    for (let i = 0; i < 4; i++) duz(K, rect(760 + i * 6, 1100 - 26 * (i + 1), 200 - i * 12, 24), ['#2f5d8a', '#D7263D', '#3c7a5a', '#e8b83a'][i], 3);
  };
  return { bas: 's12', iris: [500, 950], arka, ciz: (t) => {
    const X = 380, Y = 1150, son = t >= T13;
    // lamba
    stroke([[160, 1100], [180, 900], [120, 850]], 10, { line: '#1B1F33' }); shape([[60, 820], [150, 800], [170, 870], [90, 890]], { fill: '#e8b83a', lw: 5 });
    // sınav notları
    T.push(); T.translate(600, 1060); T.rotate(-.06); shape(rect(-90, -60, 180, 120), { fill: '#fbf6ea', lw: 5 }); T.text('SINAV', 0, -30, { font: '800 30px Merri', fill: '#D7263D' }); for (let i = 0; i < 3; i++) stroke([[-70, -2 + i * 20], [70, -2 + i * 20]], 3, { line: '#8a8a8a' }); T.pop();
    lugat(X, Y, { el: son ? ['wave', 'thumb'] : ['open', 'thumb'], reach: son ? .7 : .45, bak: 'cam', kas: 'up', agiz: son ? 'beam' : 'grin', sy: 1 + .08 * zip(t, T13) * (1 - ramp(t, T13 + .3, T13 + .6)) });
    const h = back(ramp(t, T12 + 2, T12 + 2.4)); if (h > .02) { T.push(); T.translate(700, 800 - 20 * wob(t, .6)); T.scale(h); kalp(K, 0, 0, 56); T.pop(); for (let i = 0; i < 2; i++) parilti(K, 640 + 140 * i, 700 + 40 * i, 26, t + i); }
    if (son) balon(K, 'Nice!', 690, 690, back(ramp(t, T13, T13 + .4)), { col: '#3c7a5a' });
  } };
}

// Actions'taki yazılım GPU'sunda (SwiftShader) bulanıklık filtreli suluboya çok yavaş: arka planlar düz guaj boyanır.
export default K => {
  K.wash = (pts, col, o = {}) => K.shape(pts, { fill: col, lw: o.lw ?? 3, line: o.line === false ? null : INKL, boil: 0 });
  return [meydan(K), roma(K), okul(K), fransa(K), gemi(K), yol(K), calisma(K), bahce(K), bugun(K)];
};
