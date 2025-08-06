interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to send email")
    }

    return { success: true }
  } catch (error) {
    console.error("Email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// A mock email sending function
export const sendWelcomeEmailMock = async (email: string, name: string) => {
  console.log(`--- Sending Welcome Email ---`);
  console.log(`To: ${email}`);
  console.log(`Name: ${name}`);
  console.log(`Subject: Welcome to Write Our Heart!`);
  console.log(`Body: Hi ${name}, thank you for joining us.`);
  console.log(`-----------------------------`);
  // In a real app, you would use a service like Brevo, SendGrid, etc.
  // e.g., await brevo.send({ to: email, subject: 'Welcome', ... })
  return { success: true, messageId: `mock_${Date.now()}` };
};

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
): Promise<{ success: boolean; error?: string }> {
  const welcomeEmailData = {
    to: userEmail,
    subject: "Welcome to Write Our Heart!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">Welcome to Write Our Heart, ${userName}!</h1>
        <p>Thank you for joining our community of heartfelt card senders.</p>
        <p>You can now create personalized greeting cards for your loved ones.</p>
        <p>Get started by adding your first recipient!</p>
        <p>Best regards,<br>The Write Our Heart Team</p>
      </div>
    `,
    from: process.env.FROM_EMAIL || "noreply@writeourheart.com",
  }

  // Use the mock function for demonstration purposes
  return await sendWelcomeEmailMock(userEmail, userName);
}

export async function sendEmailWithFallback(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
  // Try primary email service
  const primaryResult = await sendEmail(emailData)

  if (primaryResult.success) {
    return primaryResult
  }

  // If primary fails, log the error and return graceful failure
  console.error("Primary email service failed:", primaryResult.error)

  return {
    success: false,
    error: "Email service temporarily unavailable. Please try again later.",
  }
}

export async function sendNotificationEmail(emailData: EmailData): Promise<boolean> {
  try {
    const result = await sendEmail({
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      from: emailData.from,
    })

    return result.success
  } catch (error) {
    console.error("Failed to send notification email:", error)
    return false
  }
}

// Exporting the mock function as a default export for demonstration
export { sendWelcomeEmailMock as default };
