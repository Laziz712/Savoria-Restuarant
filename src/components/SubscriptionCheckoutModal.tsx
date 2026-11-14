import React, { useState, useEffect } from 'react';
import { 
  X, Check, Copy, CheckCircle2, AlertCircle, UploadCloud, 
  Sparkles, ShieldCheck, ArrowRight, ExternalLink, HelpCircle,
  FileCheck, Clock
} from 'lucide-react';
import { PlatformPricingConfig } from '../types';

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanMonths?: number;
  initialSlug?: string;
}

export const SubscriptionCheckoutModal: React.FC<SubscriptionCheckoutModalProps> = ({
  isOpen,
  onClose,
  initialPlanMonths = 12,
  initialSlug = ''
}) => {
  const [planMonths, setPlanMonths] = useState<number>(initialPlanMonths);
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState(initialSlug);
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [telegram, setTelegram] = useState('@');
  const [email, setEmail] = useState('');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');

  // Receipt image
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [fileName, setFileName] = useState('');

  // Card details
  const [copiedCard, setCopiedCard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Slug check
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [slugStatus, setSlugStatus] = useState<{ available: boolean; message: string } | null>(null);

  // Platform config
  const [pricingConfig, setPricingConfig] = useState<PlatformPricingConfig>({
    monthlyBasePrice: 399000,
    discount3MonthsPercent: 5,
    discount6MonthsPercent: 10,
    discount12MonthsPercent: 20,
    cardNumber: '4916 9903 6294 0907',
    cardHolder: 'SOHIBA SHOMURATOVA',
    telegramSupport: '@lazizshavkatov712'
  });

  useEffect(() => {
    fetch('/api/platform-config')
      .then(r => r.json())
      .then(data => {
        if (data && data.cardNumber) setPricingConfig(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialPlanMonths) setPlanMonths(initialPlanMonths);
  }, [initialPlanMonths]);

  // Clean slug auto-generation from restaurant name if empty
  const handleRestaurantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRestaurantName(val);
    if (!slug || slug === initialSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generated);
    }
  };

  // Live slug validation check
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugStatus(null);
      return;
    }

    const reserved = ['admin', 'demo', 'superadmin', 'api', 'login', 'buy', 'pricing', 'settings', 'order'];
    const clean = slug.toLowerCase().trim();

    if (reserved.includes(clean)) {
      setSlugStatus({ available: false, message: 'Bu nom tizim tomonidan band qilingan' });
      return;
    }

    const timer = setTimeout(() => {
      setIsSlugChecking(true);
      fetch(`/api/check-slug/${encodeURIComponent(clean)}`)
        .then(async (r) => {
          const text = await r.text();
          let res: any = null;
          try {
            res = text ? JSON.parse(text) : null;
          } catch {
            res = null;
          }
          if (!res) {
            throw new Error(`HTTP ${r.status}`);
          }
          setSlugStatus({ available: !!res.available, message: res.message || res.reason || (res.available ? 'Ushbu manzil bo\'sh' : 'Bu manzil band') });
        })
        .catch(() => {
          setSlugStatus(null);
        })
        .finally(() => setIsSlugChecking(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [slug]);

  if (!isOpen) return null;

  // Pricing calculation
  const baseMonthly = pricingConfig.monthlyBasePrice;
  const rawTotal = baseMonthly * planMonths;
  let discountPercent = 0;
  if (planMonths === 3) discountPercent = pricingConfig.discount3MonthsPercent;
  if (planMonths === 6) discountPercent = pricingConfig.discount6MonthsPercent;
  if (planMonths === 12) discountPercent = pricingConfig.discount12MonthsPercent;

  const discountAmount = Math.round((rawTotal * discountPercent) / 100);
  const finalPrice = rawTotal - discountAmount;

  const formatUZS = (val: number) => new Intl.NumberFormat('uz-UZ').format(val) + " so'm";

  const handleCopyCard = () => {
    const digitsOnly = pricingConfig.cardNumber.replace(/\s+/g, '');
    navigator.clipboard.writeText(digitsOnly);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError(null);

    if (!file.type.startsWith('image/')) {
      setFormError('Iltimos, faqat rasm faylini yuklang (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError('Rasm hajmi 10MB dan oshmasligi kerak');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const MAX_DIM = 1200;
          let width = img.width;
          let height = img.height;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setReceiptImage(canvas.toDataURL('image/jpeg', 0.78));
          } else {
            setReceiptImage(dataUrl);
          }
        } catch {
          setReceiptImage(dataUrl);
        }
      };
      img.onerror = () => setReceiptImage(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!restaurantName.trim()) {
      setFormError('Iltimos, restoran nomini kiriting');
      return;
    }
    if (!slug || slug.length < 3) {
      setFormError('Iltimos, kamida 3 belgidan iborat manzil (slug) tanlang');
      return;
    }
    if (slugStatus && !slugStatus.available) {
      setFormError('Iltimos, boshqa bo\'sh manzil (slug) tanlang');
      return;
    }
    if (!ownerName.trim()) {
      setFormError('Iltimos, egasining ismini kiriting');
      return;
    }
    if (!phone || phone.length < 9) {
      setFormError('Iltimos, telefon raqamingizni kiriting');
      return;
    }
    if (!adminPassword || adminPassword.length < 4) {
      setFormError('Iltimos, admin panel uchun kamida 4 belgili parol o\'ylab toping');
      return;
    }
    if (!receiptImage) {
      setFormError('Iltimos, to\'lov cheki (skrinshot) rasmini yuklang');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/subscription-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantName: restaurantName.trim(),
          slug: slug.toLowerCase().trim(),
          ownerName: ownerName.trim(),
          phone: phone.trim(),
          telegram: telegram.trim(),
          email: email.trim(),
          adminUsername: adminUsername.trim() || 'admin',
          adminPassword: adminPassword,
          planMonths,
          amount: finalPrice,
          receiptImage,
          cardNumber: pricingConfig.cardNumber,
          cardHolder: pricingConfig.cardHolder
        })
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (res.ok && data && (data.success || data.id || data.order?.id)) {
        setSubmittedOrder(data.order || data);
      } else {
        setFormError(
          data?.error ||
          (res.status === 413
            ? 'Rasm hajmi juda katta, kichikroq skrinshot yuklang.'
            : `So'rovni yuborishda xatolik yuz berdi (Kod: ${res.status}). Qaytadan urinib ko'ring.`)
        );
      }
    } catch {
      setFormError('Server bilan ulanishda xatolik. Internetni tekshirib qaytadan urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Telegram direct message text
  const telegramMessage = submittedOrder
    ? encodeURIComponent(
        `Assalomu alaykum Lazizbek! Men Savoria POS tizimiga obuna bo'lish uchun to'lov qildim.\n\n` +
        `🏢 Restoran: ${submittedOrder.tenantName}\n` +
        `🌐 Manzil: savoria-restaurant.uz/${submittedOrder.slug}\n` +
        `👤 Egasi: ${submittedOrder.ownerName} (${submittedOrder.phone})\n` +
        `💳 Tarif: ${submittedOrder.planMonths} oylik (${formatUZS(submittedOrder.amount)})\n` +
        `🧾 Buyurtma ID: #${submittedOrder.id}\n\n` +
        `Iltimos, to'lovni tasdiqlab tizimni faollashtirib bersangiz!`
      )
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-[#0d0f17] border border-[#d4af37]/40 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col my-6 max-h-[94vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#212538] bg-gradient-to-r from-[#171a2a] via-[#10121d] to-[#171a2a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#8d6f1a] flex items-center justify-center text-neutral-950 font-serif font-bold text-lg shadow-md">
              S
            </div>
            <div>
              <h2 className="font-serif font-bold text-white text-base sm:text-lg tracking-wide flex items-center gap-2">
                Savoria POS Obunasini Sotib Olish
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                  SaaS
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                O'z restoraningiz uchun to'liq avtomatlashtirilgan kassa va QR-menyu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white bg-[#171a28] hover:bg-[#23273c] border border-[#272b3f] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {submittedOrder ? (
            /* SUCCESS STATE */
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Buyurtma qabul qilindi: #{submittedOrder.id}
                </span>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-white mt-3">
                  To'lovingiz tekshirilmoqda!
                </h3>
                <p className="text-sm text-neutral-300 max-w-md mx-auto mt-2 leading-relaxed">
                  Hurmatli <strong>{submittedOrder.ownerName}</strong>! Sizning <strong>«{submittedOrder.tenantName}»</strong> restorani uchun so'rovingiz qabul qilindi.
                </p>
              </div>

              {/* Status card */}
              <div className="p-4 rounded-2xl bg-[#121522] border border-[#23283c] text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Tanlangan manzil:</span>
                  <span className="text-[#d4af37] font-mono font-bold">savoria-restaurant.uz/{submittedOrder.slug}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Tarif muddati:</span>
                  <span className="text-white font-semibold">{submittedOrder.planMonths} oylik obuna</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">To'lov summasi:</span>
                  <span className="text-emerald-400 font-bold">{formatUZS(submittedOrder.amount)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Holat:</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    Kutilmoqda (15 daqiqada tasdiqlanadi)
                  </span>
                </div>
              </div>

              {/* Direct Telegram Action button */}
              <div className="max-w-md mx-auto space-y-3">
                <p className="text-xs text-neutral-400">
                  ⚡ Jarayonni tezlashtirish uchun to'lov chekini Telegramda administratorga yuboring:
                </p>
                <a
                  href={`https://t.me/lazizshavkatov712?text=${telegramMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#229ED9] to-[#1E88E5] hover:brightness-110 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(34,158,217,0.3)] transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Telegram orqali chekni yuborish (@lazizshavkatov712)</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-[#171a28] hover:bg-[#202538] text-neutral-300 text-xs font-semibold transition-colors"
                >
                  Yopish
                </button>
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Select Subscription Tier */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-3">
                  1. Tarif muddatini tanlang:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { months: 3, discount: pricingConfig.discount3MonthsPercent, badge: 'Start' },
                    { months: 6, discount: pricingConfig.discount6MonthsPercent, badge: 'Optimal' },
                    { months: 12, discount: pricingConfig.discount12MonthsPercent, badge: 'Eng foydali', hit: true }
                  ].map(t => {
                    const total = baseMonthly * t.months;
                    const discount = Math.round((total * t.discount) / 100);
                    const price = total - discount;
                    const isSelected = planMonths === t.months;

                    return (
                      <div
                        key={t.months}
                        onClick={() => setPlanMonths(t.months)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#181a28] border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.25)] ring-1 ring-[#d4af37]'
                            : 'bg-[#10121d] border-[#222638] hover:border-[#383e58]'
                        }`}
                      >
                        {t.hit && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold text-[9px] uppercase tracking-wider shadow">
                            ★ {t.badge}
                          </span>
                        )}

                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">{t.months} oylik</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                              -{t.discount}%
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className="text-base sm:text-lg font-bold text-[#d4af37] font-mono block">
                              {formatUZS(price)}
                            </span>
                            <span className="text-[10px] text-neutral-400 line-through">
                              {formatUZS(total)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400">Oyiga:</span>
                          <span className="text-white font-mono">{formatUZS(Math.round(price / t.months))}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Restaurant & Domain Info */}
              <div className="space-y-4 pt-2 border-t border-[#1e2235]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                  2. Restoran ma'lumotlari:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">Restoran nomi *</label>
                    <input
                      type="text"
                      placeholder="Masalan: Flora Restoran"
                      required
                      value={restaurantName}
                      onChange={handleRestaurantNameChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121522] border border-[#23283c] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">
                      Sayt manzili (Slug) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="flora"
                        required
                        value={slug}
                        onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#121522] border text-sm font-mono text-[#d4af37] placeholder-neutral-500 focus:outline-none ${
                          slugStatus?.available
                            ? 'border-emerald-500/60'
                            : slugStatus?.available === false
                              ? 'border-rose-500/60'
                              : 'border-[#23283c] focus:border-[#d4af37]'
                        }`}
                      />
                      {isSlugChecking && (
                        <span className="absolute right-3 top-3 text-[10px] text-neutral-400 animate-spin">
                          ⌛
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-neutral-400 font-mono truncate">
                        savoria-restaurant.uz/{slug || '...'}
                      </span>
                      {slugStatus && (
                        <span className={slugStatus.available ? 'text-emerald-400' : 'text-rose-400'}>
                          {slugStatus.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">Egasining ismi *</label>
                    <input
                      type="text"
                      placeholder="Akmal Zokirov"
                      required
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121522] border border-[#23283c] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">Telefon raqam *</label>
                    <input
                      type="tel"
                      placeholder="+998 90 123 45 67"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121522] border border-[#23283c] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">Telegram username *</label>
                    <input
                      type="text"
                      placeholder="@akmal_restoran"
                      required
                      value={telegram}
                      onChange={e => setTelegram(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121522] border border-[#23283c] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {/* Admin credentials for their POS */}
                <div className="p-3.5 rounded-2xl bg-[#10121d] border border-[#202538] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      POS Admin Login *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0c13] border border-[#272b3d] text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      POS Admin Parol *
                    </label>
                    <input
                      type="password"
                      placeholder="Kamida 4 belgili parol"
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0c13] border border-[#272b3d] text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Card Payment Details */}
              <div className="space-y-4 pt-2 border-t border-[#1e2235]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                  3. To'lov ma'lumotlari:
                </label>

                {/* Luxury Card Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1c1f2e] via-[#121522] to-[#0d0f17] border border-[#d4af37]/40 shadow-lg relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-neutral-400">To'lov uchun Uzcard / Humo:</span>
                      <div className="text-lg sm:text-2xl font-mono font-bold text-white tracking-widest mt-1">
                        {pricingConfig.cardNumber}
                      </div>
                      <div className="text-xs text-neutral-300 font-medium mt-1">
                        Karta egasi: <strong className="text-amber-300">{pricingConfig.cardHolder}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCard}
                      className="px-4 py-2 rounded-xl bg-[#222638] hover:bg-[#2c324a] text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-[#3b415c] shrink-0 cursor-pointer"
                    >
                      {copiedCard ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#d4af37]" />}
                      <span>{copiedCard ? 'Nusxalandi!' : 'Kartani nusxalash'}</span>
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-neutral-400">To'lanishi lozim bo'lgan summa:</span>
                    <span className="text-lg sm:text-xl font-mono font-bold text-[#d4af37]">
                      {formatUZS(finalPrice)}
                    </span>
                  </div>
                </div>

                {/* Receipt Upload Box */}
                <div>
                  <label className="block text-xs text-neutral-300 mb-1.5">
                    To'lov cheki skrinshoti (rasmi) *
                  </label>
                  <label className="border-2 border-dashed border-[#2f354d] hover:border-[#d4af37]/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#10121d]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {receiptImage ? (
                      <div className="flex items-center gap-3 w-full">
                        <img 
                          src={receiptImage} 
                          alt="Chek" 
                          className="w-14 h-14 object-cover rounded-xl border border-white/20 shrink-0" 
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            Chek yuklandi
                          </p>
                          <p className="text-[11px] text-neutral-400 truncate">{fileName || 'chek_skrinshot.jpg'}</p>
                        </div>
                        <span className="text-xs text-amber-400 underline font-semibold shrink-0">Almashtirish</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-7 h-7 text-[#d4af37] mb-1" />
                        <span className="text-xs font-semibold text-white">Chek rasmini yuklash uchun bosing</span>
                        <span className="text-[10px] text-neutral-400 mt-0.5">PNG, JPG yoki WEBP (maks. 5MB)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Inline Error Banner */}
              {formError && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#e2bd44] to-[#d4af37] text-neutral-950 font-bold text-sm uppercase tracking-wider shadow-[0_10px_35px_rgba(212,175,55,0.35)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>So'rov yuborilmoqda...</span>
                  ) : (
                    <>
                      <span>To'lovni Tasdiqlashga Yuborish</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-neutral-400 mt-2">
                  🔒 Barcha to'lovlar xavfsiz qabul qilinadi va 15 daqiqa ichida faollashtiriladi.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
