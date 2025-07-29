// src/Components/Roles/Planner/ArtworkDetailsForm.tsx
import React, { useState } from 'react'; // Removed useEffect
import {type Job } from '../Types/job.ts'; // Adjust path as needed

interface ArtworkDetailsFormProps {
  job: Job;
  onSave: (updatedJob: Partial<Job>) => Promise<void>;
  onClose: () => void;
  onNext: () => void; // Callback to proceed to the next form
}

const ArtworkDetailsForm: React.FC<ArtworkDetailsFormProps> = ({ job, onSave, onClose, onNext }) => {
  const [artworkReceivedDate, setArtworkReceivedDate] = useState<string>(job.artworkReceivedDate ? job.artworkReceivedDate.split('T')[0] : '');
  const [artworkApprovedDate, setArtworkApprovedDate] = useState<string>(job.artworkApprovedDate ? job.artworkApprovedDate.split('T')[0] : '');
  const [shadeCardApprovalDate, setShadeCardApprovalDate] = useState<string>(job.shadeCardApprovalDate ? job.shadeCardApprovalDate.split('T')[0] : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!artworkReceivedDate || !artworkApprovedDate || !shadeCardApprovalDate) {
      setError('All artwork date fields are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSave({ artworkReceivedDate, artworkApprovedDate, shadeCardApprovalDate });
      onNext(); // Move to the next form
    } catch (err) {
      setError(`Failed to save artwork details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-30 backdrop-blur-sm min-h-screen">
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="w-full px-8 pt-10 pb-8 flex flex-col items-center overflow-y-auto max-h-[85vh]">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Artwork Details</h2>
          <p className="text-gray-500 text-center mb-6">Please fill in the artwork related dates for Job: {job.nrcJobNo}</p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4">{error}</div>}

            <div>
              <label htmlFor="artworkReceivedDate" className="block text-sm font-medium text-gray-700 mb-1">Artwork Received Date</label>
              <input
                type="date"
                id="artworkReceivedDate"
                value={artworkReceivedDate}
                onChange={(e) => setArtworkReceivedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
              />
            </div>
            <div>
              <label htmlFor="artworkApprovedDate" className="block text-sm font-medium text-gray-700 mb-1">Artwork Approval Date</label>
              <input
                type="date"
                id="artworkApprovedDate"
                value={artworkApprovedDate}
                onChange={(e) => setArtworkApprovedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
              />
            </div>
            <div>
              <label htmlFor="shadeCardApprovalDate" className="block text-sm font-medium text-gray-700 mb-1">Shade Card Approval Date</label>
              <input
                type="date"
                id="shadeCardApprovalDate"
                value={shadeCardApprovalDate}
                onChange={(e) => setShadeCardApprovalDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition hover:cursor-pointer shadow-md flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              )}
              {isSubmitting ? 'Saving...' : 'Save & Next'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetailsForm;
