import { supabaseAdmin } from './src/config/supabase';

const testWorkers = [
  {
    email: 'plumber@test.com',
    name: 'Mario Plumber',
    phone: '1234567890',
    skills: ['Plumber'],
    location: 'New York',
    password: 'password123'
  },
  {
    email: 'electrician@test.com',
    name: 'Sparky Electrics',
    phone: '0987654321',
    skills: ['Electrician'],
    location: 'Los Angeles',
    password: 'password123'
  },
  {
    email: 'carpenter@test.com',
    name: 'Woody Carpenter',
    phone: '5556667777',
    skills: ['Carpenter', 'Painter'],
    location: 'Chicago',
    password: 'password123'
  }
];

async function seedTestWorkers() {
  console.log('Seeding test workers...');

  for (const worker of testWorkers) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: worker.email,
      password: worker.password,
      email_confirm: true,
      user_metadata: {
        name: worker.name,
        phone: worker.phone,
        role: 'worker',
        location: worker.location,
        skills: worker.skills
      }
    });

    if (authError) {
      console.error(`Error creating ${worker.email}:`, authError.message);
      continue;
    }

    console.log(`Created test worker: ${worker.email}`);
  }

  console.log('Test workers seeded successfully.');
}

seedTestWorkers().catch(console.error);
