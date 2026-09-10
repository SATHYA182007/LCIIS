import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Heart,
  Mail,
  Lock,
  User,
  Stethoscope,
  HeartPulse,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Building2
} from 'lucide-react';
import type { UserRole } from '../../types';
import { toast } from 'sonner';

export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleDemoFill = (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setPassword('password');
    setRole(demoRole);
    setErrorMsg('');
    toast.info(`Pre-filled ${demoRole.toUpperCase()} credentials`, {
      description: `Click Sign In to access the ${demoRole} workstation.`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entries.');
      return;
    }

    try {
      if (isSignUp) {
        if (role === 'admin') {
          setErrorMsg('Admin accounts require institutional IT security approval.');
          return;
        }
        await signup(email, name, role);
        toast.success('Clinical account created successfully.');
      } else {
        await login(email, role);
        toast.success(`Welcome back, ${role.toUpperCase()} user!`);
      }

      if (role === 'nurse') navigate('/nurse/dashboard');
      else if (role === 'laboratory') navigate('/laboratory/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/doctor/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const rolesData: { id: UserRole; title: string; label: string; icon: any; bg: string; activeColor: string }[] = [
    {
      id: 'doctor',
      title: 'Physician',
      label: 'Doctor Workstation',
      icon: Stethoscope,
      bg: 'from-teal-500/10 to-teal-700/20',
      activeColor: 'border-teal-500 text-teal-600 bg-teal-50/80 shadow-teal-100'
    },
    {
      id: 'nurse',
      title: 'Nursing',
      label: 'Bedside Telemetry',
      icon: HeartPulse,
      bg: 'from-blue-500/10 to-blue-700/20',
      activeColor: 'border-blue-500 text-blue-600 bg-blue-50/80 shadow-blue-100'
    },
    {
      id: 'laboratory',
      title: 'LIS Lab',
      label: 'Results Verification',
      icon: FlaskConical,
      bg: 'from-emerald-500/10 to-emerald-700/20',
      activeColor: 'border-emerald-500 text-emerald-600 bg-emerald-50/80 shadow-emerald-100'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex font-sans select-none overflow-hidden">
      {/* Background Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      {/* Left Branding & Live Clinical Preview Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-slate-950 via-teal-950/90 to-slate-900 p-12 text-white flex-col justify-between relative z-10 border-r border-slate-800/80 backdrop-blur-xl">
        {/* Header Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-900/40 group-hover:scale-105 transition-all">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-white text-xl tracking-tight flex items-center space-x-1.5">
                <span>LCIIS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold uppercase tracking-wider">
                  v2.4 Pro
                </span>
              </div>
              <div className="text-xs text-teal-300/80 font-medium">Longitudinal Clinical Intelligence</div>
            </div>
          </div>
        </div>

        {/* Hero Narrative & Animated Telemetry Widget */}
        <div className="space-y-8 my-auto">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-teal-200 font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Real-time Clinical Deterioration Alert Platform</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
              Predictive Clinical Intelligence for Critical Care.
            </h1>
            <p className="text-slate-300/90 text-sm leading-relaxed">
              Synthesize serial laboratory trends, continuous bedside telemetry streams, and doctor interventions into one unified medical dashboard.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400/80 border-t border-slate-800/60 pt-4">
          <span className="flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-teal-400" /> HIPAA & HL7 Compliant Security
          </span>
          <span>GreenMinds Medical AI</span>
        </div>
      </div>

      {/* Right Authentication Form Panel */}
      <div className="w-full lg:w-7/12 bg-slate-50 flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto">
        <div className="max-w-md w-full my-auto space-y-7">
          {/* Mobile Logo */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2.5" onClick={() => navigate('/')}>
              <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white font-bold shadow-md">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-base tracking-tight">LCIIS</div>
                <div className="text-[10px] text-slate-500 font-medium">Clinical Monitoring System</div>
              </div>
            </div>
          </div>

          {/* Title & Auth Mode Toggle Tabs */}
          <div className="space-y-4">
            <div className="flex bg-slate-200/70 p-1 rounded-2xl border border-slate-300/60">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                  !isSignUp
                    ? 'bg-white text-teal-900 shadow-md shadow-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Clinical Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                  isSignUp
                    ? 'bg-white text-teal-900 shadow-md shadow-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Staff Account
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {isSignUp ? 'Register Staff Credential' : 'Authorized Sign In'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isSignUp
                  ? 'Provision a new clinical user account to access longitudinal patient monitoring.'
                  : 'Enter your hospital staff credentials to access your designated role portal.'}
              </p>
            </div>
          </div>

          {/* Error Advisory Alert */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-start space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for Signup */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name & Title</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-hidden transition-all shadow-xs"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Hospital Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.demo"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-hidden transition-all shadow-xs"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-hidden transition-all shadow-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-hidden transition-all shadow-xs"
                    required
                  />
                </div>
              </div>
            )}

            {/* Hospital Role Selection Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Hospital Role Portal</label>
              <div className="grid grid-cols-3 gap-2.5">
                {rolesData.map((item) => {
                  const IconComponent = item.icon;
                  const isSelected = role === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setRole(item.id)}
                      className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? `bg-white ${item.activeColor} ring-2 ring-teal-500/20 shadow-md`
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-teal-100/80 text-teal-800' : 'bg-slate-100 text-slate-500'}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                      </div>

                      <div>
                        <div className="font-extrabold text-xs text-slate-900">{item.title}</div>
                        <div className="text-[10px] text-slate-400 font-medium truncate">{item.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center space-x-2 mt-2"
            >
              <span>{isLoading ? 'Authenticating Credentials...' : isSignUp ? 'Provision Staff Account' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Professional Demo Credential Quick-Fill Section */}
          <div className="pt-4 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1 text-teal-700" /> Demo Workstation Quick Login:
              </span>
              <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-bold">1-Click Auto Fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('doctor@hospital.demo', 'doctor')}
                className="p-2.5 bg-white hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 rounded-xl text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-teal-800">Doctor</span>
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">doctor@hospital.demo</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('nurse@hospital.demo', 'nurse')}
                className="p-2.5 bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-blue-800">Nurse</span>
                  <HeartPulse className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">nurse@hospital.demo</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('lab@hospital.demo', 'laboratory')}
                className="p-2.5 bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-800">Lab Specialist</span>
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">lab@hospital.demo</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('admin@hospital.demo', 'admin')}
                className="p-2.5 bg-white hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-purple-800">Admin</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">admin@hospital.demo</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

