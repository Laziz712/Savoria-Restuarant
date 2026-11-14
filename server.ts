import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Fix querySrv ETIMEOUT on ISP networks (Uztelecom, Beeline, etc.) by using Google & Cloudflare DNS (only in non-Vercel env)
if (!process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
  } catch {
    // Ignore if custom DNS assignment is restricted
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

// Permissive CORS middleware for cross-origin access between devices (mobile, custom domain, local)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// MongoDB Connection Setup (Kept 100% secret on server-side)
const rawMongoUri = process.env.MONGODB_URI || 'mongodb+srv://shavkatovv:laziz712.@cluster0.wupoksj.mongodb.net/savoria?retryWrites=true&w=majority';
const sanitizedMongoUri = rawMongoUri
  .replace(/<([^>]+)>/g, (_, p) => encodeURIComponent(p));

let isMongoConnected = false;
let mongoErrorMessage = '';
let mongoConnectionPromise: Promise<boolean> | null = null;

mongoose.set('strictQuery', false);

export async function connectToMongo(): Promise<boolean> {
  if (isMongoConnected && mongoose.connection.readyState === 1) return true;
  if (!sanitizedMongoUri) return false;
  if (mongoConnectionPromise) {
    return mongoConnectionPromise;
  }

  mongoConnectionPromise = (async () => {
    try {
      await mongoose.connect(sanitizedMongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 7000,
      });
      isMongoConnected = true;
      mongoErrorMessage = '';
      console.log('MongoDB Atlas ulandi: SAVORIA RESTAURANT');
      await seedDefaultsIfEmpty();
      return true;
    } catch (err: any) {
      isMongoConnected = false;
      mongoConnectionPromise = null;
      mongoErrorMessage = err?.message || 'Database connection failed';
      console.warn('MongoDB ulanishda ogohlantirish:', mongoErrorMessage);
      return false;
    }
  })();

  return mongoConnectionPromise;
}

connectToMongo();

// ==========================================
// REAL-TIME BROADCAST ENGINE (Server-Sent Events)
// ==========================================
const sseClients = new Set<express.Response>();

export function broadcastRealtimeEvent(eventType: string, data: any) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Keep-alive heartbeat every 15s to keep connections alive through Cloud Run / proxies
const heartbeatTimer = setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': heartbeat\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 15000);

if (heartbeatTimer.unref) {
  heartbeatTimer.unref();
}

// ==========================================
// MONGOOSE SCHEMAS & MODELS
// ==========================================
const MenuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tenantId: { type: String, default: 'demo', index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  prepTimeMinutes: { type: Number, default: 15 },
  isAvailable: { type: Boolean, default: true },
  station: { type: String, default: 'oshxona' },
  calories: { type: Number },
  weightGrams: { type: Number },
  isChefSpecial: { type: Boolean, default: false },
  isHit: { type: Boolean, default: false },
  rating: { type: Number, default: 4.9 },
  reviewsCount: { type: Number, default: 24 },
  ingredients: { type: [String], default: [] }
}, { strict: false, timestamps: true });

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tenantId: { type: String, default: 'demo', index: true },
  type: { type: String, required: true },
  status: { type: String, default: 'yangi' },
  tableNumber: { type: String },
  waiterName: { type: String },
  customerName: { type: String },
  customerPhone: { type: String },
  deliveryAddress: { type: String },
  deliveryNotes: { type: String },
  courierId: { type: String },
  courierName: { type: String },
  courierPhone: { type: String },
  items: { type: Array, default: [] },
  totalSubtotal: { type: Number, default: 0 },
  serviceFeeRate: { type: Number, default: 0.12 },
  serviceFeeAmount: { type: Number, default: 0 },
  discountRate: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  finalTotal: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  paymentMethod: { type: String, default: 'uzcard_humo' },
  createdAt: { type: String },
  readyAt: { type: String },
  deliveredAt: { type: String },
  fiscalReceiptNumber: { type: String },
  estimatedDeliveryMinutes: { type: Number }
}, { strict: false, timestamps: true });

const TableSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tenantId: { type: String, default: 'demo', index: true },
  name: { type: String, required: true },
  zone: { type: String, default: 'Zal 1' },
  capacity: { type: Number, default: 4 },
  isActive: { type: Boolean, default: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

const ReservationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tenantId: { type: String, default: 'demo', index: true },
  guestName: { type: String, required: true },
  guestPhone: { type: String, required: true },
  date: { type: String, default: 'Bugun' },
  time: { type: String, default: '19:00' },
  guestsCount: { type: Number, default: 2 },
  tableId: { type: String, default: 'Stol 1' },
  zone: { type: String, default: 'Zal 1' },
  specialRequests: { type: String, default: '' },
  status: { type: String, default: 'tasdiqlandi' },
  createdAt: { type: String }
}, { timestamps: true });

const WaiterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tenantId: { type: String, default: 'demo', index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  assignedZone: { type: String, default: 'Zal 1' },
  status: { type: String, default: 'ishda' },
  ordersHandledCount: { type: Number, default: 0 },
  password: { type: String, default: '1111' },
  pinPassword: { type: String, default: '7777' }
}, { timestamps: true });

const CourierSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tenantId: { type: String, default: 'demo', index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  vehicle: { type: String, default: 'skuter' },
  status: { type: String, default: 'bosh' },
  activeOrdersCount: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 }
}, { timestamps: true });

const AdminUserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tenantId: { type: String, default: 'demo', index: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'superadmin' }
}, { timestamps: true });

const SettingsSchema = new mongoose.Schema({
  tenantId: { type: String, default: 'demo', index: true },
  name: { type: String, default: 'SAVORIA RESTAURANT' },
  slogan: { type: String, default: 'Sharqona Mehmondo‘stlik & Yuksak Gastronomik San’at' },
  bio: { type: String, default: '' },
  heroBadge: { type: String, default: '' },
  heroTitle: { type: String, default: '' },
  heroHighlight: { type: String, default: '' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  stir: { type: String, default: '' },
  serviceFeePercent: { type: Number, default: 10 },
  headerMessage: { type: String, default: '' },
  footerReceiptMessage: { type: String, default: 'Tashrifingiz uchun minnatdormiz!' },
  wifiPassword: { type: String, default: '' },
  workingDays: { type: String, default: 'Dushanba - Yakshanba:' },
  workingHours: { type: String, default: '09:00 - 23:00' },
  specialHoursLabel: { type: String, default: '' },
  specialHoursValue: { type: String, default: '' },
  eventsTitle: { type: String, default: '' },
  eventsSchedule: { type: String, default: '' },
  telegram: { type: String, default: '' },
  instagram: { type: String, default: '' },
  aboutTitle: { type: String, default: '' },
  aboutQuote: { type: String, default: '' },
  aboutDescription1: { type: String, default: '' },
  aboutDescription2: { type: String, default: '' }
}, { strict: false, timestamps: true });

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tenantId: { type: String, default: 'demo', index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  target: { type: String, default: 'all' },
  targetTable: { type: String, default: '' },
  priority: { type: String, default: 'normal' },
  sender: { type: String, default: 'Administrator' },
  timestamp: { type: Number, default: Date.now }
}, { timestamps: true });

const TenantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  telegram: { type: String, default: '' },
  email: { type: String, default: '' },
  logo: { type: String, default: '' },
  planMonths: { type: Number, default: 3 },
  startDate: { type: String, default: () => new Date().toISOString() },
  endDate: { type: String, required: true },
  status: { type: String, enum: ['pending', 'active', 'expired', 'blocked'], default: 'active' },
  adminUsername: { type: String, default: 'admin' },
  adminPasswordHash: { type: String, default: '1111' },
  settings: { type: Object, default: {} },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

const SubscriptionOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tenantName: { type: String, required: true },
  slug: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  telegram: { type: String, required: true },
  email: { type: String, default: '' },
  adminUsername: { type: String, required: true },
  adminPassword: { type: String, default: '' },
  planMonths: { type: Number, required: true },
  amount: { type: Number, required: true },
  receiptImage: { type: String, default: '' },
  cardNumber: { type: String, default: '4916 9903 6294 0907' },
  cardHolder: { type: String, default: 'SOHIBA SHOMURATOVA' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  reviewedAt: { type: String }
}, { timestamps: true });

const PlatformConfigSchema = new mongoose.Schema({
  id: { type: String, default: 'main_config', unique: true },
  monthlyBasePrice: { type: Number, default: 399000 },
  discount3MonthsPercent: { type: Number, default: 5 },
  discount6MonthsPercent: { type: Number, default: 10 },
  discount12MonthsPercent: { type: Number, default: 20 },
  cardNumber: { type: String, default: '4916 9903 6294 0907' },
  cardHolder: { type: String, default: 'SOHIBA SHOMURATOVA' },
  telegramSupport: { type: String, default: '@lazizshavkatov712' }
}, { timestamps: true });

const MenuItemModel = mongoose.model('MenuItem', MenuItemSchema);
const OrderModel = mongoose.model('Order', OrderSchema);
const TableModel = mongoose.model('RestaurantTable', TableSchema);
const ReservationModel = mongoose.model('Reservation', ReservationSchema);
const WaiterModel = mongoose.model('Waiter', WaiterSchema);
const CourierModel = mongoose.model('Courier', CourierSchema);
const AdminUserModel = mongoose.model('AdminUser', AdminUserSchema);
const SettingsModel = mongoose.model('Settings', SettingsSchema);
const NotificationModel = mongoose.model('Notification', NotificationSchema);
const TenantModel = mongoose.model('Tenant', TenantSchema);
const SubscriptionOrderModel = mongoose.model('SubscriptionOrder', SubscriptionOrderSchema);
const PlatformConfigModel = mongoose.model('PlatformConfig', PlatformConfigSchema);

const DEFAULT_MENU_ITEMS = [
  {
    id: 'm-1',
    name: 'To‘y Oshi (Savoria Maxsus Osh)',
    category: 'milliy',
    price: 68000,
    description: 'Barra qo‘zichoq go‘shti, lazer guruch, shirin sariq sabzi, no‘xat, mayiz, qazi va bedana tuxumlari bilan shohona damlangan milliy osh.',
    prepTimeMinutes: 18,
    isAvailable: true,
    station: 'oshxona',
    calories: 890,
    weightGrams: 450,
    isChefSpecial: true,
    isHit: true,
    rating: 4.9,
    reviewsCount: 142,
    ingredients: ["Qo'zichoq go'shti", "Lazer guruch", "Sariq sabzi", "Zirk", "Qazi"]
  },
  {
    id: 'm-2',
    name: 'Tandir Qozon Kabob',
    category: 'milliy',
    price: 95000,
    description: 'Qozonda tillarang bo‘lib qovurilgan va tandir taftida dimlangan barra qo‘y qovurg‘asi, karsildoq yosh kartoshka va archilgan piyoz sumax bilan.',
    prepTimeMinutes: 22,
    isAvailable: true,
    station: 'oshxona',
    calories: 920,
    weightGrams: 450,
    isChefSpecial: true,
    isHit: true,
    rating: 4.9,
    reviewsCount: 118,
    ingredients: ["Qo'y qovurg'asi", "Yosh kartoshka", "Yupqa piyoz", "Sumax"]
  },
  {
    id: 'm-3',
    name: 'G‘ijduvoncha Qiyma Shashlik',
    category: 'shashlik',
    price: 32000,
    description: 'Qadimiy G‘ijduvon retsepti bo‘yicha yumshoq va sersuv qilib tayyorlangan, ko‘mir cho‘g‘ida qizartirilgan mashhur qiyma kabob.',
    prepTimeMinutes: 14,
    isAvailable: true,
    station: 'mangal',
    calories: 380,
    weightGrams: 180,
    isChefSpecial: true,
    isHit: true,
    rating: 4.8,
    reviewsCount: 95,
    ingredients: ["Barra go'sht", "Dumba yog'i", "Kashnich", "Zira", "Piyoz"]
  },
  {
    id: 'm-4',
    name: 'Kuskovoy Qo‘zichoq Shashlik',
    category: 'shashlik',
    price: 38000,
    description: 'Saralangan barra qo‘zichoq go‘shti, nozik dumba bo‘laklari va maxsus sharq ziravorlari bilan cho‘g‘da pishirilgan xushxo‘r kabob.',
    prepTimeMinutes: 16,
    isAvailable: true,
    station: 'mangal',
    calories: 420,
    weightGrams: 200,
    isChefSpecial: false,
    isHit: true,
    rating: 4.9,
    reviewsCount: 88,
    ingredients: ["Qo'zichoq go'shti", "Dumba", "Maxsus marinad", "Piyoz"]
  },
  {
    id: 'm-5',
    name: 'Ribeye Steak Premium (Black Angus)',
    category: 'steak',
    price: 185000,
    description: 'Marmar sifatli Black Angus bifshteksi, yangi rozmarin shoxi, sarimsoqli sariyog‘ va grilda pishirilgan sabzavotlar bilan.',
    prepTimeMinutes: 20,
    isAvailable: true,
    station: 'mangal',
    calories: 780,
    weightGrams: 350,
    isChefSpecial: true,
    isHit: true,
    rating: 5.0,
    reviewsCount: 76,
    ingredients: ["Black Angus go'shti", "Rozmarin", "Sarimsoq yog'i", "Dengiz tuzi"]
  },
  {
    id: 'm-6',
    name: 'Ko‘za Sho‘rva (Tandirda)',
    category: 'shorvalar',
    price: 52000,
    description: 'Maxsus sopol ko‘zada past olovda uzoq vaqt qaynatilgan barra qo‘zichoq go‘shti, no‘xat, mayin sabzavotlar va shifobaxsh tillarang bulyon.',
    prepTimeMinutes: 18,
    isAvailable: true,
    station: 'oshxona',
    calories: 460,
    weightGrams: 400,
    isChefSpecial: false,
    rating: 4.9,
    reviewsCount: 64,
    ingredients: ["Barra go'sht", "No'xat", "Kartoshka", "Sabzi", "Shivit"]
  },
  {
    id: 'm-7',
    name: 'Achchiq-Chuchuk (Anorli)',
    category: 'salatlar',
    price: 26000,
    description: 'Yupqa qilib to‘g‘ralgan xushbo‘y pomidor, archilgan piyoz, rayhon va shirin anor donalari bilan bezatilgan milliy tansiq salat.',
    prepTimeMinutes: 6,
    isAvailable: true,
    station: 'salat',
    calories: 120,
    weightGrams: 250,
    isChefSpecial: false,
    rating: 4.8,
    reviewsCount: 82,
    ingredients: ["Yupqa pomidor", "Qizil piyoz", "Qalampir", "Anor donalari", "Rayhon"]
  },
  {
    id: 'm-8',
    name: 'Turkcha Pista Paxlava (Gaziantep)',
    category: 'shirinliklar',
    price: 48000,
    description: '40 qavat yupqa yoyilgan qatlama xamir, Gaziantepning saralangan zumrad pistasi va toza sariyog‘ sharbati bilan tayyorlangan asl turk paxlavasi.',
    prepTimeMinutes: 5,
    isAvailable: true,
    station: 'salat',
    calories: 490,
    weightGrams: 160,
    isChefSpecial: true,
    isHit: true,
    rating: 5.0,
    reviewsCount: 110,
    ingredients: ["Qatlama xamir", "Gaziantep pistasi", "Toza sariyog'", "Tabiiy sirop"]
  },
  {
    id: 'm-9',
    name: 'Norin & Qazi Assorti',
    category: 'milliy',
    price: 58000,
    description: 'Pichoqda yupqa kesilgan an’anaviy xamir, barra ot go‘shti qazisi, xushbo‘y zira va qaynoq piyola sho‘rvasi bilan taqdim etiladi.',
    prepTimeMinutes: 10,
    isAvailable: true,
    station: 'oshxona',
    calories: 580,
    weightGrams: 350,
    isChefSpecial: false,
    rating: 4.9,
    reviewsCount: 73,
    ingredients: ["Yupqa xamir", "Ot go'shti qazi", "Qora murch", "Zira"]
  },
  {
    id: 'm-10',
    name: 'T-Bone Steak (Dry-Aged)',
    category: 'steak',
    price: 210000,
    description: '28 kun davomida yetiltirilgan suyakli T-Bone steyki, file va striploin uyg‘unligi, mangalda pishgan pomidor va qalampir bilan.',
    prepTimeMinutes: 24,
    isAvailable: true,
    station: 'mangal',
    calories: 860,
    weightGrams: 500,
    isChefSpecial: true,
    rating: 4.9,
    reviewsCount: 42,
    ingredients: ["Dry-Aged T-bone", "Dengiz tuzi", "Gril sabzavotlar", "Rozmarin"]
  },
  {
    id: 'm-11',
    name: 'San Sebastian Cheesecake',
    category: 'shirinliklar',
    price: 42000,
    description: 'Ustki qavati mayin karamellangan nozik pishloqli desert, issiq Belgiya qora shokolad sousi va yangi rezavor mevalar bilan.',
    prepTimeMinutes: 5,
    isAvailable: true,
    station: 'salat',
    calories: 460,
    weightGrams: 200,
    isChefSpecial: false,
    rating: 4.9,
    reviewsCount: 98,
    ingredients: ["Krem pishloq", "Qaymoq", "Issiq Belgiya shokoladi"]
  },
  {
    id: 'm-12',
    name: 'Yangi Siqilgan Anor Sharbat (Fresh 300ml)',
    category: 'ichimliklar',
    price: 35000,
    description: 'Kuyoshli Surxondaryo anorlaridan yangi siqib tayyorlangan 100% tabiiy, shifobaxsh va tetiklashtiruvchi sharbat.',
    prepTimeMinutes: 5,
    isAvailable: true,
    station: 'bar',
    calories: 140,
    weightGrams: 300,
    isChefSpecial: false,
    rating: 5.0,
    reviewsCount: 89,
    ingredients: ["100% tabiiy anor", "Muz bo'laklari"]
  },
  {
    id: 'm-13',
    name: 'Mualliflik Sitrus & Marakuya Limonadi (1L)',
    category: 'ichimliklar',
    price: 42000,
    description: 'Yangi apelsin, laym sharbati, tropik marakuya pyuresi va bog‘ yalpizi bilan tayyorlangan shohona tetiklashtiruvchi mualliflik limonadi.',
    prepTimeMinutes: 5,
    isAvailable: true,
    station: 'bar',
    calories: 180,
    weightGrams: 1000,
    isChefSpecial: true,
    isHit: true,
    rating: 4.9,
    reviewsCount: 104,
    ingredients: ["Yangi apelsin", "Laym", "Marakuya pyuresi", "Yalpiz", "Muz"]
  },
  {
    id: 'm-14',
    name: 'Turkcha Qahva (Qumda Damlangan)',
    category: 'ichimliklar',
    price: 24000,
    description: 'Qizigan mayin qumda jezva ichida an’anaviy uslubda sekin damlangan xushbo‘y toza arabika qahvasi. Maxsus pista lokumi va muzli suv bilan beriladi.',
    prepTimeMinutes: 6,
    isAvailable: true,
    station: 'bar',
    calories: 45,
    weightGrams: 80,
    isChefSpecial: false,
    rating: 4.9,
    reviewsCount: 67,
    ingredients: ["100% Arabika qahvasi", "Lokum shirinligi", "Muzli suv"]
  },
  {
    id: 'm-15',
    name: 'Tog‘ Giyohlari & Zafaronli Choy (Choynak)',
    category: 'ichimliklar',
    price: 28000,
    description: 'Chust ko‘k choyi, tog‘ kiyiko‘ti, yovvoyi yalpiz, zafaron gullari va yangi limon bo‘laklari bilan damlangan xushbo‘y shifobaxsh choy.',
    prepTimeMinutes: 7,
    isAvailable: true,
    station: 'bar',
    calories: 20,
    weightGrams: 900,
    isChefSpecial: true,
    rating: 5.0,
    reviewsCount: 92,
    ingredients: ["Chust ko'k choyi", "Tog' kiyiko'ti", "Zafaron", "Limon", "Yalpiz"]
  },
  {
    id: 'm-16',
    name: 'Klassik Mojito (Laym & Yalpiz 400ml)',
    category: 'ichimliklar',
    price: 32000,
    description: 'Barra yalpiz barglari, yangi siqilgan laym sharbati, shakar qamishi siropi va sovuq gazlangan soda suvi bilan muzdek kokteyl.',
    prepTimeMinutes: 4,
    isAvailable: true,
    station: 'bar',
    calories: 110,
    weightGrams: 400,
    isChefSpecial: false,
    rating: 4.8,
    reviewsCount: 78,
    ingredients: ["Yangi laym", "Bog' yalpizi", "Shakar qamishi siropi", "Muz bo'laklari"]
  },
  {
    id: 'm-17',
    name: 'Mualliflik Sezar Salati (Krevetka Bilan)',
    category: 'salatlar',
    price: 68000,
    description: 'Grilda pishirilgan yo‘lbars krevetkalari, karsildoq aysberg va romen barglari, 24 oylik Parmesan pishlog‘i va mualliflik anjous sousi.',
    prepTimeMinutes: 8,
    isAvailable: true,
    station: 'salat',
    calories: 320,
    weightGrams: 280,
    isChefSpecial: true,
    isHit: true,
    rating: 4.9,
    reviewsCount: 115,
    ingredients: ["Yo'lbars krevetkalari", "Aysberg", "Parmesan pishlog'i", "Karsildoq suxarik", "Maxsus sezar sous"]
  },
  {
    id: 'm-18',
    name: 'Tom Yum Dengiz Mahsulotlari Sho‘rvasi',
    category: 'shorvalar',
    price: 78000,
    description: 'Yo‘lbars krevetkalari, kalmar, shitake qo‘ziqorinlari, limon o‘ti, galangal va kokos suti bilan tayyorlangan mashhur sharqona nordon-achchiq sho‘rva.',
    prepTimeMinutes: 15,
    isAvailable: true,
    station: 'oshxona',
    calories: 380,
    weightGrams: 380,
    isChefSpecial: true,
    rating: 4.9,
    reviewsCount: 84,
    ingredients: ["Krevetka", "Kalmar", "Shitake", "Kokos suti", "Lemongrass", "Chili"]
  },
  {
    id: 'm-19',
    name: 'Atlantika Losos Steyki (Grilda)',
    category: 'steak',
    price: 165000,
    description: 'Gril panjarasida mayin qilib qovurilgan barra losos filesi, limonli kremsous, qovurilgan yosh sparja va dengiz tuzi bilan.',
    prepTimeMinutes: 18,
    isAvailable: true,
    station: 'mangal',
    calories: 680,
    weightGrams: 340,
    isChefSpecial: true,
    rating: 4.9,
    reviewsCount: 65,
    ingredients: ["Atlantika lososi", "Limon", "Sparja", "Oq vino sousi"]
  }
];

// In-Memory Fallback store if Mongo is temporarily offline
const memoryStore = {
  menu: [...DEFAULT_MENU_ITEMS] as any[],
  orders: [] as any[],
  tables: [] as any[],
  reservations: [] as any[],
  waiters: [] as any[],
  couriers: [] as any[],
  admins: [] as any[],
  notifications: [] as any[],
  settings: null as any,
  tenants: [] as any[],
  subscriptionOrders: [] as any[],
  platformConfig: {
    id: 'main_config',
    monthlyBasePrice: 399000,
    discount3MonthsPercent: 5,
    discount6MonthsPercent: 10,
    discount12MonthsPercent: 20,
    cardNumber: '4916 9903 6294 0907',
    cardHolder: 'SOHIBA SHOMURATOVA',
    telegramSupport: '@lazizshavkatov712'
  } as any
};

async function seedDefaultsIfEmpty() {
  try {
    // 1. Ensure all 19 authentic dishes are seeded and up-to-date in MongoDB
    for (const item of DEFAULT_MENU_ITEMS) {
      await MenuItemModel.findOneAndUpdate(
        { id: item.id },
        { $setOnInsert: { ...item, tenantId: 'demo' } },
        { upsert: true, new: true }
      );
    }

    const tableCount = await TableModel.countDocuments();
    if (tableCount === 0) {
      const defaultTables = [
        { id: 'Stol #1 (Zal 1)', tenantId: 'demo', name: 'Stol 1', zone: 'Zal 1', capacity: 4, isActive: true, notes: 'Deraza oldi' },
        { id: 'Stol #2 (Zal 1)', tenantId: 'demo', name: 'Stol 2', zone: 'Zal 1', capacity: 2, isActive: true, notes: 'Kichik shinam stol' },
        { id: 'Stol #3 (Zal 1)', tenantId: 'demo', name: 'Stol 3', zone: 'Zal 1', capacity: 6, isActive: true, notes: 'Katta oilaviy stol' },
        { id: 'Stol #4 (Zal 1)', tenantId: 'demo', name: 'Stol 4', zone: 'Zal 1', capacity: 4, isActive: true, notes: 'Markaziy zal' },
        { id: 'Stol #5 (Zal 1)', tenantId: 'demo', name: 'Stol 5', zone: 'Zal 1', capacity: 4, isActive: true, notes: 'Markaziy zal' },
        { id: 'VIP Kabinet #1', tenantId: 'demo', name: 'VIP 1', zone: 'VIP', capacity: 10, isActive: true, notes: 'Alohida VIP xona va televizor' },
        { id: 'VIP Terrasa #2', tenantId: 'demo', name: 'VIP Terrasa', zone: 'Terrasa', capacity: 8, isActive: true, notes: 'Ochiq osmon ostidagi veranda' },
        { id: 'Bar stoli #3', tenantId: 'demo', name: 'Bar 3', zone: 'Bar', capacity: 2, isActive: true, notes: 'Barmen qarshisida' },
      ];
      await TableModel.insertMany(defaultTables);
    }

    const settingsCount = await SettingsModel.countDocuments();
    if (settingsCount === 0) {
      await SettingsModel.create({
        tenantId: 'demo',
        name: 'SAVORIA RESTAURANT',
        slogan: 'Sharqona Mehmondo‘stlik & Yuksak Gastronomik San’at',
        address: 'Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko\'chasi 45-uy',
        phone: '+998 71 200-71-12',
        stir: '309 814 552',
        serviceFeePercent: 12,
        headerMessage: 'Savoria Restoraniga xush kelibsiz!',
        footerReceiptMessage: 'Tashrifingiz uchun minnatdormiz! Yoqimli ishtaha tilaymiz.',
        wifiPassword: 'savoria_vip_guest'
      });
    }

    const waiterCount = await WaiterModel.countDocuments();
    if (waiterCount === 0) {
      await WaiterModel.insertMany([
        { id: 'w-1', tenantId: 'demo', name: 'Sardor Rahimiy', phone: '+998 90 123 45 67', assignedZone: 'Zal 1 (Asosiy)', status: 'ishda', ordersHandledCount: 18, password: '1111', pinPassword: '1111' },
        { id: 'w-2', tenantId: 'demo', name: 'Madina Alimova', phone: '+998 93 234 56 78', assignedZone: 'VIP Terrasa', status: 'ishda', ordersHandledCount: 14, password: '2222', pinPassword: '2222' },
        { id: 'w-3', tenantId: 'demo', name: 'Javohir Toshmatov', phone: '+998 99 345 67 89', assignedZone: 'Sharqona Zal', status: 'ishda', ordersHandledCount: 9, password: '3333', pinPassword: '3333' }
      ]);
    }

    const courierCount = await CourierModel.countDocuments();
    if (courierCount === 0) {
      await CourierModel.insertMany([
        { id: 'c-1', tenantId: 'demo', name: 'Rustam Qodirov', phone: '+998 90 987 65 43', vehicle: 'skuter', status: 'bosh', activeOrdersCount: 0, rating: 4.9 },
        { id: 'c-2', tenantId: 'demo', name: 'Bobur Saidov', phone: '+998 97 876 54 32', vehicle: 'avto', status: 'bosh', activeOrdersCount: 0, rating: 5.0 },
        { id: 'c-3', tenantId: 'demo', name: 'Otabek Mirzayev', phone: '+998 94 765 43 21', vehicle: 'skuter', status: 'bosh', activeOrdersCount: 0, rating: 4.8 }
      ]);
    }

    const adminCount = await AdminUserModel.countDocuments();
    if (adminCount === 0) {
      await AdminUserModel.create({
        id: 'adm-1',
        tenantId: 'demo',
        name: 'Laziz Shavkatov (Bosh Admin)',
        username: 'laziz712',
        passwordHash: 'laziz712.',
        role: 'superadmin'
      });
    }

    // Seed Multi-Tenant Tenants if none exist
    const tenantCount = await TenantModel.countDocuments();
    if (tenantCount === 0) {
      const demoTenant = {
        id: 't-demo',
        name: 'SAVORIA RESTAURANT (Demo)',
        slug: 'demo',
        ownerName: 'Laziz Shavkatov',
        phone: '+998 71 200-71-12',
        telegram: '@lazizshavkatov712',
        email: 'info@savoria-restaurant.uz',
        logo: '',
        planMonths: 12,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        status: 'active',
        adminUsername: 'demo',
        adminPasswordHash: '1111',
        settings: {
          name: 'SAVORIA RESTAURANT',
          slogan: 'Sharqona Mehmondo‘stlik & Yuksak Gastronomik San’at',
          bio: 'Toshkentning eng nufuzli milliy va premium restorani. Sharqona mehmondo‘stlik va yuksak gastronomiya san’ati.',
          heroBadge: 'Toshkentning eng nufuzli milliy & premium restorani',
          heroTitle: 'Sharqona Mehmondo‘stlik &',
          heroHighlight: 'Yuksak Gastronomik San’at',
          address: 'Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko\'chasi 45-uy',
          phone: '+998 71 200-71-12',
          email: 'lazizshavkatov712@gmail.com',
          stir: '309 814 552',
          serviceFeePercent: 12,
          headerMessage: 'Savoria Restoraniga xush kelibsiz!',
          footerReceiptMessage: 'Tashrifingiz uchun minnatdormiz! Yoqimli ishtaha tilaymiz.',
          wifiPassword: 'savoria_vip_guest',
          workingDays: 'Dushanba - Yakshanba:',
          workingHours: '10:00 - 23:30',
          specialHoursLabel: 'Osh va Tandir:',
          specialHoursValue: '11:30 dan',
          eventsTitle: 'Jonli Musiqa Oqshomi:',
          eventsSchedule: 'Juma - Yakshanba (19:30 - 23:00)',
          telegram: '@lazizshavkatov712',
          instagram: '@shavkatovv.o07',
          aboutTitle: 'Nafislik va Mehmondo‘stlik Makoni',
          aboutQuote: '«Savoria» — bu shunchaki dasturxon emas. Bu oila davrasi, do\'stona suhbatlar va yuksak gastronomiya san\'ati birlashgan shukuhli dargohdir.',
          aboutDescription1: '2011-yildan buyon «Savoria» restorani Toshkent shahrida haqiqiy sharqona mehmondo\'stlik va jahon andozalaridagi servis madaniyatini namoyish etib kelmoqda.',
          aboutDescription2: 'Bizning maqsadimiz — har bir mehmonimizga nafaqat mazali taom ulashish, balki ularga unutilmas iliq xotiralar va shinam muhit taqdim etishdir.'
        },
        createdAt: new Date().toISOString()
      };

      const floraTenant = {
        id: 't-flora',
        name: 'Flora Lounge & Cafe',
        slug: 'flora',
        ownerName: 'Alisher Usmonov',
        phone: '+998 90 999 88 77',
        telegram: '@flora_cafe',
        email: 'flora.cafe.tashkent@gmail.com',
        logo: '',
        planMonths: 6,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
        status: 'active',
        adminUsername: 'flora_admin',
        adminPasswordHash: 'flora2026',
        settings: {
          name: 'Flora Lounge & Cafe',
          slogan: 'Shinam muhit va zamonaviy Yevropa qahvaxonasi',
          bio: 'Flora Lounge & Cafe — Toshkent markazidagi shinam muhit, mualliflik taomlari va xushbo‘y qahva maskani.',
          heroBadge: 'Shinam Lounge & Zamonaviy Oshxona',
          heroTitle: 'Flora Lounge & Cafe —',
          heroHighlight: 'Betakror Ta’m va Muhit',
          address: 'Toshkent sh., Mirzo Ulug‘bek tumani, Mustaqillik shoh ko‘chasi 12',
          phone: '+998 90 999 88 77',
          email: 'flora.cafe.tashkent@gmail.com',
          stir: '412 873 991',
          serviceFeePercent: 10,
          headerMessage: 'Flora Lounge & Cafe ga xush kelibsiz!',
          footerReceiptMessage: 'Flora Cafeni tanlaganingiz uchun tashakkur! Yana kutib qolamiz.',
          wifiPassword: 'flora_freewifi',
          workingDays: 'Dushanba - Yakshanba:',
          workingHours: '09:00 - 23:00',
          specialHoursLabel: 'Nonushta menyusi:',
          specialHoursValue: '09:00 - 12:00',
          eventsTitle: 'Lounge & Akustik kechalar:',
          eventsSchedule: 'Shanba - Yakshanba (19:00 - 22:30)',
          telegram: '@flora_cafe',
          instagram: '@flora_lounge_uz',
          aboutTitle: 'Zamonaviy Ta’m va Huzurbaxsh Muhit',
          aboutQuote: '«Flora Lounge & Cafe» — do‘stlar davrasi, biznes uchrashuvlar va mazali kechki ovqatlar uchun yaratilgan shinam maskan.',
          aboutDescription1: 'Flora Lounge & Cafe jamoasi har bir mehmon uchun eng sara mahsulotlardan tayyorlangan mualliflik taomlari va premium ichimliklarni taqdim etadi.',
          aboutDescription2: 'Bizning oshxonamizda sifat, tozalik va samimiy mehmondo‘stlik har doim birinchi o‘rinda turadi.'
        },
        createdAt: new Date().toISOString()
      };

      await TenantModel.insertMany([demoTenant, floraTenant]);
      memoryStore.tenants = [demoTenant, floraTenant];

      // Clone menu items for flora tenant
      for (const item of DEFAULT_MENU_ITEMS.slice(0, 8)) {
        await MenuItemModel.create({
          ...item,
          id: `flora-${item.id}`,
          tenantId: 'flora'
        });
      }

      // Clone tables for flora tenant
      await TableModel.insertMany([
        { id: 'flora-table-1', tenantId: 'flora', name: 'Flora 1 (Zal)', zone: 'Zal', capacity: 4, isActive: true },
        { id: 'flora-table-2', tenantId: 'flora', name: 'Flora 2 (Terrasa)', zone: 'Terrasa', capacity: 2, isActive: true },
        { id: 'flora-table-3', tenantId: 'flora', name: 'Flora VIP', zone: 'VIP', capacity: 8, isActive: true }
      ]);
    }

    // Seed platform config if not exists
    const configCount = await PlatformConfigModel.countDocuments();
    if (configCount === 0) {
      await PlatformConfigModel.create({
        id: 'main_config',
        monthlyBasePrice: 399000,
        discount3MonthsPercent: 5,
        discount6MonthsPercent: 10,
        discount12MonthsPercent: 20,
        cardNumber: '4916 9903 6294 0907',
        cardHolder: 'SOHIBA SHOMURATOVA',
        telegramSupport: '@lazizshavkatov712'
      });
    }
  } catch (err) {
    console.warn('Seed tekshirishda ogohlantirish:', err);
  }
}

// ==========================================
// REAL-TIME API ROUTES
// ==========================================

// 1. Real-Time Server-Sent Events Stream
app.get('/api/realtime/stream', (req, res) => {
  if (process.env.VERCEL) {
    // Vercel serverless functions do not support persistent streaming connections
    return res.status(204).end();
  }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString(), message: 'SAVORIA Real-time aloqa o‘rnatildi' })}\n\n`);
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// 2. Server Status & Health
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    restaurant: 'SAVORIA RESTAURANT (Multi-Tenant SaaS)',
    mongoConnected: isMongoConnected,
    connectedClients: sseClients.size,
    serverTime: new Date().toISOString()
  });
});

// ==========================================
// MULTI-TENANT SAAS MANAGEMENT API
// ==========================================
const RESERVED_SLUGS = new Set(['admin', 'demo', 'superadmin', 'api', 'login', 'buy', 'pricing', 'settings', 'order', 'static', 'assets', 'favicon', 'manifest']);

function computeTenantStatus(tenant: any) {
  if (!tenant) return null;
  const now = Date.now();
  const end = new Date(tenant.endDate).getTime();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  const isExpired = diffDays <= 0;
  let status = tenant.status || 'active';
  if (status !== 'blocked') {
    status = isExpired ? 'expired' : 'active';
  }
  return {
    ...tenant,
    daysRemaining: Math.max(0, diffDays),
    isExpired,
    status
  };
}

// A. Check Slug Availability
app.get('/api/check-slug/:slug', async (req, res) => {
  try {
    const rawSlug = (req.params.slug || '').toLowerCase().trim();
    if (!rawSlug || rawSlug.length < 3) {
      const msg = 'Slug kamida 3 ta belgidan iborat bo‘lishi kerak';
      return res.status(400).json({ available: false, reason: msg, message: msg });
    }
    if (!/^[a-z0-9-]+$/.test(rawSlug)) {
      const msg = 'Slug faqat kichik lotin harflari, raqam va tire (-) dan iborat bo‘lishi kerak';
      return res.status(400).json({ available: false, reason: msg, message: msg });
    }
    if (RESERVED_SLUGS.has(rawSlug)) {
      const msg = 'Bu nom tizim xizmatlari uchun band qilingan';
      return res.status(200).json({ available: false, reason: msg, message: msg });
    }

    if (isMongoConnected) {
      const existingTenant = await TenantModel.findOne({ slug: rawSlug }).lean();
      if (existingTenant) {
        const msg = 'Bu restoran domeni allaqachon band qilingan';
        return res.json({ available: false, reason: msg, message: msg });
      }
      const pendingOrder = await SubscriptionOrderModel.findOne({ slug: rawSlug, status: 'pending' }).lean();
      if (pendingOrder) {
        const msg = 'Ushbu manzil bo‘yicha arizani ko‘rib chiqish kutilmoqda';
        return res.json({ available: false, reason: msg, message: msg });
      }
    } else {
      const match = memoryStore.tenants.find((t: any) => t.slug === rawSlug);
      if (match) return res.json({ available: false, reason: 'Bu domen band', message: 'Bu domen band' });
      const pending = memoryStore.subscriptionOrders.find((o: any) => o.slug === rawSlug && o.status === 'pending');
      if (pending) return res.json({ available: false, reason: 'Ariza kutilmoqda', message: 'Ariza kutilmoqda' });
    }

    res.json({ available: true, slug: rawSlug, message: 'Ushbu manzil bo‘sh' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// B. Platform Pricing & Card Config
app.get('/api/platform-config', async (req, res) => {
  try {
    if (isMongoConnected) {
      let cfg = await PlatformConfigModel.findOne({ id: 'main_config' }).lean();
      if (!cfg) {
        cfg = await PlatformConfigModel.create({
          id: 'main_config',
          monthlyBasePrice: 399000,
          discount3MonthsPercent: 5,
          discount6MonthsPercent: 10,
          discount12MonthsPercent: 20,
          cardNumber: '4916 9903 6294 0907',
          cardHolder: 'SOHIBA SHOMURATOVA',
          telegramSupport: '@lazizshavkatov712'
        });
      }
      return res.json(cfg);
    }
    res.json(memoryStore.platformConfig);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/platform-config', async (req, res) => {
  try {
    const updates = stripMongoInternalFields(req.body);
    if (isMongoConnected) {
      const updated = await PlatformConfigModel.findOneAndUpdate(
        { id: 'main_config' },
        { $set: updates },
        { upsert: true, new: true }
      ).lean();
      return res.json({ success: true, config: updated, ...updated });
    }
    memoryStore.platformConfig = { ...memoryStore.platformConfig, ...updates };
    res.json({ success: true, config: memoryStore.platformConfig, ...memoryStore.platformConfig });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// C. Tenants List & Management
app.get('/api/tenants', async (req, res) => {
  try {
    let tenantsList = memoryStore.tenants;
    if (isMongoConnected) {
      tenantsList = await TenantModel.find().lean();
    }
    const computed = tenantsList.map(t => computeTenantStatus(t));
    res.json(computed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tenants/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    let tenant: any = null;
    if (isMongoConnected) {
      tenant = await TenantModel.findOne({ slug }).lean();
    } else {
      tenant = memoryStore.tenants.find((t: any) => t.slug === slug);
    }
    if (!tenant) {
      return res.status(404).json({ error: 'Restoran topilmadi' });
    }
    res.json(computeTenantStatus(tenant));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tenants', async (req, res) => {
  try {
    const data = req.body;
    const slug = (data.slug || '').toLowerCase().trim();
    if (RESERVED_SLUGS.has(slug)) {
      return res.status(400).json({ error: 'Ushbu slug band' });
    }
    const tenantDoc = {
      ...data,
      id: data.id || `t-${Date.now()}`,
      slug,
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + (data.planMonths || 3) * 30 * 86400000).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      await TenantModel.create(tenantDoc);
      // Seed initial dishes and tables for this new tenant
      for (const item of DEFAULT_MENU_ITEMS.slice(0, 10)) {
        await MenuItemModel.create({
          ...item,
          id: `${slug}-${item.id}`,
          tenantId: slug
        });
      }
      await TableModel.create([
        { id: `${slug}-t1`, tenantId: slug, name: 'Stol 1', zone: 'Asosiy Zal', capacity: 4, isActive: true },
        { id: `${slug}-t2`, tenantId: slug, name: 'Stol 2', zone: 'Asosiy Zal', capacity: 2, isActive: true },
        { id: `${slug}-t3`, tenantId: slug, name: 'Stol 3', zone: 'Terrasa', capacity: 6, isActive: true }
      ]);
    } else {
      memoryStore.tenants.push(tenantDoc);
    }

    broadcastRealtimeEvent('tenant:created', tenantDoc);
    res.status(201).json(computeTenantStatus(tenantDoc));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tenants/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    const updates = req.body;
    if (isMongoConnected) {
      const updated = await TenantModel.findOneAndUpdate(
        { slug },
        { $set: updates },
        { new: true }
      ).lean();
      if (!updated) return res.status(404).json({ error: 'Restoran topilmadi' });
      broadcastRealtimeEvent('tenant:updated', updated);
      return res.json(computeTenantStatus(updated));
    } else {
      const idx = memoryStore.tenants.findIndex((t: any) => t.slug === slug);
      if (idx === -1) return res.status(404).json({ error: 'Topilmadi' });
      memoryStore.tenants[idx] = { ...memoryStore.tenants[idx], ...updates };
      return res.json(computeTenantStatus(memoryStore.tenants[idx]));
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tenants/:slug/extend', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    const months = Number(req.body.months) || 1;
    let tenant: any = null;
    if (isMongoConnected) {
      tenant = await TenantModel.findOne({ slug });
    } else {
      tenant = memoryStore.tenants.find((t: any) => t.slug === slug);
    }
    if (!tenant) return res.status(404).json({ error: 'Restoran topilmadi' });

    const currentEnd = new Date(tenant.endDate).getTime();
    const baseTime = currentEnd > Date.now() ? currentEnd : Date.now();
    const newEnd = new Date(baseTime + months * 30 * 24 * 3600 * 1000).toISOString();

    if (isMongoConnected) {
      tenant.endDate = newEnd;
      tenant.status = 'active';
      await tenant.save();
    } else {
      tenant.endDate = newEnd;
      tenant.status = 'active';
    }

    broadcastRealtimeEvent('tenant:extended', { slug, newEnd });
    res.json(computeTenantStatus(tenant.toObject ? tenant.toObject() : tenant));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tenants/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    if (slug === 'demo') {
      return res.status(400).json({ error: 'Demo tenantini o‘chirib bo‘lmaydi' });
    }
    if (isMongoConnected) {
      await TenantModel.deleteOne({ slug });
      await MenuItemModel.deleteMany({ tenantId: slug });
      await OrderModel.deleteMany({ tenantId: slug });
      await TableModel.deleteMany({ tenantId: slug });
    } else {
      memoryStore.tenants = memoryStore.tenants.filter((t: any) => t.slug !== slug);
    }
    broadcastRealtimeEvent('tenant:deleted', { slug });
    res.json({ success: true, message: 'Restoran va uning barcha ma’lumotlari o‘chirildi' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// D. Subscription Orders (Purchase Flow)
app.get('/api/subscription-orders', async (req, res) => {
  try {
    if (isMongoConnected) {
      const orders = await SubscriptionOrderModel.find().sort({ createdAt: -1 }).lean();
      return res.json(orders);
    }
    res.json(memoryStore.subscriptionOrders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subscription-orders', async (req, res) => {
  try {
    const data = req.body || {};
    const cleanSlug = (data.slug || '').toLowerCase().trim();

    if (!data.tenantName || !String(data.tenantName).trim()) {
      return res.status(400).json({ success: false, error: 'Restoran nomi kiritilishi shart' });
    }
    if (!cleanSlug || cleanSlug.length < 3 || !/^[a-z0-9-]+$/.test(cleanSlug)) {
      return res.status(400).json({ success: false, error: 'Sayt manzili (slug) kamida 3 ta lotin harfi/raqamdan iborat bo‘lishi kerak' });
    }
    if (RESERVED_SLUGS.has(cleanSlug)) {
      return res.status(400).json({ success: false, error: 'Bu manzil (slug) tizim tomonidan band qilingan' });
    }
    if (!data.ownerName || !data.phone) {
      return res.status(400).json({ success: false, error: 'Egasi ismi va telefon raqami majburiy' });
    }

    if (isMongoConnected) {
      const existingTenant = await TenantModel.findOne({ slug: cleanSlug }).lean();
      if (existingTenant) {
        return res.status(409).json({ success: false, error: 'Bu sayt manzili (slug) allaqachon band qilingan' });
      }
      const existingPending = await SubscriptionOrderModel.findOne({ slug: cleanSlug, status: 'pending' }).lean();
      if (existingPending) {
        return res.status(409).json({ success: false, error: 'Bu manzil bo‘yicha ariza hozirda ko‘rib chiqilmoqda' });
      }
    } else {
      if (memoryStore.tenants.some((t: any) => t.slug === cleanSlug)) {
        return res.status(409).json({ success: false, error: 'Bu sayt manzili (slug) allaqachon band qilingan' });
      }
    }

    const orderDoc: any = {
      id: `SUB-${Date.now().toString().slice(-6)}`,
      tenantName: String(data.tenantName).trim(),
      slug: cleanSlug,
      ownerName: String(data.ownerName).trim(),
      phone: String(data.phone).trim(),
      telegram: String(data.telegram || '').trim() || '-',
      email: String(data.email || '').trim(),
      adminUsername: String(data.adminUsername || 'admin').trim() || 'admin',
      adminPassword: String(data.adminPassword || '1111'),
      planMonths: Number(data.planMonths) || 3,
      amount: Number(data.amount) || 0,
      receiptImage: typeof data.receiptImage === 'string' ? data.receiptImage : '',
      cardNumber: String(data.cardNumber || '4916 9903 6294 0907'),
      cardHolder: String(data.cardHolder || 'SOHIBA SHOMURATOVA'),
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      await SubscriptionOrderModel.create(orderDoc);
    } else {
      memoryStore.subscriptionOrders.unshift(orderDoc);
    }

    broadcastRealtimeEvent('subscription:new', orderDoc);
    res.status(201).json({ success: true, order: orderDoc, ...orderDoc });
  } catch (err: any) {
    console.error('POST /api/subscription-orders error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Buyurtmani saqlashda xatolik yuz berdi' });
  }
});

app.post('/api/subscription-orders/:id/approve', async (req, res) => {
  try {
    const id = req.params.id;
    let order: any = null;
    if (isMongoConnected) {
      order = await SubscriptionOrderModel.findOne({ id });
    } else {
      order = memoryStore.subscriptionOrders.find((o: any) => o.id === id);
    }

    if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });

    order.status = 'approved';
    order.reviewedAt = new Date().toISOString();

    const months = order.planMonths || 3;
    const tenantPayload = {
      id: `t-${order.slug}`,
      name: order.tenantName,
      slug: order.slug,
      ownerName: order.ownerName,
      phone: order.phone,
      telegram: order.telegram,
      email: order.email || '',
      planMonths: months,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + months * 30 * 24 * 3600 * 1000).toISOString(),
      status: 'active',
      adminUsername: order.adminUsername || 'admin',
      adminPasswordHash: order.adminPassword || '1111',
      settings: {
        name: order.tenantName,
        slogan: `${order.tenantName} — Mazali taomlar va a’lo xizmat`,
        bio: `${order.tenantName} — yangi tayyorlangan taomlar va qulay onlayn buyurtma xizmati.`,
        heroBadge: `${order.tenantName} — Rasmiy Onlayn Menyu`,
        heroTitle: `${order.tenantName} —`,
        heroHighlight: 'Nafis Ta’m va Yuqori Sifat',
        phone: order.phone,
        email: order.email || '',
        telegram: order.telegram || '',
        instagram: '',
        address: 'Toshkent shahri',
        stir: '',
        serviceFeePercent: 10,
        headerMessage: `${order.tenantName} ga xush kelibsiz!`,
        footerReceiptMessage: 'Tashrifingiz uchun minnatdormiz!',
        workingDays: 'Dushanba - Yakshanba:',
        workingHours: '09:00 - 23:00',
        specialHoursLabel: '',
        specialHoursValue: '',
        eventsTitle: '',
        eventsSchedule: '',
        aboutTitle: 'Sifat va Mehmondo‘stlik',
        aboutQuote: `«${order.tenantName}» — har bir taom mehr va yuqori sifat bilan tayyorlanadi.`,
        aboutDescription1: `${order.tenantName} mehmonlarimizga doimo eng sara mahsulotlardan tayyorlangan taomlar va tez xizmatni taqdim etadi.`,
        aboutDescription2: 'Onlayn menyu orqali bemalol tanlang va buyurtma bering.'
      },
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      await order.save();
      await TenantModel.findOneAndUpdate(
        { slug: order.slug },
        { $set: tenantPayload },
        { upsert: true, new: true }
      );

      // Clone starter dishes if none exist
      const existingMenuCount = await MenuItemModel.countDocuments({ tenantId: order.slug });
      if (existingMenuCount === 0) {
        for (const item of DEFAULT_MENU_ITEMS.slice(0, 10)) {
          await MenuItemModel.create({
            ...item,
            id: `${order.slug}-${item.id}`,
            tenantId: order.slug
          });
        }
      }

      // Clone starter tables
      const existingTableCount = await TableModel.countDocuments({ tenantId: order.slug });
      if (existingTableCount === 0) {
        await TableModel.create([
          { id: `${order.slug}-t1`, tenantId: order.slug, name: 'Stol 1', zone: 'Zal', capacity: 4, isActive: true },
          { id: `${order.slug}-t2`, tenantId: order.slug, name: 'Stol 2', zone: 'Zal', capacity: 2, isActive: true },
          { id: `${order.slug}-t3`, tenantId: order.slug, name: 'VIP Stol', zone: 'VIP', capacity: 8, isActive: true }
        ]);
      }
    } else {
      const idx = memoryStore.tenants.findIndex((t: any) => t.slug === order.slug);
      if (idx >= 0) memoryStore.tenants[idx] = tenantPayload;
      else memoryStore.tenants.push(tenantPayload);
    }

    broadcastRealtimeEvent('subscription:approved', { id, slug: order.slug });
    res.json({ success: true, order, tenant: tenantPayload });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subscription-orders/:id/reject', async (req, res) => {
  try {
    const id = req.params.id;
    const reason = req.body.reason || 'To‘lov cheki tasdiqlanmadi';
    if (isMongoConnected) {
      const updated = await SubscriptionOrderModel.findOneAndUpdate(
        { id },
        { $set: { status: 'rejected', rejectionReason: reason, reviewedAt: new Date().toISOString() } },
        { new: true }
      );
      return res.json(updated);
    }
    const order = memoryStore.subscriptionOrders.find((o: any) => o.id === id);
    if (order) {
      order.status = 'rejected';
      order.rejectionReason = reason;
    }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// E. Demo Reset Endpoint (Daily or manually by visitor/superadmin)
app.post('/api/demo/reset', async (req, res) => {
  try {
    if (isMongoConnected) {
      // Clear demo orders
      await OrderModel.deleteMany({ $or: [{ tenantId: 'demo' }, { tenantId: { $exists: false } }] });
      
      // Reset demo menu items safely using upsert
      for (const item of DEFAULT_MENU_ITEMS) {
        await MenuItemModel.findOneAndUpdate(
          { id: item.id },
          { $set: { ...item, tenantId: 'demo' } },
          { upsert: true }
        );
      }

      // Reset demo tables safely
      const demoTables = [
        { id: 'Stol #1 (Zal 1)', tenantId: 'demo', name: 'Stol 1', zone: 'Zal 1', capacity: 4, isActive: true, notes: 'Deraza oldi' },
        { id: 'Stol #2 (Zal 1)', tenantId: 'demo', name: 'Stol 2', zone: 'Zal 1', capacity: 2, isActive: true, notes: 'Kichik shinam stol' },
        { id: 'Stol #3 (Zal 1)', tenantId: 'demo', name: 'Stol 3', zone: 'Zal 1', capacity: 6, isActive: true, notes: 'Katta oilaviy stol' },
        { id: 'Stol #4 (Zal 1)', tenantId: 'demo', name: 'Stol 4', zone: 'Zal 1', capacity: 4, isActive: true, notes: 'Markaziy zal' },
        { id: 'Stol #5 (Zal 1)', tenantId: 'demo', name: 'Stol 5', zone: 'Zal 1', capacity: 4, isActive: true, notes: 'Markaziy zal' },
        { id: 'VIP Kabinet #1', tenantId: 'demo', name: 'VIP 1', zone: 'VIP', capacity: 10, isActive: true, notes: 'Alohida VIP xona va televizor' },
        { id: 'VIP Terrasa #2', tenantId: 'demo', name: 'VIP Terrasa', zone: 'Terrasa', capacity: 8, isActive: true, notes: 'Ochiq osmon ostidagi veranda' },
        { id: 'Bar stoli #3', tenantId: 'demo', name: 'Bar 3', zone: 'Bar', capacity: 2, isActive: true, notes: 'Barmen qarshisida' },
      ];
      for (const dt of demoTables) {
        await TableModel.findOneAndUpdate(
          { id: dt.id },
          { $set: dt },
          { upsert: true }
        );
      }
    } else {
      memoryStore.orders = [];
      memoryStore.menu = [...DEFAULT_MENU_ITEMS];
    }

    broadcastRealtimeEvent('demo:reset', { time: new Date().toISOString() });
    res.json({ success: true, message: 'Demo ma’lumotlari to‘liq qayta tiklandi' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// F. Tenant-Scoped Bootstrap (Loads isolated tenant data for customer menu & POS)
app.get('/api/tenant-bootstrap/:slug', async (req, res) => {
  try {
    const rawSlug = (req.params.slug || 'demo').toLowerCase().trim();
    let tenant: any = null;

    if (isMongoConnected) {
      tenant = await TenantModel.findOne({ slug: rawSlug }).lean();
    } else {
      tenant = memoryStore.tenants.find((t: any) => t.slug === rawSlug);
    }

    if (!tenant && rawSlug !== 'demo') {
      return res.status(404).json({ success: false, notFound: true, message: "Restoran topilmadi" });
    }

    const computedTenant = computeTenantStatus(tenant || {
      id: 't-demo',
      name: 'SAVORIA RESTAURANT (Demo)',
      slug: 'demo',
      status: 'active',
      planMonths: 12,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 86400000).toISOString(),
      adminUsername: 'demo',
      adminPasswordHash: '1111'
    });

    let menu: any[] = [];
    let orders: any[] = [];
    let tables: any[] = [];
    let reservations: any[] = [];
    let waiters: any[] = [];
    let couriers: any[] = [];
    let adminUsers: any[] = [];
    let dbSettings: any = null;
    let notifications: any[] = [];

    if (isMongoConnected) {
      // Find items scoped to this tenant
      const [m, o, t, r, w, c, n, s, adm] = await Promise.all([
        MenuItemModel.find({ tenantId: rawSlug }).lean(),
        OrderModel.find({ tenantId: rawSlug }).sort({ createdAt: -1 }).lean(),
        TableModel.find({ tenantId: rawSlug }).lean(),
        ReservationModel.find({ tenantId: rawSlug }).sort({ createdAt: -1 }).lean(),
        WaiterModel.find({ tenantId: rawSlug }).lean(),
        CourierModel.find({ tenantId: rawSlug }).lean(),
        NotificationModel.find({ tenantId: rawSlug }).sort({ timestamp: -1 }).limit(25).lean(),
        SettingsModel.findOne({ tenantId: rawSlug }).lean(),
        AdminUserModel.find({ tenantId: rawSlug }).lean()
      ]);

      menu = m;
      orders = o;
      tables = t;
      reservations = r;
      waiters = w;
      couriers = c;
      notifications = n;
      dbSettings = s;
      adminUsers = adm;

      // Auto-populate starter menu and tables if empty so the restaurant works immediately
      if (menu.length === 0 && rawSlug !== 'demo') {
        const starterItems = DEFAULT_MENU_ITEMS.slice(0, 10).map(it => ({
          ...it,
          id: `${rawSlug}-${it.id}`,
          tenantId: rawSlug
        }));
        await MenuItemModel.insertMany(starterItems);
        menu = starterItems;
      }

      if (tables.length === 0 && rawSlug !== 'demo') {
        const starterTables = [
          { id: `${rawSlug}-t1`, tenantId: rawSlug, name: 'Stol 1', zone: 'Zal', capacity: 4, isActive: true },
          { id: `${rawSlug}-t2`, tenantId: rawSlug, name: 'Stol 2', zone: 'Zal', capacity: 2, isActive: true },
          { id: `${rawSlug}-t3`, tenantId: rawSlug, name: 'VIP Stol', zone: 'VIP', capacity: 8, isActive: true }
        ];
        await TableModel.insertMany(starterTables);
        tables = starterTables;
      }
    } else {
      menu = memoryStore.menu.filter((m: any) => (m.tenantId || 'demo') === rawSlug);
      if (menu.length === 0) menu = memoryStore.menu;
      orders = memoryStore.orders.filter((o: any) => (o.tenantId || 'demo') === rawSlug);
      tables = memoryStore.tables.filter((t: any) => (t.tenantId || 'demo') === rawSlug);
      if (tables.length === 0) tables = memoryStore.tables;
      if (memoryStore.settings && (memoryStore.settings.tenantId || 'demo') === rawSlug) {
        dbSettings = memoryStore.settings;
      }
    }

    // Build tenant-isolated admin list so tenant owner can log in immediately
    if (adminUsers.length === 0 && computedTenant) {
      adminUsers = [{
        id: `adm-${rawSlug}`,
        tenantId: rawSlug,
        name: `${computedTenant.ownerName || computedTenant.name} (Admin)`,
        username: computedTenant.adminUsername || 'admin',
        passwordHash: computedTenant.adminPasswordHash || '1111',
        role: 'superadmin',
        createdAt: computedTenant.createdAt || new Date().toISOString()
      }];
    }

    // Build clean, white-labeled settings for this tenant (NO Savoria leaks for client tenants!)
    const tenantDefaults = rawSlug === 'demo'
      ? {
          name: 'SAVORIA RESTAURANT',
          slogan: 'Sharqona Mehmondo‘stlik & Yuksak Gastronomik San’at',
          bio: 'Toshkentning eng nufuzli milliy va premium restorani. Sharqona mehmondo‘stlik va yuksak gastronomiya san’ati.',
          heroBadge: 'Toshkentning eng nufuzli milliy & premium restorani',
          heroTitle: 'Sharqona Mehmondo‘stlik &',
          heroHighlight: 'Yuksak Gastronomik San’at',
          address: 'Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko\'chasi 45-uy',
          phone: '+998 71 200-71-12',
          email: 'lazizshavkatov712@gmail.com',
          stir: '309 814 552',
          serviceFeePercent: 12,
          headerMessage: 'Savoria Restoraniga xush kelibsiz!',
          footerReceiptMessage: 'Tashrifingiz uchun minnatdormiz! Yoqimli ishtaha tilaymiz.',
          wifiPassword: 'savoria_vip_guest',
          workingDays: 'Dushanba - Yakshanba:',
          workingHours: '10:00 - 23:30',
          specialHoursLabel: 'Osh va Tandir:',
          specialHoursValue: '11:30 dan',
          eventsTitle: 'Jonli Musiqa Oqshomi:',
          eventsSchedule: 'Juma - Yakshanba (19:30 - 23:00)',
          telegram: '@lazizshavkatov712',
          instagram: '@shavkatovv.o07',
          aboutTitle: 'Nafislik va Mehmondo‘stlik Makoni',
          aboutQuote: '«Savoria» — bu shunchaki dasturxon emas. Bu oila davrasi va yuksak gastronomiya san\'ati.',
          aboutDescription1: '2011-yildan buyon «Savoria» restorani Toshkent shahrida haqiqiy sharqona mehmondo\'stlikni namoyish etib kelmoqda.',
          aboutDescription2: 'Bizning maqsadimiz — har bir mehmonimizga unutilmas iliq xotiralar taqdim etishdir.'
        }
      : {
          name: computedTenant.name,
          slogan: `${computedTenant.name} — Mazali taomlar va sifatli xizmat`,
          bio: `${computedTenant.name} — shinam muhit, sara taomlar va tezkor xizmat maskani.`,
          heroBadge: `${computedTenant.name} — Rasmiy Menyu`,
          heroTitle: `${computedTenant.name} —`,
          heroHighlight: 'Betakror Ta’m va Yuqori Sifat',
          address: computedTenant.settings?.address || 'Toshkent shahri',
          phone: computedTenant.phone || '',
          email: computedTenant.email || '',
          stir: computedTenant.settings?.stir || '',
          serviceFeePercent: 10,
          headerMessage: `${computedTenant.name} ga xush kelibsiz!`,
          footerReceiptMessage: 'Tashrifingiz uchun minnatdormiz!',
          wifiPassword: '',
          workingDays: 'Dushanba - Yakshanba:',
          workingHours: '09:00 - 23:00',
          specialHoursLabel: '',
          specialHoursValue: '',
          eventsTitle: '',
          eventsSchedule: '',
          telegram: computedTenant.telegram || '',
          instagram: '',
          aboutTitle: 'Sifat va Mehmondo‘stlik Makoni',
          aboutQuote: `«${computedTenant.name}» — bu har bir taom mehr va yuksak mahorat bilan tayyorlanadigan maskan.`,
          aboutDescription1: `${computedTenant.name} jamoasi mehmonlarimizga doimo yangi va mazali taomlarni taqdim etishdan mamnun.`,
          aboutDescription2: 'Biz uchun har bir mehmonning roziligi va samimiy tabassumi eng oliy qadriyatdir.'
        };

    const mergedSettings = {
      ...tenantDefaults,
      ...(computedTenant.settings || {}),
      ...(dbSettings || {}),
      tenantId: rawSlug
    };

    res.json({
      success: true,
      tenant: computedTenant,
      mongoConnected: isMongoConnected,
      menu,
      orders,
      tables,
      reservations,
      waiters,
      couriers,
      adminUsers,
      settings: mergedSettings,
      notifications,
      serverTime: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

function getTenantId(req: express.Request): string {
  const raw = req.query?.tenantId || req.body?.tenantId || req.headers['x-tenant-id'] || 'demo';
  return String(raw).toLowerCase().trim() || 'demo';
}

function stripMongoInternalFields(obj: any): any {
  if (!obj || typeof obj !== 'object') return {};
  const { _id, __v, createdAt, updatedAt, ...rest } = obj;
  return rest;
}

// 3. Complete App Bootstrap (Single-roundtrip fast initialization scoped by tenantId)
app.get('/api/bootstrap', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    let menu = memoryStore.menu.filter((m: any) => (m.tenantId || 'demo') === tenantId);
    let orders = memoryStore.orders.filter((o: any) => (o.tenantId || 'demo') === tenantId);
    let tables = memoryStore.tables.filter((t: any) => (t.tenantId || 'demo') === tenantId);
    let reservations = memoryStore.reservations.filter((r: any) => (r.tenantId || 'demo') === tenantId);
    let waiters = memoryStore.waiters.filter((w: any) => (w.tenantId || 'demo') === tenantId);
    let couriers = memoryStore.couriers.filter((c: any) => (c.tenantId || 'demo') === tenantId);
    let settings = memoryStore.settings;
    let notifications = memoryStore.notifications.filter((n: any) => (n.tenantId || 'demo') === tenantId);

    if (isMongoConnected) {
      const [m, o, t, r, w, c, s, n] = await Promise.all([
        MenuItemModel.find({ tenantId }).lean(),
        OrderModel.find({ tenantId }).sort({ createdAt: -1 }).lean(),
        TableModel.find({ tenantId }).lean(),
        ReservationModel.find({ tenantId }).sort({ createdAt: -1 }).lean(),
        WaiterModel.find({ tenantId }).lean(),
        CourierModel.find({ tenantId }).lean(),
        SettingsModel.findOne({ tenantId }).lean(),
        NotificationModel.find({ tenantId }).sort({ timestamp: -1 }).limit(25).lean()
      ]);
      menu = m;
      orders = o;
      tables = t;
      reservations = r;
      waiters = w;
      couriers = c;
      settings = s || memoryStore.settings;
      notifications = n || memoryStore.notifications;
    }

    res.json({
      success: true,
      tenantId,
      mongoConnected: isMongoConnected,
      menu,
      orders,
      tables,
      reservations,
      waiters,
      couriers,
      settings,
      notifications,
      serverTime: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Menu Items CRUD (Tenant-Isolated & Real-Time Broadcast)
app.get('/api/menu', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    if (isMongoConnected) {
      const items = await MenuItemModel.find({ tenantId }).lean();
      return res.json(items);
    }
    res.json(memoryStore.menu.filter((m: any) => (m.tenantId || 'demo') === tenantId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const itemData = { ...stripMongoInternalFields(req.body), tenantId };
    let saved = itemData;

    if (isMongoConnected) {
      saved = await MenuItemModel.findOneAndUpdate(
        { id: itemData.id },
        { $set: itemData },
        { upsert: true, new: true }
      ).lean();
    } else {
      const idx = memoryStore.menu.findIndex(i => i.id === itemData.id);
      if (idx >= 0) memoryStore.menu[idx] = itemData;
      else memoryStore.menu.unshift(itemData);
    }

    broadcastRealtimeEvent('menu:created', saved);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = stripMongoInternalFields(req.body);
    let updated = null;

    if (isMongoConnected) {
      updated = await MenuItemModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    } else {
      const idx = memoryStore.menu.findIndex(i => i.id === id);
      if (idx >= 0) {
        memoryStore.menu[idx] = { ...memoryStore.menu[idx], ...updates };
        updated = memoryStore.menu[idx];
      }
    }

    if (updated) {
      broadcastRealtimeEvent('menu:updated', updated);
      return res.json(updated);
    }
    res.status(404).json({ error: 'Item not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = getTenantId(req);
    let existingTenantId = tenantId;
    if (isMongoConnected) {
      const existing = await MenuItemModel.findOne({ id }).lean();
      if (existing?.tenantId) existingTenantId = existing.tenantId;
      await MenuItemModel.deleteOne({ id });
    }
    memoryStore.menu = memoryStore.menu.filter(i => i.id !== id);

    broadcastRealtimeEvent('menu:deleted', { id, tenantId: existingTenantId });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Orders CRUD & Real-Time Notification System
app.get('/api/orders', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    if (isMongoConnected) {
      const orders = await OrderModel.find({ tenantId }).sort({ createdAt: -1 }).lean();
      return res.json(orders);
    }
    res.json(memoryStore.orders.filter((o: any) => (o.tenantId || 'demo') === tenantId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const orderData = { ...stripMongoInternalFields(req.body), tenantId };
    let saved = orderData;

    if (isMongoConnected) {
      saved = await OrderModel.findOneAndUpdate(
        { id: orderData.id },
        { $set: orderData },
        { upsert: true, new: true }
      ).lean();
    } else {
      const idx = memoryStore.orders.findIndex(o => o.id === orderData.id);
      if (idx >= 0) memoryStore.orders[idx] = orderData;
      else memoryStore.orders.unshift(orderData);
    }

    broadcastRealtimeEvent('order:created', saved);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = stripMongoInternalFields(req.body);
    let updated = null;

    if (isMongoConnected) {
      updated = await OrderModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    } else {
      const idx = memoryStore.orders.findIndex(o => o.id === id);
      if (idx >= 0) {
        memoryStore.orders[idx] = { ...memoryStore.orders[idx], ...updates };
        updated = memoryStore.orders[idx];
      }
    }

    if (updated) {
      broadcastRealtimeEvent('order:updated', updated);
      return res.json(updated);
    }
    res.status(404).json({ error: 'Order not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = getTenantId(req);
    let existingTenantId = tenantId;
    if (isMongoConnected) {
      const existing = await OrderModel.findOne({ id }).lean();
      if (existing?.tenantId) existingTenantId = existing.tenantId;
      await OrderModel.deleteOne({ id });
    }
    memoryStore.orders = memoryStore.orders.filter(o => o.id !== id);

    broadcastRealtimeEvent('order:deleted', { id, tenantId: existingTenantId });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Tables & Zones Management
app.get('/api/tables', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    if (isMongoConnected) {
      const tables = await TableModel.find({ tenantId }).lean();
      return res.json(tables);
    }
    res.json(memoryStore.tables.filter((t: any) => (t.tenantId || 'demo') === tenantId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tables', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const tableData = { ...stripMongoInternalFields(req.body), tenantId };
    let saved = tableData;
    if (isMongoConnected) {
      saved = await TableModel.findOneAndUpdate({ id: tableData.id }, { $set: tableData }, { upsert: true, new: true }).lean();
    } else {
      const idx = memoryStore.tables.findIndex(t => t.id === tableData.id);
      if (idx >= 0) memoryStore.tables[idx] = tableData;
      else memoryStore.tables.push(tableData);
    }
    broadcastRealtimeEvent('table:updated', saved);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = getTenantId(req);
    let existingTenantId = tenantId;
    if (isMongoConnected) {
      const existing = await TableModel.findOne({ id }).lean();
      if (existing?.tenantId) existingTenantId = existing.tenantId;
      await TableModel.deleteOne({ id });
    }
    memoryStore.tables = memoryStore.tables.filter(t => t.id !== id);
    broadcastRealtimeEvent('table:deleted', { id, tenantId: existingTenantId });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Reservations Endpoints
app.get('/api/reservations', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    if (isMongoConnected) {
      const resList = await ReservationModel.find({ tenantId }).sort({ createdAt: -1 }).lean();
      return res.json(resList);
    }
    res.json(memoryStore.reservations.filter((r: any) => (r.tenantId || 'demo') === tenantId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const resData = { ...stripMongoInternalFields(req.body), tenantId };
    let saved = resData;
    if (isMongoConnected) {
      saved = await ReservationModel.findOneAndUpdate({ id: resData.id }, { $set: resData }, { upsert: true, new: true }).lean();
    } else {
      memoryStore.reservations.unshift(resData);
    }
    broadcastRealtimeEvent('reservation:created', saved);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = stripMongoInternalFields(req.body);
    let updated = null;
    if (isMongoConnected) {
      updated = await ReservationModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    } else {
      const idx = memoryStore.reservations.findIndex(r => r.id === id);
      if (idx >= 0) {
        memoryStore.reservations[idx] = { ...memoryStore.reservations[idx], ...updates };
        updated = memoryStore.reservations[idx];
      }
    }
    if (updated) {
      broadcastRealtimeEvent('reservation:updated', updated);
      return res.json(updated);
    }
    res.status(404).json({ error: 'Reservation not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) await ReservationModel.deleteOne({ id });
    memoryStore.reservations = memoryStore.reservations.filter(r => r.id !== id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Waiter Call Buzzer (Real-Time table alert)
app.post('/api/waiter-call', (req, res) => {
  const { table, timestamp } = req.body;
  const tenantId = getTenantId(req);
  const alertData = {
    tenantId,
    table: table || 'Stol',
    timestamp: timestamp || Date.now()
  };
  broadcastRealtimeEvent('waiter_call:created', alertData);
  res.json({ success: true, alert: alertData });
});

// 8b. Admin Real-Time Push Notification Dispatcher
app.post('/api/realtime/broadcast-notification', async (req, res) => {
  try {
    const { title, message, target, targetTable, priority, sender } = req.body;
    const tenantId = getTenantId(req);
    const notif = {
      id: `push-${Date.now()}`,
      tenantId,
      title: title || 'Admin Bildirishnomasi',
      message: message || '',
      target: target || 'all',
      targetTable: targetTable || '',
      priority: priority || 'normal',
      sender: sender || 'Administrator',
      timestamp: Date.now()
    };

    if (isMongoConnected) {
      await NotificationModel.create(notif);
    } else {
      memoryStore.notifications.unshift(notif);
      if (memoryStore.notifications.length > 50) memoryStore.notifications.pop();
    }

    broadcastRealtimeEvent('admin:push_notification', notif);
    res.json({ success: true, notification: notif });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    if (isMongoConnected) {
      const list = await NotificationModel.find({ tenantId }).sort({ timestamp: -1 }).limit(30).lean();
      return res.json(list);
    }
    res.json(memoryStore.notifications.filter((n: any) => (n.tenantId || 'demo') === tenantId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Staff & Couriers
app.get('/api/waiters', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    if (isMongoConnected) {
      const waiters = await WaiterModel.find({ tenantId }).lean();
      return res.json(waiters);
    }
    res.json(memoryStore.waiters.filter((w: any) => (w.tenantId || 'demo') === tenantId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/waiters', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const waiter = { ...stripMongoInternalFields(req.body), tenantId };
    let saved = waiter;
    if (isMongoConnected) {
      saved = await WaiterModel.findOneAndUpdate({ id: waiter.id }, { $set: waiter }, { upsert: true, new: true }).lean();
    } else {
      const idx = memoryStore.waiters.findIndex(w => w.id === waiter.id);
      if (idx >= 0) memoryStore.waiters[idx] = waiter;
      else memoryStore.waiters.push(waiter);
    }
    broadcastRealtimeEvent('waiter:updated', saved);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/waiters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = getTenantId(req);
    if (isMongoConnected) await WaiterModel.deleteOne({ id });
    memoryStore.waiters = memoryStore.waiters.filter(w => w.id !== id);
    broadcastRealtimeEvent('waiter:deleted', { id, tenantId });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/couriers', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    if (isMongoConnected) {
      const couriers = await CourierModel.find({ tenantId }).lean();
      return res.json(couriers);
    }
    res.json(memoryStore.couriers.filter((c: any) => (c.tenantId || 'demo') === tenantId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/couriers', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const courier = { ...stripMongoInternalFields(req.body), tenantId };
    let saved = courier;
    if (isMongoConnected) {
      saved = await CourierModel.findOneAndUpdate({ id: courier.id }, { $set: courier }, { upsert: true, new: true }).lean();
    } else {
      const idx = memoryStore.couriers.findIndex(c => c.id === courier.id);
      if (idx >= 0) memoryStore.couriers[idx] = courier;
      else memoryStore.couriers.push(courier);
    }
    broadcastRealtimeEvent('courier:updated', saved);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/couriers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = getTenantId(req);
    if (isMongoConnected) await CourierModel.deleteOne({ id });
    memoryStore.couriers = memoryStore.couriers.filter(c => c.id !== id);
    broadcastRealtimeEvent('courier:deleted', { id, tenantId });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Settings & Admins (Tenant-Scoped!)
app.get('/api/settings', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    if (isMongoConnected) {
      const s = await SettingsModel.findOne({ tenantId }).lean();
      if (s) return res.json(s);
      const t = await TenantModel.findOne({ slug: tenantId }).lean();
      if (t?.settings) return res.json({ ...t.settings, tenantId });
    }
    const memT = memoryStore.tenants.find((t: any) => t.slug === tenantId);
    if (memT?.settings) return res.json({ ...memT.settings, tenantId });
    res.json(memoryStore.settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const cleanSettings = stripMongoInternalFields(req.body);
    cleanSettings.tenantId = tenantId;
    let saved: any = cleanSettings;

    if (isMongoConnected) {
      saved = await SettingsModel.findOneAndUpdate(
        { tenantId },
        { $set: cleanSettings },
        { upsert: true, new: true }
      ).lean();

      const tenantUpdates: Record<string, any> = {
        settings: cleanSettings
      };
      if (cleanSettings.name) tenantUpdates.name = cleanSettings.name;
      if (cleanSettings.phone !== undefined) tenantUpdates.phone = cleanSettings.phone;
      if (cleanSettings.email !== undefined) tenantUpdates.email = cleanSettings.email;
      if (cleanSettings.telegram !== undefined) tenantUpdates.telegram = cleanSettings.telegram;

      await TenantModel.findOneAndUpdate(
        { slug: tenantId },
        { $set: tenantUpdates }
      );
    } else {
      if (tenantId === 'demo') {
        memoryStore.settings = cleanSettings;
      }
      const idx = memoryStore.tenants.findIndex((t: any) => t.slug === tenantId);
      if (idx >= 0) {
        memoryStore.tenants[idx] = {
          ...memoryStore.tenants[idx],
          name: cleanSettings.name || memoryStore.tenants[idx].name,
          phone: cleanSettings.phone ?? memoryStore.tenants[idx].phone,
          email: cleanSettings.email ?? memoryStore.tenants[idx].email,
          telegram: cleanSettings.telegram ?? memoryStore.tenants[idx].telegram,
          settings: cleanSettings
        };
      }
    }

    broadcastRealtimeEvent('settings:updated', { ...saved, tenantId });
    res.json({ ...saved, tenantId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admins', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    if (isMongoConnected) {
      const admins = await AdminUserModel.find({ tenantId }).lean();
      return res.json(admins);
    }
    res.json(memoryStore.admins.filter((a: any) => (a.tenantId || 'demo') === tenantId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admins', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const admin = { ...stripMongoInternalFields(req.body), tenantId };
    let saved = admin;
    if (isMongoConnected) {
      saved = await AdminUserModel.findOneAndUpdate({ id: admin.id }, { $set: admin }, { upsert: true, new: true }).lean();
    } else {
      const idx = memoryStore.admins.findIndex(a => a.id === admin.id);
      if (idx >= 0) memoryStore.admins[idx] = admin;
      else memoryStore.admins.push(admin);
    }
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Centralized Real-Time Analytics API
app.get('/api/analytics', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    let orders: any[] = [];
    if (isMongoConnected) {
      orders = await OrderModel.find({ tenantId }).lean();
    } else {
      orders = memoryStore.orders.filter((o: any) => (o.tenantId || 'demo') === tenantId);
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const paidOrders = orders.filter(o => o.isPaid || o.status === 'yopildi');
    const todayOrders = orders.filter(o => (o.createdAt || '').slice(0, 10) === todayStr);
    const todayPaidOrders = todayOrders.filter(o => o.isPaid || o.status === 'yopildi');

    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const avgCheck = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    const deliveryOrders = orders.filter(o => o.type === 'dostavka');
    const dineInOrders = orders.filter(o => o.type === 'zal');

    res.json({
      totalOrders: orders.length,
      paidOrdersCount: paidOrders.length,
      openOrdersCount: orders.length - paidOrders.length,
      totalRevenue,
      todayRevenue,
      todayOrdersCount: todayOrders.length,
      avgCheck,
      deliveryCount: deliveryOrders.length,
      dineInCount: dineInOrders.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11b. Sales Dashboard Aggregated Analytics (For Recharts Visualizations)
app.get('/api/analytics/sales-dashboard', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    let orders: any[] = [];
    let menu: any[] = [];
    if (isMongoConnected) {
      const [o, m] = await Promise.all([
        OrderModel.find({ tenantId }).lean(),
        MenuItemModel.find({ tenantId }).lean()
      ]);
      orders = o;
      menu = m;
    } else {
      orders = memoryStore.orders.filter((o: any) => (o.tenantId || 'demo') === tenantId);
      menu = memoryStore.menu.filter((m: any) => (m.tenantId || 'demo') === tenantId);
    }

    const paidOrders = orders.filter(o => o.isPaid || o.status === 'yopildi');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const totalOrdersCount = orders.length;
    const avgCheck = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayPaid = paidOrders.filter(o => (o.createdAt || '').slice(0, 10) === todayStr);
    const thisWeekPaid = paidOrders.filter(o => new Date(o.createdAt || 0) >= oneWeekAgo);
    const thisMonthPaid = paidOrders.filter(o => new Date(o.createdAt || 0) >= startOfMonth);

    const todayRevenue = todayPaid.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const thisWeekRevenue = thisWeekPaid.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const thisMonthRevenue = thisMonthPaid.reduce((sum, o) => sum + (o.finalTotal || 0), 0);

    const monthNamesUz = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const dailyMap = new Map<string, { date: string; fullDate: string; daromad: number; buyurtmalar: number; zal: number; dostavka: number; avgCheck: number }>();

    for (let i = 9; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const iso = d.toISOString().slice(0, 10);
      const label = `${d.getDate()}-${monthNamesUz[d.getMonth()]}`;
      const baselineOrders = tenantId === 'demo' ? Math.floor(18 + Math.sin(i * 1.5) * 8 + (d.getDay() === 0 || d.getDay() === 6 ? 12 : 0)) : 0;
      const baselineRevenue = baselineOrders * 125000;
      dailyMap.set(iso, {
        date: label,
        fullDate: iso,
        daromad: baselineRevenue,
        buyurtmalar: baselineOrders,
        zal: Math.round(baselineRevenue * 0.72),
        dostavka: Math.round(baselineRevenue * 0.28),
        avgCheck: baselineOrders > 0 ? 125000 : 0
      });
    }

    for (const ord of paidOrders) {
      const iso = (ord.createdAt || '').slice(0, 10);
      if (dailyMap.has(iso)) {
        const item = dailyMap.get(iso)!;
        item.daromad += (ord.finalTotal || 0);
        item.buyurtmalar += 1;
        if (ord.type === 'dostavka') {
          item.dostavka += (ord.finalTotal || 0);
        } else {
          item.zal += (ord.finalTotal || 0);
        }
        item.avgCheck = Math.round(item.daromad / Math.max(1, item.buyurtmalar));
      }
    }
    const dailyTrends = Array.from(dailyMap.values());

    const isDemo = tenantId === 'demo';
    const monthlyTrends = isDemo
      ? [
          { month: 'May', daromad: 38500000, buyurtmalar: 310, zal: 27500000, dostavka: 11000000, sofFoyda: 16170000 },
          { month: 'Iyun', daromad: 42100000, buyurtmalar: 345, zal: 29800000, dostavka: 12300000, sofFoyda: 17682000 },
          { month: 'Iyul', daromad: 46800000, buyurtmalar: 390, zal: 33200000, dostavka: 13600000, sofFoyda: 19656000 },
          { month: 'Avgust', daromad: 51200000, buyurtmalar: 420, zal: 36800000, dostavka: 14400000, sofFoyda: 21504000 },
          { month: 'Sentabr', daromad: 47900000, buyurtmalar: 388, zal: 34100000, dostavka: 13800000, sofFoyda: 20118000 },
          { month: 'Oktabr', daromad: 54600000 + Math.round(totalRevenue * 0.6), buyurtmalar: 452 + orders.length, zal: 39200000, dostavka: 15400000, sofFoyda: 22932000 },
          { month: 'Noyabr', daromad: Math.max(12800000, totalRevenue), buyurtmalar: Math.max(94, orders.length), zal: Math.round(Math.max(12800000, totalRevenue) * 0.74), dostavka: Math.round(Math.max(12800000, totalRevenue) * 0.26), sofFoyda: Math.round(Math.max(12800000, totalRevenue) * 0.42) }
        ]
      : [
          { month: monthNamesUz[now.getMonth()], daromad: totalRevenue, buyurtmalar: orders.length, zal: paidOrders.filter(o => o.type === 'zal').reduce((s, o) => s + (o.finalTotal || 0), 0), dostavka: paidOrders.filter(o => o.type === 'dostavka').reduce((s, o) => s + (o.finalTotal || 0), 0), sofFoyda: Math.round(totalRevenue * 0.4) }
        ];

    const zalSum = paidOrders.filter(o => o.type === 'zal').reduce((s, o) => s + (o.finalTotal || 0), 0) + (isDemo ? 38400000 : 0);
    const dostavkaSum = paidOrders.filter(o => o.type === 'dostavka').reduce((s, o) => s + (o.finalTotal || 0), 0) + (isDemo ? 14200000 : 0);
    const olibKetishSum = paidOrders.filter(o => o.type === 'olib_ketish').reduce((s, o) => s + (o.finalTotal || 0), 0) + (isDemo ? 4800000 : 0);
    const grandChannelsTotal = Math.max(1, zalSum + dostavkaSum + olibKetishSum);

    const channelDistribution = [
      { name: 'Zal (Restoran)', value: zalSum, count: paidOrders.filter(o => o.type === 'zal').length + (isDemo ? 320 : 0), percentage: Math.round((zalSum / grandChannelsTotal) * 100), color: '#d4af37' },
      { name: 'Yetkazib berish (Dostavka)', value: dostavkaSum, count: paidOrders.filter(o => o.type === 'dostavka').length + (isDemo ? 140 : 0), percentage: Math.round((dostavkaSum / grandChannelsTotal) * 100), color: '#0ea5e9' },
      { name: 'Olib ketish (Takeaway)', value: olibKetishSum, count: paidOrders.filter(o => o.type === 'olib_ketish').length + (isDemo ? 48 : 0), percentage: Math.round((olibKetishSum / grandChannelsTotal) * 100), color: '#10b981' }
    ];

    const cardSum = paidOrders.filter(o => o.paymentMethod === 'uzcard_humo').reduce((s, o) => s + (o.finalTotal || 0), 0) + (isDemo ? 29400000 : 0);
    const onlineSum = paidOrders.filter(o => o.paymentMethod === 'payme_click').reduce((s, o) => s + (o.finalTotal || 0), 0) + (isDemo ? 18200000 : 0);
    const cashSum = paidOrders.filter(o => o.paymentMethod === 'naqd').reduce((s, o) => s + (o.finalTotal || 0), 0) + (isDemo ? 9800000 : 0);
    const grandPayTotal = Math.max(1, cardSum + onlineSum + cashSum);

    const paymentDistribution = [
      { name: 'Uzcard / Humo', value: cardSum, percentage: Math.round((cardSum / grandPayTotal) * 100), color: '#3b82f6' },
      { name: 'Payme / Click', value: onlineSum, percentage: Math.round((onlineSum / grandPayTotal) * 100), color: '#10b981' },
      { name: 'Naqd Pul', value: cashSum, percentage: Math.round((cashSum / grandPayTotal) * 100), color: '#f59e0b' }
    ];

    const hourlyTrends = isDemo
      ? [
          { hour: '11:00', tushum: 850000, buyurtmalar: 7 },
          { hour: '12:00', tushum: 2450000, buyurtmalar: 19 },
          { hour: '13:00', tushum: 4890000, buyurtmalar: 36 },
          { hour: '14:00', tushum: 3120000, buyurtmalar: 24 },
          { hour: '15:00', tushum: 1450000, buyurtmalar: 11 },
          { hour: '16:00', tushum: 1100000, buyurtmalar: 9 },
          { hour: '17:00', tushum: 1950000, buyurtmalar: 15 },
          { hour: '18:00', tushum: 4200000, buyurtmalar: 31 },
          { hour: '19:00', tushum: 7650000, buyurtmalar: 58 },
          { hour: '20:00', tushum: 8900000, buyurtmalar: 64 },
          { hour: '21:00', tushum: 6450000, buyurtmalar: 45 },
          { hour: '22:00', tushum: 3200000, buyurtmalar: 22 },
          { hour: '23:00', tushum: 1250000, buyurtmalar: 9 }
        ]
      : ['11:00', '13:00', '15:00', '17:00', '19:00', '21:00', '23:00'].map(h => ({ hour: h, tushum: 0, buyurtmalar: 0 }));

    const itemMap = new Map<string, { name: string; category: string; quantity: number; revenue: number }>();
    for (const ord of paidOrders) {
      if (Array.isArray(ord.items)) {
        for (const it of ord.items) {
          const key = it.name || it.itemId;
          if (!itemMap.has(key)) {
            itemMap.set(key, { name: key, category: it.station || 'oshxona', quantity: 0, revenue: 0 });
          }
          const rec = itemMap.get(key)!;
          rec.quantity += (it.quantity || 1);
          rec.revenue += ((it.price || 0) * (it.quantity || 1));
        }
      }
    }

    const defaultTopDishes = isDemo
      ? [
          { name: 'To‘y Oshi (Savoria Maxsus Osh)', category: 'milliy', quantity: 184, revenue: 12512000 },
          { name: 'Tandir Qozon Kabob', category: 'milliy', quantity: 126, revenue: 11970000 },
          { name: 'G‘ijduvoncha Qiyma Shashlik', category: 'shashlik', quantity: 240, revenue: 7680000 },
          { name: 'Wagyu Ribeye Steyk', category: 'steak', quantity: 38, revenue: 13680000 },
          { name: 'Turkcha Pista Paxlava', category: 'shirinliklar', quantity: 142, revenue: 7810000 },
          { name: 'San-Sebastian Cheesecake', category: 'shirinliklar', quantity: 118, revenue: 8260000 }
        ]
      : menu.slice(0, 5).map((m: any) => ({ name: m.name, category: m.category, quantity: 0, revenue: 0 }));

    const mergedDishes = (itemMap.size > 0 && !isDemo
      ? Array.from(itemMap.values())
      : defaultTopDishes.map(d => {
          const live = itemMap.get(d.name);
          if (live) {
            return {
              ...d,
              quantity: d.quantity + live.quantity,
              revenue: d.revenue + live.revenue
            };
          }
          return d;
        })
    ).sort((a, b) => b.revenue - a.revenue);

    res.json({
      success: true,
      tenantId,
      timestamp: new Date().toISOString(),
      kpis: {
        totalRevenue: totalRevenue + (isDemo ? 57400000 : 0),
        todayRevenue: todayRevenue > 0 ? todayRevenue : (isDemo ? 4850000 : 0),
        thisWeekRevenue: thisWeekRevenue > 0 ? thisWeekRevenue : (isDemo ? 32400000 : 0),
        thisMonthRevenue: thisMonthRevenue > 0 ? thisMonthRevenue : (isDemo ? 54600000 : 0),
        totalOrdersCount: totalOrdersCount + (isDemo ? 512 : 0),
        todayOrdersCount: todayPaid.length > 0 ? todayPaid.length : (isDemo ? 38 : 0),
        avgCheck: avgCheck > 0 ? avgCheck : (isDemo ? 142000 : 0),
        growthPercentage: 18.4,
        profitMarginRate: 42
      },
      dailyTrends,
      monthlyTrends,
      channelDistribution,
      paymentDistribution,
      hourlyTrends,
      topDishes: mergedDishes
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Safe Bulk Sync Endpoint (Tenant-Scoped)
app.post('/api/sync-all', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { orders, menuItems, waiters, couriers, adminUsers, settings, tables, reservations } = req.body;
    let syncedCount = 0;

    if (isMongoConnected) {
      if (Array.isArray(orders) && orders.length > 0) {
        for (const o of orders) {
          if (!o || !o.id) continue;
          await OrderModel.findOneAndUpdate({ id: o.id }, { $set: { ...stripMongoInternalFields(o), tenantId } }, { upsert: true });
          syncedCount++;
        }
      }
      if (Array.isArray(menuItems) && menuItems.length > 0) {
        for (const item of menuItems) {
          if (!item || !item.id) continue;
          await MenuItemModel.findOneAndUpdate({ id: item.id }, { $set: { ...stripMongoInternalFields(item), tenantId } }, { upsert: true });
          syncedCount++;
        }
      }
      if (Array.isArray(tables) && tables.length > 0) {
        for (const tbl of tables) {
          if (!tbl || !tbl.id) continue;
          await TableModel.findOneAndUpdate({ id: tbl.id }, { $set: { ...stripMongoInternalFields(tbl), tenantId } }, { upsert: true });
        }
      }
      if (Array.isArray(reservations) && reservations.length > 0) {
        for (const r of reservations) {
          if (!r || !r.id) continue;
          await ReservationModel.findOneAndUpdate({ id: r.id }, { $set: { ...stripMongoInternalFields(r), tenantId } }, { upsert: true });
        }
      }
      if (Array.isArray(waiters) && waiters.length > 0) {
        for (const w of waiters) {
          if (!w || !w.id) continue;
          await WaiterModel.findOneAndUpdate({ id: w.id }, { $set: { ...stripMongoInternalFields(w), tenantId } }, { upsert: true });
        }
      }
      if (Array.isArray(couriers) && couriers.length > 0) {
        for (const c of couriers) {
          if (!c || !c.id) continue;
          await CourierModel.findOneAndUpdate({ id: c.id }, { $set: { ...stripMongoInternalFields(c), tenantId } }, { upsert: true });
        }
      }
      if (Array.isArray(adminUsers) && adminUsers.length > 0) {
        for (const a of adminUsers) {
          if (!a || !a.id) continue;
          await AdminUserModel.findOneAndUpdate({ id: a.id }, { $set: { ...stripMongoInternalFields(a), tenantId } }, { upsert: true });
        }
      }
      if (settings && typeof settings === 'object') {
        const cleanS = { ...stripMongoInternalFields(settings), tenantId };
        await SettingsModel.findOneAndUpdate({ tenantId }, { $set: cleanS }, { upsert: true });
        await TenantModel.findOneAndUpdate({ slug: tenantId }, { $set: { settings: cleanS } });
      }

      return res.json({ 
        success: true, 
        mongoConnected: true, 
        syncedCount, 
        message: "Ma'lumotlar MongoDB Atlas markaziy bazasiga sinxronizatsiya qilindi" 
      });
    }

    res.json({ success: true, mongoConnected: false, message: "Lokal rejimda saqlandi" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Two-Way Instant Full Sync (Tenant-Scoped)
app.post('/api/sync/full', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { localOrders = [], localMenuItems = [] } = req.body;
    let syncedOrders = localOrders;
    let syncedMenu = localMenuItems;

    if (isMongoConnected) {
      if (Array.isArray(localOrders) && localOrders.length > 0) {
        for (const o of localOrders) {
          if (!o || !o.id) continue;
          await OrderModel.findOneAndUpdate({ id: o.id }, { $set: { ...stripMongoInternalFields(o), tenantId } }, { upsert: true, new: true });
        }
      }

      if (Array.isArray(localMenuItems) && localMenuItems.length > 0) {
        for (const it of localMenuItems) {
          if (!it || !it.id) continue;
          await MenuItemModel.findOneAndUpdate({ id: it.id }, { $set: { ...stripMongoInternalFields(it), tenantId } }, { upsert: true, new: true });
        }
      }

      syncedOrders = await OrderModel.find({ tenantId }).sort({ createdAt: -1 }).lean();
      syncedMenu = await MenuItemModel.find({ tenantId }).lean();
    } else {
      if (Array.isArray(localOrders)) {
        localOrders.forEach((lo: any) => {
          if (!lo || !lo.id) return;
          const itemWithTenant = { ...lo, tenantId };
          const idx = memoryStore.orders.findIndex(o => o.id === lo.id);
          if (idx >= 0) memoryStore.orders[idx] = itemWithTenant;
          else memoryStore.orders.unshift(itemWithTenant);
        });
      }
      syncedOrders = memoryStore.orders.filter((o: any) => (o.tenantId || 'demo') === tenantId);
      syncedMenu = memoryStore.menu.filter((m: any) => (m.tenantId || 'demo') === tenantId);
    }

    broadcastRealtimeEvent('orders:synced', { tenantId, orders: syncedOrders, menu: syncedMenu });

    res.json({
      success: true,
      tenantId,
      mongoConnected: isMongoConnected,
      orders: syncedOrders,
      menu: syncedMenu
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function start() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SAVORIA RESTAURANT markaziy real-time server ishga tushdi: http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  start();
}

export default app;
