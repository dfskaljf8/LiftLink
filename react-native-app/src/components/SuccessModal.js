import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { SuccessAnimation } from './Animations';

/**
 * Reusable Success Modal Component
 * Shows success animation with custom message
 * Use for: Form submissions, bookings, profile updates, etc.
 * NOT for payments (use PaymentProcessingAnimation instead)
 */

const SuccessModal = ({ 
  visible, 
  onClose, 
  title = 'Success!', 
  message = 'Operation completed successfully',
  autoClose = true,
  autoCloseDelay = 2000,
  showButton = false,
  buttonText = 'OK',
  colors = {
    overlay: 'rgba(0, 0, 0, 0.7)',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    primary: '#10b981',
  }
}) => {
  React.useEffect(() => {
    if (visible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, autoCloseDelay, onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Success Animation */}
          <SuccessAnimation 
            size={120} 
            autoPlay={true}
            onAnimationFinish={autoClose ? undefined : null}
          />

          {/* Title */}
          <Text style={[styles.title, { color: colors.primary }]}>
            {title}
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.text }]}>
            {message}
          </Text>

          {/* Optional Button */}
          {showButton && (
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                {buttonText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SuccessModal;

/**
 * Usage Examples:
 * 
 * 1. Simple auto-close success:
 * <SuccessModal
 *   visible={showSuccess}
 *   onClose={() => setShowSuccess(false)}
 *   title="Profile Updated!"
 *   message="Your profile has been successfully updated"
 * />
 * 
 * 2. With manual close button:
 * <SuccessModal
 *   visible={showSuccess}
 *   onClose={() => setShowSuccess(false)}
 *   title="Session Booked!"
 *   message="Your training session has been confirmed"
 *   autoClose={false}
 *   showButton={true}
 *   buttonText="Got it!"
 * />
 * 
 * 3. Custom colors:
 * <SuccessModal
 *   visible={showSuccess}
 *   onClose={() => setShowSuccess(false)}
 *   title="Welcome!"
 *   message="You're all set to start training"
 *   colors={{
 *     overlay: 'rgba(0, 0, 0, 0.8)',
 *     surface: '#111827',
 *     text: '#ffffff',
 *     textSecondary: '#9ca3af',
 *     primary: '#10b981',
 *   }}
 * />
 */
