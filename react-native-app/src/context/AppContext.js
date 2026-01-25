/**
 * App Context - Global State Management
 * Provides user, theme, and app-wide state
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://deploy-savior-1.preview.emergentagent.com/api';

// Theme colors
const darkColors = {
  background: '#111827',
  surface: '#1f2937',
  surfaceLight: '#374151',
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  accent: '#10b981',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  border: '#374151',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
};

const lightColors = {
  background: '#ffffff',
  surface: '#f3f4f6',
  surfaceLight: '#e5e7eb',
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  accent: '#10b981',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
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
