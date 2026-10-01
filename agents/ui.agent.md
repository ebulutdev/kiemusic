# Mobile UI Agent

## Tasarım Sistemi

Font: Inter (body) + Space Grotesk (başlık/buton)
Renk: Koyu müzik uygulaması paleti (#080b12 base)
Aksan: #6c63ff (mor/violet)
Başarı: #22d3a0 (yeşil)
Hata: #ff5f7e (kırmızı)
Uyarı: #f5a623 (amber)

## iOS Uyumluluk

- viewport-fit=cover zorunlu
- env(safe-area-inset-*) tüm kenarlarda kullanılır
- -webkit-overflow-scrolling: touch
- -webkit-tap-highlight-color: transparent
- Apple PWA meta tag'leri layout.tsx'te tanımlı

## Kurallar

- Tüm butonlar :active ile geri bildirim verir
- Form alanları focus'ta border-color: var(--accent)
- Scrollable listeler için scrollbar-width: none
- Collapsible paneller max-height transition ile açılır
- Loading durumları spin animasyonu ile gösterilir
- Toast: fixed, bottom, 2.8 saniyelik gösterim
- Tüm renkler CSS variable ile tanımlı (dark mode ready)

## Responsive

max-width yok — tam mobil genişlik
Tablet/desktop için later: container max-width: 480px + center
