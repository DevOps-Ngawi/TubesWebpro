require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSeed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const sqlPath = path.join(__dirname, 'seed.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL...');
    await client.query(sql);

    console.log('Seed executed successfully.');
  } catch (error) {
    console.error('Error executing seed:', error);
  } finally {
    await client.end();
  }
}

runSeed();
