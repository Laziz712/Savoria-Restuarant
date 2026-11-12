import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, ShoppingBag, Utensils, UtensilsCrossed, 
  Bike, BarChart3, Receipt, Laptop, Smartphone, ShieldCheck, 
  ArrowRight, ExternalLink, ChevronDown, Check, Star, Users,
  CreditCard, Send, Clock, Layers, Flame, Award, PhoneCall
} from 'lucide-react';
import { SubscriptionCheckoutModal } from '../components/SubscriptionCheckoutModal';
import { PlatformPricingConfig } from '../types';

interface LandingPageViewProps {
  onOpenDemo: (subRoute?: string) => void;
  initialBuyModalOpen?: boolean;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onOpenDemo,
  initialBuyModalOpen = false
}) => {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(initialBuyModalOpen);
  const [selectedPlanMonths, setSelectedPlanMonths] = useState<number>(12);
  const [activeDemoTab, setActiveDemoTab] = useState<'mijoz' | 'kassa' | 'oshxona' | 'xisobot'>('mijoz');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
      .then(d => {
        if (d && d.cardNumber) setPricingConfig(d);
      })
      .catch(() => {});
  }, []);

  const formatUZS = (val: number) => new Intl.NumberFormat('uz-UZ').format(val) + " so'm";

  const handleOpenBuy = (months: number) => {
    setSelectedPlanMonths(months);
    setIsBuyModalOpen(true);
  };

  const faqs = [
    {
      q: "Savoria POS tizimi nima va u qanday qurilmalarda ishlaydi?",
      a: "Savoria — bu restoran, kafe, oshxona va barlar uchun mo'ljallangan to'liq bulutli (Cloud) boshqaruv tizimidir. U har qanday planshet (iPad, Android), kompyuter (Windows, Mac) va smartfonlarda maxsus qimmat uskunalar talab qilmasdan brauzer orqali ishlaydi."
    },
    {
      q: "To'lov qilgach, tizim qancha vaqtda tayyor bo'ladi?",
      a: "Siz to'lov chekini yuklaganingizdan va Telegramda administratorga yuborganingizdan so'ng, tizim 15 daqiqa ichida avtomatik ishga tushiriladi va sizga shaxsiy saytingiz (masalan: savoria-restaurant.uz/sizning-nomingiz) hamda admin kirish ma'lumotlari taqdim etiladi."
    },
    {
      q: "Biz o'z taomlarimiz, narxlarimiz va logotipimizni kirita olamizmi?",
      a: "Albatta! Sizga taqdim etiladigan Admin panel orqali o'z taomlaringiz, kategoriyalar, stollar ro'yxati, ofitsiantlar, yetkazib berish shartlari va logotipingizni to'liq o'zingiz boshqarasiz."
    },
    {
      q: "Mehmonlar uchun QR menyu qanday ishlaydi?",
      a: "Har bir stol uchun alohida QR kod yaratiladi. Mehmon smartfon kamerasini yo'naltirganda, ilova o'rnatmasdan chiroyli menyuni ko'radi, buyurtma beradi yoki bitta tugma bilan ofitsiantni chaqiradi."
    },
    {
      q: "Chek chiqarish uchun qanday printerlar mos keladi?",
      a: "Tizim barcha 58mm va 80mm standart Bluetooth, USB va tarmoq (LAN/Wi-Fi) termoprinterlari bilan to'liq mos ishlaydi. Fiskal va non-fiskal cheklarni to'g'ridan-to'g'ri chop etishingiz mumkin."
    },
    {
      q: "Obuna muddati tugasa, ma'lumotlarim o'chib ketadimi?",
      a: "Yo'q, hech qanday ma'lumot o'chmaydi! Obuna muddati tugasa, tizim vaqtincha faqat ko'rish rejimiga o'tadi va barcha arxiv saqlanib turadi. Obunani uzaytirishingiz bilan to'liq funksional qayta faollashadi."
    }
  ];

  return (
    <div className="min-h-screen bg-[#07080d] text-[#eaeaea] font-sans selection:bg-[#d4af37]/30 selection:text-white">
      {/* Top SaaS Header */}
      <header className="sticky top-0 z-40 bg-[#0a0c14]/95 backdrop-blur-md border-b border-[#1f2335]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#b89428] to-[#6d5512] flex items-center justify-center text-neutral-950 font-serif font-bold text-xl shadow-[0_0_20px_rgba(212,175,55,0.35)]">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif tracking-wider font-bold text-lg sm:text-xl text-white">
                  SAVORIA POS
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 font-bold uppercase">
                  SaaS Platform
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Restoran & Kafelar Uchun Bulutli POS Tizimi
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-neutral-300">
            <a href="#imkoniyatlar" className="hover:text-[#d4af37] transition-colors">Imkoniyatlar</a>
            <a href="#demo" className="hover:text-[#d4af37] transition-colors">Jonli Demo</a>
            <a href="#narxlar" className="hover:text-[#d4af37] transition-colors">Narxlar</a>
            <a href="#qadamlar" className="hover:text-[#d4af37] transition-colors">Qanday Ishlaydi?</a>
            <a href="#faq" className="hover:text-[#d4af37] transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenDemo()}
              className="px-3.5 py-2 rounded-xl bg-[#141724] hover:bg-[#1f2438] text-white border border-[#2b3149] text-xs font-bold transition-all cursor-pointer"
            >
              Demoni Ko'rish
            </button>

            <button
              onClick={() => handleOpenBuy(12)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e2bd44] to-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Sotib Olish
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#d4af37]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#171a28] border border-[#d4af37]/40 text-amber-300 text-xs font-mono mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
            <span>O'zbekistondagi Restoranlar Uchun 1-Raqamli Bulutli POS Tizimi</span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Restoraningizni <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f3d478] to-[#d4af37]">15 daqiqada</span> avtomatlashtiring
          </h1>

          <p className="mt-6 text-sm sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Qimmatbaho server va litsenziyalarsiz. Smartfon, planshet yoki noutbuk orqali kassa, oshxona (KDS), ofitsiantlar, dostavka va hisobotlarni bir vaqtda boshqaring.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              onClick={() => handleOpenBuy(12)}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#e6c14c] to-[#d4af37] text-neutral-950 font-bold text-sm uppercase tracking-wider shadow-[0_10px_35px_rgba(212,175,55,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>O'z Restoraningizga Olish</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenDemo()}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#141724] hover:bg-[#1e2338] text-white border border-[#2b314a] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Jonli Demoni Sinash</span>
              <ExternalLink className="w-4 h-4 text-[#d4af37]" />
            </button>
          </div>

          {/* Social Proof / Stats */}
          <div className="mt-14 pt-8 border-t border-[#1a1e2e] grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#d4af37]">15 daqiqa</div>
              <div className="text-xs text-neutral-400 mt-0.5">Tezkor ishga tushirish</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-white">0 so'm</div>
              <div className="text-xs text-neutral-400 mt-0.5">Uskuna & server xarajati</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400">100% Real-Time</div>
              <div className="text-xs text-neutral-400 mt-0.5">Barcha qurilmalar jonli</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-white">24 / 7</div>
              <div className="text-xs text-neutral-400 mt-0.5">Telegram yordam markazi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Section */}
      <section id="demo" className="py-16 bg-[#0b0d16] border-y border-[#1a1e30] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-[#d4af37] uppercase tracking-wider">Jonli Tizim Ko'rinishi</span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-white mt-1">
              Savoria POS Tizimini hoziroq sinab ko'ring
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Quyidagi interaktiv panellarni tanlab, tizim qanday ishlashini amalda ko'ring
            </p>
          </div>

          {/* Interactive tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {[
              { id: 'mijoz', label: '📱 Mijoz QR Menyusi', route: 'mijoz' },
              { id: 'kassa', label: '💻 Kassa (POS)', route: 'admin' },
              { id: 'oshxona', label: '🍳 Oshxona (KDS)', route: 'admin' },
              { id: 'xisobot', label: '📊 Tahlil & Xisobot', route: 'admin' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDemoTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeDemoTab === tab.id
                    ? 'bg-[#d4af37] text-neutral-950 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'bg-[#141724] text-neutral-400 hover:text-white border border-[#23283c]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Device Showcase Frame */}
          <div className="rounded-3xl border border-[#2b3148] bg-[#08090f] shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Top Browser Bar */}
            <div className="px-4 py-3 bg-[#111420] border-b border-[#212538] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-[11px] font-mono text-neutral-400 hidden sm:inline">
                  https://savoria-restaurant.uz/{activeDemoTab === 'mijoz' ? 'demo' : 'demo/admin'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenDemo(activeDemoTab === 'mijoz' ? 'mijoz' : 'admin')}
                  className="px-3 py-1 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>To'liq Ekranda Ochish</span>
                </button>
              </div>
            </div>

            {/* Simulated Live Viewport */}
            <div className="p-6 sm:p-10 text-center space-y-6">
              {activeDemoTab === 'mijoz' && (
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-white">Sharqona & Zamonaviy QR Menyu</h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    Mehmonlar stol ustidagi QR kodni skaner qilganda ochiladigan chiroyli taomlar katalogi, fotosuratlar, qidiruv, stol xizmati va ofitsiant chaqiruvi tugmasi.
                  </p>
                  <button
                    onClick={() => onOpenDemo('mijoz')}
                    className="px-6 py-3 rounded-xl bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Mijoz Menyusini Sinash</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {activeDemoTab === 'kassa' && (
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
                    <Laptop className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-white">Kassa (POS) va Stollar Nazorati</h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    Stollarga buyurtma ochish, taomlarni qo'shish, chegirmani hisoblash, 12% xizmat haqi va 58mm/80mm termoprinterda chek chiqarish.
                  </p>
                  <button
                    onClick={() => onOpenDemo('admin')}
                    className="px-6 py-3 rounded-xl bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Kassani Sinash (PIN: 1111)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {activeDemoTab === 'oshxona' && (
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto">
                    <Flame className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-white">Oshxona Monitori (KDS)</h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    Oshpazlar buyurtmalarni jonli ko'radi, tayyorlik vaqtini belgilaydi va tayyor bo'lgan taomlarni ofitsiantlarga ovozli signal bilan uzatadi.
                  </p>
                  <button
                    onClick={() => onOpenDemo('admin')}
                    className="px-6 py-3 rounded-xl bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Oshxona Monitorini Ko'rish</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {activeDemoTab === 'xisobot' && (
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-white">Moliyaviy Hisobot & Z-Xisobot</h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    Kunlik, haftalik va oylik sof daromad, o'rtacha chek miqdori, eng ko'p sotilgan taomlar va Excel CSV eksport.
                  </p>
                  <button
                    onClick={() => onOpenDemo('admin')}
                    className="px-6 py-3 rounded-xl bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Hisobotlarni Ko'rish</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8 Feature Highlights */}
      <section id="imkoniyatlar" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono text-[#d4af37] uppercase tracking-wider">To'liq Ekosistema</span>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-white mt-1">
            Restoraningiz uchun barcha modullar bitta platformada
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Har bir modul restoran ish faoliyatini tezlashtirish va xatolarni 0 ga tushirish uchun maxsus ishlab chiqilgan
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              icon: Laptop,
              title: 'Kassa (POS)',
              desc: 'Zal stollari, olib ketish va dostavka buyurtmalarini tezkor hisob-kitob qilish, to\'lov usullari va smena nazorati.'
            },
            {
              icon: Smartphone,
              title: 'QR Raqamli Menyu',
              desc: 'Mehmonlar telefonida maxsus ilovasiz ochiladi. Jonli rasmlar, tarkib, narxlar va ofitsiant chaqirish tugmasi.'
            },
            {
              icon: Utensils,
              title: 'Oshxona ekrani (KDS)',
              desc: 'Buyurtmalar stansiyalar (mangal, oshxona, bar, salat) bo\'yicha ajratiladi va oshpazga ovozli xabar beradi.'
            },
            {
              icon: Bike,
              title: 'Dostavka Moduli',
              desc: 'Yetkazib berish manzillari, kuryerlar ro\'yxati, yetkazish vaqti va buyurtma holatini jonli kuzatish.'
            },
            {
              icon: BarChart3,
              title: 'Moliya & Z-Xisobot',
              desc: 'Kassaning kunlik sof foydasi, soatlar kesimidagi tushum, to\'lov turlari va Excel / PDF formatida eksport.'
            },
            {
              icon: Receipt,
              title: 'Termoprinter Cheklar',
              desc: '58mm va 80mm printerlar uchun moslashtirilgan, logotip va QR-kodli restoran cheki dizayni.'
            },
            {
              icon: Users,
              title: 'Ofitsiantlar & Xodimlar',
              desc: 'Har bir ofitsiantga 4 xonali shaxsiy PIN kod, stollarni biriktirish va sotuvlar statistikasi.'
            },
            {
              icon: Layers,
              title: 'Shaxsiy Domen & Brend',
              desc: 'Har bir restoran o\'z logotipi, ranglari, aloqa ma\'lumotlari va shaxsiy web-manzili bilan ishlaydi.'
            }
          ].map((item, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#0f111c] border border-[#21263a] hover:border-[#d4af37]/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a2414] to-[#141624] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-white mb-2">{item.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="narxlar" className="py-20 bg-[#0a0c14] border-t border-[#1a1e30] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono text-[#d4af37] uppercase tracking-wider">Shaffof Tariflar</span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-white mt-1">
              Yashirin to'lovlarsiz, qulay obuna
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Asosiy narx: oyiga <strong>399 000 so'm</strong>. Uzoqroq muddatga obuna bo'ling va 20% gacha tejab qoling!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {/* 3 Months Plan */}
            <div className="p-6 rounded-3xl bg-[#0f111d] border border-[#23283c] flex flex-col justify-between hover:border-[#383e58] transition-all">
              <div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Boshlang'ich
                </span>
                <h3 className="font-serif font-bold text-2xl text-white mt-3">3 Oylik Obuna</h3>
                <p className="text-xs text-neutral-400 mt-1">Kichik kafe va yangi ochilgan muassasalar uchun</p>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif font-bold text-white font-mono">
                      {formatUZS(1137150)}
                    </span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      -5%
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 line-through mt-0.5">{formatUZS(1197000)}</div>
                  <div className="text-xs text-[#d4af37] font-semibold mt-1">Oyiga: {formatUZS(379050)}</div>
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>To'liq Kassa (POS) moduli</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cheksiz QR menyu va taomlar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Oshxona (KDS) ekrani</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>5 tagacha ofitsiant hisobi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Telegram qo'llab-quvvatlash</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenBuy(3)}
                className="mt-8 w-full py-3.5 rounded-xl bg-[#1a1d2e] hover:bg-[#252a42] text-white font-bold text-xs uppercase tracking-wider border border-[#2f354e] transition-colors cursor-pointer"
              >
                3 Oylikni Tanlash
              </button>
            </div>

            {/* 6 Months Plan */}
            <div className="p-6 rounded-3xl bg-[#0f111d] border border-[#23283c] flex flex-col justify-between hover:border-[#383e58] transition-all">
              <div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Optimal
                </span>
                <h3 className="font-serif font-bold text-2xl text-white mt-3">6 Oylik Obuna</h3>
                <p className="text-xs text-neutral-400 mt-1">O'rta va faol ishlayotgan restoranlar uchun</p>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif font-bold text-white font-mono">
                      {formatUZS(2154600)}
                    </span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      -10%
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 line-through mt-0.5">{formatUZS(2394000)}</div>
                  <div className="text-xs text-[#d4af37] font-semibold mt-1">Oyiga: {formatUZS(359100)}</div>
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Barcha 3 oylik imkoniyatlar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Yetkazib berish (Dostavka) moduli</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>15 tagacha ofitsiant va kuryer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Termoprinter chek sozlamalari</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Z-Xisobot & Excel tahlil</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenBuy(6)}
                className="mt-8 w-full py-3.5 rounded-xl bg-[#1a1d2e] hover:bg-[#252a42] text-white font-bold text-xs uppercase tracking-wider border border-[#2f354e] transition-colors cursor-pointer"
              >
                6 Oylikni Tanlash
              </button>
            </div>

            {/* 12 Months Plan - Highlighted */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#1b1c2b] via-[#101322] to-[#0d0f19] border-2 border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.25)] flex flex-col justify-between relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-md">
                ★ ENG FOYDALI TARIF
              </span>

              <div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 font-bold">
                  Yillik Litsenziya
                </span>
                <h3 className="font-serif font-bold text-2xl text-white mt-3">12 Oylik Obuna</h3>
                <p className="text-xs text-neutral-300 mt-1">To'liq xotirjamlik va 957,600 so'm tejamkorlik</p>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-[#d4af37] font-mono">
                      {formatUZS(3830400)}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/25 text-emerald-400 font-bold">
                      -20%
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 line-through mt-0.5">{formatUZS(4788000)}</div>
                  <div className="text-xs text-amber-300 font-semibold mt-1">Oyiga atigi: {formatUZS(319200)}</div>
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-neutral-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-white">To'liq cheksiz xodimlar va stollar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Shaxsiy brending & logotip</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-time tezkor sinxronizatsiya</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Chek dizayni va QR promo tizim</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-amber-300 font-bold">Ustuvor VIP texnik yordam</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenBuy(12)}
                className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e2bd44] to-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                12 Oylikni Sotib Olish
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Qadamlar) */}
      <section id="qadamlar" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono text-[#d4af37] uppercase tracking-wider">Oson Jarayon</span>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-white mt-1">
            Qanday qilib ishga tushirasiz?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Murakkab shartnomalarsiz, bor-yo'g'i 4 ta oddiy qadam
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Tarifni tanlang',
              desc: 'Restoraningiz nomi va xohlagan sayt manzilini (masalan: savoria-restaurant.uz/flora) belgilang.'
            },
            {
              step: '02',
              title: 'To\'lov qiling',
              desc: 'Ko\'rsatilgan karta raqamiga to\'lov qilib, chek skrinshotini tizimga yuklang.'
            },
            {
              step: '03',
              title: 'Chekni yuboring',
              desc: 'Bitta tugma orqali Telegramda @lazizshavkatov712 ga to\'lov chekini tasdiqlash uchun yuboring.'
            },
            {
              step: '04',
              title: 'Tizim tayyor!',
              desc: '15 daqiqa ichida obunangiz faollashadi va o\'z kassa tizimingizdan foydalanishni boshlaysiz.'
            }
          ].map((s, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#0e101b] border border-[#21263a] relative">
              <span className="font-mono text-3xl font-bold text-[#d4af37]/30 block mb-2">{s.step}</span>
              <h3 className="font-serif font-bold text-base text-white mb-2">{s.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#0a0c14] border-t border-[#1a1e30]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-[#d4af37] uppercase tracking-wider">Savol-Javob</span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-white mt-1">
              Ko'p beriladigan savollar
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-2xl bg-[#0f111c] border border-[#21263a] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left font-serif font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 cursor-pointer hover:text-[#d4af37] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#d4af37] shrink-0 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/5 pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#1a1e30] bg-[#07080d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37] flex items-center justify-center text-neutral-950 font-serif font-bold text-lg">
              S
            </div>
            <div>
              <span className="font-serif font-bold text-white text-base">SAVORIA POS PLATFORM</span>
              <p className="text-[11px] text-neutral-400">Restoran va kafelar uchun bulutli POS ekotizimi</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://t.me/lazizshavkatov712"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/40 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram: @lazizshavkatov712</span>
            </a>

            <button
              onClick={() => handleOpenBuy(12)}
              className="px-4 py-2 rounded-xl bg-[#d4af37] text-neutral-950 font-bold hover:brightness-110 transition-all cursor-pointer"
            >
              Obuna Sotib Olish
            </button>
          </div>
        </div>

        <div className="text-center text-[11px] text-neutral-400 mt-8 pt-6 border-t border-white/5">
          © {new Date().getFullYear()} Savoria Restaurant POS SaaS. Barcha huquqlar himoyalangan.
        </div>
      </footer>

      {/* Subscription Checkout Modal */}
      <SubscriptionCheckoutModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        initialPlanMonths={selectedPlanMonths}
      />
    </div>
  );
};
