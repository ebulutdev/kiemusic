// Uzak kaynakları (Firebase SDK + Google Fonts) uygulamaya gömer.
//   npm run vendor  →  public/vendor/firebase.js  ·  public/fonts/*.woff2 + fonts.css
// Mağaza (App Store / Play) paketinde kod ve font internetten yüklenmez; uygulama çevrimdışı da açılır.
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

// 1) Firebase SDK → tek ESM dosyası
await build({
  entryPoints: [join(root, "scripts/firebase-entry.js")],
  outfile: join(pub, "vendor/firebase.js"),
  bundle: true, format: "esm", minify: true, target: ["es2020", "safari15"],
  legalComments: "linked", logLevel: "warning",
});

// 2) Fontlar → yalnız latin + latin-ext (Türkçe ğ ş İ ı dahil)
const FONTS = [
  { pkg: "@fontsource-variable/bricolage-grotesque", css: "opsz.css", family: "Bricolage Grotesque" },
  { pkg: "@fontsource-variable/geist", css: "index.css", family: "Geist" },
  { pkg: "@fontsource-variable/geist-mono", css: "index.css", family: "Geist Mono" },
  { pkg: "@fontsource-variable/grenze-gotisch", css: "index.css", family: "Grenze Gotisch" },
];
const outDir = join(pub, "fonts");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
let css = "/* Otomatik üretildi: npm run vendor (scripts/vendor.mjs) — elle düzenlemeyin. Lisans: SIL OFL 1.1 */\n";
for (const f of FONTS) {
  const dir = join(root, "node_modules", f.pkg);
  const src = readFileSync(join(dir, f.css), "utf8");
  const blocks = src.split(/(?=\/\* )/).filter((b) => /-latin(-ext)?-[a-z]+-normal \*\//.test(b));
  for (const b of blocks) {
    const file = b.match(/url\(\.\/files\/([^)]+)\)/)[1];
    copyFileSync(join(dir, "files", file), join(outDir, file));
    css += b.replace(/font-family: '[^']+';/, `font-family: '${f.family}';`).replace(`./files/${file}`, `/fonts/${file}`);
  }
  copyFileSync(join(dir, "LICENSE"), join(outDir, `LICENSE-${f.family.replace(/ /g, "")}.txt`));
}
writeFileSync(join(outDir, "fonts.css"), css);
console.log("vendor: public/vendor/firebase.js + public/fonts hazır");
