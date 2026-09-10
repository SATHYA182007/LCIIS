import React from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Cpu, Battery, AlertTriangle, Wifi, WifiOff, Plus } from 'lucide-react';
import { toast } from 'sonner';


export const DevicesPage: React.FC = () => {
  const { devices, updateDeviceStatus } = useRealtime();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="ESP32 Physical Device Management & Heartbeats" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bedside IoT Nodes & Pocket Alert Hardware</h2>
              <p className="text-xs text-gray-500">Real-time ESP32 heartbeat telemetry and patient-bed mapping.</p>
            </div>
            <button
              onClick={() => toast.info('Device provisioned into Firebase Realtime Database.')}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" /> <span>Provision ESP32 Node</span>
            </button>
          </div>

          {/* Devices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {devices.map((device) => {
              const isOnline = device.connectionStatus === 'ONLINE';
              return (
                <div key={device.id} className="card-clinical p-5 bg-white space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center font-bold">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{device.name}</h3>
                        <div className="text-[10px] font-mono text-gray-500">{device.esp32Id} • MAC {device.macAddress}</div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center ${
                      isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isOnline ? <Wifi className="w-3 h-3 mr-1 animate-pulse" /> : <WifiOff className="w-3 h-3 mr-1" />}
                      {device.connectionStatus}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                    <div className="flex justify-between">
                      <span>Assigned Patient:</span>
                      <span className="font-bold text-slate-900">{device.patientName || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bed Location:</span>
                      <span className="font-medium text-gray-800">{device.bedId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Firmware Version:</span>
                      <span className="font-mono text-gray-800">{device.firmwareVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Battery Level:</span>
                      <span className="font-bold text-slate-900 flex items-center">
                        <Battery className="w-3.5 h-3.5 mr-1 text-teal-600" /> {device.batteryLevel}%
                      </span>
                    </div>
                  </div>

                  {/* Device Offline Safety Alert Box (Prompt Section 29 & 77 rule) */}
                  {!isOnline && (
                    <div className="p-3 bg-slate-900 text-white rounded-lg text-xs space-y-1">
                      <div className="font-bold text-amber-400 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> DEVICE OFFLINE SAFETY ADVISORY
                      </div>
                      <p className="text-[11px] text-slate-300">
                        "Live physiological data unavailable — device connection requires review." (Missing data is not patient deterioration).
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
                    <span className="text-[10px] text-gray-400">Last Seen: {new Date(device.lastSeen).toLocaleTimeString()}</span>
                    <button
                      onClick={() => {
                        const newStatus = isOnline ? 'OFFLINE' : 'ONLINE';
                        updateDeviceStatus(device.id, newStatus);
                        toast.success(`Device ${device.esp32Id} toggled to ${newStatus}`);
                      }}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-slate-800 font-bold rounded text-[10px]"
                    >
                      Simulate {isOnline ? 'Disconnect' : 'Heartbeat'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};
