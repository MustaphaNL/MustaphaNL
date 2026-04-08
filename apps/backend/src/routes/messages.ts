import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { sendMessageNotification } from '../utils/email';

export const messagesRouter = Router();

messagesRouter.use(requireAuth);

// GET /api/messages/inbox — all threads for current user
messagesRouter.get('/inbox', async (req: AuthRequest, res: Response) => {
  // Get latest message per listing per conversation partner
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { receiverId: req.user!.userId },
        { senderId: req.user!.userId },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: { select: { id: true, title: true, status: true } },
      sender: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } },
      receiver: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } },
    },
  });

  // Deduplicate: one thread per (listingId, partnerId)
  const seen = new Set<string>();
  const threads = messages.filter((m) => {
    const partnerId = m.senderId === req.user!.userId ? m.receiverId : m.senderId;
    const key = `${m.listingId}:${partnerId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const unreadCount = await prisma.message.count({
    where: { receiverId: req.user!.userId, isRead: false },
  });

  res.json({ threads, unreadCount });
});

// GET /api/messages/thread/:listingId/:partnerId
messagesRouter.get('/thread/:listingId/:partnerId', async (req: AuthRequest, res: Response) => {
  const { listingId, partnerId } = req.params;
  const userId = req.user!.userId;

  const messages = await prisma.message.findMany({
    where: {
      listingId,
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } },
    },
  });

  // Mark as read
  await prisma.message.updateMany({
    where: {
      listingId,
      senderId: partnerId,
      receiverId: userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  res.json(messages);
});

// POST /api/messages — send a message
messagesRouter.post(
  '/',
  [
    body('listingId').notEmpty(),
    body('receiverId').notEmpty(),
    body('body').trim().notEmpty().isLength({ max: 2000 }),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.mapped() });
      return;
    }

    const { listingId, receiverId, body: messageBody } = req.body;
    const senderId = req.user!.userId;

    if (senderId === receiverId) {
      res.status(400).json({ error: 'Cannot message yourself' });
      return;
    }

    // Verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { author: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId }, select: { firstName: true, lastName: true } }),
      prisma.user.findUnique({ where: { id: receiverId }, select: { firstName: true, lastName: true, email: true } }),
    ]);

    if (!sender || !receiver) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const message = await prisma.message.create({
      data: { listingId, senderId, receiverId, body: messageBody },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } },
      },
    });

    // Send email notification (non-blocking)
    sendMessageNotification(
      receiver.email,
      receiver.firstName,
      `${sender.firstName} ${sender.lastName}`,
      listing.title,
      messageBody
    ).catch(() => {});

    res.status(201).json(message);
  }
);

// GET /api/messages/unread-count
messagesRouter.get('/unread-count', async (req: AuthRequest, res: Response) => {
  const count = await prisma.message.count({
    where: { receiverId: req.user!.userId, isRead: false },
  });
  res.json({ count });
});
