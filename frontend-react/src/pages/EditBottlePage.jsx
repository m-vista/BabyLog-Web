import { useState } from "react";
import { updateBottle } from "../api/bottle-api";

const ML_PER_OZ = 29.5735295625;

function EditBottlePage({ bottle, onBack }) {
  const originalDate = new Date(bottle.startTime);

  const initialDate = [
    originalDate.getFullYear(),
    String(originalDate.getMonth() + 1).padStart(2, "0"),
    String(originalDate.getDate()).padStart(2, "0"),
  ].join("-");

  const initialTime = [
    String(originalDate.getHours()).padStart(2, "0"),
    String(originalDate.getMinutes()).padStart(2, "0"),
  ].join(":");

  const initialBreastMilk = (
    bottle.breastMilkAmountMl / ML_PER_OZ
  ).toFixed(2);

  const initialFormula = (
    bottle.formulaAmountMl / ML_PER_OZ
  ).toFixed(2);

  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [breastMilkOz, setBreastMilkOz] = useState(initialBreastMilk);
  const [formulaOz, setFormulaOz] = useState(initialFormula);
  const [notes, setNotes] = useState(bottle.notes);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const breastMilk = Number(breastMilkOz);
  const formula = Number(formulaOz);
  const unspecifiedOz = bottle.unspecifiedAmountMl / ML_PER_OZ;
  const total = breastMilk + formula + unspecifiedOz;

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
      const changes = {};

      if (date !== initialDate || time !== initialTime) {
        changes.startTime = new Date(`${date}T${time}`).toISOString();
      }

      if (breastMilk !== Number(initialBreastMilk)) {
        changes.breastMilkAmountMl = breastMilk * ML_PER_OZ;
      }

      if (formula !== Number(initialFormula)) {
        changes.formulaAmountMl = formula * ML_PER_OZ;
      }

      if (notes !== bottle.notes) {
        changes.notes = notes;
      }

      await updateBottle(bottle.id, changes);
      onBack();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bottle-form-page">
      <h1>Edit bottle</h1>

      <form className="bottle-form" onSubmit={handleSave}>
        <div className="date-time-row">
          <div>
            <label htmlFor="edit-date">Date *</label>
            <input
              id="edit-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="edit-time">Time *</label>
            <input
              id="edit-time"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="amount-row">
          <div className="amount-box">
            <label htmlFor="edit-breast-milk">Breast milk (oz)</label>
            <input
              id="edit-breast-milk"
              type="number"
              min="0"
              step="0.25"
              placeholder="0"
              value={breastMilkOz}
              onChange={(event) => setBreastMilkOz(event.target.value)}
            />
          </div>

          <div className="amount-box">
            <label htmlFor="edit-formula">Formula (oz)</label>
            <input
              id="edit-formula"
              type="number"
              min="0"
              step="0.25"
              placeholder="0"
              value={formulaOz}
              onChange={(event) => setFormulaOz(event.target.value)}
            />
          </div>

          <div className="amount-box amount-total">
            <label htmlFor="edit-total">Total (oz) — AUTO</label>
            <input
              id="edit-total"
              type="text"
              value={total.toFixed(2)}
              readOnly
            />
          </div>
        </div>

        <p>Enter at least one milk amount. Empty boxes count as zero.</p>

        {unspecifiedOz > 0 && (
          <p>
            Total also includes {unspecifiedOz.toFixed(2)} oz of
            previously saved unspecified milk.
          </p>
        )}

        <div>
          <label htmlFor="edit-notes">Note</label>
          <textarea
            id="edit-notes"
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
            {busy ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default EditBottlePage;