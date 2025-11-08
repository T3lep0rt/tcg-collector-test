/**
 * User Profile Routes
 * Handles user profile viewing and updating
 */

import express from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

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
          select: { cards: true }
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
    const { page = 1, limit = 50, set, rarity, condition } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const where = {
      userId: id
    };

    if (set) where.set = set;
    if (rarity) where.rarity = rarity;
    if (condition) where.condition = condition;

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
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'Failed to get collection' });
  }
});

export default router;
