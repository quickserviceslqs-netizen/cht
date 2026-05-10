import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { requisitionId, status, comments } = await request.json();

    if (!requisitionId || !status) {
      return NextResponse.json(
        { error: 'Requisition ID and status are required' },
        { status: 400 }
      );
    }

    // TODO: Save approval to database
    const approval = {
      id: Math.random(),
      requisitionId,
      status,
      comments: comments || '',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        approval,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit approval' },
      { status: 500 }
    );
  }
}
