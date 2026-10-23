export type Language = 'uz' | 'ru' | 'en';

export interface MongoStatus {
  connected: boolean;
  cluster: string;
  database: string;
  message?: string;
}

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
  | 'milliy'      // Milliy taomlar (Osh, Qozon kabob, Norin...)
  | 'shashlik'    // Shashlik & Kaboblar
  | 'steak'       // Steak & Gril
  | 'salatlar'    // Salatlar
  | 'shorvalar'   // Sho'rvalar
  | 'shirinliklar'// Shirinliklar & Desertlar
  | 'desertlar'   // Desertlar
  | 'ichimliklar' // Ichimliklar & Kokteyllar
  | 'qahva_choy'  // Qahva va elit choylar
  | 'pasta'       // Pasta & Risotto
  | 'fastfood';   // Burger & Fast Food


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
  isHit?: boolean;
  isSpicy?: boolean;
  ingredients?: string[];
  rating?: number;
  reviewsCount?: number;
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


export interface RestaurantTable {
  id: string; // e.g. 'Stol #1 (Zal 1)'
  name: string; // e.g. 'Stol 1'
  zone: string; // e.g. 'Zal 1', 'Zal 2', 'VIP', 'Terrasa', 'Bar'
  capacity: number; // e.g. 4
  isActive: boolean;
  notes?: string;
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

export interface CustomerReview {
  id: string;
  authorName: string;
  authorRole?: string; // e.g. 'Doimiy mehmon', 'Food blogger'
  rating: number; // 1 to 5
  comment: string;
  date: string;
  recommendedDish?: string;
  likesCount?: number;
}

export interface TableReservation {
  id: string;
  guestName: string;
  guestPhone: string;
  date: string;
  time: string;
  guestsCount: number;
  tableId: string;
  zone: string;
  specialRequests?: string;
  status: 'tasdiqlandi' | 'kutilmoqda' | 'bekor_qilindi';
  createdAt: string;
}

export interface ChefProfile {
  id: string;
  name: string;
  role: string;
  experienceYears: number;
  experienceBio: string;
  specialty: string;
  image: string;
  achievements: string[];
}

