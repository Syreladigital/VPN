import { betterAuth } from 'better-auth';
import pg from 'pg';
import { sendPasswordResetEmail, sendEmailVerification } from '../lib/resend.js';

// Better Auth needs its own pool instance (separate from app pool)
const { Pool } = pg;
const authPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: {
    provider: 'pg',
    db: authPool,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BACKEND_URL ?? 'http://localhost:3001',
  trustedOrigins: [process.env.FRONTEND_URL ?? 'http://localhost:5173'],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },

  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerification(user.email, url);
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  advanced: {
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  },
});
