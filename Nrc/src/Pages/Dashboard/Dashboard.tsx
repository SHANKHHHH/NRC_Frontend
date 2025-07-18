// Nrc/src/Pages/Dashboard/Dashboard.tsx
import React, { lazy, Suspense, useEffect, useState } from 'react';
const OrderSummary = lazy(() => import('../../Components/Planner/OrderSummary'));
const ProductionSchedule = lazy(() => import('../../Components/Planner/ProductionSchedule'));
const Summary = lazy(() => import('../../Components/Production_Head/Summary'));
const ProductionUpdate = lazy(() => import('../../Components/Production_Head/ProductionUpdate'));
const DispatchOverview = lazy(() => import('../../Components/DispatchHead/DispatchOverview'));
const DispatchSummary = lazy(() => import('../../Components/DispatchHead/DispatchSummary'));
import JobCard from '../../Components/PrintingMgr/job';
import StopScreen from '../../Components/PrintingMgr/options/stop';

interface DashboardProps {
  tabValue: string;
  setTabValue: (value: string) => void;
}

// Example job type (adjust as per your backend response)
interface Job {
  id: string;
  company: string;
  jobId: string;
  boardSize: string;
  gsm: string;
  artwork: string;
  approvalDate: string;
  dispatchDate: string;
}

const Dashboard: React.FC<DashboardProps> = ({ tabValue }) => {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStopScreen, setShowStopScreen] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  useEffect(() => {
    if (tabValue !== 'jobs') return;
    setLoading(true);
    setError(null);
    // Dummy placeholder data
    setTimeout(() => {
      setJobs([
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
        // Add more dummy jobs if desired
      ]);
      setLoading(false);
    }, 1000);
  }, [tabValue]);

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
        {/* Render JobCards in a responsive grid when jobs tab is selected */}
        {tabValue === 'jobs' && (
          <div className="w-full flex flex-col items-center">
            {showStopScreen ? (
              <StopScreen onBack={() => setShowStopScreen(false)} />
            ) : (
              <>
                {loading && <div>Loading jobs...</div>}
                {error && <div className="text-red-500">{error}</div>}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 justify-items-center">
                  {jobs && jobs.length > 0 ? (
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
                    <JobCard
                      company="Jockey India"
                      jobId="id_234566"
                      boardSize="64×64"
                      gsm="xyz"
                      artwork="id_123456"
                      approvalDate="15/04/2025"
                      dispatchDate="15/04/2025"
                      onStop={() => setShowStopScreen(true)}
                    />
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