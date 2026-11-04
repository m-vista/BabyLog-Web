import express from "express";
import {
  createUser,
  authenticateUser,
} from "../models/user-model.mjs";

const router = express.Router();

function startSession(req, res, user, status) {
  req.session.regenerate((error) => {
    if (error) {
      return res.status(500).json({
        message: "Could not start session.",
      });
    }

    req.session.user = user;

    req.session.save((error) => {
      if (error) {
        return res.status(500).json({
          message: "Could not save session.",
        });
      }

      res.status(status).json(user);
    });
  });
}

router.post("/register", (req, res) => {
  const { name, email, password } = req.body ?? {};

  try {
    const user = createUser(name, email, password);
    startSession(req, res, user, 201);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body ?? {};
  const user = authenticateUser(email, password);

  if (!user) {
    return res.status(401).json({
      message: "Incorrect email or password.",
    });
  }

  startSession(req, res, user, 200);
});

router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      message: "Please log in.",
    });
  }

  res.json(req.session.user);
});

router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Could not log out.",
      });
    }

    res.clearCookie("connect.sid");
    res.json({ message: "Logged out." });
  });
});

export default router;