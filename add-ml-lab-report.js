import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file manually
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

async function addMLLabReport() {
  try {
    // Create the ML Lab Report event
    const eventData = {
      date: '2026-01-10', // Adjust this to your desired due date
      time: '23:59',
      name: 'ML Lab Report 2 - Dataset Preprocessing',
      info: 'Complete lab report covering: Data cleaning & validation, Outlier detection & handling (IQR, Z-score, isolation forest), Missing value imputation strategies, Feature scaling & normalization, Data transformation techniques, Exploratory data analysis (EDA), Statistical summaries & visualizations',
      event_type: 'Lab',
      priority: 'urgent',
      is_completed: false
    };

    console.log('Creating ML Lab Report event:', JSON.stringify(eventData, null, 2));

    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert(eventData)
      .select();

    if (eventError) {
      console.error('❌ Error creating event:', eventError);
    } else {
      console.log('\n✅ ML Lab Report event created successfully!');
      console.log(JSON.stringify(newEvent, null, 2));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

addMLLabReport();
