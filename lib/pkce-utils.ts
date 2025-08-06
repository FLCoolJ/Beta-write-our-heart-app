import crypto from "crypto"

// Convert base64 to base64url format
function base64ToBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

// Server-side PKCE utilities
export function generateCodeVerifier(): string {
  const buffer = crypto.randomBytes(96)
  return base64ToBase64Url(buffer.toString("base64"))
}

export function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash("sha256").update(verifier).digest("base64")
  return base64ToBase64Url(hash)
}

export function generateState(): string {
  const buffer = crypto.randomBytes(96)
  return base64ToBase64Url(buffer.toString("base64"))
}

// Encrypt PKCE data to store in state parameter
export function encryptPkceData(codeVerifier: string): string {
  const secret = process.env.CANVA_CLIENT_SECRET || "fallback-secret-key"
  const cipher = crypto.createCipher("aes-256-cbc", secret)
  let encrypted = cipher.update(codeVerifier, "utf8", "hex")
  encrypted += cipher.final("hex")
  return encrypted
}

// Decrypt PKCE data from state parameter
export function decryptPkceData(encryptedData: string): string {
  const secret = process.env.CANVA_CLIENT_SECRET || "fallback-secret-key"
  const decipher = crypto.createDecipher("aes-256-cbc", secret)
  let decrypted = decipher.update(encryptedData, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}
