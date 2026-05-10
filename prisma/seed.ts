import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Hash demo passwords
    const staffPassword = await bcrypt.hash('demo123', 10);
    const managerPassword = await bcrypt.hash('manager123', 10);
    const treasurerPassword = await bcrypt.hash('treasurer123', 10);
    const ceoPassword = await bcrypt.hash('ceo123', 10);

    // Create demo users
    const staff = await prisma.user.upsert({
      where: { email: 'staff@cht.local' },
      update: {},
      create: {
        email: 'staff@cht.local',
        password: staffPassword,
        name: 'Staff User',
        role: 'staff',
        isActive: true,
      },
    });

    const manager = await prisma.user.upsert({
      where: { email: 'manager@cht.local' },
      update: {},
      create: {
        email: 'manager@cht.local',
        password: managerPassword,
        name: 'Manager User',
        role: 'manager',
        isActive: true,
      },
    });

    const treasurer = await prisma.user.upsert({
      where: { email: 'treasurer@cht.local' },
      update: {},
      create: {
        email: 'treasurer@cht.local',
        password: treasurerPassword,
        name: 'Treasurer User',
        role: 'treasurer',
        isActive: true,
      },
    });

    const ceo = await prisma.user.upsert({
      where: { email: 'ceo@cht.local' },
      update: {},
      create: {
        email: 'ceo@cht.local',
        password: ceoPassword,
        name: 'CEO User',
        role: 'ceo',
        isActive: true,
      },
    });

    console.log('✅ Demo users created:');
    console.log(`  Staff: staff@cht.local / demo123`);
    console.log(`  Manager: manager@cht.local / manager123`);
    console.log(`  Treasurer: treasurer@cht.local / treasurer123`);
    console.log(`  CEO: ceo@cht.local / ceo123`);
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
