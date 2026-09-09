import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowUpRight,
  Car,
  Clock3,
  Network,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { getTips, getConnections, getDashboardSummary, getDashboardActivity } from "../api";
import { useAuth } from "../AuthContext";

import StatCard from "../components/StatCard";
import TipCard from "../components/TipCard";
import Modal from "../components/Modal";
import NetworkGraph from "../components/NetworkGraph";

export default function Dashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [tips, setTips] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedTip, setSelectedTip] =
    useState(null);

  const [refreshing, setRefreshing] =
    useState(false);

  const [networkConnections, setNetworkConnections] =
    useState([]);

  const [networkLoading, setNetworkLoading] =
    useState(false);

  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [activity, setActivity] = useState([]);

  async function loadTips() {
    try {
      setRefreshing(true);

      const data =
        await getTips(token);

      setTips(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadTips();
  }, []);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      getDashboardSummary(token),
      getDashboardActivity(token),
    ]).then(([summaryResult, activityResult]) => {
      if (!active) return;

      if (summaryResult.status === "fulfilled") {
        setDashboardSummary(summaryResult.value);
      }

      if (activityResult.status === "fulfilled") {
        const value = activityResult.value;
        setActivity(Array.isArray(value) ? value : Array.isArray(value?.activity) ? value.activity : []);
      }
    });

    return () => { active = false; };
  }, [token]);

  const metrics = useMemo(() => {
    const pending = tips.filter(
      (t) => t.status === "pending"
    ).length;

    const imageEvidence =
      tips.filter(
        (t) => t.hasImage
      ).length;

    const vehicles = new Set(
      tips
        .map(
          (t) =>
            t.vehicleRegistration
        )
        .filter(Boolean)
    );

    return {
      total: tips.length,
      pending,
      imageEvidence,
      vehicles: vehicles.size,
    };
  }, [tips]);

  const latestTips = tips.slice(0, 4);

  const latestVehicle =
    latestTips.find(
      (t) => t.vehicleRegistration
    )?.vehicleRegistration ||
    "";

  useEffect(() => {
    async function loadNetworkConnections() {
      if (!latestVehicle) {
        setNetworkConnections([]);
        return;
      }

      try {
        setNetworkLoading(true);

        const data =
          await getConnections(token, latestVehicle);

        console.log(
          "NETWORK CONNECTIONS:",
          data
        );

        // Support both:
        // [ ... ]
        // and
        // { connections: [ ... ] }
        if (Array.isArray(data)) {
          setNetworkConnections(data);
        } else if (
          Array.isArray(data?.connections)
        ) {
          setNetworkConnections(
            data.connections
          );
        } else {
          setNetworkConnections([]);
        }
      } catch (err) {
        console.error(
          "Failed to load network connections:",
          err
        );

        setNetworkConnections([]);
      } finally {
        setNetworkLoading(false);
      }
    }

    loadNetworkConnections();
  }, [latestVehicle, token]);

  return (
    <div className="dashboard-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">
            OPERATIONAL OVERVIEW
          </div>

          <h2 className="page-title">
            Intelligence Dashboard
          </h2>

          <p className="page-subtitle">
            Live citizen intelligence,
            network relationships and
            investigation activity.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadTips}
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "spin"
                : ""
            }
          />
          REFRESH
        </button>
      </div>

      <div className="stat-grid">
        <StatCard
          label="TOTAL TIPS"
          value={metrics.total}
          meta="Live backend records"
          icon={<Activity size={18} />}
        />

        <StatCard
          label="PENDING REVIEW"
          value={metrics.pending}
          meta="Require officer attention"
          icon={<Clock3 size={18} />}
          accent="amber"
        />

        <StatCard
          label="IMAGE EVIDENCE"
          value={metrics.imageEvidence}
          meta="Citizen attachments"
          icon={<ShieldCheck size={18} />}
          accent="green"
        />

        <StatCard
          label="VEHICLES IDENTIFIED"
          value={metrics.vehicles}
          meta="Unique registrations"
          icon={<Car size={18} />}
          accent="purple"
        />
      </div>

      <div className="dashboard-main-grid">
        <section className="intel-panel graph-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                NETWORK INTELLIGENCE
              </div>

              <h3>
                Relationship overview
              </h3>
            </div>

            <button
              className="text-button"
              onClick={() =>
                navigate("/network")
              }
            >
              OPEN ANALYSIS
              <ArrowUpRight size={15} />
            </button>
          </div>

          {latestVehicle ? (
            networkLoading ? (
              <div className="empty-graph">
                <Network size={42} />

                <strong>
                  Loading network intelligence...
                </strong>

                <span>
                  Resolving relationships for{" "}
                  <span className="mono">
                    {latestVehicle}
                  </span>
                </span>
              </div>
            ) : (
              <NetworkGraph
                registration={latestVehicle}
                connections={networkConnections}
              />
            )
          ) : (
            <div className="empty-graph">
              <Network size={42} />

              <strong>
                No vehicle intelligence
                loaded
              </strong>

              <span>
                Submit or receive a citizen
                tip containing a vehicle
                registration to begin
                analysis.
              </span>

              <button
                className="secondary-button"
                onClick={() =>
                  navigate("/network")
                }
              >
                OPEN NETWORK ANALYSIS
              </button>
            </div>
          )}
        </section>

        <section className="intel-panel activity-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                CITIZEN INTELLIGENCE
              </div>

              <h3>
                Latest reports
              </h3>
            </div>

            <button
              className="icon-button subtle"
              onClick={() =>
                navigate("/tips")
              }
            >
              <ArrowUpRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              Loading intelligence...
            </div>
          ) : latestTips.length ? (
            <div className="tip-list compact">
              {latestTips.map((tip) => (
                <TipCard
                  key={
                    tip.tipId ||
                    `${tip.submittedAt}-${Math.random()}`
                  }
                  tip={tip}
                  onOpen={setSelectedTip}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Users size={28} />

              <strong>
                No citizen tips yet
              </strong>

              <span>
                Incoming reports will
                appear here automatically.
              </span>
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-bottom-grid">
        <section className="intel-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                SYSTEM ACTIVITY
              </div>

              <h3>
                Operational status
              </h3>
            </div>
          </div>

          <div className="system-table">
            {dashboardSummary && (
              <div>
                <span>BACKEND SUMMARY</span>
                <strong>{typeof dashboardSummary === "object" ? "AVAILABLE" : "SYNCED"}</strong>
              </div>
            )}
            <div>
              <span>API CONNECTION</span>
              <strong className="online">
                ONLINE
              </strong>
            </div>

            <div>
              <span>AUTHENTICATION</span>
              <strong className="online">
                JWT ACTIVE
              </strong>
            </div>

            <div>
              <span>TIP PIPELINE</span>
              <strong className="online">
                OPERATIONAL
              </strong>
            </div>

            <div>
              <span>NETWORK ENGINE</span>
              <strong>
                NEO4J GRAPH
              </strong>
            </div>
          </div>
        </section>

        <section className="intel-panel quick-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                QUICK ACTIONS
              </div>

              <h3>
                Investigation tools
              </h3>
            </div>
          </div>

          <div className="quick-actions">
            <button
              onClick={() =>
                navigate("/network")
              }
            >
              <Network size={19} />
              <span>
                <strong>
                  Network Analysis
                </strong>
                <small>
                  Trace vehicle
                  relationships
                </small>
              </span>
              <ArrowUpRight size={16} />
            </button>

            <button
              onClick={() =>
                navigate("/tips")
              }
            >
              <Activity size={19} />
              <span>
                <strong>
                  Citizen Tips
                </strong>
                <small>
                  Review incoming
                  intelligence
                </small>
              </span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </section>
      </div>

      <Modal
        open={Boolean(selectedTip)}
        title="Citizen Intelligence"
        onClose={() =>
          setSelectedTip(null)
        }
      >
        {selectedTip && (
          <div>
            <div className="detail-status-row">
              <span
                className={`status-badge ${selectedTip.status ||
                  "pending"
                  }`}
              >
                {selectedTip.status ||
                  "PENDING"}
              </span>

              {selectedTip.vehicleRegistration && (
                <span className="mono">
                  {
                    selectedTip.vehicleRegistration
                  }
                </span>
              )}
            </div>

            <h3 className="detail-title">
              {selectedTip.tipText}
            </h3>

            <div className="detail-grid">
              <div>
                <span>Citizen</span>
                <strong>
                  {selectedTip.citizenName ||
                    "Anonymous"}
                </strong>
              </div>

              <div>
                <span>Evidence</span>
                <strong>
                  {selectedTip.hasImage
                    ? "IMAGE ATTACHED"
                    : "TEXT ONLY"}
                </strong>
              </div>
            </div>

            {selectedTip.vehicleRegistration && (
              <button
                className="primary-button full"
                onClick={() => {
                  setSelectedTip(null);
                  navigate(
                    `/network?vehicle=${encodeURIComponent(
                      selectedTip.vehicleRegistration
                    )}`
                  );
                }}
              >
                ANALYZE VEHICLE
                <ArrowUpRight size={17} />
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}