import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { PocketDeviceMockup } from '../../components/hardware/PocketDeviceMockup';
import { Radio, Play, Pause, RotateCcw, Cpu, Activity } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export const SimulationPage: React.FC = () => {
  const {
    isRunning,
    activeScenario,
    setActiveScenario,
    speed,
    setSpeed,
    currentStepIndex,
    totalSteps,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    lastSimulatedEvent,
  } = useSimulation();

  const { alerts, acknowledgeAlert } = useRealtime();
  const navigate = useNavigate();

  const activeAlert = alerts[0] || null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Hardware Telemetry Simulation Engine" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-400">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>FIREBASE REALTIME DATABASE STREAM SIMULATOR</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">Interactive Hardware Scenario Control Panel</h2>
              <p className="text-xs text-slate-300 mt-1">
                Writes live telemetry step-by-step into Firebase Realtime Database. Bedside dashboards subscribe in real time without page refresh.
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
              <span className="text-xs font-bold text-slate-300">Simulation Speed:</span>
              {[1, 2, 5, 10].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition-all ${
                    speed === s ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Scenario Controls & Stream Log */}
            <div className="lg:col-span-7 space-y-6">
              {/* Scenario Selector & Action Buttons */}
              <div className="card-clinical p-6 bg-white space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Select Clinical Scenario
                  </label>
                  <select
                    value={activeScenario}
                    onChange={(e: any) => {
                      resetSimulation();
                      setActiveScenario(e.target.value);
                    }}
                    disabled={isRunning}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="P12345_PROGRESSIVE_DETERIORATION">
                      Demo Patient P12345 — Progressive Lab (Creatinine 0.9→1.3, CRP 8→31) & SpO2 Drop
                    </option>
                    <option value="RAPID_PHYSIOLOGICAL_DROP">
                      Rapid Physiological Deterioration (SpO2 97% → 87%, HR 82 → 124 BPM)
                    </option>
                  </select>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 font-bold mb-1">
                    <span>Scenario Progress</span>
                    <span>Step {currentStepIndex + 1} of {totalSteps}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center space-x-3 pt-2">
                  {!isRunning ? (
                    <button
                      onClick={startSimulation}
                      className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>START SIMULATION STREAM</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseSimulation}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
                    >
                      <Pause className="w-4 h-4 fill-white" />
                      <span>PAUSE STREAM</span>
                    </button>
                  )}

                  <button
                    onClick={resetSimulation}
                    className="px-4 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all flex items-center space-x-1.5 text-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>RESET</span>
                  </button>
                </div>
              </div>

              {/* Console Event Log */}
              <div className="card-clinical p-5 bg-slate-950 text-cyan-400 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-300 flex items-center">
                    <Activity className="w-4 h-4 mr-1.5 text-teal-400" /> FIREBASE RTDB STREAM CONSOLE
                  </span>
                  <span className="text-[10px] text-slate-500">Channel /liveVitals/P12345</span>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-emerald-400 font-bold">{lastSimulatedEvent}</div>
                  <div className="text-[10px] text-slate-500">
                    Engine Status: {isRunning ? `STREAMING AT ${speed}X` : 'PAUSED'}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                  <span>Hardware & Simulation share identical pipeline</span>
                  <button onClick={() => navigate('/doctor/patients/P12345')} className="text-teal-400 hover:underline">
                    View Doctor Patient Page →
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Virtual Pocket Device Alert Delivery */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center card-clinical p-6 bg-slate-900/5 border-2 border-dashed border-gray-300">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <Cpu className="w-4 h-4 mr-1.5 text-teal-600" /> POCKET ALERT DEVICE MOCKUP
              </div>

              <PocketDeviceMockup
                alert={activeAlert}
                onAcknowledge={(alertId) => acknowledgeAlert(alertId, 'Dr. Sarah Jenkins')}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
