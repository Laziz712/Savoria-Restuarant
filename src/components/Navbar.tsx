import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Volume2, VolumeX, ShoppingBag, ShieldCheck, Lock, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeRoute, setRoute, soundEnabled, toggleSound, 
    isAdminAuthenticated, adminLogout, setShowAdminLoginModal, orders 
  } = useRestaurant();

  // Active orders badge
  const pendingOrdersCount = orders.filter(o => o.status !== 'yopildi').length;

  const handleAdminClick = () => {
    if (!isAdminAuthenticated) {
      setShowAdminLoginModal(true);
    } else {
      setRoute('admin');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0d0e14]/95 backdrop-blur-md border-b border-[#252836]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand Title Wordmark */}
        <button
          onClick={() => setRoute('mijoz')}
          className="text-left group flex items-center gap-2.5 focus:outline-none"
        >
          <div className="w-8 h-8 rounded border border-[#d4af37]/40 bg-gradient-to-br from-[#2a2415] to-[#12131a] flex items-center justify-center text-[#d4af37] font-serif font-bold text-sm shadow-[0_0_12px_rgba(212,175,55,0.2)]">
            S
          </div>
          <span className="font-serif tracking-wider font-semibold text-lg text-white group-hover:text-[#d4af37] transition-colors whitespace-nowrap">
            SAVORIA
          </span>
        </button>

        {/* Zone 2: Strictly TWO primary nav items as requested */}
        <nav className="flex items-center gap-2">
          {/* 1. Menyu & Buyurtma */}
          <button
            onClick={() => setRoute('mijoz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeRoute === 'mijoz'
                ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Menyu & Buyurtma</span>
          </button>

          {/* 2. Admin Panel */}
          <button
            onClick={handleAdminClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeRoute === 'admin'
                ? 'bg-[#d4af37] text-neutral-950 font-bold shadow-lg'
                : 'text-neutral-300 hover:text-white bg-[#161824] hover:bg-[#1f2233] border border-[#272b3d]'
            }`}
          >
            {isAdminAuthenticated ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
            )}
            <span>Admin Panel</span>
            {pendingOrdersCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                activeRoute === 'admin' ? 'bg-black text-[#d4af37]' : 'bg-[#d4af37] text-black'
              }`}>
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Actions (Sound & Admin Session State) */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Ovoz: ON' : 'Ovoz: OFF'}
            className={`p-2 rounded-lg text-xs border transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-[#1a1c24] border-[#2e3244] text-[#d4af37] hover:border-[#d4af37]/50'
                : 'bg-[#16171e] border-neutral-800 text-neutral-500 hover:text-neutral-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px] font-mono">
              {soundEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Admin Logout Button if logged in */}
          {isAdminAuthenticated && (
            <button
              onClick={adminLogout}
              title="Admin paneldan chiqish"
              className="p-2 rounded-lg bg-[#201517] border border-rose-900/40 text-rose-400 hover:bg-rose-950/60 hover:text-rose-200 text-xs flex items-center gap-1.5 font-mono transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Chiqish</span>
            </button>
          )}

          {/* Root Link Indicator */}
          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded bg-[#13151e] border border-[#232635] text-[11px] font-mono text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>savoria-restaurant.uz/{activeRoute === 'admin' ? 'admin' : ''}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
