#!/usr/bin/env node

/**
 * This script will push the database schema to your connected database.
 * It uses the drizzle CLI to do this.
 * 
 * To run this script:
 * npm run db:push
 */

const { execSync } = require('child_process');

try {
  // Run drizzle-kit push to apply schema changes to the database
  console.log('🚀 Pushing schema to database...');
  
  // Execute drizzle-kit push command
  execSync('npx drizzle-kit push:pg', { stdio: 'inherit' });
  
  console.log('✅ Database schema successfully updated!');
} catch (error) {
  console.error('❌ Error pushing schema to database:', error.message);
  process.exit(1);
}