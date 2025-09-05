export function emailHtml({
  firstName,
  verificationCode,
  companyName,
}: {
  firstName: string
  verificationCode: string
  companyName: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Account</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #F59E0B; margin: 0;">✉️ ${companyName}</h1>
      </div>

      <h2 style="color: #333;">Hi ${firstName}!</h2>
      
      <p>Welcome to ${companyName}! We're excited to help you send beautiful, personalized cards to your loved ones.</p>
      
      <p>To complete your account setup, please use this verification code:</p>
      
      <div style="background-color: #FDE047; border: 2px solid #F59E0B; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="font-size: 32px; font-weight: bold; margin: 0; color: #000; letter-spacing: 4px;">${verificationCode}</h1>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Enter this code on the verification page</p>
      </div>
      
      <p>This code will expire in 15 minutes for security purposes.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <h3 style="color: #F59E0B;">What's next?</h3>
        <ul style="color: #666;">
          <li>Add your family and friends as "Hearts"</li>
          <li>Create personalized messages with our AI assistant</li>
          <li>We'll print and mail beautiful cards for you</li>
          <li>Never miss another special occasion!</li>
        </ul>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #999;">
        If you didn't create an account with ${companyName}, please ignore this email.
      </p>
      
    </body>
    </html>
  `
}
