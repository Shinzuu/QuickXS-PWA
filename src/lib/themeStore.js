import { writable } from 'svelte/store'

// Fixed theme - Midnight (Dark Cyan)
export const theme = {
  name: 'Midnight',
  bg: '#222831',
  card: '#393E46',
  accent: '#00ADB5',
  text: '#EEEEEE',
  textSecondary: '#B0B0B0',
  isDark: true
}

// Export as stores for compatibility with existing components
export const currentTheme = writable(theme)
export const currentThemeName = writable('midnight')
export const isDarkMode = writable(true)

// Apply theme to CSS variables on load
export function applyThemeToDocument(themeObj) {
  document.documentElement.style.setProperty('--color-bg', themeObj.bg)
  document.documentElement.style.setProperty('--color-card', themeObj.card)
  document.documentElement.style.setProperty('--color-accent', themeObj.accent)
  document.documentElement.style.setProperty('--color-text', themeObj.text)
  document.documentElement.style.setProperty('--color-text-secondary', themeObj.textSecondary)
}

// Apply theme on load
applyThemeToDocument(theme)
