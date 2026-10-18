import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, User as UserIcon, AlertCircle, Compass } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const newUser = await register(username, email, password);
      navigate(`/dashboard/${newUser.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-50 border-2 border-stone-300 rounded shadow-xl p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 rounded-t"></div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-900 text-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-stone-900">Client Registry Ledger</h2>
          <p className="text-xs font-mono text-stone-600 mt-1 uppercase tracking-widest">
            Wire & Wagon · New Merchant Account
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
              Merchant Username
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
                placeholder="e.g. guild_merchant"
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-amber-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Official Telegraph Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@guild.com"
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-amber-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Cipher Code (Password - Min 6 chars)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                minLength={6}
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
            {isSubmitting ? 'Registering Merchant...' : 'Create Client Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-xs text-amber-900 hover:underline font-serif">
            Already registered? Back to Telegraph Station Sign-In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
