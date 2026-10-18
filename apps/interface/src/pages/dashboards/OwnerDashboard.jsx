import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { Compass, Users, Truck, DollarSign, PlusCircle, Trash2, Edit2, ShieldAlert } from 'lucide-react';

export default function OwnerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add vehicle form state
  const [newVehicleName, setNewVehicleName] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('In-City');
  const [newVehicleCapacity, setNewVehicleCapacity] = useState('');
  const [newVehicleCost, setNewVehicleCost] = useState('');

  // Add staff form state
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('password123');
  const [newStaffRole, setNewStaffRole] = useState('courier');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, vehiclesRes, usersRes] = await Promise.all([
        api.get('/acc/analytics'),
        api.get('/vehicles'),
        api.get('/users')
      ]);
      setAnalytics(analyticsRes.data.data);
      setVehicles(vehiclesRes.data.data);
      setUsers(usersRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch proprietor ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/vehicles', {
        name: newVehicleName,
        type: newVehicleType,
        capacity_kg: parseInt(newVehicleCapacity, 10),
        cost_per_km: parseInt(newVehicleCost, 10)
      });
      setSuccess('New armada vehicle commissioned to fleet!');
      setNewVehicleName('');
      setNewVehicleCapacity('');
      setNewVehicleCost('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleToggleVehicleAvailability = async (vehicle) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/vehicles/${vehicle.id}`, {
        is_available: !vehicle.is_available
      });
      setSuccess(`Vehicle ${vehicle.name} status updated.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update vehicle');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Decommission and remove this vehicle from fleet?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/vehicles/${vehicleId}`);
      setSuccess('Vehicle removed from fleet registry.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/users', {
        username: newStaffUsername,
        email: newStaffEmail,
        password: newStaffPassword,
        role: newStaffRole
      });
      setSuccess(`Staff account [${newStaffRole}] created successfully.`);
      setNewStaffUsername('');
      setNewStaffEmail('');
      setNewStaffPassword('password123');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Revoke personnel credentials and delete user ${username}?`)) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/users/${userId}`);
      setSuccess(`User ${username} deleted.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b-2 border-stone-300 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-900">
            Proprietor Executive Ledger & Fleet Registry
          </h1>
          <p className="text-sm font-mono text-stone-600 uppercase tracking-widest mt-1">
            Company Financials · Steam & Rail Fleet Inventory · Personnel Credentials
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-mono font-bold rounded border border-stone-400 transition self-start"
        >
          ↻ Audit Company Records
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-700 text-red-900 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 font-bold">&times;</button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-700 text-emerald-950 text-sm flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-emerald-700 font-bold">&times;</button>
        </div>
      )}

      {/* Financials & Overview */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-amber-900 text-stone-100 p-6 rounded shadow border-2 border-amber-950">
            <span className="text-xs font-mono text-amber-200 uppercase tracking-widest block">
              Treasury Balance (Revenue)
            </span>
            <div className="text-3xl font-heading font-bold text-amber-100 mt-2">
              Rp {analytics.totalRevenue?.toLocaleString()}
            </div>
            <p className="text-xs text-amber-300/80 mt-1 font-serif">
              Cumulative freight tariffs collected from completed deliveries
            </p>
          </div>

          <div className="bg-stone-50 border-2 border-stone-300 p-6 rounded shadow">
            <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block">
              Completed Expeditions
            </span>
            <div className="text-3xl font-heading font-bold text-emerald-900 mt-2">
              {analytics.totalCompleted}
            </div>
            <p className="text-xs text-stone-600 mt-1 font-serif">
              Total successful voyages across all territories
            </p>
          </div>

          <div className="bg-stone-50 border-2 border-stone-300 p-6 rounded shadow">
            <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block">
              Fleet Capacity & Armadas
            </span>
            <div className="text-3xl font-heading font-bold text-stone-900 mt-2">
              {vehicles.length} Units
            </div>
            <p className="text-xs text-stone-600 mt-1 font-serif">
              Active operating locomotives, wagons, carts & boats
            </p>
          </div>
        </div>
      )}

      {/* Grid: Armada Management & Personnel Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Armada Fleet Registry */}
        <div className="bg-stone-50 border-2 border-stone-300 rounded p-6 shadow">
          <h2 className="text-lg font-heading font-bold text-stone-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-800" />
              Armada Fleet Management ({vehicles.length})
            </span>
          </h2>

          {/* Add Vehicle Form */}
          <form onSubmit={handleAddVehicle} className="bg-white p-4 rounded border border-stone-200 mb-6 space-y-3">
            <div className="font-heading font-bold text-xs uppercase tracking-wider text-stone-800">
              Commission New Armada Unit
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={newVehicleName}
                onChange={(e) => setNewVehicleName(e.target.value)}
                placeholder="Unit Name (e.g. Iron Duke 02)"
                className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs"
              />
              <select
                value={newVehicleType}
                onChange={(e) => setNewVehicleType(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs"
              >
                <option value="In-City">In-City (Urban)</option>
                <option value="In-City / Short Inter-City">In-City / Short Inter-City</option>
                <option value="Inter-City">Inter-City (Rail)</option>
                <option value="River / Inter-City">River / Inter-City (Steamship)</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="number"
                required
                min="1"
                value={newVehicleCapacity}
                onChange={(e) => setNewVehicleCapacity(e.target.value)}
                placeholder="Capacity (kg)"
                className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs"
              />
              <input
                type="number"
                required
                min="1"
                value={newVehicleCost}
                onChange={(e) => setNewVehicleCost(e.target.value)}
                placeholder="Cost per km (Rp)"
                className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-amber-800 hover:bg-amber-900 text-stone-100 font-bold text-xs rounded border border-amber-950 shadow"
            >
              + Commission Vehicle
            </button>
          </form>

          {/* Vehicle List */}
          <div className="space-y-3">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white p-3.5 rounded border border-stone-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <strong className="text-stone-900 text-sm font-heading">{v.name}</strong>
                  <div className="text-stone-500 font-mono text-[11px]">
                    {v.type} · Cap: {v.capacity_kg} kg · Rp {v.cost_per_km}/km
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVehicleAvailability(v)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                      v.is_available
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-200 text-stone-600 border border-stone-300'
                    }`}
                  >
                    {v.is_available ? 'Available' : 'In Shop'}
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(v.id)}
                    className="p-1 text-red-700 hover:bg-red-50 rounded"
                    title="Decommission vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Staff Credentials Management */}
        <div className="bg-stone-50 border-2 border-stone-300 rounded p-6 shadow">
          <h2 className="text-lg font-heading font-bold text-stone-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-800" />
              Personnel & Staff Credentials ({users.length})
            </span>
          </h2>

          {/* Add Staff Form */}
          <form onSubmit={handleCreateStaff} className="bg-white p-4 rounded border border-stone-200 mb-6 space-y-3">
            <div className="font-heading font-bold text-xs uppercase tracking-wider text-stone-800">
              Appoint New Station Staff
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={newStaffUsername}
                onChange={(e) => setNewStaffUsername(e.target.value)}
                placeholder="Username (e.g. courier2)"
                className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs"
              />
              <input
                type="email"
                required
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                placeholder="Official Email"
                className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="password"
                required
                value={newStaffPassword}
                onChange={(e) => setNewStaffPassword(e.target.value)}
                placeholder="Password"
                className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs"
              />
              <select
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs"
              >
                <option value="courier">Courier (Kurir Lapangan)</option>
                <option value="admin">Admin (Kasir/Customer Service)</option>
                <option value="supervisor">Supervisor (Inspektur Lapangan)</option>
                <option value="manager">Manager (Kepala Ekspedisi)</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-amber-800 hover:bg-amber-900 text-stone-100 font-bold text-xs rounded border border-amber-950 shadow"
            >
              + Issue Staff Credentials
            </button>
          </form>

          {/* Users List */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-white p-3 rounded border border-stone-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-stone-900">{u.username}</strong>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-100 text-amber-900 font-bold border border-amber-300">
                      {u.role}
                    </span>
                  </div>
                  <span className="text-stone-500 font-mono text-[11px]">{u.email}</span>
                </div>

                {u.role !== 'owner' && (
                  <button
                    onClick={() => handleDeleteUser(u.id, u.username)}
                    className="p-1 text-red-700 hover:bg-red-50 rounded"
                    title="Revoke credentials"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
