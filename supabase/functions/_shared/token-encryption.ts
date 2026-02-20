/**
 * Token encryption/decryption utilities using AES-GCM.
 * Uses a derived key from SUPABASE_SERVICE_ROLE_KEY for encryption.
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

async function deriveKey(): Promise<CryptoKey> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!secret) throw new Error("SUPABASE_SERVICE_ROLE_KEY not available for encryption");

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("fb-token-encryption-salt-v1"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a plaintext token. Returns base64-encoded "iv:ciphertext" string.
 */
export async function encryptToken(plaintext: string): Promise<string> {
  const key = await deriveKey();
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  );

  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  return `enc:${ivB64}:${ctB64}`;
}

/**
 * Decrypt a token. Accepts both encrypted ("enc:iv:ct") and legacy plaintext tokens.
 */
export async function decryptToken(stored: string): Promise<string> {
  // Legacy plaintext tokens (not yet encrypted) - return as-is
  if (!stored.startsWith("enc:")) {
    return stored;
  }

  const parts = stored.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted token format");

  const key = await deriveKey();
  const iv = Uint8Array.from(atob(parts[1]), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(parts[2]), (c) => c.charCodeAt(0));

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plaintext);
}
