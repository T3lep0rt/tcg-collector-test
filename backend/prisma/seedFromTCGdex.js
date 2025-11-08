import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const API_BASE = 'https://api.tcgdex.net/v2/en';
const SERIES_ID = 'tcgp'; // Pokemon TCG Pocket series

/**
 * Fetches data from TCGdex API
 * @param {string} endpoint - API endpoint (e.g., '/series/tcgp')
 * @param {boolean} silent - If true, don't log the fetch
 * @returns {Promise<any>} JSON response
 */
async function fetchAPI(endpoint, silent = false) {
  const url = `${API_BASE}${endpoint}`;
  if (!silent) {
    console.log(`  Fetching: ${url}`);
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`  Error fetching ${url}:`, error.message);
    return null;
  }
}

/**
 * Maps TCGdex card data to our Prisma schema
 * @param {object} card - Card data from TCGdex
 * @param {string} setId - Set identifier
 * @param {string} setName - Set display name
 * @returns {object} Mapped card data for Prisma
 */
function mapCardData(card, setId, setName) {
  return {
    cardId: card.id, // Unique TCGdex ID
    name: card.name,
    set: setId, // Use for filtering (e.g., 'A1', 'A2')
    setName: setName, // Display name
    number: card.localId || card.id.split('-').pop(), // Card number in set
    rarity: Array.isArray(card.rarity) ? card.rarity.join(', ') : card.rarity || null,
    types: card.types ? JSON.stringify(card.types) : null,
    supertype: card.category || null,
    hp: card.hp?.toString() || null,
    artist: card.illustrator || null,
    attacks: card.attacks ? JSON.stringify(card.attacks) : null,
    weaknesses: card.weaknesses ? JSON.stringify(card.weaknesses) : null,
    resistances: card.resistances ? JSON.stringify(card.resistances) : null,
    retreatCost: card.retreat ? JSON.stringify([card.retreat]) : null,
    imageUrl: card.image || null,
    imageUrlHiRes: card.image ? card.image.replace('/low/', '/high/') : null,
    condition: 'Near Mint',
    quantity: 1
  };
}

/**
 * Seeds cards from a specific set
 * @param {object} setInfo - Set information from TCGdex
 * @returns {Promise<object>} Processing statistics
 */
async function seedSet(setInfo) {
  const { id: setId, name: setName } = setInfo;

  console.log(`\n--- Processing set: ${setName} (${setId}) ---`);

  // Fetch full set data with cards
  const setData = await fetchAPI(`/sets/${setId}`);

  if (!setData || !setData.cards) {
    console.log(`  ⚠️  No cards found for set ${setId}`);
    return { total: 0, added: 0, skipped: 0, errors: 0 };
  }

  const cards = setData.cards;
  console.log(`  Found ${cards.length} cards in set`);

  let added = 0;
  let skipped = 0;
  let errors = 0;
  const progressInterval = 100; // Log progress every 100 cards

  for (let i = 0; i < cards.length; i++) {
    const cardBrief = cards[i];

    try {
      // Fetch full card details (silent mode to reduce logs)
      const card = await fetchAPI(`/cards/${cardBrief.id}`, true);

      if (!card) {
        errors++;
        continue;
      }

      // Check if card already exists
      const existing = await prisma.card.findFirst({
        where: {
          cardId: card.id
        }
      });

      if (existing) {
        skipped++;
      } else {
        // Map and create card
        const cardData = mapCardData(card, setId, setName);

        await prisma.card.create({
          data: cardData
        });

        added++;
      }

      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 100));

      // Progress update every N cards
      if ((i + 1) % progressInterval === 0 || i === cards.length - 1) {
        console.log(`  Progress: ${i + 1}/${cards.length} cards | Added: ${added} | Skipped: ${skipped} | Errors: ${errors}`);
      }

    } catch (error) {
      console.error(`  ❌ Error at card ${i + 1}:`, error.message);
      errors++;
    }
  }

  console.log(`\n✓ Finished ${setName}`);
  console.log(`  Total: ${cards.length} | Added: ${added} | Skipped: ${skipped} | Errors: ${errors}`);

  return {
    total: cards.length,
    added,
    skipped,
    errors
  };
}

/**
 * Main seed function
 */
async function main() {
  console.log('===== Pokemon TCG Pocket Seeder (TCGdex API) =====\n');

  // Fetch Pokemon TCG Pocket series data
  console.log(`Fetching Pokemon TCG Pocket series data...`);
  const seriesData = await fetchAPI(`/series/${SERIES_ID}`);

  if (!seriesData || !seriesData.sets) {
    console.error('❌ Could not fetch series data');
    return;
  }

  const sets = seriesData.sets;
  console.log(`\nFound ${sets.length} sets in Pokemon TCG Pocket series:`);
  sets.forEach((set, index) => {
    console.log(`  ${index + 1}. ${set.name} (${set.id})`);
  });

  // Track overall statistics
  const stats = {
    totalSets: sets.length,
    processedSets: 0,
    totalCards: 0,
    addedCards: 0,
    skippedCards: 0,
    errors: 0
  };

  // Process each set
  for (const set of sets) {
    const result = await seedSet(set);

    stats.processedSets++;
    stats.totalCards += result.total;
    stats.addedCards += result.added;
    stats.skippedCards += result.skipped;
    stats.errors += result.errors;

    // Delay between sets
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SEEDING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Sets Found:            ${stats.totalSets}`);
  console.log(`Sets Processed:        ${stats.processedSets}`);
  console.log(`Total Cards:           ${stats.totalCards}`);
  console.log(`Cards Added:           ${stats.addedCards}`);
  console.log(`Cards Skipped:         ${stats.skippedCards}`);
  console.log(`Errors:                ${stats.errors}`);
  console.log('='.repeat(60));
  console.log('\n✅ Seeding Complete!');
  console.log('\n💡 Cards can be filtered by set using the "set" field');
  console.log('   Example: A1, A2, A3, promo-a, etc.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
