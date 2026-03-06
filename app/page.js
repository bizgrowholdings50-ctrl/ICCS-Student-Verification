"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";

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
          course: data.course,
          id: data.roll_no,
          certificate_id: data.certificate_id,
          date_issued: data.date_issued,
        });
      }
    } catch (err) {
      alert("Technical error.");
    } finally {
      setLoading(false);
    }
  };

  const getCourseDescription = (courseName) => {
    const course = courseName?.toLowerCase() || "";
    if (course.includes("it support") || course.includes("computer") || course.includes("ai")) {
      return "This program is designed to develop technical proficiency in digital systems, emerging technologies, and computational problem-solving.";
    }
    return "This program is designed to develop practical and strategic expertise in professional operations.";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 🧠 SMART PRINT CSS: Isko mat chheriye ga, yehi asli magic hai */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #certificate-container, #certificate-container * { visibility: visible; }
          #certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          @page { size: A4 landscape; margin: 0; }
          div { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <Navbar />

      <main className="flex-grow pt-28">
        <section className="max-w-4xl mx-auto text-center px-6 mb-16">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-[#997819] bg-white rounded-full border border-blue-100 uppercase">
            Secured Verification
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#12066a] mb-6 leading-tight">
            Verify Academic <span className="text-[#997819]">Credentials</span>
          </h1>

          <div className="relative max-w-2xl mx-auto group px-4">
            <div className="relative flex flex-col md:flex-row bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
              <input
                type="text"
                className="flex-grow px-6 py-4 outline-none font-medium"
                placeholder="Enter Student Enrollment No..."
                onChange={(e) => setRollNo(e.target.value)}
              />
              <button
                onClick={handleVerify}
                className="bg-[#12066a] hover:bg-[#997819] text-white px-10 py-4 rounded-xl font-bold transition-all"
              >
                {loading ? "Processing..." : "Verify Now"}
              </button>
            </div>
          </div>
        </section>

        <div className="w-full mx-auto pb-24 flex flex-col items-center overflow-hidden">
          {studentData ? (
            <div className="relative w-full flex flex-col items-center">
              
                           {/* Floating Print Button */}
              <button
                onClick={() => window.print()}
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] bg-[#12066a] hover:bg-[#b89146] text-white px-6 md:px-10 py-3 md:py-4 rounded-full font-black shadow-2xl transition-all transform hover:scale-105 active:scale-95 print:hidden flex items-center gap-2 text-sm md:text-base"
              >
                <span className="text-lg md:text-xl">🖨️</span> Print Official Certificate
              </button>


              {/* 📱 Original Responsive Wrapper */}
              <div className="w-full flex justify-center items-start pt-4 h-[380px] xs:h-[450px] sm:h-[600px] md:h-auto lg:h-auto overflow-hidden transition-all">
                <div 
                  id="certificate-container"
                  className="origin-top scale-[0.38] xs:scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 transition-transform duration-500 shadow-2xl"
                >
                  {/* --- YOUR ORIGINAL DESIGN --- */}
                  <div
                    className="relative bg-white flex-shrink-0"
                    style={{
                      width: "900px",
                      height: "820px",
                      fontFamily: "'Times New Roman', serif",
                    }}
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
                          <p className="text-[#b89146] italic font-extrabold text-[10px] tracking-[0.25em] mt-1">
                            Knowledge for A Global Future
                          </p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center mb-4">
                        <h2 className="text-[28px] font-black font-serif text-[#12066a] uppercase tracking-[0.05em]">
                          Certified Professional in <span className="text-[#997819]">{studentData.course}</span>
                        </h2>
                        <p className="text-[#b89146] text-[20px] font-bold mt-3">This certificate is proudly awarded to</p>
                        <h2 className="text-4xl text-[#12066a] font-semibold pt-2 pb-6">{studentData.name}</h2>
                      </div>

                      {/* Decorative Line 1 */}
                      <div className="relative w-full flex items-center justify-center -mt-6 mb-10">
                        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#b89146] to-[#b89146]"></div>
                        <div className="mx-2 flex-shrink-0"><div className="w-3 h-3 bg-[#b89146] rounded-full"></div></div>
                        <div className="h-[3px] w-full bg-gradient-to-l from-transparent via-[#b89146] to-[#b89146]"></div>
                      </div>

                      <div className="text-center max-w-3xl">
                        <p className="text-[#997819] text-[22px] font-serif font-light">For successfully completing the professional certification program in</p>
                        <h4 className="text-[26px] font-black font-serif text-[#b89146] mt-2 mb-2 uppercase">{studentData.course}</h4>
                        <p className="text-black text-[15px] leading-relaxed font-light px-10">{getCourseDescription(studentData.course)}</p>
                      </div>

                      {/* Decorative Line 2 */}
                      <div className="relative w-full flex items-center justify-center mt-15">
                        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#b89146] to-[#b89146]"></div>
                        <div className="mx-2 flex-shrink-0"><div className="w-3 h-3 bg-[#b89146] rounded-full"></div></div>
                        <div className="h-[3px] w-full bg-gradient-to-l from-transparent via-[#b89146] to-[#b89146]"></div>
                      </div>

                      {/* Footer Grid */}
                      <div className="grid grid-cols-4 w-full px-12 mt-auto pb-22 text-center items-end relative">
                        <div className="pb-4 text-left">
                          <p className="text-[12px] font-black text-[#997819]">ISSUED BY:</p>
                          <p className="font-bold text-[#12066a] text-[11px]">ICCS - International College</p>
                        </div>
                        <div className="pb-4 border-l-3 border-black/40 flex flex-col">
                          <p className="text-[12px] font-black text-[#997819]">DATE:</p>
                          <p className="font-bold text-[#12066a] text-[11px]">{studentData.date_issued || "04/03/2026"}</p>
                        </div>
                        <div className="pb-4 border-l-3 border-black/40 flex flex-col">
                          <p className="text-[12px] font-black text-[#997819]">ID:</p>
                          <p className="font-bold text-[#12066a] text-[11px]">{studentData.id}</p>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                            <QRCodeSVG value={`https://iccs-student-verification.vercel.app/verify/${studentData.id}`} size={80} level={"H"} />
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-12 flex gap-8 text-[#b89146] font-bold text-[13px] uppercase">
                        <span>✓ Digitally Verifiable</span>
                        <span>✓ Industry-Oriented Certification</span>
                      </div>
                    </div>
                  </div>
                  {/* --- END ORIGINAL DESIGN --- */}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-start pt-20">
              <p className="text-[#12066a] text-xl font-bold">Check Your Certificate's Authenticity with ICCS</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}