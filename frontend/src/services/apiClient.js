import axios from "axios";

// Use absolute path to the backend API
export const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=`;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Needed for session cookies
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// Add CSRF token interceptor
apiClient.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          // Handle multiple cookies with same name - take the last one
          if (parts.length >= 2) {
              const lastPart = parts[parts.length - 1];
              return lastPart.split(';').shift();
          }
          return null;
      };
      const csrfToken = getCookie('XSRF-TOKEN');
      if (csrfToken) {
          config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
      }
  }
  return config;
});

// Add auth token interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;