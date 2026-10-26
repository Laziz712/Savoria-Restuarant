import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  Lock, KeyRound, Eye, EyeOff, X, User, 
  ShieldCheck, UtensilsCrossed, Receipt, ArrowRight,
  Sparkles, Check, Delete
} from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { 
    showAdminLoginModal, setShowAdminLoginModal, 
    adminLogin, waiterLogin, waiters, adminUsers,
    setRoute, setAdminSubTab, t 
  } = useRestaurant();

  // Role: 'admin' | 'waiter' | 'cashier'
  const [activeRole, setActiveRole] = useState<'admin' | 'waiter' | 'cashier'>('admin');

  // Credentials
  const [selectedAdminId, setSelectedAdminId] = useState<string>(adminUsers[0]?.username || 'admin');
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>(waiters[0]?.id || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usePinPad, setUsePinPad] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  if (!showAdminLoginModal) return null;

  const handleClose = () => {
    setShowAdminLoginModal(false);
    setErrorMsg('');
    setPassword('');
  };

  const handlePinDigit = (digit: string) => {
    if (password.length < 12) {
      setPassword(prev => prev + digit);
      if (errorMsg) setErrorMsg('');
    }
  };

  const handlePinBackspace = () => {
    setPassword(prev => prev.slice(0, -1));
  };

  const handlePinClear = () => {
    setPassword('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Iltimos, parolingizni yoki PIN-kodni kiriting');
      return;
    }

    if (activeRole === 'admin') {
      const success = adminLogin(password);
      if (!success) {
        setErrorMsg('Noto\'g\'ri admin paroli! Qayta urinib ko\'ring.');
      } else {
        setErrorMsg('');
        setPassword('');
        setRoute('admin');
        setShowAdminLoginModal(false);
      }
    } else if (activeRole === 'waiter') {
      const targetId = selectedWaiterId || waiters[0]?.id;
      if (!targetId) return;
      const success = waiterLogin(targetId, password);
      if (!success) {
        setErrorMsg('Noto\'g\'ri ofitsiant paroli! Qayta urinib ko\'ring.');
      } else {
        setErrorMsg('');
        setPassword('');
        setRoute('ofitsiant');
        setShowAdminLoginModal(false);
      }
    } else if (activeRole === 'cashier') {
      // Cashier has access to POS Kassa
      const success = adminLogin(password);
      if (!success) {
        setErrorMsg('Noto\'g\'ri kassa paroli! Qayta urinib ko\'ring.');
      } else {
        setErrorMsg('');
        setPassword('');
        setRoute('admin');
        setAdminSubTab('kassa');
        setShowAdminLoginModal(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-[#0f111a] border border-[#d4af37]/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden my-auto">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center pt-2 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2a2415] to-[#12131d] border border-[#d4af37]/60 mx-auto flex items-center justify-center text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.25)] mb-3">
            <span className="font-serif font-bold text-2xl tracking-tighter">S</span>
          </div>
          <h2 className="font-serif font-bold text-lg sm:text-xl text-white tracking-widest uppercase">
            SAVORIA RESTAURANT
          </h2>
          <p className="text-xs text-[#d4af37]/90 font-mono mt-0.5 tracking-wide">
            Tizimga Kirish & Avtorizatsiya
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#090a10] border border-[#222536] rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveRole('admin');
              setErrorMsg('');
              setPassword('');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeRole === 'admin'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#e6c14c] text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Admin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('waiter');
              setErrorMsg('');
              setPassword('');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeRole === 'waiter'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#e6c14c] text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Ofitsiant</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('cashier');
              setErrorMsg('');
              setPassword('');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeRole === 'cashier'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#e6c14c] text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Kassa POS</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Selector based on role */}
          {activeRole === 'admin' ? (
            <div>
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                Foydalanuvchi hisobi
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d4af37]">
                  <User className="w-4 h-4" />
                </div>
                <select
                  value={selectedAdminId}
                  onChange={e => setSelectedAdminId(e.target.value)}
                  className="w-full bg-[#0a0b12] border border-[#262a3d] focus:border-[#d4af37] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none appearance-none"
                >
                  {adminUsers.map(u => (
                    <option key={u.id} value={u.username}>
                      {u.name} ({u.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : activeRole === 'waiter' ? (
            <div>
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                Ofitsiantni tanlang
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d4af37]">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <select
                  value={selectedWaiterId}
                  onChange={e => setSelectedWaiterId(e.target.value)}
                  className="w-full bg-[#0a0b12] border border-[#262a3d] focus:border-[#d4af37] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none appearance-none"
                >
                  {waiters.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.assignedZone})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                Kassir Lavozimi
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d4af37]">
                  <Receipt className="w-4 h-4" />
                </div>
                <div className="w-full bg-[#0a0b12] border border-[#262a3d] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white font-mono">
                  Bosh Kassir & POS Operator
                </div>
              </div>
            </div>
          )}

          {/* Password / PIN Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-neutral-300">
                {activeRole === 'waiter' ? 'PIN-kod yoki Parol' : 'Xavfsizlik Paroli'}
              </label>
              <button
                type="button"
                onClick={() => setUsePinPad(p => !p)}
                className="text-[10px] text-[#d4af37] hover:underline font-mono"
              >
                {usePinPad ? 'Oddiy kiritish' : 'Raqamli PIN-pad'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d4af37]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder={activeRole === 'waiter' ? 'PIN-kodni kiriting' : 'Parolni kiriting'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full bg-[#0a0b12] border border-[#262a3d] focus:border-[#d4af37] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-neutral-500 font-mono tracking-wider focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <p className="text-rose-400 text-[11px] mt-1.5 font-mono flex items-center gap-1">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          {/* Touchscreen PIN Pad (If enabled) */}
          {usePinPad && (
            <div className="bg-[#090a10] border border-[#222536] p-3 rounded-2xl animate-fade-in space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinDigit(num)}
                    className="py-3 rounded-xl bg-[#141624] hover:bg-[#1f2234] border border-[#272b3e] text-white font-mono font-bold text-base active:scale-95 transition-all"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handlePinClear}
                  className="py-3 rounded-xl bg-[#221316] hover:bg-rose-950/60 border border-rose-900/40 text-rose-400 font-mono text-xs font-bold active:scale-95 transition-all"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={() => handlePinDigit('0')}
                  className="py-3 rounded-xl bg-[#141624] hover:bg-[#1f2234] border border-[#272b3e] text-white font-mono font-bold text-base active:scale-95 transition-all"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinBackspace}
                  className="py-3 rounded-xl bg-[#141624] hover:bg-[#1f2234] border border-[#272b3e] text-neutral-400 hover:text-white flex items-center justify-center active:scale-95 transition-all"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#2e334a] bg-[#0a0b12] text-[#d4af37] focus:ring-0"
              />
              <span className="text-[11px]">Eslab qolish</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#e6c14c] to-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/35 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Tizimga Kirish</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};
