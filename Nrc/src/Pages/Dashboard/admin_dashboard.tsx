import React from 'react';
import QuickStatus from '../../Components/dashboard/quickStatus';
import LiveUpdates from '../../Components/dashboard/liveUpdates';
import StatusOverview from '../../Components/dashboard/statusOverview';
import DailySnapshots from '../../Components/dashboard/dailySnapshots';

import logo1 from '../../assets/Login/logo1.png';
import userIcon from '../../assets/Icons/user.svg';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  return (
    <div className="admin-dashboard-container">
      {/* Top Navigation Placeholder */}
      <div className="admin-dashboard-header">
        <img src={logo1} alt="Logo" className="admin-dashboard-logo" />
        <div className="admin-dashboard-title">Dashboard</div>
        <div className="admin-dashboard-avatar">
          <img src={userIcon} alt="User" style={{ width: 24, height: 24 }} />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="admin-dashboard-nav">
        <button className="admin-dashboard-nav-btn">Job Queue</button>
        <button className="admin-dashboard-nav-btn">Production History</button>
        <button className="admin-dashboard-nav-btn">Other Station Status</button>
      </div>

      {/* Quick Status */}
      <div>
        <div className="admin-dashboard-section-title">Quick Status</div>
        <div className="admin-dashboard-quickstatus">
          <QuickStatus />
        </div>
      </div>

      {/* Live Updates & Status Overview */}
      <div className="admin-dashboard-main">
        <div className="admin-dashboard-liveupdates">
          <LiveUpdates />
        </div>
        <div className="admin-dashboard-statusoverview">
          <div className="admin-dashboard-section-title">Status Overview</div>
          <div className="admin-dashboard-statusoverview-cards">
            <StatusOverview />
          </div>
        </div>
      </div>

      {/* Daily Snapshots */}
      <div className="admin-dashboard-dailysnapshots">
        <DailySnapshots />
      </div>
    </div>
  );
};

export default AdminDashboard;
