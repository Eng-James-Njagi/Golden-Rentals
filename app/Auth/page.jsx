'use client'
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import "../AuthForm.css";
import { createBrowserSupabaseClient } from '../../lib/supabase/client';

const supabase = createBrowserSupabaseClient();

/* ── SVG icon helper ── */
const Icon = ({ d }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="input-icon"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const icons = {
  user:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  lock:     "M17 11V7a5 5 0 0 0-10 0v4M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z",
  mail:     "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 0l8 8 8-8",
  building: "M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4",
  phone:    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  map:      "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z",
  logo:     "M4 6h16M4 12h10M4 18h7",
};

/* ── Single field — controlled ── */
const Field = ({ icon, placeholder, type = "text", hint, fullWidth = false, value, onChange, name }) => (
  <div className={`field-wrap${fullWidth ? " field-full" : ""}`}>
    <div className="input-row">
      <Icon d={icons[icon]} />
      <input
        type={type}
        placeholder={placeholder}
        autoComplete="off"
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
    {hint && <span className="field-hint">{hint}</span>}
  </div>
);

/* ── Sign Up: 2-column grid ── */
const SignUpFields = ({ values, onChange }) => (
  <div className="fields-grid">
    <Field icon="user"     name="username"         placeholder="Username"          value={values.username}         onChange={onChange} />
    <Field icon="lock"     name="password"         placeholder="Password"          value={values.password}         onChange={onChange} type="password" />
    <Field icon="mail"     name="email"            placeholder="Email"             value={values.email}            onChange={onChange} />
    <Field icon="building" name="organisationName" placeholder="Organisation Name" value={values.organisationName} onChange={onChange} />
    <Field icon="phone"    name="contact"          placeholder="Contact"           value={values.contact}          onChange={onChange} />
    <Field
      icon="map"
      name="ward"
      placeholder="Ward (optional)"
      value={values.ward}
      onChange={onChange}
      hint="Providing your ward helps our algorithms match you faster to relevant search results."
      fullWidth
    />
  </div>
);

/* ── Log In: single column ── */
const LogInFields = ({ values, onChange }) => (
  <div className="fields-single">
    <Field icon="user" name="username" placeholder="Username" value={values.username} onChange={onChange} />
    <Field icon="lock" name="password" placeholder="Password" value={values.password} onChange={onChange} type="password" />
  </div>
);

/* ── Field state shapes ── */
const SIGNUP_INIT = { username: "", password: "", email: "", organisationName: "", contact: "", ward: "" };
const LOGIN_INIT  = { username: "", password: "" };

/* ── Root component ── */
export default function AuthForm() {
  const [mode, setMode] = useState("signup"); // "signup" | "login"
  const router = useRouter();
  const isSignup = mode === "signup";

  const [signupFields, setSignupFields] = useState(SIGNUP_INIT);
  const [loginFields,  setLoginFields]  = useState(LOGIN_INIT);

  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleMode = useCallback(() => {
    setMode(m => m === "signup" ? "login" : "signup");
    setError(null);
  }, []);

  const handleSignupChange = useCallback(e => {
    const { name, value } = e.target;
    setSignupFields(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleLoginChange = useCallback(e => {
    const { name, value } = e.target;
    setLoginFields(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const endpoint = "/api/auth";
    const body = isSignup
      ? { mode: "signup", ...signupFields }
      : { mode: "login",  ...loginFields  };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (isSignup) {
        setSignupFields(SIGNUP_INIT);
        setMode("login");
        setError(null);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: loginFields.password,
        });

        if (signInError) {
          setError("Invalid username or password.");
          return;
        }

        router.push("/Admin/Lister");
      }

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-scene">
      <div className="auth-card">

        {/* LEFT BRAND PANEL */}
        <div className="panel-brand">
          <span className="pdiamond pd1" />
          <span className="pdiamond pd2" />
          <span className="pdiamond pd3" />

          <div className="panel-content">
            <h2 className="panel-title">
              {isSignup ? "Welcome Back!" : "New Here?"}
            </h2>
            <p className="panel-sub">
              {isSignup
                ? "Already have an account? Sign in with your credentials."
                : "Create an account to get started and access all features."}
            </p>
            <button className="panel-btn" onClick={toggleMode}>
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>

        {/* RIGHT FORM PANEL — key forces remount → replays CSS animation */}
        <div className="panel-form" key={mode}>
          <h1 className="form-title">
            {isSignup ? "Create Account" : "Log In"}
          </h1>

          {isSignup
            ? <SignUpFields values={signupFields} onChange={handleSignupChange} />
            : <LogInFields  values={loginFields}  onChange={handleLoginChange}  />
          }

          {error && <p className="form-error">{error}</p>}

          <div className="submit-wrap">
            <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Please wait…" : isSignup ? "Sign Up" : "Log In"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}