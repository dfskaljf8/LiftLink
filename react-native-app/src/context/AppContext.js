/**
 * App Context - Global State Management
 * Provides user, theme, and app-wide state
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://swiftauth-1.preview.emergentagent.com/api';

// Theme colors - Futuristic 2050
const darkColors = {
  background: '#000000',
  surface: '#0a0a0f',
  surfaceLight: '#12121a',
  primary: '#00F0FF',
  primaryDark: '#00A8B8',
  accent: '#00FF94',
  text: '#ffffff',
  textSecondary: '#8888AA',
  border: '#1a1a2e',
  error: '#FF4466',
  warning: '#FFB800',
  success: '#00FF94',
};

const lightColors = {
  background: '#000000',
  surface: '#0a0a0f',
  surfaceLight: '#12121a',
  primary: '#00F0FF',
  primaryDark: '#00A8B8',
  accent: '#00FF94',
  text: '#ffffff',
  textSecondary: '#8888AA',
  border: '#1a1a2e',
  error: '#FF4466',
  warning: '#FFB800',
  success: '#00FF94',
};

// Create context
const AppContext = createContext(null);

// Provider component
export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [treeProgress, setTreeProgress] = useState(null);
  const [sessions, setSessions] = useState([]);

  const colors = darkMode ? darkColors : lightColors;

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  // Fetch user data when user changes
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user?.id]);

  const initializeApp = async () => {
    try {
      // Check for saved user
      const savedUser = await AsyncStorage.getItem('liftlink_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }

      // Check dark mode preference
      const savedDarkMode = await AsyncStorage.getItem('liftlink_darkMode');
      if (savedDarkMode !== null) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    } catch (error) {
      console.error('Init error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!user?.id) return;

    try {
      const [treeRes, sessionsRes] = await Promise.all([
        axios.get(`${API_URL}/tree-progress/${user.id}`).catch(() => ({ data: null })),
        axios.get(`${API_URL}/sessions/user/${user.id}`).catch(() => ({ data: { sessions: [] } })),
      ]);

      setTreeProgress(treeRes.data);
      setSessions(sessionsRes.data?.sessions || []);
    } catch (error) {
      console.error('Fetch user data error:', error);
    }
  };

  const handleSetUser = async (userData) => {
    try {
      if (userData) {
        await AsyncStorage.setItem('liftlink_user', JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem('liftlink_user');
      }
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('liftlink_user');
      setUser(null);
      setTreeProgress(null);
      setSessions([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    await AsyncStorage.setItem('liftlink_darkMode', JSON.stringify(newMode));
  };

  const value = {
    user,
    setUser: handleSetUser,
    loading,
    colors,
    darkMode,
    toggleDarkMode,
    treeProgress,
    sessions,
    handleLogout,
    refreshUserData: fetchUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook for using context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
