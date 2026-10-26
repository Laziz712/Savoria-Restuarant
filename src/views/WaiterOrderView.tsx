import React, { useState, useEffect, useCallback } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem, ItemCategory } from '../types';
import { 
  Users, Utensils, Plus, Minus, Send, CheckCircle2, 
  Search, ArrowLeft, Clock, Sparkles, AlertCircle, 
  Lock, KeyRound, LogOut, ShieldCheck, Delete, RotateCcw, Bell
} from 'lucide-react';

export const WaiterOrderView: React.FC = () => {
  const { 
    menuItems, waiters, createOrder, formatUZS, 
    settings, t, setRoute, openReceiptModal,
    currentLoggedInWaiter, waiterLoginByPin, waiterLogout,
    tables, waiterCallAlert, dismissWaiterCallAlert
  } = useRestaurant();

  // Phone Lock Screen Passcode State
  const [pinCode, setPinCode] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // Table Order State (Once Logged In)
  const [selectedTable, setSelectedTable] = useState<string>(tables[0]?.id || 'Stol #1 (Zal 1)');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'barchasi'>('barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [kitchenNotes, setKitchenNotes] = useState('');

  // Cart for this table ticket
  const [cartItems, setCartItems] = useState<{ item: MenuItem; quantity: number; notes?: string }[]>([]);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any>(null);
  const [successBanner, setSuccessBanner] = useState(false);

  const categories: { id: ItemCategory | 'barchasi'; label: string }[] = [
    { id: 'barchasi', label: t('cat_all') },
    { id: 'ichimliklar', label: t('cat_ichimliklar') },
    { id: 'asosiy', label: t('cat_asosiy') },
    { id: 'milliy', label: t('cat_milliy') },
    { id: 'salatlar', label: t('cat_salatlar') },
    { id: 'shorvalar', label: t('cat_shorvalar') },
    { id: 'qahva_choy', label: t('cat_qahva_choy') },
    { id: 'desertlar', label: t('cat_desertlar') },
  ];

  const filteredItems = menuItems.filter(item => {
    const matchCat = selectedCategory === 'barchasi' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Verify PIN whenever it reaches 4 digits
  const verifyPin = useCallback((pinToTest: string) => {
    const success = waiterLoginByPin(pinToTest);
    if (success) {
      setLoginError('');
      setPinCode('');
    } else {
      setIsShaking(true);
      setLoginError("Noto'g'ri PIN kod! Qayta urinib ko'ring.");
      setTimeout(() => {
        setIsShaking(false);
        setPinCode('');
      }, 400);
    }
  }, [waiterLoginByPin]);

  const handleKeyPress = (digit: string) => {
    if (pinCode.length >= 4) return;
    const nextPin = pinCode + digit;
    setPinCode(nextPin);
    setLoginError('');

    if (nextPin.length === 4) {
      setTimeout(() => {
        verifyPin(nextPin);
      }, 100);
    }
  };

  const handleBackspace = () => {
    setPinCode(prev => prev.slice(0, -1));
    setLoginError('');
  };

  const handleClear = () => {
    setPinCode('');
    setLoginError('');
  };

  // Physical Keyboard Input Support
  useEffect(() => {
    if (currentLoggedInWaiter) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pinCode, currentLoggedInWaiter]);

  const addItem = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.item.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQty = (itemId: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(i => i.item.id === itemId ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
  const serviceRate = settings.serviceFeePercent / 100;
  const serviceFee = Math.round(subtotal * serviceRate);
  const total = subtotal + serviceFee;
  const totalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleSendOrder = () => {
    if (!currentLoggedInWaiter) return;
    if (cartItems.length === 0) {
      alert('Iltimos, avval stol uchun taom yoki ichimlik tanlang');
      return;
    }

    const newOrder = createOrder({
      type: 'zal',
      tableNumber: selectedTable,
      waiterName: currentLoggedInWaiter.name,
      customerName: `${selectedTable} (${guestCount} kishi)`,
      customerPhone: currentLoggedInWaiter.phone || '+998 00 000 00 00',
      items: cartItems.map(c => ({
        itemId: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity,
        station: c.item.station,
        notes: kitchenNotes || undefined,
        isReady: false
      })),
      totalSubtotal: subtotal,
      serviceFeeRate: serviceRate,
      serviceFeeAmount: serviceFee,
      finalTotal: total,
      status: 'oshxonada',
      isPaid: false
    });

    setLastCreatedOrder(newOrder);
    setSuccessBanner(true);
    setCartItems([]);
    setKitchenNotes('');
  };

  // If NOT logged in as a waiter: Show Phone-Style Passcode Lock Screen
  if (!currentLoggedInWaiter) {
    const dialPadButtons = [
      { num: '1', letters: '' },
      { num: '2', letters: 'ABC' },
      { num: '3', letters: 'DEF' },
      { num: '4', letters: 'GHI' },
      { num: '5', letters: 'JKL' },
      { num: '6', letters: 'MNO' },
      { num: '7', letters: 'PQRS' },
      { num: '8', letters: 'TUV' },
      { num: '9', letters: 'WXYZ' },
    ];

    return (
      <div className="min-h-screen bg-[#07080c] text-[#eaeaea] p-4 flex items-center justify-center animate-fade-in select-none">
        {/* Smartphone Form-factor Card Container */}
        <div className="w-full max-w-[340px] sm:max-w-[380px] bg-[#0d0f17] border border-[#23283c] rounded-[42px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col items-center">
          {/* Top Speaker/Camera Bar (Phone Notch Aesthetic) */}
          <div className="w-24 h-4 bg-black/60 rounded-full mb-4 border border-white/5 flex items-center justify-center">
            <div className="w-10 h-1 bg-neutral-700/60 rounded-full" />
          </div>

          {/* Back button to Home view */}
          <button
            onClick={() => setRoute('mijoz')}
            className="absolute top-5 left-5 p-2 rounded-full bg-[#151825] text-neutral-400 hover:text-white border border-[#272b3e] transition-colors"
            title="Asosiy menyuga qaytish"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Terminal Monogram & Header */}
          <div className="text-center pt-1 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2a1d12] to-[#12141f] border border-orange-500/50 mx-auto flex items-center justify-center text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.25)] mb-3">
              <span className="font-serif font-bold text-2xl">S</span>
            </div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-white tracking-widest uppercase">
              OFITSIANT TERMINALI
            </h2>
            <p className="text-[11px] text-neutral-400 mt-1">
              Kirish uchun 4 xonali PIN kodni tering
            </p>
          </div>

          {/* 4 Passcode Indicator Dots (Phone Lock Screen Style) */}
          <div className={`flex items-center justify-center gap-5 my-4 ${isShaking ? 'animate-shake' : ''}`}>
            {[0, 1, 2, 3].map(i => {
              const isFilled = pinCode.length > i;
              return (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    isFilled
                      ? loginError
                        ? 'bg-rose-500 scale-125 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                        : 'bg-gradient-to-r from-orange-500 to-amber-400 scale-125 shadow-[0_0_12px_rgba(249,115,22,0.7)]'
                      : 'border-2 border-neutral-600 bg-transparent'
                  }`}
                />
              );
            })}
          </div>

          {/* Error Message if wrong code */}
          <div className="h-6 flex items-center justify-center mb-2">
            {loginError ? (
              <p className="text-rose-400 text-xs font-mono font-medium animate-fade-in flex items-center gap-1">
                <span>⚠️</span>
                <span>{loginError}</span>
              </p>
            ) : (
              <span className="text-[10px] text-neutral-500 font-mono">
                {pinCode.length === 0 ? 'Parol kutilmoqda...' : `${pinCode.length} / 4 kiritildi`}
              </span>
            )}
          </div>

          {/* Phone Numeric Keypad (Circular dial pad buttons) */}
          <div className="grid grid-cols-3 gap-3.5 sm:gap-4 my-2 w-full max-w-[270px]">
            {dialPadButtons.map(btn => (
              <button
                key={btn.num}
                type="button"
                onClick={() => handleKeyPress(btn.num)}
                className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-[#151724]/90 hover:bg-[#21263a] active:bg-orange-600/30 active:scale-95 border border-[#262b3e] flex flex-col items-center justify-center transition-all duration-150 cursor-pointer shadow-md group"
              >
                <span className="text-xl sm:text-2xl font-semibold text-white group-hover:text-orange-400 transition-colors leading-none">
                  {btn.num}
                </span>
                {btn.letters && (
                  <span className="text-[8px] font-mono tracking-widest text-neutral-500 group-hover:text-neutral-400 mt-0.5">
                    {btn.letters}
                  </span>
                )}
              </button>
            ))}

            {/* Bottom Row: Clear (C), 0, and Backspace */}
            <button
              type="button"
              onClick={handleClear}
              className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-[#151724]/40 hover:bg-[#21263a] active:scale-95 border border-transparent hover:border-[#262b3e] flex items-center justify-center text-xs font-semibold text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              Tozalash
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-[#151724]/90 hover:bg-[#21263a] active:bg-orange-600/30 active:scale-95 border border-[#262b3e] flex flex-col items-center justify-center transition-all duration-150 cursor-pointer shadow-md group"
            >
              <span className="text-xl sm:text-2xl font-semibold text-white group-hover:text-orange-400 transition-colors leading-none">
                0
              </span>
              <span className="text-[8px] font-mono text-neutral-500 mt-0.5">+</span>
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-[#151724]/40 hover:bg-[#21263a] active:scale-95 border border-transparent hover:border-[#262b3e] flex items-center justify-center text-neutral-400 hover:text-rose-400 transition-all cursor-pointer"
              title="O'chirish"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Once LOGGED IN: Full Waiter Order Taking Screen
  return (
    <div className="min-h-screen bg-[#08090e] text-[#eaeaea] p-3 sm:p-6 pb-24">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        {/* Table Calling Alert Banner if active */}
        {waiterCallAlert && (
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-pulse border border-amber-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-neutral-950/20 flex items-center justify-center text-neutral-950 shrink-0">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm">
                  🔔 Stol chaqiruvi: «{waiterCallAlert.table}» ofitsiantni kutmoqda!
                </div>
                <div className="text-[10px] font-medium opacity-90">
                  Mehmon stol ustidagi QR menyu orqali ofitsiant chaqiruvini yubordi.
                </div>
              </div>
            </div>
            <button
              onClick={dismissWaiterCallAlert}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-neutral-900 transition-colors shrink-0 shadow cursor-pointer"
            >
              Qabul qildim ✓
            </button>
          </div>
        )}

        {/* Top Header with Logged-in Waiter Info & Logout */}
        <div className="flex items-center justify-between pb-3 border-b border-[#212435] gap-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setRoute('mijoz')}
              className="p-1.5 rounded-lg bg-[#141624] text-neutral-400 hover:text-white border border-[#262a3d]"
              title="Asosiy menyuga o'tish"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <h1 className="font-serif font-bold text-base sm:text-lg text-white tracking-wide">
                  {currentLoggedInWaiter.name}
                </h1>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1e2335] text-[#d4af37] font-mono border border-[#303752]">
                  {currentLoggedInWaiter.assignedZone}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Stolni tanlang va buyurtmani Kassaga hamda Oshxonaga yuboring
              </p>
            </div>
          </div>

          {/* Smenani yopish / Chiqish */}
          <button
            onClick={waiterLogout}
            className="px-3 py-1.5 rounded-lg bg-[#241718] hover:bg-rose-950/60 text-rose-300 border border-rose-900/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Boshqa ofitsiantga almashtirish"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {successBanner && lastCreatedOrder && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-[#121f18] border border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white font-mono">
                  BUYURTMA #{lastCreatedOrder.id} KASSAGA VA OSHXONAGA YUBORILDI!
                </div>
                <div className="text-[11px] text-neutral-300 mt-0.5">
                  {lastCreatedOrder.tableNumber} · Ofitsiant: {lastCreatedOrder.waiterName} · Summa: {formatUZS(lastCreatedOrder.finalTotal)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => openReceiptModal(lastCreatedOrder)}
                className="px-3 py-1.5 rounded-lg bg-[#1a2e22] text-emerald-300 hover:text-white text-xs font-semibold border border-emerald-500/30 transition-colors"
              >
                Chekni ko'rish
              </button>
              <button
                onClick={() => setSuccessBanner(false)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-black text-xs font-bold hover:bg-emerald-500"
              >
                Keyingi Stol
              </button>
            </div>
          </div>
        )}

        {/* Table Selector Pills */}
        <div className="p-3 sm:p-4 rounded-xl bg-[#11131c] border border-[#212433] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 w-full">
            <label className="text-[11px] font-medium text-neutral-400 block mb-1">
              Stolni Tanlang *
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {tables.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTable(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${
                    selectedTable === t.id
                      ? 'bg-[#d4af37] text-neutral-950 shadow-md'
                      : 'bg-[#181a28] text-neutral-300 hover:text-white border border-[#262a3d]'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[11px] text-neutral-400">Mehmonlar:</span>
            <input
              type="number"
              min={1}
              max={20}
              value={guestCount}
              onChange={e => setGuestCount(Number(e.target.value))}
              className="w-16 bg-[#090a10] border border-[#262a3c] rounded-lg px-2 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Categories Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#11131c] p-3 rounded-xl border border-[#212433]">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#d4af37] text-neutral-950 font-bold shadow-md'
                    : 'bg-[#161824] text-neutral-400 hover:text-white border border-[#252839]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#090a10] border border-[#262a3c] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Menu Items Fast Touch Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredItems.map(item => {
            const inTicket = cartItems.find(i => i.item.id === item.id);
            return (
              <div
                key={item.id}
                onClick={() => addItem(item)}
                className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex flex-col justify-between ${
                  item.isAvailable
                    ? inTicket
                      ? 'bg-[#1a1c29] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                      : 'bg-[#12141f] border-[#222535] hover:border-neutral-600'
                    : 'bg-[#0f1017] border-neutral-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-semibold text-xs text-white line-clamp-2 leading-snug">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-1 uppercase">
                    {item.category === 'ichimliklar' ? '🍹 Ichimlik' : item.station.toUpperCase()}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#1d202d] flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#d4af37] tabular-nums">
                    {formatUZS(item.price)}
                  </span>

                  {inTicket ? (
                    <div
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1 bg-[#0c0d12] px-1.5 py-0.5 rounded border border-[#d4af37]/50"
                    >
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="p-1 text-neutral-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-[#d4af37] px-1">
                        {inTicket.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="p-1 text-neutral-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="w-6 h-6 rounded-md bg-[#1c1f2e] text-neutral-300 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Items Checkout Bar / Mobile Drawer */}
        {cartItems.length > 0 && (
          <div className="p-4 rounded-xl bg-[#11131c] border border-[#d4af37]/40 shadow-2xl space-y-3 mt-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#212433]">
              <div className="font-serif font-bold text-sm text-white">
                Stol Cheki: {selectedTable} ({totalQty} ta taom)
              </div>
              <div className="text-xs font-mono text-[#d4af37]">
                Ofitsiant: {currentLoggedInWaiter.name}
              </div>
            </div>

            {/* List */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {cartItems.map(({ item, quantity }) => (
                <div key={item.id} className="flex justify-between items-center py-1 border-b border-[#1c1e2b]">
                  <span className="text-white truncate max-w-[200px]">{quantity}x {item.name}</span>
                  <span className="font-mono text-[#d4af37] font-bold">{formatUZS(item.price * quantity)}</span>
                </div>
              ))}
            </div>

            {/* Kitchen Notes input */}
            <div>
              <input
                type="text"
                placeholder={t('kitchen_notes')}
                value={kitchenNotes}
                onChange={e => setKitchenNotes(e.target.value)}
                className="w-full bg-[#090a10] border border-[#272a3d] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {/* Total & Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-neutral-400">
                  {t('subtotal')} {formatUZS(subtotal)} + Xizmat ({settings.serviceFeePercent}%): {formatUZS(serviceFee)}
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {t('final_total')} <span className="text-[#d4af37]">{formatUZS(total)}</span>
                </div>
              </div>

              <button
                onClick={handleSendOrder}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c14c] text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{t('btn_send_kitchen_pos')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
