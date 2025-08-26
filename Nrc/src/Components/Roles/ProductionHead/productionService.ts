const API_BASE_URL = 'http://nrc-backend-alb-174636098.ap-south-1.elb.amazonaws.com/api';

export interface ProductionStep {
  id: number;
  jobNrcJobNo: string;
  status: string;
  date: string;
  shift: string | null;
  quantity: number;
  wastage?: number;
  [key: string]: any;
}

export interface ProductionData {
  corrugation: ProductionStep[];
  fluteLamination: ProductionStep[];
  punching: ProductionStep[];
  flapPasting: ProductionStep[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ProductionService {
  // Check if user is authenticated
  private isAuthenticated(): boolean {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return false;
    
    try {
      // Check if token is expired
      const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return tokenData.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Check if token is about to expire (within 5 minutes)
  private isTokenExpiringSoon(): boolean {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return false;
    
    try {
      const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const fiveMinutes = 5 * 60; // 5 minutes in seconds
      return (tokenData.exp - currentTime) < fiveMinutes;
    } catch {
      return false;
    }
  }

  private async fetchFromApi<T>(endpoint: string): Promise<T> {
    try {
      // Check authentication first
      if (!this.isAuthenticated()) {
        throw new Error('Authentication token not found or expired. Please log in.');
      }

      // Warn if token is expiring soon
      if (this.isTokenExpiringSoon()) {
        console.warn('Warning: Your session will expire soon. Please save your work and log in again.');
      }

      // Get access token from localStorage
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }
      return result.data;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      
      // Handle authentication errors
      if (error instanceof Error) {
        this.handleAuthError(error);
      }
      
      throw error;
    }
  }

  async getCorrugationByJob(jobNrcNo: string): Promise<ProductionStep[]> {
    console.log('🔄 Fetching corrugation data for job:', jobNrcNo);
    const timestamp = new Date().getTime();
    return this.fetchFromApi<ProductionStep[]>(`/corrugation/by-job/${encodeURIComponent(jobNrcNo)}?t=${timestamp}`);
  }

  async getFluteLaminationByJob(jobNrcNo: string): Promise<ProductionStep[]> {
    console.log('🔄 Fetching flute lamination data for job:', jobNrcNo);
    const timestamp = new Date().getTime();
    return this.fetchFromApi<ProductionStep[]>(`/flute-laminate-board-conversion/by-job/${encodeURIComponent(jobNrcNo)}?t=${timestamp}`);
  }

  async getPunchingByJob(jobNrcNo: string): Promise<ProductionStep[]> {
    console.log('🔄 Fetching punching data for job:', jobNrcNo);
    const timestamp = new Date().getTime();
    return this.fetchFromApi<ProductionStep[]>(`/punching/by-job/${encodeURIComponent(jobNrcNo)}?t=${timestamp}`);
  }

  async getFlapPastingByJob(jobNrcNo: string): Promise<ProductionStep[]> {
    console.log('🔄 Fetching flap pasting data for job:', jobNrcNo);
    const timestamp = new Date().getTime();
    return this.fetchFromApi<ProductionStep[]>(`/side-flap-pasting/by-job/${encodeURIComponent(jobNrcNo)}?t=${timestamp}`);
  }

  async getAllProductionData(jobNrcNo: string): Promise<ProductionData> {
    try {
      console.log('🔄 Fetching production data for job:', jobNrcNo);
      const [corrugation, fluteLamination, punching, flapPasting] = await Promise.all([
        this.getCorrugationByJob(jobNrcNo),
        this.getFluteLaminationByJob(jobNrcNo),
        this.getPunchingByJob(jobNrcNo),
        this.getFlapPastingByJob(jobNrcNo)
      ]);

      return {
        corrugation,
        fluteLamination,
        punching,
        flapPasting
      };
    } catch (error) {
      console.error('Error fetching all production data:', error);
      throw error;
    }
  }

  // Get all available active jobs from completed-jobs API
  async getAvailableJobs(): Promise<Array<{ nrcJobNo: string; customerName: string; status: string }>> {
    try {
      console.log('🔄 Fetching available jobs from:', `${API_BASE_URL}/completed-jobs`);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in.');
      }

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/completed-jobs?t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }

      const result = await response.json();
      console.log('📡 Raw API response:', result);
      
      if (result.success && Array.isArray(result.data)) {
        console.log('📊 Total jobs in response:', result.data.length);
        console.log('🔍 All job statuses (from jobDetails):', result.data.map((job: any) => job.jobDetails?.status));
        
        // Filter only ACTIVE jobs - status is in jobDetails.status
        const activeJobs = result.data.filter((job: any) => job.jobDetails?.status === 'ACTIVE');
        console.log('✅ Active jobs found:', activeJobs.length);
        
        const mappedJobs = activeJobs.map((job: any) => ({
          nrcJobNo: job.nrcJobNo,
          customerName: job.jobDetails?.customerName || job.purchaseOrderDetails?.customer || 'N/A',
          status: job.jobDetails?.status // Use jobDetails.status
        }));
        
        console.log('🎯 Mapped jobs:', mappedJobs);
        return mappedJobs;
      }
      
      console.log('❌ API response format issue:', result);
      return [];
    } catch (error) {
      console.error('Error fetching available jobs:', error);
      return [];
    }
  }

  // Search jobs by NRC Job No or customer name
  async searchJobs(searchTerm: string): Promise<Array<{ nrcJobNo: string; customerName: string; status: string }>> {
    const allJobs = await this.getAvailableJobs();
    if (!searchTerm.trim()) return allJobs;
    
    const term = searchTerm.toLowerCase();
    return allJobs.filter(job => 
      job.nrcJobNo.toLowerCase().includes(term) ||
      job.customerName.toLowerCase().includes(term)
    );
  }

  // Get analytics data for charts
  getAnalyticsData(productionData: ProductionData) {
    // Production efficiency over time
    const efficiencyData = {
      corrugation: productionData.corrugation.length > 0 ? 
        (productionData.corrugation.filter(step => step.status === 'accept').length / productionData.corrugation.length) * 100 : 0,
      fluteLamination: productionData.fluteLamination.length > 0 ? 
        (productionData.fluteLamination.filter(step => step.status === 'accept').length / productionData.fluteLamination.length) * 100 : 0,
      punching: productionData.punching.length > 0 ? 
        (productionData.punching.filter(step => step.status === 'accept').length / productionData.punching.length) * 100 : 0,
      flapPasting: productionData.flapPasting.length > 0 ? 
        (productionData.flapPasting.filter(step => step.status === 'accept').length / productionData.flapPasting.length) * 100 : 0
    };

    // Quantity trends by production step
    const quantityData = {
      corrugation: productionData.corrugation.reduce((sum, step) => sum + step.quantity, 0),
      fluteLamination: productionData.fluteLamination.reduce((sum, step) => sum + step.quantity, 0),
      punching: productionData.punching.reduce((sum, step) => sum + step.quantity, 0),
      flapPasting: productionData.flapPasting.reduce((sum, step) => sum + step.quantity, 0)
    };



    // Shift performance (if shift data is available)
    const shiftData = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };

    // Machine utilization (if machine data is available)
    const machineData = {
      corrugation: productionData.corrugation.map(step => step.machineNo || 'Unknown').filter(Boolean),
      punching: productionData.punching.map(step => step.machine || 'Unknown').filter(Boolean),
      flapPasting: productionData.flapPasting.map(step => step.machineNo || 'Unknown').filter(Boolean)
    };

    return {
      efficiencyData,
      quantityData,
      shiftData,
      machineData
    };
  }

  // Handle authentication errors
  private handleAuthError(error: Error): void {
    if (error.message.includes('Authentication') || error.message.includes('log in')) {
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  }

  // Get current user info for debugging
  getCurrentUserInfo(): { hasToken: boolean; tokenExpiry?: string; userData?: any } {
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('userData');
    
    if (!accessToken) {
      return { hasToken: false };
    }
    
    try {
      const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
      const expiryDate = new Date(tokenData.exp * 1000);
      
      return {
        hasToken: true,
        tokenExpiry: expiryDate.toISOString(),
        userData: userData ? JSON.parse(userData) : null
      };
    } catch {
      return { hasToken: false };
    }
  }

  // Check authentication status
  checkAuthStatus(): { isAuthenticated: boolean; message: string } {
    if (!this.isAuthenticated()) {
      return { 
        isAuthenticated: false, 
        message: 'Not authenticated. Please log in.' 
      };
    }
    
    if (this.isTokenExpiringSoon()) {
      return { 
        isAuthenticated: true, 
        message: 'Session expiring soon. Please save your work.' 
      };
    }
    
    return { 
      isAuthenticated: true, 
      message: 'Authenticated successfully.' 
    };
  }


}

export const productionService = new ProductionService();
export default productionService; 