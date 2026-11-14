import React from "react";
import { Composition } from "remotion";
import { Etym, Veri } from "./Etym";

// Render: npx remotion render Etym out.mp4 --props=veri.json   (veri.json = {"veri": {"spec": ..., "tl": ...}})
const bos: Veri = { spec: { kelime: "word", koken: { zemin: "roma", etiket: "", kok: "", parcalar: [], karakter: { kostum: "toga" } }, degisim: { duraklar: [] }, ornek: { en: "", tr: "" } }, tl: { fps: 30, dur: 5, lines: [] } };

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Etym"
    component={Etym}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={150}
    defaultProps={{ veri: bos }}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.ceil(props.veri.tl.dur * 30) })}
  />
);
