import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "./api/auth-api";
import Navigation from "./components/Navigation";
import LoginPage from "./pages/LoginPage";
import CreateAccountPage from "./pages/CreateAccountPage";
import HomePage from "./pages/HomePage";
import LogBottlePage from "./pages/LogBottlePage";
import TimelinePage from "./pages/TimelinePage";
import EditBottlePage from "./pages/EditBottlePage";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [page, setPage] = useState("home");
  const [selectedBottle, setSelectedBottle] = useState(null);
  const [timelineDate, setTimelineDate] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const currentUser = await getCurrentUser();

        if (active) {
          setUser(currentUser);
        }
      } catch {
        if (active) {
          setMessage("Cannot reach the backend. Check that it is running.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  function handleLogin(currentUser) {
    setUser(currentUser);
    setShowCreateAccount(false);
    setPage("home");
    setSelectedBottle(null);
    setTimelineDate("");
    setMessage("");
  }

  async function handleLogout() {
    setMessage("");
    setBusy(true);

    try {
      await logoutUser();
      setUser(null);
      setShowCreateAccount(false);
      setPage("home");
      setSelectedBottle(null);
      setTimelineDate("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (user) {
    let currentPage;

    if (page === "logBottle") {
      currentPage = (
        <LogBottlePage onBack={() => setPage("home")} />
      );
    } else if (page === "editBottle" && selectedBottle) {
      currentPage = (
        <EditBottlePage
          bottle={selectedBottle}
          onBack={() => {
            setSelectedBottle(null);
            setPage("timeline");
          }}
        />
      );
    } else if (page === "timeline") {
      currentPage = (
        <TimelinePage
          initialDate={timelineDate}
          onEdit={(bottle, date) => {
            setSelectedBottle(bottle);
            setTimelineDate(date);
            setPage("editBottle");
          }}
        />
      );
    } else {
      currentPage = (
        <HomePage
          user={user}
          onLogBottle={() => setPage("logBottle")}
        />
      );
    }

    return (
      <div className="app-layout">
        <Navigation
          page={page}
          onHome={() => setPage("home")}
          onTimeline={() => setPage("timeline")}
          onLogout={handleLogout}
          busy={busy}
        />

        <div className="app-content">
          {message && <p role="alert">{message}</p>}
          {currentPage}
        </div>
      </div>
    );
  }

  return (
    <>
      {message && <p role="alert">{message}</p>}

      {showCreateAccount ? (
        <CreateAccountPage
          onBack={() => setShowCreateAccount(false)}
          onLogin={handleLogin}
        />
      ) : (
        <LoginPage
          onCreateAccount={() => setShowCreateAccount(true)}
          onLogin={handleLogin}
        />
      )}
    </>
  );
}

export default App;