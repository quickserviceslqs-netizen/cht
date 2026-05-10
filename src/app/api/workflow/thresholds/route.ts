import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthUser } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/workflow/thresholds - List approval thresholds
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    // Only admins can view thresholds
    if (!['admin', 'ceo'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const thresholds = await prisma.approvalThreshold.findMany({
      orderBy: { priority: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: thresholds,
    });
  } catch (error) {
    console.error('Error fetching approval thresholds:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflow/thresholds - Create approval threshold
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    // Only admins can create thresholds
    if (!['admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const {
      name,
      originType,
      minAmount,
      maxAmount,
      rolesSequence,
      allowUrgentFasttrack,
      requiresCfo,
      requiresCeo,
      priority,
      isActive,
    } = await req.json();

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Threshold name is required' },
        { status: 400 }
      );
    }

    if (!originType || !['branch', 'hq', 'field', 'any'].includes(originType)) {
      return NextResponse.json(
        { error: 'Invalid origin type' },
        { status: 400 }
      );
    }

    if (!Array.isArray(rolesSequence) || rolesSequence.length === 0) {
      return NextResponse.json(
        { error: 'Roles sequence must be a non-empty array' },
        { status: 400 }
      );
    }

    const threshold = await prisma.approvalThreshold.create({
      data: {
        name,
        originType: originType.toUpperCase(),
        minAmount: minAmount || 0,
        maxAmount: maxAmount || 999999999,
        rolesSequence,
        allowUrgentFasttrack: allowUrgentFasttrack || false,
        requiresCfo: requiresCfo || false,
        requiresCeo: requiresCeo || false,
        priority: priority || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: threshold,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating approval threshold:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
