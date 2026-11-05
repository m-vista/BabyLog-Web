import logoutIcon from "../assets/logout.png";

function Navigation({
  page,
  onHome,
  onTimeline,
  onLogout,
  busy,
}) {
  const homeActive = page === "home" || page === "logBottle";
  const timelineActive = page === "timeline" || page === "editBottle";

  return (
    <nav className="navigation" aria-label="Main navigation">
      <h2 className="navigation-brand">BabyLog</h2>

      <button
        type="button"
        className={homeActive ? "active" : ""}
        aria-current={homeActive ? "page" : undefined}
        onClick={onHome}
        disabled={busy}
      >
        Home
      </button>

      <button
        type="button"
        className={timelineActive ? "active" : ""}
        aria-current={timelineActive ? "page" : undefined}
        onClick={onTimeline}
        disabled={busy}
      >
        Timeline
      </button>

      <button
        type="button"
        className="logout-button"
        onClick={onLogout}
        disabled={busy}
      >
        <img src={logoutIcon} alt="" className="logout-icon" />
        {busy ? "Logging out..." : "Log out"}
      </button>
    </nav>
  );
}

export default Navigation;