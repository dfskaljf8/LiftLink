import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

// Load Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentScreen = ({ trainer, sessionDetails, onPaymentSuccess, onCancel, darkMode }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googlePayReady, setGooglePayReady] = useState(false);

  const API = process.env.REACT_APP_BACKEND_URL + '/api';

  useEffect(() => {
    // Initialize Google Pay
    if (window.google && window.google.payments) {
      initializeGooglePay();
    } else {
      // Load Google Pay API
      const script = document.createElement('script');
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.onload = () => initializeGooglePay();
      document.head.appendChild(script);
    }
  }, []);

  const initializeGooglePay = async () => {
    try {
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: 'TEST' // Change to 'PRODUCTION' for live
      });

      // Get Google Pay configuration from backend
      const configResponse = await axios.get(`${API}/payments/google-pay/config`);
      const config = configResponse.data;

      const isReadyToPay = await paymentsClient.isReadyToPay({
        apiVersion: config.apiVersion,
        apiVersionMinor: config.apiVersionMinor,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'stripe',
              'stripe:version': '2020-08-27',
              'stripe:publishableKey': process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
            }
          }
        }]
      });

      setGooglePayReady(isReadyToPay.result);
    } catch (error) {
      console.error('Google Pay initialization failed:', error);
      setGooglePayReady(false);
    }
  };

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

      const { checkout_session_id: sessionId } = response.data;

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        onPaymentSuccess({ paymentMethod: 'stripe', sessionId });
      }
    } catch (error) {
      console.error('Stripe payment failed:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: 'TEST'
      });

      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'stripe',
              'stripe:version': '2020-08-27',
              'stripe:publishableKey': process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
            }
          }
        }],
        merchantInfo: {
          merchantId: 'LiftLink_Fitness_Platform',
          merchantName: 'LiftLink'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: ((sessionDetails.amount || 7500) / 100).toFixed(2),
          currencyCode: 'USD',
          countryCode: 'US'
        }
      };

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);

      // Process payment on backend
      const response = await axios.post(`${API}/payments/google-pay/process`, {
        payment_token: paymentData.paymentMethodData.tokenizationData.token,
        amount: sessionDetails.amount || 7500,
        currency: 'usd'
      });

      if (response.data.status === 'success') {
        onPaymentSuccess({ 
          paymentMethod: 'google_pay', 
          paymentIntentId: response.data.payment_intent_id 
        });
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Google Pay payment failed:', error);
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

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Choose Payment Method
          </h3>

          {/* Payment Method Selection */}
          <div className="space-y-3 mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex items-center space-x-2">
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Credit/Debit Card
                </span>
                <div className="text-sm text-gray-500">(Stripe)</div>
              </div>
            </label>

            {googlePayReady && (
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="google_pay"
                  checked={paymentMethod === 'google_pay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex items-center space-x-2">
                  <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Google Pay
                  </span>
                  <div className="text-sm text-gray-500">(Google Wallet)</div>
                </div>
              </label>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Payment Buttons */}
          <div className="space-y-3">
            {paymentMethod === 'stripe' && (
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
                {loading ? 'Processing...' : 'Pay with Stripe'}
              </button>
            )}

            {paymentMethod === 'google_pay' && googlePayReady && (
              <button
                onClick={handleGooglePayment}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800 text-white'
                }`}
              >
                {loading ? 'Processing...' : 'Pay with Google Pay'}
              </button>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className={`text-sm ${darkMode ? 'text-green-800' : 'text-green-700'}`}>
              🔒 Your payment is secure and encrypted. We use industry-standard security measures to protect your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;