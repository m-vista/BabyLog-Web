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

  const [type, setType] = useState("");
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

    if (!type) {
      setMessage("Select a milk type.");
      return;
    }

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
              disabled={busy}
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
          {!type && <p>Select a type to enter the milk amounts.</p>}

          <div className="amount-row">
            {(type === "breastMilk" || type === "combo") && (
              <div className="amount-box">
                <label htmlFor="breast-milk">Breast milk (oz)</label>
                <input
                  id="breast-milk"
                  type="number"
                  min="0.25"
                  step="0.25"
                  placeholder="0"
                  value={breastMilkOz}
                  onChange={(event) => setBreastMilkOz(event.target.value)}
                  required
                />
              </div>
            )}

            {(type === "formula" || type === "combo") && (
              <div className="amount-box">
                <label htmlFor="formula">Formula (oz)</label>
                <input
                  id="formula"
                  type="number"
                  min="0.25"
                  step="0.25"
                  placeholder="0"
                  value={formulaOz}
                  onChange={(event) => setFormulaOz(event.target.value)}
                  required
                />
              </div>
            )}

            {type === "combo" && (
              <div className="amount-box amount-total">
                <label htmlFor="bottle-total">Total (oz) — AUTO</label>
                <input
                  id="bottle-total"
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
          <label htmlFor="notes">Note (optional)</label>
          <textarea
            id="notes"
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
            {busy ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default LogBottlePage;
