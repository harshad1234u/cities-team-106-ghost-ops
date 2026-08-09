import { Outlet, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Map as MapIcon, FileText, Activity, Users, Settings, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Map', path: '/admin/map', icon: MapIcon },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Intelligence', path: '/admin/intelligence', icon: Activity },
    { name: 'Engineers', path: '/admin/engineers', icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-white font-bold text-xl tracking-tight">CivoAI Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${active ? 'bg-civic-blue text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="text-xs mb-4 px-2 text-slate-500 truncate" title={user?.email}>{user?.email}</div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white rounded-md w-full transition-colors">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 flex md:hidden items-center justify-between shadow-sm">
          <h1 className="font-bold text-civic-blue">CivoAI Admin</h1>
          <button onClick={handleLogout} className="text-sm text-slate-600">Logout</button>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
