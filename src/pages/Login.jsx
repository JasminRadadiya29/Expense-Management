import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { sendPasswordResetEmail } from '../services/emailService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Check if user has temporary password
      if (user.isTemporaryPassword) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email: resetEmail });
      
      // Send email using EmailJS
      const emailSent = await sendPasswordResetEmail(
        response.data.email, 
        response.data.temporaryPassword
      );
      
      if (emailSent) {
        setResetMessage('Temporary password sent to your email');
      } else {
        setError('Failed to send email. Please try again.');
      }
      
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-6 text-center">Reset Password</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {resetMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              {resetMessage}
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-slate-600 hover:text-slate-900 text-sm"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6 text-center">Login</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
