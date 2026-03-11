"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [secretClicks, setSecretClicks] = useState(0);
  const router = useRouter();

useEffect(() => {
  // Initial check
  const checkAuth = () => {
    setIsAdmin(localStorage.getItem("iccs_admin_session") === "true");
  };
  
  checkAuth();

  // Listen for logout event from admin page
  window.addEventListener("admin-logout", checkAuth);
  return () => window.removeEventListener("admin-logout", checkAuth);
}, []);

  const handleSecretPortal = (e) => {
    if (!e.shiftKey) return;
    const newClicks = secretClicks + 1;
    setSecretClicks(newClicks);
    if (newClicks === 3) {
      setShowAdminLogin(true);
      setSecretClicks(0);
    }
    setTimeout(() => setSecretClicks(0), 2000);
  };

  const verifyAdmin = () => {
    if (adminPass === "ICCS_ADMIN_2026") {
      localStorage.setItem("iccs_admin_auth", "true");
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPass("");
      toast.success("Master Portal Unlocked!");
      router.push("/admin");
    } else {
      toast.error("Invalid Master Key!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("iccs_admin_auth");
    setIsAdmin(false);
    router.push("/");
    toast.info("Master Access Locked");
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#b89146]/20 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex justify-between items-center relative">
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

          {/* Secret Trigger Area */}
          <div
            onClick={handleSecretPortal}
            className="absolute left-1/2 -translate-x-1/2 w-[80px] h-full cursor-default z-10"
          />

          {/* Right Side Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="https://iccs.uk/" target="_blank">
              <div className="text-[9px] md:text-[10px] font-bold text-[#1a1a5e] border border-[#b89146] px-3 py-2 rounded uppercase hover:bg-[#b89146] hover:text-white transition-all">
                Website
              </div>
            </Link>

            {/* Switch between Staff Portal and Admin Dashboard */}

            <div className="flex items-center gap-2">
              {/* Check if Admin is logged in */}
              {isAdmin ? (
                // Agar Admin Logged in hai to Dashboard dikhao
                <Link href="/admin">
                  <button className="bg-[#12066a] text-[10px] md:text-[12px] text-white px-4 py-2 rounded shadow-md font-black uppercase tracking-wider hover:bg-[#b89146] transition-all cursor-pointer">
                    Dashboard
                  </button>
                </Link>
              ) : (
                // Agar Admin logout hai (ya normal user hai) to Staff Portal dikhao
                <Link href="/staff-login">
                  <div className="text-[9px] md:text-[10px] font-black text-white bg-[#12066a] px-3 py-2 rounded shadow-md uppercase tracking-wider hover:bg-[#b89146] transition-all cursor-pointer">
                    Staff Portal
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Login Modal (Ghost logic remains same) */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1a5e]/10 backdrop-blur-xs animate-in fade-in duration-300">
          {/* FORM TAG ZAROORI HAI: Ye browser ko 'Save Password' ka signal deta hai */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyAdmin();
            }}
            className="bg-[#12066a] w-full max-w-lg p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/5 animate-in zoom-in duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <h2 className="text-white font-black text-lg mb-8 uppercase tracking-widest italic">
                Enter Master Key
              </h2>

              {/* HIDDEN USERNAME: Google Chrome ko username + password ka pair chahiye hota hai */}
              <input
                type="text"
                name="username"
                autoComplete="username"
                defaultValue="admin@iccs"
                className="hidden"
              />

              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter Password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full p-5 bg-white/5 rounded-2xl border border-white/10 text-white placeholder:text-white/20 outline-none mb-8 text-center font-bold text-lg focus:border-[#b89146]/50 transition-all shadow-inner"
                autoFocus
              />

              <button
                type="submit" // Type 'submit' dabane par hi browser 'Save' ka prompt deta hai
                className="w-full bg-white text-[#0a0442] py-5 rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] text-sm"
              >
                Unlock
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminPass("");
                }}
                className="mt-6 text-white/30 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-all underline decoration-white/10 underline-offset-4"
              >
                Cancel Access
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
