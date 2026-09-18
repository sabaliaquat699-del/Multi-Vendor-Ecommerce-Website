/*import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads folder exists
const uploadDir = "uploads/profile-images";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ======================================================
// STORAGE CONFIG
// Saves file to disk with a unique name so two users
// uploading "photo.jpg" don't overwrite each other.
// ======================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// ======================================================
// FILE FILTER
// Only allow actual image types — blocks someone
// uploading a .exe or .php renamed to look like an image.
// ======================================================
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed."
      ),
      false
    );
  }
};

// ======================================================
// EXPORTED UPLOAD MIDDLEWARE
// Limit: 5MB max file size
// ======================================================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;*/
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";

// ======================================================
// SERVERLESS-SAFE UPLOAD DIRECTORY
// Vercel's filesystem is read-only except /tmp.
// Files here are NOT permanent — use Cloudinary/S3 for
// real production image storage.
// ======================================================
const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), "profile-images")
  : "uploads/profile-images";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ======================================================
// STORAGE CONFIG
// Saves file to disk with a unique name so two users
// uploading "photo.jpg" don't overwrite each other.
// ======================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// ======================================================
// FILE FILTER
// Only allow actual image types — blocks someone
// uploading a .exe or .php renamed to look like an image.
// ======================================================
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed."
      ),
      false
    );
  }
};

// ======================================================
// EXPORTED UPLOAD MIDDLEWARE
// Limit: 5MB max file size
// ======================================================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;