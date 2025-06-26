import React, { useState } from "react";
import HorizontalPage from "./HorizontalPage";
import "./HorizontalPage.css";

const snapshotRoles = [
  { label: "Planner", desc: "New Jobs Alerts" },
  { label: "Production Head", desc: "Flute pasting" },
  { label: "QC Manager", desc: "abc" },
  { label: "Dispatch Executive", desc: "abc" },
];

const tableData = [
  {
    processId: "P1234",
    orderId: "O5678",
    product: "Carton Box A",
    status: "In Progress",
    statusClass: "in-progress",
    assignedTo: "QC Manager",
    dueDate: "2024-04-15",
  },
  {
    processId: "P5678",
    orderId: "O9012",
    product: "Carton Box B",
    status: "Pending",
    statusClass: "pending",
    assignedTo: "Planner",
    dueDate: "2024-04-18",
  },
  {
    processId: "P9012",
    orderId: "O3456",
    product: "Carton Box C",
    status: "Completed",
    statusClass: "completed",
    assignedTo: "Dispatch Executive",
    dueDate: "2024-04-10",
  },
];

const Dashboard = () => {
  const [selectedRole, setSelectedRole] = useState("Planner");

  const filteredData = tableData.filter(
    (row) => row.assignedTo === selectedRole
  );

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        {/* You can replace this with your logo if needed */}
        <div className="dashboard-logo" style={{ fontWeight: 'bold', fontSize: 24, color: '#1a9cff' }}>NRC</div>
        <nav className="dashboard-nav">
          <a href="#" className="active">Dashboard</a>
          <a href="#">Planner</a>
          <a href="#">Production Head</a>
          <a href="#">Dispatch Head</a>
          <a href="#">QC Manager</a>
          <a href="#">Search</a>
        </nav>
        <div className="dashboard-profile">
          <span className="profile-icon">&#128100;</span>
        </div>
      </header>
      <HorizontalPage />

      {/* Live Updates & Status Overview */}
      <div className="dashboard-details-row">
        <section className="live-updates">
          <h3>Live Updates</h3>
          <ul className="live-updates-list">
            <li><span className="live-icon">🕒</span> Job assigned to Machine A <span className="live-time">2 min Ago</span></li>
            <li><span className="live-icon">🕒</span> QC passed for job 99 <span className="live-time">2 min Ago</span></li>
            <li><span className="live-icon">🕒</span> Machine B downtime reported <span className="live-time">2 min Ago</span></li>
          </ul>
        </section>
        <section className="status-overview">
          <h3>Status Overview</h3>
          <div className="status-overview-grid">
            <div className="status-overview-block">
              <div className="status-overview-label">Jobs in Progress</div>
              <div className="status-overview-value">128</div>
            </div>
            <div className="status-overview-block">
              <div className="status-overview-label">Jobs Completed Today</div>
              <div className="status-overview-value">128</div>
            </div>
            <div className="status-overview-block">
              <div className="status-overview-label">Machine Under Maintenance</div>
              <div className="status-overview-value">128</div>
            </div>
            <div className="status-overview-block">
              <div className="status-overview-label">QC Pending</div>
              <div className="status-overview-value">128</div>
            </div>
          </div>
        </section>
      </div>

      {/* Daily Snapshots */}
      <section className="daily-snapshots">
        <h3>Daily Snapshots</h3>
        <div className="snapshot-roles-row">
          {snapshotRoles.map((role) => (
            <button
              key={role.label}
              className={`snapshot-role-block${selectedRole === role.label ? " active" : ""}`}
              onClick={() => setSelectedRole(role.label)}
              type="button"
            >
              {role.label}
              <div className="snapshot-role-desc">{role.desc}</div>
            </button>
          ))}
        </div>
        <div className="snapshot-table-wrapper">
          <table className="snapshot-table">
            <thead>
              <tr>
                <th>Process ID</th>
                <th>Order ID</th>
                <th>Product</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#888" }}>No data for this role.</td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.processId}>
                    <td>{row.processId}</td>
                    <td>{row.orderId}</td>
                    <td>{row.product}</td>
                    <td><span className={`status-badge ${row.statusClass}`}>{row.status}</span></td>
                    <td>{row.assignedTo}</td>
                    <td>{row.dueDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard; 