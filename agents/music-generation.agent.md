# Music Generation Agent

Sorumlu olduğun şey: KIE/Suno AI müzik üretim akışı.

## Backend Endpoints

```
POST /api/music/generate     → Vokalli / vokalsiz üretim
POST /api/music/audio        → Cover / Extend / Add Vocals / Remove Vocals / Replace Section
GET  /api/music/tasks        → Library listesi
GET  /api/music/tasks/:id    → Tek task durumu (+ KIE fallback polling)
POST /api/callback           → KIE webhook (HMAC doğrulamalı)
POST /api/persona            → Persona oluştur
POST /api/voice              → Custom Voice oluştur
```

## KIE Model Map

| Özellik | KIE Model |
|---|---|
| Üretim | ai-music-api/generate |
| Cover | ai-music-api/upload-and-cover-audio |
| Extend | ai-music-api/extend |
| Add Vocals | ai-music-api/add-vocals |
| Vocal Ayır | ai-music-api/separate-vocals |
| Bölüm Değiştir | ai-music-api/replace-section |
| Persona | ai-music-api/generate-persona |
| Voice | ai-music-api/create-voice |

## Kritik Kurallar

- KIE_API_KEY ASLA frontend'e gönderilmez
- NEXT_PUBLIC_ prefix kullanılmaz
- Instrumental modda: lyrics, vocal_gender, audio_weight silinir
- Simple modda: duration, sliders gönderilmez
- Webhook: 15sn içinde HTTP 200 dönülmeli
- Callback idempotent: aynı task için birden fazla gelebilir
- KIE media 14 gün sonra silinir → kendi storage'a kopyala

## Task Durum Akışı

QUEUED → TEXT_READY → FIRST_READY → COMPLETED
                                   → FAILED

## Rate Limit

~20 istek / 10 saniye. 429 → exponential backoff.
