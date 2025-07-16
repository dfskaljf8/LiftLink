import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RQ9buQiOMU12jO7dt2573L4ItnHZCDwgjX7WgfTvL0bKMbX9VD0yFrHBTxmuT3mT71wLj3wPU1QES4jehdjGye000kNGBibLs';
const API = 'https://d660cf88-6e41-4268-ab24-1f6ce76bcb10.preview.emergentagent.com/api';

const PaymentScreen = ({ trainer, sessionDetails, onPaymentSuccess, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = {
    primary: '#4f46e5',
    secondary: '#10b981',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b'
  };

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <PaymentContent
        trainer={trainer}
        sessionDetails={sessionDetails}
        onPaymentSuccess={onPaymentSuccess}
        onCancel={onCancel}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        loading={loading}
        setLoading={setLoading}
        error={error}
        setError={setError}
        colors={colors}
      />
    </StripeProvider>
  );
};

const PaymentContent = ({ 
  trainer, 
  sessionDetails, 
  onPaymentSuccess, 
  onCancel, 
  paymentMethod, 
  setPaymentMethod, 
  loading, 
  setLoading, 
  error, 
  setError, 
  colors 
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleStripePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create checkout session
      const response = await axios.post(`${API}/payments/create-session-checkout`, {
        trainer_id: trainer.id,
        session_details: sessionDetails,
        amount: sessionDetails.amount || 7500,
        currency: 'usd'
      });

      const { checkout_session_id } = response.data;

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: checkout_session_id,
        merchantDisplayName: 'LiftLink',
        style: 'alwaysDark'
      });

      if (initError) {
        setError(initError.message);
        return;
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        setError(presentError.message);
      } else {
        onPaymentSuccess({ paymentMethod: 'stripe', sessionId: checkout_session_id });
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
      // Create Google Pay session
      const response = await axios.post(`${API}/payments/google-pay/create-session`, {
        trainer_id: trainer.id,
        session_details: sessionDetails,
        amount: sessionDetails.amount || 7500,
        currency: 'usd'
      });

      if (response.data.session_id) {
        onPaymentSuccess({ 
          paymentMethod: 'google_pay', 
          sessionId: response.data.session_id 
        });
      } else {
        setError('Google Pay session creation failed');
      }
    } catch (error) {
      console.error('Google Pay payment failed:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Complete Payment
            </Text>
            <TouchableOpacity
              onPress={onCancel}
              style={styles.closeButton}
            >
              <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Session Details */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Session Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Trainer:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{trainer.name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Session Type:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {sessionDetails.type || 'Personal Training'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Duration:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {sessionDetails.duration || '60 minutes'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {sessionDetails.location || trainer.location}
              </Text>
            </View>
            
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
              <Text style={[styles.totalValue, { color: colors.success }]}>
                ${((sessionDetails.amount || 7500) / 100).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Choose Payment Method</Text>

            <TouchableOpacity
              style={[styles.paymentOption, { 
                backgroundColor: paymentMethod === 'stripe' ? colors.primary : 'transparent',
                borderColor: colors.primary
              }]}
              onPress={() => setPaymentMethod('stripe')}
            >
              <Text style={[styles.paymentOptionText, { color: colors.text }]}>
                Credit/Debit Card (Stripe)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentOption, { 
                backgroundColor: paymentMethod === 'google_pay' ? colors.primary : 'transparent',
                borderColor: colors.primary
              }]}
              onPress={() => setPaymentMethod('google_pay')}
            >
              <Text style={[styles.paymentOptionText, { color: colors.text }]}>
                Google Pay
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          {/* Payment Button */}
          <TouchableOpacity
            style={[styles.paymentButton, { 
              backgroundColor: loading ? colors.textSecondary : colors.primary 
            }]}
            onPress={paymentMethod === 'stripe' ? handleStripePayment : handleGooglePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={[styles.paymentButtonText, { color: colors.text }]}>
                {paymentMethod === 'stripe' ? 'Pay with Stripe' : 'Pay with Google Pay'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Security Notice */}
          <View style={[styles.securityNotice, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.securityText, { color: colors.success }]}>
              🔒 Your payment is secure and encrypted
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentOption: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 12,
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  paymentButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityNotice: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PaymentScreen;