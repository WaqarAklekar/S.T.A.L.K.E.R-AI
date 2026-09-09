import React, {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  Clock,
  Database,
  Network,
  RefreshCw,
} from "lucide-react";

import { getTips, getDashboardActivity } from "../api";
import { useAuth } from "../AuthContext";

export default function History() {
  const { token } = useAuth();

  const [tips, setTips] =
    useState([]);

  const [activity, setActivity] = useState([]);

  const [localEvents, setLocalEvents] =
    useState(
      () =>
        JSON.parse(
          localStorage.getItem(
            "stalker_history"
          ) || "[]"
        )
    );

  useEffect(() => {
    let active = true;
    Promise.allSettled([getTips(token), getDashboardActivity(token)]).then(([tipsResult, activityResult]) => {
      if (!active) return;
      if (tipsResult.status === "fulfilled") setTips(Array.isArray(tipsResult.value) ? tipsResult.value : []);
      if (activityResult.status === "fulfilled") {
        const value = activityResult.value;
        setActivity(Array.isArray(value) ? value : Array.isArray(value?.activity) ? value.activity : []);
      }
    });
    return () => { active = false; };
  }, [token]);

  const events = [
    ...activity.slice(0, 12).map((item) => ({
      type: item.type || "SYSTEM",
      title: item.title || item.action || item.event || "System activity",
      detail: item.detail || item.description || item.name || "Backend activity",
      time: item.time || item.timestamp || item.createdAt,
    })),
    ...tips.slice(0, 8).map(
      (tip) => ({
        type: "TIP",
        title:
          "Citizen intelligence received",
        detail:
          tip.vehicleRegistration ||
          "General observation",
        time:
          tip.submittedAt,
      })
    ),
    ...localEvents,
  ].slice(0, 20);

  return (
    <div className="content-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">
            AUDIT TRAIL
          </div>

          <h2 className="page-title">
            Investigation History
          </h2>

          <p className="page-subtitle">
            Recent intelligence and
            workspace activity.
          </p>
        </div>

        <div className="live-label">
          <span className="status-dot" />
          LIVE
        </div>
      </div>

      <section className="intel-panel">
        <div className="history-list">
          {events.length ? (
            events.map(
              (event, index) => (
                <div
                  className="history-item"
                  key={index}
                >
                  <div className="history-icon">
                    {event.type ===
                    "TIP" ? (
                      <Activity
                        size={16}
                      />
                    ) : event.type ===
                      "NETWORK" ? (
                      <Network
                        size={16}
                      />
                    ) : (
                      <Database
                        size={16}
                      />
                    )}
                  </div>

                  <div className="history-content">
                    <strong>
                      {event.title}
                    </strong>

                    <span>
                      {event.detail}
                    </span>
                  </div>

                  <div className="history-time">
                    <Clock size={13} />
                    {event.time
                      ? new Date(
                          event.time
                        ).toLocaleString()
                      : "RECENT"}
                  </div>
                </div>
              )
            )
          ) : (
            <div className="empty-state">
              <Activity size={28} />
              No activity recorded yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}