import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    setError("");

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Register API
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Frontend Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return setError("Please fill all fields.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:9000/api/v1/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate("/login");
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Server Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg space-y-5"
      >
        <h1 className="text-center text-3xl font-bold">
          Create Account
        </h1>

        {error && (
          <div className="rounded-md bg-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-lg border p-3 outline-none focus:border-black"
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-lg border p-3 outline-none focus:border-black"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full rounded-lg border p-3 outline-none focus:border-black"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full rounded-lg border p-3 outline-none focus:border-black"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black p-3 text-white transition hover:bg-gray-800 disabled:bg-gray-500"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}