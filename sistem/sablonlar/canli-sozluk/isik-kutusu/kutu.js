// Canlı Sözlük · Işık Kutusu motoru (1080×1920). Kağıt kesik katmanlar arkadan aydınlatılır, gökyüzü spatula darbeleriyle boyanır,
// sözlük maddesi ve köken zinciri kutunun içinde kağıt şeritlerdir. İçerik: ../sozluk.json · sahneler: ../sahne.js · zaman: ../ses/zaman.json
// Teknik: lemo-opuscar paper-lantern motoru (MIT) + impasto'dan spatula gökyüzü. Tarif: sistem/sablonlar/canli-sozluk/SABLON.md
import * as THREE from 'three';
import { sheet, skyPanel, moon, setMoon, text } from './paper.js';
import { stage, aim } from './stage.js';
import { Pipe } from './post.js';
import { mulberry, TAU, lerp, clamp } from './lib.js';
import * as MOTIF from './motifler.js';
import sahne from '../sahne.js';

const W = 1080, H = 1920, Q = new URLSearchParams(location.search), KAPAK = Q.get('kapak') === '1';
const PAPER = '#9a9a9a', BASE = new THREE.Color(PAPER).r;
const tint = (m, hex, k = 1) => m.material.color.set(hex).multiplyScalar(k / BASE);
const cut = (x, fn) => { x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.strokeStyle = '#000'; fn(); x.restore(); };
const C = { navy: '#1B1F33', red: '#D7263D', yellow: '#E8B83A', card: '#F6EEDB', ink: '#1B1F33', light: '#ffbe68', news: '#e6e0d2' };

// —— havalar (STYLE: bir kutuda tek sıcaklık; arka açık ve yarı saydam, ön koyu) ——
export const HAVA = {
  'gece-limani': { sky: [[-.12, '#f6c27e'], [-.06, '#efa06a'], [-.02, '#c87a74'], [.03, '#8a6a8e'], [.08, '#4a5a8e'], [.15, '#2a3462'], [.3, '#151a30']],
    katlar: ['#7f88b8', '#4b5a8c', '#6d7fb2', '#1f2645', '#0d1022'], light: '#ffd29a', keyCol: '#d8dcff', key: 1.0, ambCol: '#5a6ca8', amb: .22,
    gunes: { core: '#fff3d6', mid: '#ffd9a0', edge: '#f5b070', gain: 1.6, haloGain: .3 }, grade: { expo: 1.0, vig: .4, sat: 1.05, contrast: .12, lift: [0, .004, .02], gain: [1.02, 1.0, .98] } },
  'col-ikindisi': { sky: [[-.12, '#fbe6bf'], [-.04, '#f8d7a2'], [.02, '#efc58e'], [.07, '#d9b493'], [.13, '#a9a9b4'], [.2, '#7f93b8'], [.33, '#5a719f']],
    katlar: ['#e2b98a', '#b77d55', '#9a5f3e', '#5a2f1e', '#241008'], light: '#ffd9a0', keyCol: '#fff0d8', key: 1.15, ambCol: '#b08a6a', amb: .3,
    gunes: { core: '#fffbea', mid: '#ffe6b0', edge: '#ffc878', gain: 1.5, haloGain: .32 }, grade: { expo: 1.0, vig: .38, sat: 1.04, contrast: .12, lift: [.01, .005, 0], gain: [1.03, 1.0, .95] } },
};

// —— spatula gökyüzü (impasto): yüksekliğe göre renk, darbeden darbeye adım, sırt + dudak ——
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgb = (c, k = 1) => `rgb(${c.map(v => Math.round(clamp(v * k, 0, 255))).join(',')})`;
function knifeSky(x, w, h, SKY, seed = 21) {
  const col = y => { for (let i = 0; i < SKY.length - 1; i++) if (y <= SKY[i + 1][0]) { const t = clamp((y - SKY[i][0]) / (SKY[i + 1][0] - SKY[i][0])); const a = hx(SKY[i][1]), b = hx(SKY[i + 1][1]); return a.map((v, k) => lerp(v, b[k], t)); } return hx(SKY[SKY.length - 1][1]); };
  const R = mulberry(seed);
  for (let y = -h / 2; y < h / 2; y += .001) { x.fillStyle = rgb(col(y)); x.fillRect(-w / 2, y, w, .0012); }   // önce ince astar: darbeler arasından siyah görünmesin
  for (let pass = 0; pass < 2; pass++) {
    const n = pass ? 9000 : 5000;
    for (let i = 0; i < n; i++) {
      const px = (R() - .5) * w, py = (R() - .5) * h, r = (pass ? .0017 : .0032) * (.7 + R() * .6) * (py > .05 ? 1.3 : 1);
      const L = r * (1.7 + R() * 1.4), Wd = r * (.95 + R() * .5), ang = -.12 + (R() - .5) * .45, j = 1 + (R() - .5) * .12, c1 = col(py + (R() - .5) * .01), c2 = col(py + (R() - .5) * .03);
      x.save(); x.translate(px, py); x.rotate(ang);
      const g = x.createLinearGradient(-L / 2, 0, L / 2, 0); g.addColorStop(0, rgb(c1, j)); g.addColorStop(.6, rgb(c1, j)); g.addColorStop(1, rgb(c2, j * .97));
      x.fillStyle = g; x.beginPath(); x.moveTo(-L / 2, -Wd / 2); x.lineTo(L / 2 - Wd * .35, -Wd / 2); x.lineTo(L / 2, Wd / 2); x.lineTo(-L / 2 + Wd * .3, Wd / 2); x.closePath(); x.fill();
      x.lineWidth = Wd * .12; x.strokeStyle = rgb(c1, j * 1.12); x.beginPath(); x.moveTo(-L / 2 + Wd * .3, Wd / 2 - x.lineWidth / 2); x.lineTo(L / 2, Wd / 2 - x.lineWidth / 2); x.stroke();
      x.strokeStyle = rgb(c1, j * .86); x.beginPath(); x.moveTo(-L / 2, -Wd / 2 + x.lineWidth / 2); x.lineTo(L / 2 - Wd * .35, -Wd / 2 + x.lineWidth / 2); x.stroke();
      x.restore();
    }
  }
}

await Promise.all(['40px Fell', '40px FellI', '500 40px Merri', '700 40px Merri', '800 40px Merri', '40px NotoS', '40px CourB', '40px Cour'].map(f => document.fonts.load(f, 'aşğİā')));
const D = await (await fetch('sozluk.json')).json();
const Z = await (await fetch('ses/zaman.json')).json();
const SAT = Object.fromEntries(Z.satirlar.map(l => [l.id, l]));
const at = id => { if (id == null) return null; if (typeof id === 'number') return id; if (!SAT[id]) throw new Error('sozluk.json: zaman.json içinde satır yok: ' + id); return SAT[id].t0; };

// —— sahne ——
const S = stage({ light: [.02, -.03, -.12], lightR: .11, lightCol: '#ffd29a', key: 1.0, keyCol: '#d8dcff', amb: .22, ambCol: '#5a6ca8', floor: .3, keyPos: [-.04, .32, .3], keyTarget: [0, -.02, -.09], keyAngle: 1.0 });
S.cam.aspect = W / H; S.cam.fov = 41; S.cam.updateProjectionMatrix();
const { U } = S;
// kutu(hava, {gunes:[x,y,r]|null, bas:'s05', anim(t,u), isik:[x,y]}) → yeni bir ışık kutusu (gökyüzü + güneş); katman({...}) ile kesik kağıt ekle
function kutu(hava, o = {}) {
  const HV = typeof hava === 'string' ? HAVA[hava] : hava; if (!HV) throw new Error('bilinmeyen hava: ' + hava);
  const grup = new THREE.Group(); S.scene.add(grup);
  grup.add(skyPanel({ w: .36, h: .66, z: -.142, stops: [[0, HV.sky[0][1]], [1, HV.sky[HV.sky.length - 1][1]]], extra: x => knifeSky(x, .36, .66, HV.sky, o.tohum ?? 21), ppm: 4200, gain: 1.05 }));
  const g = o.gunes === undefined ? [.03, -.024, .012] : o.gunes;
  const gunes = g ? moon({ x: g[0], y: g[1], z: -.139, r: g[2], halo: 6, ...HV.gunes }) : null; if (gunes) grup.add(gunes);
  const K = { grup, hava: HV, gunes, isiklar: [], bas: o.bas, anim: o.anim, isik: o.isik || (g ? [g[0], g[1] - .006] : [0, -.03]),
    katman(p) {   // p: {z, trans, renk (ya da kat: 0..4 havanın katman rengi), draw(x), glowDraw(g)?, glow, ppm, shadow}
      const m = sheet({ U, w: .36, h: .44, ppm: 5200, glowCol: C.light, glowRes: 1, glow: p.glowDraw ? 2.4 : 0, ...p });
      tint(m, p.renk || HV.katlar[p.kat ?? 0], p.k ?? 1); grup.add(m); if (p.glowDraw) K.isiklar.push(m); return m;
    } };
  return K;
}
const KUTULAR = await sahne({ kutu, HAVA, MOTIF, PAPER, C, cut, mulberry, TAU, lerp, clamp, text, THREE, sheet, at });
if (!KUTULAR?.length) throw new Error('sahne.js en az bir kutu döndürmeli');
const bas = KUTULAR.map((k, i) => i === 0 ? 0 : at(k.bas));

// —— sözlük maddesi ve köken zinciri: kutunun içinde, hikâye düzlemine yakın krem kağıt şeritler ——
const meas = document.createElement('canvas').getContext('2d');
const tw = (s, sz, f) => { meas.font = `${sz * 1000}px ${f}`; return meas.measureText(s).width / 1000; };
const strip = o => S.add(sheet({ U, w: o.w, h: o.h, x: o.x, y: o.y, z: o.z, trans: .35, shadow: true, recv: false, ppm: 14000, finish: { rim: .45, under: .22 },
  color: '#ffffff', draw: c => { c.fillStyle = o.paper || C.card; c.beginPath(); const j = mulberry(o.seed || 1), e = .0012; c.moveTo(-o.w / 2, -o.h / 2 + j() * e); for (let u = -o.w / 2; u <= o.w / 2; u += .004) c.lineTo(u, -o.h / 2 + j() * e); for (let u = o.w / 2; u >= -o.w / 2; u -= .004) c.lineTo(u, o.h / 2 - j() * e); c.closePath(); c.fill(); o.ink(c); } }));
const lift = m => { m.material.color.setScalar(1.3); return m; };
const XR = .074;   // Instagram sağ güvenli alanı (120 px): hiçbir şerit bu x'i geçmez
const CW = .168, CX = XR - CW / 2, CY = .1, L0 = -CW / 2 + .008, IW = CW - .016;
const card = lift(strip({ w: CW, h: .062, x: CX, y: CY, z: -.062, seed: 3, ink: c => {
  const hs = Math.min(.03, .03 * IW / tw(D.kelime, .03, 'Fell')); text(c, D.kelime, L0, .009, hs, 'Fell', { fill: C.ink, align: 'left' });
  text(c, D.ipa, L0 + .0005, -.0115, .0082, 'NotoS', { fill: C.ink, align: 'left' });
  text(c, D.tur || '', L0 + .0005 + tw(D.ipa, .0082, 'NotoS') + .004, -.0118, .0092, 'FellI', { fill: C.ink, align: 'left' });
  c.fillStyle = C.ink; c.fillRect(L0, -.0175, IW, .0006); c.fillRect(L0, -.0189, IW, .00025);
  const as = Math.min(.0072, .0072 * IW / tw(D.anlam, .0072, 'Merri')); text(c, D.anlam, L0, -.0245, as, 'Merri', { fill: C.ink, align: 'left', weight: 500 }); } }));
card.rotation.z = -.012;
// şerit listesi: zincir (sonuncusu İngilizce, sarı) + Türkçe akraba (isteğe bağlı) + notlar (gazete kağıdı, yanında)
const SER = [], SZ = .0075, XS = [-.05, .02, -.04, .035, -.045, .025];
const rows = [...D.zincir.map((z, i) => ({ ...z, paper: i === D.zincir.length - 1 ? C.yellow : C.card })), ...(D.akraba ? [{ ...D.akraba, paper: C.news }] : [])];
rows.forEach((q, i) => {
  const parts = [[(q.dil ? q.dil + ' ' : '') + (q.on || ''), 'Cour', C.ink], [q.kok, 'CourB', C.red], [q.son || '', 'Cour', C.ink]];
  const w = parts.reduce((a, [s, f]) => a + tw(s, SZ, f), 0), y = .056 - i * .0175, x = Math.min(XS[i % XS.length], XR - w / 2 - .008);
  const m = lift(strip({ w: w + .012, h: .0135, x, y, z: -.066, seed: 10 + i, paper: q.paper, ink: c => { let px = -w / 2; for (const [s, f, col] of parts) { text(c, s, px, -.0004, SZ, f, { fill: col, align: 'left' }); px += tw(s, SZ, f); } } }));
  m.rotation.z = [.02, -.015, .012, -.01][i % 4]; SER.push({ m, t: at(q.satir), y, x, w: w + .012 });
});
(D.notlar || []).forEach((n, i) => {   // not, ait olduğu zincir satırının karşı tarafına yerleşir
  const r = SER[Math.min(n.sira ?? i, SER.length - 1)], w = tw(n.metin, .0068, 'Merri') + .01, x = r.x < 0 ? Math.min(XR - w / 2 - .004, r.x + r.w / 2 + w / 2 + .012) : Math.max(-.088 + w / 2, r.x - r.w / 2 - w / 2 - .012);
  const m = lift(strip({ w, h: .011, x, y: r.y - .002, z: -.067, seed: 21 + i, paper: C.news, ink: c => text(c, n.metin, 0, -.0003, .0068, 'Merri', { fill: C.ink, weight: 500 }) }));
  m.rotation.z = i % 2 ? .03 : -.03; SER.push({ m, t: at(n.satir) });
});
const last = SER[D.zincir.length - 1];   // mühür İngilizce şeridin altına basılır
const seal = lift(S.add(sheet({ U, w: .05, h: .05, x: Math.min(last.x + .006, XR - .026), y: last.y - .031, z: -.0605, trans: .2, recv: false, ppm: 14000, color: '#ffffff', finish: { rim: .2, under: .1 },
  draw: c => {
    c.strokeStyle = C.red; c.lineWidth = .0026; c.beginPath(); c.arc(0, 0, .0215, 0, TAU); c.stroke(); c.lineWidth = .0008; c.beginPath(); c.arc(0, 0, .0178, 0, TAU); c.stroke();
    text(c, 'ingilizcecim', 0, -.0015, .0058, 'Merri', { fill: C.red, weight: 800 }); text(c, '.com', 0, -.0088, .0044, 'Merri', { fill: C.red, weight: 700 });
    c.fillStyle = C.red; for (const a of [.5, 2.64]) { c.beginPath(); c.arc(Math.cos(a) * .0135, Math.sin(a) * .0135, .0012, 0, TAU); c.fill(); }
  } })));
seal.rotation.z = -.22;

// —— zaman çizelgesi ——
const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const ramp = (t, a, b) => ease((t - a) / (b - a));
const grow = (m, k) => { if (m.userData.x0 === undefined) m.userData.x0 = m.position.x; const w = m.geometry.parameters.width; m.visible = k > .002; m.scale.x = Math.max(k, .002); m.position.x = m.userData.x0 - w / 2 * (1 - k) * Math.cos(m.rotation.z); };
const DUR = Z.dur + 2.4, SEALT = Math.min(D.muhur ? at(D.muhur) : Z.dur - .3, DUR - 1.4);
const camA = [0, .045, .42, 0, .06, -.08], camB = [0, .01, .4, 0, .005, -.08];
const glowT = []; KUTULAR.forEach((k, i) => k.isiklar.forEach((m, j) => glowT.push([m, (i ? bas[i] + .9 : 1.6) + j * .7])));
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
const gl = renderer.getContext(), dbg = gl.getExtension('WEBGL_debug_renderer_info');
const SOFT = /swiftshader|llvmpipe|software/i.test(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '');
const SSAA = +(Q.get('ssaa') || (SOFT ? 1 : 2));   // bulutta (yazılım GPU) 1×, bilgisayarda 2×
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap; if (SOFT) S.key.shadow.mapSize.set(1024, 1024);
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA); pipe.fin.material.uniforms.aspect.value = W / H;
const sub = document.querySelector('#sub span'), subBox = document.getElementById('sub');
// altyazı: satırı ≤ 36 harflik parçalara böl, parçaları harf payına göre zamanla
const PAR = Z.satirlar.flatMap(l => { const w = l.metin.split(/\s+/), ps = []; let cur = []; for (const x of w) { if (cur.length && (cur.join(' ') + ' ' + x).length > 36) { ps.push(cur.join(' ')); cur = []; } cur.push(x); } ps.push(cur.join(' '));
  const n = ps.reduce((a, p) => a + p.length, 0); let acc = 0; return ps.map(p => { const a = l.t0 + (l.t1 - l.t0) * acc / n; acc += p.length; return [a, l.t0 + (l.t1 - l.t0) * acc / n, p]; }); });
if (KAPAK) { subBox.style.display = 'none'; const k = document.getElementById('kapak'); k.style.display = 'block'; k.querySelector('b').textContent = D.kelime; }
window.DUR = DUR;
window.EV = [{ t: 0, k: 'lamba' }, { t: .2, k: 'serit' }, ...SER.map(s => ({ t: s.t + .15, k: 'serit' })), ...bas.slice(1).map(t => ({ t: t - .5, k: 'sahne' })), ...glowT.map(([, t]) => ({ t, k: 'pencere' })), { t: SEALT, k: 'muhur' }, { t: DUR - 1.6, k: 'son' }];
window.render = t => {
  let i = 0; while (i + 1 < KUTULAR.length && t >= bas[i + 1]) i++;
  const K = KUTULAR[i], HV = K.hava, u = t - bas[i];
  KUTULAR.forEach((k, j) => { k.grup.visible = j === i; });
  const dip = KUTULAR.length > 1 ? Math.min(...bas.slice(1).map(b => clamp(Math.abs(t - b) / .5))) : 1;   // sahne geçişi: lamba söner, kutu değişir, lamba yanar
  const dim = (1 - .45 * ramp(t, DUR - 1.6, DUR)) * (.15 + .85 * ease(dip));
  U.uLit.value = .9 * ramp(t, 0, 1.2) * dim; U.uLightCol.value.set(HV.light); U.uLight.value.set(K.isik[0], K.isik[1], -.12);
  S.key.color.set(HV.keyCol); S.key.intensity = HV.key; S.amb.color.set(HV.ambCol); S.amb.intensity = HV.amb;
  if (K.gunes) setMoon(K.gunes, ramp(t, .1, 1.3) * (.6 + .4 * dim));
  for (const [m, t0] of glowT) m.material.userData.u.uGlowLit.value = ramp(t, t0, t0 + .5) * dim * (1 + .05 * Math.sin(t * 9 + t0 * 3));
  if (K.anim) K.anim(t, u);
  card.visible = !KAPAK; if (!KAPAK) grow(card, ramp(t, .2, 1.0));
  for (const s of SER) KAPAK ? (s.m.visible = false) : grow(s.m, ramp(t, s.t + .15, s.t + .7));
  const st = t - SEALT; seal.visible = st > 0 && !KAPAK;
  if (st > 0) { const d = ease(Math.min(1, st / .22)); seal.position.z = -.0605 + (1 - d) * .06; const sq = st > .22 ? 1 - .12 * Math.exp(-(st - .22) * 18) * Math.cos((st - .22) * 40) : 1.25 - .25 * d; seal.scale.set(sq, sq, 1); }
  const k = ramp(t, 2.2, 6.2), push = i ? .012 * ramp(u, 0, (bas[i + 1] ?? DUR) - bas[i]) : 0;
  const cam = camA.map((a, j) => a + (camB[j] - a) * k); cam[2] -= push;
  aim(S.cam, cam, t, { hand: .0004 });
  const focus = .475 - push + .035 * (i === 0 ? ramp(t, 2.6, 4.2) * (1 - ramp(t, 6.4, 7.4)) : ramp(u, 0, .4) * (1 - ramp(u, 2.0, 2.8)));
  pipe.shot(S.scene, S.cam, { focus, aper: 10, maxCoc: 10, bloom: { strength: .32, radius: .5, threshold: 1.1 } }, pipe.rtA);
  pipe.final(HV.grade);
  const p = PAR.find(([a, b]) => t >= a && t < b);
  sub.textContent = p ? p[2] : ''; subBox.style.opacity = p && !KAPAK ? 1 : 0;
};
window.READY = true;
