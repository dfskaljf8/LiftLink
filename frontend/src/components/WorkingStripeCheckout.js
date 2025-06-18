import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Load Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51RQ9buQiOMU12jO7dt2573L4ItnHZCDwgjX7WgfTvL0bKMbX9VD0yFrHBTxmuT3mT71wLj3wPU1QES4jehdjGye000kNGBibLs');

const CheckoutForm = ({ amount, sessionDetails, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    // Create PaymentIntent on component mount
    createPaymentIntent();
  }, [amount]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          description: `Training Session - ${sessionDetails.trainerName}`,
          metadata: {
            sessionId: sessionDetails.sessionId,
            trainerId: sessionDetails.trainerId,
            userId: sessionDetails.userId
          }
        }),
      });

      const { client_secret } = await response.json();
      setClientSecret(client_secret);
    } catch (err) {
      setError('Failed to initialize payment. Please try again.');
      console.error('Payment intent creation failed:', err);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const card = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: sessionDetails.userName,
            email: sessionDetails.userEmail,
          },
        }
      });

      if (error) {
        setError(error.message);
        onError(error);
      } else if (paymentIntent.status === 'succeeded') {
        // Payment successful
        onSuccess({
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          sessionDetails
        });
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h3 style={{
        color: '#ffffff',
        marginBottom: '20px',
        fontSize: '20px',
        fontWeight: '600'
      }}>
        Complete Payment
      </h3>

      {/* Session Summary */}
      <div style={{
        background: 'rgba(196, 214, 0, 0.1)',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '1px solid rgba(196, 214, 0, 0.3)'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#C4D600' }}>
          Session with {sessionDetails.trainerName}
        </h4>
        <p style={{ margin: '0 0 4px 0', color: 'rgba(255, 255, 255, 0.8)' }}>
          {sessionDetails.sessionType} • {sessionDetails.duration} minutes
        </p>
        <p style={{ margin: '0', color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>
          Total: ${amount.toFixed(2)}
        </p>
      </div>

      {/* Card Input */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <CardElement
          options={cardStyle}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          color: '#ff6b6b',
          background: 'rgba(255, 107, 107, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Payment Button */}
      <button
        type="submit"
        disabled={!stripe || isLoading}
        style={{
          width: '100%',
          background: isLoading ? 'rgba(196, 214, 0, 0.5)' : '#C4D600',
          color: '#000',
          border: 'none',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {isLoading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>

      {/* Security Notice */}
      <p style={{
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '12px',
        marginTop: '12px',
        margin: '12px 0 0 0'
      }}>
        🔒 Your payment is secured by Stripe
      </p>
    </form>
  );
};

const WorkingStripeCheckout = ({ amount, sessionDetails, onSuccess, onError, onCancel }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(196, 214, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            color: '#ffffff',
            fontSize: '24px'
          }}>
            Secure Payment
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm
            amount={amount}
            sessionDetails={sessionDetails}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </div>
    </div>
  );
};

export default WorkingStripeCheckout;
