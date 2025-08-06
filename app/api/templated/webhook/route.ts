import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log the webhook data for debugging
    console.log("Templated.io webhook received:", body)

    // Here you would typically:
    // 1. Verify the webhook signature
    // 2. Update your database with the card status
    // 3. Notify the user if the card is complete
    // 4. Handle any errors

    const { id, status, download_url, error } = body

    if (status === "completed") {
      console.log(`Card ${id} completed successfully. Download URL: ${download_url}`)
      // TODO: Update database, send notification, etc.
    } else if (status === "failed") {
      console.error(`Card ${id} failed: ${error}`)
      // TODO: Handle failure, notify user, etc.
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
