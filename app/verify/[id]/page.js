"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { QRCodeSVG } from "qrcode.react";

export default function VerifyStudent() {
  const { id } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data, error } = await supabase
          .from("student")
          .select("*")
          .eq("roll_no", id.toUpperCase())
          .single();

        if (data) {
          setStudentData({
            name: data.student_name,
            course: data.course,
            id: data.roll_no,
            date_issued: data.issue_date || data.date_issued,
          });
        }
      } catch (err) {
        console.error("Verification Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudent();
  }, [id]);

  const getCourseDescription = (courseName) => {
    const course = courseName?.toLowerCase() || "";

    // 1. IT Support (DITS)
    if (course.includes("it support") || course.includes("dits")) {
      return (
        <span>
          This diploma is awarded in recognition of the successful completion of
          the six-month <strong>Diploma in IT Support (DITS)</strong>,
          demonstrating professional knowledge in computer systems, technical
          troubleshooting, network support, software installation, and IT
          service management.
        </span>
      );
    }

    // 2. Supply Chain Management (DSCM)
    if (course.includes("supply chain") || course.includes("dscm")) {
      return (
        <span>
          This diploma is awarded in recognition of the successful completion of
          the six-month{" "}
          <strong>Diploma in Supply Chain Management (DSCM)</strong>,
          demonstrating professional knowledge in global logistics, procurement,
          operations, and supply chain optimisation.
        </span>
      );
    }

    // 3. Digital Marketing (Optional - Professional backup)
    if (course.includes("marketing") || course.includes("digital")) {
      return (
        <span>
          This diploma is awarded in recognition of the successful completion of
          the six-month <strong>Diploma in Digital Marketing</strong>,
          demonstrating professional expertise in SEO, social media strategy,
          content creation, and digital analytics.
        </span>
      );
    }

    // Default Professional Line
    return (
      <span>
        This certificate is awarded in recognition of the successful completion
        of the prescribed professional program, demonstrating competence in
        industry-standard practices and specialized knowledge within the field
        of <strong>{courseName}</strong>.
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse font-bold text-[#12066a] text-xl tracking-tighter uppercase italic">
          Verifying ICCS Digital Records...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-10 flex flex-col items-center">
        {studentData ? (
          <div className="w-full flex flex-col items-center px-4 pb-20">
            {/* Verification Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-2 mb-8 bg-green-100 text-green-800 rounded-full border border-green-200 shadow-sm animate-bounce">
              <span className="text-lg">✓</span>
              <span className="font-bold tracking-wide uppercase text-sm">
                Officially Verified by ICCS
              </span>
            </div>

            {/* RESPONSIVE SCALING LOGIC */}
            <div className="w-full flex justify-center items-start h-[380px] xs:h-[450px] sm:h-[600px] md:h-auto lg:h-auto overflow-hidden transition-all">
              <div className="origin-top scale-[0.38] xs:scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 transition-transform duration-500 shadow-2xl">
                {/* --- EXACT ORIGINAL CERTIFICATE DESIGN --- */}
                <div
                  id="certificate-container"
                  className="relative bg-white shrink-0 overflow-hidden"
                  style={{
                    width: "900px",
                    height: "700px",
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
                      <img
                        src="/iccs-logo-rounded-remove.png"
                        alt="Logo"
                        className="w-28 object-contain"
                      />
                      <div className="text-center mt-2">
                        <h1 className="text-[28px] font-black font-serif text-[#12066a] leading-none tracking-tighter">
                          International College of <br />
                          <span className="text-[26px]">
                            Contemporary Sciences
                          </span>
                        </h1>
                        <p className="text-[#b89146]  font-extrabold text-[12px] border-t border-black tracking-[0.25em] mt-1">
                          Knowledge for A Global Future
                        </p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="text-center mb-4">
                      <h2 className="text-[29px] font-black text-[#997819] tracking-[0.03em] uppercase italic">
                        Certified Professional in {studentData.course}
                      </h2>
                      <p className="text-[#997819] text-[27px] font-black italic">
                        This diploma is proudly awarded to
                      </p>
                      <h2 className="text-4xl text-[#12066a] font-semibold font-serif pt-6 pb-1">
                        {studentData.name}
                      </h2>
                    </div>

                    {/* Decorative Line 1 */}
                    <div className="relative w-full flex items-center justify-center -mt-4 mb-4">
                      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#b89146] to-[#b89146]"></div>
                      <div className="mx-2 flex-shrink-0">
                        <div className="w-3 h-3 bg-[#b89146] rounded-full"></div>
                      </div>
                      <div className="h-[3px] w-full bg-gradient-to-l from-transparent via-[#b89146] to-[#b89146]"></div>
                    </div>

                    <div className="text-center max-w-4xl">
                      <p className="text-black text-[17px] leading-relaxed font-light px-10 italic">
                        {getCourseDescription(studentData.course)}
                      </p>
                    </div>

                    {/* Decorative Line 2 */}
                    <div className="relative w-full flex items-center justify-center mt-4">
                      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#b89146] to-[#b89146]"></div>
                      <div className="mx-2 flex-shrink-0">
                        <div className="w-3 h-3 bg-[#b89146] rounded-full"></div>
                      </div>
                      <div className="h-[3px] w-full bg-gradient-to-l from-transparent via-[#b89146] to-[#b89146]"></div>
                    </div>

                    {/* Footer Grid - EXACT ALIGNMENT */}
                    <div className="grid grid-cols-[1fr_1fr_1fr_0.5fr] w-full px-12 pt-6  text-center items-start">
                      <div className="text-left flex flex-col items-start">
                        <p className="text-[11px] font-black text-[#997819] uppercase tracking-tighter mb-1">
                          Authorised Signature:
                        </p>
                        <div className="relative flex flex-col items-start">
                          <img
                            src="/signature.png"
                            alt="Signature"
                            className="h-8 object-contain mb-[-4px] ml-2"
                          />
                          <div className="h-[1.5px] w-32 bg-[#b89146]/60 mb-1"></div>
                          <p className="font-bold text-[#12066a] text-[10px] whitespace-nowrap uppercase">
                            Centre Manager
                          </p>
                        </div>
                      </div>

                      <div className="border-l-2 border-black/10 flex flex-col items-center">
                        <p className="text-[12px] font-black text-[#997819] font-serif leading-tight">
                          ISSUE DATE:
                        </p>
                        <p className="font-bold text-black text-[13.5px] mt-1">
                          {studentData.date_issued}
                        </p>
                      </div>

                      <div className="border-l-2 border-black/10 flex flex-col items-center">
                        <p className="text-[12px] font-black text-[#997819] font-serif leading-tight">
                          CERTIFICATE ID:
                        </p>
                        <p className="font-bold text-black text-[13.5px] mt-1 uppercase">
                          {studentData.id}
                        </p>
                      </div>

                      <div className="flex justify-end items-start">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">
                          <QRCodeSVG
                            value={`https://iccs-student-verification.vercel.app/verify/${studentData.id}`}
                            size={57}
                            level={"H"}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-15 flex gap-8 text-[#b89146] font-bold text-[13px] uppercase">
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
          <div className="text-center pt-24 animate-in zoom-in-95 duration-300">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-red-50 inline-block">
              <h1 className="text-3xl font-black text-red-600 mb-2 uppercase italic tracking-tighter">
                Record Not Found
              </h1>
              <p className="text-slate-400 font-bold max-w-xs mx-auto">
                The certificate ID you are looking for does not exist in our
                digital database.
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="mt-8 bg-[#12066a] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#b89146] transition-all"
              >
                Go Back Home
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
