"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
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

  // Records Manager States
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const coursesList = [
    "Diploma in IT Support (CPITS)",
    "Supply Chain Management (CPSCM)",
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
    fetchAllStudents();
  };

  const fetchStaffWithCounts = async () => {
    const { data: staffData } = await supabase
      .from("staff_access")
      .select("*")
      .order("created_at", { ascending: false });

    if (staffData) {
      const staffWithCounts = await Promise.all(
        staffData.map(async (s) => {
          const uniqueID = `${s.name}-${s.pin}`;
          const { count } = await supabase
            .from("student")
            .select("*", { count: "exact", head: true })
            .eq("added_by", uniqueID);
          return { ...s, count: count || 0 };
        })
      );
      setStaffList(staffWithCounts);
    }
  };

  const fetchAllStudents = async () => {
    const { data } = await supabase
      .from("student")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAllStudents(data);
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
      action: {
        label: "Remove",
        onClick: async () => {
          const { error } = await supabase
            .from("staff_access")
            .delete()
            .eq("id", id);
          if (!error) {
            fetchStaffWithCounts();
            toast.success("Staff Removed");
          }
        },
      },
    });
  };

  const handleDeleteStudent = (id) => {
    // Browser alert ki jagah Sonner ka action toast
    toast("Permanent Delete?", {
      description: "Are you sure you want to remove this record?",
      action: {
        label: "Delete Now",
        onClick: async () => {
          setLoading(true);
          try {
            const { error } = await supabase
              .from("student")
              .delete()
              .eq("id", Number(id));

            if (error) throw error;

            toast.success("Record removed from database");
            fetchAllStudents(); // List refresh
          } catch (err) {
            console.error("Delete Error:", err);
            toast.error("Failed to delete record");
          } finally {
            setLoading(false);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(),
      },
    });
  };

  const startEdit = (student) => {
    setEditingId(student.id);

    let formattedDateForInput = "";
    if (student.issue_date) {
      // Date string ko parse karke local timezone offset fix karna
      const dateParts = student.issue_date.split("-"); // 26-March-2026
      if (dateParts.length === 3) {
        const d = new Date(student.issue_date);

        // Manual formatting for <input type="date"> (YYYY-MM-DD)
        // Ye logic timezone shift ko ignore karke exact date pick karega
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        formattedDateForInput = `${year}-${month}-${day}`;
      }
    }

    setFormData({
      roll_no: student.roll_no,
      student_name: student.student_name,
      course: student.course,
      session: student.session || "2025-26",
      issue_date: formattedDateForInput,
    });
    setActiveTab("student");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("Ready to update details.");
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const upperRoll = formData.roll_no.toUpperCase();

    // Ensure date format is clean
    const dateObj = new Date(formData.issue_date);
    const formattedDate = dateObj
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      .replace(/ /g, "-");

    try {
      if (editingId) {
        // Log for debugging (Check console)
        console.log("Updating Record ID:", editingId);

        // Direct Object for Update - ensuring no undefined fields
        const updatePayload = {
          student_name: formData.student_name || "",
          course: formData.course || "",
          roll_no: upperRoll,
          issue_date: formattedDate,
          session: formData.session || "2025-26",
          added_by: "ADMIN-EDITED",
        };

        const { data, error, status } = await supabase
          .from("student")
          .update(updatePayload)
          .match({ id: editingId }) // .eq focus issue solve karne ke liye match use kiya
          .select();

        if (error) {
          throw error;
        }

        // Agar database response de raha hai (success)
        if (data && data.length > 0) {
          toast.success("Database Updated Successfully!");
          setEditingId(null);
          setFormData({
            roll_no: "",
            student_name: "",
            course: "",
            session: "2025-26",
            issue_date: "",
          });
          fetchAllStudents();
          setActiveTab("records");
        } else {
          // Agar database ne refresh nahi kiya (Data length 0)
          console.warn("No rows affected. Status code:", status);
          toast.error("Record not found in DB. Please refresh list.");
        }
      } else {
        // NEW ENTRY LOGIC
        const { error } = await supabase.from("student").insert([
          {
            student_name: formData.student_name,
            course: formData.course,
            roll_no: upperRoll,
            issue_date: formattedDate,
            session: formData.session,
            added_by: "ADMIN-MASTER",
          },
        ]);

        if (error) throw error;

        toast.success("New Student Saved!");
        setFormData({
          roll_no: "",
          student_name: "",
          course: "",
          session: "2025-26",
          issue_date: "",
        });
        refreshData();
      }
    } catch (err) {
      console.error("Critical Error:", err.message);
      toast.error(err.message || "Connection Error");
    } finally {
      setLoading(false);
    }
  };
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <form
          onSubmit={handleAdminLogin}
          className="w-full max-w-sm text-center"
        >
          <h2 className="text-3xl font-black text-[#12066a] mb-6 uppercase">
            Admin Access
          </h2>
          <input
            type="password"
            placeholder="Enter Password"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            className="w-full p-5 bg-slate-50 rounded-3xl mb-4 text-center border font-black text-xl"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-[#12066a] text-white py-5 rounded-3xl font-black shadow-lg"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div className="bg-[#12066a] px-4 py-2 rounded-xl text-white font-black text-[10px] uppercase italic">
          Admin Active
        </div>
        <button
          onClick={handleLogout}
          className="text-red-500 font-black text-[10px] uppercase bg-red-50 px-5 py-2 rounded-xl"
        >
          Logout
        </button>
      </div>

      <div className="w-full max-w-xl flex bg-slate-100 p-2 rounded-[2.5rem] mb-10 shadow-inner">
        <button
          onClick={() => setActiveTab("staff")}
          className={`flex-1 py-4 rounded-[2rem] font-black text-sm transition-all ${
            activeTab === "staff"
              ? "bg-[#12066a] text-white shadow-lg"
              : "text-slate-400"
          }`}
        >
          Staff Control
        </button>
        <button
          onClick={() => {
            setActiveTab("student");
            if (!editingId)
              setFormData({
                roll_no: "",
                student_name: "",
                course: "",
                session: "2025-26",
                issue_date: "",
              });
          }}
          className={`flex-1 py-4 rounded-[2rem] font-black text-sm transition-all ${
            activeTab === "student"
              ? "bg-[#12066a] text-white shadow-lg"
              : "text-slate-400"
          }`}
        >
          {editingId ? "Edit Mode" : "Student Entry"}
        </button>
        <button
          onClick={() => {
            setActiveTab("records");
            fetchAllStudents();
          }}
          className={`flex-1 py-4 rounded-[2rem] font-black text-sm transition-all ${
            activeTab === "records"
              ? "bg-[#12066a] text-white shadow-lg"
              : "text-slate-400"
          }`}
        >
          Records List
        </button>
      </div>

      <div className="w-full max-w-4xl">
        {activeTab === "staff" && (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <form
              onSubmit={handleAddStaff}
              className="grid grid-cols-12 gap-3 mb-8"
            >
              <input
                type="text"
                placeholder="Full Name"
                value={newStaff.name}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, name: e.target.value })
                }
                className="col-span-7 p-4 bg-slate-100 rounded-2xl font-bold"
                required
              />
              <input
                type="text"
                placeholder="PIN"
                value={newStaff.pin}
                maxLength={4}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, pin: e.target.value })
                }
                className="col-span-3 p-4 bg-slate-100 rounded-2xl text-center font-black"
                required
              />
              <button
                type="submit"
                className="col-span-2 bg-[#12066a] text-white rounded-2xl font-black text-xl"
              >
                +
              </button>
            </form>
            <div className="space-y-3">
              {staffList.map((s) => (
                <div
                  key={s.id}
                  className="p-4 bg-white border border-slate-100 rounded-3xl flex justify-between items-center shadow-sm"
                >
                  <div>
                    <p className="font-black text-[#12066a] leading-tight">
                      {s.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                      PIN: {s.pin} • {s.count} Records
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteStaff(s.id)}
                    className="text-red-400 font-bold text-[9px] uppercase tracking-widest px-3 py-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "student" && (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            {editingId && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 text-[10px] font-black uppercase flex justify-between items-center">
                <span>Editing Record: {formData.roll_no}</span>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      roll_no: "",
                      student_name: "",
                      course: "",
                      session: "2025-26",
                      issue_date: "",
                    });
                  }}
                  className="underline italic"
                >
                  Cancel
                </button>
              </div>
            )}
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Roll No / Certificate ID"
                value={formData.roll_no}
                onChange={(e) =>
                  setFormData({ ...formData, roll_no: e.target.value })
                }
                className="w-full p-5 bg-slate-100 rounded-3xl font-bold uppercase"
                required
              />
              <input
                type="text"
                placeholder="Student Full Name"
                value={formData.student_name}
                onChange={(e) =>
                  setFormData({ ...formData, student_name: e.target.value })
                }
                className="w-full p-5 bg-slate-100 rounded-3xl font-bold"
                required
              />
              <select
                value={formData.course}
                onChange={(e) =>
                  setFormData({ ...formData, course: e.target.value })
                }
                className="w-full p-5 bg-slate-100 rounded-3xl font-bold outline-[#12066a] appearance-none"
                required
              >
                <option value="">Select Course...</option>
                {coursesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-3xl text-center font-bold text-slate-400 border border-dashed border-slate-200">
                  {formData.session}
                </div>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) =>
                    setFormData({ ...formData, issue_date: e.target.value })
                  }
                  className="p-5 bg-slate-100 rounded-3xl border border-slate-50 font-bold outline-[#12066a] w-full"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#12066a] text-white py-6 rounded-[2.5rem] font-black text-lg shadow-lg"
              >
                {loading
                  ? "Processing..."
                  : editingId
                  ? "Update Record"
                  : "Save Record"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "records" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <input
              type="text"
              placeholder="Search by name or roll number..."
              className="w-full p-4 mb-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            />
            <div className="bg-white border border-slate-100 rounded-3xl overflow-x-auto shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-[#12066a] border-b">
                  <tr>
                    <th className="p-5">Student / ID</th>
                    <th className="p-5">Course</th>
                    <th className="p-5">Issue Date</th>
                    <th className="p-5 text-right">Added By</th>
                    <th className="p-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allStudents
                    .filter(
                      (s) =>
                        s.student_name.toLowerCase().includes(searchTerm) ||
                        s.roll_no.toLowerCase().includes(searchTerm)
                    )
                    .map((s) => (
                      <tr
                        key={s.id}
                        className="text-sm hover:bg-slate-200 transition-all font-medium"
                      >
                        <td className="p-5">
                          <p className="font-bold text-[#12066a] leading-tight">
                            {s.student_name}
                          </p>
                          <p className="text-[9px] text-slate-700 font-bold uppercase">
                            {s.roll_no}
                          </p>
                        </td>
                        <td className="p-5">
                          <span className="text-[10px] font-black uppercase text-white bg-[#12066a] px-2 py-1 inline-block whitespace-nowrap min-w-37.5 text-center rounded-md">
                            {s.course}
                          </span>
                        </td>
                        <td className="p-5 text-slate-700 font-bold text-[11px]">
                          {s.issue_date}
                        </td>
                        <td className="p-5 text-right font-black text-[9px] uppercase tracking-tighter text-slate-700">
                          {s.added_by}
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => startEdit(s)}
                              className="text-blue-500 font-black text-[10px] uppercase"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(s.id)}
                              className="text-red-400 font-black text-[10px] uppercase"
                            >
                              Del
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
