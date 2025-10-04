import React, { useState, useEffect } from 'react';
import { Users, Mail } from 'lucide-react';
import api from '../services/api';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      
      // Send welcome email using EmailJS
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
      
      // Send password reset email using EmailJS
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">User Management</h1>
            <p className="text-slate-600 mt-1">Manage employees and their roles</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Users size={18} />
            Create User
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="text-sm border border-slate-300 rounded px-2 py-1"
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
                      className="text-sm border border-slate-300 rounded px-2 py-1"
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
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <Mail size={14} />
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Create New User</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Manager</label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Manager</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>{manager.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', email: '', role: 'Employee', managerId: '', currency: '' });
                    setError('');
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

export default AdminDashboard;
