import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  Car,
  Image,
  Lightbulb,
  Users,
} from "lucide-react";

import { getAnalyticsOverview } from "../api";
import { useAuth } from "../AuthContext";

export default function Analytics() {
  const { token } = useAuth();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAnalyticsOverview(token)
      .then((data) => active && setOverview(data))
      .catch((err) => active && setError(err.message || "Unable to load analytics overview."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [token]);

  const stats = useMemo(() => {
    const source = overview && typeof overview === "object" ? overview : {};
    const pick = (...keys) => keys.map((key) => source[key]).find((value) => typeof value === "number") ?? 0;
    return {
      total: pick("total", "totalTips", "tips", "tipCount"),
      pending: pick("pending", "pendingTips", "pendingCount"),
      withImages: pick("withImages", "imageTips", "images", "imageCount"),
      named: pick("named", "namedPeople", "people", "peopleCount"),
      vehicleTips: pick("vehicleTips", "vehicleLinked", "vehicles", "vehicleCount"),
    };
  }, [overview]);

  const bars = [
    {
      label: "Tips",
      value: stats.total,
      icon: Lightbulb,
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: BarChart3,
    },
    {
      label: "Images",
      value: stats.withImages,
      icon: Image,
    },
    {
      label: "Vehicle linked",
      value: stats.vehicleTips,
      icon: Car,
    },
    {
      label: "Named",
      value: stats.named,
      icon: Users,
    },
  ];

  const max =
    Math.max(
      ...bars.map(
        (item) => item.value
      ),
      1
    );

  return (
    <div className="content-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">
            INTELLIGENCE METRICS
          </div>

          <h2 className="page-title">
            Analytics
          </h2>

          <p className="page-subtitle">
            Metrics calculated from live
            citizen intelligence.
          </p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? <div className="loading-state large">Loading analytics...</div> : <div className="analytics-layout">
        <section className="intel-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                TIP DISTRIBUTION
              </div>

              <h3>
                Current intelligence volume
              </h3>
            </div>
          </div>

          <div className="bar-chart">
            {bars.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="bar-item"
                  key={item.label}
                >
                  <div className="bar-value">
                    {item.value}
                  </div>

                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        height: `${Math.max(
                          8,
                          (item.value /
                            max) *
                            100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="bar-label">
                    <Icon size={13} />
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="intel-panel">
          <div className="eyebrow">
            DATA INTEGRITY
          </div>

          <h3 className="analytics-number">
            {stats.total}
          </h3>

          <p className="page-subtitle">
            Total citizen intelligence
            records returned by the
            backend.
          </p>

          <div className="integrity-row">
            <span>
              Vehicle linked
            </span>
            <strong>
              {stats.vehicleTips}
            </strong>
          </div>

          <div className="integrity-row">
            <span>
              Evidence attached
            </span>
            <strong>
              {stats.withImages}
            </strong>
          </div>

          <div className="integrity-row">
            <span>
              Pending review
            </span>
            <strong>
              {stats.pending}
            </strong>
          </div>
        </section>
      </div>}
    </div>
  );
}