export function otpEmailTemplate(otp: string, email: string) {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; background: #f9f9f9; padding:20px;">
      <div style="max-width:500px;margin:auto;background:white;padding:20px;border-radius:8px;">
        <h2>Email Verification</h2>
        <p>Hello <b>${email}</b>,</p>
        <p>Use the OTP below to verify your email:</p>
        <h1 style="letter-spacing:4px;color:#007bff;">${otp}</h1>
        <p>This code expires in <b>10 minutes</b>.</p>
      </div>
    </body>
  </html>
  `;
}
