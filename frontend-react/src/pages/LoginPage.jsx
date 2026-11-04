import { useState } from "react";
import { loginUser } from "../api/auth-api";

function LoginPage({ onCreateAccount, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      const user = await loginUser(email, password);
      onLogin(user);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <h1>BabyLog</h1>
      <p>Track your baby’s bottle feeds.</p>
      <h2>Log in</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <p>* Required fields</p>

        <button type="submit" disabled={busy}>
          {busy ? "Logging in..." : "Log in"}
        </button>
      </form>

      <button onClick={onCreateAccount} disabled={busy}>
        Create account
      </button>

      <p role="status">{message}</p>
    </main>
  );
}

export default LoginPage;