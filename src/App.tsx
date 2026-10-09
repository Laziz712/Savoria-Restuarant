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
import { ShieldCheck, Lock, Sparkles, MapPin, Phone } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    activeRoute, setRoute, settings, isAdminAuthenticated, 
    setShowAdminLoginModal 
  } = useRestaurant();

  const handleAdminNavClick = () => {
    if (!isAdminAuthenticated) {
      setShowAdminLoginModal(true);
    } else {
      setRoute('admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#eaeaea] flex flex-col font-sans">
      {/* Top Navbar strictly containing Menyu & Buyurtma and Admin Panel */}
      <Navbar />

      {/* Main View Router */}
      <div className="flex-1">
        {activeRoute === 'mijoz' && <CustomerMenuView />}
        {activeRoute === 'ofitsiant' && <WaiterOrderView />}
        {activeRoute === 'admin' && <AdminHubView />}
      </div>


      {/* Admin Security Password Login Modal (Password: laziz712) */}
      <AdminLoginModal />

      {/* Thermal Receipt Modal (Active when check opened or paid) */}
      <ThermalReceiptModal />

      {/* Luxury Footer */}
      <footer className="border-t border-[#1b1e2a] bg-[#07080c] py-10 px-4 sm:px-6 lg:px-8 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-white tracking-widest text-sm">
                {settings.name}
              </span>
              <span className="text-[10px] text-[#d4af37] font-mono border border-[#d4af37]/30 px-1.5 py-0.2 rounded">
                FINE DINING & LOUNGE
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              {settings.address} · {settings.phone}
            </p>
          </div>

          {/* Quick Route Links strictly to Root and Admin */}
          <div className="flex items-center gap-5 text-xs font-mono text-neutral-400">
            <button
              onClick={() => setRoute('mijoz')}
              className="hover:text-[#d4af37] transition-colors"
            >
              https://savoria-restaurant.uz/
            </button>
            <span>·</span>
            <button
              onClick={handleAdminNavClick}
              className="hover:text-[#d4af37] transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3 text-[#d4af37]" />
              <span>Admin Panel (laziz712)</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-500 font-mono text-center md:text-right">
            © 2026 Savoria Restaurant & Lounge. Barcha huquqlar himoyalangan.
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
