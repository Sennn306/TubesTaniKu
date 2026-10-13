import crypto from 'crypto';

export interface BatchData {
  batchId: string;
  farmerId: string;
  hubId: string;
  commodityName: string;
  grade: 'GRADE_A' | 'GRADE_B';
  weightKg: number;
  timestamp: number;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export function generateQCAgentKeyPair(): KeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

export function serializeBatchData(data: BatchData): string {
  return JSON.stringify({
    batchId: data.batchId,
    farmerId: data.farmerId,
    hubId: data.hubId,
    commodityName: data.commodityName,
    grade: data.grade,
    weightKg: data.weightKg,
    timestamp: data.timestamp,
  });
}

export function signBatchData(data: BatchData, privateKeyPem: string): string {
  const serialized = serializeBatchData(data);
  const signature = crypto.sign(null, Buffer.from(serialized), privateKeyPem);
  return signature.toString('base64');
}

export function verifyBatchSignature(
  data: BatchData,
  signatureBase64: string,
  publicKeyPem: string
): boolean {
  try {
    const serialized = serializeBatchData(data);
    const signatureBuffer = Buffer.from(signatureBase64, 'base64');
    return crypto.verify(null, Buffer.from(serialized), publicKeyPem, signatureBuffer);
  } catch {
    return false;
  }
}