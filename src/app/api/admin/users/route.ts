import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthUser } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * GET /api/admin/users - List all users
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    // Only admin can access
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        company: { select: { name: true } },
        branch: { select: { name: true } },
        region: { select: { name: true } },
        department: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/admin/users - Create new user
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    // Only admin can access
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const {
      email,
      username,
      password,
      firstName,
      lastName,
      role,
      companyId,
      regionId,
      branchId,
      departmentId,
      isActive,
    } = await req.json();

    // Validate required fields
    if (!email || !username || !password || !role) {
      return NextResponse.json(
        { error: 'Email, username, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = [
      'staff',
      'manager',
      'treasury',
      'department_head',
      'cfo',
      'ceo',
      'admin',
    ];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role,
        companyId: companyId || null,
        regionId: regionId || null,
        branchId: branchId || null,
        departmentId: departmentId || null,
        isActive: isActive !== false,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { success: true, message: 'User created successfully', data: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
