import { useState, useContext } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      toast.success("Registration successful! Please login.");
      nav("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
    bg-gradient-to-br from-[#0b47a1] via-[#0d4aa7] to-[#0b2f66] text-white relative">

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <defs>
            <linearGradient id="registerWave" x1="0" x2="1">
              <stop offset="0%" stopColor="#0a3a86" />
              <stop offset="100%" stopColor="#0b47a1" />
            </linearGradient>
          </defs>
          <path
            fill="url(#registerWave)"
            d="M0,160L48,165.3C96,171,192,181,288,176C384,171,480,149,576,128C672,107,768,85,864,112C960,139,1056,213,1152,224C1248,235,1344,181,1392,149.3L1440,117V0H0Z"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-md w-full px-10 py-12 bg-white rounded-3xl shadow-xl text-gray-900">

        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-[#0b47a1]">Create Account</h1>
          <p className="mt-2 text-gray-600">Join Smart Park today</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full bg-white px-4 py-3 border border-gray-300 rounded-xl 
            focus:ring-2 focus:ring-[#003E92] outline-none"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            required
            className="w-full bg-white px-4 py-3 border border-gray-300 rounded-xl 
            focus:ring-2 focus:ring-[#003E92] outline-none"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 bg-white py-3 border border-gray-300 rounded-xl 
            focus:ring-2 focus:ring-[#003E92] outline-none"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold 
            bg-[#003E92] hover:opacity-90 transition disabled:opacity-50 mt-2"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-[#003E92] hover:underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
