import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import {
  Activity,
  Users,
  AlertTriangle,
  FileText,
  FlaskConical,
  Cpu,
  Package,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  UserPlus,
  Search,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isMobileOpen, closeMobileSidebar } = useSidebar();
  const navigate = useNavigate();

  const role = user?.role || 'doctor';

  const receptionistNav = [
    { label: 'Dashboard', path: '/receptionist/dashboard', icon: Activity },
    { label: 'Register Patient', path: '/receptionist/register-patient', icon: UserPlus },
    { label: 'Patients', path: '/receptionist/patients', icon: Users },
    { label: 'Search Patient', path: '/receptionist/search', icon: Search },
  ];

  const doctorNav = [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: Activity },
    { label: 'Patients', path: '/doctor/patients', icon: Users },
    { label: 'Lab Results', path: '/doctor/trends', icon: FlaskConical },
    { label: 'Live Vitals', path: '/doctor/vitals', icon: HeartPulse },
    { label: 'Alerts', path: '/doctor/alerts', icon: AlertTriangle },
    { label: 'Reports', path: '/reports', icon: FileText },
  ];

  const nurseNav = [
    { label: 'Dashboard', path: '/nurse/dashboard', icon: Activity },
    { label: 'Patients', path: '/nurse/patients', icon: Users },
    { label: 'Live Vitals', path: '/nurse/monitoring', icon: HeartPulse },
    { label: 'Alerts', path: '/nurse/alerts', icon: AlertTriangle },
    { label: 'Observations', path: '/nurse/observations', icon: Stethoscope },
    { label: 'Reports', path: '/reports', icon: FileText },
  ];

  const labNav = [
    { label: 'Dashboard', path: '/laboratory/dashboard', icon: Activity },
    { label: 'Patients', path: '/laboratory/patients', icon: Users },
    { label: 'Lab Results', path: '/laboratory/results', icon: FlaskConical },
    { label: 'Reports', path: '/laboratory/reports', icon: FileText },
  ];

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: Activity },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Patients', path: '/admin/patients', icon: ShieldCheck },
    { label: 'Inventory', path: '/admin/inventory', icon: Package },
    { label: 'Devices', path: '/admin/devices', icon: Cpu },
    { label: 'Expiry Center', path: '/admin/expiry', icon: AlertTriangle },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const getNavList = () => {
    switch (role) {
      case 'receptionist': return receptionistNav;
      case 'nurse': return nurseNav;
      case 'laboratory': return labNav;
      case 'admin': return adminNav;
      case 'doctor':
      default: return doctorNav;
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/auth');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed lg:sticky top-0 left-0 z-50 transition-transform duration-200 ease-in-out select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(`/${role}/dashboard`)}>
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm tracking-tight flex items-center">
                LCIIS
              </div>
              <div className="text-[11px] text-gray-500 font-medium">Clinical Monitoring</div>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={closeMobileSidebar}
            className="p-1.5 rounded-lg text-gray-400 hover:text-slate-900 hover:bg-gray-100 lg:hidden"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            {role} Navigation
          </div>
          <nav className="space-y-1">
            {getNavList().map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 font-bold border border-teal-100'
                        : 'text-slate-700 hover:bg-gray-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-teal-700" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-gray-300 opacity-60" />
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Profile & Clean Logout Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-900 truncate">{user?.name}</div>
            <div className="text-[10px] text-teal-700 font-medium capitalize truncate">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          title="Logout"
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center text-xs font-bold"
        >
          <LogOut className="w-4 h-4 mr-1" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
};
