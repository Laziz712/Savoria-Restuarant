/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Navbar } from './components/Navbar';
import { CustomerMenuView } from './views/CustomerMenuView';
import { AdminHubView } from './views/AdminHubView';
import { WaiterOrderView } from './views/WaiterOrderView';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { QrDigitalMenuView } from './views/QrDigitalMenuView';
import { 
  ShoppingBag, UtensilsCrossed, ShieldCheck, Lock, Mail, Instagram, Bell
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    activeRoute, setRoute, isAdminAuthenticated, 
    setShowAdminLoginModal, orders, t,
    isMenuOnlyMode, currentTableContext, callWaiterFromTable
  } = useRestaurant();

  const [waiterCalledMob, setWaiterCalledMob] = React.useState(false);

  const handleAdminNavClick = () => {
    if (!isAdminAuthenticated) {
      setShowAdminLoginModal(true);
    } else {
      setRoute('admin');
    }
  };

  const pendingOrdersCount = orders.filter(o => o.status !== 'yopildi').length;

  // When QR code is scanned or table mode is active: Render strictly the pure OsonMenu-style Digital QR Menu!
  if (isMenuOnlyMode) {
    return (
      <div className="min-h-screen bg-[#08090f] text-[#eaeaea] font-sans selection:bg-[#d4af37]/30 selection:text-white">
        <QrDigitalMenuView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#eaeaea] flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-white">
      {/* Top Navbar strictly containing Menyu, Ofitsiant and Admin Panel */}
      <Navbar />

      {/* Main View Router */}
      <div className="flex-1 pb-20 md:pb-0">
        {activeRoute === 'mijoz' && <CustomerMenuView />}
        {activeRoute === 'ofitsiant' && <WaiterOrderView />}
        {activeRoute === 'admin' && <AdminHubView />}
      </div>

      {/* Mobile Sticky Bottom Navigation Bar (Phone-friendly touch controls) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0e15]/95 backdrop-blur-lg border-t border-[#232738] px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl">
        {isMenuOnlyMode ? (
          /* Table Guest Mode: Only Menu & Call Waiter Controls */
          <>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex flex-col items-center gap-1 py-1 px-4 rounded-lg text-[11px] font-medium text-[#d4af37]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shohona Menyu</span>
            </button>

            <button
              onClick={() => {
                callWaiterFromTable(currentTableContext || 'Stol');
                setWaiterCalledMob(true);
                setTimeout(() => setWaiterCalledMob(false), 3500);
              }}
              className={`flex items-center gap-1.5 py-1.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                waiterCalledMob
                  ? 'bg-emerald-500 text-neutral-950'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-amber-500/20'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{waiterCalledMob ? 'Chaqirildi!' : 'Ofitsiantni Chaqirish'}</span>
            </button>

            <div className="flex flex-col items-center text-[10px] font-mono text-neutral-400">
              <span className="text-amber-400 font-bold">📍 {currentTableContext || 'Stol'}</span>
              <span className="text-[9px] text-emerald-400">Jonli Menyu</span>
            </div>
          </>
        ) : (
          /* Standard Full Navigation */
          <>
            <button
              onClick={() => setRoute('mijoz')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-colors ${
                activeRoute === 'mijoz'
                  ? 'text-[#d4af37]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('nav_menu')}</span>
            </button>

            <button
              onClick={() => setRoute('ofitsiant')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-colors ${
                activeRoute === 'ofitsiant'
                  ? 'text-[#d4af37]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>{t('nav_waiter')}</span>
            </button>

            <button
              onClick={handleAdminNavClick}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-colors relative ${
                activeRoute === 'admin'
                  ? 'text-[#d4af37]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <div className="relative">
                {isAdminAuthenticated ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {pendingOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#d4af37] text-neutral-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                    {pendingOrdersCount}
                  </span>
                )}
              </div>
              <span>{t('nav_admin')}</span>
            </button>
          </>
        )}
      </div>

      {/* Admin Security Password Login Modal */}
      <AdminLoginModal />

      {/* Thermal Receipt Modal (Active when check opened or paid) */}
      <ThermalReceiptModal />

      {/* Luxury Footer Matching Screenshot 10 */}
      <footer className="border-t border-[#1b1e2a] bg-[#07080c] pt-14 pb-12 px-4 sm:px-6 lg:px-8 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto">
          {/* 4-Column Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#181b28]">
            {/* Column 1: Brand & Bio */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border border-[#ea580c]/50 bg-gradient-to-br from-[#2a1810] to-[#12131a] flex items-center justify-center text-orange-400 font-serif font-bold text-sm shadow-[0_0_12px_rgba(234,88,12,0.25)]">
                  S
                </div>
                <div className="font-serif font-bold text-white tracking-wider text-base">
                  SAVORIA RESTAURANT
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Toshkentning eng nufuzli milliy va premium restorani. Sharqona mehmondo‘stlik va yuksak gastronomiya san’ati.
              </p>
              <div className="text-[11px] text-amber-400/90 font-medium">
                ★ 4.9/5.0 (500+ mamnun mehmonlar)
              </div>
            </div>

            {/* Column 2: Bog‘lanish */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-white text-sm tracking-wide uppercase">
                Bog‘lanish
              </h4>
              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">📍</span>
                  <span>Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko'chasi 45-uy</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">📞</span>
                  <a href="tel:+998712007112" className="hover:text-orange-400 font-mono transition-colors">
                    +998 71 200-71-12
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">✉️</span>
                  <a href="mailto:lazizshavkatov712@gmail.com" className="hover:text-orange-400 transition-colors">
                    lazizshavkatov712@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Ish Vaqti */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-white text-sm tracking-wide uppercase">
                Ish Vaqti
              </h4>
              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex justify-between">
                  <span className="text-neutral-400">Dushanba - Yakshanba:</span>
                  <span className="font-mono text-white">10:00 - 23:30</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-neutral-400">Osh va Tandir:</span>
                  <span className="font-mono text-white">11:30 dan</span>
                </li>
                <li className="pt-2 border-t border-[#181b28]">
                  <span className="text-orange-400 font-medium">Jonli Musiqa Oqshomi:</span>
                  <div className="text-[11px] text-neutral-400 mt-0.5">Juma - Yakshanba (19:30 - 23:00)</div>
                </li>
              </ul>
            </div>

            {/* Column 4: Tarmoqlar & Admin */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-white text-sm tracking-wide uppercase">
                Ijtimoiy Tarmoqlar
              </h4>
              <div className="flex flex-col gap-2">
                <a
                  href="https://t.me/lazizshavkatov712"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-neutral-300 hover:text-orange-400 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#141724] border border-[#282d42] group-hover:border-orange-500/60 flex items-center justify-center text-orange-400 transition-all">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.74-.56 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.23 0 .37z" />
                    </svg>
                  </div>
                  <span className="text-xs font-mono">@lazizshavkatov712</span>
                </a>

                <a
                  href="https://instagram.com/shavkatovv.o07"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-neutral-300 hover:text-orange-400 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#141724] border border-[#282d42] group-hover:border-orange-500/60 flex items-center justify-center text-orange-400 transition-all">
                    <Instagram className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-mono">@shavkatovv.o07</span>
                </a>

                <div className="pt-1">
                  <button
                    onClick={handleAdminNavClick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141624] hover:bg-[#1f2336] border border-[#282d42] hover:border-orange-500/50 text-neutral-300 hover:text-white transition-all text-xs"
                  >
                    <Lock className="w-3.5 h-3.5 text-orange-400" />
                    <span>Admin Panel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright and URL Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-500 text-[11px]">
            <div>
              © 2026 SAVORIA RESTAURANT. Barcha huquqlar himoyalangan.
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setRoute('mijoz')}
                className="hover:text-orange-400 transition-colors font-mono"
              >
                https://savoria-restaurant.uz/
              </button>
              <span>·</span>
              <span>100% Halol Kafolati</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <AppContent />
    </RestaurantProvider>
  );
}
