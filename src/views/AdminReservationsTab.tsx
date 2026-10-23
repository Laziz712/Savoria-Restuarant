import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { TableReservation } from '../types';
import { 
  CalendarCheck, Calendar, Clock, Phone, User, Users, Plus, 
  Search, CheckCircle2, XCircle, AlertCircle, Trash2, 
  MapPin, Check, X, Sparkles, Filter, PhoneCall
} from 'lucide-react';

export const AdminReservationsTab: React.FC = () => {
  const { 
    reservations, addReservation, updateReservationStatus, 
    deleteReservation, tables, setRoute, setAdminSubTab 
  } = useRestaurant();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'barchasi' | 'kutilmoqda' | 'tasdiqlandi' | 'bekor_qilindi'>('barchasi');
  const [dateFilter, setDateFilter] = useState<'barchasi' | 'bugun' | 'boshqa'>('barchasi');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Reservation Form State
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '+998 ',
    date: 'Bugun',
    time: '19:00',
    guestsCount: 4,
    tableId: tables[0]?.name || 'Stol 1 (Zal 1)',
    zone: tables[0]?.zone || 'Zal 1',
    specialRequests: '',
    status: 'tasdiqlandi' as 'tasdiqlandi' | 'kutilmoqda'
  });

  // Filtered Reservations
  const filteredReservations = reservations.filter(res => {
    const matchesSearch = 
      res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.guestPhone.includes(searchQuery) ||
      res.tableId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.zone && res.zone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.specialRequests && res.specialRequests.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'barchasi' || res.status === statusFilter;
    
    const matchesDate = 
      dateFilter === 'barchasi' || 
      (dateFilter === 'bugun' && (res.date.toLowerCase().includes('bugun') || res.date === new Date().toISOString().split('T')[0])) ||
      (dateFilter === 'boshqa' && !res.date.toLowerCase().includes('bugun'));

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Stats
  const totalCount = reservations.length;
  const pendingCount = reservations.filter(r => r.status === 'kutilmoqda').length;
  const confirmedCount = reservations.filter(r => r.status === 'tasdiqlandi').length;
  const todayCount = reservations.filter(r => r.date.toLowerCase().includes('bugun')).length;
  const totalGuests = reservations
    .filter(r => r.status === 'tasdiqlandi')
    .reduce((sum, r) => sum + (r.guestsCount || 0), 0);

  const handleSubmitNewReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.guestName.trim()) return;

    addReservation({
      guestName: formData.guestName.trim(),
      guestPhone: formData.guestPhone.trim(),
      date: formData.date.trim() || 'Bugun',
      time: formData.time.trim() || '19:00',
      guestsCount: Number(formData.guestsCount) || 2,
      tableId: formData.tableId,
      zone: formData.zone,
      specialRequests: formData.specialRequests.trim(),
      status: formData.status
    });

    setIsAddModalOpen(false);
    setFormData({
      guestName: '',
      guestPhone: '+998 ',
      date: 'Bugun',
      time: '19:00',
      guestsCount: 4,
      tableId: tables[0]?.name || 'Stol 1 (Zal 1)',
      zone: tables[0]?.zone || 'Zal 1',
      specialRequests: '',
      status: 'tasdiqlandi'
    });
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#141724] via-[#10121d] to-[#181a29] border border-[#272b3e] p-4 sm:p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-lg shadow-[#d4af37]/10 shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                STOLLARNI BRON QILISH
              </h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  {pendingCount} ta tasdiq kutilmoqda
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Restoran zallaridagi stollar rezervatsiyasi, mehmonlar ro'yxati va kelish vaqtlari
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f2a] hover:from-[#e5c14f] hover:to-[#c49e35] text-neutral-950 font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Yangi Bron Qo'shish</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#11131e] border border-[#222538] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Jami Bronlar</div>
            <div className="text-2xl font-bold font-serif text-white mt-1">{totalCount} ta</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Ro'yxatdagi rezervatsiyalar</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#11131e] border border-amber-500/30 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.08)]">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400">Tasdiq Kutilmoqda</div>
            <div className="text-2xl font-bold font-serif text-amber-300 mt-1">{pendingCount} ta</div>
            <div className="text-[10px] text-amber-400/70 mt-0.5">Diqqat talab bronlar</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#11131e] border border-[#222538] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">Bugungi Tashriflar</div>
            <div className="text-2xl font-bold font-serif text-emerald-300 mt-1">{todayCount} ta</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Bugun keladigan mehmonlar</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#11131e] border border-[#222538] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#d4af37]">Tasdiqlangan Mehmonlar</div>
            <div className="text-2xl font-bold font-serif text-[#d4af37] mt-1">{totalGuests} kishi</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">{confirmedCount} ta stol band qilingan</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#11131e] border border-[#222538] p-3 sm:p-4 rounded-xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mehmon ismi, telefon, stol yoki izoh bo'yicha qidirish..."
            className="w-full bg-[#171926] border border-[#282d42] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('barchasi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'barchasi'
                ? 'bg-[#d4af37] text-neutral-950 font-bold shadow'
                : 'bg-[#171926] text-neutral-400 hover:text-white border border-[#272b3e]'
            }`}
          >
            Barchasi ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('kutilmoqda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'kutilmoqda'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                : 'bg-[#171926] text-amber-300 hover:bg-[#1f2233] border border-amber-500/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Kutilmoqda ({pendingCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('tasdiqlandi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'tasdiqlandi'
                ? 'bg-emerald-500 text-neutral-950 font-bold shadow'
                : 'bg-[#171926] text-emerald-300 hover:bg-[#1f2233] border border-emerald-500/30'
            }`}
          >
            Tasdiqlangan ({confirmedCount})
          </button>
          <button
            onClick={() => setStatusFilter('bekor_qilindi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'bekor_qilindi'
                ? 'bg-rose-500 text-white font-bold shadow'
                : 'bg-[#171926] text-rose-300 hover:bg-[#1f2233] border border-rose-500/30'
            }`}
          >
            Bekor qilingan
          </button>
        </div>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="bg-[#11131e] border border-[#222538] rounded-2xl p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#181a29] border border-[#2a2f44] text-neutral-400 flex items-center justify-center mb-3">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Bronlar topilmadi</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            Qidiruv so'rovi yoki tanlangan filtr bo'yicha hech qanday bron topilmadi.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('barchasi');
              setDateFilter('barchasi');
            }}
            className="px-4 py-2 rounded-lg bg-[#181a29] border border-[#2a2f44] text-xs text-[#d4af37] font-semibold hover:bg-[#202438]"
          >
            Filtrlarni tozalash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReservations.map(res => {
            const isPending = res.status === 'kutilmoqda';
            const isConfirmed = res.status === 'tasdiqlandi';
            const isCancelled = res.status === 'bekor_qilindi';

            return (
              <div
                key={res.id}
                className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all bg-gradient-to-b from-[#121420] to-[#0d0f18] ${
                  isPending 
                    ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.08)] ring-1 ring-amber-500/30' 
                    : isConfirmed 
                    ? 'border-[#222638] hover:border-[#d4af37]/40 shadow-md' 
                    : 'border-rose-950/40 opacity-70'
                }`}
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#1c2030] gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#181a28] border border-[#2a2f44] text-[#d4af37]">
                        {res.id}
                      </span>
                      {res.date.toLowerCase().includes('bugun') && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 uppercase font-mono">
                          BUGUN
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                          Kutilmoqda
                        </span>
                      )}
                      {isConfirmed && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Tasdiqlangan
                        </span>
                      )}
                      {isCancelled && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          Bekor qilingan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Guest Info */}
                  <div className="mt-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#1c2032] border border-[#2a3048] text-[#d4af37] flex items-center justify-center font-bold text-xs shrink-0">
                          {res.guestName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">
                            {res.guestName}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                            <Phone className="w-3 h-3 text-neutral-400" />
                            <a 
                              href={`tel:${res.guestPhone}`} 
                              className="hover:text-[#d4af37] transition-colors"
                              title="Qo'ng'iroq qilish"
                            >
                              {res.guestPhone}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Call Button */}
                      <a
                        href={`tel:${res.guestPhone}`}
                        className="p-2 rounded-lg bg-[#181a28] hover:bg-[#202438] border border-[#272b3e] text-[#d4af37] transition-all hover:scale-105 shrink-0"
                        title="Telefon qilish"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Booking Details Pills */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2 rounded-lg bg-[#151724] border border-[#222538] flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                        <div>
                          <div className="text-[10px] text-neutral-400">Sana & Vaqt</div>
                          <div className="font-semibold text-white truncate">{res.date}, {res.time}</div>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-[#151724] border border-[#222538] flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                        <div>
                          <div className="text-[10px] text-neutral-400">Mehmonlar</div>
                          <div className="font-semibold text-white">{res.guestsCount} kishi</div>
                        </div>
                      </div>
                    </div>

                    {/* Table and Zone */}
                    <div className="p-2.5 rounded-lg bg-[#151724] border border-[#222538] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                        <div>
                          <span className="text-neutral-400 text-[10px]">Stol / Joy: </span>
                          <span className="font-semibold text-white">{res.tableId}</span>
                        </div>
                      </div>
                      {res.zone && (
                        <span className="px-2 py-0.5 rounded bg-[#1e2235] text-[10px] font-mono text-neutral-300">
                          {res.zone}
                        </span>
                      )}
                    </div>

                    {/* Special Requests / Notes */}
                    {res.specialRequests && (
                      <div className="p-2.5 rounded-lg bg-[#181a26]/80 border border-dashed border-[#2b3046] text-xs">
                        <div className="text-[10px] uppercase font-mono text-[#d4af37] font-semibold mb-0.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#d4af37]" />
                          <span>Maxsus istak / Izoh:</span>
                        </div>
                        <div className="text-neutral-300 text-xs italic">
                          "{res.specialRequests}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="mt-4 pt-3 border-t border-[#1c2030] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    {isPending && (
                      <button
                        onClick={() => updateReservationStatus(res.id, 'tasdiqlandi')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Tasdiqlash</span>
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => {
                          setAdminSubTab('kassa');
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/50 text-[#d4af37] font-bold text-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Keldi (Kassaga o'tish)</span>
                      </button>
                    )}

                    {!isCancelled && (
                      <button
                        onClick={() => updateReservationStatus(res.id, 'bekor_qilindi')}
                        className="py-1.5 px-2.5 rounded-lg bg-[#1b1e2e] hover:bg-rose-950/40 text-neutral-400 hover:text-rose-300 border border-[#272b3e] text-xs transition-colors"
                        title="Bekor qilish"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isCancelled && (
                      <button
                        onClick={() => updateReservationStatus(res.id, 'tasdiqlandi')}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-[#181a28] hover:bg-[#202438] text-xs font-semibold text-neutral-300 hover:text-white border border-[#272b3e]"
                      >
                        Qayta faollashtirish
                      </button>
                    )}
                  </div>

                  {/* Delete Button */}
                  {deleteConfirmId === res.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          deleteReservation(res.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                      >
                        O'chirish
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1.5 rounded-lg bg-[#181a28] text-neutral-400 hover:text-white text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(res.id)}
                      className="p-2 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Yangi Bron Qo'shish */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#10121d] border border-[#2a2f44] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#212435] flex items-center justify-between bg-[#131624]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37]">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-base">YANGI STOL BRON QILISH</h3>
                  <p className="text-[11px] text-neutral-400">Mehmon ma'lumotlarini kiriting va stol biriktiring</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#181a28] text-neutral-400 hover:text-white border border-[#242738]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitNewReservation} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Mehmon Ismi va Familiyasi *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={formData.guestName}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                    placeholder="Masalan: Jamshid Qodirov"
                    className="w-full bg-[#161826] border border-[#2b3046] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Telefon Raqami *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      required
                      value={formData.guestPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                      placeholder="+998 90 123 45 67"
                      className="w-full bg-[#161826] border border-[#2b3046] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Mehmonlar Soni *
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="number"
                      min={1}
                      max={30}
                      required
                      value={formData.guestsCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, guestsCount: Number(e.target.value) }))}
                      className="w-full bg-[#161826] border border-[#2b3046] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Tashrif Sanasi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    placeholder="Bugun, Ertaga yoki 2026-10-24"
                    className="w-full bg-[#161826] border border-[#2b3046] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Tashrif Vaqti *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="Masalan: 19:30"
                      className="w-full bg-[#161826] border border-[#2b3046] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Stol Tanlash *
                </label>
                <select
                  value={formData.tableId}
                  onChange={(e) => {
                    const selected = tables.find(t => t.name === e.target.value || t.id === e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      tableId: e.target.value,
                      zone: selected ? selected.zone : prev.zone 
                    }));
                  }}
                  className="w-full bg-[#161826] border border-[#2b3046] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {tables.map(table => (
                    <option key={table.id} value={table.name}>
                      {table.name} ({table.zone}) — {table.capacity} kishilik
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Maxsus Istaklar / Bayram Izohi (ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  value={formData.specialRequests}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  placeholder="Masalan: Tug'ilgan kun nishonlash, gullar, bolalar stulchasi kerak..."
                  className="w-full bg-[#161826] border border-[#2b3046] rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Boshlang'ich Holati
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'tasdiqlandi' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      formData.status === 'tasdiqlandi'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-[#161826] border-[#2b3046] text-neutral-400'
                    }`}
                  >
                    ✓ Darhol Tasdiqlangan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'kutilmoqda' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      formData.status === 'kutilmoqda'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-[#161826] border-[#2b3046] text-neutral-400'
                    }`}
                  >
                    ⏳ Kutilmoqda (tasdiqlanmagan)
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#212435] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#161826] hover:bg-[#1f2233] border border-[#2b3046] text-xs text-neutral-300 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f2a] hover:from-[#e5c14f] hover:to-[#c49e35] text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Bronni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
