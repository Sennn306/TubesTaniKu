import {
  generateQCAgentKeyPair,
  signBatchData,
  verifyBatchSignature,
  BatchData
} from '../src/batchSigner';

describe('TaniKu - Cryptographic Batch Verification Tests', () => {
  let keyPair: { publicKey: string; privateKey: string };
  let sampleBatch: BatchData;

  beforeAll(() => {
    keyPair = generateQCAgentKeyPair();
    sampleBatch = {
      batchId: 'BATCH-20261013-001',
      farmerId: 'FARMER-JOKO-01',
      hubId: 'HUB-SUKAMAJU-01',
      commodityName: 'Cabai Merah Keriting',
      grade: 'GRADE_A',
      weightKg: 10.5,
      timestamp: 1760361000,
    };
  });

  test('Skenario 1 (Positif): Harus berhasil memverifikasi data batch panen yang sah', () => {
    const signature = signBatchData(sampleBatch, keyPair.privateKey);
    const isValid = verifyBatchSignature(sampleBatch, signature, keyPair.publicKey);
    expect(isValid).toBe(true);
  });

  test('Skenario 2 (Negatif - Tampering): Harus GAGAL jika data batch diubah setelah ditandatangani', () => {
    const signature = signBatchData(sampleBatch, keyPair.privateKey);
    const tamperedBatch: BatchData = { ...sampleBatch, grade: 'GRADE_B' };
    const isValid = verifyBatchSignature(tamperedBatch, signature, keyPair.publicKey);
    expect(isValid).toBe(false);
  });

  test('Skenario 3 (Negatif - Wrong Key): Harus GAGAL jika diverifikasi dengan Public Key agen lain', () => {
    const otherKeyPair = generateQCAgentKeyPair();
    const signature = signBatchData(sampleBatch, keyPair.privateKey);
    const isValid = verifyBatchSignature(sampleBatch, signature, otherKeyPair.publicKey);
    expect(isValid).toBe(false);
  });

  test('Skenario 4 (Uji Batas - Malformed Signature): Harus menangani string signature acak/rusak tanpa crash', () => {
    const malformedSignature = 'InVaLiD_SiGnAtUrE_StRiNg_1234567890==';
    const isValid = verifyBatchSignature(sampleBatch, malformedSignature, keyPair.publicKey);
    expect(isValid).toBe(false);
  });
});