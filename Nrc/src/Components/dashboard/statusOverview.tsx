import React, { useEffect, useState } from 'react';

const StatusOverview: React.FC = () => {
  // TODO: Replace with API call to fetch data from backend
  const [overview, setOverview] = useState({
    jobsInProgress: 128,
    jobsCompletedToday: 128,
    machineUnderMaintenance: 128,
    qcPending: 128,
  });

  useEffect(() => {
    // Example placeholder for API call
    // fetch('/api/status-overview').then(res => res.json()).then(setOverview);
  }, []);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', flex: 1, minWidth: 300 }}>
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '1.5rem', flex: 1, minWidth: 180 }}>
        <div>Jobs in Progress</div>
        <div style={{ fontWeight: 'bold', fontSize: 20 }}>{overview.jobsInProgress}</div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '1.5rem', flex: 1, minWidth: 180 }}>
        <div>Jobs Completed Today</div>
        <div style={{ fontWeight: 'bold', fontSize: 20 }}>{overview.jobsCompletedToday}</div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '1.5rem', flex: 1, minWidth: 180 }}>
        <div>Machine Under Maintenance</div>
        <div style={{ fontWeight: 'bold', fontSize: 20 }}>{overview.machineUnderMaintenance}</div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '1.5rem', flex: 1, minWidth: 180 }}>
        <div>QC Pending</div>
        <div style={{ fontWeight: 'bold', fontSize: 20 }}>{overview.qcPending}</div>
      </div>
    </div>
  );
};

export default StatusOverview;
