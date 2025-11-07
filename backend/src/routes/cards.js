/**
 * Card Collection Routes
 * Handles CRUD operations for user's card collection
 */

import express from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All card routes require authentication
router.use(requireAuth);

/**
 * GET /api/cards
 * Get current user's card collection
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { page = 1, limit = 50, set, rarity, condition, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const where = {
      userId
    };

    if (set) where.set = set;
    if (rarity) where.rarity = rarity;
    if (condition) where.condition = condition;
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Get cards with pagination
    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.card.count({ where })
    ]);

    res.json({
      cards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Failed to get cards' });
  }
});

/**
 * GET /api/cards/:id
 * Get single card by ID (must belong to user)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const card = await prisma.card.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ card });
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Failed to get card' });
  }
});

/**
 * POST /api/cards
 * Add a new card to collection
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, set, rarity, condition, quantity, imageUrl, notes } = req.body;

    // Validation
    if (!name || !set) {
      return res.status(400).json({ error: 'Name and set are required' });
    }

    const card = await prisma.card.create({
      data: {
        name,
        set,
        rarity,
        condition,
        quantity: quantity || 1,
        imageUrl,
        notes,
        userId
      }
    });

    res.status(201).json({ card });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

/**
 * PUT /api/cards/:id
 * Update a card in collection
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;
    const { name, set, rarity, condition, quantity, imageUrl, notes } = req.body;

    // Check if card exists and belongs to user
    const existingCard = await prisma.card.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingCard) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Update card
    const card = await prisma.card.update({
      where: { id },
      data: {
        name,
        set,
        rarity,
        condition,
        quantity,
        imageUrl,
        notes
      }
    });

    res.json({ card });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

/**
 * DELETE /api/cards/:id
 * Delete a card from collection
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    // Check if card exists and belongs to user
    const existingCard = await prisma.card.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingCard) {
      return res.status(404).json({ error: 'Card not found' });
    }

    await prisma.card.delete({
      where: { id }
    });

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

/**
 * GET /api/cards/stats/summary
 * Get collection statistics for current user
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.session.userId;

    const [totalCards, uniqueCards, sets, rarities] = await Promise.all([
      prisma.card.aggregate({
        where: { userId },
        _sum: { quantity: true }
      }),
      prisma.card.count({
        where: { userId }
      }),
      prisma.card.groupBy({
        by: ['set'],
        where: { userId },
        _count: true
      }),
      prisma.card.groupBy({
        by: ['rarity'],
        where: { userId },
        _count: true
      })
    ]);

    res.json({
      totalCards: totalCards._sum.quantity || 0,
      uniqueCards,
      sets: sets.length,
      setBreakdown: sets,
      rarityBreakdown: rarities
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;
