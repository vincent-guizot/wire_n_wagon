import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import StatusBadge from '../../components/StatusBadge';
import { Shield, CheckCircle, AlertTriangle, FileText, Search, XCircle } from 'lucide-react';

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
      const res = await api.get('/orders');
      setOrders(res.data.data);
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
      const res = await api.put(`/orders/${orderId}/verify-payment`);
      setSuccess(res.data.message || 'Payment verified successfully!');
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
      const res = await api.put(`/orders/${orderId}/cancel`);
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
      const res = await api.put(`/orders/${activeIssueOrder.id}/issue`, {
        issue_notes: issueNotes
      });
      setSuccess('Station ticket / issue note recorded.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b-2 border-stone-300 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-900">
            Station Administration & Payment Ledger
          </h1>
          <p className="text-sm font-mono text-stone-600 uppercase tracking-widest mt-1">
            Cashier Verification · Address Corrections · Incident Notes
          </p>
        </div>
        <button
          onClick={fetchAllOrders}
          className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-mono font-bold rounded border border-stone-400 transition self-start"
        >
          ↻ Refresh Ledger
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

      {/* Filter and Search Bar */}
      <div className="bg-stone-50 border-2 border-stone-300 rounded p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Pending', 'Payment_Verified', 'On_Delivery', 'Waiting_Verification', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-xs font-mono rounded transition ${
                filterStatus === st
                  ? 'bg-amber-800 text-stone-100 font-bold shadow'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search receipt / cargo / client..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-stone-50 border-2 border-stone-300 rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-200 border-b border-stone-300 text-stone-700 font-heading uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Receipt No.</th>
                <th className="py-3 px-4">Merchant (Client)</th>
                <th className="py-3 px-4">Cargo & Weight</th>
                <th className="py-3 px-4">Route Path</th>
                <th className="py-3 px-4">Status & Payment</th>
                <th className="py-3 px-4">Notes / Issue</th>
                <th className="py-3 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500 font-mono">
                    Inspecting ledger pages...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500 italic font-serif">
                    No orders matching selected criteria found in administration records.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-amber-950 whitespace-nowrap">
                      {order.receipt_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-800 whitespace-nowrap">
                      {order.client?.username}
                    </td>
                    <td className="py-3 px-4 text-stone-700">
                      <strong>{order.item_name}</strong> ({order.weight_kg} kg)
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      <div>{order.origin} &rarr; {order.destination}</div>
                      <span className="text-[10px] uppercase font-mono text-stone-400">
                        {order.route_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="mb-1"><StatusBadge status={order.status} /></div>
                      <div className="text-[11px] font-mono">
                        {order.is_paid ? (
                          <span className="text-emerald-700 font-bold">✓ Paid (Verified)</span>
                        ) : (
                          <span className="text-amber-800 font-bold">⏳ Unpaid</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600 max-w-xs">
                      {order.issue_notes ? (
                        <div className="p-1.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-950 font-serif">
                          {order.issue_notes}
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'Pending' && !order.is_paid && (
                          <button
                            onClick={() => handleVerifyPayment(order.id)}
                            className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow transition"
                            title="Verify Client Payment"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Verifikasi Pembayaran
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActiveIssueOrder(order);
                            setIssueNotes(order.issue_notes || '');
                          }}
                          className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded text-[11px] font-bold flex items-center gap-1 border border-stone-300 transition"
                          title="Record Issue / Incident Note"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Catat Kendala
                        </button>

                        {order.status === 'Pending' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-2 py-1 text-red-700 hover:bg-red-50 rounded text-[11px] font-bold border border-red-300 transition"
                            title="Cancel Order"
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

      {/* Issue Note Modal */}
      {activeIssueOrder && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-50 border-2 border-stone-400 rounded max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-heading font-bold text-stone-900 mb-2">
              Tiket Komplain / Catatan Kendala
            </h3>
            <p className="text-xs text-stone-600 mb-4 font-mono">
              Order: <strong className="text-amber-950">{activeIssueOrder.receipt_number}</strong>
            </p>

            <form onSubmit={handleSaveIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Catatan Komplain / Koreksi Alamat
                </label>
                <textarea
                  rows={4}
                  required
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="e.g. Alamat gudang tujuan dikoreksi ke Dermaga 3. Barang rentan basah."
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-sm text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveIssueOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded transition"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIssue}
                  className="px-4 py-2 text-xs font-bold bg-amber-800 hover:bg-amber-900 text-stone-100 rounded border border-amber-950 shadow transition disabled:opacity-50"
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
