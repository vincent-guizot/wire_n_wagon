import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-50 border-2 border-amber-900 rounded shadow-xl p-8 text-center">
        <div className="w-14 h-14 bg-red-100 text-red-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-300">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-stone-900">Restricted Station Area</h2>
        <p className="text-xs font-mono text-red-800 mt-2 uppercase tracking-wider">
          Access Denied: Clearance Insufficient
        </p>
        <p className="text-sm text-stone-600 mt-3 font-serif">
          Your current personnel rank <span className="font-bold text-amber-900">[{user?.role}]</span> does not permit access to this sector manifest.
        </p>

        <div className="mt-6">
          <Link
            to={user ? `/dashboard/${user.role}` : '/login'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-stone-100 text-xs font-bold uppercase tracking-wider rounded transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Authorized Manifest Deck
          </Link>
        </div>
      </div>
    </div>
  );
}
