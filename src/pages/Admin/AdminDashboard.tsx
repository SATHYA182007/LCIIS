import React from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Package, Cpu, Users, AlertTriangle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { inventory, devices } = useRealtime();

  const navigate = useNavigate();

  const totalInventory = inventory.length;
  const lowStockCount = inventory.filter((i) => i.status === 'LOW STOCK' || i.currentQuantity <= i.minimumStockLevel).length;
  const expiringSoonCount = inventory.filter((i) => i.status === 'EXPIRING SOON' || i.status === 'URGENT EXPIRY').length;
  const expiredCount = inventory.filter((i) => i.status === 'EXPIRED').length;

  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.connectionStatus === 'ONLINE').length;
  const offlineDevices = devices.filter((d) => d.connectionStatus === 'OFFLINE').length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Hospital System Administration & Operations" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Operational Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="card-clinical p-3.5">
              <div className="text-[10px] text-gray-500 font-semibold uppercase">Total Users</div>
              <div className="text-2xl font-black text-slate-900 mt-1">142</div>
            </div>
            <div className="card-clinical p-3.5">
              <div className="text-[10px] text-gray-500 font-semibold uppercase">Registered Devices</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalDevices}</div>
            </div>
            <div className="card-clinical p-3.5 border-l-4 border-l-emerald-500">
              <div className="text-[10px] text-emerald-700 font-semibold uppercase">Online ESP32</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{onlineDevices}</div>
            </div>
            <div className="card-clinical p-3.5 border-l-4 border-l-red-500 bg-red-50/30">
              <div className="text-[10px] text-red-800 font-semibold uppercase">Devices Offline</div>
              <div className="text-2xl font-black text-red-900 mt-1">{offlineDevices}</div>
            </div>
            <div className="card-clinical p-3.5">
              <div className="text-[10px] text-gray-500 font-semibold uppercase">Inventory Items</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalInventory}</div>
            </div>
            <div className="card-clinical p-3.5 border-l-4 border-l-amber-500">
              <div className="text-[10px] text-amber-800 font-semibold uppercase">Low Stock</div>
              <div className="text-2xl font-black text-amber-900 mt-1">{lowStockCount}</div>
            </div>
            <div className="card-clinical p-3.5 border-l-4 border-l-orange-500">
              <div className="text-[10px] text-orange-800 font-semibold uppercase">Expiring Soon</div>
              <div className="text-2xl font-black text-orange-900 mt-1">{expiringSoonCount}</div>
            </div>
            <div className="card-clinical p-3.5 border-l-4 border-l-red-600 bg-red-50/30">
              <div className="text-[10px] text-red-800 font-semibold uppercase">Expired Stock</div>
              <div className="text-2xl font-black text-red-900 mt-1">{expiredCount}</div>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div onClick={() => navigate('/admin/inventory')} className="card-clinical p-5 cursor-pointer hover:border-teal-500">
              <Package className="w-6 h-6 text-teal-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900">Inventory Catalog</h3>
              <p className="text-xs text-gray-500 mt-1">Manage medicines, PPE, syringes, and stock movements.</p>
            </div>
            <div onClick={() => navigate('/admin/expiry')} className="card-clinical p-5 cursor-pointer hover:border-orange-500">
              <AlertTriangle className="w-6 h-6 text-orange-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900">Expiry Monitoring Center</h3>
              <p className="text-xs text-gray-500 mt-1">Track 90, 60, 30, and 7-day batch expiration warnings.</p>
            </div>
            <div onClick={() => navigate('/admin/devices')} className="card-clinical p-5 cursor-pointer hover:border-cyan-500">
              <Cpu className="w-6 h-6 text-cyan-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900">ESP32 Device Registry</h3>
              <p className="text-xs text-gray-500 mt-1">Bedside monitor assignment and heartbeat monitoring.</p>
            </div>
            <div onClick={() => navigate('/admin/users')} className="card-clinical p-5 cursor-pointer hover:border-purple-500">
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900">User Management</h3>
              <p className="text-xs text-gray-500 mt-1">Manage staff access approval, freeze access, and role permissions.</p>
            </div>
          </div>

          {/* Firebase Infrastructure & System Services Health */}
          <div className="card-clinical p-6 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-teal-600" />
                FIREBASE INFRASTRUCTURE & RECOVERY HEALTH
              </h3>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                ● All Services Operational
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-500 font-medium">Firebase Auth</div>
                <div className="font-bold text-slate-900 mt-0.5">RBAC Rules Active</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-500 font-medium">Cloud Firestore</div>
                <div className="font-bold text-slate-900 mt-0.5">34 Collections Syncing</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-500 font-medium">Realtime DB</div>
                <div className="font-bold text-slate-900 mt-0.5">Telemetry Listener Ready</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-500 font-medium">User Management</div>
                <div className="font-bold text-slate-900 mt-0.5">RBAC Controls Active</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
