// src/Components/Roles/Planner/JobInitiationForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  const [currentStep, setCurrentStep] = useState<FormStep>('artwork');
  const [error, setError] = useState<string | null>(null); // For API errors during form submission

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const isDragging = useRef(false);

  // Define the steps for the sidebar
  const formStepsConfig = [
    { id: 'artwork', label: 'Artwork Details', component: ArtworkDetailsForm },
    { id: 'po', label: 'P.O. Details', component: PODetailsForm },
    { id: 'moreInfo', label: 'More Information', component: MoreInformationForm },
  ];

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
    
    // If all are filled, start with artwork (this shouldn't happen for new jobs)
    return 'artwork';
  };

  // Fetch job details on component mount
  useEffect(() => {
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

        console.log('Token:', accessToken);
        console.log('User Role:', JSON.parse(localStorage.getItem('userData') || '{}').role);

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
            // Add missing fields with defaults
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
  }, [nrcJobNo]);


  // --- API Handlers for each step ---

  const handleArtworkSave = async (updatedFields: Partial<Job>) => {
    setError(null);
    if (!job) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

              console.log('Request URL:', `http://nrc-backend-alb-174636098.ap-south-1.elb.amazonaws.com/api/jobs/${job.nrcJobNo}`);
      console.log('Request Method:', 'PUT');
      console.log('Request Body:', updatedFields);
      console.log('Job Status:', job.status);
      console.log('Job Data:', job);

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
        setCurrentStep('po');
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
        const updatedJob = { ...job,
                       poNumber: poDetails.poNumber, unit: poDetails.unit, plant: poDetails.plant,
                       totalPOQuantity: poDetails.totalPOQuantity, dispatchQuantity: poDetails.dispatchQuantity,
                       pendingQuantity: poDetails.pendingQuantity, noOfSheets: poDetails.noOfSheets,
                       poDate: poDetails.poDate, deliveryDate: poDetails.deliveryDate,
                       dispatchDate: poDetails.dispatchDate, nrcDeliveryDate: poDetails.nrcDeliveryDate,
                       updatedAt: new Date().toISOString()
                     };
        setJob(updatedJob);
        onJobUpdated(updatedJob);
        setCurrentStep('moreInfo');
      } else {
        throw new Error(result.message || 'Failed to save P.O. details.');
      }
    } catch (err) {
      setError(`P.O. Save Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const handleMoreInfoSave = async (updatedJobFields: Partial<Job>, jobPlanningPayload: any) => {
    setError(null);
    if (!job) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      // 1. Update main Job object (jobDemand, machineId)
              const jobUpdateResponse = await fetch(`http://nrc-backend-alb-174636098.ap-south-1.elb.amazonaws.com/api/jobs/${job.nrcJobNo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedJobFields),
      });

      if (!jobUpdateResponse.ok) {
        const errorData = await jobUpdateResponse.json();
        throw new Error(errorData.message || 'Failed to update job demand/machine.');
      }
      const jobUpdateResult = await jobUpdateResponse.json();
      if (!jobUpdateResult.success) {
         throw new Error(jobUpdateResult.message || 'Failed to update job demand/machine.');
      }

      // 2. Send job planning steps
      const jobPlanningResponse = await fetch('http://nrc-backend-alb-174636098.ap-south-1.elb.amazonaws.com/api/job-planning/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(jobPlanningPayload),
      });

      if (!jobPlanningResponse.ok) {
        const errorData = await jobPlanningResponse.json();
        throw new Error(errorData.message || 'Failed to save job planning steps.');
      }
      const jobPlanningResult = await jobPlanningResponse.json();
      if (jobPlanningResult.success) {
        const updatedJob = { ...job, ...updatedJobFields, jobSteps: jobPlanningPayload.steps, updatedAt: jobPlanningResult.data.updatedAt };
        setJob(updatedJob);
        onJobUpdated(updatedJob);
        navigate('/dashboard'); // Navigate back to jobs list after final submission
      } else {
        throw new Error(jobPlanningResult.message || 'Failed to save job planning steps.');
      }
    } catch (err) {
      setError(`More Info Save Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  // Helper to determine if a step is completed
  const getStepCompletion = (stepId: FormStep): boolean => {
    if (!job) return false;
    switch (stepId) {
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

  // Render the current form component with read-only logic
  const renderCurrentForm = () => {
    if (!job) return null;

    const commonProps = {
      job: job,
      onClose: () => navigate('/dashboard'), // Navigate back on close
    };

    switch (currentStep) {
      case 'artwork':
        return (
          <ArtworkDetailsForm
            {...commonProps}
            onSave={handleArtworkSave}
            onNext={() => setCurrentStep('po')}
            isReadOnly={getStepCompletion('artwork')} // Artwork is read-only if completed
          />
        );
      case 'po':
        return (
          <PODetailsForm
            {...commonProps}
            onSave={handlePOSave}
            onNext={() => setCurrentStep('moreInfo')}
            isReadOnly={getStepCompletion('po')} // PO is read-only if completed
          />
        );
      case 'moreInfo':
        return (
          <MoreInformationForm
            {...commonProps}
            onSave={handleMoreInfoSave}
            isReadOnly={getStepCompletion('moreInfo')} // More Info is read-only if completed
          />
        );
      default:
        return null;
    }
  };

  // --- Mobile Sidebar Drag Logic ---
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (window.innerWidth >= 640) return; // Only for mobile (sm breakpoint)
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (window.innerWidth >= 640 || !isDragging.current) return;

    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX.current;

    // If dragging from left edge to open sidebar (within first 50px of screen)
    if (startX.current < 50 && diffX > 0) {
      setIsSidebarOpen(true);
    }
    // If dragging sidebar itself to close it
    if (sidebarRef.current && isSidebarOpen && diffX < 0) {
      const sidebarWidth = sidebarRef.current.offsetWidth;
      // Calculate how much of the sidebar is visible
      const currentTranslate = Math.max(-sidebarWidth, diffX - sidebarWidth);
      sidebarRef.current.style.transform = `translateX(${currentTranslate}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (window.innerWidth >= 640 || !isDragging.current) return;
    isDragging.current = false;

    if (sidebarRef.current) {
      const sidebarWidth = sidebarRef.current.offsetWidth;
      const currentTransform = new WebKitCSSMatrix(window.getComputedStyle(sidebarRef.current).transform).m41;

      // If sidebar is mostly closed, snap it shut
      if (currentTransform < -sidebarWidth / 2) {
        setIsSidebarOpen(false);
      } else if (currentTransform > -sidebarWidth / 2 && currentTransform < 0) {
        // If sidebar is partially open, snap it fully open
        setIsSidebarOpen(true);
        sidebarRef.current.style.transform = `translateX(0px)`;
      }
      // Reset transform for a clean state if not explicitly handled
      sidebarRef.current.style.transform = '';
    }
  };

  // Handle clicks outside sidebar to close it on mobile
  const handleOverlayClick = () => {
    if (window.innerWidth < 640) { // Only on mobile
      setIsSidebarOpen(false);
    }
  };


  if (loadingJob) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (jobError) {
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

  if (!job) {
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
    <div className="flex min-h-screen bg-[#f7f7f7] relative"> {/* Added relative for mobile sidebar positioning */}
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && window.innerWidth < 640 && (
        <div
          className="fixed inset-0 bg-transparent  z-40"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-md p-6 flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:relative sm:translate-x-0 sm:w-64 sm:shadow-none`} // Responsive classes
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Planning Details</h3>
        <ul className="space-y-2">
          {formStepsConfig.map((step, index) => {
            const isCompleted = getStepCompletion(step.id as FormStep);
            // A step is accessible if it's the first step, or if the previous step is completed
            const isAccessible = index === 0 || getStepCompletion(formStepsConfig[index - 1].id as FormStep);
            const isActive = step.id === currentStep;

            return (
              <li key={step.id}>
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200
                    ${isActive ? 'bg-[#00AEEF] text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}
                    ${!isAccessible && !isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  onClick={() => {
                    if (isAccessible) { // Only allow clicking if the step is accessible
                      setCurrentStep(step.id as FormStep);
                      if (window.innerWidth < 640) { // Close sidebar on mobile after selection
                        setIsSidebarOpen(false);
                      }
                    }
                  }}
                  disabled={!isAccessible} // Disable if previous step not completed
                >
                  {step.label}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
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

        {renderCurrentForm()}

        {/* General error display for the entire wizard, if any step fails */}
        {error && (
          <div className="fixed top-20 right-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm z-50 shadow-lg">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default JobInitiationForm;
