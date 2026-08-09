import { Outlet, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Map as MapIcon, FileText, Activity, Users, Settings, LogOut, ShieldAlert, Cpu } from 'lucide-react';

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navItems = [
    { name: 'Command Center', path: '/admin', icon: LayoutDashboard },
    { name: 'GIS Map', path: '/admin/map', icon: MapIcon },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'AI Intelligence', path: '/admin/intelligence', icon: Activity },
    { name: 'Engineers', path: '/admin/engineers', icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Dark Command Sidebar */}
      <aside className="w-64 bg-[#0F172A] border-r border-slate-800 text-slate-300 flex-col hidden md:flex shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">CivoAI</h1>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-400 block -mt-1">
                CIVIC COMMAND CENTER
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active 
                    ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700 text-white shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500/30' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
                {item.name === 'AI Intelligence' && (
                  <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    LIVE
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* System Status & User Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="mb-3 px-2 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-300 font-mono">System Online</span>
            </div>
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          </div>

          <div className="text-xs mb-3 px-2 text-slate-400 truncate font-mono" title={user?.email}>
            {user?.email}
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg w-full transition-colors border border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0B132B]">
        {/* Mobile Header */}
        <header className="bg-[#0F172A] border-b border-slate-800 p-4 flex md:hidden items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-white text-base">CivoAI Ops Center</h1>
          </div>
          <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-white">Logout</button>
        </header>

        {/* Main Route Viewport */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
