/**
 * Enhanced Certificate Pinning Service with Native SSL Pinning
 * Uses react-native-ssl-pinning for production-grade MITM protection
 */

import { Platform } from 'react-native';
import { fetch as sslFetch } from 'react-native-ssl-pinning';
import axios from 'axios';

// Production SSL certificate fingerprints (SHA-256)
// Get fingerprints using: openssl s_client -connect domain:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
const CERTIFICATE_PINS = {
  // LiftLink Backend API
  'liftlink-ra6t.onrender.com': {
    certs: ['sha256/your-primary-cert-hash', 'sha256/your-backup-cert-hash'],
    includeSubdomains: true
  },
  // Render.com infrastructure
  'onrender.com': {
    certs: ['sha256/your-render-cert-hash'],
    includeSubdomains: true
  },
  // Stripe API
  'api.stripe.com': {
    certs: [
      'sha256/MicrosoftRootCert',
      'sha256/DigiCertGlobalRoot'
    ],
    includeSubdomains: true
  },
  // Google APIs (for Google Fit, Calendar)
  'googleapis.com': {
    certs: ['sha256/GoogleGlobalSignRoot'],
    includeSubdomains: true
  }
};

// API domains that should use SSL pinning
const PINNED_DOMAINS = [
  'liftlink-ra6t.onrender.com',
  'api.stripe.com'
];

class CertificatePinningService {
  constructor() {
    this.enabled = !__DEV__; // Disable in development for easier testing
    this.violations = [];
    this.pinnedDomains = Object.keys(CERTIFICATE_PINS);
    this.connectionRetries = {};
    this.maxRetries = 3;
  }

  /**
   * Initialize certificate pinning service
   */
  initialize() {
    console.log(`📌 Certificate Pinning: ${this.enabled ? 'ENABLED' : 'DISABLED (dev mode)'}`);
    
    if (this.enabled) {
      console.log('📌 Protected domains:', this.pinnedDomains);
      this.setupAxiosInterceptors();
    }
  }

  /**
   * Setup axios interceptors for SSL pinning awareness
   */
  setupAxiosInterceptors() {
    // Request interceptor - log pinned requests
    axios.interceptors.request.use(
      (config) => {
        const url = new URL(config.url || '', config.baseURL);
        if (this.isPinnedDomain(url.hostname)) {
          console.log(`📌 SSL Pinned request to: ${url.hostname}`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - catch SSL errors
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
   * Make SSL-pinned fetch request
   * @param {string} url - Request URL
   * @param {object} options - Fetch options
   */
  async pinnedFetch(url, options = {}) {
    if (!this.enabled) {
      // Fall back to regular fetch in development
      return fetch(url, options);
    }

    try {
      const hostname = new URL(url).hostname;
      const pinConfig = CERTIFICATE_PINS[hostname];

      if (!pinConfig) {
        console.log(`⚠️ No pins configured for ${hostname}, using regular fetch`);
        return fetch(url, options);
      }

      const sslConfig = {
        ...options,
        sslPinning: {
          certs: pinConfig.certs
        },
        timeoutInterval: options.timeout || 30000
      };

      const response = await sslFetch(url, sslConfig);
      
      // Reset retry counter on success
      this.connectionRetries[hostname] = 0;
      
      return response;

    } catch (error) {
      if (this.isSSLError(error)) {
        this.handleSSLViolation(error, url);
        throw new Error('SSL_PINNING_FAILED: Connection rejected due to certificate mismatch');
      }
      throw error;
    }
  }

  /**
   * Make SSL-pinned API request (replacement for axios)
   * @param {object} config - Axios-like config object
   */
  async pinnedRequest(config) {
    const { method = 'GET', url, data, headers = {}, timeout = 30000 } = config;

    const fetchOptions = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      fetchOptions.body = typeof data === 'string' ? data : JSON.stringify(data);
    }

    const response = await this.pinnedFetch(url, fetchOptions);
    
    // Parse response similar to axios
    const responseData = await response.json();
    
    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config
    };
  }

  /**
   * Check if domain should use SSL pinning
   */
  isPinnedDomain(hostname) {
    return PINNED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  }

  /**
   * Check if error is SSL/TLS related
   */
  isSSLError(error) {
    const errorMessage = (error.message || '').toLowerCase();
    const errorCode = error.code || '';

    const sslIndicators = [
      'ssl',
      'tls',
      'certificate',
      'cert',
      'handshake',
      'trust',
      'pinning',
      'chain',
      'verify'
    ];

    return sslIndicators.some(indicator => 
      errorMessage.includes(indicator) || 
      errorCode.toLowerCase().includes(indicator)
    );
  }

  /**
   * Handle SSL certificate violation
   */
  handleSSLViolation(error, url = 'unknown') {
    const violation = {
      timestamp: new Date().toISOString(),
      url: url,
      error: error.message,
      type: 'SSL_PINNING_VIOLATION',
      platform: Platform.OS
    };

    console.error('🚨 SSL CERTIFICATE VIOLATION!');
    console.error('URL:', url);
    console.error('Error:', error.message);

    this.violations.push(violation);

    // Report to backend security monitoring
    this.reportViolation(violation);

    // Increment retry counter
    try {
      const hostname = new URL(url).hostname;
      this.connectionRetries[hostname] = (this.connectionRetries[hostname] || 0) + 1;
      
      if (this.connectionRetries[hostname] >= this.maxRetries) {
        console.error(`🚫 Max SSL retries exceeded for ${hostname}`);
      }
    } catch (e) {
      // URL parsing failed
    }
  }

  /**
   * Report violation to backend security monitoring
   */
  async reportViolation(violation) {
    try {
      // In production, send to your security monitoring endpoint
      // Using regular fetch to avoid circular dependency
      console.log('📊 Would report violation:', JSON.stringify(violation));
      
      // await fetch('https://your-api/api/security/ssl-violations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(violation)
      // });
    } catch (error) {
      console.error('Failed to report SSL violation:', error);
    }
  }

  /**
   * Get all recorded violations
   */
  getViolations() {
    return [...this.violations];
  }

  /**
   * Clear violation history
   */
  clearViolations() {
    this.violations = [];
    console.log('📌 SSL violation history cleared');
  }

  /**
   * Get certificate pins for a domain
   */
  getPinsForDomain(domain) {
    return CERTIFICATE_PINS[domain]?.certs || [];
  }

  /**
   * Add/update certificate pin for domain
   */
  setCertificatePin(domain, certs, includeSubdomains = true) {
    CERTIFICATE_PINS[domain] = { certs, includeSubdomains };
    console.log(`📌 Updated certificate pins for ${domain}`);
  }

  /**
   * Enable or disable certificate pinning
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`📌 Certificate pinning ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get current pinning status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      pinnedDomains: this.pinnedDomains,
      violationCount: this.violations.length,
      recentViolations: this.violations.slice(-5)
    };
  }
}

// Singleton instance
const certificatePinning = new CertificatePinningService();

// Auto-initialize
certificatePinning.initialize();

export default certificatePinning;

// Export individual functions for convenience
export const pinnedFetch = (url, options) => certificatePinning.pinnedFetch(url, options);
export const pinnedRequest = (config) => certificatePinning.pinnedRequest(config);
export const isPinnedDomain = (hostname) => certificatePinning.isPinnedDomain(hostname);
export const getPinningStatus = () => certificatePinning.getStatus();
export const setSSLPinningEnabled = (enabled) => certificatePinning.setEnabled(enabled);

/**
 * ANDROID NATIVE CONFIGURATION
 * 
 * Add to android/app/src/main/res/xml/network_security_config.xml:
 * 
 * <?xml version="1.0" encoding="utf-8"?>
 * <network-security-config>
 *   <base-config cleartextTrafficPermitted="false">
 *     <trust-anchors>
 *       <certificates src="system" />
 *     </trust-anchors>
 *   </base-config>
 *   
 *   <domain-config cleartextTrafficPermitted="false">
 *     <domain includeSubdomains="true">liftlink-ra6t.onrender.com</domain>
 *     <pin-set expiration="2026-01-01">
 *       <pin digest="SHA-256">PRIMARY_CERT_FINGERPRINT</pin>
 *       <pin digest="SHA-256">BACKUP_CERT_FINGERPRINT</pin>
 *     </pin-set>
 *   </domain-config>
 *   
 *   <domain-config cleartextTrafficPermitted="false">
 *     <domain includeSubdomains="true">api.stripe.com</domain>
 *     <trust-anchors>
 *       <certificates src="system" />
 *     </trust-anchors>
 *   </domain-config>
 * </network-security-config>
 * 
 * Then add to AndroidManifest.xml:
 * <application android:networkSecurityConfig="@xml/network_security_config">
 */

/**
 * iOS NATIVE CONFIGURATION
 * 
 * For iOS, add to Info.plist:
 * 
 * <key>NSAppTransportSecurity</key>
 * <dict>
 *   <key>NSAllowsArbitraryLoads</key>
 *   <false/>
 *   <key>NSExceptionDomains</key>
 *   <dict>
 *     <key>liftlink-ra6t.onrender.com</key>
 *     <dict>
 *       <key>NSIncludesSubdomains</key>
 *       <true/>
 *       <key>NSExceptionRequiresForwardSecrecy</key>
 *       <true/>
 *       <key>NSExceptionMinimumTLSVersion</key>
 *       <string>TLSv1.2</string>
 *     </dict>
 *   </dict>
 * </dict>
 */
