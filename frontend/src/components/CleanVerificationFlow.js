import React, { useState, useEffect, useRef } from 'react';
import { AnimatedDumbbell, AnimatedCheckmark, LiftLinkLogo } from './AnimatedSVGs';

// Clean, Polished Verification Flow Component
const CleanVerificationFlow = ({ onComplete, userProfile = null }) => {
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
    'certification-upload': { title: 'Upload Certifications', step: 4 },
    'verification-complete': { title: 'Verification Complete', step: 5 }
  };

  const totalSteps = verificationData.role === 'trainer' ? 4 : 3;
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Navigation functions
  const goBack = () => {
    setError('');
    setUploadProgress(0);
    
    switch (currentStep) {
      case 'id-upload':
        setCurrentStep('role-selection');
        setVerificationData(prev => ({ ...prev, role: null, sessionId: null }));
        break;
      case 'selfie-capture':
        setCurrentStep('id-upload');
        break;
      case 'certification-upload':
        setCurrentStep('selfie-capture');
        break;
      default:
        break;
    }
  };

  // Skip functions
  const skipIdVerification = () => {
    setVerificationData(prev => ({ ...prev, idVerified: false }));
    setCurrentStep('selfie-capture');
  };

  const skipSelfieVerification = () => {
    setVerificationData(prev => ({ ...prev, selfieVerified: false }));
    if (verificationData.role === 'trainer') {
      setCurrentStep('certification-upload');
    } else {
      setCurrentStep('verification-complete');
    }
  };

  const skipCertification = () => {
    setVerificationData(prev => ({ ...prev, certificationVerified: false }));
    setCurrentStep('verification-complete');
  };

  // API functions
  const startVerificationSession = async (role) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/verification/enhanced-start-session`, {
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
      setError(err.message || 'Failed to start verification session');
    } finally {
      setLoading(false);
    }
  };

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

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`${API_BASE_URL}/api/verification/enhanced-upload-id`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userProfile?.token || 'demo_user'}` },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('ID verification failed');
      }

      setVerificationData(prev => ({ ...prev, idVerified: true }));
      setTimeout(() => {
        setCurrentStep('selfie-capture');
        setUploadProgress(0);
      }, 1000);
      
    } catch (err) {
      setError(err.message || 'ID verification failed');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

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
        headers: { 'Authorization': `Bearer ${userProfile?.token || 'demo_user'}` },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Selfie verification failed');
      }

      setVerificationData(prev => ({ ...prev, selfieVerified: true }));
      setTimeout(() => {
        if (verificationData.role === 'trainer') {
          setCurrentStep('certification-upload');
        } else {
          setCurrentStep('verification-complete');
        }
        setUploadProgress(0);
      }, 1000);
      
    } catch (err) {
      setError(err.message || 'Selfie verification failed');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

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
        headers: { 'Authorization': `Bearer ${userProfile?.token || 'demo_trainer'}` },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Certification verification failed');
      }

      setVerificationData(prev => ({ ...prev, certificationVerified: true }));
      setTimeout(() => {
        setCurrentStep('verification-complete');
        setUploadProgress(0);
      }, 1000);
      
    } catch (err) {
      setError(err.message || 'Certification verification failed');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    }}>
      {/* Clean Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(196, 214, 0, 0.2)',
        padding: '16px 20px',
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          {/* Back Button */}
          {currentStep !== 'role-selection' && currentStep !== 'verification-complete' && (
            <button
              onClick={goBack}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ← Back
            </button>
          )}

          {/* Title */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600'
            }}>
              {steps[currentStep]?.title}
            </h1>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginTop: '2px'
            }}>
              Step {steps[currentStep]?.step} of {totalSteps}
            </div>
          </div>

          {/* Skip Button */}
          {(currentStep === 'id-upload' || currentStep === 'selfie-capture' || currentStep === 'certification-upload') && (
            <button
              onClick={() => {
                if (currentStep === 'id-upload') skipIdVerification();
                else if (currentStep === 'selfie-capture') skipSelfieVerification();
                else if (currentStep === 'certification-upload') skipCertification();
              }}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.8)',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Skip
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '2px',
          background: 'rgba(196, 214, 0, 0.2)',
          borderRadius: '1px',
          overflow: 'hidden',
          marginTop: '12px',
          maxWidth: '500px',
          margin: '12px auto 0'
        }}>
          <div style={{
            width: `${(steps[currentStep]?.step / totalSteps) * 100}%`,
            height: '100%',
            background: '#C4D600',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        paddingTop: '100px',
        padding: '100px 20px 40px',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        {/* Error Display */}
        {error && (
          <div style={{
            background: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid rgba(255, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            color: '#ff6b6b'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <AnimatedDumbbell size={32} color="#C4D600" />
            </div>
            <p style={{ marginBottom: '12px', fontSize: '16px' }}>
              Uploading... {uploadProgress}%
            </p>
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
                background: '#C4D600',
                transition: 'width 0.2s ease'
              }} />
            </div>
          </div>
        )}

        {/* Step Components */}
        {currentStep === 'role-selection' && (
          <RoleSelectionStep onSelectRole={startVerificationSession} loading={loading} />
        )}
        
        {currentStep === 'id-upload' && (
          <IdUploadStep onUpload={uploadIdDocument} loading={loading} />
        )}
        
        {currentStep === 'selfie-capture' && (
          <SelfieStep onCapture={uploadSelfie} loading={loading} />
        )}
        
        {currentStep === 'certification-upload' && (
          <CertificationStep onUpload={uploadCertification} loading={loading} />
        )}
        
        {currentStep === 'verification-complete' && (
          <CompletionStep role={verificationData.role} onComplete={onComplete} />
        )}
      </div>
    </div>
  );
};

// Clean Role Selection Step
const RoleSelectionStep = ({ onSelectRole, loading }) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        background: '#C4D600',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        fontSize: '24px',
        color: '#000'
      }}>
        👤
      </div>
      
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '12px'
      }}>
        Choose Your Role
      </h2>
      
      <p style={{
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: '32px',
        lineHeight: '1.5'
      }}>
        Select whether you're joining as a fitness enthusiast or a professional trainer
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          onClick={() => onSelectRole('trainee')}
          disabled={loading}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'left'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(196, 214, 0, 0.1)';
            e.target.style.borderColor = '#C4D600';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Fitness Enthusiast
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Looking to find trainers and improve my fitness
          </div>
        </button>

        <button
          onClick={() => onSelectRole('trainer')}
          disabled={loading}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'left'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(196, 214, 0, 0.1)';
            e.target.style.borderColor = '#C4D600';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Professional Trainer
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Certified trainer ready to help clients achieve their goals
          </div>
        </button>
      </div>
    </div>
  );
};

// Clean ID Upload Step
const IdUploadStep = ({ onUpload, loading }) => {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('drivers_license');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile instanceof File) {
      setFile(selectedFile);
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
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '32px'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: '#C4D600',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '24px',
          color: '#000'
        }}>
          ID
        </div>
        
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          Upload Your ID
        </h2>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px'
        }}>
          We need to verify you're 18 or older
        </p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '8px'
        }}>
          Document Type
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px'
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
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '8px'
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
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px'
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
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '16px',
            border: file ? '2px solid #C4D600' : '2px dashed rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            background: file ? 'rgba(196, 214, 0, 0.1)' : 'transparent',
            color: file ? '#C4D600' : 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {file ? `Selected: ${file.name}` : 'Choose ID Document'}
        </button>
      </div>

      <div style={{ position: 'fixed', top: '70px', right: '20px' }}>
        <button
          onClick={handleSubmit}
          disabled={loading || !file || !dateOfBirth}
          style={{
            background: loading || !file || !dateOfBirth ? 'rgba(255, 255, 255, 0.1)' : '#C4D600',
            color: loading || !file || !dateOfBirth ? 'rgba(255, 255, 255, 0.5)' : '#000',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: loading || !file || !dateOfBirth ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {loading ? 'Verifying...' : 'Continue'}
        </button>
      </div>
      
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(196, 214, 0, 0.1)',
        borderRadius: '8px',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        • Government-issued ID required<br/>
        • Must be 18 or older<br/>
        • Clear, readable image or PDF
      </div>
    </div>
  );
};

// Clean Selfie Step
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
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '32px'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: '#C4D600',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '24px',
          color: '#000'
        }}>
          📷
        </div>
        
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          Take a Selfie
        </h2>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px'
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
            src={preview}
            alt="Selfie preview"
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '2px solid #C4D600'
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
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '16px',
            border: file ? '2px solid #C4D600' : '2px dashed rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            background: file ? 'rgba(196, 214, 0, 0.1)' : 'transparent',
            color: file ? '#C4D600' : 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {file ? 'Retake Selfie' : 'Take Selfie'}
        </button>
      </div>

      <div style={{ position: 'fixed', top: '70px', right: '20px' }}>
        <button
          onClick={handleSubmit}
          disabled={loading || !file}
          style={{
            background: loading || !file ? 'rgba(255, 255, 255, 0.1)' : '#C4D600',
            color: loading || !file ? 'rgba(255, 255, 255, 0.5)' : '#000',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: loading || !file ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {loading ? 'Verifying...' : 'Continue'}
        </button>
      </div>
      
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(196, 214, 0, 0.1)',
        borderRadius: '8px',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        • Look directly at camera<br/>
        • Ensure good lighting<br/>
        • Remove sunglasses or hat
      </div>
    </div>
  );
};

// Clean Certification Step
const CertificationStep = ({ onUpload, loading }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile instanceof File) {
      setFile(selectedFile);
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
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '32px'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: '#C4D600',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '24px',
          color: '#000'
        }}>
          🏆
        </div>
        
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          Upload Certification
        </h2>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px'
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
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '16px',
            border: file ? '2px solid #C4D600' : '2px dashed rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            background: file ? 'rgba(196, 214, 0, 0.1)' : 'transparent',
            color: file ? '#C4D600' : 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {file ? `Selected: ${file.name}` : 'Choose Certification Document'}
        </button>
      </div>

      <div style={{ position: 'fixed', top: '70px', right: '20px' }}>
        <button
          onClick={handleSubmit}
          disabled={loading || !file}
          style={{
            background: loading || !file ? 'rgba(255, 255, 255, 0.1)' : '#C4D600',
            color: loading || !file ? 'rgba(255, 255, 255, 0.5)' : '#000',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: loading || !file ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {loading ? 'Validating...' : 'Continue'}
        </button>
      </div>
      
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(255, 68, 68, 0.1)',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#ff6b6b'
      }}>
        Accepted: NASM, ACE, ISSA, ACSM, CSCS certifications
      </div>
    </div>
  );
};

// Clean Completion Step
const CompletionStep = ({ role, onComplete }) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        background: '#C4D600',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px'
      }}>
        <AnimatedCheckmark size={40} color="#000" />
      </div>
      
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '12px'
      }}>
        Verification Complete
      </h2>
      
      <p style={{
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: '32px',
        lineHeight: '1.5'
      }}>
        Welcome to LiftLink! Your {role} account has been successfully verified.
      </p>
      
      <button
        onClick={() => onComplete({ role, verified: true })}
        style={{
          background: '#C4D600',
          color: '#000',
          border: 'none',
          padding: '16px 32px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Get Started
      </button>
    </div>
  );
};

export default CleanVerificationFlow;