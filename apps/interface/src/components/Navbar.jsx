import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut, User as UserIcon, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-stone-900 text-stone-100 border-b-4 border-amber-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Era Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded bg-amber-800 flex items-center justify-center text-amber-100 shadow border border-amber-600 group-hover:bg-amber-700 transition">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="font-heading font-bold text-lg sm:text-xl text-amber-200 tracking-wider">
                WIRE & WAGON
              </div>
              <div className="text-[10px] text-stone-400 font-mono tracking-widest uppercase">
                EST. 1900 · EXPEDITION & FREIGHT
              </div>
            </div>
          </Link>

          {/* User Status & Navigation */}
          {user ? (
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-block text-xs font-mono text-stone-300">
                  Operated by:
                </span>
                <span className="font-semibold text-stone-100 text-sm">
                  {user.username}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-900/80 text-amber-200 border border-amber-700">
                  {user.role}
                </span>
              </div>

              <Link
                to={`/dashboard/${user.role}`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-stone-800 hover:bg-stone-700 border border-stone-700 transition"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Manifest Deck
              </Link>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-200 transition"
                title="Log Out from Telegraph Station"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-1.5 text-xs font-semibold text-stone-200 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs font-semibold bg-amber-800 hover:bg-amber-700 text-stone-100 rounded border border-amber-700 shadow transition"
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
