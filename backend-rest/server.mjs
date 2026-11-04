import express from "express";
import session from "express-session";
import { randomBytes } from "node:crypto";
import "./database.mjs";
import userRouter from "./controllers/user-controller.mjs";
import bottleRouter from "./controllers/bottle-controller.mjs"

const app = express();

app.use(express.json());

app.use(
  session({
    secret: randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use("/api/auth", userRouter);
app.use("/api/bottles", bottleRouter);

app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.listen(3000, () => {
  console.log("Backend running at http://localhost:3000");
});