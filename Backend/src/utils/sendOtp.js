import nodemailer from "nodemailer";
import User from "../models/user.model.js";

const sendOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000);

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER, // your Brevo SMTP username
      pass: process.env.BREVO_SMTP_PASS, // your Brevo SMTP password
    },
  });

  try {
    await transporter.sendMail({
      from: '"Loveable" <no-reply@brevo.com>', // shared sender domain
      to: email,
      subject: "Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🔐 Email Verification</h2>
          <p>Your OTP is:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f0f0f0; padding: 10px; border-radius: 6px; text-align: center;">
            ${otp}
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share it.</p>
        </div>
      `,
    });

    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          otp,
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      }
    );
  } catch (error) {
    console.error("Brevo email failed:", error);
    throw new Error("Failed to send OTP. Please try again later.");
  }
};

export default sendOtp;