import React, { useState, useEffect } from 'react';
import { Users, Mail, Plus, TrendingUp, X, Search } from 'lucide-react';

// Mock API and email services for demo
const api = {
  get: async (url) => {
    if (url === '/users') {
      return { data: { users: [
        { _id: '1', name: 'John Smith', email: 'john@company.com', role: 'Manager', manager: null },
        { _id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Employee', manager: { _id: '1', name: 'John Smith' } },
        { _id: '3', name: 'Michael Brown', email: 'michael@company.com', role: 'Employee', manager: { _id: '1', name: 'John Smith' } },
      ]}};
    }
    if (url === '/users/managers') {
      return { data: { managers: [
        { _id: '1', name: 'John Smith', email: 'john@company.com', role: 'Manager' }
      ]}};
    }
  },
  post: async (url, data) => {
    return { data: { email: data.email, userName: data.name, temporaryPassword: 'temp123' } };
  },
  put: async () => ({ data: {} })
};

const sendWelcomeEmail = async () => true;
const sendPasswordResetEmail = async () => true;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Employee',
    managerId: '',
    currency: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchManagers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/users', formData);
      
      const emailSent = await sendWelcomeEmail(
        response.data.email,
        response.data.userName,
        response.data.temporaryPassword
      );
      
      if (emailSent) {
        alert('User created and welcome email sent successfully');
      } else {
        alert('User created but failed to send welcome email');
      }
      
      setShowModal(false);
      setFormData({ name: '', email: '', role: 'Employee', managerId: '', currency: '' });
      fetchUsers();
      fetchManagers();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!confirm('Send password reset email to this user?')) return;

    try {
      const response = await api.post(`/users/${userId}/reset-password`);
      
      const emailSent = await sendPasswordResetEmail(
        response.data.email,
        response.data.temporaryPassword
      );
      
      if (emailSent) {
        alert('Password reset email sent successfully');
      } else {
        alert('Failed to send password reset email');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error sending reset email');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      fetchUsers();
      fetchManagers();
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating role');
    }
  };

  const handleManagerChange = async (userId, managerId) => {
    try {
      await api.put(`/users/${userId}`, { managerId: managerId || null });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating manager');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Manager': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
              User Management
            </h1>
            <p className="text-slate-600 text-lg">Manage team members and their roles</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2 hover:scale-105"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Create User
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Users</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">{users.length}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Active accounts</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Managers</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">{managers.length}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                  <span>Team leaders</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Employees</p>
                <p className="text-4xl font-bold text-slate-900 mb-3">{users.filter(u => u.role === 'Employee').length}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                  <span>Team members</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Manager</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/70 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md">
                          {user.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">{user.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`text-xs font-semibold border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${getRoleBadgeColor(user.role)}`}
                      >
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.manager?._id || ''}
                        onChange={(e) => handleManagerChange(user._id, e.target.value)}
                        className="text-sm border-2 border-slate-200 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-slate-300"
                      >
                        <option value="">No Manager</option>
                        {managers.filter(m => m._id !== user._id).map((manager) => (
                          <option key={manager._id} value={manager._id}>{manager.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleResetPassword(user._id)}
                        className="group text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-2 transition-all hover:gap-3"
                      >
                        <Mail size={16} className="group-hover:scale-110 transition-transform" />
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No users found</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between p-8 border-b border-slate-200">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                  Create New User
                </h2>
                <p className="text-slate-600 mt-1">Add a new team member to your organization</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ name: '', email: '', role: 'Employee', managerId: '', currency: '' });
                  setError('');
                }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 font-medium"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 font-medium"
                    placeholder="john@company.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-slate-900 font-medium"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Assign Manager</label>
                    <select
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-slate-900 font-medium"
                    >
                      <option value="">No Manager</option>
                      {managers.map((manager) => (
                        <option key={manager._id} value={manager._id}>{manager.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={handleCreateUser}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
                >
                  {loading ? 'Creating User...' : 'Create User'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', email: '', role: 'Employee', managerId: '', currency: '' });
                    setError('');
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

export default AdminDashboard;