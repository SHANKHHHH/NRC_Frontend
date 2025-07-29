// Nrc/src/Pages/Dashboard/Dashboard.tsx
import React, { lazy, Suspense, useEffect, useState } from 'react';
const OrderSummary = lazy(() => import('../../Components/Roles/Admin/Planner/OrderSummary'));
const ProductionSchedule = lazy(() => import('../../Components/Roles/Admin/Planner/ProductionSchedule'));
const Summary = lazy(() => import('../../Components/Roles/Admin/Production_Head/Summary'));
const ProductionUpdate = lazy(() => import('../../Components/Roles/Admin/Production_Head/ProductionUpdate'));
const DispatchOverview = lazy(() => import('../../Components/Roles/Admin/DispatchHead/DispatchOverview'));
const DispatchSummary = lazy(() => import('../../Components/Roles/Admin/DispatchHead/DispatchSummary'));
import JobCard from '../../Components/Roles/PrintingMgr/job'; // Assuming this is correct for PrintingMgr
import StopScreen from '../../Components/Roles/PrintingMgr/options/stop';
import DispatchExecutiveJobs from '../../Components/Roles/Dispatch_Executive /dispatch_jobs';
import ReadyDispatchForm from '../../Components/Roles/Dispatch_Executive /ReadytoDispatch/readyDispatch';
import ProductionSteps from '../../Components/Roles/ProductionHead/productionSteps/production_steps';
import PlannerDashboard from '../../Components/Roles/Planner/Planner_dashboard';
import StartNewJob from '../../Components/Roles/Planner/startNew_job';
import PlannerNotifications from '../../Components/Roles/Planner/planner_notifications';
import PlannerJobs from '../../Components/Roles/Planner/planner_jobs'; // Import the new component

interface DashboardProps {
  tabValue: string;
  setTabValue: (value: string) => void;
  role: string;
}

interface Job { // This interface is likely duplicated, ideally it should come from src/types/job.ts
  id: string;
  company: string;
  jobId: string;
  boardSize: string;
  gsm: string;
  artwork: string;
  approvalDate: string;
  dispatchDate: string;
}

const Dashboard: React.FC<DashboardProps> = ({ tabValue, setTabValue, role }) => {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      company: 'Jockey India',
      jobId: 'id_234566',
      boardSize: '64×64',
      gsm: 'xyz',
      artwork: 'id_123456',
      approvalDate: '15/04/2025',
      dispatchDate: '15/04/2025',
    },
    {
      id: '2',
      company: 'Jockey India',
      jobId: 'id_234567',
      boardSize: '64×64',
      gsm: 'xyz',
      artwork: 'id_123457',
      approvalDate: '16/04/2025',
      dispatchDate: '16/04/2025',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStopScreen, setShowStopScreen] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [showReadyDispatch, setShowReadyDispatch] = useState(false);
  const [showProductionSteps, setShowProductionSteps] = useState(false);

  useEffect(() => {
  }, [activeJob]);

  return (
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
        {/* Planner role logic */}
        {role === 'planner' && tabValue === 'dashboard' && (
          <PlannerDashboard />
        )}
        {role === 'planner' && tabValue === 'start new job' && (
          <StartNewJob />
        )}
        {role === 'planner' && tabValue === 'notifications' && (
          <PlannerNotifications />
        )}
        {role === 'planner' && tabValue === 'jobs' && ( // <-- This is the new condition
          <PlannerJobs /> // <-- Render PlannerJobs component here
        )}
        {/* Printing Manager jobs tab */}
        {role === 'printing_manager' && tabValue === 'jobs' && (
          <div className="w-full flex flex-col items-center">
            {showStopScreen ? (
              <StopScreen onBack={() => setShowStopScreen(false)} />
            ) : (
              <>
                {loading && <div>Loading jobs...</div>}
                {error && <div className="text-red-500">{error}</div>}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 justify-items-center">
                  {jobs.length > 0 ? (
                    jobs.map(job => (
                      <JobCard
                        key={job.id}
                        company={job.company}
                        jobId={job.jobId}
                        boardSize={job.boardSize}
                        gsm={job.gsm}
                        artwork={job.artwork}
                        approvalDate={job.approvalDate}
                        dispatchDate={job.dispatchDate}
                        onStop={() => setShowStopScreen(true)}
                      />
                    ))
                  ) : (
                    <div className="text-center col-span-full py-8">
                      <p className="text-gray-500">No jobs found</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {/* Dispatch Executive jobs tab */}
        {role === 'dispatch_executive' && tabValue === 'jobs' && (
          showReadyDispatch ? (
            <ReadyDispatchForm onBack={() => setShowReadyDispatch(false)} />
          ) : (
              <DispatchExecutiveJobs jobs={jobs.length > 0 ? jobs : undefined} onReadyDispatch={() => setShowReadyDispatch(true)} />
          )
        )}
        {/* Production Head jobs tab */}
        {role === 'production_head' && tabValue === 'jobs' && (
          <div className="w-full flex flex-col items-center">
            {showProductionSteps ? (
              <ProductionSteps onBack={() => setShowProductionSteps(false)} />
            ) : (
              <>
                {loading && <div>Loading jobs...</div>}
                {error && <div className="text-red-500">{error}</div>}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 justify-items-center">
                  {jobs.length > 0 ? (
                    jobs.map(job => (
                      <JobCard
                        key={job.id}
                        company={job.company}
                        jobId={job.jobId}
                        boardSize={job.boardSize}
                        gsm={job.gsm}
                        artwork={job.artwork}
                        approvalDate={job.approvalDate}
                        dispatchDate={job.dispatchDate}
                        onStop={() => setShowProductionSteps(true)}
                      />
                    ))
                  ) : (
                    <div className="text-center col-span-full py-8">
                      <p className="text-gray-500">No jobs found</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {/* Add other tab content here if needed */}
      </Suspense>
    </div>
  );
};

export default Dashboard;
