// Shared PKCE storage that both routes can access
const pkceStorage = new Map<string, { codeVerifier: string; timestamp: number }>()

export function storePkceData(state: string, codeVerifier: string) {
  pkceStorage.set(state, {
    codeVerifier,
    timestamp: Date.now(),
  })
  console.log("Stored PKCE data:", {
    state: state.substring(0, 10) + "...",
    totalEntries: pkceStorage.size,
  })
}

export function retrievePkceData(state: string): string | null {
  const data = pkceStorage.get(state)
  if (!data) {
    console.log("PKCE data not found for state:", state.substring(0, 10) + "...")
    console.log(
      "Available states:",
      Array.from(pkceStorage.keys()).map((k) => k.substring(0, 10) + "..."),
    )
    return null
  }

  // Check if expired (5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  if (data.timestamp < fiveMinutesAgo) {
    pkceStorage.delete(state)
    console.log("PKCE data expired for state:", state.substring(0, 10) + "...")
    return null
  }

  // Clean up after use
  pkceStorage.delete(state)
  console.log("Retrieved and cleaned up PKCE data:", {
    state: state.substring(0, 10) + "...",
    remainingEntries: pkceStorage.size,
  })

  return data.codeVerifier
}

export function cleanupExpiredPkce() {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  let cleaned = 0

  for (const [key, value] of pkceStorage.entries()) {
    if (value.timestamp < fiveMinutesAgo) {
      pkceStorage.delete(key)
      cleaned++
    }
  }

  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired PKCE entries`)
  }
}
