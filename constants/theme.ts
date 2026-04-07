/**
 * STEMM Labs Design System
 * Based on Phase One Design Report — Material Design 3 theming
 */

import '@/types/global.css';
import { Platform } from 'react-native';

// ─── Colour Palettes ─────────────────────────────────────────────
export const Colors = {
  light: {
    primary: '#1A9B7B',
    primaryVariant: '#2563EB',
    secondary: '#10B981',
    secondaryVariant: '#059669',
    background: '#F0F2F5',
    surface: '#FFFFFF',
    surfaceVariant: '#F8F9FA',
    error: '#EF4444',
    onPrimary: '#FFFFFF',
    onBackground: '#111827',
    onSurface: '#374151',
    onSurfaceSecondary: '#6B7280',
    onError: '#FFFFFF',
    // Functional
    text: '#111827',
    textSecondary: '#6B7280',
    backgroundElement: '#E5E7EB',
    backgroundSelected: '#D1FAE5',
    border: '#E5E7EB',
    // Category accents
    engineering: '#2563EB',
    health: '#10B981',
    // Status
    statusNotStarted: '#9CA3AF',
    statusInProgress: '#F59E0B',
    statusCompleted: '#10B981',
  } as Record<string, string>,
  dark: {
    primary: '#1A9B7B',
    primaryVariant: '#3B82F6',
    secondary: '#10B981',
    secondaryVariant: '#059669',
    background: '#1A1F2E',
    surface: '#252B3B',
    surfaceVariant: '#2E3549',
    error: '#EF4444',
    onPrimary: '#FFFFFF',
    onBackground: '#F9FAFB',
    onSurface: '#D1D5DB',
    onSurfaceSecondary: '#9CA3AF',
    onError: '#FFFFFF',
    // Functional
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    backgroundElement: '#2E3549',
    backgroundSelected: '#1A3A2A',
    border: '#374151',
    // Category accents
    engineering: '#3B82F6',
    health: '#10B981',
    // Status
    statusNotStarted: '#6B7280',
    statusInProgress: '#F59E0B',
    statusCompleted: '#10B981',
  } as Record<string, string>,
};

export type ThemeColors = Record<string, string>;

// ─── Typography ──────────────────────────────────────────────────
// Material Design 3 type scale (sizes in logical pixels)
export const Typography = {
  displayLarge: { fontSize: 57, fontWeight: '400' as const, lineHeight: 64 },
  headlineLarge: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  headlineMedium: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  titleLarge: { fontSize: 24, fontWeight: '500' as const, lineHeight: 32 },
  titleMedium: { fontSize: 20, fontWeight: '500' as const, lineHeight: 28 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  labelLarge: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  labelSmall: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16 },
} as const;

// ─── Fonts ───────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    mono: 'monospace',
  },
  default: {
    sans: 'System',
    serif: 'serif',
    mono: 'monospace',
  },
  web: {
    sans: "'Inter', 'Roboto', system-ui, sans-serif",
    serif: "'Georgia', serif",
    mono: "'Fira Code', monospace",
  },
});

// ─── Spacing ─────────────────────────────────────────────────────
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64,
} as const;

// ─── Border Radius ───────────────────────────────────────────────
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// ─── Layout ──────────────────────────────────────────────────────
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// ─── Icon Sizes ──────────────────────────────────────────────────
export const IconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;
