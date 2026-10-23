import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { RestaurantTable } from '../types';
import { 
  Plus, Users, Edit3, Trash2, CheckCircle2, 
  Search, X, Sparkles, AlertCircle, Eye,
  Coffee, UtensilsCrossed, ShieldAlert, Check, QrCode
} from 'lucide-react';
import { TableQrModal } from '../components/TableQrModal';

export const TableManagementTab: React.FC = () => {
  const { 
    tables, addTable, updateTable, deleteTable, 
    orders, formatUZS, openReceiptModal, setRoute, setAdminSubTab 
  } = useRestaurant();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('barchasi');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedQrTable, setSelectedQrTable] = useState<RestaurantTable | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrModalMode, setQrModalMode] = useState<'single' | 'all'>('single');

  // Form State for Add Table
  const [formData, setFormData] = useState({
    name: '',
    zone: 'Zal 1',
    customZone: '',
    capacity: 4,
    notes: '',
    isActive: true
  });

  // Extract unique zones
  const uniqueZones = Array.from(new Set(tables.map(t => t.zone).filter(Boolean)));
  const defaultZoneOptions = ['Zal 1', 'Zal 2', 'VIP', 'Terrasa', 'Bar'];
  const allZoneOptions = Array.from(new Set([...defaultZoneOptions, ...uniqueZones]));

  // Active open orders
  const openOrders = orders.filter(o => o.status !== 'yopildi');

  const getTableActiveOrder = (tableId: string) => {
    return openOrders.find(o => o.tableNumber === tableId);
  };

  // Filtered tables
  const filteredTables = tables.filter(t => {
    const matchZone = selectedZone === 'barchasi' || t.zone === selectedZone;
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchZone && matchSearch;
  });

  // Stats
  const totalTables = tables.length;
  const occupiedTablesCount = tables.filter(t => !!getTableActiveOrder(t.id)).length;
  const freeTablesCount = totalTables - occupiedTablesCount;
  const totalCapacity = tables.reduce((acc, t) => acc + (t.capacity || 0), 0);

  const handleOpenAddModal = () => {
    // Determine next table number suggestion
    const nextNumber = tables.length + 1;
    setFormData({
      name: `Stol ${nextNumber}`,
      zone: 'Zal 1',
      customZone: '',
      capacity: 4,
      notes: '',
      isActive: true
    });
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const finalZone = formData.zone === 'boshqa' && formData.customZone.trim() 
      ? formData.customZone.trim() 
      : formData.zone;

    addTable({
      name: formData.name.trim(),
      zone: finalZone,
      capacity: Number(formData.capacity) || 4,
      isActive: formData.isActive,
      notes: formData.notes.trim()
    });

    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable || !editingTable.name.trim()) return;

    updateTable(editingTable.id, {
      name: editingTable.name.trim(),
      zone: editingTable.zone.trim(),
      capacity: Number(editingTable.capacity) || 4,
      isActive: editingTable.isActive,
      notes: editingTable.notes?.trim() || ''
    });

    setEditingTable(null);
  };

  const handleDelete = (id: string) => {
    deleteTable(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in p-3 sm:p-6 max-w-7xl mx-auto">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#11131c] border border-[#232738] p-5 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#12141f] border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide flex items-center gap-2">
                <span>STOLLAR VA ZALLAR BOSHQARUVI</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40">
                  {tables.length} ta stol
                </span>
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Restoran zallari, VIP kabinetlar, terrasa va bar stollarini qo'shish hamda nazorat qilish
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Add Table & All QR Codes */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setQrModalMode('all');
              setSelectedQrTable(null);
              setIsQrModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#151724] hover:bg-[#1f2336] border border-[#d4af37]/40 text-[#d4af37] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Barcha QR Kodlar (Chop etish)</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c14c] hover:brightness-110 active:scale-95 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yangi Stol Qo'shish</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tables */}
        <div className="bg-[#11131c] border border-[#232738] p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-mono text-neutral-400">Jami Stollar</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{totalTables}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Barcha zallarda</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
        </div>

        {/* Free Tables */}
        <div className="bg-[#11131c] border border-[#232738] p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-mono text-emerald-400">Bo'sh Stollar</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{freeTablesCount}</div>
            <div className="text-[10px] text-emerald-400/70 mt-0.5">Mijoz qabuliga tayyor</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Occupied Tables */}
        <div className="bg-[#11131c] border border-[#232738] p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-mono text-amber-400">Band / Xizmatda</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{occupiedTablesCount}</div>
            <div className="text-[10px] text-amber-400/70 mt-0.5">Buyurtma ochilgan</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Coffee className="w-5 h-5" />
          </div>
        </div>

        {/* Total Capacity */}
        <div className="bg-[#11131c] border border-[#232738] p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-mono text-[#d4af37]">Jami O'rinlar</div>
            <div className="text-2xl font-bold font-mono text-[#d4af37] mt-1">{totalCapacity}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Mehmon sig'imi (kishi)</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#11131d] border border-[#222638] p-3.5 sm:p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Stol nomi, zona yoki tavsif bo'yicha qidirish..."
            className="w-full bg-[#0a0b10] border border-[#2b3044] focus:border-[#d4af37] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Zone Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => setSelectedZone('barchasi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedZone === 'barchasi'
                ? 'bg-[#d4af37] text-neutral-950 font-bold shadow'
                : 'bg-[#161824] hover:bg-[#1f2234] text-neutral-400 hover:text-white border border-[#282d40]'
            }`}
          >
            Barchasi ({tables.length})
          </button>
          {allZoneOptions.map(zone => {
            const count = tables.filter(t => t.zone === zone).length;
            const isSelected = selectedZone === zone;
            return (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#d4af37] text-neutral-950 font-bold shadow'
                    : 'bg-[#161824] hover:bg-[#1f2234] text-neutral-400 hover:text-white border border-[#282d40]'
                }`}
              >
                {zone} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map(table => {
          const activeOrder = getTableActiveOrder(table.id);
          const isOccupied = !!activeOrder;

          return (
            <div
              key={table.id}
              className={`relative bg-[#11131c] border rounded-2xl p-4.5 transition-all shadow-lg flex flex-col justify-between group ${
                isOccupied
                  ? 'border-amber-500/50 shadow-amber-500/5'
                  : 'border-[#242838] hover:border-[#d4af37]/50 hover:shadow-[0_0_15px_rgba(212,175,55,0.08)]'
              }`}
            >
              <div>
                {/* Header: Name + Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-white group-hover:text-[#d4af37] transition-colors">
                      {table.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#1a1d2c] border border-[#2f354d] text-neutral-300">
                        {table.zone}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                        <Users className="w-3 h-3 text-[#d4af37]" />
                        <span>{table.capacity} kishi</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 ${
                      isOccupied
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                    {isOccupied ? 'Band' : 'Bo\'sh'}
                  </span>
                </div>

                {/* Notes if available */}
                {table.notes && (
                  <p className="text-[11px] text-neutral-400 italic line-clamp-2 mb-3">
                    "{table.notes}"
                  </p>
                )}

                {/* If Table is occupied: Show active order ticket details */}
                {isOccupied && activeOrder && (
                  <div className="bg-[#181a26] border border-amber-500/30 rounded-xl p-3 mb-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-neutral-300 font-mono text-[11px]">
                      <span className="text-amber-400 font-bold">{activeOrder.id}</span>
                      <span className="text-neutral-400">{activeOrder.waiterName || 'Ofitsiant'}</span>
                    </div>
                    <div className="text-neutral-300 flex items-center justify-between">
                      <span className="text-neutral-400 text-[11px]">Jami hisob:</span>
                      <span className="font-mono font-bold text-white text-xs">
                        {formatUZS(activeOrder.finalTotal)}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate">
                      Mijoz: {activeOrder.customerName || 'Mehmon'} ({activeOrder.items.length} taom)
                    </div>

                    <button
                      onClick={() => openReceiptModal(activeOrder)}
                      className="w-full mt-1.5 py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-[10px] flex items-center justify-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Chekni ko'rish</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#1e2233] flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-1.5">
                  {/* Edit Button */}
                  <button
                    onClick={() => setEditingTable(table)}
                    className="p-1.5 rounded-lg bg-[#181a28] hover:bg-[#222538] border border-[#2b3046] text-neutral-300 hover:text-white transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteConfirmId(table.id)}
                    className="p-1.5 rounded-lg bg-[#221316] hover:bg-rose-950 border border-rose-900/40 text-rose-400 hover:text-rose-200 transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Table QR Code Button */}
                  <button
                    onClick={() => {
                      setSelectedQrTable(table);
                      setQrModalMode('single');
                      setIsQrModalOpen(true);
                    }}
                    className="p-1.5 px-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/40 text-[#d4af37] text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                    title="Stol QR Menyu kodini ko'rish va chop etish"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR</span>
                  </button>
                </div>

                {/* Quick Order / POS button */}
                <button
                  onClick={() => {
                    setAdminSubTab('kassa');
                    setRoute('admin');
                  }}
                  className="text-[11px] font-semibold text-[#d4af37] hover:underline flex items-center gap-1"
                >
                  <span>Kassada ko'rish</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-12 bg-[#10121b] border border-[#222638] rounded-2xl p-6">
          <UtensilsCrossed className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Hech qanday stol topilmadi</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Qidiruv so'zini o'zgartiring yoki yuqoridagi tugma orqali yangi stol qo'shing.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37] text-neutral-950 font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Stol Qo'shish</span>
          </button>
        </div>
      )}

      {/* ADD TABLE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#11131e] border border-[#d4af37]/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#222638] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center text-[#d4af37]">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Yangi Stol Qo'shish</h3>
                  <p className="text-[10px] text-neutral-400">Restoran zali uchun stol parametrlarini kiriting</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Table Name */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Stol Nomi yoki Raqami *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Stol #6 yoki VIP Kabinet 3"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0a0b10] border border-[#2c3146] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
                />
              </div>

              {/* Zone Selector */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Joylashuv Zonasi *
                </label>
                <select
                  value={formData.zone}
                  onChange={e => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full bg-[#0a0b10] border border-[#2c3146] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                >
                  {allZoneOptions.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                  <option value="boshqa">+ Yangi zona kiritish...</option>
                </select>

                {formData.zone === 'boshqa' && (
                  <input
                    type="text"
                    required
                    placeholder="Yangi zona nomini kiriting (masalan: Lounge Zal, Ochiq Bog')..."
                    value={formData.customZone}
                    onChange={e => setFormData({ ...formData, customZone: e.target.value })}
                    className="w-full mt-2 bg-[#0a0b10] border border-[#2c3146] focus:border-[#d4af37] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Capacity */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  O'rindiqlar Soni (Mehmon Sig'imi) *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[2, 4, 6, 8, 12].map(cap => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setFormData({ ...formData, capacity: cap })}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                        formData.capacity === cap
                          ? 'bg-[#d4af37] text-neutral-950 border-[#d4af37]'
                          : 'bg-[#141624] text-neutral-300 border-[#262b3e] hover:border-neutral-500'
                      }`}
                    >
                      {cap} kishi
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Qo'shimcha Tavsif / Eslatma (ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Deraza oldida, shinam divanli burchak"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#0a0b10] border border-[#2c3146] focus:border-[#d4af37] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#161826] hover:bg-[#202334] text-neutral-300 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c14c] hover:brightness-110 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Stolni Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TABLE MODAL */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#11131e] border border-[#d4af37]/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#222638] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center text-[#d4af37]">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Stolni Tahrirlash</h3>
                  <p className="text-[10px] text-neutral-400 font-mono">{editingTable.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTable(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Stol Nomi *
                </label>
                <input
                  type="text"
                  required
                  value={editingTable.name}
                  onChange={e => setEditingTable({ ...editingTable, name: e.target.value })}
                  className="w-full bg-[#0a0b10] border border-[#2c3146] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Joylashuv Zonasi *
                </label>
                <input
                  type="text"
                  required
                  value={editingTable.zone}
                  onChange={e => setEditingTable({ ...editingTable, zone: e.target.value })}
                  className="w-full bg-[#0a0b10] border border-[#2c3146] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Sig'im (O'rindiqlar soni)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={editingTable.capacity}
                  onChange={e => setEditingTable({ ...editingTable, capacity: Number(e.target.value) })}
                  className="w-full bg-[#0a0b10] border border-[#2c3146] focus:border-[#d4af37] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Tavsif / Eslatma
                </label>
                <input
                  type="text"
                  value={editingTable.notes || ''}
                  onChange={e => setEditingTable({ ...editingTable, notes: e.target.value })}
                  className="w-full bg-[#0a0b10] border border-[#2c3146] focus:border-[#d4af37] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingTable(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#161826] text-neutral-300 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg"
                >
                  O'zgarishlarni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#12141f] border border-rose-900/60 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/40 mx-auto flex items-center justify-center text-rose-400 mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-white">Stolni o'chirmoqchimisiz?</h3>
            <p className="text-xs text-neutral-400 mt-1 mb-5 font-mono">
              {deleteConfirmId}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#1a1c2a] text-neutral-300 hover:text-white text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg"
              >
                Ha, o'chirilsin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table QR Code Stand & Modal */}
      <TableQrModal
        table={selectedQrTable}
        allTables={tables}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        mode={qrModalMode}
      />
    </div>
  );
};
