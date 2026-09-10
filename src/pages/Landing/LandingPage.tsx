import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  FlaskConical,
  HeartPulse,
  Stethoscope,
  Cpu,
  Layers,
  Brain,
  Zap,
  Radio,
  Lock,
  ChevronRight,
  AlertTriangle,
  Sliders
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoleTab, setActiveRoleTab] = useState<'doctor' | 'nurse' | 'laboratory' | 'admin'>('doctor');

  // Animation Variants
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const roleDetails = {
    doctor: {
      title: 'Physician Command Center',
      icon: Stethoscope,
      color: 'teal',
      route: '/doctor/dashboard',
      desc: 'Focuses on early deterioration detection, plain-language "WHAT CHANGED?" cards, Recharts time-series graphs, prescribing medications, recording care actions, and alert overrides.',
      features: [
        'Plain-Language "WHAT CHANGED?" Root Cause Analysis',
        'Serial Trend Line Charts for Creatinine, CRP, SpO2 & Heart Rate',
        'Direct Prescription & Care Action Interventions',
        'Alert Acknowledgment & Clinical Override Auditing'
      ]
    },
    nurse: {
      title: 'Bedside Telemetry & Nursing Observations',
      icon: HeartPulse,
      color: 'blue',
      route: '/nurse/dashboard',
      desc: 'Subscribes to live ward vital telemetry grids, records AVPU consciousness levels, pain scores, fluid intake/output balance, and bedside spot-check observations.',
      features: [
        'Live ICU & Ward Telemetry Stream Grid',
        'AVPU Consciousness & Pain Assessment Modals',
        'Fluid Balance & Spot-Check Vitals Entry',
        'Instant Nurse Pocket Device Notifications'
      ]
    },
    laboratory: {
      title: 'LIS Laboratory Entry & Verification Queue',
      icon: FlaskConical,
      color: 'emerald',
      route: '/laboratory/dashboard',
      desc: 'Records new lab investigation results (Biochemistry, Inflammatory, Hematology), validates reference range bounds, verifies technician entries, and triggers the intelligence pipeline.',
      features: [
        'Rapid LIS Investigation Result Entry',
        'Automated Reference Range Bound Checking',
        'Verified Results Audit Queue & Historical Search',
        'Instant Real-Time Intelligence Pipeline Triggering'
      ]
    },
    admin: {
      title: 'Operations & Expiry Control Center',
      icon: ShieldCheck,
      color: 'purple',
      route: '/admin/dashboard',
      desc: 'Monitors pharmaceutical stock movements, tracks Expiry Warning Center bands (90, 60, 30, 7-day alert bands), manages ESP32 telemetry hardware devices, and inspects immutable audit logs.',
      features: [
        'Pharmaceutical Stock Ledgers & Reorder Warnings',
        'Multi-Band Expiry Warning Center (90, 60, 30, 7 days)',
        'ESP32 Device Node Heartbeat & Signal Monitor',
        'Immutable Security & Audit Trail Inspection'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Background Ambient Glow & Moving Grid Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-moving-grid opacity-100" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="h-20 border-b border-slate-200/80 px-6 sm:px-12 flex items-center justify-between bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-xs">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-900/10 group-hover:scale-105 transition-all">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-lg tracking-tight flex items-center space-x-1.5">
              <span>LCIIS</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold uppercase tracking-wider">
                v2.4 Pro
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Longitudinal Clinical Intelligence</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-slate-600">
          <a href="#overview" className="hover:text-teal-800 transition-colors">OVERVIEW</a>
          <a href="#engines" className="hover:text-teal-800 transition-colors">INTELLIGENCE ENGINES</a>
          <a href="#workstations" className="hover:text-teal-800 transition-colors">HOSPITAL ROLES</a>
          <a href="#hardware" className="hover:text-teal-800 transition-colors">HARDWARE & IoT</a>
        </nav>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/auth')}
            className="text-xs font-extrabold text-slate-700 hover:text-teal-800 px-4 py-2 rounded-xl transition-colors"
          >
            SIGN IN
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-teal-900/10 transition-all flex items-center space-x-2"
          >
            <span>GET STARTED</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="relative z-10 pt-16 pb-20 px-6 sm:px-12 max-w-7xl mx-auto w-full text-center space-y-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-6"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-extrabold shadow-2xs">
            <Sparkles className="w-4 h-4 text-teal-700" />
            <span>GREENMINDS HEALTHCARE INTELLIGENCE PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight leading-tight max-w-5xl mx-auto">
            Don't Just View the Latest Result.{' '}
            <span className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-700 bg-clip-text text-transparent">
              Understand the Clinical Trajectory.
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
            LCIIS unifies EMR patient records, LIS serial lab trends, and real-time bedside telemetry streams into one explainable deterioration alert platform.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/auth')}
              className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-lg shadow-teal-900/15 transition-all flex items-center space-x-2"
            >
              <span>LAUNCH CLINICAL PORTAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Infinite Unboxed Scrolling Text Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="pt-10 max-w-6xl mx-auto overflow-hidden text-left"
        >
          {/* Scrolling Text Marquee - Completely Unboxed */}
          <div className="relative w-full overflow-hidden py-4 border-y border-slate-200/60">
            <motion.div
              className="flex whitespace-nowrap space-x-8"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, duration: 35, ease: 'linear' }}
            >
              {[
                'Longitudinal Clinical Intelligence',
                'EMR & LIS Data Integration',
                'ESP32 Bedside Telemetry Streaming',
                'Rate-of-Change Velocity dV/dt Analysis',
                '100% Explainable Rule + Trend + Anomaly Pipeline',
                'Sub-500ms Real-Time Hardware Alert Pipeline',
                'Multi-Parameter Cross-Correlated Deterioration Flags',
                '4 Dedicated Portals: Doctor, Nurse, Lab & Admin',
                'Longitudinal Clinical Intelligence',
                'EMR & LIS Data Integration',
                'ESP32 Bedside Telemetry Streaming',
                'Rate-of-Change Velocity dV/dt Analysis',
                '100% Explainable Rule + Trend + Anomaly Pipeline',
                'Sub-500ms Real-Time Hardware Alert Pipeline',
                'Multi-Parameter Cross-Correlated Deterioration Flags',
                '4 Dedicated Portals: Doctor, Nurse, Lab & Admin',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-slate-800 font-extrabold text-xs sm:text-sm tracking-wider uppercase shrink-0">
                  <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Core Clinical Problem vs Solution Grid (Scroll Animated) */}
      <section className="py-20 bg-slate-50/80 border-y border-slate-200/80 relative z-10 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center space-y-3 max-w-3xl mx-auto"
          >
            <span className="text-xs font-extrabold text-teal-800 tracking-wider uppercase">CLINICAL PARADIGM SHIFT</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Why Point-in-Time Spot Checks Fail Patients</h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A lab test remaining strictly within standard reference limits can still represent dangerous clinical deterioration when evaluated over time.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* The Problem */}
            <motion.div variants={fadeInUp} className="p-8 rounded-3xl bg-white border border-red-200 shadow-md space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-700 font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Traditional Isolated Testing</h3>
              <ul className="space-y-3 text-xs text-slate-700 font-medium">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2 font-bold">✕</span>
                  <span>Evaluates each test result as a disconnected single value.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2 font-bold">✕</span>
                  <span>Misses subtle velocity changes (dV/dt) when Creatinine shifts within range (0.9 → 1.3 mg/dL).</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2 font-bold">✕</span>
                  <span>Treats telemetry, lab results, and nurse notes in separate siloed systems.</span>
                </li>
              </ul>
            </motion.div>

            {/* The Solution */}
            <motion.div variants={fadeInUp} className="p-8 rounded-3xl bg-white border border-teal-200 shadow-md space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">LCIIS Longitudinal Intelligence</h3>
              <ul className="space-y-3 text-xs text-slate-700 font-medium">
                <li className="flex items-start">
                  <span className="text-teal-700 mr-2 font-bold">✓</span>
                  <span>Tracks velocity, slope, persistence, and individualized patient baseline μ_patient.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-700 mr-2 font-bold">✓</span>
                  <span>Detects multi-system concurrent changes across lab draws and telemetry.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-700 mr-2 font-bold">✓</span>
                  <span>Provides plain-language "WHY" reasoning for every alert escalation.</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5 Deterministic Intelligence Engines Grid (Scroll Animated) */}
      <section id="engines" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full relative z-10 space-y-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center space-y-3 max-w-3xl mx-auto"
        >
          <span className="text-xs font-extrabold text-teal-800 tracking-wider uppercase">DETERMINISTIC PIPELINE</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">5 Core Intelligence Engines</h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Every alert is backed by explainable mathematical formulas and transparent state machine transitions.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Engine 1 */}
          <motion.div variants={fadeInUp} className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/50 shadow-md shadow-slate-100 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors">1. Trend Analysis Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Calculates rate of change (dV/dt), directional regression slope, consecutive persistence across k measurements, and volatility.
            </p>
          </motion.div>

          {/* Engine 2 */}
          <motion.div variants={fadeInUp} className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/50 shadow-md shadow-slate-100 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">2. Anomaly Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Detects statistical z-score outliers (≥ 2.5σ) and sudden range-relative jump spikes across physiological measurements.
            </p>
          </motion.div>

          {/* Engine 3 */}
          <motion.div variants={fadeInUp} className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/50 shadow-md shadow-slate-100 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-800 transition-colors">3. Multi-Factor Risk Aggregator</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Combines rule-based scores, trend outputs, anomaly detections, and ML predictions into advisory risk bands (`STABLE` to `CRITICAL`).
            </p>
          </motion.div>

          {/* Engine 4 */}
          <motion.div variants={fadeInUp} className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/50 shadow-md shadow-slate-100 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-800 transition-colors">4. Patient Status Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Manages state transitions (`STABLE`, `MONITOR`, `HIGH RISK`, `CRITICAL`). Ensures missing telemetry data never triggers false deterioration alerts.
            </p>
          </motion.div>

          {/* Engine 5 */}
          <motion.div variants={fadeInUp} className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/50 shadow-md shadow-slate-100 transition-all space-y-3 group md:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">5. Explainable Reasoning Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Generates transparent, plain-language "WHY" explanations for clinicians detailing multi-parameter changes, time intervals, and risk contributions.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* 4 Tailored Hospital Workstations Showcase (Interactive Tabs) */}
      <section id="workstations" className="py-20 bg-slate-50/80 border-y border-slate-200/80 relative z-10 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center space-y-3 max-w-3xl mx-auto"
          >
            <span className="text-xs font-extrabold text-teal-800 tracking-wider uppercase">ROLE-BASED WORKSPACES</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">4 Dedicated Hospital User Roles</h2>
            <p className="text-slate-600 text-sm sm:text-base">
              LCIIS routes healthcare personnel to custom, role-optimized clinical portals.
            </p>
          </motion.div>

          {/* Role Tabs */}
          <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-200/60 rounded-2xl border border-slate-300/70 max-w-3xl mx-auto">
            {(['doctor', 'nurse', 'laboratory', 'admin'] as const).map((roleKey) => {
              const r = roleDetails[roleKey];
              const IconComp = r.icon;
              const isActive = activeRoleTab === roleKey;
              return (
                <button
                  key={roleKey}
                  onClick={() => setActiveRoleTab(roleKey)}
                  className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center space-x-2 ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-md'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span className="capitalize">{roleKey}</span>
                </button>
              );
            })}
          </div>

          {/* Role Active Card Details */}
          <motion.div
            key={activeRoleTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  {React.createElement(roleDetails[activeRoleTab].icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{roleDetails[activeRoleTab].title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{roleDetails[activeRoleTab].desc}</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/auth')}
                className="self-start sm:self-center px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <span>OPEN WORKSTATION</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roleDetails[activeRoleTab].features.map((feat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center space-x-3 text-xs text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hardware & IoT Telemetry Architecture */}
      <section id="hardware" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full relative z-10 space-y-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center space-y-3 max-w-3xl mx-auto"
        >
          <span className="text-xs font-extrabold text-teal-800 tracking-wider uppercase">HARDWARE INTEGRATION</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">ESP32 & Pocket Alert Dongle System</h2>
          <p className="text-slate-600 text-sm sm:text-base">
            End-to-end hardware telemetry streaming and pocket alert delivery devices for clinical staff.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div variants={fadeInUp} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">ESP32 Microcontroller Node</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Streams continuous bedside vitals JSON payloads (/liveVitals/patient_id) over Firebase Realtime Database with automatic Wi-Fi reconnect handling.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Pocket Alert Hardware Dongle</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Portable healthcare staff device equipped with an OLED display, piezo buzzer alert tones, haptic vibration motor, and alert LEDs.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Interactive Scenario Simulator</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Built-in telemetry simulator (/simulation) streams clinical scenarios at 1x, 2x, 5x, and 10x speeds for training and validation.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Impact Numbers Banner */}
      <section className="py-16 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-900 text-white relative z-10 px-6 sm:px-12 shadow-xl">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-5xl font-black text-white">100%</div>
            <div className="text-xs text-teal-300 font-bold uppercase tracking-wider mt-2">Explainable Reasoning</div>
          </div>
          <div>
            <div className="text-3xl sm:text-5xl font-black text-white">&lt; 500ms</div>
            <div className="text-xs text-teal-300 font-bold uppercase tracking-wider mt-2">Alert Pipeline Latency</div>
          </div>
          <div>
            <div className="text-3xl sm:text-5xl font-black text-white">4</div>
            <div className="text-xs text-teal-300 font-bold uppercase tracking-wider mt-2">Hospital Workstation Portals</div>
          </div>
          <div>
            <div className="text-3xl sm:text-5xl font-black text-white">24/7</div>
            <div className="text-xs text-teal-300 font-bold uppercase tracking-wider mt-2">Continuous IoT Monitoring</div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-20 px-6 sm:px-12 max-w-5xl mx-auto text-center space-y-6 relative z-10">
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900">Ready to Experience Longitudinal Intelligence?</h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          Explore the clinical portals or test the real-time hardware telemetry simulation engine.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/auth')}
            className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-teal-900/10 transition-all flex items-center space-x-2"
          >
            <span>SIGN IN TO PORTAL</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Clinical & Synthetic Disclaimer Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 px-6 sm:px-12 border-t border-slate-800 text-xs relative z-10">
        <div className="max-w-7xl mx-auto space-y-4 text-center sm:text-left flex flex-col sm:flex-row justify-between items-start">
          <div className="space-y-2 max-w-4xl">
            <div className="font-extrabold text-slate-200 uppercase tracking-wider flex items-center justify-center sm:justify-start">
              <Lock className="w-4 h-4 mr-2 text-teal-400" /> CLINICAL DECISION SUPPORT & ADVISORY SYSTEM ONLY
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              LCIIS provides advisory decision-support analysis of available patient, laboratory, and physiological telemetry data. It does not diagnose disease, prescribe treatment, or replace professional clinical judgment. Final clinical decisions remain with authorized healthcare professionals.
            </p>
          </div>
          <div className="text-slate-500 font-mono text-[11px] shrink-0 self-center sm:self-start">
            DEMO ENVIRONMENT • SYNTHETIC DATA • GREENMINDS AI
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
