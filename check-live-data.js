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
  envVars.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 Checking live database data...\n');

// Get all routines (classes)
const { data: routines, error: routinesError } = await supabase
  .from('routines')
  .select('*')
  .order('day', { ascending: true })
  .order('time', { ascending: true });

console.log('📚 CLASSES/ROUTINES:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (routinesError) {
  console.log('❌ Error:', routinesError.message);
} else {
  console.log(`Total: ${routines.length} classes\n`);
  routines.forEach(r => {
    const [hours, minutes] = r.time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const time12 = `${hour12}:${minutes} ${ampm}`;
    console.log(`${r.day.padEnd(10)} ${time12.padEnd(8)} ${r.subject.padEnd(15)} [${r.classroom}]`);
  });
}

console.log('\n📅 EVENTS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const { data: events, error: eventsError } = await supabase
  .from('events')
  .select('*')
  .order('date', { ascending: true })
  .order('time', { ascending: true });

if (eventsError) {
  console.log('❌ Error:', eventsError.message);
} else {
  console.log(`Total: ${events.length} events\n`);
  events.forEach(e => {
    const date = new Date(e.date + 'T00:00:00');
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    const [hours, minutes] = e.time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const time12 = `${hour12}:${minutes} ${ampm}`;

    const status = e.is_completed ? '✅' : '⏳';
    const priority = e.priority === 'urgent' ? '🔴' : e.priority === 'high' ? '🟡' : '🟢';
    console.log(`${status} ${priority} ${dayOfWeek} ${e.date} ${time12.padEnd(8)} - ${e.name}`);
    if (e.info) console.log(`   ℹ️  ${e.info}`);
  });
}

console.log('\n🔗 LINKS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const { data: links, error: linksError } = await supabase
  .from('links')
  .select('*')
  .order('category', { ascending: true })
  .order('title', { ascending: true });

if (linksError) {
  console.log('❌ Error:', linksError.message);
} else {
  console.log(`Total: ${links.length} links\n`);
  const byCategory = {};
  links.forEach(l => {
    if (!byCategory[l.category]) byCategory[l.category] = [];
    byCategory[l.category].push(l);
  });
  Object.entries(byCategory).forEach(([cat, items]) => {
    console.log(`\n📂 ${cat}:`);
    items.forEach(l => {
      console.log(`   • ${l.title}`);
      console.log(`     ${l.url}`);
    });
  });
}

console.log('\n✅ Database check complete!');
