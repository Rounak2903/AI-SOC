// =========================================================
// SOC Dashboard - app.js
// Phase 1: UI wired up with DUMMY data only.
// Phase 4 (later): replace getDummyData() calls with real
// REST API calls to Krushna's backend. Nothing else in this
// file's structure should need to change when that happens.
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

// ---- Render helpers ----
function renderSummary() {
  const summary = getDummySummary();

  document.getElementById("totalEvents").textContent = summary.totalEvents.toLocaleString();
  document.getElementById("activeAlerts").textContent = summary.activeAlerts;
  document.getElementById("criticalIncidents").textContent = summary.criticalIncidents;

  document.getElementById("sevCritical").textContent = summary.severity.critical;
  document.getElementById("sevHigh").textContent = summary.severity.high;
  document.getElementById("sevMedium").textContent = summary.severity.medium;
  document.getElementById("sevLow").textContent = summary.severity.low;
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

function loadDashboard() {
  renderSummary();
  renderAlertsTable();
  renderIncidentsTable();
}

// ---- Refresh button ----
document.getElementById("refreshBtn").addEventListener("click", () => {
  loadDashboard();
});

// ---- Initial load ----
loadDashboard();
