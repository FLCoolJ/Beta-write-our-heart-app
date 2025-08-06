import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Check if required environment variables are set
    if (!process.env.TEMPLATED_API_KEY || !process.env.TEMPLATED_TEMPLATE_ID) {
      return NextResponse.json(
        {
          error: "Templated.io integration not configured",
          details: "Please set TEMPLATED_API_KEY and TEMPLATED_TEMPLATE_ID environment variables",
        },
        { status: 500 },
      )
    }

    // Lazy load the integration to avoid build-time errors
    const { templatedIntegration } = await import("@/lib/templated-integration")

    const body = await request.json()
    const { occasion, recipient, frontImage, insideText, heartId } = body

    if (!occasion || !recipient || !frontImage || !insideText) {
      return NextResponse.json(
        { error: "Missing required fields: occasion, recipient, frontImage, insideText" },
        { status: 400 },
      )
    }

    // Generate card with Templated.io
    const cardResult = await templatedIntegration.generateCard({
      frontImage,
      insideText,
      occasion,
      recipient,
    })

    // If the card is still processing, we might need to poll for completion
    let finalResult = cardResult
    if (cardResult.status === "processing") {
      // Poll for completion (with timeout)
      const maxAttempts = 30 // 30 seconds max
      let attempts = 0

      while (finalResult.status === "processing" && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second
        finalResult = await templatedIntegration.getCardStatus(cardResult.id)
        attempts++
      }
    }

    if (finalResult.status === "failed") {
      return NextResponse.json({ error: `Card generation failed: ${finalResult.error}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      cardId: finalResult.id,
      status: finalResult.status,
      downloadUrl: finalResult.downloadUrl,
      previewUrl: finalResult.previewUrl,
      printReady: true,
      fedexSpecs: true,
      specifications: {
        width: "10 inches",
        height: "7 inches",
        dpi: 300,
        format: "PDF",
        foldLine: "5 inches from left",
      },
    })
  } catch (error) {
    console.error("Card generation error:", error)
    return NextResponse.json(
      {
        error: "Card generation failed",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
