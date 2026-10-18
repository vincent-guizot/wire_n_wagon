import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../app/context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-serif bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 16, 14, 0.6), rgba(8, 12, 10, 0.8)), url('/background.png')`
      }}
    >
      <div
        className="w-full max-w-md bg-[#fdfbf6] border-4 border-[#3d2c1c] rounded-lg shadow-2xl p-8 text-center"
        style={{
          backgroundImage: `url('/parchment-paper.png')`,
          backgroundSize: 'cover'
        }}
      >
        <div className="w-14 h-14 bg-[#fdeeed] text-[#8c1d18] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#f7a29e]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-[#1c140d]">RESTRICTED STATION AREA</h2>
        <p className="text-xs font-mono text-[#8c1d18] mt-1 uppercase tracking-wider font-bold">
          ACCESS DENIED: CLEARANCE INSUFFICIENT
        </p>
        <p className="text-sm text-[#4d3a24] mt-3 leading-relaxed">
          Your current personnel rank <strong className="text-[#853c12] font-mono uppercase">[{user?.role}]</strong> does not permit clearance to enter this station sector.
        </p>

        <div className="mt-6">
          <Link
            to={user ? `/dashboard/${user.role}` : '/login'}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-[#873e16] to-[#59260a] text-[#fff0cf] text-xs font-heading font-bold uppercase tracking-wider rounded border-2 border-[#caa455] shadow transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#ffd885]" />
            Return to Authorized Manifest Deck
          </Link>
        </div>
      </div>
    </div>
  );
}
