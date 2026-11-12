import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, KeyRound, ArrowRight, UserCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const LoginPage = () => {
  const [email, setEmail] = useState('ops@windops.io');
  const [password, setPassword] = useState('windops123');
  const [rememberMe, setRememberMe] = useState(true);
  const [demoUsers, setDemoUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const loadDemos = async () => {
      try {
        const res = await api.getDemoUsers();
        if (res.success) {
          setDemoUsers(res.data);
        }
      } catch (err) {
        console.warn('Failed to load demo accounts list');
      }
    };
    loadDemos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication rejected. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (demo) => {
    setEmail(demo.email);
    setPassword('windops123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-wind-bg text-white flex flex-col justify-center items-center p-4 relative overflow-hidden radar-grid font-mono">
      {/* Background Decorative Rings */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-neutral-800/80 pointer-events-none" />
      <div className="absolute w-[900px] h-[900px] rounded-full border border-neutral-900/60 pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white text-black font-black text-xl mb-3 shadow-lg">
            W
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">
            WINDOPS CONTROL
          </h1>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">
            Indian Offshore Operations Access Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-wind-panel border border-wind-border p-6 sm:p-8 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-wind-border pb-3 mb-6">
            <span className="text-xs uppercase font-bold text-neutral-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-white" />
              Terminal Authentication
            </span>
            <span className="text-[10px] text-neutral-500 uppercase">
              JWT SHA-256
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block uppercase tracking-wider text-neutral-400 mb-1.5 font-medium">
                Operator Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-wind-bg border border-wind-border p-2.5 text-white font-mono focus:border-white focus:outline-none transition-colors"
                placeholder="operator@windops.io"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="uppercase tracking-wider text-neutral-400 font-medium">
                  Security Passcode
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-[10px] text-neutral-400 hover:text-white transition-colors underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-wind-bg border border-wind-border p-2.5 text-white font-mono focus:border-white focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-400 hover:text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-none bg-wind-bg border-wind-border text-white accent-white cursor-pointer"
                />
                <span>Remember console</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Enter Operations Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Personas Selector */}
          <div className="mt-8 pt-6 border-t border-wind-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
                Quick Demo Personas (Auto-Fill)
              </span>
              <span className="text-[10px] text-neutral-600">PWD: windops123</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {demoUsers.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => handleSelectDemo(d)}
                  className={`p-2 border text-left transition-all ${
                    email === d.email
                      ? 'bg-neutral-800 border-white text-white font-semibold'
                      : 'border-wind-border bg-wind-surface text-neutral-400 hover:text-white hover:border-neutral-500'
                  }`}
                >
                  <div className="truncate font-bold">{d.label.split(' ')[0]}</div>
                  <div className="text-[9px] text-neutral-500 truncate">{d.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs text-neutral-500 hover:text-white transition-colors"
          >
            ← Return to Public Homepage
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-wind-panel border border-wind-border p-6 max-w-sm w-full">
            <h3 className="text-sm font-bold uppercase mb-2">Reset Console Access</h3>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              For operational security, offshore console credentials must be reset via the SCADA Administrator or Field Security Officer.
              <br /><br />
              All pre-seeded demo accounts use the standard verification key: <strong className="text-white">windops123</strong>.
            </p>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2 bg-white text-black font-bold uppercase tracking-wider text-xs"
            >
              Acknowledged
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
