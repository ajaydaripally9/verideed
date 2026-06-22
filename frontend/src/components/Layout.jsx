import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Home, FileText, Brain, Map, GitBranch, Settings, LogOut } from 'lucide-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Ajay Devgan"}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'My Deeds', path: '/deeds', icon: FileText },
    { name: 'AI Reports', path: '/upload-deed', icon: Brain },
    { name: 'Property Map', path: '/map', icon: Map },
    { name: 'Ownership Chain', path: '/chain', icon: GitBranch },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-3 px-6 py-6 border-b border-slate-100">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 font-outfit">
              Veri<span className="text-indigo-600">Deed</span>
            </span>
          </div>
 
          {/* Navigation Links */}
          <nav className="mt-8 px-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
 
        {/* User profile & logout */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center space-x-3 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 text-sm font-bold uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-700">{user.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{user.email || 'operator'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
 
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white md:justify-end">
          {/* Logo for mobile only */}
          <div className="flex items-center space-x-2 md:hidden">
            <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <span className="text-sm font-bold text-slate-800 font-outfit">VeriDeed</span>
          </div>
 
          <div className="flex items-center space-x-4">
            {/* Mobile Nav Links */}
            <div className="flex items-center space-x-3 md:hidden">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`p-2 rounded-lg transition-all ${
                      isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
              <button onClick={handleLogout} className="p-2 text-red-500 rounded-lg">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
 
            <div className="h-4 w-px bg-slate-200 hidden md:block" />
            <div className="text-xs text-slate-500 hidden md:block">
              Environment: <span className="text-emerald-600 font-semibold">Active Sandbox</span>
            </div>
          </div>
        </header>
 
        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
