import React, { useState, useEffect } from 'react';
import orderService from '../../api/services/orderService';
import accService from '../../api/services/accService';
import StatusBadge, { ProgressStepper } from '../../components/StatusBadge';
import { formatDate } from '../../helpers/formatters';
import { ROUTE_TYPES } from '../../constants';
import {
  Package,
  PlusCircle,
  CheckCircle,
  RotateCcw,
  Compass,
  Image,
  ArrowRight
} from 'lucide-react';

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

  // Client Receive Proof Modal state
  const [activeProofOrder, setActiveProofOrder] = useState(null);
  const [clientProofUrl, setClientProofUrl] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders();
      setOrders(res.data);
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
      await orderService.createOrder({
        origin,
        destination,
        route_type: routeType,
        item_name: itemName,
        weight_kg: parseInt(weightKg, 10)
      });
      setSuccess('Cargo dispatch order created successfully!');
      setOrigin('');
      setDestination('');
      setItemName('');
      setWeightKg('');
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit dispatch order');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this pending freight order?')) return;
    setError('');
    setSuccess('');

    try {
      await orderService.cancelOrder(orderId);
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
      const res = await accService.clientReceiveAcc(activeProofOrder.id, {
        client_proof_url: clientProofUrl
      });
      setSuccess(res.message || 'Item receipt approved and evidence recorded!');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-serif">
      {/* Page Header matching Uploaded Mockup */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a140d] tracking-wide uppercase drop-shadow-2xs">
          MERCHANT EXPEDITION MANIFEST
        </h1>
        <div className="flex items-center justify-center gap-3 my-2">
          <div className="h-[1px] w-16 bg-[#caa455]"></div>
          <span className="text-[#caa455] text-xs">❖</span>
          <div className="h-[1px] w-16 bg-[#caa455]"></div>
        </div>
        <p className="text-xs font-mono font-semibold text-[#66533c] uppercase tracking-widest">
          DISPATCH CARGO &nbsp;·&nbsp; TRACK TRANSITS &nbsp;·&nbsp; CONFIRM GOODS DELIVERY
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

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: NEW CARGO DISPATCH Form */}
        <div className="lg:col-span-5">
          <div className="rounded-lg shadow-md overflow-hidden">
            {/* Dark green-gold Header */}
            <div className="bg-[#0e271f] text-[#ecd89f] border-2 border-[#caa455] p-3 sm:p-3.5 flex items-center gap-2.5 rounded-t-lg shadow-sm">
              <div className="w-6 h-6 rounded-full border border-[#caa455] flex items-center justify-center bg-[#1d3f33]">
                <Compass className="w-3.5 h-3.5 text-[#ecd89f]" />
              </div>
              <h2 className="font-heading font-bold text-sm sm:text-base tracking-wider uppercase text-[#fff0c9]">
                NEW CARGO DISPATCH
              </h2>
            </div>

            {/* Parchment Form Body */}
            <form
              onSubmit={handleCreateOrder}
              className="border-x-2 border-b-2 border-[#cfc1a5] bg-[#fdfbf6] p-5 sm:p-6 space-y-4 rounded-b-lg"
              style={{
                backgroundImage: `url('/parchment-paper.png')`,
                backgroundSize: 'cover'
              }}
            >
              <div>
                <label className="block text-[11px] font-bold text-[#4d3a24] uppercase tracking-wider mb-1 font-mono">
                  ITEM DESCRIPTION
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Cotton Bales / Brass Gears"
                  className="w-full px-3 py-2 bg-[#ffffff]/90 border border-[#c5b597] rounded text-sm text-[#241c14] focus:ring-2 focus:ring-[#853c12] focus:outline-none shadow-2xs font-serif"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4d3a24] uppercase tracking-wider mb-1 font-mono">
                  WEIGHT (KILOGRAMS)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 bg-[#ffffff]/90 border border-[#c5b597] rounded text-sm text-[#241c14] focus:ring-2 focus:ring-[#853c12] focus:outline-none shadow-2xs font-serif"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4d3a24] uppercase tracking-wider mb-1 font-mono">
                  ROUTE TERRITORY
                </label>
                <select
                  value={routeType}
                  onChange={(e) => setRouteType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#ffffff]/90 border border-[#c5b597] rounded text-sm text-[#241c14] focus:ring-2 focus:ring-[#853c12] focus:outline-none shadow-2xs font-serif"
                >
                  {ROUTE_TYPES.map((rt) => (
                    <option key={rt.value} value={rt.value}>
                      {rt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4d3a24] uppercase tracking-wider mb-1 font-mono">
                  DISPATCH ORIGIN (STASIUN / PASAR ASAL)
                </label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Kota A - Stasiun Pusat"
                  className="w-full px-3 py-2 bg-[#ffffff]/90 border border-[#c5b597] rounded text-sm text-[#241c14] focus:ring-2 focus:ring-[#853c12] focus:outline-none shadow-2xs font-serif"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4d3a24] uppercase tracking-wider mb-1 font-mono">
                  DESTINATION (GUDANG / PELABUHAN TUJUAN)
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Kota B - Pelabuhan Sungai"
                  className="w-full px-3 py-2 bg-[#ffffff]/90 border border-[#c5b597] rounded text-sm text-[#241c14] focus:ring-2 focus:ring-[#853c12] focus:outline-none shadow-2xs font-serif"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-2.5 px-4 bg-gradient-to-b from-[#873e16] to-[#59260a] hover:from-[#9c481a] hover:to-[#6b2e0c] text-[#fff0cf] font-heading font-bold text-xs uppercase tracking-widest rounded border-2 border-[#caa455] shadow-md transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isCreating ? 'Transmitting Manifest...' : 'SUBMIT DISPATCH ORDER'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: ACTIVE EXPEDITIONS & RECEIPTS */}
        <div className="lg:col-span-7">
          <div className="rounded-lg shadow-md overflow-hidden">
            {/* Dark green-gold Header */}
            <div className="bg-[#0e271f] text-[#ecd89f] border-2 border-[#caa455] p-3 sm:p-3.5 flex items-center justify-between rounded-t-lg shadow-sm">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-[#ecd89f]" />
                <h2 className="font-heading font-bold text-sm sm:text-base tracking-wider uppercase text-[#fff0c9]">
                  ACTIVE EXPEDITIONS & RECEIPTS ({orders.length})
                </h2>
              </div>
              <button
                onClick={fetchOrders}
                className="text-xs font-mono font-bold text-[#ecd89f] hover:text-white flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refresh Manifest</span>
              </button>
            </div>

            {/* Parchment Content Body */}
            <div
              className="border-x-2 border-b-2 border-[#cfc1a5] bg-[#fbf9f4] p-5 sm:p-6 space-y-6 rounded-b-lg min-h-[420px]"
              style={{
                backgroundImage: `url('/parchment-paper.png')`,
                backgroundSize: 'cover'
              }}
            >
              {loading ? (
                <div className="p-12 text-center text-[#735e46] font-mono text-sm">
                  Reading Telegraph Records...
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-[#735e46] font-serif italic border-2 border-dashed border-[#cfc1a5] rounded-md">
                  No expeditions currently in the active ledger. Use the dispatch form on the left to register cargo.
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 bg-[#ffffff]/90 border-2 border-[#d5c7ad] rounded-md shadow-xs space-y-4 hover:border-[#b58c42] transition"
                  >
                    {/* Header Row: Resi Tag, Date, Status Pill */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5dcce] pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-[#784315] px-3 py-1 bg-[#fffcf5] border border-[#cca663] rounded shadow-2xs">
                          {order.receipt_number}
                        </span>
                        <span className="text-xs text-[#735e46] font-mono">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Visual Progress Stepper 1-7 */}
                    <ProgressStepper currentStatus={order.status} />

                    {/* Details 2-Column Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs text-[#332619] bg-[#f7f2e7]/80 p-4 rounded border border-[#dfd4bf]">
                      <div className="flex gap-2">
                        <span className="text-[#735e46] w-20">Cargos :</span>
                        <strong className="text-[#1f170e] font-semibold">{order.item_name} ({order.weight_kg} kg)</strong>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#735e46] w-20">Territory :</span>
                        <strong className="uppercase font-semibold text-[#1f170e]">{order.route_type.replace('_', ' ')}</strong>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#735e46] w-20">Origin :</span>
                        <span className="text-[#2b2014]">{order.origin}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#735e46] w-20">Destination :</span>
                        <span className="text-[#2b2014]">{order.destination}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#735e46] w-20">Armada :</span>
                        <span className="text-[#2b2014] font-medium">{order.vehicle ? order.vehicle.name : 'Awaiting Assignment'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#735e46] w-20">Courier :</span>
                        <span className="text-[#2b2014] font-medium">{order.courier ? order.courier.username : 'Awaiting Assignment'}</span>
                      </div>
                    </div>

                    {/* Telegraph Station Note */}
                    {order.issue_notes && (
                      <div className="p-3 bg-[#fff8e7] border-l-4 border-[#d98214] text-[#6e430f] text-xs font-serif leading-relaxed rounded-r shadow-2xs">
                        <strong>Telegraph Station Note:</strong> {order.issue_notes}
                      </div>
                    )}

                    {/* Confirmation Check & Actions Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        {order.is_client_acc ? (
                          <div className="text-[#136336] font-semibold flex items-center gap-1.5">
                            <span className="font-bold text-sm">✓</span>
                            <span>Client Receipt Confirmed (URL Provided)</span>
                          </div>
                        ) : order.status === 'On_Delivery' ? (
                          <div className="text-[#853c12] font-semibold animate-pulse flex items-center gap-1">
                            <span>●</span>
                            <span>Expedition arrived? Input receipt URL & press ACC!</span>
                          </div>
                        ) : (
                          <span className="text-[#735e46] font-mono">
                            Payment: {order.is_paid ? '✓ Paid (Verified)' : '⏳ Unpaid'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {order.status === 'Pending' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-3 py-1.5 text-xs text-[#8c1d18] hover:bg-[#fdeeed] border border-[#f7a29e] rounded font-semibold transition cursor-pointer"
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
                            className="px-4 py-2 bg-gradient-to-b from-[#873e16] to-[#59260a] hover:from-[#9c481a] hover:to-[#6b2e0c] text-[#fff0cf] font-heading font-bold text-xs uppercase tracking-wider rounded border border-[#caa455] shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-[#ffd885]" />
                            ACC Terima Barang
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Proof Submission Modal */}
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
                ACC KONFIRMASI PENERIMAAN
              </h3>
              <p className="text-xs text-[#735e46] font-mono mt-0.5">
                Waybill Manifest: <strong className="text-[#853c12]">{activeProofOrder.receipt_number}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmitClientAcc} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#4d3a24] uppercase tracking-wider mb-1 font-mono">
                  URL Bukti Foto Penerimaan (String URL)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#735e46]">
                    <Image className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    required
                    value={clientProofUrl}
                    onChange={(e) => setClientProofUrl(e.target.value)}
                    placeholder="https://example.com/goods-received-photo.jpg"
                    className="w-full pl-9 pr-3 py-2 bg-white/90 border border-[#c5b597] rounded text-sm text-[#241c14] focus:ring-2 focus:ring-[#853c12] focus:outline-none font-serif shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-[#735e46] mt-1 italic font-serif">
                  Tautkan URL foto fisik barang yang telah sampai di stasiun/gudang tujuan untuk verifikasi ganda.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#d8caba]">
                <button
                  type="button"
                  onClick={() => setActiveProofOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4d3a24] bg-[#ebdcc4] hover:bg-[#decbb1] rounded border border-[#caa455] transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProof}
                  className="px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider bg-gradient-to-b from-[#873e16] to-[#59260a] text-[#fff0cf] rounded border border-[#caa455] shadow transition cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingProof ? 'Transmitting...' : 'Submit Bukti & ACC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
