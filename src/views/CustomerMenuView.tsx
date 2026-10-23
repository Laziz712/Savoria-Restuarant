import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  MenuItem, ItemCategory, OrderType, PaymentMethod, 
  TableReservation 
} from '../types';
import { 
  restaurantInteriorImg, vipHallImg, gijduvonShashlikImg, 
  turkishBaklavaImg, kozaShorvaImg 
} from '../data/initialData';
import { 
  ShoppingBag, Search, Plus, Minus, Clock, 
  MapPin, Check, Sparkles, ArrowRight,
  ChevronRight, Utensils, Star, X, 
  Flame, Award, Coffee, Wine, Soup, Salad, Cake,
  Calendar, Users, MessageSquarePlus, Heart,
  Phone, User, CheckCircle2, ShieldCheck,
  Send, ThumbsUp, Building2, Music, Car, Wifi,
  ChevronDown, ExternalLink, Info, CheckSquare, Bell
} from 'lucide-react';

export const CustomerMenuView: React.FC = () => {
  const { 
    menuItems, createOrder, formatUZS, settings, 
    openReceiptModal, orders, t, setRoute, tables,
    chefs, reviews, addReview, reservations, addReservation,
    currentTableContext, isMenuOnlyMode, callWaiterFromTable
  } = useRestaurant();

  const [waiterCalledBanner, setWaiterCalledBanner] = useState(false);

  // Search & Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'rating'>('recommended');

  // Selected dish for lightbox detail modal
  const [detailModalItem, setDetailModalItem] = useState<MenuItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalNotes, setModalNotes] = useState('');

  // Cart state
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number; notes?: string }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('zal');
  
  // Checkout form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+998 ');
  const [tableNumber, setTableNumber] = useState(currentTableContext || (tables && tables[0] ? tables[0].id : 'Stol #1 (Zal 1)'));
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('uzcard_humo');
  
  // Last placed order for status banner
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(null);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);

  // Reservation In-Page Form State
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('+998 ');
  const [resZone, setResZone] = useState<'Asosiy Zal' | 'Yozgi Shiypon (Terassa)' | 'VIP Alohida Xona'>('Asosiy Zal');
  const [resGuests, setResGuests] = useState<number>(4);
  const [resDate, setResDate] = useState<string>('Bugun');
  const [resTime, setResTime] = useState<string>('19:00');
  const [resSpecialNotes, setResSpecialNotes] = useState('');
  const [lastConfirmedReservation, setLastConfirmedReservation] = useState<TableReservation | null>(null);
  const [reservationSubmitting, setReservationSubmitting] = useState(false);

  // Review Submission State
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmittedSuccess, setReviewSubmittedSuccess] = useState(false);

  // Category Tabs matching reference screenshots
  const categories = [
    { id: 'barchasi', label: 'Barchasi' },
    { id: 'milliy', label: 'Milliy Taomlar' },
    { id: 'shashlik', label: 'Shashlik & Kaboblar' },
    { id: 'steak', label: 'Steak & Gril' },
    { id: 'shorvalar', label: 'Sho‘rvalar' },
    { id: 'salatlar', label: 'Salatlar' },
    { id: 'shirinliklar', label: 'Shirinliklar' },
    { id: 'ichimliklar', label: 'Ichimliklar' },
  ];

  // Filtering and Sorting
  const filteredAndSortedItems = useMemo(() => {
    let items = menuItems.filter(item => {
      let matchesCat = true;
      if (selectedCategory !== 'barchasi') {
        if (selectedCategory === 'shashlik') {
          matchesCat = item.category === 'shashlik' || item.name.toLowerCase().includes('shashlik') || item.name.toLowerCase().includes('kabob');
        } else if (selectedCategory === 'steak') {
          matchesCat = item.category === 'steak' || item.category === 'asosiy' || item.name.toLowerCase().includes('steak') || item.name.toLowerCase().includes('steyk');
        } else if (selectedCategory === 'shirinliklar') {
          matchesCat = item.category === 'shirinliklar' || item.category === 'desertlar';
        } else {
          matchesCat = item.category === selectedCategory;
        }
      }
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCat && matchesSearch;
    });

    if (sortBy === 'price_asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      items.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    }
    return items;
  }, [menuItems, selectedCategory, searchQuery, sortBy]);

  const addToCart = (item: MenuItem, quantity = 1, notes?: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + quantity, notes: notes || i.notes } : i);
      }
      return [...prev, { item, quantity, notes }];
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

  const getItemCartQuantity = (itemId: string) => {
    const item = cart.find(c => c.item.id === itemId);
    return item ? item.quantity : 0;
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

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName.trim() || resPhone.length < 9) {
      alert("Iltimos, ism va telefon raqamingizni to'liq kiriting");
      return;
    }
    setReservationSubmitting(true);
    setTimeout(() => {
      const newRes = addReservation({
        guestName: resName.trim(),
        guestPhone: resPhone.trim(),
        date: resDate,
        time: resTime,
        guestsCount: Number(resGuests) || 2,
        tableId: resZone,
        zone: resZone,
        specialRequests: resSpecialNotes.trim() || undefined
      });
      setLastConfirmedReservation(newRes);
      setReservationSubmitting(false);
    }, 600);
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      alert('Iltimos, ismingiz va sharhingizni kiriting');
      return;
    }
    addReview({
      authorName: newReviewAuthor.trim(),
      authorRole: 'Doimiy mehmon',
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      recommendedDish: 'To‘y Oshi (Savoria Maxsus Osh)'
    });
    setReviewSubmittedSuccess(true);
    setNewReviewComment('');
    setNewReviewAuthor('');
    setTimeout(() => {
      setReviewSubmittedSuccess(false);
    }, 3500);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-[#eaeaea] selection:bg-[#ea580c]/30 selection:text-white">
      {/* Table QR Code Context Banner */}
      {currentTableContext && (
        <div className="sticky top-16 z-40 bg-gradient-to-r from-[#21160e] via-[#10121a] to-[#21160e] border-b border-[#d4af37]/50 px-4 py-3 shadow-2xl backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] font-bold text-lg shadow-[0_0_15px_rgba(212,175,55,0.2)] shrink-0">
                🍽️
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="font-serif font-bold text-white text-sm sm:text-base">
                    Siz «{currentTableContext}» stolidansiz
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                    ● Jonli Raqamli Menyu
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Taomlar va narxlar kassada o'zgartirilganda ushbu menyu avtomatik real-vaqtda yangilanadi.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                callWaiterFromTable(currentTableContext);
                setWaiterCalledBanner(true);
                setTimeout(() => setWaiterCalledBanner(false), 3500);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer shrink-0 ${
                waiterCalledBanner
                  ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-neutral-950 shadow-amber-500/20'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{waiterCalledBanner ? 'Ofitsiantga yetkazildi!' : 'Ofitsiantni Chaqirish'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          1. HERO SECTION (Matching Screenshot 1)
          ======================================================== */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 py-16 overflow-hidden border-b border-[#1a1c27]">
        {/* Background Image with Dark Contrast Scrim */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url(${restaurantInteriorImg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-[#07080c]" />
        </div>

        {/* Ambient Warm Golden Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Top Badge: "Toshkentning eng nufuzli milliy & premium restorani" */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 text-xs sm:text-sm font-medium tracking-wide mb-6 shadow-[0_0_20px_rgba(249,115,22,0.15)] animate-fade-in">
            <span className="text-amber-400">✨</span>
            <span>Toshkentning eng nufuzli milliy & premium restorani</span>
            <span className="text-amber-400">✨</span>
          </div>

          {/* Large Serif Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight leading-[1.15] mb-6 text-balance">
            Sharqona Mehmondo‘stlik & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Yuksak Gastronomik San’at
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl leading-relaxed mb-8">
            Asil o‘zbek milliy taomlari va xalqaro lazzatlar uyg‘unligi. Tandirda pishgan barra qozon kabob, G‘ijduvon shashligi va Gaziantep pista baklavasi sizni kutmoqda.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => scrollToSection('menyu')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(249,115,22,0.35)] flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Katta Menyuni Ko‘rish</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => scrollToSection('bron')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-neutral-700 hover:border-neutral-500 font-semibold text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-orange-400" />
              <span>Stol Bron Qilish</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Badges Row Below Hero (Matching Screenshot 1) */}
        <div className="relative z-10 w-full max-w-5xl mx-auto mt-14 pt-8 border-t border-neutral-800/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-[#12141f]/70 backdrop-blur-md border border-[#222638] rounded-2xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-400 mb-0.5">
                4.9 / 5.0
              </div>
              <div className="text-xs text-neutral-400 font-medium">
                500+ mamnun mehmonlar
              </div>
            </div>

            <div className="bg-[#12141f]/70 backdrop-blur-md border border-[#222638] rounded-2xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400 mb-0.5">
                100% Halol
              </div>
              <div className="text-xs text-neutral-400 font-medium">
                Eng toza barra go'shtlar
              </div>
            </div>

            <div className="bg-[#12141f]/70 backdrop-blur-md border border-[#222638] rounded-2xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-orange-400 mb-0.5">
                50+ Xil
              </div>
              <div className="text-xs text-neutral-400 font-medium">
                Nafis taomlar & ichimliklar
              </div>
            </div>

            <div className="bg-[#12141f]/70 backdrop-blur-md border border-[#222638] rounded-2xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-300 mb-0.5">
                15+ Yillik
              </div>
              <div className="text-xs text-neutral-400 font-medium">
                Tajribali bosh oshpazlar
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. KATTA MENYU SECTION (Matching Screenshots 2, 3, 4, 5)
          ======================================================== */}
      <section id="menyu" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-950/60 border border-orange-500/30 text-orange-400 text-xs font-mono font-semibold tracking-wider uppercase mb-3">
            KATTA MENYU & NARXLAR
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-3">
            Savoria Restorani Shohona Menyusi
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            Har bir taom eng sara yangi masalliqlardan, oshpazlarimizning ko'p yillik maxfiy retseptlari asosida mehr bilan tayyorlanadi.
          </p>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-[#0f111a] p-3 rounded-2xl border border-[#1e2235]">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Taom, shashlik yoki shirinlik nomini yozing..."
              className="w-full bg-[#161824] border border-[#24293f] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-neutral-400 whitespace-nowrap hidden sm:inline">Saralash:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#161824] border border-[#24293f] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="recommended">Tavsiya etilgan</option>
              <option value="price_asc">Narx: Arzondan qimmatga</option>
              <option value="price_desc">Narx: Qimmatdan arzonga</option>
              <option value="rating">Reyting bo'yicha</option>
            </select>
          </div>
        </div>

        {/* Category Tabs (Scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin scrollbar-thumb-neutral-800">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                    : 'bg-[#12141f] text-neutral-400 hover:text-white hover:bg-[#1a1c2b] border border-[#202436]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 4-Column Dish Cards Grid (Matching Screenshots 2, 3, 4, 5) */}
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-16 bg-[#10121b] border border-[#1e2233] rounded-3xl p-8">
            <Utensils className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-white mb-1">Taom topilmadi</h3>
            <p className="text-xs text-neutral-400 mb-4">Qidiruv so'zini o'zgartirib ko'ring yoki boshqa toifani tanlang.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('barchasi'); }}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold"
            >
              Barcha taomlarni ko'rish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredAndSortedItems.map((item) => {
              const inCartQty = getItemCartQuantity(item.id);
              return (
                <div
                  key={item.id}
                  className="group bg-[#0e1019] rounded-2xl border border-[#1d2133] hover:border-orange-500/50 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                >
                  {/* Dish Image Container */}
                  <div 
                    onClick={() => {
                      setDetailModalItem(item);
                      setModalQuantity(1);
                    }}
                    className="relative aspect-[4/3] w-full overflow-hidden cursor-pointer bg-[#151724]"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay for bottom badges readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Badges (Hit Taom / Spicy) */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                      {item.isHit && (
                        <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-bold tracking-wide uppercase shadow-md flex items-center gap-1">
                          🔥 HIT TAOM
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="px-2 py-1 rounded-md bg-rose-600 text-white text-[10px] font-bold shadow-md">
                          🌶️ Achchiq
                        </span>
                      )}
                    </div>

                    {/* Bottom Image Overlays: Weight & Time */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white font-medium z-10">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 flex items-center gap-1">
                        <span>⚖️</span>
                        <span>{item.weightGrams || 350}g</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{item.prepTimeMinutes || 15}–{(item.prepTimeMinutes || 15) + 5} daq</span>
                      </span>
                    </div>
                  </div>

                  {/* Dish Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Rating and Reviews link */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{item.rating || 4.9}</span>
                          <span className="text-neutral-500 font-normal">
                            ({item.reviewsCount || 85} ta sharh)
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setDetailModalItem(item);
                            setModalQuantity(1);
                          }}
                          className="text-neutral-400 hover:text-orange-400 text-[11px] font-medium transition-colors"
                        >
                          💬 Sharhlar
                        </button>
                      </div>

                      {/* Dish Name */}
                      <h3 
                        onClick={() => {
                          setDetailModalItem(item);
                          setModalQuantity(1);
                        }}
                        className="font-serif font-bold text-base text-white hover:text-orange-400 transition-colors cursor-pointer line-clamp-1 mb-1.5"
                      >
                        {item.name}
                      </h3>

                      {/* Description */}
                      <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2 mb-3">
                        {item.description}
                      </p>

                      {/* Ingredients chips */}
                      {item.ingredients && item.ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.ingredients.slice(0, 3).map((ing, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-0.5 rounded bg-[#161928] text-neutral-300 text-[10px] border border-[#25293d]"
                            >
                              {ing}
                            </span>
                          ))}
                          {item.ingredients.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded bg-[#161928] text-neutral-500 text-[10px]">
                              +{item.ingredients.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Price & Action Row */}
                    <div className="pt-3 border-t border-[#181a28] flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] uppercase font-mono text-neutral-500 font-semibold">
                          NARXI:
                        </div>
                        <div className="font-serif font-bold text-sm sm:text-base text-white">
                          {formatUZS(item.price)}
                        </div>
                      </div>

                      {/* Add to Cart or Quantity Adjuster */}
                      {inCartQty === 0 ? (
                        <button
                          onClick={() => addToCart(item, 1)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs tracking-wide transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Qo‘shish</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-orange-950/80 border border-orange-500/60 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-lg bg-orange-600/40 text-orange-200 hover:bg-orange-600 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-orange-400 px-1 font-mono">
                            {inCartQty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-orange-600 text-white hover:bg-orange-500 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================
          3. FALSAFAMIZ & TARIXIMIZ SECTION (Matching Screenshots 6, 7)
          ======================================================== */}
      <section id="restoran" className="py-16 sm:py-24 bg-[#0a0c13] border-y border-[#181a27] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-950/60 border border-orange-500/30 text-orange-400 text-xs font-mono font-semibold tracking-wider uppercase mb-3">
              FALSAFAMIZ & TARIXIMIZ
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
              Savoria Restaurant — Nafislik va Mehmondo‘stlik Makoni
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 italic font-serif leading-relaxed">
              «Savoria» — bu shunchaki dasturxon emas. Bu oila davrasi, do'stona suhbatlar va yuksak gastronomiya san'ati birlashgan shukuhli dargohdir.
            </p>
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-16">
            {/* Left Column: Story & Highlights */}
            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                An’analarimiz va Asl Ta’mlar Uyg‘unligi
              </h3>

              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                2011-yildan buyon «Savoria» restorani Toshkent shahrida haqiqiy sharqona mehmondo'stlik va jahon andozalaridagi servis madaniyatini namoyish etib kelmoqda. Biz har tong eng barra, saralangan go'sht va tabiiy sabzavotlarni shaxsan tekshirib qabul qilamiz.
              </p>

              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                Bizning maqsadimiz — har bir mehmonimizga nafaqat mazali taom ulashish, balki ularga unutilmas iliq xotiralar, shinam muhit va qadrdonlik hissini taqdim etishdir. Maxsus tandirlarimizda damlangan qozon kabob va ochiq mangaldagi shashliklarimiz esa restoranimizning faxridir.
              </p>

              {/* 2 Highlight Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#121522] border border-[#202538]">
                  <div className="flex items-center gap-2 text-emerald-400 font-serif font-bold text-lg mb-1">
                    <ShieldCheck className="w-5 h-5" />
                    <span>100% Halol Kafolati</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-normal">
                    Barcha go'sht va masalliqlar qat'iy halol sertifikatiga ega va mutaxassislar nazoratida.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#121522] border border-[#202538]">
                  <div className="flex items-center gap-2 text-orange-400 font-serif font-bold text-lg mb-1">
                    <Building2 className="w-5 h-5" />
                    <span>200+ O‘rin Sig‘imi</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-normal">
                    Keng hashamatli zal, panoramik terassa va alohida VIP xonalar qulayligi.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: 2x2 Photo Gallery */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#141624]">
                <img 
                  src={restaurantInteriorImg} 
                  alt="Asosiy Hashamatli Zal"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute bottom-2.5 left-2.5 text-xs font-semibold text-white">
                  Asosiy Hashamatli Zal
                </span>
              </div>

              <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#141624]">
                <img 
                  src={kozaShorvaImg} 
                  alt="Tandir & Ochiq Oshxona"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute bottom-2.5 left-2.5 text-xs font-semibold text-white">
                  Tandir & Ochiq Oshxona
                </span>
              </div>

              <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#141624]">
                <img 
                  src={vipHallImg} 
                  alt="VIP Shodlik Xonasi"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute bottom-2.5 left-2.5 text-xs font-semibold text-white">
                  VIP Shodlik Xonasi
                </span>
              </div>

              <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#141624]">
                <img 
                  src={gijduvonShashlikImg} 
                  alt="Yozgi Shiypon & Terassa"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute bottom-2.5 left-2.5 text-xs font-semibold text-white">
                  Yozgi Shiypon & Terassa
                </span>
              </div>
            </div>
          </div>

          {/* 6 Feature Cards: "Siz Uchun Yaratilgan Barcha Qulayliklar" (Screenshot 7) */}
          <div className="pt-8 border-t border-[#1b1f2e]">
            <h3 className="text-center text-xl sm:text-2xl font-serif font-bold text-white mb-8">
              Siz Uchun Yaratilgan Barcha Qulayliklar
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-[#0e111a] border border-[#1f2334] flex items-start gap-4">
                <div className="p-3 rounded-xl bg-orange-600/15 text-orange-400 border border-orange-500/30 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-white mb-1">100% Halol Kafolati</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Barcha taomlarimiz va go'sht mahsulotlari halol sertifikatiga ega va qat'iy tekshiruvdan o'tadi.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0e111a] border border-[#1f2334] flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-600/15 text-amber-400 border border-amber-500/30 shrink-0">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-white mb-1">Jonli Musiqa Oqshomi</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Har juma, shanba va yakshanba oqshomlarida milliy va jahon klassik musiqalari jonli ijro etiladi.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0e111a] border border-[#1f2334] flex items-start gap-4">
                <div className="p-3 rounded-xl bg-rose-600/15 text-rose-400 border border-rose-500/30 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-white mb-1">VIP Xonalar & Zallar</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Muhim tadbirlar, oilaviy marosimlar va biznes muzokaralar uchun alohida qulay xonalar.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0e111a] border border-[#1f2334] flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-white mb-1">Oliy Darajali Xizmat</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Malakali ofitsiantlar, tezkor xizmat va har bir mehmonga individual samimiy e'tibor.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0e111a] border border-[#1f2334] flex items-start gap-4">
                <div className="p-3 rounded-xl bg-sky-600/15 text-sky-400 border border-sky-500/30 shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-white mb-1">Qulay Avtoturargoh</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Restoran mehmonlari uchun keng, xavfsiz va qo'riqlanadigan bepul avtoturargoh mavjud.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0e111a] border border-[#1f2334] flex items-start gap-4">
                <div className="p-3 rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shrink-0">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-white mb-1">Namozxona & Wi-Fi</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Ayollar va erkaklar uchun alohida tahoratxona, shinam namozxona va tezyurar Wi-Fi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. MAHORATLI USTOZLAR (CHEFS) SECTION (Matching Screenshots 7, 8)
          ======================================================== */}
      <section id="oshpazlar" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-950/60 border border-orange-500/30 text-orange-400 text-xs font-mono font-semibold tracking-wider uppercase mb-3">
            MAHORATLI USTOZLAR
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-3">
            Bizning Professional Oshpazlarimiz
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            Ko‘p yillik xalqaro tajribaga ega mohir ustalar siz uchun har bir taomni shoh asarga aylantiradi.
          </p>
        </div>

        {/* 3 Chef Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {chefs.map((chef) => (
            <div 
              key={chef.id}
              className="bg-[#0e1019] rounded-2xl border border-[#1d2133] hover:border-orange-500/40 transition-all duration-300 overflow-hidden flex flex-col group shadow-lg"
            >
              {/* Chef Photo with Experience Badge */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#141724]">
                <img 
                  src={chef.image} 
                  alt={chef.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Experience Badge on Photo */}
                <div className="absolute bottom-3 left-3 z-10">
                  <span className="px-3 py-1 rounded-lg bg-orange-600 text-white text-xs font-bold shadow-md">
                    {chef.experienceYears} yillik tajriba
                  </span>
                </div>
              </div>

              {/* Chef Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-white mb-0.5">
                    {chef.name}
                  </h3>
                  <div className="text-xs font-medium text-orange-400 mb-3 font-mono">
                    {chef.role}
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed mb-4">
                    {chef.experienceBio}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#181a28]">
                  <div className="text-[10px] uppercase font-mono text-neutral-500 font-semibold mb-1.5">
                    MUTAXASSISLIGI:
                  </div>
                  <div className="text-xs text-neutral-300 font-medium">
                    {chef.specialty}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          5. ONLINE STOL BRON QILISH SECTION (Matching Screenshot 8)
          ======================================================== */}
      <section id="bron" className="py-16 sm:py-24 bg-[#0a0c13] border-y border-[#181a27] scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-950/60 border border-orange-500/30 text-orange-400 text-xs font-mono font-semibold tracking-wider uppercase mb-3">
              ONLINE STOL BRON QILISH
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-3">
              O‘zingiz Uchun Eng Shinam Stolni Tanlang
            </h2>
            <p className="text-sm sm:text-base text-neutral-400">
              Oilaviy oqshom, do'stona uchrashuv yoki biznes tushlik uchun joyingizni oldindan band qiling.
            </p>
          </div>

          {/* Reservation Card Form */}
          <div className="bg-[#0f111a] rounded-3xl border border-[#202538] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {lastConfirmedReservation ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
                  Stol Muvaffaqiyatli Band Qilindi!
                </h3>
                <p className="text-sm text-neutral-300 max-w-md mx-auto mb-6">
                  Hurmatli <span className="text-amber-400 font-semibold">{lastConfirmedReservation.guestName}</span>, 
                  sizning {lastConfirmedReservation.date} soat {lastConfirmedReservation.time} uchun {lastConfirmedReservation.guestsCount} kishilik stollaringiz qabul qilindi.
                </p>

                <div className="inline-block bg-[#161928] border border-[#252a40] rounded-2xl p-4 text-left text-xs mb-6 max-w-md w-full">
                  <div className="flex justify-between py-1 border-b border-[#202436]">
                    <span className="text-neutral-400">Bron raqami:</span>
                    <span className="font-mono font-bold text-white">{lastConfirmedReservation.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#202436]">
                    <span className="text-neutral-400">Zal / Joy:</span>
                    <span className="font-medium text-orange-400">{lastConfirmedReservation.zone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#202436]">
                    <span className="text-neutral-400">Telefon:</span>
                    <span className="font-mono text-white">{lastConfirmedReservation.guestPhone}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-400">Holat:</span>
                    <span className="font-bold text-emerald-400">Tasdiqlandi ✓</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setLastConfirmedReservation(null)}
                    className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors"
                  >
                    Yangi bron qilish
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateReservation} className="space-y-6">
                {/* Inputs: Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Ismingiz *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={resName}
                        onChange={(e) => setResName(e.target.value)}
                        placeholder="Masalan: Jamshid Karimov"
                        className="w-full bg-[#161824] border border-[#24293f] rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Telefon Raqamingiz *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={resPhone}
                        onChange={(e) => setResPhone(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        className="w-full bg-[#161824] border border-[#24293f] rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Zal Tanlash (3 Segmented Buttons matching Screenshot 8) */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-2">
                    Zal Tanlang *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'Asosiy Zal' as const, title: 'Asosiy Zal', desc: '1-qavat, jonli musiqa' },
                      { id: 'Yozgi Shiypon (Terassa)' as const, title: 'Yozgi Shiypon', desc: 'Terassa, toza havo' },
                      { id: 'VIP Alohida Xona' as const, title: 'VIP Alohida Xona', desc: 'Maxfiy va shinam' },
                    ].map((z) => (
                      <button
                        type="button"
                        key={z.id}
                        onClick={() => setResZone(z.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          resZone === z.id
                            ? 'bg-orange-950/60 border-orange-500 text-white shadow-md'
                            : 'bg-[#151724] border-[#22273d] text-neutral-400 hover:text-white hover:bg-[#1a1c2b]'
                        }`}
                      >
                        <div className={`text-xs font-bold mb-0.5 ${resZone === z.id ? 'text-orange-400' : 'text-white'}`}>
                          {z.title}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {z.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mehmonlar soni, Sana va Vaqt */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Mehmonlar soni */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Mehmonlar soni *
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[2, 4, 6, 8].map(count => (
                        <button
                          type="button"
                          key={count}
                          onClick={() => setResGuests(count)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            resGuests === count
                              ? 'bg-orange-600 border-orange-500 text-white'
                              : 'bg-[#161824] border-[#24293f] text-neutral-300 hover:text-white'
                          }`}
                        >
                          {count}{count === 8 ? '+' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sana */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Sana *
                    </label>
                    <select
                      value={resDate}
                      onChange={(e) => setResDate(e.target.value)}
                      className="w-full bg-[#161824] border border-[#24293f] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="Bugun">Bugun</option>
                      <option value="Ertaga">Ertaga</option>
                      <option value="Indinga">Indinga</option>
                      <option value="Shanba oqshomi">Shanba oqshomi</option>
                      <option value="Yakshanba oqshomi">Yakshanba oqshomi</option>
                    </select>
                  </div>

                  {/* Vaqt */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Vaqt *
                    </label>
                    <select
                      value={resTime}
                      onChange={(e) => setResTime(e.target.value)}
                      className="w-full bg-[#161824] border border-[#24293f] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="12:00">12:00 (Tushlik)</option>
                      <option value="13:30">13:30</option>
                      <option value="18:00">18:00 (Oqshom)</option>
                      <option value="19:00">19:00</option>
                      <option value="19:30">19:30 (Jonli musiqa)</option>
                      <option value="20:30">20:30</option>
                      <option value="21:30">21:30</option>
                    </select>
                  </div>
                </div>

                {/* Qo'shimcha istaklar */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Qo‘shimcha istaklar (ixtiyoriy)
                  </label>
                  <textarea
                    rows={2}
                    value={resSpecialNotes}
                    onChange={(e) => setResSpecialNotes(e.target.value)}
                    placeholder="Masalan: Bolalar o'rindig'i kerak, tug'ilgan kun bezagi, deraza yonidagi stol..."
                    className="w-full bg-[#161824] border border-[#24293f] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>

                {/* Submit Button (Full Width Orange Button matching Screenshot 8) */}
                <button
                  type="submit"
                  disabled={reservationSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_30px_rgba(249,115,22,0.35)] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {reservationSubmitting ? (
                    <span>Tasdiqlanmoqda...</span>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Stolni Bron Qilish</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          6. MEHMONLARIMIZ FIKRLARI (REVIEWS) SECTION (Matching Screenshots 9, 10)
          ======================================================== */}
      <section id="fikrlar" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-950/60 border border-orange-500/30 text-orange-400 text-xs font-mono font-semibold tracking-wider uppercase mb-3">
            MEHMONLARIMIZ FIKRLARI
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-3">
            Mijozlarimiz Savoria Restorani Haqida
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            Biz har bir mehmonimizning xursand bo'lib ketishi va yana qaytib kelishi uchun chin dildan harakat qilamiz.
          </p>
        </div>

        {/* 3 Guest Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-14">
          {reviews.slice(0, 3).map((rev) => (
            <div 
              key={rev.id}
              className="bg-[#0e1019] rounded-2xl border border-[#1d2133] p-6 flex flex-col justify-between relative shadow-lg hover:border-orange-500/40 transition-all duration-300"
            >
              <div>
                {/* Quotation Mark */}
                <div className="text-4xl font-serif text-orange-500/30 leading-none mb-3">
                  “
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-neutral-700'}`} 
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                  {rev.comment}
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-[#181a28] flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-white">
                    {rev.authorName}
                  </h4>
                  <div className="text-[11px] text-neutral-400">
                    {rev.authorRole || 'Doimiy mehmon'}
                  </div>
                </div>

                <div className="text-[10px] text-neutral-500 font-mono">
                  {rev.date}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Review Form: "Fikringizni Qoldiring" (Screenshot 9) */}
        <div className="max-w-2xl mx-auto bg-[#0f111a] border border-[#202538] rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-white text-center mb-1">
            Fikringizni Qoldiring
          </h3>
          <p className="text-xs text-neutral-400 text-center mb-6">
            Sizning fikringiz biz uchun juda muhim va xizmat sifatini yanada oshirishga yordam beradi.
          </p>

          {reviewSubmittedSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs text-center font-medium animate-fade-in">
              Katta rahmat! Sizning sharhingiz muvaffaqiyatli qabul qilindi.
            </div>
          ) : (
            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Ismingiz *
                </label>
                <input
                  type="text"
                  required
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  placeholder="Ismingizni yozing"
                  className="w-full bg-[#161824] border border-[#24293f] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Baholash *
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= newReviewRating ? 'fill-current text-amber-400' : 'text-neutral-600'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    {newReviewRating}/5 {newReviewRating === 5 ? "O'ta a'lo" : "Yaxshi"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Fikringiz *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Restoran, taomlar va xizmat haqida o'z taassurotlaringizni yozing..."
                  className="w-full bg-[#161824] border border-[#24293f] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Sharhni yuborish</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ========================================================
          FLOATING CART DRAWER BUTTON (When items are in cart)
          ======================================================== */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-slide-up">
          <button
            onClick={() => setIsCartOpen(true)}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-[0_10px_35px_rgba(249,115,22,0.45)] hover:brightness-110 active:scale-95 flex items-center gap-3 border border-orange-400/30"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-black text-orange-400 font-mono font-black text-[10px] flex items-center justify-center">
                {totalCartCount}
              </span>
            </div>
            <span>Savatni Ko‘rish</span>
            <span className="font-mono text-orange-100 bg-black/30 px-2 py-0.5 rounded-md">
              {formatUZS(cartTotal)}
            </span>
          </button>
        </div>
      )}

      {/* ========================================================
          CART & CHECKOUT SLIDE-OVER DRAWER
          ======================================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          {/* Backdrop */}
          <div 
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-[#0d0f17] border-l border-[#24283b] h-full flex flex-col z-10 shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#1e2233] flex items-center justify-between bg-[#121420]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
                <h3 className="font-serif font-bold text-base text-white">
                  Sizning Buyurtmangiz ({totalCartCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg bg-[#181a28] border border-[#272b3c] text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-neutral-400">
                  <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm">Savatingiz hozircha bo'sh</p>
                  <p className="text-xs text-neutral-500 mt-1">Menyudan tansiq taomlarni tanlang</p>
                </div>
              ) : (
                cart.map(({ item, quantity, notes }) => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-xl bg-[#131522] border border-[#222638] flex items-center gap-3"
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-14 h-14 rounded-lg object-cover bg-[#1c2032] shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {item.name}
                      </h4>
                      <div className="text-xs font-mono font-bold text-orange-400 mt-0.5">
                        {formatUZS(item.price * quantity)}
                      </div>
                      {notes && (
                        <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                          {notes}
                        </div>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 bg-[#0a0c13] border border-[#24283a] rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-5 h-5 rounded bg-[#181a26] hover:bg-orange-600 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-bold font-mono px-1 text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-5 h-5 rounded bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Order Details Form */}
              {cart.length > 0 && (
                <div className="pt-3 space-y-3 border-t border-[#1e2233]">
                  {/* Order Type Toggle: Restoranda vs Dostavka */}
                  <div className="grid grid-cols-2 gap-2 bg-[#131522] p-1 rounded-xl border border-[#222638]">
                    <button
                      type="button"
                      onClick={() => setOrderType('zal')}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                        orderType === 'zal'
                          ? 'bg-orange-600 text-white shadow'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Restoranda (Stolga)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('dostavka')}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                        orderType === 'dostavka'
                          ? 'bg-orange-600 text-white shadow'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Yetkazib Berish
                    </button>
                  </div>

                  {/* Customer Information */}
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Ismingiz *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masalan: Sardor"
                      className="w-full bg-[#141624] border border-[#24293f] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Telefon raqamingiz *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full bg-[#141624] border border-[#24293f] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {orderType === 'zal' ? (
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Stol raqami *</label>
                      <select
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full bg-[#141624] border border-[#24293f] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      >
                        {tables.map(tbl => (
                          <option key={tbl.id} value={tbl.id}>
                            {tbl.name} ({tbl.zone})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Yetkazib berish manzili *</label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Toshkent sh., Chilonzor tumani..."
                          className="w-full bg-[#141624] border border-[#24293f] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Mo'ljal yoki izoh</label>
                        <input
                          type="text"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          placeholder="Domofon kodi, qavat..."
                          className="w-full bg-[#141624] border border-[#24293f] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Payment Method */}
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">To'lov usuli</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'uzcard_humo' as const, label: 'Uzcard/Humo' },
                        { id: 'payme_click' as const, label: 'Payme/Click' },
                        { id: 'naqd' as const, label: 'Naqd' },
                      ].map(p => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => setPaymentMethod(p.id)}
                          className={`py-1.5 rounded-lg text-[11px] font-medium border text-center transition-all ${
                            paymentMethod === p.id
                              ? 'bg-orange-600/30 border-orange-500 text-white font-bold'
                              : 'bg-[#141624] border-[#24293f] text-neutral-400 hover:text-white'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-[#1e2233] bg-[#10121d] space-y-2">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Taomlar jami:</span>
                    <span className="font-mono text-white">{formatUZS(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Xizmat haqi ({orderType === 'zal' ? settings.serviceFeePercent : 5}%):</span>
                    <span className="font-mono text-white">{formatUZS(serviceAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-[#1e2233]">
                    <span>Yakuniy summa:</span>
                    <span className="font-mono text-orange-400">{formatUZS(cartTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
                >
                  Buyurtmani Tasdiqlash
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          DISH DETAIL LIGHTBOX MODAL (When clicking photo or "Sharhlar")
          ======================================================== */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div 
            onClick={() => setDetailModalItem(null)}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="relative w-full max-w-lg bg-[#0e101a] border border-[#262b3f] rounded-3xl overflow-hidden shadow-2xl z-10">
            {/* Modal Image */}
            <div className="relative aspect-[16/10] w-full bg-[#141624]">
              <img 
                src={detailModalItem.image} 
                alt={detailModalItem.name} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e101a] via-transparent to-black/40" />

              <button
                onClick={() => setDetailModalItem(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute top-3 left-3 flex gap-2">
                {detailModalItem.isHit && (
                  <span className="px-3 py-1 rounded-md bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-bold shadow">
                    🔥 HIT TAOM
                  </span>
                )}
                {detailModalItem.isSpicy && (
                  <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-xs font-bold shadow">
                    🌶️ Achchiq
                  </span>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
                    {detailModalItem.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{detailModalItem.rating || 4.9}</span>
                    </div>
                    <span className="text-xs text-neutral-500">
                      ({detailModalItem.reviewsCount || 100} ta ijobiy sharh)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-neutral-500 font-mono uppercase">Narxi</div>
                  <div className="font-serif font-bold text-lg text-orange-400">
                    {formatUZS(detailModalItem.price)}
                  </div>
                </div>
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed">
                {detailModalItem.description}
              </p>

              {/* Specs: Weight, Calories, Prep Time */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#1e2235] text-center text-xs">
                <div>
                  <div className="text-neutral-500 text-[10px]">Vazni</div>
                  <div className="font-semibold text-white">{detailModalItem.weightGrams || 350}g</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-[10px]">Tayyorlanish</div>
                  <div className="font-semibold text-white">{detailModalItem.prepTimeMinutes || 15} daqiqa</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-[10px]">Kaloriya</div>
                  <div className="font-semibold text-white">{detailModalItem.calories || 450} kkal</div>
                </div>
              </div>

              {/* Ingredients */}
              {detailModalItem.ingredients && detailModalItem.ingredients.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-neutral-400 mb-2">Masalliqlar:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {detailModalItem.ingredients.map((ing, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-[#161928] border border-[#252a3d] text-xs text-neutral-300">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Input */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Oshxona uchun maxsus istak (masalan: ko'katlarsiz, zirasiz)
                </label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Izoh yozing..."
                  className="w-full bg-[#141624] border border-[#24293f] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Add to Cart Actions */}
              <div className="pt-2 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#141624] border border-[#24293f] rounded-xl p-1.5">
                  <button
                    onClick={() => setModalQuantity(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-[#1c2032] hover:bg-orange-600 text-white flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm px-2 text-white">
                    {modalQuantity}
                  </span>
                  <button
                    onClick={() => setModalQuantity(prev => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    addToCart(detailModalItem, modalQuantity, modalNotes);
                    setDetailModalItem(null);
                    setModalNotes('');
                  }}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
                >
                  Savatga Qo‘shish ({formatUZS(detailModalItem.price * modalQuantity)})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ORDER PLACED SUCCESS MODAL
          ======================================================== */}
      {showOrderSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div 
            onClick={() => setShowOrderSuccessModal(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <div className="relative w-full max-w-md bg-[#0e101a] border border-[#262b3f] rounded-3xl p-6 sm:p-8 text-center shadow-2xl z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
              Buyurtmangiz Qabul Qilindi!
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 mb-6 leading-relaxed">
              Buyurtmangiz to'g'ridan-to'g'ri oshxona va kassa tizimiga yuborildi. Oshpazlarimiz taomingizni tayyorlashni boshladilar.
            </p>

            {lastPlacedOrderId && (
              <div className="p-3 bg-[#141624] rounded-xl border border-[#24293f] text-xs font-mono mb-6">
                <span className="text-neutral-400">Buyurtma ID: </span>
                <span className="text-orange-400 font-bold">{lastPlacedOrderId}</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              {lastPlacedOrderId && (
                <button
                  onClick={() => {
                    const ord = orders.find(o => o.id === lastPlacedOrderId);
                    if (ord) openReceiptModal(ord);
                  }}
                  className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wide transition-colors"
                >
                  Elektron Chekni Ko‘rish
                </button>
              )}

              <button
                onClick={() => setShowOrderSuccessModal(false)}
                className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors"
              >
                Menyuga qaytish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
