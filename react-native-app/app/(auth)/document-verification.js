/**
 * Document Verification Screen - Futuristic 2050 Design
 * Simplified for stability
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G, Line } from 'react-native-svg';
import { useApp } from '../../src/context/AppContext';
import { FUTURE_COLORS, FutureLogo, FutureButton, ParticleField } from '../../src/components/FuturisticUI';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://swiftauth-1.preview.emergentagent.com/api';

// ID Card Icon
const IdCardIcon = ({ size = 100 }) => (
  <Svg width={size} height={size * 0.7} viewBox="0 0 100 70">
    <Defs>
      <LinearGradient id="cardG" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
      </LinearGradient>
    </Defs>
    <Rect x="5" y="5" width="90" height="60" rx="8" stroke="url(#cardG)" strokeWidth="2" fill={FUTURE_COLORS.surface} />
    <Rect x="12" y="20" width="25" height="30" rx="4" fill={FUTURE_COLORS.elevated} stroke={FUTURE_COLORS.primary} strokeWidth="1" />
    <Circle cx="24.5" cy="30" r="8" fill={FUTURE_COLORS.primary} opacity="0.3" />
    <Rect x="45" y="22" width="40" height="4" rx="2" fill={FUTURE_COLORS.primary} />
    <Rect x="45" y="30" width="30" height="4" rx="2" fill={FUTURE_COLORS.primary} opacity="0.5" />
    <Rect x="45" y="38" width="35" height="4" rx="2" fill={FUTURE_COLORS.primary} opacity="0.3" />
  </Svg>
);

// Camera Icon
const CameraIcon = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36">
    <Defs><LinearGradient id="camG" x1="0%" y1="0%" x2="100%" y2="100%"><Stop offset="0%" stopColor={FUTURE_COLORS.primary} /><Stop offset="100%" stopColor={FUTURE_COLORS.accent} /></LinearGradient></Defs>
    <Circle cx="18" cy="20" r="7" fill="url(#camG)" />
    <Path d="M13.5 6L11.12 9H6C4.35 9 3 10.35 3 12V27C3 28.65 4.35 30 6 30H30C31.65 30 33 28.65 33 27V12C33 10.35 31.65 9 30 9H24.88L22.5 6H13.5Z" fill="url(#camG)" />
  </Svg>
);

// Gallery Icon
const GalleryIcon = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36">
    <Defs><LinearGradient id="galG" x1="0%" y1="0%" x2="100%" y2="100%"><Stop offset="0%" stopColor={FUTURE_COLORS.primary} /><Stop offset="100%" stopColor={FUTURE_COLORS.accent} /></LinearGradient></Defs>
    <Path d="M31.5 28.5V7.5C31.5 5.85 30.15 4.5 28.5 4.5H7.5C5.85 4.5 4.5 5.85 4.5 7.5V28.5C4.5 30.15 5.85 31.5 7.5 31.5H28.5C30.15 31.5 31.5 30.15 31.5 28.5ZM12.75 20.25L16.5 24.765L21.75 18L28.5 27H7.5L12.75 20.25Z" fill="url(#galG)" />
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
        if (status !== 'granted') { Alert.alert('Permission Needed', 'Camera access required.'); return; }
        result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [16, 10], quality: 0.8, base64: true });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission Needed', 'Photo library access required.'); return; }
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [16, 10], quality: 0.8, base64: true });
      }
      if (!result.canceled && result.assets[0]) setImage(result.assets[0]);
    } catch (err) {
      Alert.alert('Error', 'Could not select image.');
    }
  };

  const handleVerify = async () => {
    if (!image?.base64) { Alert.alert('No Image', 'Please take or select a photo of your ID.'); return; }

    let userId = params.userId;
    if (!userId && params.email) {
      try {
        const checkRes = await axios.post(`${API_URL}/check-user`, { email: params.email });
        userId = checkRes.data.user_id;
      } catch (e) {}
    }
    if (!userId) { Alert.alert('Error', 'User info not found. Please go back.'); return; }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/verify-government-id`, { user_id: userId, user_email: params.email, image_data: image.base64 });
      if (response.data.age_verified) {
        Alert.alert('Verified!', 'Your identity has been confirmed.', [{
          text: 'Enter LiftLink',
          onPress: async () => {
            try {
              const loginResponse = await axios.post(`${API_URL}/login`, { email: params.email });
              await setUser({ ...loginResponse.data.user, token: loginResponse.data.access_token });
              router.replace('/(tabs)');
            } catch { router.replace('/(auth)'); }
          },
        }]);
      } else {
        Alert.alert('Failed', response.data.rejection_reason || 'Could not verify. Try a clearer photo.');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.detail || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ParticleField count={6} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24"><Path d="M15 18L9 12L15 6" stroke={FUTURE_COLORS.text} strokeWidth="2" strokeLinecap="round" /></Svg>
            </TouchableOpacity>
            <FutureLogo size={32} />
            <View style={styles.placeholder} />
          </View>

          <View style={styles.iconContainer}><IdCardIcon size={140} /></View>

          <View style={styles.infoContainer}>
            <Text style={styles.title}>Age Verification</Text>
            <Text style={styles.description}>Upload a photo of your government-issued ID for instant verification (18+).</Text>
          </View>

          <View style={styles.uploadSection}>
            {image ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image.uri }} style={styles.preview} />
                <TouchableOpacity style={styles.removeButton} onPress={() => setImage(null)}>
                  <Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M18 6L6 18M6 6L18 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></Svg>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadOptions}>
                <TouchableOpacity style={styles.uploadOption} onPress={() => pickImage(true)}>
                  <View style={styles.uploadIconBg}><CameraIcon size={36} /></View>
                  <Text style={styles.uploadText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadOption} onPress={() => pickImage(false)}>
                  <View style={styles.uploadIconBg}><GalleryIcon size={36} /></View>
                  <Text style={styles.uploadText}>Choose Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.privacyNote}>
            <Svg width={24} height={24} viewBox="0 0 24 24"><Rect x="5" y="11" width="14" height="10" rx="2" stroke={FUTURE_COLORS.accent} strokeWidth="2" fill="none" /><Path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke={FUTURE_COLORS.accent} strokeWidth="2" fill="none" /></Svg>
            <View style={styles.privacyTextContainer}>
              <Text style={styles.privacyTitle}>Secure & Private</Text>
              <Text style={styles.privacyText}>Your ID is processed securely and NOT stored.</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            {image && <FutureButton title="Verify Identity" onPress={handleVerify} loading={loading} variant="primary" size="large" />}
            <FutureButton
              title="Skip for Now"
              onPress={() => Alert.alert('Skip?', "You won't be able to use LiftLink without verification.", [{ text: 'Cancel', style: 'cancel' }, { text: 'Skip', style: 'destructive', onPress: () => router.replace('/(auth)') }])}
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
  container: { flex: 1, backgroundColor: FUTURE_COLORS.void },
  safeArea: { flex: 1 },
  scrollContent: { padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: FUTURE_COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: FUTURE_COLORS.border },
  placeholder: { width: 48 },
  iconContainer: { alignItems: 'center', marginBottom: 24 },
  infoContainer: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: FUTURE_COLORS.text, marginBottom: 12 },
  description: { fontSize: 15, color: FUTURE_COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  uploadSection: { marginBottom: 24 },
  uploadOptions: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  uploadOption: { alignItems: 'center', padding: 20, backgroundColor: FUTURE_COLORS.surface, borderRadius: 20, borderWidth: 1, borderColor: FUTURE_COLORS.border, width: 140 },
  uploadIconBg: { width: 72, height: 72, borderRadius: 20, backgroundColor: FUTURE_COLORS.elevated, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: FUTURE_COLORS.border },
  uploadText: { color: FUTURE_COLORS.text, fontSize: 14, fontWeight: '600' },
  previewContainer: { position: 'relative', alignItems: 'center' },
  preview: { width: '100%', height: 200, borderRadius: 20, backgroundColor: FUTURE_COLORS.surface },
  removeButton: { position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: FUTURE_COLORS.error, alignItems: 'center', justifyContent: 'center' },
  privacyNote: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: FUTURE_COLORS.surface, padding: 18, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: FUTURE_COLORS.border },
  privacyTextContainer: { flex: 1, marginLeft: 14 },
  privacyTitle: { color: FUTURE_COLORS.accent, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  privacyText: { color: FUTURE_COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  buttons: { marginTop: 8 },
});
