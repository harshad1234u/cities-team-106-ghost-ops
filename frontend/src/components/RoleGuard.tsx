import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type AppRole } from '../contexts/AuthContext';

interface RoleGuardProps {
  allowedRoles: AppRole[];
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, redirectTo = '/auth/login' }) => {
  const { role, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    // Redirect based on role if they try to access wrong portal
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'engineer') return <Navigate to="/engineer" replace />;
    return <Navigate to="/citizen" replace />;
  }

  return <Outlet />;
};
