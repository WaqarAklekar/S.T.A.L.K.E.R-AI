import React, { useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-shell">
        <Topbar
          onMenu={() => setSidebarOpen(true)}
        />

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}