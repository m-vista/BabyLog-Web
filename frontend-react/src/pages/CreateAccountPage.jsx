import { useState } from "react";
import bottleImage from "../assets/bottle.png";
import { createUser } from "../api/auth-api";

function CreateAccount({ onBack, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleCreateAccount(event) {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const user = await createUser(name, email, password);
      onLogin(user);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <p className="auth-brand">BabyLog</p>

        <h1>Track your baby's bottle feeds.</h1>

        <img
          src={bottleImage}
          alt=""
          className="auth-bottle"
        />
      </section>

      <section className="auth-panel">
        <div className="auth-content">
          <h2>Create account</h2>

          <form onSubmit={handleCreateAccount}>
            <div>
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="signup-email">Email *</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="signup-password">Password *</label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="confirm-password">Confirm password *</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            <p>* Required fields. Password must contain at least 6 characters.</p>

            <button type="submit" disabled={busy}>
              {busy ? "Creating account..." : "Create account"}
            </button>
          </form>

          <button
            type="button"
            className="auth-switch"
            onClick={onBack}
            disabled={busy}
          >
            Already have an account? Log in
          </button>
          
          <p role="status">{message}</p>
        </div>
      </section>
    </main>
  );
}

export default CreateAccount;