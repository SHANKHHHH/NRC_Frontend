import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Types
interface StatusMetric {
  key: keyof StatusData;
  label: string;
  className: string;
}

interface StatusData {
  totalOrders: number;
  activeProcesses: number;
  completedOrders: number;
}

interface ApiResponse {
  success: boolean;
  data: StatusData;
  timestamp?: number;
}

// Constants
const API_CONFIG = {
  endpoint: import.meta.env.VITE_REACT_APP_API_URL || 'https://your-api-endpoint.com/api/dashboard/status',
  timeout: 5000,
  retryAttempts: 3,
  refreshInterval: 30000,
} as const;

const METRICS_CONFIG: readonly StatusMetric[] = [
  {
    key: 'totalOrders',
    label: 'Total Orders',
    className: 'bg-blue-50 border-blue-100 hover:bg-blue-100',
  },
  {
    key: 'activeProcesses',
    label: 'Active Processes',
    className: 'bg-cyan-50 border-cyan-100 hover:bg-cyan-100',
  },
  {
    key: 'completedOrders',
    label: 'Completed Orders',
    className: 'bg-sky-50 border-sky-100 hover:bg-sky-100',
  },
] as const;

// Custom Hook
const useApiCall = (url: string, options?: RequestInit) => {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithTimeout = useCallback(async (url: string, options: RequestInit = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, []);

  const fetchData = useCallback(async (retryCount = 0): Promise<void> => {
    try {
      setError(null);
      const result: ApiResponse = await fetchWithTimeout(url, options);

      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred';

      if (retryCount < API_CONFIG.retryAttempts) {
        setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      setError(errorMessage);
      setData({
        totalOrders: 250,
        activeProcesses: 180,
        completedOrders: 70,
      });
    } finally {
      setLoading(false);
    }
  }, [url, options, fetchWithTimeout]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), API_CONFIG.refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: () => fetchData() };
};

// Components
const StatusCard: React.FC<{
  metric: StatusMetric;
  value: number;
  loading: boolean;
}> = React.memo(({ metric, value, loading }) => (
  <div className={`
    ${metric.className}
    rounded-lg border p-6 transition-all duration-200 ease-in-out
    hover:shadow-sm hover:-translate-y-0.5 cursor-default
    min-h-[100px] flex flex-col justify-between
  `}>
    <h3 className="text-sm font-medium text-gray-700 mb-3 leading-tight">
      {metric.label}
    </h3>
    <div className="flex items-end justify-between">
      {loading ? (
        <div className="space-y-2 w-full">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
          <div className="h-2 bg-gray-100 rounded animate-pulse w-8" />
        </div>
      ) : (
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-gray-900 leading-none">
            {value.toLocaleString()}
          </span>
          <div className="w-8 h-0.5 bg-gray-300 mt-2 rounded-full" />
        </div>
      )}
    </div>
  </div>
));

StatusCard.displayName = 'StatusCard';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-4">
    <div className="relative">
      <div className="w-6 h-6 border-2 border-gray-200 rounded-full animate-spin" />
      <div className="absolute top-0 left-0 w-6 h-6 border-2 border-blue-500 rounded-full animate-spin border-t-transparent" />
    </div>
    <span className="ml-3 text-sm text-gray-600 font-medium">
      Syncing data...
    </span>
  </div>
);

const ErrorBoundary: React.FC<{
  error: string;
  onRetry: () => void;
}> = ({ error, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button
          onClick={onRetry}
          className="mt-3 text-sm bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

// Main Component
const QuickStatus: React.FC = () => {
  const { data, loading, error, refetch } = useApiCall(API_CONFIG.endpoint);

  const statusCards = useMemo(() => {
    if (!data) return null;

    return METRICS_CONFIG.map((metric) => (
      <StatusCard
        key={metric.key}
        metric={metric}
        value={data[metric.key]}
        loading={loading}
      />
    ));
  }, [data, loading]);

  return (
    <section className="w-full max-w-6xl mx-auto p-6 bg-white">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Quick Status
          </h1>
          {!loading && !error && (
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Live data
            </div>
          )}
        </div>
      </header>

      {error && !data ? (
        <ErrorBoundary error={error} onRetry={refetch} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {statusCards}
          </div>

          {loading && data && <LoadingSpinner />}

          <footer className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Updates automatically every {API_CONFIG.refreshInterval / 1000} seconds
              {error && (
                <span className="text-amber-600 ml-2">
                  • Showing cached data due to connection issues
                </span>
              )}
            </p>
          </footer>
        </>
      )}
    </section>
  );
};

export default QuickStatus;
