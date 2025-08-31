import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import DateFilterComponent, { type DateFilterType } from './FilterComponents/DateFilterComponent';
import StatisticsGrid from './StatisticsCards/StatisticsGrid';
import LineChartComponent from './ChartComponents/LineChartComponent';
import BarChartComponent from './ChartComponents/BarChartComponent';
import PieChartComponent from './ChartComponents/PieChartComponent';
import AdvancedDataChart from './ChartComponents/AdvancedDataChart';
import JobPlansTable from './DataTable/JobPlansTable';
import { useNavigate } from 'react-router-dom';
import CompletedJobsTable from './CompletedJobsTable';
import LoadingSpinner from '../../common/LoadingSpinner';

// Types based on the API response structure
interface JobPlanStep {
  id: number;
  stepNo: number;
  stepName: string;
  machineDetails: Array<{
    unit: string | null;
    machineId: string | number;
    machineCode: string | null;
    machineType: string;
    machine?: {
      id: string;
      description: string;
      status: string;
      capacity: number;
    };
  }>;
  status: 'planned' | 'start' | 'stop';
  startDate: string | null;
  endDate: string | null;
  user: string | null;
  createdAt: string;
  updatedAt: string;
  stepDetails?: any; // Step-specific details from API endpoints
}

interface JobPlan {
  jobPlanId: number;
  nrcJobNo: string;
  jobDemand: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  steps: JobPlanStep[];
}

// StepDetails interface removed as it's not used

interface CompletedJob {
  id: number;
  nrcJobNo: string;
  jobPlanId: number;
  jobDemand: string;
  jobDetails: {
    id: number;
    customerName: string;
    preRate: number;
    latestRate: number;
    [key: string]: any;
  };
  purchaseOrderDetails: {
    id: number;
    customer: string;
    unit: string;
    [key: string]: any;
  };
  allSteps: Array<{
    id: number;
    stepName: string;
    machineDetails: Array<{
      unit: string | null;
      machineId: string;
      machineCode: string | null;
      machineType: string;
    }>;
    dispatchProcess?: {
      id: number;
      quantity: number;
      [key: string]: any;
    };
    [key: string]: any;
  }>;
  completedAt: string;
  completedBy: string;
  [key: string]: any;
}

interface AdminDashboardData {
  jobPlans: JobPlan[];
  totalJobs: number;
  completedJobs: number;
  inProgressJobs: number;
  plannedJobs: number;
  totalSteps: number;
  completedSteps: number;
  activeUsers: number;
  efficiency: number;
  stepCompletionStats: {
    [key: string]: {
      completed: number;
      inProgress: number;
      planned: number;
    };
  };
  machineUtilization: {
    [key: string]: {
      total: number;
      available: number;
      inUse: number;
    };
  };
  timeSeriesData: Array<{
    date: string;
    jobsStarted: number;
    jobsCompleted: number;
    totalSteps: number;
    completedSteps: number;
  }>;
  completedJobsData: CompletedJob[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterType>('month');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  // selectedJobPlan state removed as it's not used

  // Color scheme for charts
  const colors = {
    primary: '#00AEEF',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    warning: '#F97316',
    info: '#3B82F6',
    success: '#22C55E',
    gray: '#6B7280'
  };

  // stepColors removed as it's not used

  // Handle Total Jobs card click
  const handleTotalJobsClick = () => {
    navigate('/dashboard/job-details', {
      state: {
        jobData: {
          totalJobs: filteredData?.totalJobs || 0,
          completedJobs: filteredData?.completedJobs || 0,
          inProgressJobs: filteredData?.inProgressJobs || 0,
          plannedJobs: filteredData?.plannedJobs || 0
        }
      }
    });
  };

  // Handle Completed Jobs card click
  const handleCompletedJobsClick = () => {
    console.log('Completed Jobs card clicked - navigating to completed jobs view');
    navigate('/dashboard/completed-jobs');
  };

  // Handle In Progress Jobs card click
  const handleInProgressJobsClick = () => {
    console.log('In Progress Jobs card clicked - navigating to in-progress jobs view');
    navigate('/dashboard/in-progress-jobs');
  };

  // Handle Planned Jobs card click
  const handlePlannedJobsClick = () => {
    console.log('Planned Jobs card clicked - navigating to planned jobs view');
    navigate('/dashboard/planned-jobs');
  };

  // Fetch step-specific details for a job
  const fetchStepDetails = async (stepName: string, jobNrcJobNo: string, accessToken: string) => {
    try {
      let endpoint = '';
      switch (stepName) {
        case 'PaperStore':
          endpoint = `https://nrprod.nrcontainers.com/api/paper-store/by-job/${encodeURIComponent(jobNrcJobNo)}`;
          break;
        case 'PrintingDetails':
          endpoint = `https://nrprod.nrcontainers.com/api/printing-details/by-job/${encodeURIComponent(jobNrcJobNo)}`;
          break;
        case 'Corrugation':
          endpoint = `https://nrprod.nrcontainers.com/api/corrugation/by-job/${encodeURIComponent(jobNrcJobNo)}`;
          break;
        case 'FluteLaminateBoardConversion':
          endpoint = `https://nrprod.nrcontainers.com/api/flute-laminate-board-conversion/by-job/${encodeURIComponent(jobNrcJobNo)}`;
          break;
        case 'Punching':
          endpoint = `https://nrprod.nrcontainers.com/api/punching/by-job/${encodeURIComponent(jobNrcJobNo)}`;
          break;
        case 'SideFlapPasting':
          endpoint = `https://nrprod.nrcontainers.com/api/side-flap-pasting/by-job/${encodeURIComponent(jobNrcJobNo)}`;
          break;
        case 'QualityDept':
          endpoint = `https://nrprod.nrcontainers.com/api/quality-dept/by-job/${encodeURIComponent(jobNrcJobNo)}`;
          break;
        case 'DispatchProcess':
          endpoint = `https://nrprod.nrcontainers.com/api/dispatch-process/by-job/${encodeURIComponent(jobNrcJobNo)}`;
          break;
        default:
          return null;
      }

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        console.warn(`Failed to fetch ${stepName} details for job ${jobNrcJobNo}: ${response.status}`);
        return null;
      }

      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0]; // Return the first (and usually only) record
      }
      return null;
    } catch (err) {
      console.warn(`Error fetching ${stepName} details for job ${jobNrcJobNo}:`, err);
      return null;
    }
  };

  // Fetch data from API with date filtering
  const fetchDashboardData = async (filterType?: DateFilterType, customRange?: { start: string; end: string }) => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      // Build query parameters for date filtering
      const queryParams = new URLSearchParams();
      if (filterType && filterType !== 'custom') {
        queryParams.append('filter', filterType);
      } else if (customRange) {
        queryParams.append('startDate', customRange.start);
        queryParams.append('endDate', customRange.end);
      }

      // Fetch filtered job planning data
      const jobPlanningUrl = `https://nrprod.nrcontainers.com/api/job-planning/?${queryParams.toString()}`;
      const jobPlanningResponse = await fetch(jobPlanningUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!jobPlanningResponse.ok) {
        throw new Error(`Failed to fetch job planning data: ${jobPlanningResponse.status}`);
      }

      const jobPlanningResult = await jobPlanningResponse.json();
      
      // Fetch filtered completed jobs data
      const completedJobsUrl = `https://nrprod.nrcontainers.com/api/completed-jobs?${queryParams.toString()}`;
      const completedJobsResponse = await fetch(completedJobsUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      let completedJobsData: CompletedJob[] = [];
      if (completedJobsResponse.ok) {
        const completedJobsResult = await completedJobsResponse.json();
        if (completedJobsResult.success && Array.isArray(completedJobsResult.data)) {
          completedJobsData = completedJobsResult.data;
        }
      }

      if (jobPlanningResult.success && Array.isArray(jobPlanningResult.data)) {
        const jobPlans = jobPlanningResult.data;
        
        // Fetch step details for each job plan
        const jobPlansWithDetails = await Promise.all(
          jobPlans.map(async (jobPlan: JobPlan) => {
            const stepsWithDetails = await Promise.all(
              jobPlan.steps.map(async (step: JobPlanStep) => {
                let stepDetails = null;
                if (step.status === 'start' || step.status === 'stop') {
                  stepDetails = await fetchStepDetails(step.stepName, jobPlan.nrcJobNo, accessToken);
                }
                
                return {
                  ...step,
                  stepDetails
                };
              })
            );
            
            return {
              ...jobPlan,
              steps: stepsWithDetails
            };
          })
        );
        
        // Process the data to create dashboard statistics
        const processedData = processJobPlanData(jobPlansWithDetails, completedJobsData);
        
        setData(processedData);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Process job plan data to create dashboard statistics
  const processJobPlanData = (jobPlans: JobPlan[], completedJobsData: CompletedJob[]): AdminDashboardData => {
    // Count completed jobs from the completed jobs API
    const completedJobsCount = completedJobsData.length;
    
    // Count jobs from job planning API (these are in progress or planned)
    const totalJobs = jobPlans.length;
    let inProgressJobs = 0;
    let plannedJobs = 0;
    let totalSteps = 0;
    let completedSteps = 0;
    const uniqueUsers = new Set<string>();

    const stepStats: { [key: string]: { completed: number; inProgress: number; planned: number } } = {};
    const machineStats: { [key: string]: { total: number; available: number; inUse: number } } = {};
    const timeSeriesData: Array<{ date: string; jobsStarted: number; jobsCompleted: number; totalSteps: number; completedSteps: number }> = [];

    // Initialize step statistics
    const stepNames = ['PaperStore', 'PrintingDetails', 'Corrugation', 'FluteLaminateBoardConversion', 'Punching', 'SideFlapPasting', 'QualityDept', 'DispatchProcess'];
    stepNames.forEach(step => {
      stepStats[step] = { completed: 0, inProgress: 0, planned: 0 };
    });

    // Process each job plan
    jobPlans.forEach(jobPlan => {
      let jobCompleted = true;
      let jobInProgress = false;
      const totalStepsInJob = jobPlan.steps.length;
      let completedStepsInJob = 0;

      totalSteps += totalStepsInJob;

      jobPlan.steps.forEach(step => {
        // SAFETY CHECK: Ensure stepStats exists for this step name
        if (!stepStats[step.stepName]) {
          // If step name doesn't exist in predefined list, create it dynamically
          stepStats[step.stepName] = { completed: 0, inProgress: 0, planned: 0 };
        }
        
        // Determine step completion based on step details and status
        if (step.stepDetails && step.stepDetails.status === 'accept') {
          // Step is completed if details show 'accept' status
          stepStats[step.stepName].completed++;
          completedStepsInJob++;
          completedSteps++;
        } else if (step.status === 'start' || (step.stepDetails && step.stepDetails.status === 'in_progress')) {
          // Step is in progress
          stepStats[step.stepName].inProgress++;
          jobInProgress = true;
          jobCompleted = false;
        } else {
          // Step is planned
          stepStats[step.stepName].planned++;
          jobCompleted = false;
        }

        // Track unique users
        if (step.user) {
          uniqueUsers.add(step.user);
        }

        // Process machine details - ADD SAFETY CHECK
        if (step.machineDetails && Array.isArray(step.machineDetails)) {
          step.machineDetails.forEach(machine => {
            if (machine.machineType !== 'Not assigned') {
              const machineKey = machine.machineType;
              if (!machineStats[machineKey]) {
                machineStats[machineKey] = { total: 0, available: 0, inUse: 0 };
              }
              machineStats[machineKey].total++;
              
              if (machine.machine?.status === 'available') {
                machineStats[machineKey].available++;
              } else {
                machineStats[machineKey].inUse++;
              }
            }
          });
        }
      });

      // Determine job status
      if (jobCompleted) {
        // This job is completed, but we're not counting it here since it comes from completed jobs API
        // The completed jobs count comes from completedJobsData
      } else if (jobInProgress) {
        inProgressJobs++;
      } else {
        plannedJobs++;
      }

      // Add to time series data
      const jobDate = new Date(jobPlan.createdAt).toISOString().split('T')[0];
      const existingDateIndex = timeSeriesData.findIndex(item => item.date === jobDate);
      
      if (existingDateIndex >= 0) {
        timeSeriesData[existingDateIndex].totalSteps += totalStepsInJob;
        timeSeriesData[existingDateIndex].completedSteps += completedStepsInJob;
        if (jobInProgress) timeSeriesData[existingDateIndex].jobsStarted++;
        // Note: completed jobs are counted separately from completed jobs API
      } else {
        timeSeriesData.push({
          date: jobDate,
          jobsStarted: jobInProgress ? 1 : 0,
          jobsCompleted: 0, // Will be updated with completed jobs data
          totalSteps: totalStepsInJob,
          completedSteps: completedStepsInJob
        });
      }
    });

    // Process completed jobs data for time series
    completedJobsData.forEach(completedJob => {
      const completedDate = new Date(completedJob.purchaseOrderDetails.poDate).toISOString().split('T')[0];
      const existingDateIndex = timeSeriesData.findIndex(item => item.date === completedDate);
      
      if (existingDateIndex >= 0) {
        timeSeriesData[existingDateIndex].jobsCompleted++;
      } else {
        timeSeriesData.push({
          date: completedDate,
          jobsStarted: 0,
          jobsCompleted: 1,
          totalSteps: 0,
          completedSteps: 0
        });
      }
    });

    // Sort time series data by date
    timeSeriesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate efficiency
    const efficiency = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return {
      jobPlans,
      totalJobs: totalJobs + completedJobsCount, // Total = job plans + completed jobs
      completedJobs: completedJobsCount, // From completed jobs API
      inProgressJobs,
      plannedJobs,
      totalSteps,
      completedSteps,
      activeUsers: uniqueUsers.size,
      efficiency,
      stepCompletionStats: stepStats,
      machineUtilization: machineStats,
      timeSeriesData,
      completedJobsData: completedJobsData // Use the actual completed jobs data
    };
  };

  // Handle filter changes
  const handleFilterChange = (newFilter: DateFilterType, customRange?: { start: string; end: string }) => {
    fetchDashboardData(newFilter, customRange);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Data is now filtered at the API level, so we use the data directly
  const filteredData = data;

  // handleViewJobDetails function removed as it's not needed

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen ">
        <LoadingSpinner size="lg" variant="inline" />
        <p className="ml-4 text-lg text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => fetchDashboardData()}
          className="mt-4 bg-[#00AEEF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0099cc] transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!filteredData) {
    return <div>No data available</div>;
  }


  
  return (
    <div className="p-4 sm:p-6 lg:p-8  min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Calendar className="text-gray-500" size={20} />
            <span className="text-sm text-gray-600">Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>
        
        {/* Date Filter Controls */}
        <DateFilterComponent
          dateFilter={dateFilter}
          setDateFilter={(filter) => {
            setDateFilter(filter);
            handleFilterChange(filter);
          }}
          customDateRange={customDateRange}
          setCustomDateRange={(range) => {
            setCustomDateRange(range);
            handleFilterChange('custom', range);
          }}
        />
      </div>

      {/* Statistics Grid */}
      <StatisticsGrid
        totalJobs={filteredData?.totalJobs || 0}
        completedJobs={filteredData?.completedJobs || 0}
        inProgressJobs={filteredData?.inProgressJobs || 0}
        plannedJobs={filteredData?.plannedJobs || 0}
        // totalSteps={filteredData.totalSteps}
        // completedSteps={filteredData.completedSteps}
        activeUsers={filteredData?.activeUsers || 0}
        efficiency={filteredData?.efficiency || 0}
        className="mb-8"
        onTotalJobsClick={handleTotalJobsClick}
        onCompletedJobsClick={handleCompletedJobsClick}
        onInProgressJobsClick={handleInProgressJobsClick}
        onPlannedJobsClick={handlePlannedJobsClick}
      />

      {/* Completed Jobs Summary Table - Moved here below statistics grid */}
      {filteredData.completedJobsData && filteredData.completedJobsData.length > 0 && (
        <CompletedJobsTable
          data={filteredData.completedJobsData}
          className="mb-8"
        />
      )}



      {/* Production Summary Cards - Commented out for now
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(() => {
          // Calculate total quantities from step details
          let totalQuantity = 0;
          let totalWastage = 0;
          let totalRejected = 0;
          let totalDispatched = 0;

          filteredData.jobPlans.forEach(jobPlan => {
            jobPlan.steps.forEach(step => {
              if (step.stepDetails) {
                const details = step.stepDetails;
                
                // Sum quantities from different step types
                if (details.quantity) {
                  totalQuantity += details.quantity;
                }
                
                // Sum wastage
                if (details.wastage) {
                  totalWastage += details.wastage;
                }
                
                // Sum rejected quantities (from QualityDept)
                if (details.rejectedQty) {
                  totalRejected += details.rejectedQty;
                }
                
                // Sum dispatched quantities (from DispatchProcess)
                if (details.quantity && step.stepName === 'DispatchProcess') {
                  totalDispatched += details.quantity;
                }
              }
            });
          });

          return [
            {
              title: 'Total Production Qty',
              value: totalQuantity.toLocaleString(),
              icon: '📦',
              color: 'bg-blue-100 text-blue-800 border-blue-300'
            },
            {
              title: 'Total Wastage',
              value: totalWastage.toLocaleString(),
              icon: '🗑️',
              color: 'bg-red-100 text-red-800 border-red-300'
            },
            {
              title: 'Total Rejected',
              value: totalRejected.toLocaleString(),
              icon: '❌',
              color: 'bg-orange-100 text-orange-800 border-orange-300'
            },
            {
              title: 'Total Dispatched',
              value: totalDispatched.toLocaleString(),
              icon: '🚚',
              color: 'bg-green-100 text-green-800 border-green-300'
            }
          ];
        })().map((card, index) => (
          <div key={index} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${card.color}`}>
            <div className="flex items-center">
              <div className="text-3xl mr-4">{card.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Job Progress Over Time */}
        <LineChartComponent
          data={filteredData.timeSeriesData}
          dataKeys={[
            { key: 'jobsStarted', color: colors.warning, name: 'Jobs Started' },
            { key: 'jobsCompleted', color: colors.success, name: 'Jobs Completed' }
          ]}
          xAxisKey="date"
          title="Job Progress Over Time"
          height={300}
          maxDataPoints={2000}
          showArea={true}
        />

        {/* Step Completion Status */}
        <BarChartComponent
          data={Object.entries(filteredData.stepCompletionStats).map(([step, stats]) => ({
            step,
            completed: stats.completed,
            inProgress: stats.inProgress,
            planned: stats.planned
          }))}
          dataKeys={[
            { key: 'completed', color: colors.success, name: 'Completed' },
            { key: 'inProgress', color: colors.warning, name: 'In Progress' },
            { key: 'planned', color: colors.gray, name: 'Planned' }
          ]}
          xAxisKey="step"
          title="Step Completion Status"
          height={300}
          maxDataPoints={500}
        />
      </div>

      {/* Machine Utilization */}
      <BarChartComponent
        data={Object.entries(filteredData.machineUtilization).map(([machine, stats]) => ({
          machine,
          available: stats.available,
          inUse: stats.inUse
        }))}
        dataKeys={[
          { key: 'available', color: colors.success, name: 'Available' },
          { key: 'inUse', color: colors.warning, name: 'In Use' }
        ]}
        xAxisKey="machine"
        title="Machine Utilization"
        height={300}
        maxDataPoints={300}
        className="mb-8"
      />

      {/* Step-wise Progress Chart */}
      <LineChartComponent
        data={filteredData.timeSeriesData}
        dataKeys={[
          { key: 'totalSteps', color: colors.primary, name: 'Total Steps' },
          { key: 'completedSteps', color: colors.success, name: 'Completed Steps' }
        ]}
        xAxisKey="date"
        title="Step-wise Progress"
        height={400}
        maxDataPoints={3000}
        showArea={true}
        className="mb-8"
      />

      {/* Advanced Data Visualization for Large Datasets */}
      <AdvancedDataChart
        data={filteredData.jobPlans.flatMap(jobPlan => 
          jobPlan.steps.map(step => ({
            date: step.startDate || step.createdAt,
            stepName: step.stepName,
            status: step.status,
            user: step.user,
            machineType: step.machineDetails?.[0]?.machineType || 'Not assigned',
            stepId: step.id,
            jobNo: jobPlan.nrcJobNo,
            demand: jobPlan.jobDemand
          }))
        )}
        dataKeys={[
          { key: 'stepId', color: colors.primary, name: 'Step ID' },
          { key: 'status', color: colors.secondary, name: 'Status' },
          { key: 'demand', color: colors.accent, name: 'Demand Level' }
        ]}
        xAxisKey="date"
        title="Advanced Step Analysis (Large Dataset Capable)"
        chartType="line"
        height={450}
        maxDataPoints={5000}
        enableVirtualization={true}
        enableFiltering={true}
        enableSearch={true}
        className="mb-8"
      />

      {/* Detailed Step Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Step Information</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(filteredData.stepCompletionStats).map(([stepName, stats]) => {
            const stepJobs = filteredData.jobPlans.filter(jobPlan => 
              jobPlan.steps.some(step => step.stepName === stepName && step.stepDetails)
            );
            
            return (
              <div key={stepName} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">{stepName}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed:</span>
                    <span className="font-medium text-green-600">{stats.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">In Progress:</span>
                    <span className="font-medium text-yellow-600">{stats.inProgress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Planned:</span>
                    <span className="font-medium text-gray-600">{stats.planned}</span>
                  </div>
                  {stepJobs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Recent Jobs with Details:</p>
                      <div className="space-y-1">
                        {stepJobs.slice(0, 3).map(jobPlan => {
                          const step = jobPlan.steps.find(s => s.stepName === stepName);
                          const details = step?.stepDetails;
                          
                          if (!details) return null;
                          
                          return (
                            <div key={jobPlan.jobPlanId} className="text-xs bg-gray-50 p-2 rounded">
                              <div className="font-medium text-gray-700">{jobPlan.nrcJobNo}</div>
                              <div className="text-gray-500">
                                {details.quantity && `Qty: ${details.quantity}`}
                                {details.operatorName && ` | Operator: ${details.operatorName}`}
                                {details.date && ` | Date: ${new Date(details.date).toLocaleDateString()}`}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Job Plans Table */}
      <JobPlansTable
        jobPlans={filteredData.jobPlans}
        onViewDetails={(jobPlan) => console.log('Viewing job plan:', jobPlan)}
        className="mb-8"
      />

      {/* Job Demand Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PieChartComponent
          data={[
            { name: 'Low Demand', value: filteredData.jobPlans.filter(jp => jp.jobDemand === 'low').length, color: colors.success },
            { name: 'Medium Demand', value: filteredData.jobPlans.filter(jp => jp.jobDemand === 'medium').length, color: colors.warning },
            { name: 'High Demand', value: filteredData.jobPlans.filter(jp => jp.jobDemand === 'high').length, color: colors.danger }
          ]}
          title="Job Demand Distribution"
          height={300}
          maxDataPoints={50}
          showPercentage={true}
          showValues={true}
        />

        <PieChartComponent
          data={[
            { name: 'Completed', value: filteredData.completedJobs, color: colors.success },
            { name: 'In Progress', value: filteredData.inProgressJobs, color: colors.warning },
            { name: 'Planned', value: filteredData.plannedJobs, color: colors.gray }
          ]}
          title="Job Status Distribution"
          height={300}
          maxDataPoints={50}
          showPercentage={true}
          showValues={true}
        />
      </div>


    </div>
  );
};

export default AdminDashboard; 