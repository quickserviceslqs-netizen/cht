import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthUser } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/admin/settings - Get system settings
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    // Only admin can access
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Get all settings data
    const [companies, regions, branches, departments, thresholds, treasuryFunds, auditCount] = await Promise.all([
      prisma.company.findMany({ select: { id: true, name: true, code: true, createdAt: true } }),
      prisma.region.findMany({ select: { id: true, name: true, code: true, company: { select: { name: true } }, createdAt: true } }),
      prisma.branch.findMany({ select: { id: true, name: true, code: true, company: { select: { name: true } }, createdAt: true } }),
      prisma.department.findMany({ select: { id: true, name: true, code: true, company: { select: { name: true } }, createdAt: true } }),
      prisma.approvalThreshold.findMany({ select: { id: true, name: true, minAmount: true, maxAmount: true, rolesSequence: true, isActive: true, createdAt: true }, orderBy: { priority: 'asc' } }),
      prisma.treasuryFund.findMany({ select: { id: true, currentBalance: true, company: { select: { name: true } }, createdAt: true } }),
      prisma.approvalTrail.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        companies,
        regions,
        branches,
        departments,
        approvalThresholds: thresholds,
        treasuryFunds,
        auditLogCount: auditCount,
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
