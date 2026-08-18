const API_BASE_URL = "http://127.0.0.1:8000";

const state = {
  activeView: "overview",
  alerts: [],
  incidents: [],
  summary: {
    totalEvents: 0,
    activeAlerts: 0,
    criticalIncidents: 0,
    severity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
  },
  loading: false,
  error: "",
};

const severityKeys = ["critical", "high", "medium", "low"];

function normalizeSeverity(value) {
  const severity = String(value || "low").trim().toLowerCase();
  return severityKeys.includes(severity) ? severity : "low";
}

function normalizeStatus(value) {
  return String(value || "Unknown").trim() || "Unknown";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getCurrentNumber(el) {
  const n = parseInt(el.textContent.replace(/,/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

function animateValue(el, from, to, duration = 700) {
  if (!el) return;
  const start = performance.now();
  const numericTo = Number(to) || 0;
  const isInt = Number.isInteger(numericTo);

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = from + (numericTo - from) * eased;
    el.textContent = isInt
      ? Math.round(current).toLocaleString()
      : current.toFixed(1);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  return response.json();
}

function mapAlert(alert) {
  return {
    id: alert.alert_id ?? alert.id ?? "N/A",
    type: alert.alert_type ?? alert.type ?? "Unknown alert",
    severity: alert.severity ?? "Low",
    sourceIp: alert.source_ip ?? alert.sourceIp ?? "N/A",
  };
}

function mapIncident(incident) {
  return {
    id: incident.incident_id ?? incident.id ?? "N/A",
    type: incident.incident_type ?? incident.type ?? "Unknown incident",
    severity: incident.severity ?? "Low",
    status: incident.status ?? "Unknown",
  };
}

function mapSummary(events) {
  const severity = events.severity || {};

  return {
    totalEvents: Number(events.total_events ?? events.totalEvents ?? 0),
    activeAlerts: Number(events.active_alerts ?? events.activeAlerts ?? 0),
    criticalIncidents: Number(events.critical_incidents ?? events.criticalIncidents ?? 0),
    severity: {
      critical: Number(severity.critical ?? 0),
      high: Number(severity.high ?? 0),
      medium: Number(severity.medium ?? 0),
      low: Number(severity.low ?? 0),
    },
  };
}

function buildSeverityFromRows(alerts, incidents) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  [...alerts, ...incidents].forEach((item) => {
    counts[normalizeSeverity(item.severity)] += 1;
  });
  return counts;
}

function withDerivedFallbacks(summary, alerts, incidents) {
  return {
    ...summary,
    activeAlerts: summary.activeAlerts || alerts.length,
    criticalIncidents:
      summary.criticalIncidents ||
      incidents.filter((incident) => normalizeSeverity(incident.severity) === "critical").length,
    severity: Object.values(summary.severity).some(Boolean)
      ? summary.severity
      : buildSeverityFromRows(alerts, incidents),
  };
}

function setLoading(isLoading) {
  state.loading = isLoading;
  const refreshBtn = document.getElementById("refreshBtn");
  if (!refreshBtn) return;
  refreshBtn.disabled = isLoading;
  refreshBtn.classList.toggle("spinning", isLoading);
}

function setApiStatus(label, mode = "standby") {
  const statusEl = document.getElementById("apiStatus");
  if (!statusEl) return;
  statusEl.textContent = label;
  statusEl.dataset.mode = mode;
}

function showNotice(message, type = "error") {
  const notice = document.getElementById("dashboardNotice");
  if (!notice) return;

  notice.textContent = message;
  notice.dataset.type = type;
  notice.hidden = !message;
}

function setTableMessage(tbodyId, colSpan, message) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = `<tr><td class="table-message" colspan="${colSpan}">${escapeHtml(message)}</td></tr>`;
}

function renderAlertRows(tbodyId, alerts, limit) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const rows = typeof limit === "number" ? alerts.slice(0, limit) : alerts;

  if (state.loading) {
    setTableMessage(tbodyId, 4, "Loading alerts...");
    return;
  }

  if (state.error && !rows.length) {
    setTableMessage(tbodyId, 4, "Alerts unavailable. Check backend API and refresh.");
    return;
  }

  if (!rows.length) {
    setTableMessage(tbodyId, 4, "No alerts found.");
    return;
  }

  tbody.innerHTML = rows
    .map((alert) => {
      const severityClass = normalizeSeverity(alert.severity);
      const severityLabel = escapeHtml(alert.severity);
      return `
        <tr>
          <td>${escapeHtml(alert.id)}</td>
          <td>${escapeHtml(alert.type)}</td>
          <td><span class="badge ${severityClass}">${severityLabel}</span></td>
          <td>${escapeHtml(alert.sourceIp)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderIncidentRows(tbodyId, incidents, limit) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const rows = typeof limit === "number" ? incidents.slice(0, limit) : incidents;

  if (state.loading) {
    setTableMessage(tbodyId, 4, "Loading incidents...");
    return;
  }

  if (state.error && !rows.length) {
    setTableMessage(tbodyId, 4, "Incidents unavailable. Check backend API and refresh.");
    return;
  }

  if (!rows.length) {
    setTableMessage(tbodyId, 4, "No incidents found.");
    return;
  }

  tbody.innerHTML = rows
    .map((incident) => {
      const severityClass = normalizeSeverity(incident.severity);
      const status = normalizeStatus(incident.status);
      const statusClass = status.toLowerCase().replace(/\s+/g, "-");
      return `
        <tr>
          <td>${escapeHtml(incident.id)}</td>
          <td>${escapeHtml(incident.type)}</td>
          <td><span class="badge ${severityClass}">${escapeHtml(incident.severity)}</span></td>
          <td><span class="status ${statusClass}">${escapeHtml(status)}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderSummaryGroup(prefix = "") {
  const summary = state.summary;
  const id = (name) =>
    prefix ? `${prefix}${name.charAt(0).toUpperCase()}${name.slice(1)}` : name;

  const totalEl = document.getElementById(id("totalEvents"));
  const alertsEl = document.getElementById(id("activeAlerts"));
  const criticalEl = document.getElementById(id("criticalIncidents"));

  animateValue(totalEl, getCurrentNumber(totalEl), summary.totalEvents);
  animateValue(alertsEl, getCurrentNumber(alertsEl), summary.activeAlerts);
  animateValue(criticalEl, getCurrentNumber(criticalEl), summary.criticalIncidents);
}

function renderSeverityGroup(prefix = "") {
  const severity = state.summary.severity;
  const maxSeverity = Math.max(...severityKeys.map((key) => severity[key] || 0));

  severityKeys.forEach((key) => {
    const title = key.charAt(0).toUpperCase() + key.slice(1);
    const severityPrefix = prefix ? `${prefix}Sev` : "sev";
    const valueEl = document.getElementById(`${severityPrefix}${title}`);
    const barEl = document.getElementById(`${severityPrefix}${title}Bar`);
    const value = severity[key] || 0;

    animateValue(valueEl, getCurrentNumber(valueEl), value);

    if (barEl) {
      const pct = maxSeverity ? Math.round((value / maxSeverity) * 100) : 0;
      requestAnimationFrame(() => {
        barEl.style.width = `${pct}%`;
      });
    }
  });
}

function renderDashboard() {
  renderSummaryGroup();
  renderSeverityGroup();
  renderSummaryGroup("events");
  renderSeverityGroup("events");
  renderAlertRows("alertsTableBody", state.alerts, 6);
  renderAlertRows("alertsViewBody", state.alerts);
  renderIncidentRows("incidentsTableBody", state.incidents, 6);
  renderIncidentRows("incidentsViewBody", state.incidents);
}

async function loadDashboard() {
  setLoading(true);
  state.error = "";
  showNotice("");
  setApiStatus("API loading", "loading");
  renderDashboard();

  try {
    const [alertsResponse, incidentsResponse, eventsResponse] = await Promise.all([
      fetchJson("/api/alerts/"),
      fetchJson("/api/incidents/"),
      fetchJson("/api/events/"),
    ]);

    state.alerts = Array.isArray(alertsResponse) ? alertsResponse.map(mapAlert) : [];
    state.incidents = Array.isArray(incidentsResponse) ? incidentsResponse.map(mapIncident) : [];
    state.summary = withDerivedFallbacks(
      mapSummary(eventsResponse || {}),
      state.alerts,
      state.incidents
    );

    updateLastSync();
    setApiStatus("API connected", "connected");
  } catch (error) {
    state.error = error.message || "Unable to connect to backend API.";
    showNotice(`Backend API unavailable. Start FastAPI on ${API_BASE_URL} and press Refresh.`);
    setApiStatus("API offline", "error");
  } finally {
    setLoading(false);
    renderDashboard();
  }
}

function updateLastSync() {
  const syncEl = document.getElementById("lastSync");
  if (!syncEl) return;
  syncEl.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function activateView(view) {
  const nextView = view || "overview";
  state.activeView = nextView;

  document.querySelectorAll("[data-view]").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === nextView);
  });

  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === nextView);
  });
}

function initNavigation() {
  document.querySelectorAll("[data-view]").forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      const view = item.dataset.view;
      history.replaceState(null, "", `#${view}`);
      activateView(view);
    });
  });

  const initialView = window.location.hash.replace("#", "") || "overview";
  activateView(initialView);
}

function tickClock() {
  const clockEl = document.getElementById("clock");
  if (!clockEl) return;
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString("en-GB", { hour12: false });
}

const refreshBtn = document.getElementById("refreshBtn");
refreshBtn.addEventListener("click", loadDashboard);

initNavigation();
tickClock();
setInterval(tickClock, 1000);
loadDashboard();
