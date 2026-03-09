"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Local storage se auth status check karein
    const authStatus = localStorage.getItem("iccs_admin_auth");
    if (authStatus === "true") {
      setIsAdmin(true);
    }
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#b89146]/20 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex justify-between items-center">
        {" "}
        {/* Height kam ki */}
        {/* Logo Section */}
        <div className="flex items-center">
          <Link href="/">
          <div className="relative w-[120px] h-[40px] md:w-[160px] md:h-[50px]">
            <Image
              src="/iccs-logo.png"
              alt="ICCS Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          </Link>
        </div>
        {/* Right Side - Buttons */}
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="https://iccs.uk/ " target="_blank"  rel="noopener noreferrer">
            <div className="text-[10px] font-bold text-[#1a1a5e] cursor-pointer border border-[#b89146] px-4 py-2 rounded tracking-widest uppercase hover:bg-[#b89146] hover:text-white transition-all">
              Website
            </div>
          </Link>
          {/* Dashboard button sirf tab nazar aayega jab isAdmin true ho */}
         
            <Link href="/admin">
              <button className="bg-[#12066a] text-[12px] text-white px-4 py-2 rounded-md font-bold transition-all hover:bg-[#b89146] hover:text-white cursor-pointer shadow-md">
                Dashboard
              </button>
            </Link>
        
        </div>
      </div>
    </nav>
  );
}
