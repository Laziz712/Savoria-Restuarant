import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  TrendingUp, DollarSign, ShoppingBag, Calendar, ArrowUpRight, 
  RefreshCw, Award, PieChart as PieIcon, BarChart3, Clock, 
  CreditCard, Smartphone, CheckCircle2, ChevronRight, Layers,
  Utensils, Bike, Sparkles
} from 'lucide-react';

interface SalesDashboardData {
  kpis: {
    totalRevenue: number;
    todayRevenue: number;
    thisWeekRevenue: number;
    thisMonthRevenue: number;
    totalOrdersCount: number;
    todayOrdersCount: number;
    avgCheck: number;
    growthPercentage: number;
    profitMarginRate: number;
  };
  dailyTrends: Array<{
    date: string;
    fullDate: string;
    daromad: number;
    buyurtmalar: number;
    zal: number;
    dostavka: number;
    avgCheck: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    daromad: number;
    buyurtmalar: number;
    zal: number;
    dostavka: number;
    sofFoyda: number;
  }>;
  channelDistribution: Array<{
    name: string;
    value: number;
    count: number;
    percentage: number;
    color: string;
  }>;
  paymentDistribution: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  hourlyTrends: Array<{
    hour: string;
    tushum: number;
    buyurtmalar: number;
  }>;
  topDishes: Array<{
    name: string;
    category: string;
    quantity: number;
    revenue: number;
  }>;
}

export const SalesDashboardView: React.FC = () => {
  const { orders, formatUZS, mongoStatus, isRealtimeConnected, tenantSlug } = useRestaurant();

  const [period, setPeriod] = useState<'kunlik' | 'oylik'>('kunlik');
  const [metricView, setMetricView] = useState<'daromad' | 'buyurtmalar' | 'ikkalasi'>('daromad');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<SalesDashboardData | null>(null);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('');

  const fetchSalesData = async () => {
    setIsLoading(true);
    try {
      const slug = tenantSlug || 'demo';
      const res = await fetch(`/api/analytics/sales-dashboard?tenantId=${encodeURIComponent(slug)}`, {
        headers: { 'X-Tenant-Id': slug }
      });
      const data = await res.json();
      if (data && data.success) {
        setDashboardData(data);
        setLastRefreshedTime(new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.warn('Sales dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [orders.length, tenantSlug]); // Auto-refresh when new orders arrive or tenant changes

  // Custom Dark Glass Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0e101a]/95 border border-[#2e334a] p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[170px]">
          <div className="font-bold text-white border-b border-[#222538] pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-neutral-400 font-sans">Statistika</span>
          </div>
          {payload.map((entry: any, index: number) => {
            const isCount = entry.dataKey === 'buyurtmalar';
            const valueFormatted = isCount 
              ? `${entry.value} ta buyurtma` 
              : formatUZS(entry.value);

            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}:</span>
                </span>
                <span className="font-bold text-white">{valueFormatted}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const kpis = dashboardData?.kpis || {
    totalRevenue: 63005800,
    todayRevenue: 4850000,
    thisWeekRevenue: 32400000,
    thisMonthRevenue: 54600000,
    totalOrdersCount: 521,
    todayOrdersCount: 38,
    avgCheck: 142000,
    growthPercentage: 18.4,
    profitMarginRate: 42
  };

  const dailyTrends = dashboardData?.dailyTrends || [];
  const monthlyTrends = dashboardData?.monthlyTrends || [];
  const channelDistribution = dashboardData?.channelDistribution || [];
  const paymentDistribution = dashboardData?.paymentDistribution || [];
  const hourlyTrends = dashboardData?.hourlyTrends || [];
  const topDishes = dashboardData?.topDishes || [];

  const chartData: Array<Record<string, any>> = period === 'kunlik'
    ? dailyTrends.map(d => ({ ...d, label: d.date }))
    : monthlyTrends.map(m => ({ ...m, label: m.month }));

  const barData: Array<Record<string, any>> = period === 'kunlik'
    ? dailyTrends.slice(-7).map(d => ({ ...d, label: d.date }))
    : monthlyTrends.slice(-6).map(m => ({ ...m, label: m.month }));

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header with Period Controls and Live Badge */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 sm:p-6 bg-[#11131e] border border-[#24283c] rounded-3xl shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-40 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b38a1a] text-neutral-950 flex items-center justify-center font-bold shadow-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wide">
                  SAVDO BOSHQARUV PANELI
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isRealtimeConnected ? 'Jonli Real-Time' : 'MongoDB Atlas'}</span>
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Backend API umumlashtirilgan tahlillari va Recharts interaktiv vizualizatsiyasi
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Period Toggle */}
          <div className="flex items-center bg-[#090a10] border border-[#24283c] p-1 rounded-xl">
            <button
              onClick={() => setPeriod('kunlik')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                period === 'kunlik'
                  ? 'bg-[#d4af37] text-neutral-950 font-bold shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              📅 Kunlik Tendensiyalar
            </button>
            <button
              onClick={() => setPeriod('oylik')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                period === 'oylik'
                  ? 'bg-[#d4af37] text-neutral-950 font-bold shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              📊 Oylik Tendensiyalar
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchSalesData}
            disabled={isLoading}
            title="Ma'lumotlarni qayta yangilash"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161826] hover:bg-[#202336] border border-[#2a2f47] text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#d4af37]' : ''}`} />
            <span className="hidden sm:inline">Yangilash</span>
            {lastRefreshedTime && <span className="text-[10px] text-neutral-500 font-mono">({lastRefreshedTime})</span>}
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#11131d] border border-[#23273a] relative overflow-hidden group hover:border-[#d4af37]/50 transition-all shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Umumiy Daromad</span>
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            {formatUZS(kpis.totalRevenue)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{kpis.growthPercentage}%
            </span>
            <span className="text-neutral-400 text-[11px]">o‘tgan davrga nisbatan</span>
          </div>
        </div>

        {/* Card 2: Today Revenue */}
        <div className="p-5 rounded-2xl bg-[#11131d] border border-[#23273a] relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Bugungi Savdo</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            {formatUZS(kpis.todayRevenue)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
            <span className="font-bold text-white">{kpis.todayOrdersCount} ta</span>
            <span className="text-[11px]">bugungi yopilgan buyurtma</span>
          </div>
        </div>

        {/* Card 3: Monthly Total */}
        <div className="p-5 rounded-2xl bg-[#11131d] border border-[#23273a] relative overflow-hidden group hover:border-sky-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Oylik Ko‘rsatkich</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            {formatUZS(kpis.thisMonthRevenue)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
            <span className="text-sky-400 font-semibold">{kpis.totalOrdersCount} jami buyurtma</span>
          </div>
        </div>

        {/* Card 4: Average Check & Profit Margin */}
        <div className="p-5 rounded-2xl bg-[#11131d] border border-[#23273a] relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">O‘rtacha Chek</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300 tracking-tight">
            {formatUZS(kpis.avgCheck)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
            <span className="text-purple-400 font-semibold font-mono">~{kpis.profitMarginRate}%</span>
            <span className="text-[11px]">taxminiy sof foyda marjasi</span>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY BIG CHART: Revenue & Orders Trend (AreaChart) */}
      <div className="p-5 sm:p-6 bg-[#11131e] border border-[#24283c] rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
              <h3 className="font-serif font-bold text-white text-base tracking-wide">
                {period === 'kunlik' ? 'KUNLIK DAROMAD VA SAVDO TENDENSIYASI' : 'OYLIK DAROMAD VA DINAMIKA TAHLILI'}
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {period === 'kunlik' 
                ? 'Oxirgi 10 kun bo‘yicha har kungi umumiy tushum va buyurtmalar hajmi'
                : 'Oylar kesimida umumiy tushum, sof foyda va hajm ko‘rsatkichlari'}
            </p>
          </div>

          {/* Metric View Switcher */}
          <div className="flex items-center bg-[#0a0c12] border border-[#232738] p-1 rounded-xl text-xs">
            <button
              onClick={() => setMetricView('daromad')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                metricView === 'daromad' ? 'bg-[#1e2236] text-[#d4af37] font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Tushum (UZS)
            </button>
            <button
              onClick={() => setMetricView('buyurtmalar')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                metricView === 'buyurtmalar' ? 'bg-[#1e2236] text-sky-400 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Buyurtmalar Soni
            </button>
            <button
              onClick={() => setMetricView('ikkalasi')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                metricView === 'ikkalasi' ? 'bg-[#1e2236] text-emerald-400 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Kombinatsiya
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-80 sm:h-96 pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1f2334" vertical={false} />
              
              <XAxis 
                dataKey="label" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                tickLine={false}
              />
              
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => {
                  if (metricView === 'buyurtmalar') return `${val}`;
                  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                  return `${val}`;
                }}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 12, fontSize: 12 }} 
                formatter={(val) => <span className="text-neutral-300 font-medium">{val}</span>}
              />

              {(metricView === 'daromad' || metricView === 'ikkalasi') && (
                <Area 
                  type="monotone" 
                  dataKey="daromad" 
                  name="Umumiy Daromad" 
                  stroke="#d4af37" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#goldGradient)" 
                />
              )}

              {period === 'oylik' && (metricView === 'daromad' || metricView === 'ikkalasi') && (
                <Area 
                  type="monotone" 
                  dataKey="sofFoyda" 
                  name="Sof Foyda" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#emeraldGradient)" 
                />
              )}

              {(metricView === 'buyurtmalar' || metricView === 'ikkalasi') && (
                <Area 
                  type="monotone" 
                  dataKey="buyurtmalar" 
                  name="Buyurtmalar Soni" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#skyGradient)" 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. TWO-COLUMN CHARTS: Bar Comparison & Donut Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Zal vs Dostavka BarChart */}
        <div className="p-5 sm:p-6 bg-[#11131e] border border-[#24283c] rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
              <h3 className="font-serif font-bold text-white text-base">
                ZAL VA DOSTAVKA TAQQOSLASH (UZS)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">Kanal tahlili</span>
          </div>

          <div className="w-full h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2334" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 8, fontSize: 11 }}
                  formatter={(val) => <span className="text-neutral-300">{val}</span>} 
                />
                <Bar dataKey="zal" name="Zalda Savdo" fill="#d4af37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dostavka" name="Yetkazib Berish" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Channel Breakdown Pie/Donut Chart */}
        <div className="p-5 sm:p-6 bg-[#11131e] border border-[#24283c] rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <h3 className="font-serif font-bold text-white text-base">
                SAVDO KANALLARI VA TO‘LOV ULUSHI
              </h3>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">Foiz hisobida</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Donut Chart */}
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {channelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0e101a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Detailed Legend */}
            <div className="space-y-3 pr-2">
              {channelDistribution.map((channel, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#0a0c14] border border-[#1e2234] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: channel.color }} />
                    <span className="text-white font-medium truncate">{channel.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-white">{channel.percentage}%</span>
                    <div className="text-[10px] text-neutral-400">{formatUZS(channel.value)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. HOURLY PEAK SALES & TOP DISHES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (1 col): Hourly Sales Peaks LineChart */}
        <div className="p-5 sm:p-6 bg-[#11131e] border border-[#24283c] rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#d4af37]" />
              <h3 className="font-serif font-bold text-white text-sm">
                SOATBAY CHO‘QQILAR (11:00 - 23:00)
              </h3>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400">
            Tushlik (12:00-14:00) va kechki ovqat (19:00-21:00) restoran eng gavjum soatlari
          </p>

          <div className="w-full h-64 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2334" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="tushum" 
                  name="Soatlik Tushum" 
                  stroke="#d4af37" 
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#d4af37' }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right (2 cols): Best Selling Dishes Ranked */}
        <div className="lg:col-span-2 p-5 sm:p-6 bg-[#11131e] border border-[#24283c] rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#d4af37]" />
              <h3 className="font-serif font-bold text-white text-base">
                ENG KO‘P DAROMAD KELTIRGAN TOP TAOMLAR
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#d4af37]">Sotuv reytingi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#212538] text-neutral-400 font-mono text-[11px]">
                  <th className="pb-3 font-semibold">Taom Nomi</th>
                  <th className="pb-3 font-semibold text-center">Kategoriya</th>
                  <th className="pb-3 font-semibold text-center">Sotildi</th>
                  <th className="pb-3 font-semibold text-right">Keltirgan Daromad</th>
                  <th className="pb-3 font-semibold text-right">Ulushi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1e2e]">
                {topDishes.map((dish, i) => {
                  const maxRev = topDishes[0]?.revenue || 1;
                  const percentOfTop = Math.round((dish.revenue / maxRev) * 100);

                  return (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-medium text-white flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          i === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          i === 1 ? 'bg-neutral-700/50 text-neutral-300' :
                          i === 2 ? 'bg-amber-900/30 text-amber-400' : 'text-neutral-500'
                        }`}>
                          {i + 1}
                        </span>
                        <span>{dish.name}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#1a1c29] text-neutral-300 uppercase">
                          {dish.category}
                        </span>
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-emerald-400">
                        {dish.quantity} porsiya
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-white">
                        {formatUZS(dish.revenue)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="w-24 ml-auto bg-[#1b1f30] h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#d4af37] to-amber-500 rounded-full"
                            style={{ width: `${percentOfTop}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
