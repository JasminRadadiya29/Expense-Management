import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings, CheckSquare, Users, X, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ApprovalRules = () => {
  const [rules, setRules] = useState([]);
  const [managers, setManagers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    steps: [{
      stepNumber: 1,
      approvers: [],
      approvalType: 'all',
      requiredPercentage: 100,
      specificApprovers: []
    }]
  });

  useEffect(() => {
    fetchRules();
    fetchManagers();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await api.get('/approval-rules');
      setRules(response.data.rules);
    } catch (err) {
      console.error('Error fetching rules:', err);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await api.get('/users/managers');
      setManagers(response.data.managers);
    } catch (err) {
      console.error('Error fetching managers:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/approval-rules', formData);
      setShowModal(false);
      setFormData({
        name: '',
        steps: [{
          stepNumber: 1,
          approvers: [],
          approvalType: 'all',
          requiredPercentage: 100,
          specificApprovers: []
        }]
      });
      fetchRules();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating approval rule');
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          stepNumber: formData.steps.length + 1,
          approvers: [],
          approvalType: 'all',
          requiredPercentage: 100,
          specificApprovers: []
        }
      ]
    });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const deleteRule = async (ruleId) => {
    if (!confirm('Delete this approval rule?')) return;

    try {
      await api.delete(`/approval-rules/${ruleId}`);
      fetchRules();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting rule');
    }
  };

  const getApprovalTypeBadge = (type) => {
    const badges = {
      all: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'All Required' },
      percentage: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', label: 'Percentage' },
      specific: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Specific' },
      hybrid: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Hybrid' }
    };
    return badges[type] || badges.all;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
              Approval Rules
            </h1>
            <p className="text-slate-600 text-lg">Configure multi-level and conditional approval workflows</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2 hover:scale-105"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Create Rule
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Rules</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">{rules.length}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                  <span>Configured workflows</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Active Rules</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">{rules.filter(r => r.isActive).length}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <span>Currently in use</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckSquare className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Approvers</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">{managers.length}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                  <span>Available reviewers</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {rules.map((rule) => (
            <div key={rule._id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{rule.name}</h3>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border-2 ${
                    rule.isActive 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button
                  onClick={() => deleteRule(rule._id)}
                  className="group/btn p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 border-2 border-transparent hover:border-red-200"
                  title="Delete rule"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {rule.steps.map((step) => {
                  const badge = getApprovalTypeBadge(step.approvalType);
                  return (
                    <div key={step.stepNumber} className="relative border-l-4 border-blue-500 pl-5 pr-4 py-4 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-r-xl hover:border-blue-600 transition-colors">
                      <div className="absolute -left-4 top-4 w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {step.stepNumber}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-base font-bold text-slate-900">Step {step.stepNumber}</span>
                        <span className={`px-3 py-1 text-xs font-bold rounded-lg border-2 ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>
                      {step.approvalType === 'percentage' && (
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-sm">
                            <span className="font-bold text-slate-700">Required:</span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md font-bold text-xs">
                              {step.requiredPercentage}%
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="text-sm text-slate-700 mb-2">
                        <span className="font-bold text-slate-900">Approvers: </span>
                        <span className="font-medium">{step.approvers.map((a) => a.name).join(', ')}</span>
                      </div>
                      {step.specificApprovers && step.specificApprovers.length > 0 && (
                        <div className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="font-bold text-slate-900">Specific: </span>
                          <span className="font-medium">{step.specificApprovers.map((a) => a.name).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {rules.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-12 text-center">
              <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No approval rules yet</h3>
              <p className="text-slate-600 mb-6">Create your first approval rule to get started</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create Rule
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-8 border-b border-slate-200 rounded-t-3xl">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                  Create Approval Rule
                </h2>
                <p className="text-slate-600 mt-1">Define multi-level approval workflow</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({
                    name: '',
                    steps: [{
                      stepNumber: 1,
                      approvers: [],
                      approvalType: 'all',
                      requiredPercentage: 100,
                      specificApprovers: []
                    }]
                  });
                }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            <div className="p-8">
              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Rule Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 font-medium"
                    placeholder="e.g., Standard Expense Approval"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-slate-700">Approval Steps</label>
                    <button
                      type="button"
                      onClick={addStep}
                      className="group text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-2 transition-all hover:gap-3 px-3 py-1.5 hover:bg-blue-50 rounded-lg"
                    >
                      <Plus size={16} />
                      Add Step
                    </button>
                  </div>

                  <div className="space-y-5">
                    {formData.steps.map((step, index) => (
                      <div key={index} className="border-2 border-slate-200 rounded-2xl p-6 bg-gradient-to-br from-white to-slate-50 hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-center mb-5">
                          <h4 className="font-bold text-slate-900 flex items-center gap-3">
                            <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center text-base font-bold shadow-md">
                              {step.stepNumber}
                            </span>
                            <span className="text-lg">Step {step.stepNumber}</span>
                          </h4>
                          {formData.steps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStep(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 border-2 border-transparent hover:border-red-200"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>

                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              Approvers <span className="text-red-500">*</span>
                            </label>
                            <select
                              multiple
                              value={step.approvers}
                              onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                updateStep(index, 'approvers', selected);
                              }}
                              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white font-medium text-slate-900"
                              size={4}
                            >
                              {managers.map((manager) => (
                                <option key={manager._id} value={manager._id} className="py-2">
                                  {manager.name} ({manager.role})
                                </option>
                              ))}
                            </select>
                            <div className="flex items-start gap-2 mt-2">
                              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-blue-600 font-medium">Hold Ctrl/Cmd to select multiple approvers</p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              Approval Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={step.approvalType}
                              onChange={(e) => updateStep(index, 'approvalType', e.target.value)}
                              className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white font-medium text-slate-900"
                            >
                              <option value="all">All must approve</option>
                              <option value="percentage">Percentage based</option>
                              <option value="specific">Specific approver</option>
                              <option value="hybrid">Hybrid (percentage OR specific)</option>
                            </select>
                          </div>

                          {(step.approvalType === 'percentage' || step.approvalType === 'hybrid') && (
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">
                                Required Percentage <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={step.requiredPercentage}
                                  onChange={(e) => updateStep(index, 'requiredPercentage', parseInt(e.target.value))}
                                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold text-slate-900"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                              </div>
                            </div>
                          )}

                          {(step.approvalType === 'specific' || step.approvalType === 'hybrid') && (
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">
                                Specific Approvers <span className="text-red-500">*</span>
                              </label>
                              <select
                                multiple
                                value={step.specificApprovers}
                                onChange={(e) => {
                                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                                  updateStep(index, 'specificApprovers', selected);
                                }}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white font-medium text-slate-900"
                                size={4}
                              >
                                {managers.map((manager) => (
                                  <option key={manager._id} value={manager._id} className="py-2">
                                    {manager.name} ({manager.role})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
                >
                  {loading ? 'Creating Rule...' : 'Create Rule'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      name: '',
                      steps: [{
                        stepNumber: 1,
                        approvers: [],
                        approvalType: 'all',
                        requiredPercentage: 100,
                        specificApprovers: []
                      }]
                    });
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

export default ApprovalRules;