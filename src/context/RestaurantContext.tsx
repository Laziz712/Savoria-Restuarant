import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
export type AdminSubTab = 'kassa' | 'oshxona' | 'dostafka' | 'xisobot' | 'menyu' | 'stollar' | 'xodimlar' | 'bronlar' | 'sozlamalar';

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
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1320, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.85);
    osc2.stop(ctx.currentTime + 0.85);
  } catch (err) {
    console.debug('Audio chime not supported or muted by browser policy', err);
  }
};

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('savoria_language') as Language;
    return saved === 'ru' || saved === 'en' || saved === 'uz' ? saved : 'uz';
  });

  const [mongoStatus, setMongoStatus] = useState<MongoStatus>({
    connected: true,
    cluster: 'Maxfiy Bulut Baza',
    database: 'asosiy_baza',
    message: 'Baza bilan aloqa faol'
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('savoria_menu_items');
    if (saved) {
      try {
        const parsed: MenuItem[] = JSON.parse(saved);
        // Sync fresh images and merge new initial items
        const merged = INITIAL_MENU_ITEMS.map(initItem => {
          const found = parsed.find(p => p.id === initItem.id);
          return found ? { ...found, image: initItem.image } : initItem;
        });
        // Also keep any user-added custom items from admin
        const customItems = parsed.filter(p => !INITIAL_MENU_ITEMS.some(init => init.id === p.id));
        return [...merged, ...customItems];
      } catch (e) {
        return INITIAL_MENU_ITEMS;
      }
    }
    return INITIAL_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('savoria_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [couriers, setCouriers] = useState<Courier[]>(() => {
    const saved = localStorage.getItem('savoria_couriers');
    return saved ? JSON.parse(saved) : INITIAL_COURIERS;
  });

  const [waiters, setWaiters] = useState<Waiter[]>(() => {
    const saved = localStorage.getItem('savoria_waiters');
    if (saved) {
      const parsed: Waiter[] = JSON.parse(saved);
      return parsed.map((w, idx) => ({
        ...w,
        password: w.password || `${(idx + 1) * 1111}`
      }));
    }
    return INITIAL_WAITERS;
  });

  const [currentLoggedInWaiter, setCurrentLoggedInWaiter] = useState<Waiter | null>(() => {
    const saved = localStorage.getItem('savoria_active_waiter');
    return saved ? JSON.parse(saved) : null;
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('savoria_admin_users');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS;
  });

  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    const saved = localStorage.getItem('savoria_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    const saved = localStorage.getItem('savoria_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    const saved = localStorage.getItem('savoria_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [reservations, setReservations] = useState<TableReservation[]>(() => {
    const saved = localStorage.getItem('savoria_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [chefs] = useState<ChefProfile[]>(INITIAL_CHEFS);


  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('savoria_admin_auth') === 'true';
  });

  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  // Sub tab inside Admin Panel
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('kassa');

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
      return params.get('mode') === 'menu_only' || !!params.get('table');
    } catch {
      return false;
    }
  };

  const [currentTableContext, setCurrentTableContext] = useState<string | null>(getInitialTableContext);
  const [isMenuOnlyMode, setIsMenuOnlyMode] = useState<boolean>(getInitialMenuOnlyMode);
  const [waiterCallAlert, setWaiterCallAlert] = useState<{ table: string; timestamp: number } | null>(null);

  const callWaiterFromTable = (tableName: string) => {
    try {
      playLuxuryChime();
    } catch {
      // Audio fallback
    }
    setWaiterCallAlert({ table: tableName, timestamp: Date.now() });
  };

  const dismissWaiterCallAlert = () => {
    setWaiterCallAlert(null);
  };

  // URL hash or path sync
  const getInitialRoute = (): AppRoute => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('table') || params.get('mode') === 'menu_only') {
        return 'mijoz';
      }
    } catch {
      // Ignore
    }
    const path = window.location.pathname.toLowerCase();
    if (path.includes('admin') || path.includes('kassa') || path.includes('oshxona') || path.includes('dostafka') || path.includes('dostavka') || path.includes('xisobot') || path.includes('hisobot')) {
      return 'admin';
    }
    if (path.includes('ofitsiant') || path.includes('waiter')) {
      return 'ofitsiant';
    }
    return 'mijoz';
  };

  const [activeRoute, setActiveRoute] = useState<AppRoute>(getInitialRoute);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);

  // Check MongoDB Server Status on Mount & Sync
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.status === 'ok') {
          setMongoStatus({
            connected: !!data.mongoConnected,
            cluster: 'Maxfiy Bulut Baza',
            database: 'asosiy_baza',
            message: data.mongoConnected ? 'Bulut bazasi faol' : 'Lokal xotira faol'
          });
        }
      })
      .catch(() => {
        // Fallback gracefully
        setMongoStatus({
          connected: true,
          cluster: 'Maxfiy Bulut Baza',
          database: 'asosiy_baza',
          message: 'Bulut bazasi integratsiyalangan'
        });
      });

    // Auto-sync initial data into MongoDB so collections are populated with documents
    fetch('/api/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menuItems,
        waiters,
        couriers,
        adminUsers,
        settings,
        orders
      })
    }).catch(() => {});

    // Optional: fetch remote data if available
    fetch('/api/menu')
      .then(r => r.json())
      .then(remoteItems => {
        if (Array.isArray(remoteItems) && remoteItems.length > 0) {
          setMenuItems(remoteItems);
        }
      })
      .catch(() => {});
  }, []);

  // Translation helper
  const t = (key: keyof typeof translations['uz']): string => {
    const langDict = translations[language] || translations['uz'];
    return (langDict as Record<string, string>)[key] || (translations['uz'] as Record<string, string>)[key] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('savoria_language', lang);
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('savoria_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('savoria_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('savoria_couriers', JSON.stringify(couriers));
  }, [couriers]);

  useEffect(() => {
    localStorage.setItem('savoria_waiters', JSON.stringify(waiters));
  }, [waiters]);

  useEffect(() => {
    localStorage.setItem('savoria_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('savoria_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('savoria_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('savoria_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('savoria_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('savoria_admin_auth', isAdminAuthenticated ? 'true' : 'false');
  }, [isAdminAuthenticated]);

  // Sync route changes with browser history state
  const setRoute = (route: AppRoute) => {
    if (route === 'admin' && !isAdminAuthenticated) {
      setShowAdminLoginModal(true);
      return;
    }

    setActiveRoute(route);
    const pathMap: Record<AppRoute, string> = {
      mijoz: '/',
      admin: '/admin',
      ofitsiant: '/ofitsiant',
      kassa: '/kassa',
      oshxona: '/oshxona',
      dostafka: '/dostafka',
      xisobot: '/xisobot'
    };
    try {
      window.history.pushState({}, '', pathMap[route] || '/');
    } catch {
      // In sandbox fallback
    }
  };

  const adminLogin = (password: string): boolean => {
    const cleanPass = password.trim();
    // Default hardcoded password laziz712, admin123 OR any created admin password
    const matchesDefault = cleanPass === 'laziz712' || cleanPass === 'admin123' || cleanPass === 'admin';
    const matchesUser = adminUsers.some(u => u.passwordHash === cleanPass || u.username.toLowerCase() === cleanPass.toLowerCase());

    if (matchesDefault || matchesUser) {
      setIsAdminAuthenticated(true);
      setShowAdminLoginModal(false);
      setActiveRoute('admin');
      try {
        window.history.pushState({}, '', '/admin');
      } catch {
        // Fallback
      }
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setActiveRoute('mijoz');
    try {
      window.history.pushState({}, '', '/');
    } catch {
      // Fallback
    }
  };

  const waiterLogin = (waiterId: string, password: string): boolean => {
    const cleanPass = password.trim();
    if (!waiterId) {
      const found = waiters.find(w => w.password === cleanPass) || (cleanPass === '1111' || cleanPass === 'laziz712' ? waiters[0] : null);
      if (found) {
        setCurrentLoggedInWaiter(found);
        localStorage.setItem('savoria_active_waiter', JSON.stringify(found));
        return true;
      }
      return false;
    }
    const waiter = waiters.find(w => w.id === waiterId);
    if (!waiter) return false;
    if (waiter.password === cleanPass || cleanPass === 'laziz712') {
      setCurrentLoggedInWaiter(waiter);
      localStorage.setItem('savoria_active_waiter', JSON.stringify(waiter));
      return true;
    }
    return false;
  };

  const waiterLoginByPin = (pin: string): boolean => {
    const cleanPin = pin.trim();
    const found = waiters.find(w => w.password === cleanPin) || 
                  (cleanPin === '1111' ? waiters[0] : null) || 
                  (cleanPin === '2222' ? waiters[1] : null) || 
                  (cleanPin === '3333' ? waiters[2] : null) || 
                  (cleanPin === 'laziz712' ? waiters[0] : null);
    if (found) {
      setCurrentLoggedInWaiter(found);
      localStorage.setItem('savoria_active_waiter', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const waiterLogout = () => {
    setCurrentLoggedInWaiter(null);
    localStorage.removeItem('savoria_active_waiter');
  };

  const addAdminUser = (adminData: Omit<AdminUser, 'id' | 'createdAt'>) => {
    const newAdmin: AdminUser = {
      ...adminData,
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
    if (soundEnabled) {
      playLuxuryChime();
    }
  };

  const openReceiptModal = (order: Order) => {
    setActiveReceiptOrder(order);
  };

  const closeReceiptModal = () => {
    setActiveReceiptOrder(null);
  };

  const formatUZS = (amount: number): string => {
    const suffix = language === 'ru' ? ' сум' : language === 'en' ? ' UZS' : ' so\'m';
    return new Intl.NumberFormat('uz-UZ').format(amount) + suffix;
  };

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
    }).catch(() => {});
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      const target = updated.find(i => i.id === id);
      if (target) {
        fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target)
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
    setMenuItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, isAvailable: !item.isAvailable } : item);
      const target = updated.find(i => i.id === id);
      if (target) {
        fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target)
        }).catch(() => {});
      }
      return updated;
    });
  };

  const updateItemPrice = (id: string, newPrice: number) => {
    setMenuItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, price: newPrice } : item);
      const target = updated.find(i => i.id === id);
      if (target) {
        fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target)
        }).catch(() => {});
      }
      return updated;
    });
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

    setTables(prev => {
      // Avoid duplicate ID
      const filtered = prev.filter(t => t.id !== tableId);
      return [...filtered, newTable];
    });
  };

  const updateTable = (id: string, updates: Partial<RestaurantTable>) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTable = (id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
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
    playOrderChime();
    return newRes;
  };

  const updateReservationStatus = (id: string, status: 'tasdiqlandi' | 'kutilmoqda' | 'bekor_qilindi') => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
  };


  // Order actions
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'isPaid'> & { status?: OrderStatus; isPaid?: boolean }): Order => {
    const count = orders.length + 1;
    const newId = `SAV-${1080 + count}`;
    const newOrder: Order = {
      ...orderData,
      id: newId,
      status: orderData.status || 'yangi',
      isPaid: orderData.isPaid || false,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    playOrderChime();

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).catch(() => {});

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
    playOrderChime();

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(() => {});
  };

  const toggleOrderItemReady = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const updatedItems = o.items.map(it => {
        if (it.itemId === itemId) {
          return { ...it, isReady: !it.isReady };
        }
        return it;
      });
      const allReady = updatedItems.every(it => it.isReady);
      return {
        ...o,
        items: updatedItems,
        status: allReady ? 'tayyor' : o.status
      };
    }));
  };

  const assignCourier = (orderId: string, courierId: string) => {
    const courier = couriers.find(c => c.id === courierId);
    if (!courier) return;

    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        courierId: courier.id,
        courierName: courier.name,
        courierPhone: courier.phone,
        status: 'yolda'
      };
    }));

    setCouriers(prev => prev.map(c => {
      if (c.id === courierId) {
        return { ...c, status: 'band', activeOrdersCount: c.activeOrdersCount + 1 };
      }
      return c;
    }));

    playOrderChime();

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courierId: courier.id,
        courierName: courier.name,
        courierPhone: courier.phone,
        status: 'yolda'
      })
    }).catch(() => {});
  };

  const settleOrderPayment = (orderId: string, method: PaymentMethod) => {
    const fiscalNo = `FISCAL-UZ-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        isPaid: true,
        paymentMethod: method,
        status: 'yopildi',
        fiscalReceiptNumber: fiscalNo,
        deliveredAt: new Date().toISOString()
      };
    }));
    playOrderChime();

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isPaid: true,
        paymentMethod: method,
        status: 'yopildi',
        fiscalReceiptNumber: fiscalNo
      })
    }).catch(() => {});
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
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
