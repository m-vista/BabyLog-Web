import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Navigation from "./components/Navigation";
import LoginPage from "./pages/LoginPage";
import CreateAccountPage from "./pages/CreateAccountPage";
import HomePage from "./pages/HomePage";
import LogBottlePage from "./pages/LogBottlePage";
import EditBottlePage from "./pages/EditBottlePage";
import TimelinePage from "./pages/TimelinePage";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [page, setPage] = useState("home");
  const [selectedBottle, setSelectedBottle] = useState(null);
  const [timelineDate, setTimelineDate] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setShowCreateAccount(false);
      setLoading(false);
      setPage("home");
      setSelectedBottle(null);
      setTimelineDate("");
    });

    return unsubscribe;
  }, []);

  async function handleLogout() {
    setLogoutError("");
    setLoggingOut(true);

    try {
      await signOut(auth);
    } catch {
      setLogoutError("Could not log out. Please try again.");
    } finally {
      setLoggingOut(false);
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
          onBack={() => setPage("home")}
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
          busy={loggingOut}
        />

        <div className="app-content">
          {logoutError && (
            <p className="logout-error" role="alert">
              {logoutError}
            </p>
          )}

          {currentPage}
        </div>
      </div>
    );
  }


  if (showCreateAccount) {
    return (
      <CreateAccountPage
        onBack={() => setShowCreateAccount(false)}
      />
    );
  }

  return (
    <LoginPage
      onCreateAccount={() => setShowCreateAccount(true)}
    />
  );
}

export default App;