import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem, ItemCategory } from '../types';
import { 
  Search, X, Bell, Wifi, Clock, Sparkles, 
  Flame, ShieldCheck, ChevronRight, ArrowLeft, 
  UtensilsCrossed, Check, Info, Globe, Star
} from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const QrDigitalMenuView: React.FC = () => {
  const { 
    menuItems, settings, formatUZS, currentTableContext, 
    callWaiterFromTable, setIsMenuOnlyMode, setCurrentTableContext,
    language, t
  } = useRestaurant();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('barchasi');
  const [selectedDishDetail, setSelectedDishDetail] = useState<MenuItem | null>(null);
  const [waiterCalledToast, setWaiterCalledToast] = useState(false);

  // Category list matching restaurant dishes
  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'barchasi', label: 'Barchasi', icon: '🍽️' },
    { id: 'milliy', label: 'Milliy Taomlar', icon: '🍲' },
    { id: 'asosiy', label: 'Steyklar & Go‘sht', icon: '🥩' },
    { id: 'salat', label: 'Salatlar', icon: '🥗' },
    { id: 'issiq', label: 'Sho‘rvalar', icon: '🥣' },
    { id: 'shirinliklar', label: 'Desertlar', icon: '🍰' },
    { id: 'ichimliklar', label: 'Ichimliklar', icon: '🍹' },
    { id: 'bar', label: 'Choy & Kofe', icon: '☕' }
  ];

  // Filtered dishes
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesCat = selectedCategory === 'barchasi' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  // Group dishes by category if "barchasi" is active and not searching
  const groupedDishes = useMemo(() => {
    if (selectedCategory !== 'barchasi' || searchQuery.trim().length > 0) {
      return null;
    }
    const groups: { [key: string]: MenuItem[] } = {};
    categories.forEach(cat => {
      if (cat.id === 'barchasi') return;
      const itemsInCat = menuItems.filter(i => i.category === cat.id);
      if (itemsInCat.length > 0) {
        groups[cat.id] = itemsInCat;
      }
    });
    return groups;
  }, [menuItems, selectedCategory, searchQuery]);

  const handleCallWaiter = () => {
    callWaiterFromTable(currentTableContext || 'Stol');
    setWaiterCalledToast(true);
    setTimeout(() => {
      setWaiterCalledToast(false);
    }, 4000);
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    if (catId !== 'barchasi') {
      const el = document.getElementById(`cat-section-${catId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#08090f] text-[#eaeaea] font-sans selection:bg-[#d4af37]/30 selection:text-white pb-24">
      
      {/* =========================================================================
          1. TEPADA SAVORIA DEGAN XATLAR VA HEADER (OsonMenu style)
          ========================================================================= */}
      <header className="bg-gradient-to-b from-[#141624] via-[#0d0f18] to-[#08090f] border-b border-[#23273c] pt-5 pb-4 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-[#d4af37]/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto">
          {/* Top Row: Language & Admin Back Toggle */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-medium text-emerald-400">
                Jonli QR Menyu
              </span>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />

              {/* Exit button to full app for staff */}
              <button
                onClick={() => {
                  setIsMenuOnlyMode(false);
                  setCurrentTableContext(null);
                  try {
                    window.history.pushState({}, '', '/');
                  } catch {}
                }}
                className="text-[11px] font-mono px-2 py-1 rounded-lg bg-[#151724] border border-[#2b3044] text-neutral-400 hover:text-white transition-colors"
                title="Bosh sahifa / Admin rejimiga o'tish"
              >
                Chiqish
              </button>
            </div>
          </div>

          {/* Savoria Brand Header */}
          <div className="text-center space-y-1.5 mb-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[#2a1f10] to-[#12131d] border border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] font-serif font-extrabold text-xl shadow-[0_0_20px_rgba(212,175,55,0.25)]">
              S
            </div>
            
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-white tracking-widest uppercase">
              SAVORIA RESTAURANT
            </h1>
            
            <p className="text-xs text-[#d4af37] font-medium tracking-wide">
              {settings.slogan || 'Premium Gastronomiya & Sharqona Mehmondo‘stlik'}
            </p>
          </div>

          {/* Table Badge & Service Info Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-neutral-300 mb-4">
            <div className="px-3 py-1 rounded-full bg-[#171926] border border-[#d4af37]/40 text-amber-300 font-bold flex items-center gap-1.5 shadow-sm">
              <span>📍 {currentTableContext || 'Stol #1'}</span>
            </div>

            <div className="px-3 py-1 rounded-full bg-[#12141f] border border-[#232739] text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>10:00 – 23:00</span>
            </div>

            <div className="px-3 py-1 rounded-full bg-[#12141f] border border-[#232739] text-neutral-300 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wi-Fi: {settings.wifiPassword || 'savoria_vip_guest'}</span>
            </div>

            <div className="px-3 py-1 rounded-full bg-[#12141f] border border-[#232739] text-neutral-300">
              Xizmat: {settings.serviceFeePercent || 12}%
            </div>
          </div>

          {/* Call Waiter Buzzer Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={handleCallWaiter}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Ofitsiantni Chaqirish</span>
            </button>
          </div>

          {/* Search Box (Instant search like OsonMenu) */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Taom yoki ichimlik nomini qidiring... (masalan: Osh, Steyk, Sezar)"
              className="w-full bg-[#121420] border border-[#262a3f] focus:border-[#d4af37] rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. STICKY HORIZONTAL CATEGORY PILLS BAR (OsonMenu signature UX)
          ========================================================================= */}
      <div className="sticky top-0 z-30 bg-[#08090f]/95 backdrop-blur-md border-b border-[#1f2235] py-2.5 px-3 sm:px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#d4af37] text-neutral-950 font-bold shadow-md shadow-[#d4af37]/20 scale-102'
                    : 'bg-[#131520] hover:bg-[#1b1e2e] text-neutral-300 hover:text-white border border-[#25283c]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. TAOMLAR RO'YXATI (OsonMenu Style Dish Cards)
          ========================================================================= */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-6">
        
        {/* If searching or single category filtered */}
        {(!groupedDishes || selectedCategory !== 'barchasi' || searchQuery.trim().length > 0) ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-bold text-lg text-white">
                {categories.find(c => c.id === selectedCategory)?.label || 'Barcha taomlar'} ({filteredItems.length})
              </h2>
              {searchQuery && (
                <span className="text-xs text-neutral-400">
                  Qidiruv: "{searchQuery}"
                </span>
              )}
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-[#10121b] border border-[#202436] rounded-3xl p-6">
                <UtensilsCrossed className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">
                  Kechirasiz, taom topilmadi
                </h3>
                <p className="text-xs text-neutral-400 mb-4">
                  Boshqa nom yoki toifani qidirib ko'ring
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('barchasi');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1b1e2c] border border-[#2d3248] text-[#d4af37] text-xs font-semibold"
                >
                  Barcha taomlarni ko'rish
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredItems.map(item => (
                  <DishCard key={item.id} item={item} onSelect={() => setSelectedDishDetail(item)} formatUZS={formatUZS} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Grouped by Category Mode (Exactly like OsonMenu) */
          <div className="space-y-8">
            {categories.filter(c => c.id !== 'barchasi').map(cat => {
              const catItems = groupedDishes[cat.id] || [];
              if (catItems.length === 0) return null;

              return (
                <section key={cat.id} id={`cat-section-${cat.id}`} className="scroll-mt-14">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 pb-2 mb-3 border-b border-[#1e2235]">
                    <span className="text-xl">{cat.icon}</span>
                    <h2 className="font-serif font-bold text-lg sm:text-xl text-white tracking-wide">
                      {cat.label}
                    </h2>
                    <span className="text-xs font-mono text-neutral-400 ml-auto">
                      {catItems.length} ta taom
                    </span>
                  </div>

                  {/* Dish Cards in this category */}
                  <div className="space-y-3 sm:space-y-4">
                    {catItems.map(item => (
                      <DishCard key={item.id} item={item} onSelect={() => setSelectedDishDetail(item)} formatUZS={formatUZS} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* =========================================================================
          4. MINIMAL FOOTER (Savoria xatlari va kontaktlar)
          ========================================================================= */}
      <footer className="max-w-4xl mx-auto px-4 pt-10 pb-6 text-center border-t border-[#1a1d2c] text-xs text-neutral-400 space-y-2">
        <div className="font-serif font-bold text-white text-sm tracking-wider">
          SAVORIA RESTAURANT
        </div>
        <p className="text-[11px] text-neutral-400">
          Toshkent sh., Bunyodkor shoh ko'chasi 45-uy · Tel: +998 71 200-71-12
        </p>
        <p className="text-[10px] text-neutral-400">
          Barcha narxlar milliy valyutada ({settings.serviceFeePercent || 12}% xizmat haqi hisobga olinadi).
        </p>
      </footer>

      {/* =========================================================================
          5. DISH DETAIL LIGHTBOX MODAL (OsonMenu style dish popup)
          ========================================================================= */}
      {selectedDishDetail && (
        <div 
          onClick={() => setSelectedDishDetail(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-[#11131e] border border-[#272b3e] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up"
          >
            {/* Modal Image */}
            <div className="relative h-64 sm:h-72 w-full bg-[#0a0b10] overflow-hidden">
              <img
                src={selectedDishDetail.image}
                alt={selectedDishDetail.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11131e] via-transparent to-black/50" />
              
              <button
                onClick={() => setSelectedDishDetail(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Price Tag Overlay */}
              <div className="absolute bottom-3 left-4">
                <div className="text-2xl font-serif font-extrabold text-[#d4af37] drop-shadow-md">
                  {formatUZS(selectedDishDetail.price)}
                </div>
              </div>
            </div>

            {/* Modal Details Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">
                  {selectedDishDetail.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-mono text-neutral-400">
                  {selectedDishDetail.weightGrams && (
                    <span className="px-2 py-0.5 rounded-md bg-[#191c2b] text-neutral-300">
                      ⚖️ {selectedDishDetail.weightGrams} gr
                    </span>
                  )}
                  {selectedDishDetail.calories && (
                    <span className="px-2 py-0.5 rounded-md bg-[#191c2b] text-neutral-300">
                      🔥 {selectedDishDetail.calories} kkal
                    </span>
                  )}
                  {selectedDishDetail.prepTimeMinutes && (
                    <span className="px-2 py-0.5 rounded-md bg-[#191c2b] text-neutral-300">
                      ⏱️ ~{selectedDishDetail.prepTimeMinutes} daq
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedDishDetail.description && (
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {selectedDishDetail.description}
                </p>
              )}

              {/* Ingredients List */}
              {selectedDishDetail.ingredients && selectedDishDetail.ingredients.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#d4af37] font-semibold mb-2">
                    Tarkibi va masalliqlari:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDishDetail.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#181a28] border border-[#2b3044] text-xs text-neutral-200"
                      >
                        ✓ {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-time status */}
              <div className="pt-2 border-t border-[#1e2235] flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Holati:</span>
                <span className={`font-bold ${selectedDishDetail.isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedDishDetail.isAvailable ? '● Buyurtma uchun tayyor' : '✕ Vaqtincha mavjud emas'}
                </span>
              </div>
            </div>

            {/* Modal Bottom Close */}
            <div className="p-4 bg-[#0d0e17] border-t border-[#1e2235]">
              <button
                onClick={() => setSelectedDishDetail(null)}
                className="w-full py-3 rounded-xl bg-[#1d2030] hover:bg-[#272b40] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. WAITER CALLED TOAST NOTIFICATION
          ========================================================================= */}
      {waiterCalledToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2.5 animate-bounce">
          <Bell className="w-4 h-4" />
          <span>🔔 Ofitsiant «{currentTableContext || 'Stol'}» ga yo'naltirildi! Xodim tez orada keladi.</span>
        </div>
      )}

    </div>
  );
};

// =============================================================================
// DISH CARD COMPONENT (Clean, photo on right/left, price, weight, like OsonMenu)
// =============================================================================
interface DishCardProps {
  item: MenuItem;
  onSelect: () => void;
  formatUZS: (amount: number) => string;
}

const DishCard: React.FC<DishCardProps> = ({ item, onSelect, formatUZS }) => {
  return (
    <div
      onClick={onSelect}
      className="bg-[#11131f] hover:bg-[#161827] border border-[#222538] hover:border-[#d4af37]/50 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 transition-all cursor-pointer group shadow-sm"
    >
      {/* Left: Text & Price info */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-serif font-bold text-sm sm:text-base text-white group-hover:text-[#d4af37] transition-colors leading-snug line-clamp-1">
            {item.name}
          </h3>
        </div>

        {/* Short description */}
        {item.description && (
          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-2 font-normal">
            {item.description}
          </p>
        )}

        {/* Price & Specs Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-serif font-extrabold text-sm sm:text-base text-[#d4af37]">
            {formatUZS(item.price)}
          </span>

          {item.weightGrams && (
            <span className="text-[11px] font-mono text-neutral-400 px-1.5 py-0.5 rounded bg-[#171926] border border-[#252839]">
              {item.weightGrams} gr
            </span>
          )}

          {item.isChefSpecial && (
            <span className="text-[10px] font-semibold text-amber-300 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
              ★ Maxsus
            </span>
          )}

          {!item.isAvailable && (
            <span className="text-[10px] font-semibold text-rose-400 px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30">
              Tugagan
            </span>
          )}
        </div>
      </div>

      {/* Right: Dish Photo thumbnail */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#0a0b10] shrink-0 border border-[#25283a] group-hover:border-[#d4af37]/40 transition-colors">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>
    </div>
  );
};
