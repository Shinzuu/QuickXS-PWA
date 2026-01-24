import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(
  envVars.VITE_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function addMLLabReport4() {
  console.log('📝 Adding ML Lab Report 4...');

  const { data, error } = await supabase
    .from('events')
    .insert([
      {
        name: 'ML Lab Report 4',
        info: 'Linear regression, then use filter methods',
        date: '2026-01-31',
        time: '23:59',
        event_type: 'Lab',
        priority: 'urgent',
        is_completed: false
      }
    ])
    .select();

  if (error) {
    console.error('❌ Error adding ML Lab Report 4:', error);
  } else {
    console.log('✅ ML Lab Report 4 added successfully for Saturday, January 31, 2026');
    console.log(data);
  }
}

addMLLabReport4();
