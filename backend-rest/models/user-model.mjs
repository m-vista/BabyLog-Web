import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import db from "../database.mjs";

export function createUser(name, email, password) {
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    throw new Error("Name, email, and password are required.");
  }

  name = name.trim();
  email = email.trim().toLowerCase();

  if (!name || !email.includes("@") || password.length < 6) {
    throw new Error(
      "Enter a name, valid email, and password of at least 6 characters."
    );
  }

  const existingUser = db.prepare(
    "SELECT id FROM users WHERE email = ?"
  ).get(email);

  if (existingUser) {
    throw new Error("This email already has an account.");
  }

  const id = randomUUID();
  const salt = randomBytes(16).toString("hex");
  const passwordHash = scryptSync(password, salt, 64).toString("hex");
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO users
      (id, name, email, passwordHash, salt, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name, email, passwordHash, salt, createdAt);

  return { id, name, email };
}

export function authenticateUser(email, password) {
  if (typeof email !== "string" || typeof password !== "string") {
    return null;
  }

  email = email.trim().toLowerCase();

  const user = db.prepare(
    "SELECT * FROM users WHERE email = ?"
  ).get(email);

  if (!user) {
    return null;
  }

  const enteredHash = scryptSync(password, user.salt, 64);
  const storedHash = Buffer.from(user.passwordHash, "hex");

  if (!timingSafeEqual(enteredHash, storedHash)) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}