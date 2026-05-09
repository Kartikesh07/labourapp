import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function populate() {
  console.log('Starting DB reset and population...');

  // 1. Delete all applications
  await supabaseAdmin.from('applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // 2. Delete all jobs
  await supabaseAdmin.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 3. Delete all profile relations
  await supabaseAdmin.from('worker_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('employer_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 4. Delete Auth users
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  for (const u of users.users) {
    await supabaseAdmin.auth.admin.deleteUser(u.id);
  }

  console.log('Cleared database. Creating dummy data...');

  // 5. Create Employer
  const { data: employerData, error: empErr } = await supabaseAdmin.auth.admin.createUser({
    email: 'employer@laborlink.com',
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { name: 'Acme Builders', phone: '1112223333', role: 'employer', company_name: 'Acme Builders Inc.' }
  });
  if (empErr) {
    console.error('Error creating employer', empErr);
    return;
  }
  const employerId = employerData.user.id;

  // 6. Create Worker
  const { data: workerData, error: workErr } = await supabaseAdmin.auth.admin.createUser({
    email: 'worker@laborlink.com',
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { name: 'John Doe', phone: '4445556666', role: 'worker', location: 'Seattle, WA' }
  });
  if (workErr) {
    console.error('Error creating worker', workErr);
    return;
  }
  const workerId = workerData.user.id;

  // Wait a sec for triggers
  await new Promise(r => setTimeout(r, 1000));

  // 7. Create Job
  const { data: job, error: jobErr } = await supabaseAdmin.from('jobs').insert([
    {
      employer_id: employerId,
      title: 'Expert Carpenter Needed',
      description: 'Looking for an experienced carpenter for full-time work.',
      category: 'carpentry',
      job_type: 'full-time',
      salary_amount: 35,
      salary_period: 'hourly',
      location: 'Seattle, WA',
      requirements: ['3+ years experience', 'Own tools'],
      is_active: true
    }
  ]).select().single();
  
  if (jobErr) {
    console.error('Error creating job', jobErr);
    return;
  }

  // 8. Create Application
  const { error: appErr } = await supabaseAdmin.from('applications').insert([
    {
      job_id: job.id,
      worker_id: workerId,
      status: 'pending',
      message: 'I have 5 years of carpentry experience and can start immediately.'
    }
  ]);

  if (appErr) {
    console.error('Error creating application', appErr);
    return;
  }

  console.log('Database successfully seeded!');
}

populate();