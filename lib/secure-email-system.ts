interface EmailAttempt {
  timestamp: number
  ip?: string
  success: boolean
  recipient: string
}

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

class SecureEmailService {
  private attempts: EmailAttempt[] = []
  private readonly maxAttemptsPerHour = 100
  private readonly maxAttemptsPerMinute = 10

  private isRateLimited(): boolean {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000
    const oneMinuteAgo = now - 60 * 1000

    // Clean old attempts
    this.attempts = this.attempts.filter((attempt) => attempt.timestamp > oneHourAgo)

    const attemptsLastHour = this.attempts.length
    const attemptsLastMinute = this.attempts.filter((attempt) => attempt.timestamp > oneMinuteAgo).length

    return attemptsLastHour >= this.maxAttemptsPerHour || attemptsLastMinute >= this.maxAttemptsPerMinute
  }

  private logAttempt(recipient: string, success: boolean, ip?: string) {
    this.attempts.push({
      timestamp: Date.now(),
      ip,
      success,
      recipient,
    })
  }

  async sendSecureEmail(emailData: EmailData): Promise<{ success: boolean; error?: string; data?: any }> {
    // Rate limiting check
    if (this.isRateLimited()) {
      console.log("[v0] Email rate limited for:", emailData.to)
      return { success: false, error: "Rate limit exceeded" }
    }

    const apiKey = process.env.BREVO_API_KEY
    const fromEmail = process.env.FROM_EMAIL || "noreply@writeourheart.com"
    const fromName = process.env.FROM_NAME || "Write Our Heart"

    console.log("[v0] Email service config check:")
    console.log("[v0] API Key present:", !!apiKey)
    console.log("[v0] From Email:", fromEmail)
    console.log("[v0] From Name:", fromName)
    console.log("[v0] To Email:", emailData.to)

    if (!apiKey) {
      console.log("[v0] Missing Brevo API key")
      this.logAttempt(emailData.to, false)
      return { success: false, error: "Email service not configured" }
    }

    try {
      const requestBody = {
        sender: {
          name: fromName,
          email: fromEmail,
        },
        to: [
          {
            email: emailData.to,
          },
        ],
        subject: emailData.subject,
        htmlContent: emailData.html,
        textContent: emailData.text || emailData.html.replace(/<[^>]*>/g, ""),
        headers: {
          "X-Mailer": "WriteOurHeart-v1.0",
          "X-Priority": "3",
        },
      }

      console.log("[v0] About to call Brevo API with request body:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": apiKey,
          "User-Agent": "WriteOurHeart/1.0",
          "X-Request-ID": `woh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] Brevo API response status:", response.status)
      console.log("[v0] Brevo API response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Brevo API error response:", errorText)
        this.logAttempt(emailData.to, false)
        return { success: false, error: `Email service error: ${response.status} - ${errorText}` }
      }

      const result = await response.json()
      console.log("[v0] Brevo API success response:", result)
      this.logAttempt(emailData.to, true)
      return { success: true, data: result }
    } catch (error) {
      console.log("[v0] Brevo API call exception:", error)
      this.logAttempt(emailData.to, false)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  getEmailStats() {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000
    const recentAttempts = this.attempts.filter((attempt) => attempt.timestamp > oneHourAgo)

    return {
      totalAttempts: recentAttempts.length,
      successfulAttempts: recentAttempts.filter((a) => a.success).length,
      failedAttempts: recentAttempts.filter((a) => !a.success).length,
      successRate:
        recentAttempts.length > 0 ? (recentAttempts.filter((a) => a.success).length / recentAttempts.length) * 100 : 0,
    }
  }
}

export const secureEmailService = new SecureEmailService()
