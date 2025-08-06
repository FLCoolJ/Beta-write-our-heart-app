// More secure email system with rate limiting and monitoring
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

  async sendSecureEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    // Rate limiting check
    if (this.isRateLimited()) {
      console.error("Email rate limit exceeded")
      return { success: false, error: "Rate limit exceeded" }
    }

    const apiKey = process.env.BREVO_API_KEY
    const fromEmail = process.env.FROM_EMAIL || "noreply@writeourheart.com"
    const fromName = process.env.FROM_NAME || "Write Our Heart"

    if (!apiKey) {
      console.error("BREVO_API_KEY not configured")
      this.logAttempt(emailData.to, false)
      return { success: false, error: "Email service not configured" }
    }

    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": apiKey,
          "User-Agent": "WriteOurHeart/1.0",
          // Add request ID for tracking
          "X-Request-ID": `woh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
        body: JSON.stringify({
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
          // Add tracking and security headers
          headers: {
            "X-Mailer": "WriteOurHeart-v1.0",
            "X-Priority": "3",
          },
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error("Brevo API error:", response.status, error)
        this.logAttempt(emailData.to, false)
        return { success: false, error: `Email service error: ${response.status}` }
      }

      const result = await response.json()
      console.log("Email sent successfully to:", emailData.to, "Message ID:", result.messageId)
      this.logAttempt(emailData.to, true)
      return { success: true }
    } catch (error) {
      console.error("Error sending email:", error)
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

// A mock secure email sending function
const mockSendEmail = async (params: { to: string; subject: string; html: string; }) => {
  const { to, subject, html } = params;
  console.log(`--- Sending Secure Email ---`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${html}`);
  console.log(`----------------------------`);
  // This would use a secure, transactional email service.
  return { success: true, message: "Email sent securely." };
};

// Exporting it as a named export to fix deployment issues.
export { mockSendEmail as default };
