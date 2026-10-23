import React, { useState, useEffect, useRef } from 'react';
import { useRestaurant, AdminSubTab } from '../context/RestaurantContext';
import { KassaPOSView } from './KassaPOSView';
import { OshxonaKDSView } from './OshxonaKDSView';
import { DostavkaDispatchView } from './DostavkaDispatchView';
import { XisobotAnalyticsView } from './XisobotAnalyticsView';
import { AdminCatalogView } from './AdminCatalogView';
import { StaffManagementTab } from './StaffManagementTab';
import { TableManagementTab } from './TableManagementTab';
import { AdminReservationsTab } from './AdminReservationsTab';
import { 
  Receipt, Utensils, Bike, BarChart3, 
  UtensilsCrossed, Users, Menu, X, ChevronRight, ChevronLeft, LogOut, ShieldCheck,
  LayoutGrid, CalendarCheck
} from 'lucide-react';

export const AdminHubView: React.FC = () => {
  const { 
    adminSubTab, setAdminSubTab, orders, couriers, 
    waiters, adminUsers, adminLogout, tables, reservations, t 
  } = useRestaurant();

  const [isModuleDrawerOpen, setIsModuleDrawerOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Badge calculations
  const openBillsCount = orders.filter(o => o.status !== 'yopildi' && o.type === 'zal').length;
  const kitchenOrdersCount = orders.filter(o => o.status === 'yangi' || o.status === 'oshxonada').length;
  const activeDeliveryCount = orders.filter(o => o.type === 'dostavka' && (o.status === 'yolda' || o.status === 'oshxonada' || o.status === 'yangi')).length;
  const pendingReservationsCount = reservations.filter(r => r.status === 'kutilmoqda').length;
  const staffCount = waiters.length + couriers.length + adminUsers.length;
  const totalAlerts = openBillsCount + kitchenOrdersCount + activeDeliveryCount + pendingReservationsCount;

  const tabs: { 
    id: AdminSubTab; 
    label: string; 
    subLabel: string;
    icon: React.ReactNode; 
    badge?: number;
    badgeColor?: string;
  }[] = [
    { 
      id: 'kassa', 
      label: t('admin_tab_pos'), 
      subLabel: 'Stol hisobi, to\'lovlar va kassa cheki',
      icon: <Receipt className="w-4 h-4" />, 
      badge: openBillsCount,
      badgeColor: 'bg-amber-500/20 text-amber-300'
    },
    { 
      id: 'oshxona', 
      label: t('admin_tab_kds'), 
      subLabel: 'Oshpazlar monitori va zakas stansiyalari',
      icon: <Utensils className="w-4 h-4" />, 
      badge: kitchenOrdersCount,
      badgeColor: 'bg-rose-500/20 text-rose-300'
    },
    { 
      id: 'dostafka', 
      label: t('admin_tab_delivery'), 
      subLabel: 'Kuryerlar, jo\'natmalar va logistika',
      icon: <Bike className="w-4 h-4" />, 
      badge: activeDeliveryCount,
      badgeColor: 'bg-sky-500/20 text-sky-300'
    },
    { 
      id: 'xisobot', 
      label: t('admin_tab_reports'), 
      subLabel: 'Kunlik tushum, statistika va tahlil',
      icon: <BarChart3 className="w-4 h-4" /> 
    },
    { 
      id: 'menyu', 
      label: t('admin_tab_menu'), 
      subLabel: 'Taomlar, ichimliklar va narxlar katalogi',
      icon: <UtensilsCrossed className="w-4 h-4" /> 
    },
    { 
      id: 'stollar', 
      label: t('admin_tab_tables') || 'Stollar & Zallar', 
      subLabel: 'Yangi stol qo\'shish, sig\'im va zonalar nazorati',
      icon: <LayoutGrid className="w-4 h-4" />, 
      badge: tables.length,
      badgeColor: 'bg-[#d4af37]/20 text-[#d4af37]'
    },
    { 
      id: 'bronlar', 
      label: t('admin_tab_reservations') || 'Bronlar', 
      subLabel: 'Stollarni band qilish va rezervatsiyalar nazorati',
      icon: <CalendarCheck className="w-4 h-4" />, 
      badge: pendingReservationsCount > 0 ? pendingReservationsCount : (reservations.length > 0 ? reservations.length : undefined),
      badgeColor: pendingReservationsCount > 0 ? 'bg-amber-500 text-neutral-950 animate-pulse' : 'bg-[#d4af37]/20 text-[#d4af37]'
    },
    { 
      id: 'xodimlar', 
      label: t('admin_tab_staff'), 
      subLabel: 'Ofitsiantlar, parollar, kuryerlar va adminlar',
      icon: <Users className="w-4 h-4" />, 
      badge: staffCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-300'
    },
  ];

  const currentTab = tabs.find(t => t.id === adminSubTab) || tabs[0];

  const handleSelectTab = (tabId: AdminSubTab) => {
    setAdminSubTab(tabId);
    setIsModuleDrawerOpen(false);
  };

  // Scroll synchronization between the tabs container and slider scrubber ("o'tkazgich")
  const updateScrollProgress = () => {
    if (!tabsContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 2) {
      const progress = Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100));
      setScrollProgress(progress);
    } else {
      setScrollProgress(0);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setScrollProgress(val);
    if (!tabsContainerRef.current) return;
    const { scrollWidth, clientWidth } = tabsContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      tabsContainerRef.current.scrollLeft = (val / 100) * maxScroll;
    }
  };

  const scrollStep = (direction: 'left' | 'right') => {
    if (!tabsContainerRef.current) return;
    const offset = direction === 'left' ? -220 : 220;
    tabsContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleTabsWheel = (e: React.WheelEvent) => {
    if (tabsContainerRef.current && Math.abs(e.deltaX) === 0 && e.deltaY !== 0) {
      tabsContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    updateScrollProgress();
    const timer = setTimeout(updateScrollProgress, 150);
    window.addEventListener('resize', updateScrollProgress);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, [adminSubTab]);

  // Keyboard shortcut for escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModuleDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#08090d] text-[#eaeaea] flex flex-col">
      {/* Admin Module Command Sub-Header */}
      <div className="bg-[#10121b] border-b border-[#212435] px-3 sm:px-6 lg:px-8 py-2 sticky top-16 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* Mobile Top Header: Active Tab Indicator + 3-Lines Burger Button */}
          <div className="md:hidden flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-[#161826] border border-[#d4af37]/40 text-[#d4af37] shadow-sm shrink-0">
                {currentTab.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  <span className="truncate">{currentTab.label}</span>
                  {typeof currentTab.badge === 'number' && currentTab.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#d4af37] text-neutral-950 shrink-0">
                      {currentTab.badge}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  Admin Modul
                </div>
              </div>
            </div>

            {/* 3-Lines Burger Button for Admin Modules */}
            <button
              onClick={() => setIsModuleDrawerOpen(true)}
              aria-label="Admin Modullari Menyu"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141624] hover:bg-[#1f2336] border border-[#d4af37]/50 text-[#d4af37] text-xs font-semibold shadow-[0_0_12px_rgba(212,175,55,0.15)] active:scale-95 transition-all shrink-0"
            >
              <Menu className="w-4 h-4" />
              <span>Modullar</span>
              {totalAlerts > 0 && (
                <span className="w-4 h-4 bg-[#d4af37] text-neutral-950 font-mono font-bold text-[9px] rounded-full flex items-center justify-center">
                  {totalAlerts}
                </span>
              )}
            </button>
          </div>

          {/* Sub Navigation Horizontal Tabs + Interactive Scrubber Slider Track (O'tkazgich) */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Scrollable Tabs Row */}
            <div 
              ref={tabsContainerRef}
              onScroll={updateScrollProgress}
              onWheel={handleTabsWheel}
              className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 scroll-smooth"
            >
              {tabs.map(tab => {
                const isActive = adminSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                      isActive
                        ? 'bg-[#d4af37] text-neutral-950 shadow-[0_0_15px_rgba(212,175,55,0.35)] font-bold'
                        : 'text-neutral-400 hover:text-white bg-[#151724] hover:bg-[#1d202e] border border-[#252839]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {typeof tab.badge === 'number' && tab.badge > 0 && (
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                        isActive ? 'bg-black text-[#d4af37]' : tab.badgeColor || 'bg-[#292e42] text-white'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* O'TKAZGICH (Interactive Horizontal Line Slider / Scrubber Track) */}
            <div className="flex items-center gap-2 pt-1 select-none">
              {/* Left Scroll Button */}
              <button
                type="button"
                onClick={() => scrollStep('left')}
                title="Chapga surish"
                className="p-1 rounded-md bg-[#161826] hover:bg-[#202438] border border-[#272b3d] text-[#d4af37] active:scale-90 transition-all shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Slider Track Line */}
              <div className="flex-1 relative flex items-center h-4.5 group cursor-pointer">
                {/* Visual Line Track */}
                <div className="w-full h-1.5 bg-[#171927] border border-[#282d42] rounded-full overflow-hidden relative shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4af37]/70 via-[#f3d069] to-[#d4af37] rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                    style={{ width: `${Math.max(8, scrollProgress)}%` }}
                  />
                </div>

                {/* Range Input for Drag & Scrubbing */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scrollProgress}
                  onChange={handleSliderChange}
                  aria-label="Modullarni o'tkazgich chizig'i orqali surish"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />

                {/* Tactile Golden Thumb / Scrubber Knob */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-b from-[#fae7a5] to-[#d4af37] border-2 border-[#0e1018] shadow-[0_0_12px_rgba(212,175,55,0.9)] pointer-events-none transition-transform group-hover:scale-125 z-10 flex items-center justify-center"
                  style={{ left: `${scrollProgress}%` }}
                >
                  <div className="w-1 h-1 rounded-full bg-black/60" />
                </div>
              </div>

              {/* Right Scroll Button */}
              <button
                type="button"
                onClick={() => scrollStep('right')}
                title="O'ngga surish"
                className="p-1 rounded-md bg-[#161826] hover:bg-[#202438] border border-[#272b3d] text-[#d4af37] active:scale-90 transition-all shrink-0"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Slider Label / Helper Tag */}
              <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-[#d4af37] bg-[#161826] border border-[#272b3d] px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm shrink-0">
                <span>↔ O'tkazgich</span>
              </div>
            </div>
          </div>

          {/* Quick info & Logout (Desktop Only) */}
          <div className="hidden xl:flex items-center gap-3 shrink-0">
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 bg-[#141824] px-2.5 py-1 rounded-lg border border-emerald-900/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Admin Boshqaruvi
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Admin Modules Drawer (Burger Menu for Admin) */}
      {isModuleDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 animate-fade-in">
          {/* Backdrop */}
          <div 
            onClick={() => setIsModuleDrawerOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Sliding Panel */}
          <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#0d0e16] border-l border-[#272b3c] shadow-2xl flex flex-col z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#202434] flex items-center justify-between bg-[#11131e]">
              <div>
                <div className="font-serif font-bold text-white text-xs tracking-wider">
                  ADMIN BOSHQARUV MODULLARI
                </div>
                <div className="text-[10px] text-[#d4af37] tracking-widest font-mono uppercase">
                  SAVORIA RESTAURANT
                </div>
              </div>
              <button
                onClick={() => setIsModuleDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-[#181a28] border border-[#272b3c] text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modules List */}
            <div className="p-4 space-y-2.5 flex-1">
              <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 px-1 font-bold">
                Kerakli Bo'limni Tanlang
              </div>

              {tabs.map(tab => {
                const isActive = adminSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-[#d4af37] text-neutral-950 font-bold border-[#d4af37] shadow-lg'
                        : 'bg-[#12141e] border-[#222536] text-neutral-300 hover:text-white hover:bg-[#1a1c2a]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-black/20 text-neutral-950' : 'bg-black/40 text-[#d4af37]'}`}>
                        {tab.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-2">
                          <span>{tab.label}</span>
                          {typeof tab.badge === 'number' && tab.badge > 0 && (
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                              isActive ? 'bg-black text-[#d4af37]' : tab.badgeColor || 'bg-[#292e42] text-white'
                            }`}>
                              {tab.badge}
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] line-clamp-1 ${isActive ? 'text-neutral-800' : 'text-neutral-400'}`}>
                          {tab.subLabel}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-neutral-950' : 'opacity-40'}`} />
                  </button>
                );
              })}

              {/* Quick Info & Logout */}
              <div className="pt-4 border-t border-[#1e2232] space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 px-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Boshqaruvi Faol</span>
                </div>

                <button
                  onClick={() => {
                    adminLogout();
                    setIsModuleDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#221316] border border-rose-900/50 text-rose-300 hover:bg-rose-950 text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav_logout')}</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#1e2230] bg-[#090a10] text-[11px] text-neutral-400 text-center font-mono">
              SAVORIA RESTAURANT · Admin Hub
            </div>
          </div>
        </div>
      )}

      {/* Active Tab View Body */}
      <div className="flex-1">
        {adminSubTab === 'kassa' && <KassaPOSView />}
        {adminSubTab === 'oshxona' && <OshxonaKDSView />}
        {adminSubTab === 'dostafka' && <DostavkaDispatchView />}
        {adminSubTab === 'xisobot' && <XisobotAnalyticsView />}
        {adminSubTab === 'menyu' && <AdminCatalogView />}
        {adminSubTab === 'stollar' && <TableManagementTab />}
        {adminSubTab === 'bronlar' && <AdminReservationsTab />}
        {adminSubTab === 'xodimlar' && (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <StaffManagementTab />
          </div>
        )}
      </div>
    </div>
  );
};
