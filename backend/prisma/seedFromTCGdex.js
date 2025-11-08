import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const API_BASE = 'https://api.tcgdex.net/v2/en';
const SERIES_ID = 'tcgp'; // Pokemon TCG Pocket series

/**
 * Fetches data from TCGdex API
 * @param {string} endpoint - API endpoint (e.g., '/series/tcgp')
 * @returns {Promise<any>} JSON response
 */
async function fetchAPI(endpoint) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`  Fetching: ${url}`);

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
    rarity: card.rarity?.join(', ') || card.rarity || null,
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

  for (const cardBrief of cards) {
    try {
      // Fetch full card details
      const card = await fetchAPI(`/cards/${cardBrief.id}`);

      if (!card) {
        console.log(`  ⚠️  Could not fetch details for ${cardBrief.id}`);
        errors++;
        continue;
      }

      console.log(`  Processing: ${card.name} (${card.localId || card.id})`);

      // Check if card already exists
      const existing = await prisma.card.findFirst({
        where: {
          cardId: card.id
        }
      });

      if (existing) {
        console.log(`    ○ Already exists`);
        skipped++;
        continue;
      }

      // Map and create card
      const cardData = mapCardData(card, setId, setName);

      await prisma.card.create({
        data: cardData
      });

      console.log(`    ✓ Added to database`);
      added++;

      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`  ❌ Error processing card:`, error.message);
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
