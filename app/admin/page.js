"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ICCSAdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [operator, setOperator] = useState("");
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [lastEntry, setLastEntry] = useState(null); // 🕒 Last entry state

  // Auth States
  const [authName, setAuthName] = useState("");
  const [authPin, setAuthPin] = useState("");

  // Course Map
  const coursesList = [
    "Diploma in Information Technology (DIT)",
    "Graphic Designing",
    "Web Development",
    "Digital Marketing",
    "Cyber Security",
    "Supply Chain Management",
    "Blockchain Technology"
  ];

  const [formData, setFormData] = useState({
    roll_no: "",
    student_name: "",
    course: "",
    session: "2025-26",
    issue_date: "",
  });

  // 1. Check Session & Fetch Last Entry
  useEffect(() => {
    const savedOperator = localStorage.getItem("iccs_staff_name");
    if (savedOperator) {
      setOperator(savedOperator);
      fetchLastEntry(savedOperator);
    } else {
      setShowIdentityModal(true);
    }
  }, []);

  // 🔍 Fetch only this operator's last record
  const fetchLastEntry = async (name) => {
    const { data } = await supabase
      .from("student")
      .select("*")
      .eq("added_by", name)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data) setLastEntry(data);
  };

  const handleAuth = async () => {
    if (!authName.trim() || authPin.length < 4) return toast.error("Complete all fields!");
    setLoading(true);
    try {
      const { data: user } = await supabase.from("staff_access").select("*").eq("name", authName.trim()).maybeSingle();
      if (user) {
        if (user.pin === authPin.trim()) { 
          loginUser(user.name); 
        } else { 
          toast.error("Invalid Name or PIN!");
        }
      } else {
        await supabase.from("staff_access").insert([{ name: authName.trim(), pin: authPin.trim() }]);
        loginUser(authName.trim());
      }
    } catch (err) { toast.error("Error: " + err.message); } finally { setLoading(false); }
  };

  const loginUser = (name) => {
    localStorage.setItem("iccs_staff_name", name);
    setOperator(name);
    setShowIdentityModal(false);
    fetchLastEntry(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("student").insert([{
        ...formData,
        roll_no: formData.roll_no.toUpperCase(),
        added_by: operator // Tracks operator
      }]);
      if (error) throw error;
      
      toast.success("Record Saved!");
      fetchLastEntry(operator); // Refresh last entry after save
      setFormData({ roll_no: "", student_name: "", course: "", session: "2025-26", issue_date: "" });
    } catch (err) { toast.error("DB Error: " + err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
      
      {/* 🟢 HEADER */}
      {!showIdentityModal && (
        <div className="w-full max-w-xl mb-6 flex items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#12066a] rounded-xl flex items-center justify-center text-white font-black shadow-lg">
              {operator ? operator[0].toUpperCase() : "U"}
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Active Operator</p>
              <h3 className="text-sm font-black text-[#12066a]">{operator}</h3>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            
             <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
        </div>
      )}

      {/* 🟢 MAIN FORM */}
      <div className={`bg-white p-10 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-xl w-full transition-all duration-700 ${showIdentityModal ? "blur-xl scale-95" : "blur-0"}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#12066a]">Add Student</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">ICCS Digital Record Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
         {/* 🕒 LAST ENTRY PREVIEW */}
        {lastEntry && (
          <div className="mt-8 pt-6 border-t border-slate-50">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Your Last Entry</p>
             <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                <div>
                   <p className="text-[12px] font-black text-[#12066a]">{lastEntry.student_name}</p>
                   <p className="text-[11px] font-bold text-slate-600">{lastEntry.roll_no}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-[#997819]">{lastEntry.course}</p>
                   <p className="text-[9px] font-medium text-green-600 italic">Success</p>
                </div>
             </div>
          </div>
        )}
          <div className="space-y-1">
            
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Certificate ID (Roll No)</label>
            <input type="text" placeholder="e.g. ICCS-010" value={formData.roll_no} onChange={(e) => setFormData({...formData, roll_no: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#12066a] outline-none font-medium text-[#12066a]" required />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Student Name</label>
            <input type="text" placeholder="Enter Name..." value={formData.student_name} onChange={(e) => setFormData({...formData, student_name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#12066a] outline-none font-medium text-[#12066a]" required />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Course</label>
            <select value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#12066a] outline-none font-medium text-[#12066a] appearance-none cursor-pointer" required>
              <option value="">Select Course...</option>
              {coursesList.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Session</label>
              <input type="text" value={formData.session} onChange={(e) => setFormData({...formData, session: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-center font-black text-[#12066a]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Issue Date</label>
              <input type="date" value={formData.issue_date} onChange={(e) => setFormData({...formData, issue_date: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium text-[#12066a]" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#12066a] text-white py-5 rounded-[1.8rem] font-bold text-lg hover:shadow-lg transition-all active:scale-95">
            {loading ? "Registering..." : "Register Student Record"}
          </button>
        </form>

        
      </div>

      {/* 🛡️ IDENTITY GATE MODAL */}
      {showIdentityModal && (
        <div className="fixed inset-0 z-50 bg-[#000B25]/30 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-xs w-full text-center border border-white">
            <h2 className="text-2xl font-black text-[#12066a] mb-6 tracking-tight italic">Identity Gate</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-2xl text-center outline-none border border-slate-100 focus:border-[#12066a] text-[#12066a] font-bold" value={authName} onChange={(e) => setAuthName(e.target.value)} />
              <input type="password" placeholder="4-Digit PIN" className="w-full p-4 bg-slate-50 rounded-2xl text-center tracking-[0.5em] outline-none border border-slate-100 focus:border-[#12066a] text-[#12066a] font-black" value={authPin} onChange={(e) => setAuthPin(e.target.value)} maxLength={4} />
              <button onClick={handleAuth} className="w-full bg-[#12066a] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all">Unlock Access</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}