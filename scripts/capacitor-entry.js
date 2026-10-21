// Capacitor çekirdeği → public/vendor/capacitor.js (npm run vendor)
// Yüklenince window.Capacitor'a registerPlugin / Plugins eklenir; yerel eklentilere (Apple/Google girişi,
// abonelik, medya) JS'ten erişim bunu gerektirir. Web'de zararsız: isNativePlatform() false döner.
export { Capacitor, registerPlugin } from "@capacitor/core";
