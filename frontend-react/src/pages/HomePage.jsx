import { useEffect, useState } from "react";
import bottleImage from "../assets/bottle.png";
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
    <main className="home-page">
      <header className="page-header">
        <h1>Welcome, {user.name}!</h1>

        <p>
          {new Date().toLocaleDateString([], {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>
      </header>

      <div className="home-body">
        <h2 className="section-heading">
          add activity
        </h2>

        <section
          className="bottle-card"
          aria-label="Bottle feeding summary"
        >
          <img
            className="bottle-decoration"
            src={bottleImage}
            alt=""
            aria-hidden="true"
          />
          <div className="bottle-card-top">
            <div>
              {loading && <p role="status">Loading...</p>}
              {loadError && <p role="status">{loadError}</p>}

              {!loading && !loadError && (
                latestBottle ? (
                  <>
                    <p className="bottle-time">
                      {new Date(latestBottle.startTime).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>

                    <h3>
                      {getMilkType(latestBottle)}{" "}
                      {(getTotalMl(latestBottle) / ML_PER_OZ).toFixed(2)} oz
                    </h3>
                  </>
                ) : (
                  <h3>No bottle feeds yet</h3>
                )
              )}
            </div>
          </div>

          <div className="bottle-card-bottom">
            {!loading && !loadError && (
              <p>
                Today: {todayBottles.length}{" "}
                {todayBottles.length === 1 ? "bottle" : "bottles"}
                {" · "}
                {todayTotalOz.toFixed(2)} oz
              </p>
            )}

            <button type="button" onClick={onLogBottle}>
              + Log Bottle
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default HomePage;