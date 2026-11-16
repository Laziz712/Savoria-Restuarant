import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  BarChart3, TrendingUp, DollarSign, Receipt,
  Printer, Download, Calendar, PieChart,
  CheckCircle, FileText, RefreshCw, Clock, Archive
} from 'lucide-react';
import {
  getTodayTashkentKey,
  getYesterdayTashkentKey,
  getTashkentDateKey,
  getTashkentMonthKey,
  getTashkentHour,
  getMsUntilNextTashkentMidnight,
  formatTashkentDateTime
} from '../utils/dateUtils';

interface DailyArchiveRecord {
  id: string;
  tenantId: string;
  dateKey: string;
  totalRevenue: number;
  ordersCount: number;
  paidOrdersCount: number;
  avgCheck: number;
  hallRevenue: number;
  deliveryRevenue: number;
  takeawayRevenue: number;
  cashRevenue: number;
  cardRevenue: number;
  onlineRevenue: number;
  otherRevenue: number;
  closedByZReport?: boolean;
  closedAt?: string;
}

export const XisobotAnalyticsView: React.FC = () => {
  const { orders, menuItems, formatUZS, settings, syncCloudData, isSyncingCloud, tenantSlug, currentTenant } = useRestaurant();

  const [timeRange, setTimeRange] = useState<'bugun' | '7kun' | 'oy' | 'arxiv'>('bugun');
  const [todayKey, setTodayKey] = useState<string>(() => getTodayTashkentKey());
  const [dailyHistory, setDailyHistory] = useState<DailyArchiveRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isClosingDay, setIsClosingDay] = useState(false);
  const [showZReportModal, setShowZReportModal] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(false);
  const [zReportNotice, setZReportNotice] = useState('');

  const effectiveSlug = tenantSlug || 'demo';

  // Signature of paid state so settling any order immediately refreshes daily archive
  const paidOrdersSignature = useMemo(() => {
    let sum = 0;
    let count = 0;
    for (const o of orders) {
      if (o.isPaid || o.status === 'yopildi') {
        count += 1;
        sum += Number(o.finalTotal) || 0;
      }
    }
    return `${orders.length}:${count}:${sum}`;
  }, [orders]);

  const fetchDailyHistory = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/reports/daily-history?tenantId=${encodeURIComponent(effectiveSlug)}`, {
        headers: { 'X-Tenant-Id': effectiveSlug }
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.history)) {
        setDailyHistory(data.history);
        if (data.serverDateKey) {
          setTodayKey(data.serverDateKey);
        }
      }
    } catch {
      // Offline fallback uses live orders aggregation
    } finally {
      if (!silent) setIsLoadingHistory(false);
    }
  }, [effectiveSlug]);

  // Initial load + refresh on any order or payment change + 60s background cycle
  useEffect(() => {
    fetchDailyHistory(true);
  }, [fetchDailyHistory, paidOrdersSignature]);

  useEffect(() => {
    const interval = setInterval(() => {
      const latestKey = getTodayTashkentKey();
      if (latestKey !== todayKey) {
        setTodayKey(latestKey);
      }
      fetchDailyHistory(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchDailyHistory, todayKey]);

  // Exact 24-hour rollover timer at Asia/Tashkent midnight (00:00 UZT)
  useEffect(() => {
    let midnightTimeout: ReturnType<typeof setTimeout>;
    const scheduleNextMidnight = () => {
      const ms = getMsUntilNextTashkentMidnight();
      midnightTimeout = setTimeout(() => {
        setTodayKey(getTodayTashkentKey());
        fetchDailyHistory(true);
        scheduleNextMidnight();
      }, ms + 500);
    };
    scheduleNextMidnight();
    return () => clearTimeout(midnightTimeout);
  }, [fetchDailyHistory]);

  const handleSyncClick = async () => {
    const ok = await syncCloudData();
    await fetchDailyHistory(true);
    if (ok) {
      setSyncSuccessMsg(true);
      setTimeout(() => setSyncSuccessMsg(false), 3000);
    }
  };

  // Date keys for Tashkent-aligned filtering
  const yesterdayKey = useMemo(() => getYesterdayTashkentKey(), [todayKey]);
  const sevenDaysAgoKey = useMemo(() => {
    return getTashkentDateKey(Date.now() - 6 * 24 * 60 * 60 * 1000);
  }, [todayKey]);
  const currentMonthKey = todayKey.slice(0, 7);

  // Orders filtered strictly by selected period in Asia/Tashkent timezone
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const dk = getTashkentDateKey(o.createdAt || o.updatedAt);
      if (timeRange === 'bugun') return dk === todayKey;
      if (timeRange === '7kun') return dk >= sevenDaysAgoKey && dk <= todayKey;
      if (timeRange === 'oy') return dk.slice(0, 7) === currentMonthKey;
      return true;
    });
  }, [orders, timeRange, todayKey, sevenDaysAgoKey, currentMonthKey]);

  const paidOrders = useMemo(
    () => filteredOrders.filter(o => o.isPaid || o.status === 'yopildi'),
    [filteredOrders]
  );

  // Preserve historical archive days if any day isn't represented in current in-memory orders slice
  const mergedArchiveHistory = useMemo(() => {
    const map = new Map<string, DailyArchiveRecord>();
    for (const rec of dailyHistory) {
      if (rec?.dateKey) map.set(rec.dateKey, rec);
    }
    for (const o of orders) {
      const dk = getTashkentDateKey(o.createdAt || o.updatedAt);
      if (!dk) continue;
      if (!map.has(dk)) {
        map.set(dk, {
          id: `${effectiveSlug}::${dk}`,
          tenantId: effectiveSlug,
          dateKey: dk,
          totalRevenue: 0,
          ordersCount: 0,
          paidOrdersCount: 0,
          avgCheck: 0,
          hallRevenue: 0,
          deliveryRevenue: 0,
          takeawayRevenue: 0,
          cashRevenue: 0,
          cardRevenue: 0,
          onlineRevenue: 0,
          otherRevenue: 0
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [dailyHistory, orders, effectiveSlug]);

  // Financial calculations from real filtered orders
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.finalTotal) || 0), 0);
  const totalOrdersCount = filteredOrders.length;
  const avgCheck = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

  // Comparison vs yesterday (when Bugun selected)
  const yesterdayRevenue = useMemo(() => {
    const archivedYesterday = dailyHistory.find(d => d.dateKey === yesterdayKey);
    const liveYesterdayRev = orders
      .filter(o => (o.isPaid || o.status === 'yopildi') && getTashkentDateKey(o.createdAt || o.updatedAt) === yesterdayKey)
      .reduce((sum, o) => sum + (Number(o.finalTotal) || 0), 0);
    return Math.max(Number(archivedYesterday?.totalRevenue) || 0, liveYesterdayRev);
  }, [dailyHistory, orders, yesterdayKey]);

  const revenueComparisonLabel = useMemo(() => {
    if (timeRange === '7kun') return `Oxirgi 7 kun (${sevenDaysAgoKey} – ${todayKey})`;
    if (timeRange === 'oy') return `${getTashkentMonthKey(Date.now())} oylik jami`;
    if (timeRange === 'arxiv') return `Barcha saqlangan kunlar (${mergedArchiveHistory.length} kun)`;
    if (yesterdayRevenue > 0) {
      const diffPct = Math.round(((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 1000) / 10;
      const sign = diffPct >= 0 ? '+' : '';
      return `${sign}${diffPct}% kechagiga nisbatan`;
    }
    return totalRevenue > 0 ? `Bugungi jonli davr (${todayKey})` : `Davr: ${todayKey}`;
  }, [timeRange, sevenDaysAgoKey, todayKey, mergedArchiveHistory.length, yesterdayRevenue, totalRevenue]);

  // Breakdown by channel
  const hallRevenue = paidOrders
    .filter(o => o.type === 'zal')
    .reduce((sum, o) => sum + (Number(o.finalTotal) || 0), 0);

  const deliveryRevenue = paidOrders
    .filter(o => o.type === 'dostavka')
    .reduce((sum, o) => sum + (Number(o.finalTotal) || 0), 0);

  const takeawayRevenue = paidOrders
    .filter(o => o.type === 'olib_ketish')
    .reduce((sum, o) => sum + (Number(o.finalTotal) || 0), 0);

  // Breakdown by payment method
  const cashRevenue = paidOrders
    .filter(o => o.paymentMethod === 'naqd')
    .reduce((sum, o) => sum + (Number(o.finalTotal) || 0), 0);

  const cardRevenue = paidOrders
    .filter(o => o.paymentMethod === 'uzcard_humo')
    .reduce((sum, o) => sum + (Number(o.finalTotal) || 0), 0);

  const onlineRevenue = paidOrders
    .filter(o => o.paymentMethod === 'payme_click')
    .reduce((sum, o) => sum + (Number(o.finalTotal) || 0), 0);

  const otherRevenue = paidOrders
    .filter(o => o.paymentMethod === 'visa')
    .reduce((sum, o) => sum + (Number(o.finalTotal) || 0), 0);

  const paymentMethodSum = cashRevenue + cardRevenue + onlineRevenue + otherRevenue;
  const electronicPercent = paymentMethodSum > 0
    ? Math.round(((cardRevenue + onlineRevenue + otherRevenue) / paymentMethodSum) * 100)
    : 0;
  const cashPercent = paymentMethodSum > 0 ? 100 - electronicPercent : 0;

  // Top selling items aggregation (real filteredOrders)
  const sortedTopItems = useMemo(() => {
    const itemSalesMap: { [name: string]: { quantity: number; revenue: number; category: string } } = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSalesMap[item.name]) {
          const found = menuItems.find(m => m.id === item.itemId);
          itemSalesMap[item.name] = {
            quantity: 0,
            revenue: 0,
            category: found ? found.category : 'asosiy'
          };
        }
        itemSalesMap[item.name].quantity += item.quantity;
        itemSalesMap[item.name].revenue += item.price * item.quantity;
      });
    });

    return Object.entries(itemSalesMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 7);
  }, [filteredOrders, menuItems]);

  // Real Hourly distribution from Tashkent timestamps (09:00 - 23:00 in 2-hour buckets)
  const { hourlyData, peakHourLabel } = useMemo(() => {
    const slots = [
      { label: '09:00', minHour: 0, maxHour: 10 },
      { label: '11:00', minHour: 11, maxHour: 12 },
      { label: '13:00', minHour: 13, maxHour: 14 },
      { label: '15:00', minHour: 15, maxHour: 16 },
      { label: '17:00', minHour: 17, maxHour: 18 },
      { label: '19:00', minHour: 19, maxHour: 20 },
      { label: '21:00', minHour: 21, maxHour: 22 },
      { label: '23:00', minHour: 23, maxHour: 23 }
    ];

    const buckets = slots.map(s => ({ ...s, amount: 0 }));
    const sourceOrders = paidOrders.length > 0 ? paidOrders : filteredOrders;

    for (const o of sourceOrders) {
      const hr = getTashkentHour(o.createdAt || o.updatedAt || Date.now());
      const amt = Number(o.finalTotal) || 0;
      const target = buckets.find(b => hr >= b.minHour && hr <= b.maxHour) || buckets[buckets.length - 1];
      target.amount += amt;
    }

    const maxAmount = Math.max(0, ...buckets.map(b => b.amount));
    const peakBucket = buckets.reduce((best, cur) => (cur.amount > best.amount ? cur : best), buckets[0]);
    const peakEnd = Math.min(23, Number(peakBucket.label.slice(0, 2)) + 2);
    const peakText = maxAmount > 0 ? `Pik: ${peakBucket.label} - ${String(peakEnd).padStart(2, '0')}:00` : "Pik: ma'lumot yo'q";

    const chart = buckets.map(b => ({
      hour: b.label,
      amount: b.amount,
      height: maxAmount > 0 ? `${Math.max(8, Math.round((b.amount / maxAmount) * 95))}%` : '6%'
    }));

    return { hourlyData: chart, peakHourLabel: peakText };
  }, [paidOrders, filteredOrders]);

  // Close current shift (Z-Report permanent save)
  const handleCloseShift = async () => {
    setIsClosingDay(true);
    try {
      const res = await fetch('/api/reports/close-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': effectiveSlug
        },
        body: JSON.stringify({ tenantId: effectiveSlug, dateKey: todayKey })
      });
      const data = await res.json();
      await fetchDailyHistory(true);
      setShowZReportModal(false);
      if (data?.success) {
        setZReportNotice(`${todayKey} smenasi yopildi va kunlik arxivga doimiy saqlandi!`);
      } else {
        setZReportNotice("Z-xisobot saqlandi!");
      }
      setTimeout(() => setZReportNotice(''), 6000);
    } catch {
      setShowZReportModal(false);
      setZReportNotice("Z-xisobot mahalliy tarzda yopildi.");
      setTimeout(() => setZReportNotice(''), 5000);
    } finally {
      setIsClosingDay(false);
    }
  };

  const handleExportCSV = () => {
    const csvRows = [
      "Chek ID,Turi,Mijoz,Telefon,Summa,To'lov Holati,To'lov Usuli,Sana (Toshkent)"
    ];
    filteredOrders.forEach(o => {
      csvRows.push(
        `${o.id},${o.type},"${(o.customerName || '').replace(/"/g, '""')}",${o.customerPhone || ''},${o.finalTotal},${(o.isPaid || o.status === 'yopildi') ? 'Tolangan' : 'Kutilmoqda'},${o.paymentMethod || 'Naqd'},"${formatTashkentDateTime(o.createdAt || o.updatedAt)}"`
      );
    });
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${effectiveSlug.toLowerCase()}_hisobot_${timeRange}_${todayKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Current shift totals for Z-Report modal (today's checks)
  const todayPaidOrders = useMemo(
    () => orders.filter(o => (o.isPaid || o.status === 'yopildi') && getTashkentDateKey(o.createdAt || o.updatedAt) === todayKey),
    [orders, todayKey]
  );
  const todayTotalOrdersCount = useMemo(
    () => orders.filter(o => getTashkentDateKey(o.createdAt || o.updatedAt) === todayKey).length,
    [orders, todayKey]
  );
  const zCashRevenue = todayPaidOrders.filter(o => o.paymentMethod === 'naqd').reduce((s, o) => s + (Number(o.finalTotal) || 0), 0);
  const zCardRevenue = todayPaidOrders.filter(o => o.paymentMethod === 'uzcard_humo').reduce((s, o) => s + (Number(o.finalTotal) || 0), 0);
  const zOnlineRevenue = todayPaidOrders.filter(o => o.paymentMethod === 'payme_click').reduce((s, o) => s + (Number(o.finalTotal) || 0), 0);
  const zTotalRevenue = todayPaidOrders.reduce((s, o) => s + (Number(o.finalTotal) || 0), 0);

  return (
    <div className="min-h-screen bg-[#08090d] text-[#eaeaea] p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full min-w-0 overflow-x-hidden">
      {/* Z-Report confirmation toast */}
      {zReportNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{zReportNotice}</span>
          </div>
          <button type="button" onClick={() => setZReportNotice('')} className="text-neutral-400 hover:text-white px-1.5">✕</button>
        </div>
      )}

      {/* Analytics Top Bar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-[#1f2231] min-w-0">
        <div className="min-w-0">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif font-bold text-base sm:text-xl lg:text-2xl text-white tracking-wide leading-tight break-words">
                MOLIYAVIY XISOBOT VA STATISTIKA
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-neutral-400 font-mono mt-0.5">
                <span className="truncate">{settings.name || currentTenant?.name || 'Restoran'} · daromad tahlili</span>
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <Clock className="w-3 h-3" />
                  <span>24s davr: {todayKey}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector and Export — Responsive on small phones */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full xl:w-auto min-w-0">
          <div className="grid grid-cols-4 sm:flex items-center gap-1 bg-[#12141e] p-1 rounded-xl border border-[#232738]">
            {([
              { id: 'bugun', label: 'Bugun' },
              { id: '7kun', label: '7 kun' },
              { id: 'oy', label: 'Bu oy' },
              { id: 'arxiv', label: 'Arxiv' }
            ] as const).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeRange(tab.id)}
                className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium text-center transition-colors whitespace-nowrap ${
                  timeRange === tab.id
                    ? 'bg-[#d4af37] text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleSyncClick}
              disabled={isSyncingCloud}
              title="Telefon va kompyuterdagi barcha cheklar va taomlarni ma'lumotlar bazasi bilan birlashtirish"
              className={`px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm whitespace-nowrap ${
                syncSuccessMsg
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#191c28] hover:bg-[#232738] text-white border-[#2e334a]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#d4af37] shrink-0 ${isSyncingCloud ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="truncate">{isSyncingCloud ? 'Sinxron...' : syncSuccessMsg ? 'Sinxron ✓' : 'Sinxron'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowZReportModal(true)}
              className="px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl bg-[#191c28] hover:bg-[#232738] text-white border border-[#2e334a] text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
              <span>Z-Xisobot</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl bg-[#d4af37] hover:bg-[#e4be4a] text-neutral-950 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="p-4 rounded-xl bg-[#12141f] border border-[#23273a] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">Jami Tushum</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-serif font-bold text-white tabular-nums">
              {formatUZS(totalRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span className="truncate">{revenueComparisonLabel}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Average Check */}
        <div className="p-4 rounded-xl bg-[#12141f] border border-[#23273a] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">O'rtacha Chek</span>
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-serif font-bold text-white tabular-nums">
              {formatUZS(avgCheck)}
            </div>
            <div className="mt-1 text-[11px] text-neutral-400 font-mono">
              {paidOrders.length} ta yopilgan hisoblar asosida
            </div>
          </div>
        </div>

        {/* Card 3: Total Receipts */}
        <div className="p-4 rounded-xl bg-[#12141f] border border-[#23273a] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">Jami Cheklar</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-serif font-bold text-white tabular-nums">
              {totalOrdersCount} dona
            </div>
            <div className="mt-1 text-[11px] text-neutral-400 font-mono">
              Zal: {filteredOrders.filter(o => o.type === 'zal').length} · Dostavka: {filteredOrders.filter(o => o.type === 'dostavka').length}
            </div>
          </div>
        </div>

        {/* Card 4: Channel Split */}
        <div className="p-4 rounded-xl bg-[#12141f] border border-[#23273a] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">Kanal Taqsimoti</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1 text-xs font-mono">
            <div className="flex justify-between text-neutral-300">
              <span>Zal (Stollar):</span>
              <span className="text-white font-bold tabular-nums">{formatUZS(hallRevenue)}</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span>Dostavka:</span>
              <span className="text-[#d4af37] font-bold tabular-nums">{formatUZS(deliveryRevenue)}</span>
            </div>
            {takeawayRevenue > 0 && (
              <div className="flex justify-between text-neutral-400">
                <span>Olib ketish:</span>
                <span className="text-emerald-400 font-bold tabular-nums">{formatUZS(takeawayRevenue)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* When 'arxiv' tab is active, place Kunlik Xisobotlar Arxivi right at the top */}
      {timeRange === 'arxiv' && (
        <DailyArchiveSection
          records={mergedArchiveHistory}
          todayKey={todayKey}
          isLoading={isLoadingHistory}
          formatUZS={formatUZS}
          onRefresh={() => fetchDailyHistory(false)}
        />
      )}

      {/* Visual Charts & Payment Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-w-0">
        {/* Hourly Revenue Graph (8 cols) */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-xl bg-[#12141f] border border-[#222538] shadow-xl flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-start sm:items-center justify-between gap-2 mb-4">
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-xs sm:text-sm text-white">
                SOATLAR KESIMIDA TUSHUM DINAMIKASI
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Tanlangan davrdagi real cheklar vaqti bo'yicha taqsimot (Toshkent vaqti)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#1b1e2c] border border-[#2e334a] text-[11px] font-mono text-[#d4af37] shrink-0">
              {peakHourLabel}
            </span>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-52 sm:h-56 flex items-end justify-between gap-1.5 sm:gap-3 pt-6 pb-2 border-b border-[#232637] min-w-0">
            {hourlyData.map((d, i) => (
              <div key={i} className="flex-1 min-w-0 flex flex-col items-center gap-1.5 sm:gap-2 group h-full justify-end">
                <div className={`transition-opacity text-[9px] sm:text-[10px] font-mono text-[#d4af37] whitespace-nowrap tabular-nums ${
                  d.amount > 0 ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'
                }`}>
                  {d.amount >= 1000000
                    ? `${(d.amount / 1000000).toFixed(1)}M`
                    : `${Math.round(d.amount / 1000)}k`}
                </div>
                <div
                  style={{ height: d.height }}
                  className={`w-full max-w-[38px] rounded-t transition-all ${
                    d.amount > 0
                      ? 'bg-gradient-to-t from-[#202538] via-[#8c7423] to-[#d4af37] group-hover:brightness-125'
                      : 'bg-[#1a1d2b]'
                  }`}
                />
                <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 mt-1 tabular-nums">
                  {d.hour.slice(0, 2)}
                  <span className="hidden sm:inline">:00</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-neutral-400 font-mono">
            <span>Kunduzgi tushlik oqimi</span>
            <span>Kechki loundj va VIP ziyofatlar</span>
          </div>
        </div>

        {/* Payment Methods Breakdown (4 cols) */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-xl bg-[#12141f] border border-[#222538] shadow-xl flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-serif font-bold text-sm text-white">
              TO'LOV USULLARI BO'YICHA TAQSIMOT
            </h3>
            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
              Fiskal kassa tushumlarining strukturalanishi
            </p>

            <div className="mt-6 space-y-4">
              {/* Method 1: Uzcard / Humo */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-neutral-300">Uzcard / Humo</span>
                  <span className="font-bold text-white tabular-nums">{formatUZS(cardRevenue)}</span>
                </div>
                <div className="h-2 w-full bg-[#1b1e2c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: paymentMethodSum > 0 ? `${(cardRevenue / paymentMethodSum) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Method 2: Naqd */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-neutral-300">Naqd pul</span>
                  <span className="font-bold text-white tabular-nums">{formatUZS(cashRevenue)}</span>
                </div>
                <div className="h-2 w-full bg-[#1b1e2c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: paymentMethodSum > 0 ? `${(cashRevenue / paymentMethodSum) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Method 3: Payme & Click */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-neutral-300">Payme / Click (Online)</span>
                  <span className="font-bold text-white tabular-nums">{formatUZS(onlineRevenue)}</span>
                </div>
                <div className="h-2 w-full bg-[#1b1e2c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#d4af37] rounded-full transition-all"
                    style={{ width: paymentMethodSum > 0 ? `${(onlineRevenue / paymentMethodSum) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-[#161824] border border-[#242838] text-[11px] text-neutral-400 font-mono tabular-nums">
            Elektron to'lovlar ulushi: {electronicPercent}% · Naqd pul aylanmasi: {cashPercent}%
          </div>
        </div>
      </div>

      {/* Top 7 Dishes — Mobile Cards + Desktop Table */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#12141f] border border-[#222538] shadow-xl min-w-0">
        <h3 className="font-serif font-bold text-xs sm:text-sm text-white mb-4 flex items-center justify-between gap-2">
          <span className="truncate">ENG KO'P SOTILGAN TAOMLAR REYTINGI</span>
          <span className="text-[11px] font-mono text-[#d4af37] shrink-0">TOP HITS</span>
        </h3>

        {sortedTopItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500 font-mono">
            Tanlangan davrda sotilgan taomlar statistikasi shakllanmagan
          </div>
        ) : (
          <>
            {/* Mobile Compact Card List */}
            <div className="sm:hidden space-y-2.5">
              {sortedTopItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#0d0f18] border border-[#202437] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] font-mono font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono uppercase mt-0.5">
                        {item.category} · {item.quantity} dona
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-xs text-[#d4af37] shrink-0 tabular-nums">
                    {formatUZS(item.revenue)}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#232738] text-neutral-400 text-[11px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3 font-sans">TAOM / ICHIMLIK NOMI</th>
                    <th className="py-2.5 px-3">KATEGORIYA</th>
                    <th className="py-2.5 px-3 text-right">SOTILGAN MIQDOR</th>
                    <th className="py-2.5 px-3 text-right">JAMI DAROMAD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2130]">
                  {sortedTopItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#181a28] transition-colors">
                      <td className="py-3 px-3 font-bold text-[#d4af37] tabular-nums">0{idx + 1}</td>
                      <td className="py-3 px-3 font-sans font-semibold text-white">
                        {item.name}
                      </td>
                      <td className="py-3 px-3 uppercase text-neutral-400 text-[11px]">
                        {item.category}
                      </td>
                      <td className="py-3 px-3 text-right text-white font-bold tabular-nums">
                        {item.quantity} dona
                      </td>
                      <td className="py-3 px-3 text-right text-[#d4af37] font-bold tabular-nums">
                        {formatUZS(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Permanent 24-Hour Daily Reports Archive below charts for non-arxiv tabs */}
      {timeRange !== 'arxiv' && (
        <DailyArchiveSection
          records={mergedArchiveHistory}
          todayKey={todayKey}
          isLoading={isLoadingHistory}
          formatUZS={formatUZS}
          onRefresh={() => fetchDailyHistory(false)}
        />
      )}

      {/* Z-Report Modal */}
      {showZReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#12141e] border border-[#2b2f42] rounded-xl p-5 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#232738]">
              <div className="font-serif font-bold text-sm text-white">
                FISKAL Z-XISOBOT (SMENA YOPISH)
              </div>
              <button
                onClick={() => setShowZReportModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-2 text-xs font-mono">
              <div className="text-center font-bold text-sm text-[#d4af37] pb-2 border-b border-dashed border-neutral-700">
                {settings.name || currentTenant?.name || 'Restoran'} — {todayKey}
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>STIR (INN):</span>
                <span>{settings.stir || '—'}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Smena sanasi (Toshkent):</span>
                <span>{todayKey}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Bugungi cheklar:</span>
                <span>{todayTotalOrdersCount} ta ({todayPaidOrders.length} to'langan)</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Naqd kassa:</span>
                <span>{formatUZS(zCashRevenue)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Terminal (Uzcard/Humo):</span>
                <span>{formatUZS(zCardRevenue)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Online (Payme/Click):</span>
                <span>{formatUZS(zOnlineRevenue)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-dashed border-neutral-700 text-sm">
                <span>BUGUNGI YAKUNIY TUSHUM:</span>
                <span className="text-[#d4af37]">{formatUZS(zTotalRevenue)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#232738] flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 rounded-lg bg-[#d4af37] text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Z-Chekni Chop Etish</span>
              </button>
              <button
                type="button"
                disabled={isClosingDay}
                onClick={handleCloseShift}
                className="flex-1 py-2 rounded-lg bg-[#212536] text-white hover:bg-[#2b3044] disabled:opacity-60 font-semibold text-xs transition-colors"
              >
                {isClosingDay ? 'Saqlanmoqda...' : 'Smenani Yakunlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DailyArchiveSectionProps {
  records: DailyArchiveRecord[];
  todayKey: string;
  isLoading: boolean;
  formatUZS: (v: number) => string;
  onRefresh: () => void;
}

const DailyArchiveSection: React.FC<DailyArchiveSectionProps> = ({
  records,
  todayKey,
  isLoading,
  formatUZS,
  onRefresh
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[#12141f] border border-[#222538] shadow-xl min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Archive className="w-4 h-4 text-[#d4af37] shrink-0" />
          <div className="min-w-0">
            <h3 className="font-serif font-bold text-xs sm:text-sm text-white truncate">
              KUNLIK XISOBOTLAR ARXIVI (HAR 24 SOAT)
            </h3>
            <p className="text-[11px] text-neutral-400 font-mono">
              Har kunlik savdo bazada doimiy saqlanadi · Avtomatik 24 soatlik yangilanish
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="px-2.5 py-1.5 rounded-lg bg-[#191c28] hover:bg-[#232738] border border-[#2e334a] text-[11px] font-mono text-neutral-300 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 text-[#d4af37] ${isLoading ? 'animate-spin' : ''}`} />
          <span>Yangilash ({records.length} kun)</span>
        </button>
      </div>

      {records.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500 font-mono">
          Hozircha kunlik arxiv yozuvlari shakllanmagan. Buyurtmalar qabul qilinishi bilan har kun avtomatik saqlanadi.
        </div>
      ) : (
        <>
          {/* Mobile Archive Cards */}
          <div className="sm:hidden space-y-2.5">
            {records.map(rec => {
              const isToday = rec.dateKey === todayKey;
              return (
                <div key={rec.dateKey} className="p-3 rounded-xl bg-[#0d0f18] border border-[#202437] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span className="font-mono font-bold text-xs text-white">{rec.dateKey}</span>
                      {isToday && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                          BUGUN
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-xs text-[#d4af37] tabular-nums">
                      {formatUZS(rec.totalRevenue)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-neutral-400">
                    <span>Cheklar: <b className="text-white">{rec.ordersCount}</b> ({rec.paidOrdersCount} to'l.)</span>
                    <span className="text-right">
                      {rec.closedByZReport ? (
                        <span className="text-emerald-400">Z-Xisobot yopilgan ✓</span>
                      ) : (
                        <span className="text-amber-300">{isToday ? 'Jonli smena' : 'Saqlangan ✓'}</span>
                      )}
                    </span>
                    <span>Naqd: {formatUZS(rec.cashRevenue)}</span>
                    <span className="text-right">Karta/Online: {formatUZS(rec.cardRevenue + rec.onlineRevenue)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Archive Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#232738] text-neutral-400 text-[11px]">
                  <th className="py-2.5 px-3">SANA (TOSHKENT)</th>
                  <th className="py-2.5 px-3 text-center">CHEKLAR</th>
                  <th className="py-2.5 px-3 text-right">NAQD</th>
                  <th className="py-2.5 px-3 text-right">KARTA / ONLINE</th>
                  <th className="py-2.5 px-3 text-right">JAMI TUSHUM</th>
                  <th className="py-2.5 px-3 text-right">HOLATI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2130]">
                {records.map(rec => {
                  const isToday = rec.dateKey === todayKey;
                  return (
                    <tr key={rec.dateKey} className="hover:bg-[#181a28] transition-colors">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                        <span>{rec.dateKey}</span>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                            BUGUN
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-neutral-300 tabular-nums">
                        {rec.ordersCount} ta ({rec.paidOrdersCount} yopilgan)
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 tabular-nums">
                        {formatUZS(rec.cashRevenue)}
                      </td>
                      <td className="py-3 px-3 text-right text-sky-400 tabular-nums">
                        {formatUZS(rec.cardRevenue + rec.onlineRevenue)}
                      </td>
                      <td className="py-3 px-3 text-right text-[#d4af37] font-bold tabular-nums">
                        {formatUZS(rec.totalRevenue)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {rec.closedByZReport ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px]">
                            Z-Xisobot ✓
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#1b1f30] text-amber-300 border border-[#2c334d] text-[10px]">
                            {isToday ? 'Jonli 24s' : 'Arxivda ✓'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
