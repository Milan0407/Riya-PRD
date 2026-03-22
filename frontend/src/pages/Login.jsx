import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await API.post("/auth/login", form);
      login(res.data);

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-brand-panel">
        <span className="eyebrow">Golf Charity Club</span>
        <h1 className="auth-title">A calmer way to manage play, pools, and prize draws.</h1>
        <p className="auth-copy">
          Track scores, qualify automatically for monthly entries, and keep charity and payout activity in one place.
        </p>

        <div className="auth-feature-list">
          <div className="info-chip">Monthly subscriptions and entry automation</div>
          <div className="info-chip">Transparent draw history and charity split</div>
          <div className="info-chip">Admin verification and payout tracking</div>
        </div>
      </section>

      <section className="auth-card">
        <div>
          <span className="eyebrow">Welcome back</span>
          <h2 className="panel-title mt-3">Sign in to your account</h2>
          <p className="panel-subtitle mt-2">
            Use your registered email to continue to your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? <p className="status-banner status-error">{error}</p> : null}

          <label className="form-label">
            Email
            <input
              className="input-field mt-2"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>

          <label className="form-label">
            Password
            <input
              type="password"
              className="input-field mt-2"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>

          <button className="primary-button w-full justify-center" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-slate-500">
          New here?{" "}
          <Link className="font-semibold text-emerald-700 hover:text-emerald-600" to="/register">
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
};

export default Login;
