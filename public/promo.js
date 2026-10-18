/* ── CookFire · Tanıtım videosu (/promo) ─────────────────
   Instagram Reels / Story için 9:16 video: şarkılar cihazdan seçilir (sunucuya gitmez), her şarkının dinlenerek
   seçilen bölümü sırayla çalar; sıradaki şarkının kapağı arkada bekler, sırası gelince yumuşak geçişle öne çıkar.
   Arka plan kapağın renklerinden üretilir ve şarkılar arasında akarak değişir.
   Sahne 1080×1920 tuvalde zaman çizelgesinin saf fonksiyonu olarak çizilir (draw(t)) → önizleme ile indirilen
   video birebir aynıdır. Kayıt: canvas.captureStream + Web Audio → MediaRecorder (tarayıcı destekliyorsa MP4). */
(() => {
  const EMB = window.parent !== window; // uygulama içinde (kütüphane › Tanıtım videosu) tam ekran katmanda açık
  const T = (s) => (window.I18N && window.I18N.t ? window.I18N.t(s) : s);
  const W = 1080, H = 1920, FPS = 50; // FPS: dalga formu çözünürlüğü (saniyedeki tepe sayısı)
  const XF = 0.6, TR_A = 0.55, TR_B = 0.75, INTRO = 0.5, TAIL = 0.8; // ses örtüşmesi, geçiş penceresi, giriş, bitiş
  const CY = 760, CS = 600; // kapak kartı merkezi ve boyutu
  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const lerp = (a, b, f) => a + (b - a) * f;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const cv = $("#cv"), g = cv.getContext("2d");
  const tracks = [];
  let TL = [], uid = 0;
  let ac = null, master = null;
  const audio = () => {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "playback" });
      master = ac.createGain();
      master.connect(ac.destination);
    }
    return ac;
  };

  // ── Zaman çizelgesi: şarkı i, T_i anında başlar; sonraki XF kadar örtüşür (ses geçişi)
  let BEATS = []; // tüm videonun vuruş anları (zaman çizelgesi saniyesi)
  function timeline() {
    let T = INTRO;
    const tl = tracks.map((k) => { const d = k.end - k.start, o = { k, T, d }; T += d - XF; return o; });
    BEATS = tl.flatMap((o) => (o.k.beats || []).filter((b) => b >= o.k.start && b < o.k.end).map((b) => o.T + b - o.k.start)).sort((a, b) => a - b);
    return tl;
  }
  // Vuruş zarfı: son vuruştan sonra hızla sönen 0–1 değer (yazı ve marka nabzı)
  function beatEnv(t) {
    let lo = 0, hi = BEATS.length - 1, b = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (BEATS[m] <= t) { b = BEATS[m]; lo = m + 1; } else hi = m - 1; }
    return b < 0 ? 0 : Math.exp(-(t - b) * 7);
  }
  // Kelime zamanlaması: her kelime bir vuruşa oturur; okunabilirlik için en az MIN_GAP aralık, vuruş yoksa sabit tempo
  const MIN_GAP = 0.34, MAX_GAP = 0.9, FALLBACK = 0.5;
  function wordTimes(n, t0) {
    const out = [];
    let prev = t0 - MIN_GAP;
    for (let i = 0; i < n; i++) {
      const from = prev + MIN_GAP, b = BEATS.find((x) => x >= from && x <= prev + MAX_GAP);
      prev = b !== undefined ? b : Math.max(from, prev + FALLBACK);
      out.push(prev);
    }
    return out;
  }
  const total = (tl) => (tl.length ? tl[tl.length - 1].T + tl[tl.length - 1].d + TAIL : 0);
  // Sürekli konum: 0 = ilk şarkı önde, 1 = ikinci… (geçişler yumuşatılmış)
  function posAt(tl, t) {
    let p = 0;
    for (let j = 1; j < tl.length; j++) p += ease(clamp((t - (tl[j].T - TR_A)) / (TR_A + TR_B)));
    return p;
  }

  // ── Ses çözümleme + dalga formu
  function peaksOf(buf) {
    const n = Math.ceil(buf.duration * FPS), out = new Float32Array(n), per = buf.sampleRate / FPS;
    const ch = [...Array(buf.numberOfChannels)].map((_, i) => buf.getChannelData(i));
    for (let i = 0; i < n; i++) {
      let m = 0;
      const a = Math.floor(i * per), b = Math.min(buf.length, Math.floor((i + 1) * per));
      for (const c of ch) for (let s = a; s < b; s += 3) { const v = Math.abs(c[s]); if (v > m) m = v; }
      out[i] = m;
    }
    const sorted = Float32Array.from(out).sort();
    return { fine: out, norm: sorted[Math.floor(sorted.length * 0.98)] || 1 };
  }
  // Varsayılan bölüm: en yüksek enerjili pencere (genelde nakarat) → kanca
  function bestWindow(k, len) {
    const f = k.fine, L = Math.round(len * FPS);
    if (f.length <= L) return 0;
    let sum = 0, best = -1, at = 0;
    for (let i = 0; i < f.length; i++) {
      sum += f[i] * f[i];
      if (i >= L) sum -= f[i - L] * f[i - L];
      if (i >= L - 1 && i - L + 1 >= f.length * 0.04 && sum > best) { best = sum; at = i - L + 1; }
    }
    return Math.round((at / FPS) * 10) / 10;
  }
  // Vuruş algılama: enerji ani yükselişleri (onset) — yerel tepe, önceki 160 ms ortalamasının belirgin üstünde
  function beatsOf(fine, norm) {
    const e = Array.from(fine, (v) => (v / norm) ** 2), out = [], N = 8;
    let last = -1e9;
    for (let i = N; i < e.length - 1; i++) {
      let avg = 0;
      for (let j = i - N; j < i; j++) avg += e[j];
      avg /= N;
      if (e[i] - avg > 0.05 && e[i] > avg * 1.6 && e[i] >= e[i - 1] && e[i] >= e[i + 1] && i - last >= FPS * 0.22) { out.push(i / FPS); last = i; }
    }
    return out;
  }
  function peakAt(k, t, dt) {
    const a = Math.floor(t * FPS), b = Math.max(a + 1, Math.floor((t + dt) * FPS));
    if (b <= 0 || a >= k.fine.length) return 0;
    let m = 0;
    for (let i = Math.max(0, a); i < Math.min(b, k.fine.length); i++) if (k.fine[i] > m) m = k.fine[i];
    return clamp(m / k.norm);
  }

  // ── Renk paleti: kapaktaki baskın canlı renk + ikinci renk + koyu zemin
  function rgb2hsl(r, g2, b) {
    r /= 255; g2 /= 255; b /= 255;
    const mx = Math.max(r, g2, b), mn = Math.min(r, g2, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    const hh = mx === r ? (g2 - b) / d + (g2 < b ? 6 : 0) : mx === g2 ? (b - r) / d + 2 : (r - g2) / d + 4;
    return [hh * 60, s, l];
  }
  const hsl = (hh, s, l, a = 1) => `hsla(${hh.toFixed(1)},${(s * 100).toFixed(1)}%,${(l * 100).toFixed(1)}%,${a})`;
  function palette(src) {
    const c = document.createElement("canvas"); c.width = c.height = 48;
    const x = c.getContext("2d", { willReadFrequently: true });
    try { x.drawImage(src, 0, 0, 48, 48); } catch (e) { return null; }
    const d = x.getImageData(0, 0, 48, 48).data, bins = Array.from({ length: 18 }, () => ({ w: 0, h: 0, s: 0, l: 0 }));
    for (let i = 0; i < d.length; i += 4) {
      const [hh, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]);
      if (l < 0.08 || l > 0.94) continue;
      const w = s * s * (1 - Math.abs(l - 0.5) * 1.4) + 0.002, b = bins[Math.floor(hh / 20) % 18];
      b.w += w; b.h += hh * w; b.s += s * w; b.l += l * w;
    }
    const ranked = bins.map((b, i) => ({ ...b, i })).filter((b) => b.w > 0).sort((a, b) => b.w - a.w);
    if (!ranked.length) return null;
    const col = (b) => ({ h: b.h / b.w, s: clamp(b.s / b.w, 0.35, 0.95), l: clamp(b.l / b.w, 0.42, 0.62) });
    const a = col(ranked[0]);
    const sec = ranked.find((b) => Math.min(Math.abs(b.i - ranked[0].i), 18 - Math.abs(b.i - ranked[0].i)) >= 3 && b.w > ranked[0].w * 0.12);
    const b = sec ? col(sec) : { h: (a.h + 28) % 360, s: a.s, l: a.l * 0.8 };
    return { a, b };
  }
  const BRAND = { a: { h: 40, s: 0.9, l: 0.6 }, b: { h: 20, s: 0.95, l: 0.55 } };

  // Arka plan önceden çizilir (her karede bulanıklık hesaplanmaz): bulanık kapak + palet ışıkları + karartma
  function makeBg(k) {
    const c = document.createElement("canvas"); c.width = 540; c.height = 960;
    const x = c.getContext("2d"), P = k.pal;
    x.fillStyle = hsl(P.a.h, P.a.s * 0.55, 0.07); x.fillRect(0, 0, 540, 960);
    if (k.cover) {
      x.save(); x.filter = "blur(46px) saturate(1.35)"; x.globalAlpha = 0.6;
      coverFit(x, k.cover.el, -80, -80, 700, 1120); x.restore();
    }
    const glow = (cx, cy, r, col, a) => { const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, hsl(col.h, col.s, col.l, a)); gr.addColorStop(1, hsl(col.h, col.s, col.l, 0)); x.fillStyle = gr; x.fillRect(0, 0, 540, 960); };
    glow(150, 230, 420, P.a, 0.5);
    glow(440, 760, 420, P.b, 0.4);
    const sh = x.createLinearGradient(0, 0, 0, 960);
    sh.addColorStop(0, "rgba(0,0,0,.28)"); sh.addColorStop(0.45, "rgba(0,0,0,.12)"); sh.addColorStop(1, "rgba(0,0,0,.62)");
    x.fillStyle = sh; x.fillRect(0, 0, 540, 960);
    const vg = x.createRadialGradient(270, 440, 200, 270, 480, 700);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.45)");
    x.fillStyle = vg; x.fillRect(0, 0, 540, 960);
    return c;
  }
  function srcSize(el) { return el.videoWidth ? [el.videoWidth, el.videoHeight] : [el.naturalWidth || el.width, el.naturalHeight || el.height]; }
  function coverFit(x, el, dx, dy, dw, dh) {
    const [sw, sh] = srcSize(el);
    if (!sw || !sh) return;
    const s = Math.max(dw / sw, dh / sh), w = dw / s, hh = dh / s;
    x.drawImage(el, (sw - w) / 2, (sh - hh) / 2, w, hh, dx, dy, dw, dh);
  }
  // Kapak yoksa: paletten degrade + baş harf
  function placeholder(title) {
    const c = document.createElement("canvas"); c.width = c.height = 600;
    const x = c.getContext("2d"), gr = x.createLinearGradient(0, 0, 600, 600);
    gr.addColorStop(0, "#FFD978"); gr.addColorStop(0.45, "#F5B83D"); gr.addColorStop(1, "#C8301E");
    x.fillStyle = gr; x.fillRect(0, 0, 600, 600);
    x.fillStyle = "rgba(26,18,8,.85)"; x.font = '700 300px "Grenze Gotisch"'; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText((title || "C").trim().charAt(0).toLocaleUpperCase("tr") || "C", 300, 320);
    return c;
  }

  // ── Çizim
  const upper = (s) => (/[çğıöşüİ]/i.test(s) ? s.toLocaleUpperCase("tr") : s.toUpperCase());
  function fitFont(text, weight, size, family, maxW) {
    let s = size;
    do { g.font = `${weight} ${s}px ${family}`; s -= 2; } while (g.measureText(text).width > maxW && s > 28);
  }
  function wrap(text, maxW, maxLines) {
    const words = text.split(/\s+/).filter(Boolean), lines = [];
    let cur = "";
    for (const w of words) {
      const t = cur ? cur + " " + w : w;
      if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines.slice(0, maxLines);
  }
  function pill(x, y, w, hh, r) { g.beginPath(); g.roundRect(x, y, w, hh, r); }

  // Arka plan: yüklenen görsel / video tüm ekranı kaplar (net); alttan koyulaşan gölge yukarı doğru açılır.
  // Yavaş yakınlaşma + şarkılar arası yumuşak geçiş (alfa). Video kapak canlı oynar.
  // z: geçiş yakınlaşması (giden büyüyerek söner, gelen yakından yerine oturur) · amp: vuruşla hafif nefes
  function drawBg(k, a, t, z = 0, amp = 0) {
    if (a <= 0) return;
    const s = 1.04 + Math.sin(t * 0.21) * 0.025 + z + amp * 0.012, dx = Math.sin(t * 0.15) * 14;
    g.save(); g.globalAlpha = a;
    const el = k.cover ? k.cover.el : null;
    if (el) coverFit(g, el, (W - W * s) / 2 + dx, (H - H * s) / 2, W * s, H * s);
    else g.drawImage(k.bg, 0, 0, W, H);
    const P = k.pal.a, sh = g.createLinearGradient(0, 0, 0, H);
    sh.addColorStop(0, "rgba(0,0,0,.30)");
    sh.addColorStop(0.2, "rgba(0,0,0,.06)");
    sh.addColorStop(0.42, "rgba(0,0,0,.12)");
    sh.addColorStop(0.6, hsl(P.h, P.s * 0.4, 0.05, 0.62));
    sh.addColorStop(0.8, hsl(P.h, P.s * 0.4, 0.04, 0.86));
    sh.addColorStop(1, hsl(P.h, P.s * 0.4, 0.03, 0.95));
    g.fillStyle = sh; g.fillRect(0, 0, W, H);
    g.restore();
  }

  function cardTf(r) {
    if (r < 0) return { x: 540 + r * 760, s: 1 + r * 0.14, a: 1 + r, rot: r * 0.07, dim: 0 };
    if (r <= 1) return { x: 540 + r * 300, s: 1 - r * 0.22, a: 1, rot: r * 0.055, dim: r * 0.42 };
    const q = r - 1;
    return { x: 840 + q * 200, s: 0.78 - q * 0.1, a: 1 - q, rot: 0.055 + q * 0.03, dim: 0.42 };
  }
  // Kart görselin kendi oranında (kırpılmadan tam görünür): en çok 560 geniş × 640 yüksek
  function cardSize(k) {
    const el = k.cover ? k.cover.el : k.ph, [sw, sh] = srcSize(el);
    if (!sw || !sh) return [CS, CS];
    const sc = Math.min(560 / sw, 640 / sh);
    return [Math.round(sw * sc) + 24, Math.round(sh * sc) + 24];
  }
  function drawCard(k, r, intro, pulse) {
    const T = cardTf(r), s = T.s * (r > -0.5 && r < 0.5 ? 1 + pulse : 1) * lerp(0.92, 1, intro);
    if (T.a <= 0.01) return;
    const [cw, ch] = cardSize(k);
    g.save();
    g.translate(T.x, CY + (1 - intro) * 40); g.rotate(T.rot); g.scale(s, s);
    g.globalAlpha = T.a * intro;
    g.shadowColor = "rgba(0,0,0,.55)"; g.shadowBlur = 80; g.shadowOffsetY = 34;
    pill(-cw / 2, -ch / 2, cw, ch, 44); g.fillStyle = "#fff"; g.fill();
    g.shadowColor = "transparent";
    pill(-cw / 2 + 12, -ch / 2 + 12, cw - 24, ch - 24, 34); g.clip();
    coverFit(g, k.cover ? k.cover.el : k.ph, -cw / 2 + 12, -ch / 2 + 12, cw - 24, ch - 24);
    if (T.dim > 0) { g.fillStyle = `rgba(0,0,0,${T.dim})`; g.fillRect(-cw / 2, -ch / 2, cw, ch); }
    g.restore();
  }

  function drawWave(k, prog, a) {
    const BW = 560, BH = 196, BX = (W - BW) / 2, MID = 1630, BY = MID - BH / 2, step = 26, bw = 12;
    const n = Math.round(BW / step), dt = (k.end - k.start) / n, px = BX + BW * prog;
    g.globalAlpha = a;
    // Bölüm dışındaki dalga (soluk)
    for (let i = -16; i < n + 16; i++) {
      if (i >= 0 && i < n) continue;
      const cx = BX + step / 2 + i * step;
      if (cx < -bw || cx > W + bw) continue;
      const v = peakAt(k, k.start + i * dt, dt), hh = 22 + v * 74;
      pill(cx - bw / 2, MID - hh / 2, bw, hh, 6); g.fillStyle = "rgba(255,255,255,.3)"; g.fill();
    }
    // Bölüm kutusu
    g.shadowColor = "rgba(0,0,0,.35)"; g.shadowBlur = 40; g.shadowOffsetY = 14;
    pill(BX - 16, BY - 16, BW + 32, BH + 32, 36); g.fillStyle = "rgba(236,234,238,.96)"; g.fill();
    g.shadowColor = "transparent";
    pill(BX, BY, BW, BH, 24); g.fillStyle = "#fff"; g.fill();
    g.save(); pill(BX, BY, BW, BH, 24); g.clip();
    const gr = g.createLinearGradient(BX, 0, BX + BW, 0);
    gr.addColorStop(0, "#FFD23F"); gr.addColorStop(0.55, "#FF7A2F"); gr.addColorStop(1, "#E3334A");
    g.fillStyle = gr; g.fillRect(BX, BY, BW * prog, BH);
    g.restore();
    for (let i = 0; i < n; i++) {
      const cx = BX + step / 2 + i * step, v = peakAt(k, k.start + i * dt, dt), hh = 26 + v * 112;
      pill(cx - bw / 2, MID - hh / 2, bw, hh, 6);
      g.fillStyle = cx < px ? "rgba(255,255,255,.82)" : "#D7D6DC"; g.fill();
    }
    g.globalAlpha = 1;
  }

  function drawInfo(o, t, a, playing) {
    const k = o.k, local = clamp((t - o.T) / o.d), left = Math.max(0, Math.ceil(o.d - Math.max(0, t - o.T)));
    const dy = (1 - a) * 24;
    g.save(); g.globalAlpha = a; g.textAlign = "center"; g.textBaseline = "alphabetic";
    g.shadowColor = "rgba(0,0,0,.35)"; g.shadowBlur = 24;
    const title = upper(k.title || T("Adsız"));
    fitFont(title, 800, 60, '"Bricolage Grotesque"', 880);
    g.fillStyle = "#fff"; g.fillText(title, W / 2, (k.artist ? 1254 : 1296) + dy); // ilerleme çubuğuna yakın
    if (k.artist) { fitFont(k.artist, 500, 36, "Geist", 860); g.fillStyle = "rgba(255,255,255,.66)"; g.fillText(k.artist, W / 2, 1300 + dy); }
    g.shadowColor = "transparent";
    // İlerleme çizgisi
    const x0 = 190, x1 = 890, py = 1352;
    pill(x0, py - 4, x1 - x0, 8, 4); g.fillStyle = "rgba(255,255,255,.18)"; g.fill();
    pill(x0, py - 4, (x1 - x0) * local, 8, 4); g.fillStyle = "rgba(255,255,255,.6)"; g.fill();
    pill(x0 + (x1 - x0) * local - 22, py - 13, 44, 26, 13); g.fillStyle = "#fff"; g.fill();
    // Geri sayım halkası ve durdur düğmesi
    const ry = 1452;
    g.lineWidth = 4; g.strokeStyle = "rgba(255,255,255,.3)";
    g.beginPath(); g.arc(120, ry, 58, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "rgba(255,255,255,.9)"; g.lineCap = "round";
    g.beginPath(); g.arc(120, ry, 58, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - local)); g.stroke();
    g.fillStyle = "rgba(255,255,255,.85)"; g.font = '500 42px Geist'; g.textBaseline = "middle";
    g.fillText(String(left), 120, ry + 2);
    g.shadowColor = "rgba(0,0,0,.35)"; g.shadowBlur = 30;
    g.beginPath(); g.arc(960, ry, 64, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.shadowColor = "transparent"; g.fillStyle = "#16130F";
    if (playing) { pill(960 - 19, ry - 19, 38, 38, 7); g.fill(); }
    else { g.beginPath(); g.moveTo(948, ry - 22); g.lineTo(948, ry + 22); g.lineTo(984, ry); g.closePath(); g.fill(); }
    g.restore();
    drawWave(k, local, a);
  }

  // ── Üst yazı: kelimeler ritimle tek tek belirir (Grenze Gotisch); en yeni kelime temanın renginde parlar, sonra fildişine döner
  const OUTRO = 3.4; // son şarkının bitiminden bu kadar önce marka ortaya gelir
  function phrases(tl) {
    const hook = $("#hook").value.trim(), cta = $("#cta").value.trim(), L = tl[tl.length - 1], out = [];
    if (!L) return out;
    const end = L.T + L.d, ctaAt = tl.length > 1 ? L.T + 0.9 : L.T + L.d * 0.55;
    if (hook) out.push({ text: hook, t0: INTRO + 0.15, t1: cta ? ctaAt - 0.7 : end - OUTRO + 0.2 });
    if (cta) out.push({ text: cta, cta: true, t0: hook ? ctaAt : INTRO + 0.15, t1: 1e9 });
    return out;
  }
  let PHR = { key: "", list: [] };
  function layoutPhrase(p, size) {
    g.font = `700 ${size}px "Grenze Gotisch"`;
    const words = p.text.split(/\s+/).filter(Boolean), sp = g.measureText(" ").width, lines = [[]];
    let w = 0;
    for (const word of words) {
      const ww = g.measureText(word).width;
      if (w + ww > 820 && lines[lines.length - 1].length) { lines.push([]); w = 0; }
      lines[lines.length - 1].push({ word, ww }); w += ww + sp;
    }
    return { lines, sp };
  }
  function prepPhrases(tl) {
    const list = phrases(tl), key = JSON.stringify(list) + BEATS.length;
    if (key === PHR.key) return PHR.list;
    PHR = { key, list: list.map((p) => {
      let size = 68, lay;
      do { lay = layoutPhrase(p, size); size -= 4; } while (lay.lines.length > 3 && size > 44);
      const n = lay.lines.reduce((acc, l) => acc + l.length, 0);
      return { ...p, size: size + 4, lay, times: wordTimes(n, p.t0) };
    }) };
    return PHR.list;
  }
  const backOut = (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
  function drawWords(t, pal, fade, u = 0, intro = 1) {
    const env = beatEnv(t);
    for (const p of prepPhrases(TL)) {
      if (t < p.t0 - 0.1 || t > p.t1 + 0.7) continue;
      const out = clamp((t - p.t1) / 0.6), LH = p.size * 1.08, yc = p.cta ? lerp(300, 1290, u) : 300, y0 = yc - ((p.lay.lines.length - 1) * LH) / 2;
      const pf = p.cta ? intro : fade, ps = p.cta ? lerp(1, 0.78, u) : 1;
      g.save(); g.textBaseline = "middle"; g.textAlign = "left";
      g.font = `700 ${p.size}px "Grenze Gotisch"`;
      let i = 0;
      p.lay.lines.forEach((line, li) => {
        const lw = line.reduce((acc, w) => acc + w.ww, 0) + p.lay.sp * (line.length - 1);
        let x = (W - lw) / 2;
        for (const w of line) {
          const tw = p.times[i++], k = clamp((t - tw) / 0.38), fresh = clamp(1 - (t - tw) / 0.9);
          if (k > 0) {
            const o = clamp(out * 1.6 - (i / p.times.length) * 0.6), al = ease(k) * (1 - o) * pf;
            const sc = lerp(1.35, 1, backOut(k)) * (1 + env * 0.035 * (1 - fresh)), cx = W / 2 + (x + w.ww / 2 - W / 2) * ps, cy = yc + (y0 + li * LH - yc) * ps + (1 - ease(k)) * 26 - o * 30;
            g.save(); g.globalAlpha = al; g.translate(cx, cy); g.scale(sc * ps, sc * ps);
            g.shadowColor = hsl(pal.h, pal.s, 0.45, 0.55 * fresh + 0.25); g.shadowBlur = 26 + fresh * 20;
            g.fillStyle = fresh > 0 ? `hsl(${pal.h.toFixed(1)},${lerp(12, 92, fresh).toFixed(1)}%,${lerp(95, 72, fresh).toFixed(1)}%)` : "#F7F1E6";
            g.fillText(w.word, -w.ww / 2, 0);
            g.restore();
          }
          x += w.ww + p.lay.sp;
        }
      });
      g.restore();
    }
  }
  // Marka: altta ritimle hafif atar; sonda ortaya büyüyerek gelir ve vuruşlarla nabız gibi atar
  function drawBrand(t, intro, u) {
    const brand = $("#brand").value.trim();
    if (!brand) return;
    const env = beatEnv(t), size = lerp(58, 168, u), y = lerp(1796, 1000, u), sc = 1 + env * lerp(0.035, 0.11, u);
    g.save(); g.globalAlpha = 0.95 * intro; g.textAlign = "center"; g.textBaseline = "middle";
    if (u > 0) {
      const r = g.createRadialGradient(W / 2, y, 0, W / 2, y, 520 + env * 90);
      r.addColorStop(0, `rgba(255,150,60,${(0.22 + env * 0.2) * u})`); r.addColorStop(1, "rgba(255,150,60,0)");
      g.fillStyle = r; g.fillRect(0, y - 700, W, 1400);
    }
    g.translate(W / 2, y); g.scale(sc, sc); g.rotate(Math.sin(t * 2.1) * 0.012 * u);
    g.font = `700 ${size}px "Grenze Gotisch"`;
    const tw = g.measureText(brand).width, gr = g.createLinearGradient(-tw / 2, 0, tw / 2, 0);
    gr.addColorStop(0, "#FFD978"); gr.addColorStop(0.5, "#F5B83D"); gr.addColorStop(1, "#FF7A2F");
    g.shadowColor = `rgba(255,122,47,${0.25 + env * 0.45})`; g.shadowBlur = 20 + env * 40;
    g.fillStyle = gr; g.fillText(brand, 0, 0);
    g.restore();
    // Marka altı: küçük, sade indirme çağrısı (ok simgesiyle)
    const sub = $("#sub").value.trim();
    if (!sub) return;
    const fs2 = lerp(23, 34, u), sy = y + lerp(52, 126, u);
    g.save(); g.globalAlpha = lerp(0.72, 0.9, u) * intro; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `600 ${fs2}px Geist`;
    if (g.letterSpacing !== undefined) g.letterSpacing = `${(fs2 * 0.06).toFixed(1)}px`;
    const label = sub.toLocaleUpperCase(/[çğıöşü]/i.test(sub) ? "tr" : undefined), lw = g.measureText(label).width, ax = W / 2 + fs2 * 0.35 - lw / 2 - fs2 * 0.6;
    g.fillStyle = "#F7F1E6"; g.fillText(label, W / 2 + fs2 * 0.35, sy);
    g.strokeStyle = "#F5B83D"; g.lineWidth = fs2 * 0.11; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(ax, sy - fs2 * 0.36); g.lineTo(ax, sy + fs2 * 0.3); g.moveTo(ax - fs2 * 0.28, sy + fs2 * 0.04); g.lineTo(ax, sy + fs2 * 0.32); g.lineTo(ax + fs2 * 0.28, sy + fs2 * 0.04); g.stroke();
    g.restore();
  }
  const outroAt = (t) => { const L = TL[TL.length - 1]; return L ? ease(clamp((t - (L.T + L.d - OUTRO)) / 1.1)) : 0; };

  function drawEmpty(t) {
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#1B140C"); gr.addColorStop(1, "#070605");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const r = g.createRadialGradient(540, 700 + Math.sin(t * 0.5) * 40, 0, 540, 760, 820);
    r.addColorStop(0, "rgba(245,184,61,.22)"); r.addColorStop(1, "rgba(245,184,61,0)");
    g.fillStyle = r; g.fillRect(0, 0, W, H);
    drawBrand(t, 1, 0);
  }

  // Durağanken (oynatılmıyor) kanca yazısı tam hâliyle gösterilir
  function drawStatic(pal) {
    const p = prepPhrases(TL)[0];
    if (!p) return;
    const keep = p.times, t0 = p.t0, t1 = p.t1;
    p.times = p.times.map(() => -10); p.t0 = -10; p.t1 = 1e9;
    drawWords(0, pal, 1);
    p.times = keep; p.t0 = t0; p.t1 = t1;
  }
  const P = { playing: false, t0: 0, end: 0, nodes: [], idle: 0, rec: null };
  function draw(t) {
    g.clearRect(0, 0, W, H);
    if (!TL.length) return drawEmpty(t);
    const intro = P.playing ? ease(clamp(t / INTRO)) : 1;
    const pos = posAt(TL, t), base = Math.min(TL.length - 1, Math.floor(pos)), f = pos - base;
    const n = Math.min(TL.length - 1, Math.round(pos)), o = TL[n];
    const amp = P.playing ? peakAt(o.k, o.k.start + clamp(t - o.T, 0, o.d), 0.08) : 0;
    const u = P.playing ? outroAt(t) : 0, fade = 1 - u;
    // Tam ekran görsel: girişte siyahtan yakınlaşarak açılır; şarkı değişince giden büyüyüp söner, gelen yakından yerine oturur
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    drawBg(TL[base].k, intro, t, f * 0.09 + (1 - intro) * 0.08, amp);
    if (TL[base + 1] && f > 0) drawBg(TL[base + 1].k, f * intro, t, (1 - f) * 0.12, amp);
    if (u > 0) { g.fillStyle = `rgba(0,0,0,${u * 0.55})`; g.fillRect(0, 0, W, H); } // sonda marka öne çıksın
    // Ritimle nefes alan hafif ışık
    const pa = TL[base].k.pal.a, glow = g.createRadialGradient(540, CY, 0, 540, CY, 760);
    glow.addColorStop(0, hsl(pa.h, pa.s, pa.l, 0.05 + amp * 0.1)); glow.addColorStop(1, hsl(pa.h, pa.s, pa.l, 0));
    g.fillStyle = glow; g.fillRect(0, 0, W, H);
    if (P.playing) drawWords(t, pa, intro * fade, u, intro); else drawStatic(pa);
    // Video kapaklar yalnız ekrandayken oynar (geçişte ikisi birden)
    TL.forEach((x, j) => {
      const v = x.k.cover && x.k.cover.type === "video" ? x.k.cover.el : null;
      if (!v) return;
      const on = P.playing && Math.abs(j - pos) < 1;
      if (on && v.paused) v.play().catch(() => {}); else if (!on && !v.paused) v.pause();
    });
    const ia = clamp(1 - Math.abs(pos - n) * 2.4) * intro * fade;
    if (ia > 0.01) drawInfo(o, t, ia, P.playing);
    drawBrand(t, intro, u);
  }

  function frame() {
    let t = P.idle;
    if (P.playing) {
      t = ac.currentTime - P.t0;
      if (t >= P.end) { finish(); t = P.idle; }
      else if (P.rec) $("#recT").innerHTML = `<span>Kaydediliyor</span> · %${Math.floor((t / P.end) * 100)}`;
    }
    draw(t);
    requestAnimationFrame(frame);
  }

  // ── Oynatma
  function play() {
    stopAudio();
    const a = audio(); a.resume();
    TL = timeline();
    if (!TL.length) return;
    const t0 = a.currentTime + 0.15;
    TL.forEach((o, i) => {
      const src = a.createBufferSource(), gn = a.createGain(), s = t0 + o.T, e = s + o.d, last = i === TL.length - 1;
      src.buffer = o.k.buf;
      gn.gain.setValueAtTime(0, s);
      gn.gain.linearRampToValueAtTime(1, s + (i ? XF : 0.06));
      gn.gain.setValueAtTime(1, e - (last ? 1.2 : XF));
      gn.gain.linearRampToValueAtTime(0, e);
      src.connect(gn).connect(master);
      src.start(s, o.k.start, o.d);
      P.nodes.push(src);
    });
    TL.forEach((o) => { const v = o.k.cover && o.k.cover.type === "video" && o.k.cover.el; if (v) v.currentTime = 0; });
    Object.assign(P, { playing: true, t0, end: total(TL) });
    syncUi();
  }
  function stopAudio() {
    P.nodes.forEach((n) => { try { n.stop(); } catch (e) {} });
    P.nodes = [];
    P.playing = false;
  }
  function finish() {
    stopAudio();
    if (P.rec) { const r = P.rec; P.rec = null; setTimeout(() => r.state !== "inactive" && r.stop(), 250); }
    syncUi();
  }

  // ── Video kaydı (Reels / Story 1080×1920)
  const MIMES = ["video/mp4;codecs=avc1.640028,mp4a.40.2", "video/mp4;codecs=avc1.4d0028,mp4a.40.2", "video/mp4;codecs=avc1,mp4a.40.2", "video/mp4",
    "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  async function record() {
    if (!tracks.length || P.rec) return;
    if (!window.MediaRecorder || !cv.captureStream) return note("Bu tarayıcı video kaydını desteklemiyor. Chrome ya da Safari'nin güncel sürümünü kullan.", true);
    const mime = MIMES.find((m) => MediaRecorder.isTypeSupported(m));
    if (!mime) return note("Bu tarayıcı video kaydını desteklemiyor.", true);
    const a = audio(); await a.resume();
    const dest = a.createMediaStreamDestination(); master.connect(dest);
    const vs = cv.captureStream(30);
    const rec = new MediaRecorder(new MediaStream([...vs.getVideoTracks(), ...dest.stream.getAudioTracks()]),
      { mimeType: mime, videoBitsPerSecond: 16_000_000, audioBitsPerSecond: 320_000 });
    const chunks = [];
    rec.ondataavailable = (e) => e.data && e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      try { master.disconnect(dest); } catch (e) {}
      vs.getTracks().forEach((x) => x.stop());
      const mp4 = mime.startsWith("video/mp4"), blob = new Blob(chunks, { type: mp4 ? "video/mp4" : "video/webm" });
      const d = new Date(), stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
      $("#rec").hidden = true;
      syncUi();
      saveBlob(blob, `cookfire-story-${stamp}.${mp4 ? "mp4" : "webm"}`).then((how) => {
        if (!mp4) return note("Video WebM olarak kaydedildi (bu tarayıcı MP4 kaydetmiyor). Instagram için Chrome'un güncel sürümünü kullan.", true);
        note(`<span>${how === "shared" ? "Video hazır" : "Video indirildi"}</span> · ${(blob.size / 1048576).toFixed(1)} MB · MP4 1080×1920`, false, true);
      }).catch(() => note("Video kaydedilemedi. Tekrar dene.", true));
    };
    P.rec = rec;
    $("#rec").hidden = false; $("#recT").textContent = "Kaydediliyor";
    note("Kayıt sürüyor… Bitene kadar bu ekranı önde ve açık tut.");
    rec.start(500);
    play();
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden && P.rec) note("Ekran arka plana geçti: kayıt takılabilir. Kayıt bitene kadar ekranı önde tut.", true); });

  // ── Kaydetme: web'de indirir; uygulamada (Capacitor) önbelleğe parça parça yazar, paylaş sayfasını açar → "Videoyu Kaydet" / Instagram
  const CAP = window.Capacitor || (EMB && window.parent.Capacitor);
  const NATIVE = !!(CAP && CAP.isNativePlatform && CAP.isNativePlatform());
  async function saveBlob(blob, name) {
    if (NATIVE && CAP.Plugins.Filesystem && CAP.Plugins.Share) {
      const FS = CAP.Plugins.Filesystem, CH = 3 * 1024 * 1024; // 3 MB parçalar (köprüye tek seferde büyük veri gitmesin)
      for (let i = 0; i < blob.size; i += CH) {
        const b64 = await new Promise((ok, no) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).split(",")[1]); fr.onerror = no; fr.readAsDataURL(blob.slice(i, i + CH)); });
        await (i ? FS.appendFile : FS.writeFile).call(FS, { path: name, data: b64, directory: "CACHE" });
      }
      const { uri } = await FS.getUri({ path: name, directory: "CACHE" });
      await CAP.Plugins.Share.share({ title: "CookFire", files: [uri], dialogTitle: T("Videoyu kaydet") });
      return "shared";
    }
    const url = URL.createObjectURL(blob), el = Object.assign(document.createElement("a"), { href: url, download: name });
    document.body.appendChild(el); el.click(); el.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60e3);
    return "downloaded";
  }

  // ── Yan panel
  function note(t, warn, html) { const n = $("#note"); n[html ? "innerHTML" : "textContent"] = t; n.classList.toggle("warn", !!warn); }
  const I = {
    up: '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  };
  function renderList() {
    $("#list").innerHTML = tracks.map((k, i) => `
      <li class="pm-it" data-id="${k.id}">
        <span class="pm-it-n">${i + 1}</span>
        <img src="${k.thumb}" alt="">
        <div class="pm-it-t" data-act="edit" data-noi18n><b>${h(k.title)}</b><small>${h(k.artist || "—")} · ${fmt(k.start)}–${fmt(k.end)}</small></div>
        <button class="pm-ib" data-act="up" aria-label="Yukarı taşı" ${i ? "" : "disabled"}>${I.up}</button>
        <button class="pm-ib" data-act="down" aria-label="Aşağı taşı" ${i < tracks.length - 1 ? "" : "disabled"}>${I.down}</button>
        <button class="pm-ib" data-act="edit" aria-label="Düzenle">${I.edit}</button>
      </li>`).join("");
    TL = timeline();
    $("#emptyAdd").hidden = tracks.length > 0;
    syncUi();
  }
  function syncUi() {
    const busy = !!P.rec;
    $("#playBtn").disabled = !tracks.length || busy;
    $("#exportBtn").disabled = !tracks.length || busy;
    $("#addBtn").disabled = busy;
    $("#playBtn").textContent = P.playing && !busy ? "Durdur" : "Önizle";
    const dur = total(TL);
    if (!busy && tracks.length && !$("#note").classList.contains("warn")) note(`${tracks.length} <span>şarkı</span> · ${Math.round(dur)} <span>sn</span> · 1080×1920 · <span>Kayıt gerçek zamanlıdır; bitene kadar bu ekranı açık tut.</span>`, false, true);
  }
  $("#list").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"), li = e.target.closest(".pm-it");
    if (!b || !li || P.rec) return;
    const i = tracks.findIndex((k) => k.id === +li.dataset.id);
    if (b.dataset.act === "edit") return openModal(tracks[i]);
    const j = b.dataset.act === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= tracks.length) return;
    stopAudio();
    [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    renderList();
  });
  $("#playBtn").onclick = () => { if (P.playing) { stopAudio(); syncUi(); } else play(); };
  $("#exportBtn").onclick = record;
  $("#addBtn").onclick = () => openModal(null);
  $("#emptyAdd").onclick = () => openModal(null);
  // Sahneye dokununca oynat / durdur
  cv.addEventListener("click", () => { if (!tracks.length || P.rec) return; if (P.playing) { stopAudio(); syncUi(); } else play(); });

  // ── Şarkı penceresi (dosya seç + bölüm seç)
  const modal = $("#modal"), mw = $("#mWave"), mx = mw.getContext("2d");
  let D = null, editing = null, pv = null;
  const LENS = [15, 20, 30, 45, 60];

  function openModal(k) {
    stopAudio(); syncUi();
    editing = k;
    D = k ? { ...k } : { title: "", artist: "", buf: null, cover: null, start: 0, end: 0 };
    $("#mT").textContent = k ? "Şarkıyı düzenle" : "Şarkı ekle";
    $("#mTitle").value = D.title; $("#mArtist").value = D.artist;
    $("#mAudio").value = ""; $("#mCover").value = "";
    $("#mAudioN").textContent = D.audioName || "MP3, WAV, M4A";
    $("#mCoverN").textContent = D.coverName || "Görsel ya da video";
    $("#mAudioL").classList.toggle("ok", !!D.buf); $("#mCoverL").classList.toggle("ok", !!D.cover);
    setThumb(D.cover);
    $("#mDel").hidden = !k;
    $("#mPick").hidden = !D.buf;
    if (modal.showModal) modal.showModal(); else modal.setAttribute("open", "");
    requestAnimationFrame(() => { if (D.buf) drawPick(); syncSave(); });
  }
  function closeModal() { stopPreview(); if (modal.open) modal.close(); D = null; }
  function setThumb(c) {
    const t = $("#mThumb");
    if (!c) { t.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>'; return; }
    t.innerHTML = c.type === "video" ? `<video src="${c.url}" muted playsinline autoplay loop></video>` : `<img src="${c.url}" alt="">`;
  }
  const syncSave = () => { $("#mSave").disabled = !(D && D.buf && $("#mTitle").value.trim()); };
  $("#mTitle").addEventListener("input", syncSave);

  $("#mAudio").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f || !D) return;
    $("#mAudioN").textContent = "Çözümleniyor…";
    try {
      const buf = await audio().decodeAudioData(await f.arrayBuffer());
      const pk = peaksOf(buf);
      Object.assign(D, { buf, fine: pk.fine, norm: pk.norm, beats: beatsOf(pk.fine, pk.norm), audioName: f.name });
      const len = Math.min(30, Math.floor(buf.duration));
      D.start = bestWindow(D, len); D.end = Math.min(buf.duration, D.start + len);
      if (!$("#mTitle").value.trim()) $("#mTitle").value = f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 60);
      $("#mAudioN").textContent = `${f.name} · ${fmt(buf.duration)}`;
      $("#mAudioL").classList.add("ok");
      $("#mPick").hidden = false;
      requestAnimationFrame(drawPick);
      syncSave();
    } catch (err) {
      $("#mAudioN").textContent = "Bu dosya okunamadı";
      $("#mAudioL").classList.remove("ok");
    }
  });
  $("#mCover").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f || !D) return;
    const url = URL.createObjectURL(f), video = f.type.startsWith("video/");
    try {
      let el;
      if (video) {
        el = Object.assign(document.createElement("video"), { src: url, muted: true, loop: true, playsInline: true, preload: "auto" });
        el.setAttribute("playsinline", "");
        await new Promise((ok, no) => { el.onloadeddata = ok; el.onerror = no; });
        el.currentTime = Math.min(0.1, el.duration / 2 || 0);
        await new Promise((ok) => { el.onseeked = ok; setTimeout(ok, 800); });
      } else {
        el = new Image(); el.src = url; await el.decode();
      }
      D.cover = { type: video ? "video" : "image", el, url };
      D.coverName = f.name;
      $("#mCoverN").textContent = f.name;
      $("#mCoverL").classList.add("ok");
      setThumb(D.cover);
    } catch (err) {
      $("#mCoverN").textContent = "Bu dosya açılamadı";
    }
  });

  // Bölüm seçici: kutuyu sürükle (taşı), kenarlarından uzat/kısalt; uzunluk düğmeleri
  function pickGeom() {
    const r = mw.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    if (mw.width !== Math.round(r.width * dpr)) mw.width = Math.round(r.width * dpr);
    mw.height = Math.round(104 * dpr);
    return { w: r.width, dpr, dur: D.buf.duration };
  }
  function drawPick() {
    if (!D || !D.buf) return;
    const { w, dpr, dur } = pickGeom(), H2 = 104;
    mx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mx.clearRect(0, 0, w, H2);
    const bars = Math.floor(w / 4), dt = dur / bars, sx = (D.start / dur) * w, ex = (D.end / dur) * w;
    for (let i = 0; i < bars; i++) {
      const x = i * 4, v = peakAt(D, i * dt, dt), hh = 6 + v * 70, inside = x + 1.5 >= sx && x + 1.5 <= ex;
      mx.fillStyle = inside ? "#F5B83D" : "rgba(255,255,255,.22)";
      mx.fillRect(x, H2 / 2 - hh / 2, 2.5, hh);
    }
    mx.strokeStyle = "#F5B83D"; mx.lineWidth = 2;
    mx.beginPath(); mx.roundRect(sx + 1, 4, Math.max(4, ex - sx - 2), H2 - 8, 10); mx.stroke();
    mx.fillStyle = "#F5B83D";
    for (const x of [sx + 1, ex - 1]) { mx.beginPath(); mx.roundRect(x - 3, H2 / 2 - 14, 6, 28, 3); mx.fill(); }
    if (pv) {
      const px = ((D.start + clamp(ac.currentTime - pv.t0, 0, D.end - D.start)) / dur) * w;
      mx.fillStyle = "#fff"; mx.fillRect(px - 1, 6, 2, H2 - 12);
    }
    $("#mTime").textContent = `${fmt(D.start)} – ${fmt(D.end)} · ${Math.round(D.end - D.start)} sn`;
    const len = Math.round(D.end - D.start);
    [...$("#mLens").children].forEach((b) => { b.classList.toggle("on", +b.dataset.len === len); b.disabled = +b.dataset.len > Math.floor(dur); });
  }
  let drag = null;
  mw.addEventListener("pointerdown", (e) => {
    if (!D || !D.buf) return;
    const r = mw.getBoundingClientRect(), dur = D.buf.duration, x = e.clientX - r.left, sx = (D.start / dur) * r.width, ex = (D.end / dur) * r.width;
    const mode = Math.abs(x - sx) < 14 ? "s" : Math.abs(x - ex) < 14 ? "e" : x > sx && x < ex ? "m" : "j";
    if (mode === "j") { const len = D.end - D.start; D.start = clamp((x / r.width) * dur - len / 2, 0, dur - len); D.end = D.start + len; }
    drag = { mode: mode === "j" ? "m" : mode, x, s: D.start, e: D.end, w: r.width, dur };
    mw.setPointerCapture(e.pointerId); mw.classList.add("drag");
    drawPick();
  });
  mw.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const r = mw.getBoundingClientRect(), dt = ((e.clientX - r.left - drag.x) / drag.w) * drag.dur, len = drag.e - drag.s;
    if (drag.mode === "m") { D.start = clamp(drag.s + dt, 0, drag.dur - len); D.end = D.start + len; }
    else if (drag.mode === "s") D.start = clamp(drag.s + dt, Math.max(0, drag.e - 90), drag.e - 5);
    else D.end = clamp(drag.e + dt, drag.s + 5, Math.min(drag.dur, drag.s + 90));
    D.start = Math.round(D.start * 10) / 10; D.end = Math.round(D.end * 10) / 10;
    drawPick();
  });
  const endDrag = () => { if (!drag) return; drag = null; mw.classList.remove("drag"); if (pv) startPreview(); };
  mw.addEventListener("pointerup", endDrag);
  mw.addEventListener("pointercancel", endDrag);
  $("#mLens").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-len]");
    if (!b || !D || !D.buf) return;
    const len = Math.min(+b.dataset.len, D.buf.duration);
    D.start = bestWindow(D, len); D.end = Math.round(Math.min(D.buf.duration, D.start + len) * 10) / 10;
    drawPick();
    if (pv) startPreview();
  });

  // Bölüm önizlemesi
  function startPreview() {
    stopPreview(true);
    const a = audio(); a.resume();
    const src = a.createBufferSource(), gn = a.createGain(), t0 = a.currentTime + 0.05, d = D.end - D.start;
    src.buffer = D.buf;
    gn.gain.setValueAtTime(0, t0); gn.gain.linearRampToValueAtTime(1, t0 + 0.05);
    gn.gain.setValueAtTime(1, t0 + d - 0.4); gn.gain.linearRampToValueAtTime(0, t0 + d);
    src.connect(gn).connect(master);
    src.start(t0, D.start, d);
    src.onended = () => { if (pv && pv.src === src) stopPreview(); };
    pv = { src, t0 };
    $("#mPlay").innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
    const tick = () => { if (!pv || pv.src !== src) return; drawPick(); requestAnimationFrame(tick); };
    tick();
  }
  function stopPreview(keep) {
    if (pv) { try { pv.src.stop(); } catch (e) {} pv = null; }
    if (!keep) { $("#mPlay").innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'; if (D && D.buf) drawPick(); }
  }
  $("#mPlay").onclick = () => (pv ? stopPreview() : startPreview());

  $("#mClose").onclick = closeModal;
  $("#mCancel").onclick = closeModal;
  modal.addEventListener("cancel", () => stopPreview());
  modal.addEventListener("close", () => stopPreview());
  $("#mDel").onclick = () => {
    const i = tracks.indexOf(editing);
    if (i >= 0) tracks.splice(i, 1);
    closeModal(); renderList();
  };
  $("#mForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!D || !D.buf) return;
    D.title = $("#mTitle").value.trim(); D.artist = $("#mArtist").value.trim();
    if (!D.title) return;
    const k = editing || { id: ++uid };
    Object.assign(k, D, { id: k.id });
    k.ph = placeholder(k.title);
    const src = k.cover ? k.cover.el : k.ph;
    k.pal = palette(src) || BRAND;
    k.bg = makeBg(k);
    const tc = document.createElement("canvas"); tc.width = tc.height = 96;
    coverFit(tc.getContext("2d"), src, 0, 0, 96, 96);
    k.thumb = tc.toDataURL("image/jpeg", 0.8);
    if (!editing) tracks.push(k);
    closeModal(); renderList();
    P.idle = TL.length ? TL[Math.max(0, tracks.indexOf(k))].T + 0.01 : 0;
  });
  window.addEventListener("resize", () => { if (D && D.buf && modal.open) drawPick(); });
  if (EMB) {
    $("#pmClose").hidden = false;
    $("#pmClose").onclick = () => { if (P.rec) return; stopAudio(); closeModal(); syncUi(); window.parent.postMessage("promo:close", location.origin); };
  }
  // Uygulama katmanı kapanınca (geri tuşu / dışarı dokunma) ses durur
  window.addEventListener("message", (e) => { if (e.origin === location.origin && e.data === "promo:stop" && !P.rec) { stopAudio(); closeModal(); syncUi(); } });
  // Varsayılan yazılar seçili dilde (kullanıcı değiştirdiyse dokunulmaz)
  for (const id of ["hook", "cta", "sub"]) { const i = $("#" + id); if (i.value === i.defaultValue) i.value = T(i.defaultValue); }

  // Yazı değişince sahne zaten her karede yeniden çizilir; fontlar yüklenince başla
  Promise.all(['800 76px "Bricolage Grotesque"', '700 60px "Bricolage Grotesque"', "500 46px Geist", '700 70px "Grenze Gotisch"']
    .map((f) => document.fonts.load(f).catch(() => {}))).finally(() => { renderList(); requestAnimationFrame(frame); });
})();
