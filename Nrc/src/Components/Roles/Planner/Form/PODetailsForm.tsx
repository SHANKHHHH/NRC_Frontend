// src/Components/Roles/Planner/PODetailsForm.tsx
import React, { useState } from 'react';
import {type Job, type PoDetailsPayload } from '../Types/job.ts';

interface PODetailsFormProps {
  job: Job;
  onSave: (poDetails: PoDetailsPayload) => Promise<void>;
  onClose: () => void;
  onNext: () => void;
  isReadOnly: boolean;
}

const PODetailsForm: React.FC<PODetailsFormProps> = ({ job, onSave, onClose, onNext, isReadOnly }) => {
  const toDateInput = (isoDateString: string | null | undefined) => {
    if (!isoDateString) return '';
    try {
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const toISOString = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString + 'T00:00:00.000Z').toISOString();
    } catch {
      return null;
    }
  };


  const [poData, setPoData] = useState<Omit<PoDetailsPayload, 'nrcJobNo'>>({
    boardSize: job.boxDimensions || '',
    customer: job.customerName || '',
    deliveryDate: toDateInput(job.deliveryDate),
    dieCode: job.diePunchCode || 0,
    dispatchDate: toDateInput(job.dispatchDate),
    dispatchQuantity: job.dispatchQuantity || 0,
    fluteType: job.fluteType || '',
    jockeyMonth: '',
    noOfUps: Number(job.noUps) || 0,
    nrcDeliveryDate: toDateInput(job.nrcDeliveryDate),
    noOfSheets: job.noOfSheets || 0,
    poDate: toDateInput(job.poDate),
    poNumber: job.poNumber || '',
    pendingQuantity: job.pendingQuantity || 0,
    pendingValidity: 0,
    plant: job.plant || '',
    shadeCardApprovalDate: toDateInput(job.shadeCardApprovalDate),
    srNo: job.srNo || 0,
    style: job.styleItemSKU || '',
    totalPOQuantity: job.totalPOQuantity || 0,
    unit: job.unit || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isReadOnly) {
      console.log('[PODetailsForm] Read-only mode - change prevented for field:', e.target.name);
      return;
    }
    const { name, value, type } = e.target;
    setPoData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
    console.log('[PODetailsForm] Field changed:', name, 'New value:', value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.group('[PODetailsForm] Form submission started');
    
    if (isReadOnly) {
      console.log('[PODetailsForm] Read-only mode - submission prevented');
      console.groupEnd();
      return;
    }

    console.log('[PODetailsForm] Current form data:', poData);
    setError(null);
    setIsSubmitting(true);

    // CORRECTED LINE: Only validate fields that are actually visible on the form
    const requiredFields: Array<keyof typeof poData> = [
      // Corrected list to only include visible form fields
      'poDate', 'deliveryDate', 'dispatchDate', 'nrcDeliveryDate',
      'totalPOQuantity', 'unit', 'noOfSheets'
    ];
    
    console.log('[PODetailsForm] Validating required fields:', requiredFields);
    
    const missingFields = requiredFields.filter(field => {
      const value = poData[field];
      return value === null || value === '' || (typeof value === 'number' && isNaN(value));
    });

    if (missingFields.length > 0) {
      const errorMsg = `Please fill all required P.O. fields: ${missingFields.map(f => f.replace(/([A-Z])/g, ' $1').trim()).join(', ')}.`;
      console.error('[PODetailsForm] Validation failed - missing fields:', missingFields);
      setError(errorMsg);
      setIsSubmitting(false);
      console.groupEnd();
      return;
    }

    try {
      console.log('[PODetailsForm] Preparing payload...');
      const payload: PoDetailsPayload = {
        nrcJobNo: job.nrcJobNo,
        boardSize: poData.boardSize,
        customer: poData.customer,
        deliveryDate: toISOString(poData.deliveryDate) as string,
        dieCode: Number(poData.dieCode),
        dispatchDate: toISOString(poData.dispatchDate) as string,
        dispatchQuantity: Number(poData.dispatchQuantity),
        fluteType: poData.fluteType,
        jockeyMonth: poData.jockeyMonth || 'N/A',
        noOfUps: Number(poData.noOfUps),
        nrcDeliveryDate: toISOString(poData.nrcDeliveryDate) as string,
        noOfSheets: Number(poData.noOfSheets),
        poDate: toISOString(poData.poDate) as string,
        poNumber: poData.poNumber,
        pendingQuantity: Number(poData.pendingQuantity),
        pendingValidity: Number(poData.pendingValidity) || 0,
        plant: poData.plant,
        shadeCardApprovalDate: toISOString(poData.shadeCardApprovalDate) as string,
        srNo: Number(poData.srNo),
        style: poData.style,
        totalPOQuantity: Number(poData.totalPOQuantity),
        unit: poData.unit,
      };
      
      console.log('[PODetailsForm] Final payload:', payload);
      console.log('[PODetailsForm] Calling onSave callback...');
      
      await onSave(payload);
      
      console.log('[PODetailsForm] Save successful, proceeding to next step');
      onNext();
    } catch (err) {
      const errorMsg = `Failed to save P.O. details: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error('[PODetailsForm] Submission error:', err);
      setError(errorMsg);
    } finally {
      console.log('[PODetailsForm] Submission process completed');
      setIsSubmitting(false);
      console.groupEnd();
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
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">P.O. Details</h2>
        <p className="text-gray-500 text-center mb-6">Please fill in the Purchase Order details for Job: {job.nrcJobNo}</p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4">{error}</div>}

          <div>
            <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700 mb-1">P.O. Number</label>
            <input type="text" id="poNumber" name="poNumber" value={poData.poNumber} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input type="text" id="unit" name="unit" value={poData.unit} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="plant" className="block text-sm font-medium text-gray-700 mb-1">Plant</label>
            <input type="text" id="plant" name="plant" value={poData.plant} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="totalPOQuantity" className="block text-sm font-medium text-gray-700 mb-1">Total P.O. Quantity</label>
            <input type="number" id="totalPOQuantity" name="totalPOQuantity" value={poData.totalPOQuantity} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="dispatchQuantity" className="block text-sm font-medium text-gray-700 mb-1">Dispatch Quantity</label>
            <input type="number" id="dispatchQuantity" name="dispatchQuantity" value={poData.dispatchQuantity} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="pendingQuantity" className="block text-sm font-medium text-gray-700 mb-1">Pending Quantity</label>
            <input type="number" id="pendingQuantity" name="pendingQuantity" value={poData.pendingQuantity} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="noOfSheets" className="block text-sm font-medium text-gray-700 mb-1">No. of Sheets</label>
            <input type="number" id="noOfSheets" name="noOfSheets" value={poData.noOfSheets} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="poDate" className="block text-sm font-medium text-gray-700 mb-1">P.O. Date</label>
            <input type="date" id="poDate" name="poDate" value={poData.poDate} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
            <input type="date" id="deliveryDate" name="deliveryDate" value={poData.deliveryDate} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="dispatchDate" className="block text-sm font-medium text-gray-700 mb-1">Dispatch Date</label>
            <input type="date" id="dispatchDate" name="dispatchDate" value={poData.dispatchDate} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="nrcDeliveryDate" className="block text-sm font-medium text-gray-700 mb-1">NRC Delivery Date</label>
            <input type="date" id="nrcDeliveryDate" name="nrcDeliveryDate" value={poData.nrcDeliveryDate} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
              disabled={isReadOnly}
            />
          </div>

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
            className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition hover:cursor-pointer shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || isReadOnly}
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
  );
};

export default PODetailsForm;
