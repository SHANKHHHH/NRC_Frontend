// Nrc/src/Pages/Dashboard/Dashboard.tsx
import React, { lazy, Suspense, useEffect, useState } from 'react';
// Import the Job interface from the centralized types file
import { type Job } from '../../Components/Roles/Planner/Types/job.ts'; // Corrected path to the Job interface

const OrderSummary = lazy(() => import('../../Components/Roles/Admin/Planner/OrderSummary'));
const ProductionSchedule = lazy(() => import('../../Components/Roles/Admin/Planner/ProductionSchedule'));
const Summary = lazy(() => import('../../Components/Roles/Admin/Production_Head/Summary'));
const ProductionUpdate = lazy(() => import('../../Components/Roles/Admin/Production_Head/ProductionUpdate'));
const DispatchOverview = lazy(() => import('../../Components/Roles/Admin/DispatchHead/DispatchOverview'));
const DispatchSummary = lazy(() => import('../../Components/Roles/Admin/DispatchHead/DispatchSummary'));
// NOTE: JobCard import for PrintingMgr/job.tsx might need review if it's not a JobCard component
// but a full job display. For now, keeping as is based on previous context.
import PrintingMgrJobCard from '../../Components/Roles/PrintingMgr/job'; // Renamed import to avoid conflict
import StopScreen from '../../Components/Roles/PrintingMgr/options/stop';
import DispatchExecutiveJobs from '../../Components/Roles/Dispatch_Executive /dispatch_jobs';
import ReadyDispatchForm from '../../Components/Roles/Dispatch_Executive /ReadytoDispatch/readyDispatch';
import ProductionSteps from '../../Components/Roles/ProductionHead/productionSteps/production_steps';
import PlannerDashboard from '../../Components/Roles/Planner/Planner_dashboard';
import StartNewJob from '../../Components/Roles/Planner/startNew_job';
import PlannerNotifications from '../../Components/Roles/Planner/planner_notifications';
import PlannerJobs from '../../Components/Roles/Planner/planner_jobs';
import JobInitiationForm from '../../Components/Roles/Planner/Form/JobInitiationForm.tsx'; // Import the JobInitiationForm
import JobAssigned from '../../Components/Roles/Planner/job_assigned.tsx';

interface DashboardProps {
  tabValue: string;
  setTabValue: (value: string) => void; // setTabValue is used in Header, but not directly here. It's fine.
  role: string;
}

const Dashboard: React.FC<DashboardProps> = ({ tabValue, role }) => {
  return (
    <div className="px-4 sm:px-8 py-8 bg-[#f7f7f7] min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        {/* Admin Role Tabs */}
        {role === 'admin' && tabValue === 'planner' && (
          <>
            <OrderSummary />
            <ProductionSchedule />
          </>
        )}
        {role === 'admin' && tabValue === 'production' && (
          <>
            <Summary />
            <ProductionUpdate />
          </>
        )}
        {role === 'admin' && tabValue === 'dispatch' && (
          <>
            <DispatchOverview />
            <DispatchSummary />
          </>
        )}

        {/* Planner role specific components */}
        {role === 'planner' && tabValue === 'dashboard' && (
          <PlannerDashboard />
        )}
        {role === 'planner' && tabValue === 'start new job' && (
          <StartNewJob />
        )}
        {role === 'planner' && tabValue === 'notifications' && (
          <PlannerNotifications />
        )}
        {role === 'planner' && tabValue === 'jobs' && (
          <PlannerJobs />
        )}
        {/* New route for Job Initiation Form - it will handle its own layout */}
        {role === 'planner' && tabValue === 'initiate-job' && ( // Assuming you'll set tabValue to 'initiate-job' for this route
          // This will be handled by App.tsx routing directly, not via tabValue here.
          // This block effectively becomes redundant if App.tsx handles the direct route.
          // However, if you intend to keep it as a 'tab', then this logic is fine.
          // For a full-page component, it's better to manage it directly in App.tsx.
          // I will proceed assuming App.tsx will handle the direct route.
          null // This will be removed or changed based on App.tsx's final routing.
        )}
        {role === 'planner' && tabValue === 'job assigned' && ( // ADDED: New condition for Job Assigned
          <JobAssigned />
        )}


        {/* Printing Manager jobs tab */}
        {role === 'printing_manager' && tabValue === 'jobs' && (
          <div className="w-full flex flex-col items-center">
            <p className="text-gray-500 text-center py-8">Printing Manager Jobs Content Here (Needs internal data fetching)</p>
          </div>
        )}

        {/* Dispatch Executive jobs tab */}
        {role === 'dispatch_executive' && tabValue === 'jobs' && (
          <DispatchExecutiveJobs />
        )}

        {/* Production Head jobs tab */}
        {role === 'production_head' && tabValue === 'jobs' && (
          <div className="w-full flex flex-col items-center">
            <p className="text-gray-500 text-center py-8">Production Head Jobs Content Here (Needs internal data fetching)</p>
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default Dashboard;
