import React, { useEffect, useState } from 'react';

interface PrintingDetails {
  colors?: string;
  inksUsed?: string;
  finishingQuality?: string;
  wastage?: string;
  coating?: string;
  glossMatt?: string;
  separateSheets?: string;
  extraSheets?: string;
  date?: string;
  shift?: string;
  oprName?: string;
  printedBy?: string;
  remarks?: string;
}

const initialState: PrintingDetails = {
  colors: '',
  inksUsed: '',
  finishingQuality: '',
  wastage: '',
  coating: '',
  glossMatt: '',
  separateSheets: '',
  extraSheets: '',
  date: '',
  shift: '',
  oprName: '',
  printedBy: '',
  remarks: '',
};

const PrintingDetailsForm: React.FC = () => {
  const [form, setForm] = useState<PrintingDetails>(initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your real endpoint
    fetch('/api/printing/details')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setForm(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here
    alert('Form submitted!');
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4 sm:p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold text-center mb-6">Printing Details</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* No. of Colors */}
        <div>
          <label className="block font-medium mb-1">No. of Colors</label>
          <select
            name="colors"
            value={form.colors}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select</option>
            {[1,2,3,4,5,6,7,8].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        {/* Inks Used */}
        <div>
          <label className="block font-medium mb-1">Inks Used</label>
          <input
            type="text"
            name="inksUsed"
            value={form.inksUsed}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        {/* Post Printing Finishing Ok Quality */}
        <div>
          <label className="block font-medium mb-1">Post Printing Finishing Ok Quality</label>
          <input
            type="text"
            name="finishingQuality"
            value={form.finishingQuality}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        {/* Wastage */}
        <div>
          <label className="block font-medium mb-1">Wastage</label>
          <input
            type="text"
            name="wastage"
            value={form.wastage}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        {/* Coating */}
        <div>
          <label className="block font-medium mb-1">Coating</label>
          <input
            type="text"
            name="coating"
            value={form.coating}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        {/* Gloss/Matt */}
        <div>
          <label className="block font-medium mb-1">Gloss/ Matt</label>
          <input
            type="text"
            name="glossMatt"
            value={form.glossMatt}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        {/* Separate Sheets */}
        <div>
          <label className="block font-medium mb-1">Separate Sheets</label>
          <input
            type="text"
            name="separateSheets"
            value={form.separateSheets}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        {/* Extra Sheets */}
        <div>
          <label className="block font-medium mb-1">Extra Sheets</label>
          <input
            type="text"
            name="extraSheets"
            value={form.extraSheets}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        {/* Date */}
        <div>
          <label className="block font-medium mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        {/* Shift */}
        <div>
          <label className="block font-medium mb-1">Shift</label>
          <input
            type="text"
            name="shift"
            value={form.shift}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        {/* OPR Name */}
        <div>
          <label className="block font-medium mb-1">OPR Name</label>
          <input
            type="text"
            name="oprName"
            value={form.oprName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        {/* Printed By */}
        <div>
          <label className="block font-medium mb-1">Printed By</label>
          <input
            type="text"
            name="printedBy"
            value={form.printedBy}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        {/* Remarks */}
        <div>
          <label className="block font-medium mb-1">Remarks</label>
          <input
            type="text"
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#00AEEF] hover:bg-[#0095cc] text-white font-medium py-3 px-4 rounded-lg transition duration-300 mt-2"
        >
          Start
        </button>
      </form>
    </div>
  );
};

export default PrintingDetailsForm;


