import { Platform, TextStyle, ViewStyle } from 'react-native';

// ─── KaamReady Color Palette (Modern Tech) ──────────────────────────────────
export const Colors = {
  // Primary — Deep Slate/Indigo mix for professional feel
  primary: '#4338CA',
  primaryLight: '#6366F1',
  primaryDark: '#3730A3',
  primaryDeep: '#1E1B4B',
  primaryMuted: 'rgba(99, 102, 241, 0.08)',
  primaryBorder: 'rgba(99, 102, 241, 0.2)',

  // Accent — Emerald (fresh, growth, opportunity)
  accent: '#10B981',
  accentLight: '#A7F3D0',
  accentDark: '#059669',
  accentMuted: 'rgba(16, 185, 129, 0.12)',

  // Surfaces — Clean and crisp
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  surfaceElevated: '#FFFFFF',

  // Hero
  hero: '#1E293B',
  heroDeep: '#0F172A',

  // Text — Optimized for readability
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  textAccent: '#10B981',

  // Status
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.1)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.1)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.08)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.1)',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Misc
  white: '#FFFFFF',
  black: '#020617',
  overlay: 'rgba(15, 23, 42, 0.7)',
  shimmer: '#F1F5F9',
  shimmerHighlight: '#F8FAFC',
};

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 56,
} as const;

// ─── Border Radii ─────────────────────────────────────────────────────────────
export const Radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
const getFontFamily = () => {
  try {
    return Platform.OS === 'ios' ? 'System' : 'Inter'; // Fallback to System if Inter isn't loaded
  } catch (e) {
    return 'System';
  }
};

const fontFamily = getFontFamily();

export const Typography = {
  hero: {
    fontFamily,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -1,
    color: Colors.textPrimary,
  } as TextStyle,

  h1: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.5,
    color: Colors.textPrimary,
  } as TextStyle,

  h2: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.25,
    color: Colors.textPrimary,
  } as TextStyle,

  h3: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: Colors.textPrimary,
  } as TextStyle,

  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: Colors.textSecondary,
  } as TextStyle,

  bodyMedium: {
    fontFamily,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: Colors.textPrimary,
  } as TextStyle,

  bodySm: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: Colors.textSecondary,
  } as TextStyle,

  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: Colors.textMuted,
  } as TextStyle,

  label: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: Colors.textPrimary,
  } as TextStyle,

  button: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,
};

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,

  glow: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,

  accentGlow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,
};

const theme = { Colors, Spacing, Radii, Typography, Shadows };
export default theme;
