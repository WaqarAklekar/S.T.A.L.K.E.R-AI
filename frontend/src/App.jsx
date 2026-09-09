import React from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "./AuthContext";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import CitizenTip from "./pages/CitizenTip";

import Dashboard from "./pages/Dashboard";
import NetworkAnalysis from "./pages/NetworkAnalysis";
import Tips from "./pages/Tips";
import History from "./pages/History";
import Geolocation from "./pages/Geolocation";
import Analytics from "./pages/Analytics";
import Database from "./pages/Database";
import People from "./pages/People";
import Documents from "./pages/Documents";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import RiskReports from "./pages/RiskReports";

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/network"
          element={<NetworkAnalysis />}
        />
        <Route path="/tips" element={<Tips />} />
        <Route path="/risk-reports" element={<RiskReports />} />
        <Route path="/history" element={<History />} />
        <Route
          path="/geolocation"
          element={<Geolocation />}
        />
        <Route
          path="/analytics"
          element={<Analytics />}
        />
        <Route
          path="/database"
          element={<Database />}
        />
        <Route path="/people" element={<People />} />
        <Route
          path="/documents"
          element={<Documents />}
        />
        <Route path="/search" element={<Search />} />
        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/citizen-tip" element={<CitizenTip />} />
      <Route
        path="/*"
        element={<ProtectedRoutes />}
      />
    </Routes>
  );
}