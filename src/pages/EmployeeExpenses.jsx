import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Plus, Upload, Eye, Calendar, DollarSign, Clock, TrendingUp, X, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const EmployeeExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionError, setConversionError] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    category: 'Travel',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    currency: user?.currency || 'USD',
    amountInBaseCurrency: '',
    paidBy: 'Personal',
    remarks: '',
    receiptUrl: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    // Auto-convert when amount or currency changes
    if (formData.amount && formData.currency && user?.company?.baseCurrency) {
      if (formData.currency === user.company.baseCurrency) {
        // No conversion needed
        const amount = parseFloat(formData.amount);
        setFormData(prev => ({
          ...prev,
          amountInBaseCurrency: amount
        }));
        setConvertedAmount(amount);
        setExchangeRate(1);
        setConversionError(null);
      } else {
        // Convert currency
        convertCurrency(formData.amount, formData.currency, user.company.baseCurrency);
      }
    }
  }, [formData.amount, formData.currency]);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data.expenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    if (!amount || amount <= 0) {
      setConvertedAmount(null);
      setExchangeRate(null);
      return;
    }

    setConversionLoading(true);
    setConversionError(null);
    
    try {
      // Fetch exchange rates from ExchangeRate API
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      
      // Get the rate for the target currency
      const rate = data.rates[toCurrency];
      
      if (!rate) {
        throw new Error(`Exchange rate not found for ${toCurrency}`);
      }

      // Calculate converted amount
      const convertedValue = parseFloat(amount) * rate;
      
      setExchangeRate(rate);
      setConvertedAmount(convertedValue);
      
      setFormData(prev => ({
        ...prev,
        amountInBaseCurrency: convertedValue
      }));
    } catch (err) {
      console.error('Currency conversion error:', err);
      setConversionError(err.message);
      
      // Fallback: use the same amount if conversion fails
      const fallbackAmount = parseFloat(amount);
      setConvertedAmount(fallbackAmount);
      setExchangeRate(1);
      setFormData(prev => ({
        ...prev,
        amountInBaseCurrency: fallbackAmount
      }));
    } finally {
      setConversionLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setUploadedFile(file);
    
    // Simulate OCR processing
    setTimeout(() => {
      setOcrLoading(false);
    }, 2000);
  };

  const handleSubmit = async (e, submit = false) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amountInBaseCurrency) {
      alert('Please wait for currency conversion to complete');
      return;
    }

    if (conversionError) {
      alert('Currency conversion failed. Please check your currency code and try again.');
      return;
    }

    setLoading(true);

    try {
      const expenseData = {
        description: formData.description,
        category: formData.category,
        date: formData.date,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        amountInBaseCurrency: parseFloat(formData.amountInBaseCurrency),
        paidBy: formData.paidBy,
        remarks: formData.remarks,
        receiptUrl: formData.receiptUrl
      };

      const response = await api.post('/expenses', expenseData);

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
        amountInBaseCurrency: '',
        paidBy: 'Personal',
        remarks: '',
        receiptUrl: ''
      });
      setUploadedFile(null);
      setConvertedAmount(null);
      setExchangeRate(null);
      setConversionError(null);
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

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹', 'CAD': 'C$', 'AUD': 'A$',
      'AED': 'د.إ', 'AFN': '؋', 'ALL': 'L', 'AMD': '֏', 'ANG': 'ƒ', 'AOA': 'Kz', 'ARS': '$',
      'AWG': 'ƒ', 'AZN': '₼', 'BAM': 'КМ', 'BBD': '$', 'BDT': '৳', 'BGN': 'лв', 'BHD': 'د.ب',
      'BIF': 'FBu', 'BMD': '$', 'BND': '$', 'BOB': 'Bs', 'BRL': 'R$', 'BSD': '$', 'BTN': 'Nu',
      'BWP': 'P', 'BYN': 'Br', 'BZD': '$', 'CDF': 'FC', 'CHF': 'CHF', 'CLP': '$', 'CNY': '¥',
      'COP': '$', 'CRC': '₡', 'CUC': '$', 'CUP': '$', 'CVE': '$', 'CZK': 'Kč', 'DJF': 'Fdj',
      'DKK': 'kr', 'DOP': '$', 'DZD': 'د.ج', 'EGP': '£', 'ERN': 'Nfk', 'ETB': 'Br', 'FJD': '$',
      'FKP': '£', 'FOK': 'kr', 'GEL': '₾', 'GGP': '£', 'GHS': '₵', 'GIP': '£', 'GMD': 'D',
      'GNF': 'FG', 'GTQ': 'Q', 'GYD': '$', 'HKD': '$', 'HNL': 'L', 'HRK': 'kn', 'HTG': 'G',
      'HUF': 'Ft', 'IDR': 'Rp', 'ILS': '₪', 'IMP': '£', 'IQD': 'ع.د', 'IRR': '﷼', 'ISK': 'kr',
      'JEP': '£', 'JMD': '$', 'JOD': 'د.ا', 'KES': 'KSh', 'KGS': 'с', 'KHR': '៛', 'KID': '$',
      'KMF': 'CF', 'KRW': '₩', 'KWD': 'د.ك', 'KYD': '$', 'KZT': '₸', 'LAK': '₭', 'LBP': 'ل.ل',
      'LKR': '₨', 'LRD': '$', 'LSL': 'L', 'LYD': 'ل.د', 'MAD': 'د.م.', 'MDL': 'L', 'MGA': 'Ar',
      'MKD': 'ден', 'MMK': 'K', 'MNT': '₮', 'MOP': 'MOP$', 'MRU': 'UM', 'MUR': '₨', 'MVR': '.ރ',
      'MWK': 'MK', 'MXN': '$', 'MYR': 'RM', 'MZN': 'MT', 'NAD': '$', 'NGN': '₦', 'NIO': 'C$',
      'NOK': 'kr', 'NPR': '₨', 'NZD': '$', 'OMR': 'ر.ع.', 'PAB': 'B/.', 'PEN': 'S/', 'PGK': 'K',
      'PHP': '₱', 'PKR': '₨', 'PLN': 'zł', 'PYG': '₲', 'QAR': 'ر.ق', 'RON': 'lei', 'RSD': 'дин',
      'RUB': '₽', 'RWF': 'RF', 'SAR': 'ر.س', 'SBD': '$', 'SCR': '₨', 'SDG': 'ج.س.', 'SEK': 'kr',
      'SGD': '$', 'SHP': '£', 'SLL': 'Le', 'SOS': 'S', 'SRD': '$', 'SSP': '£', 'STN': 'Db',
      'SYP': '£', 'SZL': 'L', 'THB': '฿', 'TJS': 'SM', 'TMT': 'T', 'TND': 'د.ت', 'TOP': 'T$',
      'TRY': '₺', 'TTD': '$', 'TVD': '$', 'TWD': 'NT$', 'TZS': 'TSh', 'UAH': '₴', 'UGX': 'USh',
      'UYU': '$', 'UZS': 'лв', 'VES': 'Bs.S', 'VND': '₫', 'VUV': 'Vt', 'WST': 'WS$', 'XAF': 'FCFA',
      'XCD': '$', 'XDR': 'SDR', 'XOF': 'CFA', 'XPF': '₣', 'YER': '﷼', 'ZAR': 'R', 'ZMW': 'ZK',
      'ZWL': '$'
    };
    return symbols[currency] || currency;
  };

  // FIXED: Calculate total using amountInBaseCurrency instead of amount
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amountInBaseCurrency || 0), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'Waiting Approval').length;
  const approvedExpenses = expenses.filter(e => e.status === 'Approved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Expenses</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">{totalExpenses.toFixed(2)}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                  <span>All time ({user?.company?.baseCurrency})</span>
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
                         {getCurrencySymbol(expense.currency)}{expense.amount.toFixed(2)} {expense.currency}
                       </div>
                       {expense.currency !== user?.company?.baseCurrency && (
                         <div className="text-xs text-slate-500 font-medium">
                           ({getCurrencySymbol(user?.company?.baseCurrency)}{expense.amountInBaseCurrency.toFixed(2)} {user?.company?.baseCurrency})
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
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Create Expense
                </h2>
                <p className="text-slate-600 mt-1">Add a new expense to your report</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setUploadedFile(null);
                  setConvertedAmount(null);
                  setExchangeRate(null);
                  setConversionError(null);
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
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      className="w-full pl-4 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold text-slate-900"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">
                     Currency <span className="text-red-500">*</span>
                   </label>
                   <select
                     value={formData.currency}
                     onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                     className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-slate-900 bg-white"
                   >
                     <option value="USD">USD - US Dollar</option>
                     <option value="EUR">EUR - Euro</option>
                     <option value="GBP">GBP - British Pound</option>
                     <option value="JPY">JPY - Japanese Yen</option>
                     <option value="CAD">CAD - Canadian Dollar</option>
                     <option value="AUD">AUD - Australian Dollar</option>
                     <option value="INR">INR - Indian Rupee</option>
                     <option value="AED">AED - UAE Dirham</option>
                     <option value="AFN">AFN - Afghan Afghani</option>
                     <option value="ALL">ALL - Albanian Lek</option>
                     <option value="AMD">AMD - Armenian Dram</option>
                     <option value="ANG">ANG - Netherlands Antillean Guilder</option>
                     <option value="AOA">AOA - Angolan Kwanza</option>
                     <option value="ARS">ARS - Argentine Peso</option>
                     <option value="AWG">AWG - Aruban Florin</option>
                     <option value="AZN">AZN - Azerbaijani Manat</option>
                     <option value="BAM">BAM - Bosnia-Herzegovina Convertible Mark</option>
                     <option value="BBD">BBD - Barbadian Dollar</option>
                     <option value="BDT">BDT - Bangladeshi Taka</option>
                     <option value="BGN">BGN - Bulgarian Lev</option>
                     <option value="BHD">BHD - Bahraini Dinar</option>
                     <option value="BIF">BIF - Burundian Franc</option>
                     <option value="BMD">BMD - Bermudian Dollar</option>
                     <option value="BND">BND - Brunei Dollar</option>
                     <option value="BOB">BOB - Bolivian Boliviano</option>
                     <option value="BRL">BRL - Brazilian Real</option>
                     <option value="BSD">BSD - Bahamian Dollar</option>
                     <option value="BTN">BTN - Bhutanese Ngultrum</option>
                     <option value="BWP">BWP - Botswanan Pula</option>
                     <option value="BYN">BYN - Belarusian Ruble</option>
                     <option value="BZD">BZD - Belize Dollar</option>
                     <option value="CDF">CDF - Congolese Franc</option>
                     <option value="CHF">CHF - Swiss Franc</option>
                     <option value="CLP">CLP - Chilean Peso</option>
                     <option value="CNY">CNY - Chinese Yuan</option>
                     <option value="COP">COP - Colombian Peso</option>
                     <option value="CRC">CRC - Costa Rican Colón</option>
                     <option value="CUC">CUC - Cuban Convertible Peso</option>
                     <option value="CUP">CUP - Cuban Peso</option>
                     <option value="CVE">CVE - Cape Verdean Escudo</option>
                     <option value="CZK">CZK - Czech Koruna</option>
                     <option value="DJF">DJF - Djiboutian Franc</option>
                     <option value="DKK">DKK - Danish Krone</option>
                     <option value="DOP">DOP - Dominican Peso</option>
                     <option value="DZD">DZD - Algerian Dinar</option>
                     <option value="EGP">EGP - Egyptian Pound</option>
                     <option value="ERN">ERN - Eritrean Nakfa</option>
                     <option value="ETB">ETB - Ethiopian Birr</option>
                     <option value="FJD">FJD - Fijian Dollar</option>
                     <option value="FKP">FKP - Falkland Islands Pound</option>
                     <option value="FOK">FOK - Faroese Króna</option>
                     <option value="GEL">GEL - Georgian Lari</option>
                     <option value="GGP">GGP - Guernsey Pound</option>
                     <option value="GHS">GHS - Ghanaian Cedi</option>
                     <option value="GIP">GIP - Gibraltar Pound</option>
                     <option value="GMD">GMD - Gambian Dalasi</option>
                     <option value="GNF">GNF - Guinean Franc</option>
                     <option value="GTQ">GTQ - Guatemalan Quetzal</option>
                     <option value="GYD">GYD - Guyanese Dollar</option>
                     <option value="HKD">HKD - Hong Kong Dollar</option>
                     <option value="HNL">HNL - Honduran Lempira</option>
                     <option value="HRK">HRK - Croatian Kuna</option>
                     <option value="HTG">HTG - Haitian Gourde</option>
                     <option value="HUF">HUF - Hungarian Forint</option>
                     <option value="IDR">IDR - Indonesian Rupiah</option>
                     <option value="ILS">ILS - Israeli New Shekel</option>
                     <option value="IMP">IMP - Manx Pound</option>
                     <option value="IQD">IQD - Iraqi Dinar</option>
                     <option value="IRR">IRR - Iranian Rial</option>
                     <option value="ISK">ISK - Icelandic Króna</option>
                     <option value="JEP">JEP - Jersey Pound</option>
                     <option value="JMD">JMD - Jamaican Dollar</option>
                     <option value="JOD">JOD - Jordanian Dinar</option>
                     <option value="KES">KES - Kenyan Shilling</option>
                     <option value="KGS">KGS - Kyrgystani Som</option>
                     <option value="KHR">KHR - Cambodian Riel</option>
                     <option value="KID">KID - Kiribati Dollar</option>
                     <option value="KMF">KMF - Comorian Franc</option>
                     <option value="KRW">KRW - South Korean Won</option>
                     <option value="KWD">KWD - Kuwaiti Dinar</option>
                     <option value="KYD">KYD - Cayman Islands Dollar</option>
                     <option value="KZT">KZT - Kazakhstani Tenge</option>
                     <option value="LAK">LAK - Laotian Kip</option>
                     <option value="LBP">LBP - Lebanese Pound</option>
                     <option value="LKR">LKR - Sri Lankan Rupee</option>
                     <option value="LRD">LRD - Liberian Dollar</option>
                     <option value="LSL">LSL - Lesotho Loti</option>
                     <option value="LYD">LYD - Libyan Dinar</option>
                     <option value="MAD">MAD - Moroccan Dirham</option>
                     <option value="MDL">MDL - Moldovan Leu</option>
                     <option value="MGA">MGA - Malagasy Ariary</option>
                     <option value="MKD">MKD - Macedonian Denar</option>
                     <option value="MMK">MMK - Myanma Kyat</option>
                     <option value="MNT">MNT - Mongolian Tugrik</option>
                     <option value="MOP">MOP - Macanese Pataca</option>
                     <option value="MRU">MRU - Mauritanian Ouguiya</option>
                     <option value="MUR">MUR - Mauritian Rupee</option>
                     <option value="MVR">MVR - Maldivian Rufiyaa</option>
                     <option value="MWK">MWK - Malawian Kwacha</option>
                     <option value="MXN">MXN - Mexican Peso</option>
                     <option value="MYR">MYR - Malaysian Ringgit</option>
                     <option value="MZN">MZN - Mozambican Metical</option>
                     <option value="NAD">NAD - Namibian Dollar</option>
                     <option value="NGN">NGN - Nigerian Naira</option>
                     <option value="NIO">NIO - Nicaraguan Córdoba</option>
                     <option value="NOK">NOK - Norwegian Krone</option>
                     <option value="NPR">NPR - Nepalese Rupee</option>
                     <option value="NZD">NZD - New Zealand Dollar</option>
                     <option value="OMR">OMR - Omani Rial</option>
                     <option value="PAB">PAB - Panamanian Balboa</option>
                     <option value="PEN">PEN - Peruvian Sol</option>
                     <option value="PGK">PGK - Papua New Guinean Kina</option>
                     <option value="PHP">PHP - Philippine Peso</option>
                     <option value="PKR">PKR - Pakistani Rupee</option>
                     <option value="PLN">PLN - Polish Zloty</option>
                     <option value="PYG">PYG - Paraguayan Guarani</option>
                     <option value="QAR">QAR - Qatari Rial</option>
                     <option value="RON">RON - Romanian Leu</option>
                     <option value="RSD">RSD - Serbian Dinar</option>
                     <option value="RUB">RUB - Russian Ruble</option>
                     <option value="RWF">RWF - Rwandan Franc</option>
                     <option value="SAR">SAR - Saudi Riyal</option>
                     <option value="SBD">SBD - Solomon Islands Dollar</option>
                     <option value="SCR">SCR - Seychellois Rupee</option>
                     <option value="SDG">SDG - Sudanese Pound</option>
                     <option value="SEK">SEK - Swedish Krona</option>
                     <option value="SGD">SGD - Singapore Dollar</option>
                     <option value="SHP">SHP - Saint Helena Pound</option>
                     <option value="SLL">SLL - Sierra Leonean Leone</option>
                     <option value="SOS">SOS - Somali Shilling</option>
                     <option value="SRD">SRD - Surinamese Dollar</option>
                     <option value="SSP">SSP - South Sudanese Pound</option>
                     <option value="STN">STN - São Tomé and Príncipe Dobra</option>
                     <option value="SYP">SYP - Syrian Pound</option>
                     <option value="SZL">SZL - Swazi Lilangeni</option>
                     <option value="THB">THB - Thai Baht</option>
                     <option value="TJS">TJS - Tajikistani Somoni</option>
                     <option value="TMT">TMT - Turkmenistani Manat</option>
                     <option value="TND">TND - Tunisian Dinar</option>
                     <option value="TOP">TOP - Tongan Pa'anga</option>
                     <option value="TRY">TRY - Turkish Lira</option>
                     <option value="TTD">TTD - Trinidad and Tobago Dollar</option>
                     <option value="TVD">TVD - Tuvaluan Dollar</option>
                     <option value="TWD">TWD - New Taiwan Dollar</option>
                     <option value="TZS">TZS - Tanzanian Shilling</option>
                     <option value="UAH">UAH - Ukrainian Hryvnia</option>
                     <option value="UGX">UGX - Ugandan Shilling</option>
                     <option value="UYU">UYU - Uruguayan Peso</option>
                     <option value="UZS">UZS - Uzbekistani Som</option>
                     <option value="VES">VES - Venezuelan Bolívar Soberano</option>
                     <option value="VND">VND - Vietnamese Dong</option>
                     <option value="VUV">VUV - Vanuatu Vatu</option>
                     <option value="WST">WST - Samoan Tala</option>
                     <option value="XAF">XAF - Central African CFA Franc</option>
                     <option value="XCD">XCD - East Caribbean Dollar</option>
                     <option value="XDR">XDR - Special Drawing Rights</option>
                     <option value="XOF">XOF - West African CFA Franc</option>
                     <option value="XPF">XPF - CFP Franc</option>
                     <option value="YER">YER - Yemeni Rial</option>
                     <option value="ZAR">ZAR - South African Rand</option>
                     <option value="ZMW">ZMW - Zambian Kwacha</option>
                     <option value="ZWL">ZWL - Zimbabwean Dollar</option>
                   </select>
                 </div>
              </div>

              {/* Currency Conversion Display */}
              {formData.amount && formData.currency && user?.company?.baseCurrency && formData.currency !== user.company.baseCurrency && (
                <div className={`rounded-xl p-4 border-2 ${
                  conversionError 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {conversionError ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      )}
                      <span className="text-sm font-bold text-slate-700">
                        {conversionError ? 'Conversion Error' : 'Converted Amount:'}
                      </span>
                    </div>
                    <div className="text-right">
                      {conversionLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 size={16} className="text-blue-600 animate-spin" />
                          <span className="text-sm text-slate-600">Converting...</span>
                        </div>
                      ) : conversionError ? (
                        <div className="text-xs text-red-600 font-medium">
                          {conversionError}
                        </div>
                       ) : convertedAmount ? (
                         <div>
                           <span className="text-lg font-bold text-blue-700">
                             {getCurrencySymbol(user?.company?.baseCurrency)}{convertedAmount.toFixed(2)} {user?.company?.baseCurrency}
                           </span>
                           <div className="text-xs text-slate-600">
                             From {getCurrencySymbol(formData.currency)}{formData.amount} {formData.currency} (Rate: {exchangeRate?.toFixed(4)})
                           </div>
                         </div>
                       ) : null}
                    </div>
                  </div>
                </div>
              )}

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
                  disabled={loading || conversionLoading}
                  className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105"
                >
                  {loading ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading || conversionLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
                >
                  {loading ? 'Submitting...' : 'Submit for Approval'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setUploadedFile(null);
                    setConvertedAmount(null);
                    setExchangeRate(null);
                    setConversionError(null);
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

export default EmployeeExpenses