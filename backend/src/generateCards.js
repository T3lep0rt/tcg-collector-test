import prisma from './db.js';

/**
 * Pokemon TCG API Base URL
 * API Documentation: https://docs.pokemontcg.io/
 */
const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2';

/**
 * Fetch Pokemon cards from the Pokemon TCG API
 * @param {Object} options - Query options
 * @param {string} options.query - Search query (e.g., "name:Charizard")
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.pageSize - Cards per page (default: 10, max: 250)
 * @param {string} options.orderBy - Sort order (e.g., "name", "-set.releaseDate")
 * @returns {Promise<Array>} Array of card objects
 */
async function fetchCardsFromAPI(options = {}) {
  const {
    query = '',
    page = 1,
    pageSize = 50,
    orderBy = 'name'
  } = options;

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      orderBy
    });

    if (query) {
      params.append('q', query);
    }

    const url = `${POKEMON_TCG_API}/cards?${params.toString()}`;
    console.log(`Fetching cards from: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.data.length} cards (Page ${page} of ${Math.ceil(data.totalCount / pageSize)})`);

    return data.data;
  } catch (error) {
    console.error('Error fetching cards from API:', error);
    throw error;
  }
}

/**
 * Transform Pokemon TCG API card data to our database schema
 * @param {Object} apiCard - Card object from Pokemon TCG API
 * @returns {Object} Transformed card object for database
 */
function transformCardData(apiCard) {
  return {
    cardId: apiCard.id,
    name: apiCard.name,
    set: apiCard.set.id,
    setName: apiCard.set.name,
    number: apiCard.number,
    rarity: apiCard.rarity || null,
    types: apiCard.types ? JSON.stringify(apiCard.types) : null,
    supertype: apiCard.supertype || null,
    subtypes: apiCard.subtypes ? JSON.stringify(apiCard.subtypes) : null,
    hp: apiCard.hp || null,
    artist: apiCard.artist || null,
    flavorText: apiCard.flavorText || null,
    attacks: apiCard.attacks ? JSON.stringify(apiCard.attacks) : null,
    weaknesses: apiCard.weaknesses ? JSON.stringify(apiCard.weaknesses) : null,
    resistances: apiCard.resistances ? JSON.stringify(apiCard.resistances) : null,
    retreatCost: apiCard.retreatCost ? JSON.stringify(apiCard.retreatCost) : null,
    prices: apiCard.tcgplayer?.prices ? JSON.stringify(apiCard.tcgplayer.prices) : null,
    imageUrl: apiCard.images?.small || null,
    imageUrlHiRes: apiCard.images?.large || null,
    quantity: 0, // Default quantity for seed data
    userId: null // No user association for seed data
  };
}

/**
 * Generate and store Pokemon cards in the database
 * @param {Object} options - Generation options
 * @param {string} options.query - Search query for specific cards
 * @param {number} options.count - Number of cards to generate (default: 50)
 * @param {boolean} options.skipDuplicates - Skip cards that already exist (default: true)
 * @returns {Promise<Object>} Statistics about the generation
 */
export async function generateCards(options = {}) {
  const {
    query = '',
    count = 50,
    skipDuplicates = true
  } = options;

  console.log('\n🎴 Starting Pokemon card generation...');
  console.log(`Options:`, { query, count, skipDuplicates });

  const stats = {
    fetched: 0,
    created: 0,
    skipped: 0,
    errors: 0
  };

  try {
    // Calculate pages needed
    const pageSize = Math.min(count, 250); // API max is 250
    const pages = Math.ceil(count / pageSize);

    for (let page = 1; page <= pages; page++) {
      const remainingCards = count - stats.fetched;
      const currentPageSize = Math.min(remainingCards, pageSize);

      // Fetch cards from API
      const apiCards = await fetchCardsFromAPI({
        query,
        page,
        pageSize: currentPageSize,
        orderBy: 'name'
      });

      stats.fetched += apiCards.length;

      // Process each card
      for (const apiCard of apiCards) {
        try {
          const cardData = transformCardData(apiCard);

          if (skipDuplicates) {
            // Check if card already exists
            const existing = await prisma.card.findUnique({
              where: { cardId: cardData.cardId }
            });

            if (existing) {
              console.log(`⏭️  Skipping duplicate: ${cardData.name} (${cardData.cardId})`);
              stats.skipped++;
              continue;
            }
          }

          // Create card in database
          await prisma.card.create({
            data: cardData
          });

          console.log(`✅ Created: ${cardData.name} - ${cardData.setName} (${cardData.number})`);
          stats.created++;

        } catch (error) {
          console.error(`❌ Error processing card ${apiCard.id}:`, error.message);
          stats.errors++;
        }
      }

      // Check if we have enough cards
      if (stats.fetched >= count) {
        break;
      }

      // Rate limiting - wait 100ms between pages
      if (page < pages) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n📊 Generation Summary:');
    console.log(`   Fetched: ${stats.fetched}`);
    console.log(`   Created: ${stats.created}`);
    console.log(`   Skipped: ${stats.skipped}`);
    console.log(`   Errors: ${stats.errors}`);
    console.log('✨ Card generation completed!\n');

    return stats;

  } catch (error) {
    console.error('\n💥 Fatal error during card generation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Example usage and CLI interface
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const options = {
    query: '',
    count: 50,
    skipDuplicates: true
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--query':
      case '-q':
        options.query = args[++i];
        break;
      case '--count':
      case '-c':
        options.count = parseInt(args[++i], 10);
        break;
      case '--no-skip':
        options.skipDuplicates = false;
        break;
      case '--help':
      case '-h':
        console.log(`
Pokemon Card Generator

Usage: node generateCards.js [options]

Options:
  -q, --query <query>     Search query (e.g., "name:Charizard", "set.name:Base")
  -c, --count <number>    Number of cards to generate (default: 50)
  --no-skip               Don't skip duplicate cards
  -h, --help              Show this help message

Examples:
  # Generate 50 random cards
  node generateCards.js

  # Generate 100 Charizard cards
  node generateCards.js --query "name:Charizard" --count 100

  # Generate 20 cards from Base Set
  node generateCards.js --query "set.name:Base" --count 20

  # Generate cards of specific type
  node generateCards.js --query "types:fire" --count 50
`);
        process.exit(0);
    }
  }

  generateCards(options)
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}
