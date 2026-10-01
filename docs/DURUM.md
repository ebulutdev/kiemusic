# SoundForge — Proje Durumu

**Tarih:** 1 Ekim 2026
**Demo:** https://claude.ai/artifact/EGCu15oAZ7twJq7SpeupCc
**Paket:** `kie-suno-music.zip`

| Alan | Durum |
|---|---|
| Mobil arayüz | Tamamlandı (iPhone, Android, masaüstü) |
| KIE / Suno entegrasyonu | Backend'de hazır, anahtar `.env` içinde tanımlı |
| Canlı üretim | Kendi sunucunda (localhost / Vercel) çalışır |
| claude.ai bağlantısı | Yalnızca demo (güvenlik gereği KIE'ye bağlanamaz) |
| Ses kaydı | Telefonun kaydedicisi + uygulama içi kayıt |
| Performans | Keşfet ~50–60 fps (4× yavaşlatılmış işlemcide) |

---

## 1. Mimari

```
iPhone / Android / Masaüstü
        │  (PWA — Ana Ekrana Ekle)
        ▼
public/soundforge.html  ← tek dosya arayüz
        │  fetch /api/*
        ▼
Next.js 15 backend  ── KIE_API_KEY (.env, yalnızca sunucuda)
        │
        ├─► api.kie.ai  /api/v1/jobs/createTask
        ├─► api.kie.ai  /api/v1/jobs/recordInfo      (durum sorgusu)
        └─► api.kie.ai  /api/v1/generate/record-info (yedek sorgu)
        ▲
        └── KIE webhook → /api/callback (HMAC doğrulamalı)

Prisma + SQLite (MusicTask, Persona, Voice)
uploads/ klasörü (telefon kayıtları → KIE'ye public URL)
```

**Demo / canlı ayrımı:** Arayüz açılışta `/api/health` adresini yoklar. Yanıt `service: "kie-suno-music"` ise **canlı moda** geçer ve Profil'de "● KIE bağlı" görünür. Aksi halde tarayıcı içi ses sentezi ile **demo modda** çalışır.

---

## 2. Ekranlar

### Ana sayfa — Tam ekran Keşfet
- Ekranın tamamını kaplayan 7×8 petek düzeninde 56 tür karosu (30 tür).
- Merkezdeki karo büyür ve beyaz çerçeve alır; kapak deseni yavaşça süzülür.
- Uzaklaştıkça karolar küçülür, saydamlaşır, bulanıklaşır ve merkeze çekilir.
- Özel yay fiziği:
  - Fırlatınca hıza göre süzülür, en yakın türe yumuşakça oturur.
  - Kenarlarda lastik gibi esneyip geri döner.
- Dokunuş:
  - Kenardaki karoya dokununca merkeze gelir.
  - Merkezdekine dokununca o türle Oluştur ekranı açılır.
- Altta tek yazı: odaktaki tür adı ve üretime geçen ok butonu.
- Destekler: dokunmatik, fare sürükleme, trackpad, klavye okları ve Enter.

### Oluştur (ortadaki + butonu)
Telefonda tam ekran açılır, masaüstünde ortada kart olarak görünür. Sağ üstte kredi bakiyesi durur.

| Sekme | İçerik |
|---|---|
| **Basit** | "Ne yaratalım?" başlığı, Vokal / Enstrümantal / Beat seçimi, renkli halkalı komut kutusu (+ · Özel · mikrofon · gönder) ve öneriler |
| **Özel** | Sözler (rastgele söz), stil ve stil etiketleri, başlık, kadın/erkek vokal. **Gelişmiş** bölümü: stil bağlılığı, deneysellik, ses ağırlığı, süre, çeşitlilik, kaçınılacaklar, model (V6 / Mini / Wild) |
| **Sesten** | Telefonla kaydet, uygulama içi kayıt, dosya yükle. İşlemler: Cover / Uzat / Vokal ekle / Vokali ayır |

### Kütüphane
- Kategori kartları: Beğenilenler, Beat'ler, Stemler, Vokaller.
- Arama ve filtre paneli (tür ve sıralama).
- Satırlarda kapak, süre rozeti, model etiketi (V6), stil ve "…" menüsü.
- "…" menüsü: Oynat, Beğen, Uzat, Cover, Vokal ekle, Stem ayır, Bölüm değiştir, Persona, Paylaş, İndir, Sil.

### Stüdyo
- Araçlar: Uzat · Cover · Vokal ekle · Stem ayır · Bölüm değiştir · Persona · Ses klonu · Kayıttan.
- Kayıtlı personalar ve sesler listelenir.

### Profil
- Kredi kartı ve doluluk çubuğu.
- Ayarlar: tema (Sistem / Açık / Koyu), varsayılan model, her şeyi sıfırla.

### Oynatıcı
- **Mini:** Menünün üstünde yüzen cam kart; ilerleme çizgisi, oynat/duraklat.
- **Tam ekran:**
  - Yan kapakların kenardan göründüğü kapak alanı.
  - Beğen / beğenme; Cover, Uzat, Stem, Paylaş butonları.
  - Kalın ilerleme çubuğu, karıştır, önceki, oynat, sonraki, tekrarla.
  - "Bu şarkı hakkında", Stil (kopyala, bu stille üret), şarkıyla senkron vurgulanan **Sözler**.
  - Tutamaçtan aşağı çekince kapanır.
- Kilit ekranı kontrolleri için Media Session API kullanılıyor.

### Alt menü
- Yüzen, buzlu cam kapsül; yalnızca ikonlar.
- Aktif sekmenin arkasındaki daire yaylanarak kayar.
- Ortada dönen renkli halkalı + butonu.

---

## 3. KIE entegrasyonu

| Özellik | Uygulama ucu | KIE modeli |
|---|---|---|
| Basit üretim | `POST /api/music/generate` (`customMode:false`) | `ai-music-api/generate` |
| Özel üretim | `POST /api/music/generate` (`customMode:true`) | `ai-music-api/generate` |
| Kayıttan cover | `POST /api/music/audio` `cover` | `ai-music-api/upload-and-cover-audio` |
| Kayıttan uzatma | `POST /api/music/audio` `upload-extend` | `ai-music-api/upload-and-extend-audio` |
| Parça uzatma | `POST /api/music/audio` `extend` | `ai-music-api/extend` |
| Vokal ekle | `POST /api/music/audio` `add-vocals` | `ai-music-api/add-vocals` |
| Stem ayır | `POST /api/music/audio` `remove-vocals` | `ai-music-api/separate-vocals` |
| Bölüm değiştir | `POST /api/music/audio` `replace-section` | `ai-music-api/replace-section` |
| Persona | `POST /api/persona` | `ai-music-api/generate-persona` |
| Ses klonu | `POST /api/voice` (backend hazır) | `ai-music-api/create-voice` |

**Beat modu:** `instrumental: true` gönderilir; stile "drum-focused beat, minimal melody" eklenir.

**Doğrulama kuralları (Zod + istek oluşturucu):**
- Enstrümantal üretimde `lyrics`, `vocal_gender` ve `audio_weight` gönderilmez.
- Basit modda süre ve kaydırıcı değerleri gönderilmez.
- Sınırlar: stil ≤ 1000, söz ≤ 5000, başlık ≤ 80 karakter.
- Değiştirilecek bölüm en az 10 sn olmalı ve parçanın yarısını geçmemeli.

### Görev yaşam döngüsü

```
QUEUED → TEXT_READY → FIRST_READY → COMPLETED
                                   ↘ FAILED
```

1. Arayüz önce iki yer tutucu satır oluşturur, ardından backend'e isteği gönderir.
2. Backend KIE'ye `createTask` gönderir, görev numarasını alır ve veritabanına yazar.
3. Arayüz 4 saniyede bir `/api/music/tasks/:id` adresini sorar. Webhook gelmezse (ör. localhost) backend KIE'ye kendisi sorar.
4. Ses adresi gelince satır "Hazır" olur ve gerçek ses çalar (kapak, başlık ve süre KIE'den gelir).
5. Hata ya da 15 dakikalık zaman aşımında satır kaldırılır ve kredi iade edilir.
6. Sayfa yenilenirse süren görevlerin takibi kaldığı yerden devam eder.

KIE'nin farklı yanıt biçimleri (`audio_url` / `audioUrl`, `sunoData`, `resultUrls`) tek biçime çevriliyor.

---

## 4. Backend uçları

| Uç | Yöntem | Görev |
|---|---|---|
| `/api/health` | GET | Canlı mod tespiti |
| `/api/music/generate` | POST | Müzik üretimi |
| `/api/music/audio` | POST | Ses tabanlı işlemler |
| `/api/music/tasks` | GET | Görev listesi |
| `/api/music/tasks/:id` | GET | Durum + KIE yedek sorgusu |
| `/api/callback` | POST | KIE webhook (HMAC-SHA256, 5 dk tekrar koruması, idempotent) |
| `/api/upload` | POST | Ses yükleme (≤ 500 MB) → public URL |
| `/api/files/:name` | GET | Yüklenen sesi servis eder |
| `/api/persona` | GET/POST | Persona |
| `/api/voice` | GET/POST | Ses klonu |

---

## 5. Proje yapısı

```
kie-suno-music/
├── .env                      KIE_API_KEY, APP_URL, DATABASE_URL
├── next.config.ts            "/" → /soundforge.html
├── public/
│   ├── soundforge.html       arayüzün tamamı (~105 KB, tek dosya)
│   └── manifest.json         PWA
├── app/api/…                 yukarıdaki uçlar
├── lib/
│   ├── kie.ts                KIE istemcisi (9 model)
│   ├── kieInputBuilder.ts    KIE istek gövdeleri
│   ├── validation.ts         Zod şemaları
│   ├── webhook.ts            HMAC doğrulama
│   └── db.ts                 Prisma
├── prisma/schema.prisma      MusicTask · Persona · Voice
└── agents/                   ajan talimat dosyaları
```

---

## 6. Kurulum

```bash
npm install
npm run db:push
npm run dev                 # http://localhost:3000
ngrok http 3000             # https adresini .env → APP_URL'e yaz, yeniden başlat
```

- **iPhone:** Adresi Safari'de aç → Paylaş → Ana Ekrana Ekle.
- **Vercel:** `.env` GitHub'a gitmez. `KIE_API_KEY`, `APP_URL` ve `DATABASE_URL` (Postgres) değişkenlerini Vercel'e ayrıca ekle.

---

## 7. Tasarım sistemi

- **Yazı tipleri:**
  - Bricolage Grotesque (başlıklar)
  - Geist (metin)
  - Geist Mono (süre, kredi, etiket)
- **Renkler:**
  - Koyu tema: zemin `#0C0B10`, vurgu `#FF4F79`, ikincil renkler `#FF9A4D` ve `#B38CFF`.
  - Açık tema ve sistem temasına uyum destekleniyor.
- **Yüzeyler:**
  - Az kutu, kenarlıksız alanlar.
  - Buzlu cam yalnızca menü ve mini oynatıcıda.
- **Hareket:**
  - Yay eğrileri, sayfa geçişlerinde aşağıdan beliriş.
  - Keşfet açılışında karolar merkezden dışa doğru beliriyor.
  - "Hareketi azalt" ayarı açıksa animasyonlar kapanıyor.
- **Mobil uyum:**
  - Çentik ve alt çubuk boşlukları korunuyor.
  - Alanlarda 16 px yazı var; odaklanınca ekran yakınlaşmıyor.
  - 48 px dokunma alanları.
  - 900 px üstünde yan menü açılıyor.

---

## 8. Performans (Keşfet)

Ölçüm: iPhone boyutu, 3× piksel yoğunluğu, işlemci 4× yavaşlatılmış.

| Sürüm | Ortalama kare | Takılan kare |
|---|---|---|
| Önceki | 63 ms (~16 fps) | %98 |
| Güncel | 18–20 ms (~50–60 fps) | ~%5 |

Uygulanan iyileştirmeler:
- Canlı CSS bulanıklığı yerine önceden bulanıklaştırılmış resim katmanları kullanılıyor.
- Her karede yalnızca konum ve saydamlık güncelleniyor; değer değişmiyorsa hiç yazılmıyor.
- Hareket bitince animasyon döngüsü tamamen duruyor.
- Dönen halkalar yeniden çizilmek yerine yalnızca döndürülüyor.

---

## 9. Bilinen eksikler

1. **Ses klonu:** Arayüzde yalnızca kayıt alıyor. KIE doğrulama cümlesi akışına bağlanmadı (backend ucu hazır).
2. **Stem ayırma yanıtı:** KIE'nin dönüş biçimi gerçek bir çağrıyla doğrulanmadı. Olası biçimler okunuyor.
3. **Kayıttan "Vokali ayır":** Canlı modda yalnızca üretilmiş parçalarda çalışıyor.
4. **Kalıcı depolama:**
   - KIE dosyaları yaklaşık 14 gün sonra siliniyor.
   - `uploads/` sunucusuz ortamda (Vercel) kalıcı değil.
   - Çözüm: S3, R2 ya da Supabase Storage.
5. **Veritabanı:** SQLite yalnızca yerelde uygun; Vercel için PostgreSQL gerekli.
6. **Kredi:** Arayüzdeki 500 kredi yerel bir sayaç. KIE hesap bakiyesi ve kullanıcı ödemesi (Stripe) bağlı değil.
7. **Kullanıcı hesabı:** Giriş sistemi yok; kütüphane cihazda (localStorage) tutuluyor.
8. **PWA ikonları:** `manifest.json` içindeki `icon-192.png` ve `icon-512.png` dosyaları eklenmedi.
9. **`agents/` dosyaları:** Eski arayüzü anlatıyor, güncellenmeli.
10. **Gerçek çağrı testi:** Canlı KIE akışı sahte bir backend ile doğrulandı. Gerçek anahtarla uçtan uca test kullanıcı tarafında yapılmalı.

---

## 10. Güvenlik

- KIE anahtarı yalnızca sunucuda (`.env`) duruyor. Arayüzde ve tarayıcıda hiç görünmüyor.
- `.env`, `uploads/` ve `*.db` dosyaları `.gitignore` içinde.
- Anahtar sohbet geçmişinde açıkça yazıldı. Proje herkese açılacaksa KIE panelinden yeni anahtar alınması önerilir.
- Webhook için HMAC anahtarı (`KIE_WEBHOOK_HMAC_KEY`) tanımlanırsa imzasız istekler reddediliyor.
