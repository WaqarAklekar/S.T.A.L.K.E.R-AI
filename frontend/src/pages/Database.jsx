import React, {
  useEffect,
  useState,
} from "react";

import {
  Database as DatabaseIcon,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { getTips } from "../api";
import { useAuth } from "../AuthContext";

export default function Database() {
  const { token } = useAuth();

  const [tips, setTips] =
    useState([]);

  useEffect(() => {
    getTips(token)
      .then((data) =>
        setTips(
          Array.isArray(data)
            ? data
            : []
        )
      )
      .catch(console.error);
  }, []);

  return (
    <div className="content-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">
            DATA REPOSITORY
          </div>

          <h2 className="page-title">
            Intelligence Database
          </h2>

          <p className="page-subtitle">
            Current records exposed by
            the intelligence backend.
          </p>
        </div>
      </div>

      <section className="intel-panel">
        <div className="panel-header">
          <div>
            <div className="eyebrow">
              CITIZEN TIP RECORDS
            </div>

            <h3>
              {tips.length} records
            </h3>
          </div>

          <DatabaseIcon size={19} />
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>TIP</th>
                <th>VEHICLE</th>
                <th>STATUS</th>
                <th>EVIDENCE</th>
              </tr>
            </thead>

            <tbody>
              {tips.map((tip) => (
                <tr key={tip.tipId}>
                  <td>
                    {tip.tipText}
                  </td>

                  <td className="mono">
                    {tip.vehicleRegistration ||
                      "—"}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        tip.status ||
                        "pending"
                      }`}
                    >
                      {tip.status ||
                        "PENDING"}
                    </span>
                  </td>

                  <td>
                    {tip.hasImage ? (
                      <ShieldCheck
                        size={16}
                      />
                    ) : (
                      "TEXT"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}