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

console.log('🔧 Fixing events...\n');

// 1. Update ML CT to Sunday (Jan 25 -> keep the same, it's already correct based on the script)
// Actually need to check - user says it should be Sunday but showing tomorrow
// Tomorrow from Wed Jan 21 is Thu Jan 22, and the event shows Thu 2026-01-22
// Sunday would be Jan 25, but the fix-cts.js already has it as Jan 25
// So ML CT date is already correct in the script, but might be wrong in DB

// 2. Delete TWP CT1 (Tuesday Jan 27)
console.log('🗑️  Deleting TWP CT1...');
const { error: deleteTWP } = await supabase
  .from('events')
  .delete()
  .eq('name', 'TWP CT1');

if (deleteTWP) {
  console.log('❌ Error deleting TWP CT1:', deleteTWP.message);
} else {
  console.log('✅ TWP CT1 deleted\n');
}

// 3. Update ML CT to Sunday Jan 25 (in case it's wrong)
console.log('📝 Updating ML CT to Sunday, January 25, 2026...');
const { error: updateML } = await supabase
  .from('events')
  .update({ date: '2026-01-25', time: '13:00' })
  .eq('name', 'ML CT');

if (updateML) {
  console.log('❌ Error updating ML CT:', updateML.message);
} else {
  console.log('✅ ML CT updated to Sunday, January 25, 2026 at 1:00 PM\n');
}

// 4. Update SEEP CT1 with correct date and syllabus
console.log('📝 Updating SEEP CT1...');
const { error: updateSEEP } = await supabase
  .from('events')
  .update({
    date: '2026-01-28',
    time: '13:00',
    info: 'Class Test 1. Syllabus: From Class 1 up to Genetic Modification'
  })
  .eq('name', 'SEEP CT1');

if (updateSEEP) {
  console.log('❌ Error updating SEEP CT1:', updateSEEP.message);
} else {
  console.log('✅ SEEP CT1 updated to Wednesday, January 28, 2026\n');
  console.log('   📅 Date: Wednesday, January 28, 2026 at 1:00 PM');
  console.log('   📚 Syllabus: From Class 1 up to Genetic Modification\n');
}

console.log('✅ All events fixed!');
