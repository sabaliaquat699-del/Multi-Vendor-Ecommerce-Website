import readline from "readline";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

const run = async () => {
  try {
    await connectDB();

    // Database mein jitne admins hain, un ki emails (spaces/case samet)
    const all = await Admin.find({}).select("email");
    console.log("Admins in DB:", all.map((a) => JSON.stringify(a.email)));

    const email = (await ask("\nEmail jo login mein likhi: ")).trim().toLowerCase();
    const password = await ask("Password: ");

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      console.log("\n❌ Is email ka admin DB mein nahi mila (email mismatch).");
      process.exit(0);
    }

    const ok = await bcrypt.compare(password, admin.password);
    console.log(ok
      ? "\n✅ Email aur password dono sahi hain. Masla login controller mein hai."
      : "\n❌ Email mil gayi lekin password match nahi hua (double hash ya galat password).");
    process.exit(0);
  } catch (e) {
    console.error("Failed:", e.message);
    process.exit(1);
  } finally {
    rl.close();
  }
};

run();