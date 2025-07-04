import React, { useEffect, useState } from 'react';

// Define the type for your dispatch data
interface DispatchData {
  totalDispatches: number;
  pendingDispatches: number;
  completedDispatches: number;
}

// Placeholder for fetching data from backend
const fetchDispatchData = async (): Promise<DispatchData> => {
  // TODO: Replace this with your actual API call, e.g.:
  // const response = await fetch('/api/dispatch/overview');
  // return await response.json();
  return {
    totalDispatches: 120,
    pendingDispatches: 30,
    completedDispatches: 90,
  };
};

const cardConfig = [
  {
    key: 'totalDispatches',
    title: 'Total Dispatches',
  },
  {
    key: 'pendingDispatches',
    title: 'Pending Dispatches',
  },
  {
    key: 'completedDispatches',
    title: 'Completed Dispatches',
  },
] as const;

type CardKey = typeof cardConfig[number]['key'];

const DispatchOverview: React.FC = () => {
  const [data, setData] = useState<DispatchData | null>(null);

  useEffect(() => {
    // Fetch data from backend
    fetchDispatchData().then(setData);
  }, []);

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-10">
      {cardConfig.map(({ key, title }) => (
        <div
          key={key}
          className="bg-white border border-gray-200 rounded-xl p-6 min-w-[220px] flex-1 max-w-xs shadow-sm"
        >
          <div className="text-gray-700 font-medium mb-2">{title}</div>
          <div className="text-2xl font-bold mb-1">
            {data ? data[key as CardKey] : <span className="text-gray-400">--</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DispatchOverview;
