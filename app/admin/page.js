"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastEntry, setLastEntry] = useState(null);
  
  // 1. FormData matched with DB columns
  const [formData, setFormData] = useState({
    roll_no: '', 
    student_name: '',
    course: '',
    session: ''
  });

  // 2. Fetch Latest Record for the Alert Box
  const fetchLastId = async () => {
    const { data, error } = await supabase
      .from("student")
      .select("roll_no, student_name") // roll_no use kiya hai
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) setLastEntry(data);
  };

  useEffect(() => {
    fetchLastId();
    const authStatus = localStorage.getItem("iccs_admin_auth");
    if (authStatus === "true") setIsLoggedIn(true);
  }, []);

  const availableCourses = [
    "Diploma in IT Support", // Spelling fixed from 'Deploma'
    "Certified Professional in Supply Chain Management",
  ];

  const ADMIN_PASSWORD = "ICCS_ADMIN_2026";

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("iccs_admin_auth", "true");
      setIsLoggedIn(true);
      toast.success("Access Granted! Welcome to ICCS Admin Panel.");
    } else {
      toast.error("Invalid Admin Password.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("iccs_admin_auth");
    setIsLoggedIn(false);
    toast.success("Logged out successfully.");
  };

  // 3. Updated Submission with Duplicate Check
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step A: Check for existing roll_no
      const { data: duplicate } = await supabase
        .from('student')
        .select('roll_no')
        .eq('roll_no', formData.roll_no)
        .maybeSingle();

      if (duplicate) {
        toast.error(`ID: ${formData.roll_no} is already registered!`);
        setLoading(false);
        return;
      }

      // Step B: Insert unique record
      const { error: insertError } = await supabase.from('student').insert([formData]);

      if (insertError) throw insertError;

      toast.success('Student record saved successfully! ✅');
      setFormData({ roll_no: '', student_name: '', course: '', session: '' });
      fetchLastId(); // Refresh the "Last Record" alert
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-[#12066a]">Admin Login</h1>
            <p className="text-slate-400 text-sm mt-2">Enter credentials to manage records</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Admin Password"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-[#12066a] outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-[#12066a] hover:bg-[#997819] text-white py-4 rounded-2xl font-bold transition-all shadow-lg">
              Login to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto pt-32 pb-20 px-6">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 relative">
          <button onClick={handleLogout} className="absolute top-6 right-8 text-xs bg-red-50 text-red-500 px-4 py-2 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all">
            Logout
          </button>

          <div className="mb-6">
            <h1 className="text-3xl font-black text-[#12066a]">Add Student</h1>
            <p className="text-slate-500 mt-1">Generate a new digital certificate record.</p>
          </div>

          {/* 🚀 Dynamic Alert Box showing Previous ID */}
          {lastEntry && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex justify-between items-center shadow-sm border-l-4 border-l-[#12066a]">
              <div>
                <p className="text-[10px] font-black text-[#12066a] uppercase tracking-widest opacity-60">Last Record Entered:</p>
                <p className="font-bold text-[#12066a] text-sm">
                  ID: {lastEntry.roll_no} | {lastEntry.student_name}
                </p>
              </div>
              <div className="bg-[#12066a] text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter shadow-sm">
                Latest
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-black mb-1.5 ml-1">
                  {key === "roll_no" ? "Certificate ID (Roll No)" : key.replace("_", " ")}
                </label>

                {key === "course" ? (
                  <select
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-[#12066a] focus:ring-4 focus:ring-blue-50 outline-none transition-all cursor-pointer"
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  >
                    <option value="">Select Course...</option>
                    {availableCourses.map((course, index) => (
                      <option key={index} value={course}>{course}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-[#12066a] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-400"
                    placeholder={key === "roll_no" ? "e.g. ICCS-010" : `Enter ${key.replace("_", " ")}...`}
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#12066a] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 hover:bg-[#997819] transition-all transform active:scale-[0.98] mt-4 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Register Student Record"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}