import React from 'react';
import JobDetailsTable from './startJob/table';
import PrintingDetailsForm from './startJob/form';

const StartJob: React.FC = () => (
  <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-center py-6 px-2">
    <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
      {/* Left: Job Details Table */}
      <div className="md:w-1/3 w-full">
        <JobDetailsTable />
      </div>
      {/* Right: Printing Details Form */}
      <div className="md:w-2/3 w-full">
        <PrintingDetailsForm />
      </div>
    </div>
  </div>
);

export default StartJob;
