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
            certificate_id: data.certificate_id,
            date_issued: data.date_issued,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse font-bold text-[#12066a] text-xl">
          Verifying ICCS Digital Records...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-10 flex flex-col items-center">
        {studentData ? (
          <div className="w-full flex flex-col items-center px-4 pb-20">
            {/* Verification Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-2 mb-8 bg-green-100 text-green-800 rounded-full border border-green-200 shadow-sm animate-bounce">
              <span className="text-lg">✓</span>
              <span className="font-bold tracking-wide uppercase text-sm">Officially Verified by ICCS</span>
            </div>

            {/* 📱 RESPONSIVE WRAPPER: Matches your Home page logic */}
            <div className="w-full flex justify-center items-start h-[380px] xs:h-[450px] sm:h-[600px] md:h-auto lg:h-auto overflow-hidden transition-all">
              <div className="origin-top scale-[0.38] xs:scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 transition-transform duration-500 shadow-2xl">
                
                {/* Certificate Container */}
                <div 
                  className="relative w-[900px] h-[820px] bg-white overflow-hidden flex-shrink-0"
                  style={{ fontFamily: "'Times New Roman', serif" }}
                >
                  <img src="/border.jpeg" className="absolute inset-0 w-full h-full object-fill z-0" />

                  <div className="relative z-10 h-full w-full flex flex-col items-center pt-16 px-28">
                    {/* Header */}
                    <div className="flex justify-center items-start w-full mb-8 px-8 gap-6">
                      <img src="/iccs-logo-rounded-remove.png" className="w-28 object-contain" />
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
                      <h2 className="text-5xl text-[#12066a] font-semibold pt-2 pb-6">{studentData.name}</h2>
                    </div>

                    <div className="relative w-full flex items-center justify-center my-4">
                      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#b89146] to-[#b89146]"></div>
                      <div className="mx-2 flex-shrink-0"><div className="w-3 h-3 bg-[#b89146] rounded-full"></div></div>
                      <div className="h-[3px] w-full bg-gradient-to-l from-transparent via-[#b89146] to-[#b89146]"></div>
                    </div>

                    <div className="text-center max-w-3xl">
                      <p className="text-[#997819] text-[22px] font-serif font-light">For successfully completing the professional certification program</p>
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
                        <p className="font-bold text-[#12066a] text-[11px]">{studentData.id}</p>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <QRCodeSVG 
                            value={`https://iccs-student-verification.vercel.app/verify/${studentData.id}`}
                            size={80}
                            marginSize={4}
                            level={"H"}
                          />
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
          <div className="text-center pt-20">
            <h1 className="text-3xl font-black text-red-600 mb-2">Invalid Certificate</h1>
            <p className="text-slate-500">The scanned record does not exist in the ICCS database.</p>
          </div>
        )}
      </main>
    </div>
  );
}