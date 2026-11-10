import React, { useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Bell, CheckCircle2, Clock, X, Radio, ArrowRight } from 'lucide-react';

export const RealtimeToastBanner: React.FC = () => {
  const { realtimeToast, dismissRealtimeToast, isRealtimeConnected, setRoute, setAdminSubTab, isAdminAuthenticated } = useRestaurant();

  useEffect(() => {
    if (!realtimeToast) return;
    const timer = setTimeout(() => {
      dismissRealtimeToast();
    }, 5000);
    return () => clearTimeout(timer);
  }, [realtimeToast, dismissRealtimeToast]);

  if (!realtimeToast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-bounce-short">
      <div className="bg-[#121522] border-2 border-[#ea580c] text-white p-4 rounded-2xl shadow-[0_10px_35px_rgba(234,88,12,0.35)] backdrop-blur-xl relative overflow-hidden flex items-start gap-3">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#ea580c]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-[#ea580c]/20 border border-[#ea580c]/50 flex items-center justify-center text-orange-400 shrink-0">
          {realtimeToast.type === 'order' && <Bell className="w-5 h-5 animate-pulse" />}
          {realtimeToast.type === 'status' && <Clock className="w-5 h-5" />}
          {realtimeToast.type === 'waiter' && <Radio className="w-5 h-5 text-amber-400 animate-ping" />}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-orange-400 tracking-wide font-mono uppercase">
              {realtimeToast.title}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-neutral-200 mt-0.5 line-clamp-2 font-medium">
            {realtimeToast.message}
          </p>

          {isAdminAuthenticated && (
            <button
              onClick={() => {
                setRoute('admin');
                setAdminSubTab('kassa');
                dismissRealtimeToast();
              }}
              className="mt-2 text-[11px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Kassada Ko‘rish</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={dismissRealtimeToast}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
