import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthUser } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * PUT /api/admin/users/[id] - Update user
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);

    // Only admin can access
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    const {
      email,
      username,
      password,
      firstName,
      lastName,
      role,
      isActive,
    } = await req.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent self-role-change (security)
    if (user.id === userId && role && role !== user.role) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (email && email !== existingUser.email) {
      // Check if new email exists
      const emailExists = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }
      updateData.email = email;
    }

    if (username && username !== existingUser.username) {
      // Check if new username exists
      const usernameExists = await prisma.user.findFirst({
        where: { username, NOT: { id: userId } },
      });
      if (usernameExists) {
        return NextResponse.json(
          { error: 'Username already in use' },
          { status: 409 }
        );
      }
      updateData.username = username;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * DELETE /api/admin/users/[id] - Delete user
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);

    // Only admin can access
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    // Prevent self-deletion
    if (user.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Soft delete (deactivate instead of removing)
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully',
      data: deletedUser,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
