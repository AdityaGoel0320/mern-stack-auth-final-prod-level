import React, { useEffect, useState } from "react";
import api from "../services/api";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await api.get("/user/getProfile");
        console.log(response.data?.user.email);
        
        setProfile(response.data?.user);
      } catch (error) {
        console.error("Profile error:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch profile"
        );
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.replace("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-red-500 mb-4 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        {/* Profile Header */}
        <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-3xl font-bold text-blue-600 shadow-inner">
            {(
              profile?.name ||
              profile?.username ||
              profile?.email ||
              "U"
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile?.name || profile?.username || "User"}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {profile?.email || "No email provided"}
            </p>
          </div>
        </div>

        {/* Profile Information Cards */}
        <div className="py-6 space-y-4">
          <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Account Details
          </h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="block text-xs font-medium text-gray-400">Full Name</span>
              <span className="block text-sm font-semibold text-gray-800 mt-1">
                {profile?.name || "Not specified"}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="block text-xs font-medium text-gray-400">Email Address</span>
              <span className="block text-sm font-semibold text-gray-800 mt-1">
                {profile?.email || "Not specified"}
              </span>
            </div>

            {profile?.username && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-xs font-medium text-gray-400">Username</span>
                <span className="block text-sm font-semibold text-gray-800 mt-1">
                  {profile.name}
                </span>
              </div>
            )}

            {profile?.role && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-xs font-medium text-gray-400">Role</span>
                <span className="block text-sm font-semibold text-gray-800 mt-1 capitalize">
                  {profile.email}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Securely authenticated session
          </span>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;