#!/usr/bin/env tsx

/**
 * Create or update superuser from environment variables
 * Usage: tsx prisma/create-superuser.ts
 * 
 * Environment variables:
 * - SUPERUSER_EMAIL: Admin email (default: admin@cht.local)
 * - SUPERUSER_USERNAME: Admin username (default: admin)
 * - SUPERUSER_PASSWORD: Admin password (default: demo123)
 */

import { initializeSuperuser } from './init-superuser';

async function main() {
  console.log('🔐 Creating/Updating Superuser...');
  console.log('');

  try {
    await initializeSuperuser();
    console.log('');
    console.log('✅ Superuser initialization completed successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize superuser:', error);
    process.exit(1);
  }
}

main();
