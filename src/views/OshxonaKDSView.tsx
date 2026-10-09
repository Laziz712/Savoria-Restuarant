import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, OrderStatus } from '../types';
import { 
  Flame, Clock, CheckCircle, AlertTriangle, BellRing, 
  Filter, UtensilsCrossed, Check, Play, UserCheck, Bike
} from 'lucide-react';

export const OshxonaKDSView: React.FC = () => {
  const { 
    orders, updateOrderStatus, toggleOrderItemReady, 
    playOrderChime, soundEnabled, toggleSound, formatUZS 
  } = useRestaurant();

  const [activeStationFilter, setActiveStationFilter] = useState<'barchasi' | 'mangal' | 'oshxona' | 'bar' | 'salat'>('barchasi');
  const [, setNow] = useState<number>(Date.now());

  // Update timer every 10 seconds for ticket wait times
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter kitchen-relevant orders
  const kitchenOrders = orders.filter(
    o => o.status === 'yangi' || o.status === 'oshxonada' || o.status === 'tayyor'
  );

  const getElapsedTimeMinutes = (createdAt: string) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    return Math.floor(elapsedMs / (1000 * 60));
  };

  const stations = [
    { id: 'barchasi', label: 'Barcha stansiyalar' },
    { id: 'oshxona', label: 'Asosiy Oshpaz' },
    { id: 'mangal', label: 'Mangal & Steyk' },
    { id: 'salat', label: 'Salat & Sovuq' },
    { id: 'bar', label: 'Bar & Ichimlik' },
  ];

  return (
    <div className="min-h-screen bg-[#08090d] text-[#eaeaea] p-4 sm:p-6 flex flex-col gap-5">
      {/* KDS Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-[#1c1f2b]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-wide">
                OSHXONA MONITORI (KDS)
              </h1>
              <p className="text-xs text-neutral-400 font-mono">
                Real-vaqtli buyurtmalar oqimi va tayyorlash nazorati
              </p>
            </div>
          </div>
        </div>

        {/* Station Filter Tabs & Sound Bell */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 bg-[#10121a] p-1 rounded-lg border border-[#1f2231]">
            {stations.map(st => (
              <button
                key={st.id}
                onClick={() => setActiveStationFilter(st.id as typeof activeStationFilter)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  activeStationFilter === st.id
                    ? 'bg-[#d4af37] text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              playOrderChime();
            }}
            title="Qo'ng'iroq ovozini sinash"
            className="p-2 rounded-lg bg-[#151722] border border-[#272b3c] text-[#d4af37] hover:bg-[#1e2130] transition-colors flex items-center gap-1.5 text-xs font-mono"
          >
            <BellRing className="w-4 h-4" />
            <span className="hidden sm:inline">Qo'ng'iroq (Chime)</span>
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="text-center py-24 bg-[#0d0f16] rounded-2xl border border-[#1b1e2a]">
          <UtensilsCrossed className="w-16 h-16 text-neutral-600 mx-auto stroke-1" />
          <h3 className="font-serif font-bold text-lg text-white mt-3">
            Oshxonada Navbat Bo'sh
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Barcha taomlar pishirilgan va mijozlarga yetkazilgan! Yangi buyurtmalar avtomatik chiqadi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {kitchenOrders.map(order => {
            const elapsedMins = getElapsedTimeMinutes(order.createdAt);
            
            // Visual Urgency styling based on wait time
            const isUrgent = elapsedMins >= 15;
            const isWarning = elapsedMins >= 10 && elapsedMins < 15;

            // Filter items by station if filter chosen
            const displayItems = activeStationFilter === 'barchasi'
              ? order.items
              : order.items.filter(i => i.station === activeStationFilter);

            if (displayItems.length === 0 && activeStationFilter !== 'barchasi') {
              return null;
            }

            const allItemsReady = order.items.every(i => i.isReady);

            return (
              <div
                key={order.id}
                className={`rounded-xl border flex flex-col justify-between overflow-hidden transition-all shadow-xl ${
                  isUrgent
                    ? 'bg-[#181112] border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                    : isWarning
                    ? 'bg-[#181510] border-amber-500/50'
                    : 'bg-[#11131c] border-[#222638]'
                }`}
              >
                {/* Ticket Top Header */}
                <div className={`p-3.5 border-b flex items-center justify-between ${
                  isUrgent ? 'border-rose-900/60 bg-rose-950/30' : 'border-[#222638] bg-[#161824]'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-white">
                        {order.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        order.type === 'zal' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {order.type === 'zal' ? (order.tableNumber || 'Zal') : 'Dostavka'}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {order.waiterName || order.customerName}
                    </div>
                  </div>

                  {/* Elapsed Timer Counter */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-xs font-bold ${
                    isUrgent
                      ? 'bg-rose-500 text-white animate-pulse'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-[#1c2030] text-emerald-400 border border-[#2b3048]'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsedMins} daqiqa</span>
                  </div>
                </div>

                {/* Items Checklist for Chef */}
                <div className="p-4 flex-1 space-y-3">
                  <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono flex justify-between">
                    <span>Taomlar ro'yxati</span>
                    <span>Tayyorlik</span>
                  </div>

                  <div className="space-y-2">
                    {displayItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleOrderItemReady(order.id, item.itemId)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          item.isReady
                            ? 'bg-emerald-950/20 border-emerald-600/40 opacity-70 line-through text-neutral-400'
                            : 'bg-[#161926] border-[#262b3d] text-white hover:border-[#d4af37]'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#d4af37]">
                              {item.quantity}x
                            </span>
                            <span className="text-xs font-semibold leading-snug">
                              {item.name}
                            </span>
                          </div>
                          {item.notes && (
                            <div className="text-[11px] text-amber-300/90 font-mono mt-1 pl-5">
                              ⚠️ Izoh: {item.notes}
                            </div>
                          )}
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5 pl-5">
                            Stansiya: {item.station.toUpperCase()}
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                          item.isReady
                            ? 'bg-emerald-500 border-emerald-400 text-black'
                            : 'border-neutral-600'
                        }`}>
                          {item.isReady && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Action Footer */}
                <div className="p-3.5 bg-[#141622] border-t border-[#202434] flex items-center justify-between gap-2">
                  <div className="text-[11px] font-mono">
                    <span className="text-neutral-400">Holat: </span>
                    <span className={`font-bold uppercase ${
                      order.status === 'tayyor' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'yangi' ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'oshxonada')}
                        className="px-3 py-1.5 rounded-lg bg-[#252a3d] hover:bg-[#323953] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-600"
                      >
                        <Play className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Boshlash</span>
                      </button>
                    ) : null}

                    {order.status !== 'tayyor' ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'tayyor')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Tayyor Bo'ldi</span>
                      </button>
                    ) : (
                      <div className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Ofitsiantga chaqirildi</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
