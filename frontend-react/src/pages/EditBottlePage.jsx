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

  const initialBreastMilk = (bottle.breastMilkAmountMl / ML_PER_OZ).toFixed(2);
  const initialFormula = (bottle.formulaAmountMl / ML_PER_OZ).toFixed(2);

  let initialType = "breastMilk";
  if (bottle.breastMilkAmountMl > 0 && bottle.formulaAmountMl > 0) {
    initialType = "combo";
  } else if (bottle.formulaAmountMl > 0) {
    initialType = "formula";
  }

  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [type, setType] = useState(initialType);
  const [breastMilkOz, setBreastMilkOz] = useState(initialBreastMilk);
  const [formulaOz, setFormulaOz] = useState(initialFormula);
  const [notes, setNotes] = useState(bottle.notes);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const breastMilk = type === "formula" ? 0 : Number(breastMilkOz);
  const formula = type === "breastMilk" ? 0 : Number(formulaOz);
  const total = breastMilk + formula;

  async function handleSave(event) {
    event.preventDefault();
    setMessage("");

    if (
      !Number.isFinite(total) ||
      (type !== "formula" && breastMilk <= 0) ||
      (type !== "breastMilk" && formula <= 0)
    ) {
      setMessage("Enter an amount greater than zero in each milk box.");
      return;
    }

    setBusy(true);

    try {
      const changes = {};

      if (date !== initialDate || time !== initialTime) {
        changes.startTime = new Date(`${date}T${time}`).toISOString();
      }

      if (type === "formula" || breastMilk !== Number(initialBreastMilk)) {
        changes.breastMilkAmountMl = breastMilk * ML_PER_OZ;
      }

      if (type === "breastMilk" || formula !== Number(initialFormula)) {
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
              disabled={busy}
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
              disabled={busy}
              required
            />
          </div>
        </div>

        <fieldset className="bottle-section" disabled={busy}>
          <legend>Type *</legend>
          <div className="type-options">
            <label className={type === "breastMilk" ? "type-tab selected" : "type-tab"}>
              <input
                type="radio"
                name="milk-type"
                value="breastMilk"
                checked={type === "breastMilk"}
                onChange={(event) => setType(event.target.value)}
                required
              />
              Breast milk
            </label>
            <label className={type === "formula" ? "type-tab selected" : "type-tab"}>
              <input
                type="radio"
                name="milk-type"
                value="formula"
                checked={type === "formula"}
                onChange={(event) => setType(event.target.value)}
                required
              />
              Formula
            </label>
            <label className={type === "combo" ? "type-tab selected" : "type-tab"}>
              <input
                type="radio"
                name="milk-type"
                value="combo"
                checked={type === "combo"}
                onChange={(event) => setType(event.target.value)}
                required
              />
              Combo
            </label>
          </div>
        </fieldset>

        <fieldset className="bottle-section" disabled={busy}>
          <legend>Amounts *</legend>
          <div className="amount-row">
            {(type === "breastMilk" || type === "combo") && (
              <div className="amount-box">
                <label htmlFor="edit-breast-milk">Breast milk (oz)</label>
                <input
                  id="edit-breast-milk"
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={breastMilkOz}
                  onChange={(event) => setBreastMilkOz(event.target.value)}
                  required
                />
              </div>
            )}

            {(type === "formula" || type === "combo") && (
              <div className="amount-box">
                <label htmlFor="edit-formula">Formula (oz)</label>
                <input
                  id="edit-formula"
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={formulaOz}
                  onChange={(event) => setFormulaOz(event.target.value)}
                  required
                />
              </div>
            )}

            {type === "combo" && (
              <div className="amount-box amount-total">
                <label htmlFor="edit-total">Total (oz) — AUTO</label>
                <input
                  id="edit-total"
                  type="text"
                  value={total.toFixed(2)}
                  readOnly
                />
              </div>
            )}
          </div>

          {type === "combo" && (
            <p className="form-hint">Total is calculated from breast milk and formula.</p>
          )}
        </fieldset>

        <div>
          <label htmlFor="edit-notes">Note (optional)</label>
          <textarea
            id="edit-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={busy}
          />
        </div>

        <p className="form-hint">* Required fields</p>
        <p className="form-error" role="status">{message}</p>

        <div className="form-actions">
          <button type="button" onClick={onBack} disabled={busy}>Cancel</button>
          <button type="submit" disabled={busy}>
            {busy ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default EditBottlePage;