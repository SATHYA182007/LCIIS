import React, { useState, useEffect } from 'react';
import { Search, X, User, Package, Cpu } from 'lucide-react';

import { useRealtime } from '../../context/RealtimeContext';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { patients, inventory, devices } = useRealtime();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via custom event if needed
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPatients = patients.filter(
    (p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.hospitalId.toLowerCase().includes(query.toLowerCase()) || p.ward.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredInventory = inventory.filter(
    (i) => i.name.toLowerCase().includes(query.toLowerCase()) || i.code.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredDevices = devices.filter(
    (d) => d.name.toLowerCase().includes(query.toLowerCase()) || d.esp32Id.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs px-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Patient Name, ID (P12345), Ward, Device, Inventory Item... (ESC to close)"
            className="w-full py-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {/* Patient Results */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> Patients ({filteredPatients.length})
            </div>
            {filteredPatients.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-1">No matching patient records found.</p>
            ) : (
              <div className="space-y-1">
                {filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      navigate(`/doctor/patients/${p.id}`);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-teal-50/50 cursor-pointer transition-colors border border-transparent hover:border-teal-100"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.hospitalId} • {p.ward} ({p.bed}) • Age {p.age}</div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      p.currentStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      p.currentStatus === 'HIGH RISK' ? 'bg-orange-100 text-orange-700' :
                      p.currentStatus === 'MONITOR' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.currentStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inventory Results */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
              <Package className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> Inventory Catalog
            </div>
            <div className="space-y-1">
              {filteredInventory.map((i) => (
                <div
                  key={i.id}
                  onClick={() => {
                    navigate('/admin/inventory');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs"
                >
                  <div>
                    <span className="font-medium text-gray-800">{i.name}</span> ({i.code})
                    <div className="text-gray-400">Stock: {i.currentQuantity} {i.unit} • Expires {i.expiryDate}</div>
                  </div>
                  <span className="text-gray-500 font-mono">{i.category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Device Results */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
              <Cpu className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> ESP32 & Physical Devices
            </div>
            <div className="space-y-1">
              {filteredDevices.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    navigate('/admin/devices');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs"
                >
                  <div>
                    <span className="font-medium text-gray-800">{d.name}</span> ({d.esp32Id})
                    <div className="text-gray-400">Assigned: {d.patientName || 'Unassigned'}</div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    d.connectionStatus === 'ONLINE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {d.connectionStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
