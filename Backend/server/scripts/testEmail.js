import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import sendEmail from "../utils/sendEmail.js";

// ==========================================
// LOAD .env FROM server/.env
// ==========================================

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "..", ".env"),
});

// ==========================================
// TEST EMAIL
// ==========================================

try {
  console.log("=================================");
  console.log("STARTING EMAIL TEST");
  console.log("=================================");

  console.log(
    "EMAIL_USER:",
    process.env.EMAIL_USER
      ? process.env.EMAIL_USER
      : "MISSING"
  );

  console.log(
    "EMAIL_HOST:",
    process.env.EMAIL_HOST
      ? process.env.EMAIL_HOST
      : "MISSING"
  );

  console.log(
    "EMAIL_PORT:",
    process.env.EMAIL_PORT
      ? process.env.EMAIL_PORT
      : "MISSING"
  );

  // Do NOT print EMAIL_PASS

  await sendEmail({
    // CHANGE THIS
    to: "YOUR_REAL_EMAIL@gmail.com",

    subject: "NextTech Email Test",

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          padding: 20px;
        "
      >

        <h2>
          NextTech Email Test
        </h2>

        <p>
          If you received this email,
          your SMTP configuration is working correctly.
        </p>

      </div>
    `,
  });

  console.log("=================================");
  console.log("EMAIL TEST SUCCESSFUL");
  console.log("=================================");
} catch (error) {
  console.error("=================================");
  console.error("EMAIL TEST FAILED");
  console.error("=================================");

  console.error("Message:", error.message);
  console.error("Code:", error.code);
  console.error("Response:", error.response);
}

// ==========================================
// EXIT
// ==========================================

process.exit(0);