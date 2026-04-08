import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { authLimiter } from '../middleware/rateLimit';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

authRouter.use(authLimiter);

// POST /api/auth/register
authRouter.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('dateOfBirth').isISO8601(),
    body('gender').isIn(['man', 'vrouw', 'anders', 'prefer_not_to_say']),
    body('postcode').trim().notEmpty(),
    body('neighbourhood').trim().notEmpty(),
    body('roles').isArray({ min: 1 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.mapped() });
      return;
    }

    const { email, password, firstName, lastName, dateOfBirth, gender, postcode, neighbourhood, phone, bio, roles, availability, interests } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verifyToken = uuidv4();
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        postcode,
        neighbourhood,
        phone: phone || null,
        bio: bio || null,
        roles: roles || [],
        availability: availability || [],
        interests: interests || [],
        verifyToken,
        verifyTokenExpiry,
      },
    });

    try {
      await sendVerificationEmail(email, verifyToken, firstName);
    } catch (err) {
      console.error('Email send failed:', err);
    }

    res.status(201).json({ message: 'Registration successful. Please verify your email.' });
  }
);

// GET /api/auth/verify-email
authRouter.get('/verify-email', async (req: Request, res: Response) => {
  const { token } = req.query as { token?: string };
  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      verifyToken: token,
      verifyTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    res.status(400).json({ error: 'Invalid or expired verification token' });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verifyToken: null, verifyTokenExpiry: null },
  });

  res.json({ message: 'Email verified successfully' });
});

// POST /api/auth/login
authRouter.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed' });
      return;
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive || user.deletedAt) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ error: 'Please verify your email first' });
      return;
    }

    const payload = { userId: user.id, isAdmin: user.isAdmin };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        isAdmin: user.isAdmin,
        profilePhoto: user.profilePhoto,
      },
    });
  }
);

// POST /api/auth/refresh
authRouter.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: 'Missing refresh token' });
    return;
  }
  try {
    const payload = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken({ userId: payload.userId, isAdmin: payload.isAdmin });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', [body('email').isEmail().normalizeEmail()], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }

  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond the same to avoid email enumeration
  if (user && user.isActive && !user.deletedAt) {
    const resetToken = uuidv4();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (err) {
      console.error('Reset email failed:', err);
    }
  }

  res.json({ message: 'If your email is registered, you will receive a reset link.' });
});

// POST /api/auth/reset-password
authRouter.post(
  '/reset-password',
  [body('token').notEmpty(), body('password').isLength({ min: 8 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed' });
      return;
    }

    const { token, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ message: 'Password reset successfully' });
  }
);

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, email: true, firstName: true, lastName: true, dateOfBirth: true,
      gender: true, postcode: true, neighbourhood: true, phone: true,
      profilePhoto: true, bio: true, roles: true, isAdmin: true,
      availability: true, interests: true, isVerified: true, createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
});
