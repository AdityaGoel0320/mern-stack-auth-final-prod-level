import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api"; // Update this path to where your configured axios file is located

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Using your configured axios instance (baseURL and withCredentials are built-in)
      const response = await api.post("/auth/login", formData);

      alert("Login Successful!");
      console.log(response.data);

      navigate("/");
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Login Failed";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg space-y-5"
      >
        <h1 className="text-3xl font-bold text-center">Login</h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-lg border p-3 outline-none focus:border-black"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full rounded-lg border p-3 outline-none focus:border-black"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black p-3 text-white hover:bg-gray-800 disabled:bg-gray-500"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-blue-600">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}