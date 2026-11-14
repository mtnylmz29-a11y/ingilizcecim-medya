"""Çizgi film (kâğıt sahne) stili: spec'te "stil": "cizgi" olunca gen.py bunu çağırır.
Gökyüzü, kayan bulutlar, gülen güneş, tepeler, sallanan çiçekler; ipe asılı ahşap tabelalar
sallanarak iner; Fluent Emoji 3D çizimi zıplayarak gelir; altyazılar kelime kelime çıkar.
Biçim: sistem/ICERIK_BICIMI.md > Çizgi film stili."""
import json, random

def uret(spec, OUT, say, ikon, e, r, HERE):
    rnd = random.Random(7)
    clips, js, bg_js = [], [], []
    t = 0.0
    sahneler = spec["sahneler"]
    rozet = spec.get("rozet", "")

    def words(text, vurgu=(), cls="w"):
        vs = {v.lower().strip(".,!?;:") for v in vurgu}
        return " ".join(f'<span class="{cls}{" hl" if x.lower().strip(".,!?;:") in vs else ""}">{e(x)}</span>' for x in text.split())

    def tabela(id_, metin, cls="tb", ust=""):
        u = f'<i class="tbu">{e(ust)}</i>' if ust else ""
        return (f'<div class="{cls}" id="{id_}"><b class="ip ipl"></b><b class="ip ipr"></b>'
                f'<b class="civi cl"></b><b class="civi cr"></b>{u}<span>{e(metin)}</span></div>')

    def in_tabela(sel, at, J, gecikme=0):
        J.append(f'tl.fromTo("{sel}",{{y:-900,rotation:-9}},{{y:0,rotation:0,duration:1.1,ease:"elastic.out(1,0.45)"}},{r(at + gecikme)});')

    def altyazi(n, en, tr, vurgu, at_en, at_tr, J):
        h = '<div class="alty" id="al%d">' % n
        if en: h += f'<div class="en" id="en{n}">{words(en, vurgu)}</div>'
        if tr: h += f'<div class="tr" id="tr{n}">{e(tr)}</div>'
        h += "</div>"
        if en:
            J.append(f'tl.fromTo("#en{n} .w",{{scale:0,y:40,opacity:0}},{{scale:1,y:0,opacity:1,duration:.35,stagger:.11,ease:"back.out(2.2)"}},{r(at_en)});')
            J.append(f'tl.fromTo("#en{n} .hl",{{color:"#FFFFFF"}},{{color:"#FFD43B",duration:.2}},{r(at_en + .3)});')
        if tr:
            J.append(f'tl.fromTo("#tr{n}",{{opacity:0,y:30}},{{opacity:1,y:0,duration:.4,ease:"power3.out"}},{r(at_tr)});')
        return h

    def cizim(n, ad, J, at, cls="cz", boy=None):
        ik = ikon(ad)
        if not ik: return ""
        st = f' style="width:{boy}px;height:{boy}px"' if boy else ""
        J.append(f'tl.fromTo("#z{n}",{{y:420,scaleX:1.25,scaleY:.6,opacity:0}},{{y:0,scaleX:1,scaleY:1,opacity:1,duration:.9,ease:"elastic.out(1,0.5)"}},{r(at)});')
        J.append(f'tl.to("#z{n}",{{y:-26,duration:1.1,repeat:9,yoyo:true,ease:"sine.inOut"}},{r(at + 1)});')
        J.append(f'tl.fromTo("#zp{n} b",{{scale:0,opacity:1}},{{scale:1.4,opacity:0,duration:.8,stagger:.05,ease:"power2.out"}},{r(at + .25)});')
        pz = "".join(f'<b style="left:{50 + 46*__import__("math").cos(k*0.785):.0f}%;top:{50 + 46*__import__("math").sin(k*0.785):.0f}%"></b>' for k in range(8))
        return f'<div class="{cls}"><div class="parilti" id="zp{n}">{pz}</div><img id="z{n}" src="{ik}"{st}></div>'

    zemin_sira = []
    for n, s in enumerate(sahneler):
        k = s["tip"]; S = t; sid = f"s{n}"; J = []
        zemin_sira.append((S, s.get("zemin", spec.get("zemin", "cayir"))))
        rz = f'<div class="rozet" id="rz{n}">{e(s.get("rozet", rozet))}</div>' if s.get("rozet", rozet) else ""
        if rz: J.append(f'tl.fromTo("#rz{n}",{{scale:0}},{{scale:1,duration:.5,ease:"back.out(2)"}},{r(S + .1)});')
        if k in ("kapak", "kapanis"):
            d_tr = say(s.get("ses_tr"), S + 0.9, "tr")
            d_en = say(s.get("ses"), S + 0.9 + (d_tr + .25 if d_tr else 0), s.get("ses_dil", "en"))
            sure_ses = 0.9 + d_tr + (0.25 if d_tr and d_en else 0) + d_en
            dur = max(s.get("sure", 4.0), sure_ses + (1.0 if k == "kapak" else 2.2))
            et = "".join(f'<span>{e(x)}</span>' for x in s.get("etiketler", []))
            alt_en = s.get("alt_en", ""); alt = s.get("alt", "")
            h = (f'<div id="{sid}" class="clip sc" data-start="{r(S)}" data-duration="{r(dur)}" data-track-index="1">{rz}'
                 f'<div class="ust">{tabela(f"t{n}", s["baslik"], "tb buyuk")}</div>'
                 + cizim(n, s.get("ikon"), J, S + .6)
                 + (f'<div class="etk" id="et{n}">{et}</div>' if et else "")
                 + altyazi(n, alt_en, alt, s.get("vurgu", [s["baslik"]]), S + 1.0, S + 1.2, J) + "</div>")
            in_tabela(f"#t{n}", S + .15, J)
            if et: J.append(f'tl.fromTo("#et{n} span",{{y:160,opacity:0}},{{y:0,opacity:1,duration:.6,stagger:.12,ease:"back.out(1.8)"}},{r(S + 1.4)});')
            clips.append(h)
        elif k == "kelime":
            ust_t = tabela(f"t{n}", s["kelime"], "tb buyuk", s.get("tur", ""))
            an = tabela(f"a{n}", s["anlam"], "tb krem")
            d_tr = say(s.get("ses_tr"), S + 0.8, "tr")
            v_en = 0.8 + (d_tr + 0.3 if d_tr else 0)
            d_en = say(s.get("ses", s.get("ornek")), S + v_en, "en")
            dur = max(s.get("sure", 5.0), v_en + d_en + 1.4)
            h = (f'<div id="{sid}" class="clip sc" data-start="{r(S)}" data-duration="{r(dur)}" data-track-index="1">{rz}'
                 f'<div class="ust">{ust_t}{an}</div>' + cizim(n, s.get("ikon"), J, S + .9)
                 + altyazi(n, s.get("ornek", ""), s.get("ornek_tr", ""), s.get("vurgu", [s["kelime"]]), S + v_en, S + v_en + max(.6, d_en * .6), J) + "</div>")
            in_tabela(f"#t{n}", S + .1, J); in_tabela(f"#a{n}", S + .45, J)
            clips.append(h)
        elif k == "esanlam":
            es, zit = s.get("es", []), s.get("zit", [])
            d_tr = say(s.get("ses_tr"), S + 0.7, "tr")
            v_en = 0.7 + (d_tr + 0.3 if d_tr else 0)
            d_en = say(s.get("ses", ", ".join(es) + (". " + ", ".join(zit) + "." if zit else ".")), S + v_en, "en")
            n_tb = len(es) + len(zit)
            dur = max(s.get("sure", 5.0), v_en + d_en + 1.6, 1.2 + n_tb * .6 + 1.5)
            ic = "".join(tabela(f"e{n}_{j}", x, "tb yesil", "≈ eş anlamlı") for j, x in enumerate(es))
            ic += "".join(tabela(f"z{n}_{j}", x, "tb kirmizi", "≠ zıt anlamlı") for j, x in enumerate(zit))
            h = (f'<div id="{sid}" class="clip sc" data-start="{r(S)}" data-duration="{r(dur)}" data-track-index="1">{rz}'
                 f'<div class="ust">{tabela(f"t{n}", s["kelime"], "tb kucuk")}{ic}</div>'
                 + cizim(n, s.get("ikon"), J, S + 1.0 + n_tb * .55, "cz kose", 300)
                 + altyazi(n, s.get("alt_en", ""), s.get("alt", ""), (), S + v_en, S + .9, J) + "</div>")
            in_tabela(f"#t{n}", S + .05, J)
            for j in range(len(es)): in_tabela(f"#e{n}_{j}", S + .5 + j * .55, J)
            for j in range(len(zit)):
                at = S + .5 + (len(es) + j) * .55
                in_tabela(f"#z{n}_{j}", at, J)
                J.append(f'tl.fromTo("#z{n}_{j} span",{{"--cz":"0%"}},{{"--cz":"108%",duration:.4,ease:"power2.out"}},{r(at + 1.0)});')
            clips.append(h)
        elif k == "soru":
            sec = s["secenekler"]; dg = s["dogru"]
            d_q = say(s.get("ses", s["soru"].replace("___", "blank")), S + 0.7, "en")
            say_at = 0.7 + d_q + 0.3
            sayac = 3.0
            v_c = say_at + sayac
            d_c = say(s.get("ses_cevap"), S + v_c + .4, s.get("ses_cevap_dil", "en"))
            d_tr = say(s.get("ses_tr"), S + v_c + .4 + (d_c + .3 if d_c else 0), "tr")
            dur = max(s.get("sure", 7.0), v_c + .4 + d_c + (.3 + d_tr if d_tr else 0) + 2.4)
            harf = "ABCD"
            ic = "".join(tabela(f"o{n}_{j}", f"{harf[j]}) {x}", "tb krem secenek") for j, x in enumerate(sec))
            h = (f'<div id="{sid}" class="clip sc" data-start="{r(S)}" data-duration="{r(dur)}" data-track-index="1">{rz}'
                 f'<div class="ust">{tabela(f"t{n}", s.get("baslik", "QUIZ"), "tb kucuk")}'
                 f'<div class="kagit" id="q{n}">{words(s["soru"])}</div><div class="secler">{ic}</div></div>'
                 + cizim(n, s.get("ikon"), J, S + 1.4, "cz kose", 280) +
                 f'<div class="sayac" id="sy{n}"><span>3</span><span>2</span><span>1</span></div>'
                 + altyazi(n, "", s.get("aciklama", ""), (), 0, S + v_c + .6, J) + "</div>")
            in_tabela(f"#t{n}", S + .05, J)
            J.append(f'tl.fromTo("#q{n} .w",{{opacity:0,y:30}},{{opacity:1,y:0,duration:.3,stagger:.07,ease:"back.out(2)"}},{r(S + .5)});')
            for j in range(len(sec)): J.append(f'tl.fromTo("#o{n}_{j}",{{x:j%2?700:-700,rotation:j%2?12:-12}},{{x:0,rotation:0,duration:.8,ease:"back.out(1.4)"}},{r(S + .9 + j * .18)});'.replace("j%2", str(j % 2)))
            for q in range(3):
                J.append(f'tl.fromTo("#sy{n} span:nth-child({q+1})",{{scale:0,opacity:1}},{{scale:1.2,duration:.45,ease:"back.out(3)"}},{r(S + say_at + q)});')
                J.append(f'tl.to("#sy{n} span:nth-child({q+1})",{{scale:2,opacity:0,duration:.4,ease:"power2.in"}},{r(S + say_at + q + .6)});')
            for j in range(len(sec)):
                if j == dg:
                    J.append(f'tl.to("#o{n}_{j}",{{backgroundColor:"#7ED957",scale:1.08,duration:.35,ease:"back.out(3)"}},{r(S + v_c)});')
                else:
                    J.append(f'tl.to("#o{n}_{j}",{{y:1400,rotation:{25 if j % 2 else -25},opacity:.0,duration:.9,ease:"power2.in"}},{r(S + v_c + .1 + j * .08)});')
            clips.append(h)
        elif k in ("maddeler", "kural"):
            d_tr = say(s.get("ses_tr", s.get("ses") if s.get("ses_dil", "tr") == "tr" else None), S + .7, "tr")
            v_en = .7 + (d_tr + .3 if d_tr else 0)
            d_en = say(s.get("ses") if s.get("ses_dil", "tr") == "en" else None, S + v_en, "en")
            sat = s["satirlar"]
            dur = max(s.get("sure", 6.0), v_en + d_en + 1.3, 1.5 + len(sat) * .7 + 1.2)
            ic = "".join(f'<div class="kagit sat" id="m{n}_{j}">{e(x)}</div>' for j, x in enumerate(sat))
            h = (f'<div id="{sid}" class="clip sc" data-start="{r(S)}" data-duration="{r(dur)}" data-track-index="1">{rz}'
                 f'<div class="ust">{tabela(f"t{n}", s.get("baslik", ""), "tb")}{ic}</div>'
                 + cizim(n, s.get("ikon"), J, S + 1.2 + len(sat) * .5, "cz kose", 300) + "</div>")
            in_tabela(f"#t{n}", S + .05, J)
            for j in range(len(sat)):
                J.append(f'tl.fromTo("#m{n}_{j}",{{scale:0,rotation:-8}},{{scale:1,rotation:{(-1.5, 1.2, -0.8, 1.6)[j % 4]},duration:.6,ease:"back.out(2)"}},{r(S + .9 + j * .55)});')
            clips.append(h)
        else:
            raise SystemExit(f"cizgi stilinde bilinmeyen sahne tipi: {k}")
        if n < len(sahneler) - 1:
            J.append(f'tl.to("#{sid} .ust, #{sid} .cz, #{sid} .alty, #{sid} .etk",{{y:-1500,duration:.45,ease:"power3.in"}},{r(S + dur - .45)});')
        js += J; t = S + dur

    TOT = r(t)
    # --- arka plan: zeminler arası yumuşak geçiş
    zeminler = sorted({z for _, z in zemin_sira})
    for z in zeminler:
        bg_js.append(f'tl.set("#z_{z}",{{opacity:0}},0);')
    onceki = None
    for S, z in zemin_sira:
        if z != onceki:
            gv = 1 if z in ("cayir", "deniz") else 0
            if onceki is None:
                bg_js.append(f'tl.set("#z_{z}",{{opacity:1}},0);'); bg_js.append(f'tl.set("#gunes",{{opacity:{gv}}},0);')
            else:
                bg_js.append(f'tl.to("#z_{z}",{{opacity:1,duration:.6}},{r(max(0, S - .3))});')
                bg_js.append(f'tl.to("#z_{onceki}",{{opacity:0,duration:.6}},{r(max(0, S - .3))});')
                bg_js.append(f'tl.to("#gunes",{{opacity:{gv},duration:.6}},{r(max(0, S - .3))});')
        onceki = z
    # bulutlar, güneş, çiçekler: sürekli hareket
    bulut = ""
    for b in range(4):
        y = 180 + b * 150 + rnd.randint(-30, 30); x0 = rnd.randint(-300, 900); sc = rnd.uniform(.6, 1.1)
        bulut += f'<svg class="bulut" id="bu{b}" style="top:{y}px;left:{x0}px;transform:scale({sc:.2f})" viewBox="0 0 220 110"><path d="M40 95 Q5 95 12 70 Q10 45 45 48 Q55 15 95 22 Q120 0 150 25 Q195 20 195 60 Q215 90 180 95 Z" fill="#fff" stroke="#6B4423" stroke-width="5" stroke-linejoin="round"/></svg>'
        bg_js.append(f'tl.fromTo("#bu{b}",{{x:0}},{{x:{-(x0 + 400)},duration:{TOT},ease:"none"}},0);')
    cicek = ""
    renk = ["#FF6B8B", "#FFD43B", "#FF8C42", "#B983FF", "#FF5D5D"]
    for c in range(9):
        x = 40 + c * 118 + rnd.randint(-20, 20); y = 1560 + rnd.randint(0, 220); rk = renk[c % 5]
        cicek += (f'<svg class="cicek" id="ci{c}" style="left:{x}px;top:{y}px" viewBox="0 0 80 140"><path d="M40 140 Q38 90 40 55" stroke="#3E7D2A" stroke-width="7" fill="none"/>'
                  f'<path d="M40 105 Q20 90 14 98 Q24 112 40 108" fill="#5DBB3F" stroke="#3E7D2A" stroke-width="3"/>'
                  + "".join(f'<circle cx="{40 + 16*__import__("math").cos(a*1.2566):.1f}" cy="{40 + 16*__import__("math").sin(a*1.2566):.1f}" r="14" fill="{rk}" stroke="#6B4423" stroke-width="3"/>' for a in range(5))
                  + '<circle cx="40" cy="40" r="11" fill="#FFE27A" stroke="#6B4423" stroke-width="3"/></svg>')
        bg_js.append(f'tl.fromTo("#ci{c}",{{rotation:-6}},{{rotation:6,duration:{1.3 + c % 3 * .3:.1f},repeat:{int(TOT // 1.3) + 1},yoyo:true,ease:"sine.inOut"}},0);')
    bg_js.append(f'tl.fromTo("#gunes",{{rotation:-8,y:0}},{{rotation:8,y:-20,duration:2.2,repeat:{int(TOT // 2.2) + 1},yoyo:true,ease:"sine.inOut"}},0);')
    bg_js.append(f'tl.fromTo("#gunes .isin",{{rotation:0}},{{rotation:{int(TOT * 12)},duration:{TOT},ease:"none"}},0);')
    bg_js.append(f'tl.fromTo("#bayrak",{{y:0}},{{y:8,duration:.9,repeat:{int(TOT // .9) + 1},yoyo:true,ease:"sine.inOut"}},0);')
    bg_js.append(f'tl.fromTo("#yildiz i",{{opacity:.3}},{{opacity:1,duration:.7,stagger:{{each:.13,repeat:{int(TOT // .7) + 1},yoyo:true}},ease:"sine.inOut"}},0);')
    isin = "".join(f'<path d="M110 110 L{110 + 105*__import__("math").cos(a*0.5236 - .1):.0f} {110 + 105*__import__("math").sin(a*0.5236 - .1):.0f} L{110 + 105*__import__("math").cos(a*0.5236 + .1):.0f} {110 + 105*__import__("math").sin(a*0.5236 + .1):.0f}Z" fill="#FFC93C"/>' for a in range(12))
    gunes = (f'<svg id="gunes" viewBox="0 0 220 220"><g class="isin" style="transform-origin:110px 110px">{isin}</g>'
             '<circle cx="110" cy="110" r="62" fill="#FFD43B" stroke="#6B4423" stroke-width="6"/>'
             '<circle cx="90" cy="102" r="7" fill="#4A2E17"/><circle cx="130" cy="102" r="7" fill="#4A2E17"/>'
             '<circle cx="78" cy="122" r="9" fill="#FF9AA2" opacity=".8"/><circle cx="142" cy="122" r="9" fill="#FF9AA2" opacity=".8"/>'
             '<path d="M92 126 Q110 142 128 126" stroke="#4A2E17" stroke-width="6" fill="none" stroke-linecap="round"/></svg>')
    bayrak_r = ["#FF6B8B", "#4CC9F0", "#FFD43B", "#7ED957", "#B983FF", "#FF8C42"]
    bayrak = '<svg id="bayrak" viewBox="0 0 1080 120"><path d="M-10 20 Q540 70 1090 20" stroke="#6B4423" stroke-width="5" fill="none"/>' + "".join(
        f'<path d="M{x} {20 + 50*(1-((x+35-540)/550)**2):.0f} l70 0 l-35 60z" fill="{bayrak_r[i % 6]}" stroke="#6B4423" stroke-width="3" stroke-linejoin="round"/>'
        for i, x in enumerate(range(0, 1080, 90))) + "</svg>"
    yildiz = "".join(f'<i style="left:{rnd.randint(30, 1040)}px;top:{rnd.randint(60, 1100)}px"></i>' for _ in range(28))
    tepe = lambda c1, c2, c3: (f'<svg class="tepe" viewBox="0 0 1080 900" preserveAspectRatio="none">'
                               f'<path d="M0 260 Q200 120 420 230 Q640 330 820 190 Q960 110 1080 200 L1080 900 L0 900Z" fill="{c1}" stroke="#6B4423" stroke-width="6"/>'
                               f'<path d="M0 420 Q260 300 540 400 Q800 490 1080 360 L1080 900 L0 900Z" fill="{c2}" stroke="#6B4423" stroke-width="6"/>'
                               f'<path d="M0 560 Q540 500 1080 560 L1080 900 L0 900Z" fill="{c3}" stroke="#6B4423" stroke-width="6"/></svg>')
    ZEMIN = {
        "cayir": f'<div class="zemin" id="z_cayir" style="background:linear-gradient(#9FD8FF,#E3F5FF 55%)">{tepe("#A8DB6A", "#86C94E", "#79BD45")}</div>',
        "senlik": f'<div class="zemin" id="z_senlik" style="background:linear-gradient(#FFB36B,#FFE0B8 55%)">{bayrak}{tepe("#F5A15F", "#D9A4F0", "#C990E6")}</div>',
        "gece": f'<div class="zemin" id="z_gece" style="background:linear-gradient(#1E2A5A,#46407A 60%)"><div id="yildiz">{yildiz}</div><div class="ay"></div>{tepe("#3D5A80", "#2F4B6E", "#263E5C")}</div>',
        "deniz": f'<div class="zemin" id="z_deniz" style="background:linear-gradient(#7FD3FF,#E6F8FF 50%)">{tepe("#4FB3E8", "#2E95D3", "#F4D58D")}</div>',
    }
    for z in zeminler:
        if z not in ZEMIN: raise SystemExit(f"bilinmeyen zemin: {z} (cayir | senlik | gece | deniz)")
    arka = "".join(ZEMIN[z] for z in zeminler)

    audio = "\n".join(f'<audio id="{i}" src="assets/ses/{i}.wav" data-start="{a}" data-duration="{d}" data-volume="1" data-track-index="{10 + j % 2}"></audio>'
                      for j, (i, a, d) in enumerate(say.SES))
    KAH = "#6B4423"
    CSS = f'''
@font-face{{font-family:"Baloo 2";src:url("assets/fonts/Baloo2.ttf");font-weight:400 800}}
@font-face{{font-family:"NunitoX";src:url("assets/fonts/Nunito.ttf");font-weight:200 1000}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1920px;overflow:hidden;background:#9FD8FF}}
#root{{width:1080px;height:1920px;position:relative;font-family:"NunitoX";color:#3B2412}}
#bg{{position:absolute;inset:0;overflow:hidden}}
.zemin{{position:absolute;inset:0}}
.tepe{{position:absolute;left:-20px;width:1120px;bottom:0;height:900px}}
.bulut{{position:absolute;width:220px;height:110px;transform-origin:0 0;z-index:1}}
#gunes{{position:absolute;right:30px;top:260px;width:240px;height:240px;z-index:1}}
#bayrak{{position:absolute;left:0;top:150px;width:1080px;height:120px}}
#yildiz i{{position:absolute;width:10px;height:10px;border-radius:50%;background:#FFF6C2;box-shadow:0 0 12px #FFF6C2}}
.ay{{position:absolute;right:90px;top:250px;width:170px;height:170px;border-radius:50%;background:#FFF1B8;box-shadow:-34px 0 0 0 #FFE27A inset,0 0 60px rgba(255,241,184,.6);border:5px solid {KAH}}}
.cicek{{position:absolute;width:80px;height:140px;transform-origin:50% 100%;z-index:2}}
#kagit{{position:absolute;inset:0;z-index:30;pointer-events:none;opacity:.22;mix-blend-mode:multiply;
 background-image:repeating-radial-gradient(circle at 17% 32%,rgba(120,80,40,.10) 0 1px,transparent 1px 4px),repeating-linear-gradient(97deg,rgba(120,80,40,.06) 0 2px,transparent 2px 9px)}}
#vinyet{{position:absolute;inset:0;z-index:29;pointer-events:none;box-shadow:inset 0 0 220px rgba(80,45,15,.35)}}
.logo{{position:absolute;bottom:120px;left:0;right:0;text-align:center;font:800 40px "Baloo 2";color:#fff;z-index:20;-webkit-text-stroke:8px {KAH};paint-order:stroke fill}}
#bar{{position:absolute;left:120px;right:120px;bottom:90px;height:14px;border-radius:8px;background:rgba(255,255,255,.6);border:3px solid {KAH};z-index:20;overflow:hidden}}
#bar i{{display:block;height:100%;background:#FFD43B;transform-origin:0 50%}}
.sc{{position:absolute;inset:0;z-index:5}}
.rozet{{position:absolute;top:120px;left:50%;margin-left:-230px;width:460px;text-align:center;font:800 38px "Baloo 2";letter-spacing:2px;color:{KAH};background:#FFF8E8;border:5px solid {KAH};border-radius:40px;padding:4px 0;z-index:6}}
.ust{{position:absolute;left:70px;right:70px;top:230px;display:flex;flex-direction:column;align-items:center;gap:26px}}
.tb{{position:relative;min-width:420px;max-width:940px;padding:26px 54px 24px;text-align:center;background:#F0A04B;border:7px solid {KAH};border-radius:22px;
 box-shadow:0 14px 0 rgba(107,68,35,.35),inset 0 -12px 0 rgba(0,0,0,.08),inset 0 8px 0 rgba(255,255,255,.25);transform-origin:50% -120px;
 background-image:repeating-linear-gradient(0deg,rgba(107,68,35,.10) 0 3px,transparent 3px 26px)}}
.tb span{{position:relative;display:inline-block;font:800 74px/1.05 "Baloo 2";color:#FFE27A;-webkit-text-stroke:12px {KAH};paint-order:stroke fill;--cz:0%}}
.tb.buyuk span{{font-size:118px}}
.tb.kucuk span{{font-size:60px}}
.tb.krem{{background-color:#FFF3DC}}.tb.krem span{{color:#4A2E17;-webkit-text-stroke:0;font-size:62px}}
.tb.yesil,.tb.kirmizi{{margin-top:18px}}
.tb.yesil{{background-color:#D9F5B0}}.tb.yesil span{{color:#2F6B1F;-webkit-text-stroke:0;font-size:72px}}
.tb.kirmizi{{background-color:#FFD6C9}}.tb.kirmizi span{{color:#8A2E1C;-webkit-text-stroke:0;font-size:72px}}
.tb.kirmizi span::after{{content:"";position:absolute;left:-8px;top:52%;height:10px;width:var(--cz);background:#E5383B;border-radius:5px;transform:rotate(-4deg)}}
.tb.secenek{{min-width:0;width:440px;padding:18px 20px}}.tb.secenek span{{font-size:54px}}
.tbu{{position:absolute;top:-30px;left:50%;transform:translateX(-50%);font:800 28px "NunitoX";font-style:normal;color:#fff;background:#E5383B;border:4px solid {KAH};border-radius:20px;padding:2px 18px;white-space:nowrap}}
.ip{{position:absolute;top:-130px;width:7px;height:130px;background:#8A5A2B}}.ipl{{left:18%}}.ipr{{right:18%}}
.civi{{position:absolute;top:12px;width:16px;height:16px;border-radius:50%;background:#7A5230;border:3px solid {KAH}}}.cl{{left:20px}}.cr{{right:20px}}
.secler{{display:grid;grid-template-columns:1fr 1fr;gap:26px 30px;margin-top:20px}}.secler .ip{{display:none}}
.kagit{{max-width:920px;font:800 60px/1.25 "NunitoX";color:#3B2412;background:#FFFBF0;border:6px solid {KAH};border-radius:26px;padding:28px 36px;box-shadow:0 12px 0 rgba(107,68,35,.3);text-align:center}}
.kagit .w{{display:inline-block}}
.sat{{font-size:54px;text-align:left;width:100%}}
.cz{{position:absolute;left:0;right:0;top:880px;height:560px;display:flex;justify-content:center;z-index:4}}
.cz img{{width:500px;height:500px;filter:drop-shadow(0 26px 0 rgba(107,68,35,.25))}}
.cz.kose{{top:auto;bottom:560px;left:auto;right:40px;width:300px;height:300px}}
.parilti{{position:absolute;left:50%;top:50%;width:620px;height:620px;margin:-330px 0 0 -310px}}
.parilti b{{position:absolute;width:34px;height:34px;margin:-17px;background:#FFE27A;border:4px solid {KAH};transform:rotate(45deg);border-radius:6px}}
.alty{{position:absolute;left:50px;right:50px;bottom:270px;text-align:center;z-index:8}}
.alty .en{{font:800 76px/1.12 "Baloo 2";color:#fff;-webkit-text-stroke:14px {KAH};paint-order:stroke fill}}
.alty .en .w{{display:inline-block}}
.alty .tr{{margin-top:10px;font:900 48px/1.2 "NunitoX";color:#fff;-webkit-text-stroke:10px {KAH};paint-order:stroke fill}}
.etk{{position:absolute;left:60px;right:60px;top:1480px;display:flex;flex-wrap:wrap;justify-content:center;gap:18px;z-index:8}}
.etk span{{font:800 46px "Baloo 2";color:{KAH};background:#FFF8E8;border:5px solid {KAH};border-radius:30px;padding:4px 28px}}
.sayac{{position:absolute;left:0;right:0;top:1330px;height:220px;z-index:9}}
.sayac span{{position:absolute;left:50%;top:0;width:200px;height:200px;margin-left:-100px;border-radius:50%;background:#FFD43B;border:8px solid {KAH};font:800 130px/190px "Baloo 2";text-align:center;color:{KAH};opacity:0}}
'''
    H = f'''<!doctype html>
<html lang="tr" data-resolution="portrait">
<head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920">
<script src="assets/gsap.min.js"></script><style>{CSS}</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOT}" data-width="1080" data-height="1920">
<div id="bg">{arka}{bulut}{gunes}{cicek}</div>
<div id="vinyet"></div><div id="kagit"></div>
<div class="logo">ingilizcecim.com</div><div id="bar"><i></i></div>
{chr(10).join(clips)}
{audio}
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(bg_js)}
tl.fromTo("#bar i",{{scaleX:0}},{{scaleX:1,duration:{TOT},ease:"none"}},0);
{chr(10).join(js)}
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body></html>'''
    (OUT / "index.html").write_text(H)
    return TOT
