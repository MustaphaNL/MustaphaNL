import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import path from 'path';
import fs from 'fs';

export const listingsRouter = Router();

// GET /api/listings — public browse
listingsRouter.get(
  '/',
  optionalAuth,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('pageSize').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('type').optional().isIn(['help_request', 'volunteer_offer']),
    query('category').optional().isString(),
    query('neighbourhood').optional().isString(),
    query('search').optional().isString(),
    query('lat').optional().isFloat(),
    query('lng').optional().isFloat(),
  ],
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 50);
    const { type, category, neighbourhood, search } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {
      status: 'active',
      author: { isActive: true, deletedAt: null },
    };

    if (type) where['type'] = type;
    if (category) where['categoryId'] = category;
    if (neighbourhood) where['neighbourhood'] = neighbourhood;
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
          author: {
            select: { id: true, firstName: true, lastName: true, profilePhoto: true, neighbourhood: true },
          },
        },
      }),
    ]);

    res.json({
      data: listings,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  }
);

// GET /api/listings/:id
listingsRouter.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: {
      author: {
        select: {
          id: true, firstName: true, lastName: true, profilePhoto: true,
          neighbourhood: true, bio: true, phone: true,
        },
      },
    },
  });

  if (!listing || listing.status === 'draft') {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }

  // Track view
  prisma.listingView.create({ data: { listingId: listing.id } }).catch(() => {});
  prisma.listing.update({ where: { id: listing.id }, data: { views: { increment: 1 } } }).catch(() => {});

  // Strip phone number unless showPhone and user is logged in
  const data: typeof listing & { author: typeof listing.author & { phone?: string | null } } = { ...listing };
  if (!listing.showPhone || !req.user) {
    data.author = { ...listing.author, phone: undefined };
  }

  // Strip email: never expose directly
  res.json(data);
});

// POST /api/listings
listingsRouter.post(
  '/',
  requireAuth,
  upload.array('images', 3),
  [
    body('title').trim().notEmpty().isLength({ max: 100 }),
    body('type').isIn(['help_request', 'volunteer_offer']),
    body('categoryId').notEmpty(),
    body('description').trim().notEmpty().isLength({ max: 1000 }),
    body('neighbourhood').notEmpty(),
    body('frequency').isIn(['once', 'recurring', 'flexible']),
    body('contactPreference').isIn(['in_app', 'email', 'both']),
    body('showPhone').optional().isBoolean(),
    body('showEmail').optional().isBoolean(),
    body('status').optional().isIn(['draft', 'active']),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.mapped() });
      return;
    }

    const files = (req.files as Express.Multer.File[]) || [];
    const images = files.map((f) => `/uploads/${f.filename}`);

    const listing = await prisma.listing.create({
      data: {
        title: req.body.title,
        type: req.body.type,
        categoryId: req.body.categoryId,
        description: req.body.description,
        neighbourhood: req.body.neighbourhood,
        latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
        longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
        frequency: req.body.frequency,
        contactPreference: req.body.contactPreference,
        showPhone: req.body.showPhone === 'true' || req.body.showPhone === true,
        showEmail: req.body.showEmail === 'true' || req.body.showEmail === true,
        images,
        authorId: req.user!.userId,
        status: req.body.status || 'active',
      },
    });

    res.status(201).json(listing);
  }
);

// PATCH /api/listings/:id
listingsRouter.patch(
  '/:id',
  requireAuth,
  upload.array('images', 3),
  async (req: AuthRequest, res: Response) => {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });

    if (!listing) { res.status(404).json({ error: 'Not found' }); return; }
    if (listing.authorId !== req.user!.userId && !req.user!.isAdmin) {
      res.status(403).json({ error: 'Forbidden' }); return;
    }

    const files = (req.files as Express.Multer.File[]) || [];
    const newImages = files.map((f) => `/uploads/${f.filename}`);

    // Keep existing images if not replaced
    const images = newImages.length > 0 ? newImages : listing.images;

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        ...(req.body.title && { title: req.body.title }),
        ...(req.body.categoryId && { categoryId: req.body.categoryId }),
        ...(req.body.description && { description: req.body.description }),
        ...(req.body.neighbourhood && { neighbourhood: req.body.neighbourhood }),
        ...(req.body.frequency && { frequency: req.body.frequency }),
        ...(req.body.contactPreference && { contactPreference: req.body.contactPreference }),
        ...(req.body.showPhone !== undefined && { showPhone: req.body.showPhone === 'true' || req.body.showPhone === true }),
        ...(req.body.showEmail !== undefined && { showEmail: req.body.showEmail === 'true' || req.body.showEmail === true }),
        ...(req.body.status && { status: req.body.status }),
        images,
      },
    });

    res.json(updated);
  }
);

// DELETE /api/listings/:id
listingsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });

  if (!listing) { res.status(404).json({ error: 'Not found' }); return; }
  if (listing.authorId !== req.user!.userId && !req.user!.isAdmin) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }

  // Delete associated images
  for (const img of listing.images) {
    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', path.basename(img));
    fs.unlink(filePath, () => {});
  }

  await prisma.listing.delete({ where: { id: req.params.id } });
  res.json({ message: 'Listing deleted' });
});

// GET /api/listings/my/listings
listingsRouter.get('/my/listings', requireAuth, async (req: AuthRequest, res: Response) => {
  const listings = await prisma.listing.findMany({
    where: { authorId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(listings);
});
