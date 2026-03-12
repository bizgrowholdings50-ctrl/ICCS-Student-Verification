import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0f0f3d] text-gray-400 py-12 px-6 border-t-4 border-[#b89146]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <Image 
              src="/iccs-logo.png" 
              alt="ICCS Logo" 
              width={160} 
              height={50} 
              className="rounded-xl opacity-80" // Logo ko white/silver look dene ke liye
            />
            <p className="text-[11px] leading-relaxed max-w-xs text-center md:text-left uppercase tracking-wider text-gray-500">
              International College of Contemporary Sciences <br/>
              <span className="text-[#b89146]">Knowledge for a Global Future</span>
            </p>
          </div>

          {/* Quick Links with Gold Hover */}
          <div className="flex justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Link href="/admin" className="hover:text-[#b89146] transition-colors duration-300">Admin</Link>
            <Link href="https://iccs.uk/policies/" target="_blank" rel="noopener noreferrer" className="hover:text-[#b89146] transition-colors duration-300">Privacy</Link>
            <a href="#" className="hover:text-[#b89146] transition-colors duration-300">Support</a>
          </div>

          {/* Social/Copy Section */}
          <div className="flex flex-col items-center md:items-end space-y-2">
            <div className="text-[#b89146] font-serif italic text-sm">Official Academic Registry</div>
            <p className="text-[10px]">&copy; 2026 ICCS. All rights reserved.</p>
          </div>

        </div>

        {/* Bottom Small Print */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center">
          <p className="text-[9px] text-gray-600 uppercase tracking-[0.5em]">
            Secured Digital Credentialing System
          </p>
        </div>
      </div>
    </footer>
  );
}