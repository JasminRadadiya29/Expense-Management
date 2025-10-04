import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import api from '../services/api';

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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Approvals</h1>
          <p className="text-slate-600 mt-1">Review and approve expense requests</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Request Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {approvals.map((approval) => (
                <tr key={approval._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {approval.expense.employee.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {approval.expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {approval.expense.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {approval.expense.amount} {approval.expense.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-700">
                      {approval.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {approval.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openApprovalModal(approval)}
                          className="text-green-600 hover:text-green-800 flex items-center gap-1"
                        >
                          <Check size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApproval(approval);
                            setShowModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <X size={16} />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {approvals.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No pending approvals
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Review Expense
            </h2>

            <div className="space-y-3 mb-6">
              <div>
                <span className="text-sm font-medium text-slate-700">Employee: </span>
                <span className="text-sm text-slate-900">{selectedApproval.expense.employee.name}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">Description: </span>
                <span className="text-sm text-slate-900">{selectedApproval.expense.description}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">Amount: </span>
                <span className="text-sm text-slate-900">
                  {selectedApproval.expense.amount} {selectedApproval.expense.currency}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">Category: </span>
                <span className="text-sm text-slate-900">{selectedApproval.expense.category}</span>
              </div>
              {selectedApproval.expense.remarks && (
                <div>
                  <span className="text-sm font-medium text-slate-700">Remarks: </span>
                  <span className="text-sm text-slate-900">{selectedApproval.expense.remarks}</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Comments</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add comments (optional)"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleApproval(selectedApproval._id, 'Approved')}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Approve
              </button>
              <button
                onClick={() => handleApproval(selectedApproval._id, 'Rejected')}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <X size={16} />
                Reject
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSelectedApproval(null);
                  setComments('');
                }}
                className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
