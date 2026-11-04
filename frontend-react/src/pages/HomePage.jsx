import { useEffect, useState } from "react";
import {
  getBottlesByDate,
  getLatestBottle,
} from "../api/bottle-api";

const ML_PER_OZ = 29.5735295625;

function getTotalMl(bottle) {
  return (
    bottle.breastMilkAmountMl +
    bottle.formulaAmountMl +
    bottle.unspecifiedAmountMl
  );
}

function getMilkType(bottle) {
  if (
    bottle.breastMilkAmountMl > 0 &&
    bottle.formulaAmountMl > 0
  ) {
    return "Combo";
  }

  if (bottle.breastMilkAmountMl > 0) {
    return "Breast milk";
  }

  if (bottle.formulaAmountMl > 0) {
    return "Formula";
  }

  return "Unspecified";
}

function HomePage({ user, onLogBottle }) {
  const [latestBottle, setLatestBottle] = useState(null);
  const [todayBottles, setTodayBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBottles() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const today = `${year}-${month}-${day}`;

      try {
        const [latest, records] = await Promise.all([
          getLatestBottle(),
          getBottlesByDate(today),
        ]);

        if (active) {
          setLatestBottle(latest);
          setTodayBottles(records);
        }
      } catch {
        if (active) {
          setLoadError(
            "Could not load bottle information. Please refresh to retry."
          );
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
  }, []);

  const todayTotalOz =
    todayBottles.reduce(
      (total, bottle) => total + getTotalMl(bottle),
      0
    ) / ML_PER_OZ;

  return (
    <main>
      <h1>Welcome to BabyLog</h1>
      <p>You are logged in as {user.email}.</p>

      <section className="bottle-card" aria-labelledby="bottle-heading">
        <h2 id="bottle-heading">Bottle feeding</h2>

        {loading && <p role="status">Loading bottle information...</p>}

        {loadError && <p role="status">{loadError}</p>}

        {!loading && !loadError && (
          <>
            {latestBottle ? (
              <>
                <h3>Latest bottle</h3>

                <p>
                  {new Date(latestBottle.startTime).toLocaleString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>

                <p>
                  {getMilkType(latestBottle)}
                  {" — "}
                  {(getTotalMl(latestBottle) / ML_PER_OZ).toFixed(2)} oz
                </p>
              </>
            ) : (
              <p>No bottle feeds yet.</p>
            )}

            <h3>Today</h3>
            <p>
              {todayBottles.length} bottles
              {" — "}
              {todayTotalOz.toFixed(2)} oz total
            </p>
          </>
        )}

        <button type="button" onClick={onLogBottle}>
          + Log Bottle
        </button>
      </section>

    </main>
  );
}

export default HomePage;