import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import StatusBadge, { ProgressStepper } from '../../components/StatusBadge';
import { Compass, CheckCircle, Truck, DollarSign, BarChart2, ShieldCheck } from 'lucide-react';

export default function ManagerDashboard() {
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Vehicle assignment state per order
  const [selectedVehicle, setSelectedVehicle] = useState({});
  const [customPrice, setCustomPrice] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, vehiclesRes, analyticsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/vehicles'),
        api.get('/acc/analytics')
      ]);
      setOrders(ordersRes.data.data);
      setVehicles(vehiclesRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch manager operations data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManagerVehicleAcc = async (orderId) => {
    const vehicleId = selectedVehicle[orderId];
    const price = customPrice[orderId];

    if (!vehicleId) {
      alert('Pilih armada kendaraan terlebih dahulu!');
      return;
    }
    if (price === undefined || price === '' || isNaN(price) || Number(price) <= 0) {
      alert('Tentukan tarif ekspedisi (price) yang valid!');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await api.put(`/acc/${orderId}/manager-vehicle`, {
        vehicleId: parseInt(vehicleId, 10),
        price: parseInt(price, 10)
      });
      setSuccess(res.data.message || 'Vehicle assigned and ACC approved!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit vehicle ACC');
    }
  };

  const handleFinalizeExpedition = async (orderId) => {
    if (!window.confirm('ACC Finalisasi Ekspedisi ini dan tutup buku order?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await api.put(`/acc/${orderId}/manager-finalize`);
      setSuccess(res.data.message || 'Expedition finalized! Status is now Completed.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to finalize expedition');
    }
  };

  // Filter queues
  const awaitingVehicleAcc = orders.filter((o) => o.status === 'Payment_Verified');
  const awaitingFinalAcc = orders.filter((o) => o.status === 'Verified');
  const completedOrders = orders.filter((o) => o.status === 'Completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b-2 border-stone-300 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-900">
            Manager Expedition Operations & Dispatch
          </h1>
          <p className="text-sm font-mono text-stone-600 uppercase tracking-widest mt-1">
            Armada Allocation · Freight Tariffing · Expedition Finalization (ACC Tutup Buku)
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-mono font-bold rounded border border-stone-400 transition self-start"
        >
          ↻ Refresh Operations
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

      {/* Analytics Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-stone-50 border-2 border-stone-300 p-5 rounded shadow">
            <span className="text-xs font-mono text-stone-500 uppercase tracking-wider block">
              Total Revenue (Completed Expeditions)
            </span>
            <div className="text-2xl font-bold font-heading text-amber-950 mt-1">
              Rp {analytics.totalRevenue?.toLocaleString()}
            </div>
            <span className="text-[11px] text-stone-600 font-serif">Accumulated freight revenue</span>
          </div>

          <div className="bg-stone-50 border-2 border-stone-300 p-5 rounded shadow">
            <span className="text-xs font-mono text-stone-500 uppercase tracking-wider block">
              Active Manifests in Transit
            </span>
            <div className="text-2xl font-bold font-heading text-blue-900 mt-1">
              {analytics.totalActiveOrders}
            </div>
            <span className="text-[11px] text-stone-600 font-serif">Excluding Completed & Cancelled</span>
          </div>

          <div className="bg-stone-50 border-2 border-stone-300 p-5 rounded shadow">
            <span className="text-xs font-mono text-stone-500 uppercase tracking-wider block">
              Completed Waybills
            </span>
            <div className="text-2xl font-bold font-heading text-emerald-900 mt-1">
              {analytics.totalCompleted}
            </div>
            <span className="text-[11px] text-stone-600 font-serif">Successfully signed off</span>
          </div>
        </div>
      )}

      {/* Section 1: Finalize Verified Expeditions (Tutup Buku) */}
      <div className="mb-8">
        <div className="bg-emerald-50 border-2 border-emerald-800 rounded p-5 shadow">
          <h2 className="text-lg font-heading font-bold text-emerald-950 flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-900" />
            Final Audit Sign-Off Queue (Status: Verified) ({awaitingFinalAcc.length})
          </h2>
          <p className="text-xs font-serif text-emerald-950 mb-4">
            Supervisor telah memverifikasi bukti foto di lapangan. Tekan <strong>"ACC Finalisasi Ekspedisi"</strong> untuk menyelesaikan buku besar dan membukukan pendapatan.
          </p>

          {awaitingFinalAcc.length === 0 ? (
            <div className="text-xs font-mono text-stone-500 italic p-3 bg-white/60 rounded border border-emerald-200">
              Tidak ada pesanan yang menunggu finalisasi saat ini.
            </div>
          ) : (
            <div className="space-y-4">
              {awaitingFinalAcc.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-4 rounded border border-emerald-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-emerald-950">{order.receipt_number}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-xs text-stone-700 mt-1">
                      <strong>Cargo:</strong> {order.item_name} ({order.weight_kg} kg) | <strong>Tarif:</strong> Rp {order.price?.toLocaleString()}
                    </div>
                    <div className="text-xs text-stone-600 font-mono mt-0.5">
                      Armada: {order.vehicle?.name} | Kurir: {order.courier?.username} | Klien: {order.client?.username}
                    </div>
                  </div>

                  <button
                    onClick={() => handleFinalizeExpedition(order.id)}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider rounded border border-emerald-950 shadow flex items-center gap-2 transition whitespace-nowrap self-start md:self-auto"
                  >
                    <CheckCircle className="w-4 h-4" />
                    ACC Finalisasi Ekspedisi
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Assign Vehicle & Freight Rate Queue */}
      <div className="mb-8">
        <div className="bg-stone-50 border-2 border-stone-300 rounded p-5 shadow">
          <h2 className="text-lg font-heading font-bold text-stone-900 flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-amber-800" />
            Armada Assignment & Tariffing Queue (Status: Payment_Verified) ({awaitingVehicleAcc.length})
          </h2>
          <p className="text-xs font-serif text-stone-600 mb-4">
            Pembayaran telah diverifikasi oleh Kasir/Admin. Tentukan jenis armada kendaraan era 1900-an dan tetapkan biaya ekspedisi untuk dialihkan ke Supervisor.
          </p>

          {awaitingVehicleAcc.length === 0 ? (
            <div className="text-xs font-mono text-stone-500 italic p-3 bg-white rounded border border-stone-200">
              Tidak ada pesanan baru yang menunggu penetapan armada saat ini.
            </div>
          ) : (
            <div className="space-y-4">
              {awaitingVehicleAcc.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-5 rounded border border-stone-300 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
                    <div>
                      <span className="font-mono font-bold text-sm text-amber-950">{order.receipt_number}</span>
                      <span className="ml-2 text-xs text-stone-500 font-mono">
                        Merchant: {order.client?.username}
                      </span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-3 rounded border border-stone-200">
                    <div>
                      <span className="text-stone-500 font-mono block">CARGO & WEIGHT</span>
                      <strong>{order.item_name}</strong> ({order.weight_kg} kg)
                    </div>
                    <div>
                      <span className="text-stone-500 font-mono block">ROUTE TERRITORY</span>
                      <span className="uppercase font-semibold">{order.route_type.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 font-mono block">STATION PATH</span>
                      {order.origin} &rarr; {order.destination}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        Pilih Armada Era 1900-an:
                      </label>
                      <select
                        value={selectedVehicle[order.id] || ''}
                        onChange={(e) => {
                          const vId = e.target.value;
                          setSelectedVehicle({ ...selectedVehicle, [order.id]: vId });
                          const v = vehicles.find((item) => item.id === parseInt(vId, 10));
                          if (v && !customPrice[order.id]) {
                            // Default estimated price calculation
                            setCustomPrice({ ...customPrice, [order.id]: v.cost_per_km * 50 });
                          }
                        }}
                        className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 focus:ring-2 focus:ring-amber-800"
                      >
                        <option value="">-- Pilih Armada Kendaraan --</option>
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} · {v.type} (Kapasitas: {v.capacity_kg} kg, Biaya: Rp {v.cost_per_km}/km)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-48">
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        Tarif Ekspedisi (Rp):
                      </label>
                      <input
                        type="number"
                        min="1000"
                        step="1000"
                        value={customPrice[order.id] || ''}
                        onChange={(e) =>
                          setCustomPrice({ ...customPrice, [order.id]: e.target.value })
                        }
                        placeholder="e.g. 50000"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900 focus:ring-2 focus:ring-amber-800"
                      />
                    </div>

                    <div className="sm:self-end">
                      <button
                        onClick={() => handleManagerVehicleAcc(order.id)}
                        className="w-full sm:w-auto px-4 py-2 bg-amber-800 hover:bg-amber-900 text-stone-100 text-xs font-bold uppercase tracking-wider rounded border border-amber-950 shadow flex items-center justify-center gap-1.5 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        ACC Kendaraan & Tarif
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: All Manifests Overview */}
      <div className="bg-stone-50 border-2 border-stone-300 rounded p-5 shadow">
        <h2 className="text-lg font-heading font-bold text-stone-900 mb-3">
          Master Expedition Archive ({orders.length} Records)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-200 text-stone-700 font-heading uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Receipt No.</th>
                <th className="py-2.5 px-3">Cargo</th>
                <th className="py-2.5 px-3">Armada Vehicle</th>
                <th className="py-2.5 px-3">Tarif</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-mono font-bold text-amber-950">{o.receipt_number}</td>
                  <td className="py-2 px-3">{o.item_name} ({o.weight_kg} kg)</td>
                  <td className="py-2 px-3">{o.vehicle ? o.vehicle.name : '-'}</td>
                  <td className="py-2 px-3 font-mono">
                    {o.price ? `Rp ${o.price.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-2 px-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
