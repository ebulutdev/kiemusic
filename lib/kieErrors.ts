// Üretim servisinden gelen hata kodları / iletileri → kullanıcıya resmi, kısa Türkçe metin (servis adı ve ham ileti gösterilmez).
// Kodlar: 401/403 yetki · 402 kredi · 404 yok · 409 çakışma · 422 parametre / içerik · 429 hız sınırı · 451 kaynak · 455 bakım · 5xx hata.
// 402 / 429 / 455 / 5xx "sistem yoğun" sayılır (ProviderBusy → arayüzde Bildir'li pencere); diğerleri doğrudan bu metinlerle gösterilir.
export const KIE_MSG = {
  unavailable: "Hizmet şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyiniz.",
  notFound: "İstenen kayıt bulunamadı.",
  conflict: "Bu işlem daha önce gerçekleştirilmiş.",
  content: "İçerik, kullanım ve telif koşullarına uygun bulunmadı. Lütfen sözleri veya kaynak sesi değiştirerek tekrar deneyiniz.",
  invalid: "Girilen bilgiler işlenemedi. Lütfen kontrol ederek tekrar deneyiniz.",
  source: "Kaynak dosyaya erişilemedi. Lütfen dosyayı yeniden yükleyiniz.",
  failed: "İşlem tamamlanamadı. Lütfen daha sonra tekrar deneyiniz.",
} as const;

const CONTENT = /sensitive|copyright|artist|lyrics.*match|moderat|policy|inappropriate|violat|prohibit/i;
const SOURCE = /download|fetch|unreachable|audio.*(url|file)|duration|too (long|short)|format|invalid url/i;

/** Servis kodu + ileti → kullanıcı metni (busy: sistem yoğun penceresi gerekir mi) */
export function kieUserMessage(code: unknown, raw?: string | null): { message: string; busy: boolean } {
  const c = Number(code), m = raw || "";
  if (c === 402 || c === 429 || c === 455 || c === 503 || c >= 500) return { message: "", busy: true };
  if (c === 401 || c === 403) return { message: KIE_MSG.unavailable, busy: false };
  if (c === 404) return { message: KIE_MSG.notFound, busy: false };
  if (c === 409) return { message: KIE_MSG.conflict, busy: false };
  if (c === 451 || SOURCE.test(m)) return { message: KIE_MSG.source, busy: false };
  if (CONTENT.test(m)) return { message: KIE_MSG.content, busy: false };
  if (c === 400 || c === 422) return { message: KIE_MSG.invalid, busy: false };
  return { message: KIE_MSG.failed, busy: false };
}

/** Görev başarısız bildirimi (failMsg / detay durumu) → kullanıcı metni; busy ise null döner (çağıran BUSY_MESSAGE kullanır) */
export function failText(code: unknown, raw?: string | null): string | null {
  const m = raw || "";
  if (/insufficient|credits?\b|quota|rate.?limit|too many requests|overload|maintenance/i.test(m)) return null;
  if (/SENSITIVE_WORD_ERROR/i.test(String(code)) || CONTENT.test(m)) return KIE_MSG.content;
  if (SOURCE.test(m)) return KIE_MSG.source;
  return kieUserMessage(code && /^\d+$/.test(String(code)) ? code : 0, m).message || KIE_MSG.failed;
}
