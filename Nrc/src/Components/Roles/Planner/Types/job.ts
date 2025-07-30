// src/Components/Roles/Planner/Types/job.ts

export interface JobStep {
  stepNo: number;
  stepName: string;
  machineDetail: string; // This is the description/name of the machine assigned to this step
}

export interface Machine {
  id: string; // Machine ID (e.g., A007)
  unit: string;
  machineCode: string;
  description: string;
  type: string;
  capacity: number;
  remarks: string | null;
  status: string; // e.g., "available"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jobs: any[]; // Assuming jobs array can contain various types, or specific job IDs
}

// Interface for the P.O. details that will be sent to /api/purchase-orders/create
export interface PoDetailsPayload {
  nrcJobNo: string; // Added for linking PO to Job on backend
  boardSize: string;
  customer: string;
  deliveryDate: string; // ISO string
  dieCode: number;
  dispatchDate: string; // ISO string
  dispatchQuantity: number;
  fluteType: string;
  jockeyMonth: string; // Defaulted to ""
  noOfUps: number;
  nrcDeliveryDate: string; // ISO string
  noOfSheets: number;
  poDate: string; // ISO string
  poNumber: string;
  pendingQuantity: number;
  pendingValidity: number; // Defaulted to 0
  plant: string;
  shadeCardApprovalDate: string; // ISO string
  srNo: number; // PO's internal SR No
  style: string;
  totalPOQuantity: number;
  unit: string;
}

export interface Job {
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
  artworkReceivedDate: string | null; // Date string (ISO or YYYY-MM-DD)
  artworkApprovedDate: string | null; // Date string (ISO or YYYY-MM-DD)
  shadeCardApprovalDate: string | null; // Date string (ISO or YYYY-MM-DD)
  srNo: number | null; // Used for PO linkage (PO Number ID)
  jobDemand: 'high' | 'medium' | 'low' | null;
  imageURL: string | null; // ADDED: For artwork image URL (or Base64 string)
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  machineId: string | null; // ID of the assigned machine

  // Fields that might be on the Job object if backend updates it after PO creation
  poNumber: string | null; // Corresponds to P.O. Number
  unit: string | null; // Corresponds to Unit
  plant: string | null; // Corresponds to Plant
  totalPOQuantity: number | null; // Corresponds to Total P.O. Quantity
  dispatchQuantity: number | null; // Corresponds to Dispatch Quantity
  pendingQuantity: number | null; // Corresponds to Pending Quantity
  noOfSheets: number | null; // Corresponds to No. of Sheets
  poDate: string | null; // Corresponds to P.O. Date (ISO or YYYY-MM-DD)
  deliveryDate: string | null; // Corresponds to Delivery Date (ISO or YYYY-MM-DD)
  dispatchDate: string | null; // Corresponds to Dispatch Date (ISO or YYYY-MM-DD)
  nrcDeliveryDate: string | null; // Corresponds to NRC Delivery Date (ISO or YYYY-MM-DD)

  // Field for Job Planning Steps
  jobSteps: JobStep[] | null; // Array of steps for job planning
}
