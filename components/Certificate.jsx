import Image from 'next/image';

const Certificate = ({ studentData }) => {
  return (
    <div className="relative w-[1122px] h-[794px] p-24 flex flex-col items-center font-serif shadow-2xl overflow-hidden mx-auto">
      {/* Background Image: WhatsApp Image 2026-03-04 at 10.36.15 AM.jpeg ko component mein fill karna hai. Is image mein border aur corner designs pehle se hi hain. */}
      <Image
        src="/border.jpeg" 
        alt="Certificate Background"
        layout="fill"
        objectFit="cover"
        className="-z-10"
      />

      {/* Header Section with Logo */}
      <div className="flex justify-between items-start w-full mb-10 px-10">
        <Image src="/iccs-logo.png" alt="ICCS Logo" width={180} height={80} />
        <div className="text-right">
          <h1 className="text-2xl font-black text-[#12066a] leading-tight">
            International College of <br /> Contemporary Sciences
          </h1>
          <p className="text-[#b89146] italic font-bold text-sm tracking-widest">Knowledge for A Global Future</p>
        </div>
      </div>

      {/* Main Title */}
      <h2 className="text-3xl font-black text-[#12066a] uppercase tracking-wider mb-2">
        Certified Professional in Supply Chain Management (CPSCM)
      </h2>
      <p className="text-[#b89146] text-xl font-bold italic mb-6">
        This certificate is proudly awarded to
      </p>

      {/* Student Name Placeholder */}
      <div className="relative mb-8 w-3/4 text-center">
        <h3 className="text-5xl font-black text-[#1a1a5e] mb-2">{studentData.student_name}</h3>
        {/* Is line ko gold `#b89146` color dena hai taake design matches WhatsApp Image 2026-03-04 at 10.30.01 AM.jpeg */}
        <div className="h-[2px] w-full bg-[#b89146]" /> 
      </div>

      {/* Achievement Text */}
      <p className="text-center text-[#12066a] max-w-3xl mb-10 leading-relaxed font-semibold italic">
        For successfully completing the professional certification program in <br />
        <span className="text-2xl font-black not-italic tracking-wide text-[#b89146]">Supply Chain Management</span> <br />
        <span className="text-sm">This program is designed to develop practical and strategic expertise in global logistics, procurement, operations, and supply chain optimization...</span>
      </p>

      {/* Footer Details */}
      <div className="grid grid-cols-3 w-full px-10 mt-auto pt-6 gap-4 relative">
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Issued By:</p>
          <p className="font-bold text-[#12066a] text-xs">ICCS - International Centre for Career Studies</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Date of Issue:</p>
          <p className="font-bold text-[#12066a] text-sm">{studentData.date_issued || "04/03/2026"}</p>
        </div>
        <div className="text-center flex flex-col items-center">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Certificate ID:</p>
          <p className="font-bold text-[#12066a] text-sm mb-2">{studentData.certificate_id || "ICCS-SCM-000123"}</p>
          <div className="w-16 h-16 bg-white border border-slate-300 p-1">
            {/* QR Code Placeholder */}
            <div className="w-full h-full border border-dashed border-slate-400 flex items-center justify-center text-[8px]">QR CODE</div>
          </div>
        </div>
      </div>

      {/* Verification Tags */}
      <div className="flex gap-8 mt-6 text-[#b89146] font-bold text-xs uppercase tracking-widest italic relative">
        <span>✓ Digitally Verifiable</span>
        <span>✓ Industry-Oriented Certification</span>
      </div>
    </div>
  );
};

export default Certificate;