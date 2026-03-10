"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ICCSAdminDashboard() {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [operator, setOperator] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [lastEntry, setLastEntry] = useState(null);
  const [loading, setLoading] = useState(false);

  // Staff States
  const [authName, setAuthName] = useState("");
  const [authPin, setAuthPin] = useState("");

  const coursesList = [
    "Diploma in Information Technology (DIT)",
    "Graphic Designing", "Web Development", "Digital Marketing", 
    "Cyber Security", "Supply Chain Management", "Blockchain Technology"
  ];

  const [formData, setFormData] = useState({
    roll_no: "", student_name: "", course: "", session: "2025-26", issue_date: ""
  });

  useEffect(() => {
    // Session check for white-labeled security
    if (localStorage.getItem("iccs_admin_session") === "true") setIsAdminAuth(true);
    const savedName = localStorage.getItem("iccs_staff_name");
    const savedPin = localStorage.getItem("iccs_staff_pin");
    if (savedName && savedPin) {
      setOperator(savedName);
      fetchLastEntry(savedName, savedPin);
    }
  }, []);

  // 1. Admin Password Check
  const handleAdminLogin = () => {
    if (adminPass === "ICCS_ADMIN_2026") {
      localStorage.setItem("iccs_admin_session", "true");
      setIsAdminAuth(true);
      toast.success("Admin Access Granted");
    } else {
      toast.error("Incorrect Password!");
    }
  };

  // 2. Staff Unique Identity Check
  const handleStaffAuth = async () => {
    if (!authName.trim() || authPin.length < 4) return toast.error("Complete details!");
    setLoading(true);
    try {
      const { data: user } = await supabase.from("staff_access")
        .select("*").eq("name", authName.trim()).eq("pin", authPin.trim()).maybeSingle();

      if (user) {
        loginStaff(user.name, user.pin);
      } else {
        await supabase.from("staff_access").insert([{ name: authName.trim(), pin: authPin.trim() }]);
        loginStaff(authName.trim(), authPin.trim());
      }
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  const loginStaff = (name, pin) => {
    localStorage.setItem("iccs_staff_name", name);
    localStorage.setItem("iccs_staff_pin", pin);
    setOperator(name);
    fetchLastEntry(name, pin);
  };

  const fetchLastEntry = async (name, pin) => {
    const uniqueID = `${name}-${pin}`; // Prevents same-name overlap
    const { data } = await supabase.from("student").select("*").eq("added_by", uniqueID).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (data) setLastEntry(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const pin = localStorage.getItem("iccs_staff_pin");
    try {
      const { error } = await supabase.from("student").insert([{
        ...formData,
        roll_no: formData.roll_no.toUpperCase(),
        added_by: `${operator}-${pin}` // Tracks unique record
      }]);
      if (error) throw error;
      toast.success("Saved!");
      fetchLastEntry(operator, pin);
      setFormData({ ...formData, roll_no: "", student_name: "", issue_date: "" });
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  // --- UI RENDERING (ALL WHITE THEME) ---

  // ADMIN SCREEN
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-3xl font-black text-[#12066a] mb-2">ICCS Admin</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-center">Master Access Only</p>
          <input type="password" placeholder="Enter Admin Password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="w-full p-5 bg-slate-50 rounded-3xl mb-4 text-center border border-slate-100 outline-[#12066a] font-bold" />
          <button onClick={handleAdminLogin} className="w-full bg-[#12066a] text-white py-5 rounded-3xl font-black shadow-lg shadow-blue-900/10 active:scale-95 transition-all">Unlock Dashboard</button>
        </div>
      </div>
    );
  }

  // STAFF SCREEN
  if (!operator) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-black text-[#12066a] mb-6 text-center italic">Staff Identity Gate</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Your Full Name" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100 outline-[#12066a]" />
            <input type="password" placeholder="Personal 4-Digit PIN" value={authPin} onChange={(e) => setAuthPin(e.target.value)} maxLength={4} className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center tracking-widest outline-[#12066a]" />
            <button onClick={handleStaffAuth} disabled={loading} className="w-full bg-[#12066a] text-white py-5 rounded-3xl font-bold shadow-md">{loading ? "Logging in..." : "Start Work Session"}</button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center">
       <div className="w-full max-w-xl mb-10 flex justify-between items-center border-b border-slate-50 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-[#12066a] font-black border border-slate-200">{operator[0]}</div>
            <div><p className="text-[9px] text-slate-400 font-bold uppercase">Staff Operator</p><h3 className="text-md font-black text-[#12066a]">{operator}</h3></div>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-[10px] font-black text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">System Logout</button>
       </div>

       <div className="w-full max-w-xl">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-[#12066a]">Register Student</h1>
            <p className="text-slate-400 text-xs font-medium">Add new certification records to the ICCS database.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Certificate ID</label>
              <input type="text" placeholder="e.g. ICCS-105" value={formData.roll_no} onChange={(e) => setFormData({...formData, roll_no: e.target.value})} className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100 outline-[#12066a] font-bold text-[#12066a]" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Student Full Name</label>
              <input type="text" placeholder="Enter Name..." value={formData.student_name} onChange={(e) => setFormData({...formData, student_name: e.target.value})} className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100 outline-[#12066a] font-medium" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Selected Course</label>
              <select value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100 outline-[#12066a] appearance-none cursor-pointer" required>
                <option value="">Select Course...</option>
                {coursesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Academic Session</label>
                <input type="text" value={formData.session} className="w-full p-5 bg-slate-50 rounded-3xl text-center font-black text-[#12066a] border border-slate-100" disabled />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Issue Date</label>
                <input type="date" value={formData.issue_date} onChange={(e) => setFormData({...formData, issue_date: e.target.value})} className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100 outline-[#12066a]" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#12066a] text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-900/10 hover:translate-y-[-2px] transition-all active:scale-95">
              {loading ? "Processing..." : "Register Record"}
            </button>
          </form>

          {/* Secure Last Entry View */}
          {lastEntry && (
            <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center">
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Your Recent Entry</p>
                  <p className="text-sm font-black text-[#12066a]">{lastEntry.student_name}</p>
                  <p className="text-[10px] font-bold text-slate-400">{lastEntry.roll_no}</p>
               </div>
               <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-[#12066a]">{lastEntry.course}</p>
               </div>
            </div>
          )}
       </div>
    </div>
  );
}