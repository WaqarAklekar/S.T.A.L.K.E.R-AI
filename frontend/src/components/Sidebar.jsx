import React from "react";

import {
  Activity,
  BarChart3,
  Database as DatabaseIcon,
  FileText,
  History as HistoryIcon,
  Home,
  MapPin,
  Network,
  Search,
  Settings,
  Shield,
  Users,
  X,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const mainItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Home,
  },
  {
    label: "Database",
    path: "/database",
    icon: DatabaseIcon,
  },
  {
    label: "Network Analysis",
    path: "/network",
    icon: Network,
  },
  {
    label: "People",
    path: "/people",
    icon: Users,
  },
  {
    label: "Documents",
    path: "/documents",
    icon: FileText,
  },
  {
    label: "History",
    path: "/history",
    icon: HistoryIcon,
  },
  {
    label: "Geolocation",
    path: "/geolocation",
    icon: MapPin,
  },
  {
    label: "Search",
    path: "/search",
    icon: Search,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Tips",
    path: "/tips",
    icon: Lightbulb,
  },
  {
    label: "Risk Reports",
    path: "/risk-reports",
    icon: ShieldAlert,
  },
];

export default function Sidebar({
  open,
  onClose,
}) {
  return (
    <>
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${
          open ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Shield size={20} />
          </div>

          <div>
            <div className="brand-name">
              S.T.A.L.K.E.R.
            </div>

            <div className="brand-sub">
              AI INTELLIGENCE PLATFORM
            </div>
          </div>

          <button
            className="mobile-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-heading">
            OPERATIONS
          </div>

          <nav>
            {mainItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `nav-item ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-heading">
            SYSTEM
          </div>

          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <Settings size={17} />
            <span>Settings</span>
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-dot" />
            <div>
              <strong>ALL SYSTEMS</strong>
              <small>OPERATIONAL</small>
            </div>
          </div>

          <div className="sidebar-footer-line">
            VECTORVISION
          </div>
        </div>
      </aside>
    </>
  );
}