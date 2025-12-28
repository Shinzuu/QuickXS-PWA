// Color palette for different subjects
// Uses variations of our main palette (#222831, #393E46, #00ADB5, #EEEEEE)

const subjectColorMap = {
  // Computer Science subjects
  'Data Structure': { bg: '#1a5f7a', accent: '#00ADB5', border: '#00ADB5' },
  'Algorithm': { bg: '#2d4059', accent: '#5DA7DB', border: '#5DA7DB' },
  'Database': { bg: '#1a3a4a', accent: '#4ECDC4', border: '#4ECDC4' },
  'Software Engineering': { bg: '#2a404a', accent: '#95E1D3', border: '#95E1D3' },
  'Computer Networks': { bg: '#1a4a5a', accent: '#38A3A5', border: '#38A3A5' },
  'Operating System': { bg: '#2a3a5a', accent: '#6C63FF', border: '#6C63FF' },
  'Web Technology': { bg: '#3a2a5a', accent: '#FF6B9D', border: '#FF6B9D' },
  'Artificial Intelligence': { bg: '#1a2a5a', accent: '#C3FF00', border: '#C3FF00' },
  'Machine Learning': { bg: '#2a1a5a', accent: '#FFD93D', border: '#FFD93D' },

  // Math subjects
  'Discrete Mathematics': { bg: '#3a3a2a', accent: '#F38181', border: '#F38181' },
  'Linear Algebra': { bg: '#3a2a3a', accent: '#AA96DA', border: '#AA96DA' },
  'Statistics': { bg: '#2a3a3a', accent: '#FCBAD3', border: '#FCBAD3' },

  // Theory subjects
  'Theory of Computation': { bg: '#1a3a3a', accent: '#A8E6CF', border: '#A8E6CF' },
  'Compiler Design': { bg: '#3a1a3a', accent: '#FFD3B6', border: '#FFD3B6' },

  // Default color for unlisted subjects
  'default': { bg: '#2d4059', accent: '#00ADB5', border: '#00ADB5' }
}

export function getSubjectColor(subject) {
  // Normalize subject name (remove spaces, lowercase for comparison)
  const normalized = subject.toLowerCase().trim()

  // Find matching color
  for (const [key, colors] of Object.entries(subjectColorMap)) {
    if (normalized.includes(key.toLowerCase())) {
      return colors
    }
  }

  // Generate consistent color from subject name if not found
  return generateColorFromString(subject)
}

function generateColorFromString(str) {
  // Generate a consistent hash from the string
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Use hash to pick from preset color variations
  const colorVariations = [
    { bg: '#1a5f7a', accent: '#00ADB5', border: '#00ADB5' },
    { bg: '#2d4059', accent: '#5DA7DB', border: '#5DA7DB' },
    { bg: '#1a3a4a', accent: '#4ECDC4', border: '#4ECDC4' },
    { bg: '#2a404a', accent: '#95E1D3', border: '#95E1D3' },
    { bg: '#1a4a5a', accent: '#38A3A5', border: '#38A3A5' },
    { bg: '#2a3a5a', accent: '#6C63FF', border: '#6C63FF' },
    { bg: '#3a2a5a', accent: '#FF6B9D', border: '#FF6B9D' },
    { bg: '#1a2a5a', accent: '#C3FF00', border: '#C3FF00' }
  ]

  const index = Math.abs(hash) % colorVariations.length
  return colorVariations[index]
}

export function getLabColor() {
  return { bg: '#1a5f7a', accent: '#00ADB5', border: '#00ADB5' }
}
