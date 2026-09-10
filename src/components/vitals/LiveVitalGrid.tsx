import React from 'react';
import { Heart, Activity, Thermometer, Droplet, Wind, Radio } from 'lucide-react';
import type { LiveVitals } from '../../types';


interface LiveVitalGridProps {
  vitals: LiveVitals;
}

export const LiveVitalGrid: React.FC<LiveVitalGridProps> = ({ vitals }) => {
  const formatTime = (iso?: string) => {
    if (!iso) return 'Just now';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Heart Rate Card */}
      <div className="card-clinical p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
          <span className="flex items-center"><Heart className="w-3.5 h-3.5 mr-1 text-red-500 fill-red-100" /> Heart Rate</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Sensor" />
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {vitals.heartRate?.value || 82} <span className="text-xs font-normal text-gray-500">BPM</span>
        </div>
        <div className="text-[10px] text-teal-700 font-medium mt-1 flex items-center justify-between">
          <span>● LIVE SENSOR</span>
          <span>{formatTime(vitals.heartRate?.timestamp)}</span>
        </div>
      </div>

      {/* SpO2 Card */}
      <div className={`card-clinical p-3.5 relative overflow-hidden ${
        (vitals.spo2?.value || 98) < 94 ? 'border-amber-400 bg-amber-50/20' : ''
      }`}>
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
          <span className="flex items-center"><Activity className="w-3.5 h-3.5 mr-1 text-cyan-600" /> SpO2 Saturation</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className={`text-2xl font-black tracking-tight ${
          (vitals.spo2?.value || 98) < 94 ? 'text-amber-700' : 'text-slate-900'
        }`}>
          {vitals.spo2?.value || 92}<span className="text-xs font-normal text-gray-500">%</span>
        </div>
        <div className="text-[10px] text-cyan-700 font-medium mt-1 flex items-center justify-between">
          <span>● LIVE SENSOR</span>
          <span>{formatTime(vitals.spo2?.timestamp)}</span>
        </div>
      </div>

      {/* Blood Pressure Card */}
      <div className="card-clinical p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
          <span className="flex items-center"><Radio className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Blood Pressure</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {vitals.bloodPressure?.systolic.value || 138}/
          <span className="text-lg font-bold">{vitals.bloodPressure?.diastolic.value || 84}</span>
          <span className="text-[10px] font-normal text-gray-500 ml-1">mmHg</span>
        </div>
        <div className="text-[10px] text-indigo-700 font-medium mt-1 flex items-center justify-between">
          <span>● LIVE SENSOR</span>
          <span>{formatTime(vitals.bloodPressure?.systolic.timestamp)}</span>
        </div>
      </div>

      {/* Respiratory Rate Card */}
      <div className="card-clinical p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
          <span className="flex items-center"><Wind className="w-3.5 h-3.5 mr-1 text-teal-600" /> Resp. Rate</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {vitals.respiratoryRate?.value || 24} <span className="text-xs font-normal text-gray-500">/min</span>
        </div>
        <div className="text-[10px] text-teal-700 font-medium mt-1 flex items-center justify-between">
          <span>● LIVE SENSOR</span>
          <span>{formatTime(vitals.respiratoryRate?.timestamp)}</span>
        </div>
      </div>

      {/* Temperature Card */}
      <div className="card-clinical p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
          <span className="flex items-center"><Thermometer className="w-3.5 h-3.5 mr-1 text-orange-500" /> Temperature</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {vitals.temperature?.value || 38.2}<span className="text-xs font-normal text-gray-500">°C</span>
        </div>
        <div className="text-[10px] text-orange-700 font-medium mt-1 flex items-center justify-between">
          <span>● LIVE SENSOR</span>
          <span>{formatTime(vitals.temperature?.timestamp)}</span>
        </div>
      </div>

      {/* Urine Output Card */}
      <div className="card-clinical p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
          <span className="flex items-center"><Droplet className="w-3.5 h-3.5 mr-1 text-blue-500" /> Urine Output</span>
          <span className="w-2 h-2 rounded-full bg-gray-400" title="Manual Nursing Entry" />
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {vitals.urineOutput?.value || 25} <span className="text-xs font-normal text-gray-500">mL/hr</span>
        </div>
        <div className="text-[10px] text-blue-700 font-medium mt-1 flex items-center justify-between">
          <span>● MANUAL ENTRY</span>
          <span>{formatTime(vitals.urineOutput?.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};
