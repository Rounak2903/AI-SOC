// =========================================================
// SOC Dashboard - app.js
// Phase 1: UI wired up with DUMMY data only.
// Phase 4 (later): replace getDummy*() calls with real
// REST API calls to Krushna's backend. Render functions and
// data shape are written to match a typical REST response,
// so swapping the data source is the only change needed.
// =========================================================

// ---- Dummy data (stand-in for backend response) ----
function getDummySummary() {
  return {
    totalEvents: 18542,
    activeAlerts: 37,
    criticalIncidents: 4,
    severity: {
      critical: 4,
      high: 12,
      medium: 26,
      low: 51,
    },
  };
}

function getDummyAlerts() {
  return [
    { id: "ALT-1042", type: "Brute Force Login", severity: "Critical", sourceIp: "192.168.1.14" },
    { id: "ALT-1041", type: "Port Scan", severity: "High", sourceIp: "10.0.0.55" },
    { id: "ALT-1040", type: "Malware Signature Match", severity: "Critical", sourceIp: "172.16.4.21" },
    { id: "ALT-1039", type: "Unusual Outbound Traffic", severity: "Medium", sourceIp: "192.168.1.101" },
    { id: "ALT-1038", type: "Failed SSH Attempts", severity: "High", sourceIp: "203.0.113.9" },
    { id: "ALT-1037", type: "DNS Tunneling Suspected", severity: "Low", sourceIp: "198.51.100.23" },
  ];
}

function getDummyIncidents() {
  return [
    { id: "INC-0231", type: "Ransomware Activity", severity: "Critical", status: "Open" },
    { id: "INC-0230", type: "Data Exfiltration Attempt", severity: "Critical", status: "Investigating" },
    { id: "INC-0229", type: "Privilege Escalation", severity: "High", status: "Investigating" },
    { id: "INC-0228", type: "Phishing Campaign", severity: "Medium", status: "Resolved" },
    { id: "INC-0227", type: "Insider Threat Alert", severity: "High", status: "Open" },
  ];
}

// ---- Small utility: animate a number from its current value to a target ----
function animateValue(el, from, to, duration = 700) {
  const start = performance.now();
  const isInt = Number.isInteger(to);

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = from + (to - from) * eased;
    el.textContent = isInt
      ? Math.round(current).toLocaleString()
      : current.toFixed(1);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function getCurrentNumber(el) {
  const n = parseInt(el.textContent.replace(/,/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

// ---- Render helpers ----
function renderSummary() {
  const summary = getDummySummary();

  const totalEl = document.getElementById("totalEvents");
  const alertsEl = document.getElementById("activeAlerts");
  const criticalEl = document.getElementById("criticalIncidents");

  animateValue(totalEl, getCurrentNumber(totalEl), summary.totalEvents);
  animateValue(alertsEl, getCurrentNumber(alertsEl), summary.activeAlerts);
  animateValue(criticalEl, getCurrentNumber(criticalEl), summary.criticalIncidents);

  const sevMap = [
    ["sevCritical", "sevCriticalBar", summary.severity.critical],
    ["sevHigh", "sevHighBar", summary.severity.high],
    ["sevMedium", "sevMediumBar", summary.severity.medium],
    ["sevLow", "sevLowBar", summary.severity.low],
  ];

  const maxSeverity = Math.max(
    summary.severity.critical,
    summary.severity.high,
    summary.severity.medium,
    summary.severity.low
  );

  sevMap.forEach(([valueId, barId, value]) => {
    const valueEl = document.getElementById(valueId);
    animateValue(valueEl, getCurrentNumber(valueEl), value);
    const barEl = document.getElementById(barId);
    const pct = maxSeverity ? Math.round((value / maxSeverity) * 100) : 0;
    requestAnimationFrame(() => {
      barEl.style.width = pct + "%";
    });
  });
}

function renderAlertsTable() {
  const alerts = getDummyAlerts();
  const tbody = document.getElementById("alertsTableBody");
  tbody.innerHTML = "";

  alerts.forEach((alert) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${alert.id}</td>
      <td>${alert.type}</td>
      <td><span class="badge ${alert.severity.toLowerCase()}">${alert.severity}</span></td>
      <td>${alert.sourceIp}</td>
    `;
    tbody.appendChild(row);
  });
}

function renderIncidentsTable() {
  const incidents = getDummyIncidents();
  const tbody = document.getElementById("incidentsTableBody");
  tbody.innerHTML = "";

  incidents.forEach((incident) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${incident.id}</td>
      <td>${incident.type}</td>
      <td><span class="badge ${incident.severity.toLowerCase()}">${incident.severity}</span></td>
      <td><span class="status ${incident.status.toLowerCase()}">${incident.status}</span></td>
    `;
    tbody.appendChild(row);
  });
}

function updateLastSync() {
  document.getElementById("lastSync").textContent = "just now";
}

function loadDashboard() {
  renderSummary();
  renderAlertsTable();
  renderIncidentsTable();
  updateLastSync();
}

// ---- Live clock in sidebar ----
function tickClock() {
  const clockEl = document.getElementById("clock");
  if (!clockEl) return;
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString("en-GB", { hour12: false });
}
tickClock();
setInterval(tickClock, 1000);

// ---- Refresh button ----
const refreshBtn = document.getElementById("refreshBtn");
refreshBtn.addEventListener("click", () => {
  refreshBtn.classList.add("spinning");
  loadDashboard();
  setTimeout(() => refreshBtn.classList.remove("spinning"), 400);
});

// ---- Initial load ----
loadDashboard();
