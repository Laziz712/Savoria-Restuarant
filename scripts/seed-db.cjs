const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const menuItemsData = [
  {
    id: 'm-1',
    name: 'To‘y Oshi (Savoria Maxsus Osh)',
    category: 'milliy',
    price: 68000,
    description: 'Barra qo‘zichoq go‘shti, lazer guruch, shirin sariq sabzi, no‘xat, mayiz, qazi va bedana tuxumlari bilan shohona damlangan milliy osh.',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80',
    prepTimeMinutes: 18,
    isAvailable: true,
    station: 'oshxona',
    calories: 890,
    weightGrams: 450,
    isChefSpecial: true
  },
  {
    id: 'm-2',
    name: 'Tandir Qozon Kabob',
    category: 'milliy',
    price: 95000,
    description: 'Qo‘zichoq qovurg‘alari va oltinrang qovurilgan kartoshkalar. Ziravorlar bilan qozonda maxsus dimlangan.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    prepTimeMinutes: 25,
    isAvailable: true,
    station: 'issiq',
    calories: 1050,
    weightGrams: 500,
    isChefSpecial: true
  },
  {
    id: 'm-3',
    name: 'Wagyu Ribeye Steyk (A5)',
    category: 'asosiy',
    price: 240000,
    description: 'Yapon marmar Wagyu mol go‘shti, rozmarinli sariyog‘ va qizdirilgan sarimsoq bilan mangalda qovurilgan.',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&auto=format&fit=crop&q=80',
    prepTimeMinutes: 20,
    isAvailable: true,
    station: 'mangal',
    calories: 820,
    weightGrams: 350,
    isChefSpecial: true
  },
  {
    id: 'm-4',
    name: 'G‘ijduvoncha Qiyma Shashlik',
    category: 'milliy',
    price: 28000,
    description: 'Mayin maydalangan go‘sht, maxsus ziravorlar va piyoz bilan mangalda pishirilgan haqiqiy Buxoro shashligi.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    prepTimeMinutes: 15,
    isAvailable: true,
    station: 'mangal',
    calories: 360,
    weightGrams: 150,
    isChefSpecial: false
  },
  {
    id: 'm-5',
    name: 'Norin & Qazi Assorti',
    category: 'milliy',
    price: 55000,
    description: 'Qo‘lda mayda qilib kesilgan mayin xamir va ot go‘shti, ustiga barra qazi va xushbo‘y bulon.',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80',
    prepTimeMinutes: 10,
    isAvailable: true,
    station: 'sovuq',
    calories: 520,
    weightGrams: 300,
    isChefSpecial: false
  },
  {
    id: 'm-6',
    name: 'Kuzovcha Ko‘za Sho‘rva',
    category: 'shorvalar',
    price: 48000,
    description: 'Maxsus loy ko‘zada barra go‘sht, no‘xat, sabzavotlar va tabiiy ziravorlar bilan 3 soat dimlangan tiniq sho‘rva.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80',
    prepTimeMinutes: 12,
    isAvailable: true,
    station: 'issiq',
    calories: 460,
    weightGrams: 400,
    isChefSpecial: false
  },
  {
    id: 'm-7',
    name: 'Tom Yum Dengiz Mahsulotlari',
    category: 'shorvalar',
    price: 88000,
    description: 'Katta krevetkalar, midiya, kalamar, laym va kokos suti bilan tayyorlangan nordon-achchiq shohona sho‘rva.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
    prepTimeMinutes: 18,
    isAvailable: true,
    station: 'issiq',
    calories: 410,
    weightGrams: 400,
    isChefSpecial: true
  },
  {
    id: 'm-8',
    name: 'Burrata & Pishgan Pomidor Salati',
    category: 'salatlar',
    price: 68000,
    description: 'Italiya burrata pishlog‘i, shirin pomidorlar, yangi rayhon va pesto sousi bilan.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    prepTimeMinutes: 10,
    isAvailable: true,
    station: 'sovuq',
    calories: 380,
    weightGrams: 280,
    isChefSpecial: true
  },
  {
    id: 'm-9',
    name: 'Achchiq-Chuchuk (Anor Donalari Bilan)',
    category: 'salatlar',
    price: 24000,
    description: 'Yupqa to‘g‘ralgan Yuqori Chirchiq pomidorlari, shirin piyoz, anor sharbati va yangi rayhon.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    prepTimeMinutes: 8,
    isAvailable: true,
    station: 'sovuq',
    calories: 120,
    weightGrams: 220,
    isChefSpecial: false
  },
  {
    id: 'm-10',
    name: 'Savoria Maxsus Marokko Kokteyli',
    category: 'ichimliklar',
    price: 36000,
    description: 'Yangi apelsin, yalpiz, dolchin, laym va qulupnay sharbatidan tayyorlangan salqinlashtiruvchi premium ichimlik.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    prepTimeMinutes: 6,
    isAvailable: true,
    station: 'bar',
    calories: 140,
    weightGrams: 450,
    isChefSpecial: true
  },
  {
    id: 'm-11',
    name: 'Qumda Pishirilgan Turk Qahvasi',
    category: 'qahva_choy',
    price: 22000,
    description: 'Arabica qahva donalaridan issiq qumda tayyorlangan an’anaviy turk qahvasi. Lokum bilan beriladi.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    prepTimeMinutes: 5,
    isAvailable: true,
    station: 'bar',
    calories: 45,
    weightGrams: 100,
    isChefSpecial: false
  },
  {
    id: 'm-12',
    name: 'San Sebastian Kuygan Chizkeyk',
    category: 'desertlar',
    price: 44000,
    description: 'Ispaniya retsepti asosida pishirilgan mayin qaymoqli chizkeyk. Issiq Belgiya shokoladi bilan birga tortiladi.',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80',
    prepTimeMinutes: 5,
    isAvailable: true,
    station: 'desert',
    calories: 490,
    weightGrams: 180,
    isChefSpecial: true
  }
];

const waitersData = [
  { id: 'w-1', name: 'Sardor Alimov', phone: '+998 90 123 45 67', assignedZone: 'Zal 1', status: 'bosh', ordersServedToday: 14, rating: 4.9, pinPassword: '••••' },
  { id: 'w-2', name: 'Madina Karimova', phone: '+998 93 234 56 78', assignedZone: 'VIP Zal', status: 'band', ordersServedToday: 18, rating: 5.0, pinPassword: '••••' },
  { id: 'w-3', name: 'Bobur Mirzayev', phone: '+998 97 345 67 89', assignedZone: 'Terrasa', status: 'bosh', ordersServedToday: 11, rating: 4.8, pinPassword: '••••' },
  { id: 'w-4', name: 'Jasur Usmonov', phone: '+998 99 456 78 90', assignedZone: 'Zal 2', status: 'bosh', ordersServedToday: 9, rating: 4.7, pinPassword: '••••' }
];

const couriersData = [
  { id: 'c-1', name: 'Farhod Rahimov', phone: '+998 93 111 22 33', vehicle: 'skuter', status: 'bosh', activeOrdersCount: 0, rating: 4.9 },
  { id: 'c-2', name: 'Ulug‘bek Toshmatov', phone: '+998 90 222 33 44', vehicle: 'avto (Matiz)', status: 'yetkazmoqda', activeOrdersCount: 1, rating: 4.8 },
  { id: 'c-3', name: 'Sanjar Qodirov', phone: '+998 94 333 44 55', vehicle: 'skuter', status: 'bosh', activeOrdersCount: 0, rating: 4.9 }
];

const adminUsersData = [
  { id: 'u-1', username: 'laziz712', password: '••••••••', fullName: 'Bosh Menejer Laziz', role: 'superadmin', createdAt: '2026-01-15' },
  { id: 'u-2', username: 'kassa', password: '••••••••', fullName: 'Katta Kassir Gulnoza', role: 'cashier', createdAt: '2026-02-01' }
];

const settingsData = {
  name: 'SAVORIA RESTAURANT',
  slogan: 'Premium Gastronomiya va Sharqona mehmondo‘stlik',
  address: 'Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko\'chasi 45-uy',
  phone: '+998 71 200-71-12',
  stir: '309 814 552',
  serviceFeePercent: 12,
  headerMessage: 'SAVORIA RESTAURANT ga xush kelibsiz!',
  footerReceiptMessage: 'Tashrifingiz uchun minnatdormiz! Yoqimli ishtaha tilaymiz.',
  wifiPassword: 'savoria_lounge_vip'
};

const sampleOrders = [
  {
    id: 'SAV-1081',
    type: 'zal',
    status: 'tayyorlanmoqda',
    tableNumber: 'Stol #3 (VIP Zal)',
    waiterName: 'Madina Karimova',
    customerName: 'Stol #3 (VIP Zal) (4 kishi)',
    customerPhone: '+998 93 234 56 78',
    items: [
      { itemId: 'm-1', name: 'To‘y Oshi (Savoria Maxsus Osh)', price: 68000, quantity: 2, station: 'oshxona', isReady: false },
      { itemId: 'm-8', name: 'Burrata & Pishgan Pomidor Salati', price: 68000, quantity: 1, station: 'sovuq', isReady: true },
      { itemId: 'm-10', name: 'Savoria Maxsus Marokko Kokteyli', price: 36000, quantity: 2, station: 'bar', isReady: true }
    ],
    totalSubtotal: 276000,
    serviceFeeRate: 0.12,
    serviceFeeAmount: 33120,
    finalTotal: 309120,
    isPaid: false,
    paymentMethod: 'uzcard_humo',
    createdAt: new Date().toISOString()
  },
  {
    id: 'SAV-1082',
    type: 'dostavka',
    status: 'yetkazilmoqda',
    customerName: 'Alisher Qosimov',
    customerPhone: '+998 90 987 65 43',
    deliveryAddress: 'Chilonzor 9-mavze, 14-uy, 28-xonadon',
    courierId: 'c-2',
    courierName: 'Ulug‘bek Toshmatov',
    items: [
      { itemId: 'm-2', name: 'Tandir Qozon Kabob', price: 95000, quantity: 2, station: 'issiq', isReady: true },
      { itemId: 'm-9', name: 'Achchiq-Chuchuk (Anor Donalari Bilan)', price: 24000, quantity: 2, station: 'sovuq', isReady: true }
    ],
    totalSubtotal: 238000,
    serviceFeeRate: 0.12,
    serviceFeeAmount: 28560,
    finalTotal: 266560,
    isPaid: true,
    paymentMethod: 'payme',
    createdAt: new Date().toISOString()
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected! Seeding collections into database "savoria"...');

    const db = mongoose.connection.db;

    // 1. Menu Items
    const menuColl = db.collection('menuitems');
    for (const item of menuItemsData) {
      await menuColl.updateOne({ id: item.id }, { $set: item }, { upsert: true });
    }
    const menuCount = await menuColl.countDocuments();
    console.log(`✓ menuitems collection: ${menuCount} documents populated`);

    // 2. Waiters
    const waitersColl = db.collection('waiters');
    for (const w of waitersData) {
      await waitersColl.updateOne({ id: w.id }, { $set: w }, { upsert: true });
    }
    const waitersCount = await waitersColl.countDocuments();
    console.log(`✓ waiters collection: ${waitersCount} documents populated`);

    // 3. Couriers
    const couriersColl = db.collection('couriers');
    for (const c of couriersData) {
      await couriersColl.updateOne({ id: c.id }, { $set: c }, { upsert: true });
    }
    const couriersCount = await couriersColl.countDocuments();
    console.log(`✓ couriers collection: ${couriersCount} documents populated`);

    // 4. Admin Users
    const adminsColl = db.collection('adminusers');
    for (const a of adminUsersData) {
      await adminsColl.updateOne({ id: a.id }, { $set: a }, { upsert: true });
    }
    const adminsCount = await adminsColl.countDocuments();
    console.log(`✓ adminusers collection: ${adminsCount} documents populated`);

    // 5. Settings
    const settingsColl = db.collection('settings');
    await settingsColl.updateOne({}, { $set: settingsData }, { upsert: true });
    const settingsCount = await settingsColl.countDocuments();
    console.log(`✓ settings collection: ${settingsCount} documents populated`);

    // 6. Orders
    const ordersColl = db.collection('orders');
    for (const o of sampleOrders) {
      await ordersColl.updateOne({ id: o.id }, { $set: o }, { upsert: true });
    }
    const ordersCount = await ordersColl.countDocuments();
    console.log(`✓ orders collection: ${ordersCount} documents populated`);

    console.log('\nSUCCESS! ALL 6 COLLECTIONS ARE NOW POPULATED IN MONGODB ATLAS!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('SEEDING FAILED:', err.message);
    process.exit(1);
  }
}

seed();
