/* CookRapper — TR / EN dil desteği
   Arayüz Türkçe yazılır; İngilizce seçilince metin düğümleri ve placeholder / aria-label / title
   öznitelikleri sözlükten çevrilir. Kullanıcı içeriği (şarkı adı, sözler, stil) çevrilmez.
   Seçim localStorage'da saklanır: sf_lang = "tr" | "en". */
(function () {
  const D = {
    // gezinme / genel
    "Ana sayfa": "Home", "Stüdyo": "Studio", "Kütüphane": "Library", "Profil": "Profile", "Profilim": "My profile",
    "Oluştur": "Create", "Ana menü": "Main menu", "Ara": "Search", "Kapat": "Close", "Diğer": "More", "Görünüm": "View",
    "Temizle": "Clear", "Yenile": "Refresh", "Devam": "Continue", "Kredi": "Credits", "kredi": "credits", "Misafir": "Guest",
    "Kopyala": "Copy", "Kopyalandı": "Copied", "Kopyalanamadı": "Couldn't copy", "Kaydedildi": "Saved", "Kaydedilemedi": "Couldn't save",
    "Silindi": "Deleted", "Sil": "Delete", "Paylaş": "Share", "İndir": "Download", "Dinle": "Listen", "Hazır": "Ready",
    "Yükleniyor": "Loading", "Hazırlanıyor": "Preparing", "Gönderiliyor…": "Sending…", "Oluşturuluyor…": "Creating…", "Kaydediliyor…": "Saving…",
    "Başarısız": "Failed", "İşlem başarısız": "Action failed", "İstek başarısız": "Request failed", "Zaman aşımı": "Timed out",
    "Görev bulunamadı": "Task not found", "Sunucuya bağlanılamadı": "Couldn't reach the server",
    "Sunucuya bağlanılamadı. İnternet bağlantını kontrol et.": "Couldn't reach the server. Check your connection.",
    "İnternet bağlantını kontrol et.": "Check your internet connection.", "Sunucuya bağlı değil": "Offline", "Stüdyo çevrimiçi": "Studio online",
    "Tam ekran": "Full screen", "Rastgele": "Random",
    // keşfet / oluştur
    "Bu türle oluştur": "Create with this genre", "Ne": "What", "yaratalım?": "shall we make?",
    "Basit": "Simple", "Özel": "Custom", "Sesten": "From audio", "Vokal": "Vocal", "Beat": "Beat", "Şarkı": "Song", "şarkı": "song",
    "Yağmurlu bir gece, melankolik trap…": "A rainy night, melancholic trap…", "Bir şeyler yaz": "Write something",
    "Sözler": "Lyrics", "Stil": "Style", "Başlık": "Title", "Kadın": "Female", "Erkek": "Male", "Gelişmiş": "Advanced",
    "Stil bağlılığı": "Style strength", "Deneysellik": "Weirdness", "Ses ağırlığı": "Audio weight", "Süre": "Duration",
    "Sabit": "Fixed", "Normal": "Normal", "Yüksek": "High", "Maks": "Max", "Kaçınılacaklar": "Exclude styles",
    "Ses ekle": "Add audio", "Telefonla kaydet": "Record with phone", "Dosya yükle": "Upload file", "Kayıt": "Recording",
    "Kaydım": "My recording", "Kayıttan": "From recording", "Söz gerekli": "Lyrics required", "Stil gerekli": "Style required",
    "Sözler gerekli": "Lyrics required", "Kredi yetersiz": "Not enough credits", "Ses karakteri": "Voice character",
    "Ses karakteri: yok": "Voice character: none", "Önce ses kaydet ya da yükle": "Record or upload audio first",
    "Cover": "Cover", "Cover oluştur": "Create cover", "Uzat": "Extend", "Vokal ekle": "Add vocals", "Ayır": "Split",
    "Vokali ayır": "Split vocals", "Stem ayır": "Split stems", "Stemlere ayır": "Split into stems", "Stem": "Stem", "STEM": "STEM",
    "Bölüm değiştir": "Replace section", "Persona": "Persona", "Persona oluştur": "Create persona", "Persona adı": "Persona name",
    "Ses klonu": "Voice clone", "Personalar": "Personas", "Seslerim": "My voices", "Yeni stil": "New style",
    "Yeniden üret": "Regenerate", "Devam noktası": "Continue from", "Yeni bölümün sözleri": "Lyrics for the new section",
    "Yeni bölümün sözleri gerekli": "Lyrics for the new section are required", "Şarkının tüm sözleri gerekli": "Full song lyrics are required",
    "Ad gerekli": "Name required", "Ses adı": "Voice name", "Ses adı gerekli": "Voice name required", "Sahne adı": "Stage name", "Sahne": "Stage",
    "Sanatçı": "Artist", "Sonra çal": "Play next", "Sıraya eklendi": "Added to queue", "Beğenildi": "Liked", "Stüdyo'ya gönder": "Send to Studio", "Geri al": "Undo", "Parça seç": "Pick a track", "Stüdyo işlemleri sunucuya bağlıyken çalışır.": "Studio actions work when the server is connected.", "Parça hâlâ üretiliyor.": "Track is still generating.", "Beğendiğin şarkılar burada görünür": "Songs you like show up here", "Geri": "Back", "senin.": "is yours.", "Sesi oluştur": "Create voice", "Ses örneği": "Voice sample", "Önce ses örneği kaydet": "Record a voice sample first",
    "Doğrulama": "Verification", "Cümle hazırlanıyor…": "Preparing phrase…", "Doğrulama cümlesi alınamadı": "Couldn't get the verification phrase",
    "Bu cümleyi kendi sesinle oku ya da söyle": "Read or sing this phrase in your own voice",
    "Cümlenin tamamını net bir sesle kaydet.": "Record the whole phrase clearly.", "Önce cümleyi okuyup kaydet": "Read and record the phrase first",
    "10–60 sn şarkı söyle ya da rap yap. Arka plan sessiz olsun.": "Sing or rap for 10–60 s in a quiet place.",
    "Persona hazır": "Persona ready", "Persona hazırlanıyor": "Preparing persona", "Ses klonu hazır": "Voice clone ready",
    "Ses klonu hazırlanıyor": "Preparing voice clone", "Stemler hazır": "Stems ready", "Stem bulunamadı": "No stems found",
    "Önce bir parça üret": "Create a track first", "Uygun parça yok — önce bir şarkı üret": "No suitable track — create a song first",
    "Bu parça bu işlem için uygun değil": "This track can't be used for this action",
    "Bölüm en az 10 saniye olmalı": "Section must be at least 10 seconds", "Bölüm, şarkının yarısından uzun olamaz": "Section can't be longer than half the song",
    "Bitiş parça süresini aşıyor": "End is past the track length", "Devam noktası parça süresinden kısa olmalı": "Continue point must be inside the track",
    "Tüm enstrümanlar": "All instruments", "Vokal + enstrüman": "Vocals + instrumental", "Enstrüman": "Instrumental",
    "Arka vokal": "Backing vocals", "Davul": "Drums", "Bas": "Bass", "Gitar": "Guitar", "Klavye": "Keys", "Yaylılar": "Strings",
    "Bakır nefesli": "Brass", "Tahta nefesli": "Woodwinds", "Perküsyon": "Percussion", "Synth": "Synth", "Efekt": "FX",
    // kayıt
    "Kayda başla": "Start recording", "Kaydı durdur": "Stop recording", "Kaydı iptal et": "Cancel recording", "Kaydı kaydet": "Save recording",
    "Kaydı sil": "Delete recording", "Duraklat": "Pause", "Önce kaydı durdur": "Stop the recording first", "Mikrofon izni gerekli": "Microphone permission required",
    "Kayıt konumu": "Recording location", "Kayıt ol": "Sign up",
    // üretim durumu
    "Sırada": "Queued", "Sözler yazılıyor": "Writing lyrics", "Besteleniyor": "Composing", "Miksleniyor": "Mixing", "Son dokunuşlar": "Final touches",
    "Hâlâ üretiliyor": "Still generating", "Üretim başarısız": "Generation failed", "Yükleme başarısız": "Upload failed",
    "Ses oluşturulamadı": "Couldn't create audio", "Çalınamadı, sıradakine geçiliyor": "Couldn't play, skipping to next",
    // kütüphane
    "Kütüphanende ara": "Search your library", "Beğenilenler": "Liked", "Beğenilen şarkılar": "Liked songs", "Liste": "Playlist",
    "En yeni": "Recent", "En eski": "Oldest", "Kütüphane boş": "Your library is empty", "Sonuç yok": "No results",
    "Son üretilenler": "Recently created", "İlk şarkını oluştur": "Create your first song", "Vokal stem": "Vocal stem", "Enstrüman stem": "Instrumental stem",
    // oynatıcı
    "Oynat": "Play", "Önceki": "Previous", "Sonraki": "Next", "Karıştır": "Shuffle", "Tekrarla": "Repeat", "Beğen": "Like",
    "Beğeniyi kaldır": "Remove like", "Çalınan yer": "Playing from", "Şu an çalıyor": "Now playing", "Hakkında": "About",
    "Sıradaki": "Next up", "Sıra": "Queue", "Sırayı aç": "Open queue", "Sıra boş": "Queue is empty", "Sıranın sonu": "End of queue",
    "Bu stille üret": "Create with this style", "Karıştırma açık": "Shuffle on", "Karıştırma kapalı": "Shuffle off",
    "Tekrar kapalı": "Repeat off", "Tümünü tekrarla": "Repeat all", "Bu şarkıyı tekrarla": "Repeat one",
    "SENKRON": "SYNCED", "EŞLENİYOR…": "SYNCING…",
    // profil
    "Tema": "Theme", "Sistem": "System", "Açık": "Light", "Koyu": "Dark", "Varsayılan model": "Default model", "Dil": "Language",
    "Çıkış yap": "Sign out", "Çıkış yapıldı": "Signed out", "Çıkış yapılsın mı? Kütüphanen hesabında kayıtlı kalır.": "Sign out? Your library stays saved in your account.",
    "E-posta adresin doğrulanmadı": "Your email isn't verified", "Tekrar gönder": "Resend", "Doğrulama e-postası gönderildi": "Verification email sent",
    "ile giriş": "sign-in",
    // giriş
    "Giriş": "Sign in", "Giriş yap": "Sign in", "Hesap oluştur": "Create account", "Hesabın var mı?": "Have an account?", "Hesabın yok mu?": "No account?",
    "Apple ile devam et": "Continue with Apple", "Google ile devam et": "Continue with Google", "E-posta ile devam et": "Continue with email",
    "Misafir olarak devam et": "Continue as guest", "E-posta": "Email", "Şifre": "Password", "Şifre tekrar": "Repeat password",
    "Şifremi unuttum": "Forgot password", "Şifreni gir.": "Enter your password.", "Şifreyi göster": "Show password", "Şifreyi gizle": "Hide password",
    "Bağlantı gönder": "Send link", "Geçerli bir e-posta adresi gir.": "Enter a valid email address.", "Şifreler eşleşmiyor.": "Passwords don't match.",
    "Şifre çok zayıf. En az 8 karakter, harf ve rakam kullan.": "Password is too weak. Use 8+ characters with letters and numbers.",
    "E-posta ya da şifre hatalı.": "Wrong email or password.", "Bu e-posta zaten kayıtlı. Giriş yapmayı dene.": "This email is already registered. Try signing in.",
    "Bu e-postayla kayıtlı hesap yok.": "No account with this email.", "Bu e-posta başka bir yöntemle kayıtlı. O yöntemle giriş yap.": "This email uses another sign-in method. Use that instead.",
    "Bu adres giriş için yetkili değil.": "This address isn't authorized to sign in.", "Bu giriş yöntemi henüz açılmadı.": "This sign-in method isn't enabled yet.",
    "Bu giriş yöntemi yapılandırılmamış.": "This sign-in method isn't configured.", "Bu hesap devre dışı bırakılmış.": "This account has been disabled.",
    "Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.": "Too many attempts. Wait a bit and try again.", "Giriş yapılamadı. Tekrar dene.": "Couldn't sign in. Try again.",
    "Hoş geldin! E-postana doğrulama bağlantısı gönderdik.": "Welcome! We sent a verification link to your email.",
    // katalog: öneriler, stiller, türler
    "Yağmurlu gece, melankolik trap": "Rainy night, melancholic trap", "Sabah koşusu için enerjik synth pop": "Energetic synth pop for a morning run",
    "Piyano ve yaylılarla ağır bir aşk baladı": "Slow love ballad with piano and strings", "Karanlık, sinematik drill": "Dark, cinematic drill",
    "Yaz akşamı, gitarlı akustik": "Summer evening, acoustic guitar", "90lar nostaljik türkçe rap": "Nostalgic 90s Turkish rap",
    "Brezilya funk, yüksek enerji": "Brazilian funk, high energy", "Lo-fi çalışma beati": "Lo-fi study beat",
    "türkçe rap": "turkish rap", "sinematik": "cinematic", "akustik": "acoustic", "piyano": "piano", "kadın vokal": "female vocal",
    "erkek vokal": "male vocal", "anadolu rock": "anatolian rock", "arabesk": "arabesque",
    "#türkçe hip hop": "#turkish hip hop", "türkçe hip hop": "turkish hip hop", "nostalji": "nostalgia", "brezilya funk": "brazilian funk", "caz": "jazz", "balad": "ballad", "halk": "folk",
    "Hesap oluştur; şarkıların ve kredin her cihazda seninle olsun.": "Create an account to keep your songs and credits on every device.", "#nostalji": "#nostalgia", "#arabesk": "#arabesque", "#brezilya funk": "#brazilian funk",
    "#sinematik": "#cinematic", "#anadolu rock": "#anatolian rock", "#caz": "#jazz", "#akustik": "#acoustic", "#balad": "#ballad", "#halk": "#folk",
    // izin onayları / içerik bildirimi
    "Bu ses bana ait ya da sahibinden açık yazılı iznim var. Başka birini taklit etmek için kullanmayacağım.": "This is my own voice, or I have the owner's explicit written permission. I won't use it to impersonate anyone.",
    "Sesin sana ait olduğunu onayla": "Confirm that this is your own voice",
    "Bu kaydın haklarına sahibim ya da kullanma iznim var. Telifli bir şarkıyı izinsiz yüklemiyorum.": "I own the rights to this recording or have permission to use it. I'm not uploading copyrighted music without permission.",
    "Kaydın haklarına sahip olduğunu onayla": "Confirm that you have the rights to this recording",
    "Bildir": "Report", "İçeriği bildir": "Report content", "Başka bir sebep": "Something else", "Açıklama (isteğe bağlı)": "Details (optional)",
    "Nefret söylemi, şiddet ya da saldırgan içerik": "Hate speech, violence or offensive content", "Cinsel ya da uygunsuz içerik": "Sexual or inappropriate content",
    "Telif hakkı ihlali": "Copyright infringement", "Başka birinin sesini ya da kimliğini taklit": "Impersonates someone's voice or identity",
    "Bildirimler 24 saat içinde incelenir. Kural dışı içerik kaldırılır.": "Reports are reviewed within 24 hours. Content that breaks the rules is removed.",
    "Bildirimin alındı. Teşekkürler.": "Report received. Thank you.", "Kütüphaneden kaldır": "Remove from library", "Gönderilemedi": "Couldn't send",
    "Kaydın haklarına sahip olduğunu onaylaman gerekiyor.": "You need to confirm you have the rights to this recording.",
    "Sesin sana ait olduğunu onaylaman gerekiyor.": "You need to confirm this is your own voice.",
    "Ses klonu için kendi kaydını kullanmalısın.": "Use your own recording for a voice clone.",
    "Bu ses kaynağı kullanılamaz. Kendi kaydını yükle ya da kütüphanendeki bir parçayı seç.": "This audio source can't be used. Upload your own recording or pick a track from your library.",
    // stüdyo araçları: dalga formu, cover / uzat / bölüm değiştir
    "Başlangıç": "Start", "Bitiş": "End", "Yeni bölüm bu noktadan sonra başlar": "The new part starts after this point", "yeni bölüm": "new part",
    "Dokun: oradan dinle · Tutamaçları sürükle": "Tap to listen from there · Drag the handles", "Dokun ya da sürükle: devam noktası": "Tap or drag: continue point",
    "0,5 sn geri": "Back 0.5 s", "0,5 sn ileri": "Forward 0.5 s", "Seçimi dinle": "Play selection", "Geçişi dinle": "Play lead-in", "Durdur": "Stop",
    "Bu sözleri düzenle": "Edit these lyrics", "Seçili bölümdeki sözler": "Lyrics in the selection", "Devam noktasından önceki son satırlar": "Last lines before the continue point",
    "Dalga formu yükleniyor…": "Loading waveform…", "Dalga formu gösterilemiyor; dinleyerek seçebilirsin.": "Waveform unavailable; you can still choose by listening.",
    "Bu parçanın sesi hazır değil": "This track's audio isn't ready", "Düzenle": "Edit", "Dalga formu yok — dinleyerek seç": "No waveform — choose by listening",
    "Yeni sözler (isteğe bağlı)": "New lyrics (optional)", "Tüm sözler": "Full lyrics", "Stil (boş: aynı stil)": "Style (empty: same style)",
    "Şarkının tüm sözleri (düzenlenmiş)": "Full song lyrics (edited)", "Devam bölümünün sözleri (boş: yapay zekâ yazar)": "Lyrics for the new part (empty: AI writes them)",
    "Sözler (boş bırakırsan yapay zekâ yazar)": "Lyrics (leave empty and AI writes them)", "Yeni stil — ör. akustik gitar, lo-fi, 90lar rap": "New style — e.g. acoustic guitar, lo-fi, 90s rap",
    "Vokalli": "With vocals", "Enstrümantal": "Instrumental", "Kaynağa bağlılık": "Source strength", "Çeşitlilik": "Variety", "Oto": "Auto",
    "Kaçınılacaklar — ör. davul, distorsiyon": "Exclude — e.g. drums, distortion", "Model": "Model", "Dengeli": "Balanced", "Hızlı": "Fast", "Deneysel": "Experimental",
    "Parçayı seçtiğin noktadan itibaren yeni bir bölümle devam ettirir. Sonuç, uzatılmış şarkının tamamıdır.": "Continues the track with a new part from the point you choose. The result is the full extended song.",
    "Parçanın ana melodisini korur; stilini, sesini ve sözlerini değiştirir.": "Keeps the track's core melody and changes its style, voice and lyrics.",
    "Seçtiğin aralık yeniden üretilir, şarkının geri kalanı aynı kalır. Aralık en az 10 sn, en çok şarkının yarısı olabilir.": "The selected range is regenerated and the rest of the song stays the same. The range must be at least 10 s and at most half the song.",
    "Üretim başarısız oldu.": "Generation failed.", "İşlem şu an yapılamadı. Biraz sonra tekrar dene.": "Couldn't do that right now. Try again in a moment."
  };
  const MONTHS = { Ocak: "January", Şubat: "February", Mart: "March", Nisan: "April", Mayıs: "May", Haziran: "June", Temmuz: "July",
    Ağustos: "August", Eylül: "September", Ekim: "October", Kasım: "November", Aralık: "December" };
  const RX = [
    [/^(\d+) şarkı$/, (m, n) => n + (n === "1" ? " song" : " songs")], [/^(\d+) parça$/, (m, n) => n + (n === "1" ? " track" : " tracks")], [/^(\d+) kredi$/, "$1 credits"],
    [/^(\d{1,2}) (Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık) (\d{4})$/, (m, d, mo, y) => `${MONTHS[mo]} ${d}, ${y}`],
    [/^Kayıt en az (\d+) saniye olmalı$/, "Recording must be at least $1 seconds"], [/^Ses en az (\d+) saniye olmalı$/, "Audio must be at least $1 seconds"],
    [/^Ses en fazla (\d+) dakika olabilir$/, "Audio can be at most $1 minutes"], [/^Dosya en fazla (\d+) MB olabilir$/, "File can be at most $1 MB"],
    [/^Bağlantıyı (.+) adresine gönderdik\. Gelen kutunu ve spam klasörünü kontrol et\.$/, "We sent the link to $1. Check your inbox and spam folder."],
    [/^(.+) ile giriş$/, "Signed in with $1"],
    [/^([\d.]+) sn$/, "$1 s"], [/^en az (\d+) sn$/, "min $1 s"], [/^en çok (.+)$/, "max $1"], [/^(Yeni stil|Stil) — şu an: (.+)$/, (m, k, v) => (k === "Stil" ? "Style" : "New style") + " — now: " + v]
  ];
  // kullanıcı içeriği: çevrilmez
  const SKIP = "#fpLyr,.song:not(.pin) .t,.gc-t,#fpTitle,#miniTitle,#lfTitle,#fpStyle,.np-q-t b,.menu-head b,script,style,textarea,[data-noi18n]";
  const ATTRS = ["placeholder", "aria-label", "title"];

  function one(p) {
    if (Object.prototype.hasOwnProperty.call(D, p)) return D[p];
    for (const [re, to] of RX) if (re.test(p)) return p.replace(re, to);
    return p;
  }
  function tr(s) {
    const core = s.trim();
    if (!core || !/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(core)) return s;
    const lead = s.slice(0, s.indexOf(core[0])), trail = s.slice(s.lastIndexOf(core[core.length - 1]) + 1);
    let out = one(core);
    if (out === core && / [•·] /.test(core)) out = core.split(/( [•·] )/).map((p) => (/^ [•·] $/.test(p) ? p : one(p))).join("");
    return lead + out + trail;
  }

  let LANG = "tr";
  const textMem = new WeakMap(); // düğüm → {tr, en}
  const attrMem = new WeakMap(); // öğe → {attr: {tr, en}}
  const skip = (el) => !el || !!el.closest(SKIP);

  function doText(n) {
    if (skip(n.parentElement)) return;
    let m = textMem.get(n);
    if (!m || (n.nodeValue !== m.en && n.nodeValue !== m.tr)) { m = { tr: n.nodeValue, en: tr(n.nodeValue) }; textMem.set(n, m); }
    const want = LANG === "en" ? m.en : m.tr;
    if (n.nodeValue !== want) n.nodeValue = want;
  }
  function doAttrs(el) {
    if (skip(el)) return;
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (v == null) continue;
      let all = attrMem.get(el);
      if (!all) { all = {}; attrMem.set(el, all); }
      let m = all[a];
      if (!m || (v !== m.en && v !== m.tr)) { m = all[a] = { tr: v, en: tr(v) }; }
      const want = LANG === "en" ? m.en : m.tr;
      if (v !== want) el.setAttribute(a, want);
    }
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) return doText(root);
    if (root.nodeType !== 1) return;
    doAttrs(root);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = tw.nextNode())) n.nodeType === 3 ? doText(n) : doAttrs(n);
  }

  const mo = new MutationObserver((list) => {
    for (const r of list) {
      if (r.type === "characterData") doText(r.target);
      else if (r.type === "attributes") doAttrs(r.target);
      else r.addedNodes.forEach(walk);
    }
  });

  function set(l, quiet) {
    LANG = l === "en" ? "en" : "tr";
    try { localStorage.setItem("sf_lang", LANG); } catch (e) {}
    document.documentElement.lang = LANG;
    walk(document.body);
    document.querySelectorAll("#langSeg button").forEach((b) => b.classList.toggle("on", b.dataset.v === LANG));
    if (!quiet) window.dispatchEvent(new CustomEvent("sf-lang", { detail: LANG }));
  }

  // confirm / alert metinleri
  const oc = window.confirm.bind(window), oa = window.alert.bind(window);
  window.confirm = (m) => oc(LANG === "en" ? tr(String(m)) : m);
  window.alert = (m) => oa(LANG === "en" ? tr(String(m)) : m);

  let saved = null;
  try { saved = localStorage.getItem("sf_lang"); } catch (e) {}
  const start = saved || ((navigator.language || "").toLowerCase().startsWith("tr") ? "tr" : "en");
  window.I18N = { set, get: () => LANG, t: (s) => (LANG === "en" ? tr(s) : s) };

  function boot() {
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    set(start, true);
    const seg = document.getElementById("langSeg");
    if (seg) seg.addEventListener("click", (e) => { const b = e.target.closest("button[data-v]"); if (b) set(b.dataset.v); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
