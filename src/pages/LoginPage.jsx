import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = event => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }
    navigate("/patient");
  };
  return <section className="router-page">
      <h1>Patient Login</h1>
      <form className="router-card" onSubmit={submit}>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p className="router-error">{error}</p>}
        <button className="router-button" type="submit">Login</button>
      </form>
      <p>This is a demo login form; it does not authenticate against a server.</p>
    </section>;
}
