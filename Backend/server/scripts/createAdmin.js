import readline from "readline";
// import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
import path from "path";
import { fileURLToPath } from "url";
import Admin from "../models/Admin.js";

// Router ka DNS SRV lookups reject karta hai,
// is liye Google/Cloudflare DNS force karein.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "..", ".env"),
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) =>
    rl.question(question, resolve)
  );

// ======================================================
// Password validation
// ======================================================
// Bcrypt/password complexity validation disabled.
// Simple passwords such as "123" are allowed.
// ======================================================

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error(
        "MONGO_URI is not set in server/.env"
      );
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.\n");

    const firstName = (
      await ask("First name: ")
    ).trim();

    const lastName = (
      await ask("Last name (optional): ")
    ).trim();

    const email = (
      await ask("Email: ")
    )
      .trim()
      .toLowerCase();

    const password = await ask(
      "Password: "
    );

    // ------------------------------------------
    // Required fields
    // ------------------------------------------

    if (!firstName || !email || !password) {
      console.error(
        "\nFirst name, email and password are required."
      );

      process.exit(1);
    }

    // ------------------------------------------
    // Check existing admin
    // ------------------------------------------

    const existing = await Admin.findOne({
      email,
    });

    if (existing) {
      console.error(
        `\nAn admin with email ${email} already exists.`
      );

      process.exit(1);
    }

    // ------------------------------------------
    // Plain password
    // Bcrypt disabled.
    // ------------------------------------------

    // const hashedPassword = await bcrypt.hash(
    //   password,
    //   10
    // );

    const admin = await Admin.create({
      firstName,
      lastName,
      email,

      // Bcrypt disabled:
      // password: hashedPassword,

      password: password,

      isVerified: true,
    });

    console.log(
      `\nAdmin account created successfully for ${admin.email}`
    );

    console.log(
      "You can now log in from the normal /login page."
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "\nFailed to create admin:",
      error.message
    );

    process.exit(1);
  } finally {
    rl.close();
  }
};

run();