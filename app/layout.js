import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';
// 1. Sonner import karein
import { Toaster } from 'sonner'; 

export const metadata = {
  title: 'ICCS | Certificate Verification Portal',
  description: 'Official Student Verification System for ICCS College',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#fafafa]">
        {/* 2. Toaster component yahan add karein */}
        <Toaster richColors position="top-center" closeButton />
        
        <Navbar />
        <main className="min-h-screen pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}