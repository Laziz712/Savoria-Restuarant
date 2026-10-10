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
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection Setup
// User specified: mongodb+srv://shavkatovv:<laziz712.>@cluster0.wupoksj.mongodb.net/?appName=Cluster0
const rawMongoUri = process.env.MONGODB_URI || 'mongodb+srv://shavkatovv:laziz712.@cluster0.wupoksj.mongodb.net/savoria?appName=Cluster0';
// Sanitize URI in case user formatted password with <...>
const sanitizedMongoUri = rawMongoUri
  .replace('<laziz712.>', encodeURIComponent('laziz712.'))
  .replace('<laziz712>', encodeURIComponent('laziz712'));

let isMongoConnected = false;
let mongoErrorMessage = '';

mongoose.set('strictQuery', false);

async function connectToMongo() {
  try {
    console.log('Connecting to MongoDB Atlas at cluster0.wupoksj.mongodb.net...');
    await mongoose.connect(sanitizedMongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    mongoErrorMessage = '';
    console.log('Successfully connected to MongoDB Atlas (database: savoria)!');
  } catch (err: any) {
    isMongoConnected = false;
    mongoErrorMessage = err?.message || 'Failed to connect to MongoDB';
    console.warn('MongoDB connection notice (will run with hybrid in-memory fallback):', mongoErrorMessage);
  }
}

connectToMongo();

// Mongoose Schemas & Models
const MenuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  prepTimeMinutes: { type: Number, default: 15 },
  isAvailable: { type: Boolean, default: true },
  station: { type: String, default: 'issiq' },
  calories: { type: Number },
  weightGrams: { type: Number },
  isChefSpecial: { type: Boolean, default: false }
}, { timestamps: true });

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
  estimatedDeliveryMinutes: { type: Number }
}, { timestamps: true });

const WaiterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  assignedZone: { type: String, default: 'Zal 1' },
  status: { type: String, default: 'bosh' },
  ordersServedToday: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
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
  username: { type: String, required: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: String }
}, { timestamps: true });

const SettingsSchema = new mongoose.Schema({
  name: { type: String, default: 'SAVORIA RESTAURANT' },
  slogan: { type: String, default: 'Premium Gastronomiya va Sharqona mehmondo\'stlik' },
  address: { type: String, default: 'Toshkent sh., Mirzo Ulug\'bek tumani, Mustaqillik shoh ko\'chasi 77' },
  phone: { type: String, default: '+998 71 200 88 99' },
  stir: { type: String, default: '309 814 552' },
  serviceFeePercent: { type: Number, default: 12 },
  headerMessage: { type: String, default: 'SAVORIA RESTAURANT ga xush kelibsiz!' },
  footerReceiptMessage: { type: String, default: 'Tashrifingiz uchun minnatdormiz! Yoqimli ishtaha tilaymiz.' },
  wifiPassword: { type: String, default: 'savoria_lounge_vip' }
}, { timestamps: true });

const MenuItemModel = mongoose.model('MenuItem', MenuItemSchema);
const OrderModel = mongoose.model('Order', OrderSchema);
const WaiterModel = mongoose.model('Waiter', WaiterSchema);
const CourierModel = mongoose.model('Courier', CourierSchema);
const AdminUserModel = mongoose.model('AdminUser', AdminUserSchema);
const SettingsModel = mongoose.model('Settings', SettingsSchema);

// In-Memory Fallback store if Mongo is offline or initializing
const memoryStore = {
  menu: [] as any[],
  orders: [] as any[],
  waiters: [] as any[],
  couriers: [] as any[],
  admins: [] as any[],
  settings: null as any
};

// API Endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    restaurant: 'SAVORIA RESTAURANT',
    mongoConnected: isMongoConnected,
    mongoCluster: 'cluster0.wupoksj.mongodb.net',
    mongoDatabase: 'savoria',
    mongoError: mongoErrorMessage || null,
    serverTime: new Date().toISOString()
  });
});

// Menu Endpoints
app.get('/api/menu', async (req, res) => {
  try {
    if (isMongoConnected) {
      const items = await MenuItemModel.find().lean();
      if (items.length > 0) return res.json(items);
    }
    res.json(memoryStore.menu);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const itemData = req.body;
    if (isMongoConnected) {
      const saved = await MenuItemModel.findOneAndUpdate(
        { id: itemData.id },
        itemData,
        { upsert: true, new: true }
      );
      return res.json(saved);
    }
    const idx = memoryStore.menu.findIndex(i => i.id === itemData.id);
    if (idx >= 0) {
      memoryStore.menu[idx] = itemData;
    } else {
      memoryStore.menu.push(itemData);
    }
    res.json(itemData);
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
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Orders Endpoints
app.get('/api/orders', async (req, res) => {
  try {
    if (isMongoConnected) {
      const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
      if (orders.length > 0) return res.json(orders);
    }
    res.json(memoryStore.orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    if (isMongoConnected) {
      const saved = await OrderModel.findOneAndUpdate(
        { id: orderData.id },
        orderData,
        { upsert: true, new: true }
      );
      return res.json(saved);
    }
    memoryStore.orders.unshift(orderData);
    res.json(orderData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (isMongoConnected) {
      const updated = await OrderModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
      return res.json(updated);
    }
    const idx = memoryStore.orders.findIndex(o => o.id === id);
    if (idx >= 0) {
      memoryStore.orders[idx] = { ...memoryStore.orders[idx], ...updates };
      return res.json(memoryStore.orders[idx]);
    }
    res.status(404).json({ error: 'Order not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Waiters Endpoints
app.get('/api/waiters', async (req, res) => {
  try {
    if (isMongoConnected) {
      const waiters = await WaiterModel.find().lean();
      if (waiters.length > 0) return res.json(waiters);
    }
    res.json(memoryStore.waiters);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/waiters', async (req, res) => {
  try {
    const waiter = req.body;
    if (isMongoConnected) {
      const saved = await WaiterModel.findOneAndUpdate({ id: waiter.id }, waiter, { upsert: true, new: true });
      return res.json(saved);
    }
    const idx = memoryStore.waiters.findIndex(w => w.id === waiter.id);
    if (idx >= 0) memoryStore.waiters[idx] = waiter;
    else memoryStore.waiters.push(waiter);
    res.json(waiter);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/waiters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) await WaiterModel.deleteOne({ id });
    memoryStore.waiters = memoryStore.waiters.filter(w => w.id !== id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Couriers Endpoints
app.get('/api/couriers', async (req, res) => {
  try {
    if (isMongoConnected) {
      const couriers = await CourierModel.find().lean();
      if (couriers.length > 0) return res.json(couriers);
    }
    res.json(memoryStore.couriers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/couriers', async (req, res) => {
  try {
    const courier = req.body;
    if (isMongoConnected) {
      const saved = await CourierModel.findOneAndUpdate({ id: courier.id }, courier, { upsert: true, new: true });
      return res.json(saved);
    }
    const idx = memoryStore.couriers.findIndex(c => c.id === courier.id);
    if (idx >= 0) memoryStore.couriers[idx] = courier;
    else memoryStore.couriers.push(courier);
    res.json(courier);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/couriers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) await CourierModel.deleteOne({ id });
    memoryStore.couriers = memoryStore.couriers.filter(c => c.id !== id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admins Endpoints
app.get('/api/admins', async (req, res) => {
  try {
    if (isMongoConnected) {
      const admins = await AdminUserModel.find().lean();
      if (admins.length > 0) return res.json(admins);
    }
    res.json(memoryStore.admins);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admins', async (req, res) => {
  try {
    const admin = req.body;
    if (isMongoConnected) {
      const saved = await AdminUserModel.findOneAndUpdate({ id: admin.id }, admin, { upsert: true, new: true });
      return res.json(saved);
    }
    const idx = memoryStore.admins.findIndex(a => a.id === admin.id);
    if (idx >= 0) memoryStore.admins[idx] = admin;
    else memoryStore.admins.push(admin);
    res.json(admin);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Settings Endpoints
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
    if (isMongoConnected) {
      const saved = await SettingsModel.findOneAndUpdate({}, newSettings, { upsert: true, new: true });
      return res.json(saved);
    }
    memoryStore.settings = newSettings;
    res.json(newSettings);
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
    console.log(`SAVORIA RESTAURANT server running on http://0.0.0.0:${PORT}`);
  });
}

start();
