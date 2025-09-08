// EduSphere Professional Color System
export const colors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',    // Main primary
    600: '#2563eb',    // Darker primary
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary Colors
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',    // Main secondary
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Neutral Colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',    // Main neutral
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Semantic Colors
  background: '#f8fafc',
  surface: '#ffffff',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    disabled: '#9ca3af',
  },
  
  // Border Colors
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
  }
};

// CSS Custom Properties for easy theming
export const cssVariables = {
  '--color-primary': colors.primary[500],
  '--color-primary-dark': colors.primary[600],
  '--color-primary-light': colors.primary[400],
  '--color-secondary': colors.secondary[500],
  '--color-success': colors.success,
  '--color-warning': colors.warning,
  '--color-error': colors.error,
  '--color-info': colors.info,
  '--color-text-primary': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--color-background': colors.background,
  '--color-surface': colors.surface,
  '--color-border': colors.border.light,
};

// Bulma color class mappings
export const bulmaColors = {
  primary: 'is-primary',
  secondary: 'is-info',
  success: 'is-success',
  warning: 'is-warning',
  danger: 'is-danger',
  light: 'is-light',
  dark: 'is-dark',
  white: 'is-white',
  black: 'is-black',
};
