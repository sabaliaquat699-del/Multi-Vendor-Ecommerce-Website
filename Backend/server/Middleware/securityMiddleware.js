// ======================================================
// securityMiddleware.js
//
// Hand-rolled, Express-5-safe replacements for the classic
// express-mongo-sanitize / hpp / xss-clean trio. Those
// older packages try to REASSIGN req.query (`req.query = {}`),
// which Express 5 blocks (req.query is a getter-only
// property there) and would crash the server. These versions
// only MUTATE the existing object in place, which stays safe
// on Express 5 while doing the same job.
// ======================================================

// ----- NoSQL injection guard -----
// Strips any key starting with "$" or containing "." from
// req.body / req.params / req.query, recursively. Stops
// payloads like { "email": { "$ne": null } } from ever
// reaching a Mongoose query.
const stripBadKeys = (obj) => {
  if (!obj || typeof obj !== "object") return;

  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }
    const value = obj[key];
    if (value && typeof value === "object") {
      stripBadKeys(value);
    }
  }
};

export const mongoSanitize = (req, res, next) => {
  stripBadKeys(req.body);
  stripBadKeys(req.params);
  if (req.query && typeof req.query === "object") {
    stripBadKeys(req.query);
  }
  next();
};

// ----- HTTP Parameter Pollution guard -----
// If the same query param is sent twice (?sort=a&sort=b),
// Express turns it into an array. Our routes expect a single
// string, so keep only the LAST value instead of letting an
// array silently reach a controller/query.
export const preventHpp = (req, res, next) => {
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      if (Array.isArray(req.query[key])) {
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    }
  }
  next();
};

// ----- Basic stored/reflected XSS guard -----
// Strips <script> tags, inline event handlers (onclick=...),
// and javascript: URIs from every string field in req.body.
// This is defense-in-depth — React already escapes output by
// default on the frontend, this just protects the stored data.
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /on\w+\s*=\s*"[^"]*"/gi,
  /on\w+\s*=\s*'[^']*'/gi,
  /javascript:/gi,
];

const cleanString = (value) => {
  let cleaned = value;
  for (const pattern of XSS_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned;
};

const cleanObject = (obj) => {
  if (!obj || typeof obj !== "object") return;

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === "string") {
      obj[key] = cleanString(value);
    } else if (value && typeof value === "object") {
      cleanObject(value);
    }
  }
};

export const xssClean = (req, res, next) => {
  cleanObject(req.body);
  next();
};