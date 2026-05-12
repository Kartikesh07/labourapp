import { Platform, TextStyle, ViewStyle } from 'react-native';

// ─── KaamReady Color Palette (Light Theme) ──────────────────────────────────
export const Colors = {
  // Primary — Indigo (brand confidence, trust)
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  primaryDeep: '#1E1B4B',
  primaryMuted: 'rgba(79, 70, 229, 0.10)',
  primaryBorder: 'rgba(79, 70, 229, 0.28)',

  // Accent — Orange (energy, action, warmth)
  accent: '#F97316',
  accentLight: '#FED7AA',
  accentDark: '#EA580C',
  accentMuted: 'rgba(249, 115, 22, 0.12)',

  // Surfaces — warm lavender tint, NOT LinkedIn grey
  background: '#F5F3FF',
  surface: '#FFFFFF',
  surfaceLight: '#FAF9FF',
  surfaceElevated: '#FFFFFF',

  // Hero (auth screens, gradient headers)
  hero: '#4F46E5',
  heroDeep: '#312E81',

  // Text — deep indigo-tinted, not cold black
  textPrimary: '#1E1B4B',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  textAccent: '#F97316',

  // Status
  success: '#059669',
  successLight: 'rgba(5, 150, 105, 0.10)',
  warning: '#D97706',
  warningLight: 'rgba(217, 119, 6, 0.10)',
  error: '#DC2626',
  errorLight: 'rgba(220, 38, 38, 0.08)',
  info: '#4F46E5',
  infoLight: 'rgba(79, 70, 229, 0.10)',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F0EFFE',

  // Misc
  white: '#FFFFFF',
  black: '#111827',
  overlay: 'rgba(30, 27, 75, 0.65)',
  shimmer: '#EDE9FE',
  shimmerHighlight: '#F5F3FF',
};

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// ─── Border Radii ─────────────────────────────────────────────────────────────
export const Radii = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
const getFontFamily = () => {
  try {
    return Platform.OS === 'ios' ? 'System' : 'Roboto';
  } catch (e) {
    return 'System';
  }
};

const fontFamily = getFontFamily();

export const Typography = {
  hero: {
    fontFamily,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 42,
    letterSpacing: -0.8,
    color: Colors.textPrimary,
  } as TextStyle,

  h1: {
    fontFamily,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.4,
    color: Colors.textPrimary,
  } as TextStyle,

  h2: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.2,
    color: Colors.textPrimary,
  } as TextStyle,

  h3: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    color: Colors.textPrimary,
  } as TextStyle,

  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: Colors.textPrimary,
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
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0.2,
  } as TextStyle,
};

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  md: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  } as ViewStyle,

  lg: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
  } as ViewStyle,

  glow: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  } as ViewStyle,

  accentGlow: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,
};

const theme = { Colors, Spacing, Radii, Typography, Shadows };
export default theme;
