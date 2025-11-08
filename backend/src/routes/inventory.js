/**
 * User Inventory Routes
 * Manages user's card inventory (UserCard table)
 */

import express from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All inventory routes require authentication
router.use(requireAuth);

/**
 * POST /api/inventory
 * Add a card to user's inventory or update quantity if already exists
 * Body: { cardId: string, quantity?: number, condition?: string, notes?: string }
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { cardId, quantity = 1, condition = 'Near Mint', notes } = req.body;

    // Validation
    if (!cardId) {
      return res.status(400).json({ error: 'cardId is required' });
    }

    // Verify card exists in catalog
    const card = await prisma.card.findUnique({
      where: { cardId }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found in catalog' });
    }

    // Check if user already has this card
    const existingUserCard = await prisma.userCard.findUnique({
      where: {
        userId_cardId: {
          userId,
          cardId
        }
      }
    });

    let userCard;

    if (existingUserCard) {
      // Update existing entry
      userCard = await prisma.userCard.update({
        where: {
          userId_cardId: {
            userId,
            cardId
          }
        },
        data: {
          quantity,
          condition,
          notes
        },
        include: {
          card: true
        }
      });
    } else {
      // Create new entry
      userCard = await prisma.userCard.create({
        data: {
          userId,
          cardId,
          quantity,
          condition,
          notes
        },
        include: {
          card: true
        }
      });
    }

    // Transform to match expected format
    const result = {
      ...userCard.card,
      quantity: userCard.quantity,
      condition: userCard.condition,
      notes: userCard.notes,
      userId: userCard.userId,
      userCardId: userCard.id
    };

    res.status(existingUserCard ? 200 : 201).json({ card: result });
  } catch (error) {
    console.error('Add to inventory error:', error);
    res.status(500).json({ error: 'Failed to add card to inventory' });
  }
});

/**
 * PUT /api/inventory/:cardId
 * Update a card in user's inventory
 * Body: { quantity?: number, condition?: string, notes?: string }
 */
router.put('/:cardId', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { cardId } = req.params;
    const { quantity, condition, notes } = req.body;

    // Check if user has this card
    const existingUserCard = await prisma.userCard.findUnique({
      where: {
        userId_cardId: {
          userId,
          cardId
        }
      }
    });

    if (!existingUserCard) {
      return res.status(404).json({ error: 'Card not found in your inventory' });
    }

    // Update
    const userCard = await prisma.userCard.update({
      where: {
        userId_cardId: {
          userId,
          cardId
        }
      },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(condition !== undefined && { condition }),
        ...(notes !== undefined && { notes })
      },
      include: {
        card: true
      }
    });

    // Transform to match expected format
    const result = {
      ...userCard.card,
      quantity: userCard.quantity,
      condition: userCard.condition,
      notes: userCard.notes,
      userId: userCard.userId,
      userCardId: userCard.id
    };

    res.json({ card: result });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Failed to update card in inventory' });
  }
});

/**
 * DELETE /api/inventory/:cardId
 * Remove a card from user's inventory
 */
router.delete('/:cardId', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { cardId } = req.params;

    // Check if user has this card
    const existingUserCard = await prisma.userCard.findUnique({
      where: {
        userId_cardId: {
          userId,
          cardId
        }
      }
    });

    if (!existingUserCard) {
      return res.status(404).json({ error: 'Card not found in your inventory' });
    }

    // Delete
    await prisma.userCard.delete({
      where: {
        userId_cardId: {
          userId,
          cardId
        }
      }
    });

    res.json({ message: 'Card removed from inventory successfully' });
  } catch (error) {
    console.error('Delete from inventory error:', error);
    res.status(500).json({ error: 'Failed to remove card from inventory' });
  }
});

/**
 * GET /api/inventory/:cardId
 * Get a specific card from user's inventory
 */
router.get('/:cardId', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { cardId } = req.params;

    const userCard = await prisma.userCard.findUnique({
      where: {
        userId_cardId: {
          userId,
          cardId
        }
      },
      include: {
        card: true
      }
    });

    if (!userCard) {
      return res.status(404).json({ error: 'Card not found in your inventory' });
    }

    // Transform to match expected format
    const result = {
      ...userCard.card,
      quantity: userCard.quantity,
      condition: userCard.condition,
      notes: userCard.notes,
      userId: userCard.userId,
      userCardId: userCard.id
    };

    res.json({ card: result });
  } catch (error) {
    console.error('Get inventory card error:', error);
    res.status(500).json({ error: 'Failed to get card from inventory' });
  }
});

export default router;
