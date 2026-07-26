import React, { useState } from 'react';
import { Shield, Lock, Mail, AlertCircle, Sun, Moon, Sparkles } from 'lucide-react';
import type { User } from '../types.js';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, theme = 'dark', onToggleTheme }) => {
  const [email, setEmail] = useState('investigator@ksp.gov.in');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fillCredentials = (role: 'Investigator' | 'Supervisor') => {
    if (role === 'Investigator') {
      setEmail('investigator@ksp.gov.in');
    } else {
      setEmail('supervisor@ksp.gov.in');
    }
    setPassword('password123');
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Login failed. Please check credentials.');
      }

      const data = await response.json();
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        token: data.access_token
      };

      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Server error. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">

      {/* Theme Toggle in top right */}
      {onToggleTheme && (
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="absolute top-6 right-6 p-2.5 rounded-xl bg-card border border-border text-foreground transition-all active:scale-95 shadow-md flex items-center justify-center z-20"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700 fill-slate-700/20" />
          )}
        </button>
      )}

      {/* Decorative Background Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-3xl shadow-xl p-8 transition-all">

        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-3 shadow-md">
            <Shield className="w-8 h-8 text-primary stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-bold tracking-wide text-foreground">KARNATAKA STATE POLICE</h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1 tracking-wider uppercase">Crime Intelligence Portal</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-medium rounded-full mt-3">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>KSP Grounded PoC Environment</span>
          </div>
        </div>

        {/* Quick Autofill Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => fillCredentials('Investigator')}
            className={`p-3.5 rounded-xl border text-center transition-all ${
              email === 'investigator@ksp.gov.in'
                ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-sm'
                : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            <span className="block font-semibold text-sm">Investigator</span>
            <span className="text-[10px] opacity-75">Demo Login</span>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('Supervisor')}
            className={`p-3.5 rounded-xl border text-center transition-all ${
              email === 'supervisor@ksp.gov.in'
                ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-sm'
                : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            <span className="block font-semibold text-sm">Supervisor</span>
            <span className="text-[10px] opacity-75">Audit Access</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl mb-6 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Badge Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                placeholder="badge-number@ksp.gov.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-md active:scale-[0.98] transition-all disabled:opacity-50 text-sm mt-6"
          >
            {loading ? 'Authorizing Badge...' : 'Authenticate Access'}
          </button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground mt-6 tracking-wide">
          Authorized personnel only. Activities logged under IT Act SEC-66.
        </p>

      </div>
    </div>
  );
};
