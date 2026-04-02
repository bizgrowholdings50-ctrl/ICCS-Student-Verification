"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// 🚀 1. DYNAMIC CONFIGURATION (Admin Dashboard se match karta hai)
const courseMapping = {
  "ICCS-DIS-": {
    name: "DIPLOMA IN IT SUPPORT (CPITS)",
    padding: 6,
    default: "026101"
  },
  "ICCS-SCM-": {
    name: "SUPPLY CHAIN MANAGEMENT (CPSCM)",
    padding: 5,
    default: "02601"
  }
};

export default function StaffPortal() {
  const [operator, setOperator] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPin, setAuthPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastEntry, setLastEntry] = useState(null);

  const [formData, setFormData] = useState({
    id_prefix: "",
    roll_suffix: "",
    student_name: "",
    course: "",
    session: "2025-26",
    issue_date: "",
  });

  useEffect(() => {
    const savedName = localStorage.getItem("iccs_staff_name");
    const savedPin = localStorage.getItem("iccs_staff_pin");
    if (savedName && savedPin) {
      setOperator(savedName);
      fetchLastEntry(savedName, savedPin);
    }
  }, []);

  // ✅ 2. DYNAMIC AUTO-ID FETCHING
  const fetchNextId = async (prefix) => {
    if (!prefix) return;
    const config = courseMapping[prefix];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("student")
        .select("roll_no")
        .ilike("roll_no", `${prefix}%`)
        .order("roll_no", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const lastId = data[0].roll_no;
        const lastNumberPart = lastId.split('-').pop();
        const nextNumber = parseInt(lastNumberPart, 10) + 1;
        
        const paddedNext = nextNumber.toString().padStart(config.padding, '0');
        setFormData((prev) => ({ ...prev, roll_suffix: paddedNext }));
      } else {
        setFormData((prev) => ({ ...prev, roll_suffix: config.default }));
      }
    } catch (err) {
      console.error("ID fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 3. PREFIX & COURSE AUTO-SYNC
  const handlePrefixChange = (val) => {
    const config = courseMapping[val];
    setFormData((prev) => ({ 
      ...prev, 
      id_prefix: val,
      course: config ? config.name : "" 
    }));
    if (val) fetchNextId(val);
  };

  const fetchLastEntry = async (name, pin) => {
    const uniqueID = `${name}-${pin}`;
    const { data } = await supabase
      .from("student")
      .select("*")
      .eq("added_by", uniqueID)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) setLastEntry(data);
  };

  const handleStaffAuth = async () => {
    if (!authName.trim() || authPin.length < 4) return toast.error("Enter Name & 4-Digit PIN");
    setLoading(true);
    try {
      const { data: staff } = await supabase
        .from("staff_access")
        .select("*")
        .eq("name", authName.trim())
        .eq("pin", authPin.trim())
        .maybeSingle();

      if (staff) {
        localStorage.setItem("iccs_staff_name", staff.name);
        localStorage.setItem("iccs_staff_pin", staff.pin);
        setOperator(staff.name);
        fetchLastEntry(staff.name, staff.pin);
        toast.success(`Welcome, ${staff.name}!`);
      } else {
        toast.error("Invalid Name or PIN.");
      }
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("iccs_staff_name");
    localStorage.removeItem("iccs_staff_pin");
    setOperator("");
    toast.success("Logged out");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_prefix) return toast.error("Select Prefix First");
    
    setLoading(true);
    const pin = localStorage.getItem("iccs_staff_pin");
    const fullRoll = `${formData.id_prefix}${formData.roll_suffix}`.toUpperCase();

    // Date Format: DD-MMMM-YYYY (Example: 25-February-2026)
    const dateObj = new Date(formData.issue_date);
    const formattedDate = dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }).replace(/ /g, "-");

    const { error } = await supabase.from("student").insert([{
      student_name: formData.student_name,
      course: formData.course,
      roll_no: fullRoll,
      session: formData.session,
      issue_date: formattedDate,
      added_by: `${operator}-${pin}`,
    }]);

    if (!error) {
      toast.success("Record Saved!");
      fetchLastEntry(operator, pin);
      setFormData({ ...formData, id_prefix: "", roll_suffix: "", student_name: "", course: "", issue_date: "" });
    } else {
      toast.error(error.code === "23505" ? "ID already exists!" : error.message);
    }
    setLoading(false);
  };

  if (!operator) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-4xl font-black text-[#12066a] mb-8 tracking-tighter italic uppercase underline decoration-blue-100">Staff Portal</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Full Name" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 font-bold outline-[#12066a]" />
            <input type="password" placeholder="4-Digit PIN" value={authPin} maxLength={4} onChange={(e) => setAuthPin(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 text-center tracking-[0.5em] font-black outline-[#12066a]" />
            <button onClick={handleStaffAuth} disabled={loading} className="w-full bg-[#12066a] text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">Verify & Enter</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center">
      {/* 🔵 Header Section */}
      <div className="w-full max-w-xl mb-10 flex justify-between items-center bg-slate-50 p-4 rounded-3xl border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#12066a] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">{operator[0]}</div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Operator</p>
            <h3 className="text-lg font-black text-[#12066a] leading-none">{operator}</h3>
          </div>
        </div>
        <button onClick={handleLogout} className="text-[10px] font-black text-red-500 bg-red-50 px-5 py-2 rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all">LOGOUT</button>
      </div>

      <div className="w-full max-w-xl">
        {/* 🔵 Last Entry Quick View */}
        {lastEntry && (
          <div className="mb-8 p-6 bg-[#12066a] rounded-[2.5rem] flex justify-between items-center shadow-2xl shadow-indigo-200 animate-in fade-in zoom-in-95">
            <div className="border-l-4 border-blue-400 pl-4">
              <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Your Recent Entry</p>
              <p className="text-md font-black text-white uppercase">{lastEntry.student_name}</p>
              <p className="text-[10px] font-bold text-white/60 tracking-widest">{lastEntry.roll_no}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-100 border border-slate-50">
          <div className="grid grid-cols-12 gap-3">
            <select 
              value={formData.id_prefix} 
              onChange={(e) => handlePrefixChange(e.target.value)}
              className="col-span-5 p-5 bg-blue-50 border-2 border-blue-100 rounded-3xl font-black text-[#12066a] text-[10px] outline-none cursor-pointer"
              required
            >
              <option value="">PREFIX...</option>
              {Object.keys(courseMapping).map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <input 
              type="text" 
              value={formData.roll_suffix} 
              placeholder="Auto ID" 
              readOnly 
              className="col-span-7 p-5 bg-slate-100 rounded-3xl font-black text-[#12066a] text-center cursor-not-allowed text-xl" 
            />
          </div>

          <input
            type="text" placeholder="Student Full Name" value={formData.student_name}
            onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
            className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-3xl outline-[#12066a] font-bold text-lg" required
          />

          <div className="relative">
            <input
              type="text" value={formData.course} readOnly
              placeholder="Select prefix above"
              className="w-full p-6 bg-slate-100 rounded-3xl font-black text-[#12066a] cursor-not-allowed italic text-sm" 
            />
            <div className="absolute right-6 top-6 text-[8px] font-black bg-blue-100 px-2 py-1 rounded text-blue-500 uppercase">Auto-Linked</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-3xl text-center font-black text-slate-400 border-2 border-dashed border-slate-200 flex items-center justify-center text-sm italic">{formData.session}</div>
            <input
              type="date" value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
              className="p-6 bg-slate-50 border-2 border-transparent rounded-3xl font-bold outline-[#12066a]" required
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#12066a] text-white py-7 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-indigo-100 hover:bg-black transition-all active:scale-95 disabled:bg-slate-300">
            {loading ? "SAVING RECORD..." : "SUBMIT DATA"}
          </button>
        </form>
      </div>
    </div>
  );
}