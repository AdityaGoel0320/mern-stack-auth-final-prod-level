import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:9000/api/v1",
//   withCredentials: true, // Crucial for sending/receiving cookies
// });

const api = axios.create({
  baseURL: "https://mern-stack-auth-final-prod-level.onrender.com/api/v1",
  withCredentials: true, // Crucial for sending/receiving cookies
});

// Flags and queue for handling simultaneous requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // ==========================================
    // CASE 1: Check for Retryable Auth Errors
    // ==========================================
    // Intercepts both TOKEN_EXPIRED and NO_ACCESS_TOKEN
    const isAuthError = status === 401 && (code === "TOKEN_EXPIRED" || code === "NO_ACCESS_TOKEN");

    if (!isAuthError) {
      return Promise.reject(error);
    }

    // ==========================================
    // CASE 2: Infinite Loop Prevention
    // ==========================================
    if (
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      console.warn(`[Axios] Blocked retry loop for url: ${originalRequest.url}`);
      return Promise.reject(error);
    }

    // ==========================================
    // CASE 3: Refresh Already in Progress (Queue Request)
    // ==========================================
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // ==========================================
    // CASE 4: Attempting to Refresh
    // ==========================================
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.info("[Axios] 🔄 Attempting to refresh access token...");

      await api.post("/auth/refresh-token");

      console.info(`[Axios] ✅ Token refreshed successfully. Processing queue and retrying: ${originalRequest.url}`);

      // Resume all queued requests
      processQueue(null);

      return api(originalRequest);
      
    } catch (refreshError) {
      // ==========================================
      // CASE 5: Refresh Token Failed / Dead Session
      // ==========================================
      console.error("[Axios] ❌ Refresh failed. Session completely dead.");
      
      // Reject everything currently in the queue
      processQueue(refreshError, null);

      window.location.replace("/login");

      return Promise.reject(refreshError);
      
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;