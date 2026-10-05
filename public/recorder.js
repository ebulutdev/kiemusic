/* ── CookRapper · Ses kaydedici bileşeni ───────────────────
   Bölümlü kayıt (rap kaydı gibi): kaydet → duraklat → devam et … → bitir → dinle / sar → sil ya da kaydet.
   Duraklatınca "geri al" son bölümü siler; kayıt o noktadan sürer.
   Durumlar: idle → rec ⇄ paused → review → saving → saved
   Ham ses (PCM) AudioWorklet ile yakalanır → bölümler örnek düzeyinde birleşir/kesilir (sıkıştırılmış parça eklenemez).
   Kaydedilirken WAV'a (mono, 24 kHz, 16-bit) çevrilir — üretim servisinin kesin kabul ettiği biçim.
   Kullanım: const r = createRecorder(el, { minSec, maxSec, upload, onChange }); r.start(); r.load(file) */
(() => {
  const SR = 24000;            // WAV örnekleme hızı — 8 dk ≈ 23 MB (Cloud Run istek sınırı 32 MB)
  const MAX_MB = 30;           // yükleme sınırı (/api/upload ile aynı)
  const BARS = 48;             // dalga çubuğu sayısı
  const MIN_TAKE = 0.3;        // bundan kısa bölüm (yanlış dokunuş) atılır
  const IDLE_MIC_MS = 90_000;  // duraklatıldıktan sonra mikrofon bu kadar açık kalır (hızlı devam), sonra kapanır
  const OK_TYPES = /audio\/(mpeg|mp3|wav|x-wav|wave|mp4|m4a|x-m4a|aac)/;

  const svg = (d, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC = {
    mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>', 30),
    play: svg('<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>', 28),
    pause: svg('<path d="M7.5 5h3.2v14H7.5zM13.3 5h3.2v14h-3.2z" fill="currentColor" stroke="none"/>', 28),
    undo: svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
    trash: svg('<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.9 12.5h9.2L17.5 7"/>'),
    upload: svg('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  };
  const mm = (s) => { s = Math.max(0, Math.floor(s || 0)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
  const say = (m) => (typeof toast === "function" ? toast(m) : null);
  const buzz = (ms) => { try { navigator.vibrate?.(ms); } catch {} };

  let AC;
  const audioCtx = () => {
    AC ||= new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === "suspended") AC.resume();
    return AC;
  };

  // ── Ham ses yakalama: AudioWorklet (yoksa ScriptProcessor) ──
  const WORKLET = `class CRCap extends AudioWorkletProcessor{constructor(){super();this.b=[];this.n=0;this.port.onmessage=()=>{if(this.n){this.port.postMessage(this.b);this.b=[];this.n=0}}}
process(i){const c=i[0]&&i[0][0];if(c){this.b.push(c.slice(0));this.n+=c.length;if(this.n>=4096){this.port.postMessage(this.b);this.b=[];this.n=0}}return true}}
registerProcessor('cr-cap',CRCap);`;
  let workletLoad = null;
  async function captureNode(ctx, onData) {
    if (ctx.audioWorklet && window.AudioWorkletNode) {
      try {
        workletLoad ||= ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET], { type: "application/javascript" })));
        await workletLoad;
        const n = new AudioWorkletNode(ctx, "cr-cap", { numberOfInputs: 1, numberOfOutputs: 1, channelCount: 1, channelCountMode: "explicit" });
        n.port.onmessage = (e) => e.data.forEach(onData);
        n.flush = () => n.port.postMessage(1);
        return n;
      } catch { workletLoad = null; }
    }
    const sp = ctx.createScriptProcessor(4096, 1, 1);
    sp.onaudioprocess = (e) => onData(e.inputBuffer.getChannelData(0).slice(0));
    sp.flush = () => {};
    return sp;
  }

  async function decode(blob) {
    const buf = await blob.arrayBuffer();
    return new Promise((res, rej) => audioCtx().decodeAudioData(buf, res, rej));
  }
  function peaksOf(ab, n) {
    const d = ab.getChannelData(0), size = Math.max(1, Math.floor(d.length / n)), out = [];
    let mx = 0;
    for (let i = 0; i < n; i++) {
      let m = 0;
      for (let j = i * size; j < (i + 1) * size && j < d.length; j += 32) m = Math.max(m, Math.abs(d[j]));
      out.push(m); mx = Math.max(mx, m);
    }
    return out.map((v) => v / (mx || 1));
  }
  // AudioBuffer → mono 16-bit WAV (24 kHz)
  async function toWav(ab) {
    const len = Math.ceil(ab.duration * SR);
    const off = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, len, SR);
    const src = off.createBufferSource();
    src.buffer = ab;
    src.connect(off.destination);
    src.start();
    const pcm = (await off.startRendering()).getChannelData(0);
    const view = new DataView(new ArrayBuffer(44 + pcm.length * 2));
    const str = (o, s) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
    str(0, "RIFF"); view.setUint32(4, 36 + pcm.length * 2, true); str(8, "WAVE"); str(12, "fmt ");
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, SR, true); view.setUint32(28, SR * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    str(36, "data"); view.setUint32(40, pcm.length * 2, true);
    for (let i = 0; i < pcm.length; i++) view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, pcm[i])) * 0x7fff, true);
    return new Blob([view], { type: "audio/wav" });
  }

  window.createRecorder = function (host, opts = {}) {
    const o = { minSec: 6, maxSec: 480, label: "Kayıt", upload: null, onChange: () => {}, ...opts };
    host.classList.add("rec");
    host.innerHTML = `
      <div class="rec-wave" role="slider" aria-label="Kayıt konumu" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="-1">${"<i></i>".repeat(BARS)}</div>
      <div class="rec-time"><span class="rec-now">00:00</span><span class="rec-tot"></span></div>
      <div class="rec-ctrl">
        <button type="button" class="rec-small rec-l"></button>
        <button type="button" class="rec-btn rec-main"></button>
        <button type="button" class="rec-small rec-r"></button>
      </div>
      <div class="rec-note" aria-live="polite"></div>
      <input type="file" accept="audio/*" hidden>`;
    const $ = (s) => host.querySelector(s);
    const bars = [...host.querySelectorAll(".rec-wave i")];
    const wave = $(".rec-wave"), now = $(".rec-now"), tot = $(".rec-tot"), note = $(".rec-note");
    const L = $(".rec-l"), M = $(".rec-main"), Rb = $(".rec-r"), file = $("input[type=file]");

    // takes: [{ chunks: Float32Array[], frames, lv: number[] }] — lv: ~70 ms'de bir ses seviyesi (dalga için)
    const st = { state: "idle", takes: [], cur: null, mic: null, raf: 0, idleT: 0, peaks: null, ab: null, blob: null, isFile: false, isWav: false, name: "", dur: 0, el: null, url: "", saved: null };

    function setState(s) {
      st.state = s;
      host.dataset.st = s;
      const B = (el, icon, label, hidden = false) => { el.innerHTML = icon; el.setAttribute("aria-label", label); el.title = label; el.hidden = hidden; };
      if (s === "idle") { B(L, "", "", true); B(M, IC.mic, "Kayda başla"); B(Rb, IC.upload, "Dosya yükle"); note.textContent = ""; }
      if (s === "rec") { B(L, IC.undo, "Bu bölümü geri al"); B(M, IC.pause, "Duraklat"); B(Rb, IC.check, "Kaydı bitir"); }
      if (s === "paused") { B(L, IC.undo, "Son bölümü geri al"); B(M, IC.mic, "Kayda devam et"); B(Rb, IC.check, "Kaydı bitir"); }
      if (s === "review") { B(L, IC.trash, "Kaydı sil"); B(M, IC.play, "Dinle"); B(Rb, IC.check, "Kaydı kaydet"); note.textContent = ""; }
      if (s === "saving") { note.textContent = "Kaydediliyor…"; }
      if (s === "saved") { B(Rb, IC.check, "Kaydedildi"); note.textContent = "Kaydedildi"; }
      Rb.classList.toggle("done", s === "saved");
      [L, M, Rb].forEach((b) => (b.disabled = s === "saving"));
    }
    const drawBars = (vals, played = -1, cuts = null) => bars.forEach((b, i) => {
      b.style.height = 3 + Math.round((vals[i] || 0) * 40) + "px";
      b.classList.toggle("on", i <= played);
      b.classList.toggle("cut", !!cuts && cuts.has(i));
    });
    const flat = () => drawBars([]);

    // ── Bölüm hesapları ──
    const rate = () => audioCtx().sampleRate;
    const totalFrames = () => st.takes.reduce((n, t) => n + t.frames, 0) + (st.cur ? st.cur.frames : 0);
    const totalSec = () => totalFrames() / rate();
    const takeCount = () => st.takes.length + (st.cur ? 1 : 0);
    // Tüm bölümlerin seviyeleri → 48 çubuk + bölüm sınırı işaretleri
    function overview() {
      const all = [], cuts = new Set();
      st.takes.forEach((t, i) => { if (i) cuts.add(all.length); all.push(...t.lv); });
      if (!all.length) return { vals: [], cuts };
      const step = Math.max(1, all.length / BARS), vals = [], cutBars = new Set();
      for (let b = 0; b < BARS && b * step < all.length; b++) {
        const a = Math.floor(b * step), z = Math.max(a + 1, Math.floor((b + 1) * step));
        vals.push(Math.max(...all.slice(a, z)));
        for (const c of cuts) if (c >= a && c < z) cutBars.add(b);
      }
      return { vals, cuts: cutBars };
    }
    function showPaused() {
      const { vals, cuts } = overview();
      drawBars(vals, -1, cuts);
      now.textContent = mm(totalSec());
      tot.textContent = " / " + mm(o.maxSec);
      const n = st.takes.length;
      note.textContent = n > 1 ? `${n} bölüm` : "";
    }

    // ── Mikrofon ──
    async function openMic() {
      if (st.mic) return true;
      if (!navigator.mediaDevices?.getUserMedia) return false;
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } });
      } catch {
        say("Mikrofon izni gerekli");
        return null;
      }
      const ctx = audioCtx(), source = ctx.createMediaStreamSource(stream), an = ctx.createAnalyser(), mute = ctx.createGain();
      an.fftSize = 1024;
      mute.gain.value = 0;
      const cap = await captureNode(ctx, (chunk) => {
        if (st.state !== "rec" || !st.cur) return;
        st.cur.chunks.push(chunk);
        st.cur.frames += chunk.length;
      });
      source.connect(an);
      source.connect(cap);
      cap.connect(mute);
      mute.connect(ctx.destination); // işleme hattı çalışsın diye sessiz çıkış
      st.mic = { stream, source, an, cap, mute, data: new Float32Array(an.fftSize) };
      return true;
    }
    function closeMic() {
      clearTimeout(st.idleT);
      const m = st.mic;
      if (!m) return;
      st.mic = null;
      try { m.source.disconnect(); m.cap.disconnect(); m.mute.disconnect(); } catch {}
      m.stream.getTracks().forEach((t) => t.stop());
    }

    // ── Kayıt / duraklat / devam / geri al / bitir ──
    async function record() {
      if (st.state === "rec") return;
      if (st.state !== "idle" && st.state !== "paused") return; // dinleme ekranındaki kayıt korunur
      if (!window.AudioContext && !window.webkitAudioContext) return nativeCapture();
      clearTimeout(st.idleT);
      const ok = await openMic();
      if (ok === false) return nativeCapture();
      if (!ok) return;
      if (typeof stopSrc === "function") stopSrc(); // çalan şarkıyı durdur
      if (totalSec() >= o.maxSec) return say(`Ses en fazla ${Math.round(o.maxSec / 60)} dakika olabilir`);
      st.cur = { chunks: [], frames: 0, lv: [] };
      setState("rec");
      note.textContent = `Bölüm ${takeCount()}`;
      buzz(15);
      let last = 0;
      const tick = (t) => {
        if (st.state !== "rec" || !st.mic) return;
        const { an, data } = st.mic;
        an.getFloatTimeDomainData(data);
        let rms = 0;
        for (const v of data) rms += v * v;
        rms = Math.min(1, Math.sqrt(rms / data.length) * 4);
        if (t - last > 70) { st.cur.lv.push(rms); last = t; }
        const lv = st.cur.lv.slice(-BARS); // yalnız ekrandaki son 48 seviye (önceki bölümlerden tamamlanır)
        for (let i = st.takes.length - 1; i >= 0 && lv.length < BARS; i--) lv.unshift(...st.takes[i].lv.slice(-(BARS - lv.length)));
        drawBars(Array(BARS - lv.length).fill(0).concat(lv)); // en yeni ses sağda
        const sec = totalSec();
        now.textContent = mm(sec);
        tot.textContent = " / " + mm(o.maxSec);
        if (sec >= o.maxSec) { pause(); say(`Ses en fazla ${Math.round(o.maxSec / 60)} dakika olabilir`); return; }
        st.raf = requestAnimationFrame(tick);
      };
      st.raf = requestAnimationFrame(tick);
    }
    // Bölümü kapat; mikrofon kısa süre açık kalır (hızlı devam), sonra kapanır
    function pause(release = false) {
      if (st.state !== "rec") return;
      cancelAnimationFrame(st.raf);
      st.mic?.cap.flush();
      const t = st.cur;
      st.cur = null;
      if (t && t.frames / rate() >= MIN_TAKE) st.takes.push(t);
      if (!st.takes.length) { clear(); return; }
      setState("paused");
      showPaused();
      buzz(10);
      clearTimeout(st.idleT);
      if (release) closeMic(); else st.idleT = setTimeout(closeMic, IDLE_MIC_MS);
    }
    function undo() {
      if (st.state === "rec") {           // kaydedilen bölümü at
        cancelAnimationFrame(st.raf);
        st.cur = null;
        if (!st.takes.length) { clear(); say("Bölüm silindi"); return; }
        setState("paused");
      } else if (st.state === "paused") { // son bölümü at
        st.takes.pop();
        if (!st.takes.length) { clear(); say("Bölüm silindi"); return; }
      } else return;
      showPaused();
      buzz([8, 40, 8]);
      say("Son bölüm silindi — devam etmek için mikrofona dokun");
    }
    async function finish() {
      if (st.state === "rec") pause(true);
      if (st.state !== "paused") return;
      const total = totalFrames(), sr = rate();
      if (total / sr < o.minSec) { note.textContent = `Kayıt en az ${o.minSec} saniye olmalı`; return; }
      closeMic();
      const ab = audioCtx().createBuffer(1, total, sr), out = ab.getChannelData(0);
      let at = 0;
      for (const t of st.takes) for (const c of t.chunks) { out.set(c, at); at += c.length; }
      st.takes = [];
      const name = `${o.label} ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}.wav`;
      setState("saving");
      note.textContent = "Hazırlanıyor…";
      const blob = await toWav(ab);
      await review(blob, name, ab.duration, { ab, isWav: true });
    }
    function nativeCapture() {
      // Uygulama içi kayıt yok (http, eski tarayıcı) → telefonun ses kaydedicisi
      file.setAttribute("capture", "");
      file.click();
    }

    // ── Dosya ──
    file.addEventListener("change", async () => {
      const f = file.files[0];
      file.value = "";
      file.removeAttribute("capture");
      if (!f) return;
      if (f.size > MAX_MB * 1024 * 1024) return say(`Dosya en fazla ${MAX_MB} MB olabilir`);
      await review(f, f.name || o.label, 0, { isFile: true });
    });

    // ── Dinleme ──
    async function review(blob, name, secs, { isFile = false, isWav = false, ab = null } = {}) {
      clear(true);
      Object.assign(st, { blob, name, isFile, isWav });
      try {
        st.ab = ab || (await decode(blob));
        st.dur = st.ab.duration;
        st.peaks = peaksOf(st.ab, BARS);
      } catch {
        st.ab = null; st.dur = secs; st.peaks = Array(BARS).fill(0.2);
      }
      if (st.dur && st.dur < o.minSec) { clear(); return say(`Ses en az ${o.minSec} saniye olmalı`); }
      if (st.dur > o.maxSec) { clear(); return say(`Ses en fazla ${Math.round(o.maxSec / 60)} dakika olabilir`); }
      st.url = URL.createObjectURL(blob);
      st.el = new Audio(st.url);
      st.el.preload = "auto";
      st.el.addEventListener("ended", () => { M.innerHTML = IC.play; paint(); });
      st.el.addEventListener("pause", () => { M.innerHTML = IC.play; M.setAttribute("aria-label", "Dinle"); });
      st.el.addEventListener("play", () => { M.innerHTML = IC.pause; M.setAttribute("aria-label", "Duraklat"); loop(); });
      setState("review");
      paint();
      o.onChange(src());
    }
    function paint() {
      const p = st.el && st.dur ? Math.min(1, st.el.currentTime / st.dur) : 0;
      drawBars(st.peaks || [], st.el && st.el.currentTime > 0 ? Math.floor(p * BARS) : -1);
      now.textContent = mm(st.el?.currentTime || 0);
      tot.textContent = " / " + mm(st.dur);
      wave.setAttribute("aria-valuenow", Math.round(p * 100));
    }
    function loop() { paint(); if (st.el && !st.el.paused) st.raf = requestAnimationFrame(loop); }
    function seekTo(e) {
      if (!st.el || !st.dur) return;
      const r = wave.getBoundingClientRect();
      st.el.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * st.dur;
      paint();
    }
    wave.addEventListener("pointerdown", (e) => {
      if (!["review", "saved"].includes(st.state)) return;
      seekTo(e);
      const mv = (ev) => seekTo(ev), up = () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); };
      addEventListener("pointermove", mv);
      addEventListener("pointerup", up);
    });

    // ── Kaydet (Storage) ──
    async function save() {
      if (st.saved) return st.saved;
      if (!o.upload) return null;
      setState("saving");
      try {
        let blob = st.blob, name = st.name;
        const needWav = !st.isWav && (!st.isFile || !OK_TYPES.test(blob.type || ""));
        if (needWav && st.ab) { blob = await toWav(st.ab); name = name.replace(/\.[a-z0-9]+$/i, "") + ".wav"; }
        else if (!/\.[a-z0-9]+$/i.test(name)) name += blob.type.includes("mp4") ? ".m4a" : ".mp3";
        st.saved = await o.upload(blob, name);
        setState("saved");
        o.onChange(src());
        return st.saved;
      } catch (e) {
        setState("review");
        note.textContent = e?.message || "Kaydedilemedi";
        throw e;
      }
    }

    function clear(silent = false) {
      cancelAnimationFrame(st.raf);
      closeMic();
      if (st.el) { st.el.pause(); st.el = null; }
      if (st.url) URL.revokeObjectURL(st.url);
      Object.assign(st, { takes: [], cur: null, blob: null, ab: null, peaks: null, url: "", dur: 0, saved: null, name: "", isFile: false, isWav: false, remote: false });
      now.textContent = "00:00";
      tot.textContent = "";
      flat();
      setState("idle");
      if (!silent) o.onChange(null);
    }

    // Zaten Storage'da duran ses (ör. keşfet kutusu müziği): yeniden yüklenmez, dinlenip kaynak olarak kullanılır
    async function loadUrl(url, name) {
      if (st.state === "rec" || st.state === "paused") return;
      clear(true);
      setState("saving");
      note.textContent = "Yükleniyor…";
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error();
        await review(await r.blob(), name || o.label, 0, { isFile: true });
        if (st.state !== "review") return;
        Object.assign(st, { saved: url, remote: true });
        setState("saved");
        note.textContent = name || "";
        o.onChange(src());
      } catch {
        clear();
        say("Müzik yüklenemedi");
      }
    }

    const src = () => st.blob && { name: st.name, size: st.blob.size, dur: st.dur, file: st.blob, url: st.saved || null, saved: !!st.saved, explore: !!st.remote, save };

    // ── Düğmeler ──
    M.addEventListener("click", () => {
      if (st.state === "idle" || st.state === "paused") record();
      else if (st.state === "rec") pause();
      else if (st.el) st.el.paused ? (typeof stopSrc === "function" && stopSrc(), st.el.play().catch(() => {})) : st.el.pause();
    });
    L.addEventListener("click", () => {
      if (st.state === "rec" || st.state === "paused") undo();
      else if (st.state === "review" || st.state === "saved") { clear(); say(`${o.label} silindi`); }
    });
    Rb.addEventListener("click", () => {
      if (st.state === "idle") file.click();
      else if (st.state === "rec" || st.state === "paused") finish().catch(() => { setState("paused"); showPaused(); });
      else if (st.state === "review") save().catch(() => {});
    });

    flat();
    setState("idle");
    return {
      start: record,
      load: (f) => review(f, f.name || o.label, 0, { isFile: true }),
      loadUrl,
      reset: () => clear(),
      // kaydedilmiş bölümler bitmeden üretim başlatılmasın
      busy: () => st.state === "rec" || st.state === "paused",
      // pencere kapanınca: kayıt duraklatılır, mikrofon kapanır, bölümler korunur
      stop: () => { if (st.state === "rec") pause(true); else closeMic(); },
      pause: () => st.el?.pause(),
      src, save,
    };
  };
})();
