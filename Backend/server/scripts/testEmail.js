import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import sendEmail from "../utils/sendEmail.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

try {
  await sendEmail({
    to: "apni-email@gmail.com",   // yahan apni real email likhein
    subject: "Test email",
    html: "<p>Agar yeh mil gayi to email setup theek hai.</p>",
  });
  console.log("✅ Email bhej di gayi");
} catch (e) {
  console.error("❌ Failed:", e.code, e.message);
}
process.exit(0);