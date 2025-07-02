import React, { useEffect, useState } from 'react';

const QuickStatus: React.FC = () => {
  // TODO: Replace with API call to fetch data from backend
  const [status, setStatus] = useState({
    totalOrders: 250,
    activeProcesses: 180,
    completedOrders: 70,
  });

  useEffect(() => {
    // Example placeholder for API call
    // fetch('/api/quick-status').then(res => res.json()).then(setStatus);
  }, []);

  return (
    <div className="quickstatus-container">
      <div className="quickstatus-card">
        <div>Total Orders</div>
        <div className="quickstatus-value">{status.totalOrders}</div>
      </div>
      <div className="quickstatus-card">
        <div>Active Processes</div>
        <div className="quickstatus-value">{status.activeProcesses}</div>
      </div>
      <div className="quickstatus-card">
        <div>Completed Orders</div>
        <div className="quickstatus-value">{status.completedOrders}</div>
      </div>
    </div>
  );
};

export default QuickStatus;
