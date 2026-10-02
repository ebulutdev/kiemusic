// Mobil paket için web varlıklarını hazırlar: public/ → www/ (Capacitor webDir)
//   CR_API_BASE=https://... npm run mobile:build   (verilmezse apphosting.yaml → APP_URL)
import { cpSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "www");

function appUrl() {
  if (process.env.CR_API_BASE) return process.env.CR_API_BASE;
  const yaml = readFileSync(join(root, "apphosting.yaml"), "utf8");
  const m = yaml.match(/variable:\s*APP_URL\s*\n\s*value:\s*(\S+)/);
  if (!m) throw new Error("API adresi bulunamadı: CR_API_BASE verin ya da apphosting.yaml'da APP_URL tanımlayın");
  return m[1];
}

if (!existsSync(join(root, "public/vendor/firebase.js"))) throw new Error("Önce: npm run vendor");
const apiBase = appUrl().replace(/\/+$/, "");
if (!/^https:\/\//.test(apiBase)) throw new Error("API adresi https olmalı: " + apiBase);

rmSync(out, { recursive: true, force: true });
cpSync(join(root, "public"), out, { recursive: true, filter: (p) => !p.endsWith(".LEGAL.txt") });
writeFileSync(join(out, "env.js"), `// Otomatik üretildi (scripts/build-www.mjs)\nwindow.CR_ENV = { apiBase: ${JSON.stringify(apiBase)} };\n`);
console.log("www hazır · API:", apiBase);
