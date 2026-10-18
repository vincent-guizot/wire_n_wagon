import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import StatusBadge, { ProgressStepper } from '../../components/StatusBadge';
import { Truck, CheckCircle, Image, Compass, AlertCircle } from 'lucide-react';

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
      const res = await api.get('/orders');
      setOrders(res.data.data);
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
      const res = await api.put(`/acc/${activeProofOrder.id}/courier-deliver`, {
        courier_proof_url: courierProofUrl
      });
      setSuccess(res.data.message || 'Delivery completion submitted successfully!');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b-2 border-stone-300 pb-4 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-900">
            Courier Waybill & Delivery Manifest
          </h1>
          <p className="text-sm font-mono text-stone-600 uppercase tracking-widest mt-1">
            Assigned Routes · Transit Fleet Operations · Delivery Sign-Off
          </p>
        </div>
        <button
          onClick={fetchAssignedOrders}
          className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-mono font-bold rounded border border-stone-400 transition self-start"
        >
          ↻ Refresh Route Sheet
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

      {loading ? (
        <div className="p-12 text-center text-stone-500 font-mono text-sm">
          Loading assigned waybill routes...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-stone-50 border-2 border-dashed border-stone-300 rounded font-serif italic text-stone-600">
          No expeditions currently assigned to your route roster. Check back after Supervisor dispatch.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-stone-50 border-2 border-stone-300 rounded shadow p-6 hover:border-amber-800 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-base text-amber-950 px-2.5 py-1 bg-amber-50 border border-amber-300 rounded">
                    {order.receipt_number}
                  </span>
                  <span className="text-xs text-stone-500 font-mono">
                    Assigned: {new Date(order.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <ProgressStepper currentStatus={order.status} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white p-4 rounded border border-stone-200 mt-4">
                <div>
                  <span className="text-stone-500 font-mono block">CARGO SPECIFICATION</span>
                  <strong className="text-stone-900 text-sm">{order.item_name}</strong>
                  <div className="text-stone-600 mt-0.5">Weight: {order.weight_kg} kg · Route: {order.route_type}</div>
                </div>

                <div>
                  <span className="text-stone-500 font-mono block">STATION ROUTE</span>
                  <div className="text-stone-800"><strong>From:</strong> {order.origin}</div>
                  <div className="text-stone-800"><strong>To:</strong> {order.destination}</div>
                </div>

                <div>
                  <span className="text-stone-500 font-mono block">ASSIGNED ARMADA & CLIENT</span>
                  <div className="text-stone-800">
                    <strong>Vehicle:</strong> {order.vehicle ? order.vehicle.name : 'N/A'}
                  </div>
                  <div className="text-stone-800">
                    <strong>Client:</strong> {order.client?.username} ({order.client?.email})
                  </div>
                </div>
              </div>

              {/* Dual Verification State Bar */}
              <div className="mt-4 p-3 bg-stone-100 rounded border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 font-mono">
                  <span>
                    Courier ACC: {order.is_courier_acc ? (
                      <strong className="text-emerald-700">✓ Completed (URL Sent)</strong>
                    ) : (
                      <strong className="text-stone-500">⏳ Pending Upload</strong>
                    )}
                  </span>
                  <span>
                    Client ACC: {order.is_client_acc ? (
                      <strong className="text-emerald-700">✓ Completed</strong>
                    ) : (
                      <strong className="text-amber-800">⏳ Pending Client Receipt</strong>
                    )}
                  </span>
                </div>

                {order.status === 'On_Delivery' && !order.is_courier_acc && (
                  <button
                    onClick={() => {
                      setActiveProofOrder(order);
                      setCourierProofUrl('');
                    }}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-stone-100 font-bold rounded border border-amber-950 shadow flex items-center gap-2 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    ACC Selesai Tugas
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Proof Submission Modal */}
      {activeProofOrder && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-50 border-2 border-amber-900 rounded max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-heading font-bold text-stone-900 mb-2">
              ACC Selesai Pengiriman Kurir
            </h3>
            <p className="text-xs text-stone-600 mb-4 font-mono">
              Waybill: <strong className="text-amber-950">{activeProofOrder.receipt_number}</strong>
            </p>

            <form onSubmit={handleSubmitCourierAcc} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  URL Bukti Foto Serah Terima Kurir
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Image className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    required
                    value={courierProofUrl}
                    onChange={(e) => setCourierProofUrl(e.target.value)}
                    placeholder="https://example.com/courier-handover-photo.jpg"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded text-sm text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1 font-serif">
                  Kirimkan URL foto penyerahan barang di lokasi tujuan untuk verifikasi ganda.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveProofOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold bg-amber-800 hover:bg-amber-900 text-stone-100 rounded border border-amber-950 shadow transition disabled:opacity-50"
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
