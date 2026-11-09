import crypto from "crypto";

export interface BatchData {
  batchId?: string;
  farmerId?: string;
  hubId?: string;
  farmerName?: string;
  commodityName: string;
  weightKg: number;
  grade: string;
  timestamp?: number;
}

export type BatchPayload = BatchData;

export function generateQCAgentKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
}

const defaultKeyPair = generateQCAgentKeyPair();

export function signBatchData(payload: BatchData, privateKeyPem?: string): string {
  const key = privateKeyPem
    ? crypto.createPrivateKey(privateKeyPem)
    : crypto.createPrivateKey(defaultKeyPair.privateKey);
  const dataString = JSON.stringify(payload);
  const signature = crypto.sign(null, Buffer.from(dataString), key);
  return signature.toString("base64");
}

export function verifyBatchSignature(
  payload: BatchData,
  signatureBase64: string,
  publicKeyPem?: string
): boolean {
  if (!signatureBase64) return false;
  try {
    const key = publicKeyPem
      ? crypto.createPublicKey(publicKeyPem)
      : crypto.createPublicKey(defaultKeyPair.publicKey);
    const dataString = JSON.stringify(payload);
    return crypto.verify(
      null,
      Buffer.from(dataString),
      key,
      Buffer.from(signatureBase64, "base64")
    );
  } catch {
    return false;
  }
}

// Alias fungsi untuk komponen UI & Server Actions
export const buatTandaTanganBatch = signBatchData;
export const verifikasiTandaTanganBatch = verifyBatchSignature;