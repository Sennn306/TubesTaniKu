import { hashKataSandi, verifikasiKataSandi } from "../src/lib/password";

describe("TaniKu - Cryptographic Slow Password Hashing Tests", () => {
  const passwordUji = "PetaniHebat2026!";

  test("1. Pembuatan hash lambat (scrypt) menghasilkan format salt dan hash yang valid", () => {
    const hash = hashKataSandi(passwordUji);
    const bagian = hash.split("$");
    expect(bagian.length).toBe(3);
    expect(bagian[0]).toBe("scrypt");
    expect(bagian[1].length).toBe(32); // 16 bytes salt in hex
    expect(bagian[2].length).toBe(128); // 64 bytes derived key in hex
  });

  test("2. Verifikasi kata sandi benar menghasilkan true", () => {
    const hash = hashKataSandi(passwordUji);
    const isValid = verifikasiKataSandi(passwordUji, hash);
    expect(isValid).toBe(true);
  });

  test("3. Verifikasi kata sandi salah menghasilkan false", () => {
    const hash = hashKataSandi(passwordUji);
    const isValid = verifikasiKataSandi("KataSandiSalah123", hash);
    expect(isValid).toBe(false);
  });

  test("4. Format hash rusak atau tidak sah ditolak dengan aman (fail-safe)", () => {
    const isValid = verifikasiKataSandi(passwordUji, "md5$invalid$hash");
    expect(isValid).toBe(false);
  });
});
