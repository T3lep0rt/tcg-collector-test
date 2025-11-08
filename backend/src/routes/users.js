/**
 * User Profile Routes
 * Handles user profile viewing and updating
 */

import express from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users
 * Get all users (for community/trading)
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          bio: true,
          createdAt: true,
          _count: {
            select: { inventory: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

/**
 * GET /api/users/:id
 * Get user profile by ID (public)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: {
          select: { inventory: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, username, bio, avatar } = req.body;
    const userId = req.session.userId;

    // Check if username is taken by another user
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        username,
        bio,
        avatar
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true
      }
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/users/:id/collection
 * Get user's card collection (public)
 */
router.get('/:id/collection', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, set, rarity, condition, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const where = {
      userId: id
    };

    // Add card filters
    const cardWhere = {};
    if (set) cardWhere.set = set;
    if (rarity) cardWhere.rarity = rarity;
    if (search) {
      cardWhere.name = { contains: search, mode: 'insensitive' };
    }

    if (Object.keys(cardWhere).length > 0) {
      where.card = cardWhere;
    }

    if (condition) where.condition = condition;

    // Get user's cards with pagination
    const [userCards, total] = await Promise.all([
      prisma.userCard.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          card: true
        }
      }),
      prisma.userCard.count({ where })
    ]);

    // Transform to include card details at top level
    const cards = userCards.map(uc => ({
      ...uc.card,
      quantity: uc.quantity,
      condition: uc.condition,
      notes: uc.notes,
      userCardId: uc.id
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
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'Failed to get collection' });
  }
});

export default router;
