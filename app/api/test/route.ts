import { NextResponse } from "next/server"

export async function GET() {
  console.log("[v0] Test API route called")
  return NextResponse.json({
    message: "API routes are working",
    timestamp: new Date().toISOString(),
  })
}

export async function POST() {
  console.log("[v0] Test API POST route called")
  return NextResponse.json({
    message: "POST API routes are working",
    timestamp: new Date().toISOString(),
  })
}
