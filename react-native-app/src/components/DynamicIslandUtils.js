import React from 'react';
import { View, StatusBar, Platform, Text } from 'react-native';
import { deviceSize, dynamicIsland, colors } from '../styles/AppStyles';

// Dynamic Island Aware Status Bar Component
export const DynamicIslandStatusBar = ({ backgroundColor = colors.backgroundDark, barStyle = 'light-content' }) => {
  if (Platform.OS !== 'ios') {
    return <StatusBar backgroundColor={backgroundColor} barStyle={barStyle} />;
  }

  return (
    <>
      <StatusBar 
        backgroundColor="transparent" 
        barStyle={barStyle} 
        translucent={true}
      />
      {deviceSize.hasDynamicIsland && (
        <View style={{
          height: dynamicIsland.statusBarHeight,
          backgroundColor: backgroundColor,
          width: '100%',
        }} />
      )}
    </>
  );
};

// Dynamic Island Safe Area Wrapper
export const DynamicIslandSafeWrapper = ({ children, backgroundColor = colors.backgroundDark }) => {
  return (
    <View style={{
      flex: 1,
      backgroundColor: backgroundColor,
      paddingTop: deviceSize.hasDynamicIsland ? dynamicIsland.statusBarHeight : 0,
    }}>
      {children}
    </View>
  );
};

// Dynamic Island Aware Header Component
export const DynamicIslandHeader = ({ 
  title, 
  leftComponent, 
  rightComponent, 
  backgroundColor = colors.surfaceDark,
  titleColor = colors.textPrimary 
}) => {
  return (
    <View style={{
      backgroundColor: backgroundColor,
      paddingTop: dynamicIsland.headerTopPadding,
      paddingBottom: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderDark,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: deviceSize.hasDynamicIsland ? dynamicIsland.notificationAreaHeight : 60,
    }}>
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        {leftComponent}
      </View>
      
      <View style={{ flex: 2, alignItems: 'center' }}>
        {title && (
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: titleColor,
            marginTop: deviceSize.hasDynamicIsland ? 4 : 0,
          }}>
            {title}
          </Text>
        )}
      </View>
      
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        {rightComponent}
      </View>
    </View>
  );
};

// Dynamic Island Notification Component
export const DynamicIslandNotification = ({ 
  message, 
  type = 'success', 
  visible = false, 
  onDismiss 
}) => {
  if (!visible) return null;

  const notificationColors = {
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
    info: colors.primary,
  };

  return (
    <View style={{
      position: 'absolute',
      top: dynamicIsland.overlayTopOffset,
      left: 16,
      right: 16,
      backgroundColor: colors.surfaceDark,
      padding: 12,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: notificationColors[type],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1000,
      // Ensure it doesn't interfere with Dynamic Island
      marginTop: deviceSize.hasDynamicIsland ? 10 : 0,
    }}>
      <Text style={{
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '500',
      }}>
        {message}
      </Text>
    </View>
  );
};

export default {
  DynamicIslandStatusBar,
  DynamicIslandSafeWrapper,
  DynamicIslandHeader,
  DynamicIslandNotification,
};