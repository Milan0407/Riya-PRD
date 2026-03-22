import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Admin = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winners, setWinners] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningDraw, setIsRunningDraw] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [u, d, w] = await Promise.all([
        API.get("/admin/users"),
        API.get("/admin/draws"),
        API.get("/admin/winners"),
      ]);

      setUsers(u.data);
      setDraws(d.data);
      setWinners(w.data);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to load admin data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runDraw = async () => {
    setIsRunningDraw(true);
    setStatus({ type: "", message: "" });
    try {
      await API.post("/draw/run");
      setStatus({ type: "success", message: "Monthly draw completed successfully." });
      await fetchData();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to run draw.",
      });
    } finally {
      setIsRunningDraw(false);
    }
  };

  const verifyWinner = async (winnerId) => {
    setStatus({ type: "", message: "" });
    try {
      await API.post("/winner/verify", { winnerId });
      setStatus({ type: "success", message: "Winner verified." });
      await fetchData();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to verify winner.",
      });
    }
  };

  const markPaid = async (winnerId) => {
    setStatus({ type: "", message: "" });
    try {
      await API.post("/winner/pay", { winnerId });
      setStatus({ type: "success", message: "Winner marked as paid." });
      await fetchData();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to mark payout as paid.",
      });
    }
  };

  const stats = [
    { label: "Total Users", value: users.length },
    { label: "Draws Run", value: draws.length },
    { label: "Winner Records", value: winners.length },
  ];

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="mx-auto max-w-6xl py-16">
          <div className="panel-card">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <header className="hero-banner">
          <div>
            <span className="eyebrow">Admin Console</span>
            <h1 className="hero-title">Operations, draws, and payouts in one view.</h1>
            <p className="hero-copy">
              Monitor members, run the monthly draw, and move winners through verification and payout.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="ghost-button" onClick={handleLogout}>
              Logout
            </button>
            <button className="secondary-button" onClick={fetchData}>
              Refresh
            </button>
            <button className="primary-button" onClick={runDraw} disabled={isRunningDraw}>
              {isRunningDraw ? "Running Draw..." : "Run Monthly Draw"}
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="panel-title">Members</h2>
                <p className="panel-subtitle">Registered users currently in the platform.</p>
              </div>
              <span className="pill pill-muted">{users.length} users</span>
            </div>

            <div className="mt-6 space-y-3">
              {users.map((u) => (
                <div key={u._id} className="list-row">
                  <div>
                    <p className="font-semibold text-slate-900">{u.name}</p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                  </div>
                  <span className={`pill ${u.role === "admin" ? "pill-warning" : "pill-muted"}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="panel-title">Draw History</h2>
                <p className="panel-subtitle">Recent draw records and pool details.</p>
              </div>
              <span className="pill pill-muted">{draws.length} draws</span>
            </div>

            <div className="mt-6 space-y-4">
              {draws.length ? (
                draws.map((draw) => (
                  <article key={draw._id} className="sub-card">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-500">
                          {draw.month}/{draw.year}
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          Winning Numbers: {draw.winningNumbers.join(", ")}
                        </p>
                      </div>
                      <span className={`pill ${draw.status === "completed" ? "pill-success" : "pill-warning"}`}>
                        {draw.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      Prize Pool {draw.totalPool} | Charity {draw.charityAmount} | Rollover {draw.rolloverAmount}
                    </p>
                  </article>
                ))
              ) : (
                <p className="empty-state">No draws have been run yet.</p>
              )}
            </div>
          </article>
        </section>

        <section className="panel-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="panel-title">Winner Management</h2>
              <p className="panel-subtitle">Review submitted proof, verify winners, and mark payouts as paid.</p>
            </div>
            <span className="pill pill-muted">{winners.length} winners</span>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {winners.length ? (
              winners.map((winner) => (
                <article key={winner._id} className="sub-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{winner.userId?.name || "Unknown User"}</p>
                      <p className="text-sm text-slate-500">{winner.userId?.email || "No email available"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`pill ${winner.verified ? "pill-success" : "pill-warning"}`}>
                        {winner.verified ? "Verified" : "Pending Verification"}
                      </span>
                      <span className={`pill ${winner.payoutStatus === "paid" ? "pill-success" : "pill-muted"}`}>
                        {winner.payoutStatus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Position</p>
                      <p className="text-lg font-semibold text-slate-900">{winner.position}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Prize</p>
                      <p className="text-lg font-semibold text-slate-900">{winner.prize}</p>
                    </div>
                  </div>

                  <p className="mt-4 break-all text-sm text-slate-500">
                    Proof: {winner.proof || "Not submitted yet"}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className="secondary-button"
                      onClick={() => verifyWinner(winner._id)}
                      disabled={winner.verified}
                    >
                      {winner.verified ? "Verified" : "Verify Winner"}
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => markPaid(winner._id)}
                      disabled={!winner.verified || winner.payoutStatus === "paid"}
                    >
                      {winner.payoutStatus === "paid" ? "Paid" : "Mark as Paid"}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-state">No winners to manage yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;
