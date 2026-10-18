import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/context/AuthContext';
import { FileText, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-[#0e221b] text-[#ede4d0] border-b-2 border-[#b58c42] shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded bg-[#382613] border border-[#a17638] shadow-inner flex items-center justify-center p-1.5 transition group-hover:border-[#d4a853]">
              <img src="/compass.png" alt="Compass" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div>
              <div className="font-heading font-bold text-lg sm:text-xl text-[#ecd89f] tracking-wider drop-shadow-sm">
                WIRE & WAGON
              </div>
              <div className="text-[10px] text-[#b39b72] font-mono tracking-widest uppercase font-semibold">
                EST. 1900 · EXPEDITION & FREIGHT
              </div>
            </div>
          </Link>

          {/* Right Area: Session Info & Actions */}
          {user ? (
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="flex items-center gap-2">
                <span className="text-[#c2baa8] text-xs sm:text-sm font-serif">
                  Operated by:{' '}
                  <strong className="text-white font-semibold font-mono">{user.username}</strong>
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-[#7a4816] text-[#ffd885] border border-[#b57a2b] shadow-xs">
                  {user.role}
                </span>
              </div>

              <Link
                to={`/dashboard/${user.role}`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#1a2c26] hover:bg-[#253b34] text-[#e8dbb5] border border-[#8f753e] shadow transition"
              >
                <FileText className="w-3.5 h-3.5 text-[#ecd89f]" />
                Manifest Deck
              </Link>

              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#5c1815] hover:bg-[#781f1b] text-[#ffdcd9] border border-[#962e29] shadow transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-bold text-[#ecd89f] hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs font-bold bg-[#7a4816] hover:bg-[#94571b] text-[#ffe8b3] rounded border border-[#b57a2b] shadow transition"
              >
                Client Registration
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
