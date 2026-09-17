import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Sparkles, ShieldAlert, CheckCircle2, Activity } from 'lucide-react';
import type { Patient, RiskAssessment, TrendResult, LiveVitals } from '../../types';
import { useRealtime } from '../../context/RealtimeContext';
import { ExplanationEngine } from '../../services/explanationService';

interface WhatChangedCardProps {
  patient: Patient;
  riskAssessment: RiskAssessment;
  trends: TrendResult[];
  vitals: LiveVitals;
}

interface ChangedParam {
  id: string;
  name: string;
  direction: 'Increasing' | 'Decreasing' | 'Stable';
  fromTo: string;
  unit: string;
  note: string;
  severity: 'critical' | 'warning' | 'normal';
}

export const WhatChangedCard: React.FC<WhatChangedCardProps> = ({
  patient,
  riskAssessment,
  trends,
  vitals,
}) => {
  const { labResults } = useRealtime();

  const patientLabs = labResults.filter(
    (l) => l.patientId === patient.id || (patient.id === 'P12345' && l.patientId === 'P12345')
  );

  const explanation = ExplanationEngine.generateExplanation(patient, riskAssessment, trends, vitals, patientLabs);

  const changedParams: ChangedParam[] = [];

  // 1. Check lab trends
  trends.forEach((t) => {
    if (t.direction !== 'INSUFFICIENT DATA' && t.direction !== 'STABLE') {
      const labsForParam = patientLabs.filter(
        (l) => l.testName === t.parameterName || l.testName.toLowerCase().includes(t.parameterName.toLowerCase())
      );
      if (labsForParam.length >= 2) {
        const sorted = [...labsForParam].sort(
          (a, b) => new Date(a.sampleCollectedAt).getTime() - new Date(b.sampleCollectedAt).getTime()
        );
        const initial = sorted[0].value;
        const latest = sorted[sorted.length - 1].value;
        const isWorsening = t.direction === 'WORSENING' || t.direction === 'RAPIDLY WORSENING';

        changedParams.push({
          id: `trend-${t.parameterName}`,
          name: t.parameterName,
          direction: latest > initial ? 'Increasing' : 'Decreasing',
          fromTo: `${initial} → ${latest}`,
          unit: sorted[0].unit || '',
          note: t.explanation || (isWorsening ? 'Worsening trajectory across lab readings.' : 'Shift observed in lab tests.'),
          severity: isWorsening ? 'critical' : 'warning',
        });
      }
    }
  });

  // 2. Check vitals anomalies
  if (vitals?.spo2?.value && vitals.spo2.value < 95) {
    changedParams.push({
      id: 'vital-spo2',
      name: 'Oxygen Level (SpO2)',
      direction: 'Decreasing',
      fromTo: `Baseline → ${vitals.spo2.value}%`,
      unit: 'Live',
      note: 'Decrease over recent vital readings.',
      severity: vitals.spo2.value < 90 ? 'critical' : 'warning',
    });
  }

  if (vitals?.heartRate?.value && (vitals.heartRate.value > 100 || vitals.heartRate.value < 55)) {
    const isHigh = vitals.heartRate.value > 100;
    changedParams.push({
      id: 'vital-hr',
      name: 'Heart Rate',
      direction: isHigh ? 'Increasing' : 'Decreasing',
      fromTo: `Baseline → ${vitals.heartRate.value}`,
      unit: 'BPM',
      note: isHigh ? 'Elevated pulse reading.' : 'Bradycardia reading detected.',
      severity: isHigh && vitals.heartRate.value > 120 ? 'critical' : 'warning',
    });
  }

  if (vitals?.bloodPressure?.systolic?.value && vitals.bloodPressure.systolic.value > 140) {
    changedParams.push({
      id: 'vital-bp',
      name: 'Blood Pressure',
      direction: 'Increasing',
      fromTo: `Baseline → ${vitals.bloodPressure.systolic.value}/${vitals.bloodPressure.diastolic.value}`,
      unit: 'mmHg',
      note: 'Elevated systolic pressure.',
      severity: vitals.bloodPressure.systolic.value > 160 ? 'critical' : 'warning',
    });
  }

  if (vitals?.temperature?.value && vitals.temperature.value > 37.5) {
    changedParams.push({
      id: 'vital-temp',
      name: 'Body Temperature',
      direction: 'Increasing',
      fromTo: `Baseline → ${vitals.temperature.value}`,
      unit: '°C',
      note: 'Fever / elevated body temperature.',
      severity: vitals.temperature.value > 38.5 ? 'critical' : 'warning',
    });
  }

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

          {changedParams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {changedParams.map((param) => {
                const isCritical = param.severity === 'critical';
                const isWarning = param.severity === 'warning';
                const borderClass = isCritical ? 'border-red-200 bg-red-50/30' : isWarning ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200 bg-gray-50/50';
                const badgeClass = isCritical ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-slate-700';

                return (
                  <div key={param.id} className={`p-3 rounded-lg border ${borderClass}`}>
                    <div className="flex items-center justify-between font-semibold text-gray-700 mb-1">
                      <span>{param.name}</span>
                      <span className={`flex items-center font-bold ${badgeClass}`}>
                        {param.direction === 'Increasing' ? (
                          <TrendingUp className="w-3.5 h-3.5 mr-1" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 mr-1" />
                        )}
                        {param.direction}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {param.fromTo} <span className="text-xs font-normal text-gray-500">{param.unit}</span>
                    </div>
                    <div className={`text-[11px] mt-0.5 ${isCritical ? 'text-red-800' : 'text-amber-800'}`}>
                      {param.note}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {vitals?.heartRate?.value !== undefined ? (
                <>
                  <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-900 text-xs">Baseline Parameters Stable & Telemetry Active</div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        No acute vital sign deteriorations or abnormal laboratory parameter shifts detected.
                      </div>
                    </div>
                  </div>

                  {/* Display Baseline Vital Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-gray-500 font-medium text-[11px] flex items-center">
                        <Activity className="w-3 h-3 text-teal-600 mr-1" /> Heart Rate
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {vitals.heartRate.value} <span className="text-xs font-normal text-gray-500">BPM</span>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600 mt-1">Normal Pulse (60-100)</div>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-gray-500 font-medium text-[11px] flex items-center">
                        <Activity className="w-3 h-3 text-teal-600 mr-1" /> Oxygen (SpO2)
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {vitals.spo2?.value || 98}% <span className="text-xs font-normal text-gray-500">Live</span>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600 mt-1">Optimal Saturation (≥95%)</div>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-gray-500 font-medium text-[11px] flex items-center">
                        <Activity className="w-3 h-3 text-teal-600 mr-1" /> Blood Pressure
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {vitals.bloodPressure?.systolic?.value || 120}/{vitals.bloodPressure?.diastolic?.value || 80} <span className="text-xs font-normal text-gray-500">mmHg</span>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600 mt-1">Normotensive Range</div>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-gray-500 font-medium text-[11px] flex items-center">
                        <Activity className="w-3 h-3 text-teal-600 mr-1" /> Resp. Rate
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {vitals.respiratoryRate?.value || 16} <span className="text-xs font-normal text-gray-500">/min</span>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600 mt-1">Eupneic Baseline</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-slate-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800 text-xs">Patient Registered — Awaiting Bedside Telemetry Stream</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Patient admitted into {patient.ward} ({patient.bed}). Connect bedside ESP32 hardware monitor to stream live vitals to Firebase.
                      </div>
                    </div>
                  </div>

                  {/* Display Empty/Unlinked Vital Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 bg-slate-50/70 rounded-lg border border-dashed border-slate-200">
                      <div className="text-slate-400 font-medium text-[11px] flex items-center">
                        <Activity className="w-3 h-3 text-slate-400 mr-1" /> Heart Rate
                      </div>
                      <div className="font-bold text-slate-400 text-sm mt-0.5">-- <span className="text-xs font-normal text-slate-400">BPM</span></div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">NO HARDWARE LINKED</div>
                    </div>

                    <div className="p-2.5 bg-slate-50/70 rounded-lg border border-dashed border-slate-200">
                      <div className="text-slate-400 font-medium text-[11px] flex items-center">
                        <Activity className="w-3 h-3 text-slate-400 mr-1" /> Oxygen (SpO2)
                      </div>
                      <div className="font-bold text-slate-400 text-sm mt-0.5">-- <span className="text-xs font-normal text-slate-400">%</span></div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">NO HARDWARE LINKED</div>
                    </div>

                    <div className="p-2.5 bg-slate-50/70 rounded-lg border border-dashed border-slate-200">
                      <div className="text-slate-400 font-medium text-[11px] flex items-center">
                        <Activity className="w-3 h-3 text-slate-400 mr-1" /> Blood Pressure
                      </div>
                      <div className="font-bold text-slate-400 text-sm mt-0.5">--/-- <span className="text-xs font-normal text-slate-400">mmHg</span></div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">NO HARDWARE LINKED</div>
                    </div>

                    <div className="p-2.5 bg-slate-50/70 rounded-lg border border-dashed border-slate-200">
                      <div className="text-slate-400 font-medium text-[11px] flex items-center">
                        <Activity className="w-3 h-3 text-slate-400 mr-1" /> Resp. Rate
                      </div>
                      <div className="font-bold text-slate-400 text-sm mt-0.5">-- <span className="text-xs font-normal text-slate-400">/min</span></div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">NO HARDWARE LINKED</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Reasoning & Recommendation */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1.5 text-teal-700" /> CLINICAL EVALUATION
            </div>
            <ul className="text-xs text-slate-700 font-medium space-y-1.5">
              {explanation.concerns.map((concern, idx) => (
                <li key={idx}>• {concern}</li>
              ))}
            </ul>
          </div>

          {riskAssessment.riskBand === 'STABLE' ? (
            <div className="p-3 rounded-lg bg-emerald-900 text-white shadow-xs">
              <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                RECOMMENDATION
              </div>
              <div className="text-xs font-bold text-white mt-0.5 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                ROUTINE MONITORING CONTINUATION
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                Patient baseline parameters are normal. Continue standard telemetry monitoring.
              </p>
            </div>
          ) : riskAssessment.riskBand === 'MONITOR' ? (
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
          ) : (
            <div className="p-3 rounded-lg bg-red-900 text-white shadow-xs">
              <div className="text-[10px] font-bold text-red-300 uppercase tracking-wider">
                RECOMMENDATION
              </div>
              <div className="text-xs font-bold text-white mt-0.5 flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />
                URGENT PHYSICIAN EVALUATION
              </div>
              <p className="text-[11px] text-red-100 mt-0.5">
                Significant physiological escalation detected. Immediate clinical assessment requested.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

