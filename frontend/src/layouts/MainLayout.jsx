import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MobileBottomNav from '../components/common/MobileBottomNav';
import FloatingCartBar from '../components/common/FloatingCartBar';
import { useCart } from '../context/CartContext';
import { CheckCircle2 } from 'lucide-react';

const MainLayout = () => {
  const { toastMessage } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2]">
      {/* Main Navigation (Desktop + Mobile Header) */}
      <Navbar />

      {/* Page Content with bottom padding on mobile for Swiggy navigation bar */}
      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>

      {/* Swiggy-style Floating Cart Indicator on mobile */}
      <FloatingCartBar />

      {/* Swiggy-style Bottom Navigation Bar on mobile */}
      <MobileBottomNav />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-24 lg:bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
