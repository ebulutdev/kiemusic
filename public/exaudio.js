/* ── CookRapper · Keşfet müzik motoru ──────────────────────
   Ana sayfadaki odak kutusunun müziğini çalar; kutu değişince yumuşak geçiş yapar:
   giriş kısık başlar → normal sese çıkar · çıkış azalarak söner.
   Performans: şarkı sayısından bağımsız yalnız 2 çalar (A/B) · yalnız odaktaki kutu yüklenir ·
   kaydırma bitmeden çalma başlamaz (SETTLE) · ses rampaları Web Audio ile ses iş parçacığında (ana iş parçacığı serbest).
   iOS'ta <audio>.volume salt okunur → seviye GainNode ile değiştirilir (Storage CORS: scripts/seed.mjs).
   API: ExAudio.focus(preview|null) · stop() · unlock() · toggleMute() · onState(fn) · setClip(sn) · setGuard(fn) */
(() => {
  const FADE_IN = 1.6;      // sn — kısık girişten normal sese
  const FADE_OUT = 0.75;    // sn — azalarak çıkış
  const SETTLE = 260;       // ms — kutu yerine oturduktan sonra çal (hızlı kaydırmada boşa yükleme yok)
  const VOL = 0.85;         // normal ses
  const LS = "sf_ex_mute";

  let ctx = null, master = null, decks = [], cur = -1, want = null, timer = 0, unlocked = false;
  let clipSec = 30, guard = () => true, listener = () => {};
  let muted = false;
  try { muted = localStorage.getItem(LS) === "1"; } catch {}

  const now = () => ctx.currentTime;
  // setTargetAtTime: üstel yaklaşım → kulağa doğal, yarıda kesilip yön değiştirilebilir (tıkırtı yok)
  function ramp(d, to, sec) {
    const g = d.g.gain, t = now();
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.setTargetAtTime(to, t, sec / 4);
  }

  function makeDeck() {
    const el = new Audio();
    el.crossOrigin = "anonymous";
    el.preload = "none";
    el.playsInline = true;
    el.setAttribute("playsinline", "");
    const g = ctx.createGain();
    g.gain.value = 0;
    ctx.createMediaElementSource(el).connect(g);
    g.connect(master);
    const d = { el, g, key: null, start: 0, stopT: 0, looping: false };
    // Döngü: klibin sonuna yaklaşınca sönerek başa sar ve yeniden yüksel
    el.addEventListener("timeupdate", () => {
      if (decks[cur] !== d || d.looping) return;
      const end = Math.min(d.start + clipSec, (el.duration || 1e9) - 0.1);
      if (el.currentTime >= end - FADE_OUT) {
        d.looping = true;
        ramp(d, 0, FADE_OUT);
        setTimeout(() => {
          if (decks[cur] !== d) return;
          el.currentTime = d.start;
          ramp(d, VOL, FADE_IN);
          d.looping = false;
        }, FADE_OUT * 1000);
      }
    });
    el.addEventListener("playing", () => decks[cur] === d && listener(true));
    el.addEventListener("error", () => { if (decks[cur] === d) { cur = -1; listener(false); } });
    return d;
  }

  function ensure() {
    if (ctx) return true;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return false;
    ctx = new C({ latencyHint: "playback" });
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
    decks = [makeDeck(), makeDeck()];
    return true;
  }

  function fadeOut(d) {
    if (!d || !d.key) return;
    clearTimeout(d.stopT);
    ramp(d, 0, FADE_OUT);
    d.stopT = setTimeout(() => { d.el.pause(); }, FADE_OUT * 1000 + 120);
  }

  function apply() {
    if (!unlocked || !ensure()) return;
    const active = decks[cur];
    const w = guard() && !muted ? want : null;
    if (active && w && active.key === w.url) {        // aynı müzik: sönüyorsa geri yükselt
      clearTimeout(active.stopT);
      if (active.el.paused) active.el.play().catch(() => {});
      ramp(active, VOL, FADE_IN);
      return;
    }
    if (active) fadeOut(active);
    if (!w) { cur = -1; listener(false); return; }
    const ni = cur === 0 ? 1 : 0, d = decks[ni];
    clearTimeout(d.stopT);
    d.g.gain.cancelScheduledValues(now());
    d.g.gain.setValueAtTime(0, now());
    d.start = Math.max(0, Number(w.start) || 0);
    d.looping = false;
    if (d.key !== w.url) {
      d.key = w.url;
      d.el.preload = "auto";
      d.el.src = w.url + (d.start ? `#t=${d.start}` : ""); // medya parçası: başlangıçtan yüklemeye başla
    } else {
      try { d.el.currentTime = d.start; } catch {}
    }
    cur = ni;
    const p = d.el.play();
    const rise = () => { if (decks[cur] === d) ramp(d, VOL, FADE_IN); };
    if (p && p.then) p.then(rise).catch(() => { if (decks[cur] === d) { cur = -1; listener(false); } });
    else rise();
  }

  const api = {
    /** Odak kutusu değişti: kısa beklemeden sonra geçiş (hızlı kaydırmada ara kutular çalmaz). */
    focus(preview) {
      want = preview && preview.url ? preview : null;
      clearTimeout(timer);
      timer = setTimeout(apply, SETTLE);
    },
    /** Hemen sustur (sayfa değişti, pencere açıldı, ana çalar başladı). */
    stop() {
      clearTimeout(timer);
      if (!ctx) return;
      decks.forEach(fadeOut);
      cur = -1;
      listener(false);
    },
    /** Kullanıcı dokunuşu içinde çağrılmalı: tarayıcı sesi ancak etkileşimden sonra açar. */
    unlock() {
      if (!ensure()) return;
      if (ctx.state === "suspended") ctx.resume();
      if (!unlocked) { unlocked = true; if (want) apply(); }
    },
    resume() { clearTimeout(timer); timer = setTimeout(apply, SETTLE); },
    toggleMute() {
      muted = !muted;
      try { localStorage.setItem(LS, muted ? "1" : "0"); } catch {}
      if (ensure()) {
        master.gain.cancelScheduledValues(now());
        master.gain.setValueAtTime(master.gain.value, now());
        master.gain.setTargetAtTime(muted ? 0 : 1, now(), 0.12);
        if (!muted) { api.unlock(); apply(); } else listener(false);
      }
      return muted;
    },
    isMuted: () => muted,
    setClip(sec) { if (sec > 0) clipSec = sec; },
    setGuard(fn) { guard = fn; },
    onState(fn) { listener = fn; },
  };

  // Arka plana geçince ses sistemini askıya al (pil), dönünce devam
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) { api.stop(); ctx.suspend?.(); } else if (unlocked) { ctx.resume(); api.resume(); }
  });

  window.ExAudio = api;
})();
