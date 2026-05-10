import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthUser } from '@/lib/auth';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Generate OTP for 2FA
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP using SHA-256
 */
function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Verify OTP
 */
function verifyOTP(otp: string, hash: string): boolean {
  return hashOTP(otp) === hash;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    // Only treasury users can execute payments
    if (!['treasury', 'ceo', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only treasury users can execute payments' },
        { status: 403 }
      );
    }

    const {
      requisitionId,
      amount,
      method,
      destination,
      requestOTP,
      otpCode,
    } = await req.json();

    // Validate inputs
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!method || !['mpesa', 'bank', 'cash'].includes(method)) {
      return NextResponse.json(
        { error: 'Valid payment method is required' },
        { status: 400 }
      );
    }

    if (!destination) {
      return NextResponse.json(
        { error: 'Payment destination is required' },
        { status: 400 }
      );
    }

    // Get requisition if provided
    let requisition = null;
    if (requisitionId) {
      requisition = await prisma.requisition.findUnique({
        where: { id: parseInt(requisitionId) },
        include: { company: true },
      });

      if (!requisition) {
        return NextResponse.json(
          { error: 'Requisition not found' },
          { status: 404 }
        );
      }

      // Validate amount matches
      if (amount > Number(requisition.amount)) {
        return NextResponse.json(
          { error: 'Payment amount exceeds requisition amount' },
          { status: 400 }
        );
      }
    }

    // Get or create treasury fund
    let treasuryFund = await prisma.treasuryFund.findFirst({
      where: {
        companyId: requisition?.companyId || user.companyId,
        regionId: requisition?.regionId || null,
        branchId: requisition?.branchId || null,
        departmentId: requisition?.departmentId || null,
      },
    });

    if (!treasuryFund) {
      treasuryFund = await prisma.treasuryFund.create({
        data: {
          companyId: requisition?.companyId || user.companyId!,
          regionId: requisition?.regionId || null,
          branchId: requisition?.branchId || null,
          departmentId: requisition?.departmentId || null,
          currentBalance: 0,
        },
      });
    }

    // Check if balance is sufficient
    if (treasuryFund.currentBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient fund balance' },
        { status: 400 }
      );
    }

    // Step 1: If OTP is required, generate and send OTP
    if (requestOTP) {
      const otp = generateOTP();
      const otpHash = hashOTP(otp);

      const payment = await prisma.payment.create({
        data: {
          requisitionId: requisitionId ? parseInt(requisitionId) : null,
          treasuryFundId: treasuryFund.id,
          amount,
          method,
          destination,
          status: 'pending',
          createdById: user.id,
          otpRequired: true,
          otpHash,
          otpSentTimestamp: new Date(),
        },
      });

      // In a real system, send OTP via SMS/Email
      console.log(`OTP for payment ${payment.id}: ${otp}`);

      return NextResponse.json({
        success: true,
        message: 'OTP sent. Please verify to complete payment.',
        paymentId: payment.id,
        requiresOTP: true,
      });
    }

    // Step 2: Verify OTP and execute payment
    if (otpCode) {
      // Find pending payment with this OTP
      const payment = await prisma.payment.findFirst({
        where: {
          requisitionId: requisitionId ? parseInt(requisitionId) : null,
          status: 'pending',
          otpRequired: true,
          otpHash: { not: null },
        },
      });

      if (!payment) {
        return NextResponse.json(
          { error: 'No pending payment found' },
          { status: 404 }
        );
      }

      // Verify OTP
      if (!verifyOTP(otpCode, payment.otpHash!)) {
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 400 }
        );
      }

      // Execute payment
      const executedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'success',
          executorId: user.id,
          executionTimestamp: new Date(),
          otpVerified: true,
          otpVerifiedTimestamp: new Date(),
        },
      });

      // Update treasury fund balance
      const currentBalanceDecimal = typeof treasuryFund.currentBalance === 'object'
        ? treasuryFund.currentBalance.toNumber()
        : treasuryFund.currentBalance;
      const newBalance = currentBalanceDecimal - amount;

      await prisma.treasuryFund.update({
        where: { id: treasuryFund.id },
        data: {
          currentBalance: newBalance,
          lastReplenished: new Date(),
        },
      });

      // Create ledger entry
      const ledgerBalance = typeof treasuryFund.currentBalance === 'object'
        ? treasuryFund.currentBalance.toNumber() - amount
        : treasuryFund.currentBalance - amount;

      await prisma.ledgerEntry.create({
        data: {
          treasuryFundId: treasuryFund.id,
          description: `Payment for requisition ${requisition?.transactionId || 'unknown'}`,
          debit: amount,
          balance: ledgerBalance,
        },
      });

      // Update requisition status if applicable
      if (requisition) {
        await prisma.requisition.update({
          where: { id: requisition.id },
          data: {
            status: 'paid',
          },
        });

        // Create approval trail
        await prisma.approvalTrail.create({
          data: {
            requisitionId: requisition.id,
            userId: user.id,
            role: user.role,
            action: 'paid',
            comment: `Payment executed via ${method}`,
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Payment executed successfully',
        data: executedPayment,
      });
    }

    return NextResponse.json(
      { error: 'Either requestOTP or otpCode must be provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
