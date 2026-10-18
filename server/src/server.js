const config = require("./config/env");
const { connectDb, closeDb } = require("./db/mongo");
const app = require("./app");

const SHUTDOWN_TIMEOUT_MS = 10000;

let server = null;
let shuttingDown = false;

async function start() {
  try {
    await connectDb();
    console.log(`MongoDB connected (database: ${config.dbName})`);
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    await closeDb().catch(() => {});
    process.exit(1);
  }

  server = app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
  server.on("error", async (error) => {
    console.error("HTTP server error:", error.message);
    await closeDb().catch(() => {});
    process.exit(1);
  });
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, closing HTTP server and MongoDB connection...`);

  const forceExit = setTimeout(() => {
    console.error("Shutdown timed out; forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
      server.closeIdleConnections?.();
    }
    await closeDb();
    console.log("Shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error.message);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();
