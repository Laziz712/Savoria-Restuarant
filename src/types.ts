export type Language = 'uz' | 'ru' | 'en';

export type AdminRole = 'superadmin' | 'menejer' | 'kassir';

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: AdminRole;
  createdAt: string;
}

export type ItemCategory = 
  | 'asosiy'      // Asosiy taomlar / Steyklar
  | 'milliy'      // Milliy tansiq taomlar
  | 'salatlar'    // Salatlar & Gazaklar
  | 'shorvalar'   // Sho'rvalar
  | 'ichimliklar' // Mualliflik kokteyllari va salqin ichimliklar
  | 'qahva_choy'  // Qahva va elit choylar
  | 'desertlar';  // Desertlar


export interface MenuItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number; // in UZS
  description: string;
  image: string;
  prepTimeMinutes: number;
  isAvailable: boolean;
  station: 'oshxona' | 'mangal' | 'bar' | 'salat';
  calories?: number;
  weightGrams?: number;
  isChefSpecial?: boolean;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  station: 'oshxona' | 'mangal' | 'bar' | 'salat';
  isReady?: boolean;
}

export type OrderType = 'zal' | 'olib_ketish' | 'dostavka';

export type OrderStatus = 
  | 'yangi'        // Yangi tushgan buyurtma
  | 'oshxonada'    // Oshxona / Barda tayyorlanmoqda
  | 'tayyor'       // Tayyor (Kassa / Ofitsiant / Kuryerga berishga)
  | 'yolda'        // Dostavkada kuryer yo'lda
  | 'yetkazildi'   // Yetkazildi / Mijozga topshirildi
  | 'yopildi';     // Hisob to'landi va chek yopildi

export type PaymentMethod = 'naqd' | 'uzcard_humo' | 'payme_click' | 'visa';

export interface Order {
  id: string; // e.g. #SAV-1082
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  tableNumber?: string;
  waiterName?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  totalSubtotal: number;
  serviceFeeRate: number; // e.g. 0.10 for 10%
  serviceFeeAmount: number;
  discountRate?: number; // e.g. 0.05
  discountAmount?: number;
  finalTotal: number;
  isPaid: boolean;
  paymentMethod?: PaymentMethod;
  createdAt: string; // ISO string
  readyAt?: string;
  deliveredAt?: string;
  fiscalReceiptNumber?: string;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  vehicle: 'skuter' | 'avto' | 'velosiped';
  status: 'bosh' | 'band' | 'tanaffus';
  activeOrdersCount: number;
  rating: number;
}

export interface Waiter {
  id: string;
  name: string;
  phone: string;
  assignedZone: string;
  status: 'ishda' | 'tanaffus';
  ordersHandledCount: number;
  password?: string;
}


export interface RestaurantSettings {
  name: string;
  slogan: string;
  address: string;
  phone: string;
  stir: string; // STIR / INN
  serviceFeePercent: number; // default 10%
  headerMessage: string;
  footerReceiptMessage: string;
  wifiPassword?: string;
}
