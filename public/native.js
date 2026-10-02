/* ── CookRapper · Yerel (iOS / Android) köprüsü ────────────
   Capacitor içinde çalışırken yerel eklentileri, web'de tarayıcı API'lerini kullanır.
   app.js yalnız window.CR üzerinden çağırır:
     CR.media   kilit ekranı / bildirim kontrolleri (MediaSession)  — arka planda çalma
     CR.save    parçayı cihaza kaydet (yerel: paylaşım sayfası → "Dosyalara kaydet")
     CR.share   bağlantıyla paylaş
     CR.api(u)  API adresi (mobilde tam sunucu adresi: env.js → CR_ENV.apiBase)
   Eklentiler: @capgo/capacitor-media-session · @capacitor/share · @capacitor/filesystem · @capacitor/file-transfer */
(() => {
  const C = window.Capacitor;
  const native = !!(C && C.isNativePlatform && C.isNativePlatform());
  const plug = (n) => (native && C.Plugins ? C.Plugins[n] : null);
  const base = ((window.CR_ENV && window.CR_ENV.apiBase) || "").replace(/\/+$/, "");
  const quiet = (p) => { if (p && p.catch) p.catch(() => {}); };

  // ── Medya oturumu
  //   Android: eklenti (bildirim kontrolleri + ön plan hizmeti → ekran kapalıyken çalmaya devam)
  //   iOS: WKWebView'in kendi navigator.mediaSession'ı (kilit ekranı / Now Playing); arka plan için
  //        Info.plist UIBackgroundModes=audio + AppDelegate'te AVAudioSession .playback
  //   Web: navigator.mediaSession
  const platform = native && C.getPlatform ? C.getPlatform() : "web";
  const NMS = platform === "android" ? plug("MediaSession") : null;
  const WMS = !NMS && "mediaSession" in navigator ? navigator.mediaSession : null;
  const media = {
    metadata(m) {
      if (NMS) return quiet(NMS.setMetadata(m));
      if (WMS && window.MediaMetadata) try { WMS.metadata = new MediaMetadata(m); } catch (e) {}
    },
    state(s) {
      if (NMS) return quiet(NMS.setPlaybackState({ playbackState: s }));
      if (WMS) try { WMS.playbackState = s; } catch (e) {}
    },
    position(o) {
      if (NMS) return quiet(NMS.setPositionState(o));
      if (WMS && WMS.setPositionState) try { WMS.setPositionState(o); } catch (e) {}
    },
    handler(a, f) {
      if (NMS) return quiet(NMS.setActionHandler({ action: a }, f));
      if (WMS) try { WMS.setActionHandler(a, f); } catch (e) {}
    },
  };

  const safeName = (s, ext) => (String(s || "parca").normalize("NFKD").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "parca") + "." + ext;
  const extOf = (url) => { const m = String(url).split("?")[0].match(/\.(mp3|m4a|wav|aac|ogg|flac)$/i); return m ? m[1].toLowerCase() : "mp3"; };

  // ── Cihaza kaydet
  async function save(url, title) {
    const name = safeName(title, extOf(decodeURIComponent(url)));
    if (native) {
      const FS = plug("Filesystem"), FT = plug("FileTransfer"), SH = plug("Share");
      if (!FS || !FT || !SH) throw new Error("Kaydetme bu sürümde kullanılamıyor");
      const { uri } = await FS.getUri({ directory: "CACHE", path: name });
      const r = await FT.downloadFile({ url, path: uri });
      // iOS: "Dosyalara Kaydet" · Android: indirilenlere / Drive'a kaydet, uygulamayla aç
      await SH.share({ title: title || "CookRapper", files: [r.path || uri], dialogTitle: "Parçayı kaydet" });
      return "shared";
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const href = URL.createObjectURL(await res.blob());
      const a = Object.assign(document.createElement("a"), { href, download: name });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 30e3);
      return "downloaded";
    } catch (e) {
      window.open(url, "_blank", "noopener"); // CORS kapalıysa yeni sekmede aç
      return "opened";
    }
  }

  // ── Bağlantıyla paylaş (kullanıcı vazgeçerse "cancel")
  async function share({ title, text, url }) {
    const SH = plug("Share");
    try {
      if (SH) { await SH.share({ title, text, url, dialogTitle: "Paylaş" }); return "shared"; }
      if (navigator.share) { await navigator.share({ title, text, url }); return "shared"; }
    } catch (e) {
      if (/cancel|abort/i.test(String((e && (e.message || e.name)) || ""))) return "cancel";
    }
    try { await navigator.clipboard.writeText(url ? `${text}\n${url}` : text); return "copied"; } catch (e) { return "failed"; }
  }

  window.CR = {
    native,
    platform,
    api: (u) => (/^https?:/.test(u) ? u : base + u),
    media, save, share,
  };
})();
