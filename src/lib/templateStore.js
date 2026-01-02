import { writable } from 'svelte/store'

// Default templates
const defaultTemplates = [
  {
    id: 'ml-assignment',
    name: 'ML Assignment',
    event_type: 'Assignment',
    subject: 'ML',
    priority: 'normal',
    info: 'Machine Learning assignment'
  },
  {
    id: 'ml-ct',
    name: 'ML CT',
    event_type: 'CT',
    subject: 'ML',
    priority: 'urgent',
    info: 'Machine Learning class test'
  },
  {
    id: 'cloudc-assignment',
    name: 'CloudC Assignment',
    event_type: 'Assignment',
    subject: 'CloudC',
    priority: 'normal',
    info: 'Cloud Computing assignment'
  },
  {
    id: 'cloudc-ct',
    name: 'CloudC CT',
    event_type: 'CT',
    subject: 'CloudC',
    priority: 'urgent',
    info: 'Cloud Computing class test'
  },
  {
    id: 'stqa-assignment',
    name: 'STQA Assignment',
    event_type: 'Assignment',
    subject: 'STQA',
    priority: 'normal',
    info: 'Software Testing and QA assignment'
  },
  {
    id: 'stqa-ct',
    name: 'STQA CT',
    event_type: 'CT',
    subject: 'STQA',
    priority: 'urgent',
    info: 'STQA class test'
  },
  {
    id: 'tc-assignment',
    name: 'TC Assignment',
    event_type: 'Assignment',
    subject: 'TC',
    priority: 'normal',
    info: 'Theory of Computation assignment'
  },
  {
    id: 'seep-assignment',
    name: 'SEEP Assignment',
    event_type: 'Assignment',
    subject: 'SEEP',
    priority: 'normal',
    info: 'Software Engineering assignment'
  },
  {
    id: 'ml-lab-report',
    name: 'ML Lab Report',
    event_type: 'Lab',
    subject: 'ML',
    priority: 'high',
    info: 'Machine Learning lab report submission'
  },
  {
    id: 'cloudc-lab-report',
    name: 'CloudC Lab Report',
    event_type: 'Lab',
    subject: 'CloudC',
    priority: 'high',
    info: 'Cloud Computing lab report submission'
  },
  {
    id: 'stqa-lab-report',
    name: 'STQA Lab Report',
    event_type: 'Lab',
    subject: 'STQA',
    priority: 'high',
    info: 'STQA lab report submission'
  }
]

// Load templates from localStorage or use defaults
function loadTemplates() {
  if (typeof window === 'undefined') return defaultTemplates

  const saved = localStorage.getItem('quickxs_event_templates')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return defaultTemplates
    }
  }
  return defaultTemplates
}

// Create store
export const eventTemplates = writable(loadTemplates())

// Subscribe to save changes
if (typeof window !== 'undefined') {
  eventTemplates.subscribe(templates => {
    localStorage.setItem('quickxs_event_templates', JSON.stringify(templates))
  })
}

// Helper functions
export function addTemplate(template) {
  eventTemplates.update(templates => [...templates, { ...template, id: Date.now().toString() }])
}

export function removeTemplate(templateId) {
  eventTemplates.update(templates => templates.filter(t => t.id !== templateId))
}

export function updateTemplate(templateId, updatedTemplate) {
  eventTemplates.update(templates =>
    templates.map(t => t.id === templateId ? { ...t, ...updatedTemplate } : t)
  )
}

export function resetToDefaults() {
  eventTemplates.set(defaultTemplates)
}
