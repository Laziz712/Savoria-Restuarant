import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Users, DollarSign, Clock, CheckCircle2, XCircle,
  Search, RefreshCw, Key, Ban, Settings, Activity, Server,
  ExternalLink, Copy, Check, AlertTriangle, ArrowLeft, LogOut,
  Plus, Image as ImageIcon, Globe, Smartphone, Laptop, Lock,
  Store, BarChart3, UserCheck, UtensilsCrossed, Bike, Phone
} from 'lucide-react';
import { Tenant, SubscriptionOrder, PlatformPricingConfig } from '../types';

interface SuperadminDashboardViewProps {
  onBackToHome: () => void;
}

interface OnlineSession {
  sessionId: string;
  tenantSlug: string;
  tenantName: string;
  path: string;
  role: string;
  userName: string;
  device: string;
  lastSeenAt: number;
}

interface SiteUserRecord {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'waiter' | 'courier' | 'customer';
  roleLabel: string;
  tenantSlug: string;
  tenantName: string;
  phone: string;
  telegram?: string;
  username?: string;
  status: string;
  ordersCount: number;
  totalSpent: number;
  lastActiveAt: string;
  source: string;
}

interface TenantMetricItem {
  slug: string;
  name: string;
  ordersCount: number;
  paidRevenue: number;
  menuCount: number;
  tablesCount: number;
  staffCount: number;
  customersCount: number;
  onlineCount: number;
}

interface SuperadminOverview {
  generatedAt: string;
  systemHealth: {
    mongoConnected: boolean;
    nodeUptimeSeconds: number;
    activeOnlineCount: number;
    environment: string;
  };
  platformMetrics: {
    totalTenants: number;
    activeTenants: number;
    blockedTenants: number;
    expiredTenants: number;
    totalOrders: number;
    totalMenuItems: number;
    totalTables: number;
    totalUsersCount: number;
    subscriptionRevenue: number;
    totalPlatformGMV: number;
  };
  tenantMetrics: Record<string, TenantMetricItem>;
  onlineSessions: OnlineSession[];
  users: SiteUserRecord[];
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
  const [activeTab, setActiveTab] = useState<'requests' | 'tenants' | 'users' | 'analytics' | 'pricing'>('requests');

  // Data states
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [overview, setOverview] = useState<SuperadminOverview | null>(null);
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
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Users directory filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'owner' | 'admin' | 'waiter' | 'courier' | 'customer'>('all');
  const [userTenantFilter, setUserTenantFilter] = useState<string>('all');

  // Inline Toast Banner (replaces window.alert)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showBanner = (type: 'success' | 'error', text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 4500);
  };

  // Confirmation Modal (replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Modals
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvedTenantMsg, setApprovedTenantMsg] = useState<{ text: string; telegram: string } | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [extendingTenant, setExtendingTenant] = useState<Tenant | null>(null);

  // Create Tenant Modal
  const [isCreateTenantOpen, setIsCreateTenantOpen] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({
    name: '',
    slug: '',
    ownerName: '',
    phone: '+998 ',
    telegram: '',
    adminUsername: 'admin',
    adminPasswordHash: '1111',
    planMonths: 3
  });
  const [creatingTenant, setCreatingTenant] = useState(false);

  // Reset Password Modal
  const [resetPwTenant, setResetPwTenant] = useState<Tenant | null>(null);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [resettingPw, setResettingPw] = useState(false);

  // Format helpers
  const formatUZS = (val: number) => new Intl.NumberFormat('uz-UZ').format(Math.round(val || 0)) + " so'm";
  const formatRelativeTime = (tsOrIso: number | string) => {
    const ms = typeof tsOrIso === 'number' ? tsOrIso : new Date(tsOrIso).getTime();
    if (!ms || Number.isNaN(ms)) return '—';
    const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
    if (diffSec < 60) return `${diffSec} soniya oldin`;
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return `${mins} daqiqa oldin`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} soat oldin`;
    return new Date(ms).toLocaleDateString('uz-UZ');
  };

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'laziz712.' || passwordInput === 'admin2026') {
      setIsAuthenticated(true);
      localStorage.setItem('savoria_superadmin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError("Parol noto'g'ri! Iltimos, tekshirib qaytadan tering.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('savoria_superadmin_auth');
  };

  // Load superadmin data
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [tenantsRes, ordersRes, configRes, overviewRes] = await Promise.all([
        fetch('/api/tenants').then(r => r.json()).catch(() => null),
        fetch('/api/subscription-orders').then(r => r.json()).catch(() => null),
        fetch('/api/platform-config').then(r => r.json()).catch(() => null),
        fetch('/api/superadmin/overview').then(r => r.json()).catch(() => null)
      ]);

      if (Array.isArray(tenantsRes)) setTenants(tenantsRes);
      if (Array.isArray(ordersRes)) setOrders(ordersRes);
      if (configRes && configRes.cardNumber) setPricingConfig(configRes);
      if (overviewRes && overviewRes.success) setOverview(overviewRes);
    } catch {
      // Offline fallback
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
  }, [isAuthenticated, fetchData]);

  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const interval = setInterval(() => fetchData(true), 25000);
    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, fetchData]);

  // Actions on Subscription Requests
  const executeApproveOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/subscription-orders/${orderId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data && data.success) {
        await fetchData();
        const msg =
          `Assalomu alaykum ${data.order?.ownerName || 'Mijoz'}!\n\n` +
          `Tabriklaymiz, «${data.order?.tenantName}» restorani uchun to'lovingiz qabul qilindi va tizimingiz muvaffaqiyatli faollashtirildi!\n\n` +
          `Mijozlar uchun QR-menyu: https://savoria-restaurant.uz/${data.order?.slug}\n` +
          `Admin & POS panel: https://savoria-restaurant.uz/${data.order?.slug}/admin\n` +
          `Login: ${data.order?.adminUsername}\n` +
          `Parol: ${data.order?.adminPassword || "O'zingiz belgilagan parol"}\n\n` +
          `Savollaringiz bo'lsa har doim @lazizshavkatov712 ga murojaat qilishingiz mumkin.`;

        setApprovedTenantMsg({
          text: msg,
          telegram: data.order?.telegram || ''
        });
        showBanner('success', `«${data.order?.tenantName}» restorani faollashtirildi!`);
      } else {
        showBanner('error', data?.error || 'Tasdiqlashda xatolik yuz berdi');
      }
    } catch {
      showBanner('error', 'Tasdiqlashda server xatosi yuz berdi');
    }
  };

  const handleApproveOrder = (orderId: string) => {
    setConfirmModal({
      title: "To'lovni tasdiqlash",
      message: "Ushbu to'lovni tasdiqlab, restoran sayti va POS tizimini darhol faollashtirasizmi?",
      confirmLabel: 'Tasdiqlash va Faollashtirish',
      onConfirm: () => executeApproveOrder(orderId)
    });
  };

  const handleRejectOrder = async () => {
    if (!rejectingOrderId) return;
    try {
      await fetch(`/api/subscription-orders/${rejectingOrderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason.trim() || "To'lov cheki tasdiqlanmadi" })
      });
      setRejectingOrderId(null);
      setRejectionReason('');
      fetchData();
      showBanner('success', "So'rov rad etildi");
    } catch {
      showBanner('error', 'Rad etishda xatolik yuz berdi');
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
      if (res.ok && (data?.success || data?.slug)) {
        setExtendingTenant(null);
        fetchData();
        showBanner('success', `Obuna +${months} oyga uzaytirildi`);
      } else {
        showBanner('error', data?.error || 'Muddatni uzaytirishda xatolik');
      }
    } catch {
      showBanner('error', 'Muddati uzaytirishda server xatosi');
    }
  };

  // Toggle Tenant Block/Active
  const handleToggleBlock = (slug: string, currentStatus: string) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    setConfirmModal({
      title: newStatus === 'blocked' ? 'Restoranni bloklash' : 'Restoranni faollashtirish',
      message: `/${slug} manzilli restoranni ${newStatus === 'blocked' ? 'vaqtincha bloklaysizmi?' : 'blokdan chiqarib qayta faollashtirasizmi?'}`,
      confirmLabel: newStatus === 'blocked' ? 'Bloklash' : 'Blokdan chiqarish',
      danger: newStatus === 'blocked',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/tenants/${slug}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
            fetchData();
            showBanner('success', newStatus === 'blocked' ? 'Restoran bloklandi' : 'Restoran faollashtirildi');
          } else {
            showBanner('error', 'Holatni yangilab bo‘lmadi');
          }
        } catch {
          showBanner('error', 'Server bilan aloqa xatosi');
        }
      }
    });
  };

  // Direct Create Tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = newTenantForm.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    if (!newTenantForm.name.trim() || cleanSlug.length < 3 || !newTenantForm.ownerName.trim()) {
      showBanner('error', "Restoran nomi, kamida 3 belgili slug va egasining ismi shart");
      return;
    }
    setCreatingTenant(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTenantForm,
          slug: cleanSlug,
          planMonths: Number(newTenantForm.planMonths) || 3
        })
      });
      const data = await res.json();
      if (res.ok && data?.slug) {
        setIsCreateTenantOpen(false);
        setNewTenantForm({
          name: '',
          slug: '',
          ownerName: '',
          phone: '+998 ',
          telegram: '',
          adminUsername: 'admin',
          adminPasswordHash: '1111',
          planMonths: 3
        });
        fetchData();
        showBanner('success', `«${data.name}» (/${data.slug}) yaratildi!`);
      } else {
        showBanner('error', data?.error || 'Restoran yaratishda xatolik');
      }
    } catch {
      showBanner('error', 'Server bilan aloqa xatosi');
    } finally {
      setCreatingTenant(false);
    }
  };

  // Reset Tenant Password
  const handleResetTenantPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwTenant) return;
    if (newAdminPassword.trim().length < 4) {
      showBanner('error', "Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak");
      return;
    }
    setResettingPw(true);
    try {
      const res = await fetch(`/api/superadmin/tenants/${resetPwTenant.slug}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUsername: newAdminUsername.trim() || undefined,
          newPassword: newAdminPassword.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setResetPwTenant(null);
        setNewAdminPassword('');
        fetchData();
        showBanner('success', `/${resetPwTenant.slug} admin paroli yangilandi!`);
      } else {
        showBanner('error', data?.error || 'Parolni yangilashda xatolik');
      }
    } catch {
      showBanner('error', 'Server xatosi');
    } finally {
      setResettingPw(false);
    }
  };

  // Reset Demo Data
  const handleResetDemo = () => {
    setConfirmModal({
      title: 'DEMO bazasini tiklash',
      message: "Haqiqatan ham DEMO ma'lumotlarini asl toza holatiga qaytarmoqchimisiz?",
      confirmLabel: 'Demoni Tiklash',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/demo/reset', { method: 'POST' });
          const data = await res.json();
          if (data && data.success) {
            showBanner('success', "Demo ma'lumotlari muvaffaqiyatli asl holiga qaytarildi!");
            fetchData();
          } else {
            showBanner('error', 'Demoni tiklashda xatolik');
          }
        } catch {
          showBanner('error', 'Demoni tiklashda xatolik');
        }
      }
    });
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
        showBanner('success', 'Narxlar va karta sozlamalari muvaffaqiyatli saqlandi!');
      } else {
        showBanner('error', 'Saqlashda xatolik');
      }
    } catch {
      showBanner('error', 'Saqlashda xatolik');
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

  const onlineSessions = overview?.onlineSessions || [];
  const allUsers = overview?.users || [];
  const tenantMetrics = overview?.tenantMetrics || {};

  // Filtered tenants list
  const filteredTenants = tenants.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.phone || '').includes(searchQuery);
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'expired') return matchesSearch && !!t.isExpired;
    return matchesSearch && t.status === filterStatus;
  });

  // Filtered site users list
  const filteredUsers = allUsers.filter(u => {
    const q = userSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.tenantName.toLowerCase().includes(q) ||
      u.tenantSlug.toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q);
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchTenant = userTenantFilter === 'all' || u.tenantSlug === userTenantFilter;
    return matchSearch && matchRole && matchTenant;
  });

  const roleBadgeStyle = (role: SiteUserRecord['role']) => {
    switch (role) {
      case 'owner': return 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40';
      case 'admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'waiter': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'courier': return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  // Lock screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07080d] text-[#eaeaea] flex items-center justify-center p-4 overflow-hidden overscroll-none pin-lock-viewport">
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
                className="w-full px-4 py-3 rounded-xl bg-[#141724] border border-[#252a3f] text-base sm:text-sm text-white focus:outline-none focus:border-[#d4af37]"
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
    <div className="min-h-screen bg-[#07080d] text-[#eaeaea] font-sans overflow-x-clip w-full">
      {/* Top Superadmin Nav */}
      <header className="sticky top-0 z-40 bg-[#0d0f19]/95 backdrop-blur-md border-b border-[#1f2438]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#d4af37] text-neutral-950 font-serif font-bold text-base sm:text-lg flex items-center justify-center shadow shrink-0">
              S
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-sm sm:text-lg text-white truncate">
                  SAVORIA SUPERADMIN
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{onlineSessions.length} Online</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-mono truncate">
                Sayt userlari, restoranlar va jonli monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setAutoRefresh(a => !a)}
              title="Avtomatik jonli yangilash"
              className={`hidden md:flex px-2.5 py-1.5 rounded-xl border text-[11px] font-mono items-center gap-1.5 transition-colors cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#161826] border-[#2b3149] text-neutral-400'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{autoRefresh ? 'Live 25s' : 'Pauza'}</span>
            </button>

            <button
              onClick={() => fetchData()}
              title="Ma'lumotlarni yangilash"
              className="p-2 rounded-xl bg-[#161826] hover:bg-[#202438] text-neutral-300 border border-[#2b3149] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#d4af37]' : ''}`} />
            </button>

            <button
              onClick={handleResetDemo}
              title="Demo ma'lumotlarini tozalash va tiklash"
              className="px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl bg-[#161826] hover:bg-[#202438] text-amber-300 border border-[#2b3149] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Demoni Tiklash</span>
            </button>

            <button
              onClick={onBackToHome}
              className="px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl bg-[#161826] hover:bg-[#202438] text-neutral-300 border border-[#2b3149] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Bosh saytga o'tish"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Saytga</span>
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

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Inline Status Banner */}
        {banner && (
          <div className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between gap-2 animate-fade-in ${
            banner.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/70 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {banner.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{banner.text}</span>
            </div>
            <button onClick={() => setBanner(null)} className="px-2 py-0.5 text-neutral-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Primary KPI Cards (2-col on mobile, 5-col on xl) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#0f111e] border border-[#21263d] shadow-lg flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider block truncate">Restoranlar</span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-white mt-0.5 tabular-nums">
                {totalTenantsCount} ta
              </div>
              <div className="text-[10px] sm:text-[11px] text-emerald-400 mt-0.5">Faol: {activeTenantsCount}</div>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Store className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('users')}
            className="p-4 rounded-2xl bg-[#0f111e] border border-emerald-500/30 shadow-lg flex items-center justify-between gap-2 cursor-pointer hover:border-emerald-400/60 transition-colors"
          >
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider block truncate">Online Hozir</span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-400 mt-0.5 tabular-nums flex items-center gap-1.5">
                <span>{onlineSessions.length}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 truncate">Jami user: {allUsers.length}</div>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f111e] border border-[#21263d] shadow-lg flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider block truncate">Kutilayotgan</span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-amber-400 mt-0.5 tabular-nums">
                {pendingOrdersCount} ta
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 truncate">To'lov so'rovi</div>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f111e] border border-[#21263d] shadow-lg flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider block truncate">Tugayotgan</span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-rose-400 mt-0.5 tabular-nums">
                {expiringTenantsCount} ta
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 truncate">7 kun ichida</div>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-[#0f111e] border border-[#d4af37]/30 shadow-lg flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider block truncate">Obuna Tushumi</span>
              <div className="text-lg sm:text-xl font-serif font-bold text-[#d4af37] font-mono mt-0.5 tabular-nums truncate">
                {formatUZS(totalPlatformRevenue)}
              </div>
              <div className="text-[10px] sm:text-[11px] text-emerald-400 mt-0.5 truncate">Tasdiqlangan</div>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Scrollable Mobile-Friendly Tab Switcher (5 Tabs) */}
        <div className="flex items-center gap-2 border-b border-[#21253a] pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'requests'
                ? 'bg-[#d4af37] text-neutral-950 shadow-md'
                : 'bg-[#121422] text-neutral-400 hover:text-white border border-[#23283c]'
            }`}
          >
            <span>To'lov So'rovlari</span>
            {pendingOrdersCount > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold tabular-nums ${
                activeTab === 'requests' ? 'bg-neutral-950 text-white' : 'bg-amber-500 text-neutral-950'
              }`}>
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tenants')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'tenants'
                ? 'bg-[#d4af37] text-neutral-950 shadow-md'
                : 'bg-[#121422] text-neutral-400 hover:text-white border border-[#23283c]'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Restoranlar</span>
            <span className="text-[11px] opacity-80 tabular-nums">({totalTenantsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'users'
                ? 'bg-[#d4af37] text-neutral-950 shadow-md'
                : 'bg-[#121422] text-neutral-400 hover:text-white border border-[#23283c]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Sayt Userlari</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold tabular-nums ${
              activeTab === 'users' ? 'bg-neutral-950 text-[#d4af37]' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {allUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-[#d4af37] text-neutral-950 shadow-md'
                : 'bg-[#121422] text-neutral-400 hover:text-white border border-[#23283c]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Tahlil & Monitoring</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
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
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-white">
                Kelib tushgan to'lov va obuna so'rovlari
              </h2>
              <button
                onClick={() => fetchData()}
                className="p-2 rounded-lg bg-[#141624] text-neutral-400 hover:text-white border border-[#262a3f]"
                title="Yangilash"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-10 sm:p-12 text-center rounded-3xl bg-[#0f111d] border border-[#21263d] text-neutral-400 text-xs sm:text-sm">
                Hozircha hech qanday to'lov so'rovi kelib tushmagan.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      order.status === 'pending'
                        ? 'bg-[#141624] border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
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
                      <p className="text-xs text-amber-300 font-mono mt-0.5 truncate">
                        savoria-restaurant.uz/{order.slug}
                      </p>

                      <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-xs text-neutral-300">
                        <div className="flex justify-between gap-2">
                          <span className="text-neutral-400">Egasi:</span>
                          <span className="font-semibold text-white truncate">{order.ownerName}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-neutral-400">Telefon:</span>
                          <span className="font-mono">{order.phone}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-neutral-400">Telegram:</span>
                          <span className="text-blue-400 font-semibold truncate">{order.telegram || '—'}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-neutral-400">Tarif:</span>
                          <span className="font-semibold text-white">{order.planMonths} oylik</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-neutral-400">To'langan:</span>
                          <span className="font-bold text-emerald-400 font-mono tabular-nums">{formatUZS(order.amount)}</span>
                        </div>
                      </div>

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

                    {order.status === 'pending' && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                        <button
                          onClick={() => handleApproveOrder(order.id)}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tasdiqlash</span>
                        </button>

                        <button
                          onClick={() => {
                            setRejectingOrderId(order.id);
                            setRejectionReason('');
                          }}
                          className="px-3 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-900/50 text-xs font-semibold transition-colors cursor-pointer"
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
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Restoran nomi, slug yoki telefon..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0f111d] border border-[#23283c] text-base sm:text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl bg-[#0f111d] border border-[#23283c] text-base sm:text-xs text-white focus:outline-none"
                >
                  <option value="all">Barcha holatlar</option>
                  <option value="active">Faol</option>
                  <option value="expired">Muddati tugagan</option>
                  <option value="blocked">Bloklangan</option>
                </select>

                <button
                  type="button"
                  onClick={() => setIsCreateTenantOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#e6c14c] text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Restoran</span>
                </button>
              </div>
            </div>

            {/* Mobile Tenant Cards */}
            <div className="md:hidden space-y-3">
              {filteredTenants.map(tenant => {
                const metric = tenantMetrics[tenant.slug];
                return (
                  <div key={tenant.id} className="p-4 rounded-2xl bg-[#0c0e18] border border-[#21263d] space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{tenant.name}</div>
                        <a
                          href={`/${tenant.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#d4af37] font-mono text-xs hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <span>/{tenant.slug}</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono shrink-0 ${
                        tenant.status === 'active' && !tenant.isExpired
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : tenant.status === 'blocked'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {tenant.status === 'blocked' ? 'Bloklangan' : tenant.isExpired ? 'Tugagan' : 'Faol'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#121524] p-2.5 rounded-xl border border-[#1d2238]">
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Egasi & Tel</span>
                        <span className="font-medium text-white truncate block">{tenant.ownerName}</span>
                        <span className="font-mono text-[11px] text-neutral-300">{tenant.phone}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 block">Qolgan / Buyurtma</span>
                        <span className={`font-mono font-bold block ${typeof tenant.daysRemaining === 'number' && tenant.daysRemaining <= 7 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {typeof tenant.daysRemaining === 'number' ? (tenant.daysRemaining <= 0 ? 'Tugagan' : `${tenant.daysRemaining} kun`) : '—'}
                        </span>
                        <span className="font-mono text-[11px] text-[#d4af37] tabular-nums">
                          {metric ? `${metric.ordersCount} chek · ${metric.menuCount} taom` : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => setExtendingTenant(tenant)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#1a1e2f] text-amber-300 border border-[#2f3754] text-xs font-semibold"
                      >
                        + Uzaytirish
                      </button>
                      <button
                        onClick={() => {
                          setResetPwTenant(tenant);
                          setNewAdminUsername(tenant.adminUsername || 'admin');
                          setNewAdminPassword('');
                        }}
                        className="py-2 px-3 rounded-xl bg-[#161a29] text-white border border-[#2c334d] text-xs font-semibold flex items-center gap-1"
                      >
                        <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Parol</span>
                      </button>
                      <button
                        onClick={() => handleToggleBlock(tenant.slug, tenant.status)}
                        className={`p-2 rounded-xl border ${
                          tenant.status === 'blocked'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                            : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                        }`}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <a
                        href={`/${tenant.slug}/admin`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#161a29] text-[#d4af37] border border-[#2c334d]"
                      >
                        <Key className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Tenants Table */}
            <div className="hidden md:block rounded-2xl border border-[#21263d] bg-[#0c0e18] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-[#121524] text-neutral-400 uppercase text-[10px] font-mono border-b border-[#21263d]">
                    <tr>
                      <th className="p-3.5">Restoran / Slug</th>
                      <th className="p-3.5">Egasining Ismi & Tel</th>
                      <th className="p-3.5">Buyurtma / Menyu / Tushum</th>
                      <th className="p-3.5">Holati</th>
                      <th className="p-3.5">Qolgan Kun</th>
                      <th className="p-3.5 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b1f32]">
                    {filteredTenants.map(tenant => {
                      const metric = tenantMetrics[tenant.slug];
                      return (
                        <tr key={tenant.id} className="hover:bg-[#141728] transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              <span>{tenant.name}</span>
                              {metric && metric.onlineCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono">
                                  {metric.onlineCount} online
                                </span>
                              )}
                            </div>
                            <a
                              href={`/${tenant.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#d4af37] font-mono text-xs hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              <span>/{tenant.slug}</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>
                          </td>

                          <td className="p-3.5">
                            <div className="font-medium text-white">{tenant.ownerName}</div>
                            <div className="text-neutral-400 font-mono text-[11px]">{tenant.phone}</div>
                          </td>

                          <td className="p-3.5 font-mono">
                            {metric ? (
                              <div>
                                <div className="text-white font-bold tabular-nums">{formatUZS(metric.paidRevenue)}</div>
                                <div className="text-[10px] text-neutral-400">
                                  {metric.ordersCount} chek · {metric.menuCount} taom · {metric.tablesCount} stol
                                </div>
                              </div>
                            ) : (
                              <span className="text-neutral-500">—</span>
                            )}
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

                          <td className="p-3.5 font-mono font-bold tabular-nums">
                            {typeof tenant.daysRemaining === 'number' ? (
                              <span className={tenant.daysRemaining <= 7 ? 'text-rose-400' : 'text-emerald-400'}>
                                {tenant.daysRemaining <= 0 ? 'Tugagan' : `${tenant.daysRemaining} kun`}
                              </span>
                            ) : '—'}
                            <div className="text-[10px] text-neutral-500 font-normal">
                              {tenant.endDate ? new Date(tenant.endDate).toLocaleDateString('uz-UZ') : ''}
                            </div>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setExtendingTenant(tenant)}
                                className="px-2.5 py-1 rounded-lg bg-[#1a1e2f] hover:bg-[#252b44] text-amber-300 border border-[#2f3754] text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Obunani uzaytirish"
                              >
                                + Uzaytirish
                              </button>

                              <button
                                onClick={() => {
                                  setResetPwTenant(tenant);
                                  setNewAdminUsername(tenant.adminUsername || 'admin');
                                  setNewAdminPassword('');
                                }}
                                className="p-1.5 rounded-lg bg-[#161a29] hover:bg-[#20253c] text-neutral-200 border border-[#2c334d] cursor-pointer"
                                title="Admin parolini yangilash"
                              >
                                <Lock className="w-3.5 h-3.5 text-sky-400" />
                              </button>

                              <button
                                onClick={() => handleToggleBlock(tenant.slug, tenant.status)}
                                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SITE USERS & LIVE ONLINE SESSIONS */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            {/* Live Online Sessions Panel */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0e111d] border border-emerald-500/30 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h2 className="font-serif font-bold text-sm sm:text-base text-white">
                    HOZIR SAYTDA BO'LGAN FOYDALANUVCHILAR (ONLINE)
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold tabular-nums">
                  {onlineSessions.length} ta faol sessiya (oxirgi 5 daqiqa)
                </span>
              </div>

              {onlineSessions.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#090b12] border border-[#1d2236] text-xs text-neutral-400 font-mono">
                  Hozircha faol sessiyalar qayd etilmagan. Tashrifchilar kirishi bilan bu yerda jonli ko'rinadi.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {onlineSessions.map(sess => (
                    <div
                      key={sess.sessionId}
                      className="p-3 rounded-xl bg-[#121626] border border-[#222840] flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
                          {sess.device === 'Mobil' ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{sess.userName}</div>
                          <div className="text-[10px] font-mono text-neutral-400 truncate">
                            {sess.tenantName} · <span className="text-[#d4af37]">{sess.path}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded bg-[#1b2034] text-[10px] font-mono text-sky-300 uppercase block">
                          {sess.role}
                        </span>
                        <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">
                          {formatRelativeTime(sess.lastSeenAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Role Summary Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { key: 'all', label: 'Barcha Userlar', count: allUsers.length, icon: <Users className="w-4 h-4 text-[#d4af37]" /> },
                { key: 'owner', label: 'Restoran Egalari', count: allUsers.filter(u => u.role === 'owner').length, icon: <Store className="w-4 h-4 text-[#d4af37]" /> },
                { key: 'admin', label: 'Admin & Kassir', count: allUsers.filter(u => u.role === 'admin').length, icon: <ShieldCheck className="w-4 h-4 text-purple-400" /> },
                { key: 'waiter', label: 'Ofitsiantlar', count: allUsers.filter(u => u.role === 'waiter').length, icon: <UtensilsCrossed className="w-4 h-4 text-amber-400" /> },
                { key: 'customer', label: 'Mijozlar', count: allUsers.filter(u => u.role === 'customer').length, icon: <UserCheck className="w-4 h-4 text-emerald-400" /> },
              ].map(card => (
                <button
                  key={card.key}
                  onClick={() => setUserRoleFilter(card.key as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    userRoleFilter === card.key
                      ? 'bg-[#1a1d2e] border-[#d4af37] shadow-md'
                      : 'bg-[#0e101c] border-[#21253a] hover:border-[#303654]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {card.icon}
                    <span className="text-base font-mono font-bold text-white tabular-nums">{card.count}</span>
                  </div>
                  <div className="text-[11px] text-neutral-300 mt-1.5 font-medium truncate">{card.label}</div>
                </button>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ism, telefon, restoran nomi yoki login..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0f111d] border border-[#23283c] text-base sm:text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 sm:flex items-center gap-2">
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value as any)}
                  className="px-3 py-2.5 rounded-xl bg-[#0f111d] border border-[#23283c] text-base sm:text-xs text-white focus:outline-none"
                >
                  <option value="all">Barcha rollar</option>
                  <option value="owner">Restoran Egasi</option>
                  <option value="admin">Admin / Kassir</option>
                  <option value="waiter">Ofitsiant</option>
                  <option value="courier">Kuryer</option>
                  <option value="customer">Mijoz</option>
                </select>

                <select
                  value={userTenantFilter}
                  onChange={e => setUserTenantFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-[#0f111d] border border-[#23283c] text-base sm:text-xs text-white focus:outline-none"
                >
                  <option value="all">Barcha restoranlar</option>
                  {tenants.map(t => (
                    <option key={t.slug} value={t.slug}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Users List: Mobile Cards + Desktop Table */}
            {filteredUsers.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-[#0e101c] border border-[#21253a] text-xs text-neutral-400">
                Tanlangan filtr bo'yicha foydalanuvchilar topilmadi.
              </div>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="md:hidden space-y-2.5">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="p-3.5 rounded-2xl bg-[#0c0e18] border border-[#21263d] space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">{u.name}</div>
                          <div className="text-[11px] font-mono text-[#d4af37] truncate">
                            {u.tenantName} (/{u.tenantSlug})
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${roleBadgeStyle(u.role)}`}>
                          {u.roleLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono text-neutral-300 pt-1 border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-500" />
                          <span>{u.phone || '—'}</span>
                        </span>
                        <span className="text-emerald-400 font-bold tabular-nums">
                          {u.totalSpent > 0 ? formatUZS(u.totalSpent) : u.ordersCount > 0 ? `${u.ordersCount} buyurtma` : u.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block rounded-2xl border border-[#21263d] bg-[#0c0e18] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-[#121524] text-neutral-400 uppercase text-[10px] font-mono border-b border-[#21263d]">
                        <tr>
                          <th className="p-3.5">Foydalanuvchi</th>
                          <th className="p-3.5">Roli</th>
                          <th className="p-3.5">Restoran (Tenant)</th>
                          <th className="p-3.5">Telefon / Aloqa</th>
                          <th className="p-3.5">Holati</th>
                          <th className="p-3.5 text-right">Buyurtma / Aylanma</th>
                          <th className="p-3.5 text-right">Oxirgi Faollik</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1b1f32]">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-[#141728] transition-colors">
                            <td className="p-3.5">
                              <div className="font-bold text-white text-sm">{u.name}</div>
                              {u.username && (
                                <div className="text-[10px] font-mono text-neutral-400">@{u.username}</div>
                              )}
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${roleBadgeStyle(u.role)}`}>
                                {u.roleLabel}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className="font-semibold text-white">{u.tenantName}</div>
                              <div className="text-[10px] font-mono text-[#d4af37]">/{u.tenantSlug}</div>
                            </td>
                            <td className="p-3.5 font-mono">
                              <div className="text-neutral-200">{u.phone || '—'}</div>
                              {u.telegram && <div className="text-[10px] text-sky-400">{u.telegram}</div>}
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded bg-[#181c2e] text-neutral-300 font-mono text-[10px]">
                                {u.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-mono tabular-nums">
                              {u.totalSpent > 0 ? (
                                <div className="font-bold text-emerald-400">{formatUZS(u.totalSpent)}</div>
                              ) : (
                                <span className="text-neutral-500">—</span>
                              )}
                              {u.ordersCount > 0 && (
                                <div className="text-[10px] text-neutral-400">{u.ordersCount} ta</div>
                              )}
                            </td>
                            <td className="p-3.5 text-right font-mono text-[11px] text-neutral-400">
                              {formatRelativeTime(u.lastActiveAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 4: PLATFORM ANALYTICS & SYSTEM HEALTH */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-[#0e111d] border border-[#22273f] space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Baza Holati</span>
                  <Server className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {overview?.systemHealth?.mongoConnected ? 'MongoDB Atlas Faol' : 'Lokal Rejim'}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  Muhit: {overview?.systemHealth?.environment || 'Production'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e111d] border border-[#22273f] space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Restoranlar Jami Aylanmasi (GMV)</span>
                  <DollarSign className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div className="text-lg font-bold font-mono text-[#d4af37] tabular-nums">
                  {formatUZS(overview?.platformMetrics?.totalPlatformGMV || 0)}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono tabular-nums">
                  {overview?.platformMetrics?.totalOrders || 0} ta buyurtma asosida
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e111d] border border-[#22273f] space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Jami Taomlar & Stollar</span>
                  <UtensilsCrossed className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-lg font-bold font-mono text-white tabular-nums">
                  {overview?.platformMetrics?.totalMenuItems || 0} taom · {overview?.platformMetrics?.totalTables || 0} stol
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  Barcha tenantlar bo'yicha
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e111d] border border-[#22273f] space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Obuna Holatlari</span>
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-sm font-mono font-bold text-white tabular-nums">
                  Faol: <span className="text-emerald-400">{activeTenantsCount}</span> · Tugagan:{' '}
                  <span className="text-amber-400">{overview?.platformMetrics?.expiredTenants || 0}</span> · Blok:{' '}
                  <span className="text-rose-400">{overview?.platformMetrics?.blockedTenants || 0}</span>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  Tizim uptime: {Math.floor((overview?.systemHealth?.nodeUptimeSeconds || 0) / 60)} daqiqa
                </div>
              </div>
            </div>

            {/* Top Restaurants by Order Volume & Revenue */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#0e111d] border border-[#22273f] space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base text-white">
                  RESTORANLAR FAOLIYAT REYTINGI (SAVDO VA BUYURTMALAR)
                </h3>
                <span className="text-[11px] font-mono text-[#d4af37]">Real-time hisobot</span>
              </div>

              <div className="space-y-3">
                {Object.values(tenantMetrics)
                  .sort((a, b) => b.paidRevenue - a.paidRevenue || b.ordersCount - a.ordersCount)
                  .map((tm, idx) => {
                    const maxRev = Math.max(1, ...Object.values(tenantMetrics).map(x => x.paidRevenue));
                    const pct = Math.max(4, Math.round((tm.paidRevenue / maxRev) * 100));
                    return (
                      <div key={tm.slug} className="p-3 rounded-xl bg-[#121626] border border-[#20263e] space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-[#d4af37]/15 text-[#d4af37] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <span className="text-sm font-bold text-white truncate block">{tm.name}</span>
                              <span className="text-[10px] font-mono text-neutral-400">
                                /{tm.slug} · {tm.ordersCount} chek · {tm.menuCount} taom · {tm.customersCount} mijoz
                              </span>
                            </div>
                          </div>
                          <div className="text-right font-mono font-bold text-sm text-[#d4af37] tabular-nums">
                            {formatUZS(tm.paidRevenue)}
                          </div>
                        </div>
                        <div className="h-2 w-full bg-[#0a0c15] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#8f6f18] via-[#d4af37] to-[#f4d675] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PRICING & PAYMENT SETTINGS */}
        {activeTab === 'pricing' && (
          <div className="max-w-2xl bg-[#0f111d] border border-[#21263d] rounded-3xl p-5 sm:p-8 space-y-6">
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-white">
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
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141724] border border-[#262b42] text-base sm:text-sm text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[11px] sm:text-xs text-neutral-300 mb-1">3 oy chegirma %</label>
                  <input
                    type="number"
                    value={pricingConfig.discount3MonthsPercent}
                    onChange={e => setPricingConfig({ ...pricingConfig, discount3MonthsPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141724] border border-[#262b42] text-base sm:text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs text-neutral-300 mb-1">6 oy chegirma %</label>
                  <input
                    type="number"
                    value={pricingConfig.discount6MonthsPercent}
                    onChange={e => setPricingConfig({ ...pricingConfig, discount6MonthsPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141724] border border-[#262b42] text-base sm:text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs text-neutral-300 mb-1">12 oy chegirma %</label>
                  <input
                    type="number"
                    value={pricingConfig.discount12MonthsPercent}
                    onChange={e => setPricingConfig({ ...pricingConfig, discount12MonthsPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141724] border border-[#262b42] text-base sm:text-sm text-white font-mono"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141724] border border-[#262b42] text-base sm:text-sm text-white font-mono"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141724] border border-[#262b42] text-base sm:text-sm text-white"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141724] border border-[#262b42] text-base sm:text-sm text-white"
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
              className="w-full p-3 rounded-xl bg-[#141728] border border-[#272c44] text-base sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
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
              <CheckCircle2 className="w-6 h-6 shrink-0" />
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

      {/* MODAL 5: CREATE NEW RESTAURANT DIRECTLY */}
      {isCreateTenantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <form
            onSubmit={handleCreateTenant}
            className="w-full max-w-lg bg-[#0f111e] border border-[#d4af37]/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto"
          >
            <div className="flex items-center justify-between border-b border-[#21253a] pb-3">
              <h3 className="font-serif font-bold text-white text-base sm:text-lg">
                Yangi Restoran Qo'shish (To'g'ridan-to'g'ri)
              </h3>
              <button type="button" onClick={() => setIsCreateTenantOpen(false)} className="text-neutral-400 hover:text-white p-1">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-300 block mb-1">Restoran nomi *</label>
                <input
                  required
                  type="text"
                  placeholder="Masalan: Rayhon Milliy"
                  value={newTenantForm.name}
                  onChange={e => setNewTenantForm({ ...newTenantForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#141726] border border-[#262b44] text-base sm:text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-300 block mb-1">Sayt manzili (slug) *</label>
                <input
                  required
                  type="text"
                  placeholder="rayhon"
                  value={newTenantForm.slug}
                  onChange={e => setNewTenantForm({ ...newTenantForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="w-full px-3 py-2 rounded-xl bg-[#141726] border border-[#262b44] text-base sm:text-xs text-[#d4af37] font-mono focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-300 block mb-1">Egasi ismi *</label>
                <input
                  required
                  type="text"
                  placeholder="Ism Familiya"
                  value={newTenantForm.ownerName}
                  onChange={e => setNewTenantForm({ ...newTenantForm, ownerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#141726] border border-[#262b44] text-base sm:text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-300 block mb-1">Telefon *</label>
                <input
                  required
                  type="text"
                  value={newTenantForm.phone}
                  onChange={e => setNewTenantForm({ ...newTenantForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#141726] border border-[#262b44] text-base sm:text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-300 block mb-1">Admin Login</label>
                <input
                  type="text"
                  value={newTenantForm.adminUsername}
                  onChange={e => setNewTenantForm({ ...newTenantForm, adminUsername: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#141726] border border-[#262b44] text-base sm:text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-300 block mb-1">Admin Parol *</label>
                <input
                  required
                  type="text"
                  value={newTenantForm.adminPasswordHash}
                  onChange={e => setNewTenantForm({ ...newTenantForm, adminPasswordHash: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#141726] border border-[#262b44] text-base sm:text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-300 block mb-1">Obuna muddati (oy)</label>
              <select
                value={newTenantForm.planMonths}
                onChange={e => setNewTenantForm({ ...newTenantForm, planMonths: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#141726] border border-[#262b44] text-base sm:text-xs text-white"
              >
                <option value={1}>1 oylik sinov / obuna</option>
                <option value={3}>3 oylik obuna</option>
                <option value={6}>6 oylik obuna</option>
                <option value={12}>12 oylik (1 yil)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateTenantOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#181c2e] text-neutral-300 text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={creatingTenant}
                className="px-5 py-2 rounded-xl bg-[#d4af37] text-neutral-950 text-xs font-bold disabled:opacity-60"
              >
                {creatingTenant ? 'Yaratilmoqda...' : 'Restoranni Yaratish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 6: RESET TENANT ADMIN PASSWORD */}
      {resetPwTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleResetTenantPassword}
            className="w-full max-w-md bg-[#0f111e] border border-sky-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div>
              <h3 className="font-serif font-bold text-white text-base sm:text-lg">
                Admin Parolini Yangilash
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                {resetPwTenant.name} (/{resetPwTenant.slug})
              </p>
            </div>

            <div>
              <label className="text-[11px] text-neutral-300 block mb-1">Admin Login</label>
              <input
                type="text"
                value={newAdminUsername}
                onChange={e => setNewAdminUsername(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141726] border border-[#262b44] text-base sm:text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-300 block mb-1">Yangi Parol *</label>
              <input
                required
                type="text"
                placeholder="Kamida 4 belgi..."
                value={newAdminPassword}
                onChange={e => setNewAdminPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141726] border border-[#262b44] text-base sm:text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetPwTenant(null)}
                className="px-4 py-2 rounded-xl bg-[#181c2e] text-neutral-300 text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={resettingPw}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 text-xs font-bold disabled:opacity-60"
              >
                {resettingPw ? 'Saqlanmoqda...' : 'Parolni Yangilash'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 7: CONFIRMATION DIALOG (replaces window.confirm) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0f111e] border border-[#2c324c] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-white text-base sm:text-lg">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={confirmLoading}
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-[#181c2e] text-neutral-300 text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={confirmLoading}
                onClick={async () => {
                  setConfirmLoading(true);
                  try {
                    await confirmModal.onConfirm();
                  } finally {
                    setConfirmLoading(false);
                    setConfirmModal(null);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  confirmModal.danger
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
                }`}
              >
                {confirmLoading ? 'Bajarilmoqda...' : confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
