"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { QRCodeSVG } from "qrcode.react";

export default function VerifyStudent() {
  const { id } = useParams(); // URL se student ID (roll no) nikalne ke liye
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
        console.error("Error fetching student:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStudent();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#12066a]">Verifying with ICCS Database...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 flex flex-col items-center">
        {studentData ? (
          <div className="w-full max-w-4xl px-4 flex flex-col items-center">
            <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full font-bold mb-6 border border-green-200">
              ✓ Officially Verified by ICCS
            </div>
            
            {/* Yahan aapka wahi purana Certificate wala UI code aayega jo Home page par hai */}
            <div className="scale-[0.4] md:scale-[0.8] lg:scale-100 origin-top shadow-2xl">
                {/* Certificate Container Code... */}
                <div className="relative w-[900px] h-[820px] bg-white overflow-hidden">
                    <img src="/border.jpeg" className="absolute inset-0 w-full h-full object-fill z-0" />
                    <div className="relative z-10 h-full w-full flex flex-col items-center pt-16 px-28">
                        {/* Header, Name, Course, Footer logic wahi Home wali use karein */}
                        <h2 className="text-5xl text-[#12066a] font-semibold pt-10">{studentData.name}</h2>
                        <p className="text-[#b89146] text-xl font-bold mt-4">Successfully Verified Student</p>
                        
                        <div className="mt-auto pb-20">
                           <QRCodeSVG 
                             value={`https://iccs-student-verification.vercel.app/verify/${studentData.id}`}
                             size={80}
                             marginSize={4}
                           />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="text-center pt-20">
            <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
            <p className="text-slate-600">No record found for ID: {id}</p>
          </div>
        )}
      </main>
    </div>
  );
}