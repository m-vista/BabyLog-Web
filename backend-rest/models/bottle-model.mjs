import { randomUUID } from "node:crypto";
import db from "../database.mjs";

function createBottle(userID, data) {
  const bottle = {
    id: randomUUID(),
    userID,
    startTime: data.startTime,
    breastMilkAmountMl: data.breastMilkAmountMl,
    formulaAmountMl: data.formulaAmountMl,
    unspecifiedAmountMl: data.unspecifiedAmountMl,
    notes: data.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO bottle_feeds (
      id, userID, startTime,
      breastMilkAmountMl, formulaAmountMl, unspecifiedAmountMl,
      notes, createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    bottle.id,
    bottle.userID,
    bottle.startTime,
    bottle.breastMilkAmountMl,
    bottle.formulaAmountMl,
    bottle.unspecifiedAmountMl,
    bottle.notes,
    bottle.createdAt,
    bottle.updatedAt
  );

  return bottle;
}

function getBottlesByRange(userID, start, end) {
  return db.prepare(`
    SELECT * FROM bottle_feeds
    WHERE userID = ? AND startTime >= ? AND startTime < ?
    ORDER BY startTime DESC
  `).all(userID, start, end);
}

function getLatestBottle(userID) {
  return db.prepare(`
    SELECT * FROM bottle_feeds
    WHERE userID = ?
    ORDER BY startTime DESC
    LIMIT 1
  `).get(userID) ?? null;
}

function getBottleByID(userID, id) {
  return db.prepare(`
    SELECT * FROM bottle_feeds
    WHERE userID = ? AND id = ?
  `).get(userID, id) ?? null;
}

function updateBottle(userID, id, data) {
  const existing = getBottleByID(userID, id);

  if (!existing) {
    return null;
  }

  const bottle = {
    ...existing,
    startTime: data.startTime,
    breastMilkAmountMl: data.breastMilkAmountMl,
    formulaAmountMl: data.formulaAmountMl,
    unspecifiedAmountMl: data.unspecifiedAmountMl,
    notes: data.notes,
    updatedAt: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE bottle_feeds
    SET startTime = ?,
        breastMilkAmountMl = ?,
        formulaAmountMl = ?,
        unspecifiedAmountMl = ?,
        notes = ?,
        updatedAt = ?
    WHERE userID = ? AND id = ?
  `).run(
    bottle.startTime,
    bottle.breastMilkAmountMl,
    bottle.formulaAmountMl,
    bottle.unspecifiedAmountMl,
    bottle.notes,
    bottle.updatedAt,
    userID,
    id
  );

  return bottle;
}

export {
  createBottle,
  getBottlesByRange,
  getLatestBottle,
  getBottleByID,
  updateBottle,
};