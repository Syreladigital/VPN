import { Request, Response, NextFunction } from 'express';
import { auth } from './auth.js';
import { pool } from '../db/pool.js';
import { fromNodeHeaders } from 'better-auth/node';

export interface AuthenticatedRequest extends Request {
  userId: string;
  userRole: string;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const roleResult = await pool.query(
      `SELECT role FROM public.user_roles WHERE user_id = $1`,
      [session.user.id]
    );

    (req as AuthenticatedRequest).userId = session.user.id;
    (req as AuthenticatedRequest).userRole = roleResult.rows[0]?.role ?? 'user';
    next();
  } catch {
    res.status(401).json({ error: 'Session invalide' });
  }
}

export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await requireAuth(req, res, () => {
      const role = (req as AuthenticatedRequest).userRole;
      if (!roles.includes(role)) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }
      next();
    });
  };
}

export const requireAdmin = requireRole('admin', 'super_admin');
export const requireSuperAdmin = requireRole('super_admin');
