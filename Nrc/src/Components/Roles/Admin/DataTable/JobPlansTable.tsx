import React, { useState } from 'react';
import { Eye, Search, Filter as FilterIcon } from 'lucide-react';

interface JobPlanStep {
  id: number;
  stepNo: number;
  stepName: string;
  machineDetails: Array<{
    unit: string | null;
    machineId: string | number;
    machineCode: string | null;
    machineType: string;
    machine?: {
      id: string;
      description: string;
      status: string;
      capacity: number;
    };
  }>;
  status: 'planned' | 'start' | 'stop';
  startDate: string | null;
  endDate: string | null;
  user: string | null;
  createdAt: string;
  updatedAt: string;
}

interface JobPlan {
  jobPlanId: number;
  nrcJobNo: string;
  jobDemand: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  steps: JobPlanStep[];
}

interface JobPlansTableProps {
  jobPlans: JobPlan[];
  onViewDetails: (jobPlan: JobPlan) => void;
  className?: string;
}

const JobPlansTable: React.FC<JobPlansTableProps> = ({
  jobPlans,
  onViewDetails,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [demandFilter, setDemandFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'inProgress' | 'planned'>('all');

  // Filter job plans based on search and filters
  const filteredJobPlans = jobPlans.filter(jobPlan => {
    const matchesSearch = jobPlan.nrcJobNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDemand = demandFilter === 'all' || jobPlan.jobDemand === demandFilter;
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const hasInProgress = jobPlan.steps.some(step => step.status === 'start');
      const allCompleted = jobPlan.steps.every(step => step.status === 'stop');
      
      if (statusFilter === 'completed') matchesStatus = allCompleted;
      else if (statusFilter === 'inProgress') matchesStatus = hasInProgress;
      else if (statusFilter === 'planned') matchesStatus = !hasInProgress && !allCompleted;
    }

    return matchesSearch && matchesDemand && matchesStatus;
  });

  const getJobStatus = (jobPlan: JobPlan) => {
    const hasInProgress = jobPlan.steps.some(step => step.status === 'start');
    const allCompleted = jobPlan.steps.every(step => step.status === 'stop');
    
    if (allCompleted) return { text: 'Completed', color: 'bg-green-100 text-green-800' };
    if (hasInProgress) return { text: 'In Progress', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Planned', color: 'bg-gray-100 text-gray-800' };
  };

  const getProgressPercentage = (jobPlan: JobPlan) => {
    const completedSteps = jobPlan.steps.filter(step => step.status === 'stop').length;
    const totalSteps = jobPlan.steps.length;
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">Job Plans Overview</h3>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search job plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF] w-full sm:w-64"
            />
          </div>

          {/* Demand Filter */}
          <select
            value={demandFilter}
            onChange={(e) => setDemandFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
          >
            <option value="all">All Demands</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="inProgress">In Progress</option>
            <option value="planned">Planned</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJobPlans.map((jobPlan) => {
              const status = getJobStatus(jobPlan);
              const progressPercentage = getProgressPercentage(jobPlan);
              
              return (
                <tr key={jobPlan.jobPlanId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{jobPlan.nrcJobNo}</div>
                    <div className="text-sm text-gray-500">ID: {jobPlan.jobPlanId}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      jobPlan.jobDemand === 'high' ? 'bg-red-100 text-red-800' :
                      jobPlan.jobDemand === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {jobPlan.jobDemand}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-[#00AEEF] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {jobPlan.steps.filter(step => step.status === 'stop').length}/{jobPlan.steps.length} steps
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(jobPlan.createdAt).toLocaleDateString()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onViewDetails(jobPlan)}
                      className="text-[#00AEEF] hover:text-[#0099cc] transition-colors duration-200 flex items-center space-x-1"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredJobPlans.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FilterIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No job plans found matching your criteria.</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPlansTable; 