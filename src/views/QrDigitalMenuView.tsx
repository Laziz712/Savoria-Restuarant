import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem } from '../types';
import { 
  Search, X, Bell, Clock, ArrowLeft, 
  UtensilsCrossed, Check, ChevronLeft,
  Phone, MapPin, Mail, Music
} from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

// Images for Category Banners (matching Flora Restaurant OsonMenu screenshots)
import plovImg from '../assets/images/savoria_plov_special_1791475881101.jpg';
import wagyuImg from '../assets/images/savoria_wagyu_steak_1791475866836.jpg';
import gijduvonShashlikImg from '../assets/images/savoria_gijduvon_shashlik_1792768139844.jpg';
import burrataImg from '../assets/images/savoria_gourmet_salad_1791475898828.jpg';
import kozaShorvaImg from '../assets/images/savoria_koza_shorva_1792768141238.jpg';
import cocktailImg from '../assets/images/savoria_cocktail_drink_1791475891055.jpg';
import turkishCoffeeImg from '../assets/images/savoria_turkish_coffee_1791907981801.jpg';
import turkishBaklavaImg from '../assets/images/savoria_turkish_baklava_1792768140835.jpg';
import restaurantCoverImg from '../assets/images/savoria_restaurant_interior_1791908438858.jpg';

interface CategoryBanner {
  id: string;
  title: string;
  image: string;
  tab: 'menu' | 'bar';
}

export const QrDigitalMenuView: React.FC = () => {
  const { 
    menuItems, settings, formatUZS, currentTableContext, 
    callWaiterFromTable, setIsMenuOnlyMode, setCurrentTableContext
  } = useRestaurant();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'menu' | 'bar'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDishDetail, setSelectedDishDetail] = useState<MenuItem | null>(null);
  const [waiterCalledToast, setWaiterCalledToast] = useState(false);

  // Category Banners Definition (Matching Flora Restaurant Screenshots)
  const categoryBanners: CategoryBanner[] = useMemo(() => [
    // Menu Tab Categories
    { id: 'milliy', title: 'MILLIY TAOMLAR', image: plovImg, tab: 'menu' },
    { id: 'steak', title: 'MANGAL MEAT & STEYKLAR', image: wagyuImg, tab: 'menu' },
    { id: 'shashlik', title: 'SHASHLIKLAR', image: gijduvonShashlikImg, tab: 'menu' },
    { id: 'salatlar', title: 'SALATLAR', image: burrataImg, tab: 'menu' },
    { id: 'shorvalar', title: 'SHO‘RVALAR', image: kozaShorvaImg, tab: 'menu' },
    // Bar Tab Categories
    { id: 'ichimliklar', title: 'SALQIN ICHIMLIKLAR & FRESH', image: cocktailImg, tab: 'bar' },
    { id: 'qahva_choy', title: 'QAHVA & ELIT CHOYLAR', image: turkishCoffeeImg, tab: 'bar' },
    { id: 'shirinliklar', title: 'DESERTLAR & SHIRINLIKLAR', image: turkishBaklavaImg, tab: 'bar' }
  ], []);

  // Filter banners based on active main tab ('menu' or 'bar')
  const visibleBanners = useMemo(() => {
    return categoryBanners.filter(b => b.tab === activeTab);
  }, [categoryBanners, activeTab]);

  // Dishes to display:
  // When a category is tapped: shows ONLY dishes of that category!
  // If searching: filters dishes matching search query.
  const displayedDishes = useMemo(() => {
    return menuItems.filter(item => {
      // If searching, search across all items or current tab
      if (searchQuery.trim().length > 0) {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase())));
        
        if (selectedCategory) {
          return matchesQuery && (item.category === selectedCategory || (selectedCategory === 'qahva_choy' && item.category === 'ichimliklar'));
        }
        return matchesQuery;
      }

      // If category selected: ONLY dishes of this category!
      if (selectedCategory) {
        if (selectedCategory === 'qahva_choy') {
          return item.category === 'qahva_choy' || (item.category === 'ichimliklar' && (item.name.toLowerCase().includes('qahva') || item.name.toLowerCase().includes('choy')));
        }
        if (selectedCategory === 'ichimliklar') {
          return item.category === 'ichimliklar' && !item.name.toLowerCase().includes('qahva') && !item.name.toLowerCase().includes('choy');
        }
        if (selectedCategory === 'steak') {
          return item.category === 'steak' || item.category === 'asosiy';
        }
        if (selectedCategory === 'shirinliklar') {
          return item.category === 'shirinliklar' || item.category === 'desertlar';
        }
        return item.category === selectedCategory;
      }

      return false;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Active category object
  const currentCategoryObj = categoryBanners.find(b => b.id === selectedCategory);

  const handleCallWaiter = () => {
    callWaiterFromTable(currentTableContext || 'Stol');
    setWaiterCalledToast(true);
    setTimeout(() => {
      setWaiterCalledToast(false);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-[#eaeaea] font-sans selection:bg-[#10b981]/30 selection:text-white pb-24">
      
      {/* =========================================================================
          MAX-WIDTH CONTAINER MATCHING OSONMENU DESKTOP / MOBILE RATIO
          ========================================================================= */}
      <div className="max-w-[480px] mx-auto min-h-screen bg-[#0d0e15] border-x border-[#1a1c27] shadow-2xl flex flex-col">
        
        {/* =========================================================================
            1. TOP COVER BANNER WITH RESTAURANT TITLE (Flora Restaurant style)
            ========================================================================= */}
        <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-[#12141f]">
          <img
            src={restaurantCoverImg}
            alt="Savoria Restaurant"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e15] via-black/40 to-black/30" />

          {/* Back button (When inside a category view, exactly like Screenshot 2) */}
          {selectedCategory && (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="absolute top-3.5 left-3.5 w-9 h-9 rounded-full bg-white/95 text-neutral-900 shadow-xl flex items-center justify-center hover:bg-white active:scale-90 transition-all z-20 cursor-pointer"
              title="Orqaga, toifalarga qaytish"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Language Switcher & Staff Exit Top Right */}
          <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-20">
            <LanguageSwitcher />

            <button
              onClick={() => {
                setIsMenuOnlyMode(false);
                setCurrentTableContext(null);
                try {
                  window.history.pushState({}, '', '/');
                } catch {}
              }}
              className="text-[10px] font-mono px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-neutral-300 hover:text-white border border-white/20 transition-colors"
              title="Admin rejimiga o'tish"
            >
              Chiqish
            </button>
          </div>

          {/* Table Badge on Cover */}
          <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#d4af37]/50 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>📍 {currentTableContext || 'Stol #1'}</span>
            </div>

            <button
              onClick={handleCallWaiter}
              className="px-2.5 py-1 rounded-full bg-emerald-500/90 hover:bg-emerald-500 text-neutral-950 font-bold text-[11px] flex items-center gap-1 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Ofitsiant</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. RESTAURANT TITLE & MENU / BAR PILL SWITCHER (Matching Screenshot 1)
            ========================================================================= */}
        <div className="px-4 pt-4 pb-3">
          {/* Restaurant Title: "SAVORIA RESTAURANT" */}
          <h1 className="font-serif font-extrabold text-2xl text-white tracking-wide">
            SAVORIA RESTAURANT
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Shohona taomlar va premium sharqona mehmondo‘stlik
          </p>

          {/* Menu / Bar Pill Toggle Buttons (Screenshot 1: Menu vs Bar) */}
          <div className="flex items-center gap-2.5 mt-3.5">
            <button
              onClick={() => {
                setActiveTab('menu');
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                  : 'bg-[#151825] hover:bg-[#1d2133] text-neutral-300 border border-[#262b40]'
              }`}
            >
              Menu
            </button>

            <button
              onClick={() => {
                setActiveTab('bar');
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'bar'
                  ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                  : 'bg-[#151825] hover:bg-[#1d2133] text-neutral-300 border border-[#262b40]'
              }`}
            >
              Bar
            </button>
          </div>

          {/* Search Input Bar (Matching Flora Restaurant screenshot search) */}
          <div className="relative mt-3.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-[#141624] border border-[#23273c] focus:border-emerald-500 rounded-xl px-4 py-2.5 pr-10 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-9 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            3. CONTENT BODY:
               A) If Category is NOT selected and NOT searching -> Shows Category Banners (Screenshot 1)
               B) If Category IS selected or SEARCHING -> Shows Dishes in that Category (Screenshot 2)
            ========================================================================= */}
        <div className="flex-1 px-4 py-2 space-y-3">
          
          {/* CASE A: CATEGORY BANNERS LIST (Matching Screenshot 1 & 3) */}
          {!selectedCategory && searchQuery.trim().length === 0 && (
            <div className="space-y-3 pb-6">
              {visibleBanners.map((banner) => (
                <div
                  key={banner.id}
                  onClick={() => {
                    setSelectedCategory(banner.id);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="relative w-full h-32 sm:h-36 rounded-2xl overflow-hidden cursor-pointer group shadow-lg border border-[#202538] hover:border-emerald-500/60 transition-all active:scale-[0.98]"
                >
                  {/* Category Image */}
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  {/* Dark contrast overlay */}
                  <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors" />

                  {/* Centered Bold White Title (Exact Flora Restaurant style) */}
                  <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
                    <span className="font-serif font-extrabold text-base sm:text-lg text-white tracking-[0.12em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      {banner.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CASE B: DISHES LIST INSIDE SELECTED CATEGORY (Matching Screenshot 2) */}
          {(selectedCategory || searchQuery.trim().length > 0) && (
            <div className="space-y-4 pb-8">
              {/* Category Title Header (Screenshot 2: "MILLIY TAOMLAR") */}
              <div className="flex items-center justify-between pt-1 pb-1">
                <h2 className="font-serif font-extrabold text-base sm:text-lg text-white tracking-wider uppercase">
                  {searchQuery 
                    ? `QIDIRUV NATIJALARI (${displayedDishes.length})` 
                    : (currentCategoryObj?.title || 'TAOMLAR RO‘YXATI')}
                </h2>

                {selectedCategory && (
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                    }}
                    className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Toifalar</span>
                    <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>
                )}
              </div>

              {/* Dish Cards List (Matching Screenshot 2: Big food photo, Title in caps, Green price) */}
              {displayedDishes.length === 0 ? (
                <div className="text-center py-16 bg-[#121420] border border-[#23273c] rounded-2xl p-6">
                  <UtensilsCrossed className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">Bu bo'limda hozircha taom yo'q</p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                    }}
                    className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs"
                  >
                    Barcha toifalarga qaytish
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedDishes.map((dish) => (
                    <div
                      key={dish.id}
                      onClick={() => setSelectedDishDetail(dish)}
                      className="bg-[#121420] border border-[#23273c] hover:border-emerald-500/50 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-all group shadow-md"
                    >
                      {/* Big Landscape Dish Image (Matching Screenshot 2) */}
                      <div className="relative w-full h-44 sm:h-52 bg-[#090a10] overflow-hidden">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121420] via-transparent to-transparent" />

                        {dish.weightGrams && (
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-neutral-300 border border-white/10">
                            {dish.weightGrams} gr
                          </div>
                        )}
                      </div>

                      {/* Dish Info: Name in Caps & Bright Green Price */}
                      <div className="p-3.5 pt-2">
                        <h3 className="font-serif font-extrabold text-sm sm:text-base text-white uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
                          {dish.name}
                        </h3>

                        {dish.description && (
                          <p className="text-xs text-neutral-400 line-clamp-1 mt-1 font-normal">
                            {dish.description}
                          </p>
                        )}

                        <div className="text-emerald-400 font-extrabold text-base sm:text-lg font-mono mt-1.5">
                          {formatUZS(dish.price).replace(" so'm", '')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            COMPACT SAVORIA FOOTER (Qisqartirilgan restoranning ma'lumotlar paneli)
            ========================================================================= */}
        <div className="mt-8 border-t border-[#1f2334] bg-gradient-to-b from-[#0e1018] to-[#08090f] p-4 sm:p-5 rounded-b-3xl space-y-3.5">
          {/* Brand header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1b1f2e]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2a2415] to-[#12131d] border border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] font-serif font-bold text-sm shadow">
                S
              </div>
              <div>
                <h4 className="font-serif font-bold text-xs sm:text-sm text-white tracking-wider uppercase">
                  SAVORIA RESTAURANT
                </h4>
                <p className="text-[10px] text-[#d4af37] font-mono">
                  100% Halol Kafolati · ★ 4.9 (500+ baholar)
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
              10:00 - 23:30
            </span>
          </div>

          {/* Contact & Hours Quick Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {/* Bog'lanish */}
            <div className="bg-[#121521] border border-[#1e2335] rounded-xl p-2.5 space-y-1.5">
              <a 
                href="tel:+998712007112" 
                className="flex items-center gap-2 text-neutral-200 hover:text-emerald-400 font-mono transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bold">+998 71 200-71-12</span>
              </a>
              <div className="flex items-center gap-2 text-neutral-300">
                <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span className="truncate">Toshkent, Bunyodkor shohi 45</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400 font-mono text-[10px]">
                <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="truncate">lazizshavkatov712@gmail.com</span>
              </div>
            </div>

            {/* Ish vaqti & Tarmoqlar */}
            <div className="bg-[#121521] border border-[#1e2335] rounded-xl p-2.5 space-y-1.5">
              <div className="flex items-center gap-2 text-neutral-300">
                <Clock className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span>Har kuni: <b>10:00 - 23:30</b> (Osh: 11:30)</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400/90 text-[10px]">
                <Music className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Jonli musiqa: Juma - Yakshanba (19:30)</span>
              </div>
              <div className="flex items-center gap-3 pt-0.5 text-[10px] font-mono">
                <a 
                  href="https://t.me/lazizshavkatov712" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>Telegram: @lazizshavkatov712</span>
                </a>
                <span className="text-neutral-600">·</span>
                <a 
                  href="https://instagram.com/shavkatovv.o07" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-pink-400 hover:underline flex items-center gap-1"
                >
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright & Website */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-[#171a26] text-[10px] text-neutral-400 font-mono gap-1 text-center sm:text-left">
            <span>© 2026 SAVORIA RESTAURANT · 100% Halol</span>
            <span className="text-[#d4af37]">https://savoria-restaurant.uz</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. DISH DETAIL LIGHTBOX MODAL (Ustiga bosganda ochiladigan to'liq oyna)
          ========================================================================= */}
      {selectedDishDetail && (
        <div 
          onClick={() => setSelectedDishDetail(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-[#0f111a] border border-[#272b3e] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up"
          >
            {/* Modal Image */}
            <div className="relative h-60 sm:h-64 w-full bg-[#0a0b10] overflow-hidden">
              <img
                src={selectedDishDetail.image}
                alt={selectedDishDetail.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-transparent to-black/60" />
              
              <button
                onClick={() => setSelectedDishDetail(null)}
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Price Tag Overlay */}
              <div className="absolute bottom-3 left-4">
                <div className="text-2xl font-mono font-extrabold text-emerald-400 drop-shadow-md">
                  {formatUZS(selectedDishDetail.price)}
                </div>
              </div>
            </div>

            {/* Modal Details Content */}
            <div className="p-5 overflow-y-auto space-y-3.5">
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-white uppercase tracking-wide">
                  {selectedDishDetail.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-mono text-neutral-400">
                  {selectedDishDetail.weightGrams && (
                    <span className="px-2 py-0.5 rounded-md bg-[#161826] text-neutral-300">
                      ⚖️ {selectedDishDetail.weightGrams} gr
                    </span>
                  )}
                  {selectedDishDetail.calories && (
                    <span className="px-2 py-0.5 rounded-md bg-[#161826] text-neutral-300">
                      🔥 {selectedDishDetail.calories} kkal
                    </span>
                  )}
                  {selectedDishDetail.prepTimeMinutes && (
                    <span className="px-2 py-0.5 rounded-md bg-[#161826] text-neutral-300">
                      ⏱️ ~{selectedDishDetail.prepTimeMinutes} daqiqa
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedDishDetail.description && (
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {selectedDishDetail.description}
                </p>
              )}

              {/* Ingredients List */}
              {selectedDishDetail.ingredients && selectedDishDetail.ingredients.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1.5">
                    Masalliqlari:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDishDetail.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#161826] border border-[#262a40] text-xs text-neutral-200"
                      >
                        ✓ {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Close */}
            <div className="p-3.5 bg-[#0a0b12] border-t border-[#1b1f30]">
              <button
                onClick={() => setSelectedDishDetail(null)}
                className="w-full py-2.5 rounded-xl bg-[#1a1d2e] hover:bg-[#25293f] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. WAITER CALL NOTIFICATION TOAST
          ========================================================================= */}
      {waiterCalledToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-neutral-950 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <Bell className="w-4 h-4" />
          <span>🔔 Ofitsiant «{currentTableContext || 'Stol'}» ga yo'naltirildi!</span>
        </div>
      )}

    </div>
  );
};
