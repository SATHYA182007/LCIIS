import React from 'react';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { ArrowRight } from 'lucide-react';


export const SystemArchitecturePage: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="LCIIS System & Intelligence Architecture" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-lg font-bold text-slate-900">End-to-End Clinical Data Integration & Pipeline</h2>
            <p className="text-xs text-gray-500">
              Interactive architectural data flow from physical sensors and LIS to the Clinical Decision Support Engines.
            </p>
          </div>

          {/* Interactive Visual Pipeline Box */}
          <div className="card-clinical p-8 bg-slate-900 text-white space-y-8">
            {/* Layer 1: Ingestion Sources */}
            <div>
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">
                LAYER 1: CLINICAL INGESTION & SENSORS
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 font-bold text-center">EMR History</div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 font-bold text-center">LIS Laboratory</div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 font-bold text-center">HIS Admissions</div>
                <div className="p-3 bg-teal-900/60 rounded-xl border border-teal-500 font-bold text-center text-teal-300">ESP32 Bedside Sensors</div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 font-bold text-center">Nurse Observations</div>
              </div>
            </div>

            <div className="flex justify-center text-teal-400">
              <ArrowRight className="w-6 h-6 rotate-90" />
            </div>

            {/* Layer 2: Firebase Realtime & Storage */}
            <div>
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">
                LAYER 2: REALTIME DATA PIPELINE
              </div>
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex justify-around text-xs font-mono font-bold">
                <span>Firebase Authentication</span>
                <span>Cloud Firestore (Historical Ledger)</span>
                <span className="text-teal-300">Firebase Realtime Database (/liveVitals)</span>
              </div>
            </div>

            <div className="flex justify-center text-teal-400">
              <ArrowRight className="w-6 h-6 rotate-90" />
            </div>

            {/* Layer 3: Intelligence Pipeline */}
            <div>
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">
                LAYER 3: DETERMINISTIC CLINICAL INTELLIGENCE CORE
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-teal-950 rounded-xl border border-teal-600 font-bold text-center">1. Trend Engine (Velocity & Baseline)</div>
                <div className="p-3 bg-teal-950 rounded-xl border border-teal-600 font-bold text-center">2. Anomaly Engine (Z-Score Outliers)</div>
                <div className="p-3 bg-teal-950 rounded-xl border border-teal-600 font-bold text-center">3. Risk Aggregator & Model Adapter</div>
                <div className="p-3 bg-teal-950 rounded-xl border border-teal-600 font-bold text-center">4. Patient Status Engine</div>
                <div className="p-3 bg-teal-950 rounded-xl border border-teal-600 font-bold text-center">5. Explanation Engine ("WHY")</div>
              </div>
            </div>

            <div className="flex justify-center text-teal-400">
              <ArrowRight className="w-6 h-6 rotate-90" />
            </div>

            {/* Layer 4: Role Delivery */}
            <div>
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">
                LAYER 4: ROLE-BASED DASHBOARDS & POCKET DEVICE
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold text-center">
                <div className="p-3 bg-emerald-900/60 border border-emerald-500 rounded-xl text-emerald-200">Doctor Command Center</div>
                <div className="p-3 bg-teal-900/60 border border-teal-500 rounded-xl text-teal-200">Nurse Monitoring View</div>
                <div className="p-3 bg-cyan-900/60 border border-cyan-500 rounded-xl text-cyan-200">Laboratory Verification</div>
                <div className="p-3 bg-purple-900/60 border border-purple-500 rounded-xl text-purple-200">ESP32 Pocket Alert Dongle</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
