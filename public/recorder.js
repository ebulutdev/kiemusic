/* ── CookRapper · Ses kaydedici bileşeni ───────────────────
   Telefon ses kaydedicisi gibi: kaydet → dinle / sar → sil ya da kaydet (Firebase Storage).
   Durumlar: idle → rec → review → saving → saved
   Kullanım: const r = createRecorder(el, { minSec, maxSec, upload, onChange }); r.start(); r.load(file)
   Kayıt kaydedilirken WAV'a (mono, 24 kHz, 16-bit) çevrilir — üretim servisinin kesin kabul ettiği biçim. */
(() => {
  const SR = 24000;            // WAV örnekleme hızı — 8 dk ≈ 23 MB (Cloud Run istek sınırı 32 MB)
  const MAX_MB = 30;           // yükleme sınırı (/api/upload ile aynı)
  const BARS = 48;             // dalga çubuğu sayısı
  const OK_TYPES = /audio\/(mpeg|mp3|wav|x-wav|wave|mp4|m4a|x-m4a|aac)/;

  const svg = (d, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC = {
    mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>', 30),
    stop: svg('<rect x="7" y="7" width="10" height="10" rx="2.5" fill="currentColor" stroke="none"/>', 28),
    play: svg('<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>', 28),
    pause: svg('<path d="M7.5 5h3.2v14H7.5zM13.3 5h3.2v14h-3.2z" fill="currentColor" stroke="none"/>', 28),
    trash: svg('<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.9 12.5h9.2L17.5 7"/>'),
    upload: svg('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  };
  const mm = (s) => { s = Math.max(0, Math.floor(s || 0)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
  const say = (m) => (typeof toast === "function" ? toast(m) : null);

  let AC;
  const audioCtx = () => {
    AC ||= new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === "suspended") AC.resume();
    return AC;
  };

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
  // AudioBuffer → mono 16-bit WAV (32 kHz)
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
  const pickMime = () => ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"].find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || "";

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

    const st = { state: "idle", mr: null, stream: null, chunks: [], t0: 0, iv: 0, raf: 0, hist: [], peaks: null, ab: null, blob: null, name: "", dur: 0, el: null, url: "", saved: null };

    function setState(s) {
      st.state = s;
      host.dataset.st = s;
      const B = (el, icon, label, hidden = false) => { el.innerHTML = icon; el.setAttribute("aria-label", label); el.hidden = hidden; };
      if (s === "idle") { B(L, "", "", true); B(M, IC.mic, "Kayda başla"); B(Rb, IC.upload, "Dosya yükle"); note.textContent = ""; }
      if (s === "rec") { B(L, IC.x, "Kaydı iptal et"); B(M, IC.stop, "Kaydı durdur"); B(Rb, "", "", true); }
      if (s === "review") { B(L, IC.trash, "Kaydı sil"); B(M, IC.play, "Dinle"); B(Rb, IC.check, "Kaydı kaydet"); note.textContent = ""; }
      if (s === "saving") { note.textContent = "Kaydediliyor…"; }
      if (s === "saved") { B(Rb, IC.check, "Kaydedildi"); note.textContent = "Kaydedildi"; }
      Rb.classList.toggle("done", s === "saved");
      [L, M, Rb].forEach((b) => (b.disabled = s === "saving"));
    }
    const drawBars = (vals, played = -1) => bars.forEach((b, i) => {
      b.style.height = 3 + Math.round((vals[i] || 0) * 40) + "px";
      b.classList.toggle("on", i <= played);
    });
    const flat = () => drawBars([]);

    // ── Kayıt ──
    async function start() {
      if (st.state === "rec") return;
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        // Uygulama içi kayıt yok (http, eski tarayıcı) → telefonun ses kaydedicisi
        file.setAttribute("capture", "");
        file.click();
        return;
      }
      clear(true);
      try {
        st.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      } catch {
        say("Mikrofon izni gerekli");
        return;
      }
      if (typeof stopSrc === "function") stopSrc(); // çalan şarkıyı durdur
      const ctx = audioCtx(), an = ctx.createAnalyser();
      an.fftSize = 1024;
      ctx.createMediaStreamSource(st.stream).connect(an);
      const data = new Float32Array(an.fftSize);
      st.hist = []; st.chunks = [];
      const mime = pickMime();
      st.mr = new MediaRecorder(st.stream, mime ? { mimeType: mime } : undefined);
      st.mr.ondataavailable = (e) => e.data.size && st.chunks.push(e.data);
      st.mr.onstop = onStopped;
      st.mr.start(250);
      st.t0 = performance.now();
      setState("rec");
      let lastPush = 0;
      const tick = (t) => {
        an.getFloatTimeDomainData(data);
        let rms = 0;
        for (const v of data) rms += v * v;
        rms = Math.min(1, Math.sqrt(rms / data.length) * 4);
        if (t - lastPush > 70) { st.hist.push(rms); lastPush = t; }
        const h = st.hist.slice(-BARS);
        drawBars(Array(BARS - h.length).fill(0).concat(h)); // en yeni ses sağda
        const sec = (performance.now() - st.t0) / 1000;
        now.textContent = mm(sec);
        tot.textContent = " / " + mm(o.maxSec);
        if (sec >= o.maxSec) stop();
        st.raf = requestAnimationFrame(tick);
      };
      st.raf = requestAnimationFrame(tick);
      if (navigator.vibrate) try { navigator.vibrate(15); } catch {}
    }
    function stop(cancel = false) {
      cancelAnimationFrame(st.raf);
      st.cancel = cancel;
      if (st.mr && st.mr.state !== "inactive") st.mr.stop();
      st.stream?.getTracks().forEach((t) => t.stop());
    }
    async function onStopped() {
      const secs = (performance.now() - st.t0) / 1000;
      if (st.cancel) { clear(); return; }
      const blob = new Blob(st.chunks, { type: st.mr.mimeType || "audio/webm" });
      if (secs < o.minSec) { clear(); say(`Kayıt en az ${o.minSec} saniye olmalı`); return; }
      await review(blob, `${o.label} ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`, secs);
    }

    // ── Dosya ──
    file.addEventListener("change", async () => {
      const f = file.files[0];
      file.value = "";
      file.removeAttribute("capture");
      if (!f) return;
      if (f.size > MAX_MB * 1024 * 1024) return say(`Dosya en fazla ${MAX_MB} MB olabilir`);
      await review(f, f.name || o.label, 0, true);
    });

    // ── Dinleme ──
    async function review(blob, name, secs, isFile = false) {
      clear(true);
      st.blob = blob; st.name = name; st.isFile = isFile;
      try {
        st.ab = await decode(blob);
        st.dur = st.ab.duration;
        st.peaks = peaksOf(st.ab, BARS);
      } catch {
        st.ab = null; st.dur = secs; st.peaks = st.hist.length ? st.hist.slice(-BARS) : Array(BARS).fill(0.2);
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
        const needWav = !st.isFile || !OK_TYPES.test(blob.type || "");
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
      if (st.el) { st.el.pause(); st.el = null; }
      if (st.url) URL.revokeObjectURL(st.url);
      Object.assign(st, { blob: null, ab: null, peaks: null, url: "", dur: 0, saved: null, name: "" });
      now.textContent = "00:00";
      tot.textContent = "";
      flat();
      setState("idle");
      if (!silent) o.onChange(null);
    }

    const src = () => st.blob && { name: st.name, size: st.blob.size, dur: st.dur, file: st.blob, url: st.saved || null, saved: !!st.saved, save };

    // ── Düğmeler ──
    M.addEventListener("click", () => {
      if (st.state === "idle") start();
      else if (st.state === "rec") stop();
      else if (st.el) st.el.paused ? (typeof stopSrc === "function" && stopSrc(), st.el.play().catch(() => {})) : st.el.pause();
    });
    L.addEventListener("click", () => {
      if (st.state === "rec") stop(true);
      else if (st.state === "review" || st.state === "saved") { clear(); say(`${o.label} silindi`); }
    });
    Rb.addEventListener("click", () => {
      if (st.state === "idle") file.click();
      else if (st.state === "review") save().catch(() => {});
    });

    flat();
    setState("idle");
    return {
      start, load: (f) => review(f, f.name || o.label, 0, true), reset: () => clear(),
      busy: () => st.state === "rec", stop: () => st.state === "rec" && stop(true),
      pause: () => st.el?.pause(), src, save,
    };
  };
})();
