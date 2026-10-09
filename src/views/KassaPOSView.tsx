import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem, ItemCategory, Order, PaymentMethod, OrderType } from '../types';
import { 
  CreditCard, Banknote, QrCode, Printer, Plus, Minus, Trash2, 
  Search, CheckCircle2, AlertCircle, Sparkles, Send,
  Users, RefreshCw, ChevronRight, X
} from 'lucide-react';

export const KassaPOSView: React.FC = () => {
  const { 
    menuItems, orders, createOrder, settleOrderPayment, 
    openReceiptModal, formatUZS, settings, updateOrderStatus,
    waiters
  } = useRestaurant();

  // Selected Table or Ticket
  const [selectedTable, setSelectedTable] = useState<string>('Stol #4 (Zal 1)');
  const [orderType, setOrderType] = useState<OrderType>('zal');
  const [activeTabCategory, setActiveTabCategory] = useState<ItemCategory | 'barchasi'>('barchasi');
  const [posSearch, setPosSearch] = useState('');
  
  // Working POS bill cart
  const [cartItems, setCartItems] = useState<{ item: MenuItem; quantity: number; notes?: string }[]>([]);
  const [waiterName, setWaiterName] = useState(waiters[0]?.name || 'Sardor Aliyev');
  const [guestName, setGuestName] = useState('Mijoz');

  const [guestPhone, setGuestPhone] = useState('+998 ');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [serviceFeeRate, setServiceFeeRate] = useState<number>(settings.serviceFeePercent / 100);

  // Existing selected active order if inspecting a table
  const [activeExistingOrderId, setActiveExistingOrderId] = useState<string | null>(null);

  const tables = [
    { id: 'Stol #1 (Zal 1)', name: 'Stol 1', capacity: '4 kishi', zone: 'Zal 1' },
    { id: 'Stol #2 (Zal 1)', name: 'Stol 2', capacity: '2 kishi', zone: 'Zal 1' },
    { id: 'Stol #3 (Zal 1)', name: 'Stol 3', capacity: '6 kishi', zone: 'Zal 1' },
    { id: 'Stol #4 (Zal 1)', name: 'Stol 4', capacity: '4 kishi', zone: 'Zal 1' },
    { id: 'Stol #5 (Zal 1)', name: 'Stol 5', capacity: '4 kishi', zone: 'Zal 1' },
    { id: 'VIP Kabinet #1', name: 'VIP 1', capacity: '10 kishi', zone: 'VIP' },
    { id: 'VIP Terrasa #2', name: 'VIP Terrasa', capacity: '8 kishi', zone: 'Terrasa' },
    { id: 'Bar stoli #3', name: 'Bar 3', capacity: '2 kishi', zone: 'Bar' },
  ];

  // Open unpaid table orders
  const openOrders = orders.filter(o => o.status !== 'yopildi');

  const getTableStatus = (tableId: string) => {
    return openOrders.find(o => o.tableNumber === tableId);
  };

  const handleSelectTable = (tableId: string) => {
    setSelectedTable(tableId);
    const existing = getTableStatus(tableId);
    if (existing) {
      setActiveExistingOrderId(existing.id);
    } else {
      setActiveExistingOrderId(null);
    }
  };

  const addItemToPOS = (item: MenuItem) => {
    if (!item.isAvailable) {
      alert('Ushbu taom hozirda sotuvda mavjud emas (Stop-list)');
      return;
    }
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

  const updateCartQty = (itemId: string, delta: number) => {
    setCartItems(prev => 
      prev
        .map(i => i.item.id === itemId ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const removeCartItem = (itemId: string) => {
    setCartItems(prev => prev.filter(i => i.item.id !== itemId));
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const subtotalAfterDiscount = subtotal - discountAmount;
  const serviceAmount = Math.round(subtotalAfterDiscount * serviceFeeRate);
  const finalTotal = subtotalAfterDiscount + serviceAmount;

  // Send to kitchen
  const handleSendToKitchen = () => {
    if (cartItems.length === 0) {
      alert('Kassaga hech qanday taom qo\'shilmagan');
      return;
    }

    const created = createOrder({
      type: orderType,
      tableNumber: orderType === 'zal' ? selectedTable : undefined,
      waiterName,
      customerName: guestName,
      customerPhone: guestPhone,
      items: cartItems.map(c => ({
        itemId: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity,
        station: c.item.station,
        notes: c.notes,
        isReady: false
      })),
      totalSubtotal: subtotal,
      serviceFeeRate,
      serviceFeeAmount: serviceAmount,
      discountRate: discountPercent / 100,
      discountAmount,
      finalTotal,
      isPaid: false,
      status: 'oshxonada'
    });

    setActiveExistingOrderId(created.id);
    setCartItems([]);
    alert(`Buyurtma #${created.id} oshxonaga yuborildi!`);
  };

  // Quick Settle Payment
  const handleSettlePayment = (method: PaymentMethod) => {
    // If active existing order selected, settle it
    if (activeExistingOrderId) {
      settleOrderPayment(activeExistingOrderId, method);
      const existing = orders.find(o => o.id === activeExistingOrderId);
      if (existing) {
        openReceiptModal({ ...existing, isPaid: true, paymentMethod: method });
      }
      setActiveExistingOrderId(null);
      return;
    }

    // Otherwise settle current cart items directly
    if (cartItems.length === 0) {
      alert('To\'lov uchun taomlar tanlanmagan');
      return;
    }

    const created = createOrder({
      type: orderType,
      tableNumber: orderType === 'zal' ? selectedTable : undefined,
      waiterName,
      customerName: guestName,
      customerPhone: guestPhone,
      items: cartItems.map(c => ({
        itemId: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity,
        station: c.item.station,
        notes: c.notes,
        isReady: true
      })),
      totalSubtotal: subtotal,
      serviceFeeRate,
      serviceFeeAmount: serviceAmount,
      discountRate: discountPercent / 100,
      discountAmount,
      finalTotal,
      isPaid: true,
      paymentMethod: method,
      status: 'yopildi'
    });

    settleOrderPayment(created.id, method);
    openReceiptModal(created);
    setCartItems([]);
  };

  const selectedExistingOrder = activeExistingOrderId 
    ? orders.find(o => o.id === activeExistingOrderId) 
    : null;

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#eaeaea] p-4 sm:p-6 flex flex-col gap-5">
      {/* Top POS Control Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-[#202332]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-wide">
              KASSA TERMINALI & CHEK TIZIMI
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5 font-mono">
            Smena: Ochiq · Kassir: {waiterName} · STIR: {settings.stir}
          </p>
        </div>

        {/* Table Selector Pills / Quick zone switch */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {tables.map(tbl => {
            const activeOrder = getTableStatus(tbl.id);
            const isSelected = selectedTable === tbl.id;
            return (
              <button
                key={tbl.id}
                onClick={() => handleSelectTable(tbl.id)}
                className={`px-3 py-2 rounded-lg border text-xs font-mono font-medium transition-all text-left whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#d4af37] text-neutral-950 border-[#d4af37] shadow-lg'
                    : activeOrder
                    ? 'bg-[#291e13] text-[#f5a623] border-[#5e4318]'
                    : 'bg-[#12141c] text-neutral-400 border-[#222535] hover:text-white'
                }`}
              >
                <div>
                  <div className="font-bold">{tbl.name}</div>
                  <div className="text-[10px] opacity-80">{activeOrder ? 'Band' : 'Bo\'sh'}</div>
                </div>
                {activeOrder && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Catalog + Right Check Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Menu Catalog (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Categories & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#11131b] p-3 rounded-xl border border-[#212433]">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {(['barchasi', 'asosiy', 'milliy', 'salatlar', 'ichimliklar', 'desertlar'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTabCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTabCategory === cat
                      ? 'bg-[#d4af37] text-neutral-950 font-bold'
                      : 'bg-[#171924] text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat === 'barchasi' ? 'Barchasi' : cat.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Tezkor qidiruv..."
                value={posSearch}
                onChange={e => setPosSearch(e.target.value)}
                className="w-full bg-[#0c0d13] border border-[#232737] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Catalog Fast Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto p-1">
            {menuItems
              .filter(item => {
                const matchCat = activeTabCategory === 'barchasi' || item.category === activeTabCategory;
                const matchSearch = item.name.toLowerCase().includes(posSearch.toLowerCase());
                return matchCat && matchSearch;
              })
              .map(item => (
                <button
                  key={item.id}
                  onClick={() => addItemToPOS(item)}
                  disabled={!item.isAvailable}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all group relative overflow-hidden ${
                    item.isAvailable
                      ? 'bg-[#13151f] border-[#222535] hover:border-[#d4af37] hover:bg-[#181a28]'
                      : 'bg-[#0f1017] border-neutral-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-white group-hover:text-[#d4af37] transition-colors line-clamp-2">
                      {item.name}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#d4af37] tabular-nums">
                      {formatUZS(item.price)}
                    </span>
                    <span className="w-6 h-6 rounded-md bg-[#1f2231] group-hover:bg-[#d4af37] group-hover:text-black flex items-center justify-center text-neutral-300 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              ))}
          </div>

          {/* Active Orders Quick Switcher */}
          <div className="bg-[#11131b] p-3 rounded-xl border border-[#212433]">
            <h4 className="text-xs font-mono font-semibold text-neutral-400 mb-2 flex items-center justify-between">
              <span>OCHIQ BUYURTMALAR ({openOrders.length})</span>
              <span className="text-[10px] text-neutral-500">Stolga bosing va to'lovni yoping</span>
            </h4>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {openOrders.length === 0 ? (
                <div className="text-xs text-neutral-500 py-1">Hozirda ochiq hisoblar yo'q</div>
              ) : (
                openOrders.map(ord => (
                  <button
                    key={ord.id}
                    onClick={() => {
                      setActiveExistingOrderId(ord.id);
                      if (ord.tableNumber) setSelectedTable(ord.tableNumber);
                    }}
                    className={`px-3 py-2 rounded-lg border text-left text-xs transition-colors shrink-0 ${
                      activeExistingOrderId === ord.id
                        ? 'bg-[#d4af37]/20 border-[#d4af37] text-white'
                        : 'bg-[#151722] border-[#262a3a] text-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 font-mono font-bold">
                      <span>{ord.id}</span>
                      <span className="text-[#d4af37]">{formatUZS(ord.finalTotal)}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      {ord.type === 'zal' ? ord.tableNumber : 'Dostavka'} · {ord.status.toUpperCase()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Bill / Receipt Register (5 cols) */}
        <div className="lg:col-span-5 bg-[#12141e] border border-[#26293a] rounded-xl p-4 sm:p-5 flex flex-col shadow-xl">
          {/* Header of Active Ticket */}
          <div className="pb-3 border-b border-[#232637] flex items-center justify-between">
            <div>
              <div className="font-serif font-bold text-sm text-white">
                {selectedExistingOrder ? `Hisob: ${selectedExistingOrder.id}` : `Yangi Chek: ${selectedTable}`}
              </div>
              <div className="text-[11px] font-mono text-neutral-400">
                {selectedExistingOrder ? selectedExistingOrder.tableNumber : orderType.toUpperCase()}
              </div>
            </div>

            {selectedExistingOrder ? (
              <button
                onClick={() => openReceiptModal(selectedExistingOrder)}
                className="px-2.5 py-1.5 rounded-lg bg-[#1f2233] hover:bg-[#2b3046] text-[#d4af37] text-xs font-semibold border border-[#d4af37]/30 transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Chekni Ko'rish</span>
              </button>
            ) : (
              <div className="flex items-center gap-1">
                {(['zal', 'olib_ketish', 'dostavka'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-semibold uppercase ${
                      orderType === t ? 'bg-[#d4af37] text-black' : 'bg-[#181a26] text-neutral-400'
                    }`}
                  >
                    {t === 'zal' ? 'Zal' : t === 'dostavka' ? 'Dostavka' : 'Olib ketish'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* If existing order is selected */}
          {selectedExistingOrder ? (
            <div className="py-4 space-y-4">
              <div className="p-3 rounded-lg bg-[#181a26] border border-[#282d3f] space-y-2">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Mijoz:</span>
                  <span className="text-white font-semibold">{selectedExistingOrder.customerName}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Holati:</span>
                  <span className="font-mono text-amber-400 font-bold uppercase">{selectedExistingOrder.status}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>To'lov holati:</span>
                  <span className={`font-mono font-bold ${selectedExistingOrder.isPaid ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedExistingOrder.isPaid ? 'TO\'LANGAN' : 'KUTILMOQDA (TO\'LANMAGAN)'}
                  </span>
                </div>
              </div>

              {/* Items List in existing order */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {selectedExistingOrder.items.map((item, idx) => (
                  <div key={idx} className="p-2 rounded bg-[#0d0e14] border border-[#202332] flex justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-[10px] text-neutral-400">{item.quantity} x {formatUZS(item.price)}</div>
                    </div>
                    <div className="font-mono font-bold text-white tabular-nums">
                      {formatUZS(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Existing Order Actions */}
              <div className="pt-3 border-t border-[#232637] space-y-3">
                <div className="flex justify-between text-sm font-bold text-white">
                  <span>JAMI TO'LOV:</span>
                  <span className="font-mono text-base text-[#d4af37]">{formatUZS(selectedExistingOrder.finalTotal)}</span>
                </div>

                {!selectedExistingOrder.isPaid ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSettlePayment('naqd')}
                      className="py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Banknote className="w-4 h-4" />
                      <span>Naqd Pulda Yopish</span>
                    </button>
                    <button
                      onClick={() => handleSettlePayment('uzcard_humo')}
                      className="py-2.5 rounded-lg bg-[#2e374d] hover:bg-[#3c4763] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-neutral-600"
                    >
                      <CreditCard className="w-4 h-4 text-[#d4af37]" />
                      <span>Uzcard / Humo</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-center text-emerald-400 text-xs font-semibold">
                    ✓ Hisob to'liq to'langan va chek chiqarilgan
                  </div>
                )}

                <button
                  onClick={() => setActiveExistingOrderId(null)}
                  className="w-full py-2 rounded-lg bg-[#181a26] text-neutral-400 hover:text-white text-xs transition-colors"
                >
                  Yangi chek kiritishga o'tish
                </button>
              </div>
            </div>
          ) : (
            /* New Ticket Cart Form */
            <div className="flex-1 flex flex-col justify-between pt-3">
              {/* Waiter Selection Header */}
              <div className="mb-2.5 pb-2 border-b border-[#202333] flex items-center justify-between gap-2 text-xs">
                <span className="text-neutral-400 font-medium">Ofitsiant:</span>
                <select
                  value={waiterName}
                  onChange={e => setWaiterName(e.target.value)}
                  className="bg-[#0b0c12] border border-[#272b3c] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {waiters.map(w => (
                    <option key={w.id} value={w.name}>
                      {w.name} ({w.assignedZone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Rows */}
              <div className="flex-1 max-h-72 overflow-y-auto space-y-2 pr-1">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 text-xs font-mono">
                    Buyurtmaga taom qo'shish uchun chap tomondagi menyudan tanlang
                  </div>
                ) : (
                  cartItems.map(({ item, quantity }) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-[#161824] border border-[#242838] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">{item.name}</div>
                        <div className="text-[11px] font-mono text-[#d4af37]">
                          {formatUZS(item.price)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-[#0c0d12] px-1.5 py-0.5 rounded border border-[#24283a]">
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="p-1 text-neutral-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-white px-1">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          className="p-1 text-neutral-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="font-mono font-bold text-white tabular-nums min-w-[70px] text-right">
                        {formatUZS(item.price * quantity)}
                      </div>

                      <button
                        onClick={() => removeCartItem(item.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Adjustments: Discount & Service */}
              <div className="pt-3 border-t border-[#232637] space-y-2 text-xs">
                {/* Discount Selectors */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Chegirma:</span>
                  <div className="flex items-center gap-1 font-mono">
                    {[0, 5, 10, 20].map(d => (
                      <button
                        key={d}
                        onClick={() => setDiscountPercent(d)}
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          discountPercent === d ? 'bg-[#d4af37] text-black font-bold' : 'bg-[#1a1c28] text-neutral-400'
                        }`}
                      >
                        {d}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service fee */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Xizmat haqi:</span>
                  <div className="flex items-center gap-1 font-mono">
                    {[0, 0.10, 0.12, 0.15].map(rate => (
                      <button
                        key={rate}
                        onClick={() => setServiceFeeRate(rate)}
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          serviceFeeRate === rate ? 'bg-[#d4af37] text-black font-bold' : 'bg-[#1a1c28] text-neutral-400'
                        }`}
                      >
                        {Math.round(rate * 100)}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtotals */}
                <div className="space-y-1 pt-2 border-t border-[#1d202e] font-mono text-[11px]">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal:</span>
                    <span>{formatUZS(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Chegirma ({discountPercent}%):</span>
                      <span>-{formatUZS(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-400">
                    <span>Xizmat ({Math.round(serviceFeeRate * 100)}%):</span>
                    <span>+{formatUZS(serviceAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-[#262a3d]">
                    <span>JAMI SUMMA:</span>
                    <span className="text-[#d4af37] text-base">{formatUZS(finalTotal)}</span>
                  </div>
                </div>

                {/* Primary POS Actions */}
                <div className="pt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSendToKitchen}
                    disabled={cartItems.length === 0}
                    className="py-2.5 rounded-lg bg-[#242738] hover:bg-[#31364d] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-[#393e56] disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Oshxonaga Yuborish</span>
                  </button>

                  <button
                    onClick={() => handleSettlePayment('naqd')}
                    disabled={cartItems.length === 0}
                    className="py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#e6c14c] text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Chek & To'lov</span>
                  </button>
                </div>

                {/* Payment split buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
                  <button
                    onClick={() => handleSettlePayment('uzcard_humo')}
                    disabled={cartItems.length === 0}
                    className="p-1.5 rounded bg-[#181a26] hover:bg-[#202333] border border-[#2a2e40] text-neutral-300 disabled:opacity-50"
                  >
                    Uzcard / Humo
                  </button>
                  <button
                    onClick={() => handleSettlePayment('payme_click')}
                    disabled={cartItems.length === 0}
                    className="p-1.5 rounded bg-[#181a26] hover:bg-[#202333] border border-[#2a2e40] text-neutral-300 disabled:opacity-50"
                  >
                    Payme / Click
                  </button>
                  <button
                    onClick={() => handleSettlePayment('visa')}
                    disabled={cartItems.length === 0}
                    className="p-1.5 rounded bg-[#181a26] hover:bg-[#202333] border border-[#2a2e40] text-neutral-300 disabled:opacity-50"
                  >
                    Visa / Master
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
