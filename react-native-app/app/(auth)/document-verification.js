/**
 * Document Verification Screen
 * Age verification with ID upload - Lime green theme
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
import { Button } from '../../src/components/AnimatedButton';
import { COLORS, LiftLinkLogo } from '../../src/components/CustomIllustrations';
import axios from 'axios';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://deploy-savior-1.preview.emergentagent.com/api';

// ID Card Icon
const IdCardIcon = ({ size = 80 }) => (
  <Svg width={size} height={size} viewBox="0 0 80 80">
    <Rect x="5" y="15" width="70" height="50" rx="8" stroke={COLORS.primary} strokeWidth="3" fill="none" />
    <Circle cx="28" cy="35" r="10" stroke={COLORS.primary} strokeWidth="2" fill="none" />
    <Rect x="45" y="28" width="22" height="4" rx="2" fill={COLORS.primary} />
    <Rect x="45" y="38" width="16" height="4" rx="2" fill={COLORS.primary} opacity="0.5" />
    <Rect x="15" y="50" width="20" height="4" rx="2" fill={COLORS.primary} opacity="0.5" />
  </Svg>
);

// Camera Icon
const CameraIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 15.2C13.77 15.2 15.2 13.77 15.2 12C15.2 10.23 13.77 8.8 12 8.8C10.23 8.8 8.8 10.23 8.8 12C8.8 13.77 10.23 15.2 12 15.2Z"
      fill={COLORS.primary}
    />
    <Path
      d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z"
      fill={COLORS.primary}
    />
  </Svg>
);

// Gallery Icon
const GalleryIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"
      fill={COLORS.primary}
    />
  </Svg>
);

export default function DocumentVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setUser } = useApp();
  
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (useCamera = false) => {
    try {
      let result;
      
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Needed', 'Camera access is required to take a photo.');
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
          Alert.alert('Permission Needed', 'Photo library access is required.');
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
      Alert.alert('Error', 'Could not select image. Please try again.');
    }
  };

  const handleVerify = async () => {
    if (!image?.base64) {
      Alert.alert('No Image', 'Please take or select a photo of your ID.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/verify-government-id`, {
        user_id: params.userId,
        user_email: params.email,
        image_data: image.base64,
      });

      console.log('Verification response:', response.data);

      if (response.data.age_verified) {
        Alert.alert(
          'Verified! ✅',
          'Your age has been verified. Welcome to LiftLink!',
          [{
            text: 'Get Started',
            onPress: async () => {
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
              } catch (err) {
                console.error('Login after verification:', err);
                router.replace('/(auth)');
              }
            },
          }]
        );
      } else {
        Alert.alert(
          'Verification Failed',
          response.data.rejection_reason || 'Could not verify your age. Please try with a clearer photo.',
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
      setLoading(false);
    }
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
            <View style={styles.headerCenter}>
              <LiftLinkLogo size={28} />
            </View>
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
              LiftLink requires users to be 18 or older. Please upload a photo of your government-issued ID.
            </Text>
          </Animated.View>

          {/* Upload Section */}
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
                    <CameraIcon size={36} />
                  </View>
                  <Text style={styles.uploadOptionText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.uploadOption}
                  onPress={() => pickImage(false)}
                >
                  <View style={styles.uploadIconBg}>
                    <GalleryIcon size={36} />
                  </View>
                  <Text style={styles.uploadOptionText}>Choose Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Privacy Note */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.privacyNote}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.privacyText}>
              Your ID is processed securely and NOT stored. We only verify your date of birth.
            </Text>
          </Animated.View>

          {/* Buttons */}
          <View style={styles.buttons}>
            {image && (
              <Button
                title="Verify My ID"
                onPress={handleVerify}
                loading={loading}
                variant="primary"
                size="large"
              />
            )}
            
            <Button
              title="Skip for Now"
              onPress={() => {
                Alert.alert(
                  'Skip Verification?',
                  'You won\'t be able to use LiftLink without age verification.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Skip', style: 'destructive', onPress: () => router.replace('/(auth)') },
                  ]
                );
              }}
              variant="ghost"
              size="medium"
              style={{ marginTop: 12 }}
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
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: COLORS.text,
    fontSize: 22,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  placeholder: {
    width: 44,
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
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  uploadOption: {
    alignItems: 'center',
    padding: 16,
  },
  uploadIconBg: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  uploadOptionText: {
    color: COLORS.text,
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
    backgroundColor: COLORS.surface,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lockIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  privacyText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  buttons: {
    marginTop: 8,
  },
});
