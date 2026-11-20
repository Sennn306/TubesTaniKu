import { enkripsiData, dekripsiData } from "../src/lib/aeadCipher";
import crypto from "crypto";

describe("Pengujian Kriptografi AEAD (AES-256-GCM)", () => {
  const originalEnvKey = process.env.ENCRYPTION_KEY;

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString("hex");
  });

  afterAll(() => {
    process.env.ENCRYPTION_KEY = originalEnvKey;
  });

  test("1. Dekripsi payload valid berhasil", () => {
    const data = "Catatan Rahasia Inspeksi Mutu Batch 105";
    const aad = "batchId:105";
    const result = enkripsiData(data, aad);
    const decrypted = dekripsiData(result);
    expect(decrypted).toBe(data);
  });

  test("2. Penolakan dekripsi jika ciphertext dimodifikasi", () => {
    const data = "Data Panen Organik";
    const aad = "batchId:200";
    const result = enkripsiData(data, aad);
    const modifiedCiphertext =
      result.ciphertext.slice(0, -2) + (result.ciphertext.endsWith("00") ? "11" : "00");
    const corruptedPayload = { ...result, ciphertext: modifiedCiphertext };
    expect(() => dekripsiData(corruptedPayload)).toThrow();
  });

  test("3. Penolakan dekripsi jika Authentication Tag dimodifikasi", () => {
    const data = "Data Panen Organik";
    const aad = "batchId:200";
    const result = enkripsiData(data, aad);
    const modifiedTag =
      result.tag.slice(0, -2) + (result.tag.endsWith("00") ? "11" : "00");
    const corruptedPayload = { ...result, tag: modifiedTag };
    expect(() => dekripsiData(corruptedPayload)).toThrow();
  });

  test("4. Penolakan dekripsi jika kunci dekripsi salah", () => {
    const data = "Data Panen Organik";
    const aad = "batchId:200";
    const result = enkripsiData(data, aad);
    const wrongKey = crypto.randomBytes(32).toString("hex");
    expect(() => dekripsiData(result, wrongKey)).toThrow();
  });
});