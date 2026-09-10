import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Sparkles, Lock } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans select-none">
      {/* Navigation Header */}
      <header className="h-16 sm:h-20 border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">LCIIS</div>
            <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Clinical Monitoring</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => navigate('/auth')}
            className="text-xs font-bold text-slate-700 hover:text-teal-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors"
          >
            SIGN IN
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 sm:space-x-2"
          >
            <span>GET STARTED</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full text-center space-y-6 sm:space-y-8">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>GREENMINDS HEALTHCARE INTELLIGENCE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          See the Patient's Clinical Story.
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          LCIIS brings patient records, laboratory results and real-time vital signs together to help healthcare professionals recognize meaningful changes over time.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/auth')}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm px-8 py-4 rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <span>SIGN IN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('features-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-gray-50 border border-gray-200 hover:bg-gray-100 text-slate-800 font-bold text-sm px-8 py-4 rounded-xl transition-all"
          >
            LEARN MORE
          </button>
        </div>
      </section>

      {/* Subtle Visual Demo Card */}
      <section id="features-section" className="py-12 bg-teal-50/40 border-t border-b border-teal-100">
        <div className="max-w-4xl mx-auto px-8">
          <div className="card-clinical p-6 bg-white shadow-md border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="text-xs font-bold text-slate-900">Eleanor Vance (P12345) — Bed 12</div>
                <div className="text-[11px] text-gray-500">ICU Unit A • Attending: Dr. Sarah Jenkins</div>
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
                HIGH RISK
              </span>
            </div>

            <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-2 text-xs">
              <div className="font-bold text-teal-900 uppercase tracking-wider text-[10px]">
                PATIENT STATUS — WHY FLAGGED?
              </div>
              <ul className="space-y-1 text-slate-700 font-medium">
                <li>• Oxygen level has decreased over recent readings (98% → 92%).</li>
                <li>• Heart rate has increased (82 → 112 BPM).</li>
                <li>• Creatinine is gradually increasing (0.9 → 1.3 mg/dL).</li>
                <li>• Several values changed together.</li>
              </ul>
              <div className="font-bold text-teal-800 text-[11px] pt-1">
                Clinical review recommended.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Disclaimer Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 px-8 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto space-y-2 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center">
          <div className="space-y-1 max-w-3xl">
            <div className="font-bold text-slate-200 uppercase tracking-wider flex items-center justify-center sm:justify-start">
              <Lock className="w-3.5 h-3.5 mr-1.5 text-teal-400" /> CLINICAL DECISION SUPPORT ONLY
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              This platform analyzes available patient, laboratory and physiological data to provide advisory alerts. It does not diagnose disease, prescribe treatment, or replace professional clinical judgment.
            </p>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            DEMO ENVIRONMENT • SYNTHETIC PATIENT DATA
          </div>
        </div>
      </footer>
    </div>
  );
};
