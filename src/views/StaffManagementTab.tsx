import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Waiter, Courier } from '../types';
import { 
  Users, Bike, Plus, Trash2, Edit2, Phone, Check, 
  MapPin, Star, Car, Shield, AlertCircle, X
} from 'lucide-react';

export const StaffManagementTab: React.FC = () => {
  const { 
    waiters, addWaiter, updateWaiter, deleteWaiter, 
    couriers, addCourier, updateCourier, deleteCourier 
  } = useRestaurant();

  const [activeSubSection, setActiveSubSection] = useState<'ofitsiantlar' | 'kuryerlar'>('ofitsiantlar');
  
  // Waiter Modal
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [waiterName, setWaiterName] = useState('');
  const [waiterPhone, setWaiterPhone] = useState('+998 ');
  const [waiterZone, setWaiterZone] = useState('Zal 1 (Asosiy)');

  // Courier Modal
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [courierName, setCourierName] = useState('');
  const [courierPhone, setCourierPhone] = useState('+998 ');
  const [courierVehicle, setCourierVehicle] = useState<'skuter' | 'avto' | 'velosiped'>('skuter');
  const [courierRating, setCourierRating] = useState<number>(5.0);

  const handleCreateWaiter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiterName.trim()) {
      alert('Iltimos, ofitsiant ismini kiriting');
      return;
    }
    addWaiter({
      name: waiterName.trim(),
      phone: waiterPhone.trim(),
      assignedZone: waiterZone,
      status: 'ishda'
    });
    setWaiterName('');
    setWaiterPhone('+998 ');
    setIsWaiterModalOpen(false);
    alert('Yangi ofitsiant muvaffaqiyatli qo\'shildi!');
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

  return (
    <div className="space-y-6">
      {/* Top Selector & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#12141f] p-3.5 rounded-xl border border-[#232738]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubSection('ofitsiantlar')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
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
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeSubSection === 'kuryerlar'
                ? 'bg-[#d4af37] text-neutral-950 shadow-md font-bold'
                : 'bg-[#181b28] text-neutral-400 hover:text-white'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Kuryerlar ({couriers.length})</span>
          </button>
        </div>

        {activeSubSection === 'ofitsiantlar' ? (
          <button
            onClick={() => setIsWaiterModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-[#e6c14c] text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Ofitsiant Qo'shish</span>
          </button>
        ) : (
          <button
            onClick={() => setIsCourierModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-[#e6c14c] text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Kuryer Qo'shish</span>
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
    </div>
  );
};
