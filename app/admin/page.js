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

  // Staff Identity States
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
    if (localStorage.getItem("iccs_admin_session") === "true") setIsAdminAuth(true);
    const savedName = localStorage.getItem("iccs_staff_name");
    const savedPin = localStorage.getItem("iccs_staff_pin");
    if (savedName && savedPin) {
      setOperator(savedName);
      fetchLastEntry(savedName, savedPin);
    }
  }, []);

  // --- 1. ADMIN LOCK ---
  const handleAdminLogin = () => {
    if (adminPass === "ICCS_ADMIN_2026") {
      localStorage.setItem("iccs_admin_session", "true");
      setIsAdminAuth(true);
      toast.success("Admin Access Granted");
    } else {
      toast.error("Incorrect Password!");
    }
  };

  // --- 2. STAFF VERIFICATION (UPSERT LOGIC) ---
  const handleStaffAuth = async () => {
  if (!authName.trim() || authPin.length < 4) return toast.error("Enter Name & 4-Digit PIN");
  setLoading(true);
  
  try {
    // 1. Upsert (Update or Insert):
    // Agar Name-PIN nahi milta, toh ye NAYA create kar dega (1st time staff)
    // Agar Name-PIN mil jata hai, toh ye purane ko hi SELECT kar lega (Verification)
    const { data, error } = await supabase
      .from("staff_access")
      .upsert(
        { name: authName.trim(), pin: authPin.trim() }, 
        { onConflict: 'name, pin' } 
      )
      .select()
      .single();

    if (error) throw error;

    // 2. Local session save karein
    localStorage.setItem("iccs_staff_name", data.name);
    localStorage.setItem("iccs_staff_pin", data.pin);
    
    setOperator(data.name);
    fetchLastEntry(data.name, data.pin);
    
    toast.success(data.created_at === data.updated_at ? "New Staff Registered!" : "Welcome Back!");
  } catch (err) {
    toast.error("Access Denied: " + err.message);
  } finally {
    setLoading(false);
  }
};

  const fetchLastEntry = async (name, pin) => {
    const uniqueID = `${name}-${pin}`; // Unique track
    const { data } = await supabase.from("student").select("*").eq("added_by", uniqueID).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (data) setLastEntry(data);
  };

  // --- 3. DATA SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const pin = localStorage.getItem("iccs_staff_pin");
    try {
      const { error } = await supabase.from("student").insert([{
        ...formData,
        roll_no: formData.roll_no.toUpperCase(),
        added_by: `${operator}-${pin}` // Records unique per staff
      }]);
      if (error) throw error;
      toast.success("Record Saved!");
      fetchLastEntry(operator, pin);
      setFormData({ ...formData, roll_no: "", student_name: "", issue_date: "" });
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  // --- UI (PURE WHITE DESIGN) ---

  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-3xl font-black text-[#12066a] mb-2">ICCS Admin</h2>
          <input type="password" placeholder="Master Password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="w-full p-5 bg-slate-50 rounded-3xl mb-4 text-center border border-slate-100 outline-[#12066a] font-bold" />
          <button onClick={handleAdminLogin} className="w-full bg-[#12066a] text-white py-5 rounded-3xl font-black">Unlock Dashboard</button>
        </div>
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-black text-[#12066a] mb-6 text-center italic">Staff Identity</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Full Name" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100 outline-[#12066a]" />
            <input type="password" placeholder="4-Digit PIN" value={authPin} onChange={(e) => setAuthPin(e.target.value)} maxLength={4} className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center tracking-widest outline-[#12066a]" />
            <button onClick={handleStaffAuth} disabled={loading} className="w-full bg-[#12066a] text-white py-5 rounded-3xl font-bold">{loading ? "Verifying..." : "Verify & Start"}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center">
       <div className="w-full max-w-xl mb-10 flex justify-between items-center border-b border-slate-50 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-[#12066a] font-black border border-slate-200">{operator[0]}</div>
            <div><p className="text-[9px] text-slate-400 font-bold uppercase">Active Staff</p><h3 className="text-md font-black text-[#12066a]">{operator}</h3></div>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-[10px] font-black text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl">Logout</button>
       </div>

       <div className="w-full max-w-xl">
          <h1 className="text-3xl font-black text-[#12066a] mb-8">Register Student</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="text" placeholder="Roll No (e.g. ICCS-105)" value={formData.roll_no} onChange={(e) => setFormData({...formData, roll_no: e.target.value})} className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100 outline-[#12066a] font-bold" required />
            <input type="text" placeholder="Student Name" value={formData.student_name} onChange={(e) => setFormData({...formData, student_name: e.target.value})} className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100 outline-[#12066a]" required />
            <select value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100" required>
              <option value="">Select Course...</option>
              {coursesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={formData.session} className="p-5 bg-slate-50 rounded-3xl text-center font-bold" disabled />
              <input type="date" value={formData.issue_date} onChange={(e) => setFormData({...formData, issue_date: e.target.value})} className="p-5 bg-slate-50 rounded-3xl border border-slate-100" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#12066a] text-white py-6 rounded-[2rem] font-black text-lg">Save Record</button>
          </form>

          {lastEntry && (
            <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center">
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Your Last Entry</p>
                  <p className="text-sm font-black text-[#12066a]">{lastEntry.student_name} ({lastEntry.roll_no})</p>
               </div>
               <div className="bg-white px-4 py-2 rounded-xl border border-slate-100"><p className="text-[10px] font-black text-[#12066a]">{lastEntry.course}</p></div>
            </div>
          )}
       </div>
    </div>
  );
}