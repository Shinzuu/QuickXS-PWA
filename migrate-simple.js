// Simple migration using service role key (bypasses RLS)
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

console.log('🚀 Migrating data using service role key...\n')

// Create client with SERVICE ROLE key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey)

// Load routine data
const routinesData = JSON.parse(readFileSync(join(__dirname, 'src/data/routineData.json'), 'utf-8'))

async function migrate() {
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
    .select()

  if (error) {
    console.error('❌ Error:', error.message)
    return false
  }

  console.log(`✅ Successfully migrated ${data.length} routine entries`)
  console.log('\n📊 Sample data:')
  console.log(data.slice(0, 3))

  return true
}

migrate().then(success => {
  if (success) {
    console.log('\n🎉 Migration complete!')
    console.log('You can now view your data in Supabase Table Editor')
    console.log('\n⚠️  IMPORTANT: Remove SUPABASE_SERVICE_ROLE_KEY from .env after migration!')
  }
})
