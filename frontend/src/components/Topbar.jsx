import React, { useState } from "react";

import {
  Bell,
  Menu,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../AuthContext";

const titles = {
  "/dashboard": "Dashboard",
  "/database": "Database",
  "/network": "Network Analysis",
  "/people": "People",
  "/documents": "Documents",
  "/history": "History",
  "/geolocation": "Geolocation",
  "/search": "Search",
  "/analytics": "Analytics",
  "/tips": "Citizen Intelligence",
  "/settings": "Settings",
};

export default function Topbar({
  onMenu,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { officer } = useAuth();

  const [query, setQuery] = useState("");

  const title =
    titles[location.pathname] ||
    "Intelligence Workspace";

  const submitSearch = (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    navigate(
      `/search?q=${encodeURIComponent(
        query.trim()
      )}`
    );
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-button"
          onClick={onMenu}
        >
          <Menu size={20} />
        </button>

        <div>
          <div className="eyebrow">
            S.T.A.L.K.E.R. AI
          </div>

          <h1>{title}</h1>
        </div>
      </div>

      <div className="topbar-center">
        <form
          className="global-search"
          onSubmit={submitSearch}
        >
          <Search size={17} />

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search person, vehicle, tip..."
          />

          <kbd>⌘ K</kbd>
        </form>
      </div>

      <div className="topbar-actions">
        <button
          className="quick-add"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("stalker:add-case")
            )
          }
        >
          <Plus size={16} />
          <span>New Case</span>
        </button>

        <button className="icon-button">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        <div className="officer-chip">
          <div className="officer-avatar">
            {officer?.slice(0, 1).toUpperCase()}
          </div>

          <div className="officer-info">
            <strong>{officer}</strong>
            <small>
              <ShieldCheck size={11} />
              AUTHENTICATED
            </small>
          </div>
        </div>
      </div>
    </header>
  );
}