import { useEffect, useState } from "react";
import { getBottlesByDate } from "../api/bottle-api";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMilkType(bottle) {
  const breastMilk = bottle.breastMilkAmountMl;
  const formula = bottle.formulaAmountMl;

  if (breastMilk > 0 && formula > 0) {
    return "Combo";
  }

  if (breastMilk > 0) {
    return "Breast milk";
  }

  if (formula > 0) {
    return "Formula";
  }

  return "Unspecified";
}

function TimelinePage({ onEdit, initialDate }) {
  const [date, setDate] = useState(() => initialDate || formatDate(new Date()));
  const [bottles, setBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBottles() {
      try {
        const records = await getBottlesByDate(date);

        if (active) {
          setBottles(records);
        }
      } catch {
        if (active) {
          setMessage("Could not load bottle feeds. Please reopen Timeline.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBottles();

    return () => {
      active = false;
    };
  }, [date]);

  function selectDate(value) {
    if (!value || value === date) {
      return;
    }

    setLoading(true);
    setMessage("");
    setBottles([]);
    setDate(value);
  }

  function changeDay(amount) {
    const nextDate = new Date(`${date}T12:00:00`);
    nextDate.setDate(nextDate.getDate() + amount);
    selectDate(formatDate(nextDate));
  }

  return (
    <main>
      <h1>Timeline</h1>

      <div  className="timeline-controls">
        <button onClick={() => changeDay(-1)}>
          Previous day
        </button>

        <label htmlFor="timeline-date">Date</label>
        <input
          id="timeline-date"
          type="date"
          value={date}
          onChange={(event) => selectDate(event.target.value)}
        />

        <button onClick={() => changeDay(1)}>
          Next day
        </button>
      </div>

      {loading && <p role="status">Loading...</p>}

      <p role="status">{message}</p>

      {!loading && !message && bottles.length === 0 && (
        <p>No bottle feeds for this date.</p>
      )}

      {!loading && !message && (
        <ul className="bottle-list">
          {bottles.map((bottle) => {
            const totalMl =
              bottle.breastMilkAmountMl +
              bottle.formulaAmountMl +
              bottle.unspecifiedAmountMl;

            const totalOz = totalMl / 29.5735295625;

            return (
              <li key={bottle.id} className="bottle-entry">
                <p>
                  {new Date(bottle.startTime).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {" — "}
                  {getMilkType(bottle)}
                  {" — "}
                  {totalOz.toFixed(2)} oz
                </p>

                {bottle.notes && <p>{bottle.notes}</p>}

                <button
                    type="button"
                    onClick={() => onEdit(bottle, date)}
                >
                    More / Edit
                </button>

              </li>
            );
          })}
        </ul>
      )}

    </main>
  );
}

export default TimelinePage;