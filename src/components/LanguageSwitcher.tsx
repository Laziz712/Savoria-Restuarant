import React, { useState, useRef, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Language } from '../types';
import { Globe, Check, ChevronDown } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useRestaurant();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages: { id: Language; label: string; code: string; flag: string }[] = [
    { id: 'uz', label: 'O\'zbekcha', code: 'UZB', flag: '🇺🇿' },
    { id: 'ru', label: 'Русский', code: 'RUS', flag: '🇷🇺' },
    { id: 'en', label: 'English', code: 'ENG', flag: '🇬🇧' },
  ];

  const current = languages.find(l => l.id === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141622] hover:bg-[#1c2030] border border-[#2b3046] hover:border-[#d4af37]/50 text-xs font-mono font-medium text-neutral-200 transition-all shadow-sm"
        aria-label="Tilni tanlash / Выбор языка / Select Language"
      >
        <span className="text-sm">{current.flag}</span>
        <span className="tracking-wider">{current.code}</span>
        <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-[#12141f] border border-[#2b3046] shadow-2xl py-1 z-50 animate-fade-in backdrop-blur-md">
          {languages.map(lang => (
            <button
              key={lang.id}
              onClick={() => {
                setLanguage(lang.id);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                language === lang.id
                  ? 'bg-[#d4af37]/15 text-[#d4af37] font-bold'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {language === lang.id && <Check className="w-3.5 h-3.5 text-[#d4af37]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
