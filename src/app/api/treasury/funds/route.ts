import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthUser } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/treasury/funds - List treasury funds
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    // Only treasury users can view funds
    if (!['treasury', 'ceo', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const checkReorder = searchParams.get('checkReorder') === 'true';

    const where: any = {};
    if (companyId) {
      where.companyId = parseInt(companyId);
    }

    let funds = await prisma.treasuryFund.findMany({
      where,
      include: {
        company: true,
        region: true,
        branch: true,
        department: true,
        ledgerEntries: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // If checkReorder is true, check which funds need replenishment
    if (checkReorder) {
      funds = funds.map((fund) => ({
        ...fund,
        needsReplenishment: fund.currentBalance < fund.reorderLevel,
        balancePercentage:
          (Number(fund.currentBalance) / Number(fund.reorderLevel)) * 100,
      }));
    }

    return NextResponse.json({
      success: true,
      data: funds,
    });
  } catch (error) {
    console.error('Error fetching treasury funds:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/treasury/funds - Create or update a treasury fund
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    // Only treasury and admin can create/update funds
    if (!['treasury', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const {
      companyId,
      regionId,
      branchId,
      departmentId,
      reorderLevel,
      minBalance,
      autoReplenish,
      currentBalance,
    } = await req.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Find or create fund
    let fund = await prisma.treasuryFund.findFirst({
      where: {
        companyId,
        regionId,
        branchId,
        departmentId,
      },
    });

    if (fund) {
      // Update existing
      fund = await prisma.treasuryFund.update({
        where: { id: fund.id },
        data: {
          ...(reorderLevel && { reorderLevel }),
          ...(minBalance !== undefined && { minBalance }),
          ...(autoReplenish !== undefined && { autoReplenish }),
          ...(currentBalance !== undefined && { currentBalance }),
        },
      });
    } else {
      // Create new
      fund = await prisma.treasuryFund.create({
        data: {
          companyId,
          regionId,
          branchId,
          departmentId,
          reorderLevel: reorderLevel || 50000,
          minBalance: minBalance || 0,
          autoReplenish: autoReplenish !== undefined ? autoReplenish : true,
          currentBalance: currentBalance || 0,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: fund,
      },
      { status: fund ? 200 : 201 }
    );
  } catch (error) {
    console.error('Error managing treasury fund:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
