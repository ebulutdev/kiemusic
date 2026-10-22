/* CookFire — TR / EN dil desteği
   Arayüz Türkçe yazılır; İngilizce seçilince metin düğümleri ve placeholder / aria-label / title
   öznitelikleri sözlükten çevrilir. Kullanıcı içeriği (şarkı adı, sözler, stil) çevrilmez.
   Seçim localStorage'da saklanır: sf_lang = tr | en | de | pt | ja. */
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
    "Bu bölümü geri al": "Undo this take", "Son bölümü geri al": "Undo last take", "Kayda devam et": "Resume recording",
    "Kaydı bitir": "Finish recording", "Önce kaydı bitir (✓)": "Finish the recording first (✓)", "Bölüm silindi": "Take deleted",
    "Son bölüm silindi — devam etmek için mikrofona dokun": "Last take deleted — tap the mic to continue", "Hazırlanıyor…": "Preparing…",
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
    "Giriş": "Sign in", "Kaydol": "Sign up", "Giriş yap": "Sign in",
    "Bu e-postayla hesap yok.": "No account with this email.", "Misafir olarak göz at": "Browse as guest",
    "Kredi kullanmak için hesap oluştur ya da giriş yap.": "Create an account or sign in to use credits.",
    "Kredi kullanmak için hesap oluştur": "Create an account to use credits", "Hesap oluştur": "Create account", "Hesabın var mı?": "Have an account?", "Hesabın yok mu?": "No account?",
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
    "Bu ses bana ait ya da sahibinden açık yazılı iznim var. Başka birini taklit etmeyeceğim; doğacak sorumluluk bana aittir.": "This is my own voice, or I have the owner's explicit written permission. I won't impersonate anyone and I take full responsibility.",
    "Sesin sana ait olduğunu onayla": "Confirm that this is your own voice",
    "Bu kaydın haklarına sahibim ya da kullanma iznim var. Telif ve diğer haklardan doğan sorumluluk bana aittir.": "I own the rights to this recording or have permission to use it. I'm responsible for any copyright or other rights claims.",
    "Kaydın haklarına sahip olduğunu onayla": "Confirm that you have the rights to this recording",
    // anlık bildirim izni (app.js pushAsk)
    "Şarkın pişince haber verelim mi? 🔥": "Shall we let you know when your song is ready? 🔥",
    "Şarkın yaklaşık 1 dakikada hazır olacak. Uygulamayı kapatsan bile hazır olunca telefonuna bildirim gönderelim.": "Your song will be ready in about a minute. Even if you close the app, we'll send a notification to your phone when it's ready.",
    "Bildirimler kapalı. Şarkın hazır olduğunda haber alabilmen için Ayarlar'dan CookFire bildirimlerini aç.": "Notifications are off. Turn on CookFire notifications in Settings to hear when your song is ready.",
    "Ayarlar'ı aç": "Open Settings",
    "Haber ver": "Notify me",
    "Şimdi değil": "Not now",
    "Hazır olunca haber vereceğiz 🔥": "We'll let you know when it's ready 🔥",
    // Profil › Bildirimler
    "Bildirimler": "Notifications",
    "Şarkın hazır olunca": "When your song is ready",
    "Kredi ve abonelik": "Credits and subscription",
    "Yeni tarzlar ve öneriler": "New styles and suggestions",
    "Kapalı": "Off",
    "Bildirimleri aç": "Turn on notifications",
    "Bildirimler mobil uygulamada çalışır": "Notifications work in the mobile app",
    "Etkin": "Enabled",
    "Henüz bildirim yok": "No notifications yet",
    "Açıldı": "Turned on",
    "Kapatıldı": "Turned off",
    // analiz (vokal + müzik, kesit tekrarı)
    "Analiz": "Analyze", "Müzik": "Music", "Kesit tekrarı": "Chop repeat", "2 sn'de bir": "Every 2 s", "3 sn'de bir": "Every 3 s", "4 sn'de bir": "Every 4 s", "5 sn'de bir": "Every 5 s",
    "Gönderilecek ses": "Audio to send", "MP3 olarak indir": "Download as MP3", "MP3 hazırlanamadı": "Couldn't prepare the MP3", "Kopyalanan kesit süresi": "Copied chop length", "1 sn": "1 s", "2 sn": "2 s", "3 sn": "3 s", "4 sn": "4 s", "İkisi": "Both", "Vokal silindi": "Vocal deleted", "Müzik silindi": "Music deleted",
    "Vokal ya da müzik dosyası yükle": "Upload a vocal or music file", "Ses çözülemedi, başka bir dosya dene": "Couldn't read the audio, try another file",
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
    "Bu parçanın sesi hazır değil": "This track's audio isn't ready", "Düzenle": "Edit", "Kaynak": "Source", "Sözlerini yaz ya da yapıştır": "Write or paste your lyrics", "trap, karanlık, 808": "trap, dark, 808", "Vokal eklemek için enstrümantal bir parça gerekir.": "Adding vocals needs an instrumental track.", "Bunun için vokalli bir şarkı gerekir.": "This needs a song with vocals.",
    "Önce bir parça üret.": "Create a track first.", "Beat üret": "Make a beat", "Beat'ini yükle": "Upload your beat", "Şarkıdan beat ayır": "Split a beat from a song",
    "Şarkı üret": "Make a song", "Vokal stili — ör. yakın mikrofon, yavaş flow": "Vocal style — e.g. close mic, slow flow", "Beat'e bağlılık": "Beat strength", "Dalga formu yok — dinleyerek seç": "No waveform — choose by listening",
    "Yeni sözler (isteğe bağlı)": "New lyrics (optional)", "Tüm sözler": "Full lyrics", "Stil (boş: aynı stil)": "Style (empty: same style)",
    "Şarkının tüm sözleri (düzenlenmiş)": "Full song lyrics (edited)", "Devam bölümünün sözleri (boş: yapay zekâ yazar)": "Lyrics for the new part (empty: AI writes them)",
    "Sözler (boş bırakırsan yapay zekâ yazar)": "Lyrics (leave empty and AI writes them)", "Yeni stil — ör. akustik gitar, lo-fi, 90lar rap": "New style — e.g. acoustic guitar, lo-fi, 90s rap",
    "Vokalli": "With vocals", "Enstrümantal": "Instrumental", "Kaynağa bağlılık": "Source strength", "Çeşitlilik": "Variety", "Oto": "Auto",
    "Kaçınılacaklar — ör. davul, distorsiyon": "Exclude — e.g. drums, distortion", "Model": "Model", "Dengeli": "Balanced", "Hızlı": "Fast", "Deneysel": "Experimental",
    "Parçayı seçtiğin noktadan itibaren yeni bir bölümle devam ettirir. Sonuç, uzatılmış şarkının tamamıdır.": "Continues the track with a new part from the point you choose. The result is the full extended song.",
    "Parçanın ana melodisini korur; stilini, sesini ve sözlerini değiştirir.": "Keeps the track's core melody and changes its style, voice and lyrics.",
    "Seçtiğin aralık yeniden üretilir, şarkının geri kalanı aynı kalır. Aralık en az 10 sn, en çok şarkının yarısı olabilir.": "The selected range is regenerated and the rest of the song stays the same. The range must be at least 10 s and at most half the song.",
    "Üretim başarısız oldu.": "Generation failed.", "İşlem şu an yapılamadı. Biraz sonra tekrar dene.": "Couldn't do that right now. Try again in a moment.",
    // aylık plan / kredi penceresi (credits.js) + profil kredi kartı
    "Kabul ediyorum:": "I agree to:", "Mashup oluştur": "Create mashup", "Ne istediğini anlat; sözleri, stili ve başlığı biz yazarız.": "Describe what you want; we write the lyrics, style and title.", "Sözleri ve stili sen yazarsın; tam kontrol sende.": "You write the lyrics and style; you're in full control.", "Kendi kaydından ya da beat'inden yola çık: cover, uzatma ya da vokal ekleme.": "Start from your own recording or beat: cover, extend or add vocals.", "Sesin kesitlerle düzenlenir ve aynı tarzda devam eden bir mashup üretilir.": "Your audio is rearranged with chops and turned into a mashup that continues in the same style.", "Kaydının melodisini koruyup seçtiğin stilde yeniden üretir.": "Keeps your recording's melody and recreates it in the style you choose.", "Kaydını sonundan devam ettirir; kaydın kendisi aynen kalır.": "Continues your recording from its end; the recording itself stays as is.", "Beat'ine sözlerinle vokal ekler; stil ve söz zorunlu.": "Adds vocals with your lyrics to your beat; style and lyrics are required.", "[Verse], [Chorus] gibi etiketler bölümleri ayırır. Vokalli şarkıda zorunlu.": "Tags like [Verse] and [Chorus] mark sections. Required for vocal songs.", "Tür, ruh hali, enstrüman, tempo; virgülle ayır. Zorunlu.": "Genre, mood, instruments, tempo; separate with commas. Required.", "Emin değilsen varsayılanda bırak; çoğu şarkı için uygundur.": "If unsure, keep the defaults; they suit most songs.", "Kesit tekrarı: kaç saniyede bir kesit eklenir. Kesit süresi: eklenen parçanın uzunluğu.": "Chop repeat: how often a chop is inserted. Chop length: how long each inserted piece is.", "Stilin sabit mashup stilinin sonuna eklenir; başlık yalnız parçanın adıdır.": "Your style is added after the fixed mashup style; the title is just the track name.", "Parçayı seçtiğin noktadan devam ettirir; öncesi aynen kalır.": "Continues the track from the point you pick; everything before stays the same.", "Sarı tutamacı sürükle; yeni bölüm o noktadan başlar.": "Drag the yellow handle; the new part starts there.", "Boş bırakırsan parçanın stili kullanılır.": "Leave empty to use the track's style.", "Yalnız eklenecek bölümün sözleri; boşsa sözleri servis yazar.": "Lyrics for the new part only; leave empty and they're written for you.", "Melodiyi koruyup parçayı yeni stil ya da sözlerle yeniden üretir.": "Keeps the melody and recreates the track with a new style or lyrics.", "Hangi tarza dönüşsün? Boşsa parçanın stili kalır.": "Which style should it become? Empty keeps the track's style.", "Değiştirmezsen orijinal sözler söylenir. Beat'ten vokalli cover için zorunlu.": "Unchanged, the original lyrics are sung. Required for a vocal cover of a beat.", "Beat'ine sözlerinle yeni bir vokal ekler.": "Adds a new vocal with your lyrics to your beat.", "Vokalin tarzı; boşsa beat'in stili kullanılır.": "The vocal's style; empty uses the beat's style.", "Beat üzerinde söylenecek sözler. Zorunlu.": "Lyrics to sing over the beat. Required.", "Parçayı vokal ve enstrümanlara ayırır; her biri kütüphanede ayrı parça olur.": "Splits the track into vocals and instruments; each becomes its own track.", "Vokal + enstrüman: 2 parça. Tüm enstrümanlar: davul, bas, gitar… ayrı ayrı.": "Vocals + instrumental: 2 tracks. All instruments: drums, bass, guitar… separately.", "Seçtiğin aralığı yeniden üretir; şarkının geri kalanı aynı kalır.": "Regenerates the range you pick; the rest of the song stays the same.", "Tutamaçlarla aralığı seç: en az 10 sn, en çok şarkının yarısı.": "Pick the range with the handles: at least 10 s, at most half the song.", "Yalnız seçili aralıkta söylenecek sözler. Zorunlu.": "Lyrics sung only in the selected range. Required.", "Yeni bölüm dahil şarkının güncel tüm sözleri. Zorunlu.": "The song's full updated lyrics, including the new part. Required.", "Bu şarkıdaki vokal karakterini kaydeder; yeni üretimlerde Ses karakteri olarak seçebilirsin.": "Saves this song's vocal character; pick it as a Voice character in new songs.", "Listede bu adla görünür. Zorunlu.": "Shown in the list with this name. Required.", "Kendi sesinden ses modeli oluşturur; şarkılarında senin sesin söyler.": "Creates a voice model from your voice so your songs are sung in it.", "Açıklama": "Description", "Parça": "Track", "Ses kaydı": "Recording", "Hak onayı": "Rights confirmation", "Vokal ya da müzik": "Vocal or music", "En az 10 sn bölüm": "A section of at least 10 s", "E-postanı doğrula": "Verify your email", "Hoş geldin hediyen e-postanı doğrulayınca yüklenir. Gelen kutundaki bağlantıya dokun, sonra buraya dön.": "Your welcome gift arrives once you verify your email. Tap the link in your inbox, then come back here.", "Bağlantıyı yeniden gönder": "Resend link", "Doğruladım": "I've verified", "Kontrol ediliyor…": "Checking…", "Doğrulandı, kredin yükleniyor.": "Verified, your credits are on the way.", "Henüz doğrulanmamış görünüyor. Bağlantıya dokunduktan sonra tekrar dene.": "It doesn't look verified yet. Tap the link, then try again.", "Bağlantıyı e-postana yeniden gönderdik. Spam klasörüne de bak.": "We sent the link to your email again. Check spam too.", "Şu an gönderilemedi, biraz sonra tekrar dene.": "Couldn't send right now, try again in a moment.", "Kredin e-postanı doğrulayınca yüklenecek. Gelen kutundaki bağlantıya dokun.": "Your credits arrive once you verify your email. Tap the link in your inbox.", "Bugünlük sınıra ulaştın, yarın tekrar dene.": "You've reached today's limit, try again tomorrow.", "Kaynak parça bulunamadı.": "Source track not found.", "Başlık — ör. Gece Yürüyüşü": "Title — e.g. Night Walk", "Parçanın adı; sesi değiştirmez, tarzı Stil belirler. Boş bırakırsan otomatik verilir.": "The track's name; it doesn't change the sound, Style does. Leave empty for an automatic name.", "Beat'ten vokalli cover için söz yaz": "Write lyrics for a vocal cover of a beat", "Kaydın süresi okunamadı, yeniden yükle": "Couldn't read the recording length, upload it again", "Devam noktası gerekli.": "A continue point is required.", "Sözler (isteğe bağlı)": "Lyrics (optional)", "Sözler (boş bırakırsan şarkının sözlerinden otomatik yazılır)": "Lyrics (leave empty to write them automatically from the song)", "Künye": "Credits", "Sırada": "Up next", "Fikir": "Idea", "Tür": "Type", "Söz": "Lyrics", "Oluşturuldu": "Created", "Stili kopyala": "Copy style", "Devam etmek için koşulları kabul et.": "Accept the terms to continue.", "Kullanım Koşulları ve Gizlilik Politikası'nı okudum, kabul ediyorum": "I've read and agree to the Terms of Use and Privacy Policy", "Koşullar": "Terms", "Yükleniyor…": "Loading…", "Tarayıcıda aç": "Open in browser", "Yasal metinler": "Legal documents", "Sayfa açılamadı. İnternet bağlantını kontrol et.": "Couldn't open the page. Check your internet connection.", "Kullanım Koşulları": "Terms of Use", "Gizlilik Politikası": "Privacy Policy", "Yasal": "Legal",
    "Hesabını aç": "Create your account",
    "Kredin bitti": "Out of credits",
    "Planın": "Your plan",
    "Daha çok üret": "Create more",
    "Kredi kullanmak ve şarkılarını her cihazda saklamak için hesap gerekli.": "You need an account to use credits and keep your songs on every device.",
    "Bu dönemin kredisi bitti. Daha büyük plana geçebilir ya da yenilenmeyi bekleyebilirsin.": "This period's credits are used up. Upgrade to a bigger plan or wait for the renewal.",
    "Aylık bir plan seç, üretmeye hemen devam et.": "Pick a monthly plan and keep creating right away.",
    "Her ay yenilenen kredi. İstediğin zaman iptal et.": "Credits that renew every month. Cancel anytime.",
    "Hoş geldin hediyesi": "Welcome gift",
    "Abone ol": "Subscribe",
    "Aboneliği yönet": "Manage subscription",
    "Plana geç": "Switch plan",
    "Mevcut plan": "Current plan",
    "En avantajlı": "Best value",
    "/ ay": "/ mo",
    "Cover, uzatma, vokal ve stem dahil": "Cover, extend, vocals and stems included",
    "İstediğin zaman iptal et": "Cancel anytime",
    "Satın alımları geri yükle": "Restore purchases",
    "Kullanım koşulları": "Terms of Use",
    "Gizlilik": "Privacy",
    "Ücretsiz": "Free",
    "Planlar": "Plans",
    "Planım": "My plan",
    "Hesap aç": "Sign up",
    "Planlar yükleniyor…": "Loading plans…",
    "Aylık planlar": "Monthly plans",
    "Abonelik bağlantıları": "Subscription links",
    "Kredi ve planlar": "Credits and plans",
    "Bu dönem kalan kredi": "Credits left this period",
    "Bugün yenilenir": "Renews today",
    "Yarın yenilenir": "Renews tomorrow",
    "Bugün sona erer": "Ends today",
    "Yarın sona erer": "Ends tomorrow",
    "Süresi dolmaz": "Never expires",
    "Bugün sıfırlanır": "Resets today",
    "Yarın sıfırlanır": "Resets tomorrow",
    "Abonelik iPhone ve Android uygulamasından alınır.": "Subscriptions are purchased in the iPhone and Android app.",
    "Aboneliğini satın aldığın mağazanın hesap ayarlarından yönetebilirsin.": "Manage your subscription in the account settings of the store you bought it from.",
    "Aboneliğin başladı. Kredilerin hesabına eklendi.": "Your subscription is active. Credits were added to your account.",
    "Satın alma tamamlanamadı.": "Purchase couldn't be completed.",
    "Geri yükleme iPhone ve Android uygulamasından yapılır.": "Restoring is done in the iPhone and Android app.",
    "Satın alımlar kontrol ediliyor…": "Checking purchases…",
    "Aboneliğin geri yüklendi.": "Your subscription was restored.",
    "Bu hesapta etkin abonelik bulunamadı.": "No active subscription found for this account.",
    "Geri yükleme tamamlanamadı.": "Restore couldn't be completed.",
    "Ödeme, onayınla Apple hesabından alınır. Abonelik, dönem bitmeden en az 24 saat önce iptal edilmezse aynı ücretle her ay otomatik yenilenir. App Store hesap ayarlarındaki Abonelikler bölümünden yönetebilir ya da iptal edebilirsin. Krediler her dönem başında yenilenir; kullanılmayan kredi sonraki aya devretmez.": "Payment is charged to your Apple Account at confirmation of purchase. The subscription renews automatically every month at the same price unless cancelled at least 24 hours before the end of the current period. Manage or cancel it under Subscriptions in your App Store account settings. Credits renew at the start of each period; unused credits do not roll over.",
    "Ödeme, onayınla Google Play hesabından alınır. Abonelik, iptal edilmedikçe aynı ücretle her ay otomatik yenilenir. Google Play'de Ödemeler ve abonelikler bölümünden yönetebilir ya da iptal edebilirsin. Krediler her dönem başında yenilenir; kullanılmayan kredi sonraki aya devretmez.": "Payment is charged to your Google Play account at confirmation of purchase. The subscription renews automatically every month at the same price until cancelled. Manage or cancel it under Payments & subscriptions in Google Play. Credits renew at the start of each period; unused credits do not roll over.",
    "Abonelik App Store ya da Google Play üzerinden alınır ve dönem bitmeden en az 24 saat önce iptal edilmezse her ay otomatik yenilenir. Krediler her dönem başında yenilenir; kullanılmayan kredi sonraki aya devretmez.": "Subscriptions are purchased through the App Store or Google Play and renew automatically every month unless cancelled at least 24 hours before the end of the period. Credits renew at the start of each period; unused credits do not roll over.",
    "Sesi aç": "Turn sound on",
    "Sesi kapat": "Mute",
    "Geri kaydır": "Rewind",
    "İleri kaydır": "Fast forward",
    "Üretim uzun sürüyor; uygulamayı yeniden açınca tekrar kontrol edilir": "Generation is taking long; it'll be checked again when you reopen the app",
    "Bağlantı kopyalandı": "Link copied",
    "Paylaşılamadı": "Couldn't share",
    "İndirildi": "Downloaded",
    "Müzik yüklenemedi": "Couldn't load the music",
    "Kaydetme bu sürümde kullanılamıyor": "Saving isn't available in this version",
    "Parçayı kaydet": "Save track",
    "Bu e-posta diğer yöntemle kayıtlı. O yöntemle devam et.": "This email is registered with the other method. Continue with that one.",
    "Bu cihazda giriş şu an yapılamıyor. Uygulamayı güncelle.": "Sign-in isn't available on this device right now. Update the app.",
    "Yapay zekâ yaz": "Write with AI",
    "Sözler şu an yazılamadı": "Couldn't write lyrics right now",
    "Sözler şu an yazılamadı. Kredin iade edildi, tekrar dene.": "Couldn't write lyrics right now. Your credit was refunded, try again.",
    "Sistem şu an yoğun": "The system is busy right now",
    "Yoğunluk nedeniyle isteğin tamamlanamadı. Kredin iade edildi; biraz sonra tekrar dene.": "We couldn't complete your request because of high demand. Your credit was refunded; try again in a moment.",
    "Sistemde şu an yoğunluk var. Biraz sonra tekrar dene.": "The system is busy right now. Try again in a moment.",
    "Tamam": "OK",
    "Sistemde şu anda yoğunluk bulunmaktadır. Lütfen daha sonra tekrar deneyiniz.": "The system is currently busy. Please try again later.",
    "Yoğunluk nedeniyle isteğiniz tamamlanamadı. Krediniz iade edilmiştir; lütfen daha sonra tekrar deneyiniz.": "Your request could not be completed due to high demand. Your credit has been refunded; please try again later.",
    "Hizmet şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyiniz.": "The service is currently unavailable. Please try again later.",
    "İstenen kayıt bulunamadı.": "The requested record was not found.",
    "Bu işlem daha önce gerçekleştirilmiş.": "This action has already been completed.",
    "İçerik, kullanım ve telif koşullarına uygun bulunmadı. Lütfen sözleri veya kaynak sesi değiştirerek tekrar deneyiniz.": "The content did not meet our usage and copyright terms. Please change the lyrics or source audio and try again.",
    "Girilen bilgiler işlenemedi. Lütfen kontrol ederek tekrar deneyiniz.": "The information provided could not be processed. Please check it and try again.",
    "Kaynak dosyaya erişilemedi. Lütfen dosyayı yeniden yükleyiniz.": "The source file could not be accessed. Please upload the file again.",
    "İşlem tamamlanamadı. Lütfen daha sonra tekrar deneyiniz.": "The action could not be completed. Please try again later.",
    "Koşullar güncellendi": "Terms updated",
    "Devam etmek için güncel Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmeniz gerekmektedir.": "To continue, you need to accept the current Terms of Use and Privacy Policy.",
    "Güncel Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmeniz gerekmektedir.": "You need to accept the current Terms of Use and Privacy Policy.",
    "Kabul ediyorum": "I accept",
    "Teşekkürler. Lütfen işlemi tekrar deneyiniz.": "Thank you. Please try the action again.",
    "Kaydedilemedi, lütfen tekrar deneyiniz.": "Couldn't save, please try again.",
    "Kredi yükle": "Add credits",
    "Özel miktar": "Custom amount",
    "Kredi miktarı": "Credit amount",
    "Tanıtım videosu": "Promo video",
    "Reels • Story • şarkılarını tanıt": "Reels • Story • promote your songs",
    "Tanıtım videosu · 9:16": "Promo video · 9:16",
    "Şarkı ekle": "Add song",
    "Müzik + kapak görseli ya da videosu": "Music + cover image or video",
    "Kaydediliyor": "Recording",
    "Kanca yazısı": "Hook text",
    "(kelimeler ritimle tek tek belirir)": "(words appear one by one on the beat)",
    "Çağrı yazısı": "Call to action",
    "(son şarkıda)": "(on the last song)",
    "Marka": "Brand",
    "(sonda ritimle atar)": "(pulses to the beat at the end)",
    "Önizle": "Preview",
    "Video indir": "Download video",
    "1080×1920 · Reels ve Story boyutu. Kayıt gerçek zamanlıdır; bitene kadar bu ekranı açık tut.": "1080×1920 · Reels and Story size. Recording is real-time; keep this screen open until it finishes.",
    "Kayıt gerçek zamanlıdır; bitene kadar bu ekranı açık tut.": "Recording is real-time; keep this screen open until it finishes.",
    "sn": "s",
    "Müzik dosyası": "Music file",
    "MP3, WAV, M4A": "MP3, WAV, M4A",
    "Kapak": "Cover",
    "Görsel ya da video": "Image or video",
    "Şarkı adı": "Song title",
    "Videoda çalacak bölüm": "Part to play in the video",
    "15 sn": "15 s",
    "20 sn": "20 s",
    "30 sn": "30 s",
    "45 sn": "45 s",
    "60 sn": "60 s",
    "Kutuyu sürükleyerek bölümü seç, kenarlarından uzat. Açılışta en güçlü bölüm (nakarat) seçili gelir.": "Drag the box to pick the part, stretch it from the edges. The strongest part (chorus) is selected by default.",
    "Kaldır": "Remove",
    "Vazgeç": "Cancel",
    "Kaydet": "Save",
    "Şarkıyı düzenle": "Edit song",
    "Video önizlemesi": "Video preview",
    "Şarkı sırası": "Song order",
    "Bölümü dinle": "Listen to the part",
    "Bölüm uzunluğu": "Part length",
    "Yukarı taşı": "Move up",
    "Aşağı taşı": "Move down",
    "Çözümleniyor…": "Analyzing…",
    "Bu dosya okunamadı": "Couldn't read this file",
    "Bu dosya açılamadı": "Couldn't open this file",
    "Bu tarayıcı video kaydını desteklemiyor. Chrome ya da Safari'nin güncel sürümünü kullan.": "This browser doesn't support video recording. Use the latest Chrome or Safari.",
    "Bu tarayıcı video kaydını desteklemiyor.": "This browser doesn't support video recording.",
    "Kayıt sürüyor… Bitene kadar bu ekranı önde ve açık tut.": "Recording… Keep this screen in front and open until it finishes.",
    "Ekran arka plana geçti: kayıt takılabilir. Kayıt bitene kadar ekranı önde tut.": "The screen went to the background: the recording may stutter. Keep the screen in front until it finishes.",
    "Video WebM olarak kaydedildi (bu tarayıcı MP4 kaydetmiyor). Instagram için Chrome'un güncel sürümünü kullan.": "Video saved as WebM (this browser can't record MP4). Use the latest Chrome for Instagram.",
    "Video hazır": "Video ready",
    "Video indirildi": "Video downloaded",
    "Video kaydedilemedi. Tekrar dene.": "Couldn't save the video. Try again.",
    "Videoyu kaydet": "Save video",
    "Adsız": "Untitled",
    "Var olan müziklerden ilham alarak kendi müziğini yarat.": "Get inspired by the music you love and create your own.",
    "Profili ziyaret et": "Visit the profile",
    "Marka altı": "Under the brand",
    "Uygulamayı ücretsiz indir": "Download the app free",
    "Hesabımı sil": "Delete my account",
    "Hesabın kalıcı olarak silinsin mi?": "Permanently delete your account?",
    "Şarkıların, yüklediğin sesler ve kalan kredin silinir; bu işlem geri alınamaz. Mağaza aboneliğin varsa App Store / Google Play ayarlarından ayrıca iptal etmelisin.": "Your songs, uploaded audio and remaining credits will be deleted; this can't be undone. If you have a store subscription, cancel it separately in your App Store / Google Play settings.",
    "Hesabın silindi": "Your account was deleted",
    "Hesap silinemedi. Biraz sonra tekrar dene.": "Couldn't delete the account. Try again a little later.",
    "Bu cihazda abonelik yakında açılacak.": "Subscriptions are coming soon on this device.",
    "Abonelik iPhone uygulamasından alınır.": "Subscriptions are purchased in the iPhone app.",
    "Abonelik doğrulanamadı. Tekrar dene.": "Couldn't verify the subscription. Try again.",
    "Bu abonelik başka bir CookFire hesabına bağlı.": "This subscription is linked to another CookFire account.",
  };
  const MONTHS = { Ocak: "January", Şubat: "February", Mart: "March", Nisan: "April", Mayıs: "May", Haziran: "June", Temmuz: "July",
    Ağustos: "August", Eylül: "September", Ekim: "October", Kasım: "November", Aralık: "December" };
  const RX = [
    [/^(d+) kredi harcandı$/, "$1 credit used"],
    [/^Gerekli: (.+)$/, (m, x) => "Required: " + x.split(" · ").map(one).join(" · ")],
    [/^E-postanı doğrula, (\d+) kredi hediyen yüklensin$/, "Verify your email to get your $1 free credits"],
    [/^(\d+) satır$/, (m, n) => n + (n === "1" ? " line" : " lines")], [/^(\d+) kelime$/, (m, n) => n + (n === "1" ? " word" : " words")],
    [/^(\d+) gün sonra sona erer$/, "Ends in $1 days"], [/^(\d+) gün sonra yenilenir$/, "Renews in $1 days"], [/^(\d+) gün sonra sıfırlanır$/, "Resets in $1 days"], [/^(\d+) kredi \/ ay$/, "$1 credits / mo"], [/^%(\d+) tasarruf$/, "Save $1%"], [/^Her ay (\d+) kredi$/, "$1 credits every month"], [/^≈ (\d+) şarkı$/, "≈ $1 songs"], [/^(\d+) gün geçerli$/, "valid for $1 days"], [/^Hesap açana (\d+) kredi hediye$/, "$1 free credits when you sign up"], [/^(.+) \/ ay$/, "$1 / mo"],
    [/^(\d+) şarkı$/, (m, n) => n + (n === "1" ? " song" : " songs")], [/^(\d+) parça$/, (m, n) => n + (n === "1" ? " track" : " tracks")], [/^(\d+) kredi$/, "$1 credits"],
    [/^(\d{1,2}) (Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık) (\d{4})$/, (m, d, mo, y) => `${MONTHS[mo]} ${d}, ${y}`],
    [/^Kayıt en az (\d+) saniye olmalı$/, "Recording must be at least $1 seconds"],
    [/^Bölüm (\d+)$/, "Take $1"],
    [/^Bu hesap (Google|Apple|başka bir yöntem) ile açılmış; şifresi yok\.$/, (m, v) => `This account uses ${v === "başka bir yöntem" ? "another method" : v}; it has no password.`],
    [/^Bağlantıyı (.+) adresine gönderdik\. Bağlantıyla yeni şifreni belirle, sonra buradan giriş yap\. Gelmezse spam klasörüne bak\.$/, "We sent the link to $1. Set your new password with it, then sign in here. Check spam if it doesn't arrive."], [/^(\d+) bölüm$/, "$1 takes"], [/^Ses en az (\d+) saniye olmalı$/, "Audio must be at least $1 seconds"],
    [/^Ses en fazla (\d+) dakika olabilir$/, "Audio can be at most $1 minutes"], [/^Dosya en fazla (\d+) MB olabilir$/, "File can be at most $1 MB"],
    [/^Bağlantıyı (.+) adresine gönderdik\. Gelen kutunu ve spam klasörünü kontrol et\.$/, "We sent the link to $1. Check your inbox and spam folder."],
    [/^(.+) ile giriş$/, "Signed in with $1"],
    [/^([\d.]+) sn$/, "$1 s"], [/^en az (\d+) sn$/, "min $1 s"], [/^en çok (.+)$/, "max $1"], [/^(Yeni stil|Stil) — şu an: (.+)$/, (m, k, v) => (k === "Stil" ? "Style" : "New style") + " — now: " + v]
  ];
  // kullanıcı içeriği: çevrilmez
  const SKIP = "#fpLyr,.song:not(.pin) .t,.gc-t,#fpTitle,#miniTitle,#lfTitle,#fpStyle,.np-q-t b,.menu-head b,script,style,textarea,[data-noi18n]";
  const ATTRS = ["placeholder", "aria-label", "title"];

  // Ek diller (DE / PT / JA): public/i18n-langs.js; metin bulunamazsa İngilizceye düşer
  const LANGS = ["tr", "en", "de", "pt", "ja"];
  const PK = {};
  for (const [l, p] of Object.entries(window.I18N_PACKS || {})) {
    PK[l] = { d: p.d, months: p.months, date: p.date, rx: p.rx.map(([src, to]) => [new RegExp(src), to]) };
  }
  function packOne(pk, p) {
    if (Object.prototype.hasOwnProperty.call(pk.d, p)) return pk.d[p];
    const dm = /^(\d{1,2}) (Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık) (\d{4})$/.exec(p);
    if (dm) return pk.date.replace("{d}", dm[1]).replace("{m}", pk.months[Object.keys(MONTHS).indexOf(dm[2])]).replace("{y}", dm[3]);
    for (const [re, to] of pk.rx) {
      const m = re.exec(p);
      if (!m) continue;
      if (to.startsWith("@req:")) return to.slice(5) + m[1].split(" · ").map(one).join(" · ");
      if (to.startsWith("@p:")) { const [a, b] = to.slice(3).split("|"); return p.replace(re, m[1] === "1" ? a : b); }
      return p.replace(re, to);
    }
    return null;
  }
  function one(p) {
    const pk = PK[LANG];
    if (pk) { const r = packOne(pk, p); if (r != null) return r; }
    if (Object.prototype.hasOwnProperty.call(D, p)) return D[p];
    for (const [re, to] of RX) if (re.test(p)) return p.replace(re, to);
    return p;
  }
  function one2(l, p) { return Object.prototype.hasOwnProperty.call(D, p) || RX.some(([re]) => re.test(p)); }
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
    if (!m || (n.nodeValue !== m.tr && !Object.values(m.x).includes(n.nodeValue))) { m = { tr: n.nodeValue, x: {} }; textMem.set(n, m); }
    const want = LANG === "tr" ? m.tr : (m.x[LANG] ??= tr(m.tr));
    if (n.nodeValue !== want) n.nodeValue = want;
  }
  function doAttrs(el) {
    // textarea içeriği (kullanıcı metni) çevrilmez ama placeholder / aria-label / title çevrilir
    if (el.tagName === "TEXTAREA" ? skip(el.parentElement) || el.hasAttribute("data-noi18n") : skip(el)) return;
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (v == null) continue;
      let all = attrMem.get(el);
      if (!all) { all = {}; attrMem.set(el, all); }
      let m = all[a];
      if (!m || (v !== m.tr && !Object.values(m.x).includes(v))) { m = all[a] = { tr: v, x: {} }; }
      const want = LANG === "tr" ? m.tr : (m.x[LANG] ??= tr(m.tr));
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
    LANG = LANGS.includes(l) ? l : "tr";
    try { localStorage.setItem("sf_lang", LANG); } catch (e) {}
    document.documentElement.lang = LANG;
    document.documentElement.dataset.lang = LANG;
    walk(document.body);
    document.querySelectorAll("#langSeg button").forEach((b) => b.classList.toggle("on", b.dataset.v === LANG));
    if (!quiet) window.dispatchEvent(new CustomEvent("sf-lang", { detail: LANG }));
  }

  // confirm / alert metinleri
  const oc = window.confirm.bind(window), oa = window.alert.bind(window);
  window.confirm = (m) => oc(LANG !== "tr" ? tr(String(m)) : m);
  window.alert = (m) => oa(LANG !== "tr" ? tr(String(m)) : m);

  let saved = null;
  try { saved = localStorage.getItem("sf_lang"); } catch (e) {}
  // İlk açılış: cihaz diline göre (tr / de / pt / ja), desteklenmiyorsa İngilizce
  const dev = (navigator.language || "").toLowerCase().slice(0, 2);
  const start = LANGS.includes(saved) ? saved : LANGS.includes(dev) ? dev : "en";
  const LOC = { tr: "tr-TR", en: "en-US", de: "de-DE", pt: "pt-BR", ja: "ja-JP" };
  window.I18N = { set, get: () => LANG, langs: LANGS, loc: () => LOC[LANG],
    // geliştirme: metin bu dilde çevrili mi? (eksik çeviri taraması)
    has: (l, p) => { const pk = PK[l]; return l === "tr" || l === "en" ? one2(l, p) : !!(pk && packOne(pk, p) != null); }, t: (s) => (LANG !== "tr" ? tr(s) : s) };

  function boot() {
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    set(start, true);
    const seg = document.getElementById("langSeg");
    if (seg) seg.addEventListener("click", (e) => { const b = e.target.closest("button[data-v]"); if (b) set(b.dataset.v); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
