import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Approval Rules</h1>
            <p className="text-slate-600 mt-1">Configure multi-level and conditional approval workflows</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            Create Rule
          </button>
        </div>

        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule._id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{rule.name}</h3>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${
                    rule.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button
                  onClick={() => deleteRule(rule._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {rule.steps.map((step) => (
                  <div key={step.stepNumber} className="border-l-4 border-blue-500 pl-4">
                    <div className="text-sm font-medium text-slate-700">Step {step.stepNumber}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      Type: <span className="font-medium">{step.approvalType}</span>
                    </div>
                    {step.approvalType === 'percentage' && (
                      <div className="text-sm text-slate-600">
                        Required: <span className="font-medium">{step.requiredPercentage}%</span>
                      </div>
                    )}
                    <div className="text-sm text-slate-600 mt-1">
                      Approvers: {step.approvers.map((a) => a.name).join(', ')}
                    </div>
                    {step.specificApprovers && step.specificApprovers.length > 0 && (
                      <div className="text-sm text-slate-600">
                        Specific: {step.specificApprovers.map((a) => a.name).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 my-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Create Approval Rule</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700">Approval Steps</label>
                  <button
                    type="button"
                    onClick={addStep}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Step
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.steps.map((step, index) => (
                    <div key={index} className="border border-slate-200 rounded p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-slate-900">Step {step.stepNumber}</h4>
                        {formData.steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Approvers</label>
                          <select
                            multiple
                            value={step.approvers}
                            onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions, option => option.value);
                              updateStep(index, 'approvers', selected);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            size={4}
                          >
                            {managers.map((manager) => (
                              <option key={manager.id} value={manager.id}>
                                {manager.name} ({manager.role})
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Approval Type</label>
                          <select
                            value={step.approvalType}
                            onChange={(e) => updateStep(index, 'approvalType', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="all">All must approve</option>
                            <option value="percentage">Percentage based</option>
                            <option value="specific">Specific approver</option>
                            <option value="hybrid">Hybrid (percentage OR specific)</option>
                          </select>
                        </div>

                        {(step.approvalType === 'percentage' || step.approvalType === 'hybrid') && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Required Percentage</label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={step.requiredPercentage}
                              onChange={(e) => updateStep(index, 'requiredPercentage', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        {(step.approvalType === 'specific' || step.approvalType === 'hybrid') && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Specific Approvers</label>
                            <select
                              multiple
                              value={step.specificApprovers}
                              onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                updateStep(index, 'specificApprovers', selected);
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              size={4}
                            >
                              {managers.map((manager) => (
                                <option key={manager.id} value={manager.id}>
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

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Rule'}
                </button>
                <button
                  type="button"
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

export default ApprovalRules;
