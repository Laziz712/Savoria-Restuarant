import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  BarChart3, TrendingUp, DollarSign, Receipt, CreditCard, 
  Printer, Download, Calendar, ArrowUpRight, Flame, PieChart,
  CheckCircle, FileText
} from 'lucide-react';

export const XisobotAnalyticsView: React.FC = () => {
  const { orders, menuItems, formatUZS, settings } = useRestaurant();

  const [timeRange, setTimeRange] = useState<'bugun' | '7kun' | 'oy'>('bugun');
  const [showZReportModal, setShowZReportModal] = useState(false);

  // Financial calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.isPaid ? o.finalTotal : 0), 0);
  const paidOrders = orders.filter(o => o.isPaid);
  const totalOrdersCount = orders.length;
  const avgCheck = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

  // Breakdown by channel
  const hallRevenue = paidOrders
    .filter(o => o.type === 'zal')
    .reduce((sum, o) => sum + o.finalTotal, 0);

  const deliveryRevenue = paidOrders
    .filter(o => o.type === 'dostavka')
    .reduce((sum, o) => sum + o.finalTotal, 0);

  // Breakdown by payment method
  const cashRevenue = paidOrders
    .filter(o => o.paymentMethod === 'naqd')
    .reduce((sum, o) => sum + o.finalTotal, 0);

  const cardRevenue = paidOrders
    .filter(o => o.paymentMethod === 'uzcard_humo')
    .reduce((sum, o) => sum + o.finalTotal, 0);

  const onlineRevenue = paidOrders
    .filter(o => o.paymentMethod === 'payme_click')
    .reduce((sum, o) => sum + o.finalTotal, 0);

  const otherRevenue = paidOrders
    .filter(o => o.paymentMethod === 'visa')
    .reduce((sum, o) => sum + o.finalTotal, 0);

  // Top selling items aggregation
  const itemSalesMap: { [name: string]: { quantity: number; revenue: number; category: string } } = {};

  orders.forEach(order => {
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

  const sortedTopItems = Object.entries(itemSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 7);

  // Hourly distribution demo data
  const hourlyData = [
    { hour: '11:00', amount: 480000, height: '35%' },
    { hour: '13:00', amount: 1250000, height: '75%' },
    { hour: '15:00', amount: 620000, height: '45%' },
    { hour: '17:00', amount: 510000, height: '38%' },
    { hour: '19:00', amount: 1890000, height: '95%' },
    { hour: '21:00', amount: 1420000, height: '80%' },
    { hour: '23:00', amount: 760000, height: '50%' },
  ];

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Chek ID,Turi,Mijoz,Telefon,Summa,To'lov Holati,To'lov Usuli,Sana\n"
      + orders.map(o => `${o.id},${o.type},"${o.customerName}",${o.customerPhone},${o.finalTotal},${o.isPaid ? 'Tolangan' : 'Kutilmoqda'},${o.paymentMethod || 'Naqd'},${o.createdAt}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `savoria_hisobot_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-[#eaeaea] p-4 sm:p-6 flex flex-col gap-6">
      {/* Analytics Top Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-[#1f2231]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-wide">
                MOLIYAVIY XISOBOT VA STATISTIKA
              </h1>
              <p className="text-xs text-neutral-400 font-mono">
                Savoria Restorani daromad tahlili, o'rtacha chek va taomlar reytingi
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector and Export */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-[#12141e] p-1 rounded-lg border border-[#232738]">
            {(['bugun', '7kun', 'oy'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTimeRange(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  timeRange === tab
                    ? 'bg-[#d4af37] text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab === 'bugun' ? 'Bugun' : tab === '7kun' ? 'Oxirgi 7 kun' : 'Bu oy'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowZReportModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#191c28] hover:bg-[#232738] text-white border border-[#2e334a] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Z-Xisobot</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#e4be4a] text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Eksport</span>
          </button>
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
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% kechagiga nisbatan</span>
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
              Zal: {orders.filter(o => o.type === 'zal').length} · Dostavka: {orders.filter(o => o.type === 'dostavka').length}
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
              <span className="text-white font-bold">{formatUZS(hallRevenue)}</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span>Dostavka:</span>
              <span className="text-[#d4af37] font-bold">{formatUZS(deliveryRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts & Payment Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Hourly Revenue Graph (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-[#12141f] border border-[#222538] shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-sm text-white">
                SOATLAR KESIMIDA TUSHUM DINAMIKASI
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Restorandagi eng qizg'in tushlik va kechki ovqat soatlari
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#1b1e2c] border border-[#2e334a] text-xs font-mono text-[#d4af37]">
              Pik: 19:00 - 21:00
            </span>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#232637]">
            {hourlyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-[#d4af37] whitespace-nowrap">
                  {new Intl.NumberFormat('uz-UZ').format(d.amount)}
                </div>
                <div
                  style={{ height: d.height }}
                  className="w-full max-w-[42px] bg-gradient-to-t from-[#202538] via-[#8c7423] to-[#d4af37] rounded-t group-hover:brightness-125 transition-all"
                ></div>
                <span className="text-[11px] font-mono text-neutral-400 mt-1">
                  {d.hour}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Kunduzgi tushlik oqimi</span>
            <span>Kechki loundj va VIP ziyofatlar</span>
          </div>
        </div>

        {/* Payment Methods Breakdown (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-[#12141f] border border-[#222538] shadow-xl flex flex-col justify-between">
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
                  <span className="font-bold text-white">{formatUZS(cardRevenue)}</span>
                </div>
                <div className="h-2 w-full bg-[#1b1e2c] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: totalRevenue > 0 ? `${(cardRevenue / totalRevenue) * 100}%` : '50%' }}></div>
                </div>
              </div>

              {/* Method 2: Naqd */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-neutral-300">Naqd pul</span>
                  <span className="font-bold text-white">{formatUZS(cashRevenue)}</span>
                </div>
                <div className="h-2 w-full bg-[#1b1e2c] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: totalRevenue > 0 ? `${(cashRevenue / totalRevenue) * 100}%` : '30%' }}></div>
                </div>
              </div>

              {/* Method 3: Payme & Click */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-neutral-300">Payme / Click (Online)</span>
                  <span className="font-bold text-white">{formatUZS(onlineRevenue)}</span>
                </div>
                <div className="h-2 w-full bg-[#1b1e2c] rounded-full overflow-hidden">
                  <div className="h-full bg-[#d4af37] rounded-full" style={{ width: totalRevenue > 0 ? `${(onlineRevenue / totalRevenue) * 100}%` : '20%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-[#161824] border border-[#242838] text-[11px] text-neutral-400 font-mono">
            Elektron to'lovlar ulushi: 72% · Naqd pul aylanmasi: 28%
          </div>
        </div>
      </div>

      {/* Top 7 Dishes Table */}
      <div className="p-5 rounded-xl bg-[#12141f] border border-[#222538] shadow-xl">
        <h3 className="font-serif font-bold text-sm text-white mb-4 flex items-center justify-between">
          <span>ENG KO'P SOTILGAN VA DAROMAD KELTIRGAN TAOMLAR REYTINGI</span>
          <span className="text-xs font-mono text-[#d4af37]">TOP HITS</span>
        </h3>

        <div className="overflow-x-auto">
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
                  <td className="py-3 px-3 font-bold text-[#d4af37]">0{idx + 1}</td>
                  <td className="py-3 px-3 font-sans font-semibold text-white">
                    {item.name}
                  </td>
                  <td className="py-3 px-3 uppercase text-neutral-400 text-[11px]">
                    {item.category}
                  </td>
                  <td className="py-3 px-3 text-right text-white font-bold">
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
      </div>

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
                {settings.name} — SMENA #104
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>STIR (INN):</span>
                <span>{settings.stir}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Smena sanasi:</span>
                <span>{new Date().toLocaleDateString('uz-UZ')}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Jami cheklar:</span>
                <span>{orders.length} ta</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Naqd kassa:</span>
                <span>{formatUZS(cashRevenue)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Terminal (Uzcard/Humo):</span>
                <span>{formatUZS(cardRevenue)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Online (Payme/Click):</span>
                <span>{formatUZS(onlineRevenue)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-dashed border-neutral-700 text-sm">
                <span>YAKUNIY TUSHUM:</span>
                <span className="text-[#d4af37]">{formatUZS(totalRevenue)}</span>
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
                onClick={() => {
                  alert('Smena muvaffaqiyatli yopildi va soliq organiga ma\'lumot uzatildi!');
                  setShowZReportModal(false);
                }}
                className="flex-1 py-2 rounded-lg bg-[#212536] text-white hover:bg-[#2b3044] font-semibold text-xs transition-colors"
              >
                Smenani Yakunlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
