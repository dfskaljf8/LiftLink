import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentScreen = ({ trainer, sessionDetails, onPaymentSuccess, onCancel, darkMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API = process.env.REACT_APP_BACKEND_URL + '/api';

  const handleStripePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const stripe = await stripePromise;

      // Create checkout session
      const response = await axios.post(`${API}/payments/create-session-checkout`, {
        trainer_id: trainer.id,
        session_details: sessionDetails,
        amount: sessionDetails.amount || 7500, // Default $75
        currency: 'usd'
      });

      const { checkout_url } = response.data;

      // Redirect to Stripe Checkout
      window.location.href = checkout_url;

    } catch (error) {
      console.error('Stripe payment failed:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`}>
      <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Complete Payment
            </h2>
            <button
              onClick={onCancel}
              className={`text-gray-500 hover:text-gray-700 ${darkMode ? 'hover:text-gray-300' : ''}`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Session Details */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Session Details
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Trainer:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {trainer.name}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Session Type:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {sessionDetails.type || 'Personal Training'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Duration:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {sessionDetails.duration || '60 minutes'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Location:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {sessionDetails.location || trainer.location}
              </span>
            </div>
            
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>Total:</span>
              <span className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                ${((sessionDetails.amount || 7500) / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Payment Method
          </h3>

          <div className="mb-4 p-3 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">💳</div>
              <div>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Credit/Debit Card
                </span>
                <div className="text-sm text-blue-600 dark:text-blue-400">Secure payment via Stripe</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handleStripePayment}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : darkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Processing...' : `Pay $${((sessionDetails.amount || 7500) / 100).toFixed(2)} with Stripe`}
          </button>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className={`text-sm ${darkMode ? 'text-green-800' : 'text-green-700'}`}>
              🔒 Your payment is secure and encrypted. We use Stripe's industry-standard security measures to protect your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;