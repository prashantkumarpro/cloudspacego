import 'dotenv/config'
import { Resend } from 'resend'
import OTP from '../models/otpModel.js'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOtpService (email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString()

  // Upsert OTP (replace if it already exists)
  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true }
  )

  const html = `
  <div style="
    margin: 0;
    padding: 40px 20px;
    background-color: #f4f6f8;
    font-family: Arial, Helvetica, sans-serif;
  ">
    <div style="
      max-width: 480px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px 32px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    ">

      <h1 style="
        margin: 0 0 8px;
        color: #111827;
        font-size: 28px;
        font-weight: 700;
      ">
        dataDock
      </h1>

      <p style="
        margin: 0 0 30px;
        color: #6b7280;
        font-size: 14px;
      ">
        Email Verification
      </p>

      <h2 style="
        margin: 0 0 12px;
        color: #111827;
        font-size: 20px;
      ">
        Verify your email address
      </h2>

      <p style="
        margin: 0 0 24px;
        color: #6b7280;
        font-size: 15px;
        line-height: 1.6;
      ">
        Use the verification code below to continue with your dataDock account.
      </p>

      <div style="
        display: inline-block;
        padding: 16px 28px;
        background-color: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        margin-bottom: 24px;
      ">
        <span style="
          color: #111827;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 8px;
        ">
          ${otp}
        </span>
      </div>

      <p style="
        margin: 0 0 8px;
        color: #6b7280;
        font-size: 13px;
      ">
        This code is valid for <strong>10 minutes</strong>.
      </p>

      <p style="
        margin: 0;
        color: #9ca3af;
        font-size: 12px;
        line-height: 1.5;
      ">
        If you didn't request this code, you can safely ignore this email.
      </p>

      <div style="
        margin-top: 32px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
      ">
        <p style="
          margin: 0;
          color: #9ca3af;
          font-size: 12px;
        ">
          © ${new Date().getFullYear()} dataDock. All rights reserved.
        </p>
      </div>

    </div>
  </div>
`

  await resend.emails.send({
    from: 'dataDock <otp@mail.prashantkumar.dev>',
    to: email,
    subject: 'dataDock  OTP',
    html
  })

  return { success: true, message: `OTP sent successfully on ${email}` }
}
