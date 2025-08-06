import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get the IP address from various headers
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const vercelForwarded = request.headers.get("x-vercel-forwarded-for")

    // Get all possible IP sources
    const ipSources = {
      "x-forwarded-for": forwarded,
      "x-real-ip": realIp,
      "x-vercel-forwarded-for": vercelForwarded,
      "connection-remote-address": request.ip,
    }

    // Try to get external IP
    let externalIp = null
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json")
      const ipData = await ipResponse.json()
      externalIp = ipData.ip
    } catch (error) {
      console.error("Failed to get external IP:", error)
    }

    return NextResponse.json({
      message: "Current Vercel deployment IP information",
      ipSources,
      externalIp,
      timestamp: new Date().toISOString(),
      vercelRegion: process.env.VERCEL_REGION || "unknown",
    })
  } catch (error) {
    console.error("Error getting IP info:", error)
    return NextResponse.json({ error: "Failed to get IP information" }, { status: 500 })
  }
}
