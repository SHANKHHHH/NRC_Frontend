import { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './Components/dashboard/Header/Header';
import Login from './Pages/Login';
import ProtectedRoute from './Routes/ProtectedRoute';

const Dashboard = lazy(() => import('./Pages/Dashboard/Dashboard'));

function App() {
  const [tabValue, setTabValue] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const handleLogout = () => setIsAuthenticated(false);

  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Header tabValue={tabValue} setTabValue={setTabValue} onLogout={handleLogout} role={userRole || 'admin'} />
                <Dashboard tabValue={tabValue} setTabValue={setTabValue} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
