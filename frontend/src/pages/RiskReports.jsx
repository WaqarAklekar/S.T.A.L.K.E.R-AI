import React, { useEffect, useState } from "react";
import { CheckCircle2, MapPin, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import { useAuth } from "../AuthContext";
import { approveRiskReport, getPendingRiskReports, rejectRiskReport } from "../api";

function formatDate(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function RiskReports() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getPendingRiskReports(token);
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setReports([]);
      setError(err.message || "Unable to load Safe-Mesh reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  async function review(id, action) {
    setActionId(id);
    setError("");
    try {
      if (action === "approve") await approveRiskReport(token, id);
      else await rejectRiskReport(token, id);
      setReports((current) => current.filter((report) => report.id !== id));
    } catch (err) {
      setError(err.message || "Unable to review risk report. It may already have been reviewed.");
      await load();
    } finally {
      setActionId("");
    }
  }

  return (
    <div className="content-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">SAFE-MESH / OFFICER REVIEW</div>
          <h2 className="page-title">Risk Reports</h2>
          <p className="page-subtitle">Review citizen-submitted location-based safety reports before they become public map intelligence.</p>
        </div>
        <button className="secondary-button" onClick={load} disabled={loading}>
          <RefreshCw size={15} className={loading ? "spin" : ""} /> REFRESH
        </button>
      </div>

      {error && <div className="error-box"><ShieldAlert size={16} /> {error}</div>}

      {loading ? (
        <div className="loading-state large">Loading pending Safe-Mesh reports...</div>
      ) : reports.length ? (
        <div className="tip-list">
          {reports.map((report) => (
            <article className="tip-card" key={report.id}>
              <div className="tip-card-main">
                <div className="tip-card-top">
                  <span className="status-badge pending">PENDING</span>
                  <span className="tip-evidence"><MapPin size={13} /> SAFE-MESH</span>
                </div>
                <h3>{report.description || "No description provided"}</h3>
                <div className="tip-meta">
                  <span><MapPin size={13} /> {report.address || "Unknown location"}</span>
                  <span>{formatDate(report.submitted_at)}</span>
                  {typeof report.latitude === "number" && typeof report.longitude === "number" && (
                    <span className="mono">{report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}</span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="primary-button" disabled={actionId === report.id} onClick={() => review(report.id, "approve")}>
                  <CheckCircle2 size={15} /> APPROVE
                </button>
                <button className="secondary-button" disabled={actionId === report.id} onClick={() => review(report.id, "reject")}>
                  <XCircle size={15} /> REJECT
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state large"><ShieldAlert size={34} /><strong>No pending Safe-Mesh reports</strong><span>The review queue is clear.</span></div>
      )}
    </div>
  );
}
