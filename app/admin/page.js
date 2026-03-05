"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Navbar from "@/components/Navbar";

export default function AdminDashboard() {
  // 1. States for Authentication & Data
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    roll_no: '',
    student_name: '',
    course: '',
    session: ''
  });

  // 2. ICCS Admin Password (You can change this)
  const ADMIN_PASSWORD = "ICCS_ADMIN_2026";

  // 3. Check for existing session on page load
  useEffect(() => {
    const authStatus = localStorage.getItem('iccs_admin_auth');
    if (authStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // 4. Handle Admin Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('iccs_admin_auth', 'true');
      setIsLoggedIn(true);
      toast.success("Access Granted! Welcome to ICCS Admin Panel.");
    } else {
      toast.error("Invalid Admin Password. Please try again.");
    }
  };

  // 5. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('iccs_admin_auth');
    setIsLoggedIn(false);
    toast.info("Logged out successfully.");
  };

  // 6. Handle Data Submission to Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Using toast.promise for professional feedback
    const promise = supabase.from('student').insert([formData]);

    toast.promise(promise, {
      loading: 'Uploading record to ICCS database...',
      success: () => {
        setFormData({ 
          roll_no: '', student_name: '',  
          course: '',  session: '' 
        });
        setLoading(false);
        return 'Student record has been successfully saved! 🚀';
      },
      error: (err) => {
        setLoading(false);
        return `Failed to save record: ${err.message}`;
      },
    });
  };

  // --- LOGIN VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-100 font-black text-[#12066a] text-xl mx-auto mb-4">
              ICCS
            </div>
            <h1 className="text-2xl font-black text-[#12066a]">Admin Login</h1>
            <p className="text-slate-400 text-sm mt-2">Enter credentials to manage records</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Admin Password"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-[#12066a] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="submit"
              className="w-full bg-[#12066a] hover:bg-[#997819] text-white py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
            >
              Login to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- ADMIN DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto pt-32 pb-20 px-6">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 relative">
          
          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="absolute top-6 right-8 text-xs bg-red-50 text-red-500 px-4 py-2 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            Logout
          </button>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-[#12066a]">Add Student</h1>
            <p className="text-slate-500 mt-1">Fill in the details to generate a digital certificate.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-black mb-1.5 ml-1">
                  {key.replace('_', ' ')}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-[#12066a] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-500"
                  placeholder={`Enter ${key.replace('_', ' ')}...`}
                  value={formData[key]}
                  onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                />
              </div>
            ))}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#12066a] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 hover:bg-[#997819] hover:shadow-[#997819]/20 transition-all transform active:scale-[0.98] mt-4 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Register Student Record"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}