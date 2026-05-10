import dotenv from 'dotenv';
import sql from './server/db/index.js';

dotenv.config();

async function run() {
  try {
    console.log('Adding language column to users table...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';`;
    console.log('Success!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();
