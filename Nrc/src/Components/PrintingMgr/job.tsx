import React from 'react';

interface JobCardProps {
  company: string;
  jobId: string;
  boardSize: string;
  gsm: string;
  artwork: string;
  approvalDate: string;
  dispatchDate: string;
  onStart?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  company,
  jobId,
  boardSize,
  gsm,
  artwork,
  approvalDate,
  dispatchDate,
  onStart,
}) => (
  <div className="max-w-xs w-full rounded-xl border border-blue-200 p-5 bg-white shadow-sm flex flex-col items-center text-gray-900">
    <div className="w-full flex justify-between items-center mb-2">
      <span className="font-bold text-lg">{company}</span>
      <span className="text-gray-500 text-base">{jobId}</span>
    </div>
    <div className="w-full text-base mt-2 mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-gray-700">Board Size</span>
        <span className="font-medium">{boardSize}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-700">GSM</span>
        <span className="font-medium">{gsm}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-700">Artwork</span>
        <span className="font-medium">{artwork}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-700">Approval date</span>
        <span className="font-medium">{approvalDate}</span>
      </div>
      <div className="flex justify-between mb-4">
        <span className="text-gray-700">Dispatch date</span>
        <span className="font-medium">{dispatchDate}</span>
      </div>
    </div>
    <button
      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition mt-2"
      onClick={onStart}
    >
      Start
    </button>
  </div>
);

export default JobCard;
