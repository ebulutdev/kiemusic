/* ── CookRapper · Giriş / kayıt ekranı ─────────────────────
   Firebase işlemleri public/fb.js → FB.auth; oturum durumu "fb-auth" olayıyla gelir.
   Kapı: kalıcı hesap (Apple / Google / e-posta) ya da misafir seçimi yoksa ekran açık kalır.
   Görünümler: main (yöntem seçimi) → email (giriş/kayıt formu) → reset (şifre sıfırlama).
   Profil sekmesindeki hesap kartını da bu dosya çizer. */
(() => {
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const say = (m) => (typeof toast === "function" ? toast(m) : null);
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // Mobil uygulamada (Capacitor) Google/Apple web açılır penceresi çalışmaz → yerel giriş eklentisi gelene kadar gizli.
  // Yalnız e-posta + misafir kalır (Apple 4.8: üçüncü taraf giriş yoksa Apple ile Giriş zorunlu değil).
  const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  const sv = (d, w = 1.8) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const I = {
    apple: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.52 12.46c-.02-2.03 1.66-3 1.73-3.05-.94-1.38-2.41-1.57-2.94-1.59-1.25-.13-2.44.73-3.07.73-.64 0-1.61-.71-2.65-.69-1.36.02-2.62.79-3.32 2.01-1.42 2.46-.36 6.1 1.02 8.1.68.98 1.48 2.07 2.53 2.04 1.02-.04 1.4-.66 2.63-.66 1.23 0 1.57.66 2.65.64 1.09-.02 1.79-1 2.46-1.98.77-1.13 1.09-2.23 1.11-2.29-.02-.01-2.13-.82-2.15-3.26zM14.5 6.5c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.21-.52.6-.98 1.56-.86 2.48.9.07 1.83-.46 2.4-1.13z"/></svg>`,
    google: `<svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>`,
    mail: sv('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>'),
    eye: sv('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff: sv('<path d="M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-3 3.6M6.5 7.6A16.4 16.4 0 0 0 2.5 12S6 18 12 18a9 9 0 0 0 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
    check: sv('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 2.4),
    close: sv('<path d="M6 6l12 12M18 6 6 18"/>', 2),
    back: sv('<path d="M15 6l-6 6 6 6"/>', 2),
    user: sv('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>'),
  };

  // Firebase hata kodları → kullanıcı dili (boş dönerse sessiz geçilir)
  function msg(e) {
    const c = e?.code || "";
    if (["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"].includes(c)) return "";
    const M = {
      "auth/invalid-email": "Geçerli bir e-posta adresi gir.",
      "auth/invalid-credential": "E-posta ya da şifre hatalı.",
      "auth/wrong-password": "E-posta ya da şifre hatalı.",
      "auth/user-not-found": "Bu e-postayla kayıtlı hesap yok.",
      "auth/email-already-in-use": "Bu e-posta zaten kayıtlı. Giriş yapmayı dene.",
      "auth/weak-password": "Şifre çok zayıf. En az 8 karakter, harf ve rakam kullan.",
      "auth/too-many-requests": "Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.",
      "auth/network-request-failed": "İnternet bağlantını kontrol et.",
      "auth/user-disabled": "Bu hesap devre dışı bırakılmış.",
      "auth/operation-not-allowed": "Bu giriş yöntemi henüz açılmadı.",
      "auth/unauthorized-domain": "Bu adres giriş için yetkili değil.",
      "auth/account-exists-with-different-credential": "Bu e-posta başka bir yöntemle kayıtlı. O yöntemle giriş yap.",
      "auth/missing-password": "Şifreni gir.",
      "auth/invalid-oauth-client-id": "Bu giriş yöntemi yapılandırılmamış.",
      "auth/invalid-oauth-provider": "Bu giriş yöntemi yapılandırılmamış.",
    };
    return M[c] || "Giriş yapılamadı. Tekrar dene.";
  }

  // ── İşaretleme ──────────────────────────────────────────
  const field = (id, label, { type = "text", ac = "", only = "", extra = "", im = "" } = {}) =>
    `<label class="au-f" id="${id}F" ${only ? `data-only="${only}"` : ""}>
      <input id="${id}" type="${type}" placeholder=" " autocomplete="${ac}" ${im ? `inputmode="${im}"` : ""} autocapitalize="off" spellcheck="false">
      <span class="au-l">${label}</span>${extra}</label>`;
  const eye = `<button type="button" class="au-eye" data-eye aria-label="Şifreyi göster">${I.eye}</button>`;
  const back = `<button type="button" class="au-back" data-view="main">${I.back}Geri</button>`;
  const cta = (id, text) => `<button class="au-btn au-cta" ${id ? `id="${id}"` : ""} type="submit"><span>${text}</span><i class="au-spin"></i></button>`;

  const root = document.createElement("div");
  root.className = "au";
  root.id = "au";
  Object.assign(root.dataset, { state: "splash", mode: "signin", view: "main" });
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-labelledby", "auTitle");
  root.innerHTML = `
  <div class="au-bg"><i class="au-glow"></i></div>
  <span class="au-wait au-spin" aria-label="Yükleniyor"></span>
  <div class="au-scroll"><div class="au-col">
    <button class="au-x" id="auX" aria-label="Kapat" hidden>${I.close}</button>
    <div class="au-body">

      <section class="au-main">
        <p class="au-brand">CookRapper</p>
        <h1 class="au-h" id="auTitle">Sahne <em>senin.</em></h1>
        <div class="au-stack">
          ${NATIVE ? "" : `<button class="au-btn au-apple" data-p="apple">${I.apple}<span>Apple ile devam et</span></button>
          <button class="au-btn" data-p="google">${I.google}<span>Google ile devam et</span></button>`}
          <button class="au-btn" data-view="email">${I.mail}<span>E-posta ile devam et</span></button>
        </div>
        <div class="au-err" id="auMErr" role="alert"></div>
        <button class="au-quiet" id="auGuest">Misafir olarak devam et</button>
      </section>

      <section class="au-email">
        ${back}
        <h2 class="au-h" id="auETitle">Giriş<em>.</em></h2>
        <form class="au-form" id="auForm" novalidate>
          ${field("auName", "Sahne adı", { ac: "nickname", only: "signup" })}
          ${field("auEmail", "E-posta", { type: "email", ac: "email", im: "email" })}
          ${field("auPw", "Şifre", { type: "password", ac: "current-password", extra: eye })}
          <div class="au-meter" data-only="signup" id="auMeter" data-s="0"><i></i><i></i><i></i><i></i></div>
          ${field("auPw2", "Şifre tekrar", { type: "password", ac: "new-password", only: "signup", extra: `<span class="au-match">${I.check}</span>` })}
          <button type="button" class="au-forgot" data-only="signin" data-view="reset">Şifremi unuttum</button>
          <div class="au-err" id="auErr" role="alert" aria-live="assertive"></div>
          ${cta("auGo", "Giriş yap")}
        </form>
        <button class="au-quiet" id="auSwitch"></button>
      </section>

      <section class="au-reset">
        ${back}
        <h2 class="au-h">Şifre<em>.</em></h2>
        <form class="au-form" id="auReset" novalidate>
          ${field("auREmail", "E-posta", { type: "email", ac: "email", im: "email" })}
          <div class="au-err" id="auRErr" role="alert"></div>
          <div class="au-ok" id="auROk" hidden></div>
          ${cta("", "Bağlantı gönder")}
        </form>
      </section>

    </div>
  </div></div>`;
  document.body.appendChild(root);

  // ── Durum ───────────────────────────────────────────────
  const form = q("#auForm"), err = q("#auErr"), go = q("#auGo");
  const val = (id) => q("#" + id).value.trim();
  let dismissible = false, known = false;

  const COPY = {
    signin: { t: "Giriş<em>.</em>", cta: "Giriş yap", sw: "Hesabın yok mu? <b>Kayıt ol</b>" },
    signup: { t: "Kayıt<em>.</em>", cta: "Hesap oluştur", sw: "Hesabın var mı? <b>Giriş yap</b>" },
  };
  function setMode(m) {
    root.dataset.mode = m;
    const c = COPY[m];
    q("#auETitle").innerHTML = c.t;
    go.querySelector("span").textContent = c.cta;
    q("#auSwitch").innerHTML = c.sw;
    q("#auPw").autocomplete = m === "signup" ? "new-password" : "current-password";
    clearErr();
  }
  function setView(v) {
    root.dataset.view = v;
    clearErr();
    if (v === "email") setTimeout(() => q(root.dataset.mode === "signup" ? "#auName" : "#auEmail").focus({ preventScroll: true }), 60);
    if (v === "reset") {
      q("#auREmail").value = val("auEmail");
      q("#auROk").hidden = true;
      setTimeout(() => q("#auREmail").focus({ preventScroll: true }), 60);
    }
  }
  function clearErr() {
    qa(".au-err", root).forEach((e) => (e.textContent = ""));
    qa(".au-f.bad", root).forEach((f) => f.classList.remove("bad"));
  }
  function bad(id, text, box = err) {
    q("#" + id + "F")?.classList.add("bad");
    box.textContent = text;
    q("#" + id)?.focus();
  }
  function lock(on, btn) {
    qa("button, input", root).forEach((el) => { if (el.id !== "auX") el.disabled = on; });
    if (!btn) return;
    btn.classList.toggle("busy", on); // .au-cta kendi spinner'ını gösterir
    if (!btn.classList.contains("au-cta")) {
      if (on) btn.insertAdjacentHTML("beforeend", '<i class="au-spin au-tmp"></i>');
      else btn.querySelector(".au-tmp")?.remove();
    }
  }
  async function run(btn, fn, box = err) {
    if (!window.FB?.auth) { box.textContent = "Sunucuya bağlanılamadı. İnternet bağlantını kontrol et."; return false; }
    clearErr();
    lock(true, btn);
    try {
      await fn();
      return true;
    } catch (e) {
      box.textContent = msg(e);
      console.warn("[auth]", e?.code || e);
      return false;
    } finally {
      lock(false, btn);
    }
  }

  // Şifre gücü + eşleşme
  function strength(p) {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-zçğıöşü]/.test(p) && /[A-ZÇĞİÖŞÜ]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]/.test(p) || p.length >= 12) s++;
    return Math.max(1, s);
  }
  const okPw = (p) => p.length >= 8 && /[A-Za-zçğıöşüÇĞİÖŞÜ]/.test(p) && /\d/.test(p);
  function syncPw() {
    const p = q("#auPw").value, p2 = q("#auPw2").value, s = strength(p);
    q("#auMeter").dataset.s = s;
    q("#auPw2F").classList.toggle("ok", !!p2 && p === p2);
  }
  q("#auPw").addEventListener("input", syncPw);
  q("#auPw2").addEventListener("input", syncPw);
  root.addEventListener("input", (e) => { if (e.target.closest(".au-f")?.classList.contains("bad")) clearErr(); });

  // ── Olaylar ─────────────────────────────────────────────
  root.addEventListener("click", (e) => {
    const v = e.target.closest("[data-view]");
    if (v && root.contains(v)) setView(v.dataset.view);
  });
  q("[data-eye]", root).addEventListener("click", (e) => {
    const b = e.currentTarget, show = q("#auPw").type === "password", t = show ? "text" : "password";
    q("#auPw").type = q("#auPw2").type = t;
    b.innerHTML = show ? I.eyeOff : I.eye;
    b.setAttribute("aria-label", show ? "Şifreyi gizle" : "Şifreyi göster");
  });
  qa("[data-p]", root).forEach((b) => b.addEventListener("click", () => run(b, () => window.FB.auth[b.dataset.p](), q("#auMErr"))));
  q("#auSwitch").addEventListener("click", () => setMode(root.dataset.mode === "signup" ? "signin" : "signup"));
  q("#auGuest").addEventListener("click", (e) => run(e.currentTarget, () => window.FB.auth.guest(), q("#auMErr")));
  q("#auX").addEventListener("click", () => close());
  addEventListener("keydown", (e) => { if (e.key === "Escape" && dismissible && !root.classList.contains("out")) close(); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErr();
    const email = val("auEmail"), pw = q("#auPw").value;
    if (!EMAIL.test(email)) return bad("auEmail", "Geçerli bir e-posta adresi gir.");
    if (root.dataset.mode === "signin") {
      if (!pw) return bad("auPw", "Şifreni gir.");
      return run(go, () => window.FB.auth.signIn({ email, password: pw }));
    }
    if (!okPw(pw)) return bad("auPw", "Şifre en az 8 karakter olmalı; harf ve rakam içermeli.");
    if (pw !== q("#auPw2").value) return bad("auPw2", "Şifreler eşleşmiyor.");
    const ok = await run(go, () => window.FB.auth.signUp({ email, password: pw, name: val("auName").slice(0, 40) }));
    if (ok) say("Hoş geldin! E-postana doğrulama bağlantısı gönderdik.");
  });

  q("#auReset").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = val("auREmail"), box = q("#auRErr");
    if (!EMAIL.test(email)) return bad("auREmail", "Geçerli bir e-posta adresi gir.", box);
    if (await run(e.currentTarget.querySelector(".au-cta"), () => window.FB.auth.reset(email), box)) {
      const ok = q("#auROk");
      ok.textContent = `Bağlantıyı ${email} adresine gönderdik. Gelen kutunu ve spam klasörünü kontrol et.`;
      ok.hidden = false;
    }
  });

  // ── Aç / kapat ──────────────────────────────────────────
  function open({ mode = "signin", closable = false } = {}) {
    dismissible = closable;
    root.dataset.state = "ready";
    root.classList.remove("out");
    root.removeAttribute("aria-hidden");
    q("#auX").hidden = !closable;
    q("#auGuest").hidden = closable; // profilden açıldıysa zaten misafir
    setMode(mode);
    setView("main");
  }
  function close() {
    root.classList.add("out");
    root.setAttribute("aria-hidden", "true");
    document.activeElement?.blur?.();
  }

  // ── Profil: hesap kartı ─────────────────────────────────
  const PROV = { "apple.com": "Apple", "google.com": "Google", password: "E-posta" };
  function renderAccount(st) {
    const head = q("#v-profile .p-head");
    if (!head) return;
    let el = q("#acct");
    if (!el) {
      el = document.createElement("div");
      el.className = "acct";
      el.id = "acct";
      head.after(el);
      el.addEventListener("click", onAccount);
    }
    const title = q("b", head);
    if (!st) { el.hidden = true; title.textContent = "Profilim"; return; }
    el.hidden = false;
    if (st.anon) {
      title.textContent = "Misafir";
      el.innerHTML = `<p class="acct-p">Hesap oluştur; şarkıların ve kredin her cihazda seninle olsun.</p>
        <div class="acct-act"><button class="acct-btn main" data-a="up">Hesap oluştur</button><button class="acct-btn" data-a="in">Giriş yap</button></div>`;
      return;
    }
    const name = st.name || (st.email || "").split("@")[0] || "Sanatçı";
    title.textContent = name;
    const av = st.photo ? `<img src="${h(st.photo)}" alt="" referrerpolicy="no-referrer">` : h(name.charAt(0).toLocaleUpperCase("tr"));
    const via = st.providers.map((p) => PROV[p]).filter(Boolean).join(" · ");
    const warn = st.providers.includes("password") && !st.verified
      ? `<div class="acct-warn"><span>E-posta adresin doğrulanmadı</span><button data-a="verify">Tekrar gönder</button></div>` : "";
    el.innerHTML = `<div class="acct-row"><span class="acct-av">${av}</span><div class="acct-t"><b>${h(st.email || name)}</b><small>${h(via)} ile giriş</small></div></div>${warn}
      <div class="acct-act"><button class="acct-btn danger" data-a="out">Çıkış yap</button></div>`;
  }
  async function onAccount(e) {
    const a = e.target.closest("[data-a]")?.dataset.a;
    if (!a) return;
    if (a === "up") open({ mode: "signup", closable: true });
    else if (a === "in") open({ mode: "signin", closable: true });
    else if (a === "verify") {
      try { await window.FB.auth.resendVerification(); say("Doğrulama e-postası gönderildi"); } catch (er) { say(msg(er)); }
    } else if (a === "out") {
      if (!confirm("Çıkış yapılsın mı? Kütüphanen hesabında kayıtlı kalır.")) return;
      await window.FB.auth.signOut();
      say("Çıkış yapıldı");
    }
  }

  // ── Kapı ────────────────────────────────────────────────
  function gate(st) {
    known = true;
    renderAccount(st);
    if (st && (!st.anon || window.FB.auth.isGuestChosen())) close();
    else open();
  }
  addEventListener("fb-auth", (e) => gate(e.detail));
  addEventListener("fb-auth-error", (e) => { open(); q("#auMErr").textContent = msg(e.detail); });
  if (window.FB && window.FB.authState !== undefined) gate(window.FB.authState);
  // Firebase hiç yüklenemezse (çevrimdışı, ilk açılış) uygulamayı kilitleme
  setTimeout(() => { if (!known) close(); }, 9000);

  window.AUTH = { open, close };
})();
