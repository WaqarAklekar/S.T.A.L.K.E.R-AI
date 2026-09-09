import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  User,
} from "lucide-react";

import { getPeople } from "../api";
import { useAuth } from "../AuthContext";

export default function People() {
  const { token } = useAuth();

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] =
    useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPeople(token)
      .then((data) => {
        if (!active) return;
        setPeople(Array.isArray(data) ? data : Array.isArray(data?.people) ? data.people : []);
      })
      .catch((err) => active && setError(err.message || "Unable to load people."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [token]);



  const filtered = people.filter(
    (person) =>
      person.name
        .toLowerCase()
        .includes(
          query.toLowerCase()
        )
  );

  return (
    <div className="content-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">
            ENTITY DIRECTORY
          </div>

          <h2 className="page-title">
            People
          </h2>

          <p className="page-subtitle">
            Named entities currently
            available from citizen
            intelligence.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search people..."
          />
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? <div className="loading-state large">Loading people records...</div> : <div className="people-grid">
        {filtered.map((person) => (
          <div
            className="person-card"
            key={person.id || person.name}
          >
            <div className="person-avatar">
              <User size={19} />
            </div>

            <div>
              <strong>
                {person.name}
              </strong>

              <span>
                {person.flagged ? "FLAGGED" : "PERSON RECORD"}
              </span>
            </div>
          </div>
        ))}

        {!filtered.length && (
          <div className="empty-state large">
            No named people found.
          </div>
        )}
      </div>}
    </div>
  );
}