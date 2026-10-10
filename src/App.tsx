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
import { 
  ShoppingBag, UtensilsCrossed, ShieldCheck, Lock, Mail, Instagram
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    activeRoute, setRoute, isAdminAuthenticated, 
    setShowAdminLoginModal, orders, t 
  } = useRestaurant();

  const handleAdminNavClick = () => {
    if (!isAdminAuthenticated) {
      setShowAdminLoginModal(true);
    } else {
      setRoute('admin');
    }
  };

  const pendingOrdersCount = orders.filter(o => o.status !== 'yopildi').length;

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#eaeaea] flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-white">
      {/* Top Navbar strictly containing Menyu, Ofitsiant and Admin Panel */}
      <Navbar />

      {/* Main View Router */}
      <div className="flex-1 pb-16 md:pb-0">
        {activeRoute === 'mijoz' && <CustomerMenuView />}
        {activeRoute === 'ofitsiant' && <WaiterOrderView />}
        {activeRoute === 'admin' && <AdminHubView />}
      </div>

      {/* Mobile Sticky Bottom Navigation Bar (Phone-friendly touch controls) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0e15]/95 backdrop-blur-lg border-t border-[#232738] px-3 py-2 flex items-center justify-around shadow-2xl">
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
      </div>

      {/* Admin Security Password Login Modal */}
      <AdminLoginModal />

      {/* Thermal Receipt Modal (Active when check opened or paid) */}
      <ThermalReceiptModal />

      {/* Luxury Footer */}
      <footer className="border-t border-[#1b1e2a] bg-[#07080c] py-8 px-4 sm:px-6 lg:px-8 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-5 text-center">
          {/* Brand Name: SAVORIA RESTAURANT */}
          <div className="font-serif font-bold text-white tracking-widest text-lg sm:text-xl">
            SAVORIA RESTAURANT
          </div>

          {/* Root Link & Clean Admin Panel Button (WITHOUT laziz712 text) */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-neutral-400">
            <button
              onClick={() => setRoute('mijoz')}
              className="hover:text-[#d4af37] transition-colors"
            >
              https://savoria-restaurant.uz/
            </button>
            <span className="text-neutral-600">·</span>
            <button
              onClick={handleAdminNavClick}
              className="hover:text-[#d4af37] transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Admin Panel</span>
            </button>
          </div>

          {/* Social Icons at the very bottom: Telegram, Instagram, Email */}
          <div className="pt-2 border-t border-[#161822] w-full flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {/* Telegram */}
            <a
              href="https://t.me/lazizshavkatov712"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-neutral-400 hover:text-[#d4af37] transition-colors"
              title="Telegram: @lazizshavkatov712"
            >
              <div className="w-7 h-7 rounded-full bg-[#141724] border border-[#282d42] group-hover:border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] transition-all shadow-sm">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.74-.56 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.23 0 .37z" />
                </svg>
              </div>
              <span className="text-xs font-mono font-medium">@lazizshavkatov712</span>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/shavkatovv.o07"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-neutral-400 hover:text-[#d4af37] transition-colors"
              title="Instagram: @shavkatovv.o07"
            >
              <div className="w-7 h-7 rounded-full bg-[#141724] border border-[#282d42] group-hover:border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] transition-all shadow-sm">
                <Instagram className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-mono font-medium">@shavkatovv.o07</span>
            </a>

            {/* Email */}
            <a
              href="mailto:lazizshavkatov712@gmail.com"
              className="group flex items-center gap-2 text-neutral-400 hover:text-[#d4af37] transition-colors"
              title="Email: @lazizshavkatov712"
            >
              <div className="w-7 h-7 rounded-full bg-[#141724] border border-[#282d42] group-hover:border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] transition-all shadow-sm">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-mono font-medium">@lazizshavkatov712</span>
            </a>
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
