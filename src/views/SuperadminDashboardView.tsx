import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, DollarSign, Clock, CheckCircle2, XCircle, 
  Search, Eye, RefreshCw, Key, Ban, Trash2, Calendar, Settings, 
  ExternalLink, Copy, Check, AlertTriangle, ArrowLeft, LogOut,
  Sparkles, Plus, Image as ImageIcon
} from 'lucide-react';
import { Tenant, SubscriptionOrder, PlatformPricingConfig } from '../types';

interface SuperadminDashboardViewProps {
  onBackToHome: () => void;
}

export const SuperadminDashboardView: React.FC<SuperadminDashboardViewProps> = ({
  onBackToHome
}) => {
  // Superadmin Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('savoria_superadmin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'requests' | 'tenants' | 'pricing'>('requests');

  // Data states
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [pricingConfig, setPricingConfig] = useState<PlatformPricingConfig>({
    monthlyBasePrice: 399000,
    discount3MonthsPercent: 5,
    discount6MonthsPercent: 10,
    discount12MonthsPercent: 20,
    cardNumber: '4916 9903 6294 0907',
    cardHolder: 'SOHIBA SHOMURATOVA',
    telegramSupport: '@lazizshavkatov712'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvedTenantMsg, setApprovedTenantMsg] = useState<{ text: string; telegram: string } | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Extend subscription modal
  const [extendingTenant, setExtendingTenant] = useState<Tenant | null>(null);

  // Format currency
  const formatUZS = (val: number) => new Intl.NumberFormat('uz-UZ').format(val) + " so'm";

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'laziz712.' || passwordInput === 'admin2026') {
      setIsAuthenticated(true);
      localStorage.setItem('savoria_superadmin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Parol noto\'g\'ri! Iltimos, tekshirib qaytadan tering.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('savoria_superadmin_auth');
  };

  // Load superadmin data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tenantsRes, ordersRes, configRes] = await Promise.all([
        fetch('/api/tenants').then(r => r.json()),
        fetch('/api/subscription-orders').then(r => r.json()),
        fetch('/api/platform-config').then(r => r.json())
      ]);

      if (Array.isArray(tenantsRes)) setTenants(tenantsRes);
      if (Array.isArray(ordersRes)) setOrders(ordersRes);
      if (configRes && configRes.cardNumber) setPricingConfig(configRes);
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Actions on Subscription Requests
  const handleApproveOrder = async (orderId: string) => {
    if (!confirm('Ushbu to\'lovni tasdiqlab, restoranni faollashtirasizmi?')) return;

    try {
      const res = await fetch(`/api/subscription-orders/${orderId}/approve`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data && data.success) {
        fetchData();
        const msg = 
          `Assalomu alaykum ${data.order?.ownerName || 'Mijoz'}!\n\n` +
          `Tabriklaymiz, «${data.order?.tenantName}» restorani uchun to'lovingiz qabul qilindi va tizimingiz muvaffaqiyatli faollashtirildi! 🎉\n\n` +
          `🌐 Mijozlar uchun QR-menyu: https://savoria-restaurant.uz/${data.order?.slug}\n` +
          `💻 Admin & POS panel: https://savoria-restaurant.uz/${data.order?.slug}/admin\n` +
          `👤 Login: ${data.order?.adminUsername}\n` +
          `🔑 Parol: ${data.order?.adminPassword || 'O\'zingiz belgilagan parol'}\n\n` +
          `Savollaringiz bo'lsa har doim @lazizshavkatov712 ga murojaat qilishingiz mumkin.`;

        setApprovedTenantMsg({
          text: msg,
          telegram: data.order?.telegram || ''
        });
      }
    } catch {
      alert('Tasdiqlashda xatolik yuz berdi');
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectingOrderId) return;
    try {
      await fetch(`/api/subscription-orders/${rejectingOrderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason.trim() || 'To\'lov cheki tasdiqlanmadi' })
      });
      setRejectingOrderId(null);
      setRejectionReason('');
      fetchData();
    } catch {
      alert('Rad etishda xatolik yuz berdi');
    }
  };

  // Extend Subscription
  const handleExtendSubscription = async (months: number) => {
    if (!extendingTenant) return;
    try {
      const res = await fetch(`/api/tenants/${extendingTenant.slug}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months })
      });
      const data = await res.json();
      if (data && data.success) {
        setExtendingTenant(null);
        fetchData();
      }
    } catch {
      alert('Muddati uzaytirishda xatolik');
    }
  };

  // Toggle Tenant Block/Active
  const handleToggleBlock = async (slug: string, currentStatus: string) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    if (!confirm(`Restoranni ${newStatus === 'blocked' ? 'bloklashni' : 'blokdan chiqarishni'} xohlaysizmi?`)) return;

    try {
      await fetch(`/api/tenants/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch {
      alert('Xatolik yuz berdi');
    }
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    if (!confirm('Haqiqatan ham DEMO ma\'lumotlarini asl toza holatiga qaytarmoqchimisiz?')) return;
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json();
      if (data && data.success) {
        alert('Demo ma\'lumotlari muvaffaqiyatli tozalandi va asl holiga qaytarildi!');
      }
    } catch {
      alert('Demoni tiklashda xatolik');
    }
  };

  // Save Pricing Config
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/platform-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingConfig)
      });
      const data = await res.json();
      if (data && data.success) {
        alert('Narxlar va karta sozlamalari muvaffaqiyatli saqlandi!');
      }
    } catch {
      alert('Saqlashda xatolik');
    }
  };

  // KPI Calculations
  const totalTenantsCount = tenants.length;
  const activeTenantsCount = tenants.filter(t => t.status === 'active' && !t.isExpired).length;
  const expiringTenantsCount = tenants.filter(t => typeof t.daysRemaining === 'number' && t.daysRemaining <= 7 && t.daysRemaining >= 0).length;
  const totalPlatformRevenue = orders
    .filter(o => o.status === 'approved')
    .reduce((sum, o) => sum + (o.amount || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  // Filtered tenants list
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery);
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && t.status === filterStatus;
  });

  // If NOT authenticated as Superadmin: Show lock screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07080d] text-[#eaeaea] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f111d] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
          <button
            onClick={onBackToHome}
            className="absolute top-5 left-5 p-2 rounded-xl bg-[#171a28] text-neutral-400 hover:text-white border border-[#25283c] transition-colors"
            title="Bosh sahifaga qaytish"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#7f6314] flex items-center justify-center text-neutral-950 mx-auto shadow-lg mb-4">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <h2 className="font-serif font-bold text-xl sm:text-2xl text-white">
            Savoria Superadmin
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            SaaS Boshqaruv Markazi (Faqat platforma egasi uchun)
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Bosh admin paroli:
              </label>
              <input
                type="password"
                placeholder="Parolni kiriting..."
                required
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#141724] border border-[#252a3f] text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 font-medium">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e4be4a] text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Tizimga Kirish
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080d] text-[#eaeaea] font-sans">
      {/* Top Superadmin Nav */}
      <header className="sticky top-0 z-40 bg-[#0d0f19]/95 backdrop-blur-md border-b border-[#1f2438]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37] text-neutral-950 font-serif font-bold text-lg flex items-center justify-center shadow">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-base sm:text-lg text-white">
                  SAVORIA SUPERADMIN
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Platform Owner
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                Barcha restoranlar va to'lovlar monitoringi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDemo}
              title="Demo ma'lumotlarini tozalash va tiklash"
              className="px-3 py-1.5 rounded-xl bg-[#161826] hover:bg-[#202438] text-amber-300 border border-[#2b3149] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Demoni Tiklash</span>
            </button>

            <button
              onClick={onBackToHome}
              className="px-3 py-1.5 rounded-xl bg-[#161826] hover:bg-[#202438] text-neutral-300 border border-[#2b3149] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Saytga O'tish</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/40 transition-colors cursor-pointer"
              title="Chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 4 Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0f111e] border border-[#21263d] shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Jami Restoranlar</span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                {totalTenantsCount} ta
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Faol: {activeTenantsCount} ta</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f111e] border border-[#21263d] shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Kutilayotgan To'lovlar</span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-400 mt-1">
                {pendingOrdersCount} ta
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">Tasdiq kutilmoqda</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f111e] border border-[#21263d] shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Obunasi Tugayotgan</span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-rose-400 mt-1">
                {expiringTenantsCount} ta
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">7 kun ichida</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f111e] border border-[#21263d] shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Jami Obuna Tushumi</span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#d4af37] font-mono mt-1">
                {formatUZS(totalPlatformRevenue)}
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Tasdiqlangan buyurtmalar</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#21253a] pb-3">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-[#d4af37] text-neutral-950 shadow-md'
                : 'bg-[#121422] text-neutral-400 hover:text-white border border-[#23283c]'
            }`}
          >
            <span>To'lov So'rovlari</span>
            {pendingOrdersCount > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'requests' ? 'bg-neutral-950 text-white' : 'bg-amber-500 text-neutral-950'
              }`}>
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tenants')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tenants'
                ? 'bg-[#d4af37] text-neutral-950 shadow-md'
                : 'bg-[#121422] text-neutral-400 hover:text-white border border-[#23283c]'
            }`}
          >
            <span>Restoranlar Boshqaruvi</span>
            <span className="text-[11px] opacity-80">({totalTenantsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-[#d4af37] text-neutral-950 shadow-md'
                : 'bg-[#121422] text-neutral-400 hover:text-white border border-[#23283c]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Narxlar & Karta</span>
          </button>
        </div>

        {/* TAB 1: SUBSCRIPTION REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg text-white">
                Kelib tushgan to'lov va obuna so'rovlari
              </h2>
              <button
                onClick={fetchData}
                className="p-2 rounded-lg bg-[#141624] text-neutral-400 hover:text-white border border-[#262a3f]"
                title="Yangilash"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#0f111d] border border-[#21263d] text-neutral-400">
                Hozircha hech qanday to'lov so'rovi kelib tushmagan.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      order.status === 'pending'
                        ? 'bg-[#141624] border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                        : order.status === 'approved'
                          ? 'bg-[#0f121d] border-emerald-500/30 opacity-90'
                          : 'bg-[#11111a] border-rose-500/30 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#d4af37]">#{order.id}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          order.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : order.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {order.status === 'pending' ? 'Kutilmoqda' : order.status === 'approved' ? 'Faollashtirilgan' : 'Rad etilgan'}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-white mt-2">
                        {order.tenantName}
                      </h3>
                      <p className="text-xs text-amber-300 font-mono mt-0.5">
                        savoria-restaurant.uz/{order.slug}
                      </p>

                      <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-xs text-neutral-300">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Egasi:</span>
                          <span className="font-semibold text-white">{order.ownerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Telefon:</span>
                          <span className="font-mono">{order.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Telegram:</span>
                          <span className="text-blue-400 font-semibold">{order.telegram || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Tarif:</span>
                          <span className="font-semibold text-white">{order.planMonths} oylik</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">To'langan:</span>
                          <span className="font-bold text-emerald-400 font-mono">{formatUZS(order.amount)}</span>
                        </div>
                      </div>

                      {/* Receipt Image Button */}
                      {order.receiptImage && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptImage(order.receiptImage || null)}
                            className="w-full py-2 px-3 rounded-xl bg-[#1b1f30] hover:bg-[#252a42] text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#303856] cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>To'lov chekini ko'rish</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions for Pending */}
                    {order.status === 'pending' && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                        <button
                          onClick={() => handleApproveOrder(order.id)}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tasdiqlash</span>
                        </button>

                        <button
                          onClick={() => {
                            setRejectingOrderId(order.id);
                            setRejectionReason('');
                          }}
                          className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-900/50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Rad etish
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TENANTS MANAGEMENT */}
        {activeTab === 'tenants' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Restoran nomi, slug yoki telefon..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0f111d] border border-[#23283c] text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-[#0f111d] border border-[#23283c] text-xs text-white focus:outline-none"
                >
                  <option value="all">Barcha holatlar</option>
                  <option value="active">Faol</option>
                  <option value="expired">Muddati tugagan</option>
                  <option value="blocked">Bloklangan</option>
                </select>
              </div>
            </div>

            {/* Tenants Table */}
            <div className="rounded-2xl border border-[#21263d] bg-[#0c0e18] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-[#121524] text-neutral-400 uppercase text-[10px] font-mono border-b border-[#21263d]">
                    <tr>
                      <th className="p-3.5">Restoran / Slug</th>
                      <th className="p-3.5">Egasining Ismi & Tel</th>
                      <th className="p-3.5">Holati</th>
                      <th className="p-3.5">Tugash Sanasi</th>
                      <th className="p-3.5">Qolgan Kun</th>
                      <th className="p-3.5 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b1f32]">
                    {filteredTenants.map(tenant => (
                      <tr key={tenant.id} className="hover:bg-[#141728] transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white text-sm">{tenant.name}</div>
                          <a
                            href={`/${tenant.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#d4af37] font-mono text-xs hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>/{tenant.slug}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        </td>

                        <td className="p-3.5">
                          <div className="font-medium text-white">{tenant.ownerName}</div>
                          <div className="text-neutral-400 font-mono text-[11px]">{tenant.phone}</div>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            tenant.status === 'active' && !tenant.isExpired
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : tenant.status === 'blocked'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {tenant.status === 'blocked' ? 'Bloklangan' : tenant.isExpired ? 'Tugagan' : 'Faol'}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono text-[11px]">
                          {tenant.endDate ? new Date(tenant.endDate).toLocaleDateString('uz-UZ') : '—'}
                        </td>

                        <td className="p-3.5 font-mono font-bold">
                          {typeof tenant.daysRemaining === 'number' ? (
                            <span className={tenant.daysRemaining <= 7 ? 'text-rose-400' : 'text-emerald-400'}>
                              {tenant.daysRemaining <= 0 ? 'Tugagan' : `${tenant.daysRemaining} kun`}
                            </span>
                          ) : '—'}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setExtendingTenant(tenant)}
                              className="px-2.5 py-1 rounded-lg bg-[#1a1e2f] hover:bg-[#252b44] text-amber-300 border border-[#2f3754] text-[11px] font-semibold transition-colors"
                              title="Obunani uzaytirish"
                            >
                              + Uzaytirish
                            </button>

                            <button
                              onClick={() => handleToggleBlock(tenant.slug, tenant.status)}
                              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                tenant.status === 'blocked'
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/60'
                                  : 'bg-amber-950/40 text-amber-300 border-amber-800/40 hover:bg-amber-900/60'
                              }`}
                              title={tenant.status === 'blocked' ? 'Ochish' : 'Bloklash'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>

                            <a
                              href={`/${tenant.slug}/admin`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-[#161a29] hover:bg-[#20253c] text-white border border-[#2c334d]"
                              title="Admin paneliga o'tish"
                            >
                              <Key className="w-3.5 h-3.5 text-[#d4af37]" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRICING & PAYMENT SETTINGS */}
        {activeTab === 'pricing' && (
          <div className="max-w-2xl bg-[#0f111d] border border-[#21263d] rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-serif font-bold text-xl text-white">
                Platforma Narxlari va To'lov Karta Sozlamalari
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Ushbu ma'lumotlar landing sahifasida va mijoz to'lov formasida aks etadi
              </p>
            </div>

            <form onSubmit={handleSavePricing} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-300 mb-1">
                  Oylik asosiy narx (UZS) *
                </label>
                <input
                  type="number"
                  value={pricingConfig.monthlyBasePrice}
                  onChange={e => setPricingConfig({ ...pricingConfig, monthlyBasePrice: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141724] border border-[#262b42] text-sm text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">3 oy chegirma %</label>
                  <input
                    type="number"
                    value={pricingConfig.discount3MonthsPercent}
                    onChange={e => setPricingConfig({ ...pricingConfig, discount3MonthsPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141724] border border-[#262b42] text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">6 oy chegirma %</label>
                  <input
                    type="number"
                    value={pricingConfig.discount6MonthsPercent}
                    onChange={e => setPricingConfig({ ...pricingConfig, discount6MonthsPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141724] border border-[#262b42] text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">12 oy chegirma %</label>
                  <input
                    type="number"
                    value={pricingConfig.discount12MonthsPercent}
                    onChange={e => setPricingConfig({ ...pricingConfig, discount12MonthsPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141724] border border-[#262b42] text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">
                    To'lov qabul qilinadigan karta raqami *
                  </label>
                  <input
                    type="text"
                    value={pricingConfig.cardNumber}
                    onChange={e => setPricingConfig({ ...pricingConfig, cardNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141724] border border-[#262b42] text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">
                    Karta egasining to'liq ismi (F.I.O) *
                  </label>
                  <input
                    type="text"
                    value={pricingConfig.cardHolder}
                    onChange={e => setPricingConfig({ ...pricingConfig, cardHolder: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141724] border border-[#262b42] text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">
                    Telegram yordamchi username *
                  </label>
                  <input
                    type="text"
                    value={pricingConfig.telegramSupport}
                    onChange={e => setPricingConfig({ ...pricingConfig, telegramSupport: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141724] border border-[#262b42] text-sm text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-md mt-4"
              >
                Sozlamalarni Saqlash
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL 1: VIEW RECEIPT SCREENSHOT */}
      {selectedReceiptImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedReceiptImage(null)}
        >
          <div className="relative max-w-lg w-full bg-[#11131e] rounded-3xl p-4 border border-[#d4af37]/40 shadow-2xl overflow-hidden">
            <button
              onClick={() => setSelectedReceiptImage(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white hover:bg-black/90 z-10"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <h3 className="font-serif font-bold text-white text-base mb-3">Mijoz to'lov cheki skrinshoti:</h3>
            <img 
              src={selectedReceiptImage} 
              alt="To'lov cheki" 
              className="w-full max-h-[75vh] object-contain rounded-2xl bg-black/40 border border-white/10" 
            />
          </div>
        </div>
      )}

      {/* MODAL 2: REJECT REASON MODAL */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#101322] border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-white text-lg">So'rovni rad etish sababi:</h3>
            <textarea
              rows={3}
              placeholder="Masalan: Chek noaniq yoki to'lov summasi to'liq tushmadi..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#141728] border border-[#272c44] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingOrderId(null)}
                className="px-4 py-2 rounded-xl bg-[#181c2e] text-neutral-300 text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleRejectOrder}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Rad etishni tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: APPROVED CONFIRMATION TELEGRAM MESSAGE */}
      {approvedTenantMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0e111d] border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="font-serif font-bold text-white text-lg">Restoran muvaffaqiyatli faollashtirildi!</h3>
            </div>
            <p className="text-xs text-neutral-300">
              Quyidagi tayyor matnni nusxalab, mijozga Telegram orqali yuboring:
            </p>

            <div className="p-4 rounded-2xl bg-[#131626] border border-[#23283c] text-xs font-mono text-neutral-200 whitespace-pre-wrap max-h-56 overflow-y-auto">
              {approvedTenantMsg.text}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(approvedTenantMsg.text);
                  setCopiedMsg(true);
                  setTimeout(() => setCopiedMsg(false), 2000);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#229ED9] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
              >
                {copiedMsg ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedMsg ? 'Nusxalandi!' : 'Xabarni nusxalash'}</span>
              </button>

              <button
                onClick={() => setApprovedTenantMsg(null)}
                className="px-4 py-2.5 rounded-xl bg-[#181c2e] text-neutral-300 text-xs font-semibold"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EXTEND SUBSCRIPTION */}
      {extendingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0f111e] border border-[#d4af37]/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <div>
              <h3 className="font-serif font-bold text-white text-lg">
                Obuna muddatini uzaytirish
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Restoran: <strong className="text-white">{extendingTenant.name}</strong> (/{extendingTenant.slug})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { months: 1, label: '+1 Oylik' },
                { months: 3, label: '+3 Oylik' },
                { months: 6, label: '+6 Oylik' },
                { months: 12, label: '+1 Yillik' }
              ].map(opt => (
                <button
                  key={opt.months}
                  onClick={() => handleExtendSubscription(opt.months)}
                  className="p-3.5 rounded-xl bg-[#16192a] hover:bg-[#20253f] border border-[#272e48] text-amber-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setExtendingTenant(null)}
                className="px-4 py-2 rounded-xl bg-[#181c2e] text-neutral-300 text-xs font-semibold"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
