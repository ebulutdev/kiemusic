/* ── CookFire · Analiz kesit motoru ─────────────────────
   Vokal ve müzik AYNI kesim listesiyle düzenlenir (birbirinden kaymaz): pencerede (ilk `win` sn) her `every` saniyede bir,
   şarkının biraz ilerisinden `len` saniyelik bir kesit araya eklenir ("el|ma ar|mut" → "el + ar + ma ar…").
   Kesimler vokalin hece başlarına oturtulur, eklemelerde kısa eşit güçlü geçiş yapılır (tıkırtı olmaz).
   Tamamen cihazda (Web Audio) çalışır — web, iOS ve Android'de ek araç gerekmez. Çıktı: WAV, 44,1 kHz, 16-bit, stereo.
   Kullanım: const abs = await Promise.all([Chop.decode(vokalBlob), Chop.decode(müzikBlob)]);
             const r = Chop.make(abs, { win: 20, every: 5, len: 3 });  // r.tracks[0] vokal, r.tracks[1] müzik, r.dur
             Chop.wav(r.tracks[0]) → Blob · Chop.wav(Chop.mix(r.tracks)) → önizleme · Chop.slice(ab, 0, 20) → ilk 20 sn
             Tek parça da olur: Chop.make([ab]) */
(() => {
  const SR = 44100, FADE = 0.008, SNAP = 0.12;

  // Çözme: dosya ne olursa olsun 44,1 kHz'e örneklenir (iki parça aynı hızda olur)
  let DEC;
  function decode(blob) {
    DEC ||= new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, SR, SR);
    return blob.arrayBuffer().then((ab) => new Promise((ok, no) => {
      const p = DEC.decodeAudioData(ab, ok, no); // eski Safari yalnız geri çağırma destekler
      if (p && p.then) p.then(ok, no);
    }));
  }

  // Hece başları: kısa çerçevelerde ani enerji artışının tepe noktaları (sn)
  function onsets(x, sr) {
    const hop = 512, n = Math.floor(x.length / hop), e = new Float32Array(n), out = [];
    for (let i = 0; i < n; i++) { let s = 0; for (let j = i * hop, k = j + hop; j < k; j++) s += x[j] * x[j]; e[i] = Math.log(1e-9 + s / hop); }
    for (let i = 2; i < n - 1; i++) if (e[i] - e[i - 2] > 1.2 && e[i] >= e[i - 1] && e[i] >= e[i + 1]) out.push((i * hop) / sr);
    return out;
  }
  const snap = (t, os) => { let b = t, bd = SNAP; for (const o of os) { const d = Math.abs(o - t); if (d < bd) { bd = d; b = o; } } return b; };

  // Kesim listesi: sırayla çalınacak [baş, son] aralıkları (sn). W pencere, D iki parçanın ortak süresi.
  function plan(W, D, every, len, os) {
    const pcs = []; let at = 0;
    for (let t = every; t < W - 0.5; t += every) {
      const c = snap(t, os);
      let s = c + len;                                   // kesimden `len` sn sonraki bölüm
      if (s + len > D) s = Math.max(0, c - 2 * len);     // şarkı sonuna taşarsa geriden al
      s = snap(s, os);
      pcs.push([at, c], [s, s + len]);
      at = c;
    }
    pcs.push([at, W]);
    return pcs;
  }

  // Aralıkları uç uca ekle; her eklemede FADE sn eşit güçlü geçiş, baş/son yumuşak
  function render(ch, pcs, sr) {
    const F = Math.round(FADE * sr), seg = pcs.map(([a, b]) => [Math.round(a * sr), Math.round(b * sr)]);
    const total = seg.reduce((n, [a, b]) => n + (b - a), 0) - F * (seg.length - 1);
    return ch.map((x) => {
      const out = new Float32Array(total); let pos = 0;
      seg.forEach(([a, b], k) => {
        const n = b - a, o = k ? pos - F : pos;
        for (let j = 0; j < n; j++) {
          const v = x[a + j] || 0, i = o + j;
          if (k && j < F) { const g = (j / F) * Math.PI / 2; out[i] = out[i] * Math.cos(g) + v * Math.sin(g); } else out[i] = v;
        }
        pos = o + n;
      });
      for (let j = 0; j < F && j < total; j++) { const g = j / F; out[j] *= g; out[total - 1 - j] *= g; }
      return out;
    });
  }

  function make(abs, { win = 20, every = 5, len = 3 } = {}) {
    const sr = abs[0].sampleRate, D = Math.min(...abs.map((a) => a.duration)), W = Math.min(win, D);
    const chans = abs.map((a) => [a.getChannelData(0), a.getChannelData(a.numberOfChannels > 1 ? 1 : 0)]);
    const pcs = plan(W, D, every, len, onsets(chans[0][0], sr)); // hece başları ilk parçadan (vokal)
    const tracks = chans.map((ch) => ({ sr, ch: render(ch, pcs, sr) }));
    return { pcs, tracks, dur: tracks[0].ch[0].length / sr };
  }

  // Kırpma: AudioBuffer'ın [from, to) aralığı → {sr, ch} (stereo); sonda 10 ms yumuşak bitiş (tıkırtı olmaz)
  function slice(a, from, to) {
    const sr = a.sampleRate, s = Math.round(from * sr), e = Math.min(a.length, Math.round(to * sr)), F = Math.min(e - s, Math.round(0.01 * sr));
    return { sr, ch: [0, a.numberOfChannels > 1 ? 1 : 0].map((c) => {
      const x = a.getChannelData(c).slice(s, e);
      for (let j = 0; j < F; j++) x[x.length - 1 - j] *= j / F;
      return x;
    }) };
  }

  // Önizleme karışımı: toplam, tepe 1'i aşarsa ölçeklenir
  function mix(ts) {
    return { sr: ts[0].sr, ch: ts[0].ch.map((_, c) => {
      const n = Math.max(...ts.map((t) => t.ch[c].length)), o = new Float32Array(n); let pk = 0;
      ts.forEach((t) => { const x = t.ch[c]; for (let i = 0; i < x.length; i++) o[i] += x[i]; });
      for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(o[i]));
      if (pk > 1) for (let i = 0; i < n; i++) o[i] /= pk;
      return o;
    }) };
  }

  function wav({ sr, ch }) {
    const n = ch[0].length, nc = ch.length, size = n * nc * 2, v = new DataView(new ArrayBuffer(44 + size));
    const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    str(0, "RIFF"); v.setUint32(4, 36 + size, true); str(8, "WAVE"); str(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nc, true); v.setUint32(24, sr, true);
    v.setUint32(28, sr * nc * 2, true); v.setUint16(32, nc * 2, true); v.setUint16(34, 16, true);
    str(36, "data"); v.setUint32(40, size, true);
    for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < nc; c++, o += 2) { const s = Math.max(-1, Math.min(1, ch[c][i])); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
    return new Blob([v.buffer], { type: "audio/wav" });
  }

  // MP3 (yalnız web): kodlayıcı ilk kullanımda yerel /vendor/lame.js'ten yüklenir (uzak kod yok; mobil pakete girmez)
  let LAME = null;
  const lame = () => LAME ||= new Promise((ok, no) => {
    if (window.lamejs) return ok(window.lamejs);
    const s = Object.assign(document.createElement("script"), { src: "/vendor/lame.js" });
    s.onload = () => (window.lamejs ? ok(window.lamejs) : no(new Error("lamejs yok")));
    s.onerror = no;
    document.head.appendChild(s);
  }).catch((e) => { LAME = null; throw e; });
  async function mp3({ sr, ch }, kbps = 192) {
    const { Mp3Encoder } = await lame(), enc = new Mp3Encoder(ch.length, sr, kbps), out = [], B = 1152;
    const pcm = ch.map((x) => { const y = new Int16Array(x.length); for (let i = 0; i < x.length; i++) { const s = Math.max(-1, Math.min(1, x[i])); y[i] = s < 0 ? s * 0x8000 : s * 0x7fff; } return y; });
    for (let i = 0; i < pcm[0].length; i += B) { const d = enc.encodeBuffer(...pcm.map((y) => y.subarray(i, i + B))); if (d.length) out.push(d); }
    const end = enc.flush(); if (end.length) out.push(end);
    return new Blob(out, { type: "audio/mpeg" });
  }

  window.Chop = { decode, make, slice, mix, wav, mp3 };
})();
