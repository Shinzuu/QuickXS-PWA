import { supabase } from '../supabase'

export async function getAllClasses() {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .order('day', { ascending: true })
    .order('time', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getClassById(id) {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createClass(classData) {
  const { data, error } = await supabase
    .from('routines')
    .insert({
      day: classData.day,
      time: classData.time,
      subject: classData.subject,
      teacher: classData.teacher,
      classroom: classData.classroom,
      duration: classData.duration || 75
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateClass(id, classData) {
  const { data, error } = await supabase
    .from('routines')
    .update({
      day: classData.day,
      time: classData.time,
      subject: classData.subject,
      teacher: classData.teacher,
      classroom: classData.classroom,
      duration: classData.duration || 75
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteClass(id) {
  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
