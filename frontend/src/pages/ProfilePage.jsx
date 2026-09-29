import React, { useEffect, useState, useId } from "react";
import api from "../services/api";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Shadow",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Midnight",
];

const MAX_FILE_SIZE_MB = 5;

const ProfilePage = () => {
  const fileInputId = useId();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Avatar Editing States
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Fetch initial profile
  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await api.get("/user/getProfile");
        const userData = response.data?.user;

        setProfile(userData);
        setSelectedAvatar(userData?.avatar || PRESET_AVATARS[0]);
        setAvatarPreview(userData?.avatar || PRESET_AVATARS[0]);
      } catch (err) {
        console.error("Profile error:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch profile"
        );
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  // Revoke blob URL memory allocations on change/unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarSelect = (avatarUrl) => {
    setUpdateError("");
    setSelectedAvatar(avatarUrl);
    setAvatarPreview(avatarUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return setUpdateError("Please upload a valid image file.");
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return setUpdateError(`File size must be under ${MAX_FILE_SIZE_MB}MB.`);
    }

    setUpdateError("");
    setSelectedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveAvatar = async () => {
    try {
      setUpdatingAvatar(true);
      setUpdateError("");

      let response;

      // Handle file upload vs preset URL update
      if (selectedAvatar instanceof File) {
        const formData = new FormData();
        formData.append("avatar", selectedAvatar);

        response = await api.put("/user/updateAvatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.put("/user/updateAvatar", {
          avatar: selectedAvatar,
        });
      }

      // Update state with updated user response (or fallback to preview)
      const updatedUser = response.data?.user || {
        ...profile,
        avatar: avatarPreview,
      };

      setProfile(updatedUser);
      setIsEditingAvatar(false);
    } catch (err) {
      console.error("Avatar update error:", err);
      setUpdateError(
        err.response?.data?.message || "Failed to update avatar. Try again."
      );
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingAvatar(false);
    setUpdateError("");
    setSelectedAvatar(profile?.avatar || PRESET_AVATARS[0]);
    setAvatarPreview(profile?.avatar || PRESET_AVATARS[0]);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-gray-100">
          
          {/* Avatar Section */}
          <div className="relative group shrink-0">
            <img
              src={isEditingAvatar ? avatarPreview : profile?.avatar || PRESET_AVATARS[0]}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
            />
            
            {!isEditingAvatar && (
              <button
                type="button"
                onClick={() => setIsEditingAvatar(true)}
                className="absolute bottom-0 right-0 rounded-full bg-indigo-600 p-1.5 text-white shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                title="Change Avatar"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
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

        {/* Avatar Edit Drawer / Panel */}
        {isEditingAvatar && (
          <div className="my-6 p-5 bg-slate-50 border border-indigo-100 rounded-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Choose New Avatar
              </span>
              <span className="text-xs text-slate-400">
                Presets or upload custom
              </span>
            </div>

            {updateError && (
              <p className="text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {updateError}
              </p>
            )}

            {/* Presets + Custom Upload Trigger */}
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              {PRESET_AVATARS.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAvatarSelect(preset)}
                  className={`h-11 w-11 rounded-full p-0.5 border-2 transition-all duration-200 focus:outline-none shrink-0 ${
                    selectedAvatar === preset
                      ? "border-indigo-600 ring-2 ring-indigo-600/20 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={preset}
                    alt={`Preset ${index + 1}`}
                    className="h-full w-full rounded-full bg-slate-200"
                  />
                </button>
              ))}

              {/* Upload Input Button */}
              <label
                htmlFor={fileInputId}
                className="h-11 w-11 rounded-full border-2 border-dashed border-indigo-300 bg-white flex items-center justify-center cursor-pointer text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50/50 transition-colors shrink-0"
                title="Upload custom image"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Edit Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={updatingAvatar}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={updatingAvatar}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {updatingAvatar ? "Saving..." : "Save Avatar"}
              </button>
            </div>
          </div>
        )}

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
                  {profile.username}
                </span>
              </div>
            )}

            {profile?.role && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-xs font-medium text-gray-400">Role</span>
                <span className="block text-sm font-semibold text-gray-800 mt-1 capitalize">
                  {profile.role}
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
            className="px-5 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;