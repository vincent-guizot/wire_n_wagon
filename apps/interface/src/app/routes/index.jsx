import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';

import Login from '../../pages/Login';
import Register from '../../pages/Register';
import Unauthorized from '../../pages/Unauthorized';

import ClientDashboard from '../../pages/dashboards/ClientDashboard';
import CourierDashboard from '../../pages/dashboards/CourierDashboard';
import AdminDashboard from '../../pages/dashboards/AdminDashboard';
import SupervisorDashboard from '../../pages/dashboards/SupervisorDashboard';
import ManagerDashboard from '../../pages/dashboards/ManagerDashboard';
import OwnerDashboard from '../../pages/dashboards/OwnerDashboard';

// Auto-resolver for root and /dashboard redirects
const DashboardDispatcher = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/dashboard/${user.role}`} replace />;
};

// Root App Layout with Navigation and 1900s Victorian Styling
const RootLayout = () => {
  return (
    <div
      className="min-h-screen flex flex-col font-serif bg-[#f5f1ea] text-[#1c140d]"
      style={{
        backgroundImage: `linear-gradient(rgba(245, 241, 234, 0.95), rgba(245, 241, 234, 0.97)), url('/parchment-paper.png')`
      }}
    >
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* 1900s Footer */}
      <footer className="bg-[#0e221b] text-[#c9bfa8] border-t-2 border-[#b58c42] py-4 text-center text-xs font-mono">
        <div className="font-heading tracking-widest text-[#ecd89f] font-bold">
          WIRE & WAGON · EXPEDITION FREIGHT & TELEGRAPH NETWORKS · 1900
        </div>
        <div className="text-[10px] text-[#8e8470] mt-1 font-serif">
          PostgreSQL / SQLite · Sequelize ORM · Passport Auth · Vite & React · Tailwind CSS v4
        </div>
      </footer>
    </div>
  );
};

export const router = createBrowserRouter([
  // Public standalone pages (no navbar needed)
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />
  },

  // Authenticated deck layouts
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DashboardDispatcher />
      },
      {
        path: 'dashboard',
        element: <DashboardDispatcher />
      },
      {
        path: 'dashboard/client',
        element: (
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard/courier',
        element: (
          <ProtectedRoute allowedRoles={['courier']}>
            <CourierDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard/admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard/supervisor',
        element: (
          <ProtectedRoute allowedRoles={['supervisor']}>
            <SupervisorDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard/manager',
        element: (
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard/owner',
        element: (
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);

export default router;
