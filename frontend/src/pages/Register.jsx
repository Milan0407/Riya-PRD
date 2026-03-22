import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
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
      const res = await API.post("/auth/register", form);
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-brand-panel">
        <span className="eyebrow">Membership Setup</span>
        <h1 className="auth-title">Join the club and start qualifying for the next draw.</h1>
        <p className="auth-copy">
          Create your account, activate a subscription, and build your five-score entry from the dashboard.
        </p>
      </section>

      <section className="auth-card">
        <div>
          <span className="eyebrow">Create account</span>
          <h2 className="panel-title mt-3">Register in a minute</h2>
          <p className="panel-subtitle mt-2">
            We will sign you in right away after registration.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? <p className="status-banner status-error">{error}</p> : null}

          <label className="form-label">
            Full name
            <input
              className="input-field mt-2"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>

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
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>

          <button type="submit" className="primary-button w-full justify-center" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-semibold text-emerald-700 hover:text-emerald-600" to="/">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
};

export default Register;
