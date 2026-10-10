import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem, ItemCategory, OrderType, PaymentMethod } from '../types';
import { 
  ShoppingBag, Search, Plus, Minus, Trash2, Clock, 
  MapPin, Check, Sparkles, Phone, ArrowRight, ShieldCheck,
  ChevronRight, Utensils, UtensilsCrossed
} from 'lucide-react';

export const CustomerMenuView: React.FC = () => {
  const { menuItems, createOrder, formatUZS, settings, openReceiptModal, orders, t, setRoute } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'barchasi'>('barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number; notes?: string }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('zal');
  
  // Checkout form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+998 ');
  const [tableNumber, setTableNumber] = useState('Stol #5 (Zal 1)');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('uzcard_humo');
  
  // Last placed order for status banner
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(null);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);

  const categories: { id: ItemCategory | 'barchasi'; label: string }[] = [
    { id: 'barchasi', label: t('cat_all') },
    { id: 'ichimliklar', label: t('cat_ichimliklar') },
    { id: 'asosiy', label: t('cat_asosiy') },
    { id: 'milliy', label: t('cat_milliy') },
    { id: 'salatlar', label: t('cat_salatlar') },
    { id: 'shorvalar', label: t('cat_shorvalar') },
    { id: 'desertlar', label: t('cat_desertlar') },
    { id: 'qahva_choy', label: t('cat_qahva_choy') },
  ];


  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'barchasi' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.item.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as { item: MenuItem; quantity: number; notes?: string }[];
    });
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  const serviceRate = orderType === 'zal' ? (settings.serviceFeePercent / 100) : 0.05;
  const serviceAmount = Math.round(cartSubtotal * serviceRate);
  const cartTotal = cartSubtotal + serviceAmount;
  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName.trim() || customerPhone.length < 9) {
      alert('Iltimos, ismingiz va telefon raqamingizni kiriting');
      return;
    }
    if (orderType === 'dostavka' && !deliveryAddress.trim()) {
      alert('Iltimos, yetkazib berish manzilini kiriting');
      return;
    }

    const newOrder = createOrder({
      type: orderType,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      tableNumber: orderType === 'zal' ? tableNumber : undefined,
      deliveryAddress: orderType === 'dostavka' ? deliveryAddress.trim() : undefined,
      deliveryNotes: orderType === 'dostavka' ? deliveryNotes.trim() : undefined,
      items: cart.map(c => ({
        itemId: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity,
        station: c.item.station,
        notes: c.notes,
        isReady: false
      })),
      totalSubtotal: cartSubtotal,
      serviceFeeRate: serviceRate,
      serviceFeeAmount: serviceAmount,
      finalTotal: cartTotal,
      isPaid: false,
      paymentMethod
    });

    setLastPlacedOrderId(newOrder.id);
    setCart([]);
    setIsCartOpen(false);
    setShowOrderSuccessModal(true);
  };

  const trackedOrder = lastPlacedOrderId ? orders.find(o => o.id === lastPlacedOrderId) : null;

  return (
    <div className="min-h-screen bg-[#0a0b10] text-[#eaeaea] pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#202330] bg-gradient-to-b from-[#151724] via-[#0d0e15] to-[#0a0b10] py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:32px_32px] opacity-10"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#d4af37]/30 bg-[#241f14] text-[#d4af37] text-xs font-serif tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maftunkor Ta'm & Sharqona Lazzat</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-wide max-w-3xl mx-auto leading-tight">
            SAVORIA RESTAURANT
          </h1>
          <p className="mt-4 text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Har bir taomda oliy toifali sifat, nozik estetik bezak va betakror mehmondo'stlik. 
            Stolga yoki uyingizga tez va qulay onlayn buyurtma bering.
          </p>

          {/* Quick Selection Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                setOrderType('zal');
                setIsCartOpen(true);
              }}
              className="px-4 sm:px-5 py-2.5 rounded-lg bg-[#d4af37] text-neutral-950 hover:bg-[#e6c14c] font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] flex items-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              <span>{t('btn_order_table')}</span>
            </button>

            <button
              onClick={() => {
                setOrderType('dostavka');
                setIsCartOpen(true);
              }}
              className="px-4 sm:px-5 py-2.5 rounded-lg bg-[#181a24] border border-[#33374b] text-neutral-200 hover:text-white hover:border-[#d4af37]/50 font-medium text-xs tracking-wider uppercase transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#d4af37]" />
              <span>{t('btn_order_delivery')}</span>
            </button>

            <button
              onClick={() => setRoute('ofitsiant')}
              className="px-4 sm:px-5 py-2.5 rounded-lg bg-[#181d2c] border border-[#3b4363] text-[#d4af37] hover:text-white hover:border-[#d4af37] font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>{t('btn_waiter_mode')}</span>
            </button>
          </div>

        </div>
      </section>

      {/* Active Order Live Tracker Banner (If user has recent order) */}
      {trackedOrder && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#171a26] to-[#12141e] border border-[#d4af37]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#d4af37]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-semibold">BUYURTMANING JORIY HOLATI: {trackedOrder.id}</span>
              </div>
              <h3 className="text-base font-semibold text-white mt-1">
                {trackedOrder.status === 'yangi' && 'Qabul qilindi — Oshxona tasdiqlamoqda'}
                {trackedOrder.status === 'oshxonada' && 'Oshpazlarimiz taomingizni tayyorlamoqda'}
                {trackedOrder.status === 'tayyor' && 'Buyurtmangiz tayyor bo\'ldi!'}
                {trackedOrder.status === 'yolda' && `Kuryer yo'lda: ${trackedOrder.courierName || 'Kuryer'}`}
                {trackedOrder.status === 'yetkazildi' && 'Buyurtma yetkazildi. Yoqimli ishtaha!'}
                {trackedOrder.status === 'yopildi' && 'Hisob yopildi va chek topshirildi.'}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {trackedOrder.type === 'zal' ? trackedOrder.tableNumber : trackedOrder.deliveryAddress} · {formatUZS(trackedOrder.finalTotal)}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={() => openReceiptModal(trackedOrder)}
                className="px-3.5 py-1.5 rounded-lg bg-[#222534] hover:bg-[#2c3044] text-xs font-medium text-[#d4af37] border border-[#d4af37]/30 transition-colors flex items-center gap-1.5"
              >
                <span>Fiskal Chekni ko'rish</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-[#1f2230]">
          {/* Functional category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#d4af37] text-neutral-950 font-semibold shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                    : 'text-neutral-400 hover:text-white bg-[#141620] hover:bg-[#1d202e] border border-[#232738]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px] md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Taom yoki ichimlik qidirish..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#12141c] border border-[#252837] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>
        </div>

        {/* Menu Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const inCart = cart.find(c => c.item.id === item.id);
            return (
              <div
                key={item.id}
                className={`group relative rounded-xl bg-[#12141e] border transition-all duration-300 flex flex-col overflow-hidden ${
                  item.isAvailable 
                    ? 'border-[#222534] hover:border-[#d4af37]/50 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]' 
                    : 'border-neutral-800 opacity-60'
                }`}
              >
                {/* Image Frame */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12141e] via-transparent to-black/20" />

                  {/* Badges / Indicators */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {item.isChefSpecial && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#d4af37] text-neutral-950 uppercase tracking-wider">
                        Chef's Choice
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[11px] font-mono text-neutral-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#d4af37]" />
                    <span>{item.prepTimeMinutes} daq</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-semibold text-base text-white group-hover:text-[#d4af37] transition-colors leading-snug">
                      {item.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    
                    {/* Weight / Calories metadata */}
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                      {item.weightGrams && <span>{item.weightGrams}g</span>}
                      {item.weightGrams && item.calories && <span>·</span>}
                      {item.calories && <span>{item.calories} kkal</span>}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-4 pt-3 border-t border-[#1d202d] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-neutral-500 block">Narxi</span>
                      <span className="font-serif font-bold text-base text-white tabular-nums">
                        {formatUZS(item.price)}
                      </span>
                    </div>

                    {item.isAvailable ? (
                      inCart ? (
                        <div className="flex items-center gap-1.5 bg-[#1b1e2c] border border-[#32364c] rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1.5 text-xs font-mono font-bold text-[#d4af37]">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#1e2130] hover:bg-[#d4af37] text-neutral-200 hover:text-neutral-950 border border-[#31364d] hover:border-transparent text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Qo'shish</span>
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-rose-400/80 font-mono">
                        Vaqtinchalik tugagan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Cart Button for Mobile & Desktop */}
      {cart.length > 0 && !isCartOpen && (
        <aside aria-label="Savat" className="fixed bottom-18 md:bottom-6 right-3 sm:right-6 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e7c355] text-neutral-950 font-semibold shadow-2xl flex items-center gap-2.5 sm:gap-3 hover:scale-105 transition-transform"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-neutral-950 text-[#d4af37] text-[10px] font-bold flex items-center justify-center">
                {totalCartCount}
              </span>
            </div>
            <div className="text-left font-mono">
              <div className="text-[11px] uppercase tracking-wider font-sans font-bold leading-none">
                Savatni Ko'rish
              </div>
              <div className="text-xs font-bold leading-tight mt-0.5">
                {formatUZS(cartTotal)}
              </div>
            </div>
          </button>
        </aside>
      )}

      {/* Slide-over Cart & Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#11131c] border-l border-[#242838] shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-[#222535] flex items-center justify-between bg-[#151722]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
                  <h2 className="font-serif font-bold text-base text-white">
                    Sizning Buyurtmangiz
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  ✕
                </button>
              </div>

              {/* Order Type Tabs */}
              <div className="p-4 bg-[#141622] border-b border-[#222535]">
                <div className="grid grid-cols-2 gap-2 bg-[#0c0d13] p-1 rounded-lg border border-[#212433]">
                  <button
                    type="button"
                    onClick={() => setOrderType('zal')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      orderType === 'zal'
                        ? 'bg-[#d4af37] text-neutral-950 shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Restoranda (Stolga)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('dostavka')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      orderType === 'dostavka'
                        ? 'bg-[#d4af37] text-neutral-950 shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Dostavka (Yetkazish)</span>
                  </button>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto stroke-1" />
                    <p className="mt-3 text-sm text-neutral-400">
                      Savatingiz hali bo'sh
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Menyudan istagan tansiq taomni tanlang
                    </p>
                  </div>
                ) : (
                  cart.map(({ item, quantity, notes }) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-[#161824] border border-[#26293a] flex items-center justify-between gap-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded object-cover border border-neutral-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {item.name}
                        </h4>
                        <div className="text-[11px] font-mono text-[#d4af37] mt-0.5">
                          {formatUZS(item.price)}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-[#0e0f17] px-2 py-1 rounded border border-[#282c3e]">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-white px-1">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Form & Financial Summary */}
              {cart.length > 0 && (
                <form onSubmit={handlePlaceOrder} className="p-4 sm:p-6 bg-[#131520] border-t border-[#222535] space-y-4">
                  {/* Customer Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                        Ismingiz *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Masalan: Sardor Aliyev"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full bg-[#0d0e15] border border-[#262a3c] rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                        Telefon raqamingiz *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+998 90 123 45 67"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        className="w-full bg-[#0d0e15] border border-[#262a3c] rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37] font-mono"
                      />
                    </div>

                    {orderType === 'zal' ? (
                      <div>
                        <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                          Stol raqami yoki Zal
                        </label>
                        <select
                          value={tableNumber}
                          onChange={e => setTableNumber(e.target.value)}
                          className="w-full bg-[#0d0e15] border border-[#262a3c] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="Stol #1 (Zal 1)">Stol #1 (Asosiy zal)</option>
                          <option value="Stol #2 (Zal 1)">Stol #2 (Asosiy zal)</option>
                          <option value="Stol #3 (Zal 1)">Stol #3 (Asosiy zal)</option>
                          <option value="Stol #4 (Zal 1)">Stol #4 (Asosiy zal)</option>
                          <option value="Stol #5 (Zal 1)">Stol #5 (Asosiy zal)</option>
                          <option value="VIP Kabinet #1">VIP Kabinet #1 (Sharqona)</option>
                          <option value="VIP Terrasa #2">VIP Terrasa #2 (Panoramik)</option>
                          <option value="Bar stoli #3">Bar stoli #3</option>
                        </select>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                            Yetkazib berish manzili *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Tuman, ko'cha, uy raqami, xonadon"
                            value={deliveryAddress}
                            onChange={e => setDeliveryAddress(e.target.value)}
                            className="w-full bg-[#0d0e15] border border-[#262a3c] rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                            Kuryer uchun izoh (Mo'ljal, domofon)
                          </label>
                          <input
                            type="text"
                            placeholder="Domofon kodi yoki mo'ljal"
                            value={deliveryNotes}
                            onChange={e => setDeliveryNotes(e.target.value)}
                            className="w-full bg-[#0d0e15] border border-[#262a3c] rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      </>
                    )}

                    {/* Payment method selector */}
                    <div>
                      <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                        To'lov usuli
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('uzcard_humo')}
                          className={`p-2 rounded-lg border text-left transition-colors ${
                            paymentMethod === 'uzcard_humo'
                              ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                              : 'bg-[#0d0e15] border-[#252839] text-neutral-400'
                          }`}
                        >
                          <div className="font-semibold text-[11px]">Uzcard / Humo</div>
                          <div className="text-[10px] text-neutral-500">Karta orqali</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('payme_click')}
                          className={`p-2 rounded-lg border text-left transition-colors ${
                            paymentMethod === 'payme_click'
                              ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                              : 'bg-[#0d0e15] border-[#252839] text-neutral-400'
                          }`}
                        >
                          <div className="font-semibold text-[11px]">Payme / Click</div>
                          <div className="text-[10px] text-neutral-500">Ilova orqali</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('naqd')}
                          className={`p-2 rounded-lg border text-left transition-colors ${
                            paymentMethod === 'naqd'
                              ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                              : 'bg-[#0d0e15] border-[#252839] text-neutral-400'
                          }`}
                        >
                          <div className="font-semibold text-[11px]">Naqd pul</div>
                          <div className="text-[10px] text-neutral-500">Qabul qilinganda</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('visa')}
                          className={`p-2 rounded-lg border text-left transition-colors ${
                            paymentMethod === 'visa'
                              ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                              : 'bg-[#0d0e15] border-[#252839] text-neutral-400'
                          }`}
                        >
                          <div className="font-semibold text-[11px]">Visa / Master</div>
                          <div className="text-[10px] text-neutral-500">Xalqaro karta</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-2 border-t border-[#252839] space-y-1 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Taomlar jami:</span>
                      <span className="font-mono">{formatUZS(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Xizmat haqi ({orderType === 'zal' ? `${settings.serviceFeePercent}%` : '5%'}):</span>
                      <span className="font-mono">{formatUZS(serviceAmount)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-[#2b2f42]">
                      <span>Yakuniy summa:</span>
                      <span className="font-mono text-[#d4af37]">{formatUZS(cartTotal)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#e6c14c] text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Buyurtmani Tasdiqlash</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Success Notification Modal */}
      {showOrderSuccessModal && trackedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#131522] border border-[#d4af37]/50 rounded-xl p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#d4af37]/20 border border-[#d4af37] mx-auto flex items-center justify-center text-[#d4af37] mb-4">
              <Check className="w-7 h-7" />
            </div>

            <h3 className="font-serif font-bold text-xl text-white">
              Buyurtmangiz Qabul Qilindi!
            </h3>
            <p className="text-xs text-neutral-300 mt-2 font-mono">
              Buyurtma raqami: <span className="text-[#d4af37] font-bold">{trackedOrder.id}</span>
            </p>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Oshxonamiz va kassa tizimi buyurtmangizni qabul qildi. Hozirda taom tayyorlanishga yuborildi.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  setShowOrderSuccessModal(false);
                  openReceiptModal(trackedOrder);
                }}
                className="flex-1 py-2.5 rounded-lg bg-[#222538] hover:bg-[#2b3046] text-xs font-semibold text-[#d4af37] border border-[#d4af37]/40 transition-colors"
              >
                Elektron Chekni Ko'rish
              </button>
              <button
                onClick={() => setShowOrderSuccessModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-[#d4af37] text-neutral-950 hover:bg-[#e4be4a] text-xs font-bold transition-colors"
              >
                Menyuga Qaytish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
