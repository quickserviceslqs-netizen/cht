import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { getAuthUser } from '@/lib/auth';
import { findNextApprover } from '@/lib/workflow-resolver';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { id } = await params;
    const requisitionId = parseInt(id);

    const { action, comment } = await req.json();

    // Validate action
    if (!['approved', 'rejected', 'changes_requested'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get requisition
    const requisition = await prisma.requisition.findUnique({
      where: { id: requisitionId },
      include: {
        requestedBy: true,
        nextApprover: true,
        appliedThreshold: true,
        approvalTrails: true,
      },
    });

    if (!requisition) {
      return NextResponse.json(
        { error: 'Requisition not found' },
        { status: 404 }
      );
    }

    // Validate approval permissions
    const isApprover = user.id === requisition.nextApproverId;
    const isAdmin = ['admin', 'ceo'].includes(user.role);

    if (!isApprover && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to approve this requisition' },
        { status: 403 }
      );
    }

    // Prevent self-approval (core invariant from Django)
    if (user.id === requisition.requestedById) {
      return NextResponse.json(
        { error: 'Cannot approve your own requisition' },
        { status: 400 }
      );
    }

    // Validate status for approval
    if (!['pending', 'pending_urgency_confirmation'].includes(requisition.status)) {
      return NextResponse.json(
        { error: `Cannot approve requisition with status: ${requisition.status}` },
        { status: 400 }
      );
    }

    let updatedRequisition: any;

    if (action === 'rejected') {
      // Reject the requisition
      updatedRequisition = await prisma.requisition.update({
        where: { id: requisitionId },
        data: {
          status: 'rejected',
        },
        include: {
          requestedBy: true,
          nextApprover: true,
          approvalTrails: true,
        },
      });
    } else if (action === 'changes_requested') {
      // Request changes from the requester
      updatedRequisition = await prisma.requisition.update({
        where: { id: requisitionId },
        data: {
          status: 'pending_changes',
          changeRequested: true,
          changeRequestedById: user.id,
          changeRequestDetails: comment,
          changeRequestDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
        include: {
          requestedBy: true,
          nextApprover: true,
          approvalTrails: true,
        },
      });
    } else {
      // Approved - find next approver
      const workflowSequence = Array.isArray(requisition.workflowSequence)
        ? (requisition.workflowSequence as unknown as string[])
        : (requisition.appliedThreshold?.rolesSequence as string[]) || [];

      const currentRoleIndex = workflowSequence.findIndex(
        (role: any) => typeof role === 'string' && role.toLowerCase() === user.role?.toLowerCase()
      );

      // Find next approver
      const nextApprover = await findNextApprover(
        requisition.companyId,
        currentRoleIndex,
        workflowSequence as string[],
        {
          branchId: requisition.branchId || undefined,
          regionId: requisition.regionId || undefined,
          departmentId: requisition.departmentId || undefined,
        }
      );

      let newStatus = 'approved';
      if (nextApprover) {
        newStatus = 'pending'; // More approvers needed
      } else if (requisition.appliedThreshold?.requiresCfo && user.role !== 'cfo') {
        // CFO approval is required but we haven't reached CFO yet
        newStatus = 'pending_cfo_approval';
      } else if (requisition.appliedThreshold?.requiresCeo && user.role !== 'ceo') {
        // CEO approval is required but we haven't reached CEO yet
        newStatus = 'pending_ceo_approval';
      } else {
        // All approvals complete - move to treasury
        newStatus = 'pending_treasury_validation';
      }

      updatedRequisition = await prisma.requisition.update({
        where: { id: requisitionId },
        data: {
          status: newStatus,
          nextApproverId: nextApprover?.id || null,
        },
        include: {
          requestedBy: true,
          nextApprover: true,
          approvalTrails: true,
        },
      });
    }

    // Create approval trail entry
    await prisma.approvalTrail.create({
      data: {
        requisitionId: requisitionId,
        userId: user.id,
        role: user.role,
        action,
        comment,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRequisition,
    });
  } catch (error) {
    console.error('Error approving requisition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
