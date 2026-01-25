import { writable } from 'svelte/store'

// All available themes
export const themes = {
  midnight: {
    name: 'Midnight',
    bg: '#222831',
    card: '#393E46',
    accent: '#00ADB5',
    text: '#EEEEEE',
    textSecondary: '#B0B0B0',
    isDark: true
  },
  ocean: {
    name: 'Ocean',
    bg: '#1e3a5f',
    card: '#2a5885',
    accent: '#4fc3f7',
    text: '#ffffff',
    textSecondary: '#b0bec5',
    isDark: true
  },
  sunset: {
    name: 'Sunset',
    bg: '#2c1810',
    card: '#3d2314',
    accent: '#ff6b35',
    text: '#f4f1de',
    textSecondary: '#e0d5c7',
    isDark: true
  },
  forest: {
    name: 'Forest',
    bg: '#1a2f1a',
    card: '#2d4a2d',
    accent: '#4caf50',
    text: '#e8f5e9',
    textSecondary: '#c8e6c9',
    isDark: true
  },
  lavender: {
    name: 'Lavender',
    bg: '#f5f5f5',
    card: '#ffffff',
    accent: '#9c27b0',
    text: '#212121',
    textSecondary: '#757575',
    isDark: false
  },
  mint: {
    name: 'Mint',
    bg: '#f0f8f5',
    card: '#ffffff',
    accent: '#26a69a',
    text: '#1a1a1a',
    textSecondary: '#666666',
    isDark: false
  },
  rose: {
    name: 'Rose',
    bg: '#fff5f7',
    card: '#ffffff',
    accent: '#e91e63',
    text: '#212121',
    textSecondary: '#757575',
    isDark: false
  }
}

// Load saved theme or default to midnight
const savedThemeName = localStorage.getItem('selectedTheme') || 'midnight'
const initialTheme = themes[savedThemeName] || themes.midnight

// Export as stores for compatibility with existing components
export const currentTheme = writable(initialTheme)
export const currentThemeName = writable(savedThemeName)
export const isDarkMode = writable(initialTheme.isDark)

// Apply theme to CSS variables
export function applyThemeToDocument(themeObj) {
  document.documentElement.style.setProperty('--color-bg', themeObj.bg)
  document.documentElement.style.setProperty('--color-card', themeObj.card)
  document.documentElement.style.setProperty('--color-accent', themeObj.accent)
  document.documentElement.style.setProperty('--color-text', themeObj.text)
  document.documentElement.style.setProperty('--color-text-secondary', themeObj.textSecondary)
}

// Change theme function
export function changeTheme(themeName) {
  const theme = themes[themeName]
  if (!theme) return

  currentTheme.set(theme)
  currentThemeName.set(themeName)
  isDarkMode.set(theme.isDark)
  applyThemeToDocument(theme)
  localStorage.setItem('selectedTheme', themeName)
}

// Apply theme on load
applyThemeToDocument(initialTheme)
