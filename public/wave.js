/* ── CookRapper · Dalga formu seçici ───────────────────────
   Parçayı dinleyerek kesim yapma: dalga formu üzerinde sürüklenebilir tutamaçlar.
     range  → başlangıç + bitiş (Bölüm değiştir)      point → tek nokta (Uzat: devam noktası)
   Kullanım:
     const w = createWavePicker(el, { mode, minLen, maxLen: d => d * .5, fetchAudio(url, taskId) → ArrayBuffer,
                                      onChange(v), onPlay(), onUseLyrics(text) });
     w.load({ id, url, taskId, duration, lines: [{ s, e, text }] }); w.setLines(lines); w.value(); w.destroy();
   Dalga formu /api/media üzerinden çözülür (depolama adresleri tarayıcıya CORS izni vermez);
   dinleme doğrudan ses adresinden yapılır. Söz satırları varsa tutamaçlar satır başına/sonuna hizalanır. */
(() => {
  const svg = (d, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC = {
    play: svg('<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>'),
    pause: svg('<path d="M7.5 5h3.2v14H7.5zM13.3 5h3.2v14h-3.2z" fill="currentColor" stroke="none"/>'),
    back: svg('<path d="M15 6l-6 6 6 6"/>', 16),
    fwd: svg('<path d="M9 6l6 6-6 6"/>', 16),
  };
  const r2 = (x) => Math.round(x * 100) / 100;
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  const tc = (s) => { s = Math.max(0, s || 0); const m = Math.floor(s / 60), r = s - m * 60; return m + ":" + (r < 10 ? "0" : "") + r.toFixed(1); };
  const mmss = (s) => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const T = (s) => (window.I18N ? window.I18N.t(s) : s);

  let AC;
  const actx = () => (AC ||= new (window.AudioContext || window.webkitAudioContext)());
  const CACHE = new Map(); // ses adresi → Promise<{ peaks, duration }>

  function peaksOf(buf, n = 1600) {
    const chs = Array.from({ length: buf.numberOfChannels }, (_, i) => buf.getChannelData(i));
    const len = chs[0].length, size = Math.max(1, Math.floor(len / n)), out = new Float32Array(n);
    let mx = 0;
    for (let i = 0; i < n; i++) {
      let m = 0;
      for (let j = i * size, z = Math.min(len, j + size); j < z; j += 16) for (const c of chs) { const v = Math.abs(c[j]); if (v > m) m = v; }
      out[i] = m; if (m > mx) mx = m;
    }
    if (mx > 0) for (let i = 0; i < n; i++) out[i] = Math.pow(out[i] / mx, 0.8);
    return out;
  }
  function loadPeaks(url, taskId, fetchAudio) {
    if (!CACHE.has(url)) {
      const p = Promise.resolve(fetchAudio(url, taskId))
        .then((ab) => new Promise((res, rej) => actx().decodeAudioData(ab, res, rej)))
        .then((buf) => ({ peaks: peaksOf(buf), duration: buf.duration }));
      CACHE.set(url, p);
      p.catch(() => CACHE.delete(url));
      if (CACHE.size > 6) CACHE.delete(CACHE.keys().next().value);
    }
    return CACHE.get(url);
  }
  window.wavePeaks = loadPeaks; // çalar ekranı dalga formu (app.js syncWave)

  window.createWavePicker = function createWavePicker(root, o = {}) {
    const mode = o.mode === "point" ? "point" : "range";
    const minLen = o.minLen ?? 10, maxLenOf = o.maxLen || ((d) => d), STEP = 0.5, SNAP = 0.45;
    const S = { id: null, url: "", d: 60, a: 0, b: 10, at: 30, act: mode === "point" ? "at" : "a", peaks: null, st: "idle", lines: [], ph: null, stopAt: null };

    const head = mode === "range"
      ? `<button type="button" class="wv-tc on" data-h="a"><small>${T("Başlangıç")}</small><b></b></button>
         <div class="wv-len"><b></b></div>
         <button type="button" class="wv-tc r" data-h="b"><small>${T("Bitiş")}</small><b></b></button>`
      : `<button type="button" class="wv-tc on" data-h="at"><small>${T("Devam noktası")}</small><b></b></button>
         <div class="wv-len r"></div>`;
    const handles = mode === "range"
      ? `<span class="wv-h" data-h="a" role="slider" tabindex="0" aria-label="${T("Başlangıç")}"><i></i></span><span class="wv-h" data-h="b" role="slider" tabindex="0" aria-label="${T("Bitiş")}"><i></i></span>`
      : `<span class="wv-h" data-h="at" role="slider" tabindex="0" aria-label="${T("Devam noktası")}"><i></i></span>`;
    root.innerHTML = `<div class="wv" data-mode="${mode}">
      <div class="wv-top">${head}</div>
      <div class="wv-stage">
        <canvas></canvas>
        ${mode === "range" ? '<div class="wv-sel"></div>' : '<div class="wv-cut"></div>'}
        ${handles}<i class="wv-ph" hidden></i><div class="wv-msg" hidden></div>
      </div>
      <div class="wv-axis"><span>0:00</span><span class="wv-d"></span></div>
      <div class="wv-ctrl">
        <button type="button" class="wv-nb" data-n="-1" aria-label="${T("0,5 sn geri")}">${IC.back}</button>
        <button type="button" class="wv-play">${IC.play}<span>${T("Dinle")}</span></button>
        <button type="button" class="wv-nb" data-n="1" aria-label="${T("0,5 sn ileri")}">${IC.fwd}</button>
      </div>
      <div class="wv-lyr" hidden><p></p>${mode === "range" ? `<button type="button" class="wv-use" aria-label="${T("Bu sözleri düzenle")}">${T("Düzenle")}</button>` : ""}</div>
    </div>`;
    const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
    const stage = $(".wv-stage"), cv = $("canvas"), g = cv.getContext("2d"), msg = $(".wv-msg"), ph = $(".wv-ph");
    const au = new Audio(); au.preload = "auto"; au.playsInline = true;

    // ── değer kuralları ───────────────────────────────────
    const maxLen = () => Math.max(minLen, Math.min(S.d, maxLenOf(S.d)));
    function snapTo(t, which) {
      if (!S.lines.length) return t;
      let best = t, bd = SNAP;
      for (const l of S.lines) {
        const edge = which === "a" ? l.s - 0.05 : l.e + 0.1;
        const dd = Math.abs(edge - t);
        if (dd < bd) { bd = dd; best = edge; }
      }
      return best;
    }
    function setA(t) { S.a = clamp(t, Math.max(0, S.b - maxLen()), S.b - minLen); }
    function setB(t) { S.b = clamp(t, S.a + minLen, Math.min(S.d, S.a + maxLen())); }
    function setAt(t) { S.at = clamp(t, Math.min(1, S.d / 2), Math.max(1, S.d - 0.5)); }
    function move(a) { const len = S.b - S.a; S.a = clamp(a, 0, S.d - len); S.b = S.a + len; }
    function normalize() {
      if (mode === "point") return setAt(S.at);
      const len = clamp(S.b - S.a, minLen, maxLen());
      S.a = clamp(S.a, 0, Math.max(0, S.d - len)); S.b = Math.min(S.d, S.a + len);
    }
    const value = () => (mode === "range" ? { a: r2(S.a), b: r2(S.b), len: r2(S.b - S.a), d: r2(S.d) } : { at: r2(S.at), d: r2(S.d) });
    const changed = () => { render(); o.onChange && o.onChange(value()); };

    // ── çizim ─────────────────────────────────────────────
    const pct = (t) => (S.d ? (t / S.d) * 100 : 0) + "%";
    function render() {
      if (mode === "range") {
        $('[data-h="a"].wv-tc b').textContent = tc(S.a);
        $('[data-h="b"].wv-tc b').textContent = tc(S.b);
        $(".wv-len b").textContent = (S.b - S.a).toFixed(1) + " sn";
        const sel = $(".wv-sel"); sel.style.left = pct(S.a); sel.style.width = pct(S.b - S.a);
        $('.wv-h[data-h="a"]').style.left = pct(S.a); $('.wv-h[data-h="b"]').style.left = pct(S.b);
      } else {
        $('[data-h="at"].wv-tc b').textContent = tc(S.at);
        $(".wv-cut").style.left = pct(S.at);
        $('.wv-h[data-h="at"]').style.left = pct(S.at);
      }
      $$(".wv-h").forEach((h) => {
        const k = h.dataset.h, v = S[k];
        h.classList.toggle("on", S.act === k);
        h.setAttribute("aria-valuemin", "0"); h.setAttribute("aria-valuemax", String(Math.round(S.d)));
        h.setAttribute("aria-valuenow", String(r2(v))); h.setAttribute("aria-valuetext", tc(v));
      });
      $$(".wv-tc").forEach((b) => b.classList.toggle("on", b.dataset.h === S.act));
      $(".wv-d").textContent = mmss(S.d);
      ph.hidden = S.ph == null; if (S.ph != null) ph.style.left = pct(S.ph);
      lyrics(); draw();
    }
    function draw() {
      const W = stage.clientWidth, H = stage.clientHeight, dpr = Math.min(3, window.devicePixelRatio || 1);
      if (!W || !H) return;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const cs = getComputedStyle(root), col = (n) => cs.getPropertyValue(n).trim();
      const on = col("--accent") || "#D98A0B", off = col("--faint") || "#A8A096", played = col("--accent2") || on;
      const mid = H / 2;
      if (!S.peaks) { g.fillStyle = off; g.globalAlpha = S.st === "fail" ? 0.6 : 0.25; g.fillRect(0, mid - 1, W, 2); g.globalAlpha = 1; return; }
      const step = 3, bw = 2, n = Math.floor(W / step), P = S.peaks, per = P.length / n;
      for (let i = 0; i < n; i++) {
        let v = 0; for (let j = Math.floor(i * per), z = Math.floor((i + 1) * per); j < z; j++) if (P[j] > v) v = P[j];
        const t = ((i + 0.5) / n) * S.d, h = Math.max(2, v * (H - 10));
        const inSel = mode === "range" ? t >= S.a && t <= S.b : t <= S.at;
        g.fillStyle = inSel ? (S.ph != null && t <= S.ph && t >= (mode === "range" ? S.a : 0) ? played : on) : off;
        g.globalAlpha = inSel ? 1 : 0.55;
        g.fillRect(i * step, mid - h / 2, bw, h);
      }
      g.globalAlpha = 1;
    }
    function lyrics() {
      const box = $(".wv-lyr");
      if (!S.lines.length) { box.hidden = true; return; }
      let rows;
      if (mode === "range") rows = S.lines.filter((l) => l.e > S.a + 0.2 && l.s < S.b - 0.2);
      else rows = S.lines.filter((l) => l.e <= S.at + 0.3).slice(-1);
      box.hidden = !rows.length;
      box.querySelector("p").innerHTML = rows.map((l) => esc(l.text)).join("<br>");
      box._text = rows.map((l) => l.text).join("\n");
    }

    // ── dinleme ───────────────────────────────────────────
    let raf = 0;
    const playBtn = $(".wv-play");
    function syncPlay() {
      const p = !au.paused;
      playBtn.classList.toggle("on", p);
      playBtn.innerHTML = (p ? IC.pause : IC.play) + `<span>${T(p ? "Durdur" : "Dinle")}</span>`;
    }
    function loop() {
      cancelAnimationFrame(raf);
      const tick = () => {
        S.ph = au.currentTime || 0;
        if (S.stopAt != null && S.ph >= S.stopAt) { au.pause(); S.ph = S.stopAt; S.stopAt = null; }
        render();
        if (!au.paused) raf = requestAnimationFrame(tick); else syncPlay();
      };
      raf = requestAnimationFrame(tick);
    }
    function playFrom(t, stopAt) {
      if (!S.url) return;
      o.onPlay && o.onPlay();
      if (au.src !== S.url) au.src = S.url;
      S.stopAt = stopAt ?? null;
      const go = () => { try { au.currentTime = t; } catch (e) {} au.play().then(() => { syncPlay(); loop(); }).catch(() => syncPlay()); };
      if (au.readyState >= 1) go(); else { au.addEventListener("loadedmetadata", go, { once: true }); au.load(); }
    }
    function stop() { au.pause(); S.stopAt = null; syncPlay(); }
    au.addEventListener("pause", syncPlay);
    au.addEventListener("ended", () => { S.stopAt = null; syncPlay(); });
    playBtn.onclick = () => {
      if (!au.paused) return stop();
      if (mode === "range") playFrom(S.a, S.b);
      else playFrom(Math.max(0, S.at - 6), S.at);
    };

    // ── sürükleme / dokunma ───────────────────────────────
    const timeAt = (x) => { const r = stage.getBoundingClientRect(); return clamp(((x - r.left) / r.width) * S.d, 0, S.d); };
    let drag = null;
    stage.addEventListener("pointerdown", (e) => {
      if (e.button > 0) return;
      const t = timeAt(e.clientX), h = e.target.closest(".wv-h");
      if (h) drag = { k: h.dataset.h, x: e.clientX, moved: true };
      else if (mode === "range" && t > S.a && t < S.b) drag = { k: "move", x: e.clientX, off: t - S.a, t0: t, moved: false };
      else if (mode === "point") { S.act = "at"; setAt(snapTo(t, "b")); changed(); drag = { k: "at", x: e.clientX, moved: true }; }
      else drag = { k: "tap", x: e.clientX, t0: t, moved: false };
      if (drag.k !== "tap" && drag.k !== "move") S.act = drag.k;
      stage.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    stage.addEventListener("pointermove", (e) => {
      if (!drag) return;
      if (!drag.moved && Math.abs(e.clientX - drag.x) < 5) return;
      drag.moved = true;
      const t = timeAt(e.clientX);
      if (drag.k === "a") setA(snapTo(t, "a"));
      else if (drag.k === "b") setB(snapTo(t, "b"));
      else if (drag.k === "at") setAt(snapTo(t, "b"));
      else if (drag.k === "move") move(t - drag.off);
      else return;
      changed();
    });
    const end = () => {
      if (!drag) return;
      const d = drag; drag = null;
      if (!d.moved && (d.k === "tap" || d.k === "move")) playFrom(d.t0, d.k === "move" ? S.b : null);
    };
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", () => { drag = null; });

    function nudge(k, dir, big) {
      const dt = dir * (big ? 5 : STEP);
      if (k === "a") setA(S.a + dt); else if (k === "b") setB(S.b + dt); else setAt(S.at + dt);
      changed();
    }
    $$(".wv-nb").forEach((b) => (b.onclick = () => nudge(S.act, +b.dataset.n)));
    $$(".wv-tc").forEach((b) => (b.onclick = () => {
      S.act = b.dataset.h; render();
      const v = S[S.act]; playFrom(Math.max(0, v - (S.act === "a" ? 0 : 3)), S.act === "a" ? Math.min(S.d, v + 4) : v);
    }));
    $$(".wv-h").forEach((h) => h.addEventListener("keydown", (e) => {
      const dir = e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : 0;
      if (!dir) return; e.preventDefault(); S.act = h.dataset.h; nudge(S.act, dir, e.shiftKey);
    }));
    $(".wv-use")?.addEventListener("click", () => { const t = $(".wv-lyr")._text; if (t && o.onUseLyrics) o.onUseLyrics(t); });

    const ro = new ResizeObserver(() => draw());
    ro.observe(stage);

    // ── yükleme ───────────────────────────────────────────
    function status(st, text) {
      S.st = st; stage.classList.toggle("loading", st === "loading");
      msg.hidden = !text; msg.textContent = text ? T(text) : "";
    }
    function load(t) {
      if (!t) return;
      const same = S.id === t.id && S.url === t.url;
      if (!same) { stop(); S.ph = null; }
      S.id = t.id; S.url = t.url || ""; S.lines = t.lines || [];
      if (!same) {
        S.d = Math.max(1, t.duration || 60); S.peaks = null;
        if (mode === "range") {
          const len = Math.min(maxLen(), Math.max(minLen, Math.min(30, S.d * 0.45)));
          let a = Math.round(S.d * 0.3);
          if (S.lines.length) { const l = S.lines.find((x) => x.s >= a - 2) || S.lines[0]; a = Math.max(0, l.s - 0.05); }
          S.a = a; S.b = a + len; normalize(); S.act = "a";
        } else {
          const last = S.lines.length ? S.lines[S.lines.length - 1].e + 0.1 : S.d * 0.85;
          S.at = last; normalize();
        }
        if (!S.url) status("fail", "Bu parçanın sesi hazır değil");
        else if (o.fetchAudio) {
          status("loading");
          const url = S.url;
          loadPeaks(url, t.taskId, o.fetchAudio).then((r) => {
            if (S.url !== url) return;
            S.peaks = r.peaks;
            if (r.duration && Math.abs(r.duration - S.d) > 0.3) { S.d = r.duration; normalize(); }
            status("ready"); changed();
          }).catch(() => { if (S.url === url) { status("fail", "Dalga formu yok — dinleyerek seç"); render(); } });
        }
      }
      changed();
    }

    return {
      load,
      setLines(lines) { S.lines = lines || []; render(); },
      value,
      stop,
      get id() { return S.id; },
      destroy() { stop(); au.removeAttribute("src"); cancelAnimationFrame(raf); ro.disconnect(); root.innerHTML = ""; },
    };
  };
})();
