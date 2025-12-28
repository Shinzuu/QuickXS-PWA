import { writable } from 'svelte/store'

// Initialize notes from localStorage
const loadNotes = () => {
  try {
    const saved = localStorage.getItem('classNotes')
    return saved ? JSON.parse(saved) : {}
  } catch (e) {
    console.error('Failed to load notes:', e)
    return {}
  }
}

// Store: { classId: { note: string, links: [{url: string, title: string}] } }
export const classNotes = writable(loadNotes())

// Subscribe to save to localStorage on every change
classNotes.subscribe(notes => {
  try {
    localStorage.setItem('classNotes', JSON.stringify(notes))
  } catch (e) {
    console.error('Failed to save notes:', e)
  }
})

export function addNote(classId, note) {
  classNotes.update(notes => {
    if (!notes[classId]) {
      notes[classId] = { note: '', links: [] }
    }
    notes[classId].note = note
    return notes
  })
}

export function addLink(classId, url, title) {
  classNotes.update(notes => {
    if (!notes[classId]) {
      notes[classId] = { note: '', links: [] }
    }
    if (!notes[classId].links) {
      notes[classId].links = []
    }
    notes[classId].links.push({ url, title: title || url })
    return notes
  })
}

export function removeLink(classId, linkIndex) {
  classNotes.update(notes => {
    if (notes[classId]?.links) {
      notes[classId].links.splice(linkIndex, 1)
    }
    return notes
  })
}

export function getClassNotes(classId) {
  let notes = {}
  classNotes.subscribe(n => notes = n)()
  return notes[classId] || { note: '', links: [] }
}
