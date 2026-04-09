import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { requireAdmin, AuthRequest } from '../middleware/auth';
import { adminLimiter } from '../middleware/rateLimit';
import { clampInt, sanitizeText } from '../utils/sanitize';

export const adminRouter = Router();

adminRouter.use(requireAdmin);
adminRouter.use(adminLimiter);

// GET /api/admin/stats
adminRouter.get('/stats', async (_req: Request, res: Response) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalListings,
    activeListings,
    newUsersThisWeek,
    newListingsThisWeek,
    listingsByCategory,
    listingsByType,
    pageViewsToday,
    pageViewsThisWeek,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true, deletedAt: null } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'active' } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.listing.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.listing.groupBy({ by: ['categoryId'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
    prisma.listing.groupBy({ by: ['type'], _count: { id: true } }),
    prisma.pageView.count({ where: { createdAt: { gte: new Date(now.setHours(0, 0, 0, 0)) } } }),
    prisma.pageView.count({ where: { createdAt: { gte: weekAgo } } }),
  ]);

  res.json({
    totalUsers,
    totalListings,
    activeListings,
    newUsersThisWeek,
    newListingsThisWeek,
    listingsByCategory,
    listingsByType,
    pageViewsToday,
    pageViewsThisWeek,
  });
});

// GET /api/admin/page-views — daily views for chart
adminRouter.get('/page-views', async (req: Request, res: Response) => {
  const days = clampInt(req.query.days, 1, 365, 30);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const views = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
    SELECT DATE("createdAt")::text AS date, COUNT(*)::bigint AS count
    FROM "PageView"
    WHERE "createdAt" >= ${since}
    GROUP BY DATE("createdAt")
    ORDER BY DATE("createdAt") ASC
  `;

  res.json(views.map((v) => ({ date: v.date, count: Number(v.count) })));
});

// GET /api/admin/users
adminRouter.get('/users', async (req: Request, res: Response) => {
  const page = clampInt(req.query.page, 1, 1000, 1);
  const pageSize = clampInt(req.query.pageSize, 1, 100, 20);
  const search = req.query.search ? sanitizeText(req.query.search as string) : undefined;

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        roles: true, isAdmin: true, isActive: true, isVerified: true,
        neighbourhood: true, createdAt: true, deletedAt: true,
        _count: { select: { listings: true } },
      },
    }),
  ]);

  res.json({ data: users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
});

// PATCH /api/admin/users/:id
adminRouter.patch('/users/:id', [
  param('id').isUUID(),
  body('isActive').optional().isBoolean(),
  body('isAdmin').optional().isBoolean(),
  body('roles').optional().isArray(),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation failed', details: errors.mapped() });
    return;
  }
  const { isActive, isAdmin, roles } = req.body;

  // Prevent self-demotion
  if (req.params.id === req.user!.userId && isAdmin === false) {
    res.status(400).json({ error: 'Cannot remove your own admin role' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...(isActive !== undefined && { isActive }),
      ...(isAdmin !== undefined && { isAdmin }),
      ...(roles !== undefined && { roles }),
    },
    select: { id: true, email: true, isActive: true, isAdmin: true, roles: true },
  });

  res.json(updated);
});

// DELETE /api/admin/users/:id (hard delete)
adminRouter.delete('/users/:id', [param('id').isUUID()], async (req: AuthRequest, res: Response) => {
  if (req.params.id === req.user!.userId) {
    res.status(400).json({ error: 'Cannot delete your own account via admin' });
    return;
  }
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
});

// GET /api/admin/listings
adminRouter.get('/listings', async (req: Request, res: Response) => {
  const page = clampInt(req.query.page, 1, 1000, 1);
  const pageSize = clampInt(req.query.pageSize, 1, 100, 20);
  const search = req.query.search ? sanitizeText(req.query.search as string) : undefined;
  const status = req.query.status as string | undefined;

  const where: Record<string, unknown> = {};
  if (status) where['status'] = status;
  if (search) {
    where['OR'] = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, listings] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { messages: true } },
      },
    }),
  ]);

  res.json({ data: listings, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
});

// PATCH /api/admin/listings/:id
adminRouter.patch('/listings/:id', [
  param('id').isUUID(),
  body('status').optional().isIn(['draft', 'active', 'closed', 'flagged']),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation failed', details: errors.mapped() });
    return;
  }
  const { status } = req.body;
  const listing = await prisma.listing.update({
    where: { id: req.params.id },
    data: { ...(status && { status }) },
  });
  res.json(listing);
});

// DELETE /api/admin/listings/:id
adminRouter.delete('/listings/:id', [param('id').isUUID()], async (req: Request, res: Response) => {
  await prisma.listing.delete({ where: { id: req.params.id } });
  res.json({ message: 'Listing deleted' });
});

// GET /api/admin/export/users
adminRouter.get('/export/users', async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true, email: true, firstName: true, lastName: true,
      roles: true, neighbourhood: true, isVerified: true,
      isActive: true, createdAt: true,
    },
  });

  const header = 'id,email,firstName,lastName,roles,neighbourhood,isVerified,isActive,createdAt\n';
  const rows = users.map((u) =>
    [u.id, u.email, u.firstName, u.lastName, u.roles.join(';'), u.neighbourhood, u.isVerified, u.isActive, u.createdAt.toISOString()].join(',')
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
  res.send(header + rows);
});

// GET /api/admin/export/listings
adminRouter.get('/export/listings', async (_req: Request, res: Response) => {
  const listings = await prisma.listing.findMany({
    include: { author: { select: { email: true } } },
  });

  const header = 'id,title,type,status,categoryId,neighbourhood,authorEmail,views,createdAt\n';
  const rows = listings.map((l) =>
    [l.id, `"${l.title.replace(/"/g, '""')}"`, l.type, l.status, l.categoryId, l.neighbourhood, l.author.email, l.views, l.createdAt.toISOString()].join(',')
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=listings.csv');
  res.send(header + rows);
});
