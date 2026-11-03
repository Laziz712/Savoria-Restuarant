import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Bell, X, Check, Volume2, AlertCircle, AlertTriangle, Sparkles } from 'lucide-react';

export const PushNotificationToast: React.FC = () => {
  const { activePushAlert, dismissPushAlert, playOrderChime } = useRestaurant();

  if (!activePushAlert) return null;

  const isUrgent = activePushAlert.priority === 'urgent';
  const isAlert = activePushAlert.priority === 'alert';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-lg animate-bounce-short">
      <div 
        className={`relative rounded-2xl p-4 sm:p-5 shadow-[0_15px_50px_rgba(0,0,0,0.85)] border transition-all ${
          isUrgent 
            ? 'bg-[#1a0f12] border-rose-500 shadow-rose-950/50' 
            : isAlert 
              ? 'bg-[#19150d] border-[#d4af37] shadow-amber-950/50' 
              : 'bg-[#0f121e] border-blue-500/60 shadow-blue-950/40'
        }`}
      >
        {/* Subtle top glow bar */}
        <div 
          className={`absolute top-0 left-6 right-6 h-1 rounded-full ${
            isUrgent ? 'bg-rose-500 animate-pulse' : isAlert ? 'bg-[#d4af37] animate-pulse' : 'bg-blue-400'
          }`} 
        />

        <div className="flex items-start gap-3.5">
          {/* Icon Badge */}
          <div 
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              isUrgent 
                ? 'bg-rose-600 text-white animate-pulse' 
                : isAlert 
                  ? 'bg-gradient-to-br from-[#d4af37] to-[#997c22] text-neutral-950 font-bold' 
                  : 'bg-blue-600 text-white'
            }`}
          >
            {isUrgent ? (
              <AlertTriangle className="w-6 h-6 animate-spin-slow" />
            ) : isAlert ? (
              <Bell className="w-6 h-6 animate-bounce" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold tracking-wider ${
                isUrgent 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                  : isAlert 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              }`}>
                {activePushAlert.target === 'table' 
                  ? `📍 ${activePushAlert.targetTable || 'Stol'}` 
                  : activePushAlert.target === 'waiters' 
                    ? '👨‍🍳 Ofitsiantlar' 
                    : activePushAlert.target === 'customers' 
                      ? '🍽️ Mijozlar' 
                      : '📢 Barcha Foydalanuvchilar'}
              </span>

              <span className="text-[10px] text-neutral-400 font-mono">
                {activePushAlert.sender || 'Administrator'}
              </span>
            </div>

            <h4 className="font-serif font-bold text-white text-sm sm:text-base leading-snug">
              {activePushAlert.title}
            </h4>

            <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
              {activePushAlert.message}
            </p>

            {/* Action Bar */}
            <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={playOrderChime}
                className="text-[11px] font-mono text-amber-400/90 hover:text-amber-300 flex items-center gap-1 transition-colors"
                title="Qo'ng'iroq ovozini takrorlash"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Ovoz</span>
              </button>

              <button
                type="button"
                onClick={dismissPushAlert}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
                  isUrgent 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                    : 'bg-[#d4af37] hover:bg-[#e5c158] text-neutral-950'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Tushundim</span>
              </button>
            </div>
          </div>

          {/* Quick close cross */}
          <button
            type="button"
            onClick={dismissPushAlert}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
