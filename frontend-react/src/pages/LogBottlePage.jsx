import { useState } from "react";
import { createBottle } from "../api/bottle-api";

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

  const [breastMilkOz, setBreastMilkOz] = useState("");
  const [formulaOz, setFormulaOz] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const breastMilk = Number(breastMilkOz);
  const formula = Number(formulaOz);
  const total = breastMilk + formula;

  async function handleSave(event) {
    event.preventDefault();
    setMessage("");

    if (
      !Number.isFinite(breastMilk) ||
      !Number.isFinite(formula) ||
      breastMilk < 0 ||
      formula < 0 ||
      !Number.isFinite(total) ||
      total <= 0
    ) {
      setMessage("Enter a valid milk amount greater than zero.");
      return;
    }

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
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bottle-form-page">
      <h1>Log bottle</h1>

      <form className="bottle-form" onSubmit={handleSave}>
        <div className="date-time-row">
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
        </div>

        <div className="amount-row">
          <div className="amount-box">
            <label htmlFor="breast-milk">Breast milk (oz)</label>
            <input
              id="breast-milk"
              type="number"
              min="0"
              step="0.25"
              placeholder="0"
              value={breastMilkOz}
              onChange={(event) => setBreastMilkOz(event.target.value)}
            />
          </div>

          <div className="amount-box">
            <label htmlFor="formula">Formula (oz)</label>
            <input
              id="formula"
              type="number"
              min="0"
              step="0.25"
              placeholder="0"
              value={formulaOz}
              onChange={(event) => setFormulaOz(event.target.value)}
            />
          </div>

          <div className="amount-box amount-total">
            <label htmlFor="bottle-total">Total (oz) — AUTO</label>
            <input
              id="bottle-total"
              type="text"
              value={total.toFixed(2)}
              readOnly
            />
          </div>
        </div>

        <p>Enter at least one milk amount. Empty boxes count as zero.</p>

        <div>
          <label htmlFor="notes">Note</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <p>* Required fields</p>
        <p role="status">{message}</p>

        <div className="form-actions">
          <button type="button" onClick={onBack} disabled={busy}>
            Cancel
          </button>

          <button type="submit" disabled={busy}>
            {busy ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default LogBottlePage;