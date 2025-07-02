import React, { useEffect, useState } from 'react';

interface Snapshot {
  processId: string;
  orderId: string;
  product: string;
  status: 'In Progress' | 'Pending' | 'Completed';
  assignedTo: string;
  dueDate: string;
}

const statusColors: Record<string, string> = {
  'In Progress': '#d1e7dd',
  'Pending': '#f8d7da',
  'Completed': '#d1e7dd',
};

const DailySnapshots: React.FC = () => {
  // TODO: Replace with API call to fetch data from backend
  const [snapshots, setSnapshots] = useState<Snapshot[]>([
    { processId: 'P1234', orderId: 'O5678', product: 'Carton Box A', status: 'In Progress', assignedTo: 'QC Manager', dueDate: '2024-04-15' },
    { processId: 'P5678', orderId: 'O9012', product: 'Carton Box B', status: 'Pending', assignedTo: 'Planner', dueDate: '2024-04-18' },
    { processId: 'P0012', orderId: 'O3456', product: 'Carton Box C', status: 'Completed', assignedTo: 'Dispatch Executive', dueDate: '2024-04-10' },
    { processId: 'P3456', orderId: 'O7890', product: 'Carton Box D', status: 'In Progress', assignedTo: 'Production Head', dueDate: '2024-04-20' },
    { processId: 'P7890', orderId: 'O1234', product: 'Carton Box E', status: 'Pending', assignedTo: 'Planner', dueDate: '2024-04-22' },
  ]);

  useEffect(() => {
    // Example placeholder for API call
    // fetch('/api/daily-snapshots').then(res => res.json()).then(setSnapshots);
  }, []);

  return (
    <div className="admin-dashboard-dailysnapshots">
      <div className="admin-dashboard-section-title">Daily Snapshots</div>
      <div className="admin-dashboard-table-wrapper">
        <table className="admin-dashboard-table">
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
            {snapshots.map((snap, idx) => (
              <tr key={idx}>
                <td>{snap.processId}</td>
                <td>{snap.orderId}</td>
                <td>{snap.product}</td>
                <td>
                  <span style={{ background: statusColors[snap.status], padding: '4px 12px', borderRadius: 6, fontWeight: 500 }}>
                    {snap.status}
                  </span>
                </td>
                <td>{snap.assignedTo}</td>
                <td>{snap.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailySnapshots;
