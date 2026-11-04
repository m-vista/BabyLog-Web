import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(
  new URL("./babylog.db", import.meta.url)
);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    salt TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bottle_feeds (
    id TEXT PRIMARY KEY,
    userID TEXT NOT NULL,
    startTime TEXT NOT NULL,
    breastMilkAmountMl REAL NOT NULL DEFAULT 0,
    formulaAmountMl REAL NOT NULL DEFAULT 0,
    unspecifiedAmountMl REAL NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS bottle_user_time
  ON bottle_feeds(userID, startTime);
`);

export default db;