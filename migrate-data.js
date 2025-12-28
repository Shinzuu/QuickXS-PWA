// Migration script to upload existing JSON data to Supabase
// Run this once with: node migrate-data.js

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
const envFile = readFileSync(join(__dirname, '.env'), 'utf-8')
const envVars = {}
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = envVars.VITE_SUPABASE_URL
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Get admin credentials
const adminEmail = envVars.ADMIN_EMAIL
const adminPassword = envVars.ADMIN_PASSWORD

// Load JSON data
const routinesData = JSON.parse(readFileSync(join(__dirname, 'src/data/routineData.json'), 'utf-8'))
const eventsData = JSON.parse(readFileSync(join(__dirname, 'src/data/eventsData.json'), 'utf-8'))
const linksData = JSON.parse(readFileSync(join(__dirname, 'src/data/linksData.json'), 'utf-8'))

async function migrateRoutines() {
  console.log('📚 Migrating routines...')

  const routines = []
  for (const daySchedule of routinesData.schedule) {
    for (const classItem of daySchedule.classes) {
      routines.push({
        day: daySchedule.day,
        time: classItem.time,
        subject: classItem.subject,
        teacher: classItem.teacher,
        classroom: classItem.classroom,
        duration: classItem.duration || 75
      })
    }
  }

  const { data, error } = await supabase
    .from('routines')
    .insert(routines)

  if (error) {
    console.error('❌ Error migrating routines:', error.message)
    return false
  }

  console.log(`✅ Migrated ${routines.length} routine entries`)
  return true
}

async function migrateEvents() {
  console.log('📢 Migrating events...')

  const events = eventsData.map(event => {
    // Determine event type from name
    let eventType = 'Announcement'
    if (event.name.includes('CT')) eventType = 'CT'
    else if (event.name.includes('MID') || event.name.includes('Mid')) eventType = 'Mid'
    else if (event.name.includes('Assignment')) eventType = 'Assignment'
    else if (event.name.includes('Presentation')) eventType = 'Lab'

    // Determine priority based on date proximity
    const eventDate = new Date(event.date)
    const today = new Date()
    const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))

    let priority = 'normal'
    if (daysUntil < 2 && daysUntil >= 0) priority = 'urgent'
    else if (daysUntil < 0) priority = 'low' // Past events

    return {
      date: event.date,
      time: event.time,
      name: event.name,
      info: event.info || '',
      event_type: eventType,
      priority: priority,
      is_completed: new Date(event.date) < new Date() // Mark past events as completed
    }
  })

  const { data, error } = await supabase
    .from('events')
    .insert(events)

  if (error) {
    console.error('❌ Error migrating events:', error.message)
    return false
  }

  console.log(`✅ Migrated ${events.length} events`)
  return true
}

async function migrateLinks() {
  console.log('🔗 Migrating links...')

  const links = linksData.map(link => ({
    name: link.name,
    url: link.url,
    category: 'lectures' // You can categorize these later
  }))

  const { data, error } = await supabase
    .from('links')
    .insert(links)

  if (error) {
    console.error('❌ Error migrating links:', error.message)
    return false
  }

  console.log(`✅ Migrated ${links.length} links`)
  return true
}

async function main() {
  console.log('🚀 Starting data migration to Supabase...\n')

  // Authenticate as admin first
  console.log('🔐 Authenticating as admin...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword
  })

  if (authError) {
    console.error('❌ Authentication failed:', authError.message)
    console.log('Please check your admin credentials in .env file')
    return
  }

  console.log('✅ Authenticated successfully\n')

  const routinesSuccess = await migrateRoutines()
  const eventsSuccess = await migrateEvents()
  const linksSuccess = await migrateLinks()

  console.log('\n📊 Migration Summary:')
  console.log(`Routines: ${routinesSuccess ? '✅ Success' : '❌ Failed'}`)
  console.log(`Events: ${eventsSuccess ? '✅ Success' : '❌ Failed'}`)
  console.log(`Links: ${linksSuccess ? '✅ Success' : '❌ Failed'}`)

  if (routinesSuccess && eventsSuccess && linksSuccess) {
    console.log('\n🎉 All data migrated successfully!')
    console.log('You can now verify the data in your Supabase dashboard.')
  } else {
    console.log('\n⚠️  Some migrations failed. Check the errors above.')
  }
}

main()
