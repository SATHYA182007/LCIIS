import React, { useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Package, Plus } from 'lucide-react';
import type { MovementType } from '../../types';
import { toast } from 'sonner';

export const InventoryPage: React.FC = () => {
  const { inventory, stockMovements, processStockMovement } = useRealtime();
  const { user } = useAuth();

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id || 'inv-001');
  const [movementType, setMovementType] = useState<MovementType>('STOCK IN');
  const [quantity, setQuantity] = useState(50);
  const [reason, setReason] = useState('Routine pharmacy reorder intake');


  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantity <= 0) return;

    processStockMovement(
      selectedItemId,
      Number(quantity),
      movementType,
      user?.name || 'System Admin',
      reason
    );

    setIsMovementModalOpen(false);
    toast.success(`Stock movement (${movementType}) recorded successfully.`);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Medical Inventory Management & Stock Movements" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hospital Consumables & Pharmaceuticals</h2>
              <p className="text-xs text-gray-500">Track stock in, stock out, expiry warnings, and reorder levels.</p>
            </div>
            <button
              onClick={() => setIsMovementModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" /> <span>Record Stock Movement</span>
            </button>
          </div>

          {/* Inventory Items Table */}
          <div className="card-clinical overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Package className="w-4 h-4 mr-2 text-teal-600" />
                ACTIVE INVENTORY CATALOG ({inventory.length} ITEMS)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Code / Batch</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Current Qty</th>
                    <th className="p-3">Min Level</th>
                    <th className="p-3">Expiry Date</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3">
                        <div className="font-mono text-gray-800">{item.code}</div>
                        <div className="text-[10px] text-gray-400">{item.batchNumber}</div>
                      </td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3 font-black text-slate-900">{item.currentQuantity} <span className="text-[10px] font-normal text-gray-500">{item.unit}</span></td>
                      <td className="p-3 text-gray-500">{item.minimumStockLevel}</td>
                      <td className="p-3 font-mono">{item.expiryDate}</td>
                      <td className="p-3">{item.storageLocation}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                          item.status === 'URGENT EXPIRY' ? 'bg-orange-100 text-orange-700' :
                          item.status === 'LOW STOCK' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedItemId(item.id);
                            setIsMovementModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-teal-50 text-teal-800 font-bold rounded text-[11px] border border-gray-200"
                        >
                          Adjust Qty
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Stock Movements Ledger */}
          <div className="card-clinical p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Stock Movement Audit Ledger</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
              {stockMovements.length === 0 ? (
                <p className="text-gray-400 italic">No stock movements recorded in current session.</p>
              ) : (
                stockMovements.map((m) => (
                  <div key={m.id} className="p-2.5 bg-gray-50 rounded border border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900">{m.type}</span>: {m.itemName} ({m.quantity} units)
                      <div className="text-[10px] text-gray-500">By {m.performedBy} • Reason: "{m.reason}"</div>
                    </div>
                    <span className="text-gray-400 font-mono text-[10px]">
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Stock Movement Modal */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Execute Stock Movement</h3>
            <form onSubmit={handleMovementSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Item</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                >
                  {inventory.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Current Qty: {i.currentQuantity} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Movement Type</label>
                  <select
                    value={movementType}
                    onChange={(e: any) => setMovementType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="STOCK IN">STOCK IN (Intake)</option>
                    <option value="STOCK OUT">STOCK OUT (Issued)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT (Audit)</option>
                    <option value="RETURN">RETURN</option>
                    <option value="EXPIRED">EXPIRED (Quarantine)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Movement Reason / Notes</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Ward 4 pharmacy intake, Routine audit..."
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsMovementModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-600">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-700 text-white font-bold rounded-lg">
                  Execute Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
