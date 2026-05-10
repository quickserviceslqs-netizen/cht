import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch treasury funds from database
    const mockFunds = [
      {
        id: 1,
        name: 'Operating Fund',
        balance: 500000,
        currency: 'KES',
        isActive: true,
      },
    ];

    return NextResponse.json({
      success: true,
      funds: mockFunds,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch treasury funds' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { paymentId, status } = await request.json();

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Payment ID and status are required' },
        { status: 400 }
      );
    }

    // TODO: Update payment execution
    return NextResponse.json(
      {
        success: true,
        message: 'Payment executed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to execute payment' },
      { status: 500 }
    );
  }
}
