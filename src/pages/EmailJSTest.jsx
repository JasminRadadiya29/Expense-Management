import React, { useState } from 'react';
import { debugEmailJS, testEmailJS } from '../services/emailService';

const EmailJSTest = () => {
  const [testEmail, setTestEmail] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const success = await debugEmailJS(testEmail || 'test@example.com');
      setResult(success ? 'Test successful! Check your email.' : 'Test failed. Check console for details.');
    } catch (error) {
      setResult(`Test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigTest = async () => {
    setLoading(true);
    setResult('Testing configuration...');
    
    try {
      const success = await testEmailJS();
      setResult(success ? 'Configuration test successful!' : 'Configuration test failed.');
    } catch (error) {
      setResult(`Configuration test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
          EmailJS Debug Test
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Test Email Address
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your-email@gmail.com"
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={handleConfigTest}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Configuration'}
            </button>

            <button
              onClick={handleTest}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Send Test Email'}
            </button>
          </div>

          {result && (
            <div className={`p-3 rounded text-sm ${
              result.includes('successful') 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {result}
            </div>
          )}

          <div className="text-xs text-slate-500 space-y-1">
            <p><strong>Instructions:</strong></p>
            <p>1. First click "Test Configuration" to verify your EmailJS setup</p>
            <p>2. Then click "Send Test Email" to test actual email sending</p>
            <p>3. Check the browser console for detailed logs</p>
            <p>4. Check your email for the test message</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailJSTest;
