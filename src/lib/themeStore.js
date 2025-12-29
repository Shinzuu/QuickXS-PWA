import { writable } from 'svelte/store'

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
    name: 'Ocean Blue',
    bg: '#1a1f3a',
    card: '#2d3561',
    accent: '#4FC3F7',
    text: '#E3F2FD',
    textSecondary: '#B0C4DE',
    isDark: true
  },
  forest: {
    name: 'Forest Green',
    bg: '#1a2f1a',
    card: '#2d4a2d',
    accent: '#66BB6A',
    text: '#E8F5E9',
    textSecondary: '#C8E6C9',
    isDark: true
  },
  sunset: {
    name: 'Sunset',
    bg: '#2a1a1f',
    card: '#4a2d35',
    accent: '#FF6B9D',
    text: '#FFE5EC',
    textSecondary: '#FFB3C6',
    isDark: true
  },
  royal: {
    name: 'Royal Purple',
    bg: '#1f1a2f',
    card: '#352d4a',
    accent: '#9575CD',
    text: '#EDE7F6',
    textSecondary: '#D1C4E9',
    isDark: true
  },
  amber: {
    name: 'Amber Glow',
    bg: '#2a2210',
    card: '#4a3d2a',
    accent: '#FFB74D',
    text: '#FFF8E1',
    textSecondary: '#FFECB3',
    isDark: true
  },
  light: {
    name: 'Light Mode',
    bg: '#F5F5F5',
    card: '#FFFFFF',
    accent: '#00897B',
    text: '#1A1A1A',
    textSecondary: '#5A5A5A',
    isDark: false
  }
}

// Load saved theme from localStorage or default to midnight
const savedTheme = localStorage.getItem('selectedTheme') || 'midnight'

export const currentTheme = writable(themes[savedTheme])
export const currentThemeName = writable(savedTheme)
export const isDarkMode = writable(themes[savedTheme].isDark)

export function setTheme(themeName) {
  if (themes[themeName]) {
    currentTheme.set(themes[themeName])
    currentThemeName.set(themeName)
    isDarkMode.set(themes[themeName].isDark)
    localStorage.setItem('selectedTheme', themeName)
    applyThemeToDocument(themes[themeName])
  }
}

export function toggleDarkMode() {
  isDarkMode.update(dark => {
    const newMode = !dark
    // Find a theme that matches the desired mode
    const targetTheme = newMode ? 'midnight' : 'light'
    setTheme(targetTheme)
    return newMode
  })
}

export function applyThemeToDocument(theme) {
  document.documentElement.style.setProperty('--color-bg', theme.bg)
  document.documentElement.style.setProperty('--color-card', theme.card)
  document.documentElement.style.setProperty('--color-accent', theme.accent)
  document.documentElement.style.setProperty('--color-text', theme.text)
  document.documentElement.style.setProperty('--color-text-secondary', theme.textSecondary)
}

// Apply saved theme on load
applyThemeToDocument(themes[savedTheme])
