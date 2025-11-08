import express from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all active trade offers (marketplace view)
router.get('/marketplace', async (req, res) => {
  try {
    const { rarity, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      status: 'pending',
      // Exclude user's own trades if authenticated
      ...(req.session?.userId && { offererId: { not: req.session.userId } })
    };

    if (rarity) {
      where.requestedRarity = rarity;
    }

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          offerer: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true
            }
          },
          offeredCard: {
            select: {
              cardId: true,
              name: true,
              set: true,
              rarity: true,
              imageUrl: true,
              imageUrlHiRes: true
            }
          },
          targetUser: {
            select: {
              id: true,
              username: true,
              name: true
            }
          },
          responses: {
            where: { status: 'pending' },
            include: {
              responder: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true
                }
              },
              responseCard: {
                select: {
                  cardId: true,
                  name: true,
                  set: true,
                  rarity: true,
                  imageUrl: true
                }
              }
            }
          }
        }
      }),
      prisma.trade.count({ where })
    ]);

    res.json({
      trades,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching marketplace trades:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// Get current user's trade offers
router.get('/my-offers', requireAuth, async (req, res) => {
  try {
    const trades = await prisma.trade.findMany({
      where: { offererId: req.session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        offeredCard: {
          select: {
            cardId: true,
            name: true,
            set: true,
            rarity: true,
            imageUrl: true,
            imageUrlHiRes: true
          }
        },
        targetUser: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        responses: {
          include: {
            responder: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true
              }
            },
            responseCard: {
              select: {
                cardId: true,
                name: true,
                set: true,
                rarity: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    res.json({ trades });
  } catch (error) {
    console.error('Error fetching user trades:', error);
    res.status(500).json({ error: 'Failed to fetch your trades' });
  }
});

// Get trades targeted at current user
router.get('/targeted-at-me', requireAuth, async (req, res) => {
  try {
    const trades = await prisma.trade.findMany({
      where: {
        targetUserId: req.session.userId,
        status: 'pending'
      },
      orderBy: { createdAt: 'desc' },
      include: {
        offerer: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        offeredCard: {
          select: {
            cardId: true,
            name: true,
            set: true,
            rarity: true,
            imageUrl: true,
            imageUrlHiRes: true
          }
        }
      }
    });

    res.json({ trades });
  } catch (error) {
    console.error('Error fetching targeted trades:', error);
    res.status(500).json({ error: 'Failed to fetch targeted trades' });
  }
});

// Get trade responses for current user
router.get('/my-responses', requireAuth, async (req, res) => {
  try {
    const responses = await prisma.tradeResponse.findMany({
      where: { responderId: req.session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        trade: {
          include: {
            offerer: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true
              }
            },
            offeredCard: {
              select: {
                cardId: true,
                name: true,
                set: true,
                rarity: true,
                imageUrl: true
              }
            }
          }
        },
        responseCard: {
          select: {
            cardId: true,
            name: true,
            set: true,
            rarity: true,
            imageUrl: true,
            imageUrlHiRes: true
          }
        }
      }
    });

    res.json({ responses });
  } catch (error) {
    console.error('Error fetching user responses:', error);
    res.status(500).json({ error: 'Failed to fetch your responses' });
  }
});

// Create a new trade offer
router.post('/', requireAuth, async (req, res) => {
  try {
    const { offeredCardId, requestedRarity, targetUserId, message } = req.body;

    // Validate required fields
    if (!offeredCardId || !requestedRarity) {
      return res.status(400).json({ error: 'Offered card and requested rarity are required' });
    }

    // Check if user owns the card
    const userCard = await prisma.userCard.findFirst({
      where: {
        userId: req.session.userId,
        cardId: offeredCardId,
        quantity: { gte: 1 }
      }
    });

    if (!userCard) {
      return res.status(400).json({ error: 'You do not own this card' });
    }

    // Check if card exists
    const card = await prisma.card.findUnique({
      where: { cardId: offeredCardId }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // If targetUserId provided, verify user exists
    if (targetUserId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId }
      });

      if (!targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
      }
    }

    // Create trade offer
    const trade = await prisma.trade.create({
      data: {
        offererId: req.session.userId,
        offeredCardId,
        requestedRarity,
        targetUserId: targetUserId || null,
        message: message || null
      },
      include: {
        offeredCard: {
          select: {
            cardId: true,
            name: true,
            set: true,
            rarity: true,
            imageUrl: true,
            imageUrlHiRes: true
          }
        },
        targetUser: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({ trade });
  } catch (error) {
    console.error('Error creating trade:', error);
    res.status(500).json({ error: 'Failed to create trade offer' });
  }
});

// Respond to a trade offer with a card
router.post('/:tradeId/respond', requireAuth, async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { responseCardId, message } = req.body;

    if (!responseCardId) {
      return res.status(400).json({ error: 'Response card is required' });
    }

    // Get the trade
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        offeredCard: true
      }
    });

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    if (trade.status !== 'pending') {
      return res.status(400).json({ error: 'This trade is no longer available' });
    }

    // Can't respond to your own trade
    if (trade.offererId === req.session.userId) {
      return res.status(400).json({ error: 'You cannot respond to your own trade' });
    }

    // If trade has a target user, only they can respond
    if (trade.targetUserId && trade.targetUserId !== req.session.userId) {
      return res.status(403).json({ error: 'This trade is targeted at another user' });
    }

    // Check if user owns the response card
    const userCard = await prisma.userCard.findFirst({
      where: {
        userId: req.session.userId,
        cardId: responseCardId,
        quantity: { gte: 1 }
      },
      include: {
        card: true
      }
    });

    if (!userCard) {
      return res.status(400).json({ error: 'You do not own this card' });
    }

    // Verify the response card matches the requested rarity
    if (userCard.card.rarity !== trade.requestedRarity) {
      return res.status(400).json({
        error: `Card must be of rarity: ${trade.requestedRarity}`
      });
    }

    // Check if user already responded to this trade
    const existingResponse = await prisma.tradeResponse.findFirst({
      where: {
        tradeId,
        responderId: req.session.userId
      }
    });

    if (existingResponse) {
      return res.status(400).json({ error: 'You have already responded to this trade' });
    }

    // Create trade response
    const response = await prisma.tradeResponse.create({
      data: {
        tradeId,
        responderId: req.session.userId,
        responseCardId,
        message: message || null
      },
      include: {
        responseCard: {
          select: {
            cardId: true,
            name: true,
            set: true,
            rarity: true,
            imageUrl: true,
            imageUrlHiRes: true
          }
        },
        responder: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({ response });
  } catch (error) {
    console.error('Error responding to trade:', error);
    res.status(500).json({ error: 'Failed to respond to trade' });
  }
});

// Accept a trade response (complete the trade)
router.post('/:tradeId/accept/:responseId', requireAuth, async (req, res) => {
  try {
    const { tradeId, responseId } = req.params;

    // Get the trade with the response
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        responses: {
          where: { id: responseId }
        }
      }
    });

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    // Only the trade creator can accept responses
    if (trade.offererId !== req.session.userId) {
      return res.status(403).json({ error: 'Only the trade creator can accept responses' });
    }

    if (trade.status !== 'pending') {
      return res.status(400).json({ error: 'This trade is no longer available' });
    }

    const response = trade.responses[0];
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    if (response.status !== 'pending') {
      return res.status(400).json({ error: 'This response is no longer available' });
    }

    // Execute the trade: swap the cards between users
    await prisma.$transaction(async (tx) => {
      // Remove offered card from offerer's inventory
      const offererCard = await tx.userCard.findFirst({
        where: {
          userId: trade.offererId,
          cardId: trade.offeredCardId
        }
      });

      if (offererCard.quantity > 1) {
        await tx.userCard.update({
          where: { id: offererCard.id },
          data: { quantity: { decrement: 1 } }
        });
      } else {
        await tx.userCard.delete({
          where: { id: offererCard.id }
        });
      }

      // Remove response card from responder's inventory
      const responderCard = await tx.userCard.findFirst({
        where: {
          userId: response.responderId,
          cardId: response.responseCardId
        }
      });

      if (responderCard.quantity > 1) {
        await tx.userCard.update({
          where: { id: responderCard.id },
          data: { quantity: { decrement: 1 } }
        });
      } else {
        await tx.userCard.delete({
          where: { id: responderCard.id }
        });
      }

      // Add offered card to responder's inventory
      const responderHasCard = await tx.userCard.findFirst({
        where: {
          userId: response.responderId,
          cardId: trade.offeredCardId
        }
      });

      if (responderHasCard) {
        await tx.userCard.update({
          where: { id: responderHasCard.id },
          data: { quantity: { increment: 1 } }
        });
      } else {
        await tx.userCard.create({
          data: {
            userId: response.responderId,
            cardId: trade.offeredCardId,
            quantity: 1,
            condition: 'Near Mint'
          }
        });
      }

      // Add response card to offerer's inventory
      const offererHasCard = await tx.userCard.findFirst({
        where: {
          userId: trade.offererId,
          cardId: response.responseCardId
        }
      });

      if (offererHasCard) {
        await tx.userCard.update({
          where: { id: offererHasCard.id },
          data: { quantity: { increment: 1 } }
        });
      } else {
        await tx.userCard.create({
          data: {
            userId: trade.offererId,
            cardId: response.responseCardId,
            quantity: 1,
            condition: 'Near Mint'
          }
        });
      }

      // Update trade status
      await tx.trade.update({
        where: { id: tradeId },
        data: { status: 'accepted' }
      });

      // Update response status
      await tx.tradeResponse.update({
        where: { id: responseId },
        data: { status: 'accepted' }
      });

      // Reject all other pending responses
      await tx.tradeResponse.updateMany({
        where: {
          tradeId,
          id: { not: responseId },
          status: 'pending'
        },
        data: { status: 'rejected' }
      });
    });

    res.json({ message: 'Trade completed successfully' });
  } catch (error) {
    console.error('Error accepting trade:', error);
    res.status(500).json({ error: 'Failed to complete trade' });
  }
});

// Cancel a trade offer
router.delete('/:tradeId', requireAuth, async (req, res) => {
  try {
    const { tradeId } = req.params;

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId }
    });

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    // Only the trade creator can cancel it
    if (trade.offererId !== req.session.userId) {
      return res.status(403).json({ error: 'You can only cancel your own trades' });
    }

    if (trade.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending trades can be cancelled' });
    }

    // Update trade and all pending responses to cancelled
    await prisma.$transaction([
      prisma.trade.update({
        where: { id: tradeId },
        data: { status: 'cancelled' }
      }),
      prisma.tradeResponse.updateMany({
        where: {
          tradeId,
          status: 'pending'
        },
        data: { status: 'rejected' }
      })
    ]);

    res.json({ message: 'Trade cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling trade:', error);
    res.status(500).json({ error: 'Failed to cancel trade' });
  }
});

// Reject a trade response
router.post('/:tradeId/reject/:responseId', requireAuth, async (req, res) => {
  try {
    const { tradeId, responseId } = req.params;

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId }
    });

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    // Only the trade creator can reject responses
    if (trade.offererId !== req.session.userId) {
      return res.status(403).json({ error: 'Only the trade creator can reject responses' });
    }

    const response = await prisma.tradeResponse.findUnique({
      where: { id: responseId }
    });

    if (!response || response.tradeId !== tradeId) {
      return res.status(404).json({ error: 'Response not found' });
    }

    if (response.status !== 'pending') {
      return res.status(400).json({ error: 'This response is no longer pending' });
    }

    await prisma.tradeResponse.update({
      where: { id: responseId },
      data: { status: 'rejected' }
    });

    res.json({ message: 'Response rejected' });
  } catch (error) {
    console.error('Error rejecting response:', error);
    res.status(500).json({ error: 'Failed to reject response' });
  }
});

export default router;
