import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:9000/api/v1",
//   withCredentials: true, // Crucial for sending/receiving cookies
// });
const api = axios.create({
  baseURL: "https://mern-stack-auth-final-prod-level.onrender.com/api/v1",
  withCredentials: true, // Crucial for sending/receiving cookies
});

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;

api.interceptors.response.use(
  // If the response is successful, just return it
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // ==========================================
    // CASE 1: Not a Token Expiry Error
    // ==========================================
    // If the error is NOT a 401 TOKEN_EXPIRED, we don't want to intercept it here.
    // This includes normal 400 Bad Requests, 500 Server Errors, or 
    // 401 NO_ACCESS_TOKEN / INVALID_TOKEN (which mean the user is fully logged out).
    if (!(status === 401 && code === "TOKEN_EXPIRED")) {
      // Optional: You could add logic here to redirect to /login if code === "NO_ACCESS_TOKEN"
      return Promise.reject(error);
    }

    // ==========================================
    // CASE 2: Infinite Loop Prevention
    // ==========================================
    // If we already retried this exact request, or if the request that failed 
    // WAS the refresh token request itself, abort to prevent an endless loop.
    if (
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      console.warn(`[Axios] Blocked retry loop for url: ${originalRequest.url}`);
      return Promise.reject(error);
    }

    // ==========================================
    // CASE 3: Refresh Already in Progress
    // ==========================================
    // If another request already triggered a refresh, don't start a second one.
    if (isRefreshing) {
      console.warn(`[Axios] Refresh already in progress. Dropping request: ${originalRequest.url}`);
      return Promise.reject(error); 
    }

    // ==========================================
    // CASE 4: Attempting to Refresh
    // ==========================================
    originalRequest._retry = true; // Mark this request so we don't retry it twice
    isRefreshing = true;           // Lock the refresh process

    try {
      console.info("[Axios] 🔄 Access token expired. Attempting to refresh...");

      // Call the backend to refresh the HTTP-only cookie
      await api.post("/auth/refresh-token");

      console.info(`[Axios] ✅ Token refreshed successfully. Retrying: ${originalRequest.url}`);

      // Retry the original request that failed
      return api(originalRequest);
      
    } catch (refreshError) {
      // ==========================================
      // CASE 5: Refresh Token Failed
      // ==========================================
      // The refresh token itself is either expired, missing, or invalid.
      // The user's session is officially dead.
      
      const refreshCode = refreshError.response?.data?.code;
      console.error(`[Axios] ❌ Refresh failed with code: ${refreshCode || 'UNKNOWN'}`);

      if (
        refreshCode === "REFRESH_TOKEN_EXPIRED" ||
        refreshCode === "INVALID_REFRESH_TOKEN" ||
        refreshCode === "REFRESH_TOKEN_MISSING"
      ) {
        console.warn("[Axios] 🚪 Session completely dead. Redirecting to login.");
        
        // Clear any frontend state here if using Redux/Zustand/Context before redirecting
        // e.g., store.dispatch(logoutAction())
        
        window.location.replace("/login");
      }

      return Promise.reject(refreshError);
      
    } finally {
      // Always release the lock, whether the refresh succeeded or failed
      isRefreshing = false;
    }
  }
);

export default api;