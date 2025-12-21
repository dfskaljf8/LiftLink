import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows, scale, moderateScale, deviceSize } from '../styles/AppStyles';
import { PaymentProcessingAnimation, ErrorAnimation } from './Animations';

const { width, height } = Dimensions.get('window');
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'YOUR_STRIPE_PUBLISHABLE_KEY_HERE';
const API = process.env.REACT_APP_BACKEND_URL;

if (!API) {
  console.error('❌ REACT_APP_BACKEND_URL is not set!');
}

const PaymentScreen = ({ trainer, sessionDetails, onPaymentSuccess, onCancel }) => {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <PaymentContent
        trainer={trainer}
        sessionDetails={sessionDetails}
        onPaymentSuccess={onPaymentSuccess}
        onCancel={onCancel}
      />
    </StripeProvider>
  );
};

const PaymentContent = ({ trainer, sessionDetails, onPaymentSuccess, onCancel }) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'processing', 'success', 'error'

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

  const handleStripePayment = async () => {
    setLoading(true);
    setError('');
    setPaymentStatus('processing');
    setShowPaymentModal(true);

    try {
      // Create checkout session
      const response = await fetch(`${API}/api/payments/create-session-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainer.id,
          session_details: sessionDetails,
          amount: sessionDetails.amount || 7500,
          currency: 'usd'
        })
      });

      const data = await response.json();
      const { checkout_session_id } = data;

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: checkout_session_id,
        merchantDisplayName: 'LiftLink',
        style: 'alwaysDark'
      });

      if (initError) {
        setError(initError.message);
        setPaymentStatus('error');
        setTimeout(() => setShowPaymentModal(false), 2000);
        return;
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        setError(presentError.message);
        setPaymentStatus('error');
        setTimeout(() => setShowPaymentModal(false), 2000);
      } else {
        setPaymentStatus('success');
        setTimeout(() => {
          setShowPaymentModal(false);
          onPaymentSuccess({ paymentMethod: 'stripe', sessionId: checkout_session_id });
        }, 2000);
      }
    } catch (error) {
      console.error('Stripe payment failed:', error);
      setError('Payment failed. Please try again.');
      setPaymentStatus('error');
      setTimeout(() => setShowPaymentModal(false), 2000);
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

          {/* Payment Method */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Payment Method</Text>

            <View style={[styles.paymentMethodCard, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentMethodIcon}>💳</Text>
                <View>
                  <Text style={[styles.paymentMethodText, { color: colors.text }]}>
                    Credit/Debit Card
                  </Text>
                  <Text style={[styles.paymentMethodSubtext, { color: colors.primary }]}>
                    Secure payment via Stripe
                  </Text>
                </View>
              </View>
            </View>
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
            onPress={handleStripePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={[styles.paymentButtonText, { color: colors.text }]}>
                Pay ${((sessionDetails.amount || 7500) / 100).toFixed(2)} with Stripe
              </Text>
            )}
          </TouchableOpacity>

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <Text style={[styles.securityBadgeText, { color: colors.success }]}>
              🔒 100% Secure with Stripe
            </Text>
          </View>

          {/* Security Notice */}
          <View style={[styles.securityNotice, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.securityText, { color: colors.success }]}>
              🔒 Your payment is secure and encrypted via Stripe
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
  paymentMethodCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentMethodSubtext: {
    fontSize: 14,
    marginTop: 4,
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
  securityBadge: {
    alignItems: 'center',
    marginBottom: 16,
  },
  securityBadgeText: {
    fontSize: 14,
    fontWeight: '600',
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