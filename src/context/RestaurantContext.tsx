import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { 
  MenuItem, Order, Courier, Waiter, AdminUser, 
  RestaurantSettings, RestaurantTable, OrderStatus, PaymentMethod, Language, MongoStatus,
  CustomerReview, TableReservation, ChefProfile, PushNotification, Tenant 
} from '../types';
import { 
  INITIAL_MENU_ITEMS, INITIAL_ORDERS, INITIAL_COURIERS, 
  INITIAL_WAITERS, INITIAL_ADMIN_USERS, INITIAL_SETTINGS, INITIAL_TABLES,
  INITIAL_CHEFS, INITIAL_REVIEWS, INITIAL_RESERVATIONS 
} from '../data/initialData';
import { translations } from '../i18n/translations';

export type AppRoute = 'mijoz' | 'admin' | 'ofitsiant' | 'kassa' | 'oshxona' | 'dostafka' | 'xisobot';
export type AdminSubTab = 'kassa' | 'savdo_dashboard' | 'oshxona' | 'dostafka' | 'xisobot' | 'menyu' | 'stollar' | 'xodimlar' | 'bronlar' | 'cheklar' | 'sozlamalar';

export interface RealtimeToast {
  id: string;
  type: 'order' | 'status' | 'waiter' | 'push';
  title: string;
  message: string;
  timestamp: number;
}

interface RestaurantContextType {
  // Multi-Tenant SaaS
  currentTenant: Tenant | null;
  tenantSlug: string;
  isDemoMode: boolean;
  isReadOnlyMode: boolean;
  navigateTo: (path: string) => void;
  resetDemoData: () => Promise<void>;
  currentPath: string;

  menuItems: MenuItem[];
  orders: Order[];
  couriers: Courier[];
  waiters: Waiter[];
  adminUsers: AdminUser[];
  settings: RestaurantSettings;
  activeRoute: AppRoute;
  adminSubTab: AdminSubTab;
  soundEnabled: boolean;
  activeReceiptOrder: Order | null;
  isAdminAuthenticated: boolean;
  showAdminLoginModal: boolean;
  currentLoggedInWaiter: Waiter | null;
  mongoStatus: MongoStatus;
  isRealtimeConnected: boolean;
  realtimeToast: RealtimeToast | null;
  dismissRealtimeToast: () => void;
  syncCloudData: () => Promise<boolean>;
  isSyncingCloud: boolean;

  // Real-Time Push Notification System
  notifications: PushNotification[];
  activePushAlert: PushNotification | null;
  dismissPushAlert: () => void;
  sendPushNotification: (notif: Omit<PushNotification, 'id' | 'timestamp'>) => Promise<boolean>;
  showPushModal: boolean;
  setShowPushModal: (show: boolean) => void;

  // Table QR Code & Digital Menu Context
  currentTableContext: string | null;
  isMenuOnlyMode: boolean;
  setCurrentTableContext: (table: string | null) => void;
  setIsMenuOnlyMode: (enabled: boolean) => void;
  callWaiterFromTable: (tableName: string) => void;
  waiterCallAlert: { table: string; timestamp: number } | null;
  dismissWaiterCallAlert: () => void;
  
  // Multi-Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['uz']) => string;
  
  setRoute: (route: AppRoute) => void;
  setAdminSubTab: (tab: AdminSubTab) => void;
  toggleSound: () => void;
  playOrderChime: () => void;
  openReceiptModal: (order: Order) => void;
  closeReceiptModal: () => void;

  // Waiter Auth
  waiterLogin: (waiterId: string, password: string) => boolean;
  waiterLoginByPin: (pin: string) => boolean;
  waiterLogout: () => void;
  
  // Admin Auth & Management
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  setShowAdminLoginModal: (show: boolean) => void;
  addAdminUser: (admin: Omit<AdminUser, 'id' | 'createdAt'>) => void;
  updateAdminUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;
  
  // Menu Item mutations
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  updateItemPrice: (id: string, newPrice: number) => void;

  // Staff mutations
  addCourier: (courier: Omit<Courier, 'id' | 'activeOrdersCount'>) => void;
  updateCourier: (id: string, updates: Partial<Courier>) => void;
  deleteCourier: (id: string) => void;
  addWaiter: (waiter: Omit<Waiter, 'id' | 'ordersHandledCount'>) => void;
  updateWaiter: (id: string, updates: Partial<Waiter>) => void;
  deleteWaiter: (id: string) => void;

  // Tables Management
  tables: RestaurantTable[];
  addTable: (table: Omit<RestaurantTable, 'id' | 'isActive'> & { isActive?: boolean }) => void;
  updateTable: (id: string, updates: Partial<RestaurantTable>) => void;
  deleteTable: (id: string) => void;

  // Chefs Team
  chefs: ChefProfile[];

  // Reviews & Feedback
  reviews: CustomerReview[];
  addReview: (review: Omit<CustomerReview, 'id' | 'date' | 'likesCount'>) => void;

  // Table Reservations
  reservations: TableReservation[];
  addReservation: (resData: Omit<TableReservation, 'id' | 'createdAt' | 'status'> & { status?: 'tasdiqlandi' | 'kutilmoqda' | 'bekor_qilindi' }) => TableReservation;
  updateReservationStatus: (id: string, status: 'tasdiqlandi' | 'kutilmoqda' | 'bekor_qilindi') => void;
  deleteReservation: (id: string) => void;

  // Order actions
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'isPaid'> & { status?: OrderStatus; isPaid?: boolean }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  toggleOrderItemReady: (orderId: string, itemId: string) => void;
  assignCourier: (orderId: string, courierId: string) => void;
  settleOrderPayment: (orderId: string, method: PaymentMethod) => void;
  cancelOrder: (orderId: string) => void;

  // Restaurant settings & tenant auth
  updateSettings: (newSettings: Partial<RestaurantSettings>) => void;
  updateTenantAdminPassword: (newPassword: string) => Promise<boolean>;

  // Formatters
  formatUZS: (amount: number) => string;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

// Web Audio API chime synthesizer for crisp luxury restaurant bell chime
const playLuxuryChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // Ramp to A6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.5, ctx.currentTime); // E6 harmonic

    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 1.2);
    osc2.stop(ctx.currentTime + 1.2);
  } catch {
    // Ignore audio autoplay restrictions
  }
};

// Map fallback images for dishes to ensure photos always look high-end
const getImageForDish = (id: string, defaultImage?: string): string => {
  if (defaultImage && defaultImage.startsWith('data:') || defaultImage?.startsWith('http') || defaultImage?.startsWith('/')) {
    return defaultImage;
  }
  const match = INITIAL_MENU_ITEMS.find(m => m.id === id);
  return match?.image || defaultImage || '';
};

const extractSlugFromPath = (path: string): string => {
  const cleaned = path.split('?')[0].replace(/\/+$/, '');
  const segments = cleaned.split('/').filter(Boolean);
  if (segments.length === 0) return '';
  const first = segments[0].toLowerCase();
  if (['superadmin', 'buy', 'pricing', 'api', 'login'].includes(first)) return '';
  return first;
};

const buildNeutralTenantSettings = (slug: string): RestaurantSettings => {
  if (slug === 'demo') return INITIAL_SETTINGS;
  const displayName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Restoran';
  return {
    name: displayName,
    slogan: '',
    bio: '',
    heroBadge: '',
    heroTitle: displayName,
    heroHighlight: '',
    address: '',
    phone: '',
    email: '',
    stir: '',
    serviceFeePercent: 10,
    headerMessage: `${displayName} ga xush kelibsiz!`,
    footerReceiptMessage: 'Tashrifingiz uchun minnatdormiz!',
    wifiPassword: '',
    workingDays: 'Dushanba - Yakshanba:',
    workingHours: '09:00 - 23:00',
    specialHoursLabel: '',
    specialHoursValue: '',
    eventsTitle: '',
    eventsSchedule: '',
    telegram: '',
    instagram: '',
    aboutTitle: '',
    aboutQuote: '',
    aboutDescription1: '',
    aboutDescription2: ''
  };
};

const readScopedStorage = <T,>(baseKey: string, slug: string, fallback: T): T => {
  try {
    const scoped = localStorage.getItem(`${baseKey}_${slug}`);
    if (scoped) {
      const parsed = JSON.parse(scoped);
      if (parsed !== null && parsed !== undefined) {
        if (Array.isArray(fallback) && Array.isArray(parsed)) {
          return parsed as T;
        }
        if (!Array.isArray(fallback) && typeof parsed === 'object') {
          return parsed as T;
        }
      }
    }
    if (slug === 'demo') {
      const legacy = localStorage.getItem(baseKey);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (parsed !== null && parsed !== undefined) return parsed as T;
      }
    }
  } catch {}
  return fallback;
};

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Multi-Tenant Path & Slug Extraction FIRST so all tenant state is isolated from frame 1
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });

  const [tenantSlug, setTenantSlug] = useState<string>(() => extractSlugFromPath(currentPath));
  const effectiveSlug = tenantSlug || 'demo';
  const [stateSlug, setStateSlug] = useState<string>(effectiveSlug);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  const isDemoMode = effectiveSlug === 'demo';
  const isReadOnlyMode = !!(currentTenant && (currentTenant.isExpired || currentTenant.status === 'expired' || currentTenant.status === 'blocked'));

  // Multi-Language
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('savoria_language') as Language) || 'uz';
  });

  // Tenant-Isolated State with Immediate LocalStorage Persistence
  const [orders, setOrders] = useState<Order[]>(() =>
    readScopedStorage<Order[]>('savoria_orders', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_ORDERS : [])
  );

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() =>
    readScopedStorage<MenuItem[]>('savoria_menu_items', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_MENU_ITEMS : [])
  );

  const [tables, setTables] = useState<RestaurantTable[]>(() =>
    readScopedStorage<RestaurantTable[]>('savoria_tables', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_TABLES : [])
  );

  const [reservations, setReservations] = useState<TableReservation[]>(() =>
    readScopedStorage<TableReservation[]>('savoria_reservations', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_RESERVATIONS : [])
  );

  const [couriers, setCouriers] = useState<Courier[]>(() =>
    readScopedStorage<Courier[]>('savoria_couriers', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_COURIERS : [])
  );

  const [waiters, setWaiters] = useState<Waiter[]>(() =>
    readScopedStorage<Waiter[]>('savoria_waiters', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_WAITERS : [])
  );

  const [settings, setSettings] = useState<RestaurantSettings>(() =>
    readScopedStorage<RestaurantSettings>('savoria_settings', effectiveSlug, buildNeutralTenantSettings(effectiveSlug))
  );

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() =>
    readScopedStorage<AdminUser[]>('savoria_admin_users', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_ADMIN_USERS : [])
  );

  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [chefs] = useState<ChefProfile[]>(INITIAL_CHEFS);

  // Push Notifications State
  const [notifications, setNotifications] = useState<PushNotification[]>(() =>
    readScopedStorage<PushNotification[]>('savoria_notifications', effectiveSlug, [])
  );
  const [activePushAlert, setActivePushAlert] = useState<PushNotification | null>(null);
  const [showPushModal, setShowPushModal] = useState<boolean>(false);

  // Auth & Routing (Isolated per tenant!)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`savoria_admin_auth_${effectiveSlug}`) === 'true';
    } catch {
      return false;
    }
  });
  const [currentLoggedInWaiter, setCurrentLoggedInWaiter] = useState<Waiter | null>(() => {
    try {
      const saved = localStorage.getItem(`savoria_active_waiter_${effectiveSlug}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('kassa');

  // Real-time status & Notification Toasts
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [realtimeToast, setRealtimeToast] = useState<RealtimeToast | null>(null);

  // Table QR Menu Context & URL Parsing
  const getInitialTableContext = (): string | null => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('table') || null;
    } catch {
      return null;
    }
  };

  const getInitialMenuOnlyMode = (): boolean => {
    try {
      const params = new URLSearchParams(window.location.search);
      const m = params.get('mode') || '';
      return m === 'menu' || m === 'menu_only' || !!params.get('table');
    } catch {
      return false;
    }
  };

  const [currentTableContext, setCurrentTableContext] = useState<string | null>(getInitialTableContext);
  const [isMenuOnlyMode, setIsMenuOnlyMode] = useState<boolean>(getInitialMenuOnlyMode);
  const [waiterCallAlert, setWaiterCallAlert] = useState<{ table: string; timestamp: number } | null>(null);

  const [mongoStatus, setMongoStatus] = useState<MongoStatus>({
    connected: false,
    cluster: 'MongoDB Atlas',
    database: 'savoria',
    message: 'Markaziy bazaga ulanmoqda...'
  });

  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  const getInitialRoute = (): AppRoute => {
    if (typeof window === 'undefined') return 'mijoz';
    const path = window.location.pathname;
    if (path.includes('admin')) return 'admin';
    if (path.includes('kassa')) return 'kassa';
    if (path.includes('oshxona')) return 'oshxona';
    if (path.includes('dostafka')) return 'dostafka';
    if (path.includes('xisobot')) return 'xisobot';
    if (path.includes('ofitsiant')) return 'ofitsiant';
    return 'mijoz';
  };

  const [activeRoute, setActiveRoute] = useState<AppRoute>(getInitialRoute);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);

  const navigateTo = useCallback((newPath: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', newPath);
      setCurrentPath(newPath);
      const newSlug = extractSlugFromPath(newPath);
      setTenantSlug(newSlug);
      if (newPath.includes('/admin')) {
        setActiveRoute('admin');
      } else if (newPath.includes('/ofitsiant')) {
        setActiveRoute('ofitsiant');
      } else {
        setActiveRoute('mijoz');
      }
      // Also parse query parameters if QR mode URL was navigated to
      try {
        const urlObj = new URL(newPath, window.location.origin);
        const tbl = urlObj.searchParams.get('table');
        const mode = urlObj.searchParams.get('mode');
        if (tbl) setCurrentTableContext(tbl);
        else setCurrentTableContext(null);
        setIsMenuOnlyMode(mode === 'menu' || mode === 'menu_only' || !!tbl);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const p = window.location.pathname;
      setCurrentPath(p);
      setTenantSlug(extractSlugFromPath(p));
      if (p.includes('/admin')) {
        setActiveRoute('admin');
      } else if (p.includes('/ofitsiant')) {
        setActiveRoute('ofitsiant');
      } else {
        setActiveRoute('mijoz');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const dismissRealtimeToast = () => setRealtimeToast(null);
  const dismissWaiterCallAlert = () => setWaiterCallAlert(null);
  const dismissPushAlert = () => setActivePushAlert(null);

  useEffect(() => {
    if (!waiterCallAlert) return;
    const timer = setTimeout(() => {
      setWaiterCallAlert(null);
    }, 15000);
    return () => clearTimeout(timer);
  }, [waiterCallAlert]);

  const playChime = useCallback(() => {
    if (soundEnabled) {
      playLuxuryChime();
    }
  }, [soundEnabled]);

  const syncCloudData = useCallback(async (): Promise<boolean> => {
    setIsSyncingCloud(true);
    try {
      const currentLocalOrders = readScopedStorage<Order[]>('savoria_orders', effectiveSlug, orders);
      const currentLocalMenu = readScopedStorage<MenuItem[]>('savoria_menu_items', effectiveSlug, menuItems);

      const res = await fetch(`/api/sync/full?tenantId=${encodeURIComponent(effectiveSlug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
        body: JSON.stringify({
          tenantId: effectiveSlug,
          localOrders: currentLocalOrders,
          localMenuItems: currentLocalMenu
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.orders)) {
            setOrders(data.orders);
            try { localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(data.orders)); } catch {}
          }
          if (Array.isArray(data.menu)) {
            const enriched = data.menu.map((item: MenuItem) => ({
              ...item,
              image: getImageForDish(item.id, item.image)
            }));
            setMenuItems(enriched);
            try { localStorage.setItem(`savoria_menu_items_${effectiveSlug}`, JSON.stringify(enriched)); } catch {}
          }
          if (data.mongoConnected !== undefined) {
            setMongoStatus({
              connected: !!data.mongoConnected,
              cluster: 'MongoDB Atlas',
              database: 'savoria',
              message: data.mongoConnected ? 'Markaziy MongoDB bazasi faol' : 'Lokal xotira faol'
            });
          }
          setRealtimeToast({
            id: `sync-${Date.now()}`,
            type: 'push',
            title: 'Bulutli Baza Sinxronlandi!',
            message: `Jami ${data.orders?.length || 0} ta chek va barcha taomlar bazada muvaffaqiyatli sinxronlandi.`,
            timestamp: Date.now()
          });
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('syncCloudData error:', err);
      return false;
    } finally {
      setIsSyncingCloud(false);
    }
  }, [orders, menuItems, effectiveSlug]);

  const formatUZS = (amount: number): string => {
    const suffix = language === 'ru' ? ' сум' : language === 'en' ? ' UZS' : ' so\'m';
    return new Intl.NumberFormat('uz-UZ').format(amount) + suffix;
  };

  // ========================================================
  // PERSISTENCE EFFECT: Save to Tenant-Scoped LocalStorage ONLY when stateSlug === effectiveSlug
  // ========================================================
  useEffect(() => {
    if (stateSlug !== effectiveSlug) return;
    try { localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(orders)); } catch {}
  }, [orders, stateSlug, effectiveSlug]);

  useEffect(() => {
    if (stateSlug !== effectiveSlug) return;
    try { localStorage.setItem(`savoria_menu_items_${effectiveSlug}`, JSON.stringify(menuItems)); } catch {}
  }, [menuItems, stateSlug, effectiveSlug]);

  useEffect(() => {
    if (stateSlug !== effectiveSlug) return;
    try { localStorage.setItem(`savoria_tables_${effectiveSlug}`, JSON.stringify(tables)); } catch {}
  }, [tables, stateSlug, effectiveSlug]);

  useEffect(() => {
    if (stateSlug !== effectiveSlug) return;
    try { localStorage.setItem(`savoria_reservations_${effectiveSlug}`, JSON.stringify(reservations)); } catch {}
  }, [reservations, stateSlug, effectiveSlug]);

  useEffect(() => {
    if (stateSlug !== effectiveSlug) return;
    try { localStorage.setItem(`savoria_couriers_${effectiveSlug}`, JSON.stringify(couriers)); } catch {}
  }, [couriers, stateSlug, effectiveSlug]);

  useEffect(() => {
    if (stateSlug !== effectiveSlug) return;
    try { localStorage.setItem(`savoria_waiters_${effectiveSlug}`, JSON.stringify(waiters)); } catch {}
  }, [waiters, stateSlug, effectiveSlug]);

  useEffect(() => {
    if (stateSlug !== effectiveSlug) return;
    try { localStorage.setItem(`savoria_settings_${effectiveSlug}`, JSON.stringify(settings)); } catch {}
  }, [settings, stateSlug, effectiveSlug]);

  useEffect(() => {
    if (stateSlug !== effectiveSlug) return;
    try { localStorage.setItem(`savoria_notifications_${effectiveSlug}`, JSON.stringify(notifications)); } catch {}
  }, [notifications, stateSlug, effectiveSlug]);

  useEffect(() => {
    if (stateSlug !== effectiveSlug) return;
    try { localStorage.setItem(`savoria_admin_users_${effectiveSlug}`, JSON.stringify(adminUsers)); } catch {}
  }, [adminUsers, stateSlug, effectiveSlug]);

  const resetDemoData = useCallback(async () => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        setRealtimeToast({
          id: `reset-${Date.now()}`,
          type: 'push',
          title: 'Demo Tiklandi!',
          message: 'Barcha demo buyurtmalari tozalandi va asl holatiga qaytarildi.',
          timestamp: Date.now()
        });
        try {
          localStorage.removeItem('savoria_orders_demo');
          localStorage.removeItem('savoria_orders');
        } catch {}
        window.location.reload();
      }
    } catch (err) {
      console.error('Demo reset error:', err);
    }
  }, []);

  // ========================================================
  // 1. BOOTSTRAP: Load Authoritative Tenant-Isolated State whenever effectiveSlug changes
  // ========================================================
  useEffect(() => {
    let isCancelled = false;

    // Reset/hydrate from scoped localStorage immediately when tenantSlug changes
    setOrders(readScopedStorage<Order[]>('savoria_orders', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_ORDERS : []));
    setMenuItems(readScopedStorage<MenuItem[]>('savoria_menu_items', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_MENU_ITEMS : []));
    setTables(readScopedStorage<RestaurantTable[]>('savoria_tables', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_TABLES : []));
    setReservations(readScopedStorage<TableReservation[]>('savoria_reservations', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_RESERVATIONS : []));
    setCouriers(readScopedStorage<Courier[]>('savoria_couriers', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_COURIERS : []));
    setWaiters(readScopedStorage<Waiter[]>('savoria_waiters', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_WAITERS : []));
    setSettings(readScopedStorage<RestaurantSettings>('savoria_settings', effectiveSlug, buildNeutralTenantSettings(effectiveSlug)));
    setAdminUsers(readScopedStorage<AdminUser[]>('savoria_admin_users', effectiveSlug, effectiveSlug === 'demo' ? INITIAL_ADMIN_USERS : []));
    setNotifications(readScopedStorage<PushNotification[]>('savoria_notifications', effectiveSlug, []));
    try {
      setIsAdminAuthenticated(localStorage.getItem(`savoria_admin_auth_${effectiveSlug}`) === 'true');
      const savedW = localStorage.getItem(`savoria_active_waiter_${effectiveSlug}`);
      setCurrentLoggedInWaiter(savedW ? JSON.parse(savedW) : null);
    } catch {
      setIsAdminAuthenticated(false);
      setCurrentLoggedInWaiter(null);
    }
    setStateSlug(effectiveSlug);

    const loadBootstrapData = async () => {
      try {
        let data: any = null;
        try {
          const tenantRes = await fetch(`/api/tenant-bootstrap/${encodeURIComponent(effectiveSlug)}`);
          if (tenantRes.ok) {
            data = await tenantRes.json();
          }
        } catch {}

        if (isCancelled) return;

        if (!data || !data.success) {
          const res = await fetch(`/api/bootstrap?tenantId=${encodeURIComponent(effectiveSlug)}`);
          data = await res.json();
        }

        if (isCancelled) return;

        if (data && data.success) {
          if (data.tenant) {
            setCurrentTenant(data.tenant);
          }

          setMongoStatus({
            connected: !!data.mongoConnected,
            cluster: 'MongoDB Atlas',
            database: 'savoria',
            message: data.mongoConnected ? 'Markaziy MongoDB bazasi faol' : 'Lokal xotira faol'
          });

          if (Array.isArray(data.menu)) {
            const enrichedMenu = data.menu.map((item: MenuItem) => ({
              ...item,
              image: getImageForDish(item.id, item.image)
            }));
            setMenuItems(enrichedMenu);
            try { localStorage.setItem(`savoria_menu_items_${effectiveSlug}`, JSON.stringify(enrichedMenu)); } catch {}
          }

          if (Array.isArray(data.orders)) {
            setOrders(data.orders);
            try { localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(data.orders)); } catch {}
          }

          if (Array.isArray(data.tables)) {
            setTables(data.tables);
          }
          if (Array.isArray(data.reservations)) {
            setReservations(data.reservations);
          }
          if (Array.isArray(data.waiters)) {
            setWaiters(data.waiters);
          }
          if (Array.isArray(data.couriers)) {
            setCouriers(data.couriers);
          }
          if (Array.isArray(data.adminUsers)) {
            setAdminUsers(data.adminUsers);
          }
          if (data.settings && data.settings.name) {
            setSettings(data.settings);
            try { localStorage.setItem(`savoria_settings_${effectiveSlug}`, JSON.stringify(data.settings)); } catch {}
          }
          if (Array.isArray(data.notifications)) {
            setNotifications(data.notifications);
          }
        }
      } catch (err) {
        console.warn('Bootstrap fetch fallback: working smoothly with persistent localStorage', err);
      }
    };

    loadBootstrapData();

    return () => {
      isCancelled = true;
    };
  }, [effectiveSlug]);

  // ========================================================
  // 2. REAL-TIME ENGINE: Server-Sent Events (SSE) Listener (Tenant-Filtered)
  // ========================================================
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const belongsToTenant = (payload: any): boolean => {
      if (!payload) return false;
      if (!payload.tenantId) return effectiveSlug === 'demo';
      return String(payload.tenantId).toLowerCase() === effectiveSlug;
    };

    const connectRealtime = () => {
      try {
        eventSource = new EventSource('/api/realtime/stream');

        eventSource.onopen = () => {
          setIsRealtimeConnected(true);
        };

        // A. New Order Created
        eventSource.addEventListener('order:created', (e: MessageEvent) => {
          try {
            const newOrder: Order = JSON.parse(e.data);
            if (!belongsToTenant(newOrder)) return;
            setOrders(prev => {
              if (prev.some(o => o.id === newOrder.id)) return prev;
              const next = [newOrder, ...prev];
              try { localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(next)); } catch {}
              return next;
            });
            playChime();
            setRealtimeToast({
              id: newOrder.id,
              type: 'order',
              title: 'Yangi Buyurtma Keldi!',
              message: `#${newOrder.id} · ${newOrder.customerName || 'Mijoz'} (${formatUZS(newOrder.finalTotal)})`,
              timestamp: Date.now()
            });
          } catch {}
        });

        // B. Order Status Updated
        eventSource.addEventListener('order:updated', (e: MessageEvent) => {
          try {
            const updatedOrder: Order = JSON.parse(e.data);
            if (!belongsToTenant(updatedOrder)) return;
            setOrders(prev => {
              const next = prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o);
              try { localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(next)); } catch {}
              return next;
            });

            if (updatedOrder.status === 'tayyor' || updatedOrder.status === 'yolda' || updatedOrder.status === 'yetkazildi') {
              playChime();
              setRealtimeToast({
                id: updatedOrder.id,
                type: 'status',
                title: `Buyurtma #${updatedOrder.id} Yangilandi`,
                message: `Yangi holat: ${updatedOrder.status.toUpperCase()}`,
                timestamp: Date.now()
              });
            }
          } catch {}
        });

        // C. Order Deleted
        eventSource.addEventListener('order:deleted', (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data);
            if (!belongsToTenant(payload)) return;
            setOrders(prev => {
              const next = prev.filter(o => o.id !== payload.id);
              try { localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(next)); } catch {}
              return next;
            });
          } catch {}
        });

        // D. Menu Created / Updated / Deleted
        eventSource.addEventListener('menu:created', (e: MessageEvent) => {
          try {
            const item: MenuItem = JSON.parse(e.data);
            if (!belongsToTenant(item)) return;
            const enriched = { ...item, image: getImageForDish(item.id, item.image) };
            setMenuItems(prev => {
              if (prev.some(i => i.id === item.id)) return prev.map(i => i.id === item.id ? enriched : i);
              return [enriched, ...prev];
            });
          } catch {}
        });

        eventSource.addEventListener('menu:updated', (e: MessageEvent) => {
          try {
            const item: MenuItem = JSON.parse(e.data);
            if (!belongsToTenant(item)) return;
            const enriched = { ...item, image: getImageForDish(item.id, item.image) };
            setMenuItems(prev => prev.map(i => i.id === item.id ? enriched : i));
          } catch {}
        });

        eventSource.addEventListener('menu:deleted', (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data);
            if (!belongsToTenant(payload)) return;
            setMenuItems(prev => prev.filter(i => i.id !== payload.id));
          } catch {}
        });

        // E. Table Updates
        eventSource.addEventListener('table:updated', (e: MessageEvent) => {
          try {
            const table: RestaurantTable = JSON.parse(e.data);
            if (!belongsToTenant(table)) return;
            setTables(prev => {
              const exists = prev.some(t => t.id === table.id);
              if (exists) return prev.map(t => t.id === table.id ? table : t);
              return [...prev, table];
            });
          } catch {}
        });

        eventSource.addEventListener('table:deleted', (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data);
            if (!belongsToTenant(payload)) return;
            setTables(prev => prev.filter(t => t.id !== payload.id));
          } catch {}
        });

        // F. Reservation Updates
        eventSource.addEventListener('reservation:created', (e: MessageEvent) => {
          try {
            const res: TableReservation = JSON.parse(e.data);
            if (!belongsToTenant(res)) return;
            setReservations(prev => [res, ...prev.filter(r => r.id !== res.id)]);
            playChime();
          } catch {}
        });

        eventSource.addEventListener('reservation:updated', (e: MessageEvent) => {
          try {
            const res: TableReservation = JSON.parse(e.data);
            if (!belongsToTenant(res)) return;
            setReservations(prev => prev.map(r => r.id === res.id ? res : r));
          } catch {}
        });

        // G. Waiter Call Buzzer
        eventSource.addEventListener('waiter_call:created', (e: MessageEvent) => {
          try {
            const alertData = JSON.parse(e.data);
            if (!belongsToTenant(alertData)) return;
            setWaiterCallAlert(alertData);
            playChime();
            setRealtimeToast({
              id: `call-${Date.now()}`,
              type: 'waiter',
              title: 'Ofitsiant Chaqirildi!',
              message: `${alertData.table || 'Stol'} ofitsiantni kutmoqda`,
              timestamp: Date.now()
            });
          } catch {}
        });

        // H. ADMIN REAL-TIME PUSH NOTIFICATIONS
        eventSource.addEventListener('admin:push_notification', (e: MessageEvent) => {
          try {
            const notif: PushNotification = JSON.parse(e.data);
            if (!belongsToTenant(notif)) return;

            let isRelevant = false;
            if (notif.target === 'all') {
              isRelevant = true;
            } else if (notif.target === 'waiters') {
              isRelevant = activeRoute === 'ofitsiant' || !!currentLoggedInWaiter;
            } else if (notif.target === 'customers') {
              isRelevant = activeRoute === 'mijoz';
            } else if (notif.target === 'table') {
              const currTbl = (currentTableContext || '').toLowerCase();
              const tgtTbl = (notif.targetTable || '').toLowerCase();
              if (currTbl && (currTbl.includes(tgtTbl) || tgtTbl.includes(currTbl))) {
                isRelevant = true;
              }
              if (isAdminAuthenticated || activeRoute === 'ofitsiant') {
                isRelevant = true;
              }
            }

            if (isRelevant) {
              setActivePushAlert(notif);
              playChime();
              try {
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  navigator.vibrate([200, 100, 200]);
                }
              } catch {}
            }

            setNotifications(prev => [notif, ...prev.filter(n => n.id !== notif.id)]);
          } catch {}
        });

        // I. Settings Updated
        eventSource.addEventListener('settings:updated', (e: MessageEvent) => {
          try {
            const updatedSettings = JSON.parse(e.data);
            if (!belongsToTenant(updatedSettings)) return;
            setSettings(updatedSettings);
            setCurrentTenant(prev => prev ? { ...prev, name: updatedSettings.name || prev.name, settings: updatedSettings } : prev);
          } catch {}
        });

        // J. Orders & Menu Full Synced Broadcast
        eventSource.addEventListener('orders:synced', (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data);
            if (!belongsToTenant(payload)) return;
            const syncedOrders = Array.isArray(payload) ? payload : payload.orders;
            const syncedMenu = Array.isArray(payload) ? null : payload.menu;
            if (Array.isArray(syncedOrders)) {
              setOrders(syncedOrders);
              try { localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(syncedOrders)); } catch {}
            }
            if (Array.isArray(syncedMenu) && syncedMenu.length > 0) {
              const enriched = syncedMenu.map((m: MenuItem) => ({
                ...m,
                image: getImageForDish(m.id, m.image)
              }));
              setMenuItems(enriched);
              try { localStorage.setItem(`savoria_menu_items_${effectiveSlug}`, JSON.stringify(enriched)); } catch {}
            }
          } catch {}
        });

        eventSource.onerror = () => {
          setIsRealtimeConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          reconnectTimeout = setTimeout(connectRealtime, 10000);
        };
      } catch (err) {
        setIsRealtimeConnected(false);
        reconnectTimeout = setTimeout(connectRealtime, 10000);
      }
    };

    connectRealtime();

    // Hybrid Fail-Safe: Polling check scoped to effectiveSlug
    const pollInterval = setInterval(() => {
      fetch(`/api/orders?tenantId=${encodeURIComponent(effectiveSlug)}`)
        .then(r => r.json())
        .then(latestOrders => {
          if (Array.isArray(latestOrders)) {
            setOrders(prev => {
              const isDifferent = prev.length !== latestOrders.length ||
                prev.some((o, i) => !latestOrders[i] || o.id !== latestOrders[i].id || o.status !== latestOrders[i].status || o.isPaid !== latestOrders[i].isPaid);
              if (isDifferent) {
                try { localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(latestOrders)); } catch {}
                return latestOrders;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 4000);

    const handleFocus = () => {
      fetch(`/api/orders?tenantId=${encodeURIComponent(effectiveSlug)}`)
        .then(r => r.json())
        .then(latest => {
          if (Array.isArray(latest)) {
            setOrders(prev => {
              const isDifferent = prev.length !== latest.length ||
                prev.some((o, i) => !latest[i] || o.id !== latest[i].id || o.status !== latest[i].status || o.isPaid !== latest[i].isPaid);
              if (isDifferent) {
                try { localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(latest)); } catch {}
                return latest;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [effectiveSlug, playChime, activeRoute, currentLoggedInWaiter, currentTableContext, isAdminAuthenticated]);

  // Dispatch Admin Push Notification
  const sendPushNotification = async (notifData: Omit<PushNotification, 'id' | 'timestamp'>): Promise<boolean> => {
    const newNotif: PushNotification = {
      ...notifData,
      tenantId: effectiveSlug,
      id: `push-${Date.now()}`,
      timestamp: Date.now()
    };

    setActivePushAlert(newNotif);
    setNotifications(prev => [newNotif, ...prev]);
    playChime();

    try {
      const res = await fetch('/api/realtime/broadcast-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
        body: JSON.stringify(newNotif)
      });
      const data = await res.json();
      return !!data.success;
    } catch (err) {
      console.warn('sendPushNotification offline fallback:', err);
      return true;
    }
  };

  // Translation helper
  const t = (key: keyof typeof translations['uz']): string => {
    const langDict = translations[language] || translations['uz'];
    return (langDict as Record<string, string>)[key] || (translations['uz'] as Record<string, string>)[key] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('savoria_language', lang);
    } catch {}
  };

  const setRoute = (route: AppRoute) => {
    setActiveRoute(route);
    try {
      const prefix = tenantSlug ? `/${tenantSlug}` : '';
      const url = prefix
        ? (route === 'mijoz' ? prefix : `${prefix}/${route}`)
        : (route === 'mijoz' ? '/' : `/${route}`);
      window.history.pushState({}, '', url);
      setCurrentPath(url);
    } catch {}
  };

  // Waiter Authentication
  const waiterLogin = (waiterId: string, password: string): boolean => {
    const waiter = waiters.find(w => w.id === waiterId && (w.password === password || w.pinPassword === password));
    if (waiter) {
      setCurrentLoggedInWaiter(waiter);
      try {
        localStorage.setItem(`savoria_active_waiter_${effectiveSlug}`, JSON.stringify(waiter));
      } catch {}
      return true;
    }
    return false;
  };

  const waiterLoginByPin = (pin: string): boolean => {
    const waiter = waiters.find(w => w.pinPassword === pin || w.password === pin);
    if (waiter) {
      setCurrentLoggedInWaiter(waiter);
      try {
        localStorage.setItem(`savoria_active_waiter_${effectiveSlug}`, JSON.stringify(waiter));
      } catch {}
      return true;
    }
    return false;
  };

  const waiterLogout = () => {
    setCurrentLoggedInWaiter(null);
    try {
      localStorage.removeItem(`savoria_active_waiter_${effectiveSlug}`);
    } catch {}
  };

  // Admin Authentication (supports tenant owner password, tenant admins, and platform master password)
  const adminLogin = (password: string): boolean => {
    const matchesTenantPass = !!(currentTenant?.adminPasswordHash && currentTenant.adminPasswordHash === password);
    const matchesDemoPass = isDemoMode && password === '1111';
    const masterAdmin = adminUsers.find(a => a.passwordHash === password);
    if (password === 'laziz712.' || matchesTenantPass || matchesDemoPass || masterAdmin) {
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem(`savoria_admin_auth_${effectiveSlug}`, 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem(`savoria_admin_auth_${effectiveSlug}`);
    } catch {}
    if (activeRoute === 'admin') {
      setRoute('mijoz');
    }
  };

  const updateTenantAdminPassword = async (newPassword: string): Promise<boolean> => {
    const trimmed = newPassword.trim();
    if (!trimmed || trimmed.length < 4) return false;
    try {
      const res = await fetch(`/api/tenants/${encodeURIComponent(effectiveSlug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
        body: JSON.stringify({ adminPasswordHash: trimmed })
      });
      if (res.ok) {
        const updatedTenant = await res.json();
        setCurrentTenant(updatedTenant);
        setAdminUsers(prev => prev.map(a => ({ ...a, passwordHash: trimmed })));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const addAdminUser = (admin: Omit<AdminUser, 'id' | 'createdAt'>) => {
    const newAdmin: AdminUser = {
      ...admin,
      tenantId: effectiveSlug,
      id: `adm-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAdminUsers(prev => {
      const next = [...prev, newAdmin];
      try { localStorage.setItem(`savoria_admin_users_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });
    fetch('/api/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify(newAdmin)
    }).catch(() => {});
  };

  const updateAdminUser = (id: string, updates: Partial<AdminUser>) => {
    setAdminUsers(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAdminUser = (id: string) => {
    if (adminUsers.length <= 1) {
      alert('Kamida bitta admin tizimda qolishi kerak!');
      return;
    }
    setAdminUsers(prev => prev.filter(a => a.id !== id));
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const playOrderChime = () => {
    playChime();
  };

  const openReceiptModal = (order: Order) => {
    setActiveReceiptOrder(order);
  };

  const closeReceiptModal = () => {
    setActiveReceiptOrder(null);
  };

  // ========================================================
  // 3. MUTATIONS (Saved to LocalStorage FIRST + Backend Sync)
  // ========================================================

  // Menu item mutations
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      tenantId: effectiveSlug,
      id: `${effectiveSlug}-m-${Date.now()}`
    };
    setMenuItems(prev => {
      const next = [newItem, ...prev];
      try { localStorage.setItem(`savoria_menu_items_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });

    fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify(newItem)
    }).catch(err => {
      console.warn('POST /api/menu error:', err);
    });
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      try { localStorage.setItem(`savoria_menu_items_${effectiveSlug}`, JSON.stringify(updated)); } catch {}
      fetch(`/api/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
        body: JSON.stringify(updates)
      }).catch(() => {});
      return updated;
    });
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      try { localStorage.setItem(`savoria_menu_items_${effectiveSlug}`, JSON.stringify(filtered)); } catch {}
      return filtered;
    });
    fetch(`/api/menu/${id}?tenantId=${encodeURIComponent(effectiveSlug)}`, { method: 'DELETE' }).catch(() => {});
  };

  const toggleItemAvailability = (id: string) => {
    const target = menuItems.find(i => i.id === id);
    if (!target) return;
    const newAvail = !target.isAvailable;

    setMenuItems(prev => {
      const next = prev.map(item => item.id === id ? { ...item, isAvailable: newAvail } : item);
      try { localStorage.setItem(`savoria_menu_items_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });

    fetch(`/api/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify({ isAvailable: newAvail })
    }).catch(() => {});
  };

  const updateItemPrice = (id: string, newPrice: number) => {
    setMenuItems(prev => {
      const next = prev.map(item => item.id === id ? { ...item, price: newPrice } : item);
      try { localStorage.setItem(`savoria_menu_items_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });

    fetch(`/api/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify({ price: newPrice })
    }).catch(() => {});
  };

  // Staff mutations: Couriers
  const addCourier = (cData: Omit<Courier, 'id' | 'activeOrdersCount'>) => {
    const newCourier: Courier = {
      ...cData,
      tenantId: effectiveSlug,
      id: `${effectiveSlug}-c-${Date.now()}`,
      activeOrdersCount: 0
    };
    setCouriers(prev => {
      const next = [...prev, newCourier];
      try { localStorage.setItem(`savoria_couriers_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });
    fetch('/api/couriers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify(newCourier)
    }).catch(() => {});
  };

  const updateCourier = (id: string, updates: Partial<Courier>) => {
    setCouriers(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      try { localStorage.setItem(`savoria_couriers_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });
    fetch('/api/couriers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify({ id, tenantId: effectiveSlug, ...updates })
    }).catch(() => {});
  };

  const deleteCourier = (id: string) => {
    setCouriers(prev => {
      const next = prev.filter(c => c.id !== id);
      try { localStorage.setItem(`savoria_couriers_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });
    fetch(`/api/couriers/${id}?tenantId=${encodeURIComponent(effectiveSlug)}`, { method: 'DELETE' }).catch(() => {});
  };

  // Staff mutations: Waiters
  const addWaiter = (wData: Omit<Waiter, 'id' | 'ordersHandledCount'>) => {
    const newWaiter: Waiter = {
      ...wData,
      tenantId: effectiveSlug,
      id: `${effectiveSlug}-w-${Date.now()}`,
      ordersHandledCount: 0
    };
    setWaiters(prev => {
      const next = [...prev, newWaiter];
      try { localStorage.setItem(`savoria_waiters_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });
    fetch('/api/waiters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify(newWaiter)
    }).catch(() => {});
  };

  const updateWaiter = (id: string, updates: Partial<Waiter>) => {
    setWaiters(prev => {
      const next = prev.map(w => w.id === id ? { ...w, ...updates } : w);
      try { localStorage.setItem(`savoria_waiters_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });
    fetch('/api/waiters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify({ id, tenantId: effectiveSlug, ...updates })
    }).catch(() => {});
  };

  const deleteWaiter = (id: string) => {
    setWaiters(prev => {
      const next = prev.filter(w => w.id !== id);
      try { localStorage.setItem(`savoria_waiters_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });
    fetch(`/api/waiters/${id}?tenantId=${encodeURIComponent(effectiveSlug)}`, { method: 'DELETE' }).catch(() => {});
  };

  // Tables CRUD
  const addTable = (tableData: Omit<RestaurantTable, 'id' | 'isActive'> & { isActive?: boolean }) => {
    const rawName = tableData.name.trim();
    const formattedName = rawName.toLowerCase().startsWith('stol') || rawName.toLowerCase().startsWith('vip') || rawName.toLowerCase().startsWith('bar')
      ? rawName
      : `Stol ${rawName}`;
    const zoneName = tableData.zone?.trim() || 'Zal 1';
    const tableId = effectiveSlug === 'demo' ? `${formattedName} (${zoneName})` : `${effectiveSlug}-${formattedName} (${zoneName})`;

    const newTable: RestaurantTable = {
      id: tableId,
      tenantId: effectiveSlug,
      name: formattedName,
      zone: zoneName,
      capacity: Number(tableData.capacity) || 4,
      isActive: tableData.isActive !== false,
      notes: tableData.notes?.trim() || ''
    };

    setTables(prev => {
      const next = [...prev.filter(t => t.id !== tableId), newTable];
      try { localStorage.setItem(`savoria_tables_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });

    fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify(newTable)
    }).catch(() => {});
  };

  const updateTable = (id: string, updates: Partial<RestaurantTable>) => {
    setTables(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      try { localStorage.setItem(`savoria_tables_${effectiveSlug}`, JSON.stringify(updated)); } catch {}
      const target = updated.find(t => t.id === id);
      if (target) {
        fetch('/api/tables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
          body: JSON.stringify({ ...target, tenantId: effectiveSlug })
        }).catch(() => {});
      }
      return updated;
    });
  };

  const deleteTable = (id: string) => {
    setTables(prev => {
      const next = prev.filter(t => t.id !== id);
      try { localStorage.setItem(`savoria_tables_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });
    fetch(`/api/tables/${encodeURIComponent(id)}?tenantId=${encodeURIComponent(effectiveSlug)}`, { method: 'DELETE' }).catch(() => {});
  };

  // Reviews mutation
  const addReview = (review: Omit<CustomerReview, 'id' | 'date' | 'likesCount'>) => {
    const newRev: CustomerReview = {
      ...review,
      id: `rev-${Date.now()}`,
      date: 'Hozirgina',
      likesCount: 1
    };
    setReviews(prev => [newRev, ...prev]);
  };

  // Reservations mutation
  const addReservation = (resData: Omit<TableReservation, 'id' | 'createdAt' | 'status'> & { status?: 'tasdiqlandi' | 'kutilmoqda' | 'bekor_qilindi' }): TableReservation => {
    const newRes: TableReservation = {
      ...resData,
      tenantId: effectiveSlug,
      id: `BRON-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-3)}`,
      status: resData.status || 'tasdiqlandi',
      createdAt: new Date().toISOString()
    };
    setReservations(prev => {
      const next = [newRes, ...prev];
      try { localStorage.setItem(`savoria_reservations_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });
    playChime();

    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify(newRes)
    }).catch(() => {});

    return newRes;
  };

  const updateReservationStatus = (id: string, status: 'tasdiqlandi' | 'kutilmoqda' | 'bekor_qilindi') => {
    setReservations(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status } : r);
      try { localStorage.setItem(`savoria_reservations_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });
    fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify({ status })
    }).catch(() => {});
  };

  const deleteReservation = (id: string) => {
    setReservations(prev => {
      const next = prev.filter(r => r.id !== id);
      try { localStorage.setItem(`savoria_reservations_${effectiveSlug}`, JSON.stringify(next)); } catch {}
      return next;
    });
    fetch(`/api/reservations/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Real-time Waiter Buzzer
  const callWaiterFromTable = (tableName: string) => {
    const timestamp = Date.now();
    setWaiterCallAlert({ table: tableName, timestamp });
    playChime();

    fetch('/api/waiter-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify({ table: tableName, timestamp, tenantId: effectiveSlug })
    }).catch(() => {});
  };

  // Order actions
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'isPaid'> & { status?: OrderStatus; isPaid?: boolean }): Order => {
    const timestamp = Date.now();
    const prefix = (effectiveSlug || 'ORD').slice(0, 3).toUpperCase();
    const newId = `${prefix}-${timestamp.toString().slice(-4)}`;
    const newOrder: Order = {
      ...orderData,
      tenantId: effectiveSlug,
      id: newId,
      status: orderData.status || 'yangi',
      isPaid: orderData.isPaid || false,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => {
      if (prev.some(o => o.id === newOrder.id)) return prev;
      const next = [newOrder, ...prev];
      try {
        localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    playChime();

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify(newOrder)
    }).catch(err => {
      console.warn('POST /api/orders error:', err);
    });

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => {
      const next = prev.map(o => {
        if (o.id !== orderId) return o;
        const updates: Partial<Order> = { status };
        if (status === 'tayyor') updates.readyAt = new Date().toISOString();
        if (status === 'yetkazildi' || status === 'yopildi') updates.deliveredAt = new Date().toISOString();
        return { ...o, ...updates };
      });
      try {
        localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    playChime();

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify({ status })
    }).catch(() => {});
  };

  const toggleOrderItemReady = (orderId: string, itemId: string) => {
    setOrders(prev => {
      const order = prev.find(o => o.id === orderId);
      if (!order) return prev;
      const updatedItems = order.items.map(it => {
        if (it.itemId === itemId) {
          return { ...it, isReady: !it.isReady };
        }
        return it;
      });
      const allReady = updatedItems.every(it => it.isReady);
      const newStatus = allReady ? 'tayyor' : order.status;
      const updatedOrder = { ...order, items: updatedItems, status: newStatus };

      fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
        body: JSON.stringify({ items: updatedItems, status: newStatus })
      }).catch(() => {});

      const next = prev.map(o => o.id === orderId ? updatedOrder : o);
      try {
        localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const assignCourier = (orderId: string, courierId: string) => {
    const courier = couriers.find(c => c.id === courierId);
    if (!courier) return;

    const updates = {
      courierId: courier.id,
      courierName: courier.name,
      courierPhone: courier.phone,
      status: 'yolda' as OrderStatus
    };

    setOrders(prev => {
      const next = prev.map(o => o.id === orderId ? { ...o, ...updates } : o);
      try {
        localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(next));
      } catch {}
      return next;
    });

    setCouriers(prev => {
      const next = prev.map(c => c.id === courierId ? { ...c, status: 'band' as const, activeOrdersCount: c.activeOrdersCount + 1 } : c);
      try {
        localStorage.setItem(`savoria_couriers_${effectiveSlug}`, JSON.stringify(next));
      } catch {}
      return next;
    });

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify(updates)
    }).catch(() => {});
  };

  const settleOrderPayment = (orderId: string, method: PaymentMethod) => {
    const updates = {
      isPaid: true,
      status: 'yopildi' as OrderStatus,
      paymentMethod: method,
      fiscalReceiptNumber: `FISCAL-UZ-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setOrders(prev => {
      const next = prev.map(o => o.id === orderId ? { ...o, ...updates } : o);
      try {
        localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(next));
      } catch {}
      return next;
    });

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
      body: JSON.stringify(updates)
    }).catch(() => {});
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => {
      const next = prev.filter(o => o.id !== orderId);
      try {
        localStorage.setItem(`savoria_orders_${effectiveSlug}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    fetch(`/api/orders/${orderId}?tenantId=${encodeURIComponent(effectiveSlug)}`, { method: 'DELETE' }).catch(() => {});
  };

  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    setSettings(prev => {
      const updated: RestaurantSettings = { ...prev, ...newSettings, tenantId: effectiveSlug };
      try {
        localStorage.setItem(`savoria_settings_${effectiveSlug}`, JSON.stringify(updated));
      } catch {}
      setCurrentTenant(ct => ct ? { ...ct, name: updated.name || ct.name, phone: updated.phone ?? ct.phone, email: updated.email ?? ct.email, telegram: updated.telegram ?? ct.telegram, settings: updated } : ct);
      fetch(`/api/settings?tenantId=${encodeURIComponent(effectiveSlug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': effectiveSlug },
        body: JSON.stringify(updated)
      }).catch(() => {});
      return updated;
    });
  };

  return (
    <RestaurantContext.Provider
      value={{
        // Multi-Tenant SaaS
        currentTenant,
        tenantSlug,
        isDemoMode,
        isReadOnlyMode,
        navigateTo,
        resetDemoData,
        currentPath,

        menuItems,
        orders,
        couriers,
        waiters,
        adminUsers,
        settings,
        activeRoute,
        adminSubTab,
        soundEnabled,
        activeReceiptOrder,
        isAdminAuthenticated,
        showAdminLoginModal,
        currentLoggedInWaiter,
        mongoStatus,
        isRealtimeConnected,
        realtimeToast,
        dismissRealtimeToast,
        syncCloudData,
        isSyncingCloud,
        notifications,
        activePushAlert,
        dismissPushAlert,
        sendPushNotification,
        showPushModal,
        setShowPushModal,
        currentTableContext,
        isMenuOnlyMode,
        setCurrentTableContext,
        setIsMenuOnlyMode,
        callWaiterFromTable,
        waiterCallAlert,
        dismissWaiterCallAlert,
        waiterLogin,
        waiterLoginByPin,
        waiterLogout,
        language,
        setLanguage,
        t,
        setRoute,
        setAdminSubTab,
        toggleSound,
        playOrderChime,
        openReceiptModal,
        closeReceiptModal,
        adminLogin,
        adminLogout,
        setShowAdminLoginModal,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        updateItemPrice,
        addCourier,
        updateCourier,
        deleteCourier,
        addWaiter,
        updateWaiter,
        deleteWaiter,
        tables,
        addTable,
        updateTable,
        deleteTable,
        chefs,
        reviews,
        addReview,
        reservations,
        addReservation,
        updateReservationStatus,
        deleteReservation,
        createOrder,
        updateOrderStatus,
        toggleOrderItemReady,
        assignCourier,
        settleOrderPayment,
        cancelOrder,
        updateSettings,
        updateTenantAdminPassword,
        formatUZS
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
