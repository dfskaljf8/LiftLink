/**
 * Document Verification Screen - Futuristic 2050 Design
 * Cyber-organic age verification with holographic effects
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
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G, Line } from 'react-native-svg';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
} from 'react-native-reanimated';
import { useApp } from '../../src/context/AppContext';
import { FUTURE_COLORS, FutureLogo, FutureButton, ParticleField } from '../../src/components/FuturisticUI';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://swiftauth-1.preview.emergentagent.com/api';

// Futuristic ID Card Icon
const IdCardIcon = ({ size = 100 }) => {
  const scanLine = useSharedValue(0);

  React.useEffect(() => {
    scanLine.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  return (
    <View style={{ width: size, height: size * 0.7, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size * 0.7} viewBox="0 0 100 70">
        <Defs>
          <LinearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
            <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
          </LinearGradient>
          <LinearGradient id="scanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={FUTURE_COLORS.primary} stopOpacity="0" />
            <Stop offset="50%" stopColor={FUTURE_COLORS.primary} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={FUTURE_COLORS.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        
        {/* Card outline */}
        <Rect x="5" y="5" width="90" height="60" rx="8" 
          stroke="url(#cardGrad)" strokeWidth="2" fill={FUTURE_COLORS.surface} />
        
        {/* Holographic shimmer lines */}
        <Line x1="10" y1="15" x2="90" y2="15" stroke={FUTURE_COLORS.primary} strokeWidth="0.5" opacity="0.3" />
        <Line x1="10" y1="25" x2="90" y2="25" stroke={FUTURE_COLORS.primary} strokeWidth="0.5" opacity="0.2" />
        
        {/* Photo placeholder */}
        <Rect x="12" y="20" width="25" height="30" rx="4" fill={FUTURE_COLORS.elevated} stroke={FUTURE_COLORS.primary} strokeWidth="1" />
        <Circle cx="24.5" cy="30" r="8" fill={FUTURE_COLORS.primary} opacity="0.3" />
        <Circle cx="24.5" cy="28" r="5" fill={FUTURE_COLORS.primary} opacity="0.5" />
        <Path d="M16 42 Q24.5 36 33 42" fill={FUTURE_COLORS.primary} opacity="0.3" />
        
        {/* Data lines */}
        <Rect x="45" y="22" width="40" height="4" rx="2" fill={FUTURE_COLORS.primary} />
        <Rect x="45" y="30" width="30" height="4" rx="2" fill={FUTURE_COLORS.primary} opacity="0.5" />
        <Rect x="45" y="38" width="35" height="4" rx="2" fill={FUTURE_COLORS.primary} opacity="0.3" />
        
        {/* Barcode */}
        <G transform="translate(12, 52)">
          {[0, 4, 7, 10, 14, 17, 20, 24, 27, 30, 34, 37, 40, 44, 47, 50].map((x, i) => (
            <Rect key={i} x={x} y="0" width={i % 2 === 0 ? 2 : 1} height="6" fill={FUTURE_COLORS.primary} opacity="0.6" />
          ))}
        </G>
        
        {/* Chip */}
        <Rect x="70" y="48" width="18" height="12" rx="2" fill={FUTURE_COLORS.gold} opacity="0.8" />
        <Line x1="74" y1="51" x2="74" y2="57" stroke={FUTURE_COLORS.void} strokeWidth="1" />
        <Line x1="78" y1="51" x2="78" y2="57" stroke={FUTURE_COLORS.void} strokeWidth="1" />
        <Line x1="82" y1="51" x2="82" y2="57" stroke={FUTURE_COLORS.void} strokeWidth="1" />
        
        {/* Corner accents */}
        <Circle cx="10" cy="10" r="2" fill={FUTURE_COLORS.primary} />
        <Circle cx="90" cy="10" r="2" fill={FUTURE_COLORS.accent} />
        <Circle cx="10" cy="60" r="2" fill={FUTURE_COLORS.accent} />
        <Circle cx="90" cy="60" r="2" fill={FUTURE_COLORS.primary} />
      </Svg>
    </View>
  );
};

// Camera Icon
const CameraIcon = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36">
    <Defs>
      <LinearGradient id="camGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
      </LinearGradient>
    </Defs>
    <Path
      d="M18 23C20.76 23 23 20.76 23 18C23 15.24 20.76 13 18 13C15.24 13 13 15.24 13 18C13 20.76 15.24 23 18 23Z"
      fill="url(#camGrad)"
    />
    <Path
      d="M13.5 6L11.12 9H6C4.35 9 3 10.35 3 12V27C3 28.65 4.35 30 6 30H30C31.65 30 33 28.65 33 27V12C33 10.35 31.65 9 30 9H24.88L22.5 6H13.5ZM18 26C13.58 26 10 22.42 10 18C10 13.58 13.58 10 18 10C22.42 10 26 13.58 26 18C26 22.42 22.42 26 18 26Z"
      fill="url(#camGrad)"
    />
  </Svg>
);

// Gallery Icon
const GalleryIcon = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36">
    <Defs>
      <LinearGradient id="galGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
      </LinearGradient>
    </Defs>
    <Path
      d="M31.5 28.5V7.5C31.5 5.85 30.15 4.5 28.5 4.5H7.5C5.85 4.5 4.5 5.85 4.5 7.5V28.5C4.5 30.15 5.85 31.5 7.5 31.5H28.5C30.15 31.5 31.5 30.15 31.5 28.5ZM12.75 20.25L16.5 24.765L21.75 18L28.5 27H7.5L12.75 20.25Z"
      fill="url(#galGrad)"
    />
  </Svg>
);

// Lock Icon
const LockIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="lockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.accent} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.primary} />
      </LinearGradient>
    </Defs>
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke="url(#lockGrad)" strokeWidth="2" fill="none" />
    <Path
      d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11"
      stroke="url(#lockGrad)"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <Circle cx="12" cy="16" r="2" fill={FUTURE_COLORS.primary} />
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

    let userId = params.userId;
    if (!userId && params.email) {
      try {
        const checkRes = await axios.post(`${API_URL}/check-user`, { email: params.email });
        userId = checkRes.data.user_id;
      } catch (e) {
        console.error('Could not get user ID:', e);
      }
    }

    if (!userId) {
      Alert.alert('Error', 'User information not found. Please go back and try again.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/verify-government-id`, {
        user_id: userId,
        user_email: params.email,
        image_data: image.base64,
      });

      console.log('Verification response:', response.data);

      if (response.data.age_verified) {
        Alert.alert(
          'Verified!',
          'Your identity has been confirmed. Welcome to LiftLink!',
          [{
            text: 'Enter LiftLink',
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
      <ParticleField count={8} />
      
      <View style={styles.glowOrb1} pointerEvents="none" />
      <View style={styles.glowOrb2} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path d="M15 18L9 12L15 6" stroke={FUTURE_COLORS.text} strokeWidth="2" strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <FutureLogo size={32} />
            </View>
            <View style={styles.placeholder} />
          </View>

          {/* Icon */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.iconContainer}>
            <IdCardIcon size={140} />
          </Animated.View>

          {/* Info */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.infoContainer}>
            <Text style={styles.title}>Age Verification</Text>
            <Text style={styles.description}>
              LiftLink requires users to be 18+. Upload a photo of your government-issued ID for instant verification.
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
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    <Path d="M18 6L6 18M6 6L18 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  </Svg>
                </TouchableOpacity>
                {/* Scan effect overlay */}
                <View style={styles.scanOverlay}>
                  <View style={styles.scanCorner1} />
                  <View style={styles.scanCorner2} />
                  <View style={styles.scanCorner3} />
                  <View style={styles.scanCorner4} />
                </View>
              </View>
            ) : (
              <View style={styles.uploadOptions}>
                <TouchableOpacity 
                  style={styles.uploadOption}
                  onPress={() => pickImage(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.uploadIconBg}>
                    <CameraIcon size={40} />
                  </View>
                  <Text style={styles.uploadOptionText}>Take Photo</Text>
                  <Text style={styles.uploadOptionHint}>Use camera</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.uploadOption}
                  onPress={() => pickImage(false)}
                  activeOpacity={0.8}
                >
                  <View style={styles.uploadIconBg}>
                    <GalleryIcon size={40} />
                  </View>
                  <Text style={styles.uploadOptionText}>Choose Photo</Text>
                  <Text style={styles.uploadOptionHint}>From gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Privacy Note */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.privacyNote}>
            <View style={styles.lockIconContainer}>
              <LockIcon size={24} />
            </View>
            <View style={styles.privacyTextContainer}>
              <Text style={styles.privacyTitle}>Secure & Private</Text>
              <Text style={styles.privacyText}>
                Your ID is processed securely using encryption and is NOT stored. We only verify your date of birth.
              </Text>
            </View>
          </Animated.View>

          {/* Buttons */}
          <View style={styles.buttons}>
            {image && (
              <FutureButton
                title="Verify Identity"
                onPress={handleVerify}
                loading={loading}
                variant="primary"
                size="large"
              />
            )}
            
            <FutureButton
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
    backgroundColor: FUTURE_COLORS.void,
  },
  glowOrb1: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: FUTURE_COLORS.primary,
    opacity: 0.06,
  },
  glowOrb2: {
    position: 'absolute',
    bottom: 100,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: FUTURE_COLORS.accent,
    opacity: 0.05,
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
    marginBottom: 24,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: FUTURE_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  placeholder: {
    width: 48,
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
    color: FUTURE_COLORS.text,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: FUTURE_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  uploadOption: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: FUTURE_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
    width: 140,
  },
  uploadIconBg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: FUTURE_COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  uploadOptionText: {
    color: FUTURE_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  uploadOptionHint: {
    color: FUTURE_COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  previewContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    backgroundColor: FUTURE_COLORS.surface,
  },
  removeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FUTURE_COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  scanCorner1: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: FUTURE_COLORS.primary,
    borderTopLeftRadius: 8,
  },
  scanCorner2: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: FUTURE_COLORS.primary,
    borderTopRightRadius: 8,
  },
  scanCorner3: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: FUTURE_COLORS.primary,
    borderBottomLeftRadius: 8,
  },
  scanCorner4: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: FUTURE_COLORS.primary,
    borderBottomRightRadius: 8,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: FUTURE_COLORS.surface,
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  lockIconContainer: {
    marginRight: 14,
    marginTop: 2,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    color: FUTURE_COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  privacyText: {
    color: FUTURE_COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  buttons: {
    marginTop: 8,
  },
});
