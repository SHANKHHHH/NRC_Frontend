// src/Components/Roles/Planner/planner_jobs.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import POdetailCard from './jobCard/POdetailCard';
import PODetailModal from './jobCard/PODetailModal';

interface PurchaseOrder {
  id: number;
  boardSize: string | null;
  customer: string;
  deliveryDate: string;
  dieCode: number | null;
  dispatchDate: string | null;
  dispatchQuantity: number | null;
  fluteType: string | null;
  jockeyMonth: string | null;
  noOfUps: number | null;
  nrcDeliveryDate: string | null;
  noOfSheets: number | null;
  poDate: string;
  poNumber: string;
  pendingQuantity: number | null;
  pendingValidity: number | null;
  plant: string | null;
  shadeCardApprovalDate: string | null;
  sharedCardDiffDate: number | null;
  srNo: number | null;
  style: string | null;
  totalPOQuantity: number | null;
  unit: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  jobNrcJobNo: string | null;
  userId: string | null;
  job: {
    nrcJobNo: string;
    customerName: string;
    styleItemSKU: string;
  } | null;
  user: any | null;
}

interface Job {
  id: number;
  nrcJobNo: string;
  styleItemSKU: string;
  customerName: string;
  fluteType: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  latestRate: number | null;
  preRate: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  boxDimensions: string;
  diePunchCode: number | null;
  boardCategory: string | null;
  noOfColor: string | null;
  processColors: string | null;
  specialColor1: string | null;
  specialColor2: string | null;
  specialColor3: string | null;
  specialColor4: string | null;
  overPrintFinishing: string | null;
  topFaceGSM: string | null;
  flutingGSM: string | null;
  bottomLinerGSM: string | null;
  decalBoardX: string | null;
  lengthBoardY: string | null;
  boardSize: string;
  noUps: string | null;
  artworkReceivedDate: string | null;
  artworkApprovedDate: string | null;
  shadeCardApprovalDate: string | null;
  srNo: number | null;
  jobDemand: 'high' | 'medium' | 'low' | null;
  imageURL: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  machineId: string | null;
  poNumber: string | null;
  unit: string | null;
  plant: string | null;
  totalPOQuantity: number | null;
  dispatchQuantity: number | null;
  pendingQuantity: number | null;
  noOfSheets: number | null;
  poDate: string | null;
  deliveryDate: string | null;
  dispatchDate: string | null;
  nrcDeliveryDate: string | null;
  jobSteps: any[] | null;
}

const PlannerJobs: React.FC = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // State for PO data
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filteredPOs, setFilteredPOs] = useState<PurchaseOrder[]>([]);
  
  // State for job search
  const [searchedJob, setSearchedJob] = useState<Job | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Helper function to check job completion status
  const checkJobCompletionStatus = (job: Job): 'artwork_pending' | 'po_pending' | 'more_info_pending' | 'completed' => {
    // 1. Check Artwork Details
    if (!job.artworkReceivedDate || !job.artworkApprovedDate || !job.shadeCardApprovalDate) {
      return 'artwork_pending';
    }

    // 2. Check P.O. Details
    if (!job.poNumber || !job.unit || !job.plant ||
        job.totalPOQuantity === null || job.dispatchQuantity === null ||
        job.pendingQuantity === null || job.noOfSheets === null ||
        !job.poDate || !job.deliveryDate || !job.dispatchDate || !job.nrcDeliveryDate) {
      return 'po_pending';
    }

    // 3. Check More Information
    if (!job.jobDemand || !job.machineId || !job.jobSteps || job.jobSteps.length === 0) {
      return 'more_info_pending';
    }

    return 'completed'; // All forms are filled
  };

  // Function to fetch all purchase orders
  const fetchPurchaseOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://nrc-backend-alb-174636098.ap-south-1.elb.amazonaws.com/api/purchase-orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch purchase orders: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setPurchaseOrders(data.data);
        setFilteredPOs(data.data);
      } else {
        setError('Unexpected API response format or data is not an array.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      console.error('Fetch Purchase Orders Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to search jobs by NRC Job Number
  const searchJob = async () => {
    if (!searchTerm.trim()) {
      setSearchedJob(null);
      setFilteredPOs(purchaseOrders);
      return;
    }

    setSearchLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch('http://nrc-backend-alb-174636098.ap-south-1.elb.amazonaws.com/api/jobs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to search jobs: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const foundJob = data.data.find((job: Job) => 
          job.nrcJobNo.toLowerCase().includes(searchTerm.toLowerCase()) && job.status === 'ACTIVE'
        );
        
        if (foundJob) {
          setSearchedJob(foundJob);
          // Filter POs to show only those related to this job
          const relatedPOs = purchaseOrders.filter(po => 
            po.jobNrcJobNo === foundJob.nrcJobNo
          );
          setFilteredPOs(relatedPOs);
        } else {
          setSearchedJob(null);
          setFilteredPOs([]);
        }
      } else {
        setSearchedJob(null);
        setFilteredPOs([]);
      }
    } catch (err) {
      console.error('Search Job Error:', err);
      setSearchedJob(null);
      setFilteredPOs([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle PO card click
  const handlePOClick = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsModalOpen(true);
  };

  // Handle Add PO button click
  const handleAddPO = () => {
    navigate('/dashboard/planner/initiate-job/new');
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) {
      setSearchedJob(null);
      setFilteredPOs(purchaseOrders);
    }
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchJob();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPurchaseOrders();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header with Add PO Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Purchase Orders</h1>
        <button
          onClick={handleAddPO}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span>Add Purchase Order</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="max-w-md w-full">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by NRC Job Number..."
              className="w-full pl-10 pr-20 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Searched Job Details */}
      {searchedJob && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3">Job Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">NRC Job No</p>
              <p className="text-xs sm:text-sm text-blue-800 truncate">{searchedJob.nrcJobNo}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">Customer</p>
              <p className="text-xs sm:text-sm text-blue-800 truncate">{searchedJob.customerName}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">Style</p>
              <p className="text-xs sm:text-sm text-blue-800 truncate">{searchedJob.styleItemSKU}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">Status</p>
              <p className="text-xs sm:text-sm text-blue-800">{searchedJob.status}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs sm:text-sm text-blue-600 font-medium">Completion Status</p>
            <p className="text-xs sm:text-sm text-blue-800">{checkJobCompletionStatus(searchedJob).replace('_', ' ').toUpperCase()}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="ml-4 text-base sm:text-lg text-gray-600">Loading purchase orders...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative mb-6 text-sm sm:text-base" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {message && (
        <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded relative mb-6 text-sm sm:text-base ${message.includes('Error') ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'}`} role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredPOs.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-base sm:text-lg">
                {searchedJob ? 'No purchase orders found for this job.' : 'No purchase orders found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {filteredPOs.map(po => {
                // Determine completion status based on the job if available
                let completionStatus: 'artwork_pending' | 'po_pending' | 'more_info_pending' | 'completed' = 'po_pending';
                
                if (po.job) {
                  // Create a mock job object to check completion status
                  const mockJob: Job = {
                    ...po.job,
                    id: 0,
                    styleItemSKU: po.job.styleItemSKU,
                    customerName: po.job.customerName,
                    fluteType: null,
                    status: 'ACTIVE',
                    latestRate: null,
                    preRate: null,
                    length: null,
                    width: null,
                    height: null,
                    boxDimensions: '',
                    diePunchCode: null,
                    boardCategory: null,
                    noOfColor: null,
                    processColors: null,
                    specialColor1: null,
                    specialColor2: null,
                    specialColor3: null,
                    specialColor4: null,
                    overPrintFinishing: null,
                    topFaceGSM: null,
                    flutingGSM: null,
                    bottomLinerGSM: null,
                    decalBoardX: null,
                    lengthBoardY: null,
                    boardSize: '',
                    noUps: null,
                    artworkReceivedDate: po.shadeCardApprovalDate,
                    artworkApprovedDate: po.shadeCardApprovalDate,
                    shadeCardApprovalDate: po.shadeCardApprovalDate,
                    srNo: po.srNo,
                    jobDemand: null,
                    imageURL: null,
                    createdAt: po.createdAt,
                    updatedAt: po.updatedAt,
                    userId: po.userId,
                    machineId: null,
                    poNumber: po.poNumber,
                    unit: po.unit,
                    plant: po.plant,
                    totalPOQuantity: po.totalPOQuantity,
                    dispatchQuantity: po.dispatchQuantity,
                    pendingQuantity: po.pendingQuantity,
                    noOfSheets: po.noOfSheets,
                    poDate: po.poDate,
                    deliveryDate: po.deliveryDate,
                    dispatchDate: po.dispatchDate,
                    nrcDeliveryDate: po.nrcDeliveryDate,
                    jobSteps: []
                  };
                  completionStatus = checkJobCompletionStatus(mockJob);
                }

                return (
                  <POdetailCard
                    key={po.id}
                    po={po}
                    onClick={handlePOClick}
                    jobCompletionStatus={completionStatus}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {/* PO Detail Modal */}
      {selectedPO && (
        <PODetailModal
          po={selectedPO}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPO(null);
          }}
        />
      )}
    </div>
  );
};

export default PlannerJobs;
