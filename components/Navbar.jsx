import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#b89146]/20 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex justify-between items-center"> {/* Height kam ki */}
        
        {/* Logo Section */}
        <div className="flex items-center">
          <div className="relative w-[120px] h-[40px] md:w-[160px] md:h-[50px]">
            <Image 
              src="/iccs-logo.png" 
              alt="ICCS Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        {/* Right Side - Buttons */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="text-[10px] font-bold text-[#1a1a5e] cursor-pointer border border-[#b89146] px-3 py-1 rounded tracking-widest uppercase hover:bg-[#b89146] hover:text-white transition-all">
            Website
          </div>
          
          <button className="bg-[#1a1a5e] text-white text-[10px] md:text-xs font-bold px-4 py-2 rounded hover:bg-[#b89146] transition-colors shadow-md">
            LOGIN
          </button>
        </div>
      </div>
    </nav>
  );
}