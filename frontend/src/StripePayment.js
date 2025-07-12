import React, { useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

// Session Payment Component for Trainees
export const SessionPayment = ({ trainer, sessionDetails, onPaymentComplete, darkMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionCost, setSessionCost] = useState(null);

  React.useEffect(() => {
    fetchSessionCost();
  }, [trainer.id, sessionDetails.type]);

  const fetchSessionCost = async () => {
    try {
      const response = await axios.get(`${API}/payments/session-cost/${trainer.id}?session_type=${sessionDetails.type || 'personal_training'}`);
      setSessionCost(response.data);
    } catch (error) {
      console.error('Failed to fetch session cost:', error);
      setError('Failed to load session cost');
    }
  };

  const handlePayment = async () => {
    if (!sessionCost) return;

    setLoading(true);
    setError('');

    try {
      // Create Stripe checkout session
      const checkoutResponse = await axios.post(`${API}/payments/create-session-checkout`, {
        amount: sessionCost.cost_cents,
        trainer_id: trainer.id,
        client_email: sessionDetails.clientEmail || 'client@example.com',
        session_details: {
          trainer_name: trainer.name || 'Professional Trainer',
          session_type: sessionDetails.type || 'Personal Training',
          duration: sessionDetails.duration || 60
        }
      });

      // Redirect to Stripe Checkout
      if (checkoutResponse.data.checkout_url) {
        window.location.href = checkoutResponse.data.checkout_url;
      } else {
        setError('Failed to create payment session');
      }

    } catch (error) {
      console.error('Payment failed:', error);
      setError('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionCost) {
    return (
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 text-center`}>
        <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading payment details...</div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
      <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
        Session Payment
      </h2>

      <div className="space-y-4">
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
          darkMode ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Session Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Trainer:</span>
              <span className={darkMode ? 'text-white' : 'text-gray-900'}>{trainer.name || 'Professional Trainer'}</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Session Type:</span>
              <span className={darkMode ? 'text-white' : 'text-gray-900'}>{sessionDetails.type || 'Personal Training'}</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Duration:</span>
              <span className={darkMode ? 'text-white' : 'text-gray-900'}>{sessionDetails.duration || 60} minutes</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Total Cost:</span>
              <span className={`text-xl ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                ${sessionCost.cost_dollars.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed' 
              : darkMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Processing...' : `Pay $${sessionCost.cost_dollars.toFixed(2)} with Stripe`}
        </button>

        <div className="text-center">
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            🔒 Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

// Enhanced Trainer Earnings with Real Stripe Integration
export const StripeTrainerEarnings = ({ user, darkMode }) => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);

  React.useEffect(() => {
    fetchEarnings();
  }, [user.id]);

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(`${API}/trainer/${user.id}/earnings`);
      setEarnings(response.data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    setProcessingPayout(true);
    try {
      const amount = Math.round(parseFloat(payoutAmount) * 100); // Convert to cents
      const response = await axios.post(`${API}/trainer/${user.id}/payout`, { amount });
      
      if (response.data) {
        alert(`Payout request of $${payoutAmount} submitted successfully! Stripe transfer initiated.`);
        setPayoutAmount('');
        fetchEarnings();
      }
    } catch (error) {
      alert('Failed to request payout. Please try again.');
      console.error('Payout error:', error);
    } finally {
      setProcessingPayout(false);
    }
  };

  if (loading) {
    return (
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6 text-center`}>
        <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading earnings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-6`}>
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Stripe Earnings Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              ${earnings?.total_earnings?.toFixed(2) || '0.00'}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Earnings</div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              ${earnings?.this_month?.toFixed(2) || '0.00'}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              ${earnings?.pending_payments?.toFixed(2) || '0.00'}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              ${earnings?.stripe_earnings?.toFixed(2) || '0.00'}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stripe Earnings</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Payments
            </h3>
            <div className="space-y-2">
              {earnings?.recent_payments?.map((payment, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {payment.client_name}
                      {payment.stripe_charge && (
                        <span className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                          Stripe
                        </span>
                      )}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {payment.date} • {payment.session_type}
                    </div>
                  </div>
                  <div className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ${payment.amount.toFixed(2)}
                  </div>
                </div>
              )) || []}
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 rounded-lg border ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Request Stripe Payout
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-800/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-green-400`}
                  placeholder="0.00"
                  disabled={processingPayout}
                />
              </div>
              <button
                onClick={requestPayout}
                disabled={!payoutAmount || parseFloat(payoutAmount) <= 0 || processingPayout}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  !payoutAmount || parseFloat(payoutAmount) <= 0 || processingPayout
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : darkMode
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {processingPayout ? 'Processing Stripe Transfer...' : 'Request Payout via Stripe'}
              </button>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-center`}>
                💳 Payments processed through Stripe Connect
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};