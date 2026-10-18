import React, { useState, useEffect } from 'react';
import orderService from '../../api/services/orderService';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../helpers/formatters';
import { CheckCircle, FileText, Search, RotateCcw, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Issue modal state
  const [activeIssueOrder, setActiveIssueOrder] = useState(null);
  const [issueNotes, setIssueNotes] = useState('');
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders();
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load master orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleVerifyPayment = async (orderId) => {
    setError('');
    setSuccess('');
    try {
      const res = await orderService.verifyPayment(orderId);
      setSuccess(res.message || 'Payment verified successfully!');
      fetchAllOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify payment');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this pending order?')) return;
    setError('');
    setSuccess('');
    try {
      await orderService.cancelOrder(orderId);
      setSuccess('Order marked as Cancelled.');
      fetchAllOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleSaveIssue = async (e) => {
    e.preventDefault();
    if (!activeIssueOrder) return;
    setIsSubmittingIssue(true);
    setError('');
    setSuccess('');

    try {
      await orderService.addIssue(activeIssueOrder.id, issueNotes);
      setSuccess('Station ticket / incident note recorded.');
      setActiveIssueOrder(null);
      setIssueNotes('');
      fetchAllOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save issue note');
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesSearch =
      o.receipt_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.client?.username || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-serif">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a140d] tracking-wide uppercase drop-shadow-2xs">
          STATION ADMINISTRATION & CASHIER LEDGER
        </h1>
        <div className="flex items-center justify-center gap-3 my-2">
          <div className="h-[1px] w-16 bg-[#caa455]"></div>
          <span className="text-[#caa455] text-xs">❖</span>
          <div className="h-[1px] w-16 bg-[#caa455]"></div>
        </div>
        <p className="text-xs font-mono font-semibold text-[#66533c] uppercase tracking-widest">
          PAYMENT VERIFICATION &nbsp;·&nbsp; WAYBILL AUDIT &nbsp;·&nbsp; INCIDENT TICKETS
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

      {/* Filter and Search Bar */}
      <div
        className="border-2 border-[#cfc1a5] bg-[#fbf9f4] rounded-lg p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4"
        style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'Pending', 'Payment_Verified', 'On_Delivery', 'Waiting_Verification', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-xs font-mono rounded transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-gradient-to-b from-[#873e16] to-[#59260a] text-[#fff0cf] font-bold shadow border border-[#caa455]'
                  : 'bg-[#ebdcc4] text-[#4d3a24] hover:bg-[#decbb1] border border-[#d5c7ad]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#735e46]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search receipt / cargo / client..."
            className="w-full pl-9 pr-3 py-1.5 bg-white/90 border border-[#c5b597] rounded text-xs text-[#241c14] focus:outline-none focus:ring-1 focus:ring-[#853c12] font-serif shadow-inner"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#0e271f] text-[#ecd89f] border-2 border-[#caa455] p-3 sm:p-3.5 flex items-center justify-between rounded-t-lg shadow-sm">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-[#ecd89f]" />
            <h2 className="font-heading font-bold text-sm sm:text-base tracking-wider uppercase text-[#fff0c9]">
              MASTER ORDER LEDGER ({filteredOrders.length})
            </h2>
          </div>
          <button
            onClick={fetchAllOrders}
            className="text-xs font-mono font-bold text-[#ecd89f] hover:text-white flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Ledger</span>
          </button>
        </div>

        <div
          className="border-x-2 border-b-2 border-[#cfc1a5] bg-[#fbf9f4] p-5 sm:p-6 rounded-b-lg overflow-x-auto"
          style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}
        >
          <table className="w-full text-left text-xs bg-white/90 border border-[#dfd4bf] rounded-md overflow-hidden">
            <thead className="bg-[#0e271f] text-[#ecd89f] font-heading uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Receipt No.</th>
                <th className="py-3 px-4">Merchant (Client)</th>
                <th className="py-3 px-4">Cargo & Weight</th>
                <th className="py-3 px-4">Route Path</th>
                <th className="py-3 px-4">Status & Payment</th>
                <th className="py-3 px-4">Notes / Issue</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5dcce]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#735e46] font-mono">
                    Auditing Cashier Ledger...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#735e46] italic font-serif">
                    No orders matching selected criteria found in administration records.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fcf8ef] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#784315] whitespace-nowrap">
                      {order.receipt_number}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-900 whitespace-nowrap">
                      {order.client?.username}
                    </td>
                    <td className="py-3.5 px-4 text-stone-800">
                      <strong>{order.item_name}</strong> ({order.weight_kg} kg)
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      <div>{order.origin} &rarr; {order.destination}</div>
                      <span className="text-[10px] uppercase font-mono text-[#8a765d]">
                        {order.route_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="mb-1"><StatusBadge status={order.status} /></div>
                      <div className="text-[11px] font-mono">
                        {order.is_paid ? (
                          <span className="text-[#136336] font-bold">✓ Paid (Verified)</span>
                        ) : (
                          <span className="text-[#853c12] font-bold">⏳ Unpaid</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 max-w-xs">
                      {order.issue_notes ? (
                        <div className="p-1.5 bg-[#fff8e7] border border-[#d98214] rounded text-[11px] text-[#6e430f] font-serif">
                          {order.issue_notes}
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status === 'Pending' && !order.is_paid && (
                          <button
                            onClick={() => handleVerifyPayment(order.id)}
                            className="px-2.5 py-1 bg-gradient-to-b from-[#136336] to-[#0c4023] text-white rounded text-[11px] font-bold flex items-center gap-1 shadow transition cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-[#a7f3d0]" />
                            Verifikasi Bayar
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActiveIssueOrder(order);
                            setIssueNotes(order.issue_notes || '');
                          }}
                          className="px-2.5 py-1 bg-[#ebdcc4] hover:bg-[#decbb1] text-[#4d3a24] rounded text-[11px] font-bold flex items-center gap-1 border border-[#caa455] transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#853c12]" />
                          Catat Kendala
                        </button>

                        {order.status === 'Pending' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-2 py-1 text-[#8c1d18] hover:bg-[#fdeeed] rounded text-[11px] font-bold border border-[#f7a29e] transition cursor-pointer"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Modal */}
      {activeIssueOrder && (
        <div className="fixed inset-0 bg-[#0e1612]/75 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div
            className="bg-[#fdfbf6] border-4 border-[#3d2c1c] rounded-lg max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4"
            style={{ backgroundImage: `url('/parchment-paper.png')`, backgroundSize: 'cover' }}
          >
            <div className="border-b border-[#d8caba] pb-3">
              <h3 className="text-xl font-heading font-bold text-[#21170d] tracking-wide">
                TIKET KENDALA OPERASIONAL
              </h3>
              <p className="text-xs text-[#735e46] font-mono mt-0.5">
                Waybill: <strong className="text-[#853c12]">{activeIssueOrder.receipt_number}</strong>
              </p>
            </div>

            <form onSubmit={handleSaveIssue} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#4d3a24] uppercase tracking-wider mb-1 font-mono">
                  Catatan Komplain / Koreksi Alamat
                </label>
                <textarea
                  rows={4}
                  required
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="e.g. Alamat gudang tujuan dikoreksi ke Dermaga 3. Barang rentan basah."
                  className="w-full px-3 py-2 bg-white/90 border border-[#c5b597] rounded text-sm text-[#241c14] focus:ring-2 focus:ring-[#853c12] focus:outline-none font-serif shadow-inner"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#d8caba]">
                <button
                  type="button"
                  onClick={() => setActiveIssueOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4d3a24] bg-[#ebdcc4] hover:bg-[#decbb1] rounded border border-[#caa455] transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIssue}
                  className="px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider bg-gradient-to-b from-[#873e16] to-[#59260a] text-[#fff0cf] rounded border border-[#caa455] shadow transition cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingIssue ? 'Menyimpan...' : 'Simpan Catatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
