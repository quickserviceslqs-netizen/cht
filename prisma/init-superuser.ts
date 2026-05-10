import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

/**
 * Initialize superuser/admin from environment variables
 * Used by both seed.ts and app initialization
 */
export async function initializeSuperuser() {
  const prisma = new PrismaClient();

  try {
    const superuserEmail = process.env.SUPERUSER_EMAIL || 'admin@cht.local';
    const superuserUsername = process.env.SUPERUSER_USERNAME || 'admin';
    const superuserPassword = process.env.SUPERUSER_PASSWORD || 'demo123';

    // Check if superuser already exists
    const existingSuperuser = await prisma.user.findUnique({
      where: { email: superuserEmail },
    });

    if (existingSuperuser) {
      console.log(`✓ Superuser already exists: ${superuserEmail}`);
      return existingSuperuser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(superuserPassword, 10);

    // Create superuser
    const superuser = await prisma.user.create({
      data: {
        email: superuserEmail,
        username: superuserUsername,
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        isActive: true,
        isCentralizedApprover: true,
      },
    });

    console.log(`✅ Created superuser: ${superuserEmail} (${superuserUsername})`);
    console.log(`   Password: ${superuserPassword}`);
    console.log(`   ⚠️  Change this password immediately in production!`);

    return superuser;
  } catch (error) {
    console.error('Error initializing superuser:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
