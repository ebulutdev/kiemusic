/* ── CookRapper · Yönetim paneli ───────────────────────────
   Giriş: auth.js (aynı giriş ekranı) + fb.js (Firebase). Veri: /api/admin/* — sunucu "admin" yetkisini denetler.
   Yetki verme: npm run admin:grant -- e-posta@adresi */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const nf = new Intl.NumberFormat("tr-TR"), nf2 = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });
  const usdF = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const usd = (v) => usdF.format(v || 0), pct = (v) => (v == null ? "—" : new Intl.NumberFormat("tr-TR", { style: "percent", maximumFractionDigits: 1 }).format(v));
  const n = (v) => nf.format(Math.round(v || 0));
  const OPS = {
    generate: "Şarkı üret", cover: "Cover", extend: "Uzat", "upload-extend": "Kayıttan uzat", "add-vocals": "Vokal ekle",
    "remove-vocals": "Stem (vokal + enstrüman)", "split-stem": "Stem (tüm enstrümanlar)", "replace-section": "Bölüm değiştir",
    persona: "Persona", "voice-phrase": "Ses klonu (cümle)", voice: "Ses klonu",
  };
  const dayLabel = (d) => d.slice(8, 10) + "." + d.slice(5, 7);
  const timeAgo = (ms) => {
    if (!ms) return "—";
    const m = Math.round((Date.now() - ms) / 60000);
    return m < 60 ? `${m} dk önce` : m < 1440 ? `${Math.round(m / 60)} sa önce` : `${Math.round(m / 1440)} gün önce`;
  };

  let tab = "stats", days = 30, data = null, exp = null, ready = false, email = "";

  // ── API (403 → yetki yeni verilmiş olabilir: kimliği tazeleyip bir kez daha dene) ──
  async function api(path, opts = {}, retried = false) {
    const fb = window.FB;
    if (!fb) throw new Error("Bağlantı kurulamadı");
    const r = await fetch(path, { ...opts, headers: await fb.headers(opts.headers || {}) });
    const j = await r.json().catch(() => ({}));
    if (r.status === 403 && !retried && fb.refreshToken) { await fb.refreshToken(); return api(path, opts, true); }
    if (!r.ok || !j.success) { const e = new Error(j.error || "İstek başarısız"); e.status = r.status; throw e; }
    return j;
  }
  const state = (html) => { $("#adState").innerHTML = html || ""; };
  const panes = () => $$(".ad-pane").forEach((p) => (p.hidden = !ready || p.dataset.pane !== tab));

  // ── Oturum ──
  function onAuth(st) {
    ready = false; panes();
    $("#adWho").textContent = st && !st.anon ? st.email || st.name || "" : "";
    if (!st) return state("<b>Giriş gerekli</b>Yönetici hesabınla giriş yap.");
    if (st.anon) return state('<b>Misafir hesapla girilemez</b>Çıkış yapıp yönetici hesabınla giriş yap.');
    email = st.email || "";
    boot();
  }
  addEventListener("fb-auth", (e) => onAuth(e.detail));
  if (window.FB && window.FB.authState !== undefined) onAuth(window.FB.authState);
  $("#adOut").onclick = () => window.FB?.auth.signOut();

  async function boot() {
    state("Yükleniyor…");
    try {
      await Promise.all([loadStats(), loadExplore()]);
      ready = true; state(""); panes();
    } catch (e) {
      if (e.status === 403) state(`<b>Bu hesabın yönetici yetkisi yok</b>Terminalde çalıştır: <code>npm run admin:grant -- ${h(email || "e-posta@adresi")}</code> ardından sayfayı yenile.`);
      else if (e.status === 401) state("<b>Oturum geçersiz</b>Çıkış yapıp tekrar giriş yap.");
      else state(`<b>Yüklenemedi</b>${h(e.message)}`);
    }
  }

  // ── Sekmeler ──
  $("#adTabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (!b) return;
    tab = b.dataset.tab;
    $$("#adTabs [data-tab]").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    panes();
    if (tab === "stats" && data) drawCharts();
  });

  // ══ Analiz ══════════════════════════════════════════════
  async function loadStats() {
    data = await api(`/api/admin/stats?days=${days}`);
    renderStats();
  }
  $("#adRange").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-d]");
    if (!b || +b.dataset.d === days) return;
    days = +b.dataset.d;
    $$("#adRange [data-d]").forEach((x) => x.classList.toggle("on", x === b));
    await reload();
  });
  $("#adReload").onclick = reload;
  async function reload() {
    $("#adStamp").textContent = "Yenileniyor…";
    try { await loadStats(); } catch (e) { $("#adStamp").textContent = e.message; }
  }

  const kpi = (label, value, sub, cls = "", neg = false) =>
    `<div class="ad-kpi ${cls}"><small>${label}</small><b class="${neg ? "neg" : ""}">${value}</b><span>${sub}</span></div>`;

  function renderStats() {
    const T = data.totals, U = data.users, E = data.economics, bal = data.kieBalance;
    $("#adKpis").innerHTML = [
      kpi("Kâr", usd(T.profit), `Marj ${pct(T.margin)} · gelir ${usd(T.revenue)}`, "hero", T.profit < 0),
      kpi("Kullanıcılar", n(U.total), `${n(U.registered)} kayıtlı · ${n(U.anonymous)} misafir · bu dönem ${n(U.newInPeriod)} yeni`),
      kpi("Aktif kullanıcı (24 sa)", n(U.active.d1), `Uygulamayı açan · 7 gün ${n(U.active.d7)} · 30 gün ${n(U.active.d30)}`),
      kpi("Üreten kullanıcı (7 gün)", n(U.creators.d7), `24 sa ${n(U.creators.d1)} · 30 gün ${n(U.creators.d30)}`),
      kpi("Üretim", n(T.tasks), `${n(T.completed)} tamamlandı · ${n(T.failed)} başarısız`),
      kpi("Harcanan kredi", n(T.credits), `${n(T.refunded)} iade edildi · kullanıcılarda ${n(U.creditsOutstanding)} kalan`),
      kpi("Servis maliyeti", usd(T.cost), `${nf2.format(T.kieCredits)} servis kredisi${T.estimated ? ` · ${n(T.estimated)} görev tahmini` : ""}`),
      kpi("Servis bakiyesi", bal == null ? "—" : nf2.format(bal), bal == null ? "Okunamadı" : `kredi · ≈ ${usd(bal * E.kieUsdPerCredit)}`),
    ].join("");
    $("#tbOp").innerHTML = aggTable(data.byOp, "İşlem", (r) => h(OPS[r.key] || r.key));
    $("#tbModel").innerHTML = aggTable(data.byModel, "Model", (r) => h(r.key));
    $("#tbUser").innerHTML = userTable(data.byUser);
    $("#adStamp").textContent = `Güncellendi ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}` +
      (data.backfilled ? ` · ${data.backfilled} görevin gerçek maliyeti alındı` : "");
    drawCharts();
  }

  const money = (v) => `<td class="${v < 0 ? "neg" : ""}">${usd(v)}</td>`;
  const kieCell = (r) => `<td>${nf2.format(r.kieCredits)}${r.estimated ? `<span class="est" title="${n(r.estimated)} görev tahmini">~</span>` : ""}</td>`;
  function aggTable(rows, first, name) {
    if (!rows.length) return '<div class="ad-empty">Bu dönemde veri yok</div>';
    return `<table class="ad-table"><thead><tr><th>${first}</th><th>Üretim</th><th>Başarılı</th><th>Kredi</th><th>Servis kredisi</th><th>Gelir</th><th>Maliyet</th><th>Kâr</th><th>Marj</th><th>Kâr / üretim</th></tr></thead><tbody>${
      rows.map((r) => `<tr><td>${name(r)}</td><td>${n(r.tasks)}</td><td>${n(r.completed)}</td><td>${n(r.credits)}</td>${kieCell(r)}<td>${usd(r.revenue)}</td><td>${usd(r.cost)}</td>${money(r.profit)}<td>${pct(r.margin)}</td>${money(r.tasks ? r.profit / r.tasks : 0)}</tr>`).join("")
    }</tbody></table>`;
  }
  function userTable(rows) {
    if (!rows.length) return '<div class="ad-empty">Bu dönemde üretim yapan kullanıcı yok</div>';
    return `<table class="ad-table"><thead><tr><th>Kullanıcı</th><th>Üretim</th><th>Harcanan kredi</th><th>Kalan kredi</th><th>Servis kredisi</th><th>Gelir</th><th>Maliyet</th><th>Kâr</th><th>Son üretim</th></tr></thead><tbody>${
      rows.map((r) => `<tr><td class="who">${r.anon ? "<small>Misafir</small> " : ""}${h(r.email || r.name || r.uid.slice(0, 10) + "…")}</td><td>${n(r.tasks)}</td><td>${n(r.credits)}</td><td>${r.balance == null ? "—" : n(r.balance)}</td>${kieCell(r)}<td>${usd(r.revenue)}</td><td>${usd(r.cost)}</td>${money(r.profit)}<td>${timeAgo(r.lastAt)}</td></tr>`).join("")
    }</tbody></table>`;
  }

  // ── Grafikler: tek seri bar (tek eksen), 4 px yuvarlak uç, sade ızgara, üzerine gelince ayrıntı ──
  function niceTicks(min, max, count = 3) {
    if (min === max) max = min + 1;
    const raw = (max - min) / count, mag = 10 ** Math.floor(Math.log10(raw)), e = raw / mag;
    const step = (e >= 7.5 ? 10 : e >= 3.5 ? 5 : e >= 1.5 ? 2 : 1) * mag;
    const out = [];
    for (let v = Math.floor(min / step) * step; v <= Math.ceil(max / step) * step + step / 2; v += step) out.push(+v.toFixed(10));
    return out;
  }
  function barPath(x, w, y0, y1, r) {
    const up = y1 < y0, hgt = Math.abs(y0 - y1);
    if (hgt < 0.5) return "";
    r = Math.min(r, w / 2, hgt);
    const s = up ? 1 : -1;
    return `M${x},${y0}V${y1 + s * r}Q${x},${y1} ${x + r},${y1}H${x + w - r}Q${x + w},${y1} ${x + w},${y1 + s * r}V${y0}Z`;
  }
  function chart(el, rows, val, fmt, tip) {
    const W = el.clientWidth || 600, H = el.clientHeight || 200, P = { l: 52, r: 6, t: 8, b: 22 };
    const vals = rows.map(val), ticks = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals));
    const lo = ticks[0], hi = ticks[ticks.length - 1];
    const y = (v) => P.t + ((hi - v) / (hi - lo || 1)) * (H - P.t - P.b), y0 = y(0);
    const bw = (W - P.l - P.r) / Math.max(1, rows.length), gap = Math.min(2, bw * 0.25), w = Math.max(1, bw - gap);
    const every = Math.max(1, Math.ceil(rows.length / Math.max(2, Math.floor((W - P.l) / 56))));
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${h(el.dataset.title || "")}"><g class="grid">`;
    for (const t of ticks) s += `<line x1="${P.l}" x2="${W - P.r}" y1="${y(t)}" y2="${y(t)}"/>`;
    s += `</g><g class="axis">`;
    for (const t of ticks) s += `<text x="${P.l - 8}" y="${y(t) + 4}" text-anchor="end">${h(fmt(t))}</text>`;
    rows.forEach((r, i) => { if (i % every === 0) s += `<text x="${P.l + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle">${dayLabel(r.day)}</text>`; });
    s += `</g>`;
    if (lo < 0) s += `<line class="zero" x1="${P.l}" x2="${W - P.r}" y1="${y0}" y2="${y0}"/>`;
    rows.forEach((r, i) => { const v = vals[i], x = P.l + i * bw + gap / 2; s += `<path class="bar${v < 0 ? " neg" : ""}" data-i="${i}" d="${barPath(x, w, y0, y(v), 4)}"/>`; });
    rows.forEach((r, i) => { s += `<rect class="hit" data-i="${i}" x="${P.l + i * bw}" y="${P.t}" width="${bw}" height="${H - P.t - P.b}"/>`; });
    el.innerHTML = s + "</svg>";
    const tipEl = $("#adTip"), bars = $$(".bar", el);
    const show = (i, ev) => {
      bars.forEach((b) => b.classList.toggle("hot", +b.dataset.i === i));
      tipEl.innerHTML = tip(rows[i]);
      tipEl.hidden = false;
      const hit = el.querySelector(`.hit[data-i="${i}"]`).getBoundingClientRect(), bar = bars[i].getBoundingClientRect();
      tipEl.style.left = Math.min(innerWidth - 90, Math.max(90, hit.left + hit.width / 2)) + "px";
      tipEl.style.top = (bar.height ? Math.min(bar.top, bar.bottom) : y0 + el.getBoundingClientRect().top) + "px";
    };
    const hide = () => { tipEl.hidden = true; bars.forEach((b) => b.classList.remove("hot")); };
    $$(".hit", el).forEach((r) => {
      r.addEventListener("pointerenter", (e) => show(+r.dataset.i, e));
      r.addEventListener("pointerdown", (e) => show(+r.dataset.i, e));
    });
    el.onpointerleave = hide;
  }
  function drawCharts() {
    if (!data || tab !== "stats") return;
    const D = data.daily;
    chart($("#chTasks"), D, (d) => d.tasks, (v) => nf.format(v),
      (d) => `<b>${dayLabel(d.day)}</b> · ${n(d.tasks)} üretim · ${n(d.users)} kullanıcı · ${n(d.credits)} kredi`);
    chart($("#chProfit"), D, (d) => d.profit, (v) => usd(v),
      (d) => `<b>${dayLabel(d.day)}</b> · kâr ${usd(d.profit)} · gelir ${usd(d.revenue)} · maliyet ${usd(d.cost)}`);
  }
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(drawCharts, 150); });

  // ══ Keşfet kutuları ═════════════════════════════════════
  async function loadExplore() {
    exp = await api("/api/admin/explore");
    renderTiles();
    fillSettings();
  }
  function tileHTML(g, i) {
    const p = g.preview;
    return `<div class="ad-tile-h"><span class="n">${i + 1}</span><b>${h(g.name)}</b>${p ? '<span class="has">♪ müzik var</span>' : ""}</div>
      <label>Etiket (kutunun altında görünür; boşsa stil görünür)<input name="label" maxlength="60" value="${h(g.label || "")}" placeholder="${h(g.style)}"></label>
      <label>Stil (ok'a basınca stil alanına dolar)<input name="style" maxlength="1000" value="${h(g.style)}"></label>
      <label>Prompt / sözler (ok'a basınca dolar, isteğe bağlı)<textarea name="prompt" maxlength="3000" rows="3">${h(g.prompt || "")}</textarea></label>
      <div class="row">
        <label>Ok'a basınca<select name="action"><option value="custom">Bu tarzda üret</option><option value="cover"${g.action === "cover" ? " selected" : ""}>Bu müziğin cover'ı</option></select></label>
        <label>Müzik başlangıcı (sn)<input name="start" type="number" min="0" step="1" value="${p ? Math.round(p.start || 0) : 0}"${p ? "" : " disabled"}></label>
      </div>
      <div class="ad-music">${p
        ? `<audio controls preload="none" src="${h(p.url)}${p.start ? "#t=" + p.start : ""}"></audio><div class="meta"><span>${h(p.name || "müzik")}</span><button class="ad-ghost ad-danger" data-act="rm" type="button">Kaldır</button></div>`
        : '<span class="none">Müzik yok — kutu sessiz kalır</span>'}</div>
      <div class="acts"><button class="ad-primary" data-act="save" type="button">Kaydet</button><label class="ad-ghost ad-file">Müzik yükle<input type="file" accept="audio/*" data-act="up"></label><span class="ad-note"></span></div>`;
  }
  function renderTiles() {
    const max = exp.exploreMax || 20;
    $("#adTiles").innerHTML = exp.genres.slice(0, max).map((g, i) => `<div class="ad-tile" data-i="${i}">${tileHTML(g, i)}</div>`).join("");
  }
  const tileNote = (el, msg) => { el.querySelector(".acts .ad-note").textContent = msg; };
  function refreshTile(el, i, g) { exp.genres[i] = g; el.innerHTML = tileHTML(g, i); }

  $("#adTiles").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-act]");
    if (!b || b.dataset.act === "up") return;
    const el = b.closest(".ad-tile"), i = +el.dataset.i, v = (k) => el.querySelector(`[name="${k}"]`);
    try {
      if (b.dataset.act === "save") {
        const style = v("style").value.trim();
        if (!style) return tileNote(el, "Stil boş olamaz");
        if (v("action").value === "cover" && !exp.genres[i].preview) tileNote(el, "Cover için önce müzik yükle");
        b.disabled = true;
        const j = await api("/api/admin/explore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          index: i, label: v("label").value.trim(), style, prompt: v("prompt").value.trim(), action: v("action").value,
          ...(exp.genres[i].preview ? { start: Math.max(0, +v("start").value || 0) } : {}),
        }) });
        refreshTile(el, i, j.genre);
        tileNote(el, "Kaydedildi ✓");
      } else if (b.dataset.act === "rm") {
        if (!confirm("Bu kutunun müziği kaldırılsın mı?")) return;
        const j = await api("/api/admin/explore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ index: i, removePreview: true }) });
        refreshTile(el, i, j.genre);
        tileNote(el, "Müzik kaldırıldı");
      }
    } catch (err) { tileNote(el, err.message); b.disabled = false; }
  });
  $("#adTiles").addEventListener("change", async (e) => {
    const inp = e.target.closest("[data-act=up]");
    if (!inp || !inp.files[0]) return;
    const el = inp.closest(".ad-tile"), i = +el.dataset.i, f = inp.files[0];
    if (f.size > 30 * 1024 * 1024) return tileNote(el, "Dosya en fazla 30 MB olabilir");
    const fd = new FormData();
    fd.append("index", String(i));
    fd.append("start", String(Math.max(0, +(el.querySelector('[name="start"]').value) || 0)));
    fd.append("file", f, f.name);
    tileNote(el, "Yükleniyor…");
    try {
      const j = await api("/api/admin/explore", { method: "POST", body: fd });
      refreshTile(el, i, j.genre);
      tileNote(el, "Müzik yüklendi ✓");
    } catch (err) { tileNote(el, err.message); }
  });

  // ══ Ayarlar ═════════════════════════════════════════════
  function fillSettings() {
    const f = $("#adEcon"), E = data?.economics || { usdPerCredit: 0.01, kieUsdPerCredit: 0.005, kieCreditsEstimate: {} };
    f.usdPerCredit.value = E.usdPerCredit;
    f.kieUsdPerCredit.value = E.kieUsdPerCredit;
    f.exploreMax.value = exp?.exploreMax ?? 20;
    f.previewSec.value = exp?.previewSec ?? 30;
    const keys = [...new Set([...Object.keys(OPS), ...Object.keys(E.kieCreditsEstimate || {})])];
    $("#adEst").innerHTML = keys.map((k) => `<label>${h(OPS[k] || k)}<input type="number" min="0" step="0.5" data-k="${h(k)}" value="${E.kieCreditsEstimate?.[k] ?? 0}"></label>`).join("");
  }
  $("#adEcon").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.currentTarget, msg = $("#adEconMsg"), est = {};
    $$("#adEst input").forEach((i) => (est[i.dataset.k] = Math.max(0, +i.value || 0)));
    msg.textContent = "Kaydediliyor…";
    try {
      await api("/api/admin/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        economics: { usdPerCredit: +f.usdPerCredit.value, kieUsdPerCredit: +f.kieUsdPerCredit.value, kieCreditsEstimate: est },
        exploreMax: Math.round(+f.exploreMax.value), previewSec: Math.round(+f.previewSec.value),
      }) });
      msg.textContent = "Kaydedildi ✓ — analiz yenileniyor";
      exp.exploreMax = Math.round(+f.exploreMax.value);
      renderTiles();
      await loadStats();
      msg.textContent = "Kaydedildi ✓";
    } catch (err) { msg.textContent = err.message; }
  });
})();
