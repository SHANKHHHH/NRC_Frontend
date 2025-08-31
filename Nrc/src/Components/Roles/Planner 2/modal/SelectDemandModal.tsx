// src/Components/Roles/Planner/SelectDemandModal.tsx
import React, { useState } from 'react';
import { type Job } from '../Types/job.ts'; // Adjust path as needed

interface SelectDemandModalProps {
  currentDemand: Job['jobDemand'];
  onSelect: (demand: Job['jobDemand']) => void;
  onClose: () => void;
}

const demandOptions: { value: Job['jobDemand']; label: string; description: string }[] = [
  { value: 'high', label: 'High', description: 'Urgent Production, priority Scheduling' },
  { value: 'medium', label: 'Medium', description: 'Standard production timeline' },
  { value: 'low', label: 'Low', description: 'Flexible timeline, can be scheduled as available.' },
];

const SelectDemandModal: React.FC<SelectDemandModalProps> = ({ currentDemand, onSelect, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<Job['jobDemand']>(currentDemand);

  const handleSave = () => {
    onSelect(selectedOption);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-30 backdrop-blur-sm min-h-screen">
      <div className="relative w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="w-full px-8 pt-10 pb-8 flex flex-col items-center overflow-y-auto max-h-[85vh]">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Select Demand</h2>
          <p className="text-gray-500 text-center mb-6">What is the demand level of this job?</p>

          <div className="w-full space-y-4">
            {demandOptions.map(option => (
              <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="demand"
                  value={option.value || ''} // CORRECTED: Ensure value is always a string
                  checked={selectedOption === option.value}
                  onChange={() => setSelectedOption(option.value)}
                  className="form-radio h-5 w-5 text-[#00AEEF] border-gray-300 focus:ring-[#00AEEF]"
                />
                <div className="ml-3">
                  <span className="block text-base font-medium text-gray-800">{option.label}</span>
                  <span className="block text-sm text-gray-500">{option.description}</span>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition hover:cursor-pointer shadow-md mt-6"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectDemandModal;
