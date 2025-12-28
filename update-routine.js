// Update routine with new semester schedule
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
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('❌ Service role key not found. Please add it to .env temporarily:')
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const newRoutine = [
  // SATURDAY
  { day: 'Saturday', time: '08:30', subject: 'STQAL', teacher: 'NT1', classroom: '905', duration: 180 },
  { day: 'Saturday', time: '11:30', subject: 'MLL', teacher: 'MTH', classroom: '601', duration: 180 },
  { day: 'Saturday', time: '14:30', subject: 'CloudCL', teacher: 'KD', classroom: '604', duration: 180 },

  // SUNDAY
  { day: 'Sunday', time: '10:00', subject: 'CloudC', teacher: 'KD', classroom: '510', duration: 90 },
  { day: 'Sunday', time: '13:00', subject: 'ML', teacher: 'MTH', classroom: '510', duration: 90 },

  // MONDAY
  { day: 'Monday', time: '11:30', subject: 'ML', teacher: 'MTH', classroom: '901', duration: 90 },
  { day: 'Monday', time: '13:00', subject: 'SEEP', teacher: 'TAD', classroom: '613', duration: 90 },
  { day: 'Monday', time: '14:30', subject: 'TC', teacher: 'AD', classroom: '410', duration: 120 },

  // TUESDAY
  { day: 'Tuesday', time: '10:00', subject: 'CloudC', teacher: 'KD', classroom: '611', duration: 90 },
  { day: 'Tuesday', time: '13:00', subject: 'STQA', teacher: 'NT1', classroom: '610', duration: 90 },
  { day: 'Tuesday', time: '14:30', subject: 'TWP', teacher: 'ANC', classroom: '404', duration: 180 },

  // WEDNESDAY
  { day: 'Wednesday', time: '11:30', subject: 'STQA', teacher: 'NT1', classroom: '910', duration: 90 },
  { day: 'Wednesday', time: '14:30', subject: 'SEEP', teacher: 'TAD', classroom: '612', duration: 90 }
]

async function updateRoutine() {
  console.log('🔄 Updating routine...\n')

  // Delete old routine
  console.log('🗑️  Deleting old routine...')
  const { error: deleteError } = await supabase
    .from('routines')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

  if (deleteError) {
    console.error('❌ Error deleting old routine:', deleteError.message)
    return false
  }
  console.log('✅ Old routine deleted\n')

  // Insert new routine
  console.log('📚 Inserting new routine...')
  const { data, error } = await supabase
    .from('routines')
    .insert(newRoutine)
    .select()

  if (error) {
    console.error('❌ Error inserting new routine:', error.message)
    return false
  }

  console.log(`✅ Successfully inserted ${data.length} classes`)
  console.log('\n📊 New Schedule Summary:')
  console.log('Saturday: 3 labs (STQAL, MLL, CloudCL)')
  console.log('Sunday: 2 classes (CloudC, ML)')
  console.log('Monday: 3 classes (ML, SEEP, TC)')
  console.log('Tuesday: 3 classes (CloudC, STQA, TWP)')
  console.log('Wednesday: 2 classes (STQA, SEEP)')
  console.log('\nTotal: 13 classes per week')

  return true
}

updateRoutine().then(success => {
  if (success) {
    console.log('\n🎉 Routine updated successfully!')
    console.log('Refresh your browser to see the new schedule')
  }
})
