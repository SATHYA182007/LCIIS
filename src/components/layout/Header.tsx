import React, { useState } from 'react';
import { Search, Bell, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { useSidebar } from '../../context/SidebarContext';
import { SearchModal } from '../common/SearchModal';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const { alerts } = useRealtime();
  const { toggleMobileSidebar } = useSidebar();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const newAlertsCount = alerts.filter((a) => a.status === 'NEW').length;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        {/* Left Section: Mobile Menu Toggle, Title & Connection Status */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 text-slate-700 hover:text-teal-800 hover:bg-gray-100 rounded-lg lg:hidden"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">{title}</h1>
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-gray-500 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-emerald-800">Connected</span>
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center space-x-3">
          {/* Cmd+K Search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden sm:inline">Search Patients, Beds, Devices...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-gray-500 bg-white border border-gray-200 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => {
              if (user?.role === 'nurse') navigate('/nurse/alerts');
              else if (user?.role === 'laboratory') navigate('/laboratory/results');
              else if (user?.role === 'admin') navigate('/admin/audit-logs');
              else navigate('/doctor/alerts');
            }}
            className="p-2 text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {newAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {newAlertsCount}
              </span>
            )}
          </button>

          {/* User Profile Dropdown & Logout Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-none">{user?.name}</div>
                <div className="text-[10px] text-gray-500 font-medium capitalize mt-0.5">{user?.role}</div>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl p-2 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="font-bold text-slate-900">{user?.name}</div>
                  <div className="text-[10px] text-gray-500 capitalize">{user?.role} • {user?.department || 'Staff'}</div>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 font-bold rounded-md flex items-center space-x-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
