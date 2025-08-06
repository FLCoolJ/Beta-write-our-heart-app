import { NextResponse } from "next/server"
import { createOccasionPrompt } from "@/lib/leonardo-integration-production"
import { generatePoetry } from "@/lib/anthropic-production"
import { validateAddress } from "@/lib/usps-production"
import { sendEmail } from "@/lib/email-system"
import { stripe } from "@/lib/stripe-production"

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {} as Record<string, any>,
  }

  // Test Stripe
  try {
    const products = await stripe.products.list({ limit: 1 })
    results.tests.stripe = {
      status: "success",
      message: "Connected successfully",
      productCount: products.data.length,
    }
  } catch (error) {
    results.tests.stripe = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }

  // Test Leonardo.ai
  try {
    const prompt = createOccasionPrompt("birthday", "Test", "friend")
    // Don't actually generate image in test, just validate API key format
    if (process.env.LEONARDO_API_KEY) {
      results.tests.leonardo = {
        status: "success",
        message: "API key configured",
        promptGenerated: prompt.substring(0, 100) + "...",
      }
    } else {
      results.tests.leonardo = {
        status: "error",
        message: "API key not configured",
      }
    }
  } catch (error) {
    results.tests.leonardo = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }

  // Test Anthropic
  try {
    const poetry = await generatePoetry({
      recipientName: "Test User",
      relationship: "friend",
      occasion: "birthday",
      tone: "heartfelt",
      personalMessage: "You are an amazing friend",
      wordCount: 80,
    })

    results.tests.anthropic = {
      status: "success",
      message: "Poetry generated successfully",
      wordCount: poetry.totalWords,
      preview: poetry.page2.substring(0, 100) + "...",
    }
  } catch (error) {
    results.tests.anthropic = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }

  // Test USPS
  try {
    const testAddress = {
      address1: "1600 Pennsylvania Avenue NW",
      city: "Washington",
      state: "DC",
      zipCode: "20500",
    }

    const validation = await validateAddress(testAddress)
    results.tests.usps = {
      status: validation.isValid ? "success" : "warning",
      message: validation.isValid ? "Address validated successfully" : validation.error,
      correctedAddress: validation.correctedAddress,
    }
  } catch (error) {
    results.tests.usps = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }

  // Test Email (Brevo)
  try {
    const emailSent = await sendEmail({
      to: "test@writeourheart.com",
      subject: "API Test - Write Our Heart",
      html: `
        <h2>API Connection Test</h2>
        <p>This is a test email sent at ${new Date().toISOString()}</p>
        <p>All systems are being tested for Write Our Heart beta launch.</p>
      `,
    })

    results.tests.email = {
      status: emailSent ? "success" : "error",
      message: emailSent ? "Test email sent successfully" : "Failed to send test email",
    }
  } catch (error) {
    results.tests.email = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }

  // Test Environment Variables
  const requiredEnvVars = [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "LEONARDO_API_KEY",
    "ANTHROPIC_API_KEY",
    "USPS_CONSUMER_KEY",
    "USPS_CONSUMER_SECRET",
    "BREVO_API_KEY",
    "JWT_SECRET",
  ]

  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

  results.tests.environment = {
    status: missingEnvVars.length === 0 ? "success" : "warning",
    message:
      missingEnvVars.length === 0 ? "All environment variables configured" : `Missing: ${missingEnvVars.join(", ")}`,
    configured: requiredEnvVars.length - missingEnvVars.length,
    total: requiredEnvVars.length,
  }

  return NextResponse.json(results, { status: 200 })
}
