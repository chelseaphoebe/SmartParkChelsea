import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export default function AdminLots() {
  // State management for parking lots data and UI interactions
  const [lots, setLots] = useState([]);                    // Array of parking lots from API
  const [form, setForm] = useState({ name: "", capacity: "" }); // Form data for creating new lot
  const [editMode, setEditMode] = useState(null);          // ID of lot currently being edited (null = no edit)
  const [editForm, setEditForm] = useState({ name: "", capacity: "" }); // Form data for editing existing lot
  const [sidebarOpen, setSidebarOpen] = useState(false);   // Toggle state for hamburger sidebar
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ASTA = {
    darkBlue: "#003E92",
    lightBlueBg: "#E8F1FF",
  };

  // Load lots
  const loadLots = async () => {
    try {
      const res = await api.get("/lots");
      console.log("Loaded lots:", res.data); 
      setLots(res.data);
    } catch (err) {
      console.error("Error loading lots", err);
      toast.error("Failed to load parking lots");
    }
  };

  useEffect(() => {
    loadLots();
  }, []);

  // Create Lot
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/lots", {
        name: form.name,
        capacity: Number(form.capacity),
      });
      toast.success("Parking lot created!");
      setForm({ name: "", capacity: "" });
      loadLots();
    } catch {
      toast.error("Failed to create parking lot.");
    }
  };

  /**
   * Delete parking lot with validation
   * Prevents deletion if lot has occupied slots (backend validation)
   * Updates UI optimistically on success, shows specific error messages on failure
   */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this parking lot?")) return;
    
    try {
      console.log("Deleting lot with ID:", id);
      await api.delete(`/lots/${id}`);
      
      toast.success("Parking lot deleted successfully!");
      
      // Optimistic UI update - remove from local state without API call
      setLots(prev => prev.filter(lot => lot._id !== id));
      
    } catch (error) {
      console.error("Delete error:", error);
      
      // Handle specific error cases with appropriate user feedback
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error || "Cannot delete parking lot with occupied slots";
        toast.error(errorMsg);
      } else if (error.response?.status === 404) {
        toast.error("Parking lot not found");
      } else {
        toast.error("Failed to delete parking lot.");
      }
    }
  };
  /**
   * Enter edit mode for a specific parking lot
   * Populates edit form with current lot data
   */
  const startEdit = (lot) => {
    setEditMode(lot._id);  // Set which lot is being edited
    setEditForm({ name: lot.name, capacity: lot.capacity }); // Pre-fill form with current values
  };

  /**
   * Save edited parking lot data
   * Validates and sends updated data to backend, refreshes lot list on success
   */
  const saveEdit = async (id) => {
    try {
      await api.put(`/lots/${id}`, {
        name: editForm.name,
        capacity: Number(editForm.capacity), // Ensure capacity is numeric
      });

      setEditMode(null);  // Exit edit mode
      toast.success("Updated successfully!");
      loadLots();  // Refresh data from server to get updated slot counts
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b47a1] via-[#0d4aa7] to-[#0b2f66] text-white">
      {/* 
        Hamburger Navigation System
        - Button only visible when sidebar is closed
        - Sidebar slides in from left with smooth animation
        - Overlay closes sidebar when clicked
        - Navigation between Analytics and Parking Lots pages
      */}
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

      {/* Sidebar with slide animation - transforms from -translate-x-full to translate-x-0 */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Menu</h2>
          <nav className="space-y-2">
            {/* Analytics navigation - navigates and closes sidebar */}
            <button
              onClick={() => {
                navigate('/admin/dashboard');
                setSidebarOpen(false);
              }}
              className="w-full text-left px-4 py-3 bg-white rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </button>
            {/* Current page indicator - highlighted in blue */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full text-left px-4 py-3 bg-[#003E92] rounded-lg text-white flex items-center gap-3"
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

      {/* Semi-transparent overlay - closes sidebar when clicked */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
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

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="md:w-2/3">
            <p className="uppercase tracking-wider text-sm text-[#cbe0ff]">
              Admin Dashboard
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Manage Parking Lots
            </h1>
            <p className="mt-4 text-[#d8e8ff] max-w-xl">
              Create, edit, and update each parking lot and its capacity.
            </p>
          </div>

          <div className="md:w-1/3 flex justify-end">
            <div className="hidden md:block w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
              <div className="text-white text-4xl font-bold">P</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 pb-24">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-gray-900">

          {/* Create Lot */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-100">
            <h2 className="text-2xl font-semibold text-[#003E92] mb-6">
              Create Parking Lot
            </h2>

            <form
              onSubmit={handleCreate}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lot Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter lot name"
                    className="w-full bg-white border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-[#003E92] focus:border-transparent transition"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="w-full sm:w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="1"
                    className="w-full border bg-white border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-[#003E92] focus:border-transparent transition"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl text-white font-semibold hover:text-white transition shadow-sm flex justify-center items-center text-center bg-[#003E92] hover:bg-[#002B63]"
              >
                Create
              </button>
            </form>
          </div>

          {/* Lot List */}
          <div className="grid gap-6">
            {lots.map((lot) => (
              <div
                key={lot._id}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row justify-between gap-4 border border-gray-200"
              >
                {/* 
                  Conditional rendering: Edit mode vs Display mode
                  Edit mode shows inline form inputs, Display mode shows lot info with action buttons
                */}
                {editMode === lot._id ? (
                  // EDIT MODE: Inline editing form
                  <div className="w-full flex flex-col gap-3">
                    {/* Lot name input */}
                    <input
                      type="text"
                      className="border border-gray-300 bg-white p-3 rounded-xl focus:ring-2 focus:ring-[#003E92] focus:border-transparent"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      required
                    />

                    {/* Capacity input with validation */}
                    <input
                      type="number"
                      className="border border-gray-300 bg-white p-3 rounded-xl focus:ring-2 focus:ring-[#003E92] focus:border-transparent"
                      value={editForm.capacity}
                      onChange={(e) =>
                        setEditForm({ ...editForm, capacity: e.target.value })
                      }
                      min="1"
                      required
                    />

                    {/* Save/Cancel buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => saveEdit(lot._id)}
                        className="px-5 py-2 rounded-xl text-white hover:opacity-90 transition"
                        style={{ backgroundColor: ASTA.darkBlue }}
                      >
                        Save
                      </button>

                      <button
                        onClick={() => setEditMode(null)}
                        className="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // DISPLAY MODE: Show lot information and action buttons
                  <>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{lot.name}</h3>
                      <p className="text-gray-600 mt-1">
                        {lot.totalSlots} slots — {lot.availableSlots} available
                      </p>
                    </div>

                    <div className="flex gap-3">
                    <Link
  to={`/lots/${lot._id}`}
  className="px-4 py-2 hover:text-white rounded-xl text-white transition shadow-sm flex justify-center items-center text-center 
             bg-[#003E92] hover:bg-[#002B63]"
>
  View Slots
</Link>



                      <button
                        onClick={() => startEdit(lot)}
                        className="px-4 py-2 rounded-xl bg-yellow-500  hover:border-yellow-600 text-white hover:bg-yellow-600 transition shadow-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(lot._id)}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {lots.length === 0 && (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-gray-200">
                <p className="text-gray-600 text-lg">
                  No parking lots found. Create your first parking lot above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}