// src/Components/Roles/Planner/MoreInformationForm.tsx
import React, { useState, useEffect } from 'react';
import {type Job,type JobStep,type Machine } from '../Types/job.ts';
import SelectDemandModal from '../modal/SelectDemandModal.tsx';
import AddStepsModal from '../modal/AddStepsModal.tsx';
import MachineAssignedModal from '../modal/MachineAssignedModal.tsx';

interface MoreInformationFormProps {
  job: Job;
  onSave: (updatedJob: Partial<Job>, jobPlanningPayload: any) => Promise<void>;
  onClose: () => void;
  isReadOnly: boolean;
}

const MoreInformationForm: React.FC<MoreInformationFormProps> = ({ job, onSave, onClose, isReadOnly }) => {
  const [jobDemand, setJobDemand] = useState<Job['jobDemand']>(job.jobDemand || null);
  const [selectedSteps, setSelectedSteps] = useState<JobStep[]>(job.jobSteps || []);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDemandModal, setShowDemandModal] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [showMachineModal, setShowMachineModal] = useState(false);

  useEffect(() => {
    if (job.machineId) {
      // Attempt to find the full machine object if job.machineId is already set
      // In a real app, you might fetch this from a list of all machines
      // For now, we'll create a placeholder if the full object isn't available
      setSelectedMachine(prev => prev || { // Only set if not already set by user interaction
        id: job.machineId || '', // FIXED: Provide empty string if job.machineId is null
        machineType: '',
        description: job.machineId || '', // FIXED: Provide empty string if job.machineId is null
        unit: '',
        machineCode: '',
        type: '',
        capacity: 0,
        remarks: null,
        status: '',
        isActive: true,
        createdAt: '',
        updatedAt: '',
        jobs: []
      });
    }
  }, [job.machineId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    setError(null);
    setIsSubmitting(true);

    if (!jobDemand || !selectedSteps || selectedSteps.length === 0 || !selectedMachine) {
      setError('All More Information fields (Demand, Steps, Machine) are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedJobFields: Partial<Job> = {
        jobDemand: jobDemand,
        machineId: selectedMachine.id,
      };

      const jobPlanningPayload = {
        nrcJobNo: job.nrcJobNo,
        jobDemand: jobDemand,
        steps: selectedSteps.map(step => ({
          stepNo: step.stepNo,
          stepName: step.stepName,
          // Use selectedMachine's description or machineCode for machineDetail
          machineDetail: selectedMachine.description || selectedMachine.machineCode,
        })),
      };

      await onSave(updatedJobFields, jobPlanningPayload);
    } catch (err) {
      setError(`Failed to save More Information: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center">
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>
      <div className="w-full px-8 pt-10 pb-8 flex flex-col items-center overflow-y-auto max-h-[85vh]">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">More Information</h2>
        <p className="text-gray-500 text-center mb-6">Provide additional details for Job: {job.nrcJobNo}</p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4">{error}</div>}

          {/* Select Demand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Demand</label>
            <div
              className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white flex justify-between items-center ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !isReadOnly && setShowDemandModal(true)}
            >
              <span>{jobDemand || 'Choose Demand Level'}</span>
              <span>&#9660;</span>
            </div>
          </div>

          {/* Add Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Steps</label>
            <div
              className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white flex justify-between items-center ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !isReadOnly && setShowStepsModal(true)}
            >
              <span>{selectedSteps.length > 0 ? `${selectedSteps.length} step(s) selected` : 'Choose the steps of the job'}</span>
              <span>&#9660;</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSteps.map(step => (
                <span key={step.stepName} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {step.stepName}
                </span>
              ))}
            </div>
          </div>

          {/* Machine Assigned */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Machine Assigned</label>
            <div
              className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white flex justify-between items-center ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !isReadOnly && setShowMachineModal(true)}
            >
              <span>{selectedMachine ? selectedMachine.description || selectedMachine.machineCode : 'Select Machine'}</span>
              <span>&#9660;</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition hover:cursor-pointer shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || isReadOnly}
          >
            {isSubmitting && (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            )}
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>

      {/* Sub-modals */}
      {showDemandModal && (
        <SelectDemandModal
          currentDemand={jobDemand}
          onSelect={(demand) => { setJobDemand(demand); setShowDemandModal(false); }}
          onClose={() => setShowDemandModal(false)}
        />
      )}
      {showStepsModal && (
        <AddStepsModal
          currentSteps={selectedSteps}
          onSelect={(steps) => { setSelectedSteps(steps); setShowStepsModal(false); }}
          onClose={() => setShowStepsModal(false)}
        />
      )}
      {showMachineModal && (
        <MachineAssignedModal
          currentMachine={selectedMachine}
          onSelect={(machine) => { setSelectedMachine(machine); setShowMachineModal(false); }}
          onClose={() => setShowMachineModal(false)}
        />
      )}
    </div>
  );
};

export default MoreInformationForm;
