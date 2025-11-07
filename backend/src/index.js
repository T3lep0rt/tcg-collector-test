import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as pokemonTcgService from './services/pokemonTcgService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Pokemon TCG API Routes

/**
 * GET /api/pokemon-tcg/cards
 * Fetch all Pokemon TCG cards with optional filters
 * Query params:
 *   - page: Page number (default: 1)
 *   - pageSize: Number of cards per page (default: 250, max: 250)
 *   - q: Search query (e.g., 'name:charizard', 'set.id:base1')
 *   - orderBy: Sort field (e.g., 'name', '-releaseDate')
 */
app.get('/api/pokemon-tcg/cards', async (req, res) => {
  try {
    const { page, pageSize, q, orderBy } = req.query;
    const options = {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 250,
      q: q || '',
      orderBy: orderBy || 'name',
    };

    const result = await pokemonTcgService.fetchAllCards(options);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Pokemon TCG cards',
      details: error.message
    });
  }
});

/**
 * GET /api/pokemon-tcg/cards/:id
 * Fetch a single Pokemon TCG card by ID
 */
app.get('/api/pokemon-tcg/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pokemonTcgService.fetchCardById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Pokemon TCG card',
      details: error.message
    });
  }
});

/**
 * GET /api/pokemon-tcg/sets
 * Fetch all Pokemon TCG sets
 */
app.get('/api/pokemon-tcg/sets', async (req, res) => {
  try {
    const result = await pokemonTcgService.fetchAllSets();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Pokemon TCG sets',
      details: error.message
    });
  }
});

/**
 * GET /api/pokemon-tcg/cards/search/:name
 * Search Pokemon TCG cards by name
 */
app.get('/api/pokemon-tcg/cards/search/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { page, pageSize } = req.query;

    const result = await pokemonTcgService.searchCardsByName(
      name,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 50
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search Pokemon TCG cards',
      details: error.message
    });
  }
});

/**
 * GET /api/pokemon-tcg/sets/:setId/cards
 * Fetch all cards from a specific set
 */
app.get('/api/pokemon-tcg/sets/:setId/cards', async (req, res) => {
  try {
    const { setId } = req.params;
    const { page, pageSize } = req.query;

    const result = await pokemonTcgService.fetchCardsBySet(
      setId,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 250
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cards from set',
      details: error.message
    });
  }
});

/**
 * GET /api/pokemon-tcg/cards/rarity/:rarity
 * Fetch Pokemon TCG cards by rarity
 */
app.get('/api/pokemon-tcg/cards/rarity/:rarity', async (req, res) => {
  try {
    const { rarity } = req.params;
    const { page, pageSize } = req.query;

    const result = await pokemonTcgService.fetchCardsByRarity(
      rarity,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 250
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cards by rarity',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
