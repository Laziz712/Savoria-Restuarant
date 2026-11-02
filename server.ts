import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

// MongoDB Connection Setup (Kept 100% secret on server-side)
const rawMongoUri = process.env.MONGODB_URI || 'mongodb+srv://shavkatovv:laziz712.@cluster0.wupoksj.mongodb.net/savoria?retryWrites=true&w=majority';
const sanitizedMongoUri = rawMongoUri
  .replace(/<([^>]+)>/g, (_, p) => encodeURIComponent(p));

let isMongoConnected = false;
let mongoErrorMessage = '';

mongoose.set('strictQuery', false);

async function connectToMongo() {
  if (!sanitizedMongoUri) {
    isMongoConnected = false;
    return;
  }
  try {
    await mongoose.connect(sanitizedMongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    mongoErrorMessage = '';
    console.log('MongoDB Atlas ulandi: SAVORIA RESTAURANT');
    await seedDefaultsIfEmpty();
  } catch (err: any) {
    isMongoConnected = false;
    mongoErrorMessage = err?.message || 'Database connection failed';
    console.warn('MongoDB ulanishda ogohlantirish:', mongoErrorMessage);
  }
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
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': heartbeat\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 15000);

// ==========================================
// MONGOOSE SCHEMAS & MODELS
// ==========================================
const MenuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
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
  name: { type: String, required: true },
  zone: { type: String, default: 'Zal 1' },
  capacity: { type: Number, default: 4 },
  isActive: { type: Boolean, default: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

const ReservationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
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
  name: { type: String, required: true },
  phone: { type: String, required: true },
  vehicle: { type: String, default: 'skuter' },
  status: { type: String, default: 'bosh' },
  activeOrdersCount: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 }
}, { timestamps: true });

const AdminUserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'superadmin' }
}, { timestamps: true });

const SettingsSchema = new mongoose.Schema({
  name: { type: String, default: 'SAVORIA RESTAURANT' },
  slogan: { type: String, default: 'Sharqona Mehmondo‘stlik & Yuksak Gastronomik San’at' },
  address: { type: String, default: 'Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko\'chasi 45-uy' },
  phone: { type: String, default: '+998 71 200-71-12' },
  stir: { type: String, default: '309 814 552' },
  serviceFeePercent: { type: Number, default: 12 },
  headerMessage: { type: String, default: 'Savoria Restoraniga xush kelibsiz!' },
  footerReceiptMessage: { type: String, default: 'Tashrifingiz uchun minnatdormiz! Yoqimli ishtaha tilaymiz.' },
  wifiPassword: { type: String, default: 'savoria_vip_guest' }
}, { timestamps: true });

const MenuItemModel = mongoose.model('MenuItem', MenuItemSchema);
const OrderModel = mongoose.model('Order', OrderSchema);
const TableModel = mongoose.model('RestaurantTable', TableSchema);
const ReservationModel = mongoose.model('Reservation', ReservationSchema);
const WaiterModel = mongoose.model('Waiter', WaiterSchema);
const CourierModel = mongoose.model('Courier', CourierSchema);
const AdminUserModel = mongoose.model('AdminUser', AdminUserSchema);
const SettingsModel = mongoose.model('Settings', SettingsSchema);

// In-Memory Fallback store if Mongo is temporarily offline
const memoryStore = {
  menu: [] as any[],
  orders: [] as any[],
  tables: [] as any[],
  reservations: [] as any[],
  waiters: [] as any[],
  couriers: [] as any[],
  admins: [] as any[],
  settings: null as any
};

async function seedDefaultsIfEmpty() {
  try {
    const tableCount = await TableModel.countDocuments();
    if (tableCount === 0) {
      const defaultTables = [
        { id: 'Stol #1 (Zal 1)', name: 'Stol 1', zone: 'Zal 1', capacity: 4, isActive: true, notes: 'Deraza oldi' },
        { id: 'Stol #2 (Zal 1)', name: 'Stol 2', zone: 'Zal 1', capacity: 2, isActive: true, notes: 'Kichik shinam stol' },
        { id: 'Stol #3 (Zal 1)', name: 'Stol 3', zone: 'Zal 1', capacity: 6, isActive: true, notes: 'Katta oilaviy stol' },
        { id: 'Stol #4 (Zal 1)', name: 'Stol 4', zone: 'Zal 1', capacity: 4, isActive: true, notes: 'Markaziy zal' },
        { id: 'Stol #5 (Zal 1)', name: 'Stol 5', zone: 'Zal 1', capacity: 4, isActive: true, notes: 'Markaziy zal' },
        { id: 'VIP Kabinet #1', name: 'VIP 1', zone: 'VIP', capacity: 10, isActive: true, notes: 'Alohida VIP xona va televizor' },
        { id: 'VIP Terrasa #2', name: 'VIP Terrasa', zone: 'Terrasa', capacity: 8, isActive: true, notes: 'Ochiq osmon ostidagi veranda' },
        { id: 'Bar stoli #3', name: 'Bar 3', zone: 'Bar', capacity: 2, isActive: true, notes: 'Barmen qarshisida' },
      ];
      await TableModel.insertMany(defaultTables);
    }

    const settingsCount = await SettingsModel.countDocuments();
    if (settingsCount === 0) {
      await SettingsModel.create({
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
        { id: 'w-1', name: 'Sardor Rahimiy', phone: '+998 90 123 45 67', assignedZone: 'Zal 1 (Asosiy)', status: 'ishda', ordersHandledCount: 18, password: '1111', pinPassword: '1111' },
        { id: 'w-2', name: 'Madina Alimova', phone: '+998 93 234 56 78', assignedZone: 'VIP Terrasa', status: 'ishda', ordersHandledCount: 14, password: '2222', pinPassword: '2222' },
        { id: 'w-3', name: 'Javohir Toshmatov', phone: '+998 99 345 67 89', assignedZone: 'Sharqona Zal', status: 'ishda', ordersHandledCount: 9, password: '3333', pinPassword: '3333' }
      ]);
    }

    const courierCount = await CourierModel.countDocuments();
    if (courierCount === 0) {
      await CourierModel.insertMany([
        { id: 'c-1', name: 'Rustam Qodirov', phone: '+998 90 987 65 43', vehicle: 'skuter', status: 'bosh', activeOrdersCount: 0, rating: 4.9 },
        { id: 'c-2', name: 'Bobur Saidov', phone: '+998 97 876 54 32', vehicle: 'avto', status: 'bosh', activeOrdersCount: 0, rating: 5.0 },
        { id: 'c-3', name: 'Otabek Mirzayev', phone: '+998 94 765 43 21', vehicle: 'skuter', status: 'bosh', activeOrdersCount: 0, rating: 4.8 }
      ]);
    }

    const adminCount = await AdminUserModel.countDocuments();
    if (adminCount === 0) {
      await AdminUserModel.create({
        id: 'adm-1',
        name: 'Laziz Shavkatov (Bosh Admin)',
        username: 'laziz712',
        passwordHash: 'laziz712.',
        role: 'superadmin'
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
    restaurant: 'SAVORIA RESTAURANT',
    mongoConnected: isMongoConnected,
    connectedClients: sseClients.size,
    serverTime: new Date().toISOString()
  });
});

// 3. Complete App Bootstrap (Single-roundtrip fast initialization for all devices)
app.get('/api/bootstrap', async (req, res) => {
  try {
    let menu = memoryStore.menu;
    let orders = memoryStore.orders;
    let tables = memoryStore.tables;
    let reservations = memoryStore.reservations;
    let waiters = memoryStore.waiters;
    let couriers = memoryStore.couriers;
    let settings = memoryStore.settings;

    if (isMongoConnected) {
      const [m, o, t, r, w, c, s] = await Promise.all([
        MenuItemModel.find().lean(),
        OrderModel.find().sort({ createdAt: -1 }).lean(),
        TableModel.find().lean(),
        ReservationModel.find().sort({ createdAt: -1 }).lean(),
        WaiterModel.find().lean(),
        CourierModel.find().lean(),
        SettingsModel.findOne().lean()
      ]);
      menu = m;
      orders = o;
      tables = t;
      reservations = r;
      waiters = w;
      couriers = c;
      settings = s || memoryStore.settings;
    }

    res.json({
      success: true,
      mongoConnected: isMongoConnected,
      menu,
      orders,
      tables,
      reservations,
      waiters,
      couriers,
      settings,
      serverTime: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Menu Items CRUD (Real-Time Broadcast)
app.get('/api/menu', async (req, res) => {
  try {
    if (isMongoConnected) {
      const items = await MenuItemModel.find().lean();
      return res.json(items);
    }
    res.json(memoryStore.menu);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const itemData = req.body;
    let saved = itemData;

    if (isMongoConnected) {
      saved = await MenuItemModel.findOneAndUpdate(
        { id: itemData.id },
        itemData,
        { upsert: true, new: true }
      ).lean();
    } else {
      const idx = memoryStore.menu.findIndex(i => i.id === itemData.id);
      if (idx >= 0) memoryStore.menu[idx] = itemData;
      else memoryStore.menu.unshift(itemData);
    }

    // Real-Time broadcast to all connected devices (Customers, Waiters, Kitchen, Admin)
    broadcastRealtimeEvent('menu:created', saved);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
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
    if (isMongoConnected) {
      await MenuItemModel.deleteOne({ id });
    }
    memoryStore.menu = memoryStore.menu.filter(i => i.id !== id);

    broadcastRealtimeEvent('menu:deleted', { id });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Orders CRUD & Real-Time Notification System
app.get('/api/orders', async (req, res) => {
  try {
    if (isMongoConnected) {
      const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
      return res.json(orders);
    }
    res.json(memoryStore.orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    let saved = orderData;

    if (isMongoConnected) {
      saved = await OrderModel.findOneAndUpdate(
        { id: orderData.id },
        orderData,
        { upsert: true, new: true }
      ).lean();
    } else {
      memoryStore.orders.unshift(orderData);
    }

    // REAL-TIME BROADCAST:
    // Kitchen, POS, Waiters, and Admin instantly receive order, ring chime, and increment badges!
    broadcastRealtimeEvent('order:created', saved);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
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
      // REAL-TIME BROADCAST:
      // Customers, Couriers, Kitchen, and Waiters immediately see updated status
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
    if (isMongoConnected) {
      await OrderModel.deleteOne({ id });
    }
    memoryStore.orders = memoryStore.orders.filter(o => o.id !== id);

    broadcastRealtimeEvent('order:deleted', { id });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Tables & Zones Management
app.get('/api/tables', async (req, res) => {
  try {
    if (isMongoConnected) {
      const tables = await TableModel.find().lean();
      return res.json(tables);
    }
    res.json(memoryStore.tables);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tables', async (req, res) => {
  try {
    const tableData = req.body;
    let saved = tableData;
    if (isMongoConnected) {
      saved = await TableModel.findOneAndUpdate({ id: tableData.id }, tableData, { upsert: true, new: true }).lean();
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
    if (isMongoConnected) await TableModel.deleteOne({ id });
    memoryStore.tables = memoryStore.tables.filter(t => t.id !== id);
    broadcastRealtimeEvent('table:deleted', { id });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Reservations Endpoints
app.get('/api/reservations', async (req, res) => {
  try {
    if (isMongoConnected) {
      const resList = await ReservationModel.find().sort({ createdAt: -1 }).lean();
      return res.json(resList);
    }
    res.json(memoryStore.reservations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const resData = req.body;
    let saved = resData;
    if (isMongoConnected) {
      saved = await ReservationModel.findOneAndUpdate({ id: resData.id }, resData, { upsert: true, new: true }).lean();
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
    const updates = req.body;
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

// 8. Waiter Call Buzzer (Real-Time table alert)
app.post('/api/waiter-call', (req, res) => {
  const { table, timestamp } = req.body;
  const alertData = {
    table: table || 'Stol',
    timestamp: timestamp || Date.now()
  };
  broadcastRealtimeEvent('waiter_call:created', alertData);
  res.json({ success: true, alert: alertData });
});

// 9. Staff & Couriers
app.get('/api/waiters', async (req, res) => {
  try {
    if (isMongoConnected) {
      const waiters = await WaiterModel.find().lean();
      return res.json(waiters);
    }
    res.json(memoryStore.waiters);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/waiters', async (req, res) => {
  try {
    const waiter = req.body;
    let saved = waiter;
    if (isMongoConnected) {
      saved = await WaiterModel.findOneAndUpdate({ id: waiter.id }, waiter, { upsert: true, new: true }).lean();
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
    if (isMongoConnected) await WaiterModel.deleteOne({ id });
    memoryStore.waiters = memoryStore.waiters.filter(w => w.id !== id);
    broadcastRealtimeEvent('waiter:deleted', { id });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/couriers', async (req, res) => {
  try {
    if (isMongoConnected) {
      const couriers = await CourierModel.find().lean();
      return res.json(couriers);
    }
    res.json(memoryStore.couriers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/couriers', async (req, res) => {
  try {
    const courier = req.body;
    let saved = courier;
    if (isMongoConnected) {
      saved = await CourierModel.findOneAndUpdate({ id: courier.id }, courier, { upsert: true, new: true }).lean();
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
    if (isMongoConnected) await CourierModel.deleteOne({ id });
    memoryStore.couriers = memoryStore.couriers.filter(c => c.id !== id);
    broadcastRealtimeEvent('courier:deleted', { id });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Settings & Admins
app.get('/api/settings', async (req, res) => {
  try {
    if (isMongoConnected) {
      const s = await SettingsModel.findOne().lean();
      if (s) return res.json(s);
    }
    res.json(memoryStore.settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const newSettings = req.body;
    let saved = newSettings;
    if (isMongoConnected) {
      saved = await SettingsModel.findOneAndUpdate({}, newSettings, { upsert: true, new: true }).lean();
    } else {
      memoryStore.settings = newSettings;
    }
    broadcastRealtimeEvent('settings:updated', saved);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admins', async (req, res) => {
  try {
    if (isMongoConnected) {
      const admins = await AdminUserModel.find().lean();
      return res.json(admins);
    }
    res.json(memoryStore.admins);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admins', async (req, res) => {
  try {
    const admin = req.body;
    let saved = admin;
    if (isMongoConnected) {
      saved = await AdminUserModel.findOneAndUpdate({ id: admin.id }, admin, { upsert: true, new: true }).lean();
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
    let orders: any[] = [];
    if (isMongoConnected) {
      orders = await OrderModel.find().lean();
    } else {
      orders = memoryStore.orders;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const paidOrders = orders.filter(o => o.isPaid || o.status === 'yopildi');
    const todayOrders = orders.filter(o => (o.createdAt || '').slice(0, 10) === todayStr);
    const todayPaidOrders = todayOrders.filter(o => o.isPaid || o.status === 'yopildi');

    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const avgCheck = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    // Delivery vs Dine-in
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

// 12. Safe Bulk Sync Endpoint (Never destructively overwrites, only upserts)
app.post('/api/sync-all', async (req, res) => {
  try {
    const { menuItems, waiters, couriers, adminUsers, settings, tables, reservations } = req.body;
    let syncedCount = 0;

    if (isMongoConnected) {
      if (Array.isArray(menuItems) && menuItems.length > 0) {
        for (const item of menuItems) {
          await MenuItemModel.findOneAndUpdate({ id: item.id }, item, { upsert: true });
          syncedCount++;
        }
      }
      if (Array.isArray(tables) && tables.length > 0) {
        for (const tbl of tables) {
          await TableModel.findOneAndUpdate({ id: tbl.id }, tbl, { upsert: true });
        }
      }
      if (Array.isArray(reservations) && reservations.length > 0) {
        for (const r of reservations) {
          await ReservationModel.findOneAndUpdate({ id: r.id }, r, { upsert: true });
        }
      }
      if (Array.isArray(waiters) && waiters.length > 0) {
        for (const w of waiters) {
          await WaiterModel.findOneAndUpdate({ id: w.id }, w, { upsert: true });
        }
      }
      if (Array.isArray(couriers) && couriers.length > 0) {
        for (const c of couriers) {
          await CourierModel.findOneAndUpdate({ id: c.id }, c, { upsert: true });
        }
      }
      if (Array.isArray(adminUsers) && adminUsers.length > 0) {
        for (const a of adminUsers) {
          await AdminUserModel.findOneAndUpdate({ id: a.id }, a, { upsert: true });
        }
      }
      if (settings && typeof settings === 'object') {
        await SettingsModel.findOneAndUpdate({}, settings, { upsert: true });
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

async function start() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
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

start();
