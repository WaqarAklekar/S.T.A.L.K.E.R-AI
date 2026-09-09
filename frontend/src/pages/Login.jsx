import React, { useState } from "react";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { login as loginApi } from "../api";
import { useAuth } from "../AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!username || !password) {
      setError(
        "Enter your officer ID and password."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await loginApi(
        username,
        password
      );

      login(data.token, username);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message ||
          "Unable to authenticate."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-noise" />

      <div className="auth-container">
        <div className="auth-brand">
          <div className="brand-mark large">
            <Shield size={25} />
          </div>

          <div>
            <div className="brand-name large-text">
              S.T.A.L.K.E.R. AI
            </div>

            <div className="brand-sub">
              CRIMINAL INTELLIGENCE PLATFORM
            </div>
          </div>
        </div>

        <div className="auth-grid">
          <section className="auth-hero">
            <div className="eyebrow">
              INTELLIGENCE WORKSPACE
            </div>

            <h1>
              See the
              <br />
              <span>connections.</span>
            </h1>

            <p>
              A graph-driven intelligence
              workspace for connecting
              citizen intelligence,
              vehicles, people and
              verified relationships.
            </p>

            <div className="hero-lines">
              <div />
              <div />
              <div />
            </div>

            <div className="hero-note">
              <span className="status-dot" />
              SECURE GOVERNMENT ACCESS
            </div>
          </section>

          <section className="login-panel">
            <div className="panel-tabs">
              <div className="panel-tab active">
                <Shield size={16} />
                OFFICIAL ACCESS
              </div>

              <button
                className="panel-tab"
                onClick={() =>
                  navigate("/citizen-tip")
                }
              >
                <Users size={16} />
                CITIZEN REPORT
              </button>
            </div>

            <div className="login-content">
              <div className="eyebrow">
                OFFICER PORTAL
              </div>

              <h2>Welcome back.</h2>

              <p>
                Sign in to access the
                S.T.A.L.K.E.R. AI
                intelligence workspace.
              </p>

              <form
                onSubmit={handleSubmit}
                className="auth-form"
              >
                <label>
                  OFFICER ID
                  <input
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                      )
                    }
                    placeholder="Enter government ID"
                    autoComplete="username"
                  />
                </label>

                <label>
                  PASSWORD

                  <div className="password-field">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Enter password"
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (v) => !v
                        )
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </label>

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
                    ? "AUTHENTICATING..."
                    : "ENTER INTELLIGENCE WORKSPACE"}

                  <ArrowRight size={18} />
                </button>
              </form>

              <div className="auth-footer">
                ACCESS RESTRICTED TO
                AUTHORIZED PERSONNEL
              </div>
            </div>
          </section>
        </div>

        <div className="auth-bottom">
          <span>
            S.T.A.L.K.E.R. AI
          </span>

          <span>
            DEVELOPED BY VECTORVISION
          </span>

          <span>
            SYSTEM BUILD 1.0
          </span>
        </div>
      </div>
    </div>
  );
}