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

  const totalOz =
    Number(breastMilkOz) +
    Number(formulaOz) +
    bottle.unspecifiedAmountMl / ML_PER_OZ;

  async function handleSave(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      const changes = {};

      if (date !== initialDate || time !== initialTime) {
        changes.startTime = new Date(`${date}T${time}`).toISOString();
      }

      if (Number(breastMilkOz) !== Number(initialBreastMilk)) {
        changes.breastMilkAmountMl = Number(breastMilkOz) * ML_PER_OZ;
      }

      if (Number(formulaOz) !== Number(initialFormula)) {
        changes.formulaAmountMl = Number(formulaOz) * ML_PER_OZ;
      }

      if (notes !== bottle.notes) {
        changes.notes = notes;
      }

      await updateBottle(bottle.id, changes);
      onBack();
    } catch (error) {
      setMessage(
        error.code
          ? "Could not save changes. Please try again."
          : error.message
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <h1>Edit bottle</h1>

      <form onSubmit={handleSave}>
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

        <div>
          <label htmlFor="edit-breast-milk">Breast milk (oz) *</label>
          <input
            id="edit-breast-milk"
            type="number"
            min="0"
            step="0.01"
            value={breastMilkOz}
            onChange={(event) => setBreastMilkOz(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="edit-formula">Formula (oz) *</label>
          <input
            id="edit-formula"
            type="number"
            min="0"
            step="0.01"
            value={formulaOz}
            onChange={(event) => setFormulaOz(event.target.value)}
            required
          />
        </div>

        <p>Total: {totalOz.toFixed(2)} oz</p>
        <p>Use 0 for a milk type that was not included.</p>

        <div>
          <label htmlFor="edit-notes">Note</label>
          <textarea
            id="edit-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <p>* Required fields</p>

        <button type="submit" disabled={busy}>
          {busy ? "Saving..." : "Save Changes"}
        </button>

        <button type="button" onClick={onBack} disabled={busy}>
          Cancel
        </button>
      </form>

      <p role="status">{message}</p>
    </main>
  );
}

export default EditBottlePage;