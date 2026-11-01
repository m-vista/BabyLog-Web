import { useState } from "react";
import { createBottle } from "../models/bottle-model";

function LogBottlePage({ onBack }) {
  const [date, setDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  });

  const [time, setTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  });

  const [type, setType] = useState("breastMilk");
  const [breastMilkOz, setBreastMilkOz] = useState("");
  const [formulaOz, setFormulaOz] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const breastMilk = type === "formula" ? 0 : Number(breastMilkOz);
  const formula = type === "breastMilk" ? 0 : Number(formulaOz);
  const total = breastMilk + formula;

  async function handleSave(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      await createBottle({
        startTime: `${date}T${time}`,
        breastMilkOz: breastMilk,
        formulaOz: formula,
        notes,
      });

      onBack();
    } catch (error) {
      setMessage(
        error.code
          ? "Could not save the bottle. Please try again."
          : error.message
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <h1>Log bottle</h1>

      <form onSubmit={handleSave}>
        <div>
          <label htmlFor="bottle-date">Date *</label>
          <input
            id="bottle-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="bottle-time">Time *</label>
          <input
            id="bottle-time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="bottle-type">Milk type *</label>
          <select
            id="bottle-type"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="breastMilk">Breast milk</option>
            <option value="formula">Formula</option>
            <option value="combo">Combo</option>
          </select>
        </div>

        {type !== "formula" && (
          <div>
            <label htmlFor="breast-milk">Breast milk (oz) *</label>
            <input
              id="breast-milk"
              type="number"
              min="0"
              step="0.01"
              value={breastMilkOz}
              onChange={(event) => setBreastMilkOz(event.target.value)}
              required
            />
          </div>
        )}

        {type !== "breastMilk" && (
          <div>
            <label htmlFor="formula">Formula (oz) *</label>
            <input
              id="formula"
              type="number"
              min="0"
              step="0.01"
              value={formulaOz}
              onChange={(event) => setFormulaOz(event.target.value)}
              required
            />
          </div>
        )}

        <p>Total: {total.toFixed(2)} oz</p>

        <div>
          <label htmlFor="notes">Note</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <p>* Required fields</p>

        <button type="submit" disabled={busy}>
          {busy ? "Saving..." : "Save Entry"}
        </button>

        <button type="button" onClick={onBack} disabled={busy}>
          Cancel
        </button>
      </form>

      <p role="status">{message}</p>
    </main>
  );
}

export default LogBottlePage;