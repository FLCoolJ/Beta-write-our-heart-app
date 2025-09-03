import { type NextRequest, NextResponse } from "next/server"
import { retrievePkceData } from "@/lib/pkce-storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get("error_description") || "Authentication failed"

      const redirectUrl = new URL("/card-production", request.url)
      redirectUrl.searchParams.set("error", "true")
      redirectUrl.searchParams.set("message", encodeURIComponent(`Canva error: ${error} - ${errorDescription}`))

      return NextResponse.redirect(redirectUrl)
    }

    // Validate required parameters
    if (!code || !state) {
      const redirectUrl = new URL("/card-production", request.url)
      redirectUrl.searchParams.set("error", "true")
      redirectUrl.searchParams.set("message", encodeURIComponent("Missing authorization code or state"))

      return NextResponse.redirect(redirectUrl)
    }

    // Retrieve stored PKCE data using shared storage
    const codeVerifier = retrievePkceData(state)
    if (!codeVerifier) {
      const redirectUrl = new URL("/card-production", request.url)
      redirectUrl.searchParams.set("error", "true")
      redirectUrl.searchParams.set("message", encodeURIComponent("Session expired - please try authentication again"))

      return NextResponse.redirect(redirectUrl)
    }

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

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await tokenResponse.text()

    if (!tokenResponse.ok) {
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
      const redirectUrl = new URL("/card-production", request.url)
      redirectUrl.searchParams.set("error", "true")
      redirectUrl.searchParams.set("message", encodeURIComponent("Invalid response from Canva"))

      return NextResponse.redirect(redirectUrl)
    }

    // Redirect back to card production with success
    const redirectUrl = new URL("/card-production", request.url)
    redirectUrl.searchParams.set("success", "true")
    redirectUrl.searchParams.set("canva_token", tokenData.access_token)

    if (tokenData.refresh_token) {
      redirectUrl.searchParams.set("canva_refresh_token", tokenData.refresh_token)
    }

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    const redirectUrl = new URL("/card-production", request.url)
    redirectUrl.searchParams.set("error", "true")
    redirectUrl.searchParams.set("message", encodeURIComponent(`Internal error: ${error.message}`))

    return NextResponse.redirect(redirectUrl)
  }
}
