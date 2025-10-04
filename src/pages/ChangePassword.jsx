import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Client-side validation
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      setSuccess('Password changed successfully! Redirecting to dashboard...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Change Password</h1>
          <p className="text-sm text-slate-600">
            Welcome {user?.name}! Please change your temporary password to a secure one.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your new password"
            />
            <p className="text-xs text-slate-500 mt-1">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
