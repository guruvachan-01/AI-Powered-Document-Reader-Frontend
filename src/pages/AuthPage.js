import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Zap, Eye, EyeOff } from "lucide-react";

const AuthPage = ({ mode = "login" }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const isLogin = mode === "login";

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      toast.success(isLogin ? "Welcome back!" : "Account created!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Background grid */}
      <div style={styles.grid} />

      <div style={styles.container} className="fade-in">
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <Zap size={22} color="#6c63ff" />
          </div>
          <span style={styles.logoText}>DocQA</span>
        </div>

        <div style={styles.card} className="card">
          <h1 style={styles.title}>
            {isLogin ? "Welcome back" : "Get started"}
          </h1>
          <p style={styles.subtitle}>
            {isLogin ? "Sign in to your workspace" : "Create your free account"}
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <InputField
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="you@example.com"
              required
            />

            {!isLogin && (
              <InputField
                label="Username"
                type="text"
                value={form.username}
                onChange={(v) => setForm({ ...form, username: v })}
                placeholder="your_username"
                required
              />
            )}

            <div style={styles.fieldWrap}>
              <label style={styles.label}>Password</label>
              <div style={styles.passWrap}>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={styles.eyeBtn}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <span className="loading-spinner" />
                  &nbsp;Loading...
                </>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p style={styles.switchText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link to={isLogin ? "/register" : "/login"}>
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </div>

        <p style={styles.footer}>Powered by Spring AI + OpenAI GPT-4o</p>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
}) => (
  <div style={styles.fieldWrap}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={styles.input}
    />
  </div>
);

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-primary)",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    opacity: 0.3,
  },
  container: {
    width: "100%",
    maxWidth: 420,
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
    position: "relative",
    zIndex: 1,
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: {
    width: 40,
    height: 40,
    background: "var(--accent-dim)",
    border: "1px solid rgba(108,99,255,0.4)",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    color: "var(--text-primary)",
  },
  card: { width: "100%", padding: 32 },
  title: { fontSize: 24, fontWeight: 600, marginBottom: 6 },
  subtitle: { color: "var(--text-secondary)", marginBottom: 28, fontSize: 14 },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" },
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "var(--bg-hover)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    fontSize: 14,
    transition: "border-color 0.2s",
  },
  passWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    color: "var(--text-muted)",
    display: "flex",
  },
  submitBtn: {
    width: "100%",
    justifyContent: "center",
    padding: "12px",
    fontSize: 15,
    marginTop: 4,
  },
  switchText: {
    textAlign: "center",
    fontSize: 13,
    color: "var(--text-secondary)",
    marginTop: 20,
  },
  footer: { fontSize: 12, color: "var(--text-muted)" },
};

export default AuthPage;
