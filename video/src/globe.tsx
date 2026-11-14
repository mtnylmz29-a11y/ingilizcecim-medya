// Ortak dünya küresi (d3-geo ortografik). Dunya.tsx ve Etym.tsx'teki "harita" durakları kullanır.
import React from "react";
import { GeoProjection, geoCircle, geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import world from "world-atlas/countries-110m.json";

/* eslint-disable @typescript-eslint/no-explicit-any */
const W = world as any;
const LAND = feature(W, W.objects.land) as any;
const BORDERS = mesh(W, W.objects.countries, (a: any, b: any) => a !== b);
const GRAT = geoGraticule10();

const rad = Math.PI / 180;
/** Güneşin dik açısı (deklinasyon), YYYY-MM-DD tarihinden. */
export const deklinasyon = (tarih?: string) => {
  if (!tarih) return -18.3;
  const d = new Date(tarih + "T12:00:00Z");
  const n = Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5);
  return -23.44 * Math.cos((360 / 365) * (n + 10) * rad);
};
/** Bir şehirde güneşin doğduğu anda güneşin altındaki boylam. */
export const doguBoylami = (lon: number, lat: number, decl: number) =>
  lon + Math.acos(Math.max(-1, Math.min(1, -Math.tan(lat * rad) * Math.tan(decl * rad)))) / rad;

export const projeksiyon = (cx: number, cy: number, r: number, lon: number, lat: number) =>
  geoOrthographic().scale(r).translate([cx, cy]).rotate([-lon, -lat, 0]).clipAngle(90);

export const Kure: React.FC<{
  id: string; cx: number; cy: number; r: number; lon: number; lat: number;
  gunes?: { lon: number; decl: number }; kara?: string;
  ust?: (proj: GeoProjection, path: ReturnType<typeof geoPath>) => React.ReactNode;
}> = ({ id, cx, cy, r, lon, lat, gunes, kara = "#58B368", ust }) => {
  const proj = projeksiyon(cx, cy, r, lon, lat);
  const path = geoPath(proj);
  let gece: React.ReactNode = null;
  if (gunes) {
    const anti: [number, number] = [gunes.lon + 180, -gunes.decl];
    const term = geoCircle().center([gunes.lon, gunes.decl]).radius(90)();
    const line = { type: "LineString", coordinates: term.coordinates[0] } as any;
    gece = (
      <>
        {[95, 93, 91, 89, 87, 85, 83, 81].map((rr) => <path key={rr} d={path(geoCircle().center(anti).radius(rr)()) ?? ""} fill="#030617" opacity={0.17} />)}
        <path d={path(line) ?? ""} fill="none" stroke="#FFC94A" strokeWidth={14} opacity={0.45} filter={`url(#${id}glow)`} />
        <path d={path(line) ?? ""} fill="none" stroke="#FFE29A" strokeWidth={3.5} />
      </>
    );
  }
  return (
    <g>
      <defs>
        <radialGradient id={`${id}ocean`} cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#2E8BE0" /><stop offset="0.7" stopColor="#1554A8" /><stop offset="1" stopColor="#0A2C66" /></radialGradient>
        <radialGradient id={`${id}atmo`}><stop offset="0.82" stopColor="#5FB7FF" stopOpacity="0.55" /><stop offset="1" stopColor="#5FB7FF" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}shade`} cx="38%" cy="32%" r="75%"><stop offset="0" stopColor="#fff" stopOpacity="0.18" /><stop offset="0.55" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.35" /></radialGradient>
        <filter id={`${id}glow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <circle cx={cx} cy={cy} r={r * 1.13} fill={`url(#${id}atmo)`} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}ocean)`} />
      <path d={path(GRAT) ?? ""} fill="none" stroke="#9FD0FF" strokeOpacity={0.16} strokeWidth={1.2} />
      <path d={path(LAND) ?? ""} fill={kara} stroke="#2F7A44" strokeWidth={1.4} />
      <path d={path(BORDERS) ?? ""} fill="none" stroke="#2F7A44" strokeOpacity={0.6} strokeWidth={0.9} />
      {gece}
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}shade)`} />
      {ust?.(proj, path)}
    </g>
  );
};

/** Noktalar arasında kesikli, akan rota (ilerleme k: 0–1). */
export const rotaCizgisi = (noktalar: [number, number][], k: number) => {
  if (noktalar.length < 2 || k <= 0) return null;
  const n = noktalar.length - 1, u = Math.min(1, k) * n, i = Math.min(n - 1, Math.floor(u)), f = u - i;
  const [a, b] = [noktalar[i], noktalar[i + 1]];
  return { type: "LineString", coordinates: [...noktalar.slice(0, i + 1), [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]] } as any;
};
