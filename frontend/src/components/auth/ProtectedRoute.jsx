import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const location = useLocation();

//   useEffect(() => {
//     let isMounted = true;

//     const checkAuthentication = async () => {
//       try {
//         /*
//          * This request will automatically:
//          *
//          * 1. Send the accessToken cookie
//          * 2. If accessToken is valid → return profile
//          * 3. If accessToken expired → Axios interceptor calls
//          *    /auth/newAccessToken
//          * 4. If refresh succeeds → retry this request
//          * 5. If refresh fails → reject the request
//          */
//         await api.get("/user/getProfile");

//         if (isMounted) {
//           setAuthenticated(true);
//         }
//       } catch (error) {
//         console.error("Authentication check failed:", error);

//         if (isMounted) {
//           setAuthenticated(false);
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     checkAuthentication();

//     return () => {
//       isMounted = false;
//     };
//   }, []);


useEffect(() => {
  const checkAuthentication = async () => {
    try {
      setLoading(true);

      await api.get("/user/getProfile");

      console.log("✅ User authenticated");
      setAuthenticated(true);
    } catch (err) {
      console.log("❌ Authentication failed after refresh attempt");
      console.log("error ", err);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  checkAuthentication();
}, []);

  // Don't redirect while authentication is being checked.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />

          <p className="text-sm font-medium text-gray-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Authentication failed even after refresh attempt.
  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;