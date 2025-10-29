import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, Easing } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

/**
 * LiftLink Animated Splash Screen
 * Inspired by Duolingo's engaging splash screen
 * Features animated SVG barbell and logo with lime green theme
 */

const AnimatedSplashScreen = ({ onFinish }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const barbellLeftAnim = useRef(new Animated.Value(-100)).current;
  const barbellRightAnim = useRef(new Animated.Value(100)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(50)).current;
  const taglineFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Phase 1: Fade in and scale (0-800ms)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      
      // Phase 2: Barbell assembly (800-1600ms)
      Animated.parallel([
        Animated.spring(barbellLeftAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(barbellRightAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      
      // Phase 3: Glow effect (1600-2400ms)
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      
      // Phase 4: Subtle rotation (2400-3000ms)
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      
      // Phase 5: Tagline appears (3000-3500ms)
      Animated.parallel([
        Animated.spring(taglineAnim, {
          toValue: 0,
          tension: 120,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(taglineFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Wait 1 second then finish
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 1000);
    });
  }, []);

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.gradientBackground}>
        <View style={[styles.gradientCircle, { top: '20%', left: '10%' }]} />
        <View style={[styles.gradientCircle, { bottom: '30%', right: '15%' }]} />
      </View>

      {/* Main logo animation container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { rotate },
            ],
          },
        ]}
      >
        {/* Glow effect behind logo */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        {/* Barbell SVG */}
        <Svg width={280} height={120} viewBox="0 0 280 120">
          <Defs>
            <LinearGradient id="limeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#BFFF00" stopOpacity="1" />
              <Stop offset="50%" stopColor="#CCFF00" stopOpacity="1" />
              <Stop offset="100%" stopColor="#89E219" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
              <Stop offset="100%" stopColor="#FFC800" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Left barbell weight */}
          <Animated.G style={{ transform: [{ translateX: barbellLeftAnim }] }}>
            <Path
              d="M 20 40 L 20 80 L 40 80 L 40 40 Z"
              fill="url(#limeGradient)"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <Path
              d="M 40 35 L 40 85 L 50 85 L 50 35 Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </Animated.G>

          {/* Center bar */}
          <Path
            d="M 50 57 L 230 57 L 230 63 L 50 63 Z"
            fill="url(#yellowGradient)"
            stroke="#FFFFFF"
            strokeWidth="2"
          />

          {/* Center accent bars */}
          <Path
            d="M 120 52 L 120 68 L 125 68 L 125 52 Z"
            fill="url(#limeGradient)"
          />
          <Path
            d="M 155 52 L 155 68 L 160 68 L 160 52 Z"
            fill="url(#limeGradient)"
          />

          {/* Right barbell weight */}
          <Animated.G style={{ transform: [{ translateX: barbellRightAnim }] }}>
            <Path
              d="M 230 35 L 230 85 L 240 85 L 240 35 Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <Path
              d="M 240 40 L 240 80 L 260 80 L 260 40 Z"
              fill="url(#limeGradient)"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </Animated.G>

          {/* Animated motion lines (energy effect) */}
          <Animated.G opacity={glowAnim}>
            <Path
              d="M 10 30 Q 5 60 10 90"
              stroke="url(#limeGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M 270 30 Q 275 60 270 90"
              stroke="url(#limeGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </Animated.G>
        </Svg>

        {/* LiftLink text */}
        <Animated.Text style={[styles.logoText, { opacity: fadeAnim }]}>
          <Animated.Text style={styles.logoTextLime}>Lift</Animated.Text>
          <Animated.Text style={styles.logoTextWhite}>Link</Animated.Text>
        </Animated.Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={[
          styles.taglineContainer,
          {
            opacity: taglineFadeAnim,
            transform: [{ translateY: taglineAnim }],
          },
        ]}
      >
        <Animated.Text style={styles.tagline}>Beginners to Believers</Animated.Text>
      </Animated.View>

      {/* Bottom branding */}
      <Animated.View style={[styles.bottomBranding, { opacity: taglineFadeAnim }]}>
        <Animated.Text style={styles.versionText}>v1.0.0</Animated.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#BFFF00',
    opacity: 0.05,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#BFFF00',
    opacity: 0.3,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    marginTop: 20,
    letterSpacing: 2,
  },
  logoTextLime: {
    color: '#BFFF00',
  },
  logoTextWhite: {
    color: '#FFFFFF',
  },
  taglineContainer: {
    position: 'absolute',
    bottom: height * 0.25,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
  },
  bottomBranding: {
    position: 'absolute',
    bottom: 40,
  },
  versionText: {
    fontSize: 12,
    color: '#7A7A7A',
    fontWeight: '500',
  },
});

export default AnimatedSplashScreen;
