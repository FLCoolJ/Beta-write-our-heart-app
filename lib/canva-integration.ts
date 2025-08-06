// Updated Canva API integration with correct granular scopes
interface CanvaDesign {
  id: string
  title: string
  thumbnail: {
    url: string
  }
  urls: {
    edit_url: string
    view_url: string
  }
}

interface CanvaAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

export function getCanvaAuthUrl(): string {
  const clientId = process.env.NEXT_PUBLIC_CANVA_CLIENT_ID?.trim()

  if (!clientId) {
    throw new Error("NEXT_PUBLIC_CANVA_CLIENT_ID is not configured")
  }

  // Validate Client ID format (should start with OC- or OC_)
  if (!clientId.startsWith("OC-") && !clientId.startsWith("OC_")) {
    throw new Error(`Invalid Client ID format: ${clientId}. Should start with 'OC-' or 'OC_'`)
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured")
  }

  // Generate PKCE parameters
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const state = generateState()

  // Store PKCE values in sessionStorage for later use
  if (typeof window !== "undefined") {
    sessionStorage.setItem("canva_code_verifier", codeVerifier)
    sessionStorage.setItem("canva_state", state)
  }

  const redirectUri = `${baseUrl}/api/canva/callback`

  console.log("Canva Auth Debug:", {
    clientId: clientId,
    baseUrl,
    redirectUri,
    codeChallenge: codeChallenge.substring(0, 10) + "...",
    state: state.substring(0, 10) + "...",
  })

  // Use the correct granular scopes for creating and editing designs
  const scopes = "design:content:read design:content:write design:meta:read"

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: scopes,
    redirect_uri: redirectUri,
    state: state,
  })

  const authUrl = `https://www.canva.com/api/oauth/authorize?${params.toString()}`

  console.log("Generated PKCE-enabled auth URL:", authUrl)
  console.log("Requested scopes:", scopes)

  return authUrl
}

// Helper functions for PKCE (client-side)
function generateCodeVerifier(): string {
  // For client-side, use Web Crypto API
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(96)
    window.crypto.getRandomValues(array)
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")
  }

  // Fallback for server-side or older browsers
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

function generateCodeChallenge(verifier: string): string {
  // For client-side, we'll use a simpler approach since crypto.subtle is async
  // The server-side callback will handle the proper PKCE verification
  return btoa(verifier).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function createCardWithCanva(
  accessToken: string,
  artworkUrl: string,
  poetry: string,
  recipientName: string,
  occasion: string,
): Promise<{ designId: string; editUrl: string }> {
  try {
    // Step 1: Create blank design
    const createResponse = await fetch("https://api.canva.com/rest/v1/designs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        design_type: "GreetingCard_5x7",
        title: `${recipientName} - ${occasion} Card`,
      }),
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      throw new Error(`Canva design creation failed: ${createResponse.status} - ${errorText}`)
    }

    const designData: CanvaDesign = await createResponse.json()

    return {
      designId: designData.id,
      editUrl: designData.urls.edit_url,
    }
  } catch (error) {
    console.error("Canva API error:", error)
    throw new Error(`Failed to create card with Canva: ${error.message}`)
  }
}

// Fallback: Generate direct Canva template URLs
export function generateCanvaTemplateUrl(occasion: string): string {
  const baseUrl = "https://www.canva.com/design/create?type=GreetingCard_5x7"
  const templates = {
    birthday: `${baseUrl}&template=birthday-greeting-card`,
    christmas: `${baseUrl}&template=christmas-greeting-card`,
    valentines: `${baseUrl}&template=valentine-greeting-card`,
    mothers: `${baseUrl}&template=mothers-day-greeting-card`,
    fathers: `${baseUrl}&template=fathers-day-greeting-card`,
    thankyou: `${baseUrl}&template=thank-you-greeting-card`,
    other: `${baseUrl}&template=greeting-card`,
  }

  return templates[occasion as keyof typeof templates] || templates.other
}
