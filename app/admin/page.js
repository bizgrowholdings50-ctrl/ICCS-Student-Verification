"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ICCSAdminDashboard() {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("staff"); // "staff" or "student"
  const [adminPass, setAdminPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastEntry, setLastEntry] = useState(null);
  
  // Staff Management States
  const [staffList, setStaffList] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: "", pin: "" });

  // Student Entry States
  const coursesList = [
    "Diploma in Information Technology (DIT)", 
    "Supply Chain Management"
  ];

  const [formData, setFormData] = useState({
    roll_no: "",
    student_name: "",
    course: "",
    session: "2025-26",
    issue_date: "",
  });

  useEffect(() => {
    if (localStorage.getItem("iccs_admin_session") === "true") {
      setIsAdminAuth(true);
      refreshData();
    }
  }, []);

  const refreshData = () => {
    fetchStaffWithCounts();
    fetchAdminLastEntry();
  };

  // 1. Fetch Staff along with their entry counts
  const fetchStaffWithCounts = async () => {
    const { data: staffData } = await supabase
      .from("staff_access")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (staffData) {
      const staffWithCounts = await Promise.all(staffData.map(async (s) => {
        const uniqueID = `${s.name}-${s.pin}`;
        const { count } = await supabase
          .from("student")
          .select("*", { count: 'exact', head: true })
          .eq("added_by", uniqueID);
        return { ...s, count: count || 0 };
      }));
      setStaffList(staffWithCounts);
    }
  };

  const fetchAdminLastEntry = async () => {
    const { data } = await supabase
      .from("student")
      .select("*")
      .eq("added_by", "ADMIN-MASTER")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) setLastEntry(data);
  };

  const handleAdminLogin = (e) => {
    if (e) e.preventDefault(); // For form submission
    if (adminPass === "ICCS_ADMIN_2026") {
      localStorage.setItem("iccs_admin_session", "true");
      setIsAdminAuth(true);
      refreshData();
      toast.success("Admin Access Granted");
    } else {
      toast.error("Incorrect Password!");
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (newStaff.pin.length !== 4) return toast.error("PIN must be 4 digits");
    setLoading(true);
    const { error } = await supabase.from("staff_access").insert([newStaff]);
    if (!error) {
      toast.success("Staff Added!");
      setNewStaff({ name: "", pin: "" });
      fetchStaffWithCounts();
    }
    setLoading(false);
  };

 const handleDeleteStaff = (id) => {
    toast("Are you sure?", {
      description: "This will permanently remove staff access.",
      action: {
        label: "Remove",
        onClick: async () => {
          const { error } = await supabase.from("staff_access").delete().eq("id", id);
          if (!error) {
            fetchStaffWithCounts();
            toast.success("Staff Removed Successfully");
          } else {
            toast.error("Error removing staff");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(),
      },
    });
  };
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const upperRoll = formData.roll_no.toUpperCase();
    
    const { data: check } = await supabase.from("student").select("roll_no").eq("roll_no", upperRoll).maybeSingle();
    if (check) {
      setLoading(false);
      return toast.error(`Roll No ${upperRoll} already exists!`);
    }

    const { error } = await supabase.insert([{
      ...formData,
      roll_no: upperRoll,
      added_by: "ADMIN-MASTER"
    }]);

    if (!error) {
      toast.success("Record Saved by Admin!");
      fetchAdminLastEntry();
      setFormData({ ...formData, roll_no: "", student_name: "", issue_date: "" });
    } else {
      toast.error(error.message);
    }
    setLoading(false);
  };

  // LOGIN SCREEN (MASTER ACCESS)
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <form onSubmit={handleAdminLogin} className="w-full max-w-sm text-center">
          <h2 className="text-3xl font-black text-[#12066a] mb-6 italic tracking-tighter uppercase">Master Access</h2>
          
          {/* Hidden field for Browser Password Manager */}
          <input type="text" name="username" defaultValue="admin@iccs" className="hidden" autoComplete="username" />
          
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            className="w-full p-5 bg-slate-50 rounded-3xl mb-4 text-center border border-slate-100 outline-[#12066a] font-black tracking-[1rem] text-xl"
            autoFocus
          />
          <button type="submit" className="w-full bg-[#12066a] text-white py-5 rounded-3xl font-black shadow-lg hover:bg-[#b89146] transition-all">
            Unlock Master Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center">
      {/* TABS */}
      <div className="w-full max-w-xl flex bg-slate-100 p-2 rounded-[2.5rem] mb-10 shadow-inner">
        <button 
          onClick={() => setActiveTab("staff")}
          className={`flex-1 py-4 rounded-[2rem] font-black text-sm transition-all ${activeTab === 'staff' ? 'bg-[#12066a] text-white shadow-lg' : 'text-slate-400'}`}
        >
          Staff Management
        </button>
        <button 
          onClick={() => setActiveTab("student")}
          className={`flex-1 py-4 rounded-[2rem] font-black text-sm transition-all ${activeTab === 'student' ? 'bg-[#12066a] text-white shadow-lg' : 'text-slate-400'}`}
        >
          Student Entry
        </button>
      </div>

      <div className="w-full max-w-xl">
        {activeTab === "staff" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-black text-center text-[#12066a] mb-8 uppercase tracking-tighter">Manage Access</h1>
            
            {/* ADD STAFF FORM */}
            <form onSubmit={handleAddStaff} className="grid grid-cols-12 gap-3 mb-8">
              <input 
                type="text" placeholder="Full Name" value={newStaff.name}
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                className="col-span-7 p-4 bg-slate-100 rounded-2xl border border-slate-50 outline-[#12066a] font-bold"
                required
              />
              <input 
                type="text" placeholder="PIN" value={newStaff.pin} maxLength={4}
                onChange={(e) => setNewStaff({...newStaff, pin: e.target.value})}
                className="col-span-3 p-4 bg-slate-100 rounded-2xl border border-slate-50 text-center font-black outline-[#12066a]"
                required
              />
              <button type="submit" disabled={loading} className="col-span-2 bg-[#12066a] text-white rounded-2xl flex items-center justify-center font-black text-xl hover:bg-[#b89146] transition-all">
                {loading ? "..." : "+"}
              </button>
            </form>

            {/* STAFF LIST */}
            <div className="space-y-3">
              {staffList.map((s, index) => (
                <div key={s.id} className="p-4 bg-white border border-slate-100 rounded-3xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    {/* Numbering Starts from 1 */}
                    <div className="w-10 h-10 bg-[#12066a] rounded-xl flex items-center justify-center font-black text-white text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-black text-[#12066a] leading-tight">{s.name}</p>
                      <p className="text-[10px] font-bold text-slate-600 uppercase italic">
                        PIN: {s.pin} • {s.count} Records Added
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteStaff(s.id)} 
                    className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                  >
                    Remove 
                  </button>
                </div>
              ))}
              {staffList.length === 0 && <p className="text-center text-slate-300 py-10 font-bold">No Staff Members Found</p>}
            </div>
          </div>
        ) : (
          /* STUDENT ENTRY TAB */
          <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-black text-center text-[#12066a] mb-8 uppercase tracking-tighter">Register Student</h1>
            
            {lastEntry && (
              <div className="my-3 p-6 bg-[#12066a] rounded-4xl border border-white/10 flex justify-between items-center shadow-xl">
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Your Last Entry</p>
                  <p className="text-sm font-black text-white">{lastEntry.student_name} ({lastEntry.roll_no})</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
                  <p className="text-[10px] font-black text-white">{lastEntry.course}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Certificate ID (e.g. ICCS-105)"
                value={formData.roll_no}
                onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                className="w-full p-5 bg-slate-100 rounded-3xl border border-slate-50 outline-[#12066a] font-bold uppercase"
                required
              />
              <input
                type="text"
                placeholder="Student Name"
                value={formData.student_name}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                className="w-full p-5 bg-slate-100 rounded-3xl border border-slate-50 outline-[#12066a] font-bold"
                required
              />
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full p-5 bg-slate-100 rounded-3xl border border-slate-50 font-bold outline-[#12066a] appearance-none"
                required
              >
                <option value="">Select Course...</option>
                {coursesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-3xl text-center font-bold text-slate-400 border border-dashed border-slate-200">
                  {formData.session}
                </div>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="p-5 bg-slate-100 rounded-3xl border border-slate-50 font-bold outline-[#12066a]"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#12066a] text-white py-6 rounded-[2.5rem] font-black text-lg shadow-lg hover:bg-[#b89146] transition-all">
                {loading ? "Processing..." : "Save Record to Database"}
              </button>
            </form>
          </div>
        )}

        <button 
          onClick={() => { localStorage.removeItem("iccs_admin_session"); setIsAdminAuth(false); }}
          className="w-full mt-12 bg-[#12066a] py-6 rounded-4xl cursor-pointer text-white font-bold text-[10px] hover:bg-red-600 uppercase tracking-[0.3em] transition-all shadow-md"
        >
          Secure Logout & Lock Master Dashboard 
        </button>
      </div>
    </div>
  );
}