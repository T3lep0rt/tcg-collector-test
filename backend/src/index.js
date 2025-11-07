import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as pokemonTcgService from './services/pokemonTcgService.js';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Example API routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to TCG Collector API' });
});

// Card Routes

// Get all cards
app.get('/api/cards', async (req, res) => {
  try {
    const cards = await prisma.card.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Get a specific card
app.get('/api/cards/:id', async (req, res) => {
  try {
    const card = await prisma.card.findUnique({
      where: { id: req.params.id }
    });
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch card' });
  }
});

// Create a new card
app.post('/api/cards', async (req, res) => {
  try {
    const { name, set, rarity, condition, quantity, imageUrl, notes, userId } = req.body;
    const card = await prisma.card.create({
      data: {
        name,
        set,
        rarity,
        condition,
        quantity: quantity || 1,
        imageUrl,
        notes,
        userId: userId || null
      }
    });
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Update a card
app.put('/api/cards/:id', async (req, res) => {
  try {
    const { name, set, rarity, condition, quantity, imageUrl, notes } = req.body;
    const card = await prisma.card.update({
      where: { id: req.params.id },
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
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete a card
app.delete('/api/cards/:id', async (req, res) => {
  try {
    await prisma.card.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
