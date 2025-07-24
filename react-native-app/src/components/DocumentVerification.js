import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Image,
  Platform
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API = 'https://8fe21dd2-35a9-4730-97e3-93ae042411a9.preview.emergentagent.com/api';

const DocumentVerification = ({ route, navigation }) => {
  const { user } = route.params;
  const [currentStep, setCurrentStep] = useState('id');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [idImage, setIdImage] = useState(null);
  const [certImage, setCertImage] = useState(null);
  const [certType, setCertType] = useState('NASM');
  const [verificationResults, setVerificationResults] = useState({});

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

  const handleIdImageSelect = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setIdImage(response.assets[0]);
        setError('');
      }
    });
  };

  const handleCertImageSelect = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setCertImage(response.assets[0]);
        setError('');
      }
    });
  };

  const handleIdVerification = async () => {
    if (!idImage) {
      setError('Please select a government ID image');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API}/verify-government-id`, {
        user_id: user.id,
        user_email: user.email,
        image_data: idImage.base64
      });

      if (response.data.age_verified) {
        setSuccess('Age verification successful! You are confirmed to be 18 or older.');
        setVerificationResults(prev => ({ ...prev, id: response.data }));
        
        if (user.role === 'trainer') {
          setTimeout(() => {
            setCurrentStep('certification');
            setSuccess('');
          }, 2000);
        } else {
          setTimeout(async () => {
            const updatedUser = {
              ...user,
              age_verified: true,
              verification_status: 'age_verified'
            };
            await AsyncStorage.setItem('liftlink_user', JSON.stringify(updatedUser));
            navigation.replace('Main');
          }, 3000);
        }
      } else {
        setError(response.data.rejection_reason || 'Age verification failed. You must be 18 or older to use this app.');
      }
    } catch (error) {
      console.error('ID verification failed:', error);
      setError('Verification failed. Please try again with a clear photo of your government ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleCertificationVerification = async () => {
    if (!certImage) {
      setError('Please select a fitness certification image');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API}/verify-fitness-certification`, {
        user_id: user.id,
        user_email: user.email,
        cert_type: certType,
        image_data: certImage.base64
      });

      if (response.data.cert_verified) {
        setSuccess('Certification verification successful! You are now verified as a qualified trainer.');
        setVerificationResults(prev => ({ ...prev, cert: response.data }));
        
        setTimeout(async () => {
          const updatedUser = {
            ...user,
            age_verified: true,
            cert_verified: true,
            verification_status: 'fully_verified'
          };
          await AsyncStorage.setItem('liftlink_user', JSON.stringify(updatedUser));
          navigation.replace('Main');
        }, 3000);
      } else {
        setError(response.data.rejection_reason || 'Certification verification failed. Please ensure your certification is valid and current.');
      }
    } catch (error) {
      console.error('Certification verification failed:', error);
      setError('Verification failed. Please try again with a clear photo of your certification.');
    } finally {
      setLoading(false);
    }
  };

  const renderIdVerificationStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Age Verification Required
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Please upload a clear photo of your government-issued ID to verify you are 18 or older.
      </Text>

      <TouchableOpacity
        style={[styles.imageUploadButton, { backgroundColor: colors.surface }]}
        onPress={handleIdImageSelect}
      >
        {idImage ? (
          <Image source={{ uri: idImage.uri }} style={styles.previewImage} />
        ) : (
          <Text style={[styles.imageUploadText, { color: colors.textSecondary }]}>
            Tap to select ID image
          </Text>
        )}
      </TouchableOpacity>

      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : null}

      {success ? (
        <Text style={[styles.successText, { color: colors.success }]}>{success}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.verifyButton, { backgroundColor: colors.primary }]}
        onPress={handleIdVerification}
        disabled={loading || !idImage}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={[styles.verifyButtonText, { color: colors.text }]}>
            Verify Age (18+)
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderCertificationStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Fitness Certification Required
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Please upload your fitness certification to verify your qualifications as a trainer.
      </Text>

      <View style={styles.certTypeContainer}>
        <Text style={[styles.certTypeLabel, { color: colors.text }]}>
          Certification Type:
        </Text>
        <View style={styles.certTypeOptions}>
          {['NASM', 'ACSM', 'ACE', 'NSCA', 'ISSA', 'NCSF'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.certTypeOption, { 
                backgroundColor: certType === type ? colors.primary : colors.surface 
              }]}
              onPress={() => setCertType(type)}
            >
              <Text style={[styles.certTypeOptionText, { color: colors.text }]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.imageUploadButton, { backgroundColor: colors.surface }]}
        onPress={handleCertImageSelect}
      >
        {certImage ? (
          <Image source={{ uri: certImage.uri }} style={styles.previewImage} />
        ) : (
          <Text style={[styles.imageUploadText, { color: colors.textSecondary }]}>
            Tap to select certification image
          </Text>
        )}
      </TouchableOpacity>

      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : null}

      {success ? (
        <Text style={[styles.successText, { color: colors.success }]}>{success}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.verifyButton, { backgroundColor: colors.primary }]}
        onPress={handleCertificationVerification}
        disabled={loading || !certImage}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={[styles.verifyButtonText, { color: colors.text }]}>
            Verify Certification
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Document Verification
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {user.role === 'trainer' ? 'Trainer' : 'User'} Verification Required
          </Text>
        </View>

        {currentStep === 'id' && renderIdVerificationStep()}
        {currentStep === 'certification' && renderCertificationStep()}
      </ScrollView>
    </SafeAreaView>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  imageUploadButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  imageUploadText: {
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  certTypeContainer: {
    width: '100%',
    marginBottom: 24,
  },
  certTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  certTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  certTypeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  certTypeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DocumentVerification;