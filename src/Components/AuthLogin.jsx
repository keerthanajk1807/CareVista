import { useState } from "react";
import "./AuthLogin.css";
import { useAuth } from "./context/AuthContext";
import { signUpPatient } from "../api/authApi";
export default function AuthLogin() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [patientId, setPatientId] = useState('');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const {
    login,
    message
  } = useAuth();
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && (!name.trim() || password.length < 6 || password !== confirmPassword)) {
      setError('Enter a name and matching passwords of at least 6 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (mode === 'login' && patientId && !/^PAT-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(patientId.trim())) {
      setError('Enter a valid Patient ID: PAT- followed by the account UUID.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') await signUpPatient({
        name: name.trim(),
        email: email.trim(),
        password
      });
      await login(mode === 'login' && patientId.trim() ? patientId.trim() : email.trim(), password);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }
  return <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">+</div>
          <h1>CareVista</h1>
          <p>Your health, our priority</p>
        </div>

        <div className="auth-tabs">
          <button type="button" className={mode === "login" ? "auth-tab active" : "auth-tab"} onClick={() => {
          setMode("login");
          setError("");
        }}>
            Login
          </button>

          <button type="button" className={mode === "signup" ? "auth-tab active" : "auth-tab"} onClick={() => {
          setMode("signup");
          setError("");
        }}>
            Sign Up
          </button>
        </div>

        <h2>{mode === "login" ? "Welcome Back!" : "Create Your Account"}</h2>
        <p className="auth-subtitle">
          {mode === "login" ? "Login to manage your appointments." : "Register to book your hospital appointments."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && <div className="auth-field">
              <label htmlFor="auth-name">Full Name</label>
              <input id="auth-name" type="text" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required />
            </div>}

          <div className="auth-field">
            <label htmlFor="auth-email">Email Address</label>
            <input id="auth-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required={mode === "signup" || !patientId.trim()} />
          </div>

          {mode === 'login' && <div className="auth-field"><label htmlFor="patient-login-id">Patient ID (optional)</label><input id="patient-login-id" value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="PAT- followed by your account ID" /><small>Use your email or Patient ID.</small></div>}
          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {mode === "signup" && <div className="auth-field">
              <label htmlFor="auth-confirm">Confirm Password</label>
              <input id="auth-confirm" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>}

          {message && <p className="auth-error">{message}</p>}
          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Login to Account" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
        }}>
            {mode === "login" ? "Sign Up" : "Login"}
          </button>
        </p>

        <p className="auth-note">
          Demo project only. Use test details, not your real password.
        </p>
      </section>
    </main>;
}
