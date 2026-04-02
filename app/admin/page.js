"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// 🚀 1. DYNAMIC CONFIGURATION CENTER
// Kal ko naya course aaye toh bas yahan 1 line add karein.
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
  },
  
};

export default function ICCSAdminDashboard() {
  const router = useRouter();
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("staff");
  const [adminPass, setAdminPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastEntry, setLastEntry] = useState(null);

  const [staffList, setStaffList] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: "", pin: "" });
  const [editingStaffId, setEditingStaffId] = useState(null);

  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    id_prefix: "",
    roll_suffix: "",
    roll_no: "",
    student_name: "",
    course: "",
    session: "2025-26",
    issue_date: "",
  });

  // ✅ 2. DYNAMIC AUTO-ID FETCHING (Handles 026100 logic automatically)
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

      if (error) throw error;

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

  // ✅ 3. DYNAMIC PREFIX CHANGE
  const handlePrefixChange = (val) => {
    const config = courseMapping[val];
    setFormData((prev) => ({ 
      ...prev, 
      id_prefix: val,
      course: config ? config.name : "" 
    }));
    if (val) fetchNextId(val);
  };

  useEffect(() => {
    if (localStorage.getItem("iccs_admin_session") === "true") {
      setIsAdminAuth(true);
      refreshData();
    }
  }, []);

  const refreshData = () => {
    fetchStaffWithCounts();
    fetchAdminLastEntry();
    fetchAllStudents();
  };

  const fetchStaffWithCounts = async () => {
    const { data: staffData } = await supabase.from("staff_access").select("*").order("created_at", { ascending: false });
    if (staffData) {
      const staffWithCounts = await Promise.all(staffData.map(async (s) => {
        const uniqueID = `${s.name}-${s.pin}`;
        const { count } = await supabase.from("student").select("*", { count: "exact", head: true }).eq("added_by", uniqueID);
        return { ...s, count: count || 0 };
      }));
      setStaffList(staffWithCounts);
    }
  };

  const fetchAllStudents = async () => {
    const { data } = await supabase.from("student").select("*").order("created_at", { ascending: false });
    if (data) setAllStudents(data);
  };

  const fetchAdminLastEntry = async () => {
    const { data } = await supabase.from("student").select("*").eq("added_by", "ADMIN-MASTER").order("created_at", { ascending: false }).limit(1).maybeSingle();
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

  const handleLogout = () => {
    localStorage.removeItem("iccs_admin_session");
    setIsAdminAuth(false);
    toast.info("Logging out...");
    router.push("/");
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (newStaff.pin.length !== 4) return toast.error("PIN must be 4 digits");
    setLoading(true);
    try {
      if (editingStaffId) {
        await supabase.from("staff_access").update({ name: newStaff.name, pin: newStaff.pin }).eq("id", editingStaffId);
        setEditingStaffId(null);
        toast.success("Staff Updated!");
      } else {
        await supabase.from("staff_access").insert([newStaff]);
        toast.success("Staff Added!");
      }
      setNewStaff({ name: "", pin: "" });
      fetchStaffWithCounts();
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  const startEditStaff = (staff) => {
    setEditingStaffId(staff.id);
    setNewStaff({ name: staff.name, pin: staff.pin });
  };

  const cancelStaffEdit = () => {
    setEditingStaffId(null);
    setNewStaff({ name: "", pin: "" });
  };

  const handleDeleteStaff = (id) => {
    toast("Delete Staff Access?", {
      action: { label: "Remove", onClick: async () => {
        const { error } = await supabase.from("staff_access").delete().eq("id", id);
        if (!error) { fetchStaffWithCounts(); toast.success("Staff Removed"); }
      }},
    });
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_prefix) return toast.error("Select Certificate Prefix");

    setLoading(true);
    const fullRoll = `${formData.id_prefix}${formData.roll_suffix}`.toUpperCase();

    const dateObj = new Date(formData.issue_date);
    const formattedDate = dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }).replace(/ /g, "-");

    try {
      const payload = {
        student_name: formData.student_name,
        course: formData.course,
        roll_no: fullRoll,
        issue_date: formattedDate,
        session: formData.session,
        added_by: editingId ? "ADMIN-EDITED" : "ADMIN-MASTER",
      };

      const { error } = editingId 
        ? await supabase.from("student").update(payload).match({ id: editingId })
        : await supabase.from("student").insert([payload]);

      if (error) throw error;
      toast.success(editingId ? "Updated!" : "Saved!");
      setFormData({ id_prefix: "", roll_suffix: "", roll_no: "", student_name: "", course: "", session: "2025-26", issue_date: "" });
      setEditingId(null);
      refreshData();
    } catch (err) {
      toast.error(err.code === "23505" ? "ID already exists!" : err.message);
    } finally { setLoading(false); }
  };

  const startEdit = (student) => {
    setEditingId(student.id);
    // Find prefix from student roll_no dynamically
    const prefix = Object.keys(courseMapping).find(p => student.roll_no.startsWith(p)) || "";
    const suffix = student.roll_no.split('-').pop();

    setFormData({
      id_prefix: prefix,
      roll_suffix: suffix,
      roll_no: student.roll_no,
      student_name: student.student_name,
      course: student.course,
      session: student.session || "2025-26",
      issue_date: student.issue_date ? new Date(student.issue_date).toISOString().split('T')[0] : "",
    });
    setActiveTab("student");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteStudent = (id) => {
    toast("Permanent Delete?", {
      action: { label: "Delete Now", onClick: async () => {
        setLoading(true);
        await supabase.from("student").delete().eq("id", Number(id));
        fetchAllStudents();
        setLoading(false);
        toast.success("Record removed");
      }},
    });
  };

  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <form onSubmit={handleAdminLogin} className="w-full max-w-sm">
          <h2 className="text-3xl font-black text-[#12066a] mb-6 uppercase tracking-tighter italic underline decoration-blue-200">Admin Access</h2>
          <input type="password" placeholder="Password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="w-full p-5 bg-slate-50 rounded-3xl mb-4 text-center border-2 border-slate-100 font-black text-xl outline-[#12066a]" autoFocus />
          <button type="submit" className="w-full bg-[#12066a] text-white py-5 rounded-3xl font-black shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all">Unlock Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-10 flex flex-col items-center">
      {/* 🟢 HEADER SECTION */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 bg-slate-50 p-4 rounded-3xl border border-slate-100">
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="font-black text-[10px] uppercase italic tracking-widest text-[#12066a]">System Admin Online</div>
        </div>
        <button onClick={handleLogout} className="text-red-500 font-black text-[10px] uppercase bg-red-50 px-5 py-2 rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all">Logout</button>
      </div>

      {/* 🟢 TABS NAVIGATION */}
      <div className="w-full max-w-xl flex bg-slate-100 p-2 rounded-[2.5rem] mb-10 shadow-inner">
        {["staff", "student", "records"].map((tab) => (
          <button key={tab} onClick={() => { setActiveTab(tab); if (tab === "records") fetchAllStudents(); }} className={`flex-1 py-4 rounded-[2rem] font-black text-[10px] uppercase transition-all ${activeTab === tab ? "bg-[#12066a] text-white shadow-lg shadow-indigo-200" : "text-slate-400 hover:text-slate-600"}`}>
            {tab === "student" && editingId ? "Editing" : tab === "staff" ? "Staff" : tab === "student" ? "Entry" : "List"}
          </button>
        ))}
      </div>

      <div className="w-full max-w-4xl">
        {/* 🟢 STAFF MANAGEMENT TAB */}
        {activeTab === "staff" && (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <form onSubmit={handleAddStaff} className="grid grid-cols-12 gap-3 mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
              <input type="text" placeholder="Full Name" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} className="col-span-6 p-4 bg-slate-50 rounded-2xl font-bold border border-transparent focus:border-indigo-100 outline-none" required />
              <input type="text" placeholder="PIN" value={newStaff.pin} maxLength={4} onChange={(e) => setNewStaff({ ...newStaff, pin: e.target.value })} className="col-span-3 p-4 bg-slate-50 rounded-2xl text-center font-black border border-transparent focus:border-indigo-100 outline-none" required />
              <button type="submit" className={`col-span-3 text-white rounded-2xl font-black transition-all ${editingStaffId ? 'bg-blue-600' : 'bg-[#12066a] hover:bg-black'}`}>{editingStaffId ? "SAVE" : "+"}</button>
            </form>
            <div className="space-y-3">
              {staffList.map((s) => (
                <div key={s.id} className="p-5 bg-white border border-slate-100 rounded-[2rem] flex justify-between items-center shadow-sm hover:shadow-md transition-all group">
                  <div>
                    <p className="font-black text-[#12066a] text-lg">{s.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">PIN: {s.pin} • Total {s.count} Students Added</p>
                  </div>
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditStaff(s)} className="text-blue-500 font-bold text-[9px] uppercase tracking-widest border-b border-blue-100">Edit</button>
                    <button onClick={() => handleDeleteStaff(s.id)} className="text-red-400 font-bold text-[9px] uppercase tracking-widest border-b border-red-100">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🟢 STUDENT ENTRY TAB */}
        {activeTab === "student" && (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <form onSubmit={handleStudentSubmit} className="space-y-4 bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-50">
              <div className="grid grid-cols-12 gap-3">
                <select 
                  value={formData.id_prefix} 
                  onChange={(e) => handlePrefixChange(e.target.value)}
                  className="col-span-5 p-5 bg-blue-50 border-2 border-blue-100 rounded-3xl font-black text-[#12066a] outline-none text-[10px] appearance-none cursor-pointer"
                  required
                >
                  <option value="">PREFIX...</option>
                  {Object.keys(courseMapping).map((prefix) => (
                    <option key={prefix} value={prefix}>{prefix}</option>
                  ))}
                </select>

                <input type="text" value={formData.roll_suffix} readOnly className="col-span-7 p-5 bg-slate-200 rounded-3xl font-black text-[#12066a] cursor-not-allowed text-center text-xl tracking-tighter" />
              </div>

              <input type="text" placeholder="Student Full Name" value={formData.student_name} onChange={(e) => setFormData({ ...formData, student_name: e.target.value })} className="w-full p-6 bg-slate-50 rounded-3xl font-bold border-2 border-transparent focus:border-indigo-100 outline-none text-lg" required />
              
              <div className="relative">
                <input type="text" value={formData.course} readOnly placeholder="Course will auto-select" className="w-full p-6 bg-slate-100 rounded-3xl font-black text-[#12066a] cursor-not-allowed italic text-sm border-2 border-slate-50" />
                <div className="absolute right-6 top-6 text-[8px] font-black bg-indigo-100 px-2 py-1 rounded text-indigo-500 uppercase">Auto-Locked</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl text-center font-black text-slate-400 border-2 border-dashed border-slate-200 flex items-center justify-center italic text-sm">{formData.session}</div>
                <input type="date" value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} className="p-6 bg-slate-50 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 w-full" required />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#12066a] text-white py-7 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-black transition-all active:scale-95 disabled:bg-slate-300">
                {loading ? "SAVING DATA..." : editingId ? "UPDATE RECORD" : "SAVE STUDENT"}
              </button>
            </form>
          </div>
        )}

        {/* 🟢 RECORDS LIST TAB */}
        {activeTab === "records" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="relative mb-8">
              <input type="text" placeholder="Search by name or roll number..." className="w-full p-6 pl-14 bg-white border-2 border-slate-100 rounded-[2rem] font-bold shadow-sm outline-none focus:border-indigo-200 transition-all text-lg" onChange={(e) => setSearchTerm(e.target.value.toLowerCase())} />
              <div className="absolute left-6 top-7 text-slate-300">🔍</div>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-50">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-[#12066a] border-b">
                    <tr>
                      <th className="p-6">Student / ID</th>
                      <th className="p-6">Course</th>
                      <th className="p-6">Issue Date</th>
                      <th className="p-6 text-right">Added By</th>
                      <th className="p-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allStudents.filter(s => s.student_name.toLowerCase().includes(searchTerm) || s.roll_no.toLowerCase().includes(searchTerm)).map((s) => (
                      <tr key={s.id} className="text-sm hover:bg-blue-50/30 transition-all font-medium group">
                        <td className="p-6">
                          <p className="font-black text-[#12066a] text-lg leading-tight">{s.student_name}</p>
                          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{s.roll_no}</p>
                        </td>
                        <td className="p-6">
                          <span className="text-[9px] font-black uppercase text-white bg-[#12066a] px-4 py-2 rounded-xl inline-block shadow-sm">{s.course}</span>
                        </td>
                        <td className="p-6 text-slate-500 font-bold text-[12px] italic">{s.issue_date}</td>
                        <td className="p-6 text-right font-black text-[9px] uppercase text-slate-600">{s.added_by}</td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(s)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all">Edit</button>
                            <button onClick={() => handleDeleteStudent(s.id)} className="bg-red-50 text-red-400 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all">Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}