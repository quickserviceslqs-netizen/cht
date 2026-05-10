import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here-min-32-chars'
);

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: string;
  companyId?: number;
}

export async function verifyAuth(req: NextRequest): Promise<AuthUser | null> {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, secret);
    return verified.payload as AuthUser;
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser> {
  const user = await verifyAuth(req);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
