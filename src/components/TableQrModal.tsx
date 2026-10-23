import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RestaurantTable } from '../types';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  X, Printer, Copy, Check, ExternalLink, QrCode, 
  Sparkles, Download, Layers, ShieldCheck, Info
} from 'lucide-react';

interface TableQrModalProps {
  table: RestaurantTable | null;
  allTables?: RestaurantTable[];
  isOpen: boolean;
  onClose: () => void;
  mode?: 'single' | 'all';
}

export const TableQrModal: React.FC<TableQrModalProps> = ({
  table,
  allTables = [],
  isOpen,
  onClose,
  mode = 'single'
}) => {
  const { setRoute, setCurrentTableContext, setIsMenuOnlyMode } = useRestaurant();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'single' | 'all'>(mode);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const getTableQrUrl = (tableName: string) => {
    return `${currentOrigin}/?table=${encodeURIComponent(tableName)}&mode=menu_only`;
  };

  const handleCopyLink = (tableName: string) => {
    const url = getTableQrUrl(tableName);
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 3000);
  };

  const handleOpenLiveMenu = (tableName: string) => {
    setCurrentTableContext(tableName);
    setIsMenuOnlyMode(true);
    setRoute('mijoz');
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSvg = (tableName: string) => {
    const svgElement = document.getElementById(`qr-svg-${tableName.replace(/\s+/g, '-')}`);
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `savoria_qr_${tableName.toLowerCase().replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const currentTable = table || allTables[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-[#0d0f17] border border-[#272b3c] rounded-3xl shadow-2xl overflow-hidden my-auto animate-scale-up">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4.5 border-b border-[#202538] bg-[#121522]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-white">
                Stollar Uchun Raqamli QR Menyu
              </h2>
              <p className="text-xs text-neutral-400">
                Har bir stol uchun maxsus QR kod va avtomatik yangilanuvchi menyu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher if allTables provided */}
            {allTables.length > 0 && (
              <div className="hidden sm:flex items-center bg-[#181b28] p-1 rounded-xl border border-[#2b3046]">
                <button
                  onClick={() => setActiveViewMode('single')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeViewMode === 'single'
                      ? 'bg-[#d4af37] text-neutral-950 shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Yakka Stol
                </button>
                <button
                  onClick={() => setActiveViewMode('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    activeViewMode === 'all'
                      ? 'bg-[#d4af37] text-neutral-950 shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Barcha Stollar ({allTables.length})</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1a1d2d] hover:bg-[#25293d] border border-[#2f354c] text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time Notice Bar */}
        <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-amber-950/40 border-b border-amber-500/20 px-5 py-2.5 flex items-center gap-2.5 text-xs text-amber-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>
            <strong>100% Avtomatik Sinxronizatsiya:</strong> Menyuda yangi taom qo'shilsa yoki narxlar o'zgartirilsa, ushbu QR kodlarni qayta chop etish shart emas — mehmon skaner qilganda avtomatik eng so'nggi ma'lumotlar ochiladi.
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto">
          {activeViewMode === 'single' && currentTable ? (
            /* Single Table QR View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Column: Acrylic Stand Mockup Preview */}
              <div className="flex flex-col items-center">
                <div className="text-xs uppercase font-mono tracking-widest text-[#d4af37] mb-2 font-semibold flex items-center gap-1.5">
                  <span>Stol Teysti / Beydji Ko'rinishi</span>
                </div>

                {/* Printable Table Stand Badge */}
                <div 
                  id="single-table-card"
                  className="w-full max-w-[310px] bg-gradient-to-b from-[#141622] via-[#0d0e16] to-[#141622] border-2 border-[#d4af37]/80 rounded-3xl p-6 text-center shadow-[0_10px_35px_rgba(212,175,55,0.15)] relative overflow-hidden"
                >
                  {/* Gold Corner accents */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#d4af37]" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#d4af37]" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#d4af37]" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#d4af37]" />

                  {/* Logo Crest */}
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[#2a1c10] to-[#12131b] border border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] font-serif font-extrabold text-xl mb-2.5 shadow-lg">
                    S
                  </div>

                  <h3 className="font-serif font-extrabold text-white text-base tracking-wider">
                    SAVORIA RESTAURANT
                  </h3>
                  <div className="text-[10px] uppercase font-mono tracking-widest text-[#d4af37] mb-4">
                    Shohona Raqamli Menyu
                  </div>

                  {/* Table Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1e2c] border border-[#d4af37]/40 text-amber-300 text-xs font-mono font-bold mb-4 shadow-sm">
                    <span>📍 {currentTable.name}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-neutral-300 font-normal">{currentTable.zone}</span>
                  </div>

                  {/* QR Code Container */}
                  <div className="bg-white p-3.5 rounded-2xl mx-auto shadow-xl inline-block border-4 border-[#1a1d29]">
                    <QRCodeSVG
                      id={`qr-svg-${currentTable.name.replace(/\s+/g, '-')}`}
                      value={getTableQrUrl(currentTable.name)}
                      size={180}
                      level="H"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#0a0b10"
                    />
                  </div>

                  {/* Scan Prompt */}
                  <p className="text-[11px] text-neutral-300 font-medium mt-4 leading-snug">
                    Telefoningiz kamerasini QR kodga qarating va shohona taomlar menyusini ko'ring
                  </p>

                  <div className="mt-3 pt-3 border-t border-[#232738] flex items-center justify-center gap-2 text-[10px] text-[#d4af37] font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-vaqt narxlari & Yangi taomlar</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions & Details */}
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Tanlangan Stol Ma'lumotlari
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white">
                    {currentTable.name}
                  </h3>
                  <p className="text-sm text-neutral-300 mt-1">
                    Joylashuv: <span className="text-[#d4af37] font-semibold">{currentTable.zone}</span> · Sig'im: <span className="text-white font-semibold">{currentTable.capacity} kishi</span>
                    {currentTable.notes && <span className="text-neutral-400 italic"> · "{currentTable.notes}"</span>}
                  </p>
                </div>

                {/* Direct Link Box */}
                <div className="bg-[#141622] border border-[#262a3d] p-3.5 rounded-2xl space-y-2">
                  <div className="text-xs text-neutral-400 font-medium flex items-center justify-between">
                    <span>Stol Menyusi To'g'ridan-to'g'ri Havolasi:</span>
                    {copiedUrl && (
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Nusxalandi!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getTableQrUrl(currentTable.name)}
                      className="flex-1 bg-[#0a0b10] border border-[#2c3247] rounded-xl px-3 py-2 text-xs font-mono text-neutral-300 select-all"
                    />
                    <button
                      onClick={() => handleCopyLink(currentTable.name)}
                      className="px-3 py-2 rounded-xl bg-[#202538] hover:bg-[#2b3149] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Nusxalash</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-1">
                  <button
                    onClick={handlePrint}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c14c] hover:brightness-110 active:scale-98 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Stol Beydjini Chop Etish (Print Stand)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleOpenLiveMenu(currentTable.name)}
                      className="py-2.5 px-3 rounded-xl bg-[#171a28] hover:bg-[#212638] border border-[#2b3046] text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Menyuni Sinash</span>
                    </button>

                    <button
                      onClick={() => handleDownloadSvg(currentTable.name)}
                      className="py-2.5 px-3 rounded-xl bg-[#171a28] hover:bg-[#212638] border border-[#2b3046] text-neutral-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>SVG Yuklab Olish</span>
                    </button>
                  </div>
                </div>

                {/* Tips Box */}
                <div className="bg-[#12141d] border border-[#202436] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-neutral-400">
                  <Info className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Ushbu QR kodni chop etib, stollar ustidagi akril stend yoki yog'och beydjga joylashtiring. Mehmon menyuni ochganda faqatgina taomlarni ko'radi, admin yoki ofitsiant panellariga ruxsat berilmaydi.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* All Tables Batch QR View */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#202436]">
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Barcha Stollar QR Kodlari ({allTables.length} ta)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Bir bosishda barcha stollarning stol usti beydjlarini chop eting
                  </p>
                </div>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c14c] hover:brightness-110 active:scale-95 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Barchasini Chop Etish (Print All)</span>
                </button>
              </div>

              {/* Grid of Tables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allTables.map(t => (
                  <div
                    key={t.id}
                    className="bg-[#12141f] border border-[#232739] hover:border-[#d4af37]/50 rounded-2xl p-4 flex flex-col items-center text-center transition-all group"
                  >
                    <div className="font-serif font-bold text-sm text-white group-hover:text-[#d4af37] transition-colors mb-0.5">
                      {t.name}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400 mb-3">
                      {t.zone} · {t.capacity} kishi
                    </div>

                    {/* QR Code thumbnail */}
                    <div className="bg-white p-2.5 rounded-xl border-2 border-[#1b1e2e] shadow-md mb-3">
                      <QRCodeSVG
                        value={getTableQrUrl(t.name)}
                        size={120}
                        level="M"
                        bgColor="#ffffff"
                        fgColor="#0a0b10"
                      />
                    </div>

                    <div className="w-full flex items-center justify-center gap-2 pt-2 border-t border-[#1c2030]">
                      <button
                        onClick={() => handleCopyLink(t.name)}
                        className="p-1.5 rounded-lg bg-[#191c2b] hover:bg-[#23283c] text-neutral-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                        title="Havolani nusxalash"
                      >
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px]">Havola</span>
                      </button>

                      <button
                        onClick={() => handleOpenLiveMenu(t.name)}
                        className="p-1.5 rounded-lg bg-[#191c2b] hover:bg-[#23283c] text-[#d4af37] text-xs flex items-center gap-1 transition-colors"
                        title="Menyuni ochish"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="text-[10px]">Ko'rish</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0a0b11] border-t border-[#1e2233] flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[11px] text-emerald-400 font-semibold">Real-time Savoria POS & Menu Sync</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1a1d2c] hover:bg-[#25293d] text-neutral-300 hover:text-white font-medium transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>

      {/* =========================================================================
          PRINT ONLY AREA: Triggered when user clicks Print
          Produces clean, high-contrast, ready-to-cut tabletop stand badges!
          ========================================================================= */}
      <div id="table-qr-print-area" className="hidden">
        {activeViewMode === 'single' && currentTable ? (
          /* Single Printable Stand Badge */
          <div style={{ pageBreakInside: 'avoid', border: '3px solid #000', borderRadius: '16px', padding: '24px', textAlign: 'center', width: '280px', margin: '20px auto', fontFamily: 'serif' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
              SAVORIA RESTAURANT
            </h2>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', color: '#555' }}>
              Shohona Raqamli Menyu
            </div>

            <div style={{ fontSize: '15px', fontWeight: 'bold', padding: '4px 10px', border: '1px solid #000', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
              📍 {currentTable.name} ({currentTable.zone})
            </div>

            <div style={{ margin: '0 auto 14px auto', display: 'inline-block' }}>
              <QRCodeSVG
                value={getTableQrUrl(currentTable.name)}
                size={200}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>

            <div style={{ fontSize: '11px', fontWeight: 'bold', margin: '8px 0 4px 0' }}>
              Kamerani QR kodga qarating
            </div>
            <div style={{ fontSize: '9px', color: '#666' }}>
              Taomlar, narxlar va maxsus takliflar
            </div>
          </div>
        ) : (
          /* Batch Printable Stand Badges (4 per page) */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', padding: '10px' }}>
            {allTables.map(t => (
              <div key={t.id} style={{ pageBreakInside: 'avoid', border: '2px solid #000', borderRadius: '14px', padding: '16px', textAlign: 'center', fontFamily: 'serif' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 2px 0', textTransform: 'uppercase' }}>
                  SAVORIA RESTAURANT
                </h3>
                <div style={{ fontSize: '9px', color: '#666', marginBottom: '8px' }}>
                  Shohona Raqamli Menyu
                </div>

                <div style={{ fontSize: '13px', fontWeight: 'bold', padding: '3px 8px', border: '1px solid #000', borderRadius: '6px', display: 'inline-block', marginBottom: '10px' }}>
                  📍 {t.name} ({t.zone})
                </div>

                <div style={{ margin: '0 auto 10px auto', display: 'inline-block' }}>
                  <QRCodeSVG
                    value={getTableQrUrl(t.name)}
                    size={160}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>

                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
                  Kamerani QR kodga qarating
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
