import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, PaymentMethod } from '../types';
import { 
  Receipt, Search, Printer, Calendar, Clock, DollarSign, 
  CreditCard, Banknote, CheckCircle2, AlertCircle, Eye, 
  Filter, ArrowDownUp, RefreshCw, FileText, ChevronRight, User, Utensils
} from 'lucide-react';

export const ReceiptsHistoryView: React.FC = () => {
  const { orders, openReceiptModal, formatUZS, settings, waiters, tables } = useRestaurant();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'barchasi' | 'tolangan' | 'ochiq' | 'bugun' | 'dostavka'>('barchasi');
  const [paymentFilter, setPaymentFilter] = useState<'barchasi' | 'naqd' | 'uzcard_humo' | 'payme_click'>('barchasi');
  const [sortBy, setSortBy] = useState<'yangi' | 'qadimgi' | 'katta_summa' | 'kichik_summa'>('yangi');

  // Today Date String for matching (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);

  // Filtered and Sorted Receipts
  const filteredReceipts = useMemo(() => {
    return orders.filter(order => {
      // 1. Search Query Match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = order.id.toLowerCase().includes(q);
        const matchTable = (order.tableNumber || '').toLowerCase().includes(q);
        const matchCustomer = (order.customerName || '').toLowerCase().includes(q);
        const matchPhone = (order.customerPhone || '').toLowerCase().includes(q);
        const matchWaiter = (order.waiterName || '').toLowerCase().includes(q);
        const matchItems = order.items.some(i => i.name.toLowerCase().includes(q));

        if (!matchId && !matchTable && !matchCustomer && !matchPhone && !matchWaiter && !matchItems) {
          return false;
        }
      }

      // 2. Status / Period Tab Filter
      if (activeFilter === 'tolangan') {
        if (!order.isPaid && order.status !== 'yopildi') return false;
      } else if (activeFilter === 'ochiq') {
        if (order.isPaid || order.status === 'yopildi') return false;
      } else if (activeFilter === 'bugun') {
        const orderDate = (order.createdAt || '').slice(0, 10);
        if (orderDate !== todayStr) return false;
      } else if (activeFilter === 'dostavka') {
        if (order.type !== 'dostavka') return false;
      }

      // 3. Payment Method Filter
      if (paymentFilter !== 'barchasi') {
        if (order.paymentMethod !== paymentFilter) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'yangi') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'qadimgi') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'katta_summa') {
        return (b.finalTotal || 0) - (a.finalTotal || 0);
      }
      if (sortBy === 'kichik_summa') {
        return (a.finalTotal || 0) - (b.finalTotal || 0);
      }
      return 0;
    });
  }, [orders, searchQuery, activeFilter, paymentFilter, sortBy, todayStr]);

  // Summary Metrics
  const stats = useMemo(() => {
    const totalReceipts = orders.length;
    const todayOrders = orders.filter(o => (o.createdAt || '').slice(0, 10) === todayStr);
    const paidOrders = orders.filter(o => o.isPaid || o.status === 'yopildi');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const todayRevenue = todayOrders
      .filter(o => o.isPaid || o.status === 'yopildi')
      .reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const avgCheck = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    return {
      totalReceipts,
      todayReceiptsCount: todayOrders.length,
      totalRevenue,
      todayRevenue,
      avgCheck,
      paidCount: paidOrders.length,
      openCount: orders.length - paidOrders.length
    };
  }, [orders, todayStr]);

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getPaymentLabel = (method?: PaymentMethod) => {
    switch (method) {
      case 'uzcard_humo': return { label: 'Uzcard / Humo', icon: '💳', color: 'text-sky-400 bg-sky-950/40 border-sky-800/40' };
      case 'naqd': return { label: 'Naqd Pul', icon: '💵', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' };
      case 'payme_click': return { label: 'Payme / Click', icon: '📱', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' };
      case 'visa': return { label: 'Visa / MC', icon: '🌐', color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40' };
      default: return { label: 'Karta', icon: '💳', color: 'text-neutral-400 bg-neutral-900 border-neutral-700' };
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11131c] border border-[#23273c] p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#1f2233] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-lg sm:text-xl text-white tracking-wide">
                CHEKLAR TARIXI & ARXIVI
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-mono font-bold">
                {orders.length} ta chek
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Barcha kassa hisoblari, to‘langan cheklar, ofitsiantlar va fiskal kvitansiyalar arxivi
            </p>
          </div>
        </div>

        {/* Quick Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              if (orders.length > 0) openReceiptModal(orders[0]);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#1a1e2e] hover:bg-[#252a3f] text-neutral-200 border border-[#2b3046] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow"
          >
            <Printer className="w-4 h-4 text-[#d4af37]" />
            <span>Oxirgi Chekni Chop Etish</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Receipts */}
        <div className="bg-[#12141f] border border-[#23273a] p-3.5 sm:p-4 rounded-xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 font-medium block">Jami Cheklar</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
              {stats.totalReceipts} <span className="text-xs font-normal text-neutral-500">ta</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              ✓ {stats.paidCount} to‘langan · {stats.openCount} ochiq
            </span>
          </div>
        </div>

        {/* Today Revenue */}
        <div className="bg-[#12141f] border border-[#23273a] p-3.5 sm:p-4 rounded-xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-neutral-400 font-medium block">Bugungi Tushum</span>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-0.5 truncate">
              {formatUZS(stats.todayRevenue)}
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              Bugun: {stats.todayReceiptsCount} ta chek
            </span>
          </div>
        </div>

        {/* All-Time Total Revenue */}
        <div className="bg-[#12141f] border border-[#23273a] p-3.5 sm:p-4 rounded-xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-neutral-400 font-medium block">Umumiy Kassa Savdosi</span>
            <div className="text-base sm:text-lg font-bold font-mono text-[#d4af37] mt-0.5 truncate">
              {formatUZS(stats.totalRevenue)}
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              Barcha davrlar arxivi
            </span>
          </div>
        </div>

        {/* Average Check Value */}
        <div className="bg-[#12141f] border border-[#23273a] p-3.5 sm:p-4 rounded-xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-neutral-400 font-medium block">O‘rtacha Chek</span>
            <div className="text-base sm:text-lg font-bold font-mono text-sky-300 mt-0.5 truncate">
              {formatUZS(stats.avgCheck)}
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              Bitta buyurtmaga to‘g‘ri keladi
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#11131c] border border-[#212435] p-3.5 rounded-2xl space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Chek ID (#SAV-1081), Stol, Ofitsiant, Mijoz yoki taom nomi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0b10] border border-[#272b3e] focus:border-[#d4af37] rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Payment Method Selector & Sort */}
          <div className="flex items-center gap-2">
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value as any)}
              className="bg-[#0a0b10] border border-[#272b3e] text-xs text-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#d4af37]"
            >
              <option value="barchasi">Barcha to‘lov turlari</option>
              <option value="uzcard_humo">Uzcard / Humo</option>
              <option value="naqd">Naqd pul</option>
              <option value="payme_click">Payme / Click</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-[#0a0b10] border border-[#272b3e] text-xs text-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#d4af37]"
            >
              <option value="yangi">Eng yangi cheklar</option>
              <option value="qadimgi">Eski cheklar</option>
              <option value="katta_summa">Katta summa avval</option>
              <option value="kichik_summa">Kichik summa avval</option>
            </select>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-[#1a1c29]">
          {[
            { id: 'barchasi', label: 'Barcha Cheklar', count: orders.length },
            { id: 'bugun', label: 'Bugungi Cheklar', count: stats.todayReceiptsCount },
            { id: 'tolangan', label: 'To‘langan (Yopilgan)', count: stats.paidCount },
            { id: 'ochiq', label: 'Faol (Zalda ochiq)', count: stats.openCount },
            { id: 'dostavka', label: 'Dostavka Cheklari', count: orders.filter(o => o.type === 'dostavka').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#d4af37] text-neutral-950 font-bold shadow-md'
                  : 'bg-[#151724] text-neutral-400 hover:text-white border border-[#242738]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFilter === tab.id ? 'bg-neutral-950/20 text-neutral-950' : 'bg-[#202336] text-neutral-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Receipts List Table */}
      {filteredReceipts.length === 0 ? (
        <div className="p-12 text-center bg-[#11131c] border border-[#212435] rounded-2xl">
          <Receipt className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-sm">Mos cheklar topilmadi</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Qidiruv so‘zini o‘zgartiring yoki boshqa filtrni tanlang
          </p>
          {(searchQuery || activeFilter !== 'barchasi' || paymentFilter !== 'barchasi') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('barchasi');
                setPaymentFilter('barchasi');
              }}
              className="mt-3 px-4 py-1.5 rounded-xl bg-[#212435] text-neutral-200 text-xs hover:bg-[#2b3046] transition-colors"
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#11131c] border border-[#212435] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#212435] bg-[#161826] text-neutral-400 font-mono text-[11px]">
                  <th className="py-3 px-4">CHEK ID</th>
                  <th className="py-3 px-4">SANA & VAQT</th>
                  <th className="py-3 px-4">STOL / BUYURTMA</th>
                  <th className="py-3 px-4">XODIM / OFITSIANT</th>
                  <th className="py-3 px-4">BUYURTMA TARKIBI</th>
                  <th className="py-3 px-4 text-right">SUMMA</th>
                  <th className="py-3 px-4 text-center">TO‘LOV TURI</th>
                  <th className="py-3 px-4 text-center">HOLATI</th>
                  <th className="py-3 px-4 text-right">AMAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1e2c]">
                {filteredReceipts.map(order => {
                  const paymentInfo = getPaymentLabel(order.paymentMethod);
                  const isClosed = order.isPaid || order.status === 'yopildi';
                  const totalItemsQty = order.items.reduce((s, i) => s + (i.quantity || 1), 0);

                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-[#151824] transition-colors group cursor-pointer"
                      onClick={() => openReceiptModal(order)}
                    >
                      {/* Check ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span className="text-[#d4af37] hover:underline">#{order.id}</span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 font-mono text-neutral-300 whitespace-nowrap text-[11px]">
                        {formatDateTime(order.createdAt)}
                      </td>

                      {/* Table or Order Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold ${
                          order.type === 'zal'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : order.type === 'dostavka'
                            ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                            : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                        }`}>
                          {order.tableNumber || (order.type === 'dostavka' ? 'Dostavka' : 'Olib ketish')}
                        </span>
                      </td>

                      {/* Waiter / Staff */}
                      <td className="py-3.5 px-4 text-neutral-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-neutral-500" />
                          <span>{order.waiterName || order.courierName || 'Kassa operatori'}</span>
                        </div>
                      </td>

                      {/* Items Preview */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="truncate text-neutral-300 text-[11px]" title={order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}>
                          {order.items.slice(0, 2).map((i, idx) => (
                            <span key={idx} className="mr-1.5 inline-block bg-[#1d202e] px-1.5 py-0.5 rounded text-[10px]">
                              {i.quantity}x {i.name}
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-neutral-500 text-[10px]">
                              +{order.items.length - 2} ta
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                          Jami: {totalItemsQty} ta taom
                        </div>
                      </td>

                      {/* Final Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                        <div className="text-xs text-[#d4af37]">
                          {formatUZS(order.finalTotal)}
                        </div>
                        {order.serviceFeeAmount ? (
                          <div className="text-[10px] text-neutral-500">
                            + xizmat: {formatUZS(order.serviceFeeAmount)}
                          </div>
                        ) : null}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] border ${paymentInfo.color}`}>
                          <span>{paymentInfo.icon}</span>
                          <span>{paymentInfo.label}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isClosed
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                        }`}>
                          {isClosed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>To‘langan</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              <span>Ochiq hisob</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Action Button: Open & Print */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openReceiptModal(order);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#1f2335] hover:bg-[#d4af37] hover:text-neutral-950 text-neutral-200 border border-[#2e334a] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ml-auto shadow"
                          title="Fiskal chekni ochish va printerga chiqarish"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Chek</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3 bg-[#0d0e15] border-t border-[#1e2130] flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 font-mono gap-2">
            <div>
              Ko‘rsatilmoqda: <b className="text-white">{filteredReceipts.length}</b> ta chek (Jami: {orders.length})
            </div>
            <div className="text-right">
              Filtrlangan cheklar jami: <b className="text-[#d4af37]">{formatUZS(filteredReceipts.reduce((s, o) => s + (o.finalTotal || 0), 0))}</b>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
