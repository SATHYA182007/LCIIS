import React from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { PocketDeviceMockup } from '../../components/hardware/PocketDeviceMockup';


export const DeviceMonitorPage: React.FC = () => {
  const { alerts, acknowledgeAlert } = useRealtime();

  const activeAlert = alerts[0] || null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Pocket Alert Hardware Monitor & Virtual Dongle" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Physical Pocket Alert Device Simulation</h2>
            <p className="text-xs text-gray-500">
              Demonstrates haptic, buzzer, and OLED alert delivery over Firebase Realtime Database.
            </p>
          </div>

          <div className="flex justify-center py-8">
            <PocketDeviceMockup
              alert={activeAlert}
              onAcknowledge={(id) => acknowledgeAlert(id, 'Dr. Sarah Jenkins')}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
