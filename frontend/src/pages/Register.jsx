import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useId } from "react";
import api from "../services/api";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Shadow",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Midnight",
];

const MAX_FILE_SIZE_MB = 5;

export default function Register() {
  const navigate = useNavigate();
  const fileInputId = useId();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: PRESET_AVATARS[0],
  });

  const [avatarPreview, setAvatarPreview] = useState(PRESET_AVATARS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clean up Object URL memory allocations
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleChange = (e) => {
    if (error) setError("");
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (avatarUrl) => {
    if (error) setError("");
    setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
    setAvatarPreview(avatarUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return setError("Please upload a valid image file.");
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return setError(`File size must be under ${MAX_FILE_SIZE_MB}MB.`);
    }

    setError("");
    setFormData((prev) => ({ ...prev, avatar: file }));
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { name, email, password, confirmPassword, avatar } = formData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return setError("Please fill in all required fields.");
    }

    if (password.length < 8) {
      return setError("Password must be at least 8 characters long.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      let response;

      if (avatar instanceof File) {
        const multipartData = new FormData();
        multipartData.append("name", name.trim());
        multipartData.append("email", email.trim().toLowerCase());
        multipartData.append("password", password);
        multipartData.append("confirmPassword", confirmPassword);
        multipartData.append("avatar", avatar);

        response = await api.post("/auth/register", multipartData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/auth/register", {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
          avatar,
        });
      }

      alert(response.data?.message || "Registration Successful!");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-10 overflow-hidden">
      {/* Background Glow Decorations */}
      <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl pointer-events-none" />

      <div className="relative flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl shadow-indigo-900/10 border border-slate-200/80">
        
        {/* LEFT BRAND PANEL */}
        <div className="hidden lg:flex lg:w-5/12 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-10 text-white relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

          <div className="space-y-3 z-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-inner">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Join the Platform</h2>
            <p className="text-sm text-indigo-100 font-medium">
              Create your account and customize your workspace profile.
            </p>
          </div>

          {/* Desktop Avatar Picker */}
          <div className="my-8 space-y-4 z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Select Your Avatar
            </p>

            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={avatarPreview}
                  alt="Selected Avatar Preview"
                  className="h-20 w-20 rounded-full bg-white/20 p-1 object-cover border-2 border-white/40 shadow-xl transition-transform duration-300 group-hover:scale-105"
                />
                <label
                  htmlFor={fileInputId}
                  className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-white p-1.5 text-indigo-600 shadow-md transition hover:bg-indigo-50 focus-within:ring-2 focus-within:ring-white"
                  title="Upload Custom Avatar"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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

              <div>
                <h4 className="font-semibold text-white">Profile Picture</h4>
                <p className="text-xs text-indigo-200">
                  Choose a avatar preset or upload your own image.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              {PRESET_AVATARS.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAvatarSelect(preset)}
                  aria-label={`Select avatar preset ${index + 1}`}
                  className={`h-11 w-11 rounded-full p-0.5 border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white ${
                    formData.avatar === preset
                      ? "border-white bg-white/30 scale-110 shadow-lg"
                      : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <img
                    src={preset}
                    alt=""
                    className="h-full w-full rounded-full bg-white/20"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="z-10 text-xs text-indigo-200 font-medium flex items-center gap-1.5">
            <span>🛡️</span> Encrypted & Enterprise grade authentication
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="w-full lg:w-7/12 p-6 sm:p-10 flex flex-col justify-center">
          <div className="text-center lg:text-left space-y-2 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Account
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Get started with your free account today
            </p>
          </div>

          {/* Mobile Avatar Selector */}
          <div className="lg:hidden mb-6 flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="h-14 w-14 rounded-full bg-indigo-100 p-1 border border-indigo-200 object-cover shrink-0"
            />
            <div className="flex-1 space-y-1 overflow-hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
                Choose Avatar
              </span>
              <div className="flex gap-2 items-center overflow-x-auto py-1">
                {PRESET_AVATARS.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAvatarSelect(preset)}
                    className={`h-8 w-8 rounded-full border shrink-0 ${
                      formData.avatar === preset
                        ? "border-indigo-600 ring-2 ring-indigo-600/20"
                        : "border-slate-300 opacity-60"
                    }`}
                  >
                    <img src={preset} alt="" className="h-full w-full rounded-full" />
                  </button>
                ))}
                <label
                  htmlFor="mobile-avatar-upload"
                  className="h-8 w-8 rounded-full border border-slate-300 bg-white flex items-center justify-center cursor-pointer text-indigo-600 shrink-0"
                  title="Upload image"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <input
                    id="mobile-avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs sm:text-sm font-medium text-red-700 animate-fadeIn"
            >
              <svg className="h-5 w-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1">
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 text-slate-400 hover:text-indigo-600 focus:outline-none p-1 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.02 10.02 0 012.122-.063c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18M9.88 9.88a3 3 0 104.24 4.24" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="absolute right-3 text-slate-400 hover:text-indigo-600 focus:outline-none p-1 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showConfirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.02 10.02 0 012.122-.063c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18M9.88 9.88a3 3 0 104.24 4.24" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/35 focus:outline-none focus:ring-4 focus:ring-indigo-600/20 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center lg:text-left text-sm font-medium text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}