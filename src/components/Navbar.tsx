import React, { useState, useEffect } from 'react';
import { useRestaurant, AdminSubTab } from '../context/RestaurantContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  Volume2, VolumeX, ShoppingBag, ShieldCheck, Lock, LogOut, 
  UtensilsCrossed, Menu, X, ChevronRight, Receipt, Utensils, 
  Bike, BarChart3, Users, Globe, ExternalLink
} from 'lucide-react';
import { Language } from '../types';

export const Navbar: React.FC = () => {
  const { 
    activeRoute, setRoute, soundEnabled, toggleSound, 
    isAdminAuthenticated, adminLogout, setShowAdminLoginModal, 
    orders, adminSubTab, setAdminSubTab, language, setLanguage,
    waiters, couriers, adminUsers, t 
  } = useRestaurant();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pendingOrdersCount = orders.filter(o => o.status !== 'yopildi').length;
  const kitchenOrdersCount = orders.filter(o => o.status === 'yangi' || o.status === 'oshxonada').length;
  const deliveryOrdersCount = orders.filter(o => o.type === 'dostavka' && (o.status === 'yolda' || o.status === 'oshxonada' || o.status === 'yangi')).length;
  const openBillsCount = orders.filter(o => o.status !== 'yopildi' && o.type === 'zal').length;

  const handleAdminClick = () => {
    if (!isAdminAuthenticated) {
      setShowAdminLoginModal(true);
    } else {
      setRoute('admin');
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = (route: 'mijoz' | 'ofitsiant' | 'admin') => {
    if (route === 'admin') {
      handleAdminClick();
    } else {
      setRoute(route);
      setIsMobileMenuOpen(false);
    }
  };

  const handleAdminSubTabClick = (tab: AdminSubTab) => {
    if (!isAdminAuthenticated) {
      setShowAdminLoginModal(true);
    } else {
      setRoute('admin');
      setAdminSubTab(tab);
    }
    setIsMobileMenuOpen(false);
  };

  // Close mobile drawer when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-[#0d0e14]/95 backdrop-blur-md border-b border-[#252836]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side: Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={() => handleNavigate('mijoz')}
            className="text-left group flex items-center gap-2 focus:outline-none shrink-0"
          >
            <div className="w-8 h-8 rounded-lg border border-[#d4af37]/50 bg-gradient-to-br from-[#2a2415] to-[#12131a] flex items-center justify-center text-[#d4af37] font-serif font-bold text-sm shadow-[0_0_12px_rgba(212,175,55,0.25)]">
              S
            </div>
            <span className="font-serif tracking-wider font-bold text-xs sm:text-base text-white group-hover:text-[#d4af37] transition-colors whitespace-nowrap">
              SAVORIA RESTAURANT
            </span>
          </button>

          {/* Desktop Navigation Links (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => handleNavigate('mijoz')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                activeRoute === 'mijoz'
                  ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('nav_menu')}</span>
            </button>

            <button
              onClick={() => handleNavigate('ofitsiant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeRoute === 'ofitsiant'
                  ? 'bg-[#d4af37] text-neutral-950 font-bold shadow-md'
                  : 'text-neutral-400 hover:text-white bg-[#141622] hover:bg-[#1c2030] border border-[#232737]'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>{t('nav_waiter')}</span>
            </button>
          </nav>
        </div>

        {/* Right Side: Desktop Controls & Mobile Burger Button */}
        <div className="flex items-center gap-2">
          {/* Quick Language Switcher on all devices */}
          <LanguageSwitcher />

          {/* Desktop Only: Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? t('nav_sound_on') : t('nav_sound_off')}
            className={`hidden sm:flex p-2 rounded-lg text-xs border transition-colors items-center gap-1 ${
              soundEnabled
                ? 'bg-[#1a1c24] border-[#2e3244] text-[#d4af37]'
                : 'bg-[#16171e] border-neutral-800 text-neutral-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Desktop Only: Admin Logout if logged in */}
          {isAdminAuthenticated && (
            <button
              onClick={adminLogout}
              title={t('nav_logout')}
              className="hidden md:flex p-2 rounded-lg bg-[#201517] border border-rose-900/40 text-rose-400 hover:bg-rose-950/60 hover:text-rose-200 text-xs items-center gap-1 font-mono transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Desktop Only: Admin Panel Button */}
          <button
            onClick={handleAdminClick}
            className={`hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
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

          {/* Mobile & Small Screens: Premium 3-Lines Burger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            aria-label="Burger Menyu"
            className="md:hidden flex items-center justify-center p-2 rounded-xl bg-[#141624] hover:bg-[#1f2336] border border-[#d4af37]/40 text-[#d4af37] focus:outline-none transition-all active:scale-95 shadow-[0_0_12px_rgba(212,175,55,0.15)] relative"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d4af37] text-neutral-950 text-[9px] font-black font-mono rounded-full flex items-center justify-center shadow">
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Burger Menu Overlay & Sliding Panel) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 animate-fade-in">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Sliding Panel */}
          <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#0c0d14] border-l border-[#272b3c] shadow-2xl flex flex-col z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#202434] flex items-center justify-between bg-[#10121c]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg border border-[#d4af37]/50 bg-gradient-to-br from-[#2a2415] to-[#12131a] flex items-center justify-center text-[#d4af37] font-serif font-bold text-sm shadow-[0_0_12px_rgba(212,175,55,0.25)]">
                  S
                </div>
                <div>
                  <div className="font-serif font-bold text-white text-xs tracking-wider">
                    SAVORIA RESTAURANT
                  </div>
                  <div className="text-[10px] text-[#d4af37] tracking-widest font-mono uppercase">
                    Premium Gastro & POS
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-[#181a28] border border-[#272b3c] text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 space-y-6 flex-1">
              {/* Primary Views Section */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-mono tracking-widest text-[#d4af37]/80 px-1 font-bold">
                  Asosiy Bo'limlar
                </div>
                
                {/* Menyu & Buyurtma */}
                <button
                  onClick={() => handleNavigate('mijoz')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    activeRoute === 'mijoz'
                      ? 'bg-[#d4af37]/15 border-[#d4af37]/60 text-[#d4af37] font-bold shadow-[0_0_14px_rgba(212,175,55,0.15)]'
                      : 'bg-[#12141e] border-[#222536] text-neutral-300 hover:text-white hover:bg-[#1a1c2a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black/40 text-[#d4af37]">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold">{t('nav_menu')}</div>
                      <div className="text-[10px] text-neutral-400">Mijozlar menyusi & Onlayn zakas</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                {/* Ofitsiant Rejimi */}
                <button
                  onClick={() => handleNavigate('ofitsiant')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    activeRoute === 'ofitsiant'
                      ? 'bg-[#d4af37] text-neutral-950 font-bold border-[#d4af37] shadow-lg'
                      : 'bg-[#12141e] border-[#222536] text-neutral-300 hover:text-white hover:bg-[#1a1c2a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activeRoute === 'ofitsiant' ? 'bg-black/20 text-neutral-950' : 'bg-black/40 text-[#d4af37]'}`}>
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold">{t('nav_waiter')}</div>
                      <div className={`text-[10px] ${activeRoute === 'ofitsiant' ? 'text-neutral-800' : 'text-neutral-400'}`}>
                        Stol tanlash & Buyurtma qabul qilish
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                {/* Admin Panel */}
                <button
                  onClick={handleAdminClick}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    activeRoute === 'admin'
                      ? 'bg-[#181d30] border-[#d4af37] text-[#d4af37] font-bold shadow-lg'
                      : 'bg-[#12141e] border-[#222536] text-neutral-300 hover:text-white hover:bg-[#1a1c2a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black/40 text-emerald-400">
                      {isAdminAuthenticated ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4 text-[#d4af37]" />}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold flex items-center gap-2">
                        <span>{t('nav_admin')}</span>
                        {isAdminAuthenticated && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                            Faol
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400">POS Kassa, Oshxona KDS, Dostavka, Xisobot</div>
                    </div>
                  </div>
                  {pendingOrdersCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#d4af37] text-neutral-950 font-mono font-bold text-[10px]">
                      {pendingOrdersCount}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  )}
                </button>
              </div>

              {/* Admin Panel Modules (Available if Admin is Authenticated) */}
              {isAdminAuthenticated && (
                <div className="space-y-2 pt-2 border-t border-[#1e2232]">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
                      Admin Modullari
                    </span>
                    <button
                      onClick={adminLogout}
                      className="text-[10px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>{t('nav_logout')}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAdminSubTabClick('kassa')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex flex-col gap-1.5 ${
                        activeRoute === 'admin' && adminSubTab === 'kassa'
                          ? 'bg-[#d4af37] text-neutral-950 font-bold border-[#d4af37]'
                          : 'bg-[#131622] border-[#222638] text-neutral-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Receipt className="w-3.5 h-3.5" />
                        {openBillsCount > 0 && (
                          <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                            {openBillsCount}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px]">Kassa POS</span>
                    </button>

                    <button
                      onClick={() => handleAdminSubTabClick('oshxona')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex flex-col gap-1.5 ${
                        activeRoute === 'admin' && adminSubTab === 'oshxona'
                          ? 'bg-[#d4af37] text-neutral-950 font-bold border-[#d4af37]'
                          : 'bg-[#131622] border-[#222638] text-neutral-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Utensils className="w-3.5 h-3.5" />
                        {kitchenOrdersCount > 0 && (
                          <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-300 font-mono">
                            {kitchenOrdersCount}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px]">Oshxona KDS</span>
                    </button>

                    <button
                      onClick={() => handleAdminSubTabClick('dostafka')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex flex-col gap-1.5 ${
                        activeRoute === 'admin' && adminSubTab === 'dostafka'
                          ? 'bg-[#d4af37] text-neutral-950 font-bold border-[#d4af37]'
                          : 'bg-[#131622] border-[#222638] text-neutral-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Bike className="w-3.5 h-3.5" />
                        {deliveryOrdersCount > 0 && (
                          <span className="text-[9px] px-1 rounded bg-sky-500/20 text-sky-300 font-mono">
                            {deliveryOrdersCount}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px]">Dostavka</span>
                    </button>

                    <button
                      onClick={() => handleAdminSubTabClick('xisobot')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex flex-col gap-1.5 ${
                        activeRoute === 'admin' && adminSubTab === 'xisobot'
                          ? 'bg-[#d4af37] text-neutral-950 font-bold border-[#d4af37]'
                          : 'bg-[#131622] border-[#222638] text-neutral-300 hover:text-white'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Xisobot & Analitika</span>
                    </button>

                    <button
                      onClick={() => handleAdminSubTabClick('menyu')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex flex-col gap-1.5 ${
                        activeRoute === 'admin' && adminSubTab === 'menyu'
                          ? 'bg-[#d4af37] text-neutral-950 font-bold border-[#d4af37]'
                          : 'bg-[#131622] border-[#222638] text-neutral-300 hover:text-white'
                      }`}
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Menyu Katalogi</span>
                    </button>

                    <button
                      onClick={() => handleAdminSubTabClick('xodimlar')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex flex-col gap-1.5 ${
                        activeRoute === 'admin' && adminSubTab === 'xodimlar'
                          ? 'bg-[#d4af37] text-neutral-950 font-bold border-[#d4af37]'
                          : 'bg-[#131622] border-[#222638] text-neutral-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          {waiters.length + couriers.length + adminUsers.length}
                        </span>
                      </div>
                      <span className="text-[11px]">Xodimlar Boshqaruvi</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Language Selector Section */}
              <div className="space-y-2 pt-2 border-t border-[#1e2232]">
                <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 px-1 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-[#d4af37]" />
                  <span>Tilni Tanlash / Выбор языка</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'uz' as Language, label: "O'zbek", flag: '🇺🇿' },
                    { id: 'ru' as Language, label: 'Русский', flag: '🇷🇺' },
                    { id: 'en' as Language, label: 'English', flag: '🇬🇧' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setLanguage(item.id)}
                      className={`py-2 px-1 rounded-xl border text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                        language === item.id
                          ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] font-bold shadow-md'
                          : 'bg-[#131520] border-[#25293d] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{item.flag}</span>
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Settings */}
              <div className="space-y-2 pt-2 border-t border-[#1e2232]">
                <button
                  onClick={toggleSound}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#131520] border border-[#23273a] text-neutral-300 hover:text-white text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-[#d4af37]" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-neutral-500" />
                    )}
                    <span>Ovozli signallar & Bildirishnomalar</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {soundEnabled ? 'YOQILGAN' : "O'CHIRILGAN"}
                  </span>
                </button>
              </div>
            </div>

            {/* Drawer Footer with Contacts */}
            <div className="p-4 border-t border-[#1e2230] bg-[#090a10] text-[11px] text-neutral-400 space-y-2">
              <div className="font-serif text-center font-bold text-white text-xs tracking-wider">
                SAVORIA RESTAURANT
              </div>
              <div className="flex items-center justify-center gap-4 text-xs font-mono pt-1 text-neutral-500">
                <a 
                  href="https://t.me/lazizshavkatov712" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Telegram
                </a>
                <span>·</span>
                <a 
                  href="https://instagram.com/shavkatovv.o07" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Instagram
                </a>
                <span>·</span>
                <a 
                  href="mailto:lazizshavkatov712@gmail.com" 
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
