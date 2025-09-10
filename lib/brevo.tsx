export async function sendWelcomeEmail(email: string, firstName: string) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Write Our Heart", email: "info@writeourheart.com" },
      to: [{ email, name: firstName }],
      subject: "Welcome to Write Our Heart!",
      htmlContent: `<h1>Welcome ${firstName}!</h1><p>Your account is ready.</p>`,
    }),
  })

  return response.json()
}
