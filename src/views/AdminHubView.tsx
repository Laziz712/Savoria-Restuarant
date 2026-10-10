import React from 'react';
import { useRestaurant, AdminSubTab } from '../context/RestaurantContext';
import { KassaPOSView } from './KassaPOSView';
import { OshxonaKDSView } from './OshxonaKDSView';
import { DostavkaDispatchView } from './DostavkaDispatchView';
import { XisobotAnalyticsView } from './XisobotAnalyticsView';
import { AdminCatalogView } from './AdminCatalogView';
import { StaffManagementTab } from './StaffManagementTab';
import { 
  Receipt, Utensils, Bike, BarChart3, 
  UtensilsCrossed, Users, Settings, ShieldCheck, LogOut 
} from 'lucide-react';

export const AdminHubView: React.FC = () => {
  const { 
    adminSubTab, setAdminSubTab, orders, couriers, 
    waiters, adminUsers, adminLogout, settings, t 
  } = useRestaurant();

  // Badge calculations
  const openBillsCount = orders.filter(o => o.status !== 'yopildi' && o.type === 'zal').length;
  const kitchenOrdersCount = orders.filter(o => o.status === 'yangi' || o.status === 'oshxonada').length;
  const activeDeliveryCount = orders.filter(o => o.type === 'dostavka' && (o.status === 'yolda' || o.status === 'oshxonada' || o.status === 'yangi')).length;

  const tabs: { id: AdminSubTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'kassa', label: t('admin_tab_pos'), icon: <Receipt className="w-4 h-4" />, badge: openBillsCount },
    { id: 'oshxona', label: t('admin_tab_kds'), icon: <Utensils className="w-4 h-4" />, badge: kitchenOrdersCount },
    { id: 'dostafka', label: t('admin_tab_delivery'), icon: <Bike className="w-4 h-4" />, badge: activeDeliveryCount },
    { id: 'xisobot', label: t('admin_tab_reports'), icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'menyu', label: t('admin_tab_menu'), icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'xodimlar', label: t('admin_tab_staff'), icon: <Users className="w-4 h-4" />, badge: waiters.length + couriers.length + adminUsers.length },
  ];


  return (
    <div className="min-h-screen bg-[#08090d] text-[#eaeaea] flex flex-col">
      {/* Admin Module Command Sub-Header */}
      <div className="bg-[#10121b] border-b border-[#212435] px-4 sm:px-6 lg:px-8 py-2.5 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {tabs.map(tab => {
              const isActive = adminSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminSubTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#d4af37] text-neutral-950 shadow-md font-bold'
                      : 'text-neutral-400 hover:text-white bg-[#151724] hover:bg-[#1d202e] border border-[#252839]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {typeof tab.badge === 'number' && tab.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      isActive ? 'bg-black text-[#d4af37]' : 'bg-[#292e42] text-white'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick info & Logout */}
          <div className="hidden lg:flex items-center gap-3">
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Admin Boshqaruvi (Avtorizatsiyalangan)
            </span>
          </div>
        </div>
      </div>

      {/* Active Tab View Body */}
      <div className="flex-1">
        {adminSubTab === 'kassa' && <KassaPOSView />}
        {adminSubTab === 'oshxona' && <OshxonaKDSView />}
        {adminSubTab === 'dostafka' && <DostavkaDispatchView />}
        {adminSubTab === 'xisobot' && <XisobotAnalyticsView />}
        {adminSubTab === 'menyu' && <AdminCatalogView />}
        {adminSubTab === 'xodimlar' && (
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <StaffManagementTab />
          </div>
        )}
      </div>
    </div>
  );
};
