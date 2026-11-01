import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  limit,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const ML_PER_OZ = 29.5735295625;

export async function createBottle({
  startTime,
  breastMilkOz,
  formulaOz,
  notes = "",
}) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in first.");
  }

  const breastMilk = Number(breastMilkOz);
  const formula = Number(formulaOz);

  if (
    !Number.isFinite(breastMilk) ||
    !Number.isFinite(formula) ||
    breastMilk < 0 ||
    formula < 0 ||
    breastMilk + formula <= 0
  ) {
    throw new Error("Enter a valid milk amount greater than zero.");
  }

  const date = new Date(startTime);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Enter a valid date and time.");
  }

  const babyID = user.uid;
  const id = crypto.randomUUID();
  const now = Timestamp.now();

  const bottle = {
    id,
    babyID,
    startTime: Timestamp.fromDate(date),
    breastMilkAmountMl: breastMilk * ML_PER_OZ,
    formulaAmountMl: formula * ML_PER_OZ,
    unspecifiedAmountMl: 0,
    notes: notes.trim(),
    createdByUserID: user.uid,
    createdAt: now,
    updatedAt: now,
  };

  const bottleRef = doc(db, "babies", babyID, "bottleFeeds", id);

  await setDoc(bottleRef, bottle);

  return id;
}

export async function getBottlesByDate(date) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in first.");
  }

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const bottlesRef = collection(
    db,
    "babies",
    user.uid,
    "bottleFeeds"
  );

  const bottlesQuery = query(
    bottlesRef,
    where("startTime", ">=", Timestamp.fromDate(start)),
    where("startTime", "<", Timestamp.fromDate(end)),
    orderBy("startTime", "desc")
  );

  const snapshot = await getDocs(bottlesQuery);

  return snapshot.docs.map((document) => ({
    ...document.data(),
    id: document.id,
  }));
}

export async function updateBottle(id, changes) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in first.");
  }

  const bottleRef = doc(
    db,
    "babies",
    user.uid,
    "bottleFeeds",
    id
  );

  const snapshot = await getDoc(bottleRef);

  if (!snapshot.exists()) {
    throw new Error("This bottle record no longer exists.");
  }

  const updates = {};
  const allowedFields = [
    "startTime",
    "breastMilkAmountMl",
    "formulaAmountMl",
    "unspecifiedAmountMl",
    "notes",
  ];

  for (const field of allowedFields) {
    if (Object.hasOwn(changes, field)) {
      updates[field] = changes[field];
    }
  }

  const bottle = {
    ...snapshot.data(),
    ...updates,
  };

  const amounts = [
    bottle.breastMilkAmountMl,
    bottle.formulaAmountMl,
    bottle.unspecifiedAmountMl,
  ];

  if (
    amounts.some((amount) => !Number.isFinite(amount) || amount < 0) ||
    amounts.reduce((total, amount) => total + amount, 0) <= 0
  ) {
    throw new Error("Enter a valid milk amount greater than zero.");
  }

  if (
    !(bottle.startTime instanceof Timestamp) ||
    !Number.isFinite(bottle.startTime.toMillis())
  ) {
    throw new Error("Enter a valid date and time.");
  }

  if (typeof bottle.notes !== "string") {
    throw new Error("Note must be text.");
  }

  if (Object.hasOwn(updates, "notes")) {
    updates.notes = updates.notes.trim();
  }

  updates.updatedAt = Timestamp.now();

  await updateDoc(bottleRef, updates);
}

export async function getLatestBottle() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in first.");
  }

  const bottlesRef = collection(
    db,
    "babies",
    user.uid,
    "bottleFeeds"
  );

  const latestQuery = query(
    bottlesRef,
    orderBy("startTime", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(latestQuery);

  if (snapshot.empty) {
    return null;
  }

  const document = snapshot.docs[0];

  return {
    ...document.data(),
    id: document.id,
  };
}