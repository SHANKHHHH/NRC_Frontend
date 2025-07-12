// Nrc/src/Pages/Dashboard/Dashboard.tsx
import React, { lazy, Suspense } from 'react';

const OrderSummary = lazy(() => import('../../Components/Planner/OrderSummary'));
const ProductionSchedule = lazy(() => import('../../Components/Planner/ProductionSchedule'));
const Summary = lazy(() => import('../../Components/Production_Head/Summary'));
const ProductionUpdate = lazy(() => import('../../Components/Production_Head/ProductionUpdate'));
const DispatchOverview = lazy(() => import('../../Components/DispatchHead/DispatchOverview'));
const DispatchSummary = lazy(() => import('../../Components/DispatchHead/DispatchSummary'));

interface DashboardProps {
  tabValue: string;
  setTabValue: (value: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tabValue }) => (
  <div className="px-4 sm:px-8 py-8 bg-[#f7f7f7] min-h-screen">
    <Suspense fallback={<div>Loading...</div>}>
      {tabValue === 'planner' && (
        <>
          <OrderSummary />
          <ProductionSchedule />
        </>
      )}
      {tabValue === 'production' && (
        <>
          <Summary />
          <ProductionUpdate />
        </>
      )}
      {tabValue === 'dispatch' && (
        <>
          <DispatchOverview />
          <DispatchSummary />
        </>
      )}
      {/* Add other tab content here if needed */}
    </Suspense>
  </div>
);

export default Dashboard;