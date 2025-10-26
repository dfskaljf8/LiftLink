import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Theme Context for Light/Dark Mode
 * Duolingo + Revolut Inspired Design System
 * Light Mode: Default (Duolingo's bright, playful aesthetic)
 * Dark Mode: Optional (Revolut's premium dark theme)
 */

// DUOLINGO + REVOLUT INSPIRED COLOR PALETTE
export const lightTheme = {
  // Primary Colors (Duolingo-inspired bright and playful)
  primary: '#58CC02',          // Duolingo green
  primaryDark: '#46A302',      // Darker green
  primaryLight: '#89E219',     // Lighter green
  secondary: '#1CB0F6',        // Duolingo blue
  accent: '#FF9600',           // Duolingo orange
  warning: '#FFC800',          // Duolingo yellow
  error: '#FF4B4B',            // Duolingo red
  success: '#58CC02',          // Success green
  
  // Background Colors (Clean and bright like Revolut)
  background: '#FFFFFF',       // Pure white background
  surface: '#F7F7F7',          // Light gray surface
  card: '#FFFFFF',             // White cards
  elevated: '#FFFFFF',         // Elevated components
  
  // Text Colors (High contrast for readability)
  textPrimary: '#1F2937',      // Almost black
  textSecondary: '#6B7280',    // Medium gray
  textTertiary: '#9CA3AF',     // Light gray
  textInverse: '#FFFFFF',      // White text on dark backgrounds
  
  // Border Colors
  border: '#E5E7EB',           // Light border
  borderStrong: '#D1D5DB',     // Stronger border
  divider: '#F3F4F6',          // Subtle divider
  
  // Status Colors (Duolingo-inspired)
  statusSuccess: '#58CC02',
  statusWarning: '#FFC800',
  statusError: '#FF4B4B',
  statusInfo: '#1CB0F6',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  modalBackdrop: 'rgba(0, 0, 0, 0.6)',
  
  // Shadow Colors
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowMedium: 'rgba(0, 0, 0, 0.1)',
  shadowStrong: 'rgba(0, 0, 0, 0.15)',
  
  // Gradient Colors (Revolut-inspired premium gradients)
  gradientStart: '#58CC02',
  gradientEnd: '#1CB0F6',
  
  // Gamification Colors (Duolingo streaks, progress)
  streak: '#FF9600',
  achievement: '#FFD700',
  progress: '#58CC02',
  
  // Input Colors
  inputBackground: '#F9FAFB',
  inputBorder: '#E5E7EB',
  inputFocus: '#58CC02',
  inputError: '#FF4B4B',
  
  // Button Colors
  buttonPrimary: '#58CC02',
  buttonPrimaryHover: '#46A302',
  buttonSecondary: '#F3F4F6',
  buttonSecondaryHover: '#E5E7EB',
  buttonDisabled: '#E5E7EB',
  
  // Chart Colors (for analytics/progress)
  chartPrimary: '#58CC02',
  chartSecondary: '#1CB0F6',
  chartTertiary: '#FF9600',
  chartGrid: '#F3F4F6',
};

export const darkTheme = {
  // Primary Colors (Revolut dark mode aesthetic)
  primary: '#58CC02',
  primaryDark: '#46A302',
  primaryLight: '#89E219',
  secondary: '#1CB0F6',
  accent: '#FF9600',
  warning: '#FFC800',
  error: '#FF4B4B',
  success: '#58CC02',
  
  // Background Colors (Revolut-inspired premium dark)
  background: '#0A0E27',       // Deep navy/black
  surface: '#141B3B',          // Slightly lighter navy
  card: '#1A2344',             // Card background
  elevated: '#232B4E',         // Elevated components
  
  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#707070',
  textInverse: '#1F2937',
  
  // Border Colors
  border: '#2A3454',
  borderStrong: '#3A445E',
  divider: '#1F2845',
  
  // Status Colors
  statusSuccess: '#58CC02',
  statusWarning: '#FFC800',
  statusError: '#FF4B4B',
  statusInfo: '#1CB0F6',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  modalBackdrop: 'rgba(0, 0, 0, 0.8)',
  
  // Shadow Colors
  shadowLight: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.5)',
  shadowStrong: 'rgba(0, 0, 0, 0.7)',
  
  // Gradient Colors
  gradientStart: '#58CC02',
  gradientEnd: '#1CB0F6',
  
  // Gamification Colors
  streak: '#FF9600',
  achievement: '#FFD700',
  progress: '#58CC02',
  
  // Input Colors
  inputBackground: '#1A2344',
  inputBorder: '#2A3454',
  inputFocus: '#58CC02',
  inputError: '#FF4B4B',
  
  // Button Colors
  buttonPrimary: '#58CC02',
  buttonPrimaryHover: '#46A302',
  buttonSecondary: '#1A2344',
  buttonSecondaryHover: '#232B4E',
  buttonDisabled: '#2A3454',
  
  // Chart Colors
  chartPrimary: '#58CC02',
  chartSecondary: '#1CB0F6',
  chartTertiary: '#FF9600',
  chartGrid: '#1F2845',
};

// Theme Context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Light mode is default
  const [theme, setTheme] = useState(lightTheme);

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update theme when dark mode changes
  useEffect(() => {
    setTheme(isDarkMode ? darkTheme : lightTheme);
    saveThemePreference(isDarkMode);
  }, [isDarkMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (isDark) => {
    try {
      await AsyncStorage.setItem('theme_preference', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleTheme,
        isLightMode: !isDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
