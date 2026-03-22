import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [value, setValue] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [entry, setEntry] = useState(null);
  const [draws, setDraws] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [proofDrafts, setProofDrafts] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [s, sub, e, d, w] = await Promise.all([
        API.get("/scores"),
        API.get("/subscription/me"),
        API.get("/entry/me"),
        API.get("/draw"),
        API.get("/winner/me"),
      ]);

      setScores(s.data.scores || []);
      setSubscription(sub.data);
      setEntry(e.data);
      setDraws(d.data || []);
      setWinnings(w.data || []);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to load dashboard data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addScore = async () => {
    if (!value) return;

    setIsSubmittingScore(true);
    setStatus({ type: "", message: "" });
    try {
      await API.post("/scores", { value: Number(value) });
      setValue("");
      setStatus({ type: "success", message: "Score added successfully." });
      await fetchData();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to add score.",
      });
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const subscribe = async (plan) => {
    setIsUpdatingSubscription(true);
    setStatus({ type: "", message: "" });
    try {
      await API.post("/subscription/subscribe", { plan });
      setStatus({
        type: "success",
        message: `${plan[0].toUpperCase() + plan.slice(1)} subscription activated.`,
      });
      await fetchData();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to activate subscription.",
      });
    } finally {
      setIsUpdatingSubscription(false);
    }
  };

  const cancelSubscription = async () => {
    setIsUpdatingSubscription(true);
    setStatus({ type: "", message: "" });
    try {
      await API.post("/subscription/cancel");
      setStatus({ type: "success", message: "Subscription cancelled." });
      await fetchData();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to cancel subscription.",
      });
    } finally {
      setIsUpdatingSubscription(false);
    }
  };

  const submitProof = async (winnerId) => {
    const proof = proofDrafts[winnerId]?.trim();
    if (!proof) return;

    setStatus({ type: "", message: "" });
    try {
      await API.post("/winner/proof", { winnerId, proof });
      setProofDrafts((current) => ({ ...current, [winnerId]: "" }));
      setStatus({ type: "success", message: "Proof submitted successfully." });
      await fetchData();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to submit proof.",
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const stats = [
    { label: "Scores Recorded", value: scores.length },
    { label: "Entry Status", value: entry ? "Qualified" : `${scores.length}/5` },
    { label: "Winnings", value: winnings.length },
  ];

  const latestDraw = draws[0];

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="mx-auto max-w-6xl py-16">
          <div className="panel-card">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <header className="hero-banner">
          <div>
            <span className="eyebrow">Member Dashboard</span>
            <h1 className="hero-title">Good to see you, {user?.name || "player"}.</h1>
            <p className="hero-copy">
              Manage your subscription, record your latest scores, and track your standing in the monthly draw.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="secondary-button" onClick={fetchData}>
              Refresh
            </button>
            <button className="ghost-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {status.message ? (
          <p className={`status-banner ${status.type === "error" ? "status-error" : "status-success"}`}>
            {status.message}
          </p>
        ) : null}

        <section className="stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className="stat-card">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="dashboard-grid">
          <article className="panel-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="panel-title">Subscription</h2>
                <p className="panel-subtitle">
                  An active subscription is required to submit scores and qualify for the draw.
                </p>
              </div>
              <span className={`pill ${subscription?.active ? "pill-success" : "pill-muted"}`}>
                {subscription?.active ? "Active" : "Inactive"}
              </span>
            </div>

            {subscription?.active ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Current plan</p>
                  <p className="text-lg font-semibold capitalize text-slate-900">{subscription.plan}</p>
                  <p className="text-sm text-slate-500">
                    Renews on {new Date(subscription.renewalDate).toLocaleDateString()}
                  </p>
                </div>

                <button className="ghost-button" onClick={cancelSubscription} disabled={isUpdatingSubscription}>
                  {isUpdatingSubscription ? "Updating..." : "Cancel Subscription"}
                </button>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  className="primary-button"
                  onClick={() => subscribe("monthly")}
                  disabled={isUpdatingSubscription}
                >
                  {isUpdatingSubscription ? "Activating..." : "Start Monthly Plan"}
                </button>
                <button
                  className="secondary-button"
                  onClick={() => subscribe("yearly")}
                  disabled={isUpdatingSubscription}
                >
                  Choose Yearly Plan
                </button>
              </div>
            )}
          </article>

          <article className="panel-card">
            <h2 className="panel-title">Add Score</h2>
            <p className="panel-subtitle">
              Enter a score between 1 and 45. Your latest five scores become your monthly entry.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                className="input-field"
                type="number"
                min="1"
                max="45"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter score"
              />
              <button className="primary-button" onClick={addScore} disabled={isSubmittingScore}>
                {isSubmittingScore ? "Saving..." : "Add Score"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 p-4">
              <p className="text-sm text-emerald-900">
                {entry
                  ? `Current entry locked in: ${entry.numbers.join(", ")}`
                  : `You need ${Math.max(5 - scores.length, 0)} more scores to qualify.`}
              </p>
            </div>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="panel-title">Recent Scores</h2>
                <p className="panel-subtitle">Latest entries are shown first.</p>
              </div>
              <span className="pill pill-muted">{scores.length} saved</span>
            </div>

            <div className="mt-6 space-y-3">
              {scores.length ? (
                scores.map((score, index) => (
                  <div key={`${score.date}-${index}`} className="list-row">
                    <div>
                      <p className="font-semibold text-slate-900">Score {score.value}</p>
                      <p className="text-sm text-slate-500">{new Date(score.date).toLocaleString()}</p>
                    </div>
                    <span className="pill pill-muted">#{scores.length - index}</span>
                  </div>
                ))
              ) : (
                <p className="empty-state">No scores yet. Start by adding your first round.</p>
              )}
            </div>
          </article>

          <article className="panel-card">
            <h2 className="panel-title">Draw Overview</h2>
            <p className="panel-subtitle">Latest draw information available to members.</p>

            {latestDraw ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">
                    {latestDraw.month}/{latestDraw.year}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Winning Numbers: {latestDraw.winningNumbers.join(", ")}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Prize Pool: {latestDraw.totalPool} | Charity: {latestDraw.charityAmount}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="sub-card">
                    <p className="text-sm text-slate-500">Status</p>
                    <p className="text-base font-semibold capitalize text-slate-900">{latestDraw.status}</p>
                  </div>
                  <div className="sub-card">
                    <p className="text-sm text-slate-500">Rollover</p>
                    <p className="text-base font-semibold text-slate-900">{latestDraw.rolloverAmount}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="empty-state mt-6">No draws have been completed yet.</p>
            )}
          </article>
        </section>

        <section className="panel-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="panel-title">Winnings</h2>
              <p className="panel-subtitle">
                Submit proof for unverified wins and track payout progress.
              </p>
            </div>
            <span className="pill pill-muted">{winnings.length} records</span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {winnings.length ? (
              winnings.map((winner) => (
                <article key={winner._id} className="sub-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Position {winner.position}</p>
                      <p className="text-xl font-semibold text-slate-900">{winner.prize}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`pill ${winner.verified ? "pill-success" : "pill-warning"}`}>
                        {winner.verified ? "Verified" : "Needs Proof"}
                      </span>
                      <span className={`pill ${winner.payoutStatus === "paid" ? "pill-success" : "pill-muted"}`}>
                        {winner.payoutStatus}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 break-all text-sm text-slate-500">Draw ID: {winner.drawId}</p>

                  {winner.verified ? (
                    <p className="mt-4 text-sm text-emerald-700">
                      Verification complete{winner.proof ? " and proof received." : "."}
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input
                        className="input-field"
                        placeholder="Paste proof URL or reference"
                        value={proofDrafts[winner._id] || ""}
                        onChange={(e) =>
                          setProofDrafts((current) => ({
                            ...current,
                            [winner._id]: e.target.value,
                          }))
                        }
                      />
                      <button className="secondary-button" onClick={() => submitProof(winner._id)}>
                        Submit Proof
                      </button>
                    </div>
                  )}
                </article>
              ))
            ) : (
              <p className="empty-state">No winnings recorded yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
