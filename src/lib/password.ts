import crypto from "crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

// Konfigurasi parameter memory-hard & slow hash sesuai rekomendasi OWASP
const SCRYPT_OPTIONS: crypto.ScryptOptions = {
  cost: 16384, // N = 2^14
  blockSize: 8, // r
  parallelization: 1, // p
  maxmem: 32 * 1024 * 1024,
};

/**
 * Menyimpan kata sandi dengan fungsi slow hash (scrypt) dan salt acak unik.
 * Format tersimpan: scrypt$<salt_hex>$<derived_key_hex>
 */
export function hashKataSandi(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

/**
 * Verifikasi kecocokan kata sandi dengan hash tersimpan.
 * Menggunakan timingSafeEqual untuk mencegah timing attack.
 */
export function verifikasiKataSandi(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split("$");
    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }
    const [, salt, originalHashHex] = parts;
    const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
    const originalKey = Buffer.from(originalHashHex, "hex");
    if (derivedKey.length !== originalKey.length) {
      return false;
    }
    return crypto.timingSafeEqual(derivedKey, originalKey);
  } catch {
    return false;
  }
}
