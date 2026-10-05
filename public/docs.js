/* ── CookRapper · Yasal metin penceresi (Kullanım Koşulları / Gizlilik Politikası) ──────────
   Uygulamadan çıkmadan, alttan açılan pencerede (geniş ekranda orta kart) gösterir — ödeme penceresiyle aynı tasarım.
   Metin uygulama paketindeki terms.html / privacy.html'den okunur → anında ve çevrimdışı açılır. Aynı sayfalar sunucuda
   /terms ve /privacy adresindedir (mağazaya verilen adres) → "Tarayıcıda aç".
   Açan bağlantılar: a[data-legal="terms|privacy"] (giriş ekranı, profil, ödeme penceresi). Dil: uygulamanın dili.
   window.sheetDrag: telefonda aşağı sürükleyerek kapatma (credits.js de kullanır). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);

  /** Alttan açılan pencere: tutamaç / başlık alanından aşağı sürükleyince kapat (yalnız dar ekranda). */
  window.sheetDrag = (card, zone, onClose) => {
    let drag = null;
    card.addEventListener("pointerdown", (e) => {
      if (innerWidth >= 600 || e.button > 0 || !e.target.closest(zone)) return;
      drag = { y: e.clientY, t: performance.now(), dy: 0, id: e.pointerId };
    });
    card.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dy = Math.max(0, e.clientY - drag.y);
      if (drag.dy > 4 && !card.hasPointerCapture(e.pointerId)) { card.setPointerCapture(e.pointerId); card.style.transition = "none"; }
      if (card.style.transition === "none") card.style.transform = `translateY(${drag.dy}px)`;
    });
    const end = () => {
      if (!drag) return;
      const fling = drag.dy / Math.max(1, performance.now() - drag.t) > 0.6;
      card.style.transition = "";
      card.style.transform = "";
      if (drag.dy > 110 || (fling && drag.dy > 30)) onClose();
      drag = null;
    };
    card.addEventListener("pointerup", end);
    card.addEventListener("pointercancel", end);
  };

  const FILES = { terms: "terms.html", privacy: "privacy.html" };
  let links = { terms: "/terms", privacy: "/privacy" }, contact = "", cur = "terms", seq = 0, opener = null;
  const cache = {}; // "terms:tr" → <article> (ayrıştırılmış, bir kez)
  const lang = () => (document.documentElement.lang === "en" ? "en" : "tr");
  const webUrl = (k) => { const u = links[k] || "/" + k; return window.CR ? window.CR.api(u) : u; };
  const svg = (d, w) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

  const el = document.createElement("div");
  el.className = "lgs";
  el.id = "lgs";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-labelledby", "lgsT");
  el.innerHTML = `
    <div class="lgs-card" tabindex="-1">
      <div class="lgs-top">
        <div class="lgs-grab" aria-hidden="true"><i></i></div>
        <div class="lgs-head">
          <div class="lgs-seg" role="tablist" aria-label="Yasal metinler">
            <button type="button" role="tab" data-doc="terms" aria-controls="lgsBody">Koşullar</button>
            <button type="button" role="tab" data-doc="privacy" aria-controls="lgsBody">Gizlilik</button>
          </div>
          <button class="lgs-x" type="button" aria-label="Kapat">${svg('<path d="M6 6l12 12M18 6 6 18"/>', 16)}</button>
        </div>
      </div>
      <div class="lgs-body" id="lgsBody" role="tabpanel">
        <p class="lgs-state" id="lgsState" role="status" hidden></p>
        <div class="lgs-doc" data-noi18n></div>
        <div class="lgs-end"><button type="button" class="lgs-web">${svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>', 15)}<span>Tarayıcıda aç</span></button></div>
      </div>
    </div>`;
  document.body.appendChild(el);
  const card = $(".lgs-card", el), body = $("#lgsBody", el), docEl = $(".lgs-doc", el), state = $("#lgsState", el);

  async function load(k, l) {
    const key = k + ":" + l;
    if (!cache[key]) {
      const r = await fetch(FILES[k]);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const page = new DOMParser().parseFromString(await r.text(), "text/html");
      const art = page.querySelector(`article[lang="${l}"]`) || page.querySelector("article");
      if (!art) throw new Error("içerik yok");
      art.querySelector(".lg-foot")?.remove(); // sayfa altı bağlantıları yerine sekmeler + "Tarayıcıda aç"
      art.querySelector("h1")?.setAttribute("id", "lgsT");
      cache[key] = art;
    }
    return document.importNode(cache[key], true);
  }

  async function show(k) {
    cur = FILES[k] ? k : "terms";
    const my = ++seq, l = lang(), cached = !!cache[cur + ":" + l];
    el.querySelectorAll("[data-doc]").forEach((b) => {
      const on = b.dataset.doc === cur;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    docEl.classList.add("swap");
    if (!cached) { state.textContent = "Yükleniyor…"; state.classList.add("busy"); state.hidden = false; }
    let node = null;
    try { node = await load(cur, l); } catch { /* aşağıda hata durumu */ }
    if (my !== seq) return; // bu arada başka sekmeye geçildi
    state.classList.remove("busy");
    if (node) {
      state.hidden = true;
      if (contact) node.querySelectorAll("[data-contact]").forEach((s) => {
        const a = document.createElement("a");
        a.href = "mailto:" + contact;
        a.textContent = contact;
        s.replaceChildren(a);
      });
      docEl.replaceChildren(node);
    } else {
      docEl.replaceChildren();
      state.textContent = "Sayfa açılamadı. İnternet bağlantını kontrol et.";
      state.hidden = false;
    }
    body.scrollTop = 0;
    requestAnimationFrame(() => docEl.classList.remove("swap"));
  }

  // Metin içi bağlantılar: içindekiler → pencere içinde kaydır; diğer belge → sekme değiştir; dış adres → tarayıcı
  body.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || !docEl.contains(a)) return;
    const href = a.getAttribute("href");
    if (href.startsWith("#")) {
      e.preventDefault();
      const t = docEl.querySelector(`[id="${CSS.escape(href.slice(1))}"]`);
      if (t) body.scrollTo({ top: t.offsetTop - 8, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    } else if (href === "/terms" || href === "/privacy") {
      e.preventDefault();
      show(href.slice(1));
    } else if (href === "/") {
      e.preventDefault();
      close();
    } else if (/^https?:/i.test(href)) {
      e.preventDefault();
      window.open(href, "_blank", "noopener");
    }
  });

  el.querySelector(".lgs-seg").addEventListener("click", (e) => {
    const b = e.target.closest("[data-doc]");
    if (b && b.dataset.doc !== cur) show(b.dataset.doc);
  });
  el.querySelector(".lgs-seg").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    show(cur === "terms" ? "privacy" : "terms");
    el.querySelector(`[data-doc="${cur}"]`).focus();
  });
  $(".lgs-x", el).addEventListener("click", () => close());
  $(".lgs-web", el).addEventListener("click", () => window.open(webUrl(cur), "_blank", "noopener"));
  el.addEventListener("click", (e) => { if (e.target === el) close(); });
  window.sheetDrag(card, ".lgs-top", close);
  // Dil değişirse açık metin yeni dilde yeniden yüklenir
  addEventListener("sf-lang", () => { if (el.classList.contains("open")) show(cur); });

  // Giriş ekranı, profil ve ödeme penceresindeki bağlantılar uygulamadan çıkmadan bu pencereyi açar
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[data-legal]");
    if (!a) return;
    e.preventDefault();
    open(a.dataset.legal);
  });

  function open(k = "terms") {
    show(k);
    if (el.classList.contains("open")) return;
    opener = document.activeElement;
    el._onClose = () => { if (opener && opener.focus) opener.focus({ preventScroll: true }); opener = null; };
    if (typeof openLayer === "function") openLayer(el); else el.classList.add("open");
    setTimeout(() => card.focus({ preventScroll: true }), 80);
  }
  function close() {
    if (!el.classList.contains("open")) return;
    if (typeof closeLayer === "function") closeLayer(el);
    else { el.classList.remove("open"); el._onClose(); }
  }

  window.Docs = {
    open, close, url: webUrl,
    setLegal(l) {
      if (!l) return;
      if (l.terms) links.terms = l.terms;
      if (l.privacy) links.privacy = l.privacy;
      contact = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(l.contact || "") ? l.contact : "";
    },
  };
})();
