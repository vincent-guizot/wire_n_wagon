import React, { useState, useEffect } from 'react';
import accService from '../../api/services/accService';
import vehicleService from '../../api/services/vehicleService';
import userService from '../../api/services/userService';
import { formatCurrency } from '../../helpers/formatters';
import { Users, Truck, DollarSign, PlusCircle, Trash2, RotateCcw, Crown } from 'lucide-react';

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
        accService.getAnalytics(),
        vehicleService.getVehicles(),
        userService.getUsers()
      ]);
      setAnalytics(analyticsRes.data);
      setVehicles(vehiclesRes.data);
      setUsers(usersRes.data);
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
      await vehicleService.createVehicle({
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
      await vehicleService.updateVehicle(vehicle.id, {
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
      await vehicleService.deleteVehicle(vehicleId);
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
      await userService.createStaff({
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
      await userService.deleteUser(userId);
      setSuccess(`User ${username} deleted.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-serif">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a140d] tracking-wide uppercase drop-shadow-2xs">
          PROPRIETOR EXECUTIVE LEDGER & FLEET
        </h1>
        <div className="flex items-center justify-center gap-3 my-2">
          <div className="h-[1px] w-16 bg-[#caa455]"></div>
          <span className="text-[#caa455] text-xs">❖</span>
          <div className="h-[1px] w-16 bg-[#caa455]"></div>
        </div>
        <p className="text-xs font-mono font-semibold text-[#66533c] uppercase tracking-widest">
          TREASURY REVENUE &nbsp;·&nbsp; FLEET COMMISSIONING &nbsp;·&nbsp; PERSONNEL ROSTER
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#fdf2f2] border-l-4 border-[#8c1d18] text-[#8c1d18] text-xs rounded shadow-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-[#8c1d18] font-bold text-sm cursor-pointer">&times;</button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-[#e6f8ee] border-l-4 border-[#16a34a] text-[#136336] text-xs rounded shadow-xs flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-[#136336] font-bold text-sm cursor-pointer">&times;</button>
        </div>
      )}

      {/* Financials Overview */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#4d240d] text-[#fff0cf] p-6 rounded-lg shadow-md border-2 border-[#b57a2b]">
            <span className="text-xs font-mono text-[#ecd89f] uppercase tracking-widest block font-bold">
              TREASURY BALANCE (REVENUE)
            </span>
            <div className="text-3xl font-heading font-bold text-[#fff3db] mt-2">
              {formatCurrency(analytics.totalRevenue)}
            </div>
            <p className="text-xs text-[#e0cfb8] mt-1 italic">
              Cumulative freight tariffs collected from completed deliveries
            </p>
          </div>

          <div className="bg-[#fdfbf6] border-2 border-[#cfc1a5] p-6 rounded-lg shadow-sm" style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}>
            <span className="text-xs font-mono text-[#735e46] uppercase tracking-widest block font-bold">
              COMPLETED EXPEDITIONS
            </span>
            <div className="text-3xl font-heading font-bold text-[#136336] mt-2">
              {analytics.totalCompleted}
            </div>
            <p className="text-xs text-[#735e46] mt-1 italic">
              Total successful voyages across all territories
            </p>
          </div>

          <div className="bg-[#fdfbf6] border-2 border-[#cfc1a5] p-6 rounded-lg shadow-sm" style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}>
            <span className="text-xs font-mono text-[#735e46] uppercase tracking-widest block font-bold">
              OPERATING FLEET
            </span>
            <div className="text-3xl font-heading font-bold text-[#1c140d] mt-2">
              {vehicles.length} Units
            </div>
            <p className="text-xs text-[#735e46] mt-1 italic">
              Active operating locomotives, wagons, carts & boats
            </p>
          </div>
        </div>
      )}

      {/* Grid: Armada Management & Personnel Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Armada Fleet Registry */}
        <div className="rounded-lg shadow-md overflow-hidden">
          <div className="bg-[#0e271f] text-[#ecd89f] border-2 border-[#caa455] p-3 sm:p-3.5 flex items-center justify-between rounded-t-lg shadow-sm">
            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-[#ecd89f]" />
              <h2 className="font-heading font-bold text-sm sm:text-base tracking-wider uppercase text-[#fff0c9]">
                ARMADA FLEET MANAGEMENT ({vehicles.length})
              </h2>
            </div>
            <button
              onClick={fetchData}
              className="text-xs font-mono font-bold text-[#ecd89f] hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div
            className="border-x-2 border-b-2 border-[#cfc1a5] bg-[#fbf9f4] p-5 sm:p-6 rounded-b-lg space-y-4"
            style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}
          >
            {/* Add Vehicle Form */}
            <form onSubmit={handleAddVehicle} className="bg-white/95 p-4 rounded-md border border-[#dfd4bf] space-y-3">
              <div className="font-heading font-bold text-xs uppercase tracking-wider text-[#3d2d1b]">
                Commission New Armada Unit
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={newVehicleName}
                  onChange={(e) => setNewVehicleName(e.target.value)}
                  placeholder="Unit Name (e.g. Iron Duke 02)"
                  className="px-3 py-1.5 bg-white border border-[#c5b597] rounded text-xs text-[#241c14] focus:ring-2 focus:ring-[#853c12] font-serif shadow-inner"
                />
                <select
                  value={newVehicleType}
                  onChange={(e) => setNewVehicleType(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#c5b597] rounded text-xs text-[#241c14] focus:ring-2 focus:ring-[#853c12] font-serif shadow-inner"
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
                  className="px-3 py-1.5 bg-white border border-[#c5b597] rounded text-xs text-[#241c14] focus:ring-2 focus:ring-[#853c12] font-serif shadow-inner"
                />
                <input
                  type="number"
                  required
                  min="1"
                  value={newVehicleCost}
                  onChange={(e) => setNewVehicleCost(e.target.value)}
                  placeholder="Cost per km (Rp)"
                  className="px-3 py-1.5 bg-white border border-[#c5b597] rounded text-xs text-[#241c14] focus:ring-2 focus:ring-[#853c12] font-serif shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-b from-[#873e16] to-[#59260a] text-[#fff0cf] font-heading font-bold text-xs uppercase tracking-wider rounded border border-[#caa455] shadow transition cursor-pointer"
              >
                + Commission Vehicle
              </button>
            </form>

            {/* Vehicle List */}
            <div className="space-y-3">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="bg-white/95 p-3.5 rounded-md border border-[#dfd4bf] flex items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div>
                    <strong className="text-stone-900 text-sm font-heading">{v.name}</strong>
                    <div className="text-[#735e46] font-mono text-[11px] mt-0.5">
                      {v.type} · Cap: {v.capacity_kg} kg · Rp {v.cost_per_km}/km
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVehicleAvailability(v)}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition cursor-pointer ${
                        v.is_available
                          ? 'bg-[#e6f8ee] text-[#136336] border border-[#7ed49d]'
                          : 'bg-[#ebdcc4] text-[#6b583e] border border-[#cfc3aa]'
                      }`}
                    >
                      {v.is_available ? 'Available' : 'In Shop'}
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="p-1 text-[#8c1d18] hover:bg-[#fdeeed] rounded cursor-pointer"
                      title="Decommission vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Staff Credentials Management */}
        <div className="rounded-lg shadow-md overflow-hidden">
          <div className="bg-[#0e271f] text-[#ecd89f] border-2 border-[#caa455] p-3 sm:p-3.5 flex items-center justify-between rounded-t-lg shadow-sm">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#ecd89f]" />
              <h2 className="font-heading font-bold text-sm sm:text-base tracking-wider uppercase text-[#fff0c9]">
                PERSONNEL CREDENTIALS ({users.length})
              </h2>
            </div>
          </div>

          <div
            className="border-x-2 border-b-2 border-[#cfc1a5] bg-[#fbf9f4] p-5 sm:p-6 rounded-b-lg space-y-4"
            style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}
          >
            {/* Add Staff Form */}
            <form onSubmit={handleCreateStaff} className="bg-white/95 p-4 rounded-md border border-[#dfd4bf] space-y-3">
              <div className="font-heading font-bold text-xs uppercase tracking-wider text-[#3d2d1b]">
                Appoint New Station Staff
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={newStaffUsername}
                  onChange={(e) => setNewStaffUsername(e.target.value)}
                  placeholder="Username (e.g. courier2)"
                  className="px-3 py-1.5 bg-white border border-[#c5b597] rounded text-xs text-[#241c14] focus:ring-2 focus:ring-[#853c12] font-serif shadow-inner"
                />
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="Official Email"
                  className="px-3 py-1.5 bg-white border border-[#c5b597] rounded text-xs text-[#241c14] focus:ring-2 focus:ring-[#853c12] font-serif shadow-inner"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="password"
                  required
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  placeholder="Password"
                  className="px-3 py-1.5 bg-white border border-[#c5b597] rounded text-xs text-[#241c14] focus:ring-2 focus:ring-[#853c12] font-mono shadow-inner"
                />
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#c5b597] rounded text-xs text-[#241c14] focus:ring-2 focus:ring-[#853c12] font-serif shadow-inner"
                >
                  <option value="courier">Courier (Kurir Lapangan)</option>
                  <option value="admin">Admin (Kasir/Customer Service)</option>
                  <option value="supervisor">Supervisor (Inspektur Lapangan)</option>
                  <option value="manager">Manager (Kepala Ekspedisi)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-b from-[#873e16] to-[#59260a] text-[#fff0cf] font-heading font-bold text-xs uppercase tracking-wider rounded border border-[#caa455] shadow transition cursor-pointer"
              >
                + Issue Staff Credentials
              </button>
            </form>

            {/* Users List */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="bg-white/95 p-3 rounded-md border border-[#dfd4bf] flex items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-stone-900">{u.username}</strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#7a4816] text-[#ffd885] font-bold border border-[#b57a2b]">
                        {u.role}
                      </span>
                    </div>
                    <span className="text-[#735e46] font-mono text-[11px] mt-0.5 block">{u.email}</span>
                  </div>

                  {u.role !== 'owner' && (
                    <button
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      className="p-1 text-[#8c1d18] hover:bg-[#fdeeed] rounded cursor-pointer"
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
    </div>
  );
}
