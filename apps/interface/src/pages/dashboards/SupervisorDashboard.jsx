import React, { useState, useEffect } from 'react';
import orderService from '../../api/services/orderService';
import userService from '../../api/services/userService';
import accService from '../../api/services/accService';
import StatusBadge from '../../components/StatusBadge';
import { UserCheck, CheckSquare, Eye, Truck, CheckCircle, RotateCcw } from 'lucide-react';

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
        orderService.getOrders(),
        userService.getUsers('courier')
      ]);
      setOrders(ordersRes.data);
      setCouriers(couriersRes.data);
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
      const res = await accService.supervisorAssignCourier(orderId, { courierId: parseInt(courierId, 10) });
      setSuccess(res.message || 'Courier assigned. Expedition is now On_Delivery!');
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
      const res = await accService.supervisorVerifyAcc(orderId);
      setSuccess(res.message || 'Field verification approved! Order is now Verified.');
      setInspectingOrder(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify dual-proof');
    } finally {
      setIsVerifying(false);
    }
  };

  const waitingAssignment = orders.filter((o) => o.status === 'Vehicle_Assigned');
  const waitingVerification = orders.filter((o) => o.status === 'Waiting_Verification');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-serif">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a140d] tracking-wide uppercase drop-shadow-2xs">
          SUPERVISOR FIELD INSPECTION & DISPATCH
        </h1>
        <div className="flex items-center justify-center gap-3 my-2">
          <div className="h-[1px] w-16 bg-[#caa455]"></div>
          <span className="text-[#caa455] text-xs">❖</span>
          <div className="h-[1px] w-16 bg-[#caa455]"></div>
        </div>
        <p className="text-xs font-mono font-semibold text-[#66533c] uppercase tracking-widest">
          COURIER DISPATCH &nbsp;·&nbsp; DUAL PHOTO AUDIT &nbsp;·&nbsp; FIELD VERIFICATION
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

      {/* Section 1: Side-by-Side Dual-ACC Audit Queue */}
      <div className="rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-[#0e271f] text-[#ecd89f] border-2 border-[#caa455] p-3 sm:p-3.5 flex items-center justify-between rounded-t-lg shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-[#ecd89f]" />
            <h2 className="font-heading font-bold text-sm sm:text-base tracking-wider uppercase text-[#fff0c9]">
              DUAL-PROOF AUDIT QUEUE (STATUS: WAITING_VERIFICATION) ({waitingVerification.length})
            </h2>
          </div>
          <button
            onClick={fetchData}
            className="text-xs font-mono font-bold text-[#ecd89f] hover:text-white flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Manifest</span>
          </button>
        </div>

        <div
          className="border-x-2 border-b-2 border-[#cfc1a5] bg-[#fbf9f4] p-5 sm:p-6 rounded-b-lg"
          style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}
        >
          {waitingVerification.length === 0 ? (
            <div className="text-xs font-mono text-[#735e46] italic p-4 bg-white/70 rounded border border-[#dfd4bf]">
              Saat ini tidak ada pesanan yang menunggu audit verifikasi ganda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {waitingVerification.map((order) => (
                <div key={order.id} className="bg-white/95 p-4 rounded-md border-2 border-[#cca663] shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-sm text-[#784315]">{order.receipt_number}</span>
                      <div className="text-xs text-stone-700 font-medium mt-0.5">
                        {order.item_name} ({order.weight_kg} kg) · {order.origin} &rarr; {order.destination}
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="bg-[#f7f2e7] p-2.5 rounded border border-[#dfd4bf] text-xs space-y-1">
                    <div><strong>Armada:</strong> {order.vehicle?.name}</div>
                    <div><strong>Kurir:</strong> {order.courier?.username}</div>
                    <div><strong>Klien:</strong> {order.client?.username}</div>
                  </div>

                  <button
                    onClick={() => setInspectingOrder(order)}
                    className="w-full py-2 bg-gradient-to-b from-[#873e16] to-[#59260a] text-[#fff0cf] text-xs font-heading font-bold uppercase tracking-wider rounded border border-[#caa455] shadow flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-[#ffd885]" />
                    Review Dual Proof Side-by-Side & ACC
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Assign Courier Queue */}
      <div className="rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-[#0e271f] text-[#ecd89f] border-2 border-[#caa455] p-3 sm:p-3.5 flex items-center justify-between rounded-t-lg shadow-sm">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-[#ecd89f]" />
            <h2 className="font-heading font-bold text-sm sm:text-base tracking-wider uppercase text-[#fff0c9]">
              COURIER ASSIGNMENT QUEUE (STATUS: VEHICLE_ASSIGNED) ({waitingAssignment.length})
            </h2>
          </div>
        </div>

        <div
          className="border-x-2 border-b-2 border-[#cfc1a5] bg-[#fbf9f4] p-5 sm:p-6 rounded-b-lg space-y-4"
          style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}
        >
          {waitingAssignment.length === 0 ? (
            <div className="text-xs font-mono text-[#735e46] italic p-4 bg-white/70 rounded border border-[#dfd4bf]">
              Tidak ada pesanan yang menunggu penugasan kurir saat ini.
            </div>
          ) : (
            waitingAssignment.map((order) => (
              <div
                key={order.id}
                className="bg-white/95 p-4 rounded-md border border-[#dfd4bf] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#784315]">{order.receipt_number}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="text-xs text-stone-800 mt-1">
                    <strong>Cargo:</strong> {order.item_name} ({order.weight_kg} kg) | <strong>Route:</strong> {order.origin} &rarr; {order.destination}
                  </div>
                  <div className="text-xs text-[#853c12] font-mono mt-0.5">
                    <strong>Armada:</strong> {order.vehicle?.name} (Tarif: Rp {order.price?.toLocaleString()})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCourier[order.id] || ''}
                    onChange={(e) =>
                      setSelectedCourier({ ...selectedCourier, [order.id]: e.target.value })
                    }
                    className="px-3 py-1.5 bg-white border border-[#c5b597] rounded text-xs text-[#241c14] focus:ring-2 focus:ring-[#853c12] font-serif shadow-inner"
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
                    className="px-3.5 py-1.5 bg-gradient-to-b from-[#873e16] to-[#59260a] text-[#fff0cf] text-xs font-heading font-bold uppercase tracking-wider rounded border border-[#caa455] shadow flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#ffd885]" />
                    Assign & Dispatch
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Side-by-Side Dual Photo Audit Modal */}
      {inspectingOrder && (
        <div className="fixed inset-0 bg-[#0e1612]/75 backdrop-blur-2xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div
            className="bg-[#fdfbf6] border-4 border-[#3d2c1c] rounded-lg max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-4"
            style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}
          >
            <div className="flex justify-between items-start border-b border-[#d8caba] pb-3">
              <div>
                <h3 className="text-xl font-heading font-bold text-[#21170d] tracking-wide">
                  DUAL EVIDENCE AUDIT (AUDIT BUKTI FOTO)
                </h3>
                <p className="text-xs font-mono text-[#735e46] mt-0.5">
                  Waybill: <strong className="text-[#853c12]">{inspectingOrder.receipt_number}</strong> | Cargo: {inspectingOrder.item_name}
                </p>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                className="text-[#735e46] hover:text-[#21170d] text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Side-by-Side Photo Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded border-2 border-[#b58c42] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#4d3a24] font-heading uppercase">
                    1. Bukti Foto Serah Terima Kurir
                  </span>
                  <span className="text-[10px] font-mono bg-[#f5eeff] text-[#55278c] px-2 py-0.5 rounded font-semibold border border-[#cfb5f5]">
                    Kurir: {inspectingOrder.courier?.username}
                  </span>
                </div>
                <div className="aspect-video bg-stone-100 rounded border border-[#dfd4bf] flex items-center justify-center overflow-hidden mb-2">
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
                <p className="text-[11px] font-mono text-[#735e46] truncate">
                  <strong>URL:</strong> {inspectingOrder.courier_proof_url}
                </p>
              </div>

              <div className="bg-white p-4 rounded border-2 border-[#16a34a] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#136336] font-heading uppercase">
                    2. Bukti Foto Penerimaan Klien
                  </span>
                  <span className="text-[10px] font-mono bg-[#e6f8ee] text-[#136336] px-2 py-0.5 rounded font-semibold border border-[#7ed49d]">
                    Klien: {inspectingOrder.client?.username}
                  </span>
                </div>
                <div className="aspect-video bg-stone-100 rounded border border-[#dfd4bf] flex items-center justify-center overflow-hidden mb-2">
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
                <p className="text-[11px] font-mono text-[#735e46] truncate">
                  <strong>URL:</strong> {inspectingOrder.client_proof_url}
                </p>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="p-4 bg-[#fbf5e6] rounded border border-[#cca663] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#593d1f]">
                Dengan menekan ACC Verifikasi Lapangan, status pesanan beralih menjadi <strong>Verified</strong>.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4d3a24] bg-[#ebdcc4] hover:bg-[#decbb1] rounded border border-[#caa455] cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  onClick={() => handleSupervisorVerify(inspectingOrder.id)}
                  disabled={isVerifying}
                  className="px-5 py-2 bg-gradient-to-b from-[#136336] to-[#0c4023] text-white text-xs font-heading font-bold uppercase tracking-wider rounded border border-[#caa455] shadow flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                >
                  <CheckCircle className="w-4 h-4 text-[#a7f3d0]" />
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
