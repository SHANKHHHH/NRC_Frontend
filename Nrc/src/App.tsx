import { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'; // Import useNavigate for onClose
import './App.css';
import Header from './Components/Navbar/Header/Header';
import Login from './Pages/Login';
import ProtectedRoute from './Routes/ProtectedRoute';

const Dashboard = lazy(() => import('./Pages/Dashboard/Dashboard'));
const JobInitiationForm = lazy(() => import('./Components/Roles/Planner/Form/JobInitiationForm')); // Import JobInitiationForm

function App() {
  const [tabValue, setTabValue] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const handleLogout = () => setIsAuthenticated(false);

  // Define a dummy onJobUpdated for App.tsx's route rendering.
  // The actual update logic is in planner_jobs.tsx, which will refetch.
  // This function is just to satisfy the prop requirement for JobInitiationForm when rendered directly by route.
  const handleJobUpdatedInApp = () => {
    // In a real scenario, if JobInitiationForm is a direct route,
    // and you need to update a list on a *different* page (like planner_jobs),
    // you'd typically use a global state management solution (Context, Redux, Zustand)
    // or trigger a refetch in the destination component (planner_jobs) when it mounts.
    // For now, we'll just log it.
    console.log("JobInitiationForm completed. A global state update or refetch in planner_jobs might be needed.");
  };

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
            path="/dashboard/*" // Use wildcard to allow nested routes under dashboard
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                {/* Header is rendered here for all dashboard sub-routes */}
                <Header tabValue={tabValue} setTabValue={setTabValue} onLogout={handleLogout} role={userRole || 'admin'} />
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Dashboard tabValue={tabValue} setTabValue={setTabValue} role={userRole || 'admin'} />
                    }
                  />
                  {/* Nested Route for JobInitiationForm */}
                  <Route
                    path="planner/initiate-job/:nrcJobNo" // Nested path
                    element={
                      // JobInitiationForm now fetches its own job data using nrcJobNo from URL params
                      // We pass a dummy onClose that navigates back to planner_jobs
                      // and onJobUpdated that can trigger a refetch in planner_jobs (though planner_jobs handles its own refetch on mount)
                      <JobInitiationForm
                        onJobUpdated={handleJobUpdatedInApp} // Pass the dummy handler
                      />
                    }
                  />
                  {/* Add other nested dashboard routes here if needed */}
                </Routes>
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
