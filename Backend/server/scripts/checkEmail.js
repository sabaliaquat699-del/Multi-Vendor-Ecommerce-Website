import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import Customer from "../models/Customer.js";
import Vendor from "../models/Vendor.js";
import Admin from "../models/Admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const email = (process.argv[2] || "").trim().toLowerCase();

await connectDB();

console.log("\n--- Sab Customers ---");
console.log(await Customer.find({}).select("email isVerified"));
console.log("\n--- Sab Vendors ---");
console.log(await Vendor.find({}).select("email isVerified vendorStatus"));

if (email) {
  console.log(`\n--- Check: ${email} ---`);
  console.log("Customer:", await Customer.findOne({ email }).select("email isVerified"));
  console.log("Vendor:  ", await Vendor.findOne({ email }).select("email isVerified vendorStatus"));
  console.log("Admin:   ", await Admin.findOne({ email }).select("email isVerified"));
}
process.exit(0);