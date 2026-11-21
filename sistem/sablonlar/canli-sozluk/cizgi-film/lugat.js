// Canlı Sözlük · Çizgi Film motoru (1080×1920): 1940'ların renkli sinema çizgi filmi TÜRÜ (guaj arka plan, kalın mürekkep, ikişerli kare, iris).
// Maskot: Lügat (sarı, şişman bir sözlük; lacivert sırt, krem sayfa kenarı, beyaz eldiven). Mevcut hiçbir çizgi film karakteri, logo ya da kapanış yazısı kullanılmaz.
// İçerik: ../sozluk.json · sahneler: ../sahne.js · zaman: ../ses/zaman.json. Tarif: sistem/sablonlar/canli-sozluk/SABLON.md
// Teknik: lemo-opuscar rubber-hose motoru (toon.js, chars.js, bg.js; MIT).
import * as T from './toon.js';
import { P, glove, hose, mouth, brow, pieEye } from './chars.js';
import { wash } from './bg.js';
import sahne from '../sahne.js';
const { shape, stroke, ell, arc, rr, rect, spline, quad } = T;
const W = 1080, H = 1920, Q = new URLSearchParams(location.search), KAPAK = Q.get('kapak') === '1';
const C = { navy: '#1B1F33', red: '#D7263D', yellow: '#E8B83A', card: '#F6EEDB', news: '#e6e0d2' };
P.dmid = '#d77f86';   // dil: pembe (marka kırmızısı yalnız kök ve mühürde)
const cv = document.getElementById('c'); cv.width = W; cv.height = H; T.init(cv); const g = T.g;
await document.fonts.ready;
for (const f of ['150px Shrik', '500 40px Merri', '800 40px Merri', '700 40px Merri', '40px NotoS', '40px FellI', '40px Cour', '40px CourB']) await document.fonts.load(f, 'aşğİā');
const D = await (await fetch('sozluk.json')).json();
const Z = await (await fetch('ses/zaman.json')).json();
const SAT = Object.fromEntries(Z.satirlar.map(l => [l.id, l]));
const at = id => { if (id == null) return null; if (typeof id === 'number') return id; if (!SAT[id]) throw new Error('zaman.json içinde satır yok: ' + id); return SAT[id].t0; };
const sonu = id => SAT[id].t1;

// —— hareket yardımcıları ——
const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const ramp = (t, a, b) => ease((t - a) / (b - a));
const back = u => { u = Math.min(Math.max(u, 0), 1); const s = 1.9; return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };   // taşarak oturma
const zip = (t, a, d = .18) => 1 - Math.pow(1 - Math.min(Math.max((t - a) / d, 0), 1), 3);   // çizgi film kaçışı: hızlı çıkış, sert duruş
const wob = (t, f = 1, ph = 0) => Math.sin(t * Math.PI * 2 * f + ph);

// —— Lügat ——
// lugat(x, y, o): (x, y) = gövdenin alt ortası; gövde 230×290 px (k ile ölçeklenir).
// o: { k, reach 0..1.4 (kollar yukarı; >1 lastik uzama), kol: [[x,y],[x,y]] (eldivenleri doğrudan bir yere koy), el: ['open'|'grab'|'point'|'fist'|'thumb'|'wave', …],
//      lean (radyan), bak: 'up'|'cam'|'down'|'left'|'right', kas: 'sad'|'up'|'angry'|'flat', agiz: 'o'|'smile'|'grin'|'frown'|'wavy'|'beam'|'flat'|'bleh', ter, kapak (göz kapağı 0..1), sx, sy (ezilme/uzama), ayak (bacak + ayakkabı) }
function lugat(x, y, o = {}) {
  const k = o.k || 1;
  T.push(); T.translate(x, y); T.rotate(o.lean || 0); T.scale(k * (o.sx || 1), k * (o.sy || 1)); T.translate(-x, -y);
  const top = y - 270, r = o.reach || 0;
  if (o.ayak) for (const s of [-1, 1]) { hose([x + s * 50, y - 6], [x + s * 62, y + 70], s * 6, 16, C.navy); T.push(); T.translate(x + s * 62 + s * 10, y + 76); T.scale(s, 1); shape(spline([[-15, 0], [-17, -12], [-6, -19], [10, -21], [27, -18], [37, -8], [34, 3], [12, 5], [-8, 4]], true, 6), { fill: P.ink, lw: 5 }); T.pop(); }
  const arm = (s, rest, up, hand, a0, a1, flip, fixed) => {
    const kk = Math.min(r, 1), ex = Math.max(0, r - 1) * 260;
    const hx = fixed ? fixed[0] : rest[0] + (up[0] - rest[0]) * kk, hy = fixed ? fixed[1] : rest[1] + (up[1] - rest[1]) * kk - ex;
    const sh = [x + s * 90, top + 90];
    hose(sh, [hx, hy], s * (-40 + 80 * kk) * (s < 0 ? 1 : -1.5), 18, C.navy);
    glove(hx, hy, fixed ? Math.atan2(hy - sh[1], hx - sh[0]) : a0 + (a1 - a0) * kk, (o.el && o.el[s < 0 ? 0 : 1]) || (r > .5 ? hand : 'open'), 1.35, { flip });
  };
  arm(-1, [x - 190, top + 150], [x - 140, top - 205], 'open', -2.6, -1.95, false, o.kol && o.kol[0]);
  arm(1, [x + 200, top + 150], [x - 60, top - 230], 'grab', -.5, -1.75, true, o.kol && o.kol[1]);
  shape([[x + 105, top + 14], [x + 140, top - 6], [x + 140, y - 20], [x + 105, y]], { fill: C.card, lw: 6, shade: () => { for (let i = 1; i < 7; i++) stroke([[x + 105, top + 14 + i * 36], [x + 140, top - 6 + i * 36]], 2, { line: '#b9ab8a', boil: .4 }); } });
  shape(rr(x - 120, top, 230, 290, 20), { fill: C.yellow, lw: 7, shade: () => {
    T.fillOnly(rect(x + 60, top - 10, 60, 310), '#c99a22', { boil: 0 }); T.fillOnly(rect(x - 130, top - 10, 34, 310), C.navy, { boil: 0 });
    for (const yy of [top + 30, top + 250]) T.fillOnly(rect(x - 96, yy, 160, 8), '#c99a22', { boil: 0 });
  } });
  const ex = x - 4, ey = top + 95, L = { up: [-9, -17], cam: [0, 2], down: [-3, 14], left: [-12, 0], right: [12, 0] }[o.bak || 'cam'];
  for (const s of [-1, 1]) {
    shape(ell(ex + s * 34, ey, 27, 38, 30), { fill: P.white, lw: 5 });
    shape(ell(ex + s * 34 + L[0], ey + L[1], 11, 15, 18), { fill: P.ink, stroke: false, boil: .3 });
    shape(ell(ex + s * 34 + L[0] - 3, ey + L[1] - 6, 4, 5, 10), { fill: P.white, stroke: false, boil: 0 });
    if (o.kapak) { T.fillOnly(rect(ex + s * 34 - 30, ey - 42, 60, 42 * o.kapak), C.yellow, { boil: 0 }); stroke([[ex + s * 34 - 26, ey - 40 + 42 * o.kapak], [ex + s * 34 + 26, ey - 40 + 42 * o.kapak]], 5); }
    brow(ex + s * 34, ey - 54, 34, o.kas || 'up', s);
  }
  mouth(ex - 6, top + 175, 54, o.agiz || 'smile', { open: 1.1 });
  if (o.ter) for (const [sx, sy, q] of [[x + 135, top - 40, 11], [x - 150, top + 10, 9]]) shape(spline([[sx, sy - q * 1.6], [sx + q, sy], [sx, sy + q], [sx - q, sy]], true, 5), { fill: '#e8f6ff', lw: 4 });
  T.pop();
}

// —— kartlar, mühür, iris, altyazı, baskı ——
function txt(s, x, y, font, fill, align = 'left') { g.setTransform(1, 0, 0, 1, 0, 0); g.font = font; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillStyle = fill; g.fillText(s, x, y); return g.measureText(s).width; }
function mw(s, font) { g.font = font; return g.measureText(s).width; }
function card(x, y, w, h, rot, k, fill, fn) {   // mürekkep konturlu, lacivert gölgeli, hafif eğik tabela kart
  if (k <= .01) return;
  T.push(); T.translate(x + w / 2, y + h / 2); T.rotate(rot); T.scale(k);
  shape(rr(-w / 2 + 14, -h / 2 + 16, w, h, 26), { fill: C.navy, stroke: false, boil: .5 });
  shape(rr(-w / 2, -h / 2, w, h, 26), { fill, lw: 8 });
  T.pop();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x + w / 2, y + h / 2); g.rotate(rot); g.scale(k, k); g.translate(-w / 2, -h / 2); const m = g.getTransform(); g.restore();
  const st = g.setTransform.bind(g); st(m); g.setTransform = () => st(m); fn(); g.setTransform = st; st(1, 0, 0, 1, 0, 0);
}
const EY = 250, EH = 310;   // giriş kartı: Instagram üst güvenli alanının (250 px) altında
function entry(k) {
  card(70, EY, 880, EH, -.022, k, C.card, () => {
    const fs = Math.min(150, 150 * 760 / mw(D.kelime, '150px Shrik'));
    g.font = `${fs}px Shrik`; g.textAlign = 'left'; g.lineJoin = 'round';
    g.fillStyle = C.navy; g.fillText(D.kelime, 56, 160); g.fillStyle = C.yellow; g.fillText(D.kelime, 48, 150); g.strokeStyle = C.navy; g.lineWidth = 4; g.strokeText(D.kelime, 48, 150);
    const w = txt(D.ipa, 60, 214, '44px NotoS', C.navy); txt(D.tur || '', 60 + w + 20, 214, 'italic 48px FellI', C.navy);
    g.fillStyle = C.navy; g.fillRect(56, 234, 768, 5); g.fillRect(56, 246, 768, 2);
    const as = Math.min(42, 42 * 760 / mw(D.anlam, '500 42px Merri')); txt(D.anlam, 60, 288, `500 ${as}px Merri`, C.navy);
  });
}
const ROWS = [...D.zincir.map((z, i) => ({ ...z, bg: i === D.zincir.length - 1 ? C.yellow : null })), ...(D.akraba ? [{ ...D.akraba, bg: C.news }] : [])];
const RF = '42px Cour', RFB = 'bold 42px CourB';
const rowW = q => mw((q.dil ? q.dil + ' ' : '') + (q.on || ''), RF) + mw(q.kok, RFB) + mw(q.son || '', RF);
const CHW = Math.min(880, Math.max(620, Math.max(...ROWS.map(rowW)) + 260)), CHH = 44 + ROWS.length * 74, CHB = 1435, CHY = CHB - CHH;   // zincir kartı: altyazının üstünde biter (gölge dahil altyazıyla ≥40 px boşluk)
const NOT = Object.fromEntries((D.notlar || []).map(n => [n.sira ?? 0, n]));
function chain(t, slide, sealT) {   // kart, satırlar geldikçe yukarı doğru büyür (altı CHB'de sabit)
  const hh = 44 + 74 * Math.max(1, ROWS.reduce((a, q, i) => t >= at(q.satir) ? Math.max(a, i + ease((t - at(q.satir)) / .35)) : a, 0));   // satırlar sırasız gelse de (ör. akraba erken) kart en alttaki görünen satırı kapsar
  card(70, CHB - hh + slide, CHW, hh, .025, 1, C.card, () => {
    ROWS.forEach((q, i) => {
      if (t < at(q.satir) + .1) return;
      const y = 66 + i * 74;
      if (q.bg) { g.fillStyle = q.bg; g.fillRect(22, y - 44, rowW(q) + 40, 60); }
      let x = 38 + txt((q.dil ? q.dil + ' ' : '') + (q.on || ''), 38, y, RF, C.navy);
      x += txt(q.kok, x, y, RFB, C.red); x += txt(q.son || '', x, y, RF, C.navy);
      const n = NOT[i]; if (n && t >= at(n.satir) + .1) txt(n.metin, x + 24, y, 'italic 500 32px Merri', C.navy);
    });
    const s = t - sealT; if (s > 0) {   // ingilizcecim mührü karta iner
      const d = Math.min(1, s / .16), k = s < .16 ? 2.4 - 1.4 * d : 1, sq = s < .16 ? 1 : 1 - .18 * Math.exp(-(s - .16) * 14) * Math.cos((s - .16) * 30);
      g.translate(CHW - 110, Math.min(hh - 96, 128)); g.rotate(-.24); g.scale(k / sq, k * sq);
      g.strokeStyle = C.red; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, 92, 0, 7); g.stroke(); g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 76, 0, 7); g.stroke();
      g.fillStyle = C.red; g.textAlign = 'center'; g.font = '800 27px Merri'; g.fillText('ingilizcecim', 0, 8); g.font = '700 20px Merri'; g.fillText('.com', 0, 36);
      for (const a of [-2.3, -.85]) { g.beginPath(); g.arc(Math.cos(a) * 52, Math.sin(a) * 52, 5, 0, 7); g.fill(); }
    }
  });
}
const SUBY = 1525;   // altyazı taban çizgisi: alt güvenli alan (380 px) üstünde
function subtitle(s) {
  if (!s) return;
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = '500 46px Merri'; g.textAlign = 'center';
  g.lineJoin = 'round'; g.lineWidth = 9; g.strokeStyle = C.navy; g.strokeText(s, 500, SUBY); g.fillStyle = '#fbf3e4'; g.fillText(s, 500, SUBY);
}
function iris(cx, cy, r) {
  if (r > 2000) return;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#0b0a09'; g.beginPath(); g.rect(0, 0, W, H); if (r > 0) { g.moveTo(cx + r, cy); g.arc(cx, cy, r, 0, Math.PI * 2, true); } g.fill('evenodd');
}
function print(t) {   // 40'lar renkli baskı: hafif gren + sıcak vinyet (1930'lar film hasarı yok)
  g.setTransform(1, 0, 0, 1, 0, 0);
  let s = Math.floor(t * 24) * 7919 + 1; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 9000; i++) { g.fillStyle = r() > .5 ? 'rgba(0,0,0,.05)' : 'rgba(255,250,235,.05)'; g.fillRect(r() * W, r() * H, 2, 2); }
  const v = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1150); v.addColorStop(0, 'rgba(40,20,0,0)'); v.addColorStop(1, 'rgba(40,20,0,.35)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}
function kapakBaslik() {   // kapak: her videoda aynı düzen (seri etiketi + büyük kelime)
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = 'rgba(27,31,51,.86)'; g.fillRect(0, 250, W, 330);
  g.textAlign = 'center'; g.fillStyle = C.yellow; g.font = '800 34px Merri'; g.letterSpacing = '7px'; g.fillText('KELİMELERİN TARİHÇESİ', W / 2, 320); g.letterSpacing = '0px';
  const fs = Math.min(180, 180 * 900 / mw(D.kelime, '180px Shrik')); g.font = `${fs}px Shrik`; g.lineJoin = 'round';
  g.fillStyle = C.navy; g.fillText(D.kelime, W / 2 + 8, 510); g.fillStyle = C.yellow; g.fillText(D.kelime, W / 2, 500); g.strokeStyle = '#0b0a09'; g.lineWidth = 4; g.strokeText(D.kelime, W / 2, 500);
}

// —— sahneler ——
const EV = [];
const K = { T, P, C, W, H, g, shape, stroke, ell, arc, rr, rect, spline, quad, wash, glove, hose, mouth, brow, pieEye, lugat, ease, ramp, back, zip, wob, at, sonu, Z, D,
  olay: (t, k, ek = {}) => EV.push({ t, k, ...ek }) };
const SAH = await sahne(K);
if (!SAH?.length) throw new Error('sahne.js en az bir sahne döndürmeli');
const BAS = SAH.map((s, i) => i === 0 ? 0 : at(s.bas));
for (const s of SAH) {   // her sahnenin durağan arka planı bir kez boyanır ve önbelleğe alınır (kaynamaz)
  s.bg = document.createElement('canvas'); s.bg.width = W; s.bg.height = H; T.init(s.bg); T.frame(0, { amp: 0 }); s.arka && s.arka(K); T.init(cv);
}
const DUR = Z.dur + 2.4, SEAL = Math.min(D.muhur ? at(D.muhur) : Z.dur - .3, DUR - 1.8), END = DUR - 1.4, CH0 = at(ROWS[0].satir) - .4;
const PAR = Z.satirlar.flatMap(l => { const w = l.metin.split(/\s+/), ps = []; let cur = []; for (const x of w) { if (cur.length && (cur.join(' ') + ' ' + x).length > 34) { ps.push(cur.join(' ')); cur = []; } cur.push(x); } ps.push(cur.join(' '));
  const n = ps.reduce((a, p) => a + p.length, 0); let acc = 0; return ps.map(p => { const a = l.t0 + (l.t1 - l.t0) * acc / n; acc += p.length; return [a, l.t0 + (l.t1 - l.t0) * acc / n, p]; }); });
window.DUR = DUR;
window.EV = [{ t: 0, k: 'iris' }, { t: .5, k: 'pop' }, { t: CH0, k: 'kayma' }, ...ROWS.map(q => ({ t: at(q.satir) + .1, k: 'tak' })), ...BAS.slice(1).map(t => ({ t: t + .05, k: 'iris' })), { t: SEAL, k: 'muhur' }, { t: END, k: 'irisout' }, ...EV].sort((a, b) => a.t - b.t);
window.render = t => {
  let i = 0; while (i + 1 < SAH.length && t >= BAS[i + 1]) i++;
  const S = SAH[i], u = t - BAS[i], tc = Math.floor(t * 12 + 1e-6) / 12;   // oyuncular ikişerli (12 fps)
  T.frame(t, { amp: 1.2 }); T.S.lw = 7;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.drawImage(S.bg, 0, 0);
  S.ciz && S.ciz(tc, tc - BAS[i], K);
  if (KAPAK) { kapakBaslik(); print(t); return; }
  entry(back(ramp(t, .5, 1.1)));
  chain(t, (H - CHY + 40) * (1 - back((t - CH0) / .5)), SEAL);
  const p = PAR.find(([a, b]) => t >= a && t < b); subtitle(p && p[2]);
  print(t);
  const sc = BAS.slice(1).map(b => Math.abs(t - b)).reduce((a, b) => Math.min(a, b), 9);   // sahne geçişi: hızlı iris kapan/aç
  const cx = S.iris ? S.iris[0] : 540, cy = S.iris ? S.iris[1] : 1000;
  iris(cx, cy, t < .9 ? 1300 * ease(t / .9) : t >= END ? 1300 * (1 - ease((t - END) / .9)) : sc < .35 ? 1300 * ease(sc / .35) : 9999);
};
window.READY = true;
