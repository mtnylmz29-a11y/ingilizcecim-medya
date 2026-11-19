// ---------- scenes ----------
function sHook(t, t0) { // 1: dusk road, the old pilgrim holds his last loaf, a tired traveller arrives
  const u = t - t0; CAM = { x: 540, y: lerp(1170, 1190, u / 4), z: lerp(1.06, 1.12, eio(seg(u, 0, 4))) }; cam();
  reveal(eo(seg(u, 0, .7)), 'x', () => landscape({ sky0: K.peach, sky1: K.lav, sun: [800, 820], trees: [[930, 1150, .8], [120, 1120, .6]] }));
  milestone(250, 1370, .9);
  const p = eo(seg(u, .15, .8));
  if (p > 0) { X.globalAlpha = p;
    traveller(330, 1520, 1.12, { col: K.brown, dark: K.brownD, hood: true, beard: '#d8d0c4', staff: true, bag: true, arm: ss(seg(u, 1.9, 2.5)) * .85, look: 1, blink: blink(u), brow: lerp(0, .6, seg(u, 2, 2.4)), hold: () => loaf(40, 10, .45, 1) , seed: 401 });
    X.globalAlpha = 1; }
  const wx = lerp(1150, 760, eo(seg(u, .3, 2.0)));
  traveller(wx, 1530, 1.1, { col: K.green, dark: K.sageD, hood: false, hair: '#4a3324', braid: true, flip: true, walk: u < 2.0 ? u * 7 : null, look: -1, brow: lerp(1, -.4, seg(u, 2.2, 2.6)), blink: blink(u, 1), mouth: 0, seed: 451 });
  note(t, t0 + 1.0, 'son ekmek…', 330, 960, 60, 385, 1150, { seed: 911 });
}
function sTitle(t, t0) { // 2: the word, flanked by the two travellers, the loaf between them
  const u = t - t0; CAM = { x: 540, y: 960, z: lerp(1, 1.04, u / 5) }; cam();
  withSeed(120, () => { band(60, 520, 1020, 1000, K.sky, .35, { wv: 14 }); band(60, 1240, 1020, 1330, K.crumb, .5, { wv: 10 }); });
  const sz = fitSize('Companion', 190, 820);
  X.save(); X.font = `${sz}px ${SERIF}`; X.textAlign = 'center'; X.textBaseline = 'middle';
  const pw = eio(seg(u, .05, 1.0)); X.beginPath(); X.rect(0, 500, 140 + 840 * pw, 360); X.clip();
  X.fillStyle = rgba(K.ink, .9); X.fillText('Companion', 480, 700); X.restore();
  withSeed(121, () => br(qcurve(120, 820, 840, 812, -10, 16), 16, K.ver, { prof: 'brush', nb: 5, a: .85 }, eio(seg(u, .8, 1.4))));
  note(t, t0 + 1.2, '= yoldaş, arkadaş', 480, 920, 64);
  loaf(480, 1250, .75, eo(seg(u, 1.6, 2.6)));
  traveller(170, 1330, .55, { col: K.brown, dark: K.brownD, hood: true, beard: '#d8d0c4', look: 1, blink: blink(u), seed: 401 });
  traveller(800, 1330, .55, { col: K.green, dark: K.sageD, hair: '#4a3324', braid: true, flip: true, look: -1, blink: blink(u, 1.5), seed: 451 });
}
function scriptorium() {
  withSeed(140, () => {
    band(-60, -60, W + 60, 1300, K.peach, .45, { wv: 6 }); band(-60, 1300, W + 60, 2000, K.ochreD, .45);
    // arched window
    const wpts = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; wpts.push([700 + Math.cos(a) * 150, 560 + Math.sin(a) * 150]); } wpts.push([850, 1000], [550, 1000]);
    wash(wpts, K.sky, .7, 3); wblob(740, 640, 70, 40, '#ffffff', .25); edge(wpts.concat([wpts[0]]), K.ochreD, 6, .6);
    edge([[700, 410], [700, 1000]], K.ochreD, 5, .5); edge([[550, 760], [850, 760]], K.ochreD, 5, .5);
    // shelf with codices
    band(80, 640, 420, 664, K.brownD, .7, { wv: 3 });
    const bc = [K.wine, K.blueD, K.moss, K.ochreD, K.plum]; for (let i = 0; i < 6; i++) band(96 + i * 52, 520 + (i % 2) * 14, 136 + i * 52, 640, bc[i % 5], .7, { wv: 2, j: 2 });
  });
}
function scribe(x, y, s, o = {}) { // seated scribe behind the desk, writing hand animates
  X.save(); X.translate(x, y); X.scale(s, s);
  withSeed(820, () => {
    wash([[-110, -300], [110, -300], [150, 0], [-150, 0]], K.brown, .75, 4); wash([[20, -300], [110, -300], [150, 0], [50, 0]], K.brownD, .3, 3);
    wash(blob(0, -360, 66, 70, 26, .05), K.brownD, .7, 3); wash(blob(4, -352, 46, 48, 24, .05), K.skin, .85, 2);
    wash([[-44, -380], [46, -380], [40, -404], [-40, -404]], K.brownD, .5, 2);
  });
  face(4, -352, 46, { mouth: o.mouth, blink: o.blink, look: .6, brow: o.brow || 0, fs: 830 });
  const wr = Math.sin(T * 10) * 8 * (o.write ? 1 : 0);
  withSeed(840, () => { br([[60, -260], [140, -150], [200 + wr, -110]], 30, K.brown, { prof: 'even', nb: 4, a: .85 }); wblob(204 + wr, -108, 16, 14, K.skin, .9);
    br(qcurve(200 + wr, -110, 250 + wr, -210, 10, 6), 6, K.ink2, { prof: 'tip', nb: 2, a: .9 }); br(qcurve(250 + wr, -210, 290 + wr, -250, -10, 5), 14, '#efe6d4', { prof: 'leaf', nb: 3, a: .8 }); });
  X.restore();
}
function desk(p = 1) { withSeed(150, () => { wash([[80, 1300], [1000, 1300], [1040, 1380], [40, 1380]], K.brownD, .8, 3); wash([[90, 1380], [130, 1380], [130, 1700], [90, 1700]], K.brownD, .7, 2); wash([[950, 1380], [990, 1380], [990, 1700], [950, 1700]], K.brownD, .7, 2);
  wash([[420, 1250], [800, 1240], [820, 1310], [400, 1316]], '#f6eedc', .9, 2); edge([[420, 1250], [800, 1240]], K.ochreD, 2.5, .5);
  // candle
  wash([[170, 1300], [210, 1300], [210, 1180], [170, 1180]], '#efe2c4', .9, 2); const fl = Math.sin(T * 11) * 4; wblob(190 + fl * .3, 1150, 14, 28, K.fireL, .85); wblob(190, 1160, 60, 60, K.fireL, .14);
}); }
function sLatin(t, t0) { // 3: Late Latin — a scribe at work
  const u = t - t0; CAM = { x: 540, y: 1000, z: lerp(1.14, 1.0, eio(seg(u, 0, 2.6))) }; cam();
  scriptorium(); scribe(400, 1310, 1.0, { write: true, blink: blink(u), mouth: 0 }); desk();
  X.globalAlpha = 1; htext('GEÇ LATİNCE', 480, 380, 76, K.ink, { italic: false, p: eio(seg(u, .3, 1.1)) });
}
function sCom(t, t0) { // 4: "com-" = together: two hands meet over the parchment
  const u = t - t0; CAM = { x: 540, y: 960, z: lerp(1.0, 1.05, u / 3) }; cam();
  withSeed(160, () => { wash([[90, 470], [990, 450], [1000, 1360], [80, 1380]], '#f6eedc', .85, 4); edge(qcurve(90, 470, 990, 450, -6, 10), K.ochreD, 3, .45); });
  htext('com-', 480, 680, 190, K.ver, { italic: false, p: eio(seg(u, .05, .8)) });
  note(t, t0 + .7, 'birlikte', 480, 860, 74);
  const m = eio(seg(u, .9, 1.9)), hx = lerp(150, 430, m), hx2 = lerp(830, 530, m);
  withSeed(170, () => { br(qcurve(-120, 1260, hx, 1130, -30, 10), 44, K.brown, { prof: 'even', nb: 5, a: .85 }); br(qcurve(1200, 1270, hx2, 1130, 30, 10), 44, K.green, { prof: 'even', nb: 5, a: .85 }); });
  withSeed(171, () => { wblob(hx + 26, 1126, 34, 28, K.skin, .9); wblob(hx2 - 26, 1126, 34, 28, K.skin, .9); });
  if (m >= 1) for (let i = 0; i < 5; i++) { const a = back(seg(u, 1.9 + i * .07, 2.2 + i * .07)); if (a > 0) withSeed(180 + i, () => br(qcurve(480 + Math.cos(-1.6 + i * .8) * 90, 1110 + Math.sin(-1.6 + i * .8) * 90, 480 + Math.cos(-1.6 + i * .8) * (90 + 50 * a), 1110 + Math.sin(-1.6 + i * .8) * (90 + 50 * a), 0, 4), 6, K.ochre, { prof: 'tip', nb: 0, a: .8 })); }
}
function sPanis(t, t0) { // 5: specimen plate — panis = bread
  const u = t - t0; CAM = { x: 520, y: lerp(1000, 960, eio(seg(u, 0, 2))), z: lerp(1.0, 1.08, eio(seg(u, 0, 2.5))) }; cam();
  withSeed(190, () => band(80, 760, 1000, 1330, K.crumb, .3, { wv: 16 }));
  wheat(170, 1300, 1.25, -.2); wheat(240, 1310, 1.1, .05); wheat(830, 1310, 1.2, .18);
  loaf(500, 1210, 1.35, eo(seg(u, .05, 1.4)));
  note(t, t0 + .9, 'panis', 320, 620, 140, 430, 1050, { italic: false, col: K.ver, seed: 912, ly: 70 });
  note(t, t0 + 1.4, '= ekmek', 640, 800, 72);
}
function sMerge(t, t0) { // 6: com + panis = companio — the loaf breaks, a half for each
  const u = t - t0, h = KAPAK ? 1 : eio(seg(u, 1.4, 2.4));
  CAM = { x: 540, y: 1180, z: lerp(1.0, 1.04, u / 4) }; cam();
  withSeed(200, () => { band(-60, 880, W + 60, 1380, K.peach, .35, { wv: 18 }); band(-60, 1380, W + 60, 2000, K.crumb, .45); });
  if (!KAPAK) { htext('com + panis', 480, 560, 80, K.ink, { italic: false, p: eio(seg(u, 0, .5)) });
  htext('= companio', 480, 680, 104, K.ver, { italic: false, p: eio(seg(u, .5, 1.1)) }); }
  traveller(170, 1560, .92, { col: K.brown, dark: K.brownD, hood: true, beard: '#d8d0c4', look: 1, arm: .75 * h, blink: blink(u), brow: -.4, smile: 1.5, seed: 401 });
  traveller(800, 1560, .92, { col: K.green, dark: K.sageD, hair: '#4a3324', braid: true, flip: true, look: -1, arm: .75 * h, blink: blink(u, 1), brow: -.4, smile: 1.5, seed: 451 });
  if (h <= 0) loaf(485, 1210, .95, 1);
  else { halfLoaf(485 - 40 - 150 * h, 1210 - 30 * h, .9, -1, -.15 * h); halfLoaf(485 + 40 + 150 * h, 1210 - 30 * h, .9, 1, .15 * h);
    for (let i = 0; i < 7; i++) { const q = seg(u, 1.45, 2.3); if (q > 0 && q < 1) withSeed(210 + i, () => wblob(485 + rnd(-40, 40), 1120 + q * 220 + rnd(-30, 30), 6, 5, K.crumb, .9 * (1 - q))); } }
  if (!KAPAK) note(t, t0 + 2.2, 'ekmeğini paylaştığın kişi', 480, 860, 60);
}
function sAsk(t, t0) { // 7: the breath — washed back to paper, a painted question mark
  const u = t - t0; CAM = { x: 540, y: 960, z: lerp(1.0, 1.1, eio(seg(u, 0, 2))) }; cam();
  const p = eio(seg(u, .1, 1.0));
  withSeed(230, () => { br(qcurve(380, 640, 600, 560, -120, 16), 36, K.blueD, { prof: 'brush', nb: 6, a: .85 }, p * 1.6);
    br(qcurve(600, 560, 500, 880, -90, 14), 34, K.blueD, { prof: 'tip', nb: 6, a: .85 }, p * 1.6 - .6); });
  if (p > .8) withSeed(231, () => wblob(498, 1010, 30, 30, K.blueD, .8 * seg(p, .8, 1)));
  halfLoaf(300, 1300, .5, -1, -.2); halfLoaf(700, 1300, .5, 1, .2);
}
function sGoth(t, t0) { // 8: legend — two Goths share bread by a fire
  const u = t - t0; CAM = { x: 540, y: 1170, z: lerp(1.08, 1.0, eio(seg(u, 0, 3))) }; cam();
  withSeed(240, () => { vgrad(-100, 1200, K.night, K.blueD, .7, 5); for (let i = 0; i < 40; i++) wblob(rnd(30, 1050), rnd(80, 900), 3, 3, '#f6eedc', .7);
    wash([[-80, 1150], [300, 1060], [700, 1120], [1160, 1050], [1160, 2050], [-80, 2050]], '#2a3348', .75, 8);
    for (let i = 0; i < 5; i++) wblob(80 + i * 230, 1080 - (i % 2) * 50, 90, 140, '#1e2638', .7, { n: 20 }); });
  const fl = t * 9;
  withSeed(250, () => { wblob(540, 1420, 300, 180, K.fire, .16); wblob(540, 1430, 180, 100, K.fireL, .14);
    for (let i = 0; i < 4; i++) br(qcurve(470 + i * 46, 1460, 480 + i * 46, 1460, 0, 2), 24, K.brownD, { prof: 'even', nb: 3, a: .9 });
    for (let i = 0; i < 6; i++) { const fx = 490 + i * 20, hh = 120 + Math.sin(fl + i * 1.7) * 30 + (i % 2) * 40; br(qcurve(fx, 1450, fx + Math.sin(fl * .7 + i) * 20, 1450 - hh, 10, 8), 26 - i, i % 2 ? K.fireL : K.fire, { prof: 'leaf', nb: 3, a: .8 }); } });
  traveller(240, 1560, .9, { col: '#4b5a3a', dark: '#2d3524', hood: true, beard: '#b47a42', look: 1, arm: .6 + .1 * Math.sin(u * 2), blink: blink(u), seed: 481, hold: () => halfLoaf(30, 20, .32, 1) });
  traveller(840, 1560, .9, { col: '#6a3f3a', dark: '#40241f', hood: true, beard: '#8a5a2b', flip: true, look: -1, arm: .6, blink: blink(u, 1.2), seed: 491 });
  X.save(); withSeed(260, () => wblob(540, 1420, 420, 260, K.fireL, .06)); X.restore();
  stamp(t, t0 + .2, 480, 560, 'RİVAYETE GÖRE', 62);
  note(t, t0 + 1.2, 'Gotça gahlaiba', 480, 760, 74, null, null, { col: '#f6eedc', halo: 0 });
  note(t, t0 + 1.8, '“ekmek arkadaşı”', 480, 870, 62, null, null, { col: K.fireL, halo: 0 });
}
// ---- map ----
const MP = (lon, lat) => [80 + (lon + 6) * 36, 560 + (58 - lat) * 44];
const GB = [[-5.7, 50.0], [-3, 50.6], [1.4, 51.2], [1.7, 52.7], [0.2, 53.5], [-0.2, 54.5], [-1.6, 55.6], [-2, 57.6], [-3.1, 58.6], [-5, 58.6], [-6.2, 57.5], [-5.6, 56.3], [-4.9, 55.0], [-3.2, 54.9], [-3.3, 53.4], [-4.6, 53.3], [-4.2, 52.3], [-5.2, 51.7], [-3.3, 51.4], [-4.2, 51.2]];
const FR = [[1.6, 50.9], [2.5, 51.1], [4.2, 49.9], [6.2, 49.5], [8.2, 49.0], [7.6, 47.6], [6.9, 46.4], [7.0, 45.3], [7.6, 44.1], [7.5, 43.8], [6.2, 43.1], [4.6, 43.4], [3.1, 43.1], [3.0, 42.5], [1.4, 42.6], [-0.2, 42.8], [-1.8, 43.4], [-1.2, 44.7], [-1.2, 46.2], [-2.2, 47.1], [-4.7, 47.9], [-4.6, 48.6], [-3.0, 48.8], [-1.6, 48.7], [-1.4, 49.7], [0.2, 49.5]];
const IT = [[7.6, 43.8], [7.0, 44.2], [7.0, 45.3], [7.0, 45.9], [8.5, 46.5], [10.2, 46.6], [12.2, 47.1], [13.7, 46.5], [13.7, 45.6], [12.4, 45.4], [12.3, 44.2], [13.6, 43.5], [14.7, 42.1], [16.2, 41.9], [15.9, 41.5], [18.5, 40.2], [18.0, 39.9], [16.5, 39.8], [17.1, 39.0], [16.1, 38.0], [15.6, 38.0], [15.8, 39.5], [15.0, 40.2], [14.0, 40.8], [12.4, 41.7], [11.1, 42.5], [10.1, 43.9], [8.8, 44.4]];
const IB = [[-1.8, 43.4], [-0.2, 42.8], [1.4, 42.6], [3.2, 42.0], [0.9, 41.0], [0.1, 39.9], [-0.3, 38.5], [-2, 36.8], [-5.6, 36.0], [-6.5, 37.0], [-8.9, 37.0], [-8.8, 38.7], [-9.5, 39.0], [-8.7, 41.0], [-8.9, 42.6], [-8.2, 43.6], [-5.8, 43.6]];
const CE = [[8.2, 49.0], [6.2, 49.5], [4.2, 49.9], [2.5, 51.1], [4, 51.9], [6, 53.4], [8.6, 53.9], [9, 54.8], [10.9, 54.2], [14, 54], [19, 54.5], [19.5, 46], [13.7, 45.6], [13.7, 46.5], [12.2, 47.1], [10.2, 46.6], [8.5, 46.5], [7.0, 45.9], [6.9, 46.4], [7.6, 47.6]];
function sMap(t, t0) { // 9: the journey Italy -> France -> England
  const u = t - t0, d = Math.max(3, T1('s09') - t0);
  CAM = { x: lerp(560, 520, eio(seg(u, 0, d))), y: lerp(1080, 960, eio(seg(u, 0, d))), z: lerp(1.0, 1.06, eio(seg(u, 0, d))) }; cam();
  withSeed(270, () => { band(-60, -60, W + 60, 2000, K.sky, .45, { wv: 6 }); });
  const land = (poly, col, sd) => withSeed(sd, () => { const pp = poly.map(([a, b]) => MP(a, b)); wash(pp, col, .62, 3); for (let i = 0; i < pp.length; i += 5) edge(pp.slice(i, Math.min(pp.length, i + 6)), K.ink2, 3, .6, seg(u, 0, .9)); edge([pp[pp.length - 1], pp[0]], K.ink2, 3, .6, seg(u, 0, .9)); });
  reveal(eo(seg(u, 0, .8)), 'y', () => { land(CE, '#d7c79a', 271); land(IB, '#d7c79a', 272); land(FR, '#e2c38b', 273); land(IT, '#e0b98a', 274); land(GB, '#cfc6a0', 275); });
  const R = MP(12.5, 41.9), Pa = MP(2.35, 48.85), Lo = MP(-0.1, 51.5);
  const r1 = seg(u, .6, 1.7), r2 = seg(u, 1.9, 2.8);
  withSeed(280, () => { br(qcurve(R[0], R[1], Pa[0], Pa[1], -90, 18), 7, K.ver, { prof: 'even', nb: 2, a: .85 }, r1); br(qcurve(Pa[0], Pa[1], Lo[0], Lo[1], -50, 14), 7, K.ver, { prof: 'even', nb: 2, a: .85 }, r2); });
  for (const [P, q] of [[R, 0], [Pa, r1], [Lo, r2]]) if (q >= 1 || P === R) withSeed(290, () => wblob(P[0], P[1], 14, 14, K.ver, .9));
  note(t, t0 + .4, 'İtalya · Geç Latince', 700, 1200, 46, null, null, { align: 'center' });
  htext('companio', 700, 1256, 54, K.ver, { italic: false, p: eio(seg(u, .6, 1.2)) });
  note(t, t0 + 1.6, 'Fransa · Eski Fransızca', 380, 1090, 46);
  htext('compaignon', 380, 1146, 56, K.ver, { italic: false, p: eio(seg(u, 1.8, 2.4)) });
  note(t, t0 + 2.6, "İngiltere · 1300'ler", 560, 560, 50);
  htext('companion', 560, 618, 58, K.ver, { italic: false, p: eio(seg(u, 2.8, 3.4)) });
}
function sCompany(t, t0) { // 10: company — a whole table that shares bread
  const u = t - t0; CAM = { x: lerp(500, 580, eio(seg(u, 0, 4))), y: 1000, z: 1.06 }; cam();
  withSeed(300, () => { band(-60, -60, W + 60, 1260, '#e8cfa6', .5, { wv: 8 }); for (let i = 0; i < 3; i++) { wash([[120 + i * 320, 560], [300 + i * 320, 560], [300 + i * 320, 820], [120 + i * 320, 820]], K.sky, .55, 3); } band(-60, 1260, W + 60, 2000, K.brownD, .35); });
  const people = [[140, K.wine, '#3d2a1f', 0], [370, K.blueD, '#c9a36a', 1], [620, K.moss, '#6b4a33', 2], [850, K.plum, '#2a201a', 3]];
  people.forEach(([px, cl, hr, i]) => traveller(px, 1560, .98, { col: cl, dark: mixc(cl, '#000000', .35), hair: hr, mouth: talking(t, ['s10']) * (i === 1 ? 1 : 0), look: i < 2 ? 1 : -1, flip: i >= 2, blink: blink(u, i * .7), arm: .45, seed: 520 + i * 10, smile: 1.4 }));
  withSeed(310, () => { wash([[20, 1260], [1060, 1260], [1080, 1340], [0, 1340]], K.brownD, .85, 3); wash([[40, 1340], [1040, 1340], [1040, 1700], [40, 1700]], K.brown, .97, 4); wash([[40, 1340], [1040, 1340], [1040, 1700], [40, 1700]], K.brown, .9, 4); });
  loaf(300, 1260, .5, 1, { seed: 341 }); halfLoaf(560, 1258, .45, 1); loaf(800, 1262, .45, 1, { seed: 342 });
  withSeed(320, () => { for (const cx of [190, 440, 690, 930]) { wash([[cx - 22, 1260], [cx + 22, 1260], [cx + 18, 1200], [cx - 18, 1200]], K.grey, .8, 2); } });
  htext('company', 480, 360, 130, K.ver, { italic: false, p: eio(seg(u, .1, .8)) });
  note(t, t0 + .8, 'topluluk · şirket · arkadaşlık', 480, 480, 52);
  note(t, t0 + 1.6, 'aynı kök: com + panis', 480, 900, 50, null, null, { col: K.ink2 });
}
function sWord(t, t0) { // 11: the word lands
  const u = t - t0; CAM = { x: 540, y: 960, z: 1 + u * .02 }; cam();
  withSeed(360, () => { wblob(480, 780, 420, 260, K.ochre, .28); wblob(480, 780, 300, 180, K.peach, .3); });
  const sz = fitSize('Companion', 200, 800);
  htext('Companion', 480, 760, sz, K.ink, { italic: false, p: eio(seg(u, 0, .7)) });
  withSeed(361, () => br(qcurve(140, 880, 820, 872, -8, 16), 14, K.ver, { prof: 'brush', nb: 5, a: .85 }, eio(seg(u, .5, 1.0))));
  halfLoaf(380, 1150, .55, -1, -.12); halfLoaf(580, 1150, .55, 1, .12);
}
function sToday(t, t0) { // 12: today — a girl and her dog on a long road
  const u = t - t0; CAM = { x: lerp(520, 560, u / 6), y: 1190, z: lerp(1.04, 1.1, u / 6) }; cam();
  landscape({ sky0: '#e9eed8', sky1: K.sky, near: K.green, mid: K.sage, far: K.blue, road: '#e6d3a4', trees: [[90, 1160, .9], [960, 1140, .7]], seed: 103 });
  traveller(380, 1560, 1.1, { col: K.yellow, dark: K.ochreD, hair: '#3a2a20', braid: true, bag: true, walk: u * 6.5, look: 1, blink: blink(u, .4), arm: .25, seed: 611, belt: K.blueD });
  dog(680, 1580, 1.1, { walk: u * 9, blink: blink(u, 2) });
  note(t, t0 + .3, 'BUGÜN', 480, 560, 70, null, null, { italic: false });
}
function sEnd(t, t0, dur) { // 13: echo — the two companions walk on together at sunset
  const u = t - t0; CAM = { x: 540, y: 1170, z: lerp(1.12, 1.0, eio(seg(u, 0, 3))) }; cam();
  landscape({ sky0: K.fireL, sky1: K.plum, sun: [540, 980], sunCol: K.fire, far: K.plum, mid: '#a07a6a', near: K.moss, seed: 104, trees: [[960, 1150, .8]] });
  const wx = lerp(0, 140, u / 4);
  traveller(360 + wx, 1540, .92, { col: K.brown, dark: K.brownD, hood: true, beard: '#d8d0c4', staff: true, walk: u * 6, look: 1, blink: blink(u), arm: .5, smile: 1.6, seed: 401, hold: () => halfLoaf(26, 16, .3, 1) });
  traveller(590 + wx, 1550, .92, { col: K.green, dark: K.sageD, hair: '#4a3324', braid: true, walk: u * 6 + 1.4, look: -1, blink: blink(u, 1), arm: .5, smile: 1.6, seed: 451, hold: () => halfLoaf(26, 16, .3, -1) });
  const ce = CEND(), k = seg(t, ce, ce + .9);
  if (k > 0) { scr(); X.globalAlpha = 1; mist(k); if (k > .5) {
      const sz = fitSize('ingilizcecim.com', 110, 800);
      htext('ingilizcecim.com', 480, 880, sz, K.ver, { italic: false, p: eio(seg(t, ce + .5, ce + 1.2)) });
      htext('Kelimelerin Tarihçesi · YDT/YDS', 480, 1010, 48, K.ink, { p: eio(seg(t, ce + .9, ce + 1.5)) });
      withSeed(380, () => br(qcurve(230, 1080, 730, 1074, -6, 12), 10, K.ver, { prof: 'brush', nb: 4, a: .8 }, eio(seg(t, ce + 1.2, ce + 1.7))));
      halfLoaf(400, 1330, .45, -1, -.1); halfLoaf(560, 1330, .45, 1, .1); } }
}
// paper-coloured mist rising (erase)
function mist(k) { const ey = lerp(H + 120, -200, eio(k)); X.save(); X.beginPath(); X.moveTo(-50, H + 50); for (let i = 0; i <= 22; i++) { const x = lerp(-50, W + 50, i / 22); X.lineTo(x, ey + Math.sin(i * 1.4) * 50 + Math.sin(i * .5) * 40); } X.lineTo(W + 50, H + 50); X.closePath(); X.clip(); X.drawImage(PAPER, 0, 0); X.restore(); }

// scene table
let SC = [];
function buildScenes() {
  SC = [
    [sHook, 0, 'cut'], [sTitle, T0('s02') - .25, 'brush'], [sLatin, T0('s03') - .3, 'mist'], [sCom, T0('s04') - .2, 'brush'],
    [sPanis, T0('s05') - .2, 'brush'], [sMerge, T0('s06') - .25, 'mist'], [sAsk, T0('s07') - .25, 'mist'], [sGoth, T0('s08') - .25, 'brush'],
    [sMap, T0('s09') - .25, 'mist'], [sCompany, T0('s10') - .25, 'brush'], [sWord, T0('s11') - .2, 'mist'], [sToday, T0('s12') - .25, 'brush'], [sEnd, T0('s13') - .25, 'mist'],
  ];
}
function drawScene(i, t) { const [f, s] = SC[i]; f(t, s, Z.dur); }
function sceneAt(t) { let i = 0; for (let j = 0; j < SC.length; j++) if (t >= SC[j][1]) i = j; return i; }

window.render = t => {
  T = t; scr(); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.setLineDash([]);
  X.drawImage(PAPER, 0, 0);
  if (!Z) return;
  const i = sceneAt(t), [, s, tr] = SC[i], k = seg(t, s, s + .6);
  if (i > 0 && k < 1 && tr !== 'cut') {
    drawScene(i - 1, Math.min(t, s));
    scr();
    if (tr === 'mist') { // wash previous to paper, then paint the next one from below
      if (k < .5) { mist(k * 2); }
      else { X.drawImage(PAPER, 0, 0); X.save(); reveal(eo((k - .5) * 2), 'y', () => drawScene(i, Math.max(t, s + .02))); X.restore(); }
    } else { // brush-edge wipe from the left
      X.save(); X.beginPath(); const ex = lerp(-120, W + 120, eio(k)); X.moveTo(-200, -100); for (let j = 0; j <= 24; j++) { const y = lerp(-100, H + 100, j / 24); X.lineTo(ex + Math.sin(j * 1.7) * 50 + Math.sin(j * .6) * 30, y); } X.lineTo(-200, H + 100); X.closePath(); X.clip();
      X.drawImage(PAPER, 0, 0); drawScene(i, Math.max(t, s + .02)); X.restore();
    }
  } else drawScene(i, t);
  scr(); X.globalAlpha = 1;
  // paper texture over everything (pigment sits in the paper)
  X.globalCompositeOperation = 'multiply'; X.globalAlpha = .35; X.drawImage(PTEX, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
  if (KAPAK) cover(); else if (t < CEND()) caption(t);
};

// paper: warm base, smooth noise, fibres, light vignette (built once, seeded)
let PAPER = null, PTEX = null;
function makePaper() {
  const r = mulberry(7);
  PTEX = document.createElement('canvas'); PTEX.width = W; PTEX.height = H; const g = PTEX.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
  for (const [sc, amp] of [[160, 6], [60, 4], [18, 3]]) { const n = document.createElement('canvas'); n.width = Math.ceil(W / sc) + 2; n.height = Math.ceil(H / sc) + 2; const nc = n.getContext('2d'), im = nc.createImageData(n.width, n.height);
    for (let i = 0; i < n.width * n.height; i++) { const v = 255 - r() * amp * 2; im.data[i * 4] = v; im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v * .99; im.data[i * 4 + 3] = 255; }
    nc.putImageData(im, 0, 0); g.globalCompositeOperation = 'multiply'; g.imageSmoothingEnabled = true; g.drawImage(n, -sc, -sc, n.width * sc, n.height * sc); }
  g.globalCompositeOperation = 'source-over'; g.lineWidth = 1;
  for (let i = 0; i < 3000; i++) { let x = r() * W, y = r() * H, a = r() * Math.PI; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { a += (r() - .5) * .7; x += Math.cos(a) * 7; y += Math.sin(a) * 7; g.lineTo(x, y); } g.strokeStyle = `rgba(150,130,100,${(.04 + r() * .07).toFixed(3)})`; g.stroke(); }
  const vg = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(120,90,60,.12)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  PAPER = document.createElement('canvas'); PAPER.width = W; PAPER.height = H; const p = PAPER.getContext('2d');
  p.fillStyle = K.paper; p.fillRect(0, 0, W, H); p.globalCompositeOperation = 'multiply'; p.drawImage(PTEX, 0, 0);
}

function cover() { // same layout every cover: small series label + big word, inside y 285-1635
  scr(); X.globalAlpha = 1;
  withSeed(990, () => band(60, 300, 1020, 640, K.paper, .92, { wv: 10, j: 6 }));
  htext('KELİMELERİN TARİHÇESİ', 540, 370, 50, K.ink2, { italic: false });
  const sz = fitSize('Companion', 180, 880); htext('Companion', 540, 500, sz, K.ver, { italic: false });
  withSeed(991, () => br(qcurve(220, 600, 860, 594, -6, 14), 12, K.ver, { prof: 'brush', nb: 4, a: .85 }));
  withSeed(992, () => band(170, 1490, 910, 1610, K.paper, .92, { wv: 8, j: 5 }));
  htext('“ekmeğini paylaştığın kişi”', 540, 1550, 54, K.ink);
}

(async () => {
  Z = await (await fetch('ses/zaman.json')).json(); Z.satirlar.forEach(l => L[l.id] = l);
  await document.fonts.load(`60px ${SERIF}`); await document.fonts.load(`italic 60px ${SERIF}`, 'ğşİıçüöÜÇŞĞ'); await document.fonts.load(`60px ${SERIF}`, 'ğşİıçüöÜÇŞĞ'); await document.fonts.ready;
  makePaper(); buildScenes();
  window.DUR = Z.dur;
  const s = id => T0(id), e = [];
  e.push({ t: .1, type: 'whoosh' }, { t: 1.0, type: 'click' }, { t: 1.9, type: 'pop' });
  e.push({ t: s('s02') - .25, type: 'whoosh' }, { t: s('s02') + .9, type: 'ding' }, { t: s('s02') + 1.4, type: 'click' });
  e.push({ t: s('s03') - .3, type: 'whoosh' }, { t: s('s03') + .4, type: 'click' });
  e.push({ t: s('s04') - .2, type: 'whoosh' }, { t: s('s04') + 1.9, type: 'thump' });
  e.push({ t: s('s05') - .2, type: 'whoosh' }, { t: s('s05') + 1.0, type: 'click' }, { t: s('s05') + 1.5, type: 'click' });
  e.push({ t: s('s06') - .25, type: 'whoosh' }, { t: s('s06') + 1.45, type: 'thump' }, { t: s('s06') + 1.6, type: 'pop' }, { t: s('s06') + 2.3, type: 'ding' });
  e.push({ t: s('s07') - .25, type: 'whoosh' });
  e.push({ t: s('s08') - .25, type: 'whoosh' }, { t: s('s08') + .2, type: 'thump' }, { t: s('s08') + 1.3, type: 'click' });
  e.push({ t: s('s09') - .25, type: 'whoosh' }, { t: s('s09') + 1.7, type: 'pop' }, { t: s('s09') + 2.8, type: 'pop' }, { t: s('s09') + 3.0, type: 'ding' });
  e.push({ t: s('s10') - .25, type: 'whoosh' }, { t: s('s10') + .9, type: 'click' });
  e.push({ t: s('s11') - .2, type: 'whoosh' }, { t: s('s11') + .5, type: 'ding' });
  e.push({ t: s('s12') - .25, type: 'whoosh' }, { t: s('s12') + .4, type: 'click' });
  e.push({ t: s('s13') - .25, type: 'whoosh' }, { t: CEND(), type: 'whoosh' }, { t: CEND() + .6, type: 'ding' });
  window.EV = e.filter(x => x.t > 0).sort((a, b) => a.t - b.t);
  window.READY = true;
})();
