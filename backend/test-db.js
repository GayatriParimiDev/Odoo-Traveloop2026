import sql from './server/db/index.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await sql`SELECT NOW()`;
    console.log('✅ Connection successful!');
    console.log('Current Database Time:', result[0].now);
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
