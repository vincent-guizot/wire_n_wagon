import React, { useState, useEffect } from 'react';
import orderService from '../../api/services/orderService';
import vehicleService from '../../api/services/vehicleService';
import accService from '../../api/services/accService';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency } from '../../helpers/formatters';
import { Truck, CheckCircle, RotateCcw, ShieldCheck, DollarSign, Package } from 'lucide-react';

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
        orderService.getOrders(),
        vehicleService.getVehicles(),
        accService.getAnalytics()
      ]);
      setOrders(ordersRes.data);
      setVehicles(vehiclesRes.data);
      setAnalytics(analyticsRes.data);
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
      const res = await accService.managerVehicleAcc(orderId, {
        vehicleId: parseInt(vehicleId, 10),
        price: parseInt(price, 10)
      });
      setSuccess(res.message || 'Vehicle assigned and ACC approved!');
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
      const res = await accService.managerFinalizeAcc(orderId);
      setSuccess(res.message || 'Expedition finalized! Status is now Completed.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to finalize expedition');
    }
  };

  const awaitingVehicleAcc = orders.filter((o) => o.status === 'Payment_Verified');
  const awaitingFinalAcc = orders.filter((o) => o.status === 'Verified');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-serif">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a140d] tracking-wide uppercase drop-shadow-2xs">
          MANAGER EXPEDITION OPERATIONS & TARIFFS
        </h1>
        <div className="flex items-center justify-center gap-3 my-2">
          <div className="h-[1px] w-16 bg-[#caa455]"></div>
          <span className="text-[#caa455] text-xs">❖</span>
          <div className="h-[1px] w-16 bg-[#caa455]"></div>
        </div>
        <p className="text-xs font-mono font-semibold text-[#66533c] uppercase tracking-widest">
          ARMADA ALLOCATION &nbsp;·&nbsp; FREIGHT TARIFFING &nbsp;·&nbsp; EXPEDITION FINALIZATION
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

      {/* Analytics Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#fdfbf6] border-2 border-[#cfc1a5] p-5 rounded-lg shadow-sm" style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}>
            <span className="text-xs font-mono text-[#735e46] uppercase tracking-wider block font-bold">
              Total Revenue (Completed)
            </span>
            <div className="text-2xl font-bold font-heading text-[#784315] mt-1">
              {formatCurrency(analytics.totalRevenue)}
            </div>
            <span className="text-[11px] text-[#85735c] italic">Accumulated freight tariffs</span>
          </div>

          <div className="bg-[#fdfbf6] border-2 border-[#cfc1a5] p-5 rounded-lg shadow-sm" style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}>
            <span className="text-xs font-mono text-[#735e46] uppercase tracking-wider block font-bold">
              Active Manifests in Transit
            </span>
            <div className="text-2xl font-bold font-heading text-[#1b5087] mt-1">
              {analytics.totalActiveOrders}
            </div>
            <span className="text-[11px] text-[#85735c] italic">Excluding Completed & Cancelled</span>
          </div>

          <div className="bg-[#fdfbf6] border-2 border-[#cfc1a5] p-5 rounded-lg shadow-sm" style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}>
            <span className="text-xs font-mono text-[#735e46] uppercase tracking-wider block font-bold">
              Completed Expeditions
            </span>
            <div className="text-2xl font-bold font-heading text-[#136336] mt-1">
              {analytics.totalCompleted}
            </div>
            <span className="text-[11px] text-[#85735c] italic">Successfully signed off</span>
          </div>
        </div>
      )}

      {/* Section 1: Final Audit Sign-Off Queue */}
      <div className="rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-[#0e271f] text-[#ecd89f] border-2 border-[#caa455] p-3 sm:p-3.5 flex items-center justify-between rounded-t-lg shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#ecd89f]" />
            <h2 className="font-heading font-bold text-sm sm:text-base tracking-wider uppercase text-[#fff0c9]">
              FINAL AUDIT SIGN-OFF QUEUE (STATUS: VERIFIED) ({awaitingFinalAcc.length})
            </h2>
          </div>
          <button
            onClick={fetchData}
            className="text-xs font-mono font-bold text-[#ecd89f] hover:text-white flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Operations</span>
          </button>
        </div>

        <div
          className="border-x-2 border-b-2 border-[#cfc1a5] bg-[#fbf9f4] p-5 sm:p-6 rounded-b-lg space-y-4"
          style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}
        >
          {awaitingFinalAcc.length === 0 ? (
            <div className="text-xs font-mono text-[#735e46] italic p-4 bg-white/70 rounded border border-[#dfd4bf]">
              Tidak ada pesanan yang menunggu finalisasi saat ini.
            </div>
          ) : (
            awaitingFinalAcc.map((order) => (
              <div
                key={order.id}
                className="bg-white/95 p-4 rounded-md border-2 border-[#16a34a] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#784315]">{order.receipt_number}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="text-xs text-stone-800 mt-1">
                    <strong>Cargo:</strong> {order.item_name} ({order.weight_kg} kg) | <strong>Tarif:</strong> {formatCurrency(order.price)}
                  </div>
                  <div className="text-xs text-[#735e46] font-mono mt-0.5">
                    Armada: {order.vehicle?.name} | Kurir: {order.courier?.username} | Klien: {order.client?.username}
                  </div>
                </div>

                <button
                  onClick={() => handleFinalizeExpedition(order.id)}
                  className="px-5 py-2.5 bg-gradient-to-b from-[#136336] to-[#0c4023] text-white text-xs font-heading font-bold uppercase tracking-wider rounded border border-[#caa455] shadow flex items-center gap-2 transition cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-[#a7f3d0]" />
                  ACC Finalisasi Ekspedisi
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 2: Armada Assignment & Freight Tariffing */}
      <div className="rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-[#0e271f] text-[#ecd89f] border-2 border-[#caa455] p-3 sm:p-3.5 flex items-center justify-between rounded-t-lg shadow-sm">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-[#ecd89f]" />
            <h2 className="font-heading font-bold text-sm sm:text-base tracking-wider uppercase text-[#fff0c9]">
              ARMADA ALLOCATION & TARIFFING (STATUS: PAYMENT_VERIFIED) ({awaitingVehicleAcc.length})
            </h2>
          </div>
        </div>

        <div
          className="border-x-2 border-b-2 border-[#cfc1a5] bg-[#fbf9f4] p-5 sm:p-6 rounded-b-lg space-y-4"
          style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}
        >
          {awaitingVehicleAcc.length === 0 ? (
            <div className="text-xs font-mono text-[#735e46] italic p-4 bg-white/70 rounded border border-[#dfd4bf]">
              Tidak ada pesanan baru yang menunggu penetapan armada saat ini.
            </div>
          ) : (
            awaitingVehicleAcc.map((order) => (
              <div
                key={order.id}
                className="bg-white/95 p-5 rounded-md border border-[#dfd4bf] shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5dcce] pb-2">
                  <div>
                    <span className="font-mono font-bold text-sm text-[#784315]">{order.receipt_number}</span>
                    <span className="ml-2 text-xs text-[#735e46] font-mono">
                      Merchant: {order.client?.username}
                    </span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#f7f2e7] p-3 rounded border border-[#dfd4bf]">
                  <div>
                    <span className="text-[#735e46] font-mono block">CARGO & WEIGHT</span>
                    <strong>{order.item_name}</strong> ({order.weight_kg} kg)
                  </div>
                  <div>
                    <span className="text-[#735e46] font-mono block">ROUTE TERRITORY</span>
                    <span className="uppercase font-semibold">{order.route_type.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-[#735e46] font-mono block">STATION PATH</span>
                    {order.origin} &rarr; {order.destination}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-[#4d3a24] uppercase tracking-wider mb-1 font-mono">
                      PILIH ARMADA ERA 1900-AN:
                    </label>
                    <select
                      value={selectedVehicle[order.id] || ''}
                      onChange={(e) => {
                        const vId = e.target.value;
                        setSelectedVehicle({ ...selectedVehicle, [order.id]: vId });
                        const v = vehicles.find((item) => item.id === parseInt(vId, 10));
                        if (v && !customPrice[order.id]) {
                          setCustomPrice({ ...customPrice, [order.id]: v.cost_per_km * 50 });
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-[#c5b597] rounded text-xs text-[#241c14] focus:ring-2 focus:ring-[#853c12] font-serif shadow-inner"
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
                    <label className="block text-[11px] font-bold text-[#4d3a24] uppercase tracking-wider mb-1 font-mono">
                      TARIF EKSPEDISI (RP):
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
                      className="w-full px-3 py-1.5 bg-white border border-[#c5b597] rounded text-xs text-[#241c14] focus:ring-2 focus:ring-[#853c12] font-serif shadow-inner"
                    />
                  </div>

                  <div className="sm:self-end">
                    <button
                      onClick={() => handleManagerVehicleAcc(order.id)}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-b from-[#873e16] to-[#59260a] text-[#fff0cf] text-xs font-heading font-bold uppercase tracking-wider rounded border border-[#caa455] shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 text-[#ffd885]" />
                      ACC Kendaraan & Tarif
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
