// src/Components/Roles/Planner/JobInitiationForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import type { Job, PoDetailsPayload } from '../Types/job.ts';
import ArtworkDetailsForm from './ArtworkDetailsForm.tsx';
import PODetailsForm from './PODetailsForm.tsx';
import MoreInformationForm from './MoreInformationForm.tsx';

interface JobInitiationFormProps {
  onJobUpdated: (updatedJob: Job) => void;
}

type FormStep = 'artwork' | 'po' | 'moreInfo';

const JobInitiationForm: React.FC<JobInitiationFormProps> = ({ onJobUpdated }) => {
  const { nrcJobNo } = useParams<{ nrcJobNo: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [jobError, setJobError] = useState<string | null>(null);

  // New state for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedJob, setSearchedJob] = useState<Job | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<FormStep>('artwork');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const isDragging = useRef(false);

  // Check if this is the "Add PO" mode (nrcJobNo === 'new' or undefined)
  const isAddPOMode = nrcJobNo === 'new' || nrcJobNo === undefined;

  // Debug logging
  console.log('JobInitiationForm - nrcJobNo:', nrcJobNo);
  console.log('JobInitiationForm - isAddPOMode:', isAddPOMode);
  console.log('JobInitiationForm - job:', job);
  console.log('JobInitiationForm - jobError:', jobError);
  console.log('JobInitiationForm - loadingJob:', loadingJob);

  // Define the steps for the sidebar
  const formStepsConfig = [
    { id: 'artwork', label: 'Artwork Details', component: ArtworkDetailsForm },
    { id: 'po', label: 'P.O. Details', component: PODetailsForm },
    { id: 'moreInfo', label: 'More Information', component: MoreInformationForm },
  ];

  // Helper function to check job completion status
  const checkJobCompletionStatus = (job: Job): 'artwork_pending' | 'po_pending' | 'more_info_pending' | 'completed' => {
    // 1. Check Artwork Details
    if (!job.artworkReceivedDate || !job.artworkApprovedDate || !job.shadeCardApprovalDate) {
      return 'artwork_pending';
    }

    // 2. Check P.O. Details
    if (!job.poNumber || !job.unit || !job.plant ||
        job.totalPOQuantity === null || job.dispatchQuantity === null ||
        job.pendingQuantity === null || job.noOfSheets === null ||
        !job.poDate || !job.deliveryDate || !job.dispatchDate || !job.nrcDeliveryDate) {
      return 'po_pending';
    }

    // 3. Check More Information
    if (!job.jobDemand || !job.machineId || !job.jobSteps || job.jobSteps.length === 0) {
      return 'more_info_pending';
    }

    return 'completed';
  };

  // Helper to determine the initial step based on fetched job data
  const determineInitialStep = (currentJob: Job): FormStep => {
    // Check if artwork details are missing
    if (!currentJob.artworkReceivedDate || !currentJob.artworkApprovedDate || !currentJob.shadeCardApprovalDate) {
      return 'artwork';
    }
    
    // Check if PO details are missing
    if (!currentJob.poNumber || !currentJob.unit || !currentJob.plant ||
        currentJob.totalPOQuantity === null || currentJob.dispatchQuantity === null ||
        currentJob.pendingQuantity === null || currentJob.noOfSheets === null ||
        !currentJob.poDate || !currentJob.deliveryDate || !currentJob.dispatchDate || !currentJob.nrcDeliveryDate) {
      return 'po';
    }
    
    // Check if more info is missing
    if (!currentJob.jobDemand || !currentJob.machineId || !currentJob.jobSteps || currentJob.jobSteps.length === 0) {
      return 'moreInfo';
    }
    
    return 'artwork';
  };

  // Function to search jobs by NRC Job Number
  const searchJob = async () => {
    if (!searchTerm.trim()) {
      setSearchedJob(null);
      setSearchError(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch('http://nrc-backend-alb-174636098.ap-south-1.elb.amazonaws.com/api/jobs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to search jobs: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const foundJob = data.data.find((job: Job) => 
          job.nrcJobNo.toLowerCase().includes(searchTerm.toLowerCase()) && job.status === 'ACTIVE'
        );
        
        if (foundJob) {
          setSearchedJob(foundJob);
          setJob(foundJob); // Set the job for the form
          // Determine which step to start with based on completion status
          const initialStep = determineInitialStep(foundJob);
          setCurrentStep(initialStep);
          console.log('Job found, starting at step:', initialStep);
        } else {
          setSearchedJob(null);
          setSearchError('No active job found with this NRC Job Number.');
        }
      } else {
        setSearchedJob(null);
        setSearchError('Failed to search jobs.');
      }
    } catch (err) {
      console.error('Search Job Error:', err);
      setSearchedJob(null);
      setSearchError(err instanceof Error ? err.message : 'Failed to search jobs.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchJob();
  };

  // Fetch job details on component mount (only if not in Add PO mode)
  useEffect(() => {
    if (isAddPOMode) {
      setLoadingJob(false);
      return;
    }

    const fetchJobDetails = async () => {
      if (!nrcJobNo) {
        setJobError("Job number not provided in URL.");
        setLoadingJob(false);
        return;
      }

      setLoadingJob(true);
      setJobError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) throw new Error('Authentication token not found.');

        const response = await fetch(`http://nrc-backend-alb-174636098.ap-south-1.elb.amazonaws.com/api/jobs/${nrcJobNo}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch job details: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.success && data.data) {
          const fetchedJob: Job = {
            ...data.data,
            // Ensure all required fields have default values if missing from API
            poNumber: data.data.poNumber || null,
            unit: data.data.unit || null,
            plant: data.data.plant || null,
            totalPOQuantity: data.data.totalPOQuantity || null,
            dispatchQuantity: data.data.dispatchQuantity || null,
            pendingQuantity: data.data.pendingQuantity || null,
            noOfSheets: data.data.noOfSheets || null,
            poDate: data.data.poDate || null,
            deliveryDate: data.data.deliveryDate || null,
            dispatchDate: data.data.dispatchDate || null,
            nrcDeliveryDate: data.data.nrcDeliveryDate || null,
            jobSteps: data.data.jobSteps || null,
            jobDemand: data.data.jobDemand || null,
            machineId: data.data.machineId || null,
            artworkReceivedDate: data.data.artworkReceivedDate || null,
            artworkApprovedDate: data.data.artworkApprovedDate || null,
            shadeCardApprovalDate: data.data.shadeCardApprovalDate || null,
            imageURL: data.data.imageURL || null,
          };
          setJob(fetchedJob);
          setCurrentStep(determineInitialStep(fetchedJob));
        } else {
          setJobError('Unexpected API response format for job details.');
        }
      } catch (err) {
        setJobError(`Failed to load job: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error('Fetch Job Details Error:', err);
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJobDetails();
  }, [nrcJobNo, isAddPOMode]);

  // --- API Handlers for each step ---

  const handleArtworkSave = async (updatedFields: Partial<Job>) => {
    setError(null);
    if (!job) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      const response = await fetch(`http://nrc-backend-alb-174636098.ap-south-1.elb.amazonaws.com/api/jobs/${job.nrcJobNo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update artwork details.');
      }
      const result = await response.json();
      if (result.success) {
        const updatedJob = { ...job, ...updatedFields, updatedAt: result.data.updatedAt };
        setJob(updatedJob);
        onJobUpdated(updatedJob);
        
        // Show success message
        setError(null);
        setSuccessMessage('Artwork details saved successfully! Moving to PO Details...');
        
        // Auto-progress to next step after a short delay
        setTimeout(() => {
          setCurrentStep('po');
          setSuccessMessage(null);
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to save artwork details.');
      }
    } catch (err) {
      setError(`Artwork Save Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const handlePOSave = async (poDetails: PoDetailsPayload) => {
    setError(null);
    if (!job) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      const payloadWithJobNo = { ...poDetails, nrcJobNo: job.nrcJobNo };

      const response = await fetch('http://nrc-backend-alb-174636098.ap-south-1.elb.amazonaws.com/api/purchase-orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payloadWithJobNo),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create P.O. details.');
      }
      const result = await response.json();
      if (result.success) {
        const updatedJob = { ...job, ...poDetails, updatedAt: result.data.updatedAt };
        setJob(updatedJob);
        onJobUpdated(updatedJob);
        
        // Show success message
        setError(null);
        setSuccessMessage('PO details saved successfully! Moving to More Information...');
        
        // Auto-progress to next step after a short delay
        setTimeout(() => {
          setCurrentStep('moreInfo');
          setSuccessMessage(null);
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to save P.O. details.');
      }
    } catch (err) {
      setError(`P.O. Save Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const handleMoreInfoSave = async (updatedFields: Partial<Job>) => {
    setError(null);
    if (!job) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      const response = await fetch(`http://nrc-backend-alb-174636098.ap-south-1.elb.amazonaws.com/api/jobs/${job.nrcJobNo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update more information.');
      }
      const result = await response.json();
      if (result.success) {
        const updatedJob = { ...job, ...updatedFields, updatedAt: result.data.updatedAt };
        setJob(updatedJob);
        onJobUpdated(updatedJob);
        
        // Show success message and redirect
        setError(null);
        setSuccessMessage('All forms completed successfully! Redirecting to dashboard...');
        
        // Redirect to dashboard after showing success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to save more information.');
      }
    } catch (err) {
      setError(`More Info Save Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  // Helper function to check if a step is accessible (previous step must be completed)
  const isStepAccessible = (step: FormStep): boolean => {
    if (!job) return false;
    
    switch (step) {
      case 'artwork':
        return true; // First step is always accessible
      case 'po':
        return getStepCompletion('artwork'); // PO only accessible after artwork
      case 'moreInfo':
        return getStepCompletion('po'); // More info only accessible after PO
      default:
        return false;
    }
  };

  // Helper function to check if a step is completed
  const getStepCompletion = (step: FormStep): boolean => {
    if (!job) return false;

    switch (step) {
      case 'artwork':
        return !!(job.artworkReceivedDate && job.artworkApprovedDate && job.shadeCardApprovalDate);
      case 'po':
        return !!(job.poNumber && job.unit && job.plant && job.totalPOQuantity !== null && 
                 job.dispatchQuantity !== null && job.pendingQuantity !== null && 
                 job.noOfSheets !== null && job.poDate && job.deliveryDate && 
                 job.dispatchDate && job.nrcDeliveryDate);
      case 'moreInfo':
        return !!(job.jobDemand && job.machineId && job.jobSteps && job.jobSteps.length > 0);
      default:
        return false;
    }
  };

  // Function to render the current form based on the current step
  const renderCurrentForm = () => {
    // If no job is selected, create a mock job with empty fields for the forms
    const currentJob = job || {
      id: 0,
      nrcJobNo: '',
      styleItemSKU: '',
      customerName: '',
      fluteType: null,
      status: 'ACTIVE' as const,
      latestRate: null,
      preRate: null,
      length: null,
      width: null,
      height: null,
      boxDimensions: '',
      diePunchCode: null,
      boardCategory: null,
      noOfColor: null,
      processColors: null,
      specialColor1: null,
      specialColor2: null,
      specialColor3: null,
      specialColor4: null,
      overPrintFinishing: null,
      topFaceGSM: null,
      flutingGSM: null,
      bottomLinerGSM: null,
      decalBoardX: null,
      lengthBoardY: null,
      boardSize: '',
      noUps: null,
      artworkReceivedDate: null,
      artworkApprovedDate: null,
      shadeCardApprovalDate: null,
      srNo: null,
      jobDemand: null,
      imageURL: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: null,
      machineId: null,
      poNumber: null,
      unit: null,
      plant: null,
      totalPOQuantity: null,
      dispatchQuantity: null,
      pendingQuantity: null,
      noOfSheets: null,
      poDate: null,
      deliveryDate: null,
      dispatchDate: null,
      nrcDeliveryDate: null,
      jobSteps: []
    };

    switch (currentStep) {
      case 'artwork':
        return (
          <ArtworkDetailsForm
            job={currentJob}
            onSave={handleArtworkSave}
            onNext={() => setCurrentStep('po')}
            onClose={() => navigate('/dashboard')}
            isReadOnly={getStepCompletion('artwork')}
          />
        );
      case 'po':
        return (
          <PODetailsForm
            job={currentJob}
            onSave={handlePOSave}
            onNext={() => setCurrentStep('moreInfo')}
            onClose={() => navigate('/dashboard')}
            isReadOnly={getStepCompletion('po')}
          />
        );
      case 'moreInfo':
        return (
          <MoreInformationForm
            job={currentJob}
            onSave={handleMoreInfoSave}
            onClose={() => navigate('/dashboard')}
            isReadOnly={getStepCompletion('moreInfo')}
          />
        );
      default:
        return null;
    }
  };

  // Touch event handlers for mobile sidebar
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const diff = startX.current - currentX;
    
    if (diff > 50) { // Swipe left to close
      setIsSidebarOpen(false);
      isDragging.current = false;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handleOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  // If in Add PO mode and no job is selected yet, show search interface
  if (isAddPOMode && !job) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Add Purchase Order</h1>
            <p className="text-gray-600">Search for an existing job to add purchase order details</p>
          </div>
          
          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Job</h2>
            <form onSubmit={handleSearchSubmit} className="max-w-md">
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter NRC Job Number..."
                  className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Search Error */}
            {searchError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {searchError}
              </div>
            )}

            {/* Search Success */}
            {searchedJob && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Job Found!</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-green-600 font-medium">NRC Job No</p>
                    <p className="text-green-800 font-semibold">{searchedJob.nrcJobNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Customer</p>
                    <p className="text-green-800 font-semibold">{searchedJob.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Style</p>
                    <p className="text-green-800 font-semibold">{searchedJob.styleItemSKU}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setJob(searchedJob);
                      setCurrentStep(determineInitialStep(searchedJob));
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Use This Job
                  </button>
                  <button
                    onClick={() => {
                      setSearchedJob(null);
                      setSearchTerm('');
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If in Add PO mode and job is found, show forms with completion status
  if (isAddPOMode && job) {
    const completionStatus = checkJobCompletionStatus(job);
    
    return (
      <div className="min-h-screen bg-[#f7f7f7] relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && window.innerWidth < 640 && (
          <div
            className="fixed inset-0 bg-transparent opacity-50 backdrop-blur-md z-40"
            onClick={handleOverlayClick}
          />
        )}

        {/* Sidebar - Fixed on all screen sizes */}
        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-white shadow-md p-6 flex flex-col z-50 overflow-y-auto
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            sm:translate-x-0`}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Planning Details</h3>
          <ul className="space-y-2">
            {formStepsConfig.map((step) => {
              const isCompleted = getStepCompletion(step.id as FormStep);
              const isCurrentStep = step.id === currentStep;
              const isAccessible = isStepAccessible(step.id as FormStep);
              
              return (
                <li key={step.id}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200
                      ${isCurrentStep ? 'bg-[#00AEEF] text-white shadow-md' : 
                        isCompleted ? 'bg-green-100 text-green-800' :
                        isAccessible ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}
                    `}
                    onClick={() => {
                      if (isAccessible) {
                        setCurrentStep(step.id as FormStep);
                        if (window.innerWidth < 640) {
                          setIsSidebarOpen(false);
                        }
                      }
                    }}
                    disabled={!isAccessible}
                  >
                    <div className="flex items-center justify-between">
                      <span>{step.label}</span>
                      {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Main Content Area - Always has left margin to account for fixed sidebar */}
        <main className="ml-0 sm:ml-64 p-4 sm:p-8 overflow-y-auto min-h-screen">
          {/* Hamburger icon for mobile */}
          <div className="sm:hidden mb-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md bg-white shadow-sm"
              aria-label="Open sidebar"
            >
              <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="fixed top-20 right-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm z-50 shadow-lg">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> {successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="fixed top-20 right-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm z-50 shadow-lg">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {/* Header with Job Info */}
          <div className="mb-8">
            {/* <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Add Purchase Order</h1> */}
            <p className="text-gray-600 mb-6">Job: {job.nrcJobNo} - {job.customerName}</p>
            
            {/* Completion Status */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Completion Status</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-3 sm:p-4 rounded-lg border-2 ${getStepCompletion('artwork') ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    {getStepCompletion('artwork') ? <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" /> : <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />}
                    <div>
                      <h3 className="text-sm sm:text-base font-medium text-gray-800">Artwork Details</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{getStepCompletion('artwork') ? 'Completed' : 'Pending'}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`p-3 sm:p-4 rounded-lg border-2 ${getStepCompletion('po') ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    {getStepCompletion('po') ? <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" /> : <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />}
                    <div>
                      <h3 className="text-sm sm:text-base font-medium text-gray-800">PO Details</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{getStepCompletion('po') ? 'Completed' : 'Pending'}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`p-3 sm:p-4 rounded-lg border-2 ${getStepCompletion('moreInfo') ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    {getStepCompletion('moreInfo') ? <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" /> : <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />}
                    <div>
                      <h3 className="text-sm sm:text-base font-medium text-gray-800">More Information</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{getStepCompletion('moreInfo') ? 'Completed' : 'Pending'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Render Current Form */}
          {renderCurrentForm()}
        </main>
      </div>
    );
  }

  if (jobError && !isAddPOMode) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {jobError}</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-[#00AEEF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0099cc] transition"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  if (!job && !isAddPOMode) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-500">Job not found or invalid URL.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-[#00AEEF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0099cc] transition"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && window.innerWidth < 640 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar - Fixed on all screen sizes */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-md p-6 flex flex-col z-50 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:translate-x-0`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Planning Details</h3>
        <ul className="space-y-2">
          {formStepsConfig.map((step, index) => {
            const isCompleted = getStepCompletion(step.id as FormStep);
            const isAccessible = isStepAccessible(step.id as FormStep);
            const isActive = step.id === currentStep;

            return (
              <li key={step.id}>
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200
                    ${isActive ? 'bg-[#00AEEF] text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}
                    ${!isAccessible && !isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  onClick={() => {
                    if (isAccessible) {
                      setCurrentStep(step.id as FormStep);
                      if (window.innerWidth < 640) {
                        setIsSidebarOpen(false);
                      }
                    }
                  }}
                  disabled={!isAccessible}
                >
                  {step.label}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content Area - Always has left margin to account for fixed sidebar */}
      <main className="ml-0 sm:ml-64 p-4 sm:p-8 overflow-y-auto min-h-screen">
        {/* Hamburger icon for mobile */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md bg-white shadow-sm"
            aria-label="Open sidebar"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-20 right-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm z-50 shadow-lg">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> {successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed top-20 right-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm z-50 shadow-lg">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {renderCurrentForm()}
      </main>
    </div>
  );
};

export default JobInitiationForm;
