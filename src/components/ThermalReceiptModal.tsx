import React, { useRef } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Printer, X, CheckCircle, Download, Share2 } from 'lucide-react';

export const ThermalReceiptModal: React.FC = () => {
  const { activeReceiptOrder, closeReceiptModal, settings, formatUZS } = useRestaurant();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!activeReceiptOrder) return null;

  const order = activeReceiptOrder;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const paymentLabel = {
    naqd: 'NAQD PUL (UZS)',
    uzcard_humo: 'UZCARD / HUMO BANK KARTASI',
    payme_click: 'PAYME / CLICK ONLINE',
    visa: 'VISA / MASTERCARD'
  }[order.paymentMethod || 'naqd'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#13151f] border border-[#2b2f42] rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#25283a] flex items-center justify-between bg-[#191b26]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-semibold text-white tracking-wide">
              Fiskal Chek — {order.id}
            </span>
          </div>
          <button
            onClick={closeReceiptModal}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0c0d12] flex justify-center">
          {/* Thermal Receipt Paper */}
          <div
            id="thermal-receipt-printable"
            ref={receiptRef}
            className="w-full max-w-[340px] bg-white text-black p-5 shadow-lg rounded-t-sm font-mono text-xs leading-relaxed border-t-4 border-neutral-900"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-neutral-400">
              <h2 className="font-serif font-bold text-base tracking-widest uppercase text-neutral-900">
                {settings.name}
              </h2>
              <p className="text-[10px] text-neutral-600 mt-0.5">{settings.slogan}</p>
              <p className="text-[10px] text-neutral-700 mt-1">{settings.address}</p>
              <p className="text-[10px] text-neutral-700 font-semibold">Tel: {settings.phone}</p>
              <p className="text-[10px] text-neutral-600">STIR (INN): {settings.stir}</p>
            </div>

            {/* Receipt Meta */}
            <div className="py-2.5 border-b border-dashed border-neutral-400 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-600">Chek raqami:</span>
                <span className="font-bold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Sana va vaqt:</span>
                <span>{formattedDate} {formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Buyurtma turi:</span>
                <span className="font-semibold uppercase">
                  {order.type === 'zal' ? `Zal (${order.tableNumber || 'Stol'})` : order.type === 'dostavka' ? 'Yetkazib berish (Dostavka)' : 'Olib ketish'}
                </span>
              </div>
              {order.waiterName && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Xizmat ko'rsatuvchi:</span>
                  <span>{order.waiterName}</span>
                </div>
              )}
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Mijoz:</span>
                  <span>{order.customerName} ({order.customerPhone})</span>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="pt-1 text-[10px] text-neutral-700">
                  <span className="font-semibold">Manzil: </span>
                  {order.deliveryAddress}
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-neutral-400">
              <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-neutral-300 text-neutral-800">
                <span className="w-1/2">NOMI / MIQDOR</span>
                <span className="w-1/4 text-right">NARXI</span>
                <span className="w-1/4 text-right">JAMI</span>
              </div>

              <div className="space-y-2 pt-1.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="font-semibold text-neutral-900 leading-snug">{item.name}</div>
                    <div className="flex justify-between text-neutral-600 text-[10px]">
                      <span>{item.quantity} dona x {new Intl.NumberFormat('uz-UZ').format(item.price)}</span>
                      <span className="font-semibold text-neutral-900 tabular-nums">
                        {new Intl.NumberFormat('uz-UZ').format(item.price * item.quantity)}
                      </span>
                    </div>
                    {item.notes && (
                      <div className="text-[9px] text-neutral-500 italic pl-1">
                        * {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations */}
            <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-600">Oraliq jami (Subtotal):</span>
                <span className="tabular-nums">{new Intl.NumberFormat('uz-UZ').format(order.totalSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Xizmat haqi ({Math.round(order.serviceFeeRate * 100)}%):</span>
                <span className="tabular-nums">{new Intl.NumberFormat('uz-UZ').format(order.serviceFeeAmount)}</span>
              </div>
              {order.discountAmount ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Chegirma:</span>
                  <span className="tabular-nums">-{new Intl.NumberFormat('uz-UZ').format(order.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between pt-1 border-t border-neutral-800 text-sm font-bold text-neutral-900">
                <span>JAMI TO'LOV:</span>
                <span className="tabular-nums">{formatUZS(order.finalTotal)}</span>
              </div>
            </div>

            {/* Payment & Fiscal Section */}
            <div className="py-2.5 border-b border-dashed border-neutral-400 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-600">To'lov holati:</span>
                <span className="font-bold text-emerald-700">
                  {order.isPaid ? 'TO\'LANGAN (MUVAFFAQIYATLI)' : 'KUTILMOQDA (TO\'LANMAGAN)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">To'lov usuli:</span>
                <span className="font-semibold">{paymentLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Fiskal ID:</span>
                <span className="font-mono">{order.fiscalReceiptNumber || 'UZ-FISC-' + order.id.replace('SAV-', '')}</span>
              </div>
            </div>

            {/* Fiscal Simulated QR & Barcode */}
            <div className="pt-3 pb-2 text-center">
              {/* Simulated QR Code matrix */}
              <div className="inline-block p-1 border border-neutral-300 bg-white mx-auto">
                <div className="w-20 h-20 bg-neutral-900 p-1 flex items-center justify-center">
                  <div className="w-full h-full bg-white flex flex-col justify-between p-1">
                    <div className="flex justify-between">
                      <div className="w-4 h-4 bg-black"></div>
                      <div className="w-2 h-2 bg-black"></div>
                      <div className="w-4 h-4 bg-black"></div>
                    </div>
                    <div className="flex justify-center items-center">
                      <div className="text-[7px] font-bold text-black font-sans">UZ SOLIQ</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-4 h-4 bg-black"></div>
                      <div className="w-2 h-2 bg-black"></div>
                      <div className="w-4 h-4 bg-black"></div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-neutral-500 mt-1 font-mono">
                soliq.uz elektron chek orqali tekshirish
              </p>
              <p className="text-[10px] text-neutral-700 mt-2 italic font-serif">
                "{settings.footerReceiptMessage}"
              </p>
              {settings.wifiPassword && (
                <p className="text-[9px] text-neutral-500 mt-0.5">
                  Wi-Fi: {settings.wifiPassword}
                </p>
              )}
            </div>

            {/* Serrated Cut Edge Decorative Effect */}
            <div className="h-2 w-full mt-2 bg-neutral-100 serrated-bottom border-t border-dashed border-neutral-300"></div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#191b26] border-t border-[#25283a] flex items-center justify-between gap-3">
          <div className="text-xs text-neutral-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>80mm Termal printerga tayyor</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText?.(
                  `Chek: ${order.id}\nRestoran: ${settings.name}\nSumma: ${formatUZS(order.finalTotal)}\nSana: ${formattedDate}`
                );
                alert('Chek ma\'lumotlari nusxalandi!');
              }}
              className="px-3 py-1.5 rounded-lg border border-[#30344a] text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Nusxa olish</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-[#d4af37] text-neutral-950 hover:bg-[#e5c04b] text-xs font-semibold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
            >
              <Printer className="w-4 h-4" />
              <span>Chekni chop etish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
