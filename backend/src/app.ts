import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';

export const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRouter);
