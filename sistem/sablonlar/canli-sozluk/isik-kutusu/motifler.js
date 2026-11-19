// Paper motifs for the lightbox (Canvas 2D in metres, y up; fill with the current fillStyle). From the Canlı Sözlük style frames.
import { TAU } from './lib.js';
export function campanile(x, cx, base, hh, ww) {
  x.fillRect(cx - ww / 2, base, ww, hh); x.fillRect(cx - ww * .62, base + hh, ww * 1.24, ww * .5);
  x.beginPath(); x.moveTo(cx - ww * .55, base + hh + ww * .5); x.lineTo(cx, base + hh + ww * 2.6); x.lineTo(cx + ww * .55, base + hh + ww * .5); x.closePath(); x.fill();
  x.fillRect(cx - ww * .08, base + hh + ww * 2.6, ww * .16, ww * .5);
}
export function dome(x, cx, base, r) { x.fillRect(cx - r, base, r * 2, r * .9); x.beginPath(); x.ellipse(cx, base + r * .9, r, r * 1.05, 0, 0, Math.PI); x.fill(); x.fillRect(cx - r * .08, base + r * 1.9, r * .16, r * .5); }
export function houses(x, x0, x1, base, R) {
  for (let u = x0; u < x1;) { const w = .008 + R() * .012, hh = .012 + R() * .02; x.fillRect(u, base, w + .0004, hh);
    if (R() < .5) { x.beginPath(); x.moveTo(u + w * .3, base + hh); x.lineTo(u + w * .35, base + hh + .005); x.lineTo(u + w * .25, base + hh + .0075); x.lineTo(u + w * .5, base + hh + .0075); x.lineTo(u + w * .42, base + hh + .005); x.lineTo(u + w * .45, base + hh); x.fill(); }   // funnel chimney
    u += w; }
}
export function galley(x, g, cx, base, s, lit) {
  const hull = c => { c.beginPath(); c.moveTo(cx - .06 * s, base + .012 * s); c.quadraticCurveTo(cx - .045 * s, base - .006 * s, cx, base - .006 * s); c.quadraticCurveTo(cx + .045 * s, base - .006 * s, cx + .07 * s, base + .016 * s); c.lineTo(cx + .045 * s, base + .01 * s); c.lineTo(cx - .045 * s, base + .01 * s); c.closePath(); c.fill(); };
  if (x) {
    hull(x);
    x.fillRect(cx - .05 * s, base + .01 * s, .02 * s, .012 * s);                             // stern castle
    for (const [mx, mh] of [[-.012, .085], [.024, .07]]) { x.fillRect(cx + mx * s - .0009, base + .008 * s, .0018, mh * s);
      x.save(); x.lineWidth = .0012; x.beginPath(); x.moveTo(cx + (mx - .03) * s, base + (mh * .55) * s); x.lineTo(cx + (mx + .03) * s, base + (mh * 1.02) * s); x.stroke(); x.restore(); }   // lateen yard
    for (const [mx, mh] of [[-.012, .085], [.024, .07]]) { x.beginPath(); x.moveTo(cx + (mx - .026) * s, base + mh * .6 * s); x.quadraticCurveTo(cx + (mx - .005) * s, base + mh * .5 * s, cx + mx * s, base + mh * .72 * s); x.lineTo(cx + (mx + .022) * s, base + mh * .95 * s); x.closePath(); x.fill(); }  // furled sail
    x.save(); x.lineWidth = .0006; for (let i = 0; i < 9; i++) { const ox = cx + (-.035 + i * .008) * s; x.beginPath(); x.moveTo(ox, base + .002 * s); x.lineTo(ox - .006 * s, base - .014 * s); x.stroke(); } x.restore();   // oars
    if (lit) { x.save(); x.fillStyle = '#c8a070'; x.fillRect(cx - .046 * s, base + .014 * s, .004 * s, .004 * s); x.fillRect(cx - .039 * s, base + .014 * s, .004 * s, .004 * s); x.restore(); }
  }
  if (g && lit) { g.fillStyle = '#fff'; g.fillRect(cx - .046 * s, base + .014 * s, .004 * s, .004 * s); g.fillRect(cx - .039 * s, base + .014 * s, .004 * s, .004 * s); g.beginPath(); g.arc(cx - .058 * s, base + .028 * s, .0025 * s, 0, TAU); g.fill(); }
  if (x && lit) { x.fillRect(cx - .0585 * s, base + .012 * s, .001, .014 * s); x.save(); x.fillStyle = '#c8a070'; x.beginPath(); x.arc(cx - .058 * s, base + .028 * s, .0025 * s, 0, TAU); x.fill(); x.restore(); }
}
export function bricola(x, cx, base, hh) {   // a cluster of three mooring poles tied at the top
  for (const [dx, k] of [[-.006, .92], [0, 1], [.006, .88]]) { x.beginPath(); x.moveTo(cx + dx - .0022, base); x.lineTo(cx + dx * .3 - .0018, base + hh * k); x.lineTo(cx + dx * .3 + .0018, base + hh * k); x.lineTo(cx + dx + .0022, base); x.closePath(); x.fill(); }
  x.fillRect(cx - .006, base + hh * .78, .012, .003);
}

export function dunes(x, base, list, seed) {
  x.beginPath(); x.moveTo(-.18, -.22); x.lineTo(-.18, base);
  for (let u = -.18; u <= .18; u += .002) { let y = 0; for (const [cx, hh, w] of list) y = Math.max(y, hh * Math.exp(-(((u - cx) / w) ** 2))); x.lineTo(u, base + y + .0008 * Math.sin(u * 300 + seed)); }
  x.lineTo(.18, -.22); x.closePath(); x.fill();
}
export function caravanserai(x, g, base) {   // the storehouses: a long walled han with arched store doors and a gate tower
  const doors = []; for (let i = 0; i < 7; i++) doors.push(-.094 + i * .019);
  if (x) {
    x.fillRect(-.11, base, .165, .034); for (let i = 0; i < 17; i++) x.fillRect(-.11 + i * .0098, base + .034, .006, .004);
    x.fillRect(.05, base, .04, .05); x.beginPath(); x.ellipse(.07, base + .05, .02, .015, 0, 0, Math.PI); x.fill(); x.fillRect(.0685, base + .065, .003, .008);
    x.fillRect(.025, base + .034, .006, .036); x.fillRect(.0235, base + .07, .009, .003);
    x.save(); x.fillStyle = '#c8a070'; for (const dx of doors) { x.fillRect(dx, base, .009, .012); x.beginPath(); x.arc(dx + .0045, base + .012, .0045, 0, Math.PI); x.fill(); } x.fillRect(.0625, base, .015, .02); x.beginPath(); x.arc(.07, base + .02, .0075, 0, Math.PI); x.fill(); x.restore();
  }
  if (g) { g.fillStyle = '#fff'; doors.forEach((dx, i) => { if (i % 3 === 1) return; g.fillRect(dx, base, .009, .012); g.beginPath(); g.arc(dx + .0045, base + .012, .0045, 0, Math.PI); g.fill(); }); g.fillRect(.0625, base, .015, .02); g.beginPath(); g.arc(.07, base + .02, .0075, 0, Math.PI); g.fill(); }
}
export function camel(x, cx, base, s, load) {
  x.save(); x.translate(cx, base); x.scale(s, s);
  x.beginPath(); x.ellipse(0, .022, .016, .008, 0, 0, TAU); x.fill();
  x.beginPath(); x.ellipse(-.002, .029, .008, .007, 0, 0, Math.PI); x.fill();
  x.beginPath(); x.moveTo(.012, .024); x.quadraticCurveTo(.024, .026, .022, .04); x.lineTo(.03, .041); x.lineTo(.031, .037); x.lineTo(.025, .035); x.quadraticCurveTo(.026, .024, .015, .018); x.closePath(); x.fill();
  for (const lx of [-.011, -.006, .007, .012]) x.fillRect(lx, 0, .0022, .018);
  if (load) { x.fillRect(-.012, .028, .02, .007); x.fillRect(-.014, .02, .004, .012); x.fillRect(.006, .02, .004, .012); }
  x.restore();
}
export function palm(x, cx, base, hh, lean) {
  x.beginPath(); x.moveTo(cx - .003, base); x.quadraticCurveTo(cx + lean * .5, base + hh * .6, cx + lean, base + hh); x.lineTo(cx + lean + .002, base + hh); x.quadraticCurveTo(cx + lean * .5 + .003, base + hh * .6, cx + .003, base); x.closePath(); x.fill();
  const tx = cx + lean, ty = base + hh;
  for (let i = 0; i < 9; i++) { const a = -2.9 + i * .72 + (i > 4 ? .15 : 0), L = .03 + (i % 2) * .008;
    x.beginPath(); x.moveTo(tx, ty); x.quadraticCurveTo(tx + Math.cos(a) * L * .55, ty + Math.sin(a) * L * .55 + .012, tx + Math.cos(a) * L, ty + Math.sin(a) * L * .6 - .004);
    x.quadraticCurveTo(tx + Math.cos(a) * L * .5, ty + Math.sin(a) * L * .5 + .007, tx, ty); x.fill(); }
}

