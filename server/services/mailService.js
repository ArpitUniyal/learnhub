const sendBrevoEmail = async ({
  to,
  subject,
  textContent,
  htmlContent,
}) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_FROM_NAME || "LearnHub",
          email: process.env.BREVO_FROM_EMAIL,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        textContent,
        htmlContent,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("❌ Brevo email error:", data);
      throw new Error(
        data.message || `Brevo API failed with status ${response.status}`
      );
    }

    console.log("✅ Brevo email sent:", data);

    return data;
  } catch (error) {
    console.error("❌ Brevo email error:", error);
    throw error;
  }
};


// Test email
const sendTestEmail = async (email) => {
  return sendBrevoEmail({
    to: email,
    subject: "LearnHub Brevo Test",
    textContent: "Brevo email is working correctly with LearnHub.",
    htmlContent: `
      <h2>LearnHub Brevo Test</h2>
      <p>Brevo email is working correctly with LearnHub.</p>
    `,
  });
};


// Password reset email
const sendPasswordResetEmail = async (email, rawToken) => {
  const resetUrl =
    `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;

  return sendBrevoEmail({
    to: email,
    subject: "Reset your LearnHub password",

    textContent: `You requested a password reset for your LearnHub account.

Use the following link to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.`,

    htmlContent: `
      <h2>Reset your LearnHub password</h2>

      <p>You requested a password reset for your LearnHub account.</p>

      <p>
        <a href="${resetUrl}">
          Reset Password
        </a>
      </p>

      <p>This link will expire in 15 minutes.</p>

      <p>
        If you did not request a password reset,
        you can safely ignore this email.
      </p>
    `,
  });
};


module.exports = {
  sendTestEmail,
  sendPasswordResetEmail,
};
