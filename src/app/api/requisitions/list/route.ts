import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (companyId) {
      where.companyId = parseInt(companyId);
    }

    // Get requisitions based on user role
    let requisitions;
    if (user.role === 'admin' || user.role === 'ceo') {
      // Admin/CEO can see all requisitions
      requisitions = await prisma.requisition.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          requestedBy: true,
          company: true,
          nextApprover: true,
          approvalTrails: true,
        },
      });
    } else {
      // Regular users see their own requisitions or requisitions they need to approve
      requisitions = await prisma.requisition.findMany({
        where: {
          ...where,
          OR: [
            { requestedById: user.id },
            { nextApproverId: user.id },
          ],
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          requestedBy: true,
          company: true,
          nextApprover: true,
          approvalTrails: true,
        },
      });
    }

    const total = await prisma.requisition.count({ where });

    return NextResponse.json({
      success: true,
      data: requisitions,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
