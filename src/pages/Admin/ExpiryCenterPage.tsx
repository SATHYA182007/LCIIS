import React from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { AlertTriangle, Clock, PackageX, CheckCircle2 } from 'lucide-react';


export const ExpiryCenterPage: React.FC = () => {
  const { inventory } = useRealtime();

  const expiredItems = inventory.filter((i) => i.status === 'EXPIRED');
  const urgentExpiryItems = inventory.filter((i) => i.status === 'URGENT EXPIRY');
  const expiringSoonItems = inventory.filter((i) => i.status === 'EXPIRING SOON');
  const safeItems = inventory.filter((i) => i.status === 'SAFE');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Automated Expiry Intelligence Center" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pharmaceutical & Consumables Expiry Monitor</h2>
            <p className="text-xs text-gray-500">Automated warning bands evaluating 90, 60, 30, and 7-day batch expiration dates.</p>
          </div>

          {/* Expiry Bands Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card-clinical p-4 border-l-4 border-l-red-600 bg-red-50/40">
              <div className="flex justify-between items-center text-xs font-bold text-red-800">
                <span>EXPIRED STOCK</span>
                <PackageX className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-3xl font-black text-red-900 mt-1">{expiredItems.length}</div>
              <p className="text-[10px] text-red-700 mt-1">Requires immediate quarantine</p>
            </div>

            <div className="card-clinical p-4 border-l-4 border-l-orange-500 bg-orange-50/40">
              <div className="flex justify-between items-center text-xs font-bold text-orange-800">
                <span>URGENT EXPIRY (&lt; 30 Days)</span>
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-3xl font-black text-orange-900 mt-1">{urgentExpiryItems.length}</div>
              <p className="text-[10px] text-orange-700 mt-1">Priority utilization alert</p>
            </div>

            <div className="card-clinical p-4 border-l-4 border-l-amber-500 bg-amber-50/30">
              <div className="flex justify-between items-center text-xs font-bold text-amber-800">
                <span>EXPIRING SOON (&lt; 90 Days)</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-900 mt-1">{expiringSoonItems.length}</div>
              <p className="text-[10px] text-amber-700 mt-1">Monitor stock velocity</p>
            </div>

            <div className="card-clinical p-4 border-l-4 border-l-emerald-500 bg-emerald-50/30">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-800">
                <span>SAFE STOCK (&gt; 90 Days)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-900 mt-1">{safeItems.length}</div>
              <p className="text-[10px] text-emerald-700 mt-1">Normal shelf life</p>
            </div>
          </div>

          {/* Detailed Expiry List */}
          <div className="card-clinical overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50">
              <h3 className="text-sm font-bold text-slate-900">BATCH EXPIRATION STATUS LEDGER</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Batch Number</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Quantity Remaining</th>
                    <th className="p-3">Expiry Date</th>
                    <th className="p-3">Storage Location</th>
                    <th className="p-3">Expiry Band</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{item.name} ({item.code})</td>
                      <td className="p-3 font-mono">{item.batchNumber}</td>
                      <td className="p-3">{item.supplier}</td>
                      <td className="p-3 font-bold text-slate-900">{item.currentQuantity} {item.unit}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{item.expiryDate}</td>
                      <td className="p-3">{item.storageLocation}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                          item.status === 'URGENT EXPIRY' ? 'bg-orange-100 text-orange-700' :
                          item.status === 'EXPIRING SOON' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
