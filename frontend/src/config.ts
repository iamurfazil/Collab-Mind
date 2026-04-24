export const CLOUD_API_BASE_URL = 'https://collabmind-backend-995242116294.asia-south1.run.app';
export const LOCAL_API_BASE_URL = 'http://localhost:5000';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  (import.meta.env.DEV ? LOCAL_API_BASE_URL : CLOUD_API_BASE_URL);
