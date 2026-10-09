import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { showAdminLoginModal, setShowAdminLoginModal, adminLogin } = useRestaurant();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!showAdminLoginModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adminLogin(password);
    if (!success) {
      setErrorMsg('Noto\'g\'ri parol! Iltimos, qaytadan tekshiring.');
    } else {
      setErrorMsg('');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-[#12141f] border border-[#d4af37]/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            setShowAdminLoginModal(false);
            setErrorMsg('');
            setPassword('');
          }}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shield Icon */}
        <div className="text-center pt-2 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37] mx-auto flex items-center justify-center text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.2)] mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="font-serif font-bold text-lg text-white tracking-wide">
            ADMIN BOSHQARUV TIZIMI
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Kassa, oshxona, kuryerlar va xisobotlarga kirish uchun parolni kiriting
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-medium text-neutral-300 block mb-1">
              Admin Paroli
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Parolni kiriting..."
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full bg-[#0a0b10] border border-[#2d3246] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 font-mono tracking-wider focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorMsg && (
              <p className="text-rose-400 text-[11px] mt-1.5 font-mono">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Quick Demo Helper Hint */}
          <div className="p-2.5 rounded-lg bg-[#181a26] border border-[#282d3f] text-[11px] text-neutral-400 font-mono flex items-center justify-between">
            <span>Parol: <strong className="text-[#d4af37]">laziz712</strong></span>
            <button
              type="button"
              onClick={() => {
                setPassword('laziz712');
                setErrorMsg('');
              }}
              className="text-[#d4af37] hover:underline text-[10px]"
            >
              Avto-to'ldirish
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c14c] text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Tizimga Kirish</span>
          </button>
        </form>
      </div>
    </div>
  );
};
