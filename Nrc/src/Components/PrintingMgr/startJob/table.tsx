import React from 'react';

interface Section {
  title: string;
  rows: string[];
}

const sections: Section[] = [
  {
    title: 'Planning Details',
    rows: ['New Job Started', 'Paper Store Details', 'Printing Details'],
  },
  {
    title: 'Production Details',
    rows: ['Corrugation (Show only if any)', 'Flute Lamination (if any)', 'Flap Pasting'],
  },
  {
    title: 'QC Details',
    rows: ['ABC'],
  },
  {
    title: 'Dispatch Details',
    rows: ['ABC'],
  },
];

const JobDetailsTable: React.FC = () => (
  <div className="w-full max-w-lg mx-auto mt-4">
    {sections.map((section, idx) => (
      <div key={section.title} className="mb-6">
        <div className="bg-blue-100 rounded-lg px-4 py-2 font-semibold mb-2">{section.title}</div>
        <div className="flex flex-col gap-1">
          {section.rows.map((row, i) => (
            <div
              key={row}
              className="px-4 py-2 rounded transition-colors duration-200 cursor-pointer hover:bg-[#F2F2F5]"
              style={{ background: i === 2 && idx === 0 ? '#F2F2F5' : undefined }} // Example for "Printing Details"
            >
              {row}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default JobDetailsTable;
