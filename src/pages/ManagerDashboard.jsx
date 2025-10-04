import React, { useState, useEffect } from 'react';
import { Check, X, DollarSign, Clock, CheckCircle, FileText, User, Calendar, CreditCard, MessageSquare, TrendingUp } from 'lucide-react';

// Mock API for demo
const api = {
  get: async () => ({
    data: {
      approvals: [
        {
          _id: '1',
          status: 'Pending',
          expense: {
            employee: { name: 'Sarah Johnson' },
            description: 'Client Lunch Meeting',
            category: 'Food',
            amount: 125.50,
            currency: 'USD',
            paidBy: 'Personal',
            remarks: 'Met with potential client to discuss Q4 strategy'
          }
        },
        {
          _id: '2',
          status: 'Pending',
          expense: {
            employee: { name: 'Michael Brown' },
            description: 'Flight to NYC',
            category: 'Travel',
            amount: 450,
            currency: 'USD',
            paidBy: 'Company',
            remarks: ''
          }
        }
      ]
    }
  }),
  post: async () => ({ data: {} })
};

const ManagerDashboard = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await api.get('/approvals/pending');
      setApprovals(response.data.approvals);
    } catch (err) {
      console.error('Error fetching approvals:', err);
    }
  };

  const handleApproval = async (approvalId, status) => {
    setLoading(true);
    try {
      await api.post(`/approvals/${approvalId}/process`, { status, comments });
      setShowModal(false);
      setSelectedApproval(null);
      setComments('');
      fetchApprovals();
    } catch (err) {
      alert(err.response?.data?.error || 'Error processing approval');
    } finally {
      setLoading(false);
    }
  };

  const openApprovalModal = (approval) => {
    setSelectedApproval(approval);
    setShowModal(true);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Travel': 'bg-blue-100 text-blue-700 border-blue-200',
      'Food': 'bg-orange-100 text-orange-700 border-orange-200',
      'Office Supplies': 'bg-purple-100 text-purple-700 border-purple-200',
      'Software': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Hardware': 'bg-slate-100 text-slate-700 border-slate-200',
      'Marketing': 'bg-pink-100 text-pink-700 border-pink-200',
      'Other': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category] || colors['Other'];
  };

  const totalAmount = approvals.reduce((sum, a) => sum + (a.expense?.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            Pending Approvals
          </h1>
          <p className="text-slate-600 text-lg">Review and approve expense requests from your team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Pending Approvals</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">{approvals.length}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                  <span>Awaiting review</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Approved Today</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">5</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Processed</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Amount</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">${totalAmount.toFixed(2)}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                  <span>Pending value</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvals.map((approval) => (
                  <tr key={approval._id} className="hover:bg-slate-50/70 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md">
                          {approval.expense.employee.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {approval.expense.employee.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{approval.expense.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 ${getCategoryColor(approval.expense.category)}`}>
                        {approval.expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      ${approval.expense.amount.toFixed(2)} {approval.expense.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border-2 bg-amber-100 text-amber-700 border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        {approval.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {approval.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openApprovalModal(approval)}
                            className="group flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                          >
                            <Check size={16} className="group-hover:scale-110 transition-transform" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApproval(approval);
                              setShowModal(true);
                            }}
                            className="group flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                          >
                            <X size={16} className="group-hover:scale-110 transition-transform" />
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {approvals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                          <CheckCircle className="w-12 h-12 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-900 mb-1">No pending approvals</p>
                          <p className="text-slate-600">All caught up! New requests will appear here.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && selectedApproval && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-200">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-2">
                Review Expense
              </h2>
              <p className="text-slate-600">Review the details and make your decision</p>
            </div>

            <div className="p-8">
              <div className="space-y-6 mb-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {selectedApproval.expense.employee.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">{selectedApproval.expense.employee.name}</p>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <User className="w-3.5 h-3.5" />
                      <span className="font-medium">Employee</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</span>
                    </div>
                    <p className="text-sm text-slate-900 font-semibold">{selectedApproval.expense.description}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Amount</span>
                    </div>
                    <p className="text-sm text-slate-900 font-bold">
                      ${selectedApproval.expense.amount.toFixed(2)} {selectedApproval.expense.currency}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</span>
                    </div>
                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border-2 ${getCategoryColor(selectedApproval.expense.category)}`}>
                      {selectedApproval.expense.category}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Paid By</span>
                    </div>
                    <p className="text-sm text-slate-900 font-semibold">{selectedApproval.expense.paidBy}</p>
                  </div>
                </div>

                {selectedApproval.expense.remarks && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Employee Remarks</span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium">{selectedApproval.expense.remarks}</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-medium text-slate-900"
                  placeholder="Add comments for the employee..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
                <button
                  onClick={() => handleApproval(selectedApproval._id, 'Approved')}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {loading ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleApproval(selectedApproval._id, 'Rejected')}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  {loading ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedApproval(null);
                    setComments('');
                  }}
                  className="px-8 py-3.5 border-2 border-slate-300 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-400 transition-all text-slate-700 hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;