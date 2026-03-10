"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [myPersonalLastEntry, setMyPersonalLastEntry] = useState(null); // 🎯 Personal Tracking

  const [formData, setFormData] = useState({
    roll_no: "",
    student_name: "",
    course: "",
    session: "",
    issue_date: "", // 🎯 DB column se match kiya
  });

  useEffect(() => {
    const authStatus = localStorage.getItem("iccs_admin_auth");
    if (authStatus === "true") setIsLoggedIn(true);

    // 🎯 LOCAL STORAGE: Page load par apna aakhri record uthao
    const saved = localStorage.getItem("myLastEntry");
    if (saved) setMyPersonalLastEntry(JSON.parse(saved));
  }, []);

  // Professional course list with correct spellings
  const availableCourses = [
    "Diploma in IT Support",
    "Diploma in Supply Chain Management",
    "Diploma in Digital Marketing",
    "Diploma in Graphic Designing",
  ];

  const ADMIN_PASSWORD = "ICCS_ADMIN_2026";

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("iccs_admin_auth", "true");
      setIsLoggedIn(true);
      toast.success("Access Granted!");
    } else {
      toast.error("Invalid Admin Password.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("iccs_admin_auth");
    setIsLoggedIn(false);
    toast.success("Logged out.");
  };
  const formatDateForDB = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`; // Format: 10/03/2026
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🎯 Date ko convert karein bhejney se pehle
      const finalData = {
        ...formData,
        roll_no: formData.roll_no.trim().toUpperCase(),
        issue_date: formatDateForDB(formData.issue_date),
      };

      // Duplicate Check
      const { data: duplicate } = await supabase
        .from("student")
        .select("roll_no")
        .eq("roll_no", finalData.roll_no)
        .maybeSingle();

      if (duplicate) {
        toast.error(`ID: ${finalData.roll_no} already exists!`);
        setLoading(false);
        return;
      }

      // Insert with formatted date
      const { error: insertError } = await supabase
        .from("student")
        .insert([finalData]);

      if (insertError) throw insertError;

      // Local Storage update
      const personalRecord = {
        id: finalData.roll_no,
        name: finalData.student_name,
      };
      localStorage.setItem("myLastEntry", JSON.stringify(personalRecord));
      setMyPersonalLastEntry(personalRecord);

      toast.success("Record saved with correct date format! ✅");
      setFormData({
        roll_no: "",
        student_name: "",
        course: "",
        session: "",
        issue_date: "",
      });
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    // ... aapka login UI (same rahega)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-32 pb-20 px-6">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 relative">
          <button
            onClick={handleLogout}
            className="absolute top-6 right-8 text-xs bg-red-50 text-red-500 px-4 py-2 rounded-full font-bold"
          >
            Logout
          </button>

          <div className="mb-6">
            <h1 className="text-3xl font-black text-[#12066a]">Add Student</h1>
            <p className="text-slate-500 mt-1">
              ICCS Digital Record Management
            </p>
          </div>

          {/* 🚀 PERSONAL ALERT BOX: Sirf aapka data dikhayega */}
          {myPersonalLastEntry && (
            <div className="mb-8 p-4 bg-blue-50 border-l-4 border-[#12066a] rounded-r-2xl flex justify-between items-center shadow-sm">
              <div>
                <p className="text-[10px] font-black text-[#12066a] uppercase tracking-widest opacity-60">
                  Your Last Entry:
                </p>
                <p className="font-bold text-[#12066a] text-sm">
                  ID: {myPersonalLastEntry.id} | {myPersonalLastEntry.name}
                </p>
              </div>
              <div className="bg-[#12066a] text-white text-[9px] px-3 py-1 rounded-full font-black uppercase">
                Recent
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Roll No */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-black mb-1.5 ml-1">
                Certificate ID (Roll No)
              </label>
              <input
                type="text"
                required
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-[#12066a] outline-none"
                placeholder="e.g. ICCS-010"
                value={formData.roll_no}
                onChange={(e) =>
                  setFormData({ ...formData, roll_no: e.target.value })
                }
              />
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-black mb-1.5 ml-1">
                Student Name
              </label>
              <input
                type="text"
                required
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-[#12066a] outline-none"
                placeholder="Enter Name..."
                value={formData.student_name}
                onChange={(e) =>
                  setFormData({ ...formData, student_name: e.target.value })
                }
              />
            </div>

            {/* Course Selection */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-black mb-1.5 ml-1">
                Course
              </label>
              <select
                required
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-[#12066a] outline-none"
                value={formData.course}
                onChange={(e) =>
                  setFormData({ ...formData, course: e.target.value })
                }
              >
                <option value="">Select Course...</option>
                {availableCourses.map((course, i) => (
                  <option key={i} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Session & Issue Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-black mb-1.5 ml-1">
                  Session
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none"
                  placeholder="2025-26"
                  value={formData.session}
                  onChange={(e) =>
                    setFormData({ ...formData, session: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-black mb-1.5 ml-1">
                  Issue Date 
                </label>
                <input
                  type="date" // 📅 Is se calendar open hoga
                  required
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none"
                  value={formData.issue_date}
                  onChange={(e) =>
                    setFormData({ ...formData, issue_date: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#12066a] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-[#997819] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? "Processing..." : "Register Student Record"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
