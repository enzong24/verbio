import { db } from '../db';
import { users, userLanguageStats, premiumWhitelist } from '@shared/schema';

async function run() {
  console.log('Running seed...');

  // Create an admin/test user if not exists
  const existing = await db.select().from(users).where(users.email, 'test@verbio.local').limit(1);
  if (!existing || existing.length === 0) {
    await db.insert(users).values({
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@verbio.local',
      firstName: 'Test',
      lastName: 'User',
      isPremium: 1,
    }).returning();
    console.log('Inserted test user');
  } else {
    console.log('Test user already exists');
  }

  // Create basic language stats for test user
  const stats = await db.select().from(userLanguageStats).where(userLanguageStats.userId, '00000000-0000-0000-0000-000000000000').limit(1);
  if (!stats || stats.length === 0) {
    await db.insert(userLanguageStats).values({
      userId: '00000000-0000-0000-0000-000000000000',
      language: 'Chinese',
      elo: 1000,
    }).returning();
    console.log('Inserted test user language stats');
  } else {
    console.log('Test user stats already exist');
  }

  // Add an email to premium whitelist for dev
  const wl = await db.select().from(premiumWhitelist).where(premiumWhitelist.email, 'dev+whitelist@verbio.local').limit(1);
  if (!wl || wl.length === 0) {
    await db.insert(premiumWhitelist).values({
      email: 'dev+whitelist@verbio.local'
    }).returning();
    console.log('Inserted whitelist entry');
  } else {
    console.log('Whitelist entry already exists');
  }

  console.log('Seed finished');
}

run().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
