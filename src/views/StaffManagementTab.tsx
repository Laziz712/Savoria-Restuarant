import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Waiter, Courier, AdminUser, AdminRole } from '../types';
import { 
  Users, Bike, Plus, Trash2, Edit2, Phone, Check, 
  MapPin, Star, Car, ShieldCheck, AlertCircle, X, KeyRound, Shield
} from 'lucide-react';

export const StaffManagementTab: React.FC = () => {
  const { 
    waiters, addWaiter, updateWaiter, deleteWaiter, 
    couriers, addCourier, updateCourier, deleteCourier,
    adminUsers, addAdminUser, deleteAdminUser, mongoStatus, t
  } = useRestaurant();

  const [activeSubSection, setActiveSubSection] = useState<'ofitsiantlar' | 'kuryerlar' | 'adminlar'>('ofitsiantlar');
  
  // Waiter Modal
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [waiterName, setWaiterName] = useState('');
  const [waiterPhone, setWaiterPhone] = useState('+998 ');
  const [waiterZone, setWaiterZone] = useState('Zal 1 (Asosiy)');
  const [waiterPassword, setWaiterPassword] = useState('');

  // Courier Modal
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [courierName, setCourierName] = useState('');
  const [courierPhone, setCourierPhone] = useState('+998 ');
  const [courierVehicle, setCourierVehicle] = useState<'skuter' | 'avto' | 'velosiped'>('skuter');
  const [courierRating, setCourierRating] = useState<number>(5.0);

  // Admin User Modal
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminNameInput, setAdminNameInput] = useState('');
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminRoleInput, setAdminRoleInput] = useState<AdminRole>('menejer');

  const handleCreateWaiter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiterName.trim()) {
      alert('Iltimos, ofitsiant ismini kiriting');
      return;
    }
    if (!waiterPassword.trim()) {
      alert('Iltimos, ofitsiant uchun kirish parolini (PIN) kiriting');
      return;
    }
    addWaiter({
      name: waiterName.trim(),
      phone: waiterPhone.trim(),
      assignedZone: waiterZone,
      status: 'ishda',
      password: waiterPassword.trim()
    });
    setWaiterName('');
    setWaiterPhone('+998 ');
    setWaiterPassword('');
    setIsWaiterModalOpen(false);
    alert('Yangi ofitsiant va uning shaxsiy paroli muvaffaqiyatli saqlandi!');
  };


  const handleCreateCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierName.trim()) {
      alert('Iltimos, kuryer ismini kiriting');
      return;
    }
    addCourier({
      name: courierName.trim(),
      phone: courierPhone.trim(),
      vehicle: courierVehicle,
      status: 'bosh',
      rating: courierRating
    });
    setCourierName('');
    setCourierPhone('+998 ');
    setIsCourierModalOpen(false);
    alert('Yangi kuryer muvaffaqiyatli qo\'shildi!');
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNameInput.trim() || !adminUsernameInput.trim() || !adminPasswordInput.trim()) {
      alert('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }
    addAdminUser({
      name: adminNameInput.trim(),
      username: adminUsernameInput.trim(),
      passwordHash: adminPasswordInput.trim(),
      role: adminRoleInput
    });
    setAdminNameInput('');
    setAdminUsernameInput('');
    setAdminPasswordInput('');
    setIsAdminModalOpen(false);
    alert('Yangi admin yaratildi! Endi bu parol orqali tizimga kirish mumkin.');
  };

  return (
    <div className="space-y-6">
      {/* MongoDB Atlas Cloud Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#11131c] p-3 rounded-xl border border-[#212433] text-xs">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${mongoStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <div>
            <span className="font-semibold text-white">MongoDB Atlas: </span>
            <span className="text-[#d4af37] font-mono">{mongoStatus.cluster} / {mongoStatus.database}</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
          ✓ {mongoStatus.message || 'Faol'}
        </div>
      </div>

      {/* Top Selector & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#12141f] p-3.5 rounded-xl border border-[#232738]">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => setActiveSubSection('ofitsiantlar')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSubSection === 'ofitsiantlar'
                ? 'bg-[#d4af37] text-neutral-950 shadow-md font-bold'
                : 'bg-[#181b28] text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Ofitsiantlar ({waiters.length})</span>
          </button>

          <button
            onClick={() => setActiveSubSection('kuryerlar')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSubSection === 'kuryerlar'
                ? 'bg-[#d4af37] text-neutral-950 shadow-md font-bold'
                : 'bg-[#181b28] text-neutral-400 hover:text-white'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Kuryerlar ({couriers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubSection('adminlar')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSubSection === 'adminlar'
                ? 'bg-[#d4af37] text-neutral-950 shadow-md font-bold'
                : 'bg-[#181b28] text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Adminlar ({adminUsers.length})</span>
          </button>
        </div>

        {activeSubSection === 'ofitsiantlar' && (
          <button
            onClick={() => setIsWaiterModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-[#e6c14c] text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Ofitsiant Qo'shish</span>
          </button>
        )}

        {activeSubSection === 'kuryerlar' && (
          <button
            onClick={() => setIsCourierModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-[#e6c14c] text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Kuryer Qo'shish</span>
          </button>
        )}

        {activeSubSection === 'adminlar' && (
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-[#e6c14c] text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Admin Yaratish</span>
          </button>
        )}
      </div>

      {/* Waiters Section */}
      {activeSubSection === 'ofitsiantlar' && (
        <div className="rounded-xl bg-[#12141f] border border-[#23273a] shadow-xl overflow-hidden">
          <div className="p-4 border-b border-[#212435] flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-white">
              RESTORAN OFITSIANTLARI RO'YXATI
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              Faol smenadagi xodimlar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#232738] bg-[#161824] text-neutral-400 font-mono text-[11px]">
                  <th className="py-3 px-4">ISMI VA FAMILIYASI</th>
                  <th className="py-3 px-4">TELEFON RAQAM</th>
                  <th className="py-3 px-4">BIRIKTIRILGAN ZAL</th>
                  <th className="py-3 px-4 text-center">PAROL / PIN</th>
                  <th className="py-3 px-4 text-center">HOLATI</th>
                  <th className="py-3 px-4 text-right">XIZMAT KO'RSATGAN CHEKLAR</th>
                  <th className="py-3 px-4 text-right">AMALLAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2130]">
                {waiters.map(waiter => (
                  <tr key={waiter.id} className="hover:bg-[#181a28] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white text-sm">
                        {waiter.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        ID: {waiter.id}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[#d4af37]">
                      {waiter.phone}
                    </td>

                    <td className="py-3 px-4 text-neutral-300">
                      {waiter.assignedZone}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded font-mono text-xs bg-[#1a1d2c] text-emerald-400 border border-[#2b3149] font-bold">
                        {waiter.password || '1111'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          const nextStatus = waiter.status === 'ishda' ? 'tanaffus' : 'ishda';
                          updateWaiter(waiter.id, { status: nextStatus });
                        }}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-colors ${
                          waiter.status === 'ishda'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {waiter.status === 'ishda' ? 'Ishda (Aktiv)' : 'Tanaffusda'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                      {waiter.ordersHandledCount} ta
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`"${waiter.name}" ofitsiantini ro'yxatdan o'chirishni istaysizmi?`)) {
                            deleteWaiter(waiter.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#241718] text-rose-400 hover:bg-rose-900/40 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Couriers Section */}
      {activeSubSection === 'kuryerlar' && (
        <div className="rounded-xl bg-[#12141f] border border-[#23273a] shadow-xl overflow-hidden">
          <div className="p-4 border-b border-[#212435] flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-white">
              DOSTAVKA KURYERLARI RO'YXATI
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              Shahar bo'ylab ekspress yetkazuvchilar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#232738] bg-[#161824] text-neutral-400 font-mono text-[11px]">
                  <th className="py-3 px-4">KURYER NOMI</th>
                  <th className="py-3 px-4">TELEFON</th>
                  <th className="py-3 px-4">TRANSPORT TURI</th>
                  <th className="py-3 px-4 text-center">HOLATI</th>
                  <th className="py-3 px-4 text-center">REYTING</th>
                  <th className="py-3 px-4 text-right">FAOL BUYURTMALAR</th>
                  <th className="py-3 px-4 text-right">AMALLAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2130]">
                {couriers.map(courier => (
                  <tr key={courier.id} className="hover:bg-[#181a28] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white text-sm">
                        {courier.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        ID: {courier.id}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[#d4af37]">
                      {courier.phone}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono uppercase text-[10px] bg-[#1c1f2e] text-neutral-300 border border-[#2b3046]">
                        {courier.vehicle}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          const next = courier.status === 'bosh' ? 'band' : courier.status === 'band' ? 'tanaffus' : 'bosh';
                          updateCourier(courier.id, { status: next });
                        }}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-colors ${
                          courier.status === 'bosh'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : courier.status === 'band'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {courier.status === 'bosh' ? 'Bo\'sh' : courier.status === 'band' ? 'Band (Yo\'lda)' : 'Tanaffusda'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">
                      ★ {courier.rating.toFixed(1)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                      {courier.activeOrdersCount} ta
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`"${courier.name}" kuryerini ro'yxatdan o'chirishni istaysizmi?`)) {
                            deleteCourier(courier.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#241718] text-rose-400 hover:bg-rose-900/40 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Accounts Section */}
      {activeSubSection === 'adminlar' && (
        <div className="rounded-xl bg-[#12141f] border border-[#23273a] shadow-xl overflow-hidden">
          <div className="p-4 border-b border-[#212435] flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-sm text-white">
                ADMINLAR VA TIZIM FOYDALANUVCHILARI
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Yangi yaratilgan har bir admin paroli orqali tizimga kirish mumkin
              </p>
            </div>
            <span className="text-xs font-mono text-[#d4af37]">
              Jami: {adminUsers.length} ta admin
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#232738] bg-[#161824] text-neutral-400 font-mono text-[11px]">
                  <th className="py-3 px-4">ADMIN ISMI</th>
                  <th className="py-3 px-4">LOGIN / USERNAME</th>
                  <th className="py-3 px-4">PAROL</th>
                  <th className="py-3 px-4 text-center">ROLI</th>
                  <th className="py-3 px-4 text-right">YARATILGAN SANA</th>
                  <th className="py-3 px-4 text-right">AMALLAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2130]">
                {adminUsers.map(admin => (
                  <tr key={admin.id} className="hover:bg-[#181a28] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white text-sm flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>{admin.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                      {admin.username}
                    </td>

                    <td className="py-3 px-4 font-mono text-neutral-300">
                      •••••••• ({admin.passwordHash})
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        admin.role === 'superadmin'
                          ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {admin.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-neutral-400 text-[11px]">
                      {new Date(admin.createdAt).toLocaleDateString('uz-UZ')}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {adminUsers.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`"${admin.name}" adminini o'chirishni istaysizmi?`)) {
                              deleteAdminUser(admin.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-[#241718] text-rose-400 hover:bg-rose-900/40 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add New Waiter */}
      {isWaiterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#12141e] border border-[#2b2f42] rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#232738]">
              <h3 className="font-serif font-bold text-sm text-white">
                YANGI OFITSIANT QO'SHISH
              </h3>
              <button
                onClick={() => setIsWaiterModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWaiter} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="text-neutral-300 font-medium block mb-1">
                  Ofitsiant Ismi va Familiyasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Jamshid Karimov"
                  value={waiterName}
                  onChange={e => setWaiterName(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-medium block mb-1">
                  Telefon raqami *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  value={waiterPhone}
                  onChange={e => setWaiterPhone(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-medium block mb-1">
                  Ofitsiant Rejimiga Kirish Paroli / PIN-kod *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 1234 yoki 7788"
                  value={waiterPassword}
                  onChange={e => setWaiterPassword(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Ushbu ofitsiant o'z rejimiga kirishda shu parolni kiritadi.
                </span>
              </div>


              <div>
                <label className="text-neutral-300 font-medium block mb-1">
                  Xizmat ko'rsatadigan zali / stollari
                </label>
                <select
                  value={waiterZone}
                  onChange={e => setWaiterZone(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="Zal 1 (Asosiy)">Zal 1 (Asosiy zal)</option>
                  <option value="VIP Kabinetlar">VIP Kabinetlar</option>
                  <option value="Panoramik Terrasa">Panoramik Terrasa</option>
                  <option value="Bar & Loundj">Bar & Loundj</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#232738] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWaiterModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#181a26] text-neutral-400 hover:text-white"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#d4af37] text-neutral-950 font-bold hover:bg-[#e4be4a] shadow-md"
                >
                  Ofitsiantni Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Courier */}
      {isCourierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#12141e] border border-[#2b2f42] rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#232738]">
              <h3 className="font-serif font-bold text-sm text-white">
                YANGI KURYER QO'SHISH
              </h3>
              <button
                onClick={() => setIsCourierModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCourier} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="text-neutral-300 font-medium block mb-1">
                  Kuryer Ismi va Familiyasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Elyor Bekmurodov"
                  value={courierName}
                  onChange={e => setCourierName(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-medium block mb-1">
                  Telefon raqami *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+998 90 987 65 43"
                  value={courierPhone}
                  onChange={e => setCourierPhone(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-medium block mb-1">
                    Transport turi
                  </label>
                  <select
                    value={courierVehicle}
                    onChange={e => setCourierVehicle(e.target.value as typeof courierVehicle)}
                    className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="skuter">Skuter / Moped</option>
                    <option value="avto">Avtomobil</option>
                    <option value="velosiped">Velosiped</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-300 font-medium block mb-1">
                    Boshlang'ich reyting
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={courierRating}
                    onChange={e => setCourierRating(Number(e.target.value))}
                    className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#232738] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCourierModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#181a26] text-neutral-400 hover:text-white"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#d4af37] text-neutral-950 font-bold hover:bg-[#e4be4a] shadow-md"
                >
                  Kuryerni Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Admin */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#12141f] border border-[#d4af37]/60 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#232738]">
              <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#d4af37]" />
                <span>YANGI ADMIN YARATISH</span>
              </h3>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="text-neutral-300 font-medium block mb-1">
                  Admin Ismi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor Menejer"
                  value={adminNameInput}
                  onChange={e => setAdminNameInput(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-medium block mb-1">
                  Login / Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: sardor_admin"
                  value={adminUsernameInput}
                  onChange={e => setAdminUsernameInput(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-medium block mb-1">
                  Kirish Paroli *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Yangi parol kiriting"
                  value={adminPasswordInput}
                  onChange={e => setAdminPasswordInput(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Ushbu parol bilan Admin panelga kirish mumkin bo'ladi.
                </span>
              </div>

              <div>
                <label className="text-neutral-300 font-medium block mb-1">
                  Roli va Vakolati
                </label>
                <select
                  value={adminRoleInput}
                  onChange={e => setAdminRoleInput(e.target.value as AdminRole)}
                  className="w-full bg-[#0a0b10] border border-[#2a2e41] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="superadmin">Bosh Admin (To'liq huquq)</option>
                  <option value="menejer">Restoran Menejeri</option>
                  <option value="kassir">Kassir-Menejer</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#232738] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#181a26] text-neutral-400 hover:text-white"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#d4af37] text-neutral-950 font-bold hover:bg-[#e4be4a] shadow-md"
                >
                  Adminni Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
