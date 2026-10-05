import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // public/ standalone izine girmesin: girerse App Hosting "public zaten var" deyip klasörün
  // geri kalanını (index.html, app.js, fontlar…) kopyalamaz → canlıda ana sayfa 404 olur.
  // Sunucunun ihtiyaç duyduğu tek dosya (config/app.json) derlemede koda gömülü (lib/data/config.ts).
  outputFileTracingExcludes: { "*": ["public/**/*"] },
  // Ana sayfa: mobil CookRapper arayüzü (public/index.html)
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/index.html" },
        { source: "/admin", destination: "/admin.html" }, // yönetim paneli (yetki: /api/admin/* sunucuda denetlenir)
        { source: "/privacy", destination: "/privacy.html" }, // Gizlilik Politikası (mağaza bağlantısı)
        { source: "/terms", destination: "/terms.html" },     // Kullanım Koşulları
      ],
    };
  },
};

export default nextConfig;
