import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const res = await api.get('/admin/statistics');
        setStatistics(res.data);
      } catch (err) {
        console.error('Error loading statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
    
    const interval = setInterval(loadStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b47a1] via-[#0d4aa7] to-[#0b2f66] flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  const pieData = [
    { name: 'Occupied', value: statistics?.overallStatistics.totalOccupied || 0, color: '#ef4444' },
    { name: 'Available', value: statistics?.overallStatistics.totalAvailable || 0, color: '#22c55e' }
  ];

  const barData = statistics?.lotStatistics.map(lot => ({
    name: lot.lotName,
    occupied: lot.occupiedSlots,
    available: lot.availableSlots,
    total: lot.totalSlots,
    occupancyRate: lot.occupancyPercentage
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b47a1] via-[#0d4aa7] to-[#0b2f66] text-white">
      {/* Hamburger Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Menu</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full text-left px-4 py-3 rounded-lg bg-[#003E92] text-white flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </button>
            <button
              onClick={() => {
                navigate('/admin/lots');
                setSidebarOpen(false);
              }}
              className="w-full text-left px-4 py-3 bg-white rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Parking Lots
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
        <div className="relative z-10">
          <p className="uppercase tracking-wider text-sm text-[#cbe0ff]">Admin Analytics</p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Real-time Dashboard
          </h1>
          <p className="mt-4 text-[#d8e8ff] max-w-xl">
            Monitor parking lot occupancy and performance metrics in real-time.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 pb-24">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-gray-900">
          
          {/* Navigation */}
          <div className="flex gap-4 mb-8">
            <Link 
              to="/admin/lots" 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Manage Lots
            </Link>
            <div className="px-4 py-2 bg-[#003E92] text-white rounded-lg">
              Analytics Dashboard
            </div>
          </div>

          {/* Overall Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-sm font-medium text-blue-600">Total Slots</h3>
              <p className="text-3xl font-bold text-blue-900">
                {statistics?.overallStatistics.totalSlots || 0}
              </p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-sm font-medium text-green-600">Available</h3>
              <p className="text-3xl font-bold text-green-900">
                {statistics?.overallStatistics.totalAvailable || 0}
              </p>
            </div>
            
            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
              <h3 className="text-sm font-medium text-red-600">Occupied</h3>
              <p className="text-3xl font-bold text-red-900">
                {statistics?.overallStatistics.totalOccupied || 0}
              </p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <h3 className="text-sm font-medium text-purple-600">Occupancy Rate</h3>
              <p className="text-3xl font-bold text-purple-900">
                {statistics?.overallStatistics.occupancyPercentage || 0}%
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Pie Chart - Overall Occupancy */}
            <div className="bg-gray-50 p-4 md:p-6 rounded-xl">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Overall Occupancy</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={"70%"}
                    dataKey="value"
                    label={({ name, percent }) => {
                      const isMobile = window.innerWidth < 768;
                      return isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Occupancy per Lot */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Occupancy by Parking Lot</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="occupied" fill="#ef4444" name="Occupied" />
                  <Bar dataKey="available" fill="#22c55e" name="Available" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Lot Statistics */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Detailed Statistics</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Parking Lot</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Total Slots</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Occupied</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Available</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Occupancy Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics?.lotStatistics.map((lot) => (
                    <tr key={lot.lotId}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">{lot.lotName}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{lot.totalSlots}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-red-600">{lot.occupiedSlots}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-green-600">{lot.availableSlots}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span className={`font-semibold ${lot.occupancyPercentage > 80 ? 'text-red-600' : lot.occupancyPercentage > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {lot.occupancyPercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}