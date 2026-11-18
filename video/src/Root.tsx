import React from "react";
import { Composition } from "remotion";
import { Etym, Veri } from "./Etym";
import { Dunya, DunyaVeri } from "./Dunya";
import { Sinav, SinavSpec, sinavAnlar } from "./Sinav";

// Render: npx remotion render <Etym|Dunya> out.mp4 --props=veri.json   (veri.json = {"veri": {"spec": ..., "tl": ...}}; build.sh üretir)
const bos: Veri = { spec: { kelime: "word", koken: { zemin: "roma", etiket: "", kok: "", parcalar: [], karakter: { kostum: "toga" } }, degisim: { duraklar: [] }, ornek: { en: "", tr: "" } }, tl: { fps: 30, dur: 5, lines: [] } };
const bosDunya: DunyaVeri = {
  spec: { bicim: "dunya", ad: "ornek", baslik: { ust: "Hello" }, sehirler: [{ id: "a", ad: "İstanbul", lon: 29, lat: 41, dil_adi: "Türkçe", yazi: "Merhaba" }], ders: { satirlar: [] }, kapanis: { soru: "?" } },
  tl: { fps: 30, dur: 5, lines: [] },
};
// Sinav: props = spec'in kendisi (veri sarmalı yok); örnek: video/ornekler/sinav_responsible-for.json
const ornekSinav: SinavSpec = { etiket: "YDS · DİLBİLGİSİ", soruNo: 1, soru: "She has lived here ---- 2019.", ikon: "takvim", secenekler: ["for", "since", "during", "ago", "while"],
  dogru: 1, eleme: [{ sik: 0, neden: "for + süre alır" }], kural: "since + başlangıç\nfor + süre", kuralOrnek: "since 2019 · for six years" };
const sure = (p: { veri: { tl: { dur: number } } }) => ({ durationInFrames: Math.max(30, Math.ceil(p.veri.tl.dur * 30)) });

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Etym" component={Etym} width={1080} height={1920} fps={30} durationInFrames={150} defaultProps={{ veri: bos }} calculateMetadata={({ props }) => sure(props)} />
    <Composition id="Dunya" component={Dunya} width={1080} height={1920} fps={30} durationInFrames={150} defaultProps={{ veri: bosDunya }} calculateMetadata={({ props }) => sure(props)} />
    <Composition id="Sinav" component={Sinav} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={ornekSinav} calculateMetadata={({ props }) => ({ durationInFrames: sinavAnlar(props.eleme.length).toplam })} />
  </>
);
