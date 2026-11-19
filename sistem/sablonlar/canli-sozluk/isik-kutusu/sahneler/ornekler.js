// Örnek ışık kutuları (onaylı stil karelerinden). Yeni kelimede kendi kutunu bu kalıpla yaz: sahne.js içinde
//   import { venedikLimani, kervansaray } from './sablon/sahneler/ornekler.js';
//   export default K => [kervansaray(K), venedikLimani(K, { bas: 's06' })];
// Katman kuralları: 5–6 katman, z −.126 (uzak, trans .85) → −.045 (ön, trans .04); arka açık, ön koyu (kat: 0..4 havanın renkleri).
// Her katman y −.22'ye kadar iner (alt boşluk olmaz). Görüş genişliği z ≈ −.11'de yalnızca ≈ .21 m: önemli binaları x ±.09 içinde tut.
// Pencere/kapı ışığı: draw'da kağıdı #c8a070 ile boya, glowDraw'da siyah zemine aynı şekli beyaz çiz.

export function venedikLimani(K, o = {}) {   // gece limanı: lagün, karantina adası (lazaret), kadırgalar, güneşin yansıması
  const { MOTIF: M, PAPER, cut, mulberry, TAU } = K;
  const k = K.kutu(o.hava || 'gece-limani', { gunes: [.03, -.024, .012], bas: o.bas });
  k.katman({ z: -.126, trans: .85, kat: 0, ppm: 4200, draw: x => { x.fillStyle = PAPER; const R = mulberry(4);
    x.fillRect(-.18, -.22, .36, .17); M.houses(x, -.18, .18, -.05, R); M.campanile(x, -.045, -.05, .062, .011); M.dome(x, .01, -.05, .016); M.dome(x, .045, -.05, .011); M.dome(x, -.085, -.05, .009); M.campanile(x, .1, -.05, .04, .008); } });
  const wins = []; for (let i = 0; i < 14; i++) { const wx = -.152 + i * .0135; if (wx > -.075 && wx < -.035) continue; wins.push([wx, i % 4 !== 2]); }
  const win = (c, wx) => { c.fillRect(wx, -.055, .0045, .007); c.beginPath(); c.arc(wx + .00225, -.048, .00225, 0, Math.PI); c.fill(); };
  k.katman({ z: -.112, trans: .55, kat: 1,
    draw: x => { x.fillStyle = PAPER; x.fillRect(-.18, -.22, .36, .158); x.fillRect(-.16, -.062, .2, .024); x.fillRect(-.07, -.038, .03, .014);
      x.beginPath(); x.moveTo(-.074, -.024); x.lineTo(-.055, -.012); x.lineTo(-.036, -.024); x.closePath(); x.fill(); x.fillRect(-.122, -.038, .008, .03);
      x.save(); x.fillStyle = '#c8a070'; wins.forEach(([wx]) => win(x, wx)); x.restore(); },
    glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.18, -.22, .36, .44); g.fillStyle = '#fff'; wins.forEach(([wx, lit]) => lit && win(g, wx)); } });
  k.katman({ z: -.098, trans: .8, kat: 2, k: .95, shadow: false, glow: 1.8, glowCol: '#ffcf8a',   // su: güneşin yansıması üst üste yatay fırça izleri
    draw: x => { x.fillStyle = PAPER; x.beginPath(); x.moveTo(-.18, -.22); x.lineTo(-.18, -.066); for (let u = -.18; u <= .18; u += .004) x.lineTo(u, -.066 + .0012 * Math.sin(u * 90)); x.lineTo(.18, -.22); x.closePath(); x.fill();
      cut(x, () => { const R = mulberry(8); for (let i = 0; i < 70; i++) x.fillRect((R() - .5) * .34, -.07 - R() * .07, .006 + R() * .02, .0007); }); },
    glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.18, -.22, .36, .44); const R = mulberry(9); g.fillStyle = '#fff';
      for (let i = 0; i < 42; i++) { const d = R(), y = -.07 - d * .075, w = (.016 - d * .01) * (.5 + R()), cx = .03 + (R() - .5) * .016 * (1 + d * 2); g.globalAlpha = .9 - d * .6; g.fillRect(cx - w / 2, y, w, .0014 + R() * .0012); } } });
  const ships = k.katman({ z: -.078, trans: .1, kat: 3, glow: 2.6,
    draw: x => { x.fillStyle = PAPER; x.strokeStyle = PAPER; M.galley(x, null, -.075, -.1, .68, true); M.galley(x, null, .1, -.088, .48, true); },
    glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.18, -.22, .36, .44); M.galley(null, g, -.075, -.1, .68, true); M.galley(null, g, .1, -.088, .48, true); } });
  k.katman({ z: -.045, trans: .04, kat: 4, draw: x => { x.fillStyle = PAPER;
    x.beginPath(); x.moveTo(-.18, -.22); x.lineTo(-.18, -.115); for (let u = -.18; u <= .18; u += .004) x.lineTo(u, -.118 + .004 * Math.sin(u * 40 + 1) + .002 * Math.sin(u * 130)); x.lineTo(.18, -.22); x.closePath(); x.fill();
    M.bricola(x, -.088, -.12, .07); M.bricola(x, .098, -.122, .05); } });
  k.anim = (t, u) => { ships.position.y = .0008 * Math.sin(t * 1.3); ships.rotation.z = .004 * Math.sin(t * .9); };   // kadırgalar suda hafifçe salınır
  return k;
}

export function kervansaray(K, o = {}) {   // çöl ikindisi: kumullar, depoları yanan kervansaray, deve kervanı, hurmalar
  const { MOTIF: M, PAPER } = K;
  const k = K.kutu(o.hava || 'col-ikindisi', { gunes: [-.03, -.005, .02], bas: o.bas });
  k.katman({ z: -.126, trans: .85, kat: 0, ppm: 4200, draw: x => { x.fillStyle = PAPER; M.dunes(x, -.04, [[-.12, .022, .05], [-.02, .012, .06], [.09, .028, .05], [.16, .015, .03]], 1); } });
  k.katman({ z: -.112, trans: .5, kat: 1,
    draw: x => { x.fillStyle = PAPER; M.dunes(x, -.065, [[-.15, .008, .05], [.15, .006, .05]], 3); M.caravanserai(x, null, -.062); },
    glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.18, -.22, .36, .44); M.caravanserai(null, g, -.062); } });
  k.katman({ z: -.095, trans: .35, kat: 2, draw: x => { x.fillStyle = PAPER; M.dunes(x, -.108, [[-.04, .008, .08], [.1, .01, .05]], 5); } });
  const caravan = k.katman({ z: -.08, trans: .1, kat: 3, ppm: 6500, draw: x => { x.fillStyle = PAPER; x.strokeStyle = PAPER;
    [[-.07, -.1, .55, 1], [-.046, -.101, .55, 1], [-.022, -.102, .58, 1], [.002, -.103, .58, 0]].forEach(([cx, b, s, l]) => M.camel(x, cx, b, s, l));
    x.lineWidth = .0005; x.beginPath(); x.moveTo(-.054, -.078); x.lineTo(-.042, -.079); x.moveTo(-.03, -.08); x.lineTo(-.018, -.081); x.stroke();
    x.fillRect(.022, -.103, .0022, .013); x.beginPath(); x.arc(.0231, -.0875, .0026, 0, K.TAU); x.fill(); x.fillRect(.0205, -.093, .006, .002); } });
  k.katman({ z: -.045, trans: .04, kat: 4, draw: x => { x.fillStyle = PAPER;
    x.beginPath(); x.moveTo(-.18, -.22); x.lineTo(-.18, -.118); for (let u = -.18; u <= .18; u += .004) x.lineTo(u, -.12 + .006 * Math.sin(u * 25 + 1) + .002 * Math.sin(u * 110)); x.lineTo(.18, -.22); x.closePath(); x.fill();
    M.palm(x, -.1, -.13, .09, .012); M.palm(x, -.072, -.128, .065, -.01); M.palm(x, .11, -.125, .075, -.008); } });
  k.anim = (t, u) => { caravan.position.x = -.012 + .02 * Math.min(1, u / 30); };   // kervan sahne boyunca yavaşça ilerler
  return k;
}
