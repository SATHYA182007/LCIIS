import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Mail,
  Lock,
  User,
  Stethoscope,
  HeartPulse,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  UserPlus,
  BadgeCheck,
  KeyRound
} from 'lucide-react';
import type { UserRole } from '../../types';
import { toast } from 'sonner';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup' | 'forgot-password';
  forcedRole?: UserRole;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode, forcedRole }) => {
  const location = useLocation();
  
  const getModeFromPath = (): 'signin' | 'signup' | 'forgot-password' => {
    if (initialMode) return initialMode;
    if (location.pathname.includes('/signup')) return 'signup';
    if (location.pathname.includes('/forgot-password')) return 'forgot-password';
    return 'signin';
  };

  const getRoleFromPath = (): UserRole => {
    if (forcedRole) return forcedRole;
    if (location.pathname.includes('/receptionist')) return 'receptionist';
    if (location.pathname.includes('/admin')) return 'admin';
    return 'doctor';
  };

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password'>(getModeFromPath);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState<UserRole>(getRoleFromPath);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const { login, signup, resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();

  const demoEmailMap: Record<UserRole, string> = {
    receptionist: 'receptionist@hospital.demo',
    doctor: 'doctor@hospital.demo',
    nurse: 'nurse@hospital.demo',
    laboratory: 'lab@hospital.demo',
    admin: 'admin@hospital.demo'
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setErrorMsg('');

    if (mode === 'signin') {
      const emailVal = demoEmailMap[selectedRole];
      setEmail(emailVal);
      setPassword('password');
      toast.info(`Autofilled ${selectedRole.toUpperCase()} credentials`, {
        description: `Email: ${emailVal} | Password: password`
      });
    } else if (mode === 'signup') {
      const demoSignupMap: Record<UserRole, { name: string; email: string; empId: string }> = {
        receptionist: { name: 'Eleanor Vance', email: 'receptionist@hospital.demo', empId: 'REC001' },
        doctor: { name: 'Dr. Sarah Jenkins', email: 'doctor@hospital.demo', empId: 'DOC001' },
        nurse: { name: 'Nurse Amanda Miller', email: 'nurse@hospital.demo', empId: 'NUR001' },
        laboratory: { name: 'Alex Rivera (LIS)', email: 'lab@hospital.demo', empId: 'LAB001' },
        admin: { name: 'System Administrator', email: 'admin@hospital.demo', empId: 'ADM001' }
      };
      const info = demoSignupMap[selectedRole];
      setName(info.name);
      setEmail(info.email);
      setEmployeeId(info.empId);
      setPassword('password');
      setConfirmPassword('password');
    }
  };

  useEffect(() => {
    const initialRole = getRoleFromPath();
    const currentMode = getModeFromPath();
    setMode(currentMode);
    setRole(initialRole);
    setErrorMsg('');
    setResetSuccess(false);

    if (currentMode === 'signin') {
      setEmail(demoEmailMap[initialRole]);
      setPassword('password');
    }
  }, [location.pathname, initialMode, forcedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResetSuccess(false);

    try {
      if (mode === 'forgot-password') {
        await resetPassword(email);
        setResetSuccess(true);
        toast.success('Password reset email dispatched via Firebase Auth.');
        return;
      }

      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match. Please verify your entries.');
          return;
        }
        await signup(email, password, name, role, employeeId);
        toast.success(`${role.toUpperCase()} account registered successfully in Firebase.`);
      } else {
        await login(email, password, role);
        toast.success(`Welcome back, ${role.toUpperCase()} user!`);
      }

      if (role === 'receptionist') navigate('/receptionist/dashboard');
      else if (role === 'nurse') navigate('/nurse/dashboard');
      else if (role === 'laboratory') navigate('/laboratory/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/doctor/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const rolesData: { id: UserRole; title: string; label: string; icon: any; activeColor: string }[] = [
    {
      id: 'receptionist',
      title: 'Receptionist',
      label: 'Patient Intake',
      icon: UserPlus,
      activeColor: 'border-purple-500 text-purple-600 bg-purple-50/80 shadow-purple-100'
    },
    {
      id: 'doctor',
      title: 'Physician',
      label: 'Doctor Workstation',
      icon: Stethoscope,
      activeColor: 'border-teal-500 text-teal-600 bg-teal-50/80 shadow-teal-100'
    },
    {
      id: 'nurse',
      title: 'Nursing',
      label: 'Bedside Telemetry',
      icon: HeartPulse,
      activeColor: 'border-blue-500 text-blue-600 bg-blue-50/80 shadow-blue-100'
    },
    {
      id: 'laboratory',
      title: 'LIS Lab',
      label: 'Results Verification',
      icon: FlaskConical,
      activeColor: 'border-emerald-500 text-emerald-600 bg-emerald-50/80 shadow-emerald-100'
    },
    {
      id: 'admin',
      title: 'Admin',
      label: 'System Operations',
      icon: ShieldCheck,
      activeColor: 'border-amber-500 text-amber-600 bg-amber-50/80 shadow-amber-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50/30 flex items-center justify-center p-4 sm:p-6 font-sans select-none relative overflow-y-auto">
      {/* Animated Moving Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-moving-grid opacity-80" />

      {/* Background Subtle Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Centered Authentication Form Card */}
      <div className="max-w-lg w-full bg-white p-7 sm:p-9 rounded-3xl shadow-2xl shadow-slate-300/60 border border-slate-200/90 relative z-10 my-auto space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-700/20 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="font-black text-slate-900 text-xl tracking-tight flex items-center space-x-2">
              <span>LCIIS</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100/80 text-teal-800 font-bold border border-teal-200 uppercase tracking-wider">
                Firebase Auth
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Longitudinal Clinical Intelligence System</div>
          </div>
        </div>

        {/* Title & Auth Mode Toggle Tabs */}
        <div className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
                setResetSuccess(false);
                navigate(role === 'receptionist' ? '/receptionist/login' : '/signin');
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-white text-teal-800 shadow-md shadow-slate-200/60 border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Clinical Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setResetSuccess(false);
                navigate(role === 'receptionist' ? '/receptionist/signup' : '/signup');
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white text-teal-800 shadow-md shadow-slate-200/60 border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register Staff Account
            </button>
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {mode === 'forgot-password'
                ? 'Reset Staff Password'
                : mode === 'signup'
                ? `Register ${role.toUpperCase()} Account`
                : `${role.toUpperCase()} Sign In`}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {mode === 'forgot-password'
                ? 'Enter your registered hospital email address to receive password reset instructions.'
                : mode === 'signup'
                ? 'Provision a new clinical staff account in Firebase Authentication.'
                : 'Enter your credentials to access your designated hospital workstation.'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-start space-x-2"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {resetSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold flex items-start space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Instructions have been dispatched to your email address.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name for Signup */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name & Title
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-hidden transition-all shadow-2xs"
                  required
                />
              </div>
            </div>
          )}

          {/* Employee ID for Signup */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Employee ID
              </label>
              <div className="relative">
                <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. REC001"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-hidden transition-all shadow-2xs font-mono uppercase"
                  required
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              Hospital Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="receptionist@hospital.demo"
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-hidden transition-all shadow-2xs"
                required
              />
            </div>
          </div>

          {/* Password */}
          {mode !== 'forgot-password' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot-password'); setErrorMsg(''); navigate('/forgot-password'); }}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-hidden transition-all shadow-2xs"
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
          )}

          {/* Confirm Password */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-hidden transition-all shadow-2xs"
                  required
                />
              </div>
            </div>
          )}

          {/* Role Selection Cards */}
          {mode !== 'forgot-password' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Select Hospital Role
                </label>
                {mode === 'signin' && (
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    Click to autofill
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {rolesData.map((item) => {
                  const IconComponent = item.icon;
                  const isSelected = role === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleRoleSelect(item.id)}
                      className={`p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between space-y-1.5 ${
                        isSelected
                          ? `bg-teal-50/90 border-teal-500 text-teal-900 ring-2 ring-teal-500/20 shadow-sm`
                          : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-1 rounded-lg ${isSelected ? 'bg-teal-200/80 text-teal-900' : 'bg-slate-200/70 text-slate-600'}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                      </div>

                      <div>
                        <div className="font-extrabold text-xs text-slate-900 leading-tight">{item.title}</div>
                        <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{item.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center space-x-2 mt-2"
          >
            <span>
              {isLoading
                ? 'Processing Authorization...'
                : mode === 'forgot-password'
                ? 'Send Reset Link'
                : mode === 'signup'
                ? `Provision ${role.toUpperCase()} Account`
                : `Sign In to ${role.toUpperCase()} Portal`}
            </span>
            {mode === 'forgot-password' ? <KeyRound className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>

          {mode === 'forgot-password' && (
            <button
              type="button"
              onClick={() => { setMode('signin'); navigate('/signin'); }}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 pt-1"
            >
              Return to Sign In
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
