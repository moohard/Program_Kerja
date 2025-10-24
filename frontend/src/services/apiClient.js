import axios from "axios";

// Use relative path for proxy to work correctly
export const API_URL = "/api";

export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=`;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Needed for session cookies
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

export default apiClient;