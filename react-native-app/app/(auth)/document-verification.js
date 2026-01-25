/**
 * Document Verification Screen
 * Age verification with ID upload
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '../../src/context/AppContext';
import { Button, IconButton } from '../../src/components/AnimatedButton';
import axios from 'axios';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://deploy-savior-1.preview.emergentagent.com/api';

// ID Card Icon
const IdCardIcon = ({ size = 80 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="2" y="4" width="20" height="16" rx="2" stroke="#6366f1" strokeWidth="2" fill="none" />
    <Circle cx="8" cy="10" r="2" fill="#6366f1" />
    <Rect x="12" y="8" width="6" height="2" rx="1" fill="#6366f1" />
    <Rect x="12" y="12" width="4" height="2" rx="1" fill="#6366f1" opacity="0.5" />
    <Rect x="5" y="14" width="6" height="2" rx="1" fill="#6366f1" opacity="0.5" />
  </Svg>
);

// Camera Icon
const CameraIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 15.2C13.77 15.2 15.2 13.77 15.2 12C15.2 10.23 13.77 8.8 12 8.8C10.23 8.8 8.8 10.23 8.8 12C8.8 13.77 10.23 15.2 12 15.2Z"
      fill={color}
    />
    <Path
      d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z"
      fill={color}
    />
  </Svg>
);

// Gallery Icon
const GalleryIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"
      fill={color}
    />
  </Svg>
);

export default function DocumentVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setUser } = useApp();
  
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const pickImage = async (useCamera = false) => {
    try {
      let result;
      
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera access is required to take a photo of your ID.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [16, 10],
          quality: 0.8,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Photo library access is required to select your ID.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 10],
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0]);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleVerify = async () => {
    if (!image?.base64) {
      Alert.alert('No Image', 'Please take or select a photo of your ID first.');
      return;
    }

    setVerifying(true);

    try {
      const response = await axios.post(`${API_URL}/verify-government-id`, {
        user_id: params.userId,
        user_email: params.email,
        image_data: image.base64,
      });

      console.log('Verification response:', response.data);

      if (response.data.age_verified) {
        Alert.alert(
          'Verified!',
          'Your age has been verified. You can now access LiftLink!',
          [
            {
              text: 'Continue',
              onPress: async () => {
                // Try to login now
                try {
                  const loginResponse = await axios.post(`${API_URL}/login`, {
                    email: params.email,
                  });
                  
                  const userData = {
                    ...loginResponse.data.user,
                    token: loginResponse.data.access_token,
                  };
                  
                  await setUser(userData);
                  router.replace('/(tabs)');
                } catch (loginErr) {
                  console.error('Post-verification login error:', loginErr);
                  router.replace('/(auth)');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Verification Failed',
          response.data.rejection_reason || 'Could not verify your age. Please try again with a clearer photo.',
          [{ text: 'Try Again' }]
        );
      }
    } catch (err) {
      console.error('Verification error:', err);
      Alert.alert(
        'Error',
        err.response?.data?.detail || 'Verification failed. Please try again.'
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Verification?',
      'You won\'t be able to use LiftLink without age verification. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', style: 'destructive', onPress: () => router.replace('/(auth)') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Age Verification</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Icon */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.iconContainer}>
            <IdCardIcon size={100} />
          </Animated.View>

          {/* Info */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.infoContainer}>
            <Text style={styles.title}>Verify Your Age</Text>
            <Text style={styles.description}>
              LiftLink requires users to be 18 or older. Please upload a photo of your 
              government-issued ID (driver's license, passport, or ID card).
            </Text>
          </Animated.View>

          {/* Image Preview or Upload Options */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.uploadSection}>
            {image ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image.uri }} style={styles.preview} />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => setImage(null)}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadOptions}>
                <TouchableOpacity 
                  style={styles.uploadOption}
                  onPress={() => pickImage(true)}
                >
                  <View style={styles.uploadIconBg}>
                    <CameraIcon size={32} color="#6366f1" />
                  </View>
                  <Text style={styles.uploadOptionText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.uploadOption}
                  onPress={() => pickImage(false)}
                >
                  <View style={styles.uploadIconBg}>
                    <GalleryIcon size={32} color="#10b981" />
                  </View>
                  <Text style={styles.uploadOptionText}>Choose Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Privacy Note */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.privacyNote}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={styles.privacyText}>
              Your ID is processed securely and not stored. We only extract your date of birth to verify age.
            </Text>
          </Animated.View>

          {/* Buttons */}
          <View style={styles.buttons}>
            {image && (
              <Button
                title={verifying ? "Verifying..." : "Verify My ID"}
                onPress={handleVerify}
                loading={verifying}
                variant="primary"
                size="large"
              />
            )}
            
            <Button
              title="Skip for Now"
              onPress={handleSkip}
              variant="ghost"
              size="medium"
              style={{ marginTop: 8 }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  uploadOption: {
    alignItems: 'center',
    padding: 20,
  },
  uploadIconBg: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#334155',
  },
  uploadOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#1e293b',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  privacyText: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },
  buttons: {
    marginTop: 8,
  },
});
