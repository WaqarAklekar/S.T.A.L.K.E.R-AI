import React from "react";

import {
  Car,
  ChevronRight,
  Clock,
  Image as ImageIcon,
  User,
} from "lucide-react";

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

export default function TipCard({
  tip,
  onOpen,
}) {
  const text =
    tip.tipText ||
    tip.text ||
    "No description provided";

  const registration =
    tip.vehicleRegistration ||
    tip.registration;

  return (
    <button
      type="button"
      className="tip-card"
      onClick={() => onOpen?.(tip)}
    >
      <div className="tip-card-main">
        <div className="tip-card-top">
          <span
            className={`status-badge ${
              tip.status || "pending"
            }`}
          >
            {(
              tip.status || "PENDING"
            ).toUpperCase()}
          </span>

          {tip.hasImage && (
            <span className="tip-evidence">
              <ImageIcon size={13} />
              EVIDENCE
            </span>
          )}
        </div>

        <h3>{text}</h3>

        <div className="tip-meta">
          <span>
            <User size={13} />

            {tip.citizenName ||
              "Anonymous citizen"}
          </span>

          {registration && (
            <span className="mono">
              <Car size={13} />
              {registration}
            </span>
          )}

          <span>
            <Clock size={13} />

            {formatDate(
              tip.submittedAt
            )}
          </span>
        </div>
      </div>

      <ChevronRight size={18} />
    </button>
  );
}