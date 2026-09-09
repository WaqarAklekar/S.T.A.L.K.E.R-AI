const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://stalker-2160.onrender.com"
).replace(/\/$/, "");

export const getApiUrl = () => API_URL;

function authHeaders(token, extra = {}) {
  return {
    ...extra,
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await parseResponse(response);

if (!response.ok) {
  const message =
    typeof data === "object"
      ? data?.error ||
        data?.message ||
        data?.detail
      : data;

  const error = new Error(
    message ||
      `Request failed with ${response.status}`
  );

  error.status = response.status;
  error.data = data;

  throw error;

  }

  return data;
}

/* =========================================================
   AUTH / SYSTEM
========================================================= */

export async function login(username, password) {
  return request("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

// Legacy/auxiliary route documented by the backend.
export async function officerLogin() {
  return request("/officerLogin");
}

export async function healthCheck() {
  return request("/health");
}

/* =========================================================
   CITIZEN TIPS
========================================================= */

export async function submitTip({
  citizenName,
  tipText,
  registration,
  file,
}) {
  if (!tipText?.trim()) {
    throw new Error("Tip text is required.");
  }

  if (file) {
    const formData = new FormData();

    if (citizenName?.trim()) formData.append("citizenName", citizenName.trim());
    formData.append("tipText", tipText.trim());
    if (registration?.trim()) {
      formData.append("registration", registration.trim().toUpperCase());
    }
    formData.append("file", file);

    return request("/tips", { method: "POST", body: formData });
  }

  return request("/tips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(citizenName?.trim() ? { citizenName: citizenName.trim() } : {}),
      tipText: tipText.trim(),
      ...(registration?.trim()
        ? { registration: registration.trim().toUpperCase() }
        : {}),
    }),
  });
}

export async function getTips(token, status = "") {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request(`/tips${query}`, { headers: authHeaders(token) });
}

// Tip detail and image are public according to the backend documentation.
export async function getTip(_token, id) {
  return request(`/tips/${encodeURIComponent(id)}`);
}

export async function getTipImage(_token, id) {
  const response = await fetch(`${API_URL}/tips/${encodeURIComponent(id)}/image`);

  if (!response.ok) {
    let message = "Unable to load image";
    try {
      const data = await response.json();
      message = data?.error || data?.message || message;
    } catch {
      // Non-JSON error response.
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return URL.createObjectURL(await response.blob());
}

export async function updateTipStatus(token, id, status) {
  return request(`/tips/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  });
}

/* =========================================================
   SAFE-MESH RISK REPORTS
========================================================= */

export async function submitRiskReport({ address, description }) {
  if (!address?.trim()) throw new Error("Address is required.");
  if (!description?.trim()) throw new Error("Description is required.");

  return request("/risk-reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: address.trim(),
      description: description.trim(),
    }),
  });
}

export async function getPendingRiskReports(token) {
  return request("/risk-reports", {
    headers: authHeaders(token),
  });
}

export async function approveRiskReport(token, id) {
  return request(`/risk-reports/${encodeURIComponent(id)}/approve`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export async function rejectRiskReport(token, id) {
  return request(`/risk-reports/${encodeURIComponent(id)}/reject`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export async function getApprovedRiskReports() {
  try {
    return await request("/risk-reports/approved");
  } catch (error) {
    throw error;
  }
}

/* =========================================================
   DASHBOARD / ANALYTICS
========================================================= */

export async function getDashboardSummary(token) {
  return request("/dashboard/summary", { headers: authHeaders(token) });
}

export async function getDashboardActivity(token) {
  return request("/dashboard/activity", { headers: authHeaders(token) });
}

export async function getAnalyticsOverview(token) {
  return request("/analytics/overview", { headers: authHeaders(token) });
}

/* =========================================================
   CASES / FIR DATA
========================================================= */

export async function getCases(token) {
  return request("/cases", { headers: authHeaders(token) });
}

export async function getCase(token, id) {
  return request(`/cases/${encodeURIComponent(id)}`, {
    headers: authHeaders(token),
  });
}

/* =========================================================
   PEOPLE / SUSPECTS
========================================================= */

export async function getPeople(token) {
  return request("/people", { headers: authHeaders(token) });
}

export async function getPerson(token, id) {
  return request(`/people/${encodeURIComponent(id)}`, {
    headers: authHeaders(token),
  });
}

export async function getPersonConnections(token, id) {
  return request(`/people/${encodeURIComponent(id)}/connections`, {
    headers: authHeaders(token),
  });
}

export async function flagPerson(token, id, flagged) {
  if (typeof flagged !== "boolean") {
    throw new Error("flagged must be a boolean.");
  }

  return request(`/people/${encodeURIComponent(id)}/flag`, {
    method: "PATCH",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify({ flagged }),
  });
}

export async function getOrphanCheck(token, name) {
  if (!String(name || "").trim()) {
    throw new Error("Suspect name is required.");
  }

  return request(`/suspects/${encodeURIComponent(name.trim())}/orphan-check`, {
    headers: authHeaders(token),
  });
}

/* =========================================================
   VEHICLES
========================================================= */

export async function getVehicles(token) {
  return request("/vehicles", { headers: authHeaders(token) });
}

export async function getVehicle(token, id) {
  return request(`/vehicles/${encodeURIComponent(id)}`, {
    headers: authHeaders(token),
  });
}

export async function getVehicleConnections(token, registration) {
  const value = String(registration || "").trim().toUpperCase();
  if (!value) throw new Error("Vehicle registration is required.");

  return request(`/vehicles/${encodeURIComponent(value)}/connections`, {
    headers: authHeaders(token),
  });
}

// Backwards-compatible alias for the existing Network Analysis UI.
export async function getConnections(token, registration) {
  return getVehicleConnections(token, registration);
}

/* =========================================================
   GLOBAL CONNECTIONS
========================================================= */

export async function getAllConnections(token) {
  return request("/connections", { headers: authHeaders(token) });
}

export async function verifyConnection(token, ownerName, vehicleRegistration) {
  return request("/connections/verify", {
    method: "PATCH",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify({
      ownerName: String(ownerName || "").trim(),
      vehicleRegistration: String(vehicleRegistration || "").trim().toUpperCase(),
    }),
  });
}

/* =========================================================
   GLOBAL SEARCH
========================================================= */

export async function search(token, query) {
  const q = String(query || "").trim();
  if (!q) throw new Error("Search query is required.");

  return request(`/search?q=${encodeURIComponent(q)}`, {
    headers: authHeaders(token),
  });
}

// Explicit alias matching the backend route name.
export const globalSearch = search;
