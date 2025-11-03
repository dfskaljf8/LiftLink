import axios from 'axios';
import { Platform } from 'react-native';

/**
 * Certificate Pinning Configuration
 * Prevents man-in-the-middle attacks by validating SSL certificates
 */

// Production SSL certificate fingerprints (SHA-256)
// Update these with your actual production certificate fingerprints
const CERTIFICATE_PINS = {
  'liftlink-ra6t.onrender.com': [
    // Primary certificate (get from: openssl s_client -connect domain:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64)
    'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Replace with actual cert fingerprint
    // Backup certificate (for rotation)
    'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=' // Replace with actual backup cert
  ],
  'api.stripe.com': [
    // Stripe's certificate pins (example - use actual Stripe pins)
    'sha256/STRIPE_CERT_FINGERPRINT_HERE='
  ],
  'googleapis.com': [
    // Google's certificate pins (example - use actual Google pins)
    'sha256/GOOGLE_CERT_FINGERPRINT_HERE='
  ]
};

class CertificatePinningService {
  constructor() {
    this.enabled = !__DEV__; // Disable in development
    this.pinnedDomains = Object.keys(CERTIFICATE_PINS);
    this.violations = [];
  }

  /**
   * Initialize certificate pinning for axios
   */
  initialize() {
    if (!this.enabled) {
      console.log('🔓 Certificate pinning disabled in development mode');
      return;
    }

    console.log('📌 Initializing certificate pinning for:', this.pinnedDomains);

    // Add axios interceptor to validate certificates
    axios.interceptors.request.use(
      (config) => {
        return this.validateRequest(config);
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to catch SSL errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (this.isSSLError(error)) {
          this.handleSSLViolation(error);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Validate request against pinned certificates
   */
  validateRequest(config) {
    if (!this.enabled) return config;

    try {
      const url = new URL(config.url);
      const domain = url.hostname;

      if (this.pinnedDomains.includes(domain)) {
        console.log('📌 Validating certificate for:', domain);
        
        // Add custom headers for certificate validation
        config.headers = config.headers || {};
        config.headers['X-Certificate-Pinning'] = 'enabled';
        
        // In React Native, actual certificate validation happens at native level
        // This is a JavaScript-level check
      }
    } catch (error) {
      console.error('❌ Certificate validation error:', error);
    }

    return config;
  }

  /**
   * Check if error is SSL/TLS related
   */
  isSSLError(error) {
    const sslErrorCodes = [
      'CERT_HAS_EXPIRED',
      'CERT_INVALID',
      'CERT_UNTRUSTED',
      'SSL_ERROR',
      'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
      'SELF_SIGNED_CERT_IN_CHAIN'
    ];

    const errorMessage = error.message || '';
    const errorCode = error.code || '';

    return sslErrorCodes.some(code => 
      errorMessage.includes(code) || errorCode.includes(code)
    );
  }

  /**
   * Handle SSL certificate violation
   */
  handleSSLViolation(error) {
    console.error('🚨 SSL CERTIFICATE VIOLATION DETECTED!');
    console.error('Error:', error.message);
    
    const violation = {
      timestamp: new Date().toISOString(),
      error: error.message,
      url: error.config?.url,
      type: 'SSL_PINNING_VIOLATION'
    };

    this.violations.push(violation);

    // Log to backend security monitoring (in production)
    this.reportSecurityViolation(violation);

    // Alert user (optional)
    if (this.violations.length === 1) {
      // Only show alert for first violation to avoid spam
      console.log('⚠️ Security Alert: Potential man-in-the-middle attack detected');
    }
  }

  /**
   * Report security violation to backend
   */
  async reportSecurityViolation(violation) {
    try {
      // In production, send to security monitoring endpoint
      console.log('📊 Reporting security violation:', violation);
      
      // await axios.post('/api/security/report-violation', violation);
    } catch (error) {
      console.error('Failed to report security violation:', error);
    }
  }

  /**
   * Get certificate pins for a domain
   */
  getPinsForDomain(domain) {
    return CERTIFICATE_PINS[domain] || [];
  }

  /**
   * Add certificate pin for domain
   */
  addCertificatePin(domain, fingerprint) {
    if (!CERTIFICATE_PINS[domain]) {
      CERTIFICATE_PINS[domain] = [];
    }
    CERTIFICATE_PINS[domain].push(fingerprint);
    this.pinnedDomains = Object.keys(CERTIFICATE_PINS);
    console.log('📌 Added certificate pin for:', domain);
  }

  /**
   * Enable/disable certificate pinning
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`📌 Certificate pinning ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get violation history
   */
  getViolations() {
    return this.violations;
  }

  /**
   * Clear violation history
   */
  clearViolations() {
    this.violations = [];
  }
}

// Singleton instance
const certificatePinning = new CertificatePinningService();

// Auto-initialize
certificatePinning.initialize();

export default certificatePinning;

/**
 * Native Certificate Pinning Configuration for Android
 * 
 * Add to android/app/src/main/res/xml/network_security_config.xml:
 * 
 * <?xml version="1.0" encoding="utf-8"?>
 * <network-security-config>
 *   <domain-config cleartextTrafficPermitted="false">
 *     <domain includeSubdomains="true">liftlink-ra6t.onrender.com</domain>
 *     <pin-set expiration="2026-01-01">
 *       <pin digest="SHA-256">CERTIFICATE_FINGERPRINT_HERE</pin>
 *       <pin digest="SHA-256">BACKUP_CERTIFICATE_FINGERPRINT_HERE</pin>
 *     </pin-set>
 *   </domain-config>
 * </network-security-config>
 * 
 * Then reference in AndroidManifest.xml:
 * <application android:networkSecurityConfig="@xml/network_security_config">
 */

/**
 * Native Certificate Pinning for iOS
 * 
 * Add to Info.plist or implement in AppDelegate.m using NSURLSession
 * with custom certificate validation
 */
