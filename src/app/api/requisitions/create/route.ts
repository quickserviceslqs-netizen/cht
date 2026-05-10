import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthUser } from '@/lib/auth';
import { findApprovalThreshold, findNextApprover } from '@/lib/workflow-resolver';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    const {
      amount,
      purpose,
      originType,
      companyId,
      regionId,
      branchId,
      departmentId,
      costCenterId,
      isUrgent,
      urgencyReason,
      receiptUrl,
    } = await req.json();

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than zero' },
        { status: 400 }
      );
    }

    if (!purpose || purpose.trim().length === 0) {
      return NextResponse.json(
        { error: 'Purpose is required' },
        { status: 400 }
      );
    }

    if (!originType || !['branch', 'hq', 'field'].includes(originType)) {
      return NextResponse.json(
        { error: 'Invalid origin type' },
        { status: 400 }
      );
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Find approval threshold
    const threshold = await findApprovalThreshold(amount, originType);
    if (!threshold) {
      return NextResponse.json(
        { error: 'No approval threshold found for this requisition' },
        { status: 400 }
      );
    }

    // Find first approver
    const firstApprover = await findNextApprover(companyId, -1, threshold.rolesSequence, {
      branchId,
      regionId,
      departmentId,
    });

    if (!firstApprover) {
      return NextResponse.json(
        { error: 'No approver found for this requisition' },
        { status: 400 }
      );
    }

    // Create requisition
    const requisition = await prisma.requisition.create({
      data: {
        requestedById: user.id,
        companyId,
        regionId,
        branchId,
        departmentId,
        costCenterId,
        originType,
        amount,
        purpose,
        receiptUrl,
        isUrgent,
        urgencyReason,
        appliedThresholdId: threshold.id,
        tier: threshold.name,
        workflowSequence: threshold.rolesSequence,
        nextApproverId: firstApprover.id,
        status: 'pending',
      },
      include: {
        requestedBy: true,
        nextApprover: true,
        company: true,
      },
    });

    // Create initial approval trail entry
    await prisma.approvalTrail.create({
      data: {
        requisitionId: requisition.id,
        userId: user.id,
        role: user.role,
        action: 'submitted',
        comment: `Requisition submitted by ${user.email}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: requisition,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating requisition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
