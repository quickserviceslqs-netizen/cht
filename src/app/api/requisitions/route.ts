import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch requisitions from database
    const mockRequisitions = [
      {
        id: 1,
        referenceNo: 'REQ-001',
        title: 'Office Supplies',
        amount: 5000,
        status: 'submitted',
        submitter: 'John Doe',
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      requisitions: mockRequisitions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch requisitions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, amount, originType, urgency } = await request.json();

    if (!title || !amount) {
      return NextResponse.json(
        { error: 'Title and amount are required' },
        { status: 400 }
      );
    }

    // TODO: Save to database
    const newRequisition = {
      id: Math.random(),
      referenceNo: `REQ-${Date.now()}`,
      title,
      description,
      amount,
      status: 'draft',
      originType: originType || 'staff',
      urgency: urgency || 'normal',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        requisition: newRequisition,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create requisition' },
      { status: 500 }
    );
  }
}
