import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const [lots, setLots] = useState([]);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const loadLots = async () => {
      try {
        const res = await api.get("/lots");
        setLots(res.data);
      } catch (err) {
        console.error("Error loading lots:", err);
      }
    };

    loadLots();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b47a1] via-[#0d4aa7] to-[#0b2f66] text-white">
      
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%" stopColor="#0a3a86" />
                <stop offset="100%" stopColor="#0b47a1" />
              </linearGradient>
            </defs>
            <path
              fill="url(#g1)"
              d="M0,96L48,117.3C96,139,192,181,288,181.3C384,181,480,139,576,149.3C672,160,768,224,864,229.3C960,235,1056,181,1152,160C1248,139,1344,149,1392,154.7L1440,160V0H0Z"
            />
          </svg>
        </div>

        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="uppercase tracking-wider text-sm text-[#cbe0ff]">Parking System</p>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Available Parking Lots
            </h1>
            <p className="mt-4 text-[#d8e8ff] max-w-xl">
              Choose a parking lot to continue and select an available slot.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition text-white font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8 pb-24">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-gray-900">

          <h2 className="text-xl font-semibold mb-6">All Parking Lots</h2>

          <div className="grid gap-4">
            {lots.map((lot) => (
              <div
                key={lot._id}
                className="bg-white border border-gray-200 p-5 rounded-xl shadow flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <h2 className="text-xl font-semibold">{lot.name}</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {lot.availableSlots} available of {lot.totalSlots} total
                  </p>
                </div>

                <Link
                  to={`/lots/${lot._id}`}
                  className="px-4 py-2 hover:text-white rounded-xl text-white transition shadow-sm flex justify-center items-center text-center 
             bg-[#003E92] hover:bg-[#002B63]"
                >
                  View
                </Link>
              </div>
            ))}

            {lots.length === 0 && (
              <p className="text-gray-500">No parking lots available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
