import React, { useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const EmailVerification = ({ email, onVerificationComplete, darkMode }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/verify-email`, {
        email: email,
        verification_code: verificationCode
      });

      if (response.data.verified) {
        setMessage('Email verified successfully! You can now access your account.');
        setTimeout(() => {
          onVerificationComplete();
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API}/send-verification`, { email });
      setMessage('Verification code resent! Check your email.');
    } catch (error) {
      setError('Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'cyberpunk-bg' : 'light-mode-bg'} flex items-center justify-center p-4`}>
      <div className={`w-full max-w-md ${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-8`}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📧</div>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
            Verify Your Email
          </h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            We've sent a verification code to:
          </p>
          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {email}
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleVerification} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              className={`w-full px-4 py-3 rounded-lg border text-center text-lg font-mono tracking-widest ${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-green-400 focus:border-transparent`}
              placeholder="XXXXXX"
              maxLength={6}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || verificationCode.length !== 6}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading || verificationCode.length !== 6
                ? 'bg-gray-400 cursor-not-allowed' 
                : darkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            Didn't receive the code?
          </p>
          <button
            onClick={resendVerification}
            disabled={loading}
            className={`text-sm font-medium ${
              darkMode ? 'text-green-400 hover:text-green-300' : 'text-blue-600 hover:text-blue-500'
            } disabled:opacity-50`}
          >
            Resend verification code
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;