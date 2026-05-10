import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create companies
  const company1 = await prisma.company.create({
    data: {
      name: 'Quick Services Ltd',
      code: 'QSL',
    },
  });

  console.log(`✅ Created company: ${company1.name}`);

  // Create regions
  const region1 = await prisma.region.create({
    data: {
      name: 'Central Region',
      code: 'CR',
      companyId: company1.id,
    },
  });

  const region2 = await prisma.region.create({
    data: {
      name: 'Coastal Region',
      code: 'COASTAL',
      companyId: company1.id,
    },
  });

  console.log('✅ Created regions');

  // Create branches
  const branch1 = await prisma.branch.create({
    data: {
      name: 'Nairobi Branch',
      code: 'NRB',
      companyId: company1.id,
      regionId: region1.id,
    },
  });

  const branch2 = await prisma.branch.create({
    data: {
      name: 'Mombasa Branch',
      code: 'MBA',
      companyId: company1.id,
      regionId: region2.id,
    },
  });

  console.log('✅ Created branches');

  // Create departments
  const dept1 = await prisma.department.create({
    data: {
      name: 'Finance Department',
      code: 'FIN',
      companyId: company1.id,
      branchId: branch1.id,
    },
  });

  const dept2 = await prisma.department.create({
    data: {
      name: 'Operations Department',
      code: 'OPS',
      companyId: company1.id,
      branchId: branch1.id,
    },
  });

  console.log('✅ Created departments');

  // Create cost centers
  await prisma.costCenter.create({
    data: {
      name: 'General Operations',
      code: 'GO-01',
      companyId: company1.id,
      departmentId: dept2.id,
    },
  });

  console.log('✅ Created cost centers');

  // Create users with different roles
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@cht.local',
      username: 'staff',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Staff',
      role: 'staff',
      companyId: company1.id,
      branchId: branch1.id,
      departmentId: dept2.id,
      isActive: true,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@cht.local',
      username: 'manager',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Manager',
      role: 'department_head',
      companyId: company1.id,
      branchId: branch1.id,
      departmentId: dept2.id,
      isActive: true,
    },
  });

  const treasuryUser = await prisma.user.create({
    data: {
      email: 'treasury@cht.local',
      username: 'treasury',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Treasurer',
      role: 'treasury',
      companyId: company1.id,
      branchId: branch1.id,
      isActive: true,
    },
  });

  const cfoUser = await prisma.user.create({
    data: {
      email: 'cfo@cht.local',
      username: 'cfo',
      password: hashedPassword,
      firstName: 'Robert',
      lastName: 'CFO',
      role: 'cfo',
      companyId: company1.id,
      isCentralizedApprover: true,
      isActive: true,
    },
  });

  const ceoUser = await prisma.user.create({
    data: {
      email: 'ceo@cht.local',
      username: 'ceo',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'CEO',
      role: 'ceo',
      companyId: company1.id,
      isCentralizedApprover: true,
      isActive: true,
    },
  });

  console.log('✅ Created users');

  // Create approval thresholds (matching Django logic)
  const tier1 = await prisma.approvalThreshold.create({
    data: {
      name: 'Tier 1 (0-50,000)',
      originType: 'ANY',
      minAmount: 0,
      maxAmount: 50000,
      rolesSequence: ['department_head', 'treasury'],
      allowUrgentFasttrack: true,
      requiresCfo: false,
      requiresCeo: false,
      priority: 1,
      isActive: true,
    },
  });

  const tier2 = await prisma.approvalThreshold.create({
    data: {
      name: 'Tier 2 (50,001-200,000)',
      originType: 'ANY',
      minAmount: 50001,
      maxAmount: 200000,
      rolesSequence: ['department_head', 'branch_manager', 'treasury'],
      allowUrgentFasttrack: true,
      requiresCfo: false,
      requiresCeo: false,
      priority: 2,
      isActive: true,
    },
  });

  const tier3 = await prisma.approvalThreshold.create({
    data: {
      name: 'Tier 3 (200,001-500,000)',
      originType: 'ANY',
      minAmount: 200001,
      maxAmount: 500000,
      rolesSequence: ['department_head', 'branch_manager', 'regional_manager', 'cfo', 'treasury'],
      allowUrgentFasttrack: false,
      requiresCfo: true,
      requiresCeo: false,
      priority: 3,
      isActive: true,
    },
  });

  const tier4 = await prisma.approvalThreshold.create({
    data: {
      name: 'Tier 4 (500,001+)',
      originType: 'ANY',
      minAmount: 500001,
      maxAmount: 999999999,
      rolesSequence: ['department_head', 'cfo', 'ceo', 'treasury'],
      allowUrgentFasttrack: false,
      requiresCfo: true,
      requiresCeo: true,
      priority: 4,
      isActive: true,
    },
  });

  console.log('✅ Created approval thresholds');

  // Create treasury funds
  const fund1 = await prisma.treasuryFund.create({
    data: {
      companyId: company1.id,
      branchId: branch1.id,
      currentBalance: 500000,
      reorderLevel: 100000,
      minBalance: 50000,
      autoReplenish: true,
    },
  });

  const fund2 = await prisma.treasuryFund.create({
    data: {
      companyId: company1.id,
      branchId: branch2.id,
      currentBalance: 300000,
      reorderLevel: 80000,
      minBalance: 30000,
      autoReplenish: true,
    },
  });

  console.log('✅ Created treasury funds');

  // Create sample requisitions
  const req1 = await prisma.requisition.create({
    data: {
      transactionId: 'REQ-001',
      requestedById: staffUser.id,
      companyId: company1.id,
      branchId: branch1.id,
      departmentId: dept2.id,
      originType: 'branch',
      amount: 25000,
      purpose: 'Office supplies and stationery',
      isUrgent: false,
      appliedThresholdId: tier1.id,
      tier: tier1.name,
      workflowSequence: tier1.rolesSequence,
      nextApproverId: managerUser.id,
      status: 'pending',
    },
  });

  const req2 = await prisma.requisition.create({
    data: {
      transactionId: 'REQ-002',
      requestedById: staffUser.id,
      companyId: company1.id,
      branchId: branch1.id,
      departmentId: dept2.id,
      originType: 'branch',
      amount: 150000,
      purpose: 'Equipment purchase for operations',
      isUrgent: true,
      urgencyReason: 'Critical equipment failure',
      appliedThresholdId: tier2.id,
      tier: tier2.name,
      workflowSequence: tier2.rolesSequence,
      nextApproverId: managerUser.id,
      status: 'pending',
    },
  });

  console.log('✅ Created sample requisitions');

  // Create approval trail entries
  await prisma.approvalTrail.create({
    data: {
      requisitionId: req1.id,
      userId: staffUser.id,
      role: staffUser.role,
      action: 'submitted',
      comment: 'Requisition submitted for office supplies',
      ipAddress: '192.168.1.1',
    },
  });

  await prisma.approvalTrail.create({
    data: {
      requisitionId: req2.id,
      userId: staffUser.id,
      role: staffUser.role,
      action: 'submitted',
      comment: 'Urgent requisition for equipment',
      ipAddress: '192.168.1.1',
    },
  });

  console.log('✅ Created approval trails');

  // Create ledger entries
  await prisma.ledgerEntry.create({
    data: {
      treasuryFundId: fund1.id,
      description: 'Initial fund balance',
      credit: 500000,
      balance: 500000,
    },
  });

  console.log('✅ Created ledger entries');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Demo Users:');
  console.log('- Staff: staff@cht.local (password: demo123)');
  console.log('- Manager: manager@cht.local (password: demo123)');
  console.log('- Treasury: treasury@cht.local (password: demo123)');
  console.log('- CFO: cfo@cht.local (password: demo123)');
  console.log('- CEO: ceo@cht.local (password: demo123)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
