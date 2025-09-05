import { NextResponse } from "next/server"

export async function GET() {
  console.log("[v0] Test signup endpoint called")
  return NextResponse.json({
    message: "API routes are working",
    timestamp: new Date().toISOString(),
    env: {
      hasBrevoKey: !!process.env.BREVO_API_KEY,
      hasRegisteredUsers: !!process.env.REGISTERED_USERS,
      nodeEnv: process.env.NODE_ENV,
    },
  })
}

export async function POST() {
  console.log("[v0] Test signup POST called")
  return NextResponse.json({
    message: "POST method working",
    timestamp: new Date().toISOString(),
  })
}
