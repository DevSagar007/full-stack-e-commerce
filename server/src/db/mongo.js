const { MongoClient } = require("mongodb");
const config = require("../config/env");

const client = new MongoClient(config.mongoUri, {
  appName: "ecommerce-api",
  serverSelectionTimeoutMS: 10000,
});

let db = null;

async function connectDb() {
  await client.connect();
  db = client.db(config.dbName);
  await db.command({ ping: 1 });
  return db;
}

function getDb() {
  if (!db) throw new Error("Database is not connected; call connectDb() first");
  return db;
}

async function pingDb() {
  await getDb().command({ ping: 1 });
}

async function closeDb() {
  db = null;
  await client.close();
}

module.exports = { client, connectDb, getDb, pingDb, closeDb };
