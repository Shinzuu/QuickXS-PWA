// Test Supabase connection and authentication
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
const adminEmail = envVars.ADMIN_EMAIL
const adminPassword = envVars.ADMIN_PASSWORD

console.log('🔍 Testing Supabase Connection...\n')
console.log('Configuration:')
console.log('URL:', supabaseUrl)
console.log('Anon Key:', supabaseKey?.substring(0, 20) + '...')
console.log('Admin Email:', adminEmail)
console.log('Admin Password:', adminPassword ? '***' + adminPassword.substring(adminPassword.length - 4) : 'NOT SET')
console.log()

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  // Test 1: Basic connection
  console.log('Test 1: Basic Connection')
  try {
    const { data, error } = await supabase.from('routines').select('count')
    if (error) {
      console.log('❌ Connection error:', error.message)
    } else {
      console.log('✅ Connection successful')
      console.log('   Current routines count:', data)
    }
  } catch (e) {
    console.log('❌ Exception:', e.message)
  }
  console.log()

  // Test 2: Authentication
  console.log('Test 2: Admin Authentication')
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    })

    if (error) {
      console.log('❌ Auth error:', error.message)
      console.log('   Error code:', error.status)
      console.log('   Error details:', error)
    } else {
      console.log('✅ Authentication successful')
      console.log('   User ID:', data.user.id)
      console.log('   User Email:', data.user.email)
      console.log('   Session expires:', new Date(data.session.expires_at * 1000).toISOString())
    }
  } catch (e) {
    console.log('❌ Exception:', e.message)
  }
  console.log()

  // Test 3: Read access (public)
  console.log('Test 3: Public Read Access')
  try {
    const { data, error } = await supabase.from('events').select('*').limit(1)
    if (error) {
      console.log('❌ Read error:', error.message)
    } else {
      console.log('✅ Read access works')
      console.log('   Sample data:', data.length > 0 ? 'Found data' : 'No data yet')
    }
  } catch (e) {
    console.log('❌ Exception:', e.message)
  }
  console.log()

  // Test 4: Write access (requires auth)
  console.log('Test 4: Authenticated Write Access')
  try {
    // First authenticate
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    })

    if (authError) {
      console.log('❌ Cannot test write - auth failed')
    } else {
      // Try to insert a test record
      const { data, error } = await supabase.from('routines').insert({
        day: 'Monday',
        time: '00:00',
        subject: 'TEST',
        teacher: 'TEST',
        classroom: '000',
        duration: 1
      }).select()

      if (error) {
        console.log('❌ Write error:', error.message)
        console.log('   This might be expected if RLS is working correctly')
      } else {
        console.log('✅ Write access works')
        console.log('   Inserted test record, ID:', data[0]?.id)

        // Clean up test record
        await supabase.from('routines').delete().eq('id', data[0].id)
        console.log('   Test record cleaned up')
      }
    }
  } catch (e) {
    console.log('❌ Exception:', e.message)
  }
}

testConnection()
