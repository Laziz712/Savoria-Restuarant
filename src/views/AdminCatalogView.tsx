import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem, ItemCategory } from '../types';
import { 
  Plus, Edit2, Trash2, Check, X, Image as ImageIcon, 
  Settings, DollarSign, Clock, ShieldCheck, Upload, Sparkles, AlertCircle
} from 'lucide-react';
import wagyuImg from '../assets/images/savoria_wagyu_steak_1791475866836.jpg';
import plovImg from '../assets/images/savoria_plov_special_1791475881101.jpg';
import cocktailImg from '../assets/images/savoria_cocktail_drink_1791475891055.jpg';
import burrataImg from '../assets/images/savoria_gourmet_salad_1791475898828.jpg';

export const AdminCatalogView: React.FC = () => {
  const { 
    menuItems, addMenuItem, updateMenuItem, deleteMenuItem, 
    toggleItemAvailability, updateItemPrice, settings, updateSettings, formatUZS 
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'menyu' | 'sozlamalar'>('menyu');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'barchasi'>('barchasi');
  
  // Modal State for Adding/Editing Item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ItemCategory>('asosiy');
  const [formPrice, setFormPrice] = useState<number>(120000);
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState<string>(wagyuImg);
  const [formPrepTime, setFormPrepTime] = useState<number>(15);
  const [formStation, setFormStation] = useState<'oshxona' | 'mangal' | 'bar' | 'salat'>('oshxona');
  const [formCalories, setFormCalories] = useState<number>(450);
  const [formWeightGrams, setFormWeightGrams] = useState<number>(300);
  const [formIsChefSpecial, setFormIsChefSpecial] = useState<boolean>(false);

  // Inline Price Editing State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceValue, setTempPriceValue] = useState<number>(0);

  // Restaurant Settings Form
  const [settingsName, setSettingsName] = useState(settings.name);
  const [settingsSlogan, setSettingsSlogan] = useState(settings.slogan);
  const [settingsAddress, setSettingsAddress] = useState(settings.address);
  const [settingsPhone, setSettingsPhone] = useState(settings.phone);
  const [settingsStir, setSettingsStir] = useState(settings.stir);
  const [settingsServiceFee, setSettingsServiceFee] = useState(settings.serviceFeePercent);
  const [settingsFooter, setSettingsFooter] = useState(settings.footerReceiptMessage);

  const presetImages = [
    { label: 'Wagyu Steyk', src: wagyuImg },
    { label: 'Shohona Osh', src: plovImg },
    { label: 'Mualliflik Kokteyli', src: cocktailImg },
    { label: 'Royal Burrata', src: burrataImg },
  ];

  const handleOpenAddModal = () => {
    setEditingItemId(null);
    setFormName('');
    setFormCategory('asosiy');
    setFormPrice(120000);
    setFormDescription('');
    setFormImage(wagyuImg);
    setFormPrepTime(15);
    setFormStation('oshxona');
    setFormCalories(450);
    setFormWeightGrams(300);
    setFormIsChefSpecial(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItemId(item.id);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormDescription(item.description);
    setFormImage(item.image);
    setFormPrepTime(item.prepTimeMinutes);
    setFormStation(item.station);
    setFormCalories(item.calories || 400);
    setFormWeightGrams(item.weightGrams || 300);
    setFormIsChefSpecial(!!item.isChefSpecial);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Iltimos, taom yoki ichimlik nomini kiriting');
      return;
    }

    if (editingItemId) {
      updateMenuItem(editingItemId, {
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        description: formDescription.trim(),
        image: formImage,
        prepTimeMinutes: Number(formPrepTime),
        station: formStation,
        calories: Number(formCalories),
        weightGrams: Number(formWeightGrams),
        isChefSpecial: formIsChefSpecial
      });
      alert('Taom muvaffaqiyatli yangilandi!');
    } else {
      addMenuItem({
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        description: formDescription.trim(),
        image: formImage,
        prepTimeMinutes: Number(formPrepTime),
        isAvailable: true,
        station: formStation,
        calories: Number(formCalories),
        weightGrams: Number(formWeightGrams),
        isChefSpecial: formIsChefSpecial
      });
      alert('Yangi taom menyuga qo\'shildi!');
    }

    setIsModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: settingsName,
      slogan: settingsSlogan,
      address: settingsAddress,
      phone: settingsPhone,
      stir: settingsStir,
      serviceFeePercent: Number(settingsServiceFee),
      footerReceiptMessage: settingsFooter
    });
    alert('Restoran sozlamalari saqlandi!');
  };

  const filteredItems = menuItems.filter(item => 
    selectedCategory === 'barchasi' || item.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-[#08090d] text-[#eaeaea] p-4 sm:p-6 flex flex-col gap-6">
      {/* Admin Top Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-[#1f2231]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-wide">
                ADMIN BOSHQARUV PANELI
              </h1>
              <p className="text-xs text-neutral-400 font-mono">
                Menyudagi taom va ichimliklarni boshqarish, narxlarni o'zgartirish va rasmlar
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-[#12141e] p-1 rounded-lg border border-[#232738]">
            <button
              onClick={() => setActiveTab('menyu')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'menyu' ? 'bg-[#d4af37] text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Taomlar & Narxlar
            </button>
            <button
              onClick={() => setActiveTab('sozlamalar')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'sozlamalar' ? 'bg-[#d4af37] text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Restoran Sozlamalari
            </button>
          </div>

          {activeTab === 'menyu' && (
            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#e4be4a] text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Taom / Ichimlik</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'menyu' ? (
        <div className="space-y-4">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(['barchasi', 'asosiy', 'milliy', 'salatlar', 'shorvalar', 'ichimliklar', 'desertlar', 'qahva_choy'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#d4af37] text-neutral-950 font-bold'
                    : 'bg-[#12141f] text-neutral-400 hover:text-white border border-[#212537]'
                }`}
              >
                {cat === 'barchasi' ? 'Barchasi' : cat}
              </button>
            ))}
          </div>

          {/* Menu Catalog Table */}
          <div className="rounded-xl bg-[#12141f] border border-[#23273a] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#232738] bg-[#161824] text-neutral-400 font-mono text-[11px]">
                    <th className="py-3 px-4">RASM</th>
                    <th className="py-3 px-4 font-sans">TAOM / ICHIMLIK NOMI</th>
                    <th className="py-3 px-4">KATEGORIYA</th>
                    <th className="py-3 px-4">STANSIYA</th>
                    <th className="py-3 px-4 text-right">NARXI (SO'M)</th>
                    <th className="py-3 px-4 text-center">HOLATI (STOP-LIST)</th>
                    <th className="py-3 px-4 text-right">AMALLAR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2130]">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-[#181a28] transition-colors">
                      {/* Image */}
                      <td className="py-3 px-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-[#2b2f42]"
                        />
                      </td>

                      {/* Name & Desc */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white text-sm">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 max-w-xs truncate mt-0.5">
                          {item.description}
                        </div>
                        {item.isChefSpecial && (
                          <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#d4af37]/20 text-[#d4af37]">
                            CHEF'S SPECIAL
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-mono uppercase text-neutral-400 text-[11px]">
                        {item.category}
                      </td>

                      {/* Station */}
                      <td className="py-3 px-4 font-mono text-neutral-400 text-[11px]">
                        {item.station.toUpperCase()}
                      </td>

                      {/* Price (With Quick Inline Edit) */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                        {editingPriceId === item.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              value={tempPriceValue}
                              onChange={e => setTempPriceValue(Number(e.target.value))}
                              className="w-24 bg-[#0a0b10] border border-[#d4af37] px-2 py-1 rounded text-right text-xs text-white font-mono"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                updateItemPrice(item.id, tempPriceValue);
                                setEditingPriceId(null);
                              }}
                              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 group/price">
                            <span className="text-[#d4af37] text-sm">
                              {formatUZS(item.price)}
                            </span>
                            <button
                              onClick={() => {
                                setEditingPriceId(item.id);
                                setTempPriceValue(item.price);
                              }}
                              title="Narxni o'zgartirish"
                              className="p-1 text-neutral-500 hover:text-[#d4af37] rounded transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Availability toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleItemAvailability(item.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase transition-colors ${
                            item.isAvailable
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                          }`}
                        >
                          {item.isAvailable ? 'Sotuvda Bor' : 'Tugagan (Stop)'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg bg-[#1f2233] text-neutral-300 hover:text-white hover:bg-[#2b2f48] transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`"${item.name}" taomini menyudan o'chirishni istaysizmi?`)) {
                                deleteMenuItem(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-[#241718] text-rose-400 hover:bg-rose-900/40 transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Restaurant Settings Form */
        <div className="max-w-3xl rounded-xl bg-[#12141f] border border-[#23273a] p-6 shadow-xl">
          <h2 className="font-serif font-bold text-base text-white mb-4">
            RESTORAN VA CHEK MA'LUMOTLARI
          </h2>
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-400 font-medium block mb-1">Restoran Nomi</label>
                <input
                  type="text"
                  value={settingsName}
                  onChange={e => setSettingsName(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="text-neutral-400 font-medium block mb-1">Shior / Slogan</label>
                <input
                  type="text"
                  value={settingsSlogan}
                  onChange={e => setSettingsSlogan(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Manzil</label>
              <input
                type="text"
                value={settingsAddress}
                onChange={e => setSettingsAddress(e.target.value)}
                className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-neutral-400 font-medium block mb-1">Telefon raqam</label>
                <input
                  type="text"
                  value={settingsPhone}
                  onChange={e => setSettingsPhone(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="text-neutral-400 font-medium block mb-1">STIR (INN)</label>
                <input
                  type="text"
                  value={settingsStir}
                  onChange={e => setSettingsStir(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="text-neutral-400 font-medium block mb-1">Xizmat haqi foizi (%)</label>
                <input
                  type="number"
                  value={settingsServiceFee}
                  onChange={e => setSettingsServiceFee(Number(e.target.value))}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Chek pastidagi minnatdorlik matni</label>
              <input
                type="text"
                value={settingsFooter}
                onChange={e => setSettingsFooter(e.target.value)}
                className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <button
              type="submit"
              className="mt-2 px-5 py-2.5 rounded-lg bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-[#e6c14c] transition-colors"
            >
              Sozlamalarni Saqlash
            </button>
          </form>
        </div>
      )}

      {/* Modal: Add or Edit Menu Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[#12141f] border border-[#2b2f42] rounded-xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#232738]">
              <h2 className="font-serif font-bold text-base text-white">
                {editingItemId ? 'Taomni Tahrirlash' : 'Yangi Taom / Ichimlik Qo\'shish'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="text-neutral-300 font-medium block mb-1">
                  Taom yoki ichimlik nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Maxsus Marmar Steyk"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-300 font-medium block mb-1">
                    Kategoriya *
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as ItemCategory)}
                    className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="asosiy">Asosiy & Steyklar</option>
                    <option value="milliy">Milliy tansiq taomlar</option>
                    <option value="salatlar">Salatlar & Gazaklar</option>
                    <option value="shorvalar">Sho'rvalar</option>
                    <option value="ichimliklar">Mualliflik kokteyllari</option>
                    <option value="desertlar">Desertlar</option>
                    <option value="qahva_choy">Qahva & Choy</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-300 font-medium block mb-1">
                    Narxi (So'mda) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={formPrice}
                    onChange={e => setFormPrice(Number(e.target.value))}
                    className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Image Selection Section */}
              <div className="space-y-2">
                <label className="text-neutral-300 font-medium block">
                  Rasm tanlash yoki yuklash
                </label>
                
                {/* Preview and presets */}
                <div className="flex items-center gap-3">
                  <img
                    src={formImage}
                    alt="Tanlangan rasm"
                    className="w-16 h-16 rounded-lg object-cover border border-[#d4af37]"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="text-[11px] text-neutral-400">
                      Tavsiya etilgan sifatli rasmlardan birini tanlang:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {presetImages.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormImage(p.src)}
                          className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${
                            formImage === p.src
                              ? 'bg-[#d4af37] text-neutral-950 border-[#d4af37] font-bold'
                              : 'bg-[#181a26] text-neutral-300 border-[#2b2f42] hover:text-white'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upload or Custom URL */}
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f2233] border border-[#2e334a] hover:bg-[#282d44] cursor-pointer text-neutral-300 text-xs">
                    <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Kompyuterdan rasm yuklash</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-neutral-300 font-medium block mb-1">
                  Tavsif (Masalliqlar, ta'm xususiyatlari)
                </label>
                <textarea
                  rows={2}
                  placeholder="Yangi sarimsoq, tog' rayhoni va sariyog' bilan pishirilgan..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Station & Prep Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-300 font-medium block mb-1">
                    Oshpaz Stansiyasi
                  </label>
                  <select
                    value={formStation}
                    onChange={e => setFormStation(e.target.value as typeof formStation)}
                    className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="oshxona">Oshxona</option>
                    <option value="mangal">Mangal & Steyk</option>
                    <option value="salat">Salat stansiyasi</option>
                    <option value="bar">Bar & Ichimlik</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-300 font-medium block mb-1">
                    Tayyorlanish (daq)
                  </label>
                  <input
                    type="number"
                    value={formPrepTime}
                    onChange={e => setFormPrepTime(Number(e.target.value))}
                    className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 font-medium block mb-1">
                    Og'irligi (gramm)
                  </label>
                  <input
                    type="number"
                    value={formWeightGrams}
                    onChange={e => setFormWeightGrams(Number(e.target.value))}
                    className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Chef Special Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chefSpecial"
                  checked={formIsChefSpecial}
                  onChange={e => setFormIsChefSpecial(e.target.checked)}
                  className="rounded border-neutral-700 text-[#d4af37] focus:ring-0"
                />
                <label htmlFor="chefSpecial" className="text-neutral-300 font-medium">
                  Chef's Special (Bosh oshpaz tavsiyasi belgisi)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#232738] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#181a26] text-neutral-400 hover:text-white transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#d4af37] hover:bg-[#e6c14c] text-neutral-950 font-bold transition-colors shadow-md"
                >
                  {editingItemId ? 'O\'zgarishlarni Saqlash' : 'Menyuga Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
