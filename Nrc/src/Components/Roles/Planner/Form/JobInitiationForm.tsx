// src/Components/Roles/Planner/JobInitiationForm.tsx
import React, { useState } from 'react';
import type { Job, PoDetailsPayload } from '../Types/job.ts'; // Removed JobStep
import ArtworkDetailsForm from './ArtWorkDetailsForm.tsx';
import PODetailsForm from './PODetailsForm.tsx';
import MoreInformationForm from './MoreInformationForm.tsx';

interface JobInitiationFormProps {
  job: Job;
  onClose: () => void;
  // Callback when a job is successfully updated through any step
  onJobUpdated: (updatedJob: Job) => void;
}

type FormStep = 'artwork' | 'po' | 'moreInfo';

const JobInitiationForm: React.FC<JobInitiationFormProps> = ({ job, onClose, onJobUpdated }) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('artwork');
  const [error, setError] = useState<string | null>(null);
  // Removed isSubmitting state as it's managed by child forms

  // Helper to determine the next step based on current job data
  const determineInitialStep = (currentJob: Job): FormStep => {
    // 1. Check Artwork Details
    if (!currentJob.artworkReceivedDate || !currentJob.artworkApprovedDate || !currentJob.shadeCardApprovalDate) {
      return 'artwork';
    }

    // 2. Check P.O. Details
    // Using poNumber as the primary indicator for PO completion on the Job object,
    // along with other key PO fields that should be populated after PO creation.
    if (!currentJob.poNumber || !currentJob.unit || !currentJob.plant ||
        currentJob.totalPOQuantity === null || currentJob.dispatchQuantity === null ||
        currentJob.pendingQuantity === null || currentJob.noOfSheets === null ||
        !currentJob.poDate || !currentJob.deliveryDate || !currentJob.dispatchDate || !currentJob.nrcDeliveryDate) {
      return 'po';
    }

    // 3. Check More Information
    // Check if jobDemand and machineId are filled, and if jobSteps array exists and is not empty
    if (!currentJob.jobDemand || !currentJob.machineId || !currentJob.jobSteps || currentJob.jobSteps.length === 0) {
      return 'moreInfo';
    }

    return 'artwork'; // Fallback, though ideally this modal only opens if something is pending
  };

  React.useEffect(() => {
    setCurrentStep(determineInitialStep(job));
  }, [job]);


  // --- API Handlers for each step ---

  const handleArtworkSave = async (updatedFields: Partial<Job>) => {
    // setIsSubmitting(true); // Removed
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      const response = await fetch(`https://nrc-backend-his4.onrender.com/api/jobs/${job.nrcJobNo}`, {
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
        // Update the job object passed to the modal
        onJobUpdated({ ...job, ...updatedFields, updatedAt: result.data.updatedAt }); // Pass updated job back to parent
        setCurrentStep('po'); // Move to next step
      } else {
        throw new Error(result.message || 'Failed to save artwork details.');
      }
    } catch (err) {
      setError(`Artwork Save Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err; // Re-throw to be caught by form component
    } finally {
      // setIsSubmitting(false); // Removed
    }
  };

  const handlePOSave = async (poDetails: PoDetailsPayload) => {
    // setIsSubmitting(true); // Removed
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      const payloadWithJobNo = { ...poDetails, nrcJobNo: job.nrcJobNo }; // Ensure nrcJobNo is in payload

      const response = await fetch('https://nrc-backend-his4.onrender.com/api/purchase-orders/create', {
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
        // Optimistically update the job object to mark PO as complete
        // These fields are assumed to be updated on the main job object by backend or are just for frontend validation
        onJobUpdated({ ...job, poNumber: poDetails.poNumber, unit: poDetails.unit, plant: poDetails.plant,
                       totalPOQuantity: poDetails.totalPOQuantity, dispatchQuantity: poDetails.dispatchQuantity,
                       pendingQuantity: poDetails.pendingQuantity, noOfSheets: poDetails.noOfSheets,
                       poDate: poDetails.poDate, deliveryDate: poDetails.deliveryDate,
                       dispatchDate: poDetails.dispatchDate, nrcDeliveryDate: poDetails.nrcDeliveryDate,
                       updatedAt: new Date().toISOString() // Optimistic update
                     });
        setCurrentStep('moreInfo'); // Move to next step
      } else {
        throw new Error(result.message || 'Failed to save P.O. details.');
      }
    } catch (err) {
      setError(`P.O. Save Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      // setIsSubmitting(false); // Removed
    }
  };

  const handleMoreInfoSave = async (updatedJobFields: Partial<Job>, jobPlanningPayload: any) => {
    // setIsSubmitting(true); // Removed
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      // 1. Update main Job object (jobDemand, machineId)
      const jobUpdateResponse = await fetch(`https://nrc-backend-his4.onrender.com/api/jobs/${job.nrcJobNo}`, {
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
      const jobPlanningResponse = await fetch('https://nrc-backend-his4.onrender.com/api/job-planning/', {
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
        // Optimistically update the job object to mark More Info as complete
        onJobUpdated({ ...job, ...updatedJobFields, jobSteps: jobPlanningPayload.steps, updatedAt: jobPlanningResult.data.updatedAt });
        onClose(); // Close the entire modal
      } else {
        throw new Error(jobPlanningResult.message || 'Failed to save job planning steps.');
      }
    } catch (err) {
      setError(`More Info Save Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      // setIsSubmitting(false); // Removed
    }
  };


  const renderCurrentForm = () => {
    switch (currentStep) {
      case 'artwork':
        return (
          <ArtworkDetailsForm
            job={job}
            onSave={handleArtworkSave}
            onClose={onClose}
            onNext={() => setCurrentStep('po')} // This will be called by ArtworkDetailsForm upon success
          />
        );
      case 'po':
        return (
          <PODetailsForm
            job={job}
            onSave={handlePOSave}
            onClose={onClose}
            onNext={() => setCurrentStep('moreInfo')} // This will be called by PODetailsForm upon success
          />
        );
      case 'moreInfo':
        return (
          <MoreInformationForm
            job={job}
            onSave={handleMoreInfoSave}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    // The main modal wrapper, providing the backdrop and centering
    // Removed 'relative' as it conflicts with 'fixed'
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-30 backdrop-blur-sm min-h-screen">
      {/* Render the current form component */}
      {renderCurrentForm()}

      {/* General error display for the entire wizard, if any step fails */}
      {error && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm z-50 shadow-lg"> {/* Removed 'relative' */}
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
    </div>
  );
};

export default JobInitiationForm;
