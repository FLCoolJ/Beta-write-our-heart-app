import { type NextRequest, NextResponse } from "next/server"
import { retrievePkceData } from "@/lib/pkce-storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    console.log("=== Canva Callback Received ===")
    console.log("Callback params:", {
      hasCode: !!code,
      hasState: !!state,
      error,
      state: state?.substring(0, 20) + "...",
    })

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get("error_description") || "Authentication failed"
      console.error("Canva OAuth error:", error, errorDescription)

      const redirectUrl = new URL("/card-production", request.url)
      redirectUrl.searchParams.set("error", "true")
      redirectUrl.searchParams.set("message", encodeURIComponent(`Canva error: ${error} - ${errorDescription}`))

      return NextResponse.redirect(redirectUrl)
    }

    // Validate required parameters
    if (!code || !state) {
      console.error("Missing required parameters:", { code: !!code, state: !!state })

      const redirectUrl = new URL("/card-production", request.url)
      redirectUrl.searchParams.set("error", "true")
      redirectUrl.searchParams.set("message", encodeURIComponent("Missing authorization code or state"))

      return NextResponse.redirect(redirectUrl)
    }

    // Retrieve stored PKCE data using shared storage
    const codeVerifier = retrievePkceData(state)
    if (!codeVerifier) {
      console.error("PKCE data not found - session may have expired")

      const redirectUrl = new URL("/card-production", request.url)
      redirectUrl.searchParams.set("error", "true")
      redirectUrl.searchParams.set("message", encodeURIComponent("Session expired - please try authentication again"))

      return NextResponse.redirect(redirectUrl)
    }

    console.log("Retrieved PKCE data successfully:", {
      codeLength: code.length,
      verifierLength: codeVerifier.length,
      clientId: process.env.CANVA_CLIENT_ID?.substring(0, 8) + "...",
    })

    // Exchange authorization code for access token
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://beta.writeourheart.com"
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
        code_verifier: codeVerifier,
        redirect_uri: `${baseUrl}/api/canva/callback`,
      }),
    })

    console.log("Token response status:", tokenResponse.status, tokenResponse.statusText)

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await tokenResponse.text()
    console.log("Token response body:", responseText.substring(0, 200) + "...")

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: responseText,
      })

      const redirectUrl = new URL("/card-production", request.url)
      redirectUrl.searchParams.set("error", "true")
      redirectUrl.searchParams.set("message", encodeURIComponent(`Token exchange failed: ${responseText}`))

      return NextResponse.redirect(redirectUrl)
    }

    // Parse JSON response
    let tokenData
    try {
      tokenData = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse token response as JSON:", parseError)
      console.log("Raw response:", responseText)

      const redirectUrl = new URL("/card-production", request.url)
      redirectUrl.searchParams.set("error", "true")
      redirectUrl.searchParams.set("message", encodeURIComponent("Invalid response from Canva"))

      return NextResponse.redirect(redirectUrl)
    }

    console.log("Token exchange successful:", {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type,
    })

    // Redirect back to card production with success
    const redirectUrl = new URL("/card-production", request.url)
    redirectUrl.searchParams.set("success", "true")
    redirectUrl.searchParams.set("canva_token", tokenData.access_token)

    if (tokenData.refresh_token) {
      redirectUrl.searchParams.set("canva_refresh_token", tokenData.refresh_token)
    }

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("Callback error:", error)

    const redirectUrl = new URL("/card-production", request.url)
    redirectUrl.searchParams.set("error", "true")
    redirectUrl.searchParams.set("message", encodeURIComponent(`Internal error: ${error.message}`))

    return NextResponse.redirect(redirectUrl)
  }
}
