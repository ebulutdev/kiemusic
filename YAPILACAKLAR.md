# CookFire · Yapılacaklar listesi

Son güncelleme: 17 Ekim 2026. Bitenleri `[x]` yap. "Sıradaki" bölümünü tek tek birlikte yapacağız.

---

## A. Senin yapacakların (benim yapamadıklarım)

- [ ] **1. Apple girişini Firebase'de aç (zorunlu).** Firebase'de Apple sağlayıcısı yapılandırılmamış; Apple düğmesi şu an web'de de çalışmıyor.
  - Apple Developer hesabında bir **Services ID** ve bir **Sign in with Apple anahtarı (.p8)** oluştur.
  - Firebase Console › Authentication › Sign-in method › **Apple**: etkinleştir; Services ID, Team ID, Key ID ve anahtarı gir.
- [ ] **2. Xcode'da imzalama ekibini seç.** `npm run mobile:ios` ile aç, Signing bölümünden ekibini seç. Bu adım "Sign in with Apple" yetkisini Apple tarafına da kaydeder. iOS'u Windows'ta derleyemediğim için sen derleyip denemelisin.
- [ ] **3. Android yayınından önce:** yayın anahtarının ve Google Play imza anahtarının SHA-1 parmak izlerini Firebase'deki Android uygulamasına ekle, sonra `google-services.json` dosyasını yeniden indir. Yoksa Play'den inen uygulamada Google girişi çalışmaz.
- [ ] **4. Firebase Console › Authentication › Sign-in method › Email/Password** yöntemini kapat (sunucu bu hesaplara zaten kredi vermiyor; kapatınca hiç açılamazlar).
- [ ] **5. Mağaza abonelik ürünlerini aç:** App Store Connect ve Google Play'de aynı abonelik grubunda dört aylık ürün: `starter_monthly` (₺99 · 150 kredi), `plus_monthly` (₺249 · 420), `pro_monthly` (₺499 · 860), `max_monthly` (₺799 · 1425).
- [ ] **6. Gizlilik politikası adresini mağazalara gir:** `https://kiemusic--rapper-fcc44.us-east4.hosted.app/privacy` (App Store Connect + Play Console). Play'de "Data safety", App Store'da "App Privacy" formlarını doldur.
- [ ] **7. İletişim e-postasını yaz:** `public/config/app.json` › `legal.contact` (boşsa sayfalarda "yakında yayınlanacak" yazıyor) → ardından `npm run db:seed`.
- [ ] **8. Veri sorumlusunun kimliğini belirle:** KVKK, kişi ya da şirket adı ister; yalnızca "CookFire" yetmeyebilir. Yasal metinleri yayından önce bir avukata göster.
- [ ] **9. Canlı yayın gizlileri (App Hosting):** `kie-api-key` değerinin dolu olduğunu doğrula; `kie-webhook-hmac-key` oluştur ve backend `kiemusic` için erişim ver. Eksikse sonuç bildirimleri reddedilir.
- [ ] **11. Eski Firebase uygulamalarını sil:** Paket kimliği `com.emircanbulut.cookfire` oldu; yeni uygulamalar CookFire iOS / CookFire Android. Firebase Console › Proje ayarları › Your apps › **CookRapper iOS** ve **CookRapper Android** → Remove this app (geri alınamaz).
- [ ] **10. KIE anahtarını yenile:** anahtar sohbette paylaşıldı; panelden yeni anahtar üret, gizliyi güncelle.

---

## B. Açıkta kalan sorunlar / sorular (cevap ya da karar bekliyor)

- [ ] **B1. Commit ve push bekliyor.** Bugünkü tüm işler (mashup, Uzat/Cover/stem düzeltmeleri, fiyatlar, kredi açıkları, ipuçları, zorunlu alanlar, Apple/Google girişi) commit edilmedi. `main`'e itiş canlıya yayın başlatır. → *Commit edip main'e iteyim mi?* (Proje kuralı: yalnız `main`, yeni dal yok.)
- [ ] **B2. `google-services.json` ve `GoogleService-Info.plist` commit edilsin mi?** İstemci yapılandırması, gizli sayılmaz; ama depoda dursun mu karar ver.
- [ ] **B3. Stem fiyatları tahmine dayanıyor** (10 / 50 kredi). Gerçek tüketim ilk stem ayırmadan sonra admin › Ayarlar'da görünür. → *Bir stem ayırmayı (10 kredi) gerçekten çalıştırayım mı?*
- [ ] **B4. Mashup'ta söz boşken servisin sözleri sesten yazması** doküman çıkarımı, gerçek üretimle doğrulanmadı (12 kredi). → *Bir deneme mashup çalıştırayım mı?*
- [ ] **B5. Sesten Uzat (`continue_at`) gerçek üretimle denenmedi** (12 kredi).
- [ ] **B6. Ses yükleme kotası yok:** bir hesap sınırsız dosya yükleyip depolama maliyeti yaratabilir. → *Günlük yükleme sınırı koyayım mı?*

---

## C. Sıradaki (tek tek yapacağımız, benim yapabileceklerim)

1. [ ] **Commit + push** (B1).
2. [ ] **Uygulama içi hesap silme:** profile "Hesabımı sil" düğmesi + sunucu ucu (Apple zorunlu tutuyor). Şu an metinde "e-postayla talep et" yazıyor.
3. [ ] **Mağaza içi abonelik (IAP):** `window.CR.purchase / restore / products` köprüsü (StoreKit + Play Billing eklentisi) ve sunucuda makbuz doğrulayıp krediyi yenileyen uç (`startPlan` hazır). A5 tamamlanınca yapılır.
4. [ ] **Ses yükleme günlük kotası** (B6).
5. [ ] **Gizlilik metninde verilen sözlerin işletilmesi:** misafir verisinin periyodik silinmesi ve silme taleplerinin 30 günde sonuçlanması için otomatik temizlik işi (şu an elle).
6. [ ] **Gerçek üretim denemeleri:** stem (B3), mashup (B4), Sesten Uzat (B5).
7. [ ] **Sesten Cover'a kullanıcı süresi** zaten eklendi; **Sesten Uzat** için kullanıcının devam noktası seçebilmesi (şu an kaydın sonundan devam ediyor).
8. [ ] **Keşfet kutuları:** admin panelinden müzik yüklenmemiş; "rave hard" kutusunun etiketi "#rave hard" olarak ayarlanabilir.

---

## D. Uygulamada kalan diğer eksikler (sırayla)

1. [ ] iOS ve Android'de gerçek cihaz testi: Apple/Google girişi, misafirden hesaba geçiş, çıkış.
2. [ ] Android yayın imzası (keystore) ve Play Console kaydı; iOS TestFlight derlemesi.
3. [ ] Abonelik yenileme / iptal bildirimleri (App Store Server Notifications, Play RTDN) → kredi yenileme.
4. [ ] Dönem sonu sıfırlanmadan önce kullanıcıya hatırlatma bildirimi (isteğe bağlı).
5. [ ] Admin panelinde kullanıcı arama / kredi ekleme-düşme aracı (destek için).
6. [ ] Çökme ve hata izleme (şu an yok; analitik de bilerek yok).
7. [ ] Uygulama simgesi / açılış ekranı / mağaza görselleri ve metinleri (`npm run mobile:assets` kaynakları hazır, mağaza varlıkları değil). Mağaza metninde KIE/Suno adı geçmemeli.
8. [ ] Yaş derecelendirmesi ve içerik bildirimi akışının mağaza formlarında beyanı (uygulama içi "Bildir" var; `reports` koleksiyonunu inceleyecek kişi/süreç belirlenmeli).
9. [ ] Hız sınırı: `/api/upload` ve `/api/media` için IP/hesap başına istek sınırı.
10. [ ] Otomatik testler (kredi düşme/iade, dönem sıfırlama, sahiplik kontrolleri için; şu an elle betiklerle sınanıyor).
