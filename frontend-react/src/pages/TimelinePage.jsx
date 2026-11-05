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

  const totalOz = bottles.reduce((total, bottle) => {
    return total +
      bottle.breastMilkAmountMl +
      bottle.formulaAmountMl +
      bottle.unspecifiedAmountMl;
  }, 0) / 29.5735295625;

  return (
    <main className="timeline-page">
      <header className="page-header">
        <h1>Timeline</h1>

        <div className="timeline-controls">
          <button
            type="button"
            aria-label="Previous day"
            onClick={() => changeDay(-1)}
          >
            ‹
          </button>

          <input
            aria-label="Timeline date"
            type="date"
            value={date}
            onChange={(event) => selectDate(event.target.value)}
          />

          <button
            type="button"
            aria-label="Next day"
            onClick={() => changeDay(1)}
          >
            ›
          </button>
        </div>
      </header>

      <div className="timeline-body">
        <div className="timeline-summary">
          <h2>
            {new Date(`${date}T12:00:00`).toLocaleDateString([], {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h2>

          {!loading && !message && (
            <p>
              {bottles.length} bottles · {totalOz.toFixed(2)} oz
            </p>
          )}
        </div>

        {loading && <p role="status">Loading...</p>}

        {message && <p role="alert">{message}</p>}

        {!loading && !message && bottles.length === 0 && (
          <p>No bottle feeds for this date.</p>
        )}

        {!loading && !message && (
          <ul className="bottle-list">
            {bottles.map((bottle) => {
              const amountOz = (
                bottle.breastMilkAmountMl +
                bottle.formulaAmountMl +
                bottle.unspecifiedAmountMl
              ) / 29.5735295625;

              return (
                <li key={bottle.id} className="bottle-entry">
                  <span className="entry-time">
                    {new Date(bottle.startTime).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>

                  <div className="entry-details">
                    <p>
                      {getMilkType(bottle)} {amountOz.toFixed(2)} oz
                    </p>

                    {bottle.notes && (
                      <p className="entry-note">{bottle.notes}</p>
                    )}
                  </div>

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
      </div>
    </main>
  );
}

export default TimelinePage;