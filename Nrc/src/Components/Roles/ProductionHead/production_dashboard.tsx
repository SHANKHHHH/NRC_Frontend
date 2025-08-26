import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CogIcon,
  UserGroupIcon,
  TruckIcon,
  DocumentTextIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { productionService } from './productionService';
import type { ProductionData, ProductionStep } from './productionService';





const ProductionHeadDashboard: React.FC = () => {
  const [productionData, setProductionData] = useState<ProductionData>({
    corrugation: [],
    fluteLamination: [],
    punching: [],
    flapPasting: []
  });
  
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [availableJobs, setAvailableJobs] = useState<Array<{ nrcJobNo: string; customerName: string; status: string }>>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredJobs, setFilteredJobs] = useState<Array<{ nrcJobNo: string; customerName: string; status: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'analytics'>('overview');
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<{ isAuthenticated: boolean; message: string } | null>(null);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '3months' | 'custom'>('7days');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const status = productionService.checkAuthStatus();
      setAuthStatus(status);
      
      if (!status.isAuthenticated) {
        setError(status.message);
      }
    };
    
    checkAuth();
  }, []);

  // Load available jobs
  useEffect(() => {
    const loadJobs = async () => {
      if (authStatus?.isAuthenticated) {
        try {
          setIsLoadingJobs(true);
          const jobs = await productionService.getAvailableJobs();
          setAvailableJobs(jobs);
          setFilteredJobs(jobs);
          
          // Auto-select first job if available
          if (jobs.length > 0 && !selectedJob) {
            setSelectedJob(jobs[0].nrcJobNo);
          } else if (jobs.length === 0) {
            setError('No active jobs found. Please check if there are any jobs with STATUS=ACTIVE in the system.');
            // Stop loading since no jobs are available
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error loading jobs:', error);
          setError('Failed to load available jobs');
          setIsLoading(false);
        } finally {
          setIsLoadingJobs(false);
        }
      }
    };
    
    loadJobs();
  }, [authStatus, selectedJob]); // Added selectedJob back to prevent stale closure

  // Filter jobs based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredJobs(availableJobs);
    } else {
      const filtered = availableJobs.filter(job => 
        job.nrcJobNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, availableJobs]);

  // Fetch production data from API
  useEffect(() => {
    const fetchProductionData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check auth before making API calls
        const authCheck = productionService.checkAuthStatus();
        if (!authCheck.isAuthenticated) {
          setError(authCheck.message);
          return;
        }
        
        const data = await productionService.getAllProductionData(selectedJob);
        setProductionData(data);
      } catch (error) {
        console.error('Error fetching production data:', error);
        setError('Failed to fetch production data. Please try again.');
        // Set empty data on error
        setProductionData({
          corrugation: [],
          fluteLamination: [],
          punching: [],
          flapPasting: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedJob && authStatus?.isAuthenticated) {
      fetchProductionData();
    }
  }, [selectedJob, authStatus]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accept':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reject':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accept':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'reject':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateEfficiency = () => {
    const totalSteps = 4;
    const completedSteps = Object.values(productionData).filter(step => 
      step.length > 0 && step[0].status === 'accept'
    ).length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const calculateTotalQuantity = () => {
    return Object.values(productionData).reduce((total, steps) => {
      return total + steps.reduce((stepTotal: number, step: ProductionStep) => stepTotal + step.quantity, 0);
    }, 0);
  };


  
  // Show loading if authentication is still pending
  if (!authStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  if (isLoading || isLoadingJobs) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            {isLoadingJobs ? 'Loading available jobs...' : 'Loading production data...'}
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-[#00AEEF] rounded-lg text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <CogIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Production Head Dashboard</h1>
                <p className="text-blue-100">Monitor and manage production operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Authentication Status */}
              {authStatus && (
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  authStatus.isAuthenticated 
                    ? authStatus.message.includes('expiring') 
                      ? 'bg-yellow-500/20 text-yellow-100' 
                      : 'bg-green-500/20 text-green-100'
                    : 'bg-red-500/20 text-red-100'
                }`}>
                  {authStatus.message}
                </div>
              )}
              
              <button
                onClick={() => {
                  if (selectedJob) {
                    const fetchProductionData = async () => {
                      try {
                        setIsLoading(true);
                        setError(null);
                        const data = await productionService.getAllProductionData(selectedJob);
                        setProductionData(data);
                      } catch (error) {
                        console.error('Error refreshing production data:', error);
                        setError('Failed to refresh production data. Please try again.');
                      } finally {
                        setIsLoading(false);
                      }
                    };
                    fetchProductionData();
                  }
                }}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-sm">Last Updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Selection & Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Job Selection Dropdown */}
            <div>
              <label htmlFor="jobSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Select Job
              </label>
              <select
                id="jobSelect"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoadingJobs}
              >
                <option value="">Select a job...</option>
                {filteredJobs.map((job) => (
                  <option key={job.nrcJobNo} value={job.nrcJobNo}>
                    {job.nrcJobNo} - {job.customerName}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Search */}
            <div>
              <label htmlFor="jobSearch" className="block text-sm font-medium text-gray-700 mb-2">
                Search Jobs
              </label>
              <input
                id="jobSearch"
                type="text"
                placeholder="Search by NRC Job No or Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Loading State for Jobs */}
          {isLoadingJobs && (
            <div className="mt-4 text-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Loading available jobs...
            </div>
          )}

          {/* Selected Job Info */}
          {selectedJob && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-blue-800">Selected Job:</span>
                  <span className="ml-2 text-sm text-blue-600 font-mono">{selectedJob}</span>
                </div>
                <button
                  onClick={() => setSelectedJob('')}
                  className="text-blue-400 hover:text-blue-600 text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'details', label: 'Production Details', icon: DocumentTextIcon },
              { id: 'analytics', label: 'Analytics', icon: ArrowTrendingUpIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#00AEEF] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Production Efficiency</p>
                    <p className="text-3xl font-bold text-blue-600">{calculateEfficiency()}%</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${calculateEfficiency()}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                    <p className="text-3xl font-bold text-green-600">{calculateTotalQuantity().toLocaleString()}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <TruckIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Units produced today</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {availableJobs.filter(job => job.status === 'ACTIVE').length}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <DocumentTextIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Currently in production</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Production Steps</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {Object.values(productionData).reduce((total, steps) => total + steps.length, 0)}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <UserGroupIcon className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Operators on duty</p>
              </div>
            </div>

            {/* Production Steps Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Production Steps Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { 
                    name: 'Corrugation', 
                    data: productionData.corrugation[0],
                    color: 'blue',
                    icon: CogIcon
                  },
                  { 
                    name: 'Flute Lamination', 
                    data: productionData.fluteLamination[0],
                    color: 'green',
                    icon: BuildingOfficeIcon
                  },
                  { 
                    name: 'Punching', 
                    data: productionData.punching[0],
                    color: 'purple',
                    icon: DocumentTextIcon
                  },
                  { 
                    name: 'Flap Pasting', 
                    data: productionData.flapPasting[0],
                    color: 'orange',
                    icon: TruckIcon
                  }
                ].map((step, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`bg-${step.color}-100 p-2 rounded-lg`}>
                        <step.icon className={`h-6 w-6 text-${step.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{step.name}</h3>
                        <p className="text-sm text-gray-500">Step {index + 1}</p>
                      </div>
                    </div>
                    
                    {step.data ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(step.data.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(step.data.status)}`}>
                            {step.data.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Qty: {step.data.quantity.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(step.data.date)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No data available</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>


          </div>
        )}

        {/* Production Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Production Details - {selectedJob}</h2>
              
              {/* Job Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Job</label>
                <select 
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a job</option>
                  {availableJobs.map((job) => (
                    <option key={job.nrcJobNo} value={job.nrcJobNo}>
                      {job.nrcJobNo} - {job.customerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detailed Steps */}
              <div className="space-y-6">
                {[
                  { 
                    title: 'Corrugation Process', 
                    data: productionData.corrugation[0],
                    fields: ['machineNo', 'oprName', 'size', 'gsm1', 'gsm2', 'flute', 'shift']
                  },
                  { 
                    title: 'Flute Lamination', 
                    data: productionData.fluteLamination[0],
                    fields: ['operatorName', 'film', 'adhesive', 'wastage', 'shift']
                  },
                  { 
                    title: 'Punching Process', 
                    data: productionData.punching[0],
                    fields: ['operatorName', 'machine', 'die', 'wastage', 'shift']
                  },
                  { 
                    title: 'Flap Pasting', 
                    data: productionData.flapPasting[0],
                    fields: ['operatorName', 'machineNo', 'adhesive', 'wastage', 'shift']
                  }
                ].map((step, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(step.data?.status || 'pending')}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(step.data?.status || 'pending')}`}>
                          {step.data?.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    
                    {step.data ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {step.fields.map((field) => (
                          <div key={field} className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                              {field.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-sm text-gray-900">
                              {step.data[field] || 'N/A'}
                            </p>
                          </div>
                        ))}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Quantity</p>
                          <p className="text-sm text-gray-900 font-semibold">
                            {step.data.quantity.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Date</p>
                          <p className="text-sm text-gray-900">
                            {formatDate(step.data.date)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No data available for this step</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Production Efficiency Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Efficiency by Step</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(productionService.getAnalyticsData(productionData).efficiencyData).map(([step, efficiency]) => (
                  <div key={step} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 capitalize">{step}</span>
                      <span className="text-lg font-bold text-blue-600">{efficiency.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${efficiency}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Trends Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity Trends by Production Step</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(productionService.getAnalyticsData(productionData).quantityData).map(([step, quantity]) => (
                  <div key={step} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800 capitalize">{step}</p>
                        <p className="text-2xl font-bold text-blue-600">{quantity.toLocaleString()}</p>
                      </div>
                      <div className="bg-blue-500 rounded-full p-2">
                        <ChartBarIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>



            {/* Machine Utilization */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Machine Utilization</h3>
              <div className="space-y-4">
                {Object.entries(productionService.getAnalyticsData(productionData).machineData).map(([step, machines]) => (
                  <div key={step} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-700 capitalize mb-3">{step} Machines</h4>
                    <div className="flex flex-wrap gap-2">
                      {machines.length > 0 ? (
                        machines.map((machine, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                          >
                            <CogIcon className="h-4 w-4 mr-1" />
                            {machine}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No machine data available</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Production Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-full p-3">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Production Steps</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.values(productionData).reduce((total, steps) => total + steps.length, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-full p-3">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed Steps</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.values(productionData).reduce((total, steps) => 
                        total + steps.filter((step: ProductionStep) => step.status === 'accept').length, 0
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-purple-500 rounded-full p-3">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overall Efficiency</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(() => {
                        const totalSteps = Object.values(productionData).reduce((total, steps) => total + steps.length, 0);
                        const completedSteps = Object.values(productionData).reduce((total, steps) => 
                          total + steps.filter((step: ProductionStep) => step.status === 'accept').length, 0
                        );
                        return totalSteps > 0 ? ((completedSteps / totalSteps) * 100).toFixed(1) : '0';
                      })()}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionHeadDashboard;
