/* ── CookFire · Giriş ekranı ──────────────────────────────
   Giriş yalnız Apple / Google (+ misafir olarak göz at). E-posta / şifre yok: sağlayıcı e-postayı zaten doğrulamış olur
   → rastgele adresle hesap açılamaz, doğrulama e-postası gerekmez. Web'de açılır pencere, mobilde telefonun yerel
   giriş ekranı (public/fb.js → FB.auth); oturum durumu "fb-auth" olayıyla gelir.
   Kapı: kalıcı hesap ya da misafir seçimi yoksa ekran açık kalır. Profil sekmesindeki hesap kartını da bu dosya çizer. */
(() => {
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const say = (m) => (typeof toast === "function" ? toast(m) : null);

  const sv = (d, w = 1.8) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const I = {
    apple: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.52 12.46c-.02-2.03 1.66-3 1.73-3.05-.94-1.38-2.41-1.57-2.94-1.59-1.25-.13-2.44.73-3.07.73-.64 0-1.61-.71-2.65-.69-1.36.02-2.62.79-3.32 2.01-1.42 2.46-.36 6.1 1.02 8.1.68.98 1.48 2.07 2.53 2.04 1.02-.04 1.4-.66 2.63-.66 1.23 0 1.57.66 2.65.64 1.09-.02 1.79-1 2.46-1.98.77-1.13 1.09-2.23 1.11-2.29-.02-.01-2.13-.82-2.15-3.26zM14.5 6.5c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.21-.52.6-.98 1.56-.86 2.48.9.07 1.83-.46 2.4-1.13z"/></svg>`,
    google: `<svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>`,
    check: sv('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 2.4),
    close: sv('<path d="M6 6l12 12M18 6 6 18"/>', 2),
  };

  // Firebase / yerel giriş hata kodları → kullanıcı dili (boş dönerse sessiz geçilir)
  function msg(e) {
    const c = e?.code || "";
    if (["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"].includes(c)) return "";
    const M = {
      "auth/too-many-requests": "Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.",
      "auth/network-request-failed": "İnternet bağlantını kontrol et.",
      "auth/user-disabled": "Bu hesap devre dışı bırakılmış.",
      "auth/operation-not-allowed": "Bu giriş yöntemi henüz açılmadı.",
      "auth/unauthorized-domain": "Bu adres giriş için yetkili değil.",
      "auth/account-exists-with-different-credential": "Bu e-posta diğer yöntemle kayıtlı. O yöntemle devam et.",
      "auth/invalid-oauth-client-id": "Bu giriş yöntemi yapılandırılmamış.",
      "auth/invalid-oauth-provider": "Bu giriş yöntemi yapılandırılmamış.",
      "auth/operation-not-supported-in-this-environment": "Bu cihazda giriş şu an yapılamıyor. Uygulamayı güncelle.",
    };
    return M[c] || "Giriş yapılamadı. Tekrar dene.";
  }

  // Yasal onay kutusu — Apple / Google ile devam için zorunlu. Kabul edilen sürüm hesap açılınca sunucuda kaydedilir
  // (users/{uid}.terms); bağlantıları docs.js uygulama içinde açar.
  const terms = `<div class="au-terms">` +
    `<label><input type="checkbox" class="au-tick" id="auTerms" aria-label="Kullanım Koşulları ve Gizlilik Politikası'nı okudum, kabul ediyorum">` +
    `<span class="au-box" aria-hidden="true">${I.check}</span>Kabul ediyorum:</label>` +
    `<a href="/terms" data-legal="terms" target="_blank" rel="noopener">Koşullar</a><i aria-hidden="true">·</i>` +
    `<a href="/privacy" data-legal="privacy" target="_blank" rel="noopener">Gizlilik</a></div>`;

  const root = document.createElement("div");
  root.className = "au";
  root.id = "au";
  root.dataset.state = "splash";
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
        <p class="au-brand">CookFire</p>
        <h1 class="au-h" id="auTitle">Sahne <em>senin.</em></h1>
        <div class="au-stack">
          <button class="au-btn au-apple" data-p="apple">${I.apple}<span>Apple ile devam et</span></button>
          <button class="au-btn" data-p="google">${I.google}<span>Google ile devam et</span></button>
        </div>
        ${terms}
        <div class="au-err" id="auMErr" role="alert"></div>
        <button class="au-quiet" id="auGuest">Misafir olarak göz at</button>
      </section>
    </div>
  </div></div>`;
  document.body.appendChild(root);

  // ── Durum ───────────────────────────────────────────────
  const err = q("#auMErr");
  let dismissible = false, known = false, accepted = false;
  function needTerms() {
    err.textContent = "Devam etmek için koşulları kabul et.";
    const t = q(".au-terms", root);
    t.classList.remove("need"); void t.offsetWidth; t.classList.add("need");
  }
  function lock(on, btn) {
    qa("button, input", root).forEach((el) => { if (el.id !== "auX") el.disabled = on; });
    if (!btn) return;
    btn.classList.toggle("busy", on);
    if (on) btn.insertAdjacentHTML("beforeend", '<i class="au-spin au-tmp"></i>');
    else btn.querySelector(".au-tmp")?.remove();
  }
  async function run(btn, fn) {
    if (!window.FB?.auth) { err.textContent = "Sunucuya bağlanılamadı. İnternet bağlantını kontrol et."; return; }
    err.textContent = "";
    lock(true, btn);
    try {
      await fn();
    } catch (e) {
      err.textContent = msg(e);
      console.warn("[auth]", e?.code || e);
    } finally {
      lock(false, btn);
    }
  }

  // ── Olaylar ─────────────────────────────────────────────
  q("#auTerms").addEventListener("change", (e) => {
    accepted = e.target.checked;
    // Kabul edilen sürüm: giriş tamamlanınca /api/me ile sunucuya gider, sunucu güncel sürümle doğrulayıp users/{uid}.terms'e yazar
    try { if (accepted && window.Docs && Docs.version()) localStorage.setItem("cf_terms", Docs.version()); else localStorage.removeItem("cf_terms"); } catch {}
    q(".au-terms", root).classList.remove("need");
    if (accepted) err.textContent = "";
  });
  qa("[data-p]", root).forEach((b) => b.addEventListener("click", () => {
    if (!accepted) return needTerms();
    run(b, () => window.FB.auth[b.dataset.p]());
  }));
  q("#auGuest").addEventListener("click", (e) => run(e.currentTarget, () => window.FB.auth.guest()));
  q("#auX").addEventListener("click", () => close());
  addEventListener("keydown", (e) => { if (e.key === "Escape" && dismissible && !root.classList.contains("out")) close(); });

  // ── Aç / kapat ──────────────────────────────────────────
  // open({ closable }) — eski çağrılardaki mode (signin / signup) yok sayılır: iki durumda da aynı ekran
  function open({ closable = false } = {}) {
    dismissible = closable;
    root.dataset.state = "ready";
    root.classList.remove("out");
    root.removeAttribute("aria-hidden");
    q("#auX").hidden = !closable;
    q("#auGuest").hidden = closable; // profilden açıldıysa zaten misafir
    err.textContent = "";
  }
  function close() {
    root.classList.add("out");
    root.setAttribute("aria-hidden", "true");
    document.activeElement?.blur?.();
  }

  // ── Profil: hesap kartı ─────────────────────────────────
  const PROV = { "apple.com": "Apple", "google.com": "Google" };
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
    el.innerHTML = `<div class="acct-row"><span class="acct-av">${av}</span><div class="acct-t"><b>${h(st.email || name)}</b>${via ? `<small>${h(via)} ile giriş</small>` : ""}</div></div>
      <div class="acct-act"><button class="acct-btn danger" data-a="out">Çıkış yap</button></div>`;
  }
  async function onAccount(e) {
    const a = e.target.closest("[data-a]")?.dataset.a;
    if (!a) return;
    if (a === "up" || a === "in") open({ closable: true });
    else if (a === "out") {
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
  addEventListener("fb-auth-error", (e) => { open(); err.textContent = msg(e.detail); });
  if (window.FB && window.FB.authState !== undefined) gate(window.FB.authState);
  // Firebase hiç yüklenemezse (çevrimdışı, ilk açılış) uygulamayı kilitleme
  setTimeout(() => { if (!known) close(); }, 9000);

  window.AUTH = { open, close };
})();
