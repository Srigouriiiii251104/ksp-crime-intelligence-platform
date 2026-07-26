import React, { useState, useEffect } from 'react';
import type { User } from './types.js';
import { Login } from './components/Login.js';
import { Chat } from './components/Chat.js';
import { Dashboard } from './components/Dashboard.js';
import { AuditLog } from './components/AuditLog.js';
import { AccusedList } from './components/AccusedList.js';
import { MapHotspots } from './components/MapHotspots.js';
import { Case360 } from './components/Case360.js';
import { BottleneckAnalytics } from './components/BottleneckAnalytics.js';
import { Shield, MessageSquare, BarChart3, ClipboardList, LogOut, Users, MapPin, Sun, Moon, Layers, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'case360' | 'bottleneck' | 'accused' | 'hotspots' | 'dashboard' | 'audit'>('case360');

  // Theme state: default from localStorage or prefers-color-scheme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ksp-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ksp-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-200">

      {/* Top Banner Navigation Header */}
      <header className="bg-card border-b border-border px-6 py-3.5 flex items-center justify-between shrink-0 shadow-sm transition-colors duration-200">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-primary stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-foreground">KARNATAKA STATE POLICE</h1>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-semibold">Crime Intelligence Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-muted/60 p-1 rounded-xl border border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab('case360')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'case360'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Case 360°
          </button>

          <button
            onClick={() => setActiveTab('bottleneck')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'bottleneck'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Bottleneck Analytics
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Ask KSP Assistant
          </button>

          <button
            onClick={() => setActiveTab('accused')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'accused'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Accused Registry
          </button>

          <button
            onClick={() => setActiveTab('hotspots')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'hotspots'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Spatial Hotspots
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Crime Analytics
          </button>

          {/* Supervisor Audit Tab */}
          {user.role === 'Supervisor' && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Surveillance Audit
            </button>
          )}
        </nav>

        {/* User Card & Actions */}
        <div className="flex items-center gap-3">

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 border border-border text-foreground transition-all active:scale-95 shadow-sm flex items-center justify-center"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 fill-slate-700/20" />
            )}
          </button>

          <div className="text-right hidden md:block">
            <div className="text-xs font-semibold text-foreground">{user.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{user.role} Active</div>
          </div>

          <button
            onClick={() => setUser(null)}
            title="Log Out"
            className="p-2 bg-muted hover:bg-destructive/10 border border-border hover:border-destructive/30 text-muted-foreground hover:text-destructive rounded-xl transition-all active:scale-95 shadow-sm flex items-center justify-center shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* Main Tab Area */}
      <main className="flex-1 min-h-0 relative">
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'case360' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
          <Case360 token={user.token} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'bottleneck' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
          <BottleneckAnalytics token={user.token} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
          <Chat user={user} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'accused' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
          <AccusedList token={user.token} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'hotspots' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
          <MapHotspots token={user.token} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'dashboard' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
          <Dashboard token={user.token} />
        </div>
        {user.role === 'Supervisor' && (
          <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'audit' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
            <AuditLog token={user.token} />
          </div>
        )}
      </main>

    </div>
  );
};

export default App;
