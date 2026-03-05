"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [rollNo, setRollNo] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!rollNo) return alert("Please enter a Roll Number");

    setLoading(true);
    setStudentData(null);

    try {
      const { data, error } = await supabase
        .from("student")
        .select("*")
        .eq("roll_no", rollNo.trim().toUpperCase())
        .single();

      if (error || !data) {
        alert("Verification failed. ICCS records do not match this ID.");
      } else {
        setStudentData({
          name: data.student_name,
          fatherName: data.father_name,
          course: data.course,
          session: data.session,
          grade: data.grade,
          id: data.roll_no,
          certificate_id: data.certificate_id,
          date_issued: data.date_issued
        });
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Technical error connecting to ICCS database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28">
        {/* Search Hero */}
        <section className="max-w-4xl mx-auto text-center px-6 mb-16">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-[#997819] bg-white rounded-full border border-blue-100 uppercase">
            Secured Verification
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#12066a] mb-6 leading-tight">
            Verify Academic <span className="bg-clip-text text-[#997819]">Credentials</span>
          </h1>

          <div className="relative max-w-2xl mx-auto group px-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#12066a] to-[#997819] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative flex flex-col md:flex-row bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
              <input
                type="text"
                className="flex-grow px-6 py-4 text-slate-800 outline-none font-medium text-center md:text-left"
                placeholder="Enter Student Enrollment No..."
                onChange={(e) => setRollNo(e.target.value)}
              />
              <button
                onClick={handleVerify}
                className="bg-[#12066a] hover:bg-[#997819] text-white px-10 py-4 rounded-xl font-bold transition-all transform active:scale-95 mt-2 md:mt-0"
              >
                {loading ? "Processing..." : "Verify Now"}
              </button>
            </div>
          </div>
        </section>

        {/* Certificate Section */}
        <div className="w-full mx-auto pb-24 print:p-0 print:m-0 flex flex-col items-center overflow-hidden">
          {studentData ? (
            <div className="relative w-full flex flex-col items-center">
              {/* Floating Print Button */}
              <button
                onClick={() => window.print()}
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] bg-[#12066a] hover:bg-[#b89146] text-white px-6 md:px-10 py-3 md:py-4 rounded-full font-black shadow-2xl transition-all transform hover:scale-105 active:scale-95 print:hidden flex items-center gap-2 text-sm md:text-base"
              >
                <span className="text-lg md:text-xl">🖨️</span> Print Official Certificate
              </button>

              {/* 📱 RESPONSIVE WRAPPER: Mobile par space khatam, Desktop par auto height */}
              <div className="w-full flex justify-center items-start pt-4 h-[380px] xs:h-[450px] sm:h-[600px] md:h-auto lg:h-auto overflow-hidden transition-all">
                <div className="origin-top scale-[0.38] xs:scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 transition-transform duration-500 shadow-2xl print:scale-100 print:shadow-none print:m-0">
                  
                  {/* Certificate Container */}
                  <div
                    id="certificate-to-print"
                    className="relative w-[900px] h-[820px] bg-white overflow-hidden flex-shrink-0"
                    style={{ fontFamily: "'Times New Roman', serif" }}
                  >
                    <img
                      src="/border.jpeg"
                      alt="Certificate Frame"
                      className="absolute inset-0 w-full h-full object-fill z-0"
                    />

                    <div className="relative z-10 h-full w-full flex flex-col items-center pt-16 px-28">
                      {/* Header */}
                      <div className="flex justify-center items-start w-full mb-8 px-8 gap-6">
                        <img src="/iccs-logo-rounded-remove.png" alt="Logo" className="w-28 object-contain" />
                        <div className="text-center mt-2">
                          <h1 className="text-[28px] font-black text-[#12066a] leading-none uppercase tracking-tighter">
                            International College of <br />
                            <span className="text-[26px]">Contemporary Sciences</span>
                          </h1>
                          <p className="text-[#b89146] italic font-extrabold text-[10px] tracking-[0.25em] mt-1">Knowledge for A Global Future</p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center mb-4">
                        <h2 className="text-[28px] font-black font-serif text-[#12066a] uppercase tracking-[0.05em]">
                          Certified Professional in <span className="text-[#997819]">{studentData.course}</span> 
                        </h2>
                        <p className="text-[#b89146] text-[20px] font-bold mt-3">This certificate is proudly awarded to</p>
                        <h2 className="text-5xl text-[#12066a] font-semibold pt-2 pb-6">{studentData.name}</h2>
                      </div>

                      <div className="relative w-full flex items-center justify-center my-4">
                        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#b89146] to-[#b89146]"></div>
                        <div className="mx-2 flex-shrink-0"><div className="w-3 h-3 bg-[#b89146] rounded-full"></div></div>
                        <div className="h-[3px] w-full bg-gradient-to-l from-transparent via-[#b89146] to-[#b89146]"></div>
                      </div>

                      <div className="text-center max-w-3xl">
                        <p className="text-[#997819] text-[22px] font-serif font-light">For successfully completing the professional certification program in</p>
                        <h4 className="text-[26px] font-black font-serif text-[#b89146] mt-2 mb-2 uppercase">{studentData.course}</h4>
                        <p className="text-black text-[15px] leading-relaxed font-light px-10">
                          This program is designed to develop practical and strategic expertise in global logistics, procurement, operations, and supply chain optimization.
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="grid grid-cols-4 w-full px-12 mt-auto pb-22 text-center items-end relative">
                        <div className="pb-2 text-left">
                          <p className="text-[10px] font-black text-[#997819]">ISSUED BY:</p>
                          <p className="font-bold text-[#12066a] text-[10px]">ICCS - International College</p>
                        </div>
                        <div className="pb-4 border-l border-black/20 flex flex-col">
                          <p className="text-[10px] font-black text-[#997819]">DATE:</p>
                          <p className="font-bold text-[#12066a] text-[11px]">{studentData.date_issued || "04/03/2026"}</p>
                        </div>
                        <div className="pb-4 border-l border-black/20 flex flex-col">
                          <p className="text-[10px] font-black text-[#997819]">ID:</p>
                          <p className="font-bold text-[#12066a] text-[11px]">{studentData.certificate_id || studentData.id}</p>
                        </div>
                        <div className="flex justify-end">
                          <div className="p-1 border border-[#b89146]/40 bg-white w-20 flex flex-col items-center">
                            <span className="text-[5px] text-[#b89146] font-bold">Scan to Verify</span>
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://iccs.uk/verify/${studentData.id}`} alt="QR" className="w-12 h-12" />
                            <span className="text-[4px] bg-[#12066a] text-white px-1 mt-1">www.iccs.uk/verify</span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-12 flex gap-8 text-[#b89146] font-bold text-[13px] uppercase">
                        <span>✓ Digitally Verifiable</span>
                        <span>✓ Industry-Oriented</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-start pt-20">
              <p className="text-[#12066a] text-xl md:text-2xl font-bold text-center px-4">
                Check Your Certificate's Authenticity with ICCS 
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}