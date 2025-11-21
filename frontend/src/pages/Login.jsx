import { useState, useContext } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      login(res.data);

      if (res.data.user.email === "admin@example.com" || res.data.user.role === "ADMIN") {
        nav("/admin/lots");
      } else {
        nav("/");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login failed";
      setError(errorMsg);
      toast.error(errorMsg);
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
            <linearGradient id="loginWave" x1="0" x2="1">
              <stop offset="0%" stopColor="#0a3a86" />
              <stop offset="100%" stopColor="#0b47a1" />
            </linearGradient>
          </defs>
          <path
            fill="url(#loginWave)"
            d="M0,128L48,112C96,96,192,64,288,80C384,96,480,160,576,160C672,160,768,96,864,80C960,64,1056,96,1152,122.7C1248,149,1344,171,1392,181.3L1440,192V0H0Z"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-md w-full p-10 bg-white rounded-3xl shadow-xl text-gray-900">

        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-[#0b47a1]">Smart Park</h1>
          <p className="mt-2 text-gray-600">Sign in to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl 
            focus:ring-2 focus:ring-[#003E92] outline-none"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 border bg-white border-gray-300 rounded-xl 
            focus:ring-2 focus:ring-[#003E92] outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold 
            bg-[#003E92] hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-[#003E92] hover:underline font-semibold">
            Sign up
          </Link>
        </p>

        {/* Demo Accounts */}
        <div className="mt-8 p-4 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-600 mb-2 font-semibold">Demo accounts:</p>
          <p className="text-xs text-gray-500">Admin: admin@example.com / admin123</p>
          <p className="text-xs text-gray-500">User: user@example.com / user123</p>
        </div>
      </div>
    </div>
  );
}
