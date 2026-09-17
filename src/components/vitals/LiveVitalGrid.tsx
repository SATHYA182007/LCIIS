import React from 'react';
import { Heart, Activity, Thermometer, Droplet, Wind, Radio } from 'lucide-react';
import type { LiveVitals } from '../../types';

interface LiveVitalGridProps {
  vitals?: LiveVitals;
}

export const LiveVitalGrid: React.FC<LiveVitalGridProps> = ({ vitals }) => {
  const formatTime = (iso?: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const hasHR = vitals?.heartRate?.value !== undefined;
  const hasSpO2 = vitals?.spo2?.value !== undefined;
  const hasBP = vitals?.bloodPressure?.systolic?.value !== undefined;
  const hasRR = vitals?.respiratoryRate?.value !== undefined;
  const hasTemp = vitals?.temperature?.value !== undefined;
  const hasUrine = vitals?.urineOutput?.value !== undefined;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Heart Rate Card */}
      <div className={`card-clinical p-3.5 relative overflow-hidden ${!hasHR ? 'bg-slate-50/70 border-dashed border-slate-200' : ''}`}>
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
          <span className="flex items-center"><Heart className={`w-3.5 h-3.5 mr-1 ${hasHR ? 'text-red-500 fill-red-100' : 'text-slate-400'}`} /> Heart Rate</span>
          {hasHR ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Hardware Sensor" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-300" title="No Hardware Stream" />
          )}
        </div>
        <div className={`text-2xl font-black tracking-tight ${hasHR ? 'text-slate-900' : 'text-slate-400'}`}>
          {hasHR ? vitals.heartRate?.value : '--'} <span className="text-xs font-normal text-gray-400">BPM</span>
        </div>
        <div className={`text-[10px] font-medium mt-1 flex items-center justify-between ${hasHR ? 'text-teal-700' : 'text-slate-400'}`}>
          <span>{hasHR ? '● LIVE SENSOR' : 'NO HARDWARE LINKED'}</span>
          <span>{hasHR ? formatTime(vitals.heartRate?.timestamp) : ''}</span>
        </div>
      </div>

      {/* SpO2 Card */}
      <div className={`card-clinical p-3.5 relative overflow-hidden ${
        hasSpO2 && (vitals.spo2?.value || 100) < 94 ? 'border-amber-400 bg-amber-50/20' : !hasSpO2 ? 'bg-slate-50/70 border-dashed border-slate-200' : ''
      }`}>
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
          <span className="flex items-center"><Activity className={`w-3.5 h-3.5 mr-1 ${hasSpO2 ? 'text-cyan-600' : 'text-slate-400'}`} /> SpO2 Saturation</span>
          {hasSpO2 ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-300" />
          )}
        </div>
        <div className={`text-2xl font-black tracking-tight ${
          hasSpO2 && (vitals.spo2?.value || 100) < 94 ? 'text-amber-700' : hasSpO2 ? 'text-slate-900' : 'text-slate-400'
        }`}>
          {hasSpO2 ? vitals.spo2?.value : '--'}<span className="text-xs font-normal text-gray-400">%</span>
        </div>
        <div className={`text-[10px] font-medium mt-1 flex items-center justify-between ${hasSpO2 ? 'text-cyan-700' : 'text-slate-400'}`}>
          <span>{hasSpO2 ? '● LIVE SENSOR' : 'NO HARDWARE LINKED'}</span>
          <span>{hasSpO2 ? formatTime(vitals.spo2?.timestamp) : ''}</span>
        </div>
      </div>

      {/* Blood Pressure Card */}
      <div className={`card-clinical p-3.5 relative overflow-hidden ${!hasBP ? 'bg-slate-50/70 border-dashed border-slate-200' : ''}`}>
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
          <span className="flex items-center"><Radio className={`w-3.5 h-3.5 mr-1 ${hasBP ? 'text-indigo-500' : 'text-slate-400'}`} /> Blood Pressure</span>
          {hasBP ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-300" />
          )}
        </div>
        <div className={`text-2xl font-black tracking-tight ${hasBP ? 'text-slate-900' : 'text-slate-400'}`}>
          {hasBP ? `${vitals.bloodPressure?.systolic.value}/${vitals.bloodPressure?.diastolic.value}` : '--/--'}
          <span className="text-[10px] font-normal text-gray-400 ml-1">mmHg</span>
        </div>
        <div className={`text-[10px] font-medium mt-1 flex items-center justify-between ${hasBP ? 'text-indigo-700' : 'text-slate-400'}`}>
          <span>{hasBP ? '● LIVE SENSOR' : 'NO HARDWARE LINKED'}</span>
          <span>{hasBP ? formatTime(vitals.bloodPressure?.systolic.timestamp) : ''}</span>
        </div>
      </div>

      {/* Respiratory Rate Card */}
      <div className={`card-clinical p-3.5 relative overflow-hidden ${!hasRR ? 'bg-slate-50/70 border-dashed border-slate-200' : ''}`}>
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
          <span className="flex items-center"><Wind className={`w-3.5 h-3.5 mr-1 ${hasRR ? 'text-teal-600' : 'text-slate-400'}`} /> Resp. Rate</span>
          {hasRR ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-300" />
          )}
        </div>
        <div className={`text-2xl font-black tracking-tight ${hasRR ? 'text-slate-900' : 'text-slate-400'}`}>
          {hasRR ? vitals.respiratoryRate?.value : '--'} <span className="text-xs font-normal text-gray-400">/min</span>
        </div>
        <div className={`text-[10px] font-medium mt-1 flex items-center justify-between ${hasRR ? 'text-teal-700' : 'text-slate-400'}`}>
          <span>{hasRR ? '● LIVE SENSOR' : 'NO HARDWARE LINKED'}</span>
          <span>{hasRR ? formatTime(vitals.respiratoryRate?.timestamp) : ''}</span>
        </div>
      </div>

      {/* Temperature Card */}
      <div className={`card-clinical p-3.5 relative overflow-hidden ${!hasTemp ? 'bg-slate-50/70 border-dashed border-slate-200' : ''}`}>
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
          <span className="flex items-center"><Thermometer className={`w-3.5 h-3.5 mr-1 ${hasTemp ? 'text-orange-500' : 'text-slate-400'}`} /> Temperature</span>
          {hasTemp ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-300" />
          )}
        </div>
        <div className={`text-2xl font-black tracking-tight ${hasTemp ? 'text-slate-900' : 'text-slate-400'}`}>
          {hasTemp ? vitals.temperature?.value : '--'}<span className="text-xs font-normal text-gray-400">°C</span>
        </div>
        <div className={`text-[10px] font-medium mt-1 flex items-center justify-between ${hasTemp ? 'text-orange-700' : 'text-slate-400'}`}>
          <span>{hasTemp ? '● LIVE SENSOR' : 'NO HARDWARE LINKED'}</span>
          <span>{hasTemp ? formatTime(vitals.temperature?.timestamp) : ''}</span>
        </div>
      </div>

      {/* Urine Output Card */}
      <div className={`card-clinical p-3.5 relative overflow-hidden ${!hasUrine ? 'bg-slate-50/70 border-dashed border-slate-200' : ''}`}>
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
          <span className="flex items-center"><Droplet className={`w-3.5 h-3.5 mr-1 ${hasUrine ? 'text-blue-500' : 'text-slate-400'}`} /> Urine Output</span>
          {hasUrine ? (
            <span className="w-2 h-2 rounded-full bg-blue-500" title="Manual Nursing Entry" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-300" />
          )}
        </div>
        <div className={`text-2xl font-black tracking-tight ${hasUrine ? 'text-slate-900' : 'text-slate-400'}`}>
          {hasUrine ? vitals.urineOutput?.value : '--'} <span className="text-xs font-normal text-gray-400">mL/hr</span>
        </div>
        <div className={`text-[10px] font-medium mt-1 flex items-center justify-between ${hasUrine ? 'text-blue-700' : 'text-slate-400'}`}>
          <span>{hasUrine ? '● MANUAL ENTRY' : 'NO DATA'}</span>
          <span>{hasUrine ? formatTime(vitals.urineOutput?.timestamp) : ''}</span>
        </div>
      </div>
    </div>
  );
};
