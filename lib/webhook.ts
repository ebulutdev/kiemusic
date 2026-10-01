import crypto from "crypto";

/**
 * KIE webhook HMAC-SHA256 doğrulaması.
 * İmzalanan veri: `${taskId}.${timestamp}`
 * Header'lar: X-Webhook-Timestamp, X-Webhook-Signature
 */
export function verifyKieWebhook(
  taskId: string,
  timestamp: string,
  signature: string
): boolean {
  const secret = process.env.KIE_WEBHOOK_HMAC_KEY;
  if (!secret) throw new Error("KIE_WEBHOOK_HMAC_KEY tanımlanmamış.");

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;

  // Replay protection: 5 dakikadan eski kabul etme
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) return false;

  const digest = crypto
    .createHmac("sha256", secret)
    .update(`${taskId}.${timestamp}`)
    .digest("base64");

  const expected = Buffer.from(digest);
  const received = Buffer.from(signature);

  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}
