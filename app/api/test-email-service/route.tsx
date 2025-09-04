import { NextResponse } from "next/server"
import { secureEmailService } from "@/lib/secure-email-system"

export async function POST() {
  try {
    // Check if required environment variables are set
    const apiKey = process.env.BREVO_API_KEY
    const fromEmail = process.env.FROM_EMAIL || "noreply@writeourheart.com"

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "BREVO_API_KEY environment variable is not configured",
          details: "Email service cannot send emails without the Brevo API key",
        },
        { status: 500 },
      )
    }

    // Test sending an email to a test address
    const testResult = await secureEmailService.sendSecureEmail({
      to: "test@writeourheart.com", // This won't actually send, just tests the API
      subject: "Write Our Heart - Email Service Test",
      html: `
        <h2>Email Service Test</h2>
        <p>This is a test email sent at ${new Date().toISOString()}</p>
        <p>If you receive this, the email service is working correctly.</p>
      `,
      text: "Email service test - if you receive this, the service is working correctly.",
    })

    return NextResponse.json({
      success: testResult.success,
      error: testResult.error,
      apiKeyConfigured: !!apiKey,
      fromEmail: fromEmail,
      stats: secureEmailService.getEmailStats(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Failed to test email service",
      },
      { status: 500 },
    )
  }
}
