import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { authRouter } from './routes/auth';
import { listingsRouter } from './routes/listings';
import { messagesRouter } from './routes/messages';
import { usersRouter } from './routes/users';
import { adminRouter } from './routes/admin';
import { analyticsMiddleware } from './middleware/analytics';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(process.env.UPLOAD_DIR || path.join(__dirname, '../uploads')));

// Analytics middleware
app.use(analyticsMiddleware);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HvE Backend running on port ${PORT}`);
});
