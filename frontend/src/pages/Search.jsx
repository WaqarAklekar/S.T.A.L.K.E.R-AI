import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowUpRight,
  Car,
  Lightbulb,
  Search as SearchIcon,
  User,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { search as globalSearch } from "../api";
import { useAuth } from "../AuthContext";

export default function Search() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [params] =
    useSearchParams();

  const [query, setQuery] =
    useState(
      params.get("q") || ""
    );

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const q = query.trim();

  useEffect(() => {
    if (!q) {
      setResults([]);
      setError("");
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    globalSearch(token, q)
      .then((data) => {
        if (!active) return;
        const rows = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
        setResults(rows);
      })
      .catch((err) => {
        if (active) {
          setResults([]);
          setError(err.message || "Unable to search intelligence.");
        }
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [q, token]);

  function search(e) {
    e.preventDefault();

    navigate(
      `/search?q=${encodeURIComponent(
        query
      )}`
    );
  }

  return (
    <div className="content-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">
            GLOBAL INTELLIGENCE SEARCH
          </div>

          <h2 className="page-title">
            Search
          </h2>
        </div>
      </div>

      <form
        className="analysis-search"
        onSubmit={search}
      >
        <SearchIcon size={18} />

        <input
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder="Search tips, people or vehicle registrations..."
        />

        <button className="primary-button">
          SEARCH
        </button>
      </form>

      {!q ? (
        <div className="search-hint">
          Search across the intelligence
          currently available to the
          frontend.
        </div>
      ) : (
        <section className="intel-panel">
          {error && <div className="error-box">{error}</div>}

          <div className="panel-header">
            <div>
              <div className="eyebrow">
                RESULTS
              </div>

              <h3>
                {loading ? "SEARCHING…" : `${results.length} matches`}
              </h3>
            </div>
          </div>

          <div className="search-results">
            {results.map((item, index) => {
              const type = String(item?.labels?.[0] || item?.type || item?.entityType || "").toLowerCase();
              const registration = item?.registration || item?.vehicleRegistration;
              const isVehicle = Boolean(registration) || type.includes("vehicle");
              const isPerson = type.includes("person");

              return (
                <button
                  className="search-result"
                  key={item?.id || `${item?.name || "result"}-${index}`}
                  onClick={() => {
                    if (isVehicle) {
                      navigate(`/network?vehicle=${encodeURIComponent(registration || item?.name || "")}`);
                    } else if (isPerson) {
                      navigate("/people");
                    } else {
                      navigate("/tips");
                    }
                  }}
                >
                  <div className="search-result-icon">
                    {isVehicle ? <Car size={17} /> : isPerson ? <User size={17} /> : <Lightbulb size={17} />}
                  </div>

                  <div>
                    <strong>
                      {item?.name || item?.tipText || item?.label || "Unnamed intelligence entity"}
                    </strong>
                    <span>
                      {registration || item?.citizenName || (Array.isArray(item?.labels) ? item.labels.join(" / ") : "Intelligence entity")}
                    </span>
                  </div>

                  <ArrowUpRight size={16} />
                </button>
              );
            })}

            {!results.length && (
              <div className="empty-state">
                No matching intelligence
                found.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}