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

console.log('📝 Adding CT events...\n');

const events = [
  {
    name: 'SEEP CT1',
    date: '2026-01-20',
    time: '13:00',
    info: 'Class Test 1 covering topics from Slide 1 through all material taught to date',
    event_type: 'CT',
    priority: 'urgent',
    is_completed: false
  },
  {
    name: 'TC CT',
    date: '2026-01-20',
    time: '14:30',
    info: 'Class Test on Automata Theory: Categories, Deterministic vs Indeterministic systems',
    event_type: 'CT',
    priority: 'urgent',
    is_completed: false
  },
  {
    name: 'ML CT',
    date: '2026-01-20',
    time: '11:30',
    info: 'Class Test on Machine Learning topics covered including Unsupervised Learning and Cocktail Party Problem',
    event_type: 'CT',
    priority: 'urgent',
    is_completed: false
  }
];

for (const event of events) {
  console.log(`Adding: ${event.name} on ${event.date} at ${event.time}`);
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select();

  if (error) {
    console.log(`❌ Error adding ${event.name}:`, error.message);
  } else {
    console.log(`✅ ${event.name} added successfully!`);
    console.log(`   📅 ${event.date} ${event.time}`);
    console.log(`   ℹ️  ${event.info}\n`);
  }
}

console.log('✅ All CT events added!');
