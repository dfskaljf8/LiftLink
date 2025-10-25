import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationManager';
import { Alert } from 'react-native';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const { user, token, logout } = useAuth();
  const { clearAllNotifications } = useNotifications();
  const [securityStatus, setSecurityStatus] = useState({
    authenticated: false,
    sessionValid: true,
    lastActivity: Date.now()
  });

  // Session timeout (30 minutes of inactivity)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  // Track user activity
  const updateActivity = () => {
    setSecurityStatus(prev => ({
      ...prev,
      lastActivity: Date.now()
    }));
  };

  // Check session validity
  const checkSession = () => {
    if (user && token) {
      const now = Date.now();
      const timeSinceActivity = now - securityStatus.lastActivity;
      
      if (timeSinceActivity > SESSION_TIMEOUT) {
        handleSessionExpired();
      } else {
        setSecurityStatus(prev => ({
          ...prev,
          authenticated: true,
          sessionValid: true
        }));
      }
    } else {
      setSecurityStatus(prev => ({
        ...prev,
        authenticated: false,
        sessionValid: false
      }));
    }
  };

  // Handle session expiration
  const handleSessionExpired = async () => {
    Alert.alert(
      'Session Expired',
      'Your session has expired for security reasons. Please log in again.',
      [
        {
          text: 'OK',
          onPress: async () => {
            clearAllNotifications();
            await logout();
          }
        }
      ],
      { cancelable: false }
    );
  };

  // Validate user permissions for specific actions
  const validatePermission = (action, targetUserId = null, requiredRole = null) => {
    if (!user || !token) {
      return { allowed: false, reason: 'Authentication required' };
    }

    // Check if session is still valid
    if (!securityStatus.sessionValid) {
      return { allowed: false, reason: 'Session expired' };
    }

    // Check role-based permissions
    if (requiredRole && user.role !== requiredRole) {
      return { allowed: false, reason: `${requiredRole} access required` };
    }

    // Check user-specific permissions
    if (targetUserId && user.id !== targetUserId) {
      return { allowed: false, reason: 'Can only access your own data' };
    }

    // Action-specific validation
    switch (action) {
      case 'view_trainer_data':
        if (user.role !== 'trainer') {
          return { allowed: false, reason: 'Trainer access required' };
        }
        break;
      
      case 'send_friend_request':
        if (targetUserId === user.id) {
          return { allowed: false, reason: 'Cannot send friend request to yourself' };
        }
        break;
      
      case 'access_notifications':
        if (targetUserId && targetUserId !== user.id) {
          return { allowed: false, reason: 'Can only view your own notifications' };
        }
        break;
      
      default:
        break;
    }

    return { allowed: true, reason: 'Permission granted' };
  };

  // Sanitize user input to prevent XSS
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') {
      return input;
    }

    // Basic XSS prevention
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim()
      .substring(0, 1000); // Limit length
  };

  // Report security incident
  const reportSecurityIncident = (incident, details = {}) => {
    console.warn(`🚨 Security Incident: ${incident}`, details);
    
    // In production, this would send to a security monitoring service
    const securityLog = {
      timestamp: new Date().toISOString(),
      incident,
      details,
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      userAgent: navigator.userAgent || 'React Native App'
    };

    // Store locally for now (in production, send to backend)
    console.log('Security Log:', securityLog);
  };

  // Check for security threats in user input
  const checkInputSecurity = (input) => {
    if (typeof input !== 'string') {
      return { safe: true };
    }

    const threats = [];
    
    // Check for common XSS patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    xssPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push(`XSS attempt detected (pattern ${index + 1})`);
      }
    });

    // Check for suspiciously long input
    if (input.length > 10000) {
      threats.push('Suspiciously long input detected');
    }

    if (threats.length > 0) {
      reportSecurityIncident('Malicious input detected', { threats, input: input.substring(0, 100) });
      return { safe: false, threats };
    }

    return { safe: true };
  };

  // Monitor session activity
  useEffect(() => {
    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [securityStatus.lastActivity]);

  // Update authentication status when user/token changes
  useEffect(() => {
    setSecurityStatus(prev => ({
      ...prev,
      authenticated: !!(user && token),
      sessionValid: !!(user && token)
    }));
  }, [user, token]);

  const value = {
    securityStatus,
    updateActivity,
    validatePermission,
    sanitizeInput,
    reportSecurityIncident,
    checkInputSecurity,
    handleSessionExpired
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export default SecurityProvider;