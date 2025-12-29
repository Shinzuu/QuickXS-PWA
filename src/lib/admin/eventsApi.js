import { supabase } from '../supabase'

export async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getEventById(id) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createEvent(eventData) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      date: eventData.date,
      time: eventData.time,
      name: eventData.name,
      info: eventData.info || '',
      event_type: eventData.event_type || 'Announcement',
      priority: eventData.priority || 'normal',
      is_completed: eventData.is_completed || false
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateEvent(id, eventData) {
  const { data, error } = await supabase
    .from('events')
    .update({
      date: eventData.date,
      time: eventData.time,
      name: eventData.name,
      info: eventData.info || '',
      event_type: eventData.event_type || 'Announcement',
      priority: eventData.priority || 'normal',
      is_completed: eventData.is_completed || false
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteEvent(id) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function toggleEventCompleted(id, isCompleted) {
  const { data, error } = await supabase
    .from('events')
    .update({ is_completed: isCompleted })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
