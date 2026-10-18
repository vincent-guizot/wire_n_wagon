import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import StatusBadge, { ProgressStepper } from '../../components/StatusBadge';
import { UserCheck, CheckSquare, Eye, Truck, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

export default function SupervisorDashboard() {
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected courier mapping per orderId
  const [selectedCourier, setSelectedCourier] = useState({});

  // Inspection modal state for Waiting_Verification side-by-side view
  const [inspectingOrder, setInspectingOrder] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, couriersRes] = await Promise.all([
        api.get('/orders'),
        api.get('/users?role=courier')
      ]);
      setOrders(ordersRes.data.data);
      setCouriers(couriersRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch supervisor dispatch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignCourier = async (orderId) => {
    const courierId = selectedCourier[orderId];
    if (!courierId) {
      alert('Pilih kurir terlebih dahulu dari dropdown!');
      return;
    }

    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/acc/${orderId}/supervisor-assign`, { courierId });
      setSuccess(res.data.message || 'Courier assigned. Expedition is now On_Delivery!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign courier');
    }
  };

  const handleSupervisorVerify = async (orderId) => {
    setError('');
    setSuccess('');
    setIsVerifying(true);
    try {
      const res = await api.put(`/acc/${orderId}/supervisor-verify`);
      setSuccess(res.data.message || 'Field verification approved! Order is now Verified.');
      setInspectingOrder(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify dual-proof');
    } finally {
      setIsVerifying(false);
    }
  };

  // Group orders for supervisor focus
  const waitingAssignment = orders.filter((o) => o.status === 'Vehicle_Assigned');
  const waitingVerification = orders.filter((o) => o.status === 'Waiting_Verification');
  const otherOrders = orders.filter(
    (o) => o.status !== 'Vehicle_Assigned' && o.status !== 'Waiting_Verification'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b-2 border-stone-300 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-900">
            Supervisor Field Inspection & Dispatch
          </h1>
          <p className="text-sm font-mono text-stone-600 uppercase tracking-widest mt-1">
            Dispatch Couriers · Audit Dual Evidence Photo Proofs · Verify Field Deliveries
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-mono font-bold rounded border border-stone-400 transition self-start"
        >
          ↻ Refresh Dispatch
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

      {/* Section 1: Urgent Dual-ACC Field Verification */}
      <div className="mb-8">
        <div className="bg-amber-50 border-2 border-amber-800 rounded p-5 shadow">
          <h2 className="text-lg font-heading font-bold text-amber-950 flex items-center gap-2 mb-2">
            <CheckSquare className="w-5 h-5 text-amber-900" />
            Dual-Proof Audit Queue (Status: Waiting_Verification) ({waitingVerification.length})
          </h2>
          <p className="text-xs font-serif text-amber-900 mb-4">
            Kedua pihak (Kurir & Klien) telah menekan ACC dan mengunggah URL foto. Tinjau bukti foto berdampingan untuk menyetujui Verifikasi Lapangan.
          </p>

          {waitingVerification.length === 0 ? (
            <div className="text-xs font-mono text-stone-500 italic p-3 bg-white/60 rounded border border-amber-200">
              Saat ini tidak ada pesanan yang menunggu audit verifikasi ganda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {waitingVerification.map((order) => (
                <div key={order.id} className="bg-white p-4 rounded border border-amber-300 shadow-xs">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono font-bold text-sm text-amber-950">{order.receipt_number}</span>
                      <div className="text-xs text-stone-600 font-medium mt-0.5">
                        {order.item_name} ({order.weight_kg} kg) · {order.origin} &rarr; {order.destination}
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded border border-stone-200 text-xs mb-3 space-y-1">
                    <div><strong>Armada:</strong> {order.vehicle?.name}</div>
                    <div><strong>Kurir:</strong> {order.courier?.username}</div>
                    <div><strong>Klien:</strong> {order.client?.username}</div>
                  </div>

                  <button
                    onClick={() => setInspectingOrder(order)}
                    className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-stone-100 text-xs font-bold uppercase tracking-wider rounded border border-amber-950 shadow flex items-center justify-center gap-2 transition"
                  >
                    <Eye className="w-4 h-4" />
                    Review Dual Proof Side-by-Side & ACC
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Assign Courier Queue */}
      <div className="mb-8">
        <div className="bg-stone-50 border-2 border-stone-300 rounded p-5 shadow">
          <h2 className="text-lg font-heading font-bold text-stone-900 flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-amber-800" />
            Courier Assignment Queue (Status: Vehicle_Assigned) ({waitingAssignment.length})
          </h2>
          <p className="text-xs font-serif text-stone-600 mb-4">
            Manager telah menetapkan armada kendaraan. Pilih kurir stasiun dan lakukan dispatch (On_Delivery).
          </p>

          {waitingAssignment.length === 0 ? (
            <div className="text-xs font-mono text-stone-500 italic p-3 bg-white rounded border border-stone-200">
              Tidak ada pesanan yang menunggu penugasan kurir saat ini.
            </div>
          ) : (
            <div className="space-y-4">
              {waitingAssignment.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-4 rounded border border-stone-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-amber-950">{order.receipt_number}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-xs text-stone-700 mt-1">
                      <strong>Cargo:</strong> {order.item_name} ({order.weight_kg} kg) | <strong>Route:</strong> {order.origin} &rarr; {order.destination}
                    </div>
                    <div className="text-xs text-amber-900 font-mono mt-0.5">
                      <strong>Armada Pilihan Manager:</strong> {order.vehicle?.name} (Tarif: Rp {order.price?.toLocaleString()})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCourier[order.id] || ''}
                      onChange={(e) =>
                        setSelectedCourier({ ...selectedCourier, [order.id]: e.target.value })
                      }
                      className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 focus:ring-2 focus:ring-amber-800"
                    >
                      <option value="">-- Pilih Kurir Armada --</option>
                      {couriers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.username} ({c.email})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleAssignCourier(order.id)}
                      className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-stone-100 text-xs font-bold rounded border border-amber-950 shadow flex items-center gap-1 transition whitespace-nowrap"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Assign & Dispatch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: All Other Orders Monitor */}
      <div className="bg-stone-50 border-2 border-stone-300 rounded p-5 shadow">
        <h2 className="text-lg font-heading font-bold text-stone-900 mb-3">
          All Active Fleet & Waybill Manifests ({orders.length})
        </h2>

        <div className="divide-y divide-stone-200">
          {orders.map((order) => (
            <div key={order.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="font-mono">
                <strong>{order.receipt_number}</strong> · {order.item_name} ({order.origin} &rarr; {order.destination})
              </div>
              <div className="flex items-center gap-3">
                <span className="text-stone-500 font-mono">
                  Courier: {order.courier ? order.courier.username : '-'}
                </span>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side Dual Photo Verification Modal */}
      {inspectingOrder && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-stone-50 border-2 border-amber-900 rounded-lg max-w-4xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-stone-300 pb-3 mb-4">
              <div>
                <h3 className="text-xl font-heading font-bold text-stone-900">
                  Dual Evidence Audit (Pemeriksaan Bukti Foto)
                </h3>
                <p className="text-xs font-mono text-stone-600 mt-0.5">
                  Manifest: <strong className="text-amber-950">{inspectingOrder.receipt_number}</strong> | Cargo: {inspectingOrder.item_name}
                </p>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                className="text-stone-500 hover:text-stone-800 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Side-by-Side Photo Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Courier Photo Card */}
              <div className="bg-white p-4 rounded border-2 border-purple-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-900 font-heading">
                    1. Bukti Foto Serah Terima Kurir
                  </span>
                  <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                    Kurir: {inspectingOrder.courier?.username}
                  </span>
                </div>
                <div className="aspect-video bg-stone-100 rounded border border-stone-300 flex items-center justify-center overflow-hidden mb-2">
                  {inspectingOrder.courier_proof_url ? (
                    <img
                      src={inspectingOrder.courier_proof_url}
                      alt="Courier Proof"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <span className="text-xs text-stone-400 italic">No URL provided</span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-stone-600 truncate" title={inspectingOrder.courier_proof_url}>
                  <strong>URL:</strong> {inspectingOrder.courier_proof_url}
                </p>
              </div>

              {/* Client Photo Card */}
              <div className="bg-white p-4 rounded border-2 border-emerald-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-900 font-heading">
                    2. Bukti Foto Penerimaan Klien
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Klien: {inspectingOrder.client?.username}
                  </span>
                </div>
                <div className="aspect-video bg-stone-100 rounded border border-stone-300 flex items-center justify-center overflow-hidden mb-2">
                  {inspectingOrder.client_proof_url ? (
                    <img
                      src={inspectingOrder.client_proof_url}
                      alt="Client Proof"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <span className="text-xs text-stone-400 italic">No URL provided</span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-stone-600 truncate" title={inspectingOrder.client_proof_url}>
                  <strong>URL:</strong> {inspectingOrder.client_proof_url}
                </p>
              </div>
            </div>

            {/* Audit Action Bar */}
            <div className="p-4 bg-amber-50 rounded border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-amber-950 font-serif">
                Dengan menekan ACC Verifikasi Lapangan, Anda memvalidasi keabsahan bukti foto dan mengubah status menjadi <strong className="font-mono">Verified</strong>.
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInspectingOrder(null)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded"
                >
                  Kembali
                </button>

                <button
                  onClick={() => handleSupervisorVerify(inspectingOrder.id)}
                  disabled={isVerifying}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider rounded border border-emerald-950 shadow flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isVerifying ? 'Verifying...' : 'ACC Verifikasi Lapangan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
