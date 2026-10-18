const express = require("express");
const cors = require("cors");
const config = require("./config/env");
const { pingDb } = require("./db/mongo");
const { notFound, errorHandler } = require("./middleware/error-handler");

const app = express();

app.disable("x-powered-by");

// Only listed origins get CORS headers; other browsers' requests are blocked by the browser.
app.use(
  cors({
    origin: config.clientOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type", "Idempotency-Key"],
  }),
);
app.use(express.json({ limit: "100kb" }));

app.get("/health", async (req, res) => {
  try {
    await pingDb();
    res.json({ status: "ok", db: "up" });
  } catch {
    res.status(503).json({ status: "degraded", db: "down" });
  }
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
