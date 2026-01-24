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

async function addSTQALabReport() {
  console.log('📝 Adding STQA Lab Report...');

  const { data, error } = await supabase
    .from('events')
    .insert([
      {
        name: 'STQA Lab Report - Task 2 BAV',
        info: 'Task 2 BAV, printed report with Screenshot of Excel sheet',
        date: '2026-01-31',
        time: '23:59',
        event_type: 'Lab',
        priority: 'urgent',
        is_completed: false
      }
    ])
    .select();

  if (error) {
    console.error('❌ Error adding STQA Lab Report:', error);
  } else {
    console.log('✅ STQA Lab Report added successfully for Saturday, January 31, 2026');
    console.log(data);
  }
}

addSTQALabReport();
