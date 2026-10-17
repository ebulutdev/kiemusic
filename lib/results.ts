import type { TaskResult } from "./data/schema";

// KIE sonuç biçimleri tutarsız (snake/camel, callback ≠ recordInfo) → tek biçime indir.
// recordInfo için Suno resultJson biçimi belgelenmemiş: savunmacı okunur.
type Any = Record<string, any>;

const parse = (raw: unknown): any => {
  if (typeof raw !== "string") return raw;
  try { return JSON.parse(raw); } catch { return null; }
};
const compact = <T extends Any>(o: T): T => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== "")) as T;

function norm(r: Any): TaskResult {
  if (typeof r === "string") return { audio_url: r };
  return compact({
    id: r.id ?? r.audioId ?? r.audio_id,
    audio_url: r.audio_url ?? r.audioUrl,
    stream_audio_url: r.stream_audio_url ?? r.streamAudioUrl,
    image_url: r.image_url ?? r.imageUrl ?? r.source_image_url ?? r.sourceImageUrl,
    title: r.title,
    duration: r.duration,
    tags: r.tags,
    prompt: r.prompt,
  });
}

// ── Stem ayırma: vocal_removal_info | vocal_separation_info ──
const STEM_URLS: [string, string][] = [
  ["vocal_url", "Vocals"], ["instrumental_url", "Instrumental"], ["backing_vocals_url", "Backing_Vocals"],
  ["drums_url", "Drums"], ["bass_url", "Bass"], ["guitar_url", "Guitar"], ["keyboard_url", "Keyboard"],
  ["percussion_url", "Percussion"], ["strings_url", "Strings"], ["synth_url", "Synth"], ["fx_url", "FX"],
  ["brass_url", "Brass"], ["woodwinds_url", "Woodwinds"],
];
function stemInfo(v: Any): Any | null {
  return v?.vocal_removal_info ?? v?.vocal_separation_info ?? v?.data?.vocal_removal_info ?? v?.data?.vocal_separation_info
    ?? v?.resultObject?.vocal_removal_info ?? v?.resultObject?.vocal_separation_info
    ?? (v && (v.vocal_url || v.vocalUrl || v.origin_data) ? v : null);
}
// recordInfo (durum sorgusu): resultJson.resultUrls — yalnız adres listesi; stem adı dosya adının sonunda (…_Vocals.mp3)
const STEM_BY_SUFFIX = STEM_URLS.map(([, stem]) => stem).sort((a, b) => b.length - a.length); // Backing_Vocals, Vocals'tan önce
function stemOfUrl(u: string): string | null {
  let name = "";
  try { name = decodeURIComponent(new URL(u).pathname.split("/").pop() || ""); } catch { name = u.split("?")[0].split("/").pop() || ""; }
  const base = name.replace(/\.[a-z0-9]+$/i, "").toLowerCase();
  return STEM_BY_SUFFIX.find((s) => base.endsWith("_" + s.toLowerCase()) || base === s.toLowerCase()) ?? null;
}
export function stemResults(raw: unknown): TaskResult[] {
  const v = parse(raw);
  const urls: unknown = v?.resultUrls ?? v?.resultObject?.resultUrls;
  if (Array.isArray(urls) && !stemInfo(v)) {
    return urls
      .filter((u): u is string => typeof u === "string")
      .map((u) => ({ stem: stemOfUrl(u), audio_url: u }))
      .filter((x): x is { stem: string; audio_url: string } => !!x.stem); // ham karışım (origin) ve tanınmayan dosyalar atlanır
  }
  const info = stemInfo(v);
  if (!info) return [];
  const od: Any[] = Array.isArray(info.origin_data) ? info.origin_data : [];
  if (od.length && od[0]?.audio_url) {
    return od.filter((x) => x.audio_url).map((x) => compact({ id: x.id, stem: x.stem_type_group_name, audio_url: x.audio_url, duration: x.duration }));
  }
  return STEM_URLS
    .map(([k, stem]) => ({ stem, audio_url: info[k] ?? info[k.replace(/_(\w)/g, (_: string, c: string) => c.toUpperCase())] }))
    .filter((x) => x.audio_url);
}

export function normalizeResults(raw: unknown): TaskResult[] {
  const v = parse(raw);
  if (!v) return [];
  if (Array.isArray(v)) return v.map(norm);
  const arr = v.resultUrls ?? v.sunoData ?? v.data ?? v.response?.sunoData ?? v.response?.data ?? v.resultObject?.data ?? v.resultObject?.sunoData;
  if (Array.isArray(arr)) return arr.map(norm);
  const stems = stemResults(v);
  return stems;
}

// ── Ses olmayan sonuçlar (persona / doğrulama cümlesi / ses klonu) ──
export function extraResult(raw: unknown): Record<string, unknown> | null {
  let v = parse(raw);
  if (!v) return null;
  v = v.resultObject ?? v.data ?? v;
  const out = compact({
    personaId: v.persona_id ?? v.personaId,
    phrase: v.validateInfo ?? v.validate_info,
    voiceId: v.voiceId ?? v.voice_id,
    status: v.status,
    error: v.errorMessage ?? v.error_message,
  });
  return Object.keys(out).length ? out : null;
}

/**
 * Söz zamanlaması sahte mi? Üretim servisi bazen gerçek hizalama yerine kelimeleri eşit aralıklarla dağıtır
 * (hepsi aynı süre; toplam 240 sn ya da 30 sn gibi sabit bir uzunluğa yayılır). Bu zamanlamayla sözler şarkıdan
 * kayar → kullanılmaz, istemci satır oranlı yedek moda geçer.
 */
export function syntheticTimings(words: { w?: string; s: number; e: number }[], duration?: number): boolean {
  if (words.length < 6) return false;
  const d = words.map((x) => x.e - x.s);
  const uniform = d.filter((v) => Math.abs(v - d[0]) < 0.002).length / d.length >= 0.95;
  const last = words[words.length - 1].e;
  const overrun = !!duration && last > duration + 5; // şarkıdan uzun
  return uniform || overrun;
}
