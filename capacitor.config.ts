import type { CapacitorConfig } from "@capacitor/cli";

// Mobil uygulama (iOS / Android). Arayüz uygulamanın İÇİNE gömülür (webDir), sunucudan yüklenmez.
// API istekleri tam adrese gider: www/env.js → CR_ENV.apiBase (scripts/build-www.mjs, varsayılan: apphosting.yaml APP_URL)
// Derleme: npm run mobile:build   ·   Xcode: npx cap open ios   ·   Android Studio: npx cap open android
const config: CapacitorConfig = {
  appId: "com.fetsangrup.cookrapper",
  appName: "CookRapper",
  webDir: "www",
  backgroundColor: "#0B0A09",
  server: {
    androidScheme: "https", // origin: https://localhost (sunucu CORS listesinde)
    iosScheme: "capacitor", // origin: capacitor://localhost
  },
  ios: {
    contentInset: "never",
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
