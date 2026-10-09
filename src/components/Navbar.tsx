import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Volume2, VolumeX, ShoppingBag, ShieldCheck, Lock, LogOut, UtensilsCrossed } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeRoute, setRoute, soundEnabled, toggleSound, 
    isAdminAuthenticated, adminLogout, setShowAdminLoginModal, orders, t 
  } = useRestaurant();

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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side: Brand Wordmark + Menyu & Ofitsiant */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setRoute('mijoz')}
            className="text-left group flex items-center gap-2 focus:outline-none"
          >
            <div className="w-8 h-8 rounded border border-[#d4af37]/40 bg-gradient-to-br from-[#2a2415] to-[#12131a] flex items-center justify-center text-[#d4af37] font-serif font-bold text-sm shadow-[0_0_12px_rgba(212,175,55,0.2)]">
              S
            </div>
            <span className="font-serif tracking-wider font-semibold text-base sm:text-lg text-white group-hover:text-[#d4af37] transition-colors whitespace-nowrap">
              SAVORIA
            </span>
          </button>

          {/* Menyu & Buyurtma Nav Link */}
          <nav className="flex items-center gap-1.5">
            <button
              onClick={() => setRoute('mijoz')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                activeRoute === 'mijoz'
                  ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t('nav_menu')}</span>
            </button>

            {/* Quick Ofitsiant Rejimi button */}
            <button
              onClick={() => setRoute('ofitsiant')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeRoute === 'ofitsiant'
                  ? 'bg-[#d4af37] text-neutral-950 font-bold shadow-md'
                  : 'text-neutral-400 hover:text-white bg-[#141622] hover:bg-[#1c2030] border border-[#232737]'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('nav_waiter')}</span>
            </button>
          </nav>
        </div>

        {/* Right Side: Language Switcher, Sound & Admin Panel */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Beautiful Language Switcher */}
          <LanguageSwitcher />

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? t('nav_sound_on') : t('nav_sound_off')}
            className={`p-2 rounded-lg text-xs border transition-colors flex items-center gap-1 ${
              soundEnabled
                ? 'bg-[#1a1c24] border-[#2e3244] text-[#d4af37]'
                : 'bg-[#16171e] border-neutral-800 text-neutral-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Admin Logout Button if logged in */}
          {isAdminAuthenticated && (
            <button
              onClick={adminLogout}
              title={t('nav_logout')}
              className="p-2 rounded-lg bg-[#201517] border border-rose-900/40 text-rose-400 hover:bg-rose-950/60 hover:text-rose-200 text-xs flex items-center gap-1 font-mono transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Admin Panel Button Placed on the Far Right */}
          <button
            onClick={handleAdminClick}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeRoute === 'admin'
                ? 'bg-[#d4af37] text-neutral-950 font-bold shadow-lg'
                : 'text-neutral-200 hover:text-white bg-[#181a28] hover:bg-[#222538] border border-[#2e334a]'
            }`}
          >
            {isAdminAuthenticated ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
            )}
            <span>{t('nav_admin')}</span>
            {pendingOrdersCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                activeRoute === 'admin' ? 'bg-black text-[#d4af37]' : 'bg-[#d4af37] text-black'
              }`}>
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
