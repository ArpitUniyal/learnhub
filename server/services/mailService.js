const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendTestEmail = async () => {
  const info = await transporter.sendMail({
    from: `"LearnHub" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    subject: "LearnHub SMTP Test",
    text: "Gmail SMTP is working correctly.",
  });

  console.log("✅ Test email sent:", info.messageId);
};

const sendPasswordResetEmail = async (email, rawToken) => {
  const resetUrl =
    `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;

  await transporter.sendMail({
    from: `"LearnHub" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your LearnHub password",
    text: `You requested a password reset for your LearnHub account.

Use the following link to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.`,
    html: `
      <h2>Reset your LearnHub password</h2>
      <p>You requested a password reset for your LearnHub account.</p>

      <p>
        <a href="${resetUrl}">
          Reset Password
        </a>
      </p>

      <p>This link will expire in 15 minutes.</p>

      <p>
        If you did not request a password reset, you can safely ignore this email.
      </p>
    `,
  });
};

module.exports = {
  transporter,
  sendTestEmail,
  sendPasswordResetEmail,
};