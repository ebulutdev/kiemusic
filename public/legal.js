/* ── CookRapper · yasal sayfalar: dil (TR/EN), tema, iletişim adresi ──
   Dil: ?lang=en|tr → uygulamadaki seçim (sf_lang) → cihaz dili. Tema: uygulamadaki seçim (sf2_set.theme) → sistem.
   İletişim e-postası config/app.json → legal.contact (boşsa sayfadaki yer tutucu metin kalır). */
(() => {
  const root = document.documentElement;
  const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  try {
    const t = JSON.parse(read("sf2_set") || "{}").theme;
    if (t === "light" || t === "dark") root.dataset.theme = t;
  } catch { /* varsayılan: sistem teması */ }

  const btns = document.querySelectorAll(".lg-lang [data-l]");
  function setLang(l) {
    root.lang = root.dataset.lang = l;
    document.title = root.dataset[l === "en" ? "titleEn" : "titleTr"] || document.title;
    btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.l === l)));
  }
  const q = new URLSearchParams(location.search).get("lang");
  const pref = q || read("sf_lang") || ((navigator.language || "").toLowerCase().startsWith("tr") ? "tr" : "en");
  setLang(pref === "en" ? "en" : "tr");
  btns.forEach((b) => b.addEventListener("click", () => setLang(b.dataset.l)));

  fetch("config/app.json", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((c) => {
      const mail = c && c.legal && c.legal.contact;
      if (!mail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return;
      document.querySelectorAll("[data-contact]").forEach((el) => {
        const a = document.createElement("a");
        a.href = "mailto:" + mail;
        a.textContent = mail;
        el.replaceChildren(a);
      });
    })
    .catch(() => {});
})();
