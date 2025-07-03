import { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Components/dashboard/Header/Header';

const Login = lazy(() => import('./Pages/Login'));
const OrderSummary = lazy(() => import('./Components/Planner/OrderSummary'));
const ProductionSchedule = lazy(() => import('./Components/Planner/ProductionSchedule'));

function App() {
  const [tabValue, setTabValue] = useState('dashboard');

  return (
    <BrowserRouter>
      <Header tabValue={tabValue} setTabValue={setTabValue} />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route
            path="/"
            element={
              <div className="px-4 sm:px-8 py-8 bg-[#f7f7f7] min-h-screen">
                {/* Only render these when planner tab is selected */}
                {tabValue === 'planner' && (
                  <>
                    <OrderSummary />
                    <ProductionSchedule />
                  </>
                )}
                {/* You can add other tab content here if needed */}
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
