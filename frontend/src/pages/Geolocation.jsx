import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  MapPin,
  RefreshCw,
  Navigation,
} from "lucide-react";

import LocationMap from "../components/LocationMap";
import { getApprovedRiskReports } from "../api";

export default function Geolocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [riskReports, setRiskReports] = useState([]);
  const [riskLoading, setRiskLoading] = useState(true);
  const [riskError, setRiskError] = useState("");

  /*
   * Load approved Safe-Mesh reports.
   *
   * According to the backend API documentation:
   * GET /risk-reports/approved
   * is public and returns ONLY APPROVED reports.
   */
  const loadRiskReports = async () => {
    setRiskLoading(true);
    setRiskError("");

    try {
      const data = await getApprovedRiskReports();

      /*
       * Backend should return an array.
       * Never allow an unexpected response to break the page.
       */
      if (Array.isArray(data)) {
        setRiskReports(data);
      } else {
        setRiskReports([]);
      }
    } catch (err) {
      console.error("SAFE-MESH LOAD ERROR:", err);

      setRiskReports([]);

      /*
       * A missing Safe-Mesh backend route should NOT
       * crash the Geolocation page.
       */
      if (
        err?.status === 404 ||
        err?.message?.includes("404")
      ) {
        setRiskError(
          "Safe-Mesh map data is currently unavailable from the backend."
        );
      } else {
        setRiskError(
          err?.message ||
            "Unable to load Safe-Mesh intelligence."
        );
      }
    } finally {
      setRiskLoading(false);
    }
  };

  useEffect(() => {
    loadRiskReports();
  }, []);

  /*
   * Get the officer's current browser location.
   */
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setLoading(false);
      },

      (err) => {
        let message = "Unable to determine your location.";

        switch (err.code) {
          case err.PERMISSION_DENIED:
            message =
              "Location permission was denied. Please allow location access in your browser.";
            break;

          case err.POSITION_UNAVAILABLE:
            message =
              "Your current location could not be determined.";
            break;

          case err.TIMEOUT:
            message =
              "Location request timed out. Please try again.";
            break;

          default:
            message = err.message || message;
        }

        setError(message);
        setLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /*
   * Convert backend Safe-Mesh reports into the marker
   * format expected by LocationMap.
   *
   * Invalid coordinates are ignored instead of crashing.
   */
  const mapMarkers = riskReports
    .filter(
      (report) =>
        typeof report?.latitude === "number" &&
        typeof report?.longitude === "number" &&
        Number.isFinite(report.latitude) &&
        Number.isFinite(report.longitude)
    )
    .map((report) => ({
      id: String(
        report.id ||
          `${report.latitude}-${report.longitude}`
      ),

      latitude: report.latitude,
      longitude: report.longitude,

      title: "APPROVED SAFE-MESH REPORT",

      description:
        report.description ||
        "Approved public safety report.",

      caseId: report.id,
    }));

  return (
    <div className="page-container">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-header">
        <div>
          <div className="eyebrow">
            S.T.A.L.K.E.R. AI / GEOLOCATION
          </div>

          <h1>Geospatial Intelligence</h1>

          <p>
            Visualize investigation locations and
            approved Safe-Mesh spatial intelligence.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            className="secondary-button"
            onClick={loadRiskReports}
            disabled={riskLoading}
            title="Refresh Safe-Mesh reports"
          >
            <RefreshCw
              size={16}
              className={
                riskLoading
                  ? "spin"
                  : ""
              }
            />

            {riskLoading
              ? "SYNCING..."
              : "REFRESH"}
          </button>

          <button
            className="primary-button"
            onClick={getLocation}
            disabled={loading}
          >
            <Navigation size={16} />

            {loading
              ? "LOCATING..."
              : "GET MY LOCATION"}
          </button>
        </div>
      </div>

      {/* =====================================================
          SAFE-MESH BACKEND WARNING
      ====================================================== */}

      {riskError && (
        <div className="error-box">
          <AlertTriangle size={16} />

          <span>{riskError}</span>
        </div>
      )}

      {/* =====================================================
          BROWSER LOCATION ERROR
      ====================================================== */}

      {error && (
        <div className="error-box">
          <AlertTriangle size={16} />

          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          CURRENT LOCATION
      ====================================================== */}

      {location && (
        <div className="location-info">

          <div>
            <span>LATITUDE</span>

            <strong>
              {location.latitude.toFixed(6)}
            </strong>
          </div>

          <div>
            <span>LONGITUDE</span>

            <strong>
              {location.longitude.toFixed(6)}
            </strong>
          </div>

          <div>
            <span>ACCURACY</span>

            <strong>
              ±{Math.round(location.accuracy)} m
            </strong>
          </div>

        </div>
      )}

      {/* =====================================================
          MAP
      ====================================================== */}

      <div className="map-card">

        <LocationMap
          latitude={location?.latitude}
          longitude={location?.longitude}
          markers={mapMarkers}
          height="520px"
        />

      </div>

      {/* =====================================================
          SAFE-MESH INTELLIGENCE PANEL
      ====================================================== */}

      <section
        className="intel-panel"
        style={{
          marginTop: "16px",
        }}
      >

        <div className="panel-header">

          <div>
            <div className="eyebrow">
              SAFE-MESH
            </div>

            <h3>
              Approved public risk intelligence
            </h3>
          </div>

          <span className="status-badge approved">

            {riskLoading
              ? "SYNCING"
              : `${riskReports.length} REPORT${
                  riskReports.length === 1
                    ? ""
                    : "S"
                }`}

          </span>

        </div>

        {/* Loading */}

        {riskLoading && (
          <div className="empty-state">
            Loading approved Safe-Mesh reports...
          </div>
        )}

        {/* Empty */}

        {!riskLoading &&
          !riskReports.length && (
            <div className="empty-state">
              No approved risk reports are
              currently available.
            </div>
          )}

        {/* Reports */}

        {!riskLoading &&
          riskReports.length > 0 && (
            <div className="history-list">

              {riskReports
                .slice(0, 8)
                .map((report, index) => {

                  const reportId = String(
                    report?.id ||
                      `risk-report-${index}`
                  );

                  return (
                    <div
                      className="history-item"
                      key={reportId}
                    >

                      <div className="history-icon">
                        <MapPin size={16} />
                      </div>

                      <div className="history-content">

                        <strong>
                          {report?.address ||
                            "Unknown location"}
                        </strong>

                        <span>
                          {report?.description ||
                            "No description provided."}
                        </span>

                      </div>

                    </div>
                  );
                })}

            </div>
          )}

      </section>

    </div>
  );
}