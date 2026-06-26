import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Something went wrong. Please try again.';

    return Promise.reject({
      ...error,
      message
    });
  }
);
