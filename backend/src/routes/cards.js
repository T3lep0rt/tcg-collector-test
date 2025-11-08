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
 * GET /api/cards/browse
 * Get all cards in the catalog (for browse view)
 * Includes user's inventory status for each card
 */
router.get('/browse', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { page = 1, limit = 1000, set, rarity, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter for card catalog
    const where = {};

    if (set) where.set = set;
    if (rarity) where.rarity = rarity;
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Get all cards with pagination
    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' },
        include: {
          userCards: {
            where: { userId },
            select: {
              quantity: true,
              condition: true,
              notes: true
            }
          }
        }
      }),
      prisma.card.count({ where })
    ]);

    // Transform cards to include ownership info at top level for frontend compatibility
    const cardsWithOwnership = cards.map(card => {
      const userCard = card.userCards[0]; // Will be undefined if user doesn't own it
      return {
        ...card,
        userId: userCard ? userId : null,
        quantity: userCard?.quantity || 0,
        condition: userCard?.condition || null,
        notes: userCard?.notes || null,
        userCards: undefined // Remove nested data
      };
    });

    res.json({
      cards: cardsWithOwnership,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get browse cards error:', error);
    res.status(500).json({ error: 'Failed to get cards' });
  }
});

/**
 * GET /api/cards
 * Get current user's card collection
 * Now returns data from UserCard inventory table
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { page = 1, limit = 50, set, rarity, condition, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter for user's inventory
    const where = {
      userId
    };

    // Build card filter
    const cardWhere = {};
    if (set) cardWhere.set = set;
    if (rarity) cardWhere.rarity = rarity;
    if (search) {
      cardWhere.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Add condition filter to userCard
    if (condition) where.condition = condition;

    // Get user's cards from inventory with card details
    const [userCards, total] = await Promise.all([
      prisma.userCard.findMany({
        where: {
          ...where,
          card: cardWhere
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          card: true
        }
      }),
      prisma.userCard.count({
        where: {
          ...where,
          card: cardWhere
        }
      })
    ]);

    // Transform to match old API format for backwards compatibility
    const cards = userCards.map(userCard => ({
      ...userCard.card,
      quantity: userCard.quantity,
      condition: userCard.condition,
      notes: userCard.notes,
      userId: userCard.userId,
      userCardId: userCard.id
    }));

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
 * GET /api/cards/stats/summary
 * Get collection statistics for current user
 * IMPORTANT: This must be before /:id route to avoid matching 'stats' as an id
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get stats from UserCard inventory
    const [totalCards, uniqueCards, userCards] = await Promise.all([
      prisma.userCard.aggregate({
        where: { userId },
        _sum: { quantity: true }
      }),
      prisma.userCard.count({
        where: { userId }
      }),
      prisma.userCard.findMany({
        where: { userId },
        include: {
          card: {
            select: {
              set: true,
              rarity: true
            }
          }
        }
      })
    ]);

    // Group by set and rarity
    const setMap = new Map();
    const rarityMap = new Map();

    userCards.forEach(userCard => {
      const { set, rarity } = userCard.card;

      setMap.set(set, (setMap.get(set) || 0) + 1);
      if (rarity) {
        rarityMap.set(rarity, (rarityMap.get(rarity) || 0) + 1);
      }
    });

    const sets = Array.from(setMap.entries()).map(([set, _count]) => ({
      set,
      _count
    }));

    const rarities = Array.from(rarityMap.entries()).map(([rarity, _count]) => ({
      rarity,
      _count
    }));

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

export default router;
