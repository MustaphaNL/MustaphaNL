import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import path from 'path';
import fs from 'fs';

export const usersRouter = Router();

// GET /api/users/:id (public profile)
usersRouter.get('/:id', async (req, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id, isActive: true, deletedAt: null },
    select: {
      id: true, firstName: true, lastName: true, neighbourhood: true,
      profilePhoto: true, bio: true, roles: true, interests: true,
      availability: true, createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

// PATCH /api/users/me — update profile
usersRouter.patch(
  '/me',
  requireAuth,
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('postcode').optional().trim().notEmpty(),
    body('neighbourhood').optional().trim().notEmpty(),
    body('bio').optional().isLength({ max: 500 }),
    body('phone').optional({ nullable: true }),
    body('availability').optional().isArray(),
    body('interests').optional().isArray(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.mapped() });
      return;
    }

    const { firstName, lastName, postcode, neighbourhood, bio, phone, availability, interests, roles } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(postcode !== undefined && { postcode }),
        ...(neighbourhood !== undefined && { neighbourhood }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(availability !== undefined && { availability }),
        ...(interests !== undefined && { interests }),
        ...(roles !== undefined && { roles }),
      },
      select: {
        id: true, email: true, firstName: true, lastName: true, dateOfBirth: true,
        gender: true, postcode: true, neighbourhood: true, phone: true,
        profilePhoto: true, bio: true, roles: true, isAdmin: true,
        availability: true, interests: true, isVerified: true, createdAt: true,
      },
    });

    res.json(updated);
  }
);

// POST /api/users/me/photo
usersRouter.post('/me/photo', requireAuth, uploadSingle.single('photo'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  // Delete old photo
  const existing = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { profilePhoto: true } });
  if (existing?.profilePhoto) {
    const oldPath = path.join(process.env.UPLOAD_DIR || 'uploads', path.basename(existing.profilePhoto));
    fs.unlink(oldPath, () => {});
  }

  const photoUrl = `/uploads/${req.file.filename}`;
  await prisma.user.update({ where: { id: req.user!.userId }, data: { profilePhoto: photoUrl } });

  res.json({ profilePhoto: photoUrl });
});

// POST /api/users/me/change-password
usersRouter.post(
  '/me/change-password',
  requireAuth,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 })],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) { res.status(404).json({ error: 'Not found' }); return; }

    const valid = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
    if (!valid) { res.status(400).json({ error: 'Current password is incorrect' }); return; }

    const passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await prisma.user.update({ where: { id: req.user!.userId }, data: { passwordHash } });

    res.json({ message: 'Password updated' });
  }
);

// DELETE /api/users/me — GDPR soft delete
usersRouter.delete('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  await prisma.user.update({
    where: { id: req.user!.userId },
    data: { deletedAt: new Date(), isActive: false },
  });
  res.json({ message: 'Account scheduled for deletion in 30 days' });
});
