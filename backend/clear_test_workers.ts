import { supabaseAdmin } from './src/config/supabase';

const testEmails = [
  'plumber@test.com',
  'electrician@test.com',
  'carpenter@test.com'
];

async function clearTestWorkers() {
  console.log('Clearing test workers...');

  // First get all user ids to delete
  for (const email of testEmails) {
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error fetching users:', listError.message);
      continue;
    }
    
    const userToDel = users.users.find(u => u.email === email);
    
    if (userToDel) {
      const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(userToDel.id);
      
      if (delError) {
        console.error(`Error deleting ${email}:`, delError.message);
      } else {
        console.log(`Deleted test worker: ${email}`);
      }
    } else {
        console.log(`No test worker found with email: ${email}`);
    }
  }

  console.log('Test workers cleared successfully.');
}

clearTestWorkers().catch(console.error);
