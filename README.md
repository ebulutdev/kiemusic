# SoundForge — KIE + Suno AI Music Studio

Next.js 15 · TypeScript · Prisma · KIE API · PWA · iOS & Android uyumlu

---

## Özellikler

| Özellik | Detay |
|---|---|
| Vokalli üretim | Prompt + Lyrics + Style + Gender |
| Instrumental üretim | Tam kontrol |
| Audio Cover | Kayıt/dosyadan cover |
| Extend | Müziği devam ettir |
| Add Vocals | Mevcut müziğe vokal ekle |
| Vocal Separation | Stem ayırma (vocal/bass/drums/guitar...) |
| Replace Section | Bölüm yeniden üret |
| Persona | Tekrar kullanılabilir vokal persona |
| Custom Voice | Kendi sesini tanıt |
| Advanced Controls | style_weight, weirdness, audio_weight, variety |
| PWA | iOS Safari + Android Chrome install |
| Webhook | HMAC-SHA256 doğrulamalı |
| Polling | 3sn fallback (webhook gelmezse) |

---

## Kurulum

```bash
# 1. Klonla
git clone https://github.com/sizin-repo/kie-suno-music
cd kie-suno-music

# 2. Bağımlılıklar
npm install

# 3. Ortam değişkenleri
cp .env.example .env
# .env dosyasını düzenle

# 4. Veritabanı
npm run db:push
npm run db:generate

# 5. Çalıştır
npm run dev
```

Aç: http://localhost:3000

---

## Environment Variables

```env
KIE_API_KEY=kie_xxxxxxxxxxxxxxxx
KIE_WEBHOOK_HMAC_KEY=xxxxxxxxxxxxxxxx
APP_URL=https://your-domain.com
DATABASE_URL="file:./dev.db"
```

**Önemli:** `KIE_API_KEY` asla `NEXT_PUBLIC_` ile başlamamalı.

---

## Proje Yapısı

```
kie-suno-music/
├── app/
│   ├── api/
│   │   ├── callback/          ← KIE webhook (HMAC doğrulamalı)
│   │   ├── music/
│   │   │   ├── generate/      ← Müzik üretimi
│   │   │   ├── audio/         ← Cover/Extend/AddVocals/RemoveVocals/ReplaceSection
│   │   │   └── tasks/[id]/    ← Task durumu + KIE fallback
│   │   ├── persona/           ← Persona CRUD
│   │   ├── voice/             ← Custom Voice CRUD
│   │   └── health/
│   ├── page.tsx               ← Mobil SaaS UI
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── db.ts                  ← Prisma singleton
│   ├── kie.ts                 ← KIE API client (tüm endpointler)
│   ├── kieInputBuilder.ts     ← KIE input nesne oluşturucu
│   ├── validation.ts          ← Zod şemaları
│   └── webhook.ts             ← HMAC doğrulama
├── prisma/schema.prisma
└── agents/                    ← Agent instruction dosyaları
```

---

## API Endpoint Referansı

### Uygulama API

```
POST   /api/music/generate          Vokalli / vokalsiz üretim
POST   /api/music/audio             Cover, Extend, AddVocals, RemoveVocals, ReplaceSection
GET    /api/music/tasks             Library listesi
GET    /api/music/tasks/:id         Tek task durumu
POST   /api/callback                KIE webhook
POST   /api/persona                 Persona oluştur/listele
POST   /api/voice                   Voice oluştur/listele
GET    /api/health                  Sağlık kontrolü
```

### KIE API (backend'de kullanılır)

```
POST   /api/v1/jobs/createTask
GET    /api/v1/jobs/recordInfo?taskId=...
GET    /api/v1/generate/record-info?taskId=...
POST   /api/v1/common/download-url
```

---

## Task Durum Akışı

```
QUEUED → TEXT_READY → FIRST_READY → COMPLETED
                                   → FAILED
```

KIE callback'leri: text → first → complete

---

## Webhook Kurulumu

Production'da KIE'nin ulaşabileceği public URL gereklidir:

```
APP_URL=https://music.yourapp.com
```

Callback URL otomatik: `{APP_URL}/api/callback`

Local development için HTTPS tunnel kullanın:
- ngrok: `ngrok http 3000`
- cloudflared: `cloudflared tunnel --url http://localhost:3000`

---

## Production Build

```bash
npm run build
npm start
```

---

## Validation Kuralları

- `instrumental: true` → lyrics, vocal_gender, audio_weight kaldırılır
- `customMode: false` → duration, sliders kaldırılır
- Style maks 1000 karakter
- Lyrics maks 5000 karakter (V6)
- Title maks 80 karakter
- Cover audio kaynak maks 8 dakika
- KIE media 14 gün sonra silinir → production'da S3/R2/Supabase kullanın
- Rate limit ~20 req/10sn → 429'da exponential backoff

---

## Sleek Music Mimarisi

Bu proje [sleek-music](https://github.com/LakhindarPal/sleek-music) müzik player mimarisinden ilham alır.
React Native versiyonu için sleek-music + bu backend kombinasyonu önerilir.

---

## Lisans

MIT

---

## Hızlı başlangıç (anahtar hazır)

`.env.example` dosyasını `.env` olarak kopyalayıp `KIE_API_KEY` değerini girin. Arayüz anahtar istemez; tüm istekler sunucudan gider.

```bash
cp .env.example .env # KIE_API_KEY'i yazın
npm install
npm run db:push
npm run dev          # http://localhost:3000 → SoundForge mobil arayüzü
```

Ses kaydı / yükleme ve webhook için KIE'nin sunucunuza erişebilmesi gerekir:

```bash
ngrok http 3000      # çıkan https adresini .env → APP_URL'e yazın, sunucuyu yeniden başlatın
```

iPhone'da adresi Safari'de açıp Paylaş → Ana Ekrana Ekle ile uygulama gibi kullanın.

**Vercel'e alırken:** `.env` GitHub'a gitmez (.gitignore). Vercel → Settings → Environment Variables'a
`KIE_API_KEY`, `APP_URL`, `DATABASE_URL` (Postgres) ekleyin. Yüklenen sesler için diskin yerine S3/R2/Supabase kullanın.
