import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { 
  MenuItem, Order, Courier, Waiter, AdminUser, 
  RestaurantSettings, RestaurantTable, OrderStatus, PaymentMethod, Language, MongoStatus,
  CustomerReview, TableReservation, ChefProfile 
} from '../types';
import { 
  INITIAL_MENU_ITEMS, INITIAL_ORDERS, INITIAL_COURIERS, 
  INITIAL_WAITERS, INITIAL_ADMIN_USERS, INITIAL_SETTINGS, INITIAL_TABLES,
  INITIAL_CHEFS, INITIAL_REVIEWS, INITIAL_RESERVATIONS 
} from '../data/initialData';
import { translations } from '../i18n/translations';

export type AppRoute = 'mijoz' | 'admin' | 'ofitsiant' | 'kassa' | 'oshxona' | 'dostafka' | 'xisobot';
export type AdminSubTab = 'kassa' | 'oshxona' | 'dostafka' | 'xisobot' | 'menyu' | 'stollar' | 'xodimlar' | 'bronlar' | 'cheklar' | 'sozlamalar';

export interface RealtimeToast {
  id: string;
  type: 'order' | 'status' | 'waiter';
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

  // State Management with Database Sync
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [couriers, setCouriers] = useState<Courier[]>(INITIAL_COURIERS);
  const [waiters, setWaiters] = useState<Waiter[]>(INITIAL_WAITERS);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [settings, setSettings] = useState<RestaurantSettings>(INITIAL_SETTINGS);
  const [tables, setTables] = useState<RestaurantTable[]>(INITIAL_TABLES);
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [reservations, setReservations] = useState<TableReservation[]>(INITIAL_RESERVATIONS);
  const [chefs] = useState<ChefProfile[]>(INITIAL_CHEFS);

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

  const playChime = useCallback(() => {
    if (soundEnabled) {
      playLuxuryChime();
    }
  }, [soundEnabled]);

  const formatUZS = (amount: number): string => {
    const suffix = language === 'ru' ? ' сум' : language === 'en' ? ' UZS' : ' so\'m';
    return new Intl.NumberFormat('uz-UZ').format(amount) + suffix;
  };

  // ========================================================
  // 1. BOOTSTRAP: Load Authoritative State from MongoDB on Mount
  // ========================================================
  useEffect(() => {
    const loadBootstrapData = async () => {
      try {
        const res = await fetch('/api/bootstrap');
        const data = await res.json();

        if (data && data.success) {
          setMongoStatus({
            connected: !!data.mongoConnected,
            cluster: 'MongoDB Atlas',
            database: 'savoria',
            message: data.mongoConnected ? 'Markaziy MongoDB bazasi faol' : 'Lokal xotira faol'
          });

          // Hydrate Menu Items
          if (Array.isArray(data.menu) && data.menu.length > 0) {
            const mappedMenu = data.menu.map((item: MenuItem) => ({
              ...item,
              image: getImageForDish(item.id, item.image)
            }));
            setMenuItems(mappedMenu);
          }

          // Hydrate Orders (Historical and Active)
          if (Array.isArray(data.orders)) {
            setOrders(data.orders);
          }

          // Hydrate Tables, Reservations, Waiters, Couriers, Settings
          if (Array.isArray(data.tables) && data.tables.length > 0) {
            setTables(data.tables);
          }
          if (Array.isArray(data.reservations)) {
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
        }
      } catch (err) {
        console.warn('Bootstrap fetch warning:', err);
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

        // A. New Order Created (Customer or POS placed order)
        eventSource.addEventListener('order:created', (e: MessageEvent) => {
          try {
            const newOrder: Order = JSON.parse(e.data);
            setOrders(prev => {
              if (prev.some(o => o.id === newOrder.id)) return prev;
              return [newOrder, ...prev];
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

        // B. Order Status Updated (e.g. yangi -> oshxonada -> tayyor -> yolda -> yetkazildi)
        eventSource.addEventListener('order:updated', (e: MessageEvent) => {
          try {
            const updatedOrder: Order = JSON.parse(e.data);
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));

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
            setOrders(prev => prev.filter(o => o.id !== id));
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

        // H. Settings Updated
        eventSource.addEventListener('settings:updated', (e: MessageEvent) => {
          try {
            const updatedSettings = JSON.parse(e.data);
            setSettings(updatedSettings);
          } catch {}
        });

        eventSource.onerror = () => {
          setIsRealtimeConnected(false);
          if (eventSource) eventSource.close();
          // Auto-reconnect after 3 seconds
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
              // Only update if count or IDs changed
              if (prev.length !== latestOrders.length || latestOrders[0]?.id !== prev[0]?.id) {
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
          if (Array.isArray(latest)) setOrders(latest);
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
  }, [playChime]);

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
    setAdminUsers(prev => [...prev, newAdmin]);
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
  // 3. CENTRALIZED DATABASE MUTATIONS WITH BROADCAST
  // ========================================================

  // Menu item mutations
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `m-${Date.now()}`
    };
    setMenuItems(prev => [newItem, ...prev]);

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
      const target = updated.find(i => i.id === id);
      if (target) {
        fetch(`/api/menu/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        }).catch(() => {});
      }
      return updated;
    });
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    fetch(`/api/menu/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const toggleItemAvailability = (id: string) => {
    const target = menuItems.find(i => i.id === id);
    if (!target) return;
    const newAvail = !target.isAvailable;

    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, isAvailable: newAvail } : item));
    fetch(`/api/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: newAvail })
    }).catch(() => {});
  };

  const updateItemPrice = (id: string, newPrice: number) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, price: newPrice } : item));
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
    setCouriers(prev => [...prev, newCourier]);
    fetch('/api/couriers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourier)
    }).catch(() => {});
  };

  const updateCourier = (id: string, updates: Partial<Courier>) => {
    setCouriers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    fetch('/api/couriers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    }).catch(() => {});
  };

  const deleteCourier = (id: string) => {
    setCouriers(prev => prev.filter(c => c.id !== id));
    fetch(`/api/couriers/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Staff mutations: Waiters
  const addWaiter = (wData: Omit<Waiter, 'id' | 'ordersHandledCount'>) => {
    const newWaiter: Waiter = {
      ...wData,
      id: `w-${Date.now()}`,
      ordersHandledCount: 0
    };
    setWaiters(prev => [...prev, newWaiter]);
    fetch('/api/waiters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWaiter)
    }).catch(() => {});
  };

  const updateWaiter = (id: string, updates: Partial<Waiter>) => {
    setWaiters(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    fetch('/api/waiters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    }).catch(() => {});
  };

  const deleteWaiter = (id: string) => {
    setWaiters(prev => prev.filter(w => w.id !== id));
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

    setTables(prev => [...prev.filter(t => t.id !== tableId), newTable]);
    fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTable)
    }).catch(() => {});
  };

  const updateTable = (id: string, updates: Partial<RestaurantTable>) => {
    setTables(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
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
    setTables(prev => prev.filter(t => t.id !== id));
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
    setReservations(prev => [newRes, ...prev]);
    playChime();

    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRes)
    }).catch(() => {});

    return newRes;
  };

  const updateReservationStatus = (id: string, status: 'tasdiqlandi' | 'kutilmoqda' | 'bekor_qilindi') => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(() => {});
  };

  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
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
      return [newOrder, ...prev];
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
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const updates: Partial<Order> = { status };
      if (status === 'tayyor') updates.readyAt = new Date().toISOString();
      if (status === 'yetkazildi' || status === 'yopildi') updates.deliveredAt = new Date().toISOString();
      return { ...o, ...updates };
    }));
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

      return prev.map(o => o.id === orderId ? updatedOrder : o);
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

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    setCouriers(prev => prev.map(c => c.id === courierId ? { ...c, status: 'band', activeOrdersCount: c.activeOrdersCount + 1 } : c));

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

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    fetch(`/api/orders/${orderId}`, { method: 'DELETE' }).catch(() => {});
  };

  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
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
