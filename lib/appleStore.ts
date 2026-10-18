import { X509Certificate, createHash, verify } from "crypto";

// App Store (StoreKit 2) imzalı işlem doğrulaması: JWS başlığındaki x5c zinciri Apple Root CA - G3'e kadar doğrulanır,
// imza yaprak sertifikanın anahtarıyla (ES256) kontrol edilir. Ek hizmet / API anahtarı gerekmez.
// Kök: https://www.apple.com/certificateauthority/AppleRootCA-G3.cer (SHA-256 63:34:3A:BF:…:91:79)
const APPLE_ROOT_G3 = `-----BEGIN CERTIFICATE-----
MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwS
QXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9u
IEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcN
MTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBS
b290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9y
aXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49
AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtf
TjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517
IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySr
MA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gA
MGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4
at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM
6BgD56KyKA==
-----END CERTIFICATE-----`;
export const IOS_BUNDLE_ID = "com.emircanbulut.cookfire";

export interface AppleTransaction {
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  bundleId: string;
  expiresDate?: number;
  revocationDate?: number;
  appAccountToken?: string;
  environment?: string;
  type?: string;
}

const b64u = (s: string) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

export function verifyAppleJws(jws: string): AppleTransaction {
  const parts = String(jws || "").split(".");
  if (parts.length !== 3) throw new Error("Geçersiz makbuz");
  const header = JSON.parse(b64u(parts[0]).toString("utf8"));
  if (header.alg !== "ES256" || !Array.isArray(header.x5c) || header.x5c.length < 3) throw new Error("Geçersiz makbuz");
  const chain = header.x5c.map((c: string) => new X509Certificate(Buffer.from(c, "base64")));
  const root = new X509Certificate(APPLE_ROOT_G3);
  const now = new Date();
  for (const c of chain) if (new Date(c.validFrom) > now || new Date(c.validTo) < now) throw new Error("Makbuz sertifikası geçersiz");
  // yaprak ← ara ← kök (zincirdeki kök, sabitlenmiş Apple kökü ile aynı olmalı)
  if (!chain[0].verify(chain[1].publicKey) || !chain[1].verify(root.publicKey)) throw new Error("Makbuz imzası doğrulanamadı");
  if (chain[2].fingerprint256 !== root.fingerprint256) throw new Error("Makbuz imzası doğrulanamadı");
  const ok = verify("sha256", Buffer.from(parts[0] + "." + parts[1]), { key: chain[0].publicKey, dsaEncoding: "ieee-p1363" }, b64u(parts[2]));
  if (!ok) throw new Error("Makbuz imzası doğrulanamadı");
  const p = JSON.parse(b64u(parts[1]).toString("utf8"));
  return {
    transactionId: String(p.transactionId),
    originalTransactionId: String(p.originalTransactionId),
    productId: String(p.productId),
    bundleId: String(p.bundleId),
    expiresDate: typeof p.expiresDate === "number" ? p.expiresDate : undefined,
    revocationDate: typeof p.revocationDate === "number" ? p.revocationDate : undefined,
    appAccountToken: p.appAccountToken ? String(p.appAccountToken).toLowerCase() : undefined,
    environment: p.environment,
    type: p.type,
  };
}

// Satın alımı hesaba bağlayan sabit UUID (StoreKit appAccountToken): UUID v5(uid). İstemci (native.js) aynısını üretir.
const NS = "6f3c2a54-1f0b-4c47-9a39-2d6c3e5f8b10";
export function accountToken(uid: string): string {
  const ns = Buffer.from(NS.replace(/-/g, ""), "hex");
  const h = createHash("sha1").update(Buffer.concat([ns, Buffer.from(uid, "utf8")])).digest().subarray(0, 16);
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.toString("hex");
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}
