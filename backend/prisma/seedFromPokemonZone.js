import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetches all card links from an expansion page
 * @param {string} url - The expansion page URL (e.g., https://www.pokemon-zone.com/sets/a1/)
 * @returns {Promise<string[]>} Array of card URLs
 */
async function fetchCardLinks(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`Error fetching URL: ${url}`);
      return [];
    }

    const html = await response.text();

    // Extract all card links matching /cards/ pattern
    const linkRegex = /href="(\/cards\/[^"]+)"/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      // Make sure it's a full URL
      const fullUrl = href.startsWith('http') ? href : `https://www.pokemon-zone.com${href}`;
      links.push(fullUrl);
    }

    // Return unique links
    return [...new Set(links)];
  } catch (error) {
    console.error(`Error fetching card links from ${url}:`, error.message);
    return [];
  }
}

/**
 * Extracts text content from an HTML tag
 * @param {string} html - HTML content
 * @param {RegExp} regex - Regular expression to match the tag
 * @returns {string|null} Extracted text or null
 */
function extractText(html, regex) {
  const match = html.match(regex);
  return match ? match[1].replace(/<[^>]*>/g, '').trim() : null;
}

/**
 * Extracts rarity from rarity icon classes
 * @param {string} html - HTML content
 * @returns {number} Rarity number (0-7)
 */
function extractRarity(html) {
  // Find all rarity-icon spans
  const rarityRegex = /<span[^>]*class="([^"]*rarity-icon[^"]*)"/g;
  let countFound = 0;
  let symbol = '';

  let match;
  while ((match = rarityRegex.exec(html)) !== null) {
    const classes = match[1].split(' ');
    if (classes[0] === 'rarity-icon') {
      symbol = classes[1] || '';
      countFound++;
    }
  }

  if (!symbol) return 0;

  let rarityMultiplier = 0;
  switch (symbol.toLowerCase()) {
    case 'icon-diamond':
      rarityMultiplier = 0;
      break;
    case 'icon-star':
      rarityMultiplier = 4;
      break;
    case 'icon-crown':
      rarityMultiplier = 7;
      break;
  }

  return rarityMultiplier + countFound;
}

/**
 * Generates cards for a specific expansion
 * @param {string} url - The expansion page URL
 * @param {string} expansionName - Name of the expansion (e.g., "Genetic Apex")
 */
async function generateCardsForExpansion(url, expansionName) {
  console.log(`\n--- Processing expansion: ${expansionName} ---`);
  console.log(`Fetching card links from: ${url}`);

  const urls = await fetchCardLinks(url);
  console.log(`Found ${urls.length} card links`);

  const results = [];

  for (let i = 0; i < urls.length; i++) {
    const cardUrl = urls[i];
    console.log(`\nProcessing card ${i + 1}/${urls.length}: ${cardUrl}`);

    try {
      const response = await fetch(cardUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        console.error(`Could not fetch URL: ${cardUrl}`);
        results.push({ error: 'Could not fetch URL: ' + cardUrl });
        continue;
      }

      const html = await response.text();

      // Extract Pokemon name from h1 with class "fs-1 text-break"
      const nameMatch = html.match(/<h1[^>]*class="[^"]*fs-1[^"]*text-break[^"]*"[^>]*>([^<]+)<\/h1>/);
      const pokemonName = nameMatch ? nameMatch[1].trim() : 'Unknown';

      // Extract rarity
      const rarity = extractRarity(html);

      // Extract card metadata from div.card-collection-summary__meta
      const metaRegex = /<div[^>]*class="[^"]*card-collection-summary__meta[^"]*"[^>]*>([\s\S]*?)<\/div>/;
      const metaMatch = html.match(metaRegex);

      let number = null;
      let booster = null;

      if (metaMatch) {
        const metaContent = metaMatch[1];

        // Extract spans within the meta div
        const spanRegex = /<span[^>]*>([^<]+)<\/span>/g;
        const spans = [];
        let spanMatch;

        while ((spanMatch = spanRegex.exec(metaContent)) !== null) {
          spans.push(spanMatch[1].trim());
        }

        if (spans.length > 0) {
          number = spans[0]; // First span is the card number
        }

        if (spans.length > 2) {
          booster = spans[2].replace(/\s+/g, ''); // Third span is the booster pack
        }
      }

      // Extract image URL (look for .webp images)
      const imgRegex = /<img[^>]+src="([^"]*\.webp[^"]*)"/;
      const imgMatch = html.match(imgRegex);
      let imageUrl = imgMatch ? imgMatch[1] : '';

      // Make sure image URL is absolute
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https://www.pokemon-zone.com${imageUrl}`;
      }

      const cardData = {
        name: pokemonName,
        number: number,
        booster: booster,
        imageUrl: imageUrl,
        rarity: rarity,
        expansion: expansionName
      };

      console.log(`  Name: ${pokemonName}`);
      console.log(`  Number: ${number}`);
      console.log(`  Rarity: ${rarity}`);
      console.log(`  Booster: ${booster || 'N/A'}`);

      // Check if card already exists
      const existingCard = await prisma.card.findFirst({
        where: {
          name: cardData.name,
          number: cardData.number,
          set: cardData.expansion
        }
      });

      if (!existingCard) {
        // Insert the card into the database
        const newCard = await prisma.card.create({
          data: {
            name: cardData.name,
            set: cardData.expansion,
            setName: cardData.expansion,
            number: cardData.number,
            rarity: cardData.rarity.toString(),
            imageUrl: cardData.imageUrl,
            notes: cardData.booster ? `Booster: ${cardData.booster}` : null,
            condition: 'Near Mint',
            quantity: 1
          }
        });

        console.log(`  ✓ Created card: ${newCard.name} (${newCard.number})`);
        results.push(cardData);
      } else {
        console.log(`  ○ Card already exists: ${cardData.name} (${cardData.number})`);
        results.push({ ...cardData, skipped: true });
      }

      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`  Error processing card: ${error.message}`);
      results.push({ error: 'Error processing URL: ' + cardUrl, message: error.message });
    }
  }

  console.log(`\n✓ Finished processing ${expansionName}`);
  console.log(`  Total cards processed: ${results.length}`);
  console.log(`  New cards added: ${results.filter(r => !r.error && !r.skipped).length}`);
  console.log(`  Skipped (already exist): ${results.filter(r => r.skipped).length}`);
  console.log(`  Errors: ${results.filter(r => r.error).length}`);

  return results;
}

/**
 * Main seed function
 */
async function main() {
  console.log('===== Starting Pokemon Zone Card Seeder =====\n');

  // Optional: Clear existing cards (uncomment if you want to start fresh)
  // console.log('Clearing existing cards...');
  // await prisma.card.deleteMany({});
  // console.log('Existing cards cleared\n');

  // Generate cards for each expansion
  await generateCardsForExpansion('https://www.pokemon-zone.com/sets/a1/', 'Genetic Apex');
  await generateCardsForExpansion('https://www.pokemon-zone.com/sets/promo-a/', 'Promo A');
  await generateCardsForExpansion('https://www.pokemon-zone.com/sets/a1a/', 'Mythical Island');

  console.log('\n===== Seeding Complete =====');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
