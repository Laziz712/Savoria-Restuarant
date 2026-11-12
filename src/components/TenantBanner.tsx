import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { AlertTriangle, Sparkles, RefreshCw, ShoppingCart, Clock, ShieldAlert } from 'lucide-react';

export const TenantBanner: React.FC = () => {
  const { currentTenant, isDemoMode, activeRoute, navigateTo, resetDemoData } = useRestaurant();

  if (isDemoMode) {
    return (
      <aside aria-label="Demo holati" className="bg-gradient-to-r from-[#2a1d0d] via-[#1f160b] to-[#2a1d0d] border-b border-[#d4af37]/40 px-3 py-2 text-xs text-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            <span className="font-semibold text-[#d4af37] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              DEMO REJIMI:
            </span>
            <span className="text-neutral-300">
              Barcha funksiyalar sinov uchun to'liq ochiq.
              {activeRoute === 'admin' ? (
                <span className="ml-1 text-amber-300 font-mono font-bold">(Tezkor PIN: 1111)</span>
              ) : (
                <span className="ml-1 text-neutral-400">Admin panelni ko'rish: /demo/admin</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetDemoData}
              title="Demo ma'lumotlarini asl toza holatiga qaytarish"
              className="px-2.5 py-1 rounded bg-[#16120c] hover:bg-[#231b11] border border-[#d4af37]/30 text-amber-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Demoni Tiklash</span>
            </button>

            <button
              onClick={() => navigateTo('/buy')}
              className="px-3 py-1 rounded bg-gradient-to-r from-[#d4af37] to-[#e4be4a] text-neutral-950 font-bold hover:brightness-110 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <ShoppingCart className="w-3 h-3" />
              <span>SaaS Sotib Olish</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  if (!currentTenant) return null;

  // Expired subscription banner
  if (currentTenant.isExpired || currentTenant.status === 'expired') {
    return (
      <aside aria-label="Obuna muddati tugagan" className="bg-rose-950/90 border-b border-rose-500/50 px-4 py-2.5 text-xs text-rose-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <span className="font-bold text-white uppercase tracking-wider">Obuna Muddati Tugagan!</span>
            <span>Restoran tizimi hozirda faqat ko'rish rejimida ishlamoqda. Yangi buyurtma kiritish cheklangan.</span>
          </div>
          <a
            href="https://t.me/lazizshavkatov712"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded bg-rose-500 hover:bg-rose-400 text-white font-bold transition-colors shrink-0 shadow"
          >
            Obunani Uzaytirish (@lazizshavkatov712)
          </a>
        </div>
      </aside>
    );
  }

  // Blocked status
  if (currentTenant.status === 'blocked') {
    return (
      <aside aria-label="Restoran bloklangan" className="bg-red-950 border-b border-red-600 px-4 py-2.5 text-xs text-red-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-bold text-white">Diqqat: Ushbu restoran akkaunti vaqtincha bloklangan.</span>
          </div>
          <a
            href="https://t.me/lazizshavkatov712"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold text-white hover:text-red-300"
          >
            Qo'llab-quvvatlash bilan bog'lanish
          </a>
        </div>
      </aside>
    );
  }

  // Warning when less than 7 days left
  if (typeof currentTenant.daysRemaining === 'number' && currentTenant.daysRemaining <= 7 && currentTenant.daysRemaining >= 0) {
    return (
      <aside aria-label="Obuna tugash ogohlantirishi" className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span>
              Hurmatli <strong>{currentTenant.name}</strong>! Obunangiz tugashiga{' '}
              <strong className="text-white underline">{currentTenant.daysRemaining} kun</strong> qoldi. Uzluksiz ishlash uchun muddatni uzaytiring.
            </span>
          </div>
          <a
            href="https://t.me/lazizshavkatov712"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-colors shrink-0"
          >
            Uzaytirish
          </a>
        </div>
      </aside>
    );
  }

  return null;
};
