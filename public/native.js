/* ── CookFire · Yerel (iOS / Android) köprüsü ────────────
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
  // Eklenti vekili: Capacitor çekirdeği (vendor/capacitor.js) registerPlugin ile verir; bir kez kaydedilir, sonra önbellekten
  const PL = {};
  const plug = (n) => (!native ? null : PL[n] || (PL[n] = (C.Plugins && C.Plugins[n]) || (C.registerPlugin ? C.registerPlugin(n) : null)));
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

  // Dosya adı: başlıktaki harfler (Türkçe, Almanca, Japonca… dahil) korunur; yasak karakterler atılır, boşluk → tire
  const safeName = (s, ext) => (String(s || "parca").normalize("NFC").replace(/[^\p{L}\p{N}\- _.]+/gu, "").trim().replace(/\s+/g, "-").replace(/^[.\-]+/, "").slice(0, 60) || "cookfire") + "." + ext;
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
      await SH.share({ title: title || "CookFire", files: [r.path || uri], dialogTitle: "Parçayı kaydet" });
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

  // ── App Store aboneliği (yalnız iOS; Android Play hesabı açılınca eklenecek)
  //   @capgo/native-purchases (StoreKit 2). Satın alma hesaba appAccountToken ile bağlanır (sunucu verir);
  //   imzalı işlem (JWS) /api/billing/apple'a gider, sunucu Apple imzasını doğrulayıp planı başlatır.
  const IAP = platform === "ios" ? plug("NativePurchases") : null;
  const api = (u) => (/^https?:/.test(u) ? u : base + u);
  async function billing(method, body) {
    const h = window.FB && window.FB.headers ? await window.FB.headers({ "Content-Type": "application/json" }) : {};
    const r = await fetch(api("/api/billing/apple"), { method, headers: h, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.success === false) throw new Error(j.error || "Abonelik doğrulanamadı. Tekrar dene.");
    return j;
  }
  const jwsOf = (list) => (list || []).map((t) => t && t.jwsRepresentation).filter(Boolean);
  async function sendActive() {
    const r = await IAP.getPurchases({ productType: "subs" }).catch(() => ({ purchases: [] }));
    const jws = jwsOf(r.purchases);
    return jws.length ? billing("POST", { jws }) : { active: false };
  }
  const iap = IAP ? {
    async products(ids) {
      const r = await IAP.getProducts({ productIdentifiers: ids, productType: "subs" });
      return (r.products || []).map((p) => ({ id: p.identifier || p.productIdentifier, price: p.priceString }));
    },
    async purchase(id) {
      const { token } = await billing("GET");
      let t;
      try { t = await IAP.purchaseProduct({ productIdentifier: id, productType: "subs", quantity: 1, appAccountToken: token }); }
      catch (e) { if (/cancel/i.test(String((e && (e.message || e.code)) || ""))) throw new Error("cancelled"); throw e; }
      const jws = jwsOf([t]);
      if (!jws.length) throw new Error("Satın alma doğrulanamadı. \"Satın alımları geri yükle\" ile tekrar dene.");
      const j = await billing("POST", { jws });
      if (!j.active) throw new Error("Abonelik etkinleşmedi. \"Satın alımları geri yükle\" ile tekrar dene.");
      return j;
    },
    async restore() {
      await IAP.restorePurchases().catch(() => {});
      return (await sendActive()).active;
    },
  } : {};
  // Uygulama açılınca (hesapla giriş yapılmışsa) etkin abonelik sunucuya bildirilir → yenilenen ay kredisi yüklenir
  if (IAP) window.addEventListener("fb-auth", (e) => { if (e.detail && !e.detail.anon) setTimeout(() => sendActive().catch(() => {}), 1500); });

  // ── Anlık bildirimler (@capacitor-firebase/messaging → FCM / APNs)
  //   İzin app.js'teki ara karttan sonra istenir; token /api/me'ye kaydedilir (sunucu: lib/push.ts).
  //   Bildirime dokunma soğuk açılışta da gelir: hedef window.__pendingPush'ta bekler, app.js kütüphane ve şarkı hazır olunca açar.
  //   Uygulama açıkken sistem bildirimi gösterilmez (capacitor.config.ts presentationOptions: []); görev sorgusu hemen tetiklenir.
  const FM = plug("FirebaseMessaging");
  if (FM) {
    FM.addListener("notificationActionPerformed", (e) => {
      const d = (e && e.notification && e.notification.data) || {};
      window.__pendingPush = { taskId: d.taskId || "", kind: d.kind || "", at: Date.now() };
      window.dispatchEvent(new CustomEvent("cr-push-tap", { detail: window.__pendingPush }));
    }).catch?.(() => {});
    FM.addListener("notificationReceived", (e) => {
      const d = (e && e.notification && e.notification.data) || {};
      window.dispatchEvent(new CustomEvent("cr-push-receive", { detail: d }));
    }).catch?.(() => {});
    FM.addListener("tokenReceived", () => { push.sync().catch(() => {}); }).catch?.(() => {});
    if (platform === "android") {
      // Kanallar oluşturulurken ses bağlanır (sonradan değişmez): Stüdyo = özel "pişti" sesi
      quiet(FM.createChannel({ id: "studio", name: "Stüdyo", description: "Şarkın hazır olunca", importance: 4, sound: "cookfire_ready", visibility: 1, vibration: true }));
      quiet(FM.createChannel({ id: "account", name: "Hesap", description: "Kredi ve abonelik", importance: 3 }));
      quiet(FM.createChannel({ id: "marketing", name: "Kampanya", description: "Yeni tarzlar ve öneriler", importance: 2 }));
    }
  }
  const BADGE = plug("Badge");
  let lastToken = "";
  // /api/me üzerinden bildirim alanları (cihaz, tercih, okundu) — başarılıysa true.
  // En fazla 10 sn: oturum çözülmezse / ağ yoksa false döner (arayüz değişikliği geri alır, takılı kalmaz).
  async function me(pushBody) {
    const call = (async () => {
      const h = window.FB && window.FB.headers ? await window.FB.headers({ "Content-Type": "application/json" }) : null;
      if (!h || !h.Authorization) return false;
      const r = await fetch(api("/api/me"), { method: "POST", headers: h, body: JSON.stringify({ push: pushBody }) });
      return r.ok;
    })();
    return Promise.race([call.catch(() => false), new Promise((ok) => setTimeout(() => ok(false), 10_000))]);
  }
  const push = {
    available: !!FM,
    async status() { if (!FM) return "unavailable"; const r = await FM.checkPermissions(); return r.receive; }, // granted | denied | prompt
    async request() { if (!FM) return "unavailable"; const r = await FM.requestPermissions(); return r.receive; },
    // Token'ı (izin varsa) sunucuya kaydet: dil + saat dilimi ile — açılışta ve token yenilenince
    async sync() {
      if (!FM || (await push.status()) !== "granted") return false;
      const { token } = await FM.getToken();
      if (!token) return false;
      lastToken = token;
      const lang = (window.I18N && window.I18N.get && window.I18N.get()) || "tr";
      let tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
      await me({ token, platform, lang, tz });
      return true;
    },
    // Çıkış: bu cihazın anahtarını sunucudan ve FCM'den sil · hesap silme: { server: false } (belge zaten silindi; /api/me yeniden açmasın)
    async unregister({ server = true } = {}) {
      if (!FM) return;
      if (server) try { const t = lastToken || (await FM.getToken()).token; if (t) await me({ remove: t }); } catch (e) {}
      quiet(FM.deleteToken());
    },
    setPrefs: async (prefs) => { if (!(await me({ prefs }))) throw new Error("kaydedilemedi"); },
    // Bildirimler görüldü: sunucudaki okunmamış sayacı sıfırla + uygulama simgesi rozetini temizle (@capawesome/capacitor-badge)
    async markRead() { await me({ read: true }); if (BADGE) quiet(BADGE.clear()); },
    // Sistem izni reddedildiyse: uygulamanın ayar sayfası (iOS) — Android'de kullanıcı Ayarlar › Uygulamalar'dan açar
    openSettings() { if (platform === "ios") location.href = "app-settings:"; },
  };
  if (FM) window.addEventListener("fb-auth", (e) => { if (e.detail && !e.detail.anon) setTimeout(() => push.sync().catch(() => {}), 2500); });

  window.CR = {
    native,
    platform,
    api,
    media, save, share,
    ...iap,
    push,
  };
})();
