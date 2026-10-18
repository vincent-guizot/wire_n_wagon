import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

import ClientDashboard from './pages/dashboards/ClientDashboard';
import CourierDashboard from './pages/dashboards/CourierDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import SupervisorDashboard from './pages/dashboards/SupervisorDashboard';
import ManagerDashboard from './pages/dashboards/ManagerDashboard';
import OwnerDashboard from './pages/dashboards/OwnerDashboard';

// Auto-resolver for root /dashboard
const DashboardDispatcher = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/dashboard/${user.role}`} replace />;
};

export default function App() {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-serif">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root and Dashboard Redirects */}
          <Route path="/" element={<DashboardDispatcher />} />
          <Route path="/dashboard" element={<DashboardDispatcher />} />

          {/* Role-Protected Dashboards */}
          <Route
            path="/dashboard/client"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/courier"
            element={
              <ProtectedRoute allowedRoles={['courier']}>
                <CourierDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/supervisor"
            element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <SupervisorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/manager"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/owner"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 1900s Footer */}
      <footer className="bg-stone-900 border-t-2 border-amber-900/60 py-4 text-center text-xs text-stone-400 font-mono">
        <div>WIRE & WAGON · EXPEDITION FREIGHT & TELEGRAPH NETWORKS · 1900</div>
        <div className="text-[10px] text-stone-500 mt-1">
          PostgreSQL / MySQL · Sequelize ORM · Passport Auth · Vite & React · Tailwind CSS v4
        </div>
      </footer>
    </div>
  );
}
