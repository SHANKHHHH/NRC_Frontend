// src/Components/Roles/Planner/startNew_job.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { type Job } from './Types/job.ts'; // Adjust path as needed
import JobCard from './jobCard/JobCard'; // Adjust path as needed
import JobDetailModal from './modal/jobDetailModal'; // Adjust path as needed
import LoadingSpinner from '../../common/LoadingSpinner';

const StartNewJob: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null); // For the read-only detail modal
  const [message, setMessage] = useState<string | null>(null); // For success/error messages after update
  const [searchTerm, setSearchTerm] = useState<string>(''); // For search functionality
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]); // For filtered search results

  // Function to fetch all jobs
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('https://nrprod.nrcontainers.com/api/jobs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch jobs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        // Ensure all jobs have the new fields initialized to null if not present from API
        const processedJobs: Job[] = data.data.map((j: any) => ({
          ...j,
          poNumber: j.poNumber || null,
          unit: j.unit || null,
          plant: j.plant || null,
          totalPOQuantity: j.totalPOQuantity || null,
          dispatchQuantity: j.dispatchQuantity || null,
          pendingQuantity: j.pendingQuantity || null,
          noOfSheets: j.noOfSheets || null,
          poDate: j.poDate || null,
          deliveryDate: j.deliveryDate || null,
          dispatchDate: j.dispatchDate || null,
          nrcDeliveryDate: j.nrcDeliveryDate || null,
          jobSteps: j.jobSteps || null,
          // Ensure jobDemand and machineId are also initialized if they could be null
          jobDemand: j.jobDemand || null,
          machineId: j.machineId || null,
        }));
        setJobs(processedJobs);
      } else {
        setError('Unexpected API response format or data is not an array.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      console.error('Fetch Jobs Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle updating job status (from JobDetailModal - "Continue with this job")
  const handleContinueJob = async (nrcJobNo: string) => {
    setMessage(null); // Clear previous update messages
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const API_ENDPOINT = `https://nrprod.nrcontainers.com/api/jobs/${nrcJobNo}`;
      const response = await fetch(API_ENDPOINT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: 'ACTIVE' }), // Send the updated status
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update job status: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setMessage(`Job ${nrcJobNo} status updated to ACTIVE successfully!`);
        // Refresh the jobs list to reflect the change
        fetchJobs();
      } else {
        throw new Error(result.message || 'Failed to update job status.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setMessage(`Error: ${err.message}`);
      } else {
        setMessage('An unknown error occurred during job update.');
      }
      console.error('Update Job Error:', err);
    } finally {
      // Message will disappear after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Function to handle search - optimized with useCallback
  const handleSearch = useCallback((searchValue: string) => {
    setSearchTerm(searchValue);
    
    if (!searchValue.trim()) {
      setFilteredJobs([]); // Clear filtered results if search is empty
      return;
    }

    const filtered = jobs.filter(job => 
      job.nrcJobNo.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [jobs]);

  // Function to clear search
  const clearSearch = () => {
    setSearchTerm('');
    setFilteredJobs([]);
  };

  // Optimized clear search function with immediate feedback
  const handleClearSearch = useCallback(() => {
    // Clear immediately for better UX
    setSearchTerm('');
    setFilteredJobs([]);
  }, []);

  // Debounced search input handler for better performance
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value); // Update input immediately for responsive UI
    
    // Clear results immediately if search is empty
    if (!value.trim()) {
      setFilteredJobs([]);
      return;
    }
    
    // Small delay for search to avoid excessive filtering on every keystroke
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 150); // 150ms delay for better performance
    
    return () => clearTimeout(timeoutId);
  }, [handleSearch]);

  // Immediate clear function for instant feedback
  const handleImmediateClear = useCallback(() => {
    setSearchTerm('');
    setFilteredJobs([]);
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 50); // Small delay to ensure localStorage is ready

    return () => clearTimeout(timer);
  }, []);

  const activeJobs = jobs.filter(job => job.status === 'ACTIVE');
  const inactiveJobs = jobs.filter(job => job.status === 'INACTIVE');

  return (
    <div className="p-4 sm:p-6 lg:p-8  min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Manage Jobs</h1>

      {/* Search Section */}
      <div className="mb-8">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchInputChange}
              placeholder="Search by NRC Job Number..."
              className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={handleImmediateClear}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors text-sm"
              >
                Clear
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              {filteredJobs.length > 0 
                ? `Found ${filteredJobs.length} job(s) matching "${searchTerm}"`
                : `No jobs found matching "${searchTerm}"`
              }
            </p>
          )}
        </div>
      </div>



      {loading && <LoadingSpinner size="lg" text="Loading jobs..." />}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {message && (
        <div className={`px-4 py-3 rounded relative mb-6 ${message.includes('Error') ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'}`} role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Search Results Section - Show when searching */}
          {searchTerm && filteredJobs.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">
                Search Results ({filteredJobs.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={setSelectedJob}
                  />
                ))}
              </div>
            </section>
          )}

          {/* No Search Results Message */}
          {searchTerm && filteredJobs.length === 0 && (
            <section className="mb-10">
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500">No jobs match your search for "{searchTerm}"</p>
                <button
                  onClick={handleImmediateClear}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </section>
          )}

          {/* All Jobs Sections - Show when not searching or when search is cleared */}
          {!searchTerm && (
            <>
              {/* Active Jobs Section */}
              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">Active Jobs ({activeJobs.length})</h2>
                {activeJobs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No active jobs found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {activeJobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onClick={setSelectedJob}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Inactive Jobs Section */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">Inactive Jobs ({inactiveJobs.length})</h2>
                {inactiveJobs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No inactive jobs found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {inactiveJobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onClick={setSelectedJob}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </>
      )}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onContinueJob={handleContinueJob}
        />
      )}
    </div>
  );
};

export default StartNewJob;
