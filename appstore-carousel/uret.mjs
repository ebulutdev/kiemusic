// App Store carousel PNG'leri: kaynak.html → Chrome headless ile her kare, iki boyutta.
//   node appstore-carousel/uret.mjs   → appstore-carousel/6.9/*.png (1290×2796) ve 6.3/*.png (1206×2622)
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find(existsSync);
if (!chrome) throw new Error("Chrome bulunamadı");
const SIZES = { "6.9": [1290, 2796], "6.3": [1206, 2622] };
const NAMES = ["1-sahne-senin", "2-tam-kontrol", "3-kendi-sesinden", "4-kutuphane"];
const src = pathToFileURL(resolve(here, "kaynak.html")).href;

for (const [dir, [w, h]] of Object.entries(SIZES)) {
  mkdirSync(resolve(here, dir), { recursive: true });
  NAMES.forEach((n, i) => {
    const out = resolve(here, dir, `${n}.png`);
    execFileSync(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", "--force-device-scale-factor=1",
      `--window-size=${w},${h}`, "--virtual-time-budget=4000", `--screenshot=${out}`, `${src}?i=${i}&w=${w}&h=${h}`], { stdio: "ignore" });
    console.log("✓", dir, n);
  });
}
