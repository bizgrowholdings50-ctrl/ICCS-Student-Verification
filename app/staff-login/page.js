"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function StaffPortal() {
  const [operator, setOperator] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPin, setAuthPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastEntry, setLastEntry] = useState(null);

  const coursesList = [
    "Diploma in Information Technology (DIT)",
    "Supply Chain Management",
  ];

  const [formData, setFormData] = useState({
    roll_no: "",
    student_name: "",
    course: "",
    session: "2025-26",
    issue_date: "",
  });

  // 1. Check Session on Load
  useEffect(() => {
    const savedName = localStorage.getItem("iccs_staff_name");
    const savedPin = localStorage.getItem("iccs_staff_pin");
    if (savedName && savedPin) {
      setOperator(savedName);
      fetchLastEntry(savedName, savedPin);
    }
  }, []);

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

  // 2. Staff Verification logic
  const handleStaffAuth = async () => {
    if (!authName.trim() || authPin.length < 4) return toast.error("Enter Name & 4-Digit PIN");
    setLoading(true);

    try {
      const { data: staff, error } = await supabase
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
        toast.error("Invalid Name or PIN. Access Denied.");
      }
    } catch (err) {
      toast.error("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("iccs_staff_name");
    localStorage.removeItem("iccs_staff_pin");
    setOperator("");
    toast.success("Logged out");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const pin = localStorage.getItem("iccs_staff_pin");
    const upperRoll = formData.roll_no.toUpperCase();

    const { data: check } = await supabase.from("student").select("roll_no").eq("roll_no", upperRoll).maybeSingle();
    if (check) {
      setLoading(false);
      return toast.error("Roll No already exists!");
    }

    const { error } = await supabase.from("student").insert([{
      ...formData,
      roll_no: upperRoll,
      added_by: `${operator}-${pin}`,
    }]);

    if (!error) {
      toast.success("Record Saved!");
      fetchLastEntry(operator, pin);
      setFormData({ ...formData, roll_no: "", student_name: "", issue_date: "" });
    }
    setLoading(false);
  };

  // --- UI SCREENS ---

  if (!operator) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-3xl font-black text-[#12066a] mb-2">Staff Login</h2>
          <p className="text-slate-400 text-xs font-bold mb-8 uppercase tracking-widest">ICCS Portal Access</p>
          <div className="space-y-4">
            <input
              type="text" placeholder="Your Full Name" value={authName}
              onChange={(e) => setAuthName(e.target.value)}
              className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100 outline-[#12066a] font-bold"
            />
            <input
              type="password" placeholder="4-Digit PIN" value={authPin} maxLength={4}
              onChange={(e) => setAuthPin(e.target.value)}
              className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center tracking-[0.5em] font-black outline-[#12066a]"
            />
            <button onClick={handleStaffAuth} disabled={loading} className="w-full bg-[#12066a] text-white py-5 rounded-3xl font-black shadow-lg">
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center">
      <div className="w-full max-w-xl mb-10 flex justify-between items-center border-b border-slate-50 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#12066a] rounded-2xl flex items-center justify-center text-white font-black">
            {operator[0]}
          </div>
          <div>
            <p className="text-[9px] text-[#997819] font-bold uppercase">Staff Member</p>
            <h3 className="text-md font-black text-[#12066a]">{operator}</h3>
          </div>
        </div>
        <button onClick={handleLogout} className="text-[12px] font-black text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl">
          Logout
        </button>
      </div>

      <div className="w-full max-w-xl">
        <h1 className="text-4xl font-black text-center text-[#12066a] mb-8 uppercase tracking-tighter">Register Student</h1>

        {lastEntry && (
          <div className="my-3 p-6 bg-[#12066a] rounded-4xl border border-slate-100 flex justify-between items-center shadow-md">
            <div>
              <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Your Last Entry</p>
              <p className="text-sm font-black text-white">{lastEntry.student_name} ({lastEntry.roll_no})</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl">
              <p className="text-[10px] font-black text-[#12066a]">{lastEntry.course}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text" placeholder="Certificate ID (e.g. ICCS-105)" value={formData.roll_no}
            onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
            className="w-full p-5 bg-slate-200 rounded-3xl border border-slate-100 outline-[#12066a] font-bold uppercase" required
          />
          <input
            type="text" placeholder="Student Name" value={formData.student_name}
            onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
            className="w-full p-5 bg-slate-200 rounded-3xl border border-slate-100 outline-[#12066a] font-bold" required
          />
          <select
            value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            className="w-full p-5 bg-slate-200 rounded-3xl border border-slate-100 font-bold outline-[#12066a]" required
          >
            <option value="">Select Course...</option>
            {coursesList.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={formData.session} className="p-5 bg-slate-100 rounded-3xl text-center font-bold text-slate-400" disabled />
            <input
              type="date" value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
              className="p-5 bg-slate-200 rounded-3xl border border-slate-100 font-bold outline-[#12066a]" required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#12066a] text-white py-6 rounded-[2.5rem] font-black text-lg shadow-xl active:scale-95 transition-all">
            {loading ? "Saving..." : "Save Record"}
          </button>
        </form>
      </div>
    </div>
  );
}