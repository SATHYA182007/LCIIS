import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Sparkles, ShieldAlert } from 'lucide-react';
import type { Patient, RiskAssessment, TrendResult, LiveVitals } from '../../types';

interface WhatChangedCardProps {
  patient: Patient;
  riskAssessment: RiskAssessment;
  trends: TrendResult[];
  vitals: LiveVitals;
}

export const WhatChangedCard: React.FC<WhatChangedCardProps> = ({
  patient: _patient,
  riskAssessment,
  trends: _trends,
  vitals: _vitals,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      {/* Header Banner */}
      <div className="bg-teal-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-teal-300" />
            <h2 className="text-base font-bold tracking-tight">WHAT HAS CHANGED?</h2>
          </div>
          <p className="text-xs text-teal-100 mt-0.5">
            Changes seen across recent laboratory results and vital sign readings over time.
          </p>
        </div>

        {/* Patient Status Badge */}
        <div className="flex items-center space-x-3 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/15">
          <div className="text-right">
            <div className="text-[10px] text-teal-200 uppercase font-semibold">Patient Status</div>
            <div className="text-lg font-bold leading-none">{riskAssessment.riskBand}</div>
          </div>
          <span className={`px-2.5 py-1 rounded text-xs font-bold ${
            riskAssessment.riskBand === 'CRITICAL' ? 'bg-red-500 text-white' :
            riskAssessment.riskBand === 'HIGH RISK' ? 'bg-orange-500 text-white' :
            riskAssessment.riskBand === 'MONITOR' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
          }`}>
            {riskAssessment.overallRiskScore}%
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: What Changed Matrix */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            RECENT PARAMETER CHANGES
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Creatinine */}
            <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/30">
              <div className="flex items-center justify-between font-semibold text-gray-700 mb-1">
                <span>Creatinine</span>
                <span className="flex items-center text-orange-700 font-bold">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" /> Increasing
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                0.9 → 1.3 <span className="text-xs font-normal text-gray-500">mg/dL</span>
              </div>
              <div className="text-[11px] text-orange-800 mt-0.5">
                Gradual increase over recent lab tests.
              </div>
            </div>

            {/* CRP */}
            <div className="p-3 rounded-lg border border-red-200 bg-red-50/30">
              <div className="flex items-center justify-between font-semibold text-gray-700 mb-1">
                <span>CRP (Inflammatory)</span>
                <span className="flex items-center text-red-700 font-bold">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" /> Increasing
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                8 → 31 <span className="text-xs font-normal text-gray-500">mg/L</span>
              </div>
              <div className="text-[11px] text-red-800 mt-0.5">
                Increase across recent readings.
              </div>
            </div>

            {/* SpO2 */}
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/30">
              <div className="flex items-center justify-between font-semibold text-gray-700 mb-1">
                <span>Oxygen Level (SpO2)</span>
                <span className="flex items-center text-amber-700 font-bold">
                  <TrendingDown className="w-3.5 h-3.5 mr-1" /> Decreasing
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                98% → 92% <span className="text-xs font-normal text-gray-500">Live</span>
              </div>
              <div className="text-[11px] text-amber-800 mt-0.5">
                Decrease over recent vital readings.
              </div>
            </div>

            {/* Heart Rate */}
            <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/30">
              <div className="flex items-center justify-between font-semibold text-gray-700 mb-1">
                <span>Heart Rate</span>
                <span className="flex items-center text-purple-700 font-bold">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" /> Increasing
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                82 → 112 <span className="text-xs font-normal text-gray-500">BPM</span>
              </div>
              <div className="text-[11px] text-purple-800 mt-0.5">
                Elevated pulse reading.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reasoning & Recommendation */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1.5 text-teal-700" /> WHY IS THIS PATIENT FLAGGED?
            </div>
            <ul className="text-xs text-slate-700 font-medium space-y-1.5">
              <li>• Oxygen level has decreased over recent readings.</li>
              <li>• Heart rate has increased.</li>
              <li>• Creatinine is gradually increasing.</li>
              <li>• Several values changed together.</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-teal-900 text-white shadow-xs">
            <div className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">
              RECOMMENDATION
            </div>
            <div className="text-xs font-bold text-white mt-0.5 flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />
              CLINICAL REVIEW RECOMMENDED
            </div>
            <p className="text-[11px] text-teal-100 mt-0.5">
              Advisory status generated from patient data. Final decision rests with doctor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
