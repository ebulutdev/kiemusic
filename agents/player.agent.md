# Music Player Agent

## Gereksinimler

- Mini player (alt bar)
- Play / Pause
- Seek (progress bar tıklama)
- Süre göstergesi (current / total)
- Başlık ve stil bilgisi
- Kapatma butonu
- Hata yönetimi (ses çalınamadı)

## Mevcut Mimari

- `<audio>` elementi — ref ile yönetilir
- `ontimeupdate` → progress ve süre güncelleme
- `onended` → isPlaying = false

## Gelecek Eklemeler (sleek-music referansı)

- Background playback (PWA Service Worker)
- Lock screen / notification controls (Media Session API)
- Queue yönetimi
- Shuffle / Repeat
- Gapless playback
- Waveform visualizer (Web Audio API)
- Offline cache (IndexedDB)

## Media Session API

```ts
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: 'SoundForge AI',
    artwork: [{ src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' }]
  });
  navigator.mediaSession.setActionHandler('play', () => audio.play());
  navigator.mediaSession.setActionHandler('pause', () => audio.pause());
}
```
