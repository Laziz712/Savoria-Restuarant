import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  Settings, Store, Phone, Mail, MapPin, Clock, Sparkles,
  FileText, KeyRound, CheckCircle2, AlertCircle, Save, Send, Instagram
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    currentTenant,
    updateTenantAdminPassword,
    tenantSlug,
    isReadOnlyMode
  } = useRestaurant();

  const [name, setName] = useState(settings.name || '');
  const [slogan, setSlogan] = useState(settings.slogan || '');
  const [bio, setBio] = useState(settings.bio || '');
  const [serviceFeePercent, setServiceFeePercent] = useState<number>(settings.serviceFeePercent ?? 10);
  const [stir, setStir] = useState(settings.stir || '');
  const [wifiPassword, setWifiPassword] = useState(settings.wifiPassword || '');

  const [address, setAddress] = useState(settings.address || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [email, setEmail] = useState(settings.email || '');
  const [telegram, setTelegram] = useState(settings.telegram || '');
  const [instagram, setInstagram] = useState(settings.instagram || '');

  const [workingDays, setWorkingDays] = useState(settings.workingDays || '');
  const [workingHours, setWorkingHours] = useState(settings.workingHours || '');
  const [specialHoursLabel, setSpecialHoursLabel] = useState(settings.specialHoursLabel || '');
  const [specialHoursValue, setSpecialHoursValue] = useState(settings.specialHoursValue || '');
  const [eventsTitle, setEventsTitle] = useState(settings.eventsTitle || '');
  const [eventsSchedule, setEventsSchedule] = useState(settings.eventsSchedule || '');

  const [heroBadge, setHeroBadge] = useState(settings.heroBadge || '');
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle || '');
  const [heroHighlight, setHeroHighlight] = useState(settings.heroHighlight || '');
  const [aboutTitle, setAboutTitle] = useState(settings.aboutTitle || '');
  const [aboutQuote, setAboutQuote] = useState(settings.aboutQuote || '');
  const [aboutDescription1, setAboutDescription1] = useState(settings.aboutDescription1 || '');
  const [aboutDescription2, setAboutDescription2] = useState(settings.aboutDescription2 || '');

  const [headerMessage, setHeaderMessage] = useState(settings.headerMessage || '');
  const [footerReceiptMessage, setFooterReceiptMessage] = useState(settings.footerReceiptMessage || '');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Sync local form fields whenever tenant settings hydrate or update
  useEffect(() => {
    setName(settings.name || '');
    setSlogan(settings.slogan || '');
    setBio(settings.bio || '');
    setServiceFeePercent(settings.serviceFeePercent ?? 10);
    setStir(settings.stir || '');
    setWifiPassword(settings.wifiPassword || '');

    setAddress(settings.address || '');
    setPhone(settings.phone || '');
    setEmail(settings.email || '');
    setTelegram(settings.telegram || '');
    setInstagram(settings.instagram || '');

    setWorkingDays(settings.workingDays || '');
    setWorkingHours(settings.workingHours || '');
    setSpecialHoursLabel(settings.specialHoursLabel || '');
    setSpecialHoursValue(settings.specialHoursValue || '');
    setEventsTitle(settings.eventsTitle || '');
    setEventsSchedule(settings.eventsSchedule || '');

    setHeroBadge(settings.heroBadge || '');
    setHeroTitle(settings.heroTitle || '');
    setHeroHighlight(settings.heroHighlight || '');
    setAboutTitle(settings.aboutTitle || '');
    setAboutQuote(settings.aboutQuote || '');
    setAboutDescription1(settings.aboutDescription1 || '');
    setAboutDescription2(settings.aboutDescription2 || '');

    setHeaderMessage(settings.headerMessage || '');
    setFooterReceiptMessage(settings.footerReceiptMessage || '');
  }, [settings]);

  const showBanner = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(prev => (prev?.text === text ? null : prev));
    }, 5000);
  };

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnlyMode) {
      showBanner('error', "Obuna muddati tugagan: faqat o'qish rejimi faol.");
      return;
    }
    if (!name.trim()) {
      showBanner('error', 'Restoran nomi kiritilishi shart.');
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings({
        name: name.trim(),
        slogan: slogan.trim(),
        bio: bio.trim(),
        serviceFeePercent: Number(serviceFeePercent) || 0,
        stir: stir.trim(),
        wifiPassword: wifiPassword.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        telegram: telegram.trim(),
        instagram: instagram.trim(),
        workingDays: workingDays.trim(),
        workingHours: workingHours.trim(),
        specialHoursLabel: specialHoursLabel.trim(),
        specialHoursValue: specialHoursValue.trim(),
        eventsTitle: eventsTitle.trim(),
        eventsSchedule: eventsSchedule.trim(),
        heroBadge: heroBadge.trim(),
        heroTitle: heroTitle.trim(),
        heroHighlight: heroHighlight.trim(),
        aboutTitle: aboutTitle.trim(),
        aboutQuote: aboutQuote.trim(),
        aboutDescription1: aboutDescription1.trim(),
        aboutDescription2: aboutDescription2.trim(),
        headerMessage: headerMessage.trim(),
        footerReceiptMessage: footerReceiptMessage.trim(),
      });
      showBanner('success', "Barcha restoran sozlamalari saqlandi va barcha qurilmalarda yangilandi!");
    } catch {
      showBanner('error', "Sozlamalarni saqlashda xatolik yuz berdi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnlyMode) {
      showBanner('error', "Obuna muddati tugagan: parolni o'zgartirish mumkin emas.");
      return;
    }
    if (newPassword.trim().length < 4) {
      showBanner('error', "Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      showBanner('error', "Parollar bir-biriga mos kelmadi.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const ok = await updateTenantAdminPassword(newPassword.trim());
      if (ok) {
        setNewPassword('');
        setConfirmPassword('');
        showBanner('success', "Admin kirish paroli muvaffaqiyatli yangilandi!");
      } else {
        showBanner('error', "Parolni yangilab bo'lmadi. Qaytadan urinib ko'ring.");
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const inputClass =
    'w-full bg-[#0a0b10] border border-[#2a2e41] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37] transition-colors';
  const labelClass = 'text-neutral-300 font-medium text-xs block mb-1.5';

  return (
    <div className="min-h-screen bg-[#08090d] text-[#eaeaea] p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f2231]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-wide">
              RESTORAN SOZLAMALARI & BRENDING
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              {currentTenant?.name || settings.name || 'Restoran'} · /{tenantSlug || 'demo'} — sayt matnlari, aloqa, ish vaqti, chek va parol
            </p>
          </div>
        </div>
      </div>

      {/* Inline Status Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main White-Label Settings Form */}
      <form onSubmit={handleSaveAllSettings} className="space-y-6">
        {/* 1. Asosiy Brend */}
        <section className="rounded-2xl bg-[#11131e] border border-[#23273a] p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1d2030]">
            <Store className="w-4 h-4 text-[#d4af37]" />
            <h2 className="font-serif font-bold text-base text-white">Asosiy Brend Ma'lumotlari</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Restoran Nomi *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Masalan: Flora Lounge & Cafe"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Shior / Slogan</label>
              <input
                type="text"
                value={slogan}
                onChange={e => setSlogan(e.target.value)}
                placeholder="Masalan: Milliy va Yevropa taomlari"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Qisqa Ta'rif (Bio — Bosh sahifa va Footer uchun)</label>
            <textarea
              rows={2}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Restoraningiz haqida qisqacha ta'rif..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Xizmat haqi foizi (%)</label>
              <input
                type="number"
                min={0}
                max={50}
                value={serviceFeePercent}
                onChange={e => setServiceFeePercent(Number(e.target.value))}
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className={labelClass}>STIR (INN)</label>
              <input
                type="text"
                value={stir}
                onChange={e => setStir(e.target.value)}
                placeholder="305123456"
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className={labelClass}>Mehmonlar Wi-Fi Paroli</label>
              <input
                type="text"
                value={wifiPassword}
                onChange={e => setWifiPassword(e.target.value)}
                placeholder="guest2026"
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>
        </section>

        {/* 2. Bog'lanish va Ijtimoiy Tarmoqlar */}
        <section className="rounded-2xl bg-[#11131e] border border-[#23273a] p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1d2030]">
            <Phone className="w-4 h-4 text-[#d4af37]" />
            <h2 className="font-serif font-bold text-base text-white">Bog'lanish & Ijtimoiy Tarmoqlar</h2>
          </div>

          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                Manzil
              </span>
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Shahar, tuman, ko'cha va uy raqami"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Telefon Raqam</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+998 90 123-45-67"
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
                  Email Manzil
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="info@restoran.uz"
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  Telegram (@username yoki havola)
                </span>
              </label>
              <input
                type="text"
                value={telegram}
                onChange={e => setTelegram(e.target.value)}
                placeholder="@flora_uz"
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  Instagram (@username yoki havola)
                </span>
              </label>
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                placeholder="@flora.uz"
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>
        </section>

        {/* 3. Ish Vaqti va Tadbirlar */}
        <section className="rounded-2xl bg-[#11131e] border border-[#23273a] p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1d2030]">
            <Clock className="w-4 h-4 text-[#d4af37]" />
            <h2 className="font-serif font-bold text-base text-white">Ish Vaqti & Maxsus Tadbirlar</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ish Kunlari</label>
              <input
                type="text"
                value={workingDays}
                onChange={e => setWorkingDays(e.target.value)}
                placeholder="Dushanba - Yakshanba"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Ish Soatlari</label>
              <input
                type="text"
                value={workingHours}
                onChange={e => setWorkingHours(e.target.value)}
                placeholder="09:00 - 23:00"
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Maxsus Vaqt Sarlavhasi (ixtiyoriy)</label>
              <input
                type="text"
                value={specialHoursLabel}
                onChange={e => setSpecialHoursLabel(e.target.value)}
                placeholder="Masalan: Nonushta / Biznes lanch"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Maxsus Vaqt Qiymati (ixtiyoriy)</label>
              <input
                type="text"
                value={specialHoursValue}
                onChange={e => setSpecialHoursValue(e.target.value)}
                placeholder="Masalan: 09:00 - 12:00"
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tadbir Sarlavhasi (ixtiyoriy)</label>
              <input
                type="text"
                value={eventsTitle}
                onChange={e => setEventsTitle(e.target.value)}
                placeholder="Masalan: Jonli Musiqa Oqshomi"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Tadbir Jadvali (ixtiyoriy)</label>
              <input
                type="text"
                value={eventsSchedule}
                onChange={e => setEventsSchedule(e.target.value)}
                placeholder="Masalan: Juma - Yakshanba (19:30 - 23:00)"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* 4. Bosh Sahifa & "Biz Haqimizda" */}
        <section className="rounded-2xl bg-[#11131e] border border-[#23273a] p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1d2030]">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <h2 className="font-serif font-bold text-base text-white">Bosh Sahifa & "Biz Haqimizda" Matnlari</h2>
          </div>

          <div>
            <label className={labelClass}>Hero Nishoncha (Top Badge)</label>
            <input
              type="text"
              value={heroBadge}
              onChange={e => setHeroBadge(e.target.value)}
              placeholder="Masalan: Shahardagi eng shinam kafe va lounge"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Hero Asosiy Sarlavha</label>
              <input
                type="text"
                value={heroTitle}
                onChange={e => setHeroTitle(e.target.value)}
                placeholder="Masalan: Sharqona Mehmondo'stlik &"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Hero Rangli Sarlavha Qismi</label>
              <input
                type="text"
                value={heroHighlight}
                onChange={e => setHeroHighlight(e.target.value)}
                placeholder="Masalan: Yuksak Gastronomik San'at"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>"Biz Haqimizda" Bo'lim Sarlavhasi</label>
            <input
              type="text"
              value={aboutTitle}
              onChange={e => setAboutTitle(e.target.value)}
              placeholder="Restoraningiz haqida sarlavha"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Iqtibos (Quote)</label>
            <input
              type="text"
              value={aboutQuote}
              onChange={e => setAboutQuote(e.target.value)}
              placeholder="Restoran falsafasi haqida qisqa iqtibos..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>1-chi Abzats (Tarix & Yondashuv)</label>
              <textarea
                rows={3}
                value={aboutDescription1}
                onChange={e => setAboutDescription1(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>2-chi Abzats (Maqsad & Taomlar)</label>
              <textarea
                rows={3}
                value={aboutDescription2}
                onChange={e => setAboutDescription2(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* 5. Chek Matnlari */}
        <section className="rounded-2xl bg-[#11131e] border border-[#23273a] p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1d2030]">
            <FileText className="w-4 h-4 text-[#d4af37]" />
            <h2 className="font-serif font-bold text-base text-white">Kassa Cheki Matnlari</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Chek Yuqori Matni</label>
              <input
                type="text"
                value={headerMessage}
                onChange={e => setHeaderMessage(e.target.value)}
                placeholder="Xush kelibsiz!"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Chek Pastidagi Minnatdorlik Matni</label>
              <input
                type="text"
                value={footerReceiptMessage}
                onChange={e => setFooterReceiptMessage(e.target.value)}
                placeholder="Tashrifingiz uchun rahmat!"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c14c] text-neutral-950 font-bold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#d4af37]/20 flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saqlanmoqda...' : 'Barcha Sozlamalarni Saqlash'}</span>
          </button>
        </div>
      </form>

      {/* 6. Xavfsizlik / Admin Parol */}
      <section className="rounded-2xl bg-[#11131e] border border-[#23273a] p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1d2030]">
          <KeyRound className="w-4 h-4 text-[#d4af37]" />
          <div>
            <h2 className="font-serif font-bold text-base text-white">Admin Panel Kirish Paroli</h2>
            <p className="text-[11px] text-neutral-400">
              Ushbu parol faqat «{currentTenant?.name || settings.name || tenantSlug}» admin paneliga kirishda ishlatiladi
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className={labelClass}>Yangi Admin Paroli</label>
            <input
              type="password"
              minLength={4}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Kamida 4 ta belgi"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label className={labelClass}>Parolni Tasdiqlash</label>
            <input
              type="password"
              minLength={4}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Parolni qayta kiriting"
              className={`${inputClass} font-mono`}
            />
          </div>

          <button
            type="submit"
            disabled={isSavingPassword || !newPassword.trim()}
            className="py-2.5 px-5 rounded-xl bg-[#1d2133] hover:bg-[#272d45] border border-[#d4af37]/50 text-[#d4af37] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSavingPassword ? 'Yangilanmoqda...' : "Parolni O'zgartirish"}
          </button>
        </form>
      </section>
    </div>
  );
};
