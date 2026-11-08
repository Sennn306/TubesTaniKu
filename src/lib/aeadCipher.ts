import crypto from "crypto";

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  tag: string;
  aad: string;
}

export function enkripsiData(plaintext: string, aadText: string): EncryptedPayload {
  const secretKeyHex = process.env.ENCRYPTION_KEY;
  if (!secretKeyHex || secretKeyHex.length !== 64) {
    throw new Error("ENCRYPTION_KEY tidak valid atau belum dikonfigurasi.");
  }
  const key = Buffer.from(secretKeyHex, "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const aadBuffer = Buffer.from(aadText, "utf-8");
  cipher.setAAD(aadBuffer);

  let ciphertext = cipher.update(plaintext, "utf-8", "hex");
  ciphertext += cipher.final("hex");
  const tag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    aad: aadText,
  };
}

export function dekripsiData(payload: EncryptedPayload, keyHexOverride?: string): string {
  const secretKeyHex = keyHexOverride || process.env.ENCRYPTION_KEY;
  if (!secretKeyHex || secretKeyHex.length !== 64) {
    throw new Error("ENCRYPTION_KEY tidak valid.");
  }
  const key = Buffer.from(secretKeyHex, "hex");
  const iv = Buffer.from(payload.iv, "hex");
  const tag = Buffer.from(payload.tag, "hex");
  const aadBuffer = Buffer.from(payload.aad, "utf-8");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  decipher.setAAD(aadBuffer);

  let plaintext = decipher.update(payload.ciphertext, "hex", "utf-8");
  plaintext += decipher.final("utf-8");
  return plaintext;
}