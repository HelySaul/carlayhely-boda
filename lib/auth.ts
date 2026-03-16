import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;

export interface AdminPayload {
  id: string;
  username: string;
  nombre: string;
  rol: 'super_admin' | 'organizador' | 'recepcion';
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '12h' });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(req: Request): Promise<AdminPayload | null> {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    return verifyToken(auth.slice(7));
  }
  return null;
}