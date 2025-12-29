import { supabase } from '../supabase'

export async function getAllLinks() {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getLinkById(id) {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createLink(linkData) {
  const { data, error} = await supabase
    .from('links')
    .insert({
      name: linkData.name,
      url: linkData.url,
      category: linkData.category || 'general'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLink(id, linkData) {
  const { data, error } = await supabase
    .from('links')
    .update({
      name: linkData.name,
      url: linkData.url,
      category: linkData.category || 'general'
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteLink(id) {
  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
