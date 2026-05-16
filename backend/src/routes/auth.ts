import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../auth/auth.js';
import { requireAuth, AuthenticatedRequest } from '../auth/middleware.js';
import { pool } from '../db/pool.js';

const router = Router();

// Better Auth handles all /api/auth/* routes
router.all('/auth/*', toNodeHandler(auth));

// Current user info with profile + role
router.get('/auth/me', requireAuth, async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  try {
    const result = await pool.query(
      `SELECT
         u.id, u.email, u.name,
         p.first_name, p.last_name, p.job_title,
         r.role
       FROM "user" u
       LEFT JOIN public.profiles p ON p.user_id = u.id
       LEFT JOIN public.user_roles r ON r.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );
    if (!result.rows[0]) {
      res.status(404).json({ error: 'Utilisateur introuvable' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /auth/me error', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
