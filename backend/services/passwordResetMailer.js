const nodemailer = require("nodemailer");

function getMailConfiguration() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASSWORD,
    MAIL_FROM,
    FRONTEND_URL
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !MAIL_FROM ||
    !FRONTEND_URL ||
    Boolean(SMTP_USER) !== Boolean(SMTP_PASSWORD)
  ) {
    return null;
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return null;
  }

  let frontendUrl;
  try {
    frontendUrl = new URL(FRONTEND_URL);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(frontendUrl.protocol)) {
    return null;
  }

  return {
    host: SMTP_HOST,
    port,
    secure: SMTP_SECURE === "true",
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
    from: MAIL_FROM,
    frontendUrl
  };
}

function isConfigured() {
  return getMailConfiguration() !== null;
}

async function sendPasswordResetEmail(email, token) {
  const config = getMailConfiguration();
  if (!config) {
    throw new Error("Password reset email is not configured.");
  }

  const resetUrl = new URL("/reset-password", config.frontendUrl);
  resetUrl.hash = new URLSearchParams({ token }).toString();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "Reset your Student Course Management password",
    text: `Use this link within 15 minutes to reset your password:\n\n${resetUrl.toString()}\n\nIf you did not request a reset, you can ignore this email.`
  });
}

module.exports = {
  isConfigured,
  sendPasswordResetEmail
};
