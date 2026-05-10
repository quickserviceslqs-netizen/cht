import { PrismaClient, ApprovalThreshold } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

/**
 * Find the appropriate approval threshold based on amount and origin type
 * Matches the Django workflow resolver logic
 */
export async function findApprovalThreshold(
  amount: Decimal | number,
  originType: string
): Promise<ApprovalThreshold | null> {
  const amountDecimal = new Decimal(amount);

  // Find matching threshold ordered by priority
  const threshold = await prisma.approvalThreshold.findFirst({
    where: {
      isActive: true,
      OR: [
        {
          originType: 'any',
        },
        {
          originType: originType.toUpperCase(),
        },
      ],
      minAmount: {
        lte: amountDecimal,
      },
      maxAmount: {
        gte: amountDecimal,
      },
    },
    orderBy: {
      priority: 'asc',
    },
  });

  return threshold;
}

/**
 * Resolve the complete workflow sequence for a requisition
 * Returns the ordered list of roles that need to approve
 */
export async function resolveWorkflow(
  requisitionData: {
    amount: number;
    originType: string;
    isUrgent: boolean;
  },
  isFastTrack: boolean = false
): Promise<{
  roles: string[];
  threshold: ApprovalThreshold | null;
}> {
  const threshold = await findApprovalThreshold(
    requisitionData.amount,
    requisitionData.originType
  );

  if (!threshold) {
    return { roles: [], threshold: null };
  }

  let roles = [...threshold.rolesSequence];

  // Apply fast-track logic if urgent and allowed
  if (requisitionData.isUrgent && threshold.allowUrgentFasttrack && isFastTrack) {
    // Fast-track removes intermediate approvers, keeps first and critical
    roles = roles.filter(
      (role) =>
        role === roles[0] || // Keep first approver
        threshold.requiresCfo === true ||
        threshold.requiresCeo === true
    );
  }

  return { roles, threshold };
}

/**
 * Find next approver for a requisition based on workflow
 */
export async function findNextApprover(
  companyId: number,
  currentRoleIndex: number,
  rolesSequence: string[],
  requisitionData: {
    branchId?: number;
    regionId?: number;
    departmentId?: number;
  }
) {
  if (currentRoleIndex >= rolesSequence.length - 1) {
    return null; // No more approvers
  }

  const nextRole = rolesSequence[currentRoleIndex + 1];

  // Find user with next role in the organization hierarchy
  const nextApprover = await prisma.user.findFirst({
    where: {
      role: nextRole,
      companyId,
      isActive: true,
      OR: [
        // Centralized approver
        { isCentralizedApprover: true },
        // Or matching org structure
        {
          AND: [
            requisitionData.branchId ? { branchId: requisitionData.branchId } : {},
            requisitionData.regionId ? { regionId: requisitionData.regionId } : {},
            requisitionData.departmentId
              ? { departmentId: requisitionData.departmentId }
              : {},
          ],
        },
      ],
    },
  });

  return nextApprover;
}
