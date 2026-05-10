import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // TODO: Implement authentication logic
    // For now, return a mock response
    const mockUser = {
      id: 1,
      email,
      name: 'Test User',
      role: 'staff',
    };

    return NextResponse.json(
      {
        success: true,
        user: mockUser,
        token: 'mock-jwt-token',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
