// src/Components/Roles/Planner/PODetailsForm.tsx
import React, { useState } from 'react';
import {type Job, type PoDetailsPayload } from '../Types/job.ts'; // Added 'type' keyword for PoDetailsPayload

interface PODetailsFormProps {
  job: Job;
  onSave: (poDetails: PoDetailsPayload) => Promise<void>; // Use PoDetailsPayload type
  onClose: () => void;
  onNext: () => void; // Callback to proceed to the next form
}

const PODetailsForm: React.FC<PODetailsFormProps> = ({ job, onSave, onClose, onNext }) => {
  // Helper to format date strings from ISO to YYYY-MM-DD for input type="date"
  const toDateInput = (isoDateString: string | null | undefined) => {
    if (!isoDateString) return '';
    try {
      return new Date(isoDateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Initialize state with existing job data or empty values, matching PoDetailsPayload structure
  const [poData, setPoData] = useState<Omit<PoDetailsPayload, 'nrcJobNo'>>({ // Omit nrcJobNo as it's added later
    boardSize: job.boxDimensions || '', // Assuming job.boxDimensions maps to boardSize
    customer: job.customerName || '',
    deliveryDate: toDateInput(job.deliveryDate),
    dieCode: job.diePunchCode || 0, // Default to 0 for numbers
    dispatchDate: toDateInput(job.dispatchDate),
    dispatchQuantity: job.dispatchQuantity || 0,
    fluteType: job.fluteType || '',
    jockeyMonth: '', // Not directly from job, default empty
    noOfUps: Number(job.noUps) || 0, // Convert job.noUps (string|null) to number
    nrcDeliveryDate: toDateInput(job.nrcDeliveryDate),
    noOfSheets: job.noOfSheets || 0,
    poDate: toDateInput(job.poDate),
    poNumber: job.poNumber || '',
    pendingQuantity: job.pendingQuantity || 0,
    pendingValidity: 0, // Not directly from job, default 0
    plant: job.plant || '',
    shadeCardApprovalDate: toDateInput(job.shadeCardApprovalDate), // From main job
    srNo: job.srNo || 0, // From main job
    style: job.styleItemSKU || '', // Assuming job.styleItemSKU maps to style
    totalPOQuantity: job.totalPOQuantity || 0,
    unit: job.unit || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setPoData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value // Handle number inputs
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Basic validation for required fields
    const requiredFields: Array<keyof typeof poData> = [
      'poNumber', 'unit', 'plant', 'totalPOQuantity', 'dispatchQuantity',
      'pendingQuantity', 'noOfSheets', 'poDate', 'deliveryDate', 'dispatchDate', 'nrcDeliveryDate',
      'boardSize', 'customer', 'dieCode', 'fluteType', 'noOfUps', 'srNo', 'style' // Added other required fields from payload
    ];
    const missingFields = requiredFields.filter(field => {
      const value = poData[field];
      return value === null || value === '' || (typeof value === 'number' && isNaN(value));
    });

    if (missingFields.length > 0) {
      setError(`Please fill all required P.O. fields: ${missingFields.map(f => f.replace(/([A-Z])/g, ' $1').trim()).join(', ')}.`);
      setIsSubmitting(false);
      return;
    }

    try {
      // Construct payload for PO endpoint, ensuring correct types for numbers and dates
      const payload: PoDetailsPayload = {
        nrcJobNo: job.nrcJobNo, // Crucial for linking PO to job
        boardSize: poData.boardSize,
        customer: poData.customer,
        deliveryDate: poData.deliveryDate,
        dieCode: Number(poData.dieCode),
        dispatchDate: poData.dispatchDate,
        dispatchQuantity: Number(poData.dispatchQuantity),
        fluteType: poData.fluteType,
        jockeyMonth: poData.jockeyMonth || 'N/A', // Default if not from form
        noOfUps: Number(poData.noOfUps),
        nrcDeliveryDate: poData.nrcDeliveryDate,
        noOfSheets: Number(poData.noOfSheets),
        poDate: poData.poDate,
        poNumber: poData.poNumber,
        pendingQuantity: Number(poData.pendingQuantity),
        pendingValidity: Number(poData.pendingValidity) || 0, // Default if not from form
        plant: poData.plant,
        shadeCardApprovalDate: poData.shadeCardApprovalDate,
        srNo: Number(poData.srNo),
        style: poData.style,
        totalPOQuantity: Number(poData.totalPOQuantity),
        unit: poData.unit,
      };
      await onSave(payload); // Call the onSave prop with the PO payload
      onNext(); // Move to the next form
    } catch (err) {
      setError(`Failed to save P.O. details: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">P.O. Details</h2>
          <p className="text-gray-500 text-center mb-6">Please fill in the Purchase Order details for Job: {job.nrcJobNo}</p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4">{error}</div>}

            {/* P.O. Number */}
            <div>
              <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700 mb-1">P.O. Number</label>
              <input type="text" id="poNumber" name="poNumber" value={poData.poNumber} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" required />
            </div>
            {/* Unit */}
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input type="text" id="unit" name="unit" value={poData.unit} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" required />
            </div>
            {/* Plant */}
            <div>
              <label htmlFor="plant" className="block text-sm font-medium text-gray-700 mb-1">Plant</label>
              <input type="text" id="plant" name="plant" value={poData.plant} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" required />
            </div>
            {/* Total P.O. Quantity */}
            <div>
              <label htmlFor="totalPOQuantity" className="block text-sm font-medium text-gray-700 mb-1">Total P.O. Quantity</label>
              <input type="number" id="totalPOQuantity" name="totalPOQuantity" value={poData.totalPOQuantity} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" required />
            </div>
            {/* Dispatch Quantity */}
            <div>
              <label htmlFor="dispatchQuantity" className="block text-sm font-medium text-gray-700 mb-1">Dispatch Quantity</label>
              <input type="number" id="dispatchQuantity" name="dispatchQuantity" value={poData.dispatchQuantity} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" required />
            </div>
            {/* Pending Quantity */}
            <div>
              <label htmlFor="pendingQuantity" className="block text-sm font-medium text-gray-700 mb-1">Pending Quantity</label>
              <input type="number" id="pendingQuantity" name="pendingQuantity" value={poData.pendingQuantity} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" required />
            </div>
            {/* No. of Sheets */}
            <div>
              <label htmlFor="noOfSheets" className="block text-sm font-medium text-gray-700 mb-1">No. of Sheets</label>
              <input type="number" id="noOfSheets" name="noOfSheets" value={poData.noOfSheets} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" required />
            </div>
            {/* P.O. Date */}
            <div>
              <label htmlFor="poDate" className="block text-sm font-medium text-gray-700 mb-1">P.O. Date</label>
              <input type="date" id="poDate" name="poDate" value={poData.poDate} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" required />
            </div>
            {/* Delivery Date */}
            <div>
              <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
              <input type="date" id="deliveryDate" name="deliveryDate" value={poData.deliveryDate} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" required />
            </div>
            {/* Dispatch Date */}
            <div>
              <label htmlFor="dispatchDate" className="block text-sm font-medium text-gray-700 mb-1">Dispatch Date</label>
              <input type="date" id="dispatchDate" name="dispatchDate" value={poData.dispatchDate} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" required />
            </div>
            {/* NRC Delivery Date */}
            <div>
              <label htmlFor="nrcDeliveryDate" className="block text-sm font-medium text-gray-700 mb-1">NRC Delivery Date</label>
              <input type="date" id="nrcDeliveryDate" name="nrcDeliveryDate" value={poData.nrcDeliveryDate} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" required />
            </div>

            {/* Additional fields from PoDetailsPayload that are derived from Job or are fixed */}
            {/* These are typically not user-editable in the form, but needed for the payload */}
            <input type="hidden" name="boardSize" value={poData.boardSize} />
            <input type="hidden" name="customer" value={poData.customer} />
            <input type="hidden" name="dieCode" value={poData.dieCode} />
            <input type="hidden" name="fluteType" value={poData.fluteType} />
            <input type="hidden" name="jockeyMonth" value={poData.jockeyMonth} />
            <input type="hidden" name="noOfUps" value={poData.noOfUps} />
            <input type="hidden" name="pendingValidity" value={poData.pendingValidity} />
            <input type="hidden" name="shadeCardApprovalDate" value={poData.shadeCardApprovalDate} />
            <input type="hidden" name="srNo" value={poData.srNo} />
            <input type="hidden" name="style" value={poData.style} />


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

export default PODetailsForm;
