// alcohol: beş çizgi film sahnesi (Lügat oynar). Tarif: sistem/sablonlar/canli-sozluk/SABLON.md
// 1 çarşı: Lügat göz sürmesi (al-kuḥl) çeker · 2 havan: sürmeyi döver, toz bulutu, hapşırık · 3 simyacı odası: imbik, damlayan öz
// 4 1600–1700'ler çalışma odası: üzüm → şişe, "alcohol" etiketi · 5 çarşıya dönüş: sürmeli göz kırpma (başı yankılar)

const SKY = ['#f2b766', '#f6d79a', '#f7e6c0'];

function carsiArka(K) {
  const { wash, ell, rect, spline, W, H } = K, g = K.T.g;
  const gr = g.createLinearGradient(0, 0, 0, 1150); gr.addColorStop(0, SKY[0]); gr.addColorStop(.55, SKY[1]); gr.addColorStop(1, SKY[2]);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  wash(ell(820, 640, 90, 90, 40), '#fbe7a8', { seed: 2, edge: .05, line: false });   // ikindi güneşi
  // uzak kubbeler ve minareler
  for (const [x, w, h] of [[150, 170, 120], [520, 230, 150], [930, 190, 110]]) {
    wash([[x - w / 2, 900], [x - w / 2, 860], ...spline([[x - w / 2, 860], [x - w * .45, 860 - h * .6], [x, 860 - h], [x + w * .45, 860 - h * .6], [x + w / 2, 860]], false, 8), [x + w / 2, 900]], '#d99a6a', { seed: x, edge: .08, lw: 2.4 });
  }
  for (const x of [330, 760]) wash(rect(x - 16, 640, 32, 260), '#c98a5c', { seed: x + 1, edge: .08, lw: 2.4 });
  wash(rect(-20, 880, W + 40, 300), '#e2b07c', { seed: 4, edge: .12, lw: 3 });   // çarşı duvarı
  for (let i = 0; i < 4; i++) {   // kemerler
    const x = 120 + i * 280;
    wash([[x - 95, 1180], [x - 95, 1010], ...spline([[x - 95, 1010], [x - 70, 950], [x, 925], [x + 70, 950], [x + 95, 1010]], false, 8), [x + 95, 1180]], '#7a4a32', { seed: 20 + i, edge: .2, lw: 3 });
  }
  // tezgâh tentesi (çizgili)
  for (let i = 0; i < 9; i++) wash([[560 + i * 60, 700], [620 + i * 60, 700], [630 + i * 60, 790], [570 + i * 60, 790]], i % 2 ? '#f4ead2' : '#c8453a', { seed: 40 + i, edge: .08, lw: 2.6 });
  wash(rect(600, 930, 470, 60), '#8a5a3a', { seed: 51, edge: .15 });   // tezgâh
  for (const [x, c] of [[640, '#2f5d8a'], [720, '#3c7a5a'], [800, '#2f5d8a'], [880, '#6b3f7a'], [960, '#3c7a5a'], [1030, '#2f5d8a']]) {   // sürme kavanozları
    wash([[x - 26, 930], [x - 26, 880], [x - 16, 866], [x + 16, 866], [x + 26, 880], [x + 26, 930]], c, { seed: x, edge: .12, lw: 3 });
    wash(rect(x - 12, 852, 24, 16), '#d8b45a', { seed: x + 3, edge: .1, lw: 2.4 });
  }
  // zemin taşları, çerçevenin altına kadar
  wash(rect(-20, 1170, W + 40, H - 1150), '#c9905e', { seed: 60, edge: .15 });
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) { const y = 1200 + r * 120, x = -40 + c * 170 + (r % 2) * 85; wash(rect(x, y, 160, 110), r % 2 ? '#d49c68' : '#bf8656', { seed: r * 9 + c, edge: .1, lw: 2 }); }
}

// sürme çizgisi: Lügat'ın gözlerinin etrafına (x, y = gövde alt ortası), p 0..1 ilerleme
function surme(K, x, y, p, k = 1) {
  if (p <= 0) return;
  const { stroke, arc } = K, ex = x - 4 * k, ey = y - (270 - 95) * k;
  for (const s of [-1, 1]) {
    const cx = ex + s * 34 * k;
    stroke(arc(cx, ey, 31 * k, 42 * k, Math.PI * 1.02, Math.PI * (1.02 + .96 * Math.min(1, p * 2)), 18), 10 * k, { line: '#0b0a09' });
    if (p > .5) stroke(arc(cx, ey, 31 * k, 42 * k, Math.PI * .08, Math.PI * (.08 + .84 * Math.min(1, (p - .5) * 2)), 14), 7 * k, { line: '#0b0a09' });
    if (p > .9) stroke([[cx + s * 30 * k, ey - 6 * k], [cx + s * 54 * k, ey - 30 * k]], 9 * k, { line: '#0b0a09' });
  }
}
function kavanoz(K, x, y, c = '#2f5d8a', acik = 0) {
  const { shape, rr, ell } = K;
  shape([[x - 30, y], [x - 30, y - 56], [x - 18, y - 72], [x + 18, y - 72], [x + 30, y - 56], [x + 30, y]], { fill: c, lw: 6 });
  shape(ell(x, y - 74, 20, 7, 18), { fill: '#141210', lw: 4 });   // siyah toz
  if (acik < 1) shape(rr(x - 22, y - 92 - 40 * acik, 44, 18, 6), { fill: '#d8b45a', lw: 5 });
}
function parilti(K, x, y, r, t) {
  const { shape } = K; const a = .6 + .4 * Math.sin(t * 9 + x);
  shape([[x, y - r * a], [x + r * .25, y - r * .25], [x + r * a, y], [x + r * .25, y + r * .25], [x, y + r * a], [x - r * .25, y + r * .25], [x - r * a, y], [x - r * .25, y - r * .25]], { fill: '#fff6c8', lw: 4 });
}

// 1 · çarşı
function carsi(K) {
  const { lugat, ramp, zip, wob, at, sonu } = K;
  const T1 = at('s01'), T2 = at('s02'), T4 = at('s04');
  K.olay(T1 + .3, 'uzan'); K.olay(T1 + 2.2, 'bakis'); K.olay(T4, 'yaylan'); K.olay(T4 + .5, 'tak');
  return { iris: [430, 980], arka: () => carsiArka(K), ciz: (t) => {
    const X = 420, Y = 1180;
    const p = ramp(t, T1 + .5, T1 + 2.1), sonra = t > T1 + 2.2;
    const goster = ramp(t, T4, T4 + .5);   // al-kuḥl: kavanozu kaldırır
    const ex = X - 4, ey = Y - 175;
    const fircaX = ex + 34 + 60 - 70 * Math.min(1, p * 1.2) + 18 * wob(t, 3) * (p > 0 && p < 1), fircaY = ey + 4;
    const sag = goster > 0 ? [X + 210, 820 - 80 * goster] : p < 1 ? [fircaX + 30, fircaY + 30] : [X + 200, Y - 120];
    const sol = [X - 175, Y - 120 - 30 * goster];
    lugat(X, Y, { kol: [sol, sag], el: ['grab', 'grab'], bak: sonra ? 'cam' : 'right', kas: sonra ? 'up' : 'flat', agiz: goster > .5 ? 'grin' : sonra ? 'beam' : 'o', kapak: sonra && !goster ? .28 : 0, sy: 1 + .05 * zip(t, T4) * (1 - ramp(t, T4 + .3, T4 + .6)) });
    surme(K, X, Y, p);
    kavanoz(K, sol[0] + 4, sol[1] + 6, '#2f5d8a', 1);
    if (goster <= 0 && p < 1) { K.stroke([[fircaX, fircaY], [fircaX + 60, fircaY + 40]], 8, { line: '#5a3a1e' }); }   // mil (sürme çubuğu)
    if (goster > 0) { kavanoz(K, sag[0], sag[1] + 10, '#6b3f7a', 0); for (let i = 0; i < 3; i++) parilti(K, sag[0] - 60 + i * 60, sag[1] - 120 - 20 * (i % 2), 26, t + i); }
    if (sonra && goster <= 0) parilti(K, X + 70, Y - 230, 30, t);
    // sallanan fener
    const a = .12 * wob(t, .5); K.T.push(); K.T.translate(980, 560); K.T.rotate(a);
    K.stroke([[0, 0], [0, 90]], 5); K.shape([[-30, 90], [30, 90], [40, 150], [0, 190], [-40, 150]], { fill: '#e8b83a', lw: 6 }); K.T.pop();
  } };
}

// 2 · havan
function havan(K) {
  const { lugat, ramp, zip, wob, at, wash, rect, ell, spline, shape, stroke, W, H } = K;
  const T5 = at('s05'), T6 = at('s06'), HAP = T6 + 1.3;
  for (let k = 0; k < 6; k++) K.olay(T5 + .4 + k * .55, 'tak');
  K.olay(HAP - .4, 'egil'); K.olay(HAP, 'carp'); K.olay(HAP + .6, 'bakis');
  const arka = () => {
    const g = K.T.g; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#e7c99a'; g.fillRect(0, 0, W, H);
    wash(rect(-20, 560, W + 40, 620), '#d9b07a', { seed: 3, edge: .1, lw: 2.6 });
    for (let i = 0; i < 3; i++) { const x = 180 + i * 360; wash([[x - 120, 1180], [x - 120, 760], ...spline([[x - 120, 760], [x - 80, 680], [x, 650], [x + 80, 680], [x + 120, 760]], false, 8), [x + 120, 1180]], '#efe0bf', { seed: 10 + i, edge: .1, lw: 2.6 }); }
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) wash(rect(-30 + c * 190 + (r % 2) * 95, 640 + r * 26, 4, 4), '#b9895a', { seed: r * 7 + c, edge: 0, line: false });
    wash(rect(40, 820, 260, 20), '#7a4a2a', { seed: 30, edge: .15 });   // raf
    for (const [x, c] of [[80, '#2f5d8a'], [150, '#3c7a5a'], [220, '#6b3f7a'], [270, '#2f5d8a']]) wash([[x - 20, 820], [x - 20, 780], [x + 20, 780], [x + 20, 820]], c, { seed: x, edge: .12, lw: 2.6 });
    wash(rect(-20, 1160, W + 40, H - 1140), '#a8704a', { seed: 40, edge: .15 });
    for (let c = 0; c < 8; c++) wash(rect(-20 + c * 150, 1180, 140, 90), c % 2 ? '#b77d52' : '#9c6640', { seed: 50 + c, edge: .1, lw: 2 });
    for (let r = 1; r < 6; r++) for (let c = 0; c < 8; c++) wash(rect(-95 + c * 150 + (r % 2) * 75, 1180 + r * 100, 140, 90), (r + c) % 2 ? '#b77d52' : '#9c6640', { seed: r * 13 + c, edge: .1, lw: 2 });
  };
  return { bas: 's05', iris: [640, 1000], arka, ciz: (t) => {
    const X = 380, Y = 1180, MX = 700, MY = 1170;
    const vur = t < T6 ? Math.abs(Math.sin((t - T5 - .4) * Math.PI / .55)) : .3 * Math.abs(Math.sin((t - T6) * 3));
    const pY = MY - 220 - 150 * vur * (t > T5 + .4);
    const egil = ramp(t, HAP - .5, HAP - .1) * (1 - zip(t, HAP)), hap = zip(t, HAP) * (1 - ramp(t, HAP + .5, HAP + 1.2));
    // havan (pirinç)
    shape([[MX - 120, MY - 190], [MX + 120, MY - 190], [MX + 95, MY - 30], [MX + 110, MY], [MX - 110, MY], [MX - 95, MY - 30]], { fill: '#c9933a', lw: 7, shade: () => K.T.fillOnly(rect(MX - 130, MY - 170, 260, 18), '#e8b83a', { boil: 0 }) });
    shape(ell(MX, MY - 190, 120, 26, 30), { fill: '#3a2a1a', lw: 6 });
    // tokmak
    shape([[MX - 22, pY], [MX + 22, pY], [MX + 26, pY + 170], [MX - 26, pY + 170]], { fill: '#a86b2a', lw: 6 });
    lugat(X, Y, { kol: [[MX - 30, pY + 40], [MX + 30, pY + 70]], el: ['fist', 'fist'], lean: .08 - .25 * egil + .18 * hap, bak: hap > .1 ? 'cam' : 'right', kas: hap > .1 ? 'sad' : 'angry', agiz: hap > .1 ? 'o' : egil > .2 ? 'wavy' : 'flat', kapak: egil > .3 ? .7 : 0, sx: 1 - .1 * hap, sy: 1 + .12 * hap - .06 * egil });
    // vuruş tozu
    if (t > T5 + .4 && t < T6 && vur < .15) for (const d of [-70, 0, 70]) shape(ell(MX + d, MY - 225, 26, 14, 14), { fill: '#3b3a37', lw: 3, alpha: .7 });
    // s06: ince toz bulutu yükselir; hapşırıkla Lügat'a çarpar
    const bul = ramp(t, T6, T6 + 1.2);
    if (bul > 0) {
      const sp = hap > 0 ? 1 : 0;
      for (let i = 0; i < 14; i++) {
        const a = i * 2.4, r = (40 + i * 9) * bul, bx = MX + Math.cos(a) * r - sp * 260 * ramp(t, HAP, HAP + .4) * (i % 3) / 2, by = MY - 260 - i * 18 * bul + Math.sin(t * 2 + i) * 6;
        shape(ell(bx, by, 30 + (i % 4) * 8, 24 + (i % 3) * 6, 16), { fill: i % 2 ? '#55524d' : '#6f6b64', lw: 3, alpha: .75 * (1 - .5 * ramp(t, HAP + .8, HAP + 2)) });
      }
    }
    if (hap > .2) K.T.text('HAPŞU!', X + 60, 700, { font: '800 64px Merri', fill: '#fbf3e4', outlineW: 10, outlineCol: '#1B1F33', rot: -.12 });
  } };
}

// 3 · simyacı odası: imbik
function simya(K) {
  const { lugat, ramp, zip, wob, at, wash, rect, ell, spline, quad, shape, stroke, W, H } = K;
  const T7 = at('s07'), T8 = at('s08');
  for (let k = 0; k < 7; k++) K.olay(T7 + .8 + k * .6, 'tak');
  K.olay(T8, 'yaylan'); K.olay(T8 + .3, 'whoosh');
  const arka = () => {
    const g = K.T.g; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#3a2f55'; g.fillRect(0, 0, W, H);
    wash(rect(-20, 560, W + 40, 640), '#4b3d6b', { seed: 3, edge: .2, lw: 2.6 });
    for (const y of [700, 860]) wash(rect(-20, y, 330, 18), '#6a4a2a', { seed: y, edge: .15 });
    for (const [x, y, c] of [[40, 700, '#5aa36a'], [110, 700, '#c8453a'], [190, 700, '#e8b83a'], [260, 700, '#5a8ac8'], [60, 860, '#e8b83a'], [150, 860, '#5aa36a'], [240, 860, '#c8453a']]) {
      wash([[x - 22, y], [x - 26, y - 34], [x - 8, y - 50], [x - 8, y - 78], [x + 8, y - 78], [x + 8, y - 50], [x + 26, y - 34], [x + 22, y]], c, { seed: x + y, edge: .12, lw: 2.6 });
    }
    wash(ell(860, 720, 110, 150, 40), '#2a2342', { seed: 9, edge: .15, lw: 3 });   // pencere (gece)
    for (const [x, y] of [[830, 660], [890, 700], [850, 780]]) wash(ell(x, y, 6, 6, 10), '#f6e7b0', { seed: x, edge: 0, line: false });
    wash(rect(-20, 1150, W + 40, 60), '#6a4a2a', { seed: 20, edge: .2 });   // masa
    wash(rect(-20, 1200, W + 40, H - 1180), '#2b2240', { seed: 21, edge: .2 });
    for (let c = 0; c < 8; c++) wash(rect(-20 + c * 150, 1230, 140, 80), '#352a4f', { seed: 30 + c, edge: .1, lw: 2 });
  };
  return { bas: 's07', iris: [700, 950], arka, ciz: (t) => {
    const X = 260, Y = 1170;
    // mangal + alev
    shape(rect(560, 1050, 160, 100), { fill: '#3b3a37', lw: 6 });
    const f = wob(t, 2.2) * 10;
    shape(spline([[580, 1050], [600, 990 + f], [625, 1020], [640, 960 - f], [660, 1015], [680, 985 + f], [700, 1050]], true, 6), { fill: '#f08a2a', lw: 5 });
    shape(spline([[605, 1050], [625, 1010 - f], [640, 1030], [655, 1000 + f], [675, 1050]], true, 6), { fill: '#f6d36a', lw: 3 });
    // imbik: balon + boyun + uzun lüle
    shape(ell(640, 960, 85, 75, 36), { fill: '#9fd6c8', lw: 6, shade: () => K.T.fillOnly(rect(540, 975, 200, 70), '#6fb39f', { boil: 0 }) });
    shape([[620, 892], [660, 892], [670, 820], [630, 800], [610, 820]], { fill: '#9fd6c8', lw: 6 });
    stroke(quad([665, 815], [800, 790], [880, 900]), 16, { line: '#1B1F33' });
    stroke(quad([665, 815], [800, 790], [880, 900]), 9, { line: '#9fd6c8' });
    // kabarcıklar
    for (let i = 0; i < 5; i++) { const ph = (t * 1.3 + i * .2) % 1; shape(ell(600 + i * 20, 1010 - ph * 90, 7, 7, 10), { fill: '#e8f6ff', lw: 3, alpha: 1 - ph }); }
    // damlalar: lüle ucundan alıcı şişeye
    const RX = 900, RY = 1150, dolu = ramp(t, T7 + .8, T8 + .5);
    const kaldir = ramp(t, T8, T8 + .6);
    const rx = RX - 520 * kaldir * 0 , ry = RY - 260 * kaldir;
    for (let i = 0; i < 3; i++) { const ph = (t * 1.6 + i / 3) % 1; if (kaldir < .1) shape(spline([[880, 905 + ph * 120], [888, 925 + ph * 120], [880, 935 + ph * 120], [872, 925 + ph * 120]], true, 5), { fill: '#f6e7b0', lw: 3 }); }
    // alıcı şişe (öz parlar)
    shape([[rx - 70, ry], [rx - 70, ry - 90], [rx - 20, ry - 130], [rx - 20, ry - 190], [rx + 20, ry - 190], [rx + 20, ry - 130], [rx + 70, ry - 90], [rx + 70, ry]], { fill: '#d8eef0', lw: 6, shade: () => K.T.fillOnly(rect(rx - 75, ry - 20 - 90 * dolu, 150, 120), '#f6e07a', { boil: 0 }) });
    if (dolu > .5) for (let i = 0; i < 3; i++) parilti(K, rx - 60 + i * 60, ry - 220 - 30 * (i % 2) - 40 * kaldir, 22 + 10 * kaldir, t + i);
    // Lügat: önce kitaptan okur gibi izler, s08'de öze sevinir
    const sev = kaldir > .3;
    lugat(X, Y, { reach: sev ? 1 : .15, el: sev ? ['wave', 'wave'] : ['open', 'open'], lean: -.04 + .06 * wob(t, .4), bak: sev ? 'cam' : 'right', kas: sev ? 'up' : 'flat', agiz: sev ? 'beam' : 'o', sy: 1 + .08 * zip(t, T8) * (1 - ramp(t, T8 + .3, T8 + .6)) });
  } };
}

// 4 · 1600–1700'ler: şarabın özü → bugünkü "alcohol"
function calisma(K) {
  const { lugat, ramp, zip, back, wob, at, wash, rect, ell, spline, shape, stroke, W, H } = K;
  const T9 = at('s09'), T10 = at('s10');
  K.olay(T9 + .2, 'uzan'); K.olay(T9 + 1.6, 'whoosh'); K.olay(T10 + .2, 'pop'); K.olay(T10 + .4, 'tak');
  const arka = () => {
    const g = K.T.g; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#cfe0d6'; g.fillRect(0, 0, W, H);
    wash(rect(-20, 560, W + 40, 640), '#b9d0c4', { seed: 2, edge: .1, lw: 2.6 });
    wash(rect(640, 600, 340, 380), '#8fc3dc', { seed: 3, edge: .1, lw: 3 });   // gündüz penceresi
    stroke([[810, 600], [810, 980]], 10, { line: '#6a4a2a' }); stroke([[640, 790], [980, 790]], 10, { line: '#6a4a2a' });
    wash(ell(720, 680, 50, 20, 20), '#fbf6ea', { seed: 5, edge: .05, line: false });
    for (let i = 0; i < 5; i++) wash(rect(60 + i * 60, 640 + (i % 2) * 10, 46, 170 - (i % 2) * 10), ['#8a3a2a', '#2f5d8a', '#3c7a5a', '#a8703a', '#6b3f7a'][i], { seed: 10 + i, edge: .12, lw: 2.6 });   // kitaplar
    wash(rect(40, 810, 330, 18), '#6a4a2a', { seed: 20, edge: .15 });
    wash(rect(-20, 1140, W + 40, 60), '#8a5a3a', { seed: 21, edge: .2 });   // masa
    wash(rect(-20, 1190, W + 40, H - 1170), '#a77b52', { seed: 22, edge: .15 });
    for (let c = 0; c < 10; c++) stroke([[c * 120, 1200], [c * 120 - 60, H]], 3, { line: '#8a6040' });
  };
  return { bas: 's09', iris: [620, 950], arka, ciz: (t) => {
    const X = 330, Y = 1150;
    // üzüm salkımı (masada)
    const gx = 760, gy = 1000;
    stroke([[gx, gy - 46], [gx + 10, gy - 70]], 6, { line: '#5a3a1e' });
    for (const [dx, dy] of [[0, 0], [-22, -2], [22, -2], [-11, 22], [11, 22], [0, 44], [-30, 20], [30, 20], [0, -24]]) shape(ell(gx + dx, gy + dy, 16, 16, 16), { fill: '#6b3f7a', lw: 4 });
    // ok: üzüm → şişe
    const ok = ramp(t, T9 + 1.2, T9 + 1.8);
    if (ok > 0) { stroke([[gx + 50, gy + 10], [gx + 50 + 90 * ok, gy + 10]], 8, { line: '#1B1F33' }); if (ok > .9) shape([[gx + 140, gy - 6], [gx + 165, gy + 10], [gx + 140, gy + 26]], { fill: '#1B1F33', lw: 3 }); }
    // şişe (öz) — Lügat s10'da kaldırır
    const kal = ramp(t, T10, T10 + .5), bx = 960 - 380 * kal, by = 1140 - 300 * kal;
    shape([[bx - 40, by], [bx - 40, by - 110], [bx - 14, by - 140], [bx - 14, by - 180], [bx + 14, by - 180], [bx + 14, by - 140], [bx + 40, by - 110], [bx + 40, by]], { fill: '#e8f3f1', lw: 6, shade: () => K.T.fillOnly(rect(bx - 45, by - 70, 90, 80), '#f6e07a', { boil: 0 }) });
    shape(rect(bx - 12, by - 200, 24, 22), { fill: '#a86b2a', lw: 4 });
    // etiket "alcohol" (s10)
    const et = back(ramp(t, T10 + .2, T10 + .6));
    if (et > .02) { K.T.push(); K.T.translate(bx, by - 60); K.T.scale(et); K.T.rotate(-.05); shape(K.rr(-88, -26, 176, 52, 8), { fill: '#fbf6ea', lw: 5 }); K.T.text('alcohol', 0, 2, { font: '800 34px Merri', fill: '#D7263D' }); K.T.pop(); }
    if (kal > .5) for (let i = 0; i < 3; i++) parilti(K, bx - 70 + i * 70, by - 240 - 20 * (i % 2), 22, t + i);
    const uzan = ramp(t, T9 + .2, T9 + .9) * (1 - ramp(t, T9 + 1.4, T9 + 1.8));
    lugat(X, Y, { kol: kal > 0 ? [[bx - 46, by - 40], [bx + 46, by - 50]] : [null, null], reach: kal > 0 ? 0 : .35 * uzan, el: kal > 0 ? ['grab', 'grab'] : ['point', 'open'], bak: kal > .3 ? 'cam' : 'right', kas: kal > .3 ? 'up' : 'flat', agiz: kal > .3 ? 'grin' : 'o', lean: .1 * uzan });
  } };
}

// 5 · çarşıya dönüş: göz kalemi (kohl) + şişe, göz kırpma
function donus(K) {
  const { lugat, ramp, zip, wob, at, shape, rr, stroke } = K;
  const T11 = at('s11'), T12 = at('s11') + 3, T13 = at('s13');
  K.olay(T11 + .3, 'uzan'); K.olay(T12 + .4, 'bakis'); K.olay(T13, 'yaylan');
  return { bas: 's11', iris: [430, 980], arka: () => carsiArka(K), ciz: (t) => {
    const X = 430, Y = 1180;
    const kalem = ramp(t, T11 + .2, T11 + .8);
    const kirp = t > T12 + .4 && t < T12 + 1.3;
    const el = t > T13 ? ['wave', 'grab'] : ['grab', 'grab'];
    const sol = t > T13 ? [X - 200, 760 + 20 * wob(t, 2)] : [X - 190, 940 - 120 * kalem], sag = [X + 200, 900];
    lugat(X, Y, { kol: [sol, sag], el, bak: 'cam', kas: 'up', agiz: kirp ? 'grin' : 'beam', kapak: kirp ? .45 : 0 });
    surme(K, X, Y, 1);
    if (kirp) stroke([[X + 4, Y - 180], [X + 60, Y - 172]], 9, { line: '#0b0a09' });   // kırpılan göz
    if (t <= T13) { K.T.push(); K.T.translate(sol[0], sol[1] - 20); K.T.rotate(-.5); shape(rr(-10, -110, 20, 110, 6), { fill: '#1B1F33', lw: 5 }); shape([[-10, -110], [10, -110], [0, -140]], { fill: '#0b0a09', lw: 4 }); K.T.pop(); }   // göz kalemi
    shape([[sag[0] - 34, sag[1] + 70], [sag[0] - 34, sag[1] - 20], [sag[0] - 12, sag[1] - 46], [sag[0] - 12, sag[1] - 80], [sag[0] + 12, sag[1] - 80], [sag[0] + 12, sag[1] - 46], [sag[0] + 34, sag[1] - 20], [sag[0] + 34, sag[1] + 70]], { fill: '#e8f3f1', lw: 6, shade: () => K.T.fillOnly(K.rect(sag[0] - 40, sag[1] + 10, 80, 70), '#f6e07a', { boil: 0 }) });
    for (let i = 0; i < 2; i++) parilti(K, X - 60 + 160 * i, 700 + 30 * i, 28, t + i);
  } };
}

export default K => [carsi(K), havan(K), simya(K), calisma(K), donus(K)];
