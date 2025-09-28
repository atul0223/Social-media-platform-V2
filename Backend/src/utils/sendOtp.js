import User from "../models/user.model.js";
import { Resend } from "resend";

const sendOtp = async (email) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // You can change this to your verified sender
      to: email,
      subject: "Verification Code",
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    });

    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          otp,
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // optional expiry
        },
      }
    );
  } catch (error) {
    console.error("Resend email failed:", error);
    throw new Error("Failed to send OTP. Please try again later.");
  }
};

export default sendOtp;