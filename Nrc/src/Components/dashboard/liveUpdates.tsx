import React, { useEffect, useState } from 'react';

interface Update {
  message: string;
  time: string;
}

const LiveUpdates: React.FC = () => {
  // TODO: Replace with API call to fetch data from backend
  const [updates, setUpdates] = useState<Update[]>([
    { message: 'Job assigned to Machine A', time: '2 min Ago' },
    { message: 'QC passed for job 99', time: '2 min Ago' },
    { message: 'Machine B downtime reported', time: '2 min Ago' },
  ]);

  useEffect(() => {
    // Example placeholder for API call
    // fetch('/api/live-updates').then(res => res.json()).then(setUpdates);
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '1.5rem', flex: 1, minWidth: 300, border: '1px solid #e0e0e0' }}>
      <div style={{ fontWeight: 'bold', marginBottom: 16 }}>Live Updates</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {updates.map((update, idx) => (
          <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span>○ {update.message}</span>
            <span style={{ color: '#888', fontSize: 14 }}>{update.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveUpdates;
