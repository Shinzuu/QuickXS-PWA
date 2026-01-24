import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addTWPCT() {
  console.log('🔄 Adding TWP CT event...\n')

  const eventData = {
    name: 'TWP CT 1',
    info: 'Class Test 1 for Technical Writing Practices',
    date: '2026-01-27',
    time: '10:00', // Adjust based on actual class time if known
    event_type: 'CT',
    priority: 'urgent',
    is_completed: false
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()

    if (error) {
      console.error('❌ Error adding TWP CT:', error.message)
      process.exit(1)
    }

    console.log('✅ Successfully added TWP CT!')
    console.log('\n📋 Event Details:')
    console.log('   Name:', data[0].name)
    console.log('   Date:', data[0].date)
    console.log('   Time:', data[0].time)
    console.log('   Type:', data[0].event_type)
    console.log('   Priority:', data[0].priority)
    console.log('   ID:', data[0].id)
    console.log('\n✨ Event has been added to the database!')

  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    process.exit(1)
  }
}

addTWPCT()
