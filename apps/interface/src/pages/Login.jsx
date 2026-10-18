import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, User as UserIcon, AlertCircle, Compass } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(username, password);
      navigate(`/dashboard/${loggedInUser.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (uname) => {
    setUsername(uname);
    setPassword('password123');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-50 border-2 border-stone-300 rounded shadow-xl p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-900 rounded-t"></div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-900 text-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-stone-900">Telegraph Station Gate</h2>
          <p className="text-xs font-mono text-stone-600 mt-1 uppercase tracking-widest">
            Wire & Wagon · Logistics Sign-In
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Username or Registered Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. client1 or admin1@wirewagon.com"
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-amber-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Security Cipher (Password)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-amber-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-amber-800 hover:bg-amber-900 text-stone-100 font-heading font-semibold text-sm rounded border border-amber-950 shadow tracking-wider uppercase transition disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating Cipher...' : 'Enter Expedition Office'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-200">
          <p className="text-xs text-stone-600 text-center mb-3 font-mono font-medium">
            ⚡ Quick-Station Access (Preset Credentials):
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { role: 'client1', label: 'Client' },
              { role: 'courier1', label: 'Courier' },
              { role: 'admin1', label: 'Admin' },
              { role: 'supervisor1', label: 'Supervisor' },
              { role: 'manager1', label: 'Manager' },
              { role: 'owner1', label: 'Owner' }
            ].map(({ role, label }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleQuickLogin(role)}
                className="px-2 py-1 text-[11px] font-mono bg-stone-200 hover:bg-amber-100 hover:border-amber-400 text-stone-800 rounded border border-stone-300 transition text-center"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-stone-500 text-center mt-2 font-mono">
            Default preset cipher: <code className="text-amber-900 font-bold">password123</code>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/register" className="text-xs text-amber-900 hover:underline font-serif">
            New Client? Apply for an Expedition Account &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
