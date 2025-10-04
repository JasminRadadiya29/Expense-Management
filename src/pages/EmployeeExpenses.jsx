import React, { useState, useEffect } from 'react';
import { Plus, Upload } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Tesseract from 'tesseract.js';

const EmployeeExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});
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
    if (user?.company.baseCurrency) {
      fetchExchangeRates(user.company.baseCurrency);
    }
  }, [user]);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data.expenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const fetchExchangeRates = async (baseCurrency) => {
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      const data = await response.json();
      setExchangeRates(data.rates);
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;

      const amountMatch = text.match(/\$?(\d+[.,]\d{2})/);
      if (amountMatch) {
        setFormData(prev => ({ ...prev, amount: amountMatch[1].replace(',', '') }));
      }

      const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
      if (dateMatch) {
        const dateParts = dateMatch[1].split(/[\/\-]/);
        const date = new Date(parseInt(dateParts[2]), parseInt(dateParts[0]) - 1, parseInt(dateParts[1]));
        setFormData(prev => ({ ...prev, date: date.toISOString().split('T')[0] }));
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, receiptUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setOcrLoading(false);
    }
  };

  const calculateAmountInBaseCurrency = () => {
    if (!formData.amount || !user?.company.baseCurrency) return 0;

    if (formData.currency === user.company.baseCurrency) {
      return parseFloat(formData.amount);
    }

    const rate = exchangeRates[formData.currency];
    if (rate) {
      return parseFloat(formData.amount) / rate;
    }
    return parseFloat(formData.amount);
  };

  const handleSubmit = async (e, submit = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amountInBaseCurrency = calculateAmountInBaseCurrency();

      const response = await api.post('/expenses', {
        ...formData,
        amount: parseFloat(formData.amount),
        amountInBaseCurrency
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
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating expense');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Draft': 'bg-slate-100 text-slate-700',
      'Waiting Approval': 'bg-yellow-100 text-yellow-700',
      'Approved': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">My Expenses</h1>
            <p className="text-slate-600 mt-1">Submit and track your expenses</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            New Expense
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Paid By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {expenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900">{expense.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{expense.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{expense.paidBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {expense.amount} {expense.currency}
                    {expense.currency !== user?.company.baseCurrency && (
                      <span className="text-xs text-slate-500 block">
                        ({expense.amountInBaseCurrency.toFixed(2)} {user?.company.baseCurrency})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(expense.status)}`}>
                      {expense.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Create Expense</h2>

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Receipt Upload (OCR)</label>
                <div className="border-2 border-dashed border-slate-300 rounded p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={24} className="text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {ocrLoading ? 'Processing...' : 'Click to upload receipt'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paid By</label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Personal">Personal</option>
                  <option value="Company">Company</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-slate-600 text-white py-2 px-4 rounded hover:bg-slate-700 transition disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Submit for Approval
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeExpenses;
