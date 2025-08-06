import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code, codeVerifier, state } = await request.json()

    if (!code || !codeVerifier) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://beta.writeourheart.com"

    console.log("Token exchange attempt:", {
      code: code.substring(0, 10) + "...",
      codeVerifier: codeVerifier.substring(0, 10) + "...",
      baseUrl,
      clientId: process.env.CANVA_CLIENT_ID?.substring(0, 8) + "...",
    })

    // Exchange authorization code for access token with PKCE
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
        code: code,
        code_verifier: codeVerifier, // PKCE parameter
        redirect_uri: `${baseUrl}/api/canva/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("Token exchange failed:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
      })
      return NextResponse.json(
        {
          error: "Token exchange failed",
          details: errorText,
          status: tokenResponse.status,
        },
        { status: tokenResponse.status },
      )
    }

    const tokenData = await tokenResponse.json()

    console.log("Token exchange successful:", {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    })

    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token,
    })
  } catch (error) {
    console.error("Token exchange error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
