import React from 'react';
import type { Alert, Patient } from '../../types';
import { Volume2, Vibrate, Cpu, CheckCircle2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PocketDeviceMockupProps {
  alert?: Alert | null;
  patient?: Patient;
  onAcknowledge?: (alertId: string) => void;
}

export const PocketDeviceMockup: React.FC<PocketDeviceMockupProps> = ({
  alert,
  patient: _patient,
  onAcknowledge,
}) => {
  const navigate = useNavigate();


  const isCritical = alert?.priority === 'CRITICAL';
  const isHigh = alert?.priority === 'HIGH';

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border-4 border-slate-800 shadow-2xl max-w-sm w-full font-mono text-cyan-400 select-none relative overflow-hidden">
      {/* Device Top Shell & LEDs */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-teal-400" />
          <span className="font-bold tracking-wider text-slate-300">ESP32-POCKET-01</span>
        </div>

        {/* Alarm LED Status */}
        <div className="flex items-center space-x-1.5">
          <span
            className={`w-3 h-3 rounded-full ${
              isCritical
                ? 'bg-red-500 animate-ping shadow-lg shadow-red-500'
                : isHigh
                ? 'bg-orange-500 animate-pulse shadow-lg shadow-orange-500'
                : 'bg-emerald-500'
            }`}
          />
          <span className="text-[10px] text-slate-400 font-bold uppercase">
            {isCritical ? 'CRITICAL' : isHigh ? 'HIGH RISK' : 'ARMED'}
          </span>
        </div>
      </div>

      {/* OLED / E-Ink Screen Container */}
      <div className="oled-screen p-4 rounded-xl border-2 border-slate-700 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
        {/* Subtle Scanlines effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

        {/* OLED Top Header */}
        <div>
          <div className="flex justify-between items-center text-[11px] text-cyan-300 border-b border-cyan-900/60 pb-1 mb-2 font-bold">
            <span>LCIIS POCKET TELEMETRY</span>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {alert ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className={isCritical ? 'text-red-400 animate-pulse' : 'text-amber-300'}>
                  ⚠️ {alert.priority} ALERT
                </span>
                <span className="bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800 text-[10px]">
                  RISK {alert.advisoryRisk}%
                </span>
              </div>

              <div className="text-white font-bold text-sm">
                BED: {alert.bed} • {alert.patientName || 'PATIENT P12345'}
              </div>

              <div className="text-[11px] text-cyan-200 space-y-0.5 pt-1">
                <div>Creatinine ↑ (0.9 → 1.3 mg/dL)</div>
                <div>CRP ↑ (8 → 31 mg/L)</div>
                <div>SpO2 ↓ (98 → 92%)</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-cyan-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
              <div className="text-xs font-bold text-slate-300">POCKET HARDWARE READY</div>
              <div className="text-[10px] text-slate-500">Monitoring RTDB Alert Channel...</div>
            </div>
          )}
        </div>

        {/* OLED Hardware Buttons */}
        {alert && (
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-cyan-900/60 mt-3">
            <button
              onClick={() => navigate(`/doctor/patients/${alert.patientId}`)}
              className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500 text-cyan-200 py-1.5 rounded text-[11px] font-bold flex items-center justify-center space-x-1 active:scale-95 transition-all"
            >
              <Eye className="w-3 h-3" />
              <span>[ VIEW ]</span>
            </button>
            <button
              onClick={() => onAcknowledge && onAcknowledge(alert.id)}
              className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-500 text-emerald-300 py-1.5 rounded text-[11px] font-bold flex items-center justify-center space-x-1 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>[ ACK ]</span>
            </button>
          </div>
        )}
      </div>

      {/* Hardware Haptic & Audio Simulation Controls */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-slate-400">
            <Volume2 className={`w-3.5 h-3.5 mr-1 ${isCritical ? 'text-red-400 animate-bounce' : 'text-slate-500'}`} />
            {isCritical ? 'Buzzer 85dB' : 'Silent'}
          </span>
          <span className="flex items-center text-slate-400">
            <Vibrate className={`w-3.5 h-3.5 mr-1 ${isHigh ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            Haptic
          </span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">3.7V LiPo 98%</div>
      </div>
    </div>
  );
};
