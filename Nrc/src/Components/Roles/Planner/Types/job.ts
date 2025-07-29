
export interface Job {
    id: number;
    nrcJobNo: string;
    styleItemSKU: string;
    customerName: string;
    fluteType: string | null;
    status: 'ACTIVE' | 'INACTIVE'; // Assuming these are the only two statuses
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
    jobDemand: string | null;
    imageURL: string | null;
    createdAt: string;
    updatedAt: string;
    userId: string | null;
    machineId: string | null;
  }
  