import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { PushNotification } from '../types';
import { 
  Bell, Send, X, CheckCircle2, AlertTriangle, Radio, 
  Users, UserCheck, UtensilsCrossed, Sparkles, MessageSquarePlus
} from 'lucide-react';

export const AdminPushNotificationModal: React.FC = () => {
  const { 
    showPushModal, setShowPushModal, sendPushNotification, 
    tables, settings, t 
  } = useRestaurant();

  const [target, setTarget] = useState<'all' | 'waiters' | 'customers' | 'table'>('all');
  const [targetTable, setTargetTable] = useState<string>('Stol 5');
  const [priority, setPriority] = useState<'normal' | 'alert' | 'urgent'>('alert');
  const [title, setTitle] = useState<string>('🔔 5-stol uchun buyurtma tayyor!');
  const [message, setMessage] = useState<string>('Oshxonada 5-stol buyurtmasi tayyor bo\'ldi, ofitsiant iltimos olib borsin.');
  const [sender, setSender] = useState<string>('Bosh Administrator');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!showPushModal) return null;

  const quickTemplates = [
    {
      label: '5-stol buyurtmasi tayyor',
      icon: '🔔',
      target: 'table' as const,
      table: 'Stol 5',
      priority: 'alert' as const,
      title: '🔔 5-stol uchun buyurtma tayyor!',
      message: 'Oshxonada 5-stol buyurtmasi to\'liq tayyor bo\'ldi, ofitsiant iltimos olib borsin.'
    },
    {
      label: '2-stol oshxonada tayyorlanmoqda',
      icon: '👨‍🍳',
      target: 'table' as const,
      table: 'Stol 2',
      priority: 'normal' as const,
      title: '👨‍🍳 Buyurtmangiz oshxonada tayyorlanmoqda',
      message: 'Hurmatli mehmon! Sizning taomlaringiz hozirgina oshpazlarimiz tomonidan pishirilmoqda.'
    },
    {
      label: 'Shohona Osh damdan chiqdi',
      icon: '🍽️',
      target: 'all' as const,
      table: '',
      priority: 'normal' as const,
      title: '🍽️ Bugungi Shohona To\'y Oshi tayyor!',
      message: 'Barcha mehmonlarimiz diqqatiga: maxsus za\'faronli milliy oshi hozirgina damdan chiqdi. Marhamat buyurtma bering!'
    },
    {
      label: 'Kuryerlar: Yangi buyurtma',
      icon: '🛵',
      target: 'waiters' as const,
      table: '',
      priority: 'alert' as const,
      title: '🛵 Kuryerlar: Yangi yetkazma tayyor!',
      message: 'Yangi dostavka buyurtmasi qadoqlandi. Bo\'sh turgan kuryer zudlik bilan yo\'lga chiqsin.'
    },
    {
      label: 'Shoshilinch: Hisob-kitob',
      icon: '⚡',
      target: 'waiters' as const,
      table: '',
      priority: 'urgent' as const,
      title: '⚡ Shoshilinch: Zalda hisob-kitob talab etiladi',
      message: 'Mijoz to\'lov qilishni so\'ramoqda. Mas\'ul ofitsiant kassa chekini taqdim etsin.'
    }
  ];

  const handleApplyTemplate = (tmpl: typeof quickTemplates[0]) => {
    setTarget(tmpl.target);
    if (tmpl.table) setTargetTable(tmpl.table);
    setPriority(tmpl.priority);
    setTitle(tmpl.title);
    setMessage(tmpl.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await sendPushNotification({
        title: title.trim(),
        message: message.trim(),
        target,
        targetTable: target === 'table' ? targetTable.trim() : undefined,
        priority,
        sender: sender.trim() || settings.name || 'Administrator',
        read: false
      });

      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setShowPushModal(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to send push notification', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#0f111a] border border-[#d4af37]/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#23273a] bg-gradient-to-r from-[#171a29] to-[#0f111a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/30 to-[#d4af37]/10 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-base tracking-wide flex items-center gap-2">
                Real-Time Push Xabarnoma
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  JONLI SSE
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Ofitsiant, mijoz va muayyan stollarga real vaqtda ogohlantirish yuborish
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPushModal(false)}
            className="p-2 rounded-xl text-neutral-400 hover:text-white bg-[#1a1c2b] hover:bg-[#25283c] border border-[#2b2f44] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {sentSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-sm">Xabarnoma barcha qurilmalarga muvaffaqiyatli uzatildi!</p>
                <p className="text-[11px] text-emerald-400/80">Ovozli signal chalindi va ekranlarda jonli chiqdi.</p>
              </div>
            </div>
          )}

          {/* Quick 1-Tap Templates */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#d4af37] mb-2 font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tezkor Shablonlar (1 ta bosishda)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-2.5 rounded-xl bg-[#141624] hover:bg-[#1f2238] border border-[#23273c] hover:border-[#d4af37]/50 text-left transition-all group flex items-start gap-2.5 active:scale-98"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">{tmpl.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-200 group-hover:text-[#d4af37] truncate">
                      {tmpl.label}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">
                      {tmpl.target === 'table' ? `📍 ${tmpl.table}` : tmpl.target === 'waiters' ? '👨‍🍳 Ofitsiantlar' : '👥 Barchaga'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Target Audience Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 font-mono uppercase tracking-wider">
                Kimlarga yuboriladi (Qabul qiluvchilar):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'all', label: 'Barchaga', desc: 'Hamma qurilmalar', icon: <Users className="w-3.5 h-3.5" /> },
                  { id: 'waiters', label: 'Ofitsiantlar', desc: 'Zal xodimlari', icon: <UserCheck className="w-3.5 h-3.5" /> },
                  { id: 'customers', label: 'Mijozlar', desc: 'Saytdagi mehmonlar', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
                  { id: 'table', label: 'Muayyan Stol', desc: 'Tanlangan stol', icon: <Radio className="w-3.5 h-3.5" /> },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTarget(opt.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      target === opt.id
                        ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                        : 'bg-[#131522] border-[#202438] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {opt.icon}
                      <span>{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Table Dropdown / Input if target === 'table' */}
            {target === 'table' && (
              <div className="p-3 rounded-xl bg-[#141726] border border-[#d4af37]/40 space-y-2 animate-fade-in">
                <label className="block text-xs font-semibold text-amber-300 font-mono">
                  📍 Qaysi stolga ogohlantirish berilsin?
                </label>
                <div className="flex gap-2">
                  <select
                    value={targetTable}
                    onChange={e => setTargetTable(e.target.value)}
                    className="flex-1 bg-[#0b0c14] border border-[#2b3046] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    {tables.map(tbl => (
                      <option key={tbl.id} value={tbl.name}>
                        {tbl.name} ({tbl.zone} · {tbl.capacity} kishi)
                      </option>
                    ))}
                    <option value="Stol 1">Stol 1 (Zal 1)</option>
                    <option value="Stol 2">Stol 2 (Zal 1)</option>
                    <option value="Stol 3">Stol 3 (Zal 1)</option>
                    <option value="Stol 4">Stol 4 (Zal 1)</option>
                    <option value="Stol 5">Stol 5 (Zal 1)</option>
                    <option value="VIP 1">VIP Kabinet #1</option>
                    <option value="VIP Terrasa">VIP Terrasa #2</option>
                  </select>
                  <input
                    type="text"
                    value={targetTable}
                    onChange={e => setTargetTable(e.target.value)}
                    placeholder="Qo'lda yozish..."
                    className="w-36 bg-[#0b0c14] border border-[#2b3046] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            )}

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 font-mono uppercase tracking-wider">
                Daraja & Muhimlik:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Oddiy', badge: 'ℹ️ Axborot', color: 'border-blue-500/40 text-blue-300' },
                  { id: 'alert', label: 'Muhim (Alert)', badge: '🔔 Diqqat', color: 'border-amber-500/40 text-amber-300' },
                  { id: 'urgent', label: 'Shoshilinch (Urgent)', badge: '⚡ Zudlik bilan', color: 'border-rose-500/40 text-rose-300' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      priority === p.id
                        ? `${p.color} bg-white/10 shadow-md font-bold`
                        : 'bg-[#121420] border-[#202436] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>{p.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1 font-mono uppercase tracking-wider">
                Sarlavha (Title):
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Masalan: 5-stol uchun buyurtma tayyor!"
                className="w-full bg-[#131522] border border-[#262a3e] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Message Body Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1 font-mono uppercase tracking-wider">
                Xabar matni (Push Message):
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Ofitsiant yoki mijozga yuboriladigan aniq xabar..."
                className="w-full bg-[#131522] border border-[#262a3e] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Sender Name */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1 font-mono uppercase tracking-wider">
                Yuboruvchi nomi:
              </label>
              <input
                type="text"
                value={sender}
                onChange={e => setSender(e.target.value)}
                placeholder="Admin, Oshxona, Boshqaruvchi..."
                className="w-full bg-[#131522] border border-[#262a3e] focus:border-[#d4af37] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors font-mono"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#1e2234]">
              <button
                type="button"
                onClick={() => setShowPushModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#161826] hover:bg-[#202438] text-neutral-300 border border-[#2a2f44] transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !message.trim()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b39023] hover:brightness-110 text-neutral-950 flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Uzatilmoqda...' : 'Real-Vaqtda Yuborish'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
