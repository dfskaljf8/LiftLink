import React, { useState, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const DocumentVerification = ({ user, userRole, onVerificationComplete, darkMode }) => {
  const [currentStep, setCurrentStep] = useState('id'); // 'id', 'certification', 'pending'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // ID Verification state
  const [idImage, setIdImage] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const idFileRef = useRef(null);
  
  // Certification state (for trainers)
  const [certImage, setCertImage] = useState(null);
  const [certPreview, setCertPreview] = useState(null);
  const [certType, setCertType] = useState('NASM');
  const certFileRef = useRef(null);
  
  // Verification results
  const [verificationResults, setVerificationResults] = useState({});

  const handleIdImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image file must be less than 10MB');
        return;
      }
      
      setIdImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setIdPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleCertImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Certification file must be less than 10MB');
        return;
      }
      
      setCertImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCertPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const uploadIdDocument = async () => {
    if (!idImage) {
      setError('Please select a government ID image');
      return;
    }

    if (!user || !user.id || !user.email) {
      setError('User information is missing. Please try refreshing the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        
        const response = await axios.post(`${API}/api/verify-government-id`, {
          user_id: user.id,
          user_email: user.email,
          image_data: base64Data
        });

        if (response.data.age_verified) {
          setSuccess('Age verification successful! You are confirmed to be 18 or older.');
          setVerificationResults(prev => ({ ...prev, id: response.data }));
          
          console.log('Age verification complete. UserRole:', userRole, 'User:', user);
          
          // Move to certification step if trainer, otherwise complete
          if (userRole === 'trainer') {
            console.log('Moving to certification step for trainer');
            setTimeout(() => {
              setCurrentStep('certification');
              setSuccess('');
            }, 2000);
          } else {
            console.log('Completing verification for trainee');
            setTimeout(() => {
              onVerificationComplete({ age_verified: true });
            }, 3000);
          }
        } else {
          setError(response.data.rejection_reason || 'Age verification failed. You must be 18 or older to use this app.');
        }
      };
      
      reader.readAsDataURL(idImage);
      
    } catch (error) {
      console.error('ID verification failed:', error);
      setError('Verification failed. Please try again with a clear photo of your government ID.');
    } finally {
      setLoading(false);
    }
  };

  const uploadCertification = async () => {
    if (!certImage) {
      setError('Please select your certification document');
      return;
    }

    if (!user || !user.id || !user.email) {
      setError('User information is missing. Please try refreshing the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        
        const response = await axios.post(`${API}/api/verify-fitness-certification`, {
          user_id: user.id,
          user_email: user.email,
          cert_type: certType,
          image_data: base64Data
        });

        if (response.data.cert_verified) {
          setSuccess('Certification verification successful! You are now verified as a qualified trainer.');
          setVerificationResults(prev => ({ ...prev, cert: response.data }));
          
          setTimeout(() => {
            onVerificationComplete({ 
              age_verified: true, 
              cert_verified: true,
              cert_type: certType
            });
          }, 3000);
        } else {
          setError(response.data.rejection_reason || 'Certification verification failed. Please ensure your certification is valid and current.');
        }
      };
      
      reader.readAsDataURL(certImage);
      
    } catch (error) {
      console.error('Certification verification failed:', error);
      setError('Verification failed. Please try again with a clear photo of your certification.');
    } finally {
      setLoading(false);
    }
  };

  const renderIdVerificationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🆔</div>
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Age Verification Required
        </h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
          Please upload a clear photo of your government-issued ID to verify you are 18 or older.
        </p>
        <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-600' : 'bg-yellow-50 border-yellow-300'} border rounded-lg p-4 mb-6`}>
          <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
            ⚠️ <strong>Privacy Notice:</strong> Your ID is processed securely and used only for age verification. 
            Personal information is not stored beyond verification requirements.
          </p>
        </div>
      </div>

      {!idPreview && (
        <div
          onClick={() => idFileRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            darkMode 
              ? 'border-gray-600 hover:border-green-400 bg-gray-800/50' 
              : 'border-gray-300 hover:border-blue-400 bg-gray-50'
          }`}
        >
          <div className="text-4xl mb-4">📷</div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
            Click to upload your government ID
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Supported: Driver's License, Passport, State ID
          </p>
        </div>
      )}

      {idPreview && (
        <div className="text-center">
          <img
            src={idPreview}
            alt="ID Preview"
            className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg mb-4"
          />
          <button
            onClick={() => {
              setIdImage(null);
              setIdPreview(null);
              idFileRef.current.value = '';
            }}
            className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'}`}
          >
            Choose different image
          </button>
        </div>
      )}

      <input
        ref={idFileRef}
        type="file"
        accept="image/*"
        onChange={handleIdImageSelect}
        className="hidden"
      />

      {idImage && (
        <button
          onClick={uploadIdDocument}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed' 
              : darkMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Verifying Age...' : 'Verify Age (18+)'}
        </button>
      )}
    </div>
  );

  const renderCertificationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🏋️</div>
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-blue-600'}`}>
          Trainer Certification Required
        </h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
          As a trainer, please upload your fitness certification to verify your qualifications.
        </p>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Certification Type
        </label>
        <select
          value={certType}
          onChange={(e) => setCertType(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          } focus:ring-2 focus:ring-green-400`}
        >
          <option value="NASM">NASM (National Academy of Sports Medicine)</option>
          <option value="ACSM">ACSM (American College of Sports Medicine)</option>
          <option value="ACE">ACE (American Council on Exercise)</option>
          <option value="NSCA">NSCA (National Strength and Conditioning Association)</option>
          <option value="ISSA">ISSA (International Sports Sciences Association)</option>
          <option value="NCSF">NCSF (National Council on Strength & Fitness)</option>
        </select>
      </div>

      {!certPreview && (
        <div
          onClick={() => certFileRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            darkMode 
              ? 'border-gray-600 hover:border-green-400 bg-gray-800/50' 
              : 'border-gray-300 hover:border-blue-400 bg-gray-50'
          }`}
        >
          <div className="text-4xl mb-4">📋</div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
            Click to upload your {certType} certification
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Certification certificate or digital badge
          </p>
        </div>
      )}

      {certPreview && (
        <div className="text-center">
          <img
            src={certPreview}
            alt="Certification Preview"
            className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg mb-4"
          />
          <button
            onClick={() => {
              setCertImage(null);
              setCertPreview(null);
              certFileRef.current.value = '';
            }}
            className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'}`}
          >
            Choose different image
          </button>
        </div>
      )}

      <input
        ref={certFileRef}
        type="file"
        accept="image/*"
        onChange={handleCertImageSelect}
        className="hidden"
      />

      {certImage && (
        <button
          onClick={uploadCertification}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed' 
              : darkMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Verifying Certification...' : `Verify ${certType} Certification`}
        </button>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'cyberpunk-bg' : 'light-mode-bg'} flex items-center justify-center p-4`}>
      <div className={`w-full max-w-md ${darkMode ? 'glass-card-dark' : 'glass-card-light'} p-8`}>
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'id' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              {currentStep === 'id' ? '1' : '✓'}
            </div>
            {userRole === 'trainer' && (
              <>
                <div className={`w-8 h-1 ${currentStep === 'certification' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'certification' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {currentStep === 'id' && renderIdVerificationStep()}
        {currentStep === 'certification' && renderCertificationStep()}

      </div>
    </div>
  );
};

export default DocumentVerification;