import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem, Order, Courier, Waiter, RestaurantSettings, OrderStatus, PaymentMethod } from '../types';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS, INITIAL_COURIERS, INITIAL_WAITERS, INITIAL_SETTINGS } from '../data/initialData';

export type AppRoute = 'mijoz' | 'admin' | 'kassa' | 'oshxona' | 'dostafka' | 'xisobot';
export type AdminSubTab = 'kassa' | 'oshxona' | 'dostafka' | 'xisobot' | 'menyu' | 'xodimlar' | 'sozlamalar';

interface RestaurantContextType {
  menuItems: MenuItem[];
  orders: Order[];
  couriers: Courier[];
  waiters: Waiter[];
  settings: RestaurantSettings;
  activeRoute: AppRoute;
  adminSubTab: AdminSubTab;
  soundEnabled: boolean;
  activeReceiptOrder: Order | null;
  isAdminAuthenticated: boolean;
  showAdminLoginModal: boolean;
  
  setRoute: (route: AppRoute) => void;
  setAdminSubTab: (tab: AdminSubTab) => void;
  toggleSound: () => void;
  playOrderChime: () => void;
  openReceiptModal: (order: Order) => void;
  closeReceiptModal: () => void;
  
  // Admin Auth
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  setShowAdminLoginModal: (show: boolean) => void;
  
  // Menu Item mutations
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  updateItemPrice: (id: string, newPrice: number) => void;

  // Courier & Waiter Staff mutations
  addCourier: (courier: Omit<Courier, 'id' | 'activeOrdersCount'>) => void;
  updateCourier: (id: string, updates: Partial<Courier>) => void;
  deleteCourier: (id: string) => void;
  addWaiter: (waiter: Omit<Waiter, 'id' | 'ordersHandledCount'>) => void;
  updateWaiter: (id: string, updates: Partial<Waiter>) => void;
  deleteWaiter: (id: string) => void;
  
  // Order mutations
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'isPaid'> & { status?: OrderStatus; isPaid?: boolean }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  toggleOrderItemReady: (orderId: string, itemId: string) => void;
  assignCourier: (orderId: string, courierId: string) => void;
  settleOrderPayment: (orderId: string, method: PaymentMethod) => void;
  cancelOrder: (orderId: string) => void;
  
  // Settings
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('savoria_menu_items');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
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
    return saved ? JSON.parse(saved) : INITIAL_WAITERS;
  });

  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    const saved = localStorage.getItem('savoria_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('savoria_admin_auth') === 'true';
  });

  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  // Sub tab inside Admin Panel
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('kassa');

  // URL hash or path sync
  const getInitialRoute = (): AppRoute => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('admin') || path.includes('kassa') || path.includes('oshxona') || path.includes('dostafka') || path.includes('dostavka') || path.includes('xisobot') || path.includes('hisobot')) {
      return 'admin';
    }
    return 'mijoz';
  };

  const [activeRoute, setActiveRoute] = useState<AppRoute>(getInitialRoute);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);

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
    localStorage.setItem('savoria_settings', JSON.stringify(settings));
  }, [settings]);

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
    if (password === 'laziz712') {
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
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  // Menu item mutations
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `m-${Date.now()}`
    };
    setMenuItems(prev => [newItem, ...prev]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, isAvailable: !item.isAvailable } : item));
  };

  const updateItemPrice = (id: string, newPrice: number) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, price: newPrice } : item));
  };

  // Staff mutations: Couriers
  const addCourier = (cData: Omit<Courier, 'id' | 'activeOrdersCount'>) => {
    const newCourier: Courier = {
      ...cData,
      id: `c-${Date.now()}`,
      activeOrdersCount: 0
    };
    setCouriers(prev => [...prev, newCourier]);
  };

  const updateCourier = (id: string, updates: Partial<Courier>) => {
    setCouriers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCourier = (id: string) => {
    setCouriers(prev => prev.filter(c => c.id !== id));
  };

  // Staff mutations: Waiters
  const addWaiter = (wData: Omit<Waiter, 'id' | 'ordersHandledCount'>) => {
    const newWaiter: Waiter = {
      ...wData,
      id: `w-${Date.now()}`,
      ordersHandledCount: 0
    };
    setWaiters(prev => [...prev, newWaiter]);
  };

  const updateWaiter = (id: string, updates: Partial<Waiter>) => {
    setWaiters(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWaiter = (id: string) => {
    setWaiters(prev => prev.filter(w => w.id !== id));
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
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <RestaurantContext.Provider
      value={{
        menuItems,
        orders,
        couriers,
        waiters,
        settings,
        activeRoute,
        adminSubTab,
        soundEnabled,
        activeReceiptOrder,
        isAdminAuthenticated,
        showAdminLoginModal,
        setRoute,
        setAdminSubTab,
        toggleSound,
        playOrderChime,
        openReceiptModal,
        closeReceiptModal,
        adminLogin,
        adminLogout,
        setShowAdminLoginModal,
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
