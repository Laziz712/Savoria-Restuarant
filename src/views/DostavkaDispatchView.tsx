import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, Courier } from '../types';
import { 
  Bike, MapPin, Phone, User, Clock, CheckCircle, 
  Navigation, AlertCircle, Printer, Car, Shield, ChevronRight
} from 'lucide-react';

export const DostavkaDispatchView: React.FC = () => {
  const { 
    orders, couriers, assignCourier, updateOrderStatus, 
    openReceiptModal, formatUZS 
  } = useRestaurant();

  const [filterStatus, setFilterStatus] = useState<'barchasi' | 'kutilmoqda' | 'yolda' | 'yetkazildi'>('barchasi');
  const [selectedCourierForOrder, setSelectedCourierForOrder] = useState<{ [orderId: string]: string }>({});

  // Delivery orders only
  const deliveryOrders = orders.filter(o => o.type === 'dostavka');

  const filteredOrders = deliveryOrders.filter(o => {
    if (filterStatus === 'kutilmoqda') return o.status === 'yangi' || o.status === 'oshxonada' || o.status === 'tayyor';
    if (filterStatus === 'yolda') return o.status === 'yolda';
    if (filterStatus === 'yetkazildi') return o.status === 'yetkazildi' || o.status === 'yopildi';
    return true;
  });

  const handleAssign = (orderId: string) => {
    const courierId = selectedCourierForOrder[orderId] || couriers[0]?.id;
    if (courierId) {
      assignCourier(orderId, courierId);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090e] text-[#eaeaea] p-4 sm:p-6 flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-[#1f2231]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-wide">
                DOSTAVKA LOGISTIKASI & KURYERLAR
              </h1>
              <p className="text-xs text-neutral-400 font-mono">
                Toshkent bo'ylab ekspress yetkazib berish nazorati
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#12141d] p-1 rounded-lg border border-[#232637]">
          {(['barchasi', 'kutilmoqda', 'yolda', 'yetkazildi'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                filterStatus === tab
                  ? 'bg-[#d4af37] text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab === 'barchasi' ? 'Barchasi' : tab === 'kutilmoqda' ? 'Tayyorlanmoqda' : tab === 'yolda' ? 'Yo\'lda' : 'Yetkazildi'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid: Orders + Courier Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Delivery Order Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#11131b] border border-[#212433]">
              <Bike className="w-12 h-12 text-neutral-600 mx-auto stroke-1" />
              <p className="text-sm text-neutral-400 mt-3 font-semibold">
                Ushbu holatda dostavka buyurtmalari yo'q
              </p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.id}
                className="p-4 sm:p-5 rounded-xl bg-[#12141f] border border-[#242839] hover:border-[#d4af37]/40 transition-all flex flex-col gap-4 shadow-lg"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#212435]">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-base text-white">
                      {order.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      order.status === 'yolda'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : order.status === 'yetkazildi'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {order.status === 'yolda' ? 'Kuryer yo\'lda' : order.status === 'yetkazildi' ? 'Yetkazildi' : 'Oshxonada'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#d4af37] tabular-nums">
                      {formatUZS(order.finalTotal)}
                    </span>
                    <button
                      onClick={() => openReceiptModal(order)}
                      className="p-1.5 rounded-lg bg-[#1c1f2e] text-neutral-400 hover:text-white border border-[#2d3246]"
                      title="Chekni ko'rish"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Customer and Address Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-neutral-400">
                      <User className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-white font-semibold">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                      <a href={`tel:${order.customerPhone}`} className="text-[#d4af37] font-mono hover:underline">
                        {order.customerPhone}
                      </a>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-start gap-2 text-neutral-400">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-white leading-snug">{order.deliveryAddress || 'Toshkent shahar'}</span>
                    </div>
                    {order.deliveryNotes && (
                      <div className="text-[11px] text-neutral-400 italic pl-5.5">
                        * {order.deliveryNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ordered Items Preview */}
                <div className="p-2.5 rounded-lg bg-[#0e1017] border border-[#1f2231] text-xs font-mono">
                  <div className="text-[11px] text-neutral-500 mb-1">Buyurtma tarkibi:</div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, i) => (
                      <span key={i} className="text-neutral-300">
                        {item.quantity}x {item.name}
                        {i < order.items.length - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Courier Assignment & Action Bar */}
                <div className="pt-3 border-t border-[#202434] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {order.courierName ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                      <span className="text-neutral-400">Biriktirilgan kuryer:</span>
                      <span className="font-bold text-white">{order.courierName}</span>
                      <span className="text-neutral-500 font-mono">({order.courierPhone})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedCourierForOrder[order.id] || ''}
                        onChange={e => setSelectedCourierForOrder({ ...selectedCourierForOrder, [order.id]: e.target.value })}
                        className="bg-[#0b0c12] border border-[#2a2e41] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="">Kuryer tanlang...</option>
                        {couriers.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.vehicle.toUpperCase()} - {c.status})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(order.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#d4af37] text-neutral-950 font-semibold text-xs hover:bg-[#e6c14c] transition-colors"
                      >
                        Biriktirish
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {order.status === 'yolda' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'yetkazildi')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Yetkazildi deb belgilash</span>
                      </button>
                    )}

                    {order.status === 'tayyor' && !order.courierName && (
                      <span className="text-xs text-amber-400 font-mono">
                        Taom tayyor, kuryer kutilmoqda
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Active Fleet & Simulated Radar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Courier Fleet Roster */}
          <div className="p-4 rounded-xl bg-[#12141e] border border-[#232738] shadow-xl">
            <h3 className="font-serif font-bold text-sm text-white mb-3 flex items-center justify-between">
              <span>KURYERLAR SAFI</span>
              <span className="text-xs font-mono text-neutral-400">{couriers.length} kuryer</span>
            </h3>

            <div className="space-y-2.5">
              {couriers.map(c => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-[#171926] border border-[#272b3c] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{c.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-[#242838] text-neutral-300">
                        {c.vehicle}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{c.phone}</div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      c.status === 'bosh' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {c.status === 'bosh' ? 'Bo\'sh' : 'Band'}
                    </span>
                    <div className="text-[10px] text-neutral-500 mt-1">
                      {c.activeOrdersCount} buyurtma
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated Live GPS Map Radar */}
          <div className="p-4 rounded-xl bg-[#12141e] border border-[#232738] shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#d4af37]" />
                <span>Jonli Xarita Radar</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                GPS ONLINE
              </span>
            </div>

            {/* Radar Canvas Simulation */}
            <div className="relative aspect-video w-full rounded-lg bg-[#0b0c12] border border-[#202332] overflow-hidden flex items-center justify-center">
              {/* Grid map lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2438_1px,transparent_1px),linear-gradient(to_bottom,#1f2438_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
              
              {/* Savoria HQ Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-[#d4af37] border-2 border-white shadow-[0_0_12px_#d4af37] flex items-center justify-center text-[8px] font-bold text-black">
                  S
                </div>
                <span className="text-[9px] font-mono text-[#d4af37] font-bold mt-1 bg-black/70 px-1 rounded">
                  Savoria HQ
                </span>
              </div>

              {/* Courier Pin 1 */}
              <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-white shadow-[0_0_8px_#3b82f6]"></div>
                <span className="text-[8px] font-mono text-blue-300 bg-black/80 px-1 rounded mt-0.5">
                  Farxod (Navoiy)
                </span>
              </div>

              {/* Courier Pin 2 */}
              <div className="absolute bottom-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white shadow-[0_0_8px_#10b981]"></div>
                <span className="text-[8px] font-mono text-emerald-300 bg-black/80 px-1 rounded mt-0.5">
                  Jasur (Mustaqillik)
                </span>
              </div>

              {/* Radar sweep line */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none"></div>
            </div>
            
            <p className="text-[10px] text-neutral-400 mt-2 font-mono">
              Yetkazish radiusi: 15 km · O'rtacha yetkazish vaqti: 32 daqiqa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
