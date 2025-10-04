import React, { useState, useEffect } from 'react';
import { Plus, Upload, Eye, Calendar, DollarSign, Clock, TrendingUp, X, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

// Mock for demo
const useAuth = () => ({ 
  user: { 
    name: 'John Smith', 
    currency: 'USD',
    company: { baseCurrency: 'USD' }
  } 
});

const api = {
  get: async () => ({
    data: {
      expenses: [
        { _id: '1', description: 'Client Lunch Meeting', date: '2025-10-01', category: 'Food', paidBy: 'Personal', amount: 125.50, currency: 'USD', amountInBaseCurrency: 125.50, status: 'Approved' },
        { _id: '2', description: 'Flight to NYC', date: '2025-10-02', category: 'Travel', paidBy: 'Personal', amount: 450, currency: 'USD', amountInBaseCurrency: 450, status: 'Waiting Approval' },
        { _id: '3', description: 'Office Supplies', date: '2025-10-03', category: 'Office Supplies', paidBy: 'Company', amount: 89.99, currency: 'USD', amountInBaseCurrency: 89.99, status: 'Draft' }
      ]
    }
  }),
  post: async () => ({ data: { expense: { _id: '4' } } })
};

const EmployeeExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    category: 'Travel',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    currency: user?.currency || 'USD',
    paidBy: 'Personal',
    remarks: '',
    receiptUrl: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data.expenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setUploadedFile(file);
    
    setTimeout(() => {
      setFormData(prev => ({ 
        ...prev, 
        amount: '125.50',
        date: '2025-10-04'
      }));
      setOcrLoading(false);
    }, 2000);
  };

  const handleSubmit = async (e, submit = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/expenses', {
        ...formData,
        amount: parseFloat(formData.amount)
      });

      if (submit) {
        await api.post(`/expenses/${response.data.expense._id}/submit`);
      }

      setShowModal(false);
      setFormData({
        description: '',
        category: 'Travel',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        currency: user?.currency || 'USD',
        paidBy: 'Personal',
        remarks: '',
        receiptUrl: ''
      });
      setUploadedFile(null);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating expense');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Draft': 'bg-slate-100 text-slate-700 border-slate-200',
      'Waiting Approval': 'bg-amber-100 text-amber-700 border-amber-200',
      'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || colors['Draft'];
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

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'Waiting Approval').length;
  const approvedExpenses = expenses.filter(e => e.status === 'Approved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
              My Expenses
            </h1>
            <p className="text-slate-600 text-lg">Submit and track your expense reports</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2 hover:scale-105"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            New Expense
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Expenses</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">${totalExpenses.toFixed(2)}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                  <span>All time</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Pending</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">{pendingExpenses}</p>
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
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Approved</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">{approvedExpenses}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <span>Ready to reimburse</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">This Month</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">${totalExpenses.toFixed(2)}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                  <span>October 2025</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Paid By</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50/70 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{expense.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 font-medium">
                        {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 font-medium">{expense.paidBy}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        ${expense.amount.toFixed(2)} {expense.currency}
                      </div>
                      {expense.currency !== user?.company.baseCurrency && (
                        <div className="text-xs text-slate-500 font-medium">
                          (${expense.amountInBaseCurrency.toFixed(2)} {user?.company.baseCurrency})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border-2 ${getStatusBadge(expense.status)}`}>
                        {expense.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {expense.status === 'Waiting Approval' && <Clock className="w-3.5 h-3.5" />}
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {expenses.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No expenses yet</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-8 border-b border-slate-200 rounded-t-3xl">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                  Create Expense
                </h2>
                <p className="text-slate-600 mt-1">Add a new expense to your report</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setUploadedFile(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-slate-500" />
                  Receipt Upload (OCR)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-all bg-gradient-to-br from-slate-50 to-blue-50/30 relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="receipt-upload"
                    disabled={ocrLoading}
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center gap-4">
                    {ocrLoading ? (
                      <>
                        <div className="p-4 bg-blue-100 rounded-2xl">
                          <Loader2 size={32} className="text-blue-600 animate-spin" />
                        </div>
                        <div>
                          <span className="text-base font-bold text-blue-700">Processing receipt...</span>
                          <p className="text-sm text-slate-600 mt-1">Extracting data with AI</p>
                        </div>
                      </>
                    ) : uploadedFile ? (
                      <>
                        <div className="p-4 bg-emerald-100 rounded-2xl">
                          <CheckCircle2 size={32} className="text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-base font-bold text-emerald-700">{uploadedFile.name}</span>
                          <p className="text-sm text-slate-600 mt-1">Data extracted successfully</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-blue-100 rounded-2xl group-hover:scale-110 transition-transform">
                          <Upload size={32} className="text-blue-600" />
                        </div>
                        <div>
                          <span className="text-base font-bold text-slate-700">Click to upload receipt</span>
                          <p className="text-sm text-slate-500 mt-1">AI will extract amount and date automatically</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 font-medium"
                    placeholder="e.g., Client dinner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white font-medium text-slate-900"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Food">Food</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      className="w-full pl-8 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold text-slate-900"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-slate-900"
                    placeholder="USD"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Paid By <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white font-medium text-slate-900"
                >
                  <option value="Personal">Personal</option>
                  <option value="Company">Company</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Remarks (Optional)</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-medium text-slate-900"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                <button
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105"
                >
                  {loading ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
                >
                  {loading ? 'Submitting...' : 'Submit for Approval'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setUploadedFile(null);
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

export default EmployeeExpenses;