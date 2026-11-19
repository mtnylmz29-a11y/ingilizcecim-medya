// Örnek çizgi film sahnesi (onaylı "tantalize" demosundan). Yeni kelimede kendi sahneni bu kalıpla yaz: sahne.js içinde
//   import { tantalosHavuzu } from './sablon/sahneler/ornekler.js';
//   export default K => [tantalosHavuzu(K, { uzan: K.at('s03'), egil: K.at('s05'), yine: K.at('s10') })];
// Bir sahne: { bas: 'sNN' (ilk sahnede yok), iris: [x, y] (geçiş/kapanış irisinin merkezi), arka(K) (durağan guaj arka plan, bir kez boyanır), ciz(t, u, K) (her kare; t mutlak, u sahne içi, ikişerli) }.
// Yerleşim (Instagram güvenli alanı): üstte giriş kartı 250–560 px; zincir kartı ilk zincir satırında alttan gelir ve ≈1460 px'te biter; altyazı 1525 px.
// Oyuncuları 560–1150 px arasında tut; zemin/su/çimen ise çerçevenin en altına kadar insin (alt boşluk olmaz).
// Gag dili: hazırlık (sx/sy ile ezil) → bekle → ani hareket; kaçışlar K.zip ile; seyirciye bakış (bak: 'cam', kapak .45); her harekete K.olay(t, 'uzan'|'kac'|'tak'|'carp'|'egil'|'gurul'|'yaylan'|'whoosh'|'bakis'|'huzun'|'durak').

export function tantalosHavuzu(K, o = {}) {
  const { wash, ell, quad, spline, stroke, shape, arc, ramp, zip, lugat, W, H, g } = K;
  const U1 = o.uzan ?? 1.6, U2 = o.egil ?? 7, U3 = o.yine ?? 16;   // üç gag'in başlangıç saniyeleri (mutlak)
  const Z1 = U1 + 1.6, Z2 = U1 + 2.7, DROP = U2 + 1.2, TAKE = U2 + 2.0, Z3 = U3 + 1.4, WL = 1150, BY = 1210;
  K.olay(U1, 'uzan'); K.olay(Z1, 'kac'); K.olay(U1 + 2.0, 'uzan'); K.olay(Z2, 'kac'); K.olay(U1 + 3.2, 'carp');
  K.olay(U2, 'egil'); K.olay(DROP, 'gurul'); K.olay(TAKE, 'bakis'); K.olay(TAKE + .2, 'durak', { sure: 1.8 }); K.olay(TAKE + .3, 'huzun'); K.olay(U3, 'uzan'); K.olay(Z3, 'kac');
  const arka = () => {
    const g = K.T.g;   // arka plan kendi önbellek tuvaline boyanır (K.g ana tuvaldir)
    const gr = g.createLinearGradient(0, 0, 0, 1150); gr.addColorStop(0, '#6fb7d4'); gr.addColorStop(.55, '#a9d6dc'); gr.addColorStop(1, '#f3e2b0');
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (const [x, y, s] of [[180, 700, 1], [860, 640, .8], [300, 900, .7]]) {
      const pts = []; for (let i = 0; i < 7; i++) pts.push([x + (i - 3) * 46 * s, y - Math.abs(Math.sin(i * 1.3 + x)) * 40 * s - (i % 2) * 18 * s]);
      wash([...spline([[x - 170 * s, y], ...pts, [x + 170 * s, y]], false, 6), [x + 170 * s, y + 18 * s], [x - 170 * s, y + 18 * s]], '#fbf6ea', { seed: x, edge: .05, line: false });
    }
    const hill = (y0, amp, f, ph, col, seed) => { const p = [[-20, H]]; for (let x = -20; x <= W + 20; x += 30) p.push([x, y0 - amp * (Math.sin(x * f + ph) * .6 + Math.sin(x * f * 2.3 + ph) * .4)]); p.push([W + 20, H]); wash(p, col, { seed, edge: .12, lw: 3 }); };
    hill(1030, 70, .006, 1, '#d79a6a', 1); hill(1085, 40, .009, 3, '#9fb85e', 2);
    wash([[870, 1210], [895, 900], [880, 700], [930, 600], [965, 620], [950, 760], [975, 940], [995, 1210]], '#7a4a2a', { seed: 5, edge: .2 });
    for (const [x, y, r, c] of [[960, 600, 140, '#4f7f34'], [840, 600, 100, '#5f8f3a'], [1050, 720, 110, '#4f7f34'], [900, 560, 80, '#6fa043']]) wash(ell(x, y, r, r * .78, 36), c, { seed: x + y, edge: .15, lw: 3 });
    wash(ell(560, 1210, 470, 130, 60), '#2f7ea3', { seed: 7, edge: .25 });   // havuz tabanı (su çekilince görünür)
  };
  const ciz = (t) => {
    const reach = t < U1 + 3.2 ? ramp(t, U1, U1 + 1.4) + .3 * ramp(t, U1 + 2.0, U1 + 2.5) : t < U3 ? 1.3 * (1 - ramp(t, U1 + 3.2, U1 + 3.4)) : .9 * ramp(t, U3, U3 + 1.1) * (1 - ramp(t, Z3 + .2, Z3 + .5));
    const lift = 80 * zip(t, Z1) + 60 * zip(t, Z2) - 140 * ramp(t, TAKE + 2, U3 - .5) + 140 * zip(t, Z3);
    const lean = -.22 * ramp(t, U2, U2 + .7) * (1 - ramp(t, TAKE - .2, TAKE + .1)), drop = 110 * zip(t, DROP) * (1 - ramp(t, TAKE + 3, TAKE + 5));
    const take = t > TAKE && t < TAKE + 1.8, zipL = [Z1, Z2, Z3].some(z => t >= z && t < z + .6) ? 60 : 0;
    // dal + üzüm (Tantalos'un asla ulaşamadığı meyve)
    wash([...quad([905, 650], [700, 560 - lift * .5], [440, 640 - lift], 18), ...quad([440, 662 - lift], [700, 590 - lift * .5], [915, 690], 18)], '#7a4a2a', { seed: 6, edge: .2 });
    for (const [x, y, r, c] of [[700, 590, 70, '#5f8f3a'], [570, 620, 52, '#6fa043']]) wash(ell(x, y - lift * (x < 650 ? .9 : .45), r, r * .78, 36), c, { seed: x + y, edge: .15, lw: 3 });
    const gx = 470, gy = 680 - lift;
    stroke(quad([gx, gy - 40], [gx + 8, gy - 25], [gx, gy - 14]), 5);
    for (const [dx, dy] of [[0, 0], [-20, -2], [20, -2], [-10, 20], [10, 20], [0, 40], [-28, 18], [28, 18], [-12, 42], [12, 42], [0, 62]]) shape(ell(gx + dx, gy + dy, 16, 16, 18), { fill: '#6b3fa0', lw: 4, shade: () => { g.fillStyle = '#9a6ccc'; g.beginPath(); g.arc(gx + dx - 5, gy + dy - 6, 5, 0, 7); g.fill(); } });
    if (zipL) for (const dx of [-24, 0, 24]) stroke([[gx + dx, gy + 90], [gx + dx, gy + 90 + zipL]], 4);
    lugat(560, BY, { reach, lean, bak: take ? 'cam' : lean < -.1 ? 'down' : 'up', kas: take ? 'flat' : 'sad', agiz: take ? 'frown' : (reach > .5 || lean < -.1) ? 'o' : 'frown', ter: reach > 1.05, kapak: take ? .45 : 0 });
    // su önü (bacakları gizler; çekilince gövde görünür) + kıyı (çerçevenin altına kadar)
    const y = WL + drop;
    wash([[-20, y], ...spline([[-20, y], [300, y - 8], [560, y + 6], [820, y - 6], [1100, y]], false, 8), [1100, 1340], [-20, 1340]], '#4c9fc4', { seed: 9, edge: .2, line: false });
    stroke(arc(556, y + 4, 170, 26, .1, Math.PI - .1, 20), 5, { line: '#e8f6ff' });
    const p = [[-20, H + 10]]; for (let x = -20; x <= W + 20; x += 40) p.push([x, 1320 + Math.sin(x * .013) * 22 + Math.sin(x * .041) * 9]); p.push([W + 20, H + 10]);
    wash(p, '#365f2c', { seed: 11, edge: .18 });
    for (let i = 0; i < 16; i++) { const x = 30 + i * 68 + (i % 3) * 9, yy = 1330 + Math.sin(x * .013) * 22; for (const d of [-12, 0, 12]) stroke(quad([x, yy + 6], [x + d * .6, yy - 18], [x + d * 1.4, yy - 34 - (d === 0) * 10]), 4, { line: '#1f3a1a' }); }
  };
  return { bas: o.bas, iris: [556, 1030], arka, ciz };
}
