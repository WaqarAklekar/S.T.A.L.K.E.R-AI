import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  Flag,
  Image as ImageIcon,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  User,
  XCircle,
} from "lucide-react";

import {
  getTip,
  getTipImage,
  getTips,
  updateTipStatus,
} from "../api";

import { useAuth } from "../AuthContext";
import TipCard from "../components/TipCard";
import Modal from "../components/Modal";

function formatDate(value) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Tips() {
  const { token } = useAuth();

  const [tips, setTips] = useState([]);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");

  const [selected, setSelected] =
    useState(null);

  const [imageUrl, setImageUrl] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const data = await getTips(
        token,
        status
      );

      setTips(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load citizen intelligence."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function openTip(tip) {
    setDetailLoading(true);
    setError("");

    try {
      const detail = await getTip(
        token,
        tip.tipId
      );

      setSelected(detail);

      if (detail?.hasImage) {
        try {
          const url =
            await getTipImage(
              token,
              tip.tipId
            );

          setImageUrl(url);
        } catch {
          setImageUrl("");
        }
      } else {
        setImageUrl("");
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to open intelligence report."
      );

      setSelected(tip);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeTip() {
    setSelected(null);

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setImageUrl("");
  }

  async function changeStatus(nextStatus) {
    if (!selected?.tipId) return;

    setActionLoading(true);

    try {
      const updated =
        await updateTipStatus(
          token,
          selected.tipId,
          nextStatus
        );

      setSelected((current) => ({
        ...current,
        ...(updated || {}),
        status: nextStatus,
      }));

      setTips((current) =>
        current.map((tip) =>
          tip.tipId === selected.tipId
            ? {
                ...tip,
                ...(updated || {}),
                status: nextStatus,
              }
            : tip
        )
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to update tip status."
      );
    } finally {
      setActionLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase();

    if (!q) return tips;

    return tips.filter((tip) =>
      [
        tip.tipText,
        tip.text,
        tip.citizenName,
        tip.vehicleRegistration,
        tip.registration,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(q)
        )
    );
  }, [tips, query]);

  return (
    <div className="content-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">
            INCOMING INTELLIGENCE
          </div>

          <h2 className="page-title">
            Citizen Tip Inbox
          </h2>

          <p className="page-subtitle">
            Review citizen-sourced observations,
            evidence and vehicle intelligence.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={load}
        >
          <RefreshCw
            size={15}
            className={
              loading ? "spin" : ""
            }
          />

          REFRESH
        </button>
      </div>

      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search intelligence..."
          />
        </div>

        <div className="filter-group">
          {[
            ["", "ALL"],
            ["pending", "PENDING"],
            ["investigating", "INVESTIGATING"],
            ["verified", "VERIFIED"],
            ["rejected", "REJECTED"],
          ].map(
            ([value, label]) => (
              <button
                key={value}
                className={
                  status === value
                    ? "filter-active"
                    : ""
                }
                onClick={() =>
                  setStatus(value)
                }
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="error-box">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state large">
          Loading citizen intelligence...
        </div>
      ) : filtered.length ? (
        <div className="tip-list">
          {filtered.map((tip) => (
            <TipCard
              key={tip.tipId}
              tip={tip}
              onOpen={openTip}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state large">
          <ShieldAlert size={34} />

          <strong>
            No intelligence found
          </strong>

          <span>
            Try another search or filter.
          </span>
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        title="Intelligence Report"
        eyebrow="CITIZEN INTELLIGENCE"
        onClose={closeTip}
        fullscreen
      >
        {detailLoading ? (
          <div className="loading-state large">
            Loading intelligence record...
          </div>
        ) : (
          selected && (
            <div className="investigation-report">
              <div className="report-main">
                <div className="detail-status-row">
                  <span
                    className={`status-badge ${
                      selected.status ||
                      "pending"
                    }`}
                  >
                    {(
                      selected.status ||
                      "PENDING"
                    ).toUpperCase()}
                  </span>

                  {selected.tipId && (
                    <span className="report-id">
                      TIP/
                      {selected.tipId
                        .slice(0, 8)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <h3 className="detail-title">
                  {selected.tipText ||
                    selected.text ||
                    "No description provided"}
                </h3>

                {imageUrl ? (
                  <div className="evidence-viewer">
                    <div className="evidence-viewer-header">
                      <span>
                        <ImageIcon size={15} />
                        ATTACHED EVIDENCE
                      </span>

                      <span>
                        ORIGINAL UPLOAD
                      </span>
                    </div>

                    <img
                      src={imageUrl}
                      alt="Citizen submitted evidence"
                    />
                  </div>
                ) : (
                  <div className="no-evidence">
                    <ImageIcon size={24} />

                    <strong>
                      No image evidence attached
                    </strong>

                    <span>
                      This intelligence record
                      contains text data only.
                    </span>
                  </div>
                )}
              </div>

              <aside className="report-sidebar">
                <div className="intel-section">
                  <div className="eyebrow">
                    RECORD DETAILS
                  </div>

                  <div className="intel-field">
                    <User size={15} />

                    <div>
                      <span>
                        SUBMITTED BY
                      </span>

                      <strong>
                        {selected.citizenName ||
                          "Anonymous citizen"}
                      </strong>
                    </div>
                  </div>

                  <div className="intel-field">
                    <Car size={15} />

                    <div>
                      <span>
                        VEHICLE
                      </span>

                      <strong className="mono">
                        {selected.vehicleRegistration ||
                          selected.registration ||
                          "Not supplied"}
                      </strong>
                    </div>
                  </div>

                  <div className="intel-field">
                    <Clock size={15} />

                    <div>
                      <span>
                        SUBMITTED
                      </span>

                      <strong>
                        {formatDate(
                          selected.submittedAt
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="intel-field">
                    <FileText size={15} />

                    <div>
                      <span>
                        EVIDENCE
                      </span>

                      <strong>
                        {selected.hasImage
                          ? "IMAGE ATTACHED"
                          : "TEXT ONLY"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="intel-section">
                  <div className="eyebrow">
                    OFFICER ACTION
                  </div>

                  <button
                    className="primary-button full"
                    disabled={
                      actionLoading ||
                      selected.status ===
                        "verified"
                    }
                    onClick={() =>
                      changeStatus("verified")
                    }
                  >
                    <CheckCircle2
                      size={16}
                    />
                    VERIFY INTELLIGENCE
                  </button>

                  <button
                    className="secondary-button full"
                    disabled={actionLoading}
                    onClick={() =>
                      changeStatus("rejected")
                    }
                  >
                    <XCircle size={16} />
                    REJECT
                  </button>

                  <button
                    className="secondary-button full"
                    disabled={actionLoading}
                    onClick={() =>
                      changeStatus("reviewed")
                    }
                  >
                    <Flag size={16} />
                    MARK REVIEWED
                  </button>
                </div>

                <div className="intel-section">
                  <div className="eyebrow">
                    INVESTIGATION LINK
                  </div>

                  <div className="investigation-link">
                    <MapPin size={17} />

                    <div>
                      <strong>
                        Vehicle Intelligence
                      </strong>

                      <span>
                        Open the related vehicle
                        network when a registration
                        is available.
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}