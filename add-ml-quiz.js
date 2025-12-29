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

async function findMLClassAndAddEvent() {
  try {
    // First, get all routines to find ML class
    const { data: routines, error: routineError } = await supabase
      .from('routines')
      .select('*')
      .or('subject.ilike.%ML%,subject.ilike.%machine%,subject.ilike.%learning%');

    if (routineError) {
      console.error('Error fetching routines:', routineError);
      return;
    }

    console.log('Found ML-related classes:', JSON.stringify(routines, null, 2));

    if (!routines || routines.length === 0) {
      console.log('No ML class found. Please check your database.');
      return;
    }

    // Get the ML class (first match)
    const mlClass = routines[0];
    console.log('\nUsing ML class:', mlClass);

    // Get current date and find next occurrence of the day
    const now = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = now.getDay();
    const targetDayIndex = daysOfWeek.indexOf(mlClass.day);

    if (targetDayIndex === -1) {
      console.error('Invalid day in ML class:', mlClass.day);
      return;
    }

    let daysUntilNext = targetDayIndex - currentDayIndex;
    if (daysUntilNext <= 0) {
      daysUntilNext += 7; // Next week
    }

    const nextMLDate = new Date(now);
    nextMLDate.setDate(now.getDate() + daysUntilNext);
    const dateStr = nextMLDate.toISOString().split('T')[0];

    console.log(`\nNext ${mlClass.day}: ${dateStr}`);
    console.log(`Time: ${mlClass.time}`);

    // Create the event
    const eventData = {
      date: dateStr,
      time: mlClass.time,
      name: 'ML Quiz - Cocktail Party Problem',
      info: 'Quiz on the Cocktail Party Problem (Unsupervised Learning)',
      event_type: 'CT',
      priority: 'urgent',
      is_completed: false
    };

    console.log('\nCreating event:', JSON.stringify(eventData, null, 2));

    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert(eventData)
      .select();

    if (eventError) {
      console.error('❌ Error creating event:', eventError);
    } else {
      console.log('\n✅ Event created successfully!');
      console.log(JSON.stringify(newEvent, null, 2));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

findMLClassAndAddEvent();
