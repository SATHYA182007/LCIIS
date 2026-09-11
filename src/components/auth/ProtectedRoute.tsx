import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400 font-bold text-sm font-sans">
        Verifying authorization...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    if (location.pathname.startsWith('/receptionist')) {
      return <Navigate to="/receptionist/login" replace />;
    }
    return <Navigate to="/signin" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    toast.error(`Access Restricted: Your ${user.role.toUpperCase()} profile is not authorized for this workstation.`);
    
    // Redirect to designated role dashboard
    switch (user.role) {
      case 'receptionist':
        return <Navigate to="/receptionist/dashboard" replace />;
      case 'nurse':
        return <Navigate to="/nurse/dashboard" replace />;
      case 'laboratory':
        return <Navigate to="/laboratory/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'doctor':
      default:
        return <Navigate to="/doctor/dashboard" replace />;
    }
  }

  return children;
};
