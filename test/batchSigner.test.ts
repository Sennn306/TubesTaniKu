import {
  generateQCAgentKeyPair,
  signBatchData,
  verifyBatchSignature,
  BatchData,
} from "../src/batchSigner";

describe("TaniKu - Cryptographic Batch Verification Tests", () => {
  let keyPair: { publicKey: string; privateKey: string };
  let sampleBatch: BatchData;

  beforeAll(() => {
    keyPair = generateQCAgentKeyPair();
    sampleBatch = {
      batchId: "BATCH-20261013-001",
      farmerId: "FARMER-JOKO-01",
      hubId: "HUB-SUKAMAJU-01",
      farmerName: "Joko",
      commodityName: "Cabai Merah Keriting",
      grade: "GRADE_A",
      weightKg: 10.5,
      timestamp: 1760361000,
    };
  });

  test("1. Pembuatan dan verifikasi tanda tangan digital valid", () => {
    const signature = signBatchData(sampleBatch, keyPair.privateKey);
    const isValid = verifyBatchSignature(sampleBatch, signature, keyPair.publicKey);
    expect(isValid).toBe(true);
  });

  test("2. Penolakan verifikasi jika data batch dimodifikasi", () => {
    const signature = signBatchData(sampleBatch, keyPair.privateKey);
    const tamperedBatch = { ...sampleBatch, weightKg: 99.9 };
    const isValid = verifyBatchSignature(tamperedBatch, signature, keyPair.publicKey);
    expect(isValid).toBe(false);
  });

  test("3. Penolakan verifikasi jika tanda tangan digital rusak", () => {
    const signature = signBatchData(sampleBatch, keyPair.privateKey);
    const corruptedSignature = signature.slice(0, -4) + "AAAA";
    const isValid = verifyBatchSignature(sampleBatch, corruptedSignature, keyPair.publicKey);
    expect(isValid).toBe(false);
  });

  test("4. Penolakan verifikasi jika kunci publik tidak sesuai", () => {
    const signature = signBatchData(sampleBatch, keyPair.privateKey);
    const otherKeyPair = generateQCAgentKeyPair();
    const isValid = verifyBatchSignature(sampleBatch, signature, otherKeyPair.publicKey);
    expect(isValid).toBe(false);
  });
});