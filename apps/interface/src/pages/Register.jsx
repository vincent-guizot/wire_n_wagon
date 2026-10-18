import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../app/context/AuthContext';
import { KeyRound, Mail, User, ArrowRight } from 'lucide-react';

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
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-cover bg-center bg-no-repeat font-serif"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 16, 14, 0.5), rgba(8, 12, 10, 0.75)), url('/background.png')`
      }}
    >
      <div
        className="w-full max-w-[480px] bg-[#fdfbf6] text-[#241c14] border-4 border-[#3d2c1c] rounded-lg shadow-2xl p-6 sm:p-8 relative overflow-hidden"
        style={{
          backgroundImage: `url('/parchment-paper.png')`,
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute top-3 right-3 w-16 h-16 pointer-events-none opacity-85">
          <img src="/est-1900-stamp.png" alt="Stamp" className="w-full h-full object-contain filter contrast-125" />
        </div>

        <div className="flex flex-col items-center justify-center mb-5">
          <div className="w-14 h-14 mb-2">
            <img src="/compass.png" alt="Emblem" className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#21170d] tracking-wider text-center">
            CLIENT REGISTRY LEDGER
          </h2>
          <div className="text-[10px] text-[#785b3b] font-mono tracking-widest uppercase font-bold mt-0.5">
            WIRE & WAGON · NEW MERCHANT ACCOUNT
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#fdf2f2] border border-[#f5c2c2] rounded text-[#8b1c1c] text-xs font-serif leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#453421] uppercase tracking-wider mb-1 font-mono">
              MERCHANT USERNAME
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#735e46]">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. guild_merchant"
                className="w-full pl-9 pr-3 py-2 bg-white/90 border border-[#b8a88f] rounded text-sm text-[#241c14] focus:ring-2 focus:ring-[#853c12] focus:outline-none shadow-inner font-serif"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#453421] uppercase tracking-wider mb-1 font-mono">
              OFFICIAL TELEGRAPH EMAIL
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#735e46]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@guild.com"
                className="w-full pl-9 pr-3 py-2 bg-white/90 border border-[#b8a88f] rounded text-sm text-[#241c14] focus:ring-2 focus:ring-[#853c12] focus:outline-none shadow-inner font-serif"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#453421] uppercase tracking-wider mb-1 font-mono">
              CIPHER CODE (PASSWORD - MIN 6 CHARS)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#735e46]">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-white/90 border border-[#b8a88f] rounded text-sm text-[#241c14] focus:ring-2 focus:ring-[#853c12] focus:outline-none shadow-inner font-mono tracking-widest"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-b from-[#873e16] to-[#59260a] hover:from-[#9c481a] hover:to-[#6b2e0c] text-[#fff0cf] font-heading font-bold text-xs uppercase tracking-widest rounded border-2 border-[#b57a2b] shadow-md flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            <span>{isSubmitting ? 'Registering...' : 'CREATE CLIENT ACCOUNT'}</span>
            <ArrowRight className="w-4 h-4 text-[#ffd885]" />
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-[#d8caba] text-center">
          <Link to="/login" className="text-xs text-[#853c12] hover:underline font-serif">
            Already registered? Back to Telegraph Station Sign-In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
