import React, { useState, useEffect } from 'react';
import orderService from '../../api/services/orderService';
import accService from '../../api/services/accService';
import StatusBadge, { ProgressStepper } from '../../components/StatusBadge';
import { formatDate } from '../../helpers/formatters';
import { Truck, CheckCircle, Image, RotateCcw } from 'lucide-react';

export default function CourierDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Proof Modal state
  const [activeProofOrder, setActiveProofOrder] = useState(null);
  const [courierProofUrl, setCourierProofUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders();
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch courier deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const handleSubmitCourierAcc = async (e) => {
    e.preventDefault();
    if (!activeProofOrder) return;
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const res = await accService.courierDeliverAcc(activeProofOrder.id, {
        courier_proof_url: courierProofUrl
      });
      setSuccess(res.message || 'Delivery completion submitted successfully!');
      setActiveProofOrder(null);
      setCourierProofUrl('');
      fetchAssignedOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit courier delivery ACC');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-serif">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a140d] tracking-wide uppercase drop-shadow-2xs">
          COURIER WAYBILL & TRANSIT MANIFEST
        </h1>
        <div className="flex items-center justify-center gap-3 my-2">
          <div className="h-[1px] w-16 bg-[#caa455]"></div>
          <span className="text-[#caa455] text-xs">❖</span>
          <div className="h-[1px] w-16 bg-[#caa455]"></div>
        </div>
        <p className="text-xs font-mono font-semibold text-[#66533c] uppercase tracking-widest">
          ASSIGNED DISPATCHES &nbsp;·&nbsp; FLEET OPERATIONS &nbsp;·&nbsp; DUAL-ACC HANDOVER
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

      {/* Manifest Box */}
      <div className="rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#0e271f] text-[#ecd89f] border-2 border-[#caa455] p-3 sm:p-3.5 flex items-center justify-between rounded-t-lg shadow-sm">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-[#ecd89f]" />
            <h2 className="font-heading font-bold text-sm sm:text-base tracking-wider uppercase text-[#fff0c9]">
              ASSIGNED DISPATCHES ({orders.length})
            </h2>
          </div>
          <button
            onClick={fetchAssignedOrders}
            className="text-xs font-mono font-bold text-[#ecd89f] hover:text-white flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Manifest</span>
          </button>
        </div>

        <div
          className="border-x-2 border-b-2 border-[#cfc1a5] bg-[#fbf9f4] p-5 sm:p-6 space-y-6 rounded-b-lg min-h-[400px]"
          style={{
            backgroundImage: `url('/parchment-paper.png')`,
            backgroundSize: 'cover'
          }}
        >
          {loading ? (
            <div className="p-12 text-center text-[#735e46] font-mono text-sm">
              Retrieving Courier Route Roster...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-[#735e46] font-serif italic border-2 border-dashed border-[#cfc1a5] rounded-md">
              No expeditions currently assigned to your route roster. Check back after Supervisor dispatch.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-5 bg-white/95 border-2 border-[#d5c7ad] rounded-md shadow-xs space-y-4 hover:border-[#b58c42] transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5dcce] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-[#784315] px-3 py-1 bg-[#fffcf5] border border-[#cca663] rounded shadow-2xs">
                      {order.receipt_number}
                    </span>
                    <span className="text-xs text-[#735e46] font-mono">
                      Assigned: {formatDate(order.updatedAt)}
                    </span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <ProgressStepper currentStatus={order.status} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-[#f7f2e7]/80 p-4 rounded border border-[#dfd4bf]">
                  <div>
                    <span className="text-[#735e46] font-mono block mb-1">CARGO SPECIFICATION</span>
                    <strong className="text-stone-900 text-sm font-semibold">{order.item_name}</strong>
                    <div className="text-stone-600 mt-0.5">Weight: {order.weight_kg} kg · Route: {order.route_type}</div>
                  </div>

                  <div>
                    <span className="text-[#735e46] font-mono block mb-1">STATION ROUTE</span>
                    <div><strong>From:</strong> {order.origin}</div>
                    <div><strong>To:</strong> {order.destination}</div>
                  </div>

                  <div>
                    <span className="text-[#735e46] font-mono block mb-1">ASSIGNED ARMADA & CLIENT</span>
                    <div><strong>Armada:</strong> {order.vehicle ? order.vehicle.name : 'N/A'}</div>
                    <div><strong>Merchant:</strong> {order.client?.username} ({order.client?.email})</div>
                  </div>
                </div>

                {/* Dual Verification State Bar */}
                <div className="p-3 bg-[#fffcf5] rounded border border-[#cca663] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 font-mono">
                    <span>
                      Courier ACC:{' '}
                      {order.is_courier_acc ? (
                        <strong className="text-[#136336]">✓ Completed (URL Sent)</strong>
                      ) : (
                        <strong className="text-[#853c12]">⏳ Pending Proof Upload</strong>
                      )}
                    </span>
                    <span>
                      Client ACC:{' '}
                      {order.is_client_acc ? (
                        <strong className="text-[#136336]">✓ Completed</strong>
                      ) : (
                        <strong className="text-stone-500">⏳ Pending Client Receipt</strong>
                      )}
                    </span>
                  </div>

                  {order.status === 'On_Delivery' && !order.is_courier_acc && (
                    <button
                      onClick={() => {
                        setActiveProofOrder(order);
                        setCourierProofUrl('');
                      }}
                      className="px-4 py-2 bg-gradient-to-b from-[#873e16] to-[#59260a] text-[#fff0cf] font-heading font-bold text-xs uppercase tracking-wider rounded border border-[#caa455] shadow flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#ffd885]" />
                      ACC Selesai Tugas
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Proof Modal */}
      {activeProofOrder && (
        <div className="fixed inset-0 bg-[#0e1612]/75 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div
            className="bg-[#fdfbf6] border-4 border-[#3d2c1c] rounded-lg max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4"
            style={{
              backgroundImage: `url('/parchment-paper.png')`,
              backgroundSize: 'cover'
            }}
          >
            <div className="border-b border-[#d8caba] pb-3">
              <h3 className="text-xl font-heading font-bold text-[#21170d] tracking-wide">
                ACC SELESAI PENGIRIMAN KURIR
              </h3>
              <p className="text-xs text-[#735e46] font-mono mt-0.5">
                Waybill: <strong className="text-[#853c12]">{activeProofOrder.receipt_number}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmitCourierAcc} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#4d3a24] uppercase tracking-wider mb-1 font-mono">
                  URL Bukti Foto Serah Terima Kurir
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#735e46]">
                    <Image className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    required
                    value={courierProofUrl}
                    onChange={(e) => setCourierProofUrl(e.target.value)}
                    placeholder="https://example.com/courier-handover-photo.jpg"
                    className="w-full pl-9 pr-3 py-2 bg-white/90 border border-[#c5b597] rounded text-sm text-[#241c14] focus:ring-2 focus:ring-[#853c12] focus:outline-none font-serif shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-[#735e46] mt-1 italic font-serif">
                  Tautkan URL foto penyerahan kargo untuk verifikasi ganda bersama Klien.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#d8caba]">
                <button
                  type="button"
                  onClick={() => setActiveProofOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4d3a24] bg-[#ebdcc4] hover:bg-[#decbb1] rounded border border-[#caa455] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider bg-gradient-to-b from-[#873e16] to-[#59260a] text-[#fff0cf] rounded border border-[#caa455] shadow transition cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit ACC Pengiriman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
