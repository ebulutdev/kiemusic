// ── CookFire · Firebase istemci katmanı ─────────────────
// Kimlik (anonim), Firestore senkronu (çevrimdışı önbellekli) ve API yetkilendirmesi.
// Şema: lib/data/schema.ts ile aynı yol adları.
//
// Giriş: yalnız Apple / Google (+ misafir) → arayüz: public/auth.js ("fb-auth" olayı + FB.auth)
//   web: açılır pencere / yönlendirme · mobil (Capacitor): telefonun yerel giriş ekranı (@capacitor-firebase/authentication),
//   dönen kimlik bilgisiyle oturum bu JS katmanında açılır (skipNativeAuth) → misafir bağlama ve kütüphane aynen korunur
// Okuma maliyeti: toplam 3 dinleyici
//   config/app           → fiyat + katalog + motor ayarları (tek belge)
//   users/{uid}          → kredi + ayarlar + personalar + sesler (tek belge)
//   users/{uid}/tracks   → kütüphane (yalnız değişen belgeler gelir)
// Yazma maliyeti:
//   - belge başına imza karşılaştırması → yalnız değişen parça yazılır
//   - ayar/persona/ses değişiklikleri tek merge yazımında birleşir
//   - 1 sn debounce + writeBatch
//   - söz zamanlamaları istemciden yazılmaz (sunucu önbelleği: tasks/{id}/lyrics)
// SDK uygulamaya gömülü (CDN yok): npm run vendor → public/vendor/firebase.js
import {
  initializeApp,
  getAuth, initializeAuth, indexedDBLocalPersistence, onAuthStateChanged, signInAnonymously, signOut as fbSignOut,
  GoogleAuthProvider, OAuthProvider,
  signInWithPopup, signInWithRedirect, linkWithPopup, linkWithRedirect, getRedirectResult,
  signInWithCredential, linkWithCredential, updateProfile,
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, onSnapshot, writeBatch, serverTimestamp, deleteField,
} from "./vendor/firebase.js";

const firebaseConfig = {
  apiKey: "AIzaSyC86wckNq-pqfYmkfzHhVPZG2mCJbQ2sjM",
  authDomain: "rapper-fcc44.firebaseapp.com",
  projectId: "rapper-fcc44",
  storageBucket: "rapper-fcc44.firebasestorage.app",
  messagingSenderId: "807604270953",
  appId: "1:807604270953:web:aa216fe684d92de817aff8",
  measurementId: "G-958GW09JZN",
};

const PATH = { config: "config/app", users: "users", tracks: "tracks" };
const TRACK_SKIP = new Set(["aligned", "alignFail"]); // cihaz-özel / ağır alanlar
const BATCH_MAX = 450;

const app = initializeApp(firebaseConfig);
// Mobilde açılır pencere / yönlendirme çözücüsü yüklenmez (uygulama içi web görünümünde çalışmaz); oturum IndexedDB'de kalır
const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const auth = NATIVE ? initializeAuth(app, { persistence: indexedDBLocalPersistence }) : getAuth(app);
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

auth.languageCode = "tr"; // Google / Apple giriş pencereleri Türkçe

let uid = null;
let timer = 0;
let unsubs = [];       // aktif Firestore dinleyicileri (hesap değişince kapatılır)
const sig = new Map(); // anahtar → son eşitlenen imza (yazılan ya da okunan)
const SF = () => window.SF; // public/app.js köprüsü

// Anahtar sırasından bağımsız imza (Firestore alanları farklı sırada döndürür → sahte "değişti" yazımı olmasın)
const signature = (o) => JSON.stringify(o, (_, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v));
function clean(o, skip) {
  const out = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || k === "id" || (skip && skip.has(k)) || typeof v === "function" || v instanceof Blob) continue;
    out[k] = v;
  }
  return out;
}
const toMap = (arr) => Object.fromEntries((arr || []).filter((x) => x && x.id).map((x) => [x.id, clean(x)]));
const fromMap = (m) => Object.entries(m || {}).map(([id, v]) => ({ ...v, id }));

// ── Yazma ─────────────────────────────────────────────────
function diffOps() {
  const s = SF()?.state();
  if (!s || !uid) return { tracks: [], user: null };

  // Kütüphane: parça başına belge
  const tracks = [], seen = new Set();
  for (const t of s.lib) {
    if (!t || !t.id) continue;
    const key = "t/" + t.id;
    seen.add(key);
    const data = clean(t, TRACK_SKIP), sg = signature(data);
    if (sig.get(key) !== sg) tracks.push({ t: "set", id: t.id, data, key, sg });
  }
  for (const key of sig.keys()) if (key.startsWith("t/") && !seen.has(key)) tracks.push({ t: "del", id: key.slice(2), key });

  // Kullanıcı belgesi: ayarlar + personalar + sesler → tek merge yazımı
  const patch = {}, marks = [];
  const settings = { model: s.set.model, theme: s.set.theme };
  if (sig.get("u/settings") !== signature(settings)) { patch.settings = settings; marks.push(["u/settings", signature(settings)]); }
  for (const field of ["personas", "voices"]) {
    const cur = toMap(s[field]), prev = JSON.parse(sig.get("u/" + field) || "{}"), diff = {};
    for (const [id, v] of Object.entries(cur)) if (signature(v) !== signature(prev[id])) diff[id] = v;
    for (const id of Object.keys(prev)) if (!(id in cur)) diff[id] = deleteField();
    if (Object.keys(diff).length) { patch[field] = diff; marks.push(["u/" + field, signature(cur)]); }
  }
  return { tracks, user: marks.length ? { patch, marks } : null };
}

async function flush() {
  timer = 0;
  const { tracks, user } = diffOps();
  const ops = [...tracks];
  if (user) ops.push({ t: "user", ...user });
  for (let i = 0; i < ops.length; i += BATCH_MAX) {
    const part = ops.slice(i, i + BATCH_MAX), b = writeBatch(db);
    for (const op of part) {
      if (op.t === "set") b.set(doc(db, PATH.users, uid, PATH.tracks, op.id), { ...op.data, updatedAt: serverTimestamp() });
      else if (op.t === "del") b.delete(doc(db, PATH.users, uid, PATH.tracks, op.id));
      else b.set(doc(db, PATH.users, uid), { ...op.patch, updatedAt: serverTimestamp() }, { merge: true });
    }
    try {
      await b.commit();
      for (const op of part) {
        if (op.t === "set") sig.set(op.key, op.sg);
        else if (op.t === "del") sig.delete(op.key);
        else op.marks.forEach(([k, v]) => sig.set(k, v));
      }
    } catch (e) {
      console.warn("[fb] yazma hatası", e);
    }
  }
}

function schedule() {
  if (!uid) return;
  clearTimeout(timer);
  timer = setTimeout(flush, 1000);
}

// ── Okuma ─────────────────────────────────────────────────
function listen() {
  // 1) Uygulama yapılandırması — tek belge
  unsubs.push(onSnapshot(doc(db, PATH.config), (snap) => {
    const sf = SF();
    if (!snap.exists() || !sf) return;
    sf.remote = true;
    sf.applyConfig(snap.data());
  }));

  // 2) Kullanıcı belgesi — kredi, ayarlar, personalar, sesler
  let first = true;
  unsubs.push(onSnapshot(doc(db, PATH.users, uid), (snap) => {
    const d = snap.data() || {};
    if (first) {
      first = false;
      // Kredi alanı yoksa sunucu başlangıç kredisini yazar (yalnız ilk açılışta 1 istek)
      if (typeof d.credits !== "number") headers().then((h) => fetch(window.CR ? window.CR.api("/api/me") : "/api/me", { method: "POST", headers: h })).catch(() => {});
      setTimeout(schedule, 1500); // yereldeki eski kayıtları buluta taşı
    }
    if (snap.metadata.hasPendingWrites) return;
    if (d.settings) sig.set("u/settings", signature({ model: d.settings.model, theme: d.settings.theme }));
    if (d.personas) sig.set("u/personas", signature(d.personas));
    if (d.voices) sig.set("u/voices", signature(d.voices));
    SF()?.applyUser({
      credits: typeof d.credits === "number" ? d.credits : null,
      period: d.period || null, // aylık kredi dönemi { start, end, grant } — yalnız sunucu yazar
      plan: d.plan || null,     // aktif abonelik { id, credits, expiresAt }
      settings: d.settings || null,
      personas: d.personas ? fromMap(d.personas) : null,
      voices: d.voices ? fromMap(d.voices) : null,
      // Bildirim tercihleri + son 20 bildirim + okunmamış sayısı (yalnız sunucu yazar; Profil › Bildirimler)
      push: { prefs: (d.push && d.push.prefs) || {}, inbox: (d.push && d.push.inbox) || [], unread: (d.push && d.push.unread) || 0 },
      aiConsent: !!d.aiConsent, // yapay zekâ veri paylaşımı izni (yalnız sunucu yazar; /api/me)
    });
  }));

  // 3) Kütüphane — yalnız değişen belgeler
  unsubs.push(onSnapshot(collection(db, PATH.users, uid, PATH.tracks), (qs) => {
    const changes = [];
    qs.docChanges().forEach((ch) => {
      const key = "t/" + ch.doc.id;
      if (ch.type === "removed") { sig.delete(key); changes.push({ id: ch.doc.id, removed: true }); return; }
      if (ch.doc.metadata.hasPendingWrites) return; // kendi yazımımızın yankısı
      const data = ch.doc.data();
      delete data.updatedAt;
      sig.set(key, signature(data));
      changes.push({ id: ch.doc.id, data });
    });
    if (changes.length) SF()?.applyRemote("lib", changes);
  }));
}

function stopSync() {
  clearTimeout(timer);
  timer = 0;
  unsubs.forEach((u) => u());
  unsubs = [];
  sig.clear();
}

// ── Kimlik ────────────────────────────────────────────────
// Yöntemler: Apple, Google, e-posta+şifre, misafir (anonim).
// Misafir hesap açarsa hesap BAĞLANIR (link) → aynı uid, kredi ve kütüphane korunur.
// Seçilen hesap zaten varsa o hesaba giriş yapılır; bu cihazdaki kayıtlar o hesaba eklenir.
const GUEST_KEY = "sf2_guest";

const info = (u) => u && {
  uid: u.uid,
  anon: u.isAnonymous,
  email: u.email,
  name: u.displayName,
  photo: u.photoURL,
  verified: u.emailVerified,
  providers: u.providerData.map((p) => p.providerId),
};
let authState; // undefined = henüz bilinmiyor, null = çıkış yapılmış
function publish(u) {
  authState = info(u);
  if (window.FB) window.FB.authState = authState;
  window.dispatchEvent(new CustomEvent("fb-auth", { detail: authState }));
  syncCredits(u);
  // Yönetici yetkisi (admin claim): yalnız arayüz için (ör. Tanıtım videosu kutusu); asıl denetim sunucuda /api/admin/*
  if (u && !u.isAnonymous) u.getIdTokenResult().then((r) => {
    if (!authState || authState.uid !== u.uid) return;
    authState.admin = !!r.claims.admin;
    window.dispatchEvent(new CustomEvent("fb-admin", { detail: authState.admin }));
  }).catch(() => {});
}

// Kredi: misafir 0; hesap açılınca (misafirden bağlama dahil) ilk dönem başlangıç hediyesiyle açılır → sunucu /api/me karar verir.
// Uygulama her açılışta 1 kez çağırır: aylık dönem bittiyse sunucu bakiyeyi orada sıfırlar / yeniler.
// Hesaba geçişte kimlik jetonu yenilenir ki sunucu artık misafir olmadığını görsün.
// /api/me: kullanıcı belgesini hazırlar; kabul edilen koşul sürümü varsa sunucuya iletir (sunucu güncel sürümle doğrular)
const acceptedTerms = () => { try { return localStorage.getItem("cf_terms") || ""; } catch { return ""; } };
// Dil + saat dilimi her açılışta gider: bildirim izni olmasa da gelen kutusu kullanıcının dilinde yazılır
const pushLocale = () => {
  const lang = (window.I18N && window.I18N.get && window.I18N.get()) || "tr";
  let tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch {}
  return { lang, tz };
};
const meCall = (t, terms = acceptedTerms()) => fetch(window.CR ? window.CR.api("/api/me") : "/api/me", { method: "POST", headers: { Authorization: "Bearer " + t, "Content-Type": "application/json" }, body: JSON.stringify({ ...(terms ? { terms } : {}), push: pushLocale() }) });
// Dil değişince sunucuya hemen bildir (sonraki bildirimler yeni dilde)
window.addEventListener("sf-lang", () => {
  const u = auth.currentUser;
  if (u && !u.isAnonymous) u.getIdToken().then((t) => meCall(t)).catch(() => {});
});
let creditKey = "";
function syncCredits(u) {
  if (!u) { creditKey = ""; return; }
  const key = u.uid + (u.isAnonymous ? ":guest" : ":account");
  if (key === creditKey) return;
  creditKey = key;
  (u.isAnonymous ? u.getIdToken() : u.getIdToken(true))
    .then((t) => meCall(t))
    .catch(() => { creditKey = ""; });
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    if (uid) stopSync();
    uid = null;
  } else if (user.uid !== uid) {
    stopSync();
    uid = user.uid;
    listen();
  }
  publish(user);
});

const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

// Hesap zaten başka bir kullanıcıya bağlıysa: hatadaki kimlik bilgisiyle o hesaba giriş yap
function credentialFromError(e) {
  const pid = e?.customData?._tokenResponse?.providerId || e?.customData?.providerId;
  if (pid === "google.com") return GoogleAuthProvider.credentialFromError(e);
  if (pid === "apple.com") return OAuthProvider.credentialFromError(e);
  return null;
}
async function recover(e) {
  if (e?.code === "auth/credential-already-in-use" || e?.code === "auth/email-already-in-use") {
    const cred = credentialFromError(e);
    if (cred) return signInWithCredential(auth, cred);
  }
  throw e;
}

// Yönlendirmeli girişten dönüş (ana ekrana eklenmiş PWA ya da açılır pencere engellendiyse)
if (!NATIVE) getRedirectResult(auth).then((r) => r && publish(r.user)).catch((e) => recover(e).catch((err) => {
  window.FB.redirectError = err;
  window.dispatchEvent(new CustomEvent("fb-auth-error", { detail: err }));
}));

async function viaProvider(provider) {
  const cur = auth.currentUser;
  const anon = cur?.isAnonymous;
  if (isStandalone()) return anon ? linkWithRedirect(cur, provider) : signInWithRedirect(auth, provider);
  try {
    if (anon) {
      const r = await linkWithPopup(cur, provider);
      publish(r.user);
      return r.user;
    }
    return (await signInWithPopup(auth, provider)).user;
  } catch (e) {
    if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")
      return anon ? linkWithRedirect(cur, provider) : signInWithRedirect(auth, provider);
    return recover(e);
  }
}

// ── Mobil: yerel giriş → kimlik bilgisi → bu katmanda oturum ──
// Eklenti JS paketi gömülmez: Capacitor çekirdeğinin (vendor/capacitor.js) registerPlugin'i ile alınır (yapılandırma: capacitor.config.ts › FirebaseAuthentication)
const CAP = window.Capacitor;
const NativeAuth = !NATIVE ? null : (CAP.Plugins && CAP.Plugins.FirebaseAuthentication) || (CAP.registerPlugin ? CAP.registerPlugin("FirebaseAuthentication") : null);
async function nativeCredential(kind) {
  if (kind === "google") {
    const r = await NativeAuth.signInWithGoogle();
    return GoogleAuthProvider.credential(r.credential?.idToken, r.credential?.accessToken);
  }
  const r = await NativeAuth.signInWithApple({ skipNativeAuth: true });
  appleName = nameOf(r); // Apple adı YALNIZ ilk girişte verir → oturum açılınca profile yazılır
  return new OAuthProvider("apple.com").credential({ idToken: r.credential?.idToken, rawNonce: r.credential?.nonce });
}
// Yerel Apple sonucundan ad (eklenti sürümüne göre user.displayName ya da additionalUserInfo.profile alanlarında)
let appleName = "";
function nameOf(r) {
  const u = r?.user, p = r?.additionalUserInfo?.profile || {};
  const n = u?.displayName || p.name || [p.givenName || p.given_name || p.firstName, p.familyName || p.family_name || p.lastName].filter(Boolean).join(" ");
  return String(n || "").trim().slice(0, 60);
}
async function keepName(user) {
  const n = appleName; appleName = "";
  if (n && user && !user.displayName) { try { await updateProfile(user, { displayName: n }); publish(user); } catch {} }
  return user;
}
async function viaNative(kind) {
  if (!NativeAuth) throw Object.assign(new Error("native"), { code: "auth/operation-not-supported-in-this-environment" });
  let cred;
  appleName = "";
  try { cred = await nativeCredential(kind); } catch (e) {
    // kullanıcı yerel ekranı kapattı → sessiz geç
    if (/cancel|iptal|1001|12501/i.test(String(e?.message || "") + String(e?.code || ""))) throw Object.assign(new Error("cancelled"), { code: "auth/user-cancelled" });
    throw e;
  }
  const cur = auth.currentUser;
  if (cur?.isAnonymous) {
    try { const r = await linkWithCredential(cur, cred); publish(r.user); return keepName(r.user); }
    catch (e) { return keepName((await recover(e)).user); } // hesap zaten varsa ona giriş
  }
  return keepName((await signInWithCredential(auth, cred)).user);
}

function googleProvider() {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: "select_account" });
  return p;
}
function appleProvider() {
  const p = new OAuthProvider("apple.com");
  p.addScope("email");
  p.addScope("name");
  p.setCustomParameters({ locale: "tr_TR" });
  return p;
}

const authApi = {
  google: () => (NATIVE ? viaNative("google") : viaProvider(googleProvider())),
  apple: () => (NATIVE ? viaNative("apple") : viaProvider(appleProvider())),

  // "Güncellenen koşulları kabul ediyorum" (sürüm değişince / eski hesap): sürümü sunucuya yaz → doğrulandıysa true
  async acceptTerms(version) {
    const u = auth.currentUser;
    if (!u || u.isAnonymous || !version) return false;
    try { localStorage.setItem("cf_terms", version); } catch {}
    const j = await (await meCall(await u.getIdToken(), version)).json().catch(() => ({}));
    return !!j.termsOk;
  },

  async guest() {
    try { localStorage.setItem(GUEST_KEY, "1"); } catch {}
    if (auth.currentUser) publish(auth.currentUser);
    else await signInAnonymously(auth);
  },

  async signOut() {
    clearTimeout(timer);
    await flush().catch(() => {}); // bekleyen değişiklikleri kaybetme
    await window.CR?.push?.unregister().catch(() => {}); // bu cihaz artık bu hesabın bildirimlerini almasın (oturum kapanmadan)
    stopSync();
    uid = null;
    try { localStorage.removeItem(GUEST_KEY); } catch {}
    await fbSignOut(auth);
    if (NativeAuth) NativeAuth.signOut().catch(() => {}); // yerel Google / Apple oturumu da kapansın (bir sonraki girişte hesap seçilsin)
    SF()?.resetLocal();
  },

  // Hesabı kalıcı olarak sil (sunucu: kullanıcı belgesi, parçalar, yüklenen sesler, kimlik). Bekleyen yazımlar gönderilmez.
  async deleteAccount() {
    const u = auth.currentUser;
    if (!u || u.isAnonymous) throw new Error("Silinecek hesap yok");
    const r = await fetch(window.CR ? window.CR.api("/api/account") : "/api/account", { method: "DELETE", headers: { Authorization: "Bearer " + (await u.getIdToken(true)) } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.success === false) throw new Error(j.error || "Hesap silinemedi. Biraz sonra tekrar dene.");
    window.CR?.push?.unregister({ server: false }).catch(() => {}); // sunucu belgesi zaten silindi; yalnız FCM anahtarını geçersiz kıl
    clearTimeout(timer);
    stopSync();
    uid = null;
    try { localStorage.removeItem(GUEST_KEY); localStorage.removeItem("cf_terms"); } catch {}
    await fbSignOut(auth).catch(() => {});
    if (NativeAuth) NativeAuth.signOut().catch(() => {});
    SF()?.resetLocal();
  },

  isGuestChosen: () => { try { return localStorage.getItem(GUEST_KEY) === "1"; } catch { return false; } },
};

// API çağrıları için ID token (oturum henüz yüklenmediyse en fazla 8 sn bekler)
async function currentUser() {
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser;
  return new Promise((resolve) => {
    let off = () => {};
    const t = setTimeout(() => { off(); resolve(null); }, 8000);
    off = onAuthStateChanged(auth, (u) => { if (u) { clearTimeout(t); off(); resolve(u); } });
  });
}
async function headers(extra = {}) {
  const user = await currentUser();
  const h = { ...extra };
  if (user) h.Authorization = "Bearer " + (await user.getIdToken());
  return h;
}

// Yetki değişince (ör. admin:grant) yeni kimlik jetonu al → özel yetkiler (claims) hemen geçerli olur
const refreshToken = () => auth.currentUser?.getIdToken(true);
window.FB = { headers, schedule, uid: () => uid, auth: authApi, authState, refreshToken };
window.dispatchEvent(new Event("fb-ready"));
