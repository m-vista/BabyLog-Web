import express from "express";
import {
  createBottle,
  getBottlesByRange,
  getLatestBottle,
  getBottleByID,
  updateBottle,
} from "../models/bottle-model.mjs";

const router = express.Router();

router.use((req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      message: "Please log in.",
    });
  }

  next();
});

function validateBottle(data) {
  if (
    typeof data.startTime !== "string" ||
    !Number.isFinite(Date.parse(data.startTime))
  ) {
    return "Enter a valid date and time.";
  }

  const amounts = [
    data.breastMilkAmountMl,
    data.formulaAmountMl,
    data.unspecifiedAmountMl,
  ];

  if (
    amounts.some((amount) => !Number.isFinite(amount) || amount < 0) ||
    !Number.isFinite(amounts.reduce((total, amount) => total + amount, 0)) ||
    amounts.reduce((total, amount) => total + amount, 0) <= 0
  ) {
    return "Enter a valid milk amount greater than zero.";
  }

  if (typeof data.notes !== "string") {
    return "Note must be text.";
  }

  return null;
}

function prepareBottle(data) {
  return {
    startTime: new Date(data.startTime).toISOString(),
    breastMilkAmountMl: data.breastMilkAmountMl,
    formulaAmountMl: data.formulaAmountMl,
    unspecifiedAmountMl: data.unspecifiedAmountMl,
    notes: data.notes.trim(),
  };
}

router.post("/", (req, res) => {
  const data = {
    unspecifiedAmountMl: 0,
    notes: "",
    ...req.body,
  };

  const error = validateBottle(data);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const bottle = createBottle(
    req.session.user.id,
    prepareBottle(data)
  );

  res.status(201).json(bottle);
});

router.get("/latest", (req, res) => {
  const bottle = getLatestBottle(req.session.user.id);
  res.json(bottle);
});

router.get("/", (req, res) => {
  const { start, end } = req.query;

  if (
    typeof start !== "string" ||
    typeof end !== "string" ||
    !Number.isFinite(Date.parse(start)) ||
    !Number.isFinite(Date.parse(end)) ||
    Date.parse(start) >= Date.parse(end)
  ) {
    return res.status(400).json({
      message: "Enter a valid date range.",
    });
  }

  const bottles = getBottlesByRange(
    req.session.user.id,
    new Date(start).toISOString(),
    new Date(end).toISOString()
  );

  res.json(bottles);
});

router.patch("/:id", (req, res) => {
  const userID = req.session.user.id;
  const existing = getBottleByID(userID, req.params.id);

  if (!existing) {
    return res.status(404).json({
      message: "Bottle record not found.",
    });
  }

  const data = {
    ...existing,
    ...req.body,
  };

  const error = validateBottle(data);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const bottle = updateBottle(
    userID,
    req.params.id,
    prepareBottle(data)
  );

  res.json(bottle);
});

export default router;