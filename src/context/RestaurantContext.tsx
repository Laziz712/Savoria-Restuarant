import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { 
  MenuItem, Order, Courier, Waiter, AdminUser, 
  RestaurantSettings, RestaurantTable, OrderStatus, PaymentMethod, Language, MongoStatus,
  CustomerReview, TableReservation, ChefProfile, PushNotification 
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

  // Restaurant settings
  updateSettings: (newSettings: Partial<RestaurantSettings>) => void;

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

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Multi-Language
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('savoria_language') as Language) || 'uz';
  });

  // State Management with IMMEDIATE LocalStorage Persistence so F5 never resets data!
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('savoria_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ORDERS;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('savoria_menu_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MENU_ITEMS;
  });

  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    try {
      const saved = localStorage.getItem('savoria_tables');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_TABLES;
  });

  const [reservations, setReservations] = useState<TableReservation[]>(() => {
    try {
      const saved = localStorage.getItem('savoria_reservations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_RESERVATIONS;
  });

  const [couriers, setCouriers] = useState<Courier[]>(() => {
    try {
      const saved = localStorage.getItem('savoria_couriers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_COURIERS;
  });

  const [waiters, setWaiters] = useState<Waiter[]>(() => {
    try {
      const saved = localStorage.getItem('savoria_waiters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_WAITERS;
  });

  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    try {
      const saved = localStorage.getItem('savoria_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
    } catch {}
    return INITIAL_SETTINGS;
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('savoria_admin_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ADMIN_USERS;
  });

  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [chefs] = useState<ChefProfile[]>(INITIAL_CHEFS);

  // Push Notifications State
  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    try {
      const saved = localStorage.getItem('savoria_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [activePushAlert, setActivePushAlert] = useState<PushNotification | null>(null);
  const [showPushModal, setShowPushModal] = useState<boolean>(false);

  // Auth & Routing
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('savoria_admin_auth') === 'true';
  });
  const [currentLoggedInWaiter, setCurrentLoggedInWaiter] = useState<Waiter | null>(() => {
    const saved = localStorage.getItem('savoria_active_waiter');
    return saved ? JSON.parse(saved) : null;
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
      return params.get('mode') === 'menu' || !!params.get('table');
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

  const dismissRealtimeToast = () => setRealtimeToast(null);
  const dismissWaiterCallAlert = () => setWaiterCallAlert(null);
  const dismissPushAlert = () => setActivePushAlert(null);

  const playChime = useCallback(() => {
    if (soundEnabled) {
      playLuxuryChime();
    }
  }, [soundEnabled]);

  const syncCloudData = useCallback(async (): Promise<boolean> => {
    setIsSyncingCloud(true);
    try {
      let currentLocalOrders: Order[] = orders;
      try {
        const raw = localStorage.getItem('savoria_orders');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) currentLocalOrders = parsed;
        }
      } catch {}

      let currentLocalMenu: MenuItem[] = menuItems;
      try {
        const rawM = localStorage.getItem('savoria_menu_items');
        if (rawM) {
          const parsedM = JSON.parse(rawM);
          if (Array.isArray(parsedM) && parsedM.length > 0) currentLocalMenu = parsedM;
        }
      } catch {}

      const res = await fetch('/api/sync/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localOrders: currentLocalOrders,
          localMenuItems: currentLocalMenu
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.orders)) {
            setOrders(data.orders);
            try { localStorage.setItem('savoria_orders', JSON.stringify(data.orders)); } catch {}
          }
          if (Array.isArray(data.menu) && data.menu.length > 0) {
            const enriched = data.menu.map((item: MenuItem) => ({
              ...item,
              image: getImageForDish(item.id, item.image)
            }));
            setMenuItems(enriched);
            try { localStorage.setItem('savoria_menu_items', JSON.stringify(enriched)); } catch {}
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
  }, [orders, menuItems]);

  const formatUZS = (amount: number): string => {
    const suffix = language === 'ru' ? ' сум' : language === 'en' ? ' UZS' : ' so\'m';
    return new Intl.NumberFormat('uz-UZ').format(amount) + suffix;
  };

  // ========================================================
  // PERSISTENCE EFFECT: Save to LocalStorage immediately on every state change!
  // ========================================================
  useEffect(() => {
    try {
      localStorage.setItem('savoria_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('savoria_menu_items', JSON.stringify(menuItems));
    } catch {}
  }, [menuItems]);

  useEffect(() => {
    try {
      localStorage.setItem('savoria_tables', JSON.stringify(tables));
    } catch {}
  }, [tables]);

  useEffect(() => {
    try {
      localStorage.setItem('savoria_reservations', JSON.stringify(reservations));
    } catch {}
  }, [reservations]);

  useEffect(() => {
    try {
      localStorage.setItem('savoria_couriers', JSON.stringify(couriers));
    } catch {}
  }, [couriers]);

  useEffect(() => {
    try {
      localStorage.setItem('savoria_waiters', JSON.stringify(waiters));
    } catch {}
  }, [waiters]);

  useEffect(() => {
    try {
      localStorage.setItem('savoria_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('savoria_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // ========================================================
  // 1. BOOTSTRAP: Load Authoritative State from MongoDB on Mount & Merge
  // ========================================================
  useEffect(() => {
    const loadBootstrapData = async () => {
      try {
        let localOrdersToSend: Order[] = [];
        try {
          const raw = localStorage.getItem('savoria_orders');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) localOrdersToSend = parsed;
          }
        } catch {}

        let localMenuToSend: MenuItem[] = [];
        try {
          const rawM = localStorage.getItem('savoria_menu_items');
          if (rawM) {
            const parsedM = JSON.parse(rawM);
            if (Array.isArray(parsedM) && parsedM.length > 0) localMenuToSend = parsedM;
          }
        } catch {}

        let data: any = null;
        try {
          const syncRes = await fetch('/api/sync/full', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              localOrders: localOrdersToSend,
              localMenuItems: localMenuToSend
            })
          });
          if (syncRes.ok) {
            data = await syncRes.json();
          }
        } catch {
          // Sync endpoint failed, fallback to bootstrap
        }

        if (!data || !data.success) {
          const res = await fetch('/api/bootstrap');
          data = await res.json();
        }

        if (data && data.success) {
          setMongoStatus({
            connected: !!data.mongoConnected,
            cluster: 'MongoDB Atlas',
            database: 'savoria',
            message: data.mongoConnected ? 'Markaziy MongoDB bazasi faol' : 'Lokal xotira faol'
          });

          // Hydrate Menu Items (authoritative)
          if (Array.isArray(data.menu) && data.menu.length > 0) {
            const enrichedMenu = data.menu.map((item: MenuItem) => ({
              ...item,
              image: getImageForDish(item.id, item.image)
            }));
            setMenuItems(enrichedMenu);
            try { localStorage.setItem('savoria_menu_items', JSON.stringify(enrichedMenu)); } catch {}
          }

          // Hydrate Orders (authoritative from MongoDB)
          if (Array.isArray(data.orders) && data.orders.length > 0) {
            setOrders(data.orders);
            try { localStorage.setItem('savoria_orders', JSON.stringify(data.orders)); } catch {}
          }

          // Hydrate Tables, Reservations, Waiters, Couriers, Settings
          if (Array.isArray(data.tables) && data.tables.length > 0) {
            setTables(data.tables);
          }
          if (Array.isArray(data.reservations) && data.reservations.length > 0) {
            setReservations(data.reservations);
          }
          if (Array.isArray(data.waiters) && data.waiters.length > 0) {
            setWaiters(data.waiters);
          }
          if (Array.isArray(data.couriers) && data.couriers.length > 0) {
            setCouriers(data.couriers);
          }
          if (data.settings && data.settings.name) {
            setSettings(data.settings);
          }
          if (Array.isArray(data.notifications)) {
            setNotifications(prev => {
              const map = new Map<string, PushNotification>();
              prev.forEach(n => map.set(n.id, n));
              data.notifications.forEach((n: PushNotification) => map.set(n.id, n));
              return Array.from(map.values());
            });
          }
        }
      } catch (err) {
        console.warn('Bootstrap fetch fallback: working smoothly with persistent localStorage', err);
      }
    };

    loadBootstrapData();
  }, []);

  // ========================================================
  // 2. REAL-TIME ENGINE: Server-Sent Events (SSE) Listener
  // ========================================================
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

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
            setOrders(prev => {
              if (prev.some(o => o.id === newOrder.id)) return prev;
              const next = [newOrder, ...prev];
              try { localStorage.setItem('savoria_orders', JSON.stringify(next)); } catch {}
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
            setOrders(prev => {
              const next = prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o);
              try { localStorage.setItem('savoria_orders', JSON.stringify(next)); } catch {}
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
            const { id } = JSON.parse(e.data);
            setOrders(prev => {
              const next = prev.filter(o => o.id !== id);
              try { localStorage.setItem('savoria_orders', JSON.stringify(next)); } catch {}
              return next;
            });
          } catch {}
        });

        // D. Menu Created / Updated / Deleted
        eventSource.addEventListener('menu:created', (e: MessageEvent) => {
          try {
            const item: MenuItem = JSON.parse(e.data);
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
            const enriched = { ...item, image: getImageForDish(item.id, item.image) };
            setMenuItems(prev => prev.map(i => i.id === item.id ? enriched : i));
          } catch {}
        });

        eventSource.addEventListener('menu:deleted', (e: MessageEvent) => {
          try {
            const { id } = JSON.parse(e.data);
            setMenuItems(prev => prev.filter(i => i.id !== id));
          } catch {}
        });

        // E. Table Updates
        eventSource.addEventListener('table:updated', (e: MessageEvent) => {
          try {
            const table: RestaurantTable = JSON.parse(e.data);
            setTables(prev => {
              const exists = prev.some(t => t.id === table.id);
              if (exists) return prev.map(t => t.id === table.id ? table : t);
              return [...prev, table];
            });
          } catch {}
        });

        eventSource.addEventListener('table:deleted', (e: MessageEvent) => {
          try {
            const { id } = JSON.parse(e.data);
            setTables(prev => prev.filter(t => t.id !== id));
          } catch {}
        });

        // F. Reservation Updates
        eventSource.addEventListener('reservation:created', (e: MessageEvent) => {
          try {
            const res: TableReservation = JSON.parse(e.data);
            setReservations(prev => [res, ...prev.filter(r => r.id !== res.id)]);
            playChime();
          } catch {}
        });

        eventSource.addEventListener('reservation:updated', (e: MessageEvent) => {
          try {
            const res: TableReservation = JSON.parse(e.data);
            setReservations(prev => prev.map(r => r.id === res.id ? res : r));
          } catch {}
        });

        // G. Waiter Call Buzzer
        eventSource.addEventListener('waiter_call:created', (e: MessageEvent) => {
          try {
            const alertData = JSON.parse(e.data);
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

            // Determine if this notification applies to the current client
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
              // Waiters and Admins also see table notifications
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
            setSettings(updatedSettings);
          } catch {}
        });

        // J. Orders & Menu Full Synced Broadcast
        eventSource.addEventListener('orders:synced', (e: MessageEvent) => {
          try {
            const { orders: syncedOrders, menu: syncedMenu } = JSON.parse(e.data);
            if (Array.isArray(syncedOrders) && syncedOrders.length > 0) {
              setOrders(syncedOrders);
              try { localStorage.setItem('savoria_orders', JSON.stringify(syncedOrders)); } catch {}
            }
            if (Array.isArray(syncedMenu) && syncedMenu.length > 0) {
              const enriched = syncedMenu.map((m: MenuItem) => ({
                ...m,
                image: getImageForDish(m.id, m.image)
              }));
              setMenuItems(enriched);
              try { localStorage.setItem('savoria_menu_items', JSON.stringify(enriched)); } catch {}
            }
          } catch {}
        });

        eventSource.onerror = () => {
          setIsRealtimeConnected(false);
          if (eventSource) eventSource.close();
          reconnectTimeout = setTimeout(connectRealtime, 3000);
        };
      } catch (err) {
        setIsRealtimeConnected(false);
        reconnectTimeout = setTimeout(connectRealtime, 3000);
      }
    };

    connectRealtime();

    // Hybrid Fail-Safe: Polling check every 5 seconds & on window focus to ensure zero missed events
    const pollInterval = setInterval(() => {
      fetch('/api/orders')
        .then(r => r.json())
        .then(latestOrders => {
          if (Array.isArray(latestOrders) && latestOrders.length > 0) {
            setOrders(prev => {
              if (prev.length !== latestOrders.length || latestOrders[0]?.id !== prev[0]?.id) {
                try { localStorage.setItem('savoria_orders', JSON.stringify(latestOrders)); } catch {}
                return latestOrders;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 5000);

    const handleFocus = () => {
      fetch('/api/orders')
        .then(r => r.json())
        .then(latest => {
          if (Array.isArray(latest) && latest.length > 0) {
            setOrders(latest);
            try { localStorage.setItem('savoria_orders', JSON.stringify(latest)); } catch {}
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
  }, [playChime, activeRoute, currentLoggedInWaiter, currentTableContext, isAdminAuthenticated]);

  // Dispatch Admin Push Notification
  const sendPushNotification = async (notifData: Omit<PushNotification, 'id' | 'timestamp'>): Promise<boolean> => {
    const newNotif: PushNotification = {
      ...notifData,
      id: `push-${Date.now()}`,
      timestamp: Date.now()
    };

    setActivePushAlert(newNotif);
    setNotifications(prev => [newNotif, ...prev]);
    playChime();

    try {
      const res = await fetch('/api/realtime/broadcast-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const url = route === 'mijoz' ? '/' : `/${route}`;
      window.history.pushState({}, '', url);
    } catch {}
  };

  // Waiter Authentication
  const waiterLogin = (waiterId: string, password: string): boolean => {
    const waiter = waiters.find(w => w.id === waiterId && (w.password === password || w.pinPassword === password));
    if (waiter) {
      setCurrentLoggedInWaiter(waiter);
      try {
        localStorage.setItem('savoria_active_waiter', JSON.stringify(waiter));
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
        localStorage.setItem('savoria_active_waiter', JSON.stringify(waiter));
      } catch {}
      return true;
    }
    return false;
  };

  const waiterLogout = () => {
    setCurrentLoggedInWaiter(null);
    try {
      localStorage.removeItem('savoria_active_waiter');
    } catch {}
  };

  // Admin Authentication
  const adminLogin = (password: string): boolean => {
    const masterAdmin = adminUsers.find(a => a.passwordHash === password);
    if (password === 'laziz712.' || masterAdmin) {
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem('savoria_admin_auth', 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem('savoria_admin_auth');
    } catch {}
    if (activeRoute === 'admin') {
      setRoute('mijoz');
    }
  };

  const addAdminUser = (admin: Omit<AdminUser, 'id' | 'createdAt'>) => {
    const newAdmin: AdminUser = {
      ...admin,
      id: `adm-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAdminUsers(prev => {
      const next = [...prev, newAdmin];
      try { localStorage.setItem('savoria_admin_users', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch('/api/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      id: `m-${Date.now()}`
    };
    setMenuItems(prev => {
      const next = [newItem, ...prev];
      try { localStorage.setItem('savoria_menu_items', JSON.stringify(next)); } catch {}
      return next;
    });

    fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    }).catch(err => {
      console.warn('POST /api/menu error:', err);
    });
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      try { localStorage.setItem('savoria_menu_items', JSON.stringify(updated)); } catch {}
      fetch(`/api/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).catch(() => {});
      return updated;
    });
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      try { localStorage.setItem('savoria_menu_items', JSON.stringify(filtered)); } catch {}
      return filtered;
    });
    fetch(`/api/menu/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const toggleItemAvailability = (id: string) => {
    const target = menuItems.find(i => i.id === id);
    if (!target) return;
    const newAvail = !target.isAvailable;

    setMenuItems(prev => {
      const next = prev.map(item => item.id === id ? { ...item, isAvailable: newAvail } : item);
      try { localStorage.setItem('savoria_menu_items', JSON.stringify(next)); } catch {}
      return next;
    });

    fetch(`/api/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: newAvail })
    }).catch(() => {});
  };

  const updateItemPrice = (id: string, newPrice: number) => {
    setMenuItems(prev => {
      const next = prev.map(item => item.id === id ? { ...item, price: newPrice } : item);
      try { localStorage.setItem('savoria_menu_items', JSON.stringify(next)); } catch {}
      return next;
    });

    fetch(`/api/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: newPrice })
    }).catch(() => {});
  };

  // Staff mutations: Couriers
  const addCourier = (cData: Omit<Courier, 'id' | 'activeOrdersCount'>) => {
    const newCourier: Courier = {
      ...cData,
      id: `c-${Date.now()}`,
      activeOrdersCount: 0
    };
    setCouriers(prev => {
      const next = [...prev, newCourier];
      try { localStorage.setItem('savoria_couriers', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch('/api/couriers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourier)
    }).catch(() => {});
  };

  const updateCourier = (id: string, updates: Partial<Courier>) => {
    setCouriers(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      try { localStorage.setItem('savoria_couriers', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch('/api/couriers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    }).catch(() => {});
  };

  const deleteCourier = (id: string) => {
    setCouriers(prev => {
      const next = prev.filter(c => c.id !== id);
      try { localStorage.setItem('savoria_couriers', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch(`/api/couriers/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Staff mutations: Waiters
  const addWaiter = (wData: Omit<Waiter, 'id' | 'ordersHandledCount'>) => {
    const newWaiter: Waiter = {
      ...wData,
      id: `w-${Date.now()}`,
      ordersHandledCount: 0
    };
    setWaiters(prev => {
      const next = [...prev, newWaiter];
      try { localStorage.setItem('savoria_waiters', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch('/api/waiters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWaiter)
    }).catch(() => {});
  };

  const updateWaiter = (id: string, updates: Partial<Waiter>) => {
    setWaiters(prev => {
      const next = prev.map(w => w.id === id ? { ...w, ...updates } : w);
      try { localStorage.setItem('savoria_waiters', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch('/api/waiters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    }).catch(() => {});
  };

  const deleteWaiter = (id: string) => {
    setWaiters(prev => {
      const next = prev.filter(w => w.id !== id);
      try { localStorage.setItem('savoria_waiters', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch(`/api/waiters/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Tables CRUD
  const addTable = (tableData: Omit<RestaurantTable, 'id' | 'isActive'> & { isActive?: boolean }) => {
    const rawName = tableData.name.trim();
    const formattedName = rawName.toLowerCase().startsWith('stol') || rawName.toLowerCase().startsWith('vip') || rawName.toLowerCase().startsWith('bar')
      ? rawName
      : `Stol ${rawName}`;
    const zoneName = tableData.zone?.trim() || 'Zal 1';
    const tableId = `${formattedName} (${zoneName})`;

    const newTable: RestaurantTable = {
      id: tableId,
      name: formattedName,
      zone: zoneName,
      capacity: Number(tableData.capacity) || 4,
      isActive: tableData.isActive !== false,
      notes: tableData.notes?.trim() || ''
    };

    setTables(prev => {
      const next = [...prev.filter(t => t.id !== tableId), newTable];
      try { localStorage.setItem('savoria_tables', JSON.stringify(next)); } catch {}
      return next;
    });

    fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTable)
    }).catch(() => {});
  };

  const updateTable = (id: string, updates: Partial<RestaurantTable>) => {
    setTables(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      try { localStorage.setItem('savoria_tables', JSON.stringify(updated)); } catch {}
      const target = updated.find(t => t.id === id);
      if (target) {
        fetch('/api/tables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target)
        }).catch(() => {});
      }
      return updated;
    });
  };

  const deleteTable = (id: string) => {
    setTables(prev => {
      const next = prev.filter(t => t.id !== id);
      try { localStorage.setItem('savoria_tables', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch(`/api/tables/${id}`, { method: 'DELETE' }).catch(() => {});
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
      id: `BRON-${Math.floor(100 + Math.random() * 900)}`,
      status: resData.status || 'tasdiqlandi',
      createdAt: new Date().toISOString()
    };
    setReservations(prev => {
      const next = [newRes, ...prev];
      try { localStorage.setItem('savoria_reservations', JSON.stringify(next)); } catch {}
      return next;
    });
    playChime();

    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRes)
    }).catch(() => {});

    return newRes;
  };

  const updateReservationStatus = (id: string, status: 'tasdiqlandi' | 'kutilmoqda' | 'bekor_qilindi') => {
    setReservations(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status } : r);
      try { localStorage.setItem('savoria_reservations', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(() => {});
  };

  const deleteReservation = (id: string) => {
    setReservations(prev => {
      const next = prev.filter(r => r.id !== id);
      try { localStorage.setItem('savoria_reservations', JSON.stringify(next)); } catch {}
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: tableName, timestamp })
    }).catch(() => {});
  };

  // Order actions
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'isPaid'> & { status?: OrderStatus; isPaid?: boolean }): Order => {
    const timestamp = Date.now();
    const newId = `SAV-${timestamp.toString().slice(-4)}`;
    const newOrder: Order = {
      ...orderData,
      id: newId,
      status: orderData.status || 'yangi',
      isPaid: orderData.isPaid || false,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => {
      if (prev.some(o => o.id === newOrder.id)) return prev;
      const next = [newOrder, ...prev];
      try {
        localStorage.setItem('savoria_orders', JSON.stringify(next));
      } catch {}
      return next;
    });
    playChime();

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
        localStorage.setItem('savoria_orders', JSON.stringify(next));
      } catch {}
      return next;
    });
    playChime();

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems, status: newStatus })
      }).catch(() => {});

      const next = prev.map(o => o.id === orderId ? updatedOrder : o);
      try {
        localStorage.setItem('savoria_orders', JSON.stringify(next));
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
        localStorage.setItem('savoria_orders', JSON.stringify(next));
      } catch {}
      return next;
    });

    setCouriers(prev => {
      const next = prev.map(c => c.id === courierId ? { ...c, status: 'band' as const, activeOrdersCount: c.activeOrdersCount + 1 } : c);
      try {
        localStorage.setItem('savoria_couriers', JSON.stringify(next));
      } catch {}
      return next;
    });

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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
        localStorage.setItem('savoria_orders', JSON.stringify(next));
      } catch {}
      return next;
    });

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => {
      const next = prev.filter(o => o.id !== orderId);
      try {
        localStorage.setItem('savoria_orders', JSON.stringify(next));
      } catch {}
      return next;
    });
    fetch(`/api/orders/${orderId}`, { method: 'DELETE' }).catch(() => {});
  };

  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('savoria_settings', JSON.stringify(updated));
      } catch {}
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});
      return updated;
    });
  };

  return (
    <RestaurantContext.Provider
      value={{
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
