/* ── CookRapper · Aylık plan / kredi penceresi ───────────────
   Krediler aylıktır: her dönem başında bakiye plan kredisine (abonelik) ya da ücretsiz kotaya sıfırlanır, devretmez
   (sunucu: lib/data/users.ts settlePeriod). Planlar config/app → pricing.plans (SF.applyPricing → Credits.setPricing);
   plan id = App Store / Play abonelik ürün kimliği.
   Kipler: guest (misafir → hesap aç, hediye kredi) · empty (kredi bitti) · manual (kredi göstergesine dokunuldu).
   Satın alma yalnız mağaza içi abonelik: window.CR.purchase(id) (mobil köprü; sunucu makbuzu doğrular → startPlan).
   Mağaza kuralı: fiyat + dönem + otomatik yenileme metni + koşullar / gizlilik bağlantısı + geri yükleme görünür olmalı;
   mobilde fiyat mağazadan gelir (CR.products), yoksa config fiyatı gösterilir. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const money = (v, cur = "TRY") => new Intl.NumberFormat("tr-TR", { style: "currency", currency: cur, maximumFractionDigits: v % 1 ? 2 : 0 }).format(v);
  const DAY = 864e5;
  const MANAGE = { ios: "https://apps.apple.com/account/subscriptions", android: "https://play.google.com/store/account/subscriptions" };
  const svg = (d, w = 18, sw = 2) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    x: svg('<path d="M6 6l12 12M18 6 6 18"/>', 16, 2.2),
    spark: svg('<path d="M12 2.5l2.1 6.4 6.4 2.1-6.4 2.1L12 19.5l-2.1-6.4L3.5 11l6.4-2.1z"/><path d="M19 17v4M17 19h4"/>', 28, 1.9),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 13, 3),
    tick: svg('<circle cx="12" cy="12" r="9.5"/><path d="m8 12.2 2.8 2.8L16.2 9.5"/>', 20, 1.8),
  };

  let plans = [], cfg = { startCredits: 0, periodDays: 30, costs: {} };
  let sel = null, mode = "manual", prices = {}, priced = false;
  const platform = () => (window.CR && window.CR.platform) || "web";
  const set = () => (window.SF ? window.SF.state().set : { credits: 0 });
  const planOf = (id) => plans.find((p) => p.id === id);
  const price = (p) => prices[p.id] || money(p.price, p.currency);
  const songs = (cr) => Math.floor(cr / (cfg.costs.generate || 12)) * 2; // 1 üretim = 2 şarkı

  /** Kredi durumu — profil kartı ve pencere aynı hesabı kullanır. pct: bu dönemde verilen kredinin kalan yüzdesi. */
  function info() {
    const s = set(), a = window.FB && window.FB.authState, guest = !a || a.anon;
    const plan = s.plan && s.plan.expiresAt > Date.now() ? s.plan : null, pd = s.period, credits = guest ? 0 : s.credits || 0;
    const grant = guest ? cfg.startCredits : Math.max((pd && pd.grant) || 0, credits);
    const pct = grant ? Math.max(0, Math.min(100, (credits / grant) * 100)) : 0;
    let meta = "";
    if (!guest && pd && pd.end) {
      const d = Math.ceil((pd.end - Date.now()) / DAY), w = plan ? "yenilenir" : "sıfırlanır";
      meta = d <= 0 ? "Bugün " + w : d === 1 ? "Yarın " + w : `${d} gün sonra ${w}`;
    }
    return { guest, credits, grant, pct, plan, name: plan ? (planOf(plan.id) || {}).name || "Plan" : "Ücretsiz", meta, start: cfg.startCredits };
  }

  const el = document.createElement("div");
  el.className = "cp";
  el.id = "cp";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-labelledby", "cpT");
  el.innerHTML = `
    <div class="cp-card" id="cpCard">
      <div class="cp-grab" aria-hidden="true"><i></i></div>
      <button class="cp-x" type="button" aria-label="Kapat">${I.x}</button>
      <div class="cp-body">
        <header class="cp-hero">
          <div class="cp-orb" aria-hidden="true"><i></i>${I.spark}</div>
          <h2 id="cpT"></h2>
          <p class="cp-sub" id="cpSub"></p>
        </header>
        <div class="cp-now" id="cpNow"></div>
        <div class="cp-gift" id="cpGift"></div>
        <div class="cp-list" id="cpList" role="radiogroup" aria-label="Aylık planlar"></div>
        <ul class="cp-perks" id="cpPerks"></ul>
      </div>
      <footer class="cp-foot">
        <button class="cp-buy" id="cpBuy" type="button"><span class="cp-buy-m" id="cpBuyM"></span><span class="cp-buy-s" id="cpBuyS"></span><i class="cp-spin" aria-hidden="true"></i></button>
        <button class="cp-alt" id="cpAlt" type="button">Giriş yap</button>
        <p class="cp-note" id="cpNote" role="status" aria-live="polite"></p>
        <p class="cp-legal" id="cpLegal"></p>
        <nav class="cp-links" aria-label="Abonelik bağlantıları">
          <button type="button" id="cpRestore">Satın alımları geri yükle</button>
          <a href="/terms" data-legal="terms" target="_blank" rel="noopener">Kullanım koşulları</a>
          <a href="/privacy" data-legal="privacy" target="_blank" rel="noopener">Gizlilik</a>
        </nav>
      </footer>
    </div>`;
  document.body.appendChild(el);
  const card = $("#cpCard", el), note = (t) => { $("#cpNote").textContent = t || ""; };

  // Otomatik yenileme açıklaması — App Store 3.1.2 / Google Play abonelik politikası
  function legal() {
    const tail = " Krediler her dönem başında yenilenir; kullanılmayan kredi sonraki aya devretmez.";
    if (platform() === "ios") return "Ödeme, onayınla Apple hesabından alınır. Abonelik, dönem bitmeden en az 24 saat önce iptal edilmezse aynı ücretle her ay otomatik yenilenir. App Store hesap ayarlarındaki Abonelikler bölümünden yönetebilir ya da iptal edebilirsin." + tail;
    if (platform() === "android") return "Ödeme, onayınla Google Play hesabından alınır. Abonelik, iptal edilmedikçe aynı ücretle her ay otomatik yenilenir. Google Play'de Ödemeler ve abonelikler bölümünden yönetebilir ya da iptal edebilirsin." + tail;
    return "Abonelik App Store ya da Google Play üzerinden alınır ve dönem bitmeden en az 24 saat önce iptal edilmezse her ay otomatik yenilenir." + tail;
  }

  function render() {
    const k = info(), guest = mode === "guest";
    el.dataset.mode = guest ? "guest" : "plans";
    const title = guest ? "Hesabını aç" : mode === "empty" ? "Kredin bitti" : k.plan ? "Planın" : "Daha çok üret";
    $("#cpT").innerHTML = `${title}<em>.</em>`;
    $("#cpSub").textContent = guest
      ? "Kredi kullanmak ve şarkılarını her cihazda saklamak için hesap gerekli."
      : mode === "empty"
        ? (k.plan ? "Bu dönemin kredisi bitti. Daha büyük plana geçebilir ya da yenilenmeyi bekleyebilirsin." : "Aylık bir plan seç, üretmeye hemen devam et.")
        : "Her ay yenilenen kredi. İstediğin zaman iptal et.";

    if (guest) {
      $("#cpGift").innerHTML = `
        <div class="cp-gift-n"><b>${k.start}</b><span>kredi</span></div>
        <div class="cp-gift-t"><b>Hoş geldin hediyesi</b><small>≈ ${songs(k.start)} şarkı · ${cfg.periodDays || 30} gün geçerli</small></div>`;
      $("#cpBuyM").textContent = "Hesap oluştur";
      $("#cpBuyS").textContent = "";
      $("#cpBuy").disabled = false;
      return;
    }

    $("#cpNow").innerHTML = `
      <svg class="cp-ring" viewBox="0 0 44 44" aria-hidden="true"><circle class="t" cx="22" cy="22" r="18" pathLength="100"/><circle class="v" cx="22" cy="22" r="18" pathLength="100" stroke-dasharray="${k.pct.toFixed(1)} 100"${k.pct ? "" : ' stroke-opacity="0"'}/></svg>
      <div class="cp-now-x"><div class="cp-now-t">${k.credits}<span>${k.grant ? " / " + k.grant : ""}</span> <span>kredi</span></div><small>${h(k.name)}${k.meta ? " · " + h(k.meta) : ""}</small></div>`;

    const list = $("#cpList");
    if (!plans.length) {
      list.innerHTML = '<p class="cp-empty">Planlar yükleniyor…</p>';
      $("#cpPerks").innerHTML = "";
      $("#cpBuyM").textContent = "Abone ol";
      $("#cpBuyS").textContent = "";
      $("#cpBuy").disabled = true;
      return;
    }
    if (!planOf(sel)) sel = defaultPlan(k);
    const base = Math.max(...plans.map((p) => p.price / p.credits)); // kredi başına en yüksek fiyat → tasarruf oranı
    list.innerHTML = plans.map((p) => {
      const on = p.id === sel, cur = k.plan && k.plan.id === p.id, save = Math.round((1 - p.price / p.credits / base) * 100);
      const tag = cur ? '<em class="cp-tag cur">Mevcut plan</em>' : save >= 5 ? `<em class="cp-tag">%${save} tasarruf</em>` : p.best ? '<em class="cp-tag">En avantajlı</em>' : "";
      return `
        <button class="cp-pl${on ? " on" : ""}" type="button" role="radio" aria-checked="${on}" data-id="${h(p.id)}">
          <span class="cp-r" aria-hidden="true">${I.check}</span>
          <span class="cp-pm"><span class="cp-pn"><b>${h(p.name)}</b>${tag}</span><small>${p.credits} kredi / ay</small></span>
          <span class="cp-pp"><b>${h(price(p))}</b><small>/ ay</small></span>
        </button>`;
    }).join("");

    const p = planOf(sel), cur = k.plan && k.plan.id === p.id;
    $("#cpPerks").innerHTML = [`Her ay ${p.credits} kredi · ≈ ${songs(p.credits)} şarkı`, "Cover, uzatma, vokal ve stem dahil", "İstediğin zaman iptal et"]
      .map((t) => `<li>${I.tick}<span>${h(t)}</span></li>`).join("");
    $("#cpBuyM").textContent = cur ? "Aboneliği yönet" : k.plan ? "Plana geç" : "Abone ol";
    $("#cpBuyS").textContent = cur ? [p.name, k.meta].filter(Boolean).join(" · ") : `${p.name} · ${price(p)} / ay`;
    $("#cpBuy").disabled = false;
    $("#cpLegal").textContent = legal();
  }

  // Varsayılan seçim: abone değilse önerilen plan; aboneyken kredi bittiyse bir üst plan, yoksa mevcut plan
  function defaultPlan(k) {
    if (k.plan) {
      const up = mode === "empty" && plans.filter((p) => p.credits > k.plan.credits).sort((a, b) => a.credits - b.credits)[0];
      return (up || planOf(k.plan.id) || plans[0]).id;
    }
    return (plans.find((p) => p.best) || plans[plans.length - 1]).id;
  }

  // Mobilde fiyat mağazadan (yerel para birimi, vergi dahil) — köprü varsa bir kez sorulur
  function loadStorePrices() {
    if (priced || !plans.length || !window.CR || typeof window.CR.products !== "function") return;
    priced = true;
    Promise.resolve(window.CR.products(plans.map((p) => p.id)))
      .then((list) => { (list || []).forEach((x) => { if (x && x.id && x.price) prices[x.id] = x.price; }); if (el.classList.contains("open")) render(); })
      .catch(() => { priced = false; });
  }

  $("#cpList", el).addEventListener("click", (e) => {
    const b = e.target.closest("[data-id]");
    if (!b || b.dataset.id === sel) return;
    sel = b.dataset.id;
    note("");
    render();
  });
  // Ok tuşlarıyla plan seçimi (radiogroup)
  $("#cpList", el).addEventListener("keydown", (e) => {
    if (!/^Arrow(Up|Down|Left|Right)$/.test(e.key) || !plans.length) return;
    e.preventDefault();
    const i = plans.findIndex((p) => p.id === sel), d = /Up|Left/.test(e.key) ? -1 : 1;
    sel = plans[(i + d + plans.length) % plans.length].id;
    render();
    $(`#cpList [data-id="${CSS.escape(sel)}"]`).focus();
  });
  $(".cp-x", el).addEventListener("click", () => close());
  el.addEventListener("click", (e) => { if (e.target === el) close(); });

  const auth = (m) => { close(); setTimeout(() => window.AUTH && window.AUTH.open({ mode: m, closable: true }), 220); };
  $("#cpAlt").addEventListener("click", () => auth("signin"));

  $("#cpBuy").addEventListener("click", async () => {
    if (mode === "guest") return auth("signup");
    const k = info(), p = planOf(sel), btn = $("#cpBuy");
    if (!p) return;
    const native = window.CR && window.CR.native;
    if (k.plan && k.plan.id === p.id) {
      if (MANAGE[platform()]) window.open(MANAGE[platform()], "_blank", "noopener");
      else note("Aboneliğini satın aldığın mağazanın hesap ayarlarından yönetebilirsin.");
      return;
    }
    // Mağaza içi abonelik: StoreKit / Play Billing → sunucu makbuzu doğrular, krediyi plana göre yeniler
    if (!native || typeof window.CR.purchase !== "function") return note("Abonelik iPhone ve Android uygulamasından alınır.");
    btn.disabled = true;
    btn.classList.add("busy");
    note("");
    try {
      await window.CR.purchase(p.id);
      note("Aboneliğin başladı. Kredilerin hesabına eklendi.");
      setTimeout(close, 1200);
    } catch (err) {
      note(err && err.message === "cancelled" ? "" : (err && err.message) || "Satın alma tamamlanamadı.");
    } finally {
      btn.disabled = false;
      btn.classList.remove("busy");
    }
  });

  $("#cpRestore").addEventListener("click", async () => {
    if (!window.CR || typeof window.CR.restore !== "function") return note("Geri yükleme iPhone ve Android uygulamasından yapılır.");
    note("Satın alımlar kontrol ediliyor…");
    try {
      const ok = await window.CR.restore();
      note(ok ? "Aboneliğin geri yüklendi." : "Bu hesapta etkin abonelik bulunamadı.");
    } catch (err) {
      note((err && err.message) || "Geri yükleme tamamlanamadı.");
    }
  });

  // Telefonda aşağı sürükleyerek kapat (tutamaç ya da başlık alanından) — docs.js sheetDrag
  window.sheetDrag(card, ".cp-grab,.cp-hero", close);

  function open(reason = "manual") {
    mode = reason === "guest" || info().guest ? "guest" : reason;
    sel = null;
    note("");
    render();
    loadStorePrices();
    $(".cp-body", el).scrollTop = 0;
    if (typeof openLayer === "function") openLayer(el); else el.classList.add("open");
  }
  function close() {
    if (!el.classList.contains("open")) return;
    if (typeof closeLayer === "function") closeLayer(el); else el.classList.remove("open");
  }

  window.Credits = {
    open, close, info,
    setPricing(p) {
      if (!p) return;
      if (Array.isArray(p.plans)) plans = p.plans;
      cfg = { startCredits: p.startCredits || 0, periodDays: p.periodDays || 30, costs: p.costs || {} };
      if (el.classList.contains("open")) render();
    },
  };
})();
