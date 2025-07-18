import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// LiftLink React Native Styles
// Converted from CSS to React Native StyleSheet

export const colors = {
  // Primary Theme Colors
  primary: '#4f46e5',
  secondary: '#10b981',
  accent: '#8b5cf6',
  warning: '#f59e0b',
  error: '#ef4444',
  success: '#10b981',
  
  // Cyberpunk Theme Colors
  cyberpunkPrimary: '#C4D600',
  cyberpunkSecondary: '#00D4AA',
  cyberpunkAccent: '#FFD700',
  
  // Background Colors
  backgroundDark: '#0f172a',
  backgroundLight: '#f8fafc',
  surfaceDark: '#1e293b',
  surfaceLight: '#ffffff',
  
  // Text Colors
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textLight: '#1e293b',
  textLightSecondary: '#64748b',
  
  // Glass Effect Colors
  glassOverlay: 'rgba(255, 255, 255, 0.05)',
  glassOverlayLight: 'rgba(255, 255, 255, 0.9)',
  
  // Border Colors
  borderDark: 'rgba(196, 214, 0, 0.2)',
  borderLight: 'rgba(59, 130, 246, 0.2)',
  
  // Overlay Colors
  overlayDark: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(255, 255, 255, 0.95)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cyberpunk: {
    shadowColor: colors.cyberpunkPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const styles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  
  containerLight: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  
  // Glass Card Styles (Dark Theme)
  glassCardDark: {
    backgroundColor: colors.glassOverlay,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: spacing.md,
    ...shadows.md,
  },
  
  glassCardLight: {
    backgroundColor: colors.glassOverlayLight,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadows.md,
  },
  
  // Button Styles
  premiumButtonPrimary: {
    backgroundColor: colors.cyberpunkPrimary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.cyberpunk,
  },
  
  premiumButtonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg - 2,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cyberpunkPrimary,
  },
  
  premiumButtonLight: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  
  premiumButtonLightSecondary: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg - 2,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  // Button Text Styles
  buttonTextPrimary: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#000000',
  },
  
  buttonTextSecondary: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.cyberpunkPrimary,
  },
  
  buttonTextLight: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  
  buttonTextLightSecondary: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  
  // Input Styles
  premiumInput: {
    backgroundColor: colors.glassOverlay,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.borderDark,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 6,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    minHeight: 44, // Touch target
  },
  
  premiumInputLight: {
    backgroundColor: colors.glassOverlayLight,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 6,
    fontSize: fontSize.md,
    color: colors.textLight,
    minHeight: 44, // Touch target
  },
  
  // Text Styles
  textPrimary: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.normal,
  },
  
  textSecondary: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.normal,
  },
  
  textLight: {
    fontSize: fontSize.md,
    color: colors.textLight,
    fontWeight: fontWeight.normal,
  },
  
  textLightSecondary: {
    fontSize: fontSize.sm,
    color: colors.textLightSecondary,
    fontWeight: fontWeight.normal,
  },
  
  // Heading Styles
  headingLarge: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  headingMedium: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  headingSmall: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  headingLargeLight: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  
  headingMediumLight: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  
  headingSmallLight: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  
  // Layout Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  columnCenter: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Spacing Styles
  marginXs: { margin: spacing.xs },
  marginSm: { margin: spacing.sm },
  marginMd: { margin: spacing.md },
  marginLg: { margin: spacing.lg },
  marginXl: { margin: spacing.xl },
  
  paddingXs: { padding: spacing.xs },
  paddingSm: { padding: spacing.sm },
  paddingMd: { padding: spacing.md },
  paddingLg: { padding: spacing.lg },
  paddingXl: { padding: spacing.xl },
  
  marginBottomXs: { marginBottom: spacing.xs },
  marginBottomSm: { marginBottom: spacing.sm },
  marginBottomMd: { marginBottom: spacing.md },
  marginBottomLg: { marginBottom: spacing.lg },
  marginBottomXl: { marginBottom: spacing.xl },
  
  marginTopXs: { marginTop: spacing.xs },
  marginTopSm: { marginTop: spacing.sm },
  marginTopMd: { marginTop: spacing.md },
  marginTopLg: { marginTop: spacing.lg },
  marginTopXl: { marginTop: spacing.xl },
  
  // Tree Container Styles
  treeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.sm,
    ...shadows.md,
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
  },
  
  loadingContainerLight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContainer: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.md,
    maxWidth: width - (spacing.md * 2),
    maxHeight: height - (spacing.lg * 2),
  },
  
  modalContainerLight: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.md,
    maxWidth: width - (spacing.md * 2),
    maxHeight: height - (spacing.lg * 2),
    ...shadows.lg,
  },
  
  // Card Styles
  card: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  
  cardLight: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  
  // Avatar Styles
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Badge Styles
  badge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  
  // Divider Styles
  divider: {
    height: 1,
    backgroundColor: colors.borderDark,
    marginVertical: spacing.sm,
  },
  
  dividerLight: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  
  // Status Bar Styles
  statusBar: {
    backgroundColor: colors.backgroundDark,
  },
  
  statusBarLight: {
    backgroundColor: colors.backgroundLight,
  },
  
  // Scroll View Styles
  scrollView: {
    flex: 1,
  },
  
  scrollViewContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  
  // Grid Styles
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  gridItem: {
    width: '48%',
    marginBottom: spacing.sm,
  },
  
  gridItemThird: {
    width: '31%',
    marginBottom: spacing.sm,
  },
  
  // Form Styles
  formContainer: {
    padding: spacing.md,
  },
  
  formGroup: {
    marginBottom: spacing.md,
  },
  
  formLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  
  formLabelLight: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textLightSecondary,
    marginBottom: spacing.xs,
  },
  
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  
  tabContainerLight: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    ...shadows.sm,
  },
  
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  
  tabButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  
  tabButtonTextActive: {
    color: colors.textPrimary,
  },
  
  // List Styles
  listContainer: {
    flex: 1,
  },
  
  listItem: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  
  listItemLight: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  
  // Error Styles
  errorContainer: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  
  errorText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  
  // Success Styles
  successContainer: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  
  successText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  
  // Warning Styles
  warningContainer: {
    backgroundColor: colors.warning,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  
  warningText: {
    fontSize: fontSize.sm,
    color: '#000000',
    textAlign: 'center',
  },
  
  // Accessibility Styles
  touchableArea: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Platform Specific Styles
  ...Platform.select({
    ios: {
      shadowContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    },
    android: {
      shadowContainer: {
        elevation: 4,
      },
    },
  }),
});

export default styles;
export { colors, spacing, borderRadius, fontSize, fontWeight, shadows };