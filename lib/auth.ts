import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET!;
const COOKIE = 'admin_token';

export function signToken(payload: object): string {
  return jwt.sign(payload, SECRET, { expiresIn: '12h' });
}

export function verifyToken(token: string): { username: string } | null {
  try {
    return jwt.verify(token, SECRET) as { username: string };
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(req: Request): Promise<{ username: string } | null> {
  // Check Authorization header
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    return verifyToken(auth.slice(7));
  }
  return null;
}