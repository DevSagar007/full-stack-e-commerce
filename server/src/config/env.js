const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const REQUIRED = ["PORT", "MONGODB_URI", "DB_NAME", "FB_SERVICE_KEY", "CLIENT_ORIGIN"];

/** Prints only variable names, never values, then stops the process. */
function fail(problems) {
  console.error("Invalid environment configuration:");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("See .env.example for the expected variables.");
  process.exit(1);
}

function loadConfig() {
  const env = process.env;
  const problems = REQUIRED.filter((name) => !env[name]?.trim()).map((name) => `${name} is missing`);
  if (problems.length > 0) fail(problems);

  const port = Number(env.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    problems.push("PORT must be an integer between 1 and 65535");
  }

  if (!/^mongodb(\+srv)?:\/\//.test(env.MONGODB_URI.trim())) {
    problems.push("MONGODB_URI must start with mongodb:// or mongodb+srv://");
  }

  const dbName = env.DB_NAME.trim();
  if (dbName === "zap_shift_db") {
    problems.push("DB_NAME must not be zap_shift_db (legacy parcel data)");
  }

  let firebaseServiceAccount;
  try {
    firebaseServiceAccount = JSON.parse(Buffer.from(env.FB_SERVICE_KEY.trim(), "base64").toString("utf8"));
    if (!firebaseServiceAccount.project_id) throw new Error();
  } catch {
    problems.push("FB_SERVICE_KEY must be a base64-encoded Firebase service-account JSON");
  }

  const clientOrigins = env.CLIENT_ORIGIN.split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
  if (clientOrigins.length === 0) problems.push("CLIENT_ORIGIN must contain at least one origin");

  if (problems.length > 0) fail(problems);

  return Object.freeze({
    port,
    mongoUri: env.MONGODB_URI.trim(),
    dbName,
    firebaseServiceAccount,
    clientOrigins,
    isProduction: env.NODE_ENV === "production",
  });
}

module.exports = loadConfig();
