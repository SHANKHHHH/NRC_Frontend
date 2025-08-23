import { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './Components/Navbar/Header/Header';
import Login from './Pages/Login';
import ProtectedRoute from './Routes/ProtectedRoute';

const Dashboard = lazy(() => import('./Pages/Dashboard/Dashboard'));
const JobInitiationForm = lazy(() => import('./Components/Roles/Planner/Form/JobInitiationForm'));
const JobStepsView = lazy(() => import('./Components/Roles/Planner/Form/JobStepsView')); // IMPORTED: New component
const JobDetailsContainer = lazy(() => import('./Components/Roles/Admin/JobDetailsComponents/JobDetailsContainer')); // New job details page
const CompletedJobsView = lazy(() => import('./Components/Roles/Admin/CompletedJobsView')); // New completed jobs view

function App() {
  const [tabValue, setTabValue] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const handleLogout = () => setIsAuthenticated(false);

  // This function is just to satisfy the prop requirement for JobInitiationForm when rendered directly by route.
  const handleJobUpdatedInApp = () => {
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
                    path="planner/initiate-job/:nrcJobNo"
                    element={
                      <JobInitiationForm
                        onJobUpdated={handleJobUpdatedInApp}
                      />
                    }
                  />
                  {/* New route for Add PO (general form) */}
                  <Route
                    path="planner/initiate-job/new"
                    element={
                      <JobInitiationForm
                        onJobUpdated={handleJobUpdatedInApp}
                      />
                    }
                  />
                  {/* Nested Route for JobStepsView */}
                  <Route
                    path="planner/job-steps/:jobPlanId" // New route for JobStepsView
                    element={
                      <JobStepsView />
                    }
                  />
                  {/* Nested Route for JobDetailsContainer */}
                  <Route
                    path="job-details" // New route for job details
                    element={
                      <JobDetailsContainer />
                    }
                  />
                  {/* Nested Route for CompletedJobsView */}
                  <Route
                    path="completed-jobs" // New route for completed jobs
                    element={
                      <CompletedJobsView />
                    }
                  />
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
