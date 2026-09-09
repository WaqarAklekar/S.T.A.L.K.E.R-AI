import React, {
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Shield,
  Upload,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { submitTip, submitRiskReport } from "../api";

export default function CitizenTip() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [name, setName] =
    useState("");

  const [reportType, setReportType] = useState("intelligence");
  const [address, setAddress] = useState("");

  const [tip, setTip] =
    useState("");

  const [registration, setRegistration] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [preview, setPreview] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  function chooseFile(e) {
    const selected =
      e.target.files?.[0];

    if (!selected) return;

    if (
      ![
        "image/jpeg",
        "image/png",
      ].includes(selected.type)
    ) {
      setError(
        "Only JPG and PNG images are accepted."
      );
      return;
    }

    setFile(selected);
    setPreview(
      URL.createObjectURL(selected)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!tip.trim()) {
      setError(
        "Please describe what you observed."
      );
      return;
    }

    if (reportType === "risk" && !address.trim()) {
      setError("Please provide the location/address for a Safe-Mesh report.");
      return;
    }

    try {
      setLoading(true);

      if (reportType === "risk") {
        await submitRiskReport({
          address,
          description: tip,
        });
      } else {
        await submitTip({
          citizenName: name,
          tipText: tip,
          registration,
          file,
        });
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to submit report."
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="citizen-page">
        <div className="citizen-success">
          <div className="success-icon">
            <CheckCircle2 size={42} />
          </div>

          <div className="eyebrow">
            REPORT RECEIVED
          </div>

          <h1>
            Intelligence received.
          </h1>

          <p>
            Your report has been securely
            submitted to the intelligence
            workspace. Thank you for
            helping keep the community
            safer.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/login")}
          >
            RETURN TO PORTAL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="citizen-page">
      <div className="citizen-header">
        <button
          className="back-button"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft size={17} />
          BACK
        </button>

        <div className="citizen-brand">
          <Shield size={18} />
          S.T.A.L.K.E.R. AI
        </div>
      </div>

      <div className="citizen-layout">
        <section className="citizen-intro">
          <div className="eyebrow">
            CITIZEN INTELLIGENCE
          </div>

          <h1>
            Your observation
            <br />
            <span>could matter.</span>
          </h1>

          <p>
            Report suspicious activity,
            vehicles or observations
            directly to authorized
            officials.
          </p>

          <div className="citizen-points">
            <div>
              <CheckCircle2 size={16} />
              No citizen login required
            </div>

            <div>
              <CheckCircle2 size={16} />
              Optional identity
            </div>

            <div>
              <CheckCircle2 size={16} />
              Optional image evidence
            </div>
          </div>
        </section>

        <form
          className="citizen-form-panel"
          onSubmit={handleSubmit}
        >
          <div className="eyebrow">
            NEW REPORT
          </div>

          <div className="filter-group" style={{ marginBottom: 14 }}>
            <button type="button" className={reportType === "intelligence" ? "filter-active" : ""} onClick={() => setReportType("intelligence")}>INTELLIGENCE TIP</button>
            <button type="button" className={reportType === "risk" ? "filter-active" : ""} onClick={() => setReportType("risk")}>SAFE-MESH RISK</button>
          </div>

          <h2>{reportType === "risk" ? "Report a safety risk" : "Submit intelligence"}</h2>

          <p className="form-description">
            Provide only information
            relevant to the observation.
          </p>

          <label>
            YOUR NAME
            <span className="optional">
              OPTIONAL
            </span>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Anonymous"
            />
          </label>

          {reportType === "risk" && (
            <label>
              LOCATION / ADDRESS
              <span className="required">REQUIRED</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Kalyan Railway Station, Maharashtra"
              />
            </label>
          )}

          {reportType === "intelligence" && (
          <label>
            VEHICLE REGISTRATION
            <span className="optional">
              OPTIONAL
            </span>

            <input
              value={registration}
              onChange={(e) =>
                setRegistration(
                  e.target.value.toUpperCase()
                )
              }
              placeholder="e.g. MH05AB1234"
            />
          </label>
          )}

          <label>
            OBSERVATION
            <span className="required">
              REQUIRED
            </span>

            <textarea
              rows="6"
              value={tip}
              onChange={(e) =>
                setTip(e.target.value)
              }
              placeholder="Describe what you observed..."
            />
          </label>

          {reportType === "intelligence" && <div className="upload-area">
            {preview ? (
              <div className="upload-preview">
                <img
                  src={preview}
                  alt="Evidence preview"
                />

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview("");
                  }}
                >
                  REMOVE
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="upload-button"
                onClick={() =>
                  fileRef.current?.click()
                }
              >
                <ImagePlus size={22} />

                <span>
                  <strong>
                    Attach image evidence
                  </strong>

                  <small>
                    JPG or PNG • Optional
                  </small>
                </span>

                <Upload size={16} />
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              hidden
              onChange={chooseFile}
            />
          </div>}

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <button
            className="primary-button full"
            disabled={loading}
          >
            {loading
              ? "SUBMITTING..."
              : "SUBMIT INTELLIGENCE"}
          </button>

          <div className="privacy-note">
            Your submission is transmitted
            to the S.T.A.L.K.E.R. AI
            intelligence system.
          </div>
        </form>
      </div>
    </div>
  );
}