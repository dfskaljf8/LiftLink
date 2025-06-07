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

  const steps = {
    'role-selection': { title: 'Choose Your Role', step: 1 },
    'id-upload': { title: 'Verify Your Identity', step: 2 },
    'selfie-capture': { title: 'Take a Selfie', step: 3 },
    'certification-upload': { title: 'Upload Certifications', step: 4 }, // Trainer only
    'verification-complete': { title: 'Verification Complete', step: 5 }
  };

  const totalSteps = verificationData.role === 'trainer' ? 4 : 3;

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

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
        throw new Error('Failed to start verification session');
      }

      const data = await response.json();
      
      setVerificationData(prev => ({
        ...prev,
        role,
        sessionId: data.session_id
      }));
      
      setCurrentStep('id-upload');
    } catch (err) {
      setError(err.message);
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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Certification verification failed');
      }

      const data = await response.json();
      
      setVerificationData(prev => ({
        ...prev,
        certificationVerified: true
      }));
      
      setTimeout(() => {
        setCurrentStep('verification-complete');
        setUploadProgress(0);
      }, 1000);
      
    } catch (err) {
      setError(err.message);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: 'var(--space-lg)',
      paddingTop: '80px'
    }}>
      {/* Progress Header */}
      <div style={{
        position: 'fixed',
        top: '60px',
        left: 0,
        right: 0,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: 'var(--space-md) var(--space-lg)',
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-sm)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: 0
          }}>
            {steps[currentStep]?.title}
          </h2>
          <span style={{
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            Step {steps[currentStep]?.step} of {totalSteps}
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

      {/* Main Content */}
      <div style={{
        maxWidth: '500px',
        margin: '60px auto 0',
        padding: '0 var(--space-lg)'
      }}>
        {/* Error Display */}
        {error && (
          <div style={{
            background: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid rgba(255, 68, 68, 0.3)',
            borderRadius: 'var(--border-radius)',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
            color: '#FF4444'
          }}>
            {error}
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: 'var(--border-radius)',
            padding: 'var(--space-lg)',
            marginBottom: 'var(--space-lg)',
            textAlign: 'center'
          }}>
            <div style={{
              marginBottom: 'var(--space-md)'
            }}>
              <AnimatedDumbbell size={32} color="#C4D600" />
            </div>
            <p style={{ marginBottom: 'var(--space-sm)' }}>Uploading...</p>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(196, 214, 0, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #C4D600, #B2FF66)',
                transition: 'width 0.2s ease'
              }} />
            </div>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginTop: 'var(--space-sm)'
            }}>
              {uploadProgress}%
            </p>
          </div>
        )}

        {/* Step Components */}
        {currentStep === 'role-selection' && (
          <RoleSelectionStep 
            onSelectRole={startVerificationSession}
            loading={loading}
          />
        )}
        
        {currentStep === 'id-upload' && (
          <IdUploadStep 
            onUpload={uploadIdDocument}
            loading={loading}
          />
        )}
        
        {currentStep === 'selfie-capture' && (
          <SelfieStep 
            onCapture={uploadSelfie}
            loading={loading}
          />
        )}
        
        {currentStep === 'certification-upload' && (
          <CertificationStep 
            onUpload={uploadCertification}
            loading={loading}
          />
        )}
        
        {currentStep === 'verification-complete' && (
          <CompletionStep 
            role={verificationData.role}
            onComplete={onComplete}
          />
        )}
      </div>
    </div>
  );
};

// Role Selection Step
const RoleSelectionStep = ({ onSelectRole, loading }) => {
  return (
    <div className="glass-card" style={{
      padding: 'var(--space-2xl)',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <LiftLinkLogo size={60} animate={true} />
      </div>
      
      <h3 style={{
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: 'var(--space-md)'
      }}>
        Welcome to LiftLink
      </h3>
      
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: 'var(--space-xl)',
        fontSize: '16px',
        lineHeight: '1.5'
      }}>
        To get started, please select your role. Both roles require age verification (18+).
      </p>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-lg)'
      }}>
        <button
          className="btn-primary"
          onClick={() => onSelectRole('trainee')}
          disabled={loading}
          style={{
            padding: 'var(--space-lg)',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-sm)'
          }}
        >
          <AnimatedStar size={24} color="white" />
          I'm Looking for a Trainer
        </button>
        
        <button
          className="btn-secondary"
          onClick={() => onSelectRole('trainer')}
          disabled={loading}
          style={{
            padding: 'var(--space-lg)',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-sm)'
          }}
        >
          <AnimatedDumbbell size={24} color="#C4D600" />
          I'm a Fitness Trainer
        </button>
      </div>
      
      <div style={{
        marginTop: 'var(--space-xl)',
        padding: 'var(--space-lg)',
        background: 'rgba(196, 214, 0, 0.1)',
        borderRadius: 'var(--border-radius)',
        fontSize: '14px',
        color: 'var(--text-secondary)'
      }}>
        <p style={{ margin: 0 }}>
          🔒 Your personal information is encrypted and secure.
          We verify all users to maintain a safe community.
        </p>
      </div>
    </div>
  );
};

// ID Upload Step
const IdUploadStep = ({ onUpload, loading }) => {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('drivers_license');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile instanceof File) {
      setFile(selectedFile);
    } else if (selectedFile) {
      // Handle case where selectedFile might not be a proper File object
      console.warn('Selected file is not a proper File object:', selectedFile);
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

  return (
    <div className="glass-card" style={{ padding: 'var(--space-2xl)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-lg)',
          fontSize: '24px'
        }}>
          🆔
        </div>
        
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: 'var(--space-sm)'
        }}>
          Upload Your ID
        </h3>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          We need to verify you're 18 or older
        </p>
      </div>
      
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: 'var(--space-sm)'
        }}>
          Document Type
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 'var(--border-radius)',
            background: 'var(--glass-bg)',
            color: 'var(--text-primary)',
            fontSize: '16px'
          }}
        >
          <option value="drivers_license">Driver's License</option>
          <option value="passport">Passport</option>
          <option value="national_id">National ID</option>
        </select>
      </div>
      
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: 'var(--space-sm)'
        }}>
          Date of Birth
        </label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 'var(--border-radius)',
            background: 'var(--glass-bg)',
            color: 'var(--text-primary)',
            fontSize: '16px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf"
          style={{ display: 'none' }}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: 'var(--space-lg)',
            border: '2px dashed rgba(196, 214, 0, 0.5)',
            borderRadius: 'var(--border-radius)',
            background: file ? 'rgba(196, 214, 0, 0.1)' : 'transparent',
            color: file ? '#C4D600' : 'var(--text-secondary)',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {file ? `Selected: ${file.name || 'Unknown file'}` : 'Choose ID Document'}
        </button>
      </div>
      
      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading || !file || !dateOfBirth}
        style={{
          width: '100%',
          padding: 'var(--space-lg)',
          fontSize: '16px'
        }}
      >
        {loading ? 'Verifying...' : 'Verify Identity'}
      </button>
      
      <div style={{
        marginTop: 'var(--space-lg)',
        padding: 'var(--space-md)',
        background: 'rgba(196, 214, 0, 0.1)',
        borderRadius: 'var(--border-radius)',
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        ✓ Government-issued ID required<br/>
        ✓ Must be 18 or older<br/>
        ✓ Clear, readable image or PDF
      </div>
    </div>
  );
};

// Selfie Capture Step
const SelfieStep = ({ onCapture, loading }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile instanceof File) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile) {
      // Handle case where selectedFile might not be a proper File object
      console.warn('Selected file is not a proper File object:', selectedFile);
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
    <div className="glass-card" style={{ padding: 'var(--space-2xl)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-lg)',
          fontSize: '24px'
        }}>
          📸
        </div>
        
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: 'var(--space-sm)'
        }}>
          Take a Selfie
        </h3>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          We'll match your face to your ID for security
        </p>
      </div>
      
      {preview && (
        <div style={{
          marginBottom: 'var(--space-lg)',
          textAlign: 'center'
        }}>
          <img
            src={preview}
            alt="Selfie preview"
            style={{
              width: '200px',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '3px solid #C4D600'
            }}
          />
        </div>
      )}
      
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          capture="user"
          style={{ display: 'none' }}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: 'var(--space-lg)',
            border: '2px dashed rgba(196, 214, 0, 0.5)',
            borderRadius: 'var(--border-radius)',
            background: file ? 'rgba(196, 214, 0, 0.1)' : 'transparent',
            color: file ? '#C4D600' : 'var(--text-secondary)',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {file ? 'Retake Selfie' : '📱 Take Selfie'}
        </button>
      </div>
      
      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading || !file}
        style={{
          width: '100%',
          padding: 'var(--space-lg)',
          fontSize: '16px'
        }}
      >
        {loading ? 'Verifying...' : 'Verify Selfie'}
      </button>
      
      <div style={{
        marginTop: 'var(--space-lg)',
        padding: 'var(--space-md)',
        background: 'rgba(196, 214, 0, 0.1)',
        borderRadius: 'var(--border-radius)',
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        ✓ Look directly at camera<br/>
        ✓ Good lighting required<br/>
        ✓ No hats or sunglasses
      </div>
    </div>
  );
};

// Certification Upload Step (Trainer only)
const CertificationStep = ({ onUpload, loading }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile instanceof File) {
      setFile(selectedFile);
    } else if (selectedFile) {
      // Handle case where selectedFile might not be a proper File object
      console.warn('Selected file is not a proper File object:', selectedFile);
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
    <div className="glass-card" style={{ padding: 'var(--space-2xl)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-lg)',
          fontSize: '24px'
        }}>
          🏆
        </div>
        
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: 'var(--space-sm)'
        }}>
          Upload Certification
        </h3>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          Prove your fitness expertise with valid certifications
        </p>
      </div>
      
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf"
          style={{ display: 'none' }}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: 'var(--space-lg)',
            border: '2px dashed rgba(196, 214, 0, 0.5)',
            borderRadius: 'var(--border-radius)',
            background: file ? 'rgba(196, 214, 0, 0.1)' : 'transparent',
            color: file ? '#C4D600' : 'var(--text-secondary)',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {file ? `Selected: ${file.name || 'Unknown file'}` : 'Choose Certification Document'}
        </button>
      </div>
      
      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading || !file}
        style={{
          width: '100%',
          padding: 'var(--space-lg)',
          fontSize: '16px'
        }}
      >
        {loading ? 'Validating...' : 'Validate Certification'}
      </button>
      
      <div style={{
        marginTop: 'var(--space-lg)',
        padding: 'var(--space-md)',
        background: 'rgba(255, 68, 68, 0.1)',
        borderRadius: 'var(--border-radius)',
        fontSize: '12px',
        color: '#FF4444'
      }}>
        ⚠️ Real validation required:<br/>
        • Valid NASM, ACE, ISSA, ACSM, or CSCS certification<br/>
        • Clear, readable document<br/>
        • Non-expired certification<br/>
        • Invalid documents will be auto-rejected
      </div>
      
      <div style={{
        marginTop: 'var(--space-md)',
        padding: 'var(--space-md)',
        background: 'rgba(196, 214, 0, 0.1)',
        borderRadius: 'var(--border-radius)',
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        Accepted: NASM, ACE, ISSA, ACSM, CSCS certifications
      </div>
    </div>
  );
};

// Completion Step
const CompletionStep = ({ role, onComplete }) => {
  return (
    <div className="glass-card" style={{
      padding: 'var(--space-2xl)',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(45deg, #C4D600, #B2FF66)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-lg)'
        }}>
          <AnimatedCheckmark size={40} color="white" />
        </div>
        
        <h3 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: 'var(--space-md)',
          color: '#C4D600'
        }}>
          Verification Complete!
        </h3>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px',
          marginBottom: 'var(--space-lg)'
        }}>
          Welcome to LiftLink! Your {role} account is now verified and ready to use.
        </p>
        
        {role === 'trainer' && (
          <div style={{
            padding: 'var(--space-lg)',
            background: 'rgba(196, 214, 0, 0.1)',
            borderRadius: 'var(--border-radius)',
            marginBottom: 'var(--space-lg)'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: 'var(--text-primary)'
            }}>
              🎉 Congratulations! You now have access to the Trainer CRM Dashboard
              to manage your clients and grow your fitness business.
            </p>
          </div>
        )}
      </div>
      
      <button
        className="btn-primary"
        onClick={onComplete}
        style={{
          width: '100%',
          padding: 'var(--space-lg)',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-sm)'
        }}
      >
        <AnimatedCoin size={24} color="white" />
        {role === 'trainer' ? 'Access Trainer Dashboard' : 'Start Your Fitness Journey'}
      </button>
    </div>
  );
};

export default VerificationFlow;
