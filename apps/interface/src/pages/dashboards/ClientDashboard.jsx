import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import StatusBadge, { ProgressStepper } from '../../components/StatusBadge';
import { Package, PlusCircle, CheckCircle, XCircle, Compass, Truck, Image } from 'lucide-react';

export default function ClientDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New Order Form state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routeType, setRouteType] = useState('in_city');
  const [itemName, setItemName] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Client Receive Proof Modal / Input state
  const [activeProofOrder, setActiveProofOrder] = useState(null);
  const [clientProofUrl, setClientProofUrl] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch expedition orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsCreating(true);

    try {
      await api.post('/orders', {
        origin,
        destination,
        route_type: routeType,
        item_name: itemName,
        weight_kg: parseInt(weightKg, 10)
      });
      setSuccess('Expedition manifest created successfully! Awaiting Admin payment verification.');
      setOrigin('');
      setDestination('');
      setItemName('');
      setWeightKg('');
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit order');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this pending freight order?')) return;
    setError('');
    setSuccess('');

    try {
      await api.put(`/orders/${orderId}/cancel`);
      setSuccess('Order cancelled successfully.');
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleSubmitClientAcc = async (e) => {
    e.preventDefault();
    if (!activeProofOrder) return;
    setError('');
    setSuccess('');
    setIsSubmittingProof(true);

    try {
      const res = await api.put(`/acc/${activeProofOrder.id}/client-receive`, {
        client_proof_url: clientProofUrl
      });
      setSuccess(res.data.message || 'Item receipt approved and evidence recorded!');
      setActiveProofOrder(null);
      setClientProofUrl('');
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit receipt confirmation');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b-2 border-stone-300 pb-4 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-900">
            Merchant Expedition Manifest
          </h1>
          <p className="text-sm font-mono text-stone-600 uppercase tracking-widest mt-1">
            Dispatch Cargo · Track Transits · Confirm Goods Delivery
          </p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Create Manifest Form */}
        <div className="lg:col-span-1">
          <div className="bg-stone-50 border-2 border-stone-300 rounded shadow p-6">
            <h2 className="text-lg font-heading font-bold text-stone-900 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-800" />
              New Cargo Dispatch
            </h2>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Cotton Bales / Brass Gears"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-sm text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Weight (Kilograms)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-sm text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Route Territory
                </label>
                <select
                  value={routeType}
                  onChange={(e) => setRouteType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-sm text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none"
                >
                  <option value="in_city">In-City Freight (Sepeda / Gerobak / Truk Uap)</option>
                  <option value="inter_city">Inter-City Line (Lokomotif / Kapal Uap)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Dispatch Origin (Stasiun / Pasar Asal)
                </label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Kota A - Stasiun Pusat"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-sm text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Destination (Gudang / Pelabuhan Tujuan)
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Kota B - Pelabuhan Sungai"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-sm text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-stone-100 font-heading font-semibold text-xs uppercase tracking-wider rounded border border-amber-950 shadow transition disabled:opacity-50"
              >
                {isCreating ? 'Transmitting Manifest...' : 'Submit Dispatch Order'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Active Expeditions List */}
        <div className="lg:col-span-2">
          <div className="bg-stone-50 border-2 border-stone-300 rounded shadow p-6">
            <h2 className="text-lg font-heading font-bold text-stone-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-800" />
                Active Expeditions & Receipts ({orders.length})
              </span>
              <button
                onClick={fetchOrders}
                className="text-xs font-mono font-bold text-amber-900 hover:underline"
              >
                ↻ Refresh Manifest
              </button>
            </h2>

            {loading ? (
              <div className="p-8 text-center text-stone-500 font-mono text-sm">
                Reading Telegraph Records...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-stone-500 font-serif italic border border-dashed border-stone-300 rounded">
                No expeditions logged yet. Use the dispatch form to book cargo transport.
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 bg-white border border-stone-300 rounded shadow-sm hover:border-amber-700 transition"
                  >
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3 mb-3">
                      <div>
                        <span className="font-mono font-bold text-sm text-amber-950 px-2 py-0.5 bg-amber-50 border border-amber-300 rounded">
                          {order.receipt_number}
                        </span>
                        <span className="ml-2 text-xs text-stone-500 font-mono">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Progress Stepper */}
                    <ProgressStepper currentStatus={order.status} />

                    {/* Route Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-3 bg-stone-50 p-3 rounded border border-stone-200">
                      <div>
                        <span className="text-stone-500 font-mono">Cargo:</span>{' '}
                        <strong className="text-stone-800">{order.item_name} ({order.weight_kg} kg)</strong>
                      </div>
                      <div>
                        <span className="text-stone-500 font-mono">Territory:</span>{' '}
                        <span className="uppercase font-semibold">{order.route_type.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 font-mono">Origin:</span>{' '}
                        <span>{order.origin}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 font-mono">Destination:</span>{' '}
                        <span>{order.destination}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 font-mono">Armada:</span>{' '}
                        <span>{order.vehicle ? order.vehicle.name : 'Awaiting Assignment'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 font-mono">Courier:</span>{' '}
                        <span>{order.courier ? order.courier.username : 'Awaiting Assignment'}</span>
                      </div>
                    </div>

                    {/* Issue notes if present */}
                    {order.issue_notes && (
                      <div className="mt-3 p-2 bg-amber-50 border-l-2 border-amber-600 text-amber-900 text-xs">
                        <strong>Telegraph Station Note:</strong> {order.issue_notes}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs font-mono">
                        {order.is_client_acc ? (
                          <span className="text-emerald-800 font-semibold flex items-center gap-1">
                            ✓ Client Receipt Confirmed (URL Provided)
                          </span>
                        ) : order.status === 'On_Delivery' ? (
                          <span className="text-amber-800 font-semibold animate-pulse">
                            • Expedition arrived? Submit proof to ACC Receipt!
                          </span>
                        ) : (
                          <span className="text-stone-500">
                            Payment: {order.is_paid ? '✓ Paid' : '⏳ Unpaid'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {order.status === 'Pending' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 border border-red-300 rounded font-semibold transition"
                          >
                            Cancel Manifest
                          </button>
                        )}

                        {order.status === 'On_Delivery' && !order.is_client_acc && (
                          <button
                            onClick={() => {
                              setActiveProofOrder(order);
                              setClientProofUrl('');
                            }}
                            className="px-4 py-1.5 text-xs font-bold bg-amber-800 hover:bg-amber-900 text-stone-100 rounded border border-amber-950 shadow flex items-center gap-1.5 transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            ACC Terima Barang
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proof Submission Modal */}
      {activeProofOrder && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-50 border-2 border-amber-900 rounded-lg max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-heading font-bold text-stone-900 mb-2">
              ACC Konfirmasi Penerimaan Barang
            </h3>
            <p className="text-xs text-stone-600 mb-4 font-mono">
              Manifest: <strong className="text-amber-950">{activeProofOrder.receipt_number}</strong>
            </p>

            <form onSubmit={handleSubmitClientAcc} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  URL Bukti Foto Penerimaan (String URL)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Image className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    required
                    value={clientProofUrl}
                    onChange={(e) => setClientProofUrl(e.target.value)}
                    placeholder="https://example.com/receipt-photo.jpg"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded text-sm text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1 font-serif">
                  Masukkan tautan URL foto barang yang telah diterima di stasiun tujuan.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveProofOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded transition"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProof}
                  className="px-4 py-2 text-xs font-bold bg-amber-800 hover:bg-amber-900 text-stone-100 rounded border border-amber-950 shadow transition disabled:opacity-50"
                >
                  {isSubmittingProof ? 'Transmitting...' : 'Submit ACC & Bukti'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
