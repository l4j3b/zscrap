import { createClient } from '@supabase/supabase-js';

import { generateUsername } from '~/lib/auth.server/utils/generate-username';
import { getDisplayName } from '~/lib/auth.server/utils/get-display-name';
import { initializeDbClient } from '~/lib/db.server/initialize-db-client';
import { createUser } from '~/lib/db.server/queries/create-user';

const users = [
  {
    id: '22e794f8-bc75-495e-9561-ff069ca70817',
    email: 'admin@example.com',
    isAdmin: true,
    whitelisted: true,
  },
  {
    id: 'f2de322c-d837-4275-8fdd-c6734592d300',
    email: 'user5@example.com',
    isAdmin: false,
    whitelisted: true,
  },
];

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error('Missing required environment variables.');
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

if (!process.env.DIRECT_DATABASE_URL) {
  throw new Error('Missing required environment variable DIRECT_DATABASE_URL');
}

const db = await initializeDbClient({
  databaseUrl: process.env.DIRECT_DATABASE_URL,
});

async function seedDatabase() {
  for (const user of users) {
    await supabase.auth.admin.deleteUser(user.id);

    await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: process.env.SEED_USER_PASSWORD,
      email_confirm: true,
    });

    await createUser(db, {
      id: user.id,
      email: user.email,
      username: generateUsername(),
      displayName: getDisplayName(user.email),
      whitelisted: user.whitelisted,
      isAdmin: user.isAdmin,
    });
  }
}

seedDatabase()
  .then(() => {
    console.log('Database seeded successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });
