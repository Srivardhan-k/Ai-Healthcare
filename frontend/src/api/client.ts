import axios, { AxiosError } from 'axios';

// Dynamic API URL - works on both mobile and desktop
function getBaseURL(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  const hostname = window.location.hostname;
  const port = 5001;

  // If on localhost/127.0.0.1, use localhost (desktop)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${port}/api`;
  }

  // Otherwise use the current hostname (works for mobile on network)
  return `http://${hostname}:${port}/api`;
}

const BASE_URL = getBaseURL();

/**
 * Core Axios Request Configuration
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Global Error Handler Wrapper
 * Returns clean JSON responses instead of crashing or throwing ugly tracebacks.
 */
const handleRequest = async <T>(request: Promise<any>): Promise<{ data: T | null; error: string | null }> => {
  try {
    const response = await request;
    return { data: response.data, error: null };
  } catch (err) {
    const error = err as AxiosError<{ message?: string, error?: string }>;
    // Clean offline fallback / descriptive messaging
    if (!error.response) {
      return { data: null, error: 'Network Error: Cannot connect to the server. Please check your internet connection or try again later.' };
    }
    const message = error.response.data?.message || error.response.data?.error || `Request failed with status ${error.response.status}`;
    return { data: null, error: message };
  }
};

/**
 * --------------------------------------------------------------------------
 * API Services Layer
 * Works seamlessly with existing components ensuring standardized JSON formats
 * --------------------------------------------------------------------------
 */

export const api = {
  // Medicine Endpoints
  medicine: {
    /** Connects to /medicines/batch-check (checks adverse drug interactions) */
    check: (medicineNames: string[]) => handleRequest(apiClient.post('/medicines/batch-check', { medicines: medicineNames })),
    getAll: () => handleRequest(apiClient.get('/medicines/database')),
  },

  // Profile Endpoints
  profile: {
    /** Connects to /profile for fetching metadata */
    get: () => handleRequest(apiClient.get('/profile')),
    update: (profileData: any) => handleRequest(apiClient.put('/profile', profileData)),
  },

  // Fitness Endpoints
  fitness: {
    /** Connects to /fitness logs or /fitness/today */
    getToday: () => handleRequest(apiClient.get('/fitness/today')),
    saveData: (steps: number, sleep: number, water: number) => handleRequest(apiClient.post('/fitness', { steps, sleep, water })),
    getScore: () => handleRequest(apiClient.get('/fitness/score')),
    getHistory: () => handleRequest(apiClient.get('/fitness/history')),
  },

  // Schedule Endpoints
  schedule: {
    /** Connects to /scheduler for medication tasks */
    getToday: () => handleRequest(apiClient.get('/scheduler/today')),
    addTask: (name: string, dosage: string, time: string) => handleRequest(apiClient.post('/scheduler', { name, dosage, time })),
    markTaken: (taskId: number) => handleRequest(apiClient.patch(`/scheduler/${taskId}/taken`)),
    getOverdue: () => handleRequest(apiClient.get('/scheduler/overdue')),
  },

  // Risk Prediction Endpoints
  risk: {
    /** Connects to /predict_risk (typically backend mapped to /risk/predict) */
    predictRisk: (age: number, bmi: number, symptoms: string) => handleRequest(apiClient.post('/risk/predict', { age, bmi, symptoms })),
    getHistory: () => handleRequest(apiClient.get('/risk/history')),
  }
};

export default api;
