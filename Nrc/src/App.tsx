import { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Components/dashboard/Header/Header';
import Login from './Pages/Login';

const OrderSummary = lazy(() => import('./Components/Planner/OrderSummary'));
const ProductionSchedule = lazy(() => import('./Components/Planner/ProductionSchedule'));
const Summary = lazy(() => import('./Components/Production_Head/Summary'));
const ProductionUpdate = lazy(() => import('./Components/Production_Head/ProductionUpdate'));
const DispatchOverview = lazy(() => import('./Components/DispatchHead/DispatchOverview'));
const DispatchSummary = lazy(() => import('./Components/DispatchHead/DispatchSummary'));

function DashboardTabs() {
  const [tabValue, setTabValue] = useState('dashboard');
  return (
    <>
      <Header tabValue={tabValue} setTabValue={setTabValue} />
      <Suspense fallback={<div>Loading...</div>}>
        <div className="px-4 sm:px-8 py-8 bg-[#f7f7f7] min-h-screen">
          {/* Only render these when planner tab is selected */}
          {tabValue === 'planner' && (
            <>
              <OrderSummary />
              <ProductionSchedule />
            </>
          )}
          {/* Render these when production tab is selected */}
          {tabValue === 'production' && (
            <>
              <Summary />
              <ProductionUpdate />
            </>
          )}
          {/* Render these when dispatch tab is selected */}
          {tabValue === 'dispatch' && (
            <>
              <DispatchOverview />
              <DispatchSummary />
            </>
          )}
          {/* You can add other tab content here if needed */}
        </div>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DashboardTabs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
