// lib/theme.ts - Theme configuration and utilities

export const THEMES = {
  light: {
    name: 'light',
    colors: {
      // Background
      bg: {
        primary: '#FFFFFF',
        secondary: '#F8F7F6',
        tertiary: '#F3F4F6',
        hover: '#F0EFF0',
        active: '#E5E7EB',
      },
      
      // Text
      text: {
        primary: '#1F2937',
        secondary: '#6B7280',
        tertiary: '#9CA3AF',
        inverse: '#FFFFFF',
      },
      
      // Borders
      border: {
        light: '#F3F4F6',
        default: '#E5E7EB',
        dark: '#D1D5DB',
      },
      
      // Accent Colors
      accent: {
        emerald: '#059669',
        blue: '#2563EB',
        purple: '#7C3AED',
        pink: '#EC4899',
        orange: '#EA580C',
      },
      
      // Semantic
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  
  dark: {
    name: 'dark',
    colors: {
      // Background
      bg: {
        primary: '#000000',
        secondary: '#09090B',
        tertiary: '#18181B',
        hover: '#27272A',
        active: '#3F3F46',
      },
      
      // Text
      text: {
        primary: '#FFFFFF',
        secondary: '#A1A1AA',
        tertiary: '#71717A',
        inverse: '#000000',
      },
      
      // Borders
      border: {
        light: '#3F3F46',
        default: '#27272A',
        dark: '#18181B',
      },
      
      // Accent Colors
      accent: {
        emerald: '#10B981',
        blue: '#3B82F6',
        purple: '#A78BFA',
        pink: '#F472B6',
        orange: '#FB923C',
      },
      
      // Semantic
      success: '#10B981',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
    },
  },
} as const

export type Theme = keyof typeof THEMES
export type ThemeColors = typeof THEMES[Theme]['colors']

export function getThemeColors(theme: Theme): ThemeColors {
  return THEMES[theme].colors
}

export function applyTheme(theme: Theme) {
  const colors = getThemeColors(theme)
  const root = document.documentElement
  
  // Set CSS variables
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      Object.entries(value as Record<string, string>).forEach(([subKey, subValue]) => {
        root.style.setProperty(`--color-${key}-${subKey}`, subValue)
      })
    } else {
      root.style.setProperty(`--color-${key}`, value as string)
    }
  })
  
  // Apply to html element
  if (theme === 'light') {
    root.classList.remove('dark')
    root.classList.add('light')
  } else {
    root.classList.remove('light')
    root.classList.add('dark')
  }
}