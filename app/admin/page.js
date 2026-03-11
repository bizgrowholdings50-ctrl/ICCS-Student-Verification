"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"; // Navigation ke liye
import { toast } from "sonner";

export default function ICCSAdminDashboard() {
  const router = useRouter();
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("staff");
  const [adminPass, setAdminPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastEntry, setLastEntry] = useState(null);
  
  const [staffList, setStaffList] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: "", pin: "" });

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
    if (e) e.preventDefault();
    if (adminPass === "ICCS_ADMIN_2026") {
      localStorage.setItem("iccs_admin_session", "true");
      setIsAdminAuth(true);
      refreshData();
      toast.success("Admin Access Granted");
    } else {
      toast.error("Incorrect Password!");
    }
  };

  // Logout and Redirect to Homepage
  const handleLogout = () => {
    localStorage.removeItem("iccs_admin_session");
    setIsAdminAuth(false);
    toast.info("Logging out...");
    router.push("/"); // Redirect to homepage
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
    toast("Delete Staff Access?", {
      description: "Are you sure? This cannot be undone.",
      action: {
        label: "Remove",
        onClick: async () => {
          const { error } = await supabase.from("staff_access").delete().eq("id", id);
          if (!error) {
            fetchStaffWithCounts();
            toast.success("Staff Removed Successfully");
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => toast.dismiss() },
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

    const { error } = await supabase.from("student").insert([{
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

  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <form onSubmit={handleAdminLogin} className="w-full max-w-sm text-center">
          <h2 className="text-3xl font-black text-[#12066a] mb-6 italic tracking-tighter uppercase">Master Access</h2>
          <input
            type="password"
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
      {/* HEADER WITH LOGOUT */}
      <div className="w-full max-w-xl flex justify-between items-center mb-8">
        <div className="bg-[#12066a] px-4 py-2 rounded-xl">
           <span className="text-white font-black text-[10px] uppercase italic">Admin Active</span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-red-500 font-black text-[10px] uppercase tracking-widest bg-red-50 px-5 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
        >
          Logout
        </button>
      </div>

      {/* TABS */}
      <div className="w-full max-w-xl flex bg-slate-100 p-2 rounded-[2.5rem] mb-10 shadow-inner">
        <button onClick={() => setActiveTab("staff")} className={`flex-1 py-4 rounded-[2rem] font-black text-sm transition-all ${activeTab === 'staff' ? 'bg-[#12066a] text-white shadow-lg' : 'text-slate-400'}`}>
          Staff Control
        </button>
        <button onClick={() => setActiveTab("student")} className={`flex-1 py-4 rounded-[2rem] font-black text-sm transition-all ${activeTab === 'student' ? 'bg-[#12066a] text-white shadow-lg' : 'text-slate-400'}`}>
          Student Entry
        </button>
      </div>

      <div className="w-full max-w-xl">
        {activeTab === "staff" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleAddStaff} className="grid grid-cols-12 gap-3 mb-8">
              <input type="text" placeholder="Full Name" value={newStaff.name} onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} className="col-span-7 p-4 bg-slate-100 rounded-2xl border border-slate-50 outline-[#12066a] font-bold" required />
              <input type="text" placeholder="PIN" value={newStaff.pin} maxLength={4} onChange={(e) => setNewStaff({...newStaff, pin: e.target.value})} className="col-span-3 p-4 bg-slate-100 rounded-2xl border border-slate-50 text-center font-black outline-[#12066a]" required />
              <button type="submit" disabled={loading} className="col-span-2 bg-[#12066a] text-white rounded-2xl flex items-center justify-center font-black text-xl">
                +
              </button>
            </form>

            <div className="space-y-3">
              {staffList.map((s, index) => (
                <div key={s.id} className="p-4 bg-white border border-slate-100 rounded-3xl flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#12066a] rounded-xl flex items-center justify-center font-black text-white text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-black text-[#12066a] leading-tight">{s.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                        PIN: {s.pin} • {s.count} Records
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteStaff(s.id)} className="text-red-400 font-bold text-[9px] uppercase tracking-widest hover:text-red-600 px-3 py-1">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {lastEntry && (
              <div className="mb-6 p-6 bg-[#12066a] rounded-4xl border border-white/10 flex justify-between items-center shadow-xl">
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Last Admin Entry</p>
                  <p className="text-sm font-black text-white">{lastEntry.student_name} ({lastEntry.roll_no})</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-xl">
                  <p className="text-[10px] font-black text-white uppercase">{lastEntry.course}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <input type="text" placeholder="Certificate ID (ICCS-105)" value={formData.roll_no} onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })} className="w-full p-5 bg-slate-100 rounded-3xl border border-slate-50 outline-[#12066a] font-bold uppercase" required />
              <input type="text" placeholder="Student Name" value={formData.student_name} onChange={(e) => setFormData({ ...formData, student_name: e.target.value })} className="w-full p-5 bg-slate-100 rounded-3xl border border-slate-50 outline-[#12066a] font-bold" required />
              <select value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })} className="w-full p-5 bg-slate-100 rounded-3xl border border-slate-50 font-bold outline-[#12066a] appearance-none" required>
                <option value="">Select Course...</option>
                {coursesList.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-3xl text-center font-bold text-slate-400 border border-dashed border-slate-200">{formData.session}</div>
                <input type="date" value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} className="p-5 bg-slate-100 rounded-3xl border border-slate-50 font-bold outline-[#12066a]" required />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#12066a] text-white py-6 rounded-[2.5rem] font-black text-lg shadow-lg hover:bg-[#b89146] transition-all">
                {loading ? "Saving..." : "Save to Database"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}