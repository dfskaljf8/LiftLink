// Mock for @stripe/stripe-react-native
const StripeProvider = ({ children, publishableKey }) => {
  console.log('StripeProvider initialized with key:', publishableKey);
  return children;
};

const useStripe = () => ({
  initPaymentSheet: (params) => {
    console.log('initPaymentSheet called with:', params);
    return Promise.resolve({ error: null });
  },
  presentPaymentSheet: () => {
    console.log('presentPaymentSheet called');
    return Promise.resolve({ error: null });
  },
  confirmPayment: (paymentIntentClientSecret) => {
    console.log('confirmPayment called with:', paymentIntentClientSecret);
    return Promise.resolve({ 
      paymentIntent: {
        id: 'mock_payment_intent_id',
        status: 'succeeded',
      },
      error: null 
    });
  },
  createToken: (params) => {
    console.log('createToken called with:', params);
    return Promise.resolve({
      token: {
        id: 'mock_token_id',
        card: {
          id: 'mock_card_id',
          brand: 'visa',
          last4: '4242',
        },
      },
      error: null,
    });
  },
});

const CardField = ({ onCardChange, ...props }) => {
  console.log('CardField rendered');
  return null; // Mock component
};

export { StripeProvider, useStripe, CardField };