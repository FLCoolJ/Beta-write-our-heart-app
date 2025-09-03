import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { storePkceData, cleanupExpiredPkce } from "@/lib/pkce-storage"

// Simple base64url conversion
function toBase64Url(str: string): string {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

export async function GET() {
  try {
    cleanupExpiredPkce()

    // Check environment variables
    const clientId = process.env.NEXT_PUBLIC_CANVA_CLIENT_ID
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const clientSecret = process.env.CANVA_CLIENT_SECRET

    if (!clientId || !appUrl || !clientSecret) {
      return NextResponse.json(
        {
          error: "Missing environment variables",
          missing: {
            clientId: !clientId,
            appUrl: !appUrl,
            clientSecret: !clientSecret,
          },
        },
        { status: 500 },
      )
    }

    // Generate PKCE parameters
    const codeVerifier = toBase64Url(crypto.randomBytes(96).toString("base64"))
    const codeChallenge = toBase64Url(crypto.createHash("sha256").update(codeVerifier).digest("base64"))
    const state = toBase64Url(crypto.randomBytes(32).toString("base64"))

    // Store code verifier using shared storage
    storePkceData(state, codeVerifier)

    // Build auth URL
    const redirectUri = `${appUrl}/api/canva/callback`
    const scopes = "design:content:read design:content:write design:meta:read"

    const authUrl = `https://www.canva.com/api/oauth/authorize?${new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      scope: scopes,
      redirect_uri: redirectUri,
      state: state,
    }).toString()}`

    return NextResponse.json({
      authUrl,
      debug: {
        redirectUri,
        scopes,
        stateLength: state.length,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        type: error.constructor.name,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()

    if (!code || !state) {
      return NextResponse.json({ error: "Missing code or state" }, { status: 400 })
    }

    // Retrieve code verifier from shared storage
    const { retrievePkceData } = await import("@/lib/pkce-storage")
    const codeVerifier = retrievePkceData(state)

    if (!codeVerifier) {
      return NextResponse.json(
        {
          error: "PKCE data not found - please try authentication again",
        },
        { status: 400 },
      )
    }

    // Exchange for token
    const tokenResponse = await fetch("https://api.canva.com/rest/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`,
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.CANVA_CLIENT_ID!,
        code,
        code_verifier: codeVerifier,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/canva/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      return NextResponse.json(
        {
          error: "Token exchange failed",
          details: errorText,
          status: tokenResponse.status,
        },
        { status: 400 },
      )
    }

    const tokenData = await tokenResponse.json()

    return NextResponse.json(tokenData)
  } catch (error) {
    return NextResponse.json(
      {
        error: "Token exchange failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
