import React, { useState, useEffect, useRef } from 'react';
import { AnimatedDumbbell, AnimatedStar, AnimatedCheckmark, AnimatedCoin, LiftLinkLogo } from './AnimatedSVGs';

// Main Verification Flow Component
const VerificationFlow = ({ onComplete, userProfile = null }) => {
  const [currentStep, setCurrentStep] = useState('role-selection');
  const [verificationData, setVerificationData] = useState({
    role: null,
    sessionId: null,
    idVerified: false,
    selfieVerified: false,
    certificationVerified: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showRoleChangeNotice, setShowRoleChangeNotice] = useState(false);

  // TEMPORARY BYPASS FOR DEVELOPMENT - Remove in production
  const [bypassVerification, setBypassVerification] = useState(false);

  // Check for bypass parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('bypass') === 'true' || urlParams.get('dev') === 'true') {
      setBypassVerification(true);
    }
  }, []);

  // Quick bypass function for development
  const handleBypassVerification = (role) => {
    const completeVerificationData = {
      role: role || 'trainee',
      sessionId: 'dev_bypass_session',
      idVerified: true,
      selfieVerified: true,
      certificationVerified: role === 'trainer'
    };
    
    setVerificationData(completeVerificationData);
    
    // Show completion step briefly then complete
    setCurrentStep('verification-complete');
    setTimeout(() => {
      // Pass the verification data to onComplete
      onComplete(completeVerificationData);
    }, 2000);
  };

  const steps = {
    'role-selection': { title: 'Choose Your Role', step: 1 },
    'id-upload': { title: 'Verify Your Identity', step: 2 },
    'selfie-capture': { title: 'Take a Selfie', step: 3 },
    'certification-upload': { title: 'Upload Certifications', step: 4 }, // Trainer only
    'verification-complete': { title: 'Verification Complete', step: 5 }
  };

  const totalSteps = verificationData.role === 'trainer' ? 4 : 3;

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Navigation helper function
  const goBack = () => {
    // Add confirmation for steps where user might lose progress
    const stepsWithProgress = ['selfie-capture', 'certification-upload'];
    
    if (stepsWithProgress.includes(currentStep) && !loading) {
      const confirmBack = window.confirm(
        'Are you sure you want to go back? You will need to re-upload your verification documents.'
      );
      if (!confirmBack) {
        return;
      }
    }
    
    setError(''); // Clear any errors when going back
    setUploadProgress(0); // Reset upload progress
    
    switch (currentStep) {
      case 'id-upload':
        setCurrentStep('role-selection');
        setShowRoleChangeNotice(true);
        // Reset role data if going back to role selection
        setVerificationData(prev => ({
          ...prev,
          role: null,
          sessionId: null,
          idVerified: false,
          selfieVerified: false,
          certificationVerified: false
        }));
        // Hide notice after 3 seconds and scroll to top
        setTimeout(() => {
          setShowRoleChangeNotice(false);
          scrollToTop();
        }, 3000);
        scrollToTop();
        break;
      case 'selfie-capture':
        setCurrentStep('id-upload');
        setVerificationData(prev => ({
          ...prev,
          idVerified: false
        }));
        scrollToTop();
        break;
      case 'certification-upload':
        setCurrentStep('selfie-capture');
        setVerificationData(prev => ({
          ...prev,
          selfieVerified: false
        }));
        scrollToTop();
        break;
      case 'verification-complete':
        if (verificationData.role === 'trainer') {
          setCurrentStep('certification-upload');
          setVerificationData(prev => ({
            ...prev,
            certificationVerified: false
          }));
        } else {
          setCurrentStep('selfie-capture');
          setVerificationData(prev => ({
            ...prev,
            selfieVerified: false
          }));
        }
        scrollToTop();
        break;
      default:
        break;
    }
  };

  // Check if back button should be shown
  const showBackButton = currentStep !== 'role-selection';

  // Smooth scroll to top when step changes
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  };

  // Start verification session
  const startVerificationSession = async (role) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/verification/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        let errorMessage = "Failed to start verification session. Please try again.";
        
        try {
          const errorData = await response.json();
          // Handle different error response formats
          if (typeof errorData.detail === 'string' && errorData.detail !== '[object Object]') {
            errorMessage = errorData.detail;
          } else if (typeof errorData.message === 'string' && errorData.message !== '[object Object]') {
            errorMessage = errorData.message;
          } else if (typeof errorData.error === 'string' && errorData.error !== '[object Object]') {
            errorMessage = errorData.error;
          }
          // If any field contains [object Object], use our default message
          if (errorMessage.includes('[object Object]')) {
            errorMessage = "Failed to start verification session. Please try again.";
          }
        } catch (jsonError) {
          // If JSON parsing fails, use default message
          errorMessage = "Failed to start verification session. Please try again.";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      setVerificationData(prev => ({
        ...prev,
        role,
        sessionId: data.session_id
      }));
      
      setCurrentStep('id-upload');
      scrollToTop();
    } catch (err) {
      // Final safety check for [object Object] in error message
      let finalErrorMessage = err.message;
      if (!finalErrorMessage || finalErrorMessage.includes('[object Object]') || finalErrorMessage === 'undefined') {
        finalErrorMessage = "Failed to start verification session. Please try again.";
      }
      setError(finalErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Upload ID document
  const uploadIdDocument = async (file, documentType, dateOfBirth) => {
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', verificationData.sessionId);
      formData.append('document_type', documentType);
      formData.append('date_of_birth', dateOfBirth);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`${API_BASE_URL}/api/verification/enhanced-upload-id`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        let errorMessage = "We couldn't verify your ID. Please upload a clear picture of your government ID.";
        
        try {
          const errorData = await response.json();
          // Handle different error response formats
          if (typeof errorData.detail === 'string' && errorData.detail !== '[object Object]') {
            errorMessage = errorData.detail;
          } else if (typeof errorData.message === 'string' && errorData.message !== '[object Object]') {
            errorMessage = errorData.message;
          } else if (typeof errorData.error === 'string' && errorData.error !== '[object Object]') {
            errorMessage = errorData.error;
          }
          // If any field contains [object Object], use our default message
          if (errorMessage.includes('[object Object]')) {
            errorMessage = "We couldn't verify your ID. Please upload a clear picture of your government ID.";
          }
        } catch (jsonError) {
          // If JSON parsing fails, use default message
          errorMessage = "We couldn't verify your ID. Please upload a clear picture of your government ID.";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      setVerificationData(prev => ({
        ...prev,
        idVerified: true
      }));
      
      setTimeout(() => {
        setCurrentStep('selfie-capture');
        setUploadProgress(0);
        scrollToTop();
      }, 1000);
      
    } catch (err) {
      // Final safety check for [object Object] in error message
      let finalErrorMessage = err.message;
      if (!finalErrorMessage || finalErrorMessage.includes('[object Object]') || finalErrorMessage === 'undefined') {
        finalErrorMessage = "We couldn't verify your ID. Please upload a clear picture of your government ID.";
      }
      setError(finalErrorMessage);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Upload selfie
  const uploadSelfie = async (file) => {
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', verificationData.sessionId);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 90));
      }, 200);

      const response = await fetch(`${API_BASE_URL}/api/verification/upload-selfie`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userProfile?.token || 'demo_user'}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        let errorMessage = "We couldn't verify your selfie. Please take a clear photo of your face.";
        
        try {
          const errorData = await response.json();
          // Handle different error response formats
          if (typeof errorData.detail === 'string' && errorData.detail !== '[object Object]') {
            errorMessage = errorData.detail;
          } else if (typeof errorData.message === 'string' && errorData.message !== '[object Object]') {
            errorMessage = errorData.message;
          } else if (typeof errorData.error === 'string' && errorData.error !== '[object Object]') {
            errorMessage = errorData.error;
          }
          // If any field contains [object Object], use our default message
          if (errorMessage.includes('[object Object]')) {
            errorMessage = "We couldn't verify your selfie. Please take a clear photo of your face.";
          }
        } catch (jsonError) {
          // If JSON parsing fails, use default message
          errorMessage = "We couldn't verify your selfie. Please take a clear photo of your face.";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      setVerificationData(prev => ({
        ...prev,
        selfieVerified: true
      }));
      
      setTimeout(() => {
        if (verificationData.role === 'trainer') {
          setCurrentStep('certification-upload');
        } else {
          setCurrentStep('verification-complete');
        }
        setUploadProgress(0);
        scrollToTop();
      }, 1000);
      
    } catch (err) {
      // Final safety check for [object Object] in error message
      let finalErrorMessage = err.message;
      if (!finalErrorMessage || finalErrorMessage.includes('[object Object]') || finalErrorMessage === 'undefined') {
        finalErrorMessage = "We couldn't verify your selfie. Please take a clear photo of your face.";
      }
      setError(finalErrorMessage);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Upload certification (Trainer only)
  const uploadCertification = async (file) => {
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', verificationData.sessionId);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const response = await fetch(`${API_BASE_URL}/api/verification/enhanced-upload-certification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userProfile?.token || 'demo_trainer'}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        let errorMessage = "We couldn't verify your certification. Please upload a clear picture of your fitness certification.";
        
        try {
          const errorData = await response.json();
          // Handle different error response formats
          if (typeof errorData.detail === 'string' && errorData.detail !== '[object Object]') {
            errorMessage = errorData.detail;
          } else if (typeof errorData.message === 'string' && errorData.message !== '[object Object]') {
            errorMessage = errorData.message;
          } else if (typeof errorData.error === 'string' && errorData.error !== '[object Object]') {
            errorMessage = errorData.error;
          }
          // If any field contains [object Object], use our default message
          if (errorMessage.includes('[object Object]')) {
            errorMessage = "We couldn't verify your certification. Please upload a clear picture of your fitness certification.";
          }
        } catch (jsonError) {
          // If JSON parsing fails, use default message
          errorMessage = "We couldn't verify your certification. Please upload a clear picture of your fitness certification.";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      setVerificationData(prev => ({
        ...prev,
        certificationVerified: true
      }));
      
      setTimeout(() => {
        setCurrentStep('verification-complete');
        setUploadProgress(0);
        scrollToTop();
      }, 1000);
      
    } catch (err) {
      // Final safety check for [object Object] in error message
      let finalErrorMessage = err.message;
      if (!finalErrorMessage || finalErrorMessage.includes('[object Object]') || finalErrorMessage === 'undefined') {
        finalErrorMessage = "We couldn't verify your certification. Please upload a clear picture of your fitness certification.";
      }
      setError(finalErrorMessage);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-scroll-container" style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '16px',
      paddingTop: 'calc(80px + env(safe-area-inset-top))', // iOS safe area
      paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', // iOS safe area
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      overflowY: 'auto',
      fontSize: '16px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      scrollBehavior: 'smooth',
      WebkitOverflowScrolling: 'touch',
      overscrollBehaviorY: 'contain'
    }}>
      {/* CSS Animations for Matrix theme + Mobile optimizations */}
      <style>
        {`
          /* Mobile-first responsive design */
          * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: rgba(196, 214, 0, 0.2);
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
          
          /* Smooth scrolling for enhanced mobile UX */
          html {
            scroll-behavior: smooth;
            -webkit-scroll-behavior: smooth;
          }
          
          /* Smooth scrolling for all scrollable containers */
          * {
            scroll-behavior: smooth;
          }
          
          /* Enhanced mobile scrolling */
          .mobile-scroll-container {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-y: contain;
          }
          
          /* Smooth focus scrolling for form inputs */
          input:focus, select:focus, textarea:focus {
            scroll-margin-top: 100px;
            scroll-behavior: smooth;
          }
          
          /* Enhanced scroll snap for better mobile UX */
          .verification-step {
            scroll-snap-align: start;
            scroll-margin-top: 80px;
          }
          
          /* Momentum scrolling for iOS */
          @supports (-webkit-overflow-scrolling: touch) {
            .mobile-scroll-container {
              -webkit-overflow-scrolling: touch;
            }
          }
          
          /* Safe area support for iOS */
          @supports (padding: max(0px)) {
            .mobile-safe-area {
              padding-left: max(16px, env(safe-area-inset-left));
              padding-right: max(16px, env(safe-area-inset-right));
            }
          }
          
          /* Touch-optimized buttons */
          .mobile-button {
            min-height: 48px !important;
            min-width: 48px !important;
            font-size: 1.1em !important;
            border-radius: 12px !important;
            margin: 8px 0 !important;
            padding: 12px 16px !important;
            cursor: pointer !important;
            touch-action: manipulation !important;
            -webkit-tap-highlight-color: rgba(196, 214, 0, 0.2) !important;
          }
          
          /* Touch-optimized inputs */
          .mobile-input {
            min-height: 44px !important;
            font-size: 1em !important;
            border-radius: 12px !important;
            margin: 8px 0 !important;
            padding: 12px 16px !important;
            width: 100% !important;
            -webkit-appearance: none !important;
            appearance: none !important;
          }
          
          /* Mobile form optimization */
          .mobile-form {
            width: 100% !important;
            gap: 12px !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          /* Mobile header optimization */
          .mobile-header {
            font-size: 1.3em !important;
            font-weight: bold !important;
            margin: 0 0 12px 0 !important;
            line-height: 1.4 !important;
          }
          
          /* Mobile image optimization */
          .mobile-image {
            max-width: 100% !important;
            height: auto !important;
            border-radius: 12px !important;
          }
          
          @keyframes matrixGlow {
            0%, 100% { 
              filter: drop-shadow(0 0 4px rgba(196, 214, 0, 0.5));
              opacity: 0.8;
            }
            50% { 
              filter: drop-shadow(0 0 8px rgba(196, 214, 0, 0.8));
              opacity: 1;
            }
          }
          
          @keyframes backButtonPulse {
            0%, 100% { 
              box-shadow: 0 4px 12px rgba(196, 214, 0, 0.15);
            }
            50% { 
              box-shadow: 0 4px 12px rgba(196, 214, 0, 0.25), 0 0 20px rgba(196, 214, 0, 0.1);
            }
          }
          
          .verification-back-btn {
            animation: backButtonPulse 3s infinite;
          }
          
          .verification-back-btn svg {
            animation: matrixGlow 2s infinite;
          }
          
          @keyframes fadeInOut {
            0% { 
              opacity: 0; 
              transform: translateY(-10px); 
            }
            10%, 90% { 
              opacity: 1; 
              transform: translateY(0); 
            }
            100% { 
              opacity: 0; 
              transform: translateY(-10px); 
            }
          }
          
          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            .auto-color-scheme {
              color-scheme: dark;
            }
          }
          
          @media (prefers-color-scheme: light) {
            .auto-color-scheme {
              color-scheme: light;
            }
          }
          
          /* Mobile viewport optimization */
          @media screen and (max-width: 480px) {
            .mobile-responsive {
              font-size: 14px !important;
              padding: 12px !important;
            }
            
            .mobile-button-small {
              min-height: 44px !important;
              font-size: 1em !important;
              padding: 10px 14px !important;
            }
          }
        `}
      </style>
      {/* Mobile-Optimized Progress Header */}
      <div className="mobile-safe-area auto-color-scheme" style={{
        position: 'fixed',
        top: 'env(safe-area-inset-top, 0px)',
        left: 0,
        right: 0,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px',
        zIndex: 100,
        boxSizing: 'border-box'
      }}>
        {/* Mobile-Optimized Back Button */}
        {showBackButton && (
          <button
            className="verification-back-btn mobile-button"
            onClick={goBack}
            disabled={loading}
            style={{
              position: 'absolute',
              top: '50%',
              left: '16px',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(135deg, rgba(196, 214, 0, 0.2), rgba(178, 255, 102, 0.1))',
              border: '1px solid rgba(196, 214, 0, 0.4)',
              borderRadius: '12px',
              minHeight: '48px',
              padding: '12px 16px',
              color: '#C4D600',
              fontSize: '1em',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.5 : 1,
              backdropFilter: 'blur(10px)',
              zIndex: 101,
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'rgba(196, 214, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(135deg, rgba(196, 214, 0, 0.3), rgba(178, 255, 102, 0.2))';
                e.target.style.borderColor = 'rgba(196, 214, 0, 0.6)';
                e.target.style.transform = 'translateY(-50%) scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(135deg, rgba(196, 214, 0, 0.2), rgba(178, 255, 102, 0.1))';
                e.target.style.borderColor = 'rgba(196, 214, 0, 0.4)';
                e.target.style.transform = 'translateY(-50%) scale(1)';
              }
            }}
          >
            {/* Touch-optimized arrow icon */}
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path 
                d="M19 12H5M5 12L12 19M5 12L12 5" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
        )}
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          marginLeft: showBackButton ? '90px' : '0',
          transition: 'margin-left 0.3s ease'
        }}>
          <h2 className="mobile-header" style={{
            fontSize: '1.2em',
            fontWeight: '600',
            margin: 0,
            lineHeight: '1.4'
          }}>
            {steps[currentStep]?.title}
          </h2>
          <span style={{
            fontSize: '0.9em',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap'
          }}>
            {steps[currentStep]?.step}/{totalSteps}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(196, 214, 0, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(steps[currentStep]?.step / totalSteps) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #C4D600, #B2FF66)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Mobile-Optimized Main Content */}
      <div className="mobile-safe-area mobile-scroll-container" style={{
        width: '100%',
        maxWidth: '100vw',
        margin: 'calc(80px + env(safe-area-inset-top)) auto 0',
        padding: '0 16px',
        boxSizing: 'border-box',
        scrollBehavior: 'smooth'
      }}>
        {/* Mobile-Optimized Error Display */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.15), rgba(220, 38, 127, 0.1))',
            border: '1px solid rgba(255, 68, 68, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            color: '#FF6B6B',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Cyberpunk glow effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #FF4444, transparent)',
              animation: 'pulse 2s infinite'
            }} />
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                minWidth: '24px',
                minHeight: '24px',
                borderRadius: '50%',
                background: '#FF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: 'white',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                !
              </div>
              <span style={{
                fontSize: '1em',
                fontWeight: '600',
                color: '#FF6B6B',
                lineHeight: '1.4'
              }}>
                Verification Error
              </span>
            </div>
            
            <p style={{
              margin: 0,
              fontSize: '0.95em',
              lineHeight: '1.5',
              color: '#FFB3B3',
              wordWrap: 'break-word',
              hyphens: 'auto'
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Mobile-Optimized Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            textAlign: 'center',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              marginBottom: '16px'
            }}>
              <AnimatedDumbbell size={40} color="#C4D600" />
            </div>
            <p style={{ 
              marginBottom: '12px',
              fontSize: '1.1em',
              fontWeight: '500'
            }}>
              Uploading...
            </p>
            <div style={{
              width: '100%',
              height: '12px',
              background: 'rgba(196, 214, 0, 0.2)',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #C4D600, #B2FF66)',
                transition: 'width 0.2s ease',
                borderRadius: '6px'
              }} />
            </div>
            <p style={{
              fontSize: '1em',
              color: 'var(--text-secondary)',
              marginTop: '12px',
              fontWeight: '600'
            }}>
              {uploadProgress}%
            </p>
          </div>
        )}

        {/* Step Components */}
        {currentStep === 'role-selection' && (
          <div className="verification-step">
            <RoleSelectionStep 
              onSelectRole={startVerificationSession}
              loading={loading}
              showChangeNotice={showRoleChangeNotice}
              bypassMode={bypassVerification}
              onBypass={handleBypassVerification}
            />
          </div>
        )}
        
        {currentStep === 'id-upload' && (
          <div className="verification-step">
            <IdUploadStep 
              onUpload={uploadIdDocument}
              loading={loading}
            />
          </div>
        )}
        
        {currentStep === 'selfie-capture' && (
          <div className="verification-step">
            <SelfieStep 
              onCapture={uploadSelfie}
              loading={loading}
            />
          </div>
        )}
        
        {currentStep === 'certification-upload' && (
          <div className="verification-step">
            <CertificationStep 
              onUpload={uploadCertification}
              loading={loading}
            />
          </div>
        )}
        
        {currentStep === 'verification-complete' && (
          <div className="verification-step">
            <CompletionStep 
              role={verificationData.role}
              onComplete={onComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Mobile-Optimized Role Selection Step
const RoleSelectionStep = ({ onSelectRole, loading, showChangeNotice, bypassMode, onBypass }) => {
  return (
    <div className="glass-card mobile-form auto-color-scheme" style={{
      padding: '24px',
      textAlign: 'center',
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: '12px'
    }}>
      {/* Development Bypass Notice */}
      {bypassMode && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.15), rgba(255, 140, 0, 0.1))',
          border: '1px solid rgba(255, 165, 0, 0.4)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          color: '#FFA500',
          fontSize: '0.9em',
          lineHeight: '1.4'
        }}>
          🚀 Development Mode - Skip Verification Available
        </div>
      )}
      
      {/* Role Change Notice */}
      {showChangeNotice && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(196, 214, 0, 0.15), rgba(178, 255, 102, 0.1))',
          border: '1px solid rgba(196, 214, 0, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          color: '#C4D600',
          fontSize: '0.95em',
          animation: 'fadeInOut 3s ease-in-out',
          lineHeight: '1.4'
        }}>
          ✨ You're back at role selection - choose the role that's right for you!
        </div>
      )}
      
      <div style={{ marginBottom: '24px' }}>
        <LiftLinkLogo size={60} animate={true} />
      </div>
      
      <h3 className="mobile-header" style={{
        fontSize: '1.4em',
        fontWeight: '600',
        marginBottom: '16px',
        lineHeight: '1.3'
      }}>
        Welcome to LiftLink
      </h3>
      
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: '24px',
        fontSize: '1em',
        lineHeight: '1.5',
        padding: '0 8px'
      }}>
        To get started, please select your role. Both roles require age verification (18+).
        <br />
        <span style={{ fontSize: '0.9em', color: 'var(--text-tertiary)', marginTop: '8px', display: 'block' }}>
          💡 Don't worry - you can go back and change your selection at any time.
        </span>
      </p>
      
      <div className="mobile-form" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%'
      }}>
        <button
          className="btn-primary mobile-button"
          onClick={() => onSelectRole('trainee')}
          disabled={loading}
          style={{
            width: '100%',
            minHeight: '56px',
            fontSize: '1.1em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            borderRadius: '12px',
            padding: '16px 20px',
            fontWeight: '600',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'rgba(255, 255, 255, 0.2)'
          }}
        >
          <AnimatedStar size={28} color="white" />
          I'm Looking for a Trainer
        </button>
        
        <button
          className="btn-secondary mobile-button"
          onClick={() => onSelectRole('trainer')}
          disabled={loading}
          style={{
            width: '100%',
            minHeight: '56px',
            fontSize: '1.1em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            borderRadius: '12px',
            padding: '16px 20px',
            fontWeight: '600',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'rgba(196, 214, 0, 0.2)'
          }}
        >
          <AnimatedDumbbell size={28} color="#C4D600" />
          I'm a Fitness Trainer
        </button>

        {/* Development Bypass Buttons */}
        {bypassMode && (
          <>
            <div style={{
              margin: '20px 0 10px',
              borderTop: '1px solid rgba(255, 165, 0, 0.3)',
              paddingTop: '20px'
            }}>
              <p style={{
                fontSize: '0.9em',
                color: '#FFA500',
                marginBottom: '12px',
                fontWeight: '500'
              }}>
                🚀 Quick Access (Development Only)
              </p>
            </div>
            
            <button
              onClick={() => onBypass('trainee')}
              style={{
                width: '100%',
                minHeight: '48px',
                fontSize: '1em',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 140, 0, 0.1))',
                border: '1px solid rgba(255, 165, 0, 0.4)',
                borderRadius: '12px',
                color: '#FFA500',
                fontWeight: '500',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              ⚡ Skip Verification as Trainee
            </button>
            
            <button
              onClick={() => onBypass('trainer')}
              style={{
                width: '100%',
                minHeight: '48px',
                fontSize: '1em',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 140, 0, 0.1))',
                border: '1px solid rgba(255, 165, 0, 0.4)',
                borderRadius: '12px',
                color: '#FFA500',
                fontWeight: '500',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              ⚡ Skip Verification as Trainer
            </button>
          </>
        )}
      </div>
      
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'rgba(196, 214, 0, 0.1)',
        borderRadius: '12px',
        fontSize: '0.9em',
        color: 'var(--text-secondary)',
        lineHeight: '1.5'
      }}>
        <p style={{ margin: 0 }}>
          🔒 Your personal information is encrypted and secure.
          We verify all users to maintain a safe community.
        </p>
      </div>
    </div>
  );
};

// Mobile-Optimized ID Upload Step
const IdUploadStep = ({ onUpload, onSkip, loading }) => {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('drivers_license');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Ensure we have a proper File object
      if (selectedFile instanceof File) {
        setFile(selectedFile);
      } else {
        // Handle case where selectedFile might not be a proper File object
        console.warn('Selected file is not a proper File object:', selectedFile);
        setFile(null);
        alert('Invalid file selected. Please try again.');
      }
    } else {
      setFile(null);
    }
  };

  const handleSubmit = () => {
    if (!file || !dateOfBirth) {
      alert('Please select a file and enter your date of birth.');
      return;
    }
    onUpload(file, documentType, dateOfBirth);
  };

  const handleSkip = () => {
    if (window.confirm('Are you sure you want to skip ID verification? This may limit some app features.')) {
      onSkip();
    }
  };

  return (
    <div className="glass-card mobile-form auto-color-scheme" style={{ 
      padding: '24px', 
      width: '100%', 
      boxSizing: 'border-box',
      borderRadius: '12px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '28px'
        }}>
          🆔
        </div>
        
        <h3 className="mobile-header" style={{
          fontSize: '1.3em',
          fontWeight: '600',
          marginBottom: '8px',
          lineHeight: '1.3'
        }}>
          Upload Your ID
        </h3>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95em',
          lineHeight: '1.4'
        }}>
          We need to verify you're 18 or older
        </p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '1em',
          fontWeight: '500',
          marginBottom: '8px',
          color: 'var(--text-primary)'
        }}>
          Document Type
        </label>
        <select
          className="mobile-input"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          style={{
            width: '100%',
            minHeight: '48px',
            padding: '12px 16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            background: 'var(--glass-bg)',
            color: 'var(--text-primary)',
            fontSize: '1em',
            appearance: 'none',
            WebkitAppearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C4D600' stroke-width='2'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '20px',
            paddingRight: '48px'
          }}
        >
          <option value="drivers_license">Driver's License</option>
          <option value="passport">Passport</option>
          <option value="national_id">National ID</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '1em',
          fontWeight: '500',
          marginBottom: '8px',
          color: 'var(--text-primary)'
        }}>
          Date of Birth
        </label>
        <input
          className="mobile-input"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
          style={{
            width: '100%',
            minHeight: '48px',
            padding: '12px 16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            background: 'var(--glass-bg)',
            color: 'var(--text-primary)',
            fontSize: '1em',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf"
          style={{ display: 'none' }}
        />
        
        <button
          className="mobile-button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            minHeight: '56px',
            padding: '16px 20px',
            border: '2px dashed rgba(196, 214, 0, 0.5)',
            borderRadius: '12px',
            background: file ? 'rgba(196, 214, 0, 0.1)' : 'transparent',
            color: file ? '#C4D600' : 'var(--text-secondary)',
            fontSize: '1em',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'rgba(196, 214, 0, 0.2)',
            lineHeight: '1.4',
            textAlign: 'center'
          }}
        >
          {file ? `Selected: ${file.name || 'File selected'}` : 'Choose ID Document'}
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          className="mobile-button"
          onClick={handleSkip}
          disabled={loading}
          style={{
            flex: 1,
            minHeight: '52px',
            fontSize: '1.1em',
            fontWeight: '600',
            borderRadius: '12px',
            touchAction: 'manipulation',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'var(--text-secondary)'
          }}
        >
          Skip
        </button>
        
        <button
          className="btn-primary mobile-button"
          onClick={handleSubmit}
          disabled={loading || !file || !dateOfBirth}
          style={{
            flex: 2,
            minHeight: '52px',
            fontSize: '1.1em',
            fontWeight: '600',
            borderRadius: '12px',
            touchAction: 'manipulation'
          }}
        >
          {loading ? 'Verifying...' : 'Verify Identity'}
        </button>
      </div>
      
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(196, 214, 0, 0.1)',
        borderRadius: '12px',
        fontSize: '0.9em',
        color: 'var(--text-secondary)',
        lineHeight: '1.5'
      }}>
        ✓ Government-issued ID required<br/>
        ✓ Must be 18 or older<br/>
        ✓ Clear, readable image or PDF
      </div>
    </div>
  );
};

// Mobile-Optimized Selfie Step
const SelfieStep = ({ onCapture, loading }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Ensure we have a proper File object
      if (selectedFile instanceof File) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(selectedFile);
      } else {
        // Handle case where selectedFile might not be a proper File object
        console.warn('Selected file is not a proper File object:', selectedFile);
        setFile(null);
        setPreview(null);
        alert('Invalid file selected. Please try again.');
      }
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      alert('Please take a selfie first.');
      return;
    }
    onCapture(file);
  };

  return (
    <div className="glass-card mobile-form auto-color-scheme" style={{ 
      padding: '24px', 
      width: '100%', 
      boxSizing: 'border-box',
      borderRadius: '12px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '28px'
        }}>
          📸
        </div>
        
        <h3 className="mobile-header" style={{
          fontSize: '1.3em',
          fontWeight: '600',
          marginBottom: '8px',
          lineHeight: '1.3'
        }}>
          Take a Selfie
        </h3>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95em',
          lineHeight: '1.4'
        }}>
          We'll match your face to your ID for security
        </p>
      </div>
      
      {preview && (
        <div style={{
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <img
            className="mobile-image"
            src={preview}
            alt="Selfie preview"
            style={{
              width: '180px',
              height: '180px',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '4px solid #C4D600',
              maxWidth: '100%'
            }}
          />
        </div>
      )}
      
      <div style={{ marginBottom: '24px' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          capture="user"
          style={{ display: 'none' }}
        />
        
        <button
          className="mobile-button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            minHeight: '56px',
            padding: '16px 20px',
            border: '2px dashed rgba(196, 214, 0, 0.5)',
            borderRadius: '12px',
            background: file ? 'rgba(196, 214, 0, 0.1)' : 'transparent',
            color: file ? '#C4D600' : 'var(--text-secondary)',
            fontSize: '1em',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'rgba(196, 214, 0, 0.2)',
            lineHeight: '1.4',
            textAlign: 'center'
          }}
        >
          {file ? 'Retake Selfie' : '📱 Take Selfie'}
        </button>
      </div>
      
      <button
        className="btn-primary mobile-button"
        onClick={handleSubmit}
        disabled={loading || !file}
        style={{
          width: '100%',
          minHeight: '52px',
          fontSize: '1.1em',
          fontWeight: '600',
          borderRadius: '12px',
          touchAction: 'manipulation'
        }}
      >
        {loading ? 'Verifying...' : 'Verify Selfie'}
      </button>
      
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(196, 214, 0, 0.1)',
        borderRadius: '12px',
        fontSize: '0.9em',
        color: 'var(--text-secondary)',
        lineHeight: '1.5'
      }}>
        ✓ Look directly at camera<br/>
        ✓ Good lighting required<br/>
        ✓ No hats or sunglasses
      </div>
    </div>
  );
};

// Mobile-Optimized Certification Step (Trainer only)
const CertificationStep = ({ onUpload, loading }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Ensure we have a proper File object
      if (selectedFile instanceof File) {
        setFile(selectedFile);
      } else {
        // Handle case where selectedFile might not be a proper File object
        console.warn('Selected file is not a proper File object:', selectedFile);
        setFile(null);
        alert('Invalid file selected. Please try again.');
      }
    } else {
      setFile(null);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      alert('Please upload your certification.');
      return;
    }
    onUpload(file);
  };

  return (
    <div className="glass-card mobile-form auto-color-scheme" style={{ 
      padding: '24px', 
      width: '100%', 
      boxSizing: 'border-box',
      borderRadius: '12px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '28px'
        }}>
          🏆
        </div>
        
        <h3 className="mobile-header" style={{
          fontSize: '1.3em',
          fontWeight: '600',
          marginBottom: '8px',
          lineHeight: '1.3'
        }}>
          Upload Certification
        </h3>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95em',
          lineHeight: '1.4'
        }}>
          Prove your fitness expertise with valid certifications
        </p>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf"
          style={{ display: 'none' }}
        />
        
        <button
          className="mobile-button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            minHeight: '56px',
            padding: '16px 20px',
            border: '2px dashed rgba(196, 214, 0, 0.5)',
            borderRadius: '12px',
            background: file ? 'rgba(196, 214, 0, 0.1)' : 'transparent',
            color: file ? '#C4D600' : 'var(--text-secondary)',
            fontSize: '1em',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'rgba(196, 214, 0, 0.2)',
            lineHeight: '1.4',
            textAlign: 'center'
          }}
        >
          {file ? `Selected: ${file.name || 'File selected'}` : 'Choose Certification Document'}
        </button>
      </div>
      
      <button
        className="btn-primary mobile-button"
        onClick={handleSubmit}
        disabled={loading || !file}
        style={{
          width: '100%',
          minHeight: '52px',
          fontSize: '1.1em',
          fontWeight: '600',
          borderRadius: '12px',
          touchAction: 'manipulation'
        }}
      >
        {loading ? 'Validating...' : 'Validate Certification'}
      </button>
      
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(255, 68, 68, 0.1)',
        borderRadius: '12px',
        fontSize: '0.9em',
        color: '#FF4444',
        lineHeight: '1.5'
      }}>
        ⚠️ Real validation required:<br/>
        • Valid NASM, ACE, ISSA, ACSM, or CSCS certification<br/>
        • Clear, readable document<br/>
        • Non-expired certification<br/>
        • Invalid documents will be auto-rejected
      </div>
      
      <div style={{
        marginTop: '16px',
        padding: '16px',
        background: 'rgba(196, 214, 0, 0.1)',
        borderRadius: '12px',
        fontSize: '0.9em',
        color: 'var(--text-secondary)',
        lineHeight: '1.5'
      }}>
        Accepted: NASM, ACE, ISSA, ACSM, CSCS certifications
      </div>
    </div>
  );
};

// Mobile-Optimized Completion Step
const CompletionStep = ({ role, onComplete }) => {
  return (
    <div className="glass-card mobile-form auto-color-scheme" style={{
      padding: '24px',
      textAlign: 'center',
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: '12px'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <AnimatedCheckmark size={44} color="white" />
        </div>
        
        <h3 className="mobile-header" style={{
          fontSize: '1.4em',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#C4D600',
          lineHeight: '1.3'
        }}>
          Verification Complete!
        </h3>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1em',
          marginBottom: '20px',
          lineHeight: '1.5',
          padding: '0 8px'
        }}>
          Welcome to LiftLink! Your {role} account is now verified and ready to use.
        </p>
        
        {role === 'trainer' && (
          <div style={{
            padding: '16px',
            background: 'rgba(196, 214, 0, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.95em',
              color: 'var(--text-primary)',
              lineHeight: '1.5'
            }}>
              🎉 Congratulations! You now have access to the Trainer CRM Dashboard
              to manage your clients and grow your fitness business.
            </p>
          </div>
        )}
      </div>
      
      <button
        className="btn-primary mobile-button"
        onClick={onComplete}
        style={{
          width: '100%',
          minHeight: '56px',
          fontSize: '1.1em',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          borderRadius: '12px',
          touchAction: 'manipulation'
        }}
      >
        <AnimatedCoin size={28} color="white" />
        {role === 'trainer' ? 'Access Trainer Dashboard' : 'Start Your Fitness Journey'}
      </button>
    </div>
  );
};

export default VerificationFlow;
